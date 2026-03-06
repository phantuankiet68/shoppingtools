import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function toInt(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function slugify(input: string) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function cleanText(v: unknown, max = 2048) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Server error";
}

function isUnauthorizedError(error: unknown) {
  return error instanceof Error && error.message.toLowerCase().includes("unauthorized");
}

function isPrismaP2002(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/**
 * GET /api/admin/brands?q=&sort=newest|oldest|nameasc|namedesc&page=1&pageSize=50&siteId=
 */
export async function GET(req: Request) {
  try {
    await requireAdminAuthUser();

    const url = new URL(req.url);

    const q = (url.searchParams.get("q") ?? "").trim();
    const sort = (url.searchParams.get("sort") ?? "newest").toLowerCase();

    const siteIdRaw = url.searchParams.get("siteId");
    const siteId = siteIdRaw == null || siteIdRaw === "" || siteIdRaw === "null" ? undefined : String(siteIdRaw);

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1000000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 200);
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductBrandWhereInput = {};

    if (siteId !== undefined) {
      where.siteId = siteId;
    }

    if (q) {
      where.OR = [{ name: { contains: q } }, { slug: { contains: q } }, { description: { contains: q } }];
    }

    const orderBy: Prisma.ProductBrandOrderByWithRelationInput =
      sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "nameasc"
          ? { name: "asc" }
          : sort === "namedesc"
            ? { name: "desc" }
            : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.productBrand.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          siteId: true,
          name: true,
          slug: true,
          description: true,
          logoUrl: true,
          createdAt: true,
          updatedAt: true,
          site: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
        },
      }),
      prisma.productBrand.count({ where }),
    ]);

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: unknown) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

/**
 * POST /api/admin/brands
 * body: { name, slug?, siteId, description?, logoUrl? }
 */
export async function POST(req: Request) {
  try {
    await requireAdminAuthUser();

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const payload = body as {
      name?: unknown;
      slug?: unknown;
      siteId?: unknown;
      description?: unknown;
      logoUrl?: unknown;
    };

    const name = String(payload.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const rawSlug = String(payload.slug ?? "").trim();
    const slug = slugify(rawSlug || name);
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const siteId = String(payload.siteId ?? "").trim();
    if (!siteId) {
      return NextResponse.json({ error: "Site is required" }, { status: 400 });
    }

    const description = cleanText(payload.description, 5000);
    const logoUrl = cleanText(payload.logoUrl, 2048);

    const created = await prisma.productBrand.create({
      data: {
        siteId,
        name,
        slug,
        description,
        logoUrl,
      },
      select: {
        id: true,
        siteId: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
        site: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/brands] ERROR:", error);

    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isPrismaP2002(error)) {
      const target = error.meta?.target;

      if (Array.isArray(target) && target.includes("name")) {
        return NextResponse.json({ error: "Brand name already exists in this site" }, { status: 409 });
      }

      if (Array.isArray(target) && target.includes("slug")) {
        return NextResponse.json({ error: "Brand slug already exists in this site" }, { status: 409 });
      }

      return NextResponse.json({ error: "Brand already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

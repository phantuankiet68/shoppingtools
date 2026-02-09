import { NextResponse } from "next/server";
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

/**
 * GET /api/admin/brands?q=&active=all|true|false&sort=newest|oldest|nameasc|namedesc&page=1&pageSize=50&siteId=
 */
export async function GET(req: Request) {
  try {
    // vẫn giữ auth để bảo vệ admin API
    await requireAdminAuthUser();

    const url = new URL(req.url);

    const q = (url.searchParams.get("q") ?? "").trim();
    const active = (url.searchParams.get("active") ?? "all").toLowerCase();
    const sort = (url.searchParams.get("sort") ?? "newest").toLowerCase();

    const siteIdRaw = url.searchParams.get("siteId");
    const siteId = siteIdRaw == null || siteIdRaw === "" || siteIdRaw === "null" ? undefined : String(siteIdRaw);

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1000000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 200);
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    if (siteId !== undefined) where.siteId = siteId;

    if (q) {
      where.OR = [{ name: { contains: q } }, { slug: { contains: q } }];
    }

    const orderBy =
      sort === "oldest"
        ? ({ createdAt: "asc" } as const)
        : sort === "nameasc"
          ? ({ name: "asc" } as const)
          : sort === "namedesc"
            ? ({ name: "desc" } as const)
            : ({ createdAt: "desc" } as const);

    const [items, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          siteId: true,
          name: true,
          slug: true,
          image: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.brand.count({ where }),
    ]);

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e: any) {
    // requireAdminAuthUser() fail -> Unauthorized
    if (e?.message?.toLowerCase?.().includes("unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/brands
 * body: { name, slug?, siteId?, image?, isActive? }
 */
export async function POST(req: Request) {
  try {
    await requireAdminAuthUser();

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const rawSlug = String(body.slug ?? "").trim();
    const slug = slugify(rawSlug || name);
    if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

    const siteIdRaw = body.siteId;
    const siteId = siteIdRaw == null || siteIdRaw === "" || siteIdRaw === "null" ? null : String(siteIdRaw);

    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
    const image = cleanText(body.image, 2048);

    // Nếu bạn có @@unique([siteId, slug]) thì prisma sẽ tự chặn trùng
    const created = await prisma.brand.create({
      data: {
        siteId,
        name,
        slug,
        image,
        isActive,
      },
      select: {
        id: true,
        siteId: true,
        name: true,
        slug: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/admin/brands] ERROR:", e);

    if (e?.message?.toLowerCase?.().includes("unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prisma unique constraint
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

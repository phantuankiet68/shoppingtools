import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import type { Prisma } from "@prisma/client";

/* ----------------------------- helpers ----------------------------- */

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

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
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getSiteId(req: Request): Promise<string> {
  const url = new URL(req.url);
  const fromQuery = String(url.searchParams.get("siteId") ?? "").trim();
  if (fromQuery) return fromQuery;

  const cookieStore = await cookies();
  return String(cookieStore.get("siteId")?.value ?? "").trim();
}

function orderByFromSort(sort: string) {
  const s = sort.toLowerCase();
  if (s === "nameasc" || s === "name_asc") return { name: "asc" } as const;
  if (s === "namedesc" || s === "name_desc") return { name: "desc" } as const;
  if (s === "newest") return { createdAt: "desc" } as const;
  if (s === "oldest") return { createdAt: "asc" } as const;
  return { sortOrder: "asc" } as const; // default: sort asc
}

async function ensureParentInSite(siteId: string, parentId: string) {
  const p = await prisma.productCategory.findFirst({
    where: { id: parentId, siteId },
    select: { id: true },
  });
  return !!p;
}

async function nextSortOrderForParent(siteId: string, parentId: string | null) {
  const max = await prisma.productCategory.aggregate({
    where: { siteId, parentId },
    _max: { sortOrder: true },
  });
  return (max._max.sortOrder ?? 0) + 10;
}

/* ----------------------------- GET ----------------------------- */
/**
 * GET /api/admin/product-categories
 * Query:
 * - siteId=... (optional if cookie has)
 * - q=...
 * - parentId=... | null
 * - sort=sortasc|nameasc|namedesc|newest|oldest|countdesc
 * - tree=1 (return many items, ignore pagination)
 * - lite=1 (return {id,name,count} only)
 * - page=1
 * - pageSize=200
 */
export async function GET(req: Request) {
  try {
    await requireAdminAuthUser();

    const url = new URL(req.url);

    const siteId = await getSiteId(req);
    if (!siteId) return jsonError("siteId is required", 400);

    const q = String(url.searchParams.get("q") ?? "").trim();
    const sort = String(url.searchParams.get("sort") ?? "sortasc")
      .trim()
      .toLowerCase();

    const tree = url.searchParams.get("tree") === "1";
    const lite = url.searchParams.get("lite") === "1";

    const parentIdRaw = url.searchParams.get("parentId");
    const parentId =
      parentIdRaw == null || parentIdRaw === "" || parentIdRaw === "null" ? undefined : String(parentIdRaw);

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 200), 1, 500);

    const where: Prisma.ProductCategoryWhereInput = { siteId };

    if (q) {
      where.OR = [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }];
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const orderBy = orderByFromSort(sort);

    const skip = tree ? 0 : (page - 1) * pageSize;
    const take = tree ? 5000 : pageSize;

    const [rawItems, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          siteId: true,
          parentId: true,
          name: true,
          slug: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { products: true } },
        },
      }),
      prisma.productCategory.count({ where }),
    ]);

    let items = rawItems.map((x) => ({
      id: x.id,
      siteId: x.siteId,
      parentId: x.parentId,
      name: x.name,
      slug: x.slug,
      sortOrder: x.sortOrder,
      createdAt: x.createdAt,
      updatedAt: x.updatedAt,
      count: x._count.products,
    }));

    if (sort === "countdesc") {
      items = items.slice().sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }

    if (lite) {
      return NextResponse.json({
        items: items.map((x) => ({ id: x.id, name: x.name, count: x.count })),
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        siteId,
      });
    }

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      siteId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);
    return jsonError(msg || "Server error", 500);
  }
}

/* ----------------------------- POST ----------------------------- */
/**
 * POST /api/admin/product-categories
 * body: { siteId?, name, slug?, parentId?, sortOrder? }
 */
export async function POST(req: Request) {
  try {
    await requireAdminAuthUser();

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return jsonError("Content-Type must be application/json", 415);

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid JSON body", 400);

    const b = body as Record<string, unknown>;

    const siteId = String(b.siteId ?? "").trim() || (await getSiteId(req));
    if (!siteId) return jsonError("siteId is required", 400);

    const name = String(b.name ?? "").trim();
    if (!name) return jsonError("Category name is required", 400);

    const slug = slugify(String(b.slug ?? "").trim() || name);
    if (!slug) return jsonError("Slug is required", 400);

    const parentIdRaw = b.parentId;
    const parentId = parentIdRaw == null || parentIdRaw === "" || parentIdRaw === "null" ? null : String(parentIdRaw);

    if (parentId) {
      const ok = await ensureParentInSite(siteId, parentId);
      if (!ok) return jsonError("Parent not found in this site", 400);
    }

    const sortOrder = Number.isFinite(Number(b.sortOrder))
      ? Math.trunc(Number(b.sortOrder))
      : await nextSortOrderForParent(siteId, parentId);

    const created = await prisma.productCategory.create({
      data: {
        siteId,
        name,
        slug,
        parentId,
        sortOrder,
      },
      select: {
        id: true,
        siteId: true,
        parentId: true,
        name: true,
        slug: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json(
      {
        item: {
          id: created.id,
          siteId: created.siteId,
          parentId: created.parentId,
          name: created.name,
          slug: created.slug,
          sortOrder: created.sortOrder,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          count: created._count.products,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const e = error as Error & { code?: string; meta?: { target?: string | string[] } };
    const msg = String(e?.message ?? "");

    if (msg.toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);

    if (e?.code === "P2002") {
      const target = e?.meta?.target;
      const t = Array.isArray(target) ? target.join(",") : String(target ?? "");
      if (t.includes("slug")) return jsonError("Slug already exists in this site", 409);
      return jsonError("Category already exists", 409);
    }

    return jsonError(msg || "Server error", 500);
  }
}

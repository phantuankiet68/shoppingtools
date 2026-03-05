import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import type { Prisma, ProductStatus } from "@prisma/client";

/* ----------------------------- utils ----------------------------- */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toInt(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
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

/**
 * Map UI filter `active` -> Product.status
 * ⚠️ Bạn cần chỉnh mapping theo enum ProductStatus thực tế.
 */
function whereFromActive(active: string): Prisma.ProductWhereInput | null {
  const a = active.toLowerCase();
  if (a === "all") return null;

  // Ví dụ enum có ACTIVE / INACTIVE:
  if (a === "active") return { status: "ACTIVE" as ProductStatus };
  if (a === "inactive") return { status: "INACTIVE" as ProductStatus };

  return null;
}

function orderByFromSort(sort: string): Prisma.ProductOrderByWithRelationInput {
  const s = sort.toLowerCase();

  if (s === "oldest") return { createdAt: "asc" };
  if (s === "name_asc" || s === "nameasc") return { name: "asc" };
  if (s === "name_desc" || s === "namedesc") return { name: "desc" };

  return { createdAt: "desc" }; // newest
}

async function makeUniqueSlug(siteId: string, base: string) {
  let slug = base;
  let i = 2;

  while (true) {
    const exists = await prisma.product.findFirst({
      where: { siteId, slug },
      select: { id: true },
    });
    if (!exists) return slug;
    slug = `${base}-${i++}`;
  }
}

type IncomingImage = {
  url?: unknown;
  sort?: unknown;
  // isCover?: unknown; // schema không có isCover -> ignore
};

function normalizeImages(input: unknown): Prisma.ProductImageCreateManyProductInput[] {
  if (!Array.isArray(input)) return [];

  const rows: Prisma.ProductImageCreateManyProductInput[] = [];

  input.forEach((it, idx) => {
    const row = (it ?? {}) as IncomingImage;

    const imageUrl = String(row.url ?? "").trim();
    if (!imageUrl) return;

    const sortNum = Number(row.sort);
    const sortOrder = Number.isFinite(sortNum) ? Math.trunc(sortNum) : idx;

    rows.push({ imageUrl, sortOrder });
  });

  return rows;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/* ----------------------------- handlers ----------------------------- */

/**
 * GET /api/admin/products
 * Query:
 * - active=all|active|inactive
 * - sort=newest|oldest|name_asc|name_desc
 * - page=1
 * - pageSize=50
 * - siteId=... (optional, can be read from cookie)
 */
export async function GET(req: Request) {
  try {
    await requireAdminAuthUser();

    const siteId = await getSiteId(req);
    if (!siteId) return jsonError("siteId is required", 400);

    const url = new URL(req.url);
    const active = (url.searchParams.get("active") ?? "all").toLowerCase();
    const sort = (url.searchParams.get("sort") ?? "newest").toLowerCase();

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 200);
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = { siteId };
    const activeWhere = whereFromActive(active);
    if (activeWhere) Object.assign(where, activeWhere);

    const orderBy = orderByFromSort(sort);

    const [total, rawItems] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
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
          status: true,
          createdAt: true,
          updatedAt: true,
          images: {
            // cover không có => chọn ảnh sortOrder nhỏ nhất
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 1,
            select: { id: true, imageUrl: true, sortOrder: true },
          },
          // Nếu muốn category theo mapping:
          // categoryMap: {
          //   take: 1,
          //   select: { category: { select: { id: true, name: true } } },
          // },
        },
      }),
    ]);

    // Map response để frontend cũ dùng images.url/images.sort
    const items = rawItems.map((p) => ({
      ...p,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        sort: img.sortOrder,
      })),
      // category: p.categoryMap?.[0]?.category ?? null,
      // categoryId: p.categoryMap?.[0]?.category?.id ?? null,
    }));

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}

/**
 * POST /api/admin/products
 * Body:
 * - name: string (required)
 * - slug?: string
 * - description?: string
 * - status?: ProductStatus (default DRAFT)
 * - images?: [{ url, sort }]
 */
export async function POST(req: Request) {
  try {
    await requireAdminAuthUser();

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return jsonError("Content-Type must be application/json", 415);

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid JSON body", 400);

    const siteId = await getSiteId(req);
    if (!siteId) return jsonError("siteId is required", 400);

    const b = body as Record<string, unknown>;

    const name = String(b.name ?? "").trim();
    if (!name) return jsonError("Name is required", 400);

    const baseSlug = slugify(String(b.slug ?? "").trim() || name);
    if (!baseSlug) return jsonError("Slug is required", 400);

    const slug = await makeUniqueSlug(siteId, baseSlug);
    const description = String(b.description ?? "").trim() || null;

    const status = (String(b.status ?? "").trim() || "DRAFT") as ProductStatus;

    const imagesData = normalizeImages(b.images);

    const created = await prisma.product.create({
      data: {
        siteId,
        name,
        slug,
        description,
        status,
        ...(imagesData.length
          ? {
              images: {
                createMany: { data: imagesData },
              },
            }
          : {}),
      },
      select: {
        id: true,
        siteId: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          take: 1,
          select: { id: true, imageUrl: true, sortOrder: true },
        },
      },
    });

    const item = {
      ...created,
      images: created.images.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        sort: img.sortOrder,
      })),
    };

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: unknown) {
    const e = error as Error & { code?: string };
    const msg = String(e?.message ?? "");

    if (msg.toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);
    if (e?.code === "P2002") return jsonError("Unique constraint failed", 409);

    return jsonError(msg || "Server error", 500);
  }
}

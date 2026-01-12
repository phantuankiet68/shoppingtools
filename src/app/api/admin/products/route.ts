import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function normSku(s: unknown) {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}
function normBarcode(s: unknown) {
  const v = String(s ?? "").trim();
  return v.length ? v : null;
}
function normName(s: unknown) {
  return String(s ?? "").trim();
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
function normSlug(s: unknown, fallbackName?: string) {
  const raw = String(s ?? "").trim();
  const base = raw.length ? raw : String(fallbackName ?? "");
  const slug = slugify(base);
  return slug.length ? slug : "";
}
function centsFrom(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}
function stockFrom(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

async function makeUniqueSlug(userId: string, base: string) {
  let slug = base;
  let i = 2;
  while (true) {
    const exists = await prisma.product.findFirst({ where: { userId, slug }, select: { id: true } });
    if (!exists) return slug;
    slug = `${base}-${i++}`;
  }
}

/**
 * GET /api/admin/products?active=all|active|inactive&sort=newest|oldest|name_asc|name_desc&page=1&pageSize=50
 */
export async function GET(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const userId = user.id;

    const { searchParams } = new URL(req.url);

    const active = (searchParams.get("active") ?? "active").toLowerCase();
    const sort = (searchParams.get("sort") ?? "newest").toLowerCase();

    const page = Math.max(1, Math.trunc(Number(searchParams.get("page") ?? "1") || 1));
    const pageSizeRaw = Math.trunc(Number(searchParams.get("pageSize") ?? "50") || 50);
    const pageSize = Math.min(200, Math.max(1, pageSizeRaw));
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (active === "active") where.isActive = true;
    else if (active === "inactive") where.isActive = false;
    // active=all => không filter

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "name_asc") orderBy = { name: "asc" };
    if (sort === "name_desc") orderBy = { name: "desc" };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          barcode: true,
          priceCents: true,
          costCents: true,
          stock: true,
          isActive: true,
          categoryId: true,
          category: { select: { id: true, name: true } },
          createdAt: true,
          updatedAt: true,
          images: {
            orderBy: [{ isCover: "desc" }, { sort: "asc" }, { createdAt: "asc" }],
            take: 1,
            select: { id: true, url: true, isCover: true, sort: true },
          },
        },
      }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/**
 * POST /api/admin/products
 * body: { name, slug?, description?, sku, barcode?, priceCents, costCents, stock, isActive?, categoryId?, images?: [{url,isCover,sort}] }
 */
export async function POST(req: Request) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const body = await req.json().catch(() => ({}));

    const name = normName(body.name);
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const sku = normSku(body.sku);
    if (!sku) return NextResponse.json({ error: "SKU is required" }, { status: 400 });

    const barcode = normBarcode(body.barcode);

    const baseSlug = normSlug(body.slug, name);
    if (!baseSlug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

    const slug = await makeUniqueSlug(userId, baseSlug);

    const description = String(body.description ?? "").trim() || null;

    const priceCents = centsFrom(body.priceCents);
    const costCents = centsFrom(body.costCents);
    const stock = stockFrom(body.stock);

    const categoryId = body.categoryId ? String(body.categoryId) : null;
    const isActive = body.isActive !== undefined ? !!body.isActive : true;

    const imagesArr = Array.isArray(body.images) ? body.images : null;

    const created = await prisma.product.create({
      data: {
        userId,
        name,
        slug,
        description,
        sku,
        barcode,
        priceCents,
        costCents,
        stock,
        isActive,
        categoryId,
        ...(imagesArr
          ? {
              images: {
                createMany: {
                  data: imagesArr
                    .map((x: any, i: number) => ({
                      url: String(x?.url ?? "").trim(),
                      sort: Number.isFinite(Number(x?.sort)) ? Math.trunc(Number(x.sort)) : i,
                      isCover: !!x?.isCover,
                    }))
                    .filter((x: any) => x.url.length > 0),
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sku: true,
        barcode: true,
        costCents: true,
        priceCents: true,
        stock: true,
        isActive: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
        images: {
          orderBy: [{ isCover: "desc" }, { sort: "asc" }, { createdAt: "asc" }],
          take: 1,
          select: { id: true, url: true, isCover: true, sort: true },
        },
      },
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: any) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e?.code === "P2002") return NextResponse.json({ error: "Unique constraint failed" }, { status: 409 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

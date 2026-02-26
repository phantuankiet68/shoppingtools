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

/** Input already in cents (Int) */
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

/**
 * Parse images array for replace gallery
 * Accepts:
 *  images: [{ url: string, isCover?: boolean, sort?: number }]
 */
function parseImages(input: unknown) {
  const arr = Array.isArray(input) ? input : [];

  const cleaned = arr
    .map((x: any, idx) => {
      const url = String(x?.url ?? "").trim();
      if (!url) return null;

      const sort = Number.isFinite(Number(x?.sort)) ? Math.max(0, Math.trunc(Number(x.sort))) : idx;

      return {
        url,
        isCover: !!x?.isCover,
        sort,
      };
    })
    .filter(Boolean) as { url: string; isCover: boolean; sort: number }[];

  // Ensure only 1 cover
  const coverIdx = cleaned.findIndex((x) => x.isCover);
  if (coverIdx >= 0) {
    cleaned.forEach((x, i) => (x.isCover = i === coverIdx));
  } else if (cleaned.length > 0) {
    cleaned[0].isCover = true;
  }

  return cleaned;
}

/** ✅ return FULL data for edit (include images full) */
async function findOwnedProductFull(userId: string, id: string) {
  return prisma.product.findFirst({
    where: { id, userId },
    select: {
      id: true,
      userId: true,

      name: true,
      slug: true,
      description: true,

      sku: true,
      barcode: true,

      // ✅ schema mới
      costCents: true,
      priceCents: true,
      stock: true,

      isActive: true,

      categoryId: true,
      category: { select: { id: true, name: true } },

      createdAt: true,
      updatedAt: true,

      // ✅ full images for edit
      images: {
        orderBy: [{ isCover: "desc" }, { sort: "asc" }, { createdAt: "asc" }],
        select: { id: true, url: true, isCover: true, sort: true },
      },
    },
  });
}

/** ✅ return LIGHT data for guards (optional) */
async function findOwnedProductLite(userId: string, id: string) {
  return prisma.product.findFirst({
    where: { id, userId },
    select: { id: true, userId: true, isActive: true },
  });
}

/**
 * Next.js 15: params là Promise => await
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;

    const item = await findOwnedProductFull(user.id, String(id));
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unauthorized" }, { status: 401 });
  }
}

/**
 * PATCH /api/admin/products/:id
 * Body: partial
 * {
 *   name?, slug?, sku?, barcode?, description?,
 *   costCents?, priceCents?, stock?, categoryId?, isActive?,
 *   images?: Array<{ url: string, isCover?: boolean, sort?: number }> // optional: replace gallery
 * }
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;
    const pid = String(id);

    const current = await findOwnedProductLite(user.id, pid);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const data: any = {};

    // name + slug
    if (body.name !== undefined) {
      const name = normName(body.name);
      if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      data.name = name;

      // nếu client gửi slug rỗng mà gửi name, có thể auto
      if (body.slug === undefined) {
        // không auto bắt buộc, chỉ để hỗ trợ
      }
    }

    if (body.slug !== undefined) {
      const nameForSlug = data.name ?? undefined;
      const slug = normSlug(body.slug, nameForSlug);
      if (!slug) return NextResponse.json({ error: "Slug cannot be empty" }, { status: 400 });
      data.slug = slug;
    }

    // sku
    if (body.sku !== undefined) {
      const sku = normSku(body.sku);
      if (!sku) return NextResponse.json({ error: "SKU cannot be empty" }, { status: 400 });
      data.sku = sku;
    }

    // barcode
    if (body.barcode !== undefined) data.barcode = normBarcode(body.barcode);

    // ✅ schema mới: costCents/priceCents/stock
    if (body.costCents !== undefined) data.costCents = centsFrom(body.costCents);
    if (body.priceCents !== undefined) data.priceCents = centsFrom(body.priceCents);
    if (body.stock !== undefined) data.stock = stockFrom(body.stock);

    // category
    if (body.categoryId !== undefined) data.categoryId = body.categoryId ? String(body.categoryId) : null;

    // active
    if (body.isActive !== undefined) data.isActive = !!body.isActive;

    // description
    if (body.description !== undefined) {
      const desc = String(body.description ?? "").trim();
      data.description = desc.length ? desc : null;
    }

    // ✅ optional: replace images gallery
    const wantsReplaceImages = body.images !== undefined;
    const nextImages = wantsReplaceImages ? parseImages(body.images) : [];

    const updated = await prisma.$transaction(async (tx) => {
      // defense in depth
      const owned = await tx.product.findFirst({ where: { id: pid, userId: user.id }, select: { id: true } });
      if (!owned) throw new Error("FORBIDDEN");

      // update product
      await tx.product.update({
        where: { id: pid },
        data,
      });

      // replace images if requested
      if (wantsReplaceImages) {
        await tx.productImage.deleteMany({ where: { productId: pid } });

        if (nextImages.length) {
          await tx.productImage.createMany({
            data: nextImages.map((x) => ({
              productId: pid,
              url: x.url,
              sort: x.sort,
              isCover: x.isCover,
            })),
          });
        }
      }

      // return FULL (edit needs it)
      const withAll = await tx.product.findFirst({
        where: { id: pid, userId: user.id },
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
            select: { id: true, url: true, isCover: true, sort: true },
          },
        },
      });

      return withAll;
    });

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (e: any) {
    if (e?.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (e?.code === "P2002") return NextResponse.json({ error: "Unique constraint failed" }, { status: 409 });

    // đừng trả 401 cho mọi lỗi prisma
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: e?.message?.includes("Unauthorized") ? 401 : 500 },
    );
  }
}

/**
 * DELETE /api/admin/products/:id
 * SOFT DELETE => set isActive=false
 */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;
    const pid = String(id);

    const current = await findOwnedProductLite(user.id, pid);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.product.update({
      where: { id: pid },
      data: { isActive: false },
      select: { id: true, isActive: true, updatedAt: true },
    });

    // defense: ensure still owned
    const owned = await prisma.product.findFirst({ where: { id: updated.id, userId: user.id }, select: { id: true } });
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unauthorized" }, { status: 401 });
  }
}

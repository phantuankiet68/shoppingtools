// app/api/admin/product-variant/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function cleanText(v: unknown, max = 2000) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

async function recalcProductDisplay(productId: string) {
  // nếu Product bạn chưa có 3 field này -> comment lại toàn bộ function và các chỗ gọi
  const variants = await prisma.productVariant.findMany({
    where: { productId, isActive: true },
    select: { priceCents: true, stock: true },
  });

  const hasVariants = variants.length > 0;
  const displayStock = hasVariants ? variants.reduce((s, v) => s + (v.stock ?? 0), 0) : 0;
  const displayPriceCents = hasVariants ? Math.min(...variants.map((v) => v.priceCents ?? 0)) : 0;

  await prisma.product.update({
    where: { id: productId },
    data: { hasVariants, displayStock, displayPriceCents },
  });
}

async function getVariantOwned(userId: string, id: string) {
  return prisma.productVariant.findFirst({
    where: { id, product: { userId } },
    select: { id: true, productId: true },
  });
}

// ✅ Next 15: params may be Promise
type Ctx = { params: Promise<{ id: string }> | { id: string } };

/** GET /api/admin/product-variant/:id */
export async function GET(_req: Request, ctx: Ctx) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await ctx.params;

    const item = await prisma.productVariant.findFirst({
      where: { id, product: { userId } },
      select: {
        id: true,
        productId: true,
        name: true,
        sku: true,
        barcode: true,
        priceCents: true,
        costCents: true,
        stock: true,
        isActive: true,
        option1: true,
        value1: true,
        option2: true,
        value2: true,
        createdAt: true,
        updatedAt: true,
        images: {
          orderBy: [{ isCover: "desc" }, { sort: "asc" }],
          select: { id: true, url: true, fileName: true, sort: true, isCover: true, createdAt: true },
        },
      },
    });

    if (!item) return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e: any) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/** PATCH /api/admin/product-variant/:id */
export async function PATCH(req: Request, ctx: Ctx) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { id } = await ctx.params;

    const owned = await getVariantOwned(userId, id);
    if (!owned) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    const data: any = {};
    if (body.name !== undefined) data.name = cleanText(body.name, 200);
    if (body.sku !== undefined) {
      const sku = String(body.sku ?? "").trim();
      if (!sku) return NextResponse.json({ error: "sku cannot be empty" }, { status: 400 });
      data.sku = sku;
    }
    if (body.barcode !== undefined) data.barcode = cleanText(body.barcode, 64);

    if (body.priceCents !== undefined) {
      const n = Number(body.priceCents);
      if (!Number.isFinite(n)) return NextResponse.json({ error: "priceCents must be a number" }, { status: 400 });
      data.priceCents = Math.max(0, Math.trunc(n));
    }
    if (body.costCents !== undefined) {
      const n = Number(body.costCents);
      if (!Number.isFinite(n)) return NextResponse.json({ error: "costCents must be a number" }, { status: 400 });
      data.costCents = Math.max(0, Math.trunc(n));
    }
    if (body.stock !== undefined) {
      const n = Number(body.stock);
      if (!Number.isFinite(n)) return NextResponse.json({ error: "stock must be a number" }, { status: 400 });
      data.stock = Math.max(0, Math.trunc(n));
    }

    if (body.isActive !== undefined) data.isActive = !!body.isActive;
    if (body.option1 !== undefined) data.option1 = cleanText(body.option1, 32);
    if (body.value1 !== undefined) data.value1 = cleanText(body.value1, 64);
    if (body.option2 !== undefined) data.option2 = cleanText(body.option2, 32);
    if (body.value2 !== undefined) data.value2 = cleanText(body.value2, 64);

    const updated = await prisma.productVariant.update({
      where: { id },
      data,
      select: {
        id: true,
        productId: true,
        name: true,
        sku: true,
        barcode: true,
        priceCents: true,
        costCents: true,
        stock: true,
        isActive: true,
        option1: true,
        value1: true,
        option2: true,
        value2: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await recalcProductDisplay(owned.productId);

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    console.error("[PATCH /api/admin/product-variant/[id]] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (e?.code === "P2002") {
      const target = e?.meta?.target;
      const t = Array.isArray(target) ? target.join(",") : String(target ?? "");
      if (t.includes("sku")) return NextResponse.json({ error: "SKU already exists for this product" }, { status: 409 });
      return NextResponse.json({ error: "Conflict" }, { status: 409 });
    }

    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/** DELETE /api/admin/product-variant/:id */
export async function DELETE(_req: Request, ctx: Ctx) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await ctx.params;

    const owned = await getVariantOwned(userId, id);
    if (!owned) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    await prisma.productVariant.delete({ where: { id } });
    await recalcProductDisplay(owned.productId);

    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    console.error("[DELETE /api/admin/product-variant/[id]] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

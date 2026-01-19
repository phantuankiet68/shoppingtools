import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

async function ensureItemBelongsToUser(userId: string, itemId: string) {
  return prisma.inventoryReceiptItem.findFirst({
    where: { id: itemId, receipt: { userId } },
    select: {
      id: true,
      receiptId: true,
      productId: true,
      variantId: true,
      qty: true,
      unitCostCents: true,
      totalCents: true,
      receipt: { select: { status: true, taxCents: true } },
    },
  });
}

async function ensureVariantBelongsToProduct(variantId: string, productId: string) {
  const v = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
    select: { id: true },
  });
  return !!v;
}

function computeLineTotal(qty: number, unitCostCents: number) {
  const q = Number.isFinite(qty) ? Math.max(0, Math.trunc(qty)) : 0;
  const u = Number.isFinite(unitCostCents) ? Math.max(0, Math.trunc(unitCostCents)) : 0;
  return { qty: q, unitCostCents: u, totalCents: q * u };
}

async function recalcReceiptTotals(receiptId: string) {
  const agg = await prisma.inventoryReceiptItem.aggregate({
    where: { receiptId },
    _sum: { totalCents: true },
  });
  const subtotal = agg._sum.totalCents ?? 0;

  const receipt = await prisma.inventoryReceipt.findUnique({
    where: { id: receiptId },
    select: { taxCents: true },
  });
  const tax = receipt?.taxCents ?? 0;

  return prisma.inventoryReceipt.update({
    where: { id: receiptId },
    data: { subtotalCents: subtotal, totalCents: subtotal + tax },
    select: { id: true, subtotalCents: true, taxCents: true, totalCents: true },
  });
}

async function applyStockDeltaLine(productId: string, variantId: string | null, qty: number, direction: 1 | -1) {
  if (direction === -1) {
    if (variantId) {
      const v = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { stock: true } });
      const cur = v?.stock ?? 0;
      if (cur - qty < 0) throw new Error("Not enough variant stock");
    } else {
      const p = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true } });
      const cur = p?.stock ?? 0;
      if (cur - qty < 0) throw new Error("Not enough product stock");
    }
  }

  if (variantId) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: direction * qty } },
    });
  } else {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: direction * qty } },
    });
  }
}

/**
 * GET /api/admin/inventory/receipt/item/[id]
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await params;

    const item = await ensureItemBelongsToUser(userId, id);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    return NextResponse.json({ item });
  } catch (e: any) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/inventory/receipt/item/[id]
 * body: { productId?, variantId?, qty?, unitCostCents? }
 *
 * - validate variant belongs to product
 * - auto recompute totalCents
 * - if receipt.status=RECEIVED -> apply stock delta based on qty change and/or variant change
 * - recalc receipt totals
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await params;

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const cur = await ensureItemBelongsToUser(userId, id);
    if (!cur) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const receiptStatus = cur.receipt.status;

    const nextProductId = body.productId !== undefined ? String(body.productId) : cur.productId;
    const nextVariantId = body.variantId !== undefined ? (body.variantId ? String(body.variantId) : null) : cur.variantId ?? null;

    if (nextVariantId) {
      const okV = await ensureVariantBelongsToProduct(nextVariantId, nextProductId);
      if (!okV) return NextResponse.json({ error: "Variant does not belong to product" }, { status: 400 });
    }

    const nextQty = body.qty !== undefined ? Number(body.qty) : cur.qty;
    const nextUnit = body.unitCostCents !== undefined ? Number(body.unitCostCents) : cur.unitCostCents;
    const line = computeLineTotal(nextQty, nextUnit);
    if (line.qty <= 0) return NextResponse.json({ error: "qty must be > 0" }, { status: 400 });

    const updated = await prisma.$transaction(async (tx) => {
      // If RECEIVED, revert old stock then apply new stock
      if (receiptStatus === "RECEIVED") {
        // revert old
        await applyStockDeltaLine(cur.productId, cur.variantId ?? null, cur.qty, -1);
        // apply new
        await applyStockDeltaLine(nextProductId, nextVariantId, line.qty, 1);
      }

      const item = await tx.inventoryReceiptItem.update({
        where: { id },
        data: {
          productId: nextProductId,
          variantId: nextVariantId,
          qty: line.qty,
          unitCostCents: line.unitCostCents,
          totalCents: line.totalCents,
        },
        select: {
          id: true,
          receiptId: true,
          productId: true,
          variantId: true,
          qty: true,
          unitCostCents: true,
          totalCents: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await recalcReceiptTotals(cur.receiptId);
      return item;
    });

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    console.error("[PATCH /api/admin/inventory/receipt/item/[id]] ERROR:", e);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/inventory/receipt/item/[id]
 * - if receipt.status=RECEIVED -> revert stock
 * - recalc receipt totals
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await params;

    const cur = await ensureItemBelongsToUser(userId, id);
    if (!cur) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const receiptStatus = cur.receipt.status;

    await prisma.$transaction(async (tx) => {
      if (receiptStatus === "RECEIVED") {
        await applyStockDeltaLine(cur.productId, cur.variantId ?? null, cur.qty, -1);
      }

      await tx.inventoryReceiptItem.delete({ where: { id } });
      await recalcReceiptTotals(cur.receiptId);
    });

    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    console.error("[DELETE /api/admin/inventory/receipt/item/[id]] ERROR:", e);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

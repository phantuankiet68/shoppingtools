import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function toInt(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

async function ensureReceiptBelongsToUser(userId: string, receiptId: string) {
  return prisma.inventoryReceipt.findFirst({
    where: { id: receiptId, userId },
    select: { id: true, status: true, taxCents: true },
  });
}
async function ensureProductBelongsToUser(userId: string, productId: string) {
  const p = await prisma.product.findFirst({ where: { id: productId, userId }, select: { id: true } });
  return !!p;
}
async function ensureVariantBelongsToProduct(variantId: string, productId: string) {
  const v = await prisma.productVariant.findFirst({ where: { id: variantId, productId }, select: { id: true } });
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
 * GET /api/admin/inventory/receipt/item
 */
export async function GET(req: NextRequest) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const url = new URL(req.url);
    const receiptId = (url.searchParams.get("receiptId") ?? "").trim();
    const productId = (url.searchParams.get("productId") ?? "").trim();
    const variantId = (url.searchParams.get("variantId") ?? "").trim();

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 100), 1, 500);

    const where: any = {};
    if (receiptId) where.receiptId = receiptId;
    if (productId) where.productId = productId;
    if (variantId) where.variantId = variantId;

    // enforce only items under user's receipts
    where.receipt = { userId };

    const [items, total] = await Promise.all([
      prisma.inventoryReceiptItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
          product: { select: { id: true, name: true, sku: true } },
          variant: { select: { id: true, sku: true, name: true } },
        },
      }),
      prisma.inventoryReceiptItem.count({ where }),
    ]);

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e: any) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/inventory/receipt/item
 */
export async function POST(req: NextRequest) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const receiptId = String(body.receiptId ?? "").trim();
    const productId = String(body.productId ?? "").trim();
    const variantId = body.variantId ? String(body.variantId) : null;

    if (!receiptId) return NextResponse.json({ error: "receiptId is required" }, { status: 400 });
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    const receipt = await ensureReceiptBelongsToUser(userId, receiptId);
    if (!receipt) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });

    const okP = await ensureProductBelongsToUser(userId, productId);
    if (!okP) return NextResponse.json({ error: "Product not found" }, { status: 400 });

    if (variantId) {
      const okV = await ensureVariantBelongsToProduct(variantId, productId);
      if (!okV) return NextResponse.json({ error: "Variant does not belong to product" }, { status: 400 });
    }

    const line = computeLineTotal(Number(body.qty), Number(body.unitCostCents));
    if (line.qty <= 0) return NextResponse.json({ error: "qty must be > 0" }, { status: 400 });

    const created = await prisma.$transaction(async (tx: typeof prisma) => {
      const item = await tx.inventoryReceiptItem.create({
        data: {
          receiptId,
          productId,
          variantId,
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

      // if receipt already received -> stock must reflect it
      if (receipt.status === "RECEIVED") {
        await applyStockDeltaLine(productId, variantId, line.qty, 1);
      }

      await recalcReceiptTotals(receiptId);
      return item;
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/admin/inventory/receipt/item] ERROR:", e);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

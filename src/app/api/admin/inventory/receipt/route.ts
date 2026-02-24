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
function cleanText(v: unknown, max = 2000) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

async function ensureSupplierBelongsToUser(userId: string, supplierId: string) {
  const s = await prisma.supplier.findFirst({
    where: { id: supplierId, userId },
    select: { id: true },
  });
  return !!s;
}

async function ensureProductBelongsToUser(userId: string, productId: string) {
  const p = await prisma.product.findFirst({
    where: { id: productId, userId },
    select: { id: true },
  });
  return !!p;
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

  // keep tax as-is, recompute total
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

async function applyStockDeltaFromReceiptItems(receiptId: string, direction: 1 | -1) {
  const items = await prisma.inventoryReceiptItem.findMany({
    where: { receiptId },
    select: { productId: true, variantId: true, qty: true },
  });

  // validate when decreasing stock
  if (direction === -1) {
    for (const it of items) {
      if (it.variantId) {
        const v = await prisma.productVariant.findUnique({
          where: { id: it.variantId },
          select: { stock: true },
        });
        const cur = v?.stock ?? 0;
        if (cur - it.qty < 0) throw new Error("Not enough variant stock to revert receipt");
      } else {
        const p = await prisma.product.findUnique({
          where: { id: it.productId },
          select: { stock: true },
        });
        const cur = p?.stock ?? 0;
        if (cur - it.qty < 0) throw new Error("Not enough product stock to revert receipt");
      }
    }
  }

  // apply
  for (const it of items) {
    if (it.variantId) {
      await prisma.productVariant.update({
        where: { id: it.variantId },
        data: { stock: { increment: direction * it.qty } },
      });
    } else {
      await prisma.product.update({
        where: { id: it.productId },
        data: { stock: { increment: direction * it.qty } },
      });
    }
  }
}

/**
 * GET /api/admin/inventory/receipt
 */
export async function GET(req: NextRequest) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const status = (url.searchParams.get("status") ?? "all").toUpperCase();
    const supplierId = (url.searchParams.get("supplierId") ?? "").trim() || null;
    const includeItems = url.searchParams.get("includeItems") === "1";
    const sort = (url.searchParams.get("sort") ?? "newest").toLowerCase();

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 200);

    const where: any = { userId };
    if (q) where.OR = [{ reference: { contains: q } }, { notes: { contains: q } }];
    if (status !== "ALL") where.status = status;
    if (supplierId) where.supplierId = supplierId;

    const orderBy = sort === "receiveddesc" ? ({ receivedAt: "desc" } as const) : ({ createdAt: "desc" } as const);

    const [items, total] = await Promise.all([
      prisma.inventoryReceipt.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          supplierId: true,
          status: true,
          currency: true,
          receivedAt: true,
          reference: true,
          subtotalCents: true,
          taxCents: true,
          totalCents: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          supplier: { select: { id: true, name: true } },
          _count: { select: { items: true } },
          items: includeItems
            ? {
                select: {
                  id: true,
                  productId: true,
                  variantId: true,
                  qty: true,
                  unitCostCents: true,
                  totalCents: true,
                  product: { select: { id: true, name: true, sku: true } },
                  variant: { select: { id: true, sku: true, name: true } },
                },
                orderBy: { createdAt: "asc" },
              }
            : false,
        },
      }),
      prisma.inventoryReceipt.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((r: any) => ({
        ...r,
        itemsCount: r._count.items,
      })),
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
 * POST /api/admin/inventory/receipt
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

    const supplierIdRaw = body.supplierId;
    const supplierId = supplierIdRaw == null || supplierIdRaw === "" ? null : String(supplierIdRaw);

    if (supplierId) {
      const ok = await ensureSupplierBelongsToUser(userId, supplierId);
      if (!ok) return NextResponse.json({ error: "Supplier not found" }, { status: 400 });
    }

    const status = String(body.status ?? "PENDING").toUpperCase();
    const currency = String(body.currency ?? "USD").toUpperCase();

    const taxCents = Number.isFinite(Number(body.taxCents)) ? Math.max(0, Math.trunc(Number(body.taxCents))) : 0;

    const receivedAt = body.receivedAt == null || body.receivedAt === "" ? null : new Date(body.receivedAt);

    const reference = cleanText(body.reference, 200);
    const notes = cleanText(body.notes, 2000);

    const itemsInput = Array.isArray(body.items) ? body.items : [];

    // validate + compute lines
    const lines: Array<{
      productId: string;
      variantId: string | null;
      qty: number;
      unitCostCents: number;
      totalCents: number;
    }> = [];

    for (const it of itemsInput) {
      const productId = String(it.productId ?? "").trim();
      if (!productId) return NextResponse.json({ error: "Item.productId is required" }, { status: 400 });

      const okP = await ensureProductBelongsToUser(userId, productId);
      if (!okP) return NextResponse.json({ error: "Product not found" }, { status: 400 });

      const variantId = it.variantId ? String(it.variantId) : null;
      if (variantId) {
        const okV = await ensureVariantBelongsToProduct(variantId, productId);
        if (!okV) return NextResponse.json({ error: "Variant does not belong to product" }, { status: 400 });
      }

      const qtyRaw = Number(it.qty);
      const unitRaw = Number(it.unitCostCents);
      const line = computeLineTotal(qtyRaw, unitRaw);
      if (line.qty <= 0) return NextResponse.json({ error: "Item.qty must be > 0" }, { status: 400 });

      lines.push({
        productId,
        variantId,
        qty: line.qty,
        unitCostCents: line.unitCostCents,
        totalCents: line.totalCents,
      });
    }

    const subtotal = lines.reduce((s, x) => s + x.totalCents, 0);
    const totalCents = subtotal + taxCents;

    const created = await prisma.$transaction(async (tx: typeof prisma) => {
      const receipt = await tx.inventoryReceipt.create({
        data: {
          userId,
          supplierId,
          status,
          currency,
          receivedAt,
          reference,
          notes,
          subtotalCents: subtotal,
          taxCents,
          totalCents,
          items: lines.length ? { create: lines } : undefined,
        },
        select: {
          id: true,
          supplierId: true,
          status: true,
          currency: true,
          receivedAt: true,
          reference: true,
          subtotalCents: true,
          taxCents: true,
          totalCents: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (status === "RECEIVED" && lines.length) {
        for (const it of lines) {
          if (it.variantId) {
            await tx.productVariant.update({
              where: { id: it.variantId },
              data: { stock: { increment: it.qty } },
            });
          } else {
            await tx.product.update({
              where: { id: it.productId },
              data: { stock: { increment: it.qty } },
            });
          }
        }
      }

      return receipt;
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/admin/inventory/receipt] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

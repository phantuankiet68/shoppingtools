import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function cleanText(v: unknown, max = 2000) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

async function ensureReceiptBelongsToUser(userId: string, receiptId: string) {
  return prisma.inventoryReceipt.findFirst({
    where: { id: receiptId, userId },
    select: { id: true, status: true },
  });
}

async function applyStockDeltaFromReceiptItems(receiptId: string, direction: 1 | -1) {
  const items = await prisma.inventoryReceiptItem.findMany({
    where: { receiptId },
    select: { productId: true, variantId: true, qty: true },
  });

  if (direction === -1) {
    for (const it of items) {
      if (it.variantId) {
        const v = await prisma.productVariant.findUnique({ where: { id: it.variantId }, select: { stock: true } });
        const cur = v?.stock ?? 0;
        if (cur - it.qty < 0) throw new Error("Not enough variant stock to revert receipt");
      } else {
        const p = await prisma.product.findUnique({ where: { id: it.productId }, select: { stock: true } });
        const cur = p?.stock ?? 0;
        if (cur - it.qty < 0) throw new Error("Not enough product stock to revert receipt");
      }
    }
  }

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
 * GET /api/admin/inventory/receipt/[id]
 * returns receipt + items
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await params;

    const item = await prisma.inventoryReceipt.findFirst({
      where: { id, userId },
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
        items: {
          select: {
            id: true,
            productId: true,
            variantId: true,
            qty: true,
            unitCostCents: true,
            totalCents: true,
            product: { select: { id: true, name: true, sku: true } },
            variant: { select: { id: true, sku: true, name: true } },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!item) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });

    return NextResponse.json({ item });
  } catch (e: any) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/inventory/receipt/[id]
 * body: { supplierId?, status?, currency?, receivedAt?, reference?, notes?, taxCents? }
 * - If status changes to/from RECEIVED -> apply stock delta based on items
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await params;

    const current = await ensureReceiptBelongsToUser(userId, id);
    if (!current) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const nextStatus = body.status !== undefined ? String(body.status).toUpperCase() : undefined;

    const data: any = {};
    if (body.supplierId !== undefined) data.supplierId = body.supplierId ? String(body.supplierId) : null;
    if (body.currency !== undefined) data.currency = String(body.currency).toUpperCase();
    if (body.receivedAt !== undefined) {
      data.receivedAt = body.receivedAt ? new Date(body.receivedAt) : null;
    }
    if (body.reference !== undefined) data.reference = cleanText(body.reference, 200);
    if (body.notes !== undefined) data.notes = cleanText(body.notes, 2000);
    if (body.taxCents !== undefined) data.taxCents = Math.max(0, Math.trunc(Number(body.taxCents)));

    if (nextStatus !== undefined) data.status = nextStatus;

    const updated = await prisma.$transaction(async (tx) => {
      // apply stock delta if toggling RECEIVED
      if (nextStatus && nextStatus !== current.status) {
        if (current.status !== "RECEIVED" && nextStatus === "RECEIVED") {
          // increase stock
          await applyStockDeltaFromReceiptItems(id, 1);
        } else if (current.status === "RECEIVED" && nextStatus !== "RECEIVED") {
          // revert stock
          await applyStockDeltaFromReceiptItems(id, -1);
        }
      }

      const r = await tx.inventoryReceipt.update({
        where: { id },
        data,
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

      // recompute total if tax changed (subtotal is maintained by item endpoints)
      if (body.taxCents !== undefined) {
        const subtotal = r.subtotalCents ?? 0;
        const tax = r.taxCents ?? 0;
        const fixed = await tx.inventoryReceipt.update({
          where: { id },
          data: { totalCents: subtotal + tax },
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
        return fixed;
      }

      return r;
    });

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    console.error("[PATCH /api/admin/inventory/receipt/[id]] ERROR:", e);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/inventory/receipt/[id]
 * - If receipt was RECEIVED, revert stock before delete
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await params;

    const current = await ensureReceiptBelongsToUser(userId, id);
    if (!current) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      if (current.status === "RECEIVED") {
        await applyStockDeltaFromReceiptItems(id, -1);
      }
      await tx.inventoryReceipt.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    console.error("[DELETE /api/admin/inventory/receipt/[id]] ERROR:", e);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

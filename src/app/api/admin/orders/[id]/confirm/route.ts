import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { computeFulfillmentFromItems, normalizeIdempotencyKey } from "@/lib/api/adminOrderHelpers";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;
    const orderId = ctx.params.id;

    const body = await req.json().catch(() => ({}));
    const idem = normalizeIdempotencyKey(body.idempotencyKey);

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true },
      });
      if (!order) throw new Error("NOT_FOUND");
      if (order.status !== "PENDING") {
        // idempotent: if already confirmed or beyond, return order
        return order;
      }
      if (!order.items.length) throw new Error("EMPTY_ITEMS");

      // Reserve remaining for each item: qty - qtyReserved
      for (const it of order.items) {
        const remain = Math.max(0, it.qty - (it.qtyReserved || 0));
        if (remain <= 0) continue;

        // create StockMovement: RESERVE (+)
        await tx.stockMovement.create({
          data: {
            userId,
            productId: it.productId,
            variantId: it.variantId,
            type: "ADJUST", // if you keep StockMovementType = IN/OUT/ADJUST/RETURN_IN/VOID
            // Better: add RESERVE/RELEASE in enum. If not, store via source/note.
            source: "ORDER",
            qtyDelta: 0, // reserve doesn't change onHand; if your system reserves stock separately, keep qtyDelta 0
            occurredAt: new Date(),
            orderItemId: it.id,
            reference: order.number || order.id,
            note: `RESERVE ${remain}`,
            idempotencyKey: idem ? `${idem}:reserve:${it.id}` : null,
          },
        });

        await tx.orderItem.update({
          where: { id: it.id },
          data: { qtyReserved: (it.qtyReserved || 0) + remain },
        });
      }

      const updatedItems = await tx.orderItem.findMany({ where: { orderId } });
      const { fulfillmentStatus, status } = computeFulfillmentFromItems(updatedItems as any);

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          fulfillmentStatus,
        },
        include: { items: true },
      });

      return updated;
    });

    return NextResponse.json({ data: result });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (e?.message === "NOT_FOUND") return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (e?.message === "EMPTY_ITEMS") return NextResponse.json({ error: "EMPTY_ITEMS" }, { status: 400 });
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

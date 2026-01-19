import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { normalizeIdempotencyKey } from "@/lib/api/adminOrderHelpers";

export async function POST(req: NextRequest, ctx: { params: { id: string } }) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;
    const orderId = ctx.params.id;

    const body = await req.json().catch(() => ({}));
    const idem = normalizeIdempotencyKey(body.idempotencyKey);

    const out = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true },
      });
      if (!order) throw new Error("NOT_FOUND");
      if (order.status === "CANCELLED") return order;

      // Can't cancel if shipped already (you can relax this rule if you want)
      const shippedAny = order.items.some((it) => (it.qtyShipped || 0) > 0);
      if (shippedAny) throw new Error("ALREADY_SHIPPED");

      // Release reserve (qtyReserved -> 0)
      for (const it of order.items) {
        const reserved = Math.max(0, it.qtyReserved || 0);
        if (reserved <= 0) continue;

        // movement for RELEASE (no onHand change; reservation only)
        await tx.stockMovement.create({
          data: {
            userId,
            productId: it.productId,
            variantId: it.variantId,
            type: "ADJUST",
            source: "ORDER",
            qtyDelta: 0,
            occurredAt: new Date(),
            orderItemId: it.id,
            reference: order.number || order.id,
            note: `RELEASE ${reserved}`,
            idempotencyKey: idem ? `${idem}:release:${it.id}` : null,
          },
        });

        await tx.orderItem.update({
          where: { id: it.id },
          data: { qtyReserved: 0 },
        });
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          fulfillmentStatus: "CANCELLED",
          paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : "CANCELLED",
          cancelledAt: new Date(),
        },
        include: { items: true },
      });

      return updated;
    });

    return NextResponse.json({ data: out });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (e?.message === "NOT_FOUND") return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (e?.message === "ALREADY_SHIPPED") return NextResponse.json({ error: "ALREADY_SHIPPED" }, { status: 400 });
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

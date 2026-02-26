import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { computeFulfillmentFromItems, normalizeIdempotencyKey } from "@/lib/api/adminOrderHelpers";

type ReturnBody = {
  idempotencyKey?: string;
  items?: Array<{ orderItemId: string; qty: number }>; // partial return
  note?: string;
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;
    const orderId = ctx.params.id;

    const body = (await req.json().catch(() => ({}))) as ReturnBody;
    const idem = normalizeIdempotencyKey(body.idempotencyKey);
    const note = typeof body.note === "string" ? body.note : "RETURN";

    const out = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true },
      });
      if (!order) throw new Error("NOT_FOUND");
      if (order.status === "CANCELLED") throw new Error("ORDER_CANCELLED");

      const plan = new Map<string, number>();
      if (Array.isArray(body.items)) {
        for (const x of body.items) {
          const qty = Math.max(0, Math.trunc(Number(x.qty || 0)));
          if (!x.orderItemId || qty <= 0) continue;
          plan.set(String(x.orderItemId), qty);
        }
      }
      if (!plan.size) throw new Error("RETURN_ITEMS_REQUIRED");

      for (const it of order.items) {
        const want = plan.get(it.id) || 0;
        if (want <= 0) continue;

        const shipped = Math.max(0, it.qtyShipped || 0);
        const returned = Math.max(0, it.qtyReturned || 0);
        const canReturn = Math.max(0, shipped - returned);

        const qty = Math.min(canReturn, want);
        if (qty <= 0) continue;

        await tx.stockMovement.create({
          data: {
            userId,
            productId: it.productId,
            variantId: it.variantId,
            type: "RETURN_IN",
            source: "ORDER",
            qtyDelta: qty, // return increases onHand
            occurredAt: new Date(),
            orderItemId: it.id,
            reference: order.number || order.id,
            note,
            idempotencyKey: idem ? `${idem}:return:${it.id}:${qty}` : null,
          },
        });

        await tx.orderItem.update({
          where: { id: it.id },
          data: { qtyReturned: returned + qty },
        });
      }

      const updatedItems = await tx.orderItem.findMany({ where: { orderId } });
      const { fulfillmentStatus, status, returnedAll } = computeFulfillmentFromItems(updatedItems as any);

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          fulfillmentStatus: returnedAll ? "RETURNED" : (fulfillmentStatus as any),
          status: returnedAll ? "RETURNED" : (status as any),
          returnedAt: returnedAll ? new Date() : undefined,
        },
        include: { items: true },
      });

      return updated;
    });

    return NextResponse.json({ data: out });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (e?.message === "NOT_FOUND") return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (e?.message === "ORDER_CANCELLED") return NextResponse.json({ error: "ORDER_CANCELLED" }, { status: 400 });
    if (e?.message === "RETURN_ITEMS_REQUIRED")
      return NextResponse.json({ error: "RETURN_ITEMS_REQUIRED" }, { status: 400 });
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";

export function jsonError(message: string, status = 400) {
  return { message, status };
}

export function normalizeIdempotencyKey(v: any) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s.slice(0, 120) : null;
}

export async function getOrderOrThrow(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) throw new Error("NOT_FOUND");
  return order;
}

export function computeFulfillmentFromItems(items: Array<{ qty: number; qtyShipped: number; qtyReturned: number }>) {
  const totalQty = items.reduce((s, it) => s + it.qty, 0);
  const shipped = items.reduce((s, it) => s + it.qtyShipped, 0);
  const returned = items.reduce((s, it) => s + it.qtyReturned, 0);

  // FulfillmentStatus
  const fulfillmentStatus = totalQty <= 0 ? "UNFULFILLED" : shipped <= 0 ? "UNFULFILLED" : shipped < totalQty ? "PARTIAL" : "FULFILLED";

  // OrderStatus (ops)
  // - If everything shipped -> DELIVERING (or DELIVERED when deliveredAt set by another flow)
  // - If partially shipped -> DELIVERING
  // Keep it conservative; deliver event is separate.
  const status = shipped > 0 ? "DELIVERING" : "CONFIRMED";

  // Returned: only if returned equals shipped (you can customize)
  const returnedAll = shipped > 0 && returned >= shipped;

  return { fulfillmentStatus, status, returnedAll };
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

/**
 * Query params:
 * - q: search (refund.id, refund.reference, order.number, order.reference, customer snapshot)
 * - status: RefundStatus
 * - reason: RefundReason
 * - orderId: string
 * - from: ISO date (requestedAt >= from)
 * - to: ISO date (requestedAt <= to)
 * - cursor: last id
 * - take: number (default 20, max 100)
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const status = url.searchParams.get("status");
    const reason = url.searchParams.get("reason");
    const orderId = (url.searchParams.get("orderId") || "").trim();
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const cursor = url.searchParams.get("cursor");

    const takeRaw = Number(url.searchParams.get("take") || 20);
    const take = Math.max(1, Math.min(100, Math.trunc(takeRaw)));

    const where: any = {
      userId,
      ...(status ? { status } : {}),
      ...(reason ? { reason } : {}),
      ...(orderId ? { orderId } : {}),
    };

    if (from || to) {
      where.requestedAt = {};
      if (from) where.requestedAt.gte = new Date(from);
      if (to) where.requestedAt.lte = new Date(to);
    }

    if (q) {
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        {
          order: {
            OR: [
              { number: { contains: q, mode: "insensitive" } },
              { reference: { contains: q, mode: "insensitive" } },
              { customerNameSnapshot: { contains: q, mode: "insensitive" } },
              { customerPhoneSnapshot: { contains: q, mode: "insensitive" } },
              { customerEmailSnapshot: { contains: q, mode: "insensitive" } },
              { shipToName: { contains: q, mode: "insensitive" } },
              { shipToPhone: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const rows = await prisma.refund.findMany({
      where,
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        userId: true,
        orderId: true,
        originalPaymentId: true,
        refundPaymentId: true,
        status: true,
        reason: true,
        amountCents: true,
        currency: true,
        reference: true,
        notes: true,
        requestedAt: true,
        approvedAt: true,
        processedAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,

        order: {
          select: {
            id: true,
            number: true,
            reference: true,
            currency: true,
            totalCents: true,
            paymentStatus: true,
            customerNameSnapshot: true,
            customerEmailSnapshot: true,
            customerPhoneSnapshot: true,
          },
        },

        refundPayment: {
          select: {
            id: true,
            direction: true,
            status: true,
            method: true,
            provider: true,
            reference: true,
            occurredAt: true,
            amountCents: true,
            currency: true,
          },
        },

        _count: { select: { items: true } },
      },
    });

    const hasMore = rows.length > take;
    const data = hasMore ? rows.slice(0, take) : rows;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return NextResponse.json({ data, nextCursor });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * Create refund
 * Body:
 * {
 *   orderId: string
 *   amountCents: number
 *   currency?: "USD" | "VND"
 *   reason?: RefundReason
 *   status?: RefundStatus (default PENDING)
 *   notes?: string
 *   reference?: string
 *   originalPaymentId?: string
 *
 *   // optional: items (partial refund)
 *   items?: Array<{ orderItemId?: string; qty?: number; amountCents: number; notes?: string }>
 *
 *   // optional: create refund payment too (default true)
 *   createRefundPayment?: boolean
 *   payment?: {
 *     method?: PaymentMethod
 *     provider?: PaymentProvider
 *     status?: TxStatus
 *     occurredAt?: string (ISO)
 *     reference?: string
 *     idempotencyKey?: string
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const body = await req.json();

    const orderId = String(body.orderId || "").trim();
    if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

    const amountCents = Math.max(0, Math.trunc(Number(body.amountCents ?? 0)));
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ error: "amountCents must be > 0" }, { status: 400 });
    }

    const reason = (body.reason || "OTHER") as any;
    const status = (body.status || "PENDING") as any;
    const currency = (body.currency || "VND") as any;

    const notes = body.notes ? String(body.notes) : null;
    const reference = body.reference ? String(body.reference) : null;
    const originalPaymentId = body.originalPaymentId ? String(body.originalPaymentId) : null;

    const createRefundPayment = body.createRefundPayment !== false; // default true
    const paymentInput = body.payment || {};

    // ensure order belongs to user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: { id: true, currency: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // normalize items
    const itemsRaw = Array.isArray(body.items) ? body.items : [];
    const items = itemsRaw
      .map((it: any) => {
        const qty = it.qty != null ? Math.max(1, Math.trunc(Number(it.qty))) : 1;
        const amt = Math.max(0, Math.trunc(Number(it.amountCents ?? 0)));
        if (!Number.isFinite(amt) || amt < 0) throw new Error("Invalid items.amountCents");
        return {
          orderItemId: it.orderItemId ? String(it.orderItemId) : null,
          qty,
          amountCents: amt,
          notes: it.notes ? String(it.notes) : null,
        };
      })
      .filter((x: any) => x.amountCents > 0);

    const created = await prisma.$transaction(async (tx) => {
      // optional: validate originalPayment belongs to same user/order
      if (originalPaymentId) {
        const op = await tx.payment.findFirst({
          where: { id: originalPaymentId, userId },
          select: { id: true, orderId: true, direction: true },
        });
        if (!op) throw new Error("originalPaymentId not found");
        if (op.orderId !== orderId) throw new Error("originalPaymentId does not match orderId");
      }

      // create refund payment (direction=REFUND)
      let refundPaymentId: string | null = null;

      if (createRefundPayment) {
        const p = await tx.payment.create({
          data: {
            userId,
            orderId,
            direction: "REFUND",
            status: (paymentInput.status || "REFUNDED") as any, // default reasonable
            method: (paymentInput.method || "CASH") as any,
            currency,
            amountCents,
            provider: (paymentInput.provider || "MANUAL") as any,
            reference: paymentInput.reference ? String(paymentInput.reference) : reference,
            notes,
            occurredAt: paymentInput.occurredAt ? new Date(String(paymentInput.occurredAt)) : new Date(),
            idempotencyKey: paymentInput.idempotencyKey ? String(paymentInput.idempotencyKey) : null,
          },
          select: { id: true },
        });

        refundPaymentId = p.id;
      }

      const refund = await tx.refund.create({
        data: {
          userId,
          orderId,
          originalPaymentId,
          refundPaymentId,
          status,
          reason,
          amountCents,
          currency,
          reference,
          notes,
          ...(status === "APPROVED" ? { approvedAt: new Date() } : {}),
          ...(status === "PROCESSING" ? { processedAt: new Date() } : {}),
          ...(status === "SUCCEEDED" ? { completedAt: new Date() } : {}),
          ...(items.length
            ? {
                items: {
                  create: items,
                },
              }
            : {}),
        },
        include: { items: true },
      });

      // Optional: update order.paymentStatus
      // (logic đơn giản; nếu bạn có partial thì nên tính tổng capture-refund)
      if (status === "SUCCEEDED") {
        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: "REFUNDED" },
        });
      }

      return refund;
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint failed" }, { status: 409 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

/**
 * Query params:
 * - q: search by reference / notes / order.number (nếu có include)
 * - orderId: filter exact
 * - status: TxStatus
 * - method: PaymentMethod
 * - provider: PaymentProvider
 * - direction: PaymentDirection
 * - from: ISO date (occurredAt >= from)
 * - to: ISO date (occurredAt <= to)
 * - cursor: last id (pagination)
 * - take: number (default 20, max 100)
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const url = new URL(req.url);

    const q = (url.searchParams.get("q") || "").trim();
    const orderId = (url.searchParams.get("orderId") || "").trim();

    const status = url.searchParams.get("status");
    const method = url.searchParams.get("method");
    const provider = url.searchParams.get("provider");
    const direction = url.searchParams.get("direction");

    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const cursor = url.searchParams.get("cursor");

    const takeRaw = Number(url.searchParams.get("take") || 20);
    const take = Math.max(1, Math.min(100, Math.trunc(takeRaw)));

    const where: any = {
      userId,
      ...(orderId ? { orderId } : {}),
      ...(status ? { status } : {}),
      ...(method ? { method } : {}),
      ...(provider ? { provider } : {}),
      ...(direction ? { direction } : {}),
    };

    // occurredAt range
    if (from || to) {
      where.occurredAt = {};
      if (from) where.occurredAt.gte = new Date(from);
      if (to) where.occurredAt.lte = new Date(to);
    }

    // search
    if (q) {
      where.OR = [
        { reference: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        // search theo order number/reference (cần relation Order)
        {
          order: {
            OR: [{ number: { contains: q, mode: "insensitive" } }, { reference: { contains: q, mode: "insensitive" } }],
          },
        },
      ];
    }

    const rows = await prisma.payment.findMany({
      where,
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
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
        direction: true,
        status: true,
        method: true,
        currency: true,
        amountCents: true,
        provider: true,
        reference: true,
        notes: true,
        occurredAt: true,
        idempotencyKey: true,
        createdAt: true,
        updatedAt: true,

        // optional: show order info for UI
        order: {
          select: {
            id: true,
            number: true,
            reference: true,
            status: true,
            paymentStatus: true,
            fulfillmentStatus: true,
            totalCents: true,
            currency: true,
            createdAt: true,
          },
        },
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
 * Create payment
 * Body:
 * {
 *   orderId: string
 *   direction?: "CAPTURE" | "REFUND"
 *   status?: "PENDING" | "PAID" | "REFUNDED" | "CANCELLED"
 *   method?: "CARD" | "BANK" | "CASH" | "EWALLET" | "COD"
 *   currency?: "USD" | "VND"
 *   amountCents: number
 *   provider?: "MANUAL" | "VNPAY" | "MOMO" | "ZALOPAY" | "STRIPE" | "PAYPAL" | "OTHER"
 *   reference?: string
 *   notes?: string
 *   occurredAt?: string (ISO)
 *   idempotencyKey?: string (unique)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const body = await req.json();

    const orderId = String(body.orderId || "").trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const amountCents = Math.max(0, Math.trunc(Number(body.amountCents ?? 0)));
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ error: "amountCents must be > 0" }, { status: 400 });
    }

    const direction = (body.direction || "CAPTURE") as "CAPTURE" | "REFUND";
    const status = (body.status || "PAID") as "PENDING" | "PAID" | "REFUNDED" | "CANCELLED";
    const method = (body.method || "CASH") as "CARD" | "BANK" | "CASH" | "EWALLET" | "COD";
    const currency = (body.currency || "VND") as "USD" | "VND";
    const provider = (body.provider || "MANUAL") as "MANUAL" | "VNPAY" | "MOMO" | "ZALOPAY" | "STRIPE" | "PAYPAL" | "OTHER";

    const reference = body.reference ? String(body.reference) : null;
    const notes = body.notes ? String(body.notes) : null;
    const occurredAt = body.occurredAt ? new Date(String(body.occurredAt)) : new Date();
    const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey) : null;

    // đảm bảo order thuộc user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: { id: true, paymentStatus: true, totalCents: true, currency: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const created = await prisma.$transaction(async (tx) => {
      // optional: idempotency: nếu key đã tồn tại thì trả về record đó
      if (idempotencyKey) {
        const existed = await tx.payment.findUnique({
          where: { idempotencyKey },
        });
        if (existed) return existed;
      }

      const p = await tx.payment.create({
        data: {
          userId,
          orderId,
          direction,
          status,
          method,
          currency,
          amountCents,
          provider,
          reference,
          notes,
          occurredAt,
          idempotencyKey,
        },
      });

      // Optional: cập nhật Order.paymentStatus đơn giản
      // (Tuỳ business logic của bạn, bạn có thể tính theo sum capture/refund)
      if (direction === "CAPTURE" && status === "PAID") {
        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID" },
        });
      }

      if (direction === "REFUND" && status === "REFUNDED") {
        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: "REFUNDED" },
        });
      }

      return p;
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // Prisma unique constraint (idempotencyKey)
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "idempotencyKey already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

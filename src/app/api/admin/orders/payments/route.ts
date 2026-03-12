import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type PaymentDirectionValue = "CAPTURE" | "REFUND";
type PaymentTxStatusValue = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED";
type PaymentMethodValue = "COD" | "CARD" | "BANK_TRANSFER" | "WALLET";
type OrderPaymentStatusValue = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELED";

function parseDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getSiteId(req: NextRequest) {
  const siteId = (req.headers.get("x-site-id") || "").trim();
  if (!siteId) {
    throw new Error("Missing x-site-id header");
  }
  return siteId;
}

function isPaymentDirection(value: unknown): value is PaymentDirectionValue {
  return value === "CAPTURE" || value === "REFUND";
}

function isPaymentTxStatus(value: unknown): value is PaymentTxStatusValue {
  return value === "PENDING" || value === "SUCCEEDED" || value === "FAILED" || value === "CANCELED";
}

function isPaymentMethod(value: unknown): value is PaymentMethodValue {
  return value === "COD" || value === "CARD" || value === "BANK_TRANSFER" || value === "WALLET";
}

async function recomputeOrderPaymentStatus(tx: any, siteId: string, orderId: string) {
  const order = await tx.order.findFirst({
    where: {
      id: orderId,
      siteId,
      deletedAt: null,
    },
    select: {
      id: true,
      totalCents: true,
      paidAt: true,
    },
  });

  if (!order) return;

  const successfulCaptures = await tx.payment.aggregate({
    where: {
      siteId,
      orderId,
      direction: "CAPTURE",
      status: "SUCCEEDED",
    },
    _sum: {
      amountCents: true,
    },
  });

  const successfulRefunds = await tx.payment.aggregate({
    where: {
      siteId,
      orderId,
      direction: "REFUND",
      status: "SUCCEEDED",
    },
    _sum: {
      amountCents: true,
    },
  });

  const captured = successfulCaptures._sum.amountCents || 0;
  const refunded = successfulRefunds._sum.amountCents || 0;
  const netPaid = captured - refunded;

  let nextPaymentStatus: OrderPaymentStatusValue = "UNPAID";

  if (netPaid <= 0 && refunded > 0) {
    nextPaymentStatus = "REFUNDED";
  } else if (netPaid >= order.totalCents) {
    nextPaymentStatus = "PAID";
  } else if (netPaid > 0) {
    nextPaymentStatus = "PENDING";
  }

  await tx.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: nextPaymentStatus,
      paidAt: nextPaymentStatus === "PAID" ? new Date() : order.paidAt,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuthUser();

    const siteId = getSiteId(req);
    const url = new URL(req.url);

    const q = (url.searchParams.get("q") || "").trim();
    const orderId = (url.searchParams.get("orderId") || "").trim();

    const statusParam = url.searchParams.get("status");
    const methodParam = url.searchParams.get("method");
    const provider = (url.searchParams.get("provider") || "").trim();
    const directionParam = url.searchParams.get("direction");

    const from = parseDate(url.searchParams.get("from"));
    const to = parseDate(url.searchParams.get("to"));

    const cursor = (url.searchParams.get("cursor") || "").trim();

    const takeRaw = Number(url.searchParams.get("take") || 20);
    const take = Math.max(1, Math.min(100, Math.trunc(takeRaw)));

    if (statusParam && !isPaymentTxStatus(statusParam)) {
      return NextResponse.json({ error: "status is invalid" }, { status: 400 });
    }

    if (methodParam && !isPaymentMethod(methodParam)) {
      return NextResponse.json({ error: "method is invalid" }, { status: 400 });
    }

    if (directionParam && !isPaymentDirection(directionParam)) {
      return NextResponse.json({ error: "direction is invalid" }, { status: 400 });
    }

    const where = {
      siteId,
      ...(orderId ? { orderId } : {}),
      ...(statusParam ? { status: statusParam } : {}),
      ...(methodParam ? { method: methodParam } : {}),
      ...(provider ? { provider } : {}),
      ...(directionParam ? { direction: directionParam } : {}),
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { id: { contains: q } },
              { reference: { contains: q, mode: "insensitive" as const } },
              {
                providerTransactionId: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                order: {
                  OR: [
                    { orderNumber: { contains: q, mode: "insensitive" as const } },
                    { customerNameSnapshot: { contains: q, mode: "insensitive" as const } },
                    { customerEmailSnapshot: { contains: q, mode: "insensitive" as const } },
                    { shipToName: { contains: q, mode: "insensitive" as const } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

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
        siteId: true,
        orderId: true,
        direction: true,
        status: true,
        method: true,
        currency: true,
        amountCents: true,
        provider: true,
        providerTransactionId: true,
        reference: true,
        occurredAt: true,
        idempotencyKey: true,
        createdAt: true,
        updatedAt: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            fulfillmentStatus: true,
            totalCents: true,
            currency: true,
            createdAt: true,
            customerNameSnapshot: true,
            customerEmailSnapshot: true,
            shipToName: true,
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

    if (e?.message === "Missing x-site-id header") {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminAuthUser();

    const siteId = getSiteId(req);
    const body = await req.json();

    const orderId = String(body.orderId || "").trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const amountCents = Math.trunc(Number(body.amountCents ?? 0));
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ error: "amountCents must be > 0" }, { status: 400 });
    }

    const direction = body.direction ?? "CAPTURE";
    const status = body.status ?? "SUCCEEDED";
    const method = body.method ?? "COD";
    const currency = String(body.currency || "VND");

    if (!isPaymentDirection(direction)) {
      return NextResponse.json({ error: "direction is invalid" }, { status: 400 });
    }

    if (!isPaymentTxStatus(status)) {
      return NextResponse.json({ error: "status is invalid" }, { status: 400 });
    }

    if (!isPaymentMethod(method)) {
      return NextResponse.json({ error: "method is invalid" }, { status: 400 });
    }

    const provider = body.provider ? String(body.provider) : null;
    const providerTransactionId = body.providerTransactionId ? String(body.providerTransactionId) : null;
    const reference = body.reference ? String(body.reference) : null;
    const occurredAt = body.occurredAt ? new Date(String(body.occurredAt)) : new Date();
    const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey) : null;

    if (Number.isNaN(occurredAt.getTime())) {
      return NextResponse.json({ error: "occurredAt is invalid" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        siteId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const created = await prisma.$transaction(async (tx: any) => {
      if (idempotencyKey) {
        const existed = await tx.payment.findFirst({
          where: {
            siteId,
            idempotencyKey,
          },
        });

        if (existed) return existed;
      }

      const payment = await tx.payment.create({
        data: {
          siteId,
          orderId,
          direction,
          status,
          method,
          currency,
          amountCents,
          provider,
          providerTransactionId,
          reference,
          occurredAt,
          idempotencyKey,
        },
      });

      await recomputeOrderPaymentStatus(tx, siteId, orderId);

      return payment;
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (e?.message === "Missing x-site-id header") {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    if (e?.code === "P2002") {
      return NextResponse.json({ error: "idempotencyKey already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

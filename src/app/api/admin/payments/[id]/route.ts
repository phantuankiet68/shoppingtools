import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const id = String(params.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const payment = await prisma.payment.findFirst({
      where: { id, userId },
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

    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: payment });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * PATCH body (all optional):
 * {
 *   direction?: "CAPTURE" | "REFUND"
 *   status?: "PENDING" | "PAID" | "REFUNDED" | "CANCELLED"
 *   method?: "CARD" | "BANK" | "CASH" | "EWALLET" | "COD"
 *   currency?: "USD" | "VND"
 *   amountCents?: number
 *   provider?: ...
 *   reference?: string | null
 *   notes?: string | null
 *   occurredAt?: string (ISO)
 * }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const id = String(params.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();

    // chỉ update fields được phép
    const data: any = {};

    if (body.direction) data.direction = String(body.direction);
    if (body.status) data.status = String(body.status);
    if (body.method) data.method = String(body.method);
    if (body.currency) data.currency = String(body.currency);
    if (body.provider) data.provider = String(body.provider);

    if (body.amountCents !== undefined) {
      const amountCents = Math.max(0, Math.trunc(Number(body.amountCents)));
      if (!Number.isFinite(amountCents) || amountCents <= 0) {
        return NextResponse.json({ error: "amountCents must be > 0" }, { status: 400 });
      }
      data.amountCents = amountCents;
    }

    if (body.reference !== undefined) data.reference = body.reference === null ? null : String(body.reference);
    if (body.notes !== undefined) data.notes = body.notes === null ? null : String(body.notes);
    if (body.occurredAt) data.occurredAt = new Date(String(body.occurredAt));

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // đảm bảo record thuộc user
    const existed = await prisma.payment.findFirst({
      where: { id, userId },
      select: { id: true, orderId: true },
    });
    if (!existed) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.payment.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const id = String(params.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const existed = await prisma.payment.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existed) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.payment.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

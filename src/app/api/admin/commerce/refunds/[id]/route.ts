import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const id = String(params.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const refund = await prisma.refund.findFirst({
      where: { id, userId },
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

        originalPayment: {
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

        items: {
          orderBy: [{ id: "asc" }],
          select: {
            id: true,
            refundId: true,
            orderItemId: true,
            qty: true,
            amountCents: true,
            notes: true,
            orderItem: {
              select: {
                id: true,
                productId: true,
                variantId: true,
                qty: true,
                unitPriceCents: true,
                skuSnapshot: true,
                productNameSnapshot: true,
                variantNameSnapshot: true,
              },
            },
          },
        },
      },
    });

    if (!refund) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: refund });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * PATCH body (optional fields):
 * {
 *   status?: RefundStatus
 *   reason?: RefundReason
 *   notes?: string | null
 *   reference?: string | null
 *   amountCents?: number
 *   currency?: CurrencyCode
 *   approvedAt?: string | null
 *   processedAt?: string | null
 *   completedAt?: string | null
 *
 *   // optional update items (simple replace strategy)
 *   replaceItems?: boolean
 *   items?: Array<{ id?: string; orderItemId?: string | null; qty?: number; amountCents: number; notes?: string | null }>
 *
 *   // optional: also update refundPayment
 *   payment?: { status?: TxStatus; method?: PaymentMethod; provider?: PaymentProvider; reference?: string | null; occurredAt?: string }
 * }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const id = String(params.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();

    const existed = await prisma.refund.findFirst({
      where: { id, userId },
      select: { id: true, orderId: true, refundPaymentId: true },
    });
    if (!existed) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data: any = {};
    if (body.status) data.status = String(body.status);
    if (body.reason) data.reason = String(body.reason);
    if (body.notes !== undefined) data.notes = body.notes === null ? null : String(body.notes);
    if (body.reference !== undefined) data.reference = body.reference === null ? null : String(body.reference);

    if (body.amountCents !== undefined) {
      const amountCents = Math.max(0, Math.trunc(Number(body.amountCents)));
      if (!Number.isFinite(amountCents) || amountCents <= 0) {
        return NextResponse.json({ error: "amountCents must be > 0" }, { status: 400 });
      }
      data.amountCents = amountCents;
    }
    if (body.currency) data.currency = String(body.currency);

    // timestamps
    if (body.approvedAt !== undefined) data.approvedAt = body.approvedAt ? new Date(String(body.approvedAt)) : null;
    if (body.processedAt !== undefined) data.processedAt = body.processedAt ? new Date(String(body.processedAt)) : null;
    if (body.completedAt !== undefined) data.completedAt = body.completedAt ? new Date(String(body.completedAt)) : null;

    // auto timestamps by status (nice default)
    if (body.status) {
      const s = String(body.status);
      const now = new Date();
      if (s === "APPROVED") data.approvedAt = data.approvedAt ?? now;
      if (s === "PROCESSING") data.processedAt = data.processedAt ?? now;
      if (s === "SUCCEEDED") data.completedAt = data.completedAt ?? now;
    }

    const replaceItems = Boolean(body.replaceItems);
    const itemsRaw = Array.isArray(body.items) ? body.items : [];
    const paymentPatch = body.payment || null;

    const updated = await prisma.$transaction(async (tx) => {
      // optionally update refund payment
      if (paymentPatch && existed.refundPaymentId) {
        const pd: any = {};
        if (paymentPatch.status) pd.status = String(paymentPatch.status);
        if (paymentPatch.method) pd.method = String(paymentPatch.method);
        if (paymentPatch.provider) pd.provider = String(paymentPatch.provider);
        if (paymentPatch.reference !== undefined)
          pd.reference = paymentPatch.reference === null ? null : String(paymentPatch.reference);
        if (paymentPatch.occurredAt) pd.occurredAt = new Date(String(paymentPatch.occurredAt));

        if (Object.keys(pd).length) {
          await tx.payment.update({ where: { id: existed.refundPaymentId }, data: pd });
        }
      }

      if (replaceItems) {
        await tx.refundItem.deleteMany({ where: { refundId: id } });

        const items = itemsRaw
          .map((it: any) => {
            const qty = it.qty != null ? Math.max(1, Math.trunc(Number(it.qty))) : 1;
            const amt = Math.max(0, Math.trunc(Number(it.amountCents ?? 0)));
            if (!Number.isFinite(amt) || amt <= 0) return null;
            return {
              refundId: id,
              orderItemId: it.orderItemId ? String(it.orderItemId) : null,
              qty,
              amountCents: amt,
              notes: it.notes === null ? null : it.notes ? String(it.notes) : null,
            };
          })
          .filter(Boolean) as any[];

        if (items.length) await tx.refundItem.createMany({ data: items });
      }

      const r = await tx.refund.update({
        where: { id },
        data,
        include: { items: true },
      });

      // Optional: update order.paymentStatus when succeeded/cancelled
      if (body.status === "SUCCEEDED") {
        await tx.order.update({
          where: { id: existed.orderId },
          data: { paymentStatus: "REFUNDED" },
        });
      }

      return r;
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

    const existed = await prisma.refund.findFirst({
      where: { id, userId },
      select: { id: true, refundPaymentId: true },
    });
    if (!existed) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // delete items
      await tx.refundItem.deleteMany({ where: { refundId: id } });

      // delete refund itself
      await tx.refund.delete({ where: { id } });

      // optional: delete refund payment too (if you want hard cleanup)
      if (existed.refundPaymentId) {
        await tx.payment.delete({ where: { id: existed.refundPaymentId } }).catch(() => {
          // ignore if constrained elsewhere
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

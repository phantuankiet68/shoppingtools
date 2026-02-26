import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;
    const id = ctx.params.id;

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
            variant: { select: { id: true, name: true, sku: true } },
          },
        },
        transactions: {
          orderBy: { occurredAt: "desc" },
          take: 20,
          select: {
            id: true,
            type: true,
            status: true,
            method: true,
            currency: true,
            totalCents: true,
            occurredAt: true,
            reference: true,
          },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ data: order });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * PATCH body (all optional):
 * {
 *   notes?: string
 *   reference?: string
 *   carrier?: string
 *   trackingCode?: string
 *   shipTo?: { name?, phone?, address1?, address2?, city?, state?, postal?, country? }
 * }
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;
    const id = ctx.params.id;

    const body = await req.json();
    const shipTo = body.shipTo || {};

    const updated = await prisma.order.updateMany({
      where: { id, userId },
      data: {
        notes: typeof body.notes === "string" ? body.notes : undefined,
        reference: typeof body.reference === "string" ? body.reference : undefined,
        carrier: typeof body.carrier === "string" ? body.carrier : undefined,
        trackingCode: typeof body.trackingCode === "string" ? body.trackingCode : undefined,

        shipToName: typeof shipTo.name === "string" ? shipTo.name : undefined,
        shipToPhone: typeof shipTo.phone === "string" ? shipTo.phone : undefined,
        shipToAddress1: typeof shipTo.address1 === "string" ? shipTo.address1 : undefined,
        shipToAddress2: typeof shipTo.address2 === "string" ? shipTo.address2 : undefined,
        shipToCity: typeof shipTo.city === "string" ? shipTo.city : undefined,
        shipToState: typeof shipTo.state === "string" ? shipTo.state : undefined,
        shipToPostal: typeof shipTo.postal === "string" ? shipTo.postal : undefined,
        shipToCountry: typeof shipTo.country === "string" ? shipTo.country : undefined,
      },
    });

    if (updated.count === 0) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    return NextResponse.json({ data: order });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

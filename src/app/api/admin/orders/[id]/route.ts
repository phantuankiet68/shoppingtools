import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

async function getAdminOwnedSiteId(userId: string): Promise<string | null> {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ownedSites: {
        select: { id: true },
        take: 1,
      },
    },
  });

  return me?.ownedSites?.[0]?.id ?? null;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const admin = await requireAdminAuthUser();
    const siteId = await getAdminOwnedSiteId(admin.id);

    if (!siteId) {
      return NextResponse.json({ error: "SITE_NOT_FOUND" }, { status: 400 });
    }

    const { id } = await ctx.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        siteId,
        deletedAt: null,
      },
      include: {
        items: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        payments: {
          orderBy: {
            occurredAt: "desc",
          },
          take: 20,
          select: {
            id: true,
            direction: true,
            status: true,
            method: true,
            currency: true,
            amountCents: true,
            occurredAt: true,
            reference: true,
            provider: true,
            providerTransactionId: true,
          },
        },
        fulfillments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
          include: {
            items: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const latestFulfillment = order.fulfillments[0] ?? null;

    const data = {
      id: order.id,
      number: order.orderNumber,
      reference: null,
      channel: order.source || "SHOP",

      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,

      currency: order.currency,
      subtotalCents: order.subtotalCents,
      discountCents: order.discountCents,
      shippingCents: order.shippingCents,
      taxCents: order.taxCents,
      totalCents: order.totalCents,

      customerNameSnapshot: order.customerNameSnapshot,
      customerPhoneSnapshot: order.customerPhoneSnapshot,
      shipToName: order.shipToName,
      shipToPhone: order.shipToPhone,

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      notes: order.notes,

      carrier: latestFulfillment?.carrier ?? null,
      trackingCode: latestFulfillment?.trackingNumber ?? null,

      shipToAddress1: order.shipAddr1,
      shipToAddress2: order.shipAddr2,
      shipToCity: order.shipCity,
      shipToState: order.shipRegion,
      shipToPostal: order.shipPostal,
      shipToCountry: order.shipCountry,

      items: order.items.map((item) => {
        const fulfilledQty = order.fulfillments.reduce((sum, fulfillment) => {
          const matched = fulfillment.items.find((fi) => fi.orderItemId === item.id);
          return sum + (matched?.qty ?? 0);
        }, 0);

        return {
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,

          qty: item.qty,
          qtyReserved: 0,
          qtyShipped: fulfilledQty,
          qtyReturned: 0,

          unitPriceCents: item.unitPriceCents,
          subtotalCents: item.subtotalCents,
          discountCents: item.discountCents,
          taxCents: item.taxCents,
          totalCents: item.totalCents,

          skuSnapshot: item.skuSnapshot,
          productNameSnapshot: item.productNameSnapshot,
          variantNameSnapshot: item.variantNameSnapshot,
        };
      }),

      payments: order.payments,
      fulfillments: order.fulfillments,
    };

    return NextResponse.json({ data });
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
 *   notes?: string
 *   carrier?: string
 *   trackingCode?: string
 *   shipTo?: { name?, phone?, address1?, address2?, city?, state?, postal?, country? }
 * }
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const admin = await requireAdminAuthUser();
    const siteId = await getAdminOwnedSiteId(admin.id);

    if (!siteId) {
      return NextResponse.json({ error: "SITE_NOT_FOUND" }, { status: 400 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const shipTo = body.shipTo || {};

    const existing = await prisma.order.findFirst({
      where: {
        id,
        siteId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          notes: typeof body.notes === "string" ? body.notes : undefined,

          shipToName: typeof shipTo.name === "string" ? shipTo.name : undefined,
          shipToPhone: typeof shipTo.phone === "string" ? shipTo.phone : undefined,
          shipAddr1: typeof shipTo.address1 === "string" ? shipTo.address1 : undefined,
          shipAddr2: typeof shipTo.address2 === "string" ? shipTo.address2 : undefined,
          shipCity: typeof shipTo.city === "string" ? shipTo.city : undefined,
          shipRegion: typeof shipTo.state === "string" ? shipTo.state : undefined,
          shipPostal: typeof shipTo.postal === "string" ? shipTo.postal : undefined,
          shipCountry: typeof shipTo.country === "string" ? shipTo.country : undefined,
        },
      });

      const carrier = typeof body.carrier === "string" ? body.carrier : undefined;
      const trackingCode = typeof body.trackingCode === "string" ? body.trackingCode : undefined;

      if (carrier !== undefined || trackingCode !== undefined) {
        const latestFulfillment = await tx.fulfillment.findFirst({
          where: { orderId: id, siteId },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });

        if (latestFulfillment) {
          await tx.fulfillment.update({
            where: { id: latestFulfillment.id },
            data: {
              carrier,
              trackingNumber: trackingCode,
            },
          });
        }
      }
    });

    const order = await prisma.order.findFirst({
      where: {
        id,
        siteId,
        deletedAt: null,
      },
      include: {
        items: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
        },
        fulfillments: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            items: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const latestFulfillment = order.fulfillments[0] ?? null;

    const data = {
      id: order.id,
      number: order.orderNumber,
      reference: null,
      channel: order.source || "SHOP",

      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,

      currency: order.currency,
      subtotalCents: order.subtotalCents,
      discountCents: order.discountCents,
      shippingCents: order.shippingCents,
      taxCents: order.taxCents,
      totalCents: order.totalCents,

      customerNameSnapshot: order.customerNameSnapshot,
      customerPhoneSnapshot: order.customerPhoneSnapshot,
      shipToName: order.shipToName,
      shipToPhone: order.shipToPhone,

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      notes: order.notes,

      carrier: latestFulfillment?.carrier ?? null,
      trackingCode: latestFulfillment?.trackingNumber ?? null,

      shipToAddress1: order.shipAddr1,
      shipToAddress2: order.shipAddr2,
      shipToCity: order.shipCity,
      shipToState: order.shipRegion,
      shipToPostal: order.shipPostal,
      shipToCountry: order.shipCountry,

      items: order.items.map((item) => {
        const fulfilledQty = order.fulfillments.reduce((sum, fulfillment) => {
          const matched = fulfillment.items.find((fi) => fi.orderItemId === item.id);
          return sum + (matched?.qty ?? 0);
        }, 0);

        return {
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,

          qty: item.qty,
          qtyReserved: 0,
          qtyShipped: fulfilledQty,
          qtyReturned: 0,

          unitPriceCents: item.unitPriceCents,
          subtotalCents: item.subtotalCents,
          discountCents: item.discountCents,
          taxCents: item.taxCents,
          totalCents: item.totalCents,

          skuSnapshot: item.skuSnapshot,
          productNameSnapshot: item.productNameSnapshot,
          variantNameSnapshot: item.variantNameSnapshot,
        };
      }),
    };

    return NextResponse.json({ data });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

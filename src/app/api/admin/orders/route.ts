import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type AdminOrdersQueryStatus = "DRAFT" | "PLACED" | "CANCELLED" | "COMPLETED";
type AdminOrdersQueryPaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELED";
type AdminOrdersQueryFulfillmentStatus = "UNFULFILLED" | "PARTIALLY_FULFILLED" | "FULFILLED" | "CANCELLED";

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

/**
 * Query params:
 * - q: search (order number/customer/sku snapshot)
 * - status: OrderStatus
 * - paymentStatus: PaymentStatus
 * - fulfillmentStatus: FulfillmentStatus
 * - channel: mapped to source
 * - cursor: last id (pagination)
 * - take: number (default 20, max 100)
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();

    const siteId = await getAdminOwnedSiteId(admin.id);
    if (!siteId) {
      return NextResponse.json({ error: "SITE_NOT_FOUND" }, { status: 400 });
    }

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const status = url.searchParams.get("status") as AdminOrdersQueryStatus | null;
    const paymentStatus = url.searchParams.get("paymentStatus") as AdminOrdersQueryPaymentStatus | null;
    const fulfillmentStatus = url.searchParams.get("fulfillmentStatus") as AdminOrdersQueryFulfillmentStatus | null;
    const channel = url.searchParams.get("channel");
    const cursor = url.searchParams.get("cursor");

    const takeRaw = Number(url.searchParams.get("take") || 20);
    const take = Math.max(1, Math.min(100, Math.trunc(takeRaw)));

    const where: any = {
      siteId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(fulfillmentStatus ? { fulfillmentStatus } : {}),
      ...(channel ? { source: channel } : {}),
    };

    if (q) {
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerNameSnapshot: { contains: q, mode: "insensitive" } },
        { customerPhoneSnapshot: { contains: q, mode: "insensitive" } },
        { shipToName: { contains: q, mode: "insensitive" } },
        { shipToPhone: { contains: q, mode: "insensitive" } },
        {
          items: {
            some: {
              OR: [
                { skuSnapshot: { contains: q, mode: "insensitive" } },
                { productNameSnapshot: { contains: q, mode: "insensitive" } },
                { variantNameSnapshot: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    const rows = await prisma.order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        currency: true,
        subtotalCents: true,
        discountCents: true,
        shippingCents: true,
        taxCents: true,
        totalCents: true,
        customerId: true,
        customerNameSnapshot: true,
        customerPhoneSnapshot: true,
        shipToName: true,
        shipToPhone: true,
        source: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
      },
    });

    const hasMore = rows.length > take;
    const data = hasMore ? rows.slice(0, take) : rows;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return NextResponse.json({
      data: data.map((r) => ({
        id: r.id,
        number: r.orderNumber,
        reference: null,
        channel: r.source || "SHOP",
        status: r.status,
        paymentStatus: r.paymentStatus,
        fulfillmentStatus: r.fulfillmentStatus,
        currency: r.currency,
        subtotalCents: r.subtotalCents,
        discountCents: r.discountCents,
        shippingCents: r.shippingCents,
        taxCents: r.taxCents,
        totalCents: r.totalCents,
        customerNameSnapshot: r.customerNameSnapshot,
        customerPhoneSnapshot: r.customerPhoneSnapshot,
        shipToName: r.shipToName,
        shipToPhone: r.shipToPhone,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        _count: r._count,
      })),
      nextCursor,
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * Create order
 * Body:
 * }
 */
export async function POST(req: NextRequest) {
  type CreateOrderItemInput = {
    productId: string;
    variantId?: string;
    qty: number;
    unitPriceCents: number;
    skuSnapshot?: string;
    productNameSnapshot?: string;
    variantNameSnapshot?: string;
  };

  type CreateOrderBody = {
    customerId?: string;
    channel?: string;
    currency?: string;
    notes?: string;
    shippingCents?: number;
    customerNameSnapshot?: string;
    customerPhoneSnapshot?: string;
    customerEmailSnapshot?: string;
    shipTo?: {
      name?: string;
      phone?: string;
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      postal?: string;
      country?: string;
    };
    items: CreateOrderItemInput[];
  };

  type NormalizedOrderItem = {
    siteId: string;
    productId: string;
    variantId: string | null;
    qty: number;
    unitPriceCents: number;
    subtotalCents: number;
    discountCents: number;
    taxCents: number;
    totalCents: number;
    skuSnapshot: string | null;
    productNameSnapshot: string;
    variantNameSnapshot: string | null;
    imageSnapshot: string | null;
  };

  try {
    const admin = await requireAdminAuthUser();

    const siteId = await getAdminOwnedSiteId(admin.id);
    if (!siteId) {
      return NextResponse.json({ error: "SITE_NOT_FOUND" }, { status: 400 });
    }

    const body = (await req.json()) as CreateOrderBody;

    const items: CreateOrderItemInput[] = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    if (body.customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: String(body.customerId),
          siteId,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (!customer) {
        return NextResponse.json({ error: "CUSTOMER_NOT_FOUND" }, { status: 400 });
      }
    }

    const normalizedItems: NormalizedOrderItem[] = items.map((it: CreateOrderItemInput) => {
      const qty = Math.max(1, Math.trunc(Number(it.qty || 0)));
      const unitPriceCents = Math.max(0, Math.trunc(Number(it.unitPriceCents || 0)));

      if (!it.productId) {
        throw new Error("productId is required");
      }

      const subtotalCents = qty * unitPriceCents;

      return {
        siteId,
        productId: String(it.productId),
        variantId: it.variantId ? String(it.variantId) : null,
        qty,
        unitPriceCents,
        subtotalCents,
        discountCents: 0,
        taxCents: 0,
        totalCents: subtotalCents,
        skuSnapshot: it.skuSnapshot ? String(it.skuSnapshot) : null,
        productNameSnapshot: it.productNameSnapshot ? String(it.productNameSnapshot) : "Unknown product",
        variantNameSnapshot: it.variantNameSnapshot ? String(it.variantNameSnapshot) : null,
        imageSnapshot: null,
      };
    });

    const currency = body.currency ? String(body.currency) : "VND";
    const source = body.channel ? String(body.channel) : "SHOP";

    const subtotalCents = normalizedItems.reduce<number>((sum, item) => sum + item.subtotalCents, 0);
    const discountCents = 0;
    const shippingCents = Math.max(0, Math.trunc(Number(body.shippingCents || 0)));
    const taxCents = 0;
    const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents + taxCents);

    const count = await prisma.order.count({
      where: { siteId },
    });
    const orderNumber = `ORD-${String(count + 1).padStart(5, "0")}`;

    const shipTo = body.shipTo || {};

    const order = await prisma.order.create({
      data: {
        siteId,
        customerId: body.customerId ? String(body.customerId) : null,
        orderNumber,

        status: "PLACED",
        paymentStatus: "UNPAID",
        fulfillmentStatus: "UNFULFILLED",

        currency,
        subtotalCents,
        discountCents,
        shippingCents,
        taxCents,
        totalCents,

        customerNameSnapshot: body.customerNameSnapshot ? String(body.customerNameSnapshot) : null,
        customerPhoneSnapshot: body.customerPhoneSnapshot ? String(body.customerPhoneSnapshot) : null,
        customerEmailSnapshot: body.customerEmailSnapshot ? String(body.customerEmailSnapshot) : null,

        shipToName: shipTo.name ? String(shipTo.name) : null,
        shipToPhone: shipTo.phone ? String(shipTo.phone) : null,
        shipAddr1: shipTo.address1 ? String(shipTo.address1) : null,
        shipAddr2: shipTo.address2 ? String(shipTo.address2) : null,
        shipCity: shipTo.city ? String(shipTo.city) : null,
        shipRegion: shipTo.state ? String(shipTo.state) : null,
        shipPostal: shipTo.postal ? String(shipTo.postal) : null,
        shipCountry: shipTo.country ? String(shipTo.country) : null,

        source,
        notes: body.notes ? String(body.notes) : null,
        placedAt: new Date(),

        items: {
          create: normalizedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

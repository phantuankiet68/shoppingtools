import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

/**
 * Query params:
 * - q: search (order number/reference/customer/sku snapshot)
 * - status: OrderStatus
 * - paymentStatus: PaymentStatus
 * - fulfillmentStatus: FulfillmentStatus
 * - channel: SalesChannel
 * - cursor: last id (pagination)
 * - take: number (default 20, max 100)
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const status = url.searchParams.get("status");
    const paymentStatus = url.searchParams.get("paymentStatus");
    const fulfillmentStatus = url.searchParams.get("fulfillmentStatus");
    const channel = url.searchParams.get("channel");
    const cursor = url.searchParams.get("cursor");

    const takeRaw = Number(url.searchParams.get("take") || 20);
    const take = Math.max(1, Math.min(100, Math.trunc(takeRaw)));

    const where: any = {
      userId,
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(fulfillmentStatus ? { fulfillmentStatus } : {}),
      ...(channel ? { channel } : {}),
    };

    // Search across number/reference + customer snapshots + item snapshots
    if (q) {
      where.OR = [
        { number: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
        { customerNameSnapshot: { contains: q, mode: "insensitive" } },
        { customerPhoneSnapshot: { contains: q, mode: "insensitive" } },
        { shipToName: { contains: q, mode: "insensitive" } },
        { shipToPhone: { contains: q, mode: "insensitive" } },
        {
          items: {
            some: {
              OR: [{ skuSnapshot: { contains: q, mode: "insensitive" } }, { productNameSnapshot: { contains: q, mode: "insensitive" } }, { variantNameSnapshot: { contains: q, mode: "insensitive" } }],
            },
          },
        },
      ];
    }

    const rows = await prisma.order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1, // fetch extra to compute nextCursor
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        number: true,
        reference: true,
        channel: true,
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
        createdAt: true,
        updatedAt: true,
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
 * Create order
 * Body:
 * {
 *   customerId?: string
 *   channel?: "SHOP" | "MARKETPLACE" | "WHOLESALE"
 *   currency?: "USD" | "VND"
 *   reference?: string
 *   notes?: string
 *   shipTo?: { name?: string; phone?: string; address1?: string; ... }
 *   items: Array<{
 *     productId: string
 *     variantId?: string
 *     qty: number
 *     unitPriceCents: number
 *     // optional snapshots (if you already computed on client)
 *     skuSnapshot?: string
 *     productNameSnapshot?: string
 *     variantNameSnapshot?: string
 *   }>
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const body = await req.json();

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    // validate items
    const normalizedItems = items.map((it: any) => {
      const qty = Math.max(1, Math.trunc(Number(it.qty || 0)));
      const unitPriceCents = Math.max(0, Math.trunc(Number(it.unitPriceCents || 0)));

      if (!it.productId) throw new Error("productId is required");

      const subtotalCents = qty * unitPriceCents;

      return {
        productId: String(it.productId),
        variantId: it.variantId ? String(it.variantId) : null,
        qty,
        unitPriceCents,
        subtotalCents,
        discountCents: 0,
        taxCents: 0,
        totalCents: subtotalCents,
        skuSnapshot: it.skuSnapshot ? String(it.skuSnapshot) : null,
        productNameSnapshot: it.productNameSnapshot ? String(it.productNameSnapshot) : null,
        variantNameSnapshot: it.variantNameSnapshot ? String(it.variantNameSnapshot) : null,
      };
    });

    const currency = (body.currency || "VND") as "USD" | "VND";
    const channel = (body.channel || "SHOP") as "SHOP" | "MARKETPLACE" | "WHOLESALE";

    const subtotalCents = normalizedItems.reduce((s: number, it: any) => s + it.subtotalCents, 0);
    const discountCents = 0;
    const shippingCents = Math.max(0, Math.trunc(Number(body.shippingCents || 0)));
    const taxCents = 0;
    const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents + taxCents);

    // generate order number (per-user). Replace with your own scheme if needed.
    const count = await prisma.order.count({ where: { userId } });
    const number = `ORD-${String(count + 1).padStart(5, "0")}`;

    const shipTo = body.shipTo || {};

    const order = await prisma.$transaction(async (tx) => {
      // Optional: pull snapshot fields from DB (recommended)
      // If you want FULL accuracy, fetch product/variant here and fill snapshots server-side.
      // We'll keep client snapshots if present, otherwise we can fill basic placeholders.

      const created = await tx.order.create({
        data: {
          userId,
          number,
          status: "PENDING",
          paymentStatus: "UNPAID",
          fulfillmentStatus: "UNFULFILLED",
          channel,
          currency,
          reference: body.reference ? String(body.reference) : null,

          customerId: body.customerId ? String(body.customerId) : null,

          // customer snapshots (optional)
          customerNameSnapshot: body.customerNameSnapshot ? String(body.customerNameSnapshot) : null,
          customerPhoneSnapshot: body.customerPhoneSnapshot ? String(body.customerPhoneSnapshot) : null,
          customerEmailSnapshot: body.customerEmailSnapshot ? String(body.customerEmailSnapshot) : null,

          // shipping snapshot
          shipToName: shipTo.name ? String(shipTo.name) : null,
          shipToPhone: shipTo.phone ? String(shipTo.phone) : null,
          shipToAddress1: shipTo.address1 ? String(shipTo.address1) : null,
          shipToAddress2: shipTo.address2 ? String(shipTo.address2) : null,
          shipToCity: shipTo.city ? String(shipTo.city) : null,
          shipToState: shipTo.state ? String(shipTo.state) : null,
          shipToPostal: shipTo.postal ? String(shipTo.postal) : null,
          shipToCountry: shipTo.country ? String(shipTo.country) : null,

          notes: body.notes ? String(body.notes) : null,

          subtotalCents,
          discountCents,
          shippingCents,
          taxCents,
          totalCents,

          items: {
            create: normalizedItems,
          },
        },
        include: {
          items: true,
        },
      });

      return created;
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    // prisma foreign key / validation errors can be mapped here if you want
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

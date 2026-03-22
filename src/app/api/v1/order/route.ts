import { NextRequest, NextResponse } from "next/server";
import {
  Prisma,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AddOrderItemPayload = {
  siteId?: string;
  customerId?: string | null;
  currency?: string;
  source?: string | null;

  customerNameSnapshot?: string | null;
  customerEmailSnapshot?: string | null;
  customerPhoneSnapshot?: string | null;

  shipToName?: string | null;
  shipToPhone?: string | null;
  shipAddr1?: string | null;
  shipAddr2?: string | null;
  shipCity?: string | null;
  shipRegion?: string | null;
  shipPostal?: string | null;
  shipCountry?: string | null;

  notes?: string | null;
  internalNotes?: string | null;

  qty?: number;
  productId?: string | null;
  variantId?: string | null;

  item?: {
    productId?: string | null;
    variantId?: string | null;
    productNameSnapshot?: string;
    variantNameSnapshot?: string | null;
    skuSnapshot?: string | null;
    imageSnapshot?: string | null;
    qty?: number;
    unitPriceCents?: number;
    subtotalCents?: number;
    discountCents?: number;
    taxCents?: number;
    totalCents?: number;
  };
};

function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      ok: false,
      message,
      ...(extra || {}),
    },
    { status },
  );
}

function toStringSafe(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toNumberSafe(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizePositiveInt(value: unknown, fallback = 1): number {
  const parsed = Math.floor(toNumberSafe(value, fallback));
  return parsed > 0 ? parsed : fallback;
}

function buildOrderNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${yyyy}${mm}${dd}-${rand}`;
}

function getClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip") || null;
}

function validatePayload(body: AddOrderItemPayload): string | null {
  if (!body.item) return "Thiếu item.";

  const item = body.item;

  if (!toStringSafe(item.productNameSnapshot).trim()) {
    return "Thiếu item.productNameSnapshot.";
  }

  const qty = normalizePositiveInt(item.qty ?? body.qty, 0);
  if (qty <= 0) return "Số lượng không hợp lệ.";

  const unitPriceCents = toNumberSafe(item.unitPriceCents, NaN);
  if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0) {
    return "item.unitPriceCents không hợp lệ.";
  }

  return null;
}

async function resolveSiteId(
  req: NextRequest,
  body: AddOrderItemPayload,
): Promise<{ siteId: string; domain: string; resolvedBy: string }> {
  const bodySiteId = toNullableString(body.siteId);
  if (bodySiteId) {
    return { siteId: bodySiteId, domain: "", resolvedBy: "body.siteId" };
  }

  const headerSiteId = toNullableString(req.headers.get("x-site-id"));
  if (headerSiteId) {
    return { siteId: headerSiteId, domain: "", resolvedBy: "x-site-id" };
  }

  const qpSiteId = toNullableString(req.nextUrl.searchParams.get("siteId"));
  if (qpSiteId) {
    return { siteId: qpSiteId, domain: "", resolvedBy: "query.siteId" };
  }

  const hostHeader =
    req.headers.get("x-site-domain") ??
    req.headers.get("host") ??
    "";

  const domain = hostHeader.split(":")[0].toLowerCase();

  if (domain && domain !== "localhost" && domain !== "127.0.0.1") {
    try {
      const siteByDomain = await prisma.site.findFirst({
        where: { domain },
        select: { id: true },
      });

      if (siteByDomain?.id) {
        return { siteId: siteByDomain.id, domain, resolvedBy: "domain" };
      }
    } catch (error) {
      console.error("resolveSiteId domain lookup error:", error);
    }
  }

  const productId =
    toNullableString(body.item?.productId) ??
    toNullableString(body.productId);

  if (productId) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { siteId: true },
      });

      if (product?.siteId) {
        return { siteId: product.siteId, domain, resolvedBy: "productId" };
      }
    } catch (error) {
      console.error("resolveSiteId product lookup error:", error);
    }
  }

  try {
    const defaultSite = await prisma.site.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true, domain: true },
    });

    if (defaultSite?.id) {
      return {
        siteId: defaultSite.id,
        domain: defaultSite.domain,
        resolvedBy: "defaultSite",
      };
    }
  } catch (error) {
    console.error("resolveSiteId default site lookup error:", error);
  }

  return { siteId: "", domain, resolvedBy: "none" };
}

async function recalculateOrderTotals(
  tx: Prisma.TransactionClient,
  orderId: string,
) {
  const items = await tx.orderItem.findMany({
    where: {
      orderId,
      deletedAt: null,
    },
    select: {
      subtotalCents: true,
      discountCents: true,
      taxCents: true,
    },
  });

  const subtotalCents = items.reduce((sum, item) => sum + item.subtotalCents, 0);
  const discountCents = items.reduce((sum, item) => sum + item.discountCents, 0);
  const taxCents = items.reduce((sum, item) => sum + item.taxCents, 0);

  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: { shippingCents: true },
  });

  const shippingCents = order?.shippingCents ?? 0;
  const totalCents = subtotalCents - discountCents + taxCents + shippingCents;

  return tx.order.update({
    where: { id: orderId },
    data: {
      subtotalCents,
      discountCents,
      taxCents,
      totalCents,
    },
    include: {
      items: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
      payments: {
        orderBy: { occurredAt: "desc" },
      },
      fulfillments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AddOrderItemPayload;
    console.log("POST /api/v1/order body =", JSON.stringify(body, null, 2));

    const validationError = validatePayload(body);
    if (validationError) {
      return jsonError(validationError, 400, { debug: body });
    }

    const siteResolved = await resolveSiteId(req, body);
    console.log("POST /api/v1/order siteResolved =", siteResolved);

    if (!siteResolved.siteId) {
      return jsonError(
        "Thiếu siteId. Không resolve được từ body/header/query/domain/product.",
        400,
        {
          debug: body,
          domain: siteResolved.domain,
          resolvedBy: siteResolved.resolvedBy,
        },
      );
    }

    const siteId = siteResolved.siteId;
    const currency = toStringSafe(body.currency, "VND").trim() || "VND";
    const customerId = toNullableString(body.customerId);
    const source = toNullableString(body.source);

    const item = body.item!;
    const qty = normalizePositiveInt(item.qty ?? body.qty, 1);
    const unitPriceCents = toNumberSafe(item.unitPriceCents, 0);
    const subtotalCents = Number.isFinite(toNumberSafe(item.subtotalCents, NaN))
      ? toNumberSafe(item.subtotalCents, 0)
      : unitPriceCents * qty;
    const discountCents = toNumberSafe(item.discountCents, 0);
    const taxCents = toNumberSafe(item.taxCents, 0);
    const totalCents = Number.isFinite(toNumberSafe(item.totalCents, NaN))
      ? toNumberSafe(item.totalCents, 0)
      : subtotalCents - discountCents + taxCents;

    const productId = toNullableString(item.productId ?? body.productId);
    const variantId = toNullableString(item.variantId ?? body.variantId);

    const productNameSnapshot = toStringSafe(item.productNameSnapshot).trim();
    const variantNameSnapshot = toNullableString(item.variantNameSnapshot);
    const skuSnapshot = toNullableString(item.skuSnapshot);
    const imageSnapshot = toNullableString(item.imageSnapshot);

    const customerNameSnapshot = toNullableString(body.customerNameSnapshot);
    const customerEmailSnapshot = toNullableString(body.customerEmailSnapshot);
    const customerPhoneSnapshot = toNullableString(body.customerPhoneSnapshot);

    const shipToName = toNullableString(body.shipToName);
    const shipToPhone = toNullableString(body.shipToPhone);
    const shipAddr1 = toNullableString(body.shipAddr1);
    const shipAddr2 = toNullableString(body.shipAddr2);
    const shipCity = toNullableString(body.shipCity);
    const shipRegion = toNullableString(body.shipRegion);
    const shipPostal = toNullableString(body.shipPostal);
    const shipCountry = toNullableString(body.shipCountry);

    const notes = toNullableString(body.notes);
    const internalNotes = toNullableString(body.internalNotes);

    const ipAddress = getClientIp(req);
    const userAgent = toNullableString(req.headers.get("user-agent"));

    const result = await prisma.$transaction(async (tx) => {
      let order = await tx.order.findFirst({
        where: {
          siteId,
          customerId: customerId ?? null,
          status: OrderStatus.DRAFT,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!order && !customerId) {
        order = await tx.order.findFirst({
          where: {
            siteId,
            customerId: null,
            status: OrderStatus.DRAFT,
            deletedAt: null,
            ...(ipAddress ? { ipAddress } : {}),
          },
          orderBy: { createdAt: "desc" },
        });
      }

      if (!order) {
        order = await tx.order.create({
          data: {
            siteId,
            customerId,
            orderNumber: buildOrderNumber(),
            status: OrderStatus.DRAFT,
            paymentStatus: PaymentStatus.UNPAID,
            fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
            currency,
            subtotalCents: 0,
            discountCents: 0,
            shippingCents: 0,
            taxCents: 0,
            totalCents: 0,
            customerNameSnapshot,
            customerEmailSnapshot,
            customerPhoneSnapshot,
            shipToName,
            shipToPhone,
            shipAddr1,
            shipAddr2,
            shipCity,
            shipRegion,
            shipPostal,
            shipCountry,
            source,
            ipAddress,
            userAgent,
            notes,
            internalNotes,
          },
        });
      } else {
        order = await tx.order.update({
          where: { id: order.id },
          data: {
            customerNameSnapshot: customerNameSnapshot ?? order.customerNameSnapshot,
            customerEmailSnapshot: customerEmailSnapshot ?? order.customerEmailSnapshot,
            customerPhoneSnapshot: customerPhoneSnapshot ?? order.customerPhoneSnapshot,
            shipToName: shipToName ?? order.shipToName,
            shipToPhone: shipToPhone ?? order.shipToPhone,
            shipAddr1: shipAddr1 ?? order.shipAddr1,
            shipAddr2: shipAddr2 ?? order.shipAddr2,
            shipCity: shipCity ?? order.shipCity,
            shipRegion: shipRegion ?? order.shipRegion,
            shipPostal: shipPostal ?? order.shipPostal,
            shipCountry: shipCountry ?? order.shipCountry,
            source: source ?? order.source,
            ipAddress: ipAddress ?? order.ipAddress,
            userAgent: userAgent ?? order.userAgent,
            notes: notes ?? order.notes,
            internalNotes: internalNotes ?? order.internalNotes,
          },
        });
      }

      const existingOrderItem = await tx.orderItem.findFirst({
        where: {
          orderId: order.id,
          siteId,
          deletedAt: null,
          ...(productId ? { productId } : {}),
          ...(variantId ? { variantId } : {}),
        },
      });

      if (existingOrderItem) {
        const nextQty = existingOrderItem.qty + qty;
        const nextSubtotalCents = unitPriceCents * nextQty;
        const nextDiscountCents = existingOrderItem.discountCents + discountCents;
        const nextTaxCents = existingOrderItem.taxCents + taxCents;
        const nextTotalCents = nextSubtotalCents - nextDiscountCents + nextTaxCents;

        await tx.orderItem.update({
          where: { id: existingOrderItem.id },
          data: {
            productNameSnapshot,
            variantNameSnapshot,
            skuSnapshot,
            imageSnapshot,
            qty: nextQty,
            unitPriceCents,
            subtotalCents: nextSubtotalCents,
            discountCents: nextDiscountCents,
            taxCents: nextTaxCents,
            totalCents: nextTotalCents,
          },
        });
      } else {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            siteId,
            productId,
            variantId,
            productNameSnapshot,
            variantNameSnapshot,
            skuSnapshot,
            imageSnapshot,
            qty,
            unitPriceCents,
            subtotalCents,
            discountCents,
            taxCents,
            totalCents,
          },
        });
      }

      return recalculateOrderTotals(tx, order.id);
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Đã thêm sản phẩm vào order.",
        siteId,
        resolvedBy: siteResolved.resolvedBy,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/v1/order error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 },
    );
  }
}
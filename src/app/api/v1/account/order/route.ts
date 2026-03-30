import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCustomerFromSession } from "@/lib/auth/getCustomerFromSession";

type AccountOrderTab = "all" | "pending" | "shipping" | "delivering" | "done" | "cancelled" | "refund";

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function formatCurrency(amountCents: number, currency = "VND"): string {
  const value = amountCents / 100;

  if (currency === "VND") {
    return `${Math.round(value).toLocaleString("en-US")}₫`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

function mapOrderStatusLabel(orderStatus: string, paymentStatus: string, fulfillmentStatus: string): string {
  if (orderStatus === "CANCELLED") return "Cancelled";
  if (paymentStatus === "REFUNDED") return "Refunded";
  if (orderStatus === "COMPLETED") return "Completed";
  if (fulfillmentStatus === "FULFILLED") return "Delivered";
  if (fulfillmentStatus === "PARTIALLY_FULFILLED") return "Shipping";
  if (orderStatus === "DRAFT") return "Pending Payment";
  if (paymentStatus === "UNPAID" || paymentStatus === "PENDING") {
    return "Pending Payment";
  }

  return "Processing";
}

function mapDeliveryText(orderStatus: string, fulfillmentStatus: string): string {
  if (orderStatus === "DRAFT") {
    return "Your order is waiting for payment";
  }

  switch (fulfillmentStatus) {
    case "FULFILLED":
      return "Your order has been delivered successfully";
    case "PARTIALLY_FULFILLED":
      return "Your order is being shipped";
    case "UNFULFILLED":
      return "Your order is being processed";
    case "CANCELLED":
      return "Your order has been cancelled";
    default:
      return "Your order is being processed";
  }
}

function mapTabToWhere(tab: AccountOrderTab): Prisma.OrderWhereInput {
  switch (tab) {
    case "pending":
      return {
        OR: [{ paymentStatus: "UNPAID" }, { paymentStatus: "PENDING" }, { status: "DRAFT" }],
      };

    case "shipping":
      return {
        fulfillmentStatus: {
          in: ["UNFULFILLED", "PARTIALLY_FULFILLED"],
        },
        status: {
          notIn: ["CANCELLED", "DRAFT"],
        },
      };

    case "delivering":
      return {
        fulfillments: {
          some: {
            status: {
              in: ["IN_TRANSIT", "OUT_FOR_DELIVERY"],
            },
          },
        },
      };

    case "done":
      return {
        OR: [{ status: "COMPLETED" }, { fulfillmentStatus: "FULFILLED" }],
      };

    case "cancelled":
      return {
        OR: [{ status: "CANCELLED" }, { paymentStatus: "CANCELED" }, { fulfillmentStatus: "CANCELLED" }],
      };

    case "refund":
      return {
        OR: [
          { paymentStatus: "REFUNDED" },
          {
            payments: {
              some: {
                direction: "REFUND",
                status: "SUCCEEDED",
              },
            },
          },
        ],
      };

    case "all":
    default:
      return {};
  }
}

async function buildSummary(siteId: string, customerId: string) {
  const baseWhere: Prisma.OrderWhereInput = {
    siteId,
    customerId,
    deletedAt: null,
  };

  const [all, pending, shipping, delivering, done, cancelled, refund] = await Promise.all([
    prisma.order.count({ where: baseWhere }),
    prisma.order.count({ where: { ...baseWhere, ...mapTabToWhere("pending") } }),
    prisma.order.count({ where: { ...baseWhere, ...mapTabToWhere("shipping") } }),
    prisma.order.count({ where: { ...baseWhere, ...mapTabToWhere("delivering") } }),
    prisma.order.count({ where: { ...baseWhere, ...mapTabToWhere("done") } }),
    prisma.order.count({ where: { ...baseWhere, ...mapTabToWhere("cancelled") } }),
    prisma.order.count({ where: { ...baseWhere, ...mapTabToWhere("refund") } }),
  ]);

  return {
    all,
    pending,
    shipping,
    delivering,
    done,
    cancelled,
    refund,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const siteId = searchParams.get("siteId")?.trim();
    const keyword = searchParams.get("keyword")?.trim() || "";
    const tab = (searchParams.get("tab")?.trim() || "all") as AccountOrderTab;

    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 10), 50);
    const skip = (page - 1) * limit;

    if (!siteId) {
      return NextResponse.json(
        {
          success: false,
          message: "siteId is required",
        },
        { status: 400 },
      );
    }

    const auth = await getCustomerFromSession(req, siteId);

    if (!auth?.customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const customerId = auth.customerId;

    const where: Prisma.OrderWhereInput = {
      siteId,
      customerId,
      deletedAt: null,
      ...mapTabToWhere(tab),
      ...(keyword
        ? {
            OR: [
              {
                orderNumber: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
              {
                items: {
                  some: {
                    productNameSnapshot: {
                      contains: keyword,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                items: {
                  some: {
                    variantNameSnapshot: {
                      contains: keyword,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [total, orders, summary] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: [{ placedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
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
            take: 3,
          },
          fulfillments: {
            orderBy: {
              createdAt: "desc",
            },
            take: 3,
          },
        },
      }),
      buildSummary(siteId, customerId),
    ]);

    const items = orders.map((order) => {
      const latestFulfillment = order.fulfillments[0];

      return {
        id: order.id,
        code: order.orderNumber,
        deliveryText: mapDeliveryText(order.status, order.fulfillmentStatus),
        statusLabel: mapOrderStatusLabel(order.status, order.paymentStatus, order.fulfillmentStatus),
        totalLabel: "Total",
        totalValue: formatCurrency(order.totalCents, order.currency),
        createdAt: order.createdAt?.toISOString() ?? null,
        placedAt: order.placedAt?.toISOString() ?? null,
        products: order.items.map((item) => ({
          id: item.id,
          title: item.productNameSnapshot,
          variant: item.variantNameSnapshot ?? "",
          quantity: item.qty,
          image: item.imageSnapshot ?? "/assets/images/logo.jpg",
          price: formatCurrency(item.totalCents, order.currency),
          originalPrice: item.unitPriceCents > 0 ? formatCurrency(item.unitPriceCents * item.qty, order.currency) : "",
          tag: "",
        })),
        primaryActionLabel:
          order.paymentStatus === "UNPAID" || order.paymentStatus === "FAILED" ? "Pay Now" : "Buy Again",
        primaryActionHref:
          order.paymentStatus === "UNPAID" || order.paymentStatus === "FAILED" ? `/checkout/${order.id}` : "/products",
        detailActionLabel: "View Details",
        detailActionHref: `/account/orders/${order.id}`,
        supportActionLabel: "Contact Support",
        supportActionHref: latestFulfillment?.trackingUrl || "/support",
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          summary,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

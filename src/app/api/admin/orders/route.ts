// app/api/admin/orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus, PaymentStatus } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 100);

    const search = searchParams.get("search")?.trim() || "";

    const status = searchParams.get("status") as OrderStatus | null;

    const paymentStatus = searchParams.get("paymentStatus") as PaymentStatus | null;

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const sortBy = searchParams.get("sortBy") || "createdAt";

    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const siteId = req.headers.get("x-site-id") || searchParams.get("siteId") || "default-site";

    const where: Prisma.OrderWhereInput = {
      siteId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          orderNumber: {
            contains: search,
          },
        },
        {
          customerNameSnapshot: {
            contains: search,
          },
        },
        {
          customerEmailSnapshot: {
            contains: search,
          },
        },
        {
          customerPhoneSnapshot: {
            contains: search,
          },
        },
      ];
    }

    if (status && Object.values(OrderStatus).includes(status)) {
      where.status = status;
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
      where.paymentStatus = paymentStatus;
    }

    if (from || to) {
      where.createdAt = {};

      if (from) {
        where.createdAt.gte = new Date(from);
      }

      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    const skip = (page - 1) * limit;

    const allowedSortFields = ["createdAt", "totalCents", "orderNumber", "status", "paymentStatus"];

    const orderBy: Prisma.OrderOrderByWithRelationInput = allowedSortFields.includes(sortBy)
      ? {
          [sortBy]: sortOrder,
        }
      : {
          createdAt: "desc",
        };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,

        skip,
        take: limit,

        orderBy,

        include: {
          items: {
            select: {
              id: true,
              qty: true,
              totalCents: true,

              productNameSnapshot: true,
              imageSnapshot: true,
              skuSnapshot: true,
            },
          },

          payments: {
            select: {
              id: true,
              status: true,
              method: true,
              amountCents: true,
              occurredAt: true,
            },

            orderBy: {
              occurredAt: "desc",
            },

            take: 1,
          },

          fulfillments: {
            select: {
              id: true,
              status: true,
              trackingNumber: true,
              carrier: true,
            },

            take: 1,
          },
        },
      }),

      prisma.order.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,

      data: orders,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET_ADMIN_ORDERS_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      {
        status: 500,
      },
    );
  }
}

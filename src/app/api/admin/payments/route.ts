import { NextRequest, NextResponse } from "next/server";

import { PaymentMethod, PaymentTxStatus } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = Number(searchParams.get("page") || 1);

    const limit = Number(searchParams.get("limit") || 10);

    const status = searchParams.get("status");

    const method = searchParams.get("method");

    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where = {
      ...(status && {
        status: status as PaymentTxStatus,
      }),

      ...(method && {
        method: method as PaymentMethod,
      }),

      ...(search && {
        OR: [
          {
            providerTransactionId: {
              contains: search,
              mode: "insensitive" as const,
            },
          },

          {
            order: {
              orderNumber: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,

        include: {
          order: true,
        },

        orderBy: {
          occurredAt: "desc",
        },

        skip,
        take: limit,
      }),

      prisma.payment.count({
        where,
      }),
    ]);

    return NextResponse.json({
      data: payments,

      pagination: {
        page,
        limit,
        total,

        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch payments",
      },
      {
        status: 500,
      },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Params = Promise<{
  id: string;
}>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const siteId = req.headers.get("x-site-id");

    if (!siteId) {
      return NextResponse.json(
        {
          success: false,
          message: "Site id is required",
        },
        {
          status: 400,
        },
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        siteId,
        deletedAt: null,
      },

      include: {
        items: true,

        payments: true,

        fulfillments: true,

        timelines: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,

      data: order,
    });
  } catch (error) {
    console.error("[GET_ORDER_INVOICE_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch invoice",
      },
      {
        status: 500,
      },
    );
  }
}

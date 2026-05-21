import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{
  id: string;
}>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const siteId = req.headers.get("x-site-id") || "default-site";

    const order = await prisma.order.findFirst({
      where: {
        id,
        siteId,
        deletedAt: null,
      },

      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },

        payments: {
          orderBy: {
            occurredAt: "desc",
          },
        },

        fulfillments: {
          include: {
            items: {
              include: {
                orderItem: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        timelines: {
          orderBy: {
            createdAt: "desc",
          },
        },

        returns: {
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
    console.error("[GET_ADMIN_ORDER_BY_ID_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
      },
      {
        status: 500,
      },
    );
  }
}

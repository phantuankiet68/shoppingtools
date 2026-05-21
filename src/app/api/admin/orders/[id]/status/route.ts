// app/api/admin/orders/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { OrderStatus, PaymentStatus, FulfillmentStatus } from "@/generated/prisma";

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["PENDING"],

  PENDING: ["CONFIRMED", "CANCELLED"],

  CONFIRMED: ["PACKING", "CANCELLED"],

  PACKING: ["SHIPPING", "CANCELLED"],

  SHIPPING: ["DELIVERED"],

  DELIVERED: ["COMPLETED", "REFUNDED"],

  COMPLETED: ["REFUNDED"],

  CANCELLED: [],

  REFUNDED: [],
};

type Params = Promise<{
  id: string;
}>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const body = await req.json();

    const status = body.status as OrderStatus;

    const note = body.note || null;

    const adminId = body.adminId || null;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status",
        },
        {
          status: 400,
        },
      );
    }

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

    const allowedTransitions = ORDER_TRANSITIONS[order.status] || [];

    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot transition from ${order.status} to ${status}`,
        },
        {
          status: 400,
        },
      );
    }

    const now = new Date();

    const updateData: Record<string, unknown> = {
      status,
    };

    switch (status) {
      case "CONFIRMED":
        updateData.confirmedAt = now;
        updateData.confirmedBy = adminId;
        break;

      case "PACKING":
        updateData.packedAt = now;
        break;

      case "SHIPPING":
        updateData.shippedAt = now;
        updateData.fulfillmentStatus = FulfillmentStatus.PARTIALLY_FULFILLED;
        break;

      case "DELIVERED":
        updateData.deliveredAt = now;
        updateData.fulfillmentStatus = FulfillmentStatus.FULFILLED;
        break;

      case "COMPLETED":
        updateData.completedAt = now;
        break;

      case "CANCELLED":
        updateData.cancelledAt = now;
        updateData.cancelledBy = adminId;
        break;

      case "REFUNDED":
        updateData.refundedAt = now;
        updateData.refundedBy = adminId;
        updateData.paymentStatus = PaymentStatus.REFUNDED;
        break;
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: {
          id,
        },

        data: updateData,
      });

      await tx.orderTimeline.create({
        data: {
          orderId: id,

          action: "ORDER_STATUS_CHANGED",

          message: note,

          fromValue: order.status,

          toValue: status,

          createdBy: adminId,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",

      data: updatedOrder,
    });
  } catch (error) {
    console.error("[PATCH_ADMIN_ORDER_STATUS_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order status",
      },
      {
        status: 500,
      },
    );
  }
}

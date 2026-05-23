import { NextResponse } from "next/server";

import { PaymentStatus, PaymentTxStatus } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { paymentId } = await params;

    const payment = await prisma.payment.update({
      where: {
        id: paymentId,
      },

      data: {
        status: PaymentTxStatus.SUCCEEDED,
      },
    });

    await prisma.order.update({
      where: {
        id: payment.orderId,
      },

      data: {
        paymentStatus: PaymentStatus.PAID,

        paidAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,

      message: "Payment confirmed",
    });
  } catch (error) {
    console.error("Confirm Payment Error:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Failed to confirm payment",
      },
      {
        status: 500,
      },
    );
  }
}

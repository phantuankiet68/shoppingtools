import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  const { paymentId } = await params;

  const payment = await prisma.payment.update({
    where: {
      id: paymentId,
    },

    data: {
      status: "REFUNDED",
    },
  });

  await prisma.order.update({
    where: {
      id: payment.orderId,
    },

    data: {
      paymentStatus: "REFUNDED",
      refundedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
  });
}

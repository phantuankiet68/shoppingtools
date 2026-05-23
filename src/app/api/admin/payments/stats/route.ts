import { NextResponse } from "next/server";

import { PaymentTxStatus } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: true,
      },
    });

    const totalRevenue = payments
      .filter((payment) => payment.status === PaymentTxStatus.SUCCEEDED)
      .reduce((sum, payment) => sum + payment.amountCents, 0);

    const paidOrders = new Set(
      payments.filter((payment) => payment.status === PaymentTxStatus.SUCCEEDED).map((payment) => payment.orderId),
    );

    const failedOrders = new Set(
      payments
        .filter(
          (payment) =>
            payment.status === PaymentTxStatus.FAILED ||
            payment.status === PaymentTxStatus.REFUNDED ||
            payment.status === PaymentTxStatus.CANCELED,
        )
        .map((payment) => payment.orderId),
    );

    const paymentMethods = payments.reduce(
      (acc, payment) => {
        acc[payment.method] = (acc[payment.method] || 0) + 1;

        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({
      totalRevenue,

      totalTransactions: payments.length,

      paidOrders: paidOrders.size,

      failedOrders: failedOrders.size,

      paymentMethods,
    });
  } catch (error) {
    console.error("Stats API Error:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Failed to fetch payment stats",
      },
      {
        status: 500,
      },
    );
  }
}

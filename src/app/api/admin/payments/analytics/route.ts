import { NextResponse } from "next/server";

import { PaymentTxStatus } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: PaymentTxStatus.SUCCEEDED,
      },

      orderBy: {
        occurredAt: "asc",
      },
    });

    const monthlyRevenue: Record<string, number> = {};

    for (const payment of payments) {
      const month = new Date(payment.occurredAt).toLocaleDateString("en-US", {
        month: "short",
      });

      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + payment.amountCents;
    }

    return NextResponse.json({
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Analytics Error:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Failed to fetch analytics",
      },
      {
        status: 500,
      },
    );
  }
}

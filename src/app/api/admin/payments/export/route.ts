import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: {
      order: true,
    },
  });

  const headers = ["Order Number", "Method", "Status", "Amount", "Transaction ID"];

  const rows = payments.map((payment) => [
    payment.order?.orderNumber,
    payment.method,
    payment.status,
    payment.amountCents,
    payment.providerTransactionId,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",

      "Content-Disposition": 'attachment; filename="payments.csv"',
    },
  });
}

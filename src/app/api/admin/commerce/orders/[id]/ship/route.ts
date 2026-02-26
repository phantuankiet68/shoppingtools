import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/orders/[id]/ship
export async function POST(_req: NextRequest, { params }: Params) {
  await requireAdminAuthUser();

  const { id } = await params;

  // TODO: thay logic ship thật của bạn ở đây
  // Ví dụ: set fulfillmentStatus = "SHIPPED"
  const updated = await prisma.order.update({
    where: { id },
    data: {
      fulfillmentStatus: "SHIPPED",
      shippedAt: new Date(),
    } as any,
    select: { id: true },
  });

  return NextResponse.json({ ok: true, data: updated });
}

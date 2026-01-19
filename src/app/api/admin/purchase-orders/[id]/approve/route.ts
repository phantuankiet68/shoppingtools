import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { isUnauthorized } from "@/lib/errors/errors";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminAuthUser();

    const po = await prisma.purchaseOrder.findFirst({
      where: { id: params.id, userId: admin.id },
      include: { lines: true },
    });

    if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (po.status !== "DRAFT") return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    if (po.lines.length === 0) return NextResponse.json({ error: "PO must have at least one line" }, { status: 400 });

    const updated = await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (isUnauthorized(e)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

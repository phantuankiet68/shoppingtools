import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { isUnauthorized } from "@/lib/errors/errors";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const supplierId = searchParams.get("supplierId");

    const data = await prisma.purchaseOrder.findMany({
      where: {
        userId,
        ...(status ? { status: status as any } : {}),
        ...(supplierId ? { supplierId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        supplier: { select: { id: true, name: true } },
        lines: true,
      },
    });

    return NextResponse.json({ data });
  } catch (e: any) {
    if (isUnauthorized(e)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
export async function POST() {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    // generate PO number (simple, per-user)
    const count = await prisma.purchaseOrder.count({ where: { userId } });
    const number = `PO-${String(count + 1).padStart(5, "0")}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        userId,
        number,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ data: po }, { status: 201 });
  } catch (e: any) {
    if (isUnauthorized(e)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

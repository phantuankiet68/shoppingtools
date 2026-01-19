import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { isUnauthorized } from "@/lib/errors/errors";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminAuthUser();

    const po = await prisma.purchaseOrder.findFirst({
      where: { id: params.id, userId: admin.id },
      include: {
        supplier: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: po });
  } catch (e: any) {
    if (isUnauthorized(e)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminAuthUser();
    const body = await req.json();

    const po = await prisma.purchaseOrder.findFirst({
      where: { id: params.id, userId: admin.id },
    });
    if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (po.status !== "DRAFT") return NextResponse.json({ error: "Only DRAFT PO can be edited" }, { status: 400 });

    const updated = await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: {
        supplierId: body.supplierId,
        currency: body.currency,
        expectedAt: body.expectedAt ? new Date(body.expectedAt) : undefined,
        notes: body.notes,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (isUnauthorized(e)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

// ✅ Next 16 validator expects params to be Promise
type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/customers/[id]
 * Returns:
 * - customer
 * - stats: totalOrders, totalSpentCents, lastOrderAt
 * - recentOrders: last 20 orders
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        tags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // address fields (nếu có) add ở đây
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    // Stats from Order table
    const [agg, lastOrder, recentOrders] = await Promise.all([
      prisma.order.aggregate({
        where: { userId, customerId: id },
        _count: { id: true },
        _sum: { totalCents: true },
      }),
      prisma.order.findFirst({
        where: { userId, customerId: id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { createdAt: true },
      }),
      prisma.order.findMany({
        where: { userId, customerId: id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 20,
        select: {
          id: true,
          number: true,
          reference: true,
          status: true,
          paymentStatus: true,
          fulfillmentStatus: true,
          currency: true,
          subtotalCents: true,
          discountCents: true,
          shippingCents: true,
          taxCents: true,
          totalCents: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { items: true } },
        },
      }),
    ]);

    const stats = {
      totalOrders: agg._count.id,
      totalSpentCents: agg._sum.totalCents || 0,
      lastOrderAt: lastOrder?.createdAt || null,
    };

    return NextResponse.json({ data: { customer, stats, recentOrders } });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/customers/[id]
 * Body can include:
 * { name?, phone?, email?, notes?, tags?, isActive?, address... }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const { id } = await params;

    const body = await req.json();

    // Ensure it belongs to this user
    const exists = await prisma.customer.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const data: any = {};
    if (typeof body.name === "string") data.name = body.name.trim();
    if (body.phone === null || typeof body.phone === "string") data.phone = body.phone ? body.phone.trim() : null;
    if (body.email === null || typeof body.email === "string")
      data.email = body.email ? body.email.trim().toLowerCase() : null;

    if (body.notes === null || typeof body.notes === "string") data.notes = body.notes;
    if (body.tags === null || typeof body.tags === "string") data.tags = body.tags;
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;

    // If you added address fields, map them here too:
    // for (const k of ["address1","address2","city","state","postal","country"]) {
    //   if (body[k] === null || typeof body[k] === "string") data[k] = body[k] ? String(body[k]) : null;
    // }

    const updated = await prisma.customer.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        tags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "DUPLICATE_CUSTOMER" }, { status: 409 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Soft delete -> isActive=false (safer than hard delete)
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!customer) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const updated = await prisma.customer.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true, updatedAt: true },
    });

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

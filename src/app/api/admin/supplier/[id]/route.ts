import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function cleanText(v: unknown, max = 2000) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

async function ensureSupplierBelongsToUser(userId: string, supplierId: string) {
  const s = await prisma.supplier.findFirst({
    where: { id: supplierId, userId },
    select: { id: true },
  });
  return !!s;
}

/**
 * GET /api/admin/supplier/[id]
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await params;

    const item = await prisma.supplier.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { receipts: true } },
      },
    });

    if (!item) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

    return NextResponse.json({ item: { ...item, receiptsCount: item._count.receipts } });
  } catch (e: any) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/supplier/[id]
 * body: { name?, email?, phone?, address? }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await params;

    const ok = await ensureSupplierBelongsToUser(userId, id);
    if (!ok) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const data: any = {};
    if (body.name !== undefined) {
      const name = String(body.name ?? "").trim();
      if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      data.name = name;
    }
    if (body.email !== undefined) data.email = cleanText(body.email, 200);
    if (body.phone !== undefined) data.phone = cleanText(body.phone, 50);
    if (body.address !== undefined) data.address = cleanText(body.address, 500);

    const item = await prisma.supplier.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { receipts: true } },
      },
    });

    return NextResponse.json({ item: { ...item, receiptsCount: item._count.receipts } });
  } catch (e: any) {
    console.error("[PATCH /api/admin/supplier/[id]] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Supplier name already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/supplier/[id]
 * Note: receipts.supplierId will be set null due to relation onDelete:SetNull
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await params;

    const ok = await ensureSupplierBelongsToUser(userId, id);
    if (!ok) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

    await prisma.supplier.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    console.error("[DELETE /api/admin/supplier/[id]] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

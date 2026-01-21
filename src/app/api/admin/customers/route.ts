import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

/**
 * GET /api/admin/customers
 * Query:
 * - q: search name/phone/email
 * - isActive: "true" | "false"
 * - cursor: last id
 * - take: number (default 20, max 100)
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const isActiveRaw = url.searchParams.get("isActive");
    const cursor = url.searchParams.get("cursor");

    const takeRaw = Number(url.searchParams.get("take") || 20);
    const take = Math.max(1, Math.min(100, Math.trunc(takeRaw)));

    const where: any = {
      userId,
      ...(isActiveRaw === "true" ? { isActive: true } : {}),
      ...(isActiveRaw === "false" ? { isActive: false } : {}),
    };

    if (q) {
      // MySQL: contains + mode insensitive is fine in Prisma (maps to collation)
      where.OR = [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }];
    }

    const rows = await prisma.customer.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
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
        // count orders (cheap + useful)
        _count: { select: { orders: true } },
      },
    });

    const hasMore = rows.length > take;
    const data = hasMore ? rows.slice(0, take) : rows;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    // Optional: small aggregate stats for header cards
    // (These are separate queries; remove if you want faster)
    const [total, active] = await Promise.all([prisma.customer.count({ where: { userId } }), prisma.customer.count({ where: { userId, isActive: true } })]);

    return NextResponse.json({ data, nextCursor, stats: { total, active } });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * POST /api/admin/customers
 * Body:
 * {
 *   name: string
 *   phone?: string
 *   email?: string
 *   notes?: string
 *   tags?: string
 *   isActive?: boolean
 *   // optional address fields if your model has them
 *   address1?: string ...
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const body = await req.json();

    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const phone = body.phone ? String(body.phone).trim() : null;
    const email = body.email ? String(body.email).trim().toLowerCase() : null;

    const created = await prisma.customer.create({
      data: {
        userId,
        name,
        phone,
        email,
        notes: body.notes ? String(body.notes) : null,
        tags: body.tags ? String(body.tags) : null,
        isActive: typeof body.isActive === "boolean" ? body.isActive : true,

        // If you added address fields to Customer, uncomment:
        // address1: body.address1 ? String(body.address1) : null,
        // address2: body.address2 ? String(body.address2) : null,
        // city: body.city ? String(body.city) : null,
        // state: body.state ? String(body.state) : null,
        // postal: body.postal ? String(body.postal) : null,
        // country: body.country ? String(body.country) : null,
      },
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

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // MySQL unique violations often show up as Prisma error codes:
    // P2002: Unique constraint failed
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "DUPLICATE_CUSTOMER" }, { status: 409 });
    }

    return NextResponse.json({ error: e?.message || "SERVER_ERROR" }, { status: 500 });
  }
}

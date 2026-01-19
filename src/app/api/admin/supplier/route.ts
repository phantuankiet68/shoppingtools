import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function toInt(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function cleanText(v: unknown, max = 2000) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

/**
 * GET /api/admin/supplier
 * query:
 *  q?         search by name/email/phone
 *  sort?      newest|nameasc (default nameasc)
 *  page? pageSize?
 */
export async function GET(req: Request) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const sort = (url.searchParams.get("sort") ?? "nameasc").toLowerCase();

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 500);

    const where: any = { userId };
    if (q) {
      where.OR = [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }];
    }

    const orderBy = sort === "newest" ? ({ createdAt: "desc" } as const) : ({ name: "asc" } as const);

    const [items, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.supplier.count({ where }),
    ]);

    return NextResponse.json({
      items: items.map((s) => ({
        ...s,
        receiptsCount: s._count.receipts,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e: any) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/supplier
 * body: { name*, email?, phone?, address? }
 */
export async function POST(req: Request) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });

    const created = await prisma.supplier.create({
      data: {
        userId,
        name,
        email: cleanText(body.email, 200),
        phone: cleanText(body.phone, 50),
        address: cleanText(body.address, 500),
      },
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

    return NextResponse.json({ item: { ...created, receiptsCount: created._count.receipts } }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/admin/supplier] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Supplier name already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

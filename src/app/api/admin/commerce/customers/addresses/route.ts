import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic"; // tránh cache ở môi trường edge/server

type AdminLike = {
  id: string;
  siteId?: string | null;
  site?: { id: string | null } | null;
  [key: string]: unknown;
};

/**
 * Resolve current siteId for this admin request.
 * Priority:
 * 1) admin.siteId or admin.site?.id (recommended)
 * 2) header: x-site-id
 * 3) query: siteId
 */
function resolveSiteId(req: NextRequest, admin: AdminLike | null) {
  const url = new URL(req.url);
  const siteId = admin?.siteId || admin?.site?.id || req.headers.get("x-site-id") || url.searchParams.get("siteId");
  return siteId ? String(siteId) : "";
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers || {}),
    },
  });
}

/**
 * Chuẩn hoá tags (Customer.tags là Json?)
 * - undefined: không set
 * - null: set DB NULL
 * - value: set JSON value
 */
function normalizeTags(input: unknown): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined {
  if (typeof input === "undefined") return undefined;
  if (input === null) return Prisma.DbNull; // tags là Json? => DB NULL hợp lệ
  return input as Prisma.InputJsonValue;
}

/**
 * GET /api/admin/commerce/customers
 * Query:
 * - q: search name/phone/email
 * - isActive: "true" | "false"
 * - cursor: last id
 * - take: number (default 20, max 100)
 * - siteId: optional (if not available in admin/session) OR send x-site-id header
 */
export async function GET(req: NextRequest) {
  try {
    const admin = (await requireAdminAuthUser()) as AdminLike;
    const userId = admin.id;

    const siteId = resolveSiteId(req, admin);
    if (!siteId) return jsonNoStore({ error: "MISSING_SITE" }, { status: 400 });

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const isActiveRaw = url.searchParams.get("isActive");
    const cursor = url.searchParams.get("cursor");

    const takeRaw = Number(url.searchParams.get("take") || 20);
    const take = Math.max(1, Math.min(100, Math.trunc(takeRaw)));

    const where: Prisma.CustomerWhereInput = {
      siteId,
      ...(isActiveRaw === "true" ? { isActive: true } : {}),
      ...(isActiveRaw === "false" ? { isActive: false } : {}),
    };

    // Nếu business bạn muốn giới hạn theo userId nữa thì bật dòng dưới
    // where.userId = userId;

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
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
        siteId: true,
        userId: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
        tags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true } },
      },
    });

    const hasMore = rows.length > take;
    const data = hasMore ? rows.slice(0, take) : rows;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    const [total, active] = await Promise.all([
      prisma.customer.count({ where: { siteId } }),
      prisma.customer.count({ where: { siteId, isActive: true } }),
    ]);

    return jsonNoStore({ data, nextCursor, stats: { total, active, userId } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "UNAUTHORIZED") return jsonNoStore({ error: "UNAUTHORIZED" }, { status: 401 });
    return jsonNoStore({ error: msg || "SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * POST /api/admin/commerce/customers
 * Body:
 * {
 *   name: string
 *   phone?: string
 *   email?: string
 *   notes?: string
 *   tags?: Json | null   // null = clear tags
 *   isActive?: boolean
 * }
 *
 * Also supports:
 * - header: x-site-id
 * - query: siteId
 * if admin session doesn't provide siteId
 */
export async function POST(req: NextRequest) {
  try {
    const admin = (await requireAdminAuthUser()) as AdminLike;
    const userId = admin.id;

    const siteId = resolveSiteId(req, admin);
    if (!siteId) return jsonNoStore({ error: "MISSING_SITE" }, { status: 400 });

    const body: unknown = await req.json();
    const obj = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    const name = String(obj.name || "").trim();
    if (!name) return jsonNoStore({ error: "NAME_REQUIRED" }, { status: 400 });

    const phone = obj.phone ? String(obj.phone).trim() : null;
    const email = obj.email ? String(obj.email).trim().toLowerCase() : null;

    const tags = normalizeTags(obj.tags);

    const created = await prisma.customer.create({
      data: {
        siteId,
        userId,
        name,
        phone,
        email,
        notes: obj.notes ? String(obj.notes) : null,
        ...(typeof tags === "undefined" ? {} : { tags }),
        isActive: typeof obj.isActive === "boolean" ? (obj.isActive as boolean) : true,
      },
      select: {
        id: true,
        siteId: true,
        userId: true,
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

    return jsonNoStore({ data: created }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "UNAUTHORIZED") return jsonNoStore({ error: "UNAUTHORIZED" }, { status: 401 });

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonNoStore({ error: "DUPLICATE_CUSTOMER" }, { status: 409 });
    }

    return jsonNoStore({ error: msg || "SERVER_ERROR" }, { status: 500 });
  }
}

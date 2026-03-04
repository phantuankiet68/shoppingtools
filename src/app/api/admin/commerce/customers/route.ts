import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type AdminLike = {
  id: string;
  siteId?: string | null;
  site?: { id: string | null } | null;
  [key: string]: unknown;
};

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
 * Resolve siteId for multi-tenant admin APIs.
 * Priority:
 * 1) admin.siteId / admin.site?.id (best)
 * 2) header x-site-id
 * 3) cookie siteId
 * 4) query ?siteId=
 */
function resolveSiteId(req: NextRequest, admin: AdminLike | null) {
  const url = new URL(req.url);

  const fromAdmin = admin?.siteId || admin?.site?.id || "";
  const fromHeader = req.headers.get("x-site-id") || "";
  const fromCookie = req.cookies.get("siteId")?.value || "";
  const fromQuery = url.searchParams.get("siteId") || "";

  const siteId = fromAdmin || fromHeader || fromCookie || fromQuery;

  return {
    siteId: siteId ? String(siteId) : "",
    source: fromAdmin ? "admin" : fromHeader ? "header" : fromCookie ? "cookie" : fromQuery ? "query" : "none",
  };
}

/** Parse boolean query safely */
function parseBool(v: string | null): boolean | undefined {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

/** tags Json? -> Prisma expects InputJsonValue / DbNull, not null */
function normalizeTags(input: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined {
  // if client doesn't send tags => don't touch
  if (input === undefined) return undefined;

  // allow explicit null => set DbNull
  if (input === null) return Prisma.DbNull;

  // primitives/array/object are ok as InputJsonValue
  return input as Prisma.InputJsonValue;
}

export async function GET(req: NextRequest) {
  try {
    const admin = (await requireAdminAuthUser()) as AdminLike;

    const { siteId, source } = resolveSiteId(req, admin);
    if (!siteId) {
      // ✅ Debug cực hữu ích: cho biết vì sao missing
      return jsonNoStore(
        {
          error: "MISSING_SITE",
          debug: {
            source,
            hint: "Provide siteId via admin session, x-site-id header, cookie siteId, or ?siteId=",
          },
        },
        { status: 400 },
      );
    }

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const isActive = parseBool(url.searchParams.get("isActive"));
    const cursor = url.searchParams.get("cursor");

    const takeRaw = Number(url.searchParams.get("take") || 20);
    const take = Math.max(1, Math.min(100, Math.trunc(takeRaw)));

    const where: Prisma.CustomerWhereInput = {
      siteId,
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const rows = await prisma.customer.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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

    return jsonNoStore({
      data,
      nextCursor,
      stats: { total, active },
      // ✅ bạn có thể bỏ field này nếu không muốn lộ
      debug: { siteIdSource: source },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "UNAUTHORIZED") return jsonNoStore({ error: "UNAUTHORIZED" }, { status: 401 });
    return jsonNoStore({ error: msg || "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = (await requireAdminAuthUser()) as AdminLike;

    const { siteId, source } = resolveSiteId(req, admin);
    if (!siteId) {
      return jsonNoStore(
        {
          error: "MISSING_SITE",
          debug: { source },
        },
        { status: 400 },
      );
    }

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
        userId: admin.id,
        name,
        phone,
        email,
        notes: obj.notes ? String(obj.notes) : null,
        ...(tags !== undefined ? { tags } : {}), // ✅ chỉ set khi client gửi
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

    return jsonNoStore({ data: created, debug: { siteIdSource: source } }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "UNAUTHORIZED") return jsonNoStore({ error: "UNAUTHORIZED" }, { status: 401 });

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonNoStore({ error: "DUPLICATE_CUSTOMER" }, { status: 409 });
    }

    return jsonNoStore({ error: msg || "SERVER_ERROR" }, { status: 500 });
  }
}

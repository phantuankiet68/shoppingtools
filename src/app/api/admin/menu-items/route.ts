// app/api/menu-items/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Locale, MenuSetKey } from "@prisma/client";

export const runtime = "nodejs";

const SORT_FIELDS = new Set(["title", "path", "icon", "sortOrder", "createdAt", "updatedAt"] as const);
type SortDir = "asc" | "desc";

function coerceInt(v: string | null, def: number, min?: number, max?: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  if (min != null && n < min) return min;
  if (max != null && n > max) return max;
  return Math.floor(n);
}

function parseSort(url: URL) {
  let field = "sortOrder";
  let dir: SortDir = "asc";
  const sortParam = url.searchParams.get("sort");
  if (sortParam) {
    const [f, d] = sortParam.split(":");
    if (f && SORT_FIELDS.has(f as any)) field = f;
    if ((d ?? "").toLowerCase() === "desc") dir = "desc";
  } else {
    const f = url.searchParams.get("sort[field]");
    const d = url.searchParams.get("sort[dir]");
    if (f && SORT_FIELDS.has(f as any)) field = f;
    if ((d ?? "").toLowerCase() === "desc") dir = "desc";
  }
  return { field, dir };
}

/** Xác định siteId theo thứ tự ưu tiên:
 *  1) query ?siteId=...
 *  2) theo domain từ header (x-site-domain hoặc host)
 *  3) fallback: site đầu tiên trong DB
 */
async function resolveSiteId(req: Request, maybeSiteId?: string | null) {
  // 1) Nếu client gửi siteId hợp lệ
  if (maybeSiteId) {
    const ok = await prisma.site.findUnique({ where: { id: maybeSiteId }, select: { id: true } });
    if (ok) return ok.id;
  }

  // 2) Theo domain
  const h = req.headers;
  const domain = h.get("x-site-domain") ?? h.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (domain) {
    const s = await prisma.site.findUnique({ where: { domain }, select: { id: true } });
    if (s) return s.id;
  }

  // 3) Fallback site đầu tiên
  const first = await prisma.site.findFirst({ select: { id: true }, orderBy: { createdAt: "asc" } });
  if (!first) throw new Error("No Site found. Seed the Site table first.");
  return first.id;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = coerceInt(url.searchParams.get("page"), 1, 1);
    const size = coerceInt(url.searchParams.get("size"), 20, 1, 200);
    const q = url.searchParams.get("q") ?? undefined;

    const localeParam = url.searchParams.get("locale") as Locale | null;
    const locale = localeParam && (Object.values(Locale) as string[]).includes(localeParam) ? (localeParam as Locale) : undefined;

    const setKeyParam = url.searchParams.get("setKey") as MenuSetKey | null;
    const setKey = setKeyParam && (Object.values(MenuSetKey) as string[]).includes(setKeyParam) ? (setKeyParam as MenuSetKey) : undefined;

    const parentIdRaw = url.searchParams.get("parentId");
    const parentId = parentIdRaw && parentIdRaw !== "null" && parentIdRaw !== "" ? parentIdRaw : undefined;

    const lite = url.searchParams.get("lite") === "1";
    const siteIdQuery = url.searchParams.get("siteId");

    // 🔑 Bắt buộc có siteId (tự resolve nếu thiếu)
    const siteId = await resolveSiteId(req, siteIdQuery);

    const { field, dir } = parseSort(url);
    const ci = (value: string) => ({ contains: value, mode: Prisma.QueryMode.insensitive } as const);

    const where: Prisma.MenuItemWhereInput = {
      siteId, // 🔑 ràng buộc theo site
      ...(locale ? { locale } : {}),
      ...(setKey ? { setKey } : {}),
      ...(parentId ? { parentId } : {}),
      ...(q ? { OR: [{ title: ci(q) }, { path: ci(q) }, { icon: ci(q) }] } : {}),
    };

    const orderBy: Prisma.MenuItemOrderByWithRelationInput = { [field]: dir };

    if (lite) {
      const items = await prisma.menuItem.findMany({
        where,
        orderBy,
        take: size, // vẫn tôn trọng size nếu truyền
        select: { id: true, title: true, path: true },
      });
      const liteItems = items.map((m) => ({ id: m.id, label: m.title, path: m.path ?? "/" }));
      return NextResponse.json(liteItems);
    }

    const [total, items] = await Promise.all([
      prisma.menuItem.count({ where }),
      prisma.menuItem.findMany({
        where,
        orderBy,
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize: size,
      pageCount: Math.max(1, Math.ceil(total / size)),
      siteId, // tiện cho client biết đang query site nào
    });
  } catch (e) {
    console.error("GET /api/menu-items error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const siteId = await resolveSiteId(req, body?.siteId); // 🔑 ưu tiên body, fallback domain/first

    const data = {
      siteId, // 🔑 gắn siteId khi tạo
      title: String(body.title ?? "").trim(),
      path: body.path ?? null,
      icon: body.icon ?? null,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      visible: Boolean(body.visible ?? true),
      locale: (body.locale as Locale) ?? "vi",
      parentId: body.parentId ?? null,
      setKey: (body.setKey as MenuSetKey) ?? "home",
    };

    if (!data.title) {
      return NextResponse.json({ error: { title: "Title is required" } }, { status: 400 });
    }

    // (tuỳ chọn) Verify parentId thuộc cùng site
    if (data.parentId) {
      const parent = await prisma.menuItem.findUnique({
        where: { id: data.parentId },
        select: { siteId: true },
      });
      if (!parent || parent.siteId !== siteId) {
        return NextResponse.json({ error: { parentId: "Parent not found in the same site" } }, { status: 400 });
      }
    }

    const created = await prisma.menuItem.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/menu-items error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

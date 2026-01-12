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

function normName(s: unknown) {
  return String(s ?? "").trim();
}

function slugify(input: string) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normSlug(s: unknown, fallbackFromName?: string) {
  const raw = String(s ?? "").trim();
  const base = raw.length ? raw : String(fallbackFromName ?? "");
  const slug = slugify(base);
  return slug.length ? slug : "";
}

/**
 * GET /api/admin/product-categories
 * query:
 *  q?       search name/slug
 *  active?  all|true|false
 *  sort?    newest|nameasc
 *  page? pageSize?
 */
export async function GET(req: Request) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const url = new URL(req.url);

    const q = (url.searchParams.get("q") ?? "").trim();
    const active = (url.searchParams.get("active") ?? "all").toLowerCase();
    const sort = (url.searchParams.get("sort") ?? "newest").toLowerCase();

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1000000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 100);

    const where: any = { userId };

    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    // DB bạn không support mode: "insensitive" => bỏ
    if (q) {
      where.OR = [{ name: { contains: q } }, { slug: { contains: q } }];
    }

    const orderBy = sort === "nameasc" ? { name: "asc" } : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { products: true } },
        },
      }),
      prisma.productCategory.count({ where }),
    ]);

    return NextResponse.json({
      items,
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

export async function POST(req: Request) {
  let userId: string | null = null;

  try {
    // 1) auth
    const user = await requireAdminAuthUser();
    userId = user.id;

    // 2) parse json safely
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 });

    const rawSlug = String(body.slug ?? "").trim();
    const slug = slugify(rawSlug || name);
    if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    const created = await prisma.productCategory.create({
      data: {
        userId,
        name,
        slug,
        isActive,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/admin/product-categories] ERROR:", e);

    // auth lỗi => 401
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // prisma unique
    if (e?.code === "P2002") {
      const target = e?.meta?.target;
      const t = Array.isArray(target) ? target.join(",") : String(target ?? "");
      if (t.includes("slug")) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      if (t.includes("name")) return NextResponse.json({ error: "Name already exists" }, { status: 409 });
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    // prisma validation / missing column / migration issues thường rơi vào đây
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

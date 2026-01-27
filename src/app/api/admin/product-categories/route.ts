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

function cleanText(v: unknown, max = 2000) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

async function ensureParentBelongsToUser(userId: string, parentId: string) {
  const p = await prisma.productCategory.findFirst({
    where: { id: parentId, userId },
    select: { id: true },
  });
  return !!p;
}

async function nextSortForParent(userId: string, parentId: string | null) {
  const max = await prisma.productCategory.aggregate({
    where: { userId, parentId },
    _max: { sort: true },
  });
  const cur = max._max.sort ?? 0;
  return cur + 10;
}

export async function GET(req: Request) {
  let userId: string | null = null;
  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const url = new URL(req.url);

    const q = (url.searchParams.get("q") ?? "").trim();
    const active = (url.searchParams.get("active") ?? "all").toLowerCase();
    const sort = (url.searchParams.get("sort") ?? "sortasc").toLowerCase();

    const tree = url.searchParams.get("tree") === "1";
    const lite = url.searchParams.get("lite") === "1";

    const parentIdRaw = url.searchParams.get("parentId");
    const parentId = parentIdRaw == null || parentIdRaw === "" || parentIdRaw === "null" ? undefined : parentIdRaw;

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1000000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 500);

    const where: any = { userId };

    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    if (q) {
      where.OR = [{ name: { contains: q } }, { slug: { contains: q } }];
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const orderBy = sort === "nameasc" ? ({ name: "asc" } as const) : sort === "newest" ? ({ createdAt: "desc" } as const) : ({ sort: "asc" } as const); // sortasc default

    const skip = tree ? 0 : (page - 1) * pageSize;
    const take = tree ? 5000 : pageSize;

    const [rawItems, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          parentId: true,
          name: true,
          slug: true,
          isActive: true,
          sort: true,
          icon: true,
          coverImage: true,
          seoTitle: true,
          seoDesc: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { products: true } },
        },
      }),
      prisma.productCategory.count({ where }),
    ]);

    let items = rawItems.map((x) => ({
      id: x.id,
      parentId: x.parentId,
      name: x.name,
      slug: x.slug,
      isActive: x.isActive,
      sort: x.sort,
      icon: x.icon,
      coverImage: x.coverImage,
      seoTitle: x.seoTitle,
      seoDesc: x.seoDesc,
      createdAt: x.createdAt,
      updatedAt: x.updatedAt,
      count: x._count.products,
    }));
    if (sort === "countdesc") {
      items = items.slice().sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }
    if (lite) {
      const liteItems = items.map((x) => ({
        id: x.id,
        name: x.name,
        isActive: x.isActive,
        count: x.count,
      }));
      return NextResponse.json({
        items: liteItems,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      });
    }

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
    const user = await requireAdminAuthUser();
    userId = user.id;

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

    const parentIdRaw = body.parentId;
    const parentId = parentIdRaw == null || parentIdRaw === "" || parentIdRaw === "null" ? null : String(parentIdRaw);

    if (parentId) {
      const ok = await ensureParentBelongsToUser(userId, parentId);
      if (!ok) return NextResponse.json({ error: "Parent not found" }, { status: 400 });
    }

    const sort = Number.isFinite(Number(body.sort)) ? Math.trunc(Number(body.sort)) : await nextSortForParent(userId, parentId);

    const created = await prisma.productCategory.create({
      data: {
        userId,
        name,
        slug,
        isActive,
        parentId,
        sort,
        icon: cleanText(body.icon, 64),
        coverImage: cleanText(body.coverImage, 2048),
        seoTitle: cleanText(body.seoTitle, 160),
        seoDesc: cleanText(body.seoDesc, 2000),
      },
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        isActive: true,
        sort: true,
        icon: true,
        coverImage: true,
        seoTitle: true,
        seoDesc: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json(
      {
        item: {
          id: created.id,
          parentId: created.parentId,
          name: created.name,
          slug: created.slug,
          isActive: created.isActive,
          sort: created.sort,
          icon: created.icon,
          coverImage: created.coverImage,
          seoTitle: created.seoTitle,
          seoDesc: created.seoDesc,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          count: created._count.products,
        },
      },
      { status: 201 },
    );
  } catch (e: any) {
    console.error("[POST /api/admin/product-categories] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (e?.code === "P2002") {
      const target = e?.meta?.target;
      const t = Array.isArray(target) ? target.join(",") : String(target ?? "");
      if (t.includes("slug")) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      if (t.includes("name")) return NextResponse.json({ error: "Name already exists" }, { status: 409 });
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

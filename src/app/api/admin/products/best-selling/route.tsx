import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * GET /api/public/products/best-selling
 * Query: active=active|inactive|all, sort=..., page, pageSize
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const active = (searchParams.get("active") ?? "active").toLowerCase();
    const sort = (searchParams.get("sort") ?? "newest").toLowerCase();

    const page = clamp(toInt(searchParams.get("page"), 1), 1, 1000000);
    const pageSize = clamp(toInt(searchParams.get("pageSize"), 50), 1, 200);
    const skip = (page - 1) * pageSize;

    const BEST_SELLING_CATEGORY_ID = "cmlbta7v600077ks40724wp27";

    const where: any = {
      isActive: true,
      categoryId: BEST_SELLING_CATEGORY_ID,
    };

    if (active === "inactive") where.isActive = false;
    if (active === "all") delete where.isActive;

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "name_asc") orderBy = { name: "asc" };
    if (sort === "name_desc") orderBy = { name: "desc" };
    if (sort === "stock_asc") orderBy = { stock: "asc" };
    if (sort === "stock_desc") orderBy = { stock: "desc" };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          costCents: true,
          isActive: true,
          categoryId: true,
          category: { select: { id: true, name: true } },
          images: {
            orderBy: [{ isCover: "desc" }, { sort: "asc" }, { createdAt: "asc" }],
            take: 1,
            select: { id: true, url: true, isCover: true, sort: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      categoryId: BEST_SELLING_CATEGORY_ID,
      items,
      total,
      page,
      pageSize,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

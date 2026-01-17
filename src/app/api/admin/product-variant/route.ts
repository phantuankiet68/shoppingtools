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
 * Optional: nếu Product có các field này thì bật:
 * - hasVariants Boolean
 * - displayPriceCents Int
 * - displayStock Int
 *
 * Nếu bạn CHƯA thêm 3 field trên vào Product -> comment hàm này + các chỗ gọi.
 */
async function recalcProductDisplay(productId: string) {
  const variants = await prisma.productVariant.findMany({
    where: { productId, isActive: true },
    select: { priceCents: true, stock: true },
  });

  const hasVariants = variants.length > 0;
  const displayStock = hasVariants ? variants.reduce((s, v) => s + (v.stock ?? 0), 0) : 0;
  const displayPriceCents = hasVariants ? Math.min(...variants.map((v) => v.priceCents ?? 0)) : 0;

  await prisma.product.update({
    where: { id: productId },
    data: { hasVariants, displayStock, displayPriceCents },
  });
}

async function ensureProductBelongsToUser(userId: string, productId: string) {
  const p = await prisma.product.findFirst({
    where: { id: productId, userId },
    select: { id: true },
  });
  return !!p;
}

/**
 * GET /api/admin/product-variant
 * query:
 *  productId*       required
 *  q?              search sku/name/value1/value2
 *  active?         all|true|false (default all)
 *  sort?           newest|skuasc|stockdesc|priceasc (default newest)
 *  page? pageSize?
 */
export async function GET(req: Request) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const url = new URL(req.url);

    const productId = (url.searchParams.get("productId") ?? "").trim();
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    const ok = await ensureProductBelongsToUser(userId, productId);
    if (!ok) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const q = (url.searchParams.get("q") ?? "").trim();
    const active = (url.searchParams.get("active") ?? "all").toLowerCase();
    const sort = (url.searchParams.get("sort") ?? "newest").toLowerCase();

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1000000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 200);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = { productId };

    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    if (q) {
      where.OR = [{ sku: { contains: q } }, { name: { contains: q } }, { value1: { contains: q } }, { value2: { contains: q } }];
    }

    const orderBy =
      sort === "skuasc" ? ({ sku: "asc" } as const) : sort === "stockdesc" ? ({ stock: "desc" } as const) : sort === "priceasc" ? ({ priceCents: "asc" } as const) : ({ createdAt: "desc" } as const); // newest default

    const [rawItems, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          productId: true,
          name: true,
          sku: true,
          barcode: true,
          priceCents: true,
          costCents: true,
          stock: true,
          isActive: true,
          option1: true,
          value1: true,
          option2: true,
          value2: true,
          createdAt: true,
          updatedAt: true,
          images: {
            orderBy: [{ isCover: "desc" }, { sort: "asc" }],
            select: {
              id: true,
              url: true,
              fileName: true,
              sort: true,
              isCover: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.productVariant.count({ where }),
    ]);

    return NextResponse.json({
      items: rawItems,
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
 * POST /api/admin/product-variant
 * body: { productId*, sku*, name?, barcode?, priceCents?, costCents?, stock?, isActive?, option1?, value1?, option2?, value2? }
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

    const productId = String(body.productId ?? "").trim();
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    const ok = await ensureProductBelongsToUser(userId, productId);
    if (!ok) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const sku = String(body.sku ?? "").trim();
    if (!sku) return NextResponse.json({ error: "sku is required" }, { status: 400 });

    const name = cleanText(body.name, 200);
    const barcode = cleanText(body.barcode, 64);

    const priceCents = Number.isFinite(Number(body.priceCents)) ? Math.max(0, Math.trunc(Number(body.priceCents))) : 0;
    const costCents = Number.isFinite(Number(body.costCents)) ? Math.max(0, Math.trunc(Number(body.costCents))) : 0;
    const stock = Number.isFinite(Number(body.stock)) ? Math.max(0, Math.trunc(Number(body.stock))) : 0;

    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    const created = await prisma.productVariant.create({
      data: {
        productId,
        sku,
        name,
        barcode,
        priceCents,
        costCents,
        stock,
        isActive,
        option1: cleanText(body.option1, 32),
        value1: cleanText(body.value1, 64),
        option2: cleanText(body.option2, 32),
        value2: cleanText(body.value2, 64),
      },
      select: {
        id: true,
        productId: true,
        name: true,
        sku: true,
        barcode: true,
        priceCents: true,
        costCents: true,
        stock: true,
        isActive: true,
        option1: true,
        value1: true,
        option2: true,
        value2: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // optional
    await recalcProductDisplay(productId);

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/admin/product-variant] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (e?.code === "P2002") {
      const target = e?.meta?.target;
      const t = Array.isArray(target) ? target.join(",") : String(target ?? "");
      if (t.includes("sku")) return NextResponse.json({ error: "SKU already exists for this product" }, { status: 409 });
      return NextResponse.json({ error: "Variant already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

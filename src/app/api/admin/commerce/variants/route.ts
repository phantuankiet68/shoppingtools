import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function toInt(v: string | null, fallback: number): number {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function cleanText(v: unknown, max = 2000): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function toDecimal(v: unknown, fallback = "0"): Prisma.Decimal {
  if (v === null || v === undefined || v === "") {
    return new Prisma.Decimal(fallback);
  }

  try {
    return new Prisma.Decimal(v as Prisma.Decimal.Value);
  } catch {
    return new Prisma.Decimal(fallback);
  }
}

function toNullableDecimal(v: unknown): Prisma.Decimal | null {
  if (v === null || v === undefined || v === "") return null;

  try {
    return new Prisma.Decimal(v as Prisma.Decimal.Value);
  } catch {
    return null;
  }
}

type OwnedProduct = {
  id: string;
  siteId: string;
};

async function getOwnedProduct(productId: string): Promise<OwnedProduct | null> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
      // TODO: thêm ownership check thật nếu cần
      // site: { userId: adminUserId },
    },
    select: {
      id: true,
      siteId: true,
    },
  });

  return product;
}

type VariantListWhere = Prisma.ProductVariantWhereInput;

function buildVariantWhere(params: { productId: string; q: string; active: string }): VariantListWhere {
  const { productId, q, active } = params;

  const where: Prisma.ProductVariantWhereInput = {
    productId,
    deletedAt: null,
  };

  if (active === "true") {
    where.isActive = true;
  } else if (active === "false") {
    where.isActive = false;
  }

  if (q) {
    where.OR = [
      { sku: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { barcode: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildVariantOrderBy(sort: string): Prisma.ProductVariantOrderByWithRelationInput {
  if (sort === "skuasc") return { sku: "asc" };
  if (sort === "stockdesc") return { stockQty: "desc" };
  if (sort === "priceasc") return { price: "asc" };
  if (sort === "pricedesc") return { price: "desc" };
  if (sort === "oldest") return { createdAt: "asc" };
  return { createdAt: "desc" };
}

const variantSelect = {
  id: true,
  productId: true,
  siteId: true,
  sku: true,
  title: true,
  isActive: true,
  price: true,
  compareAtPrice: true,
  cost: true,
  stockQty: true,
  barcode: true,
  weight: true,
  length: true,
  width: true,
  height: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  images: {
    orderBy: [{ sortOrder: "asc" as const }],
    select: {
      id: true,
      productId: true,
      variantId: true,
      imageUrl: true,
      sortOrder: true,
      createdAt: true,
    },
  },
} satisfies Prisma.ProductVariantSelect;

/**
 * GET /api/admin/commerce/variants
 * query:
 *  productId*       required
 *  q?               search sku/title/barcode
 *  active?          all|true|false
 *  sort?            newest|oldest|skuasc|stockdesc|priceasc|pricedesc
 *  page?            default 1
 *  pageSize?        default 50
 */
export async function GET(req: Request) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const url = new URL(req.url);

    const productId = (url.searchParams.get("productId") ?? "").trim();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const product = await getOwnedProduct(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const q = (url.searchParams.get("q") ?? "").trim();
    const active = (url.searchParams.get("active") ?? "all").toLowerCase();
    const sort = (url.searchParams.get("sort") ?? "newest").toLowerCase();

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 200);
    const skip = (page - 1) * pageSize;

    const where = buildVariantWhere({ productId, q, active });
    const orderBy = buildVariantOrderBy(sort);

    const [items, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: variantSelect,
      }),
      prisma.productVariant.count({ where }),
    ]);

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: unknown) {
    console.error("[GET /api/admin/commerce/variants] ERROR:", error);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/commerce/variants
 * body:
 * {
 *   productId*,
 *   sku*,
 *   title? | name?,
 *   barcode?,
 *   price? | priceCents?,
 *   compareAtPrice?,
 *   cost? | costCents?,
 *   stockQty? | stock?,
 *   weight?,
 *   length?,
 *   width?,
 *   height?,
 *   isActive?,
 *   isDefault?
 * }
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

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const data = body as Record<string, unknown>;

    const productId = String(data.productId ?? "").trim();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const product = await getOwnedProduct(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const rawSku = String(data.sku ?? "").trim();
    if (!rawSku) {
      return NextResponse.json({ error: "sku is required" }, { status: 400 });
    }

    const sku = rawSku.toUpperCase();
    const title = cleanText(data.title ?? data.name, 200);
    const barcode = cleanText(data.barcode, 64);

    let price: Prisma.Decimal;
    if (data.priceCents !== undefined) {
      const cents = Number(data.priceCents);
      if (!Number.isFinite(cents)) {
        return NextResponse.json({ error: "priceCents must be a number" }, { status: 400 });
      }
      price = new Prisma.Decimal((Math.max(0, Math.trunc(cents)) / 100).toString());
    } else {
      price = toDecimal(data.price, "0");
    }

    const compareAtPrice = toNullableDecimal(data.compareAtPrice);

    let cost: Prisma.Decimal | null;
    if (data.costCents !== undefined) {
      const cents = Number(data.costCents);
      cost = Number.isFinite(cents)
        ? new Prisma.Decimal((Math.max(0, Math.trunc(cents)) / 100).toString())
        : new Prisma.Decimal("0");
    } else {
      cost = toNullableDecimal(data.cost);
    }

    const stockQty =
      data.stock !== undefined || data.stockQty !== undefined
        ? Math.max(0, Math.trunc(Number(data.stock ?? data.stockQty ?? 0)))
        : 0;

    if (!Number.isFinite(stockQty)) {
      return NextResponse.json({ error: "stock must be a number" }, { status: 400 });
    }

    const weight = toNullableDecimal(data.weight);
    const length = toNullableDecimal(data.length);
    const width = toNullableDecimal(data.width);
    const height = toNullableDecimal(data.height);

    const isActive = typeof data.isActive === "boolean" ? data.isActive : true;
    const isDefault = typeof data.isDefault === "boolean" ? data.isDefault : false;

    if (compareAtPrice && compareAtPrice.lt(price)) {
      return NextResponse.json({ error: "compareAtPrice must be greater than or equal to price" }, { status: 400 });
    }

    const existed = await prisma.productVariant.findFirst({
      where: {
        siteId: product.siteId,
        sku,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (existed) {
      if (existed.deletedAt) {
        return NextResponse.json(
          {
            error:
              "SKU already exists in this site (the old variant is soft-deleted). Please use another SKU or restore/update the old variant.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json({ error: "SKU already exists in this site" }, { status: 409 });
    }

    const created = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.productVariant.updateMany({
          where: {
            productId,
            deletedAt: null,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.productVariant.create({
        data: {
          productId,
          siteId: product.siteId,
          sku,
          title,
          isActive,
          price,
          compareAtPrice,
          cost,
          stockQty,
          barcode,
          weight,
          length,
          width,
          height,
          isDefault,
        },
        select: variantSelect,
      });
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/commerce/variants] ERROR:", error);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "SKU already exists in this site" }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

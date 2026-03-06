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
  /**
   * Vì schema bạn đưa không có Product.userId,
   * nên cần kiểm tra ownership qua relation thực tế của Product.
   *
   * Ví dụ phổ biến:
   * - Product thuộc Site
   * - Site có userId / ownerId
   *
   * Hãy sửa phần `where` bên dưới theo schema Product + Site thật của bạn.
   */

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      // Ví dụ 1:
      // site: { userId: adminUserId },

      // Ví dụ 2:
      // site: { ownerId: adminUserId },

      // Tạm thời comment để tránh TS lỗi nếu schema chưa đúng:
    },
    select: {
      id: true,
      siteId: true,
    },
  });

  // TẠM THỜI:
  // Nếu bạn chưa muốn check ownership ở đây thì dùng findUnique/findFirst theo id.
  // Nhưng production nên thay bằng điều kiện ownership thực sự.
  if (!product) {
    const fallback = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, siteId: true },
    });
    return fallback;
  }

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
    where.OR = [{ sku: { contains: q } }, { title: { contains: q } }, { barcode: { contains: q } }];
  }

  return where;
}

function buildVariantOrderBy(sort: string): Prisma.ProductVariantOrderByWithRelationInput {
  if (sort === "skuasc") return { sku: "asc" };
  if (sort === "stockdesc") return { stockQty: "desc" };
  if (sort === "priceasc") return { price: "asc" };
  return { createdAt: "desc" };
}

/**
 * GET /api/admin/product-variant
 * query:
 *  productId*       required
 *  q?               search sku/title/barcode
 *  active?          all|true|false
 *  sort?            newest|skuasc|stockdesc|priceasc
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
        select: {
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
            orderBy: [{ sortOrder: "asc" }],
            select: {
              id: true,
              productId: true,
              variantId: true,
              imageUrl: true,
              sortOrder: true,
              createdAt: true,
            },
          },
          optionLinks: {
            select: {
              variantId: true,
              optionValueId: true,
              optionValue: {
                select: {
                  id: true,
                  optionName: true,
                  optionValue: true,
                },
              },
            },
          },
        },
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
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/product-variant
 * body:
 * {
 *   productId*,
 *   sku*,
 *   title?,
 *   barcode?,
 *   price?,
 *   compareAtPrice?,
 *   cost?,
 *   stockQty?,
 *   weight?,
 *   length?,
 *   width?,
 *   height?,
 *   isActive?,
 *   isDefault?,
 *   optionValueIds?: string[]
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

    // Chuẩn hóa SKU để tránh trùng kiểu abc / ABC / " ABC "
    const sku = rawSku.toUpperCase();

    const title = cleanText(data.title, 200);
    const barcode = cleanText(data.barcode, 64);

    const price = toDecimal(data.price, "0");
    const compareAtPrice = toNullableDecimal(data.compareAtPrice);
    const cost = toNullableDecimal(data.cost);

    const stockQty = Number.isFinite(Number(data.stockQty)) ? Math.max(0, Math.trunc(Number(data.stockQty))) : 0;

    const weight = toNullableDecimal(data.weight);
    const length = toNullableDecimal(data.length);
    const width = toNullableDecimal(data.width);
    const height = toNullableDecimal(data.height);

    const isActive = typeof data.isActive === "boolean" ? data.isActive : true;
    const isDefault = typeof data.isDefault === "boolean" ? data.isDefault : false;

    const optionValueIds = Array.isArray(data.optionValueIds)
      ? data.optionValueIds.map((v) => String(v).trim()).filter(Boolean)
      : [];

    if (compareAtPrice && compareAtPrice.lt(price)) {
      return NextResponse.json({ error: "compareAtPrice must be greater than or equal to price" }, { status: 400 });
    }

    // Check duplicate trước khi create
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
          optionLinks:
            optionValueIds.length > 0
              ? {
                  create: optionValueIds.map((optionValueId) => ({
                    optionValueId,
                  })),
                }
              : undefined,
        },
        select: {
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
          optionLinks: {
            select: {
              variantId: true,
              optionValueId: true,
              optionValue: {
                select: {
                  id: true,
                  optionName: true,
                  optionValue: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/product-variant] ERROR:", error);

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

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

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

type SortKey = "newest" | "oldest" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc" | "sku_asc" | "sku_desc";

function buildVariantOrderBy(sort: SortKey): Prisma.ProductVariantOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ createdAt: "asc" }];
    case "price_asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price_desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "stock_asc":
      return [{ stockQty: "asc" }, { createdAt: "desc" }];
    case "stock_desc":
      return [{ stockQty: "desc" }, { createdAt: "desc" }];
    case "sku_asc":
      return [{ sku: "asc" }];
    case "sku_desc":
      return [{ sku: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
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

/** GET /api/admin/commerce/variants?productId=... */
export async function GET(req: Request) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("productId")?.trim() || "";
    const q = searchParams.get("q")?.trim() || "";
    const sort = (searchParams.get("sort")?.trim() || "newest") as SortKey;

    const pageRaw = Number(searchParams.get("page") || "1");
    const limitRaw = Number(searchParams.get("limit") || "50");

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.trunc(pageRaw) : 1;
    const limit = Number.isFinite(limitRaw) ? Math.min(100, Math.max(1, Math.trunc(limitRaw))) : 50;
    const skip = (page - 1) * limit;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        // TODO: thay bằng ownership check thật của bạn
        // site: { userId },
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const where: Prisma.ProductVariantWhereInput = {
      productId,
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { sku: { contains: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
              { barcode: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const orderBy = buildVariantOrderBy(sort);

    const [items, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: variantSelect,
      }),
      prisma.productVariant.count({
        where,
      }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
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

/** POST /api/admin/commerce/variants */
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

    const dataIn = body as Record<string, unknown>;

    const productId = String(dataIn.productId ?? "").trim();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        // TODO: thay bằng ownership check thật của bạn
        // site: { userId },
      },
      select: {
        id: true,
        siteId: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const sku = String(dataIn.sku ?? "").trim();
    if (!sku) {
      return NextResponse.json({ error: "sku is required" }, { status: 400 });
    }

    const priceCents = Number(dataIn.priceCents ?? 0);
    if (!Number.isFinite(priceCents)) {
      return NextResponse.json({ error: "priceCents must be a number" }, { status: 400 });
    }

    const stock = Number(dataIn.stock ?? 0);
    if (!Number.isFinite(stock)) {
      return NextResponse.json({ error: "stock must be a number" }, { status: 400 });
    }

    const item = await prisma.productVariant.create({
      data: {
        productId: product.id,
        siteId: product.siteId,
        sku,
        title: cleanText(dataIn.name ?? dataIn.title, 200),
        barcode: cleanText(dataIn.barcode, 64),
        isActive: Boolean(dataIn.isActive ?? true),
        price: new Prisma.Decimal((Math.max(0, Math.trunc(priceCents)) / 100).toString()),
        cost: toDecimal(dataIn.costCents !== undefined ? Number(dataIn.costCents) / 100 : 0, "0"),
        stockQty: Math.max(0, Math.trunc(stock)),
      },
      select: variantSelect,
    });

    return NextResponse.json({ item }, { status: 201 });
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

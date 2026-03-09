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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await context.params;
    const variantId = id?.trim();

    if (!variantId) {
      return NextResponse.json({ error: "Variant id is required" }, { status: 400 });
    }

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const dataIn = body as Record<string, unknown>;

    const existing = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const item = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dataIn.sku !== undefined ? { sku: String(dataIn.sku).trim() } : {}),
        ...(dataIn.title !== undefined ? { title: cleanText(dataIn.title, 200) } : {}),
        ...(dataIn.barcode !== undefined ? { barcode: cleanText(dataIn.barcode, 64) } : {}),
        ...(dataIn.isActive !== undefined ? { isActive: Boolean(dataIn.isActive) } : {}),
        ...(dataIn.price !== undefined ? { price: toDecimal(dataIn.price, "0") } : {}),
        ...(dataIn.compareAtPrice !== undefined
          ? { compareAtPrice: dataIn.compareAtPrice == null ? null : toDecimal(dataIn.compareAtPrice, "0") }
          : {}),
        ...(dataIn.cost !== undefined ? { cost: dataIn.cost == null ? null : toDecimal(dataIn.cost, "0") } : {}),
        ...(dataIn.stockQty !== undefined ? { stockQty: Math.max(0, Math.trunc(Number(dataIn.stockQty) || 0)) } : {}),
        ...(dataIn.weight !== undefined
          ? { weight: dataIn.weight == null ? null : toDecimal(dataIn.weight, "0") }
          : {}),
        ...(dataIn.length !== undefined
          ? { length: dataIn.length == null ? null : toDecimal(dataIn.length, "0") }
          : {}),
        ...(dataIn.width !== undefined ? { width: dataIn.width == null ? null : toDecimal(dataIn.width, "0") } : {}),
        ...(dataIn.height !== undefined
          ? { height: dataIn.height == null ? null : toDecimal(dataIn.height, "0") }
          : {}),
        ...(dataIn.isDefault !== undefined ? { isDefault: Boolean(dataIn.isDefault) } : {}),
      },
      select: variantSelect,
    });

    return NextResponse.json({ item });
  } catch (error: unknown) {
    console.error("[PATCH /api/admin/commerce/variants/[id]] ERROR:", error);

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

export async function DELETE(_req: Request, context: RouteContext) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await context.params;
    const variantId = id?.trim();

    if (!variantId) {
      return NextResponse.json({ error: "Variant id is required" }, { status: 400 });
    }

    const existing = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        deletedAt: new Date(),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/commerce/variants/[id]] ERROR:", error);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

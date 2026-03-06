// app/api/admin/product-variant/[id]/route.ts
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

function toNullableDecimal(v: unknown): Prisma.Decimal | null {
  if (v === null || v === undefined || v === "") return null;

  try {
    return new Prisma.Decimal(v as Prisma.Decimal.Value);
  } catch {
    return null;
  }
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

type OwnedVariant = {
  id: string;
  productId: string;
  siteId: string;
};

async function getVariantOwned(id: string, adminUserId: string): Promise<OwnedVariant | null> {
  /**
   * TODO:
   * Schema bạn gửi chưa có đầy đủ Product/Site ownership.
   * Hãy thay phần where bằng relation ownership thật của bạn.
   *
   * Ví dụ nếu Site có userId:
   * where: {
   *   id,
   *   deletedAt: null,
   *   site: { userId: adminUserId },
   * }
   *
   * Ví dụ nếu Site có ownerId:
   * where: {
   *   id,
   *   deletedAt: null,
   *   site: { ownerId: adminUserId },
   * }
   */

  const item = await prisma.productVariant.findFirst({
    where: {
      id,
      deletedAt: null,
      // site: { userId: adminUserId },
    },
    select: {
      id: true,
      productId: true,
      siteId: true,
    },
  });

  void adminUserId; // tránh warning nếu chưa dùng ownership thật
  return item;
}

async function unsetOtherDefaults(productId: string, excludeId: string) {
  await prisma.productVariant.updateMany({
    where: {
      productId,
      deletedAt: null,
      NOT: { id: excludeId },
    },
    data: {
      isDefault: false,
    },
  });
}

/** GET /api/admin/product-variant/:id */
export async function GET(_req: Request, ctx: RouteContext) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await ctx.params;

    const owned = await getVariantOwned(id, userId);
    if (!owned) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const item = await prisma.productVariant.findFirst({
      where: {
        id,
        deletedAt: null,
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
                productId: true,
                optionName: true,
                optionValue: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error: unknown) {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH /api/admin/product-variant/:id */
export async function PATCH(req: Request, ctx: RouteContext) {
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
    const { id } = await ctx.params;

    const owned = await getVariantOwned(id, userId);
    if (!owned) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const data: Prisma.ProductVariantUpdateInput = {};

    if (dataIn.title !== undefined) {
      data.title = cleanText(dataIn.title, 200);
    }

    if (dataIn.sku !== undefined) {
      const sku = String(dataIn.sku ?? "").trim();
      if (!sku) {
        return NextResponse.json({ error: "sku cannot be empty" }, { status: 400 });
      }
      data.sku = sku;
    }

    if (dataIn.barcode !== undefined) {
      data.barcode = cleanText(dataIn.barcode, 64);
    }

    if (dataIn.price !== undefined) {
      data.price = toDecimal(dataIn.price, "0");
    }

    if (dataIn.compareAtPrice !== undefined) {
      data.compareAtPrice = toNullableDecimal(dataIn.compareAtPrice);
    }

    if (dataIn.cost !== undefined) {
      data.cost = toNullableDecimal(dataIn.cost);
    }

    if (dataIn.stockQty !== undefined) {
      const n = Number(dataIn.stockQty);
      if (!Number.isFinite(n)) {
        return NextResponse.json({ error: "stockQty must be a number" }, { status: 400 });
      }
      data.stockQty = Math.max(0, Math.trunc(n));
    }

    if (dataIn.weight !== undefined) {
      data.weight = toNullableDecimal(dataIn.weight);
    }

    if (dataIn.length !== undefined) {
      data.length = toNullableDecimal(dataIn.length);
    }

    if (dataIn.width !== undefined) {
      data.width = toNullableDecimal(dataIn.width);
    }

    if (dataIn.height !== undefined) {
      data.height = toNullableDecimal(dataIn.height);
    }

    if (dataIn.isActive !== undefined) {
      data.isActive = Boolean(dataIn.isActive);
    }

    if (dataIn.isDefault !== undefined) {
      data.isDefault = Boolean(dataIn.isDefault);
    }

    if (
      dataIn.compareAtPrice !== undefined &&
      data.compareAtPrice instanceof Prisma.Decimal &&
      data.price instanceof Prisma.Decimal &&
      data.compareAtPrice.lt(data.price)
    ) {
      return NextResponse.json({ error: "compareAtPrice must be greater than or equal to price" }, { status: 400 });
    }

    const optionValueIds = Array.isArray(dataIn.optionValueIds)
      ? dataIn.optionValueIds.map((v) => String(v).trim()).filter(Boolean)
      : undefined;

    const updated = await prisma.$transaction(async (tx) => {
      if (data.isDefault === true) {
        await unsetOtherDefaults(owned.productId, id);
      }

      if (optionValueIds !== undefined) {
        await tx.productVariantOptionValue.deleteMany({
          where: { variantId: id },
        });
      }

      const item = await tx.productVariant.update({
        where: { id },
        data: {
          ...data,
          optionLinks:
            optionValueIds !== undefined
              ? optionValueIds.length > 0
                ? {
                    create: optionValueIds.map((optionValueId) => ({
                      optionValueId,
                    })),
                  }
                : undefined
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
          deletedAt: true,
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

      return item;
    });

    return NextResponse.json({ item: updated });
  } catch (error: unknown) {
    console.error("[PATCH /api/admin/product-variant/[id]] ERROR:", error);

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

/** DELETE /api/admin/product-variant/:id */
export async function DELETE(_req: Request, ctx: RouteContext) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id } = await ctx.params;

    const owned = await getVariantOwned(id, userId);
    if (!owned) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.productVariantOptionValue.deleteMany({
        where: { variantId: id },
      });

      await tx.productImage.updateMany({
        where: { variantId: id },
        data: { variantId: null },
      });

      await tx.productVariant.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/product-variant/[id]] ERROR:", error);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

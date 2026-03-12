import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const siteId = searchParams.get("siteId")?.trim() || "";
    const q = searchParams.get("q")?.trim() || "";
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where = {
      deletedAt: null,
      ...(siteId ? { siteId } : {}),
      ...(includeInactive ? {} : { isActive: true }),
      ...(q
        ? {
            OR: [
              { sku: { contains: q, mode: "insensitive" as const } },
              { title: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const variants = await prisma.productVariant.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
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
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: variants.map((variant) => ({
        ...variant,
        price: variant.price?.toString() ?? null,
        compareAtPrice: variant.compareAtPrice?.toString() ?? null,
        cost: variant.cost?.toString() ?? null,
        weight: variant.weight?.toString() ?? null,
        length: variant.length?.toString() ?? null,
        width: variant.width?.toString() ?? null,
        height: variant.height?.toString() ?? null,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/inventory/variants error:", error);

    return NextResponse.json(
      {
        error: "Failed to load variants",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const siteId = searchParams.get("siteId");
    const variantId = searchParams.get("variantId");
    const lowStockOnly = searchParams.get("lowStockOnly") === "true";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const where: any = {
      siteId,
    };

    if (variantId) {
      where.variantId = variantId;
    }

    const rows = await prisma.stockLevel.findMany({
      where,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const filteredRows = lowStockOnly
      ? rows.filter((item) => {
          if (item.reorderPoint == null) return false;
          return item.available <= item.reorderPoint;
        })
      : rows;

    const total = await prisma.stockLevel.count({ where });

    return NextResponse.json({
      data: filteredRows,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/inventory/stock-levels error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { siteId, variantId, onHand = 0, reserved = 0, incoming = 0, reorderPoint = null, safetyStock = null } = body;

    if (!siteId || !variantId) {
      return NextResponse.json({ message: "siteId and variantId are required" }, { status: 400 });
    }

    const available = onHand - reserved;

    const stockLevel = await prisma.stockLevel.upsert({
      where: {
        variantId,
      },
      update: {
        onHand,
        reserved,
        available,
        incoming,
        reorderPoint,
        safetyStock,
      },
      create: {
        siteId,
        variantId,
        onHand,
        reserved,
        available,
        incoming,
        reorderPoint,
        safetyStock,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Stock level saved successfully",
      data: stockLevel,
    });
  } catch (error) {
    console.error("POST /api/admin/inventory/stock-levels error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StockMovementType } from "@prisma/client";

function recalcAvailable(onHand: number, reserved: number) {
  return onHand - reserved;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const siteId = searchParams.get("siteId");
    const variantId = searchParams.get("variantId");
    const referenceType = searchParams.get("referenceType");
    const referenceId = searchParams.get("referenceId");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const where: any = { siteId };

    if (variantId) where.variantId = variantId;
    if (referenceType) where.referenceType = referenceType;
    if (referenceId) where.referenceId = referenceId;

    const [rows, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          variant: {
            include: {
              product: true,
            },
          },
          stockLevel: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return NextResponse.json({
      data: rows,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/inventory/stock-movements error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { siteId, variantId, type, quantity, note, referenceType, referenceId, createdBy, metadata } = body as {
      siteId: string;
      variantId: string;
      type: StockMovementType;
      quantity: number;
      note?: string;
      referenceType?: string;
      referenceId?: string;
      createdBy?: string;
      metadata?: any;
    };

    if (!siteId || !variantId || !type || !quantity) {
      return NextResponse.json({ message: "siteId, variantId, type, quantity are required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let stockLevel = await tx.stockLevel.findUnique({
        where: { variantId },
      });

      if (!stockLevel) {
        stockLevel = await tx.stockLevel.create({
          data: {
            siteId,
            variantId,
            onHand: 0,
            reserved: 0,
            available: 0,
            incoming: 0,
          },
        });
      }

      const beforeOnHand = stockLevel.onHand;
      const beforeReserved = stockLevel.reserved;
      const beforeAvailable = stockLevel.available;

      let afterOnHand = beforeOnHand;
      let afterReserved = beforeReserved;

      switch (type) {
        case "ADJUSTMENT_INCREASE":
        case "RESTOCK":
        case "RETURN":
        case "PURCHASE_RECEIPT":
        case "OPENING":
          afterOnHand += quantity;
          break;

        case "ADJUSTMENT_DECREASE":
        case "DAMAGE":
        case "LOSS":
        case "SALE":
          if (beforeOnHand < quantity) {
            throw new Error("Insufficient onHand stock");
          }
          afterOnHand -= quantity;
          break;

        case "RESERVE":
          if (beforeAvailable < quantity) {
            throw new Error("Insufficient available stock");
          }
          afterReserved += quantity;
          break;

        case "RELEASE_RESERVATION":
          if (beforeReserved < quantity) {
            throw new Error("Insufficient reserved stock");
          }
          afterReserved -= quantity;
          break;

        case "MANUAL":
          afterOnHand += quantity;
          break;

        default:
          throw new Error(`Unsupported movement type: ${type}`);
      }

      const afterAvailable = recalcAvailable(afterOnHand, afterReserved);

      const updatedStockLevel = await tx.stockLevel.update({
        where: { variantId },
        data: {
          onHand: afterOnHand,
          reserved: afterReserved,
          available: afterAvailable,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          siteId,
          variantId,
          stockLevelId: updatedStockLevel.id,
          type,
          quantityDelta: quantity,
          beforeOnHand,
          afterOnHand,
          beforeReserved,
          afterReserved,
          beforeAvailable,
          afterAvailable,
          note,
          referenceType,
          referenceId,
          createdBy,
          metadata,
        },
      });

      await tx.productVariant.update({
        where: {
          id: variantId,
        },
        data: {
          stockQty: afterAvailable,
        },
      });

      return {
        stockLevel: updatedStockLevel,
        movement,
      };
    });

    return NextResponse.json({
      message: "Stock movement created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/admin/inventory/stock-movements error:", error);

    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    variantId: string;
  }>;
};

function calcAvailable(onHand: number, reserved: number) {
  return onHand - reserved;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { variantId } = await context.params;
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const stockLevel = await prisma.stockLevel.findFirst({
      where: {
        variantId,
        siteId,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!stockLevel) {
      return NextResponse.json({ message: "Stock level not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: stockLevel,
    });
  } catch (error) {
    console.error("GET /api/admin/inventory/stock-levels/[variantId] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { variantId } = await context.params;
    const body = await req.json();

    const {
      siteId,
      onHand,
      reserved,
      incoming,
      reorderPoint,
      safetyStock,
      note,
      createdBy,
      syncStockQty = true,
    } = body as {
      siteId: string;
      onHand?: number;
      reserved?: number;
      incoming?: number;
      reorderPoint?: number | null;
      safetyStock?: number | null;
      note?: string;
      createdBy?: string;
      syncStockQty?: boolean;
    };

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        siteId,
      },
    });

    if (!variant) {
      return NextResponse.json({ message: "Variant not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let stockLevel = await tx.stockLevel.findUnique({
        where: {
          variantId,
        },
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
            reorderPoint: null,
            safetyStock: null,
          },
        });
      }

      const beforeOnHand = stockLevel.onHand;
      const beforeReserved = stockLevel.reserved;
      const beforeAvailable = stockLevel.available;

      const nextOnHand = onHand ?? stockLevel.onHand;
      const nextReserved = reserved ?? stockLevel.reserved;
      const nextIncoming = incoming ?? stockLevel.incoming;
      const nextAvailable = calcAvailable(nextOnHand, nextReserved);

      if (nextOnHand < 0 || nextReserved < 0 || nextIncoming < 0) {
        throw new Error("onHand, reserved and incoming must be greater than or equal to 0");
      }

      const updatedStockLevel = await tx.stockLevel.update({
        where: {
          variantId,
        },
        data: {
          onHand: nextOnHand,
          reserved: nextReserved,
          available: nextAvailable,
          incoming: nextIncoming,
          reorderPoint: reorderPoint === undefined ? stockLevel.reorderPoint : reorderPoint,
          safetyStock: safetyStock === undefined ? stockLevel.safetyStock : safetyStock,
        },
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      });

      const onHandDiff = nextOnHand - beforeOnHand;
      const reservedDiff = nextReserved - beforeReserved;

      if (onHandDiff !== 0 || reservedDiff !== 0) {
        let movementType: "ADJUSTMENT_INCREASE" | "ADJUSTMENT_DECREASE" | "RESERVE" | "RELEASE_RESERVATION" | "MANUAL" =
          "MANUAL";

        let quantityDelta = 0;

        if (onHandDiff > 0) {
          movementType = "ADJUSTMENT_INCREASE";
          quantityDelta = onHandDiff;
        } else if (onHandDiff < 0) {
          movementType = "ADJUSTMENT_DECREASE";
          quantityDelta = Math.abs(onHandDiff);
        } else if (reservedDiff > 0) {
          movementType = "RESERVE";
          quantityDelta = reservedDiff;
        } else if (reservedDiff < 0) {
          movementType = "RELEASE_RESERVATION";
          quantityDelta = Math.abs(reservedDiff);
        }

        await tx.stockMovement.create({
          data: {
            siteId,
            variantId,
            stockLevelId: updatedStockLevel.id,
            type: movementType,
            quantityDelta,
            beforeOnHand,
            afterOnHand: nextOnHand,
            beforeReserved,
            afterReserved: nextReserved,
            beforeAvailable,
            afterAvailable: nextAvailable,
            referenceType: "MANUAL_STOCK_LEVEL_UPDATE",
            referenceId: variantId,
            note: note ?? "Manual stock level update",
            createdBy,
            metadata: {
              patchedFields: {
                onHand: onHand !== undefined,
                reserved: reserved !== undefined,
                incoming: incoming !== undefined,
                reorderPoint: reorderPoint !== undefined,
                safetyStock: safetyStock !== undefined,
              },
            },
          },
        });
      }

      if (syncStockQty) {
        await tx.productVariant.update({
          where: {
            id: variantId,
          },
          data: {
            stockQty: nextAvailable,
          },
        });
      }

      return updatedStockLevel;
    });

    return NextResponse.json({
      message: "Stock level updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/inventory/stock-levels/[variantId] error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const PROTECTED_REFERENCE_TYPES = new Set([
  "ORDER",
  "ORDER_ITEM",
  "PURCHASE_ORDER",
  "PURCHASE_ORDER_RECEIPT",
  "SYSTEM",
]);

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const movement = await prisma.stockMovement.findFirst({
      where: {
        id,
        siteId,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
        stockLevel: true,
      },
    });

    if (!movement) {
      return NextResponse.json({ message: "Stock movement not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: movement,
    });
  } catch (error) {
    console.error("GET /api/admin/inventory/stock-movement/[id] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");
    const force = searchParams.get("force") === "true";

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const movement = await prisma.stockMovement.findFirst({
      where: {
        id,
        siteId,
      },
      include: {
        stockLevel: true,
      },
    });

    if (!movement) {
      return NextResponse.json({ message: "Stock movement not found" }, { status: 404 });
    }

    if (movement.referenceType && PROTECTED_REFERENCE_TYPES.has(movement.referenceType) && !force) {
      return NextResponse.json(
        {
          message: `Cannot delete protected stock movement with referenceType ${movement.referenceType}`,
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let stockLevel = movement.stockLevel;

      if (!stockLevel) {
        stockLevel = await tx.stockLevel.findUnique({
          where: {
            variantId: movement.variantId,
          },
        });
      }

      if (!stockLevel) {
        throw new Error("Stock level not found for rollback");
      }

      const latestMovement = await tx.stockMovement.findFirst({
        where: {
          siteId,
          variantId: movement.variantId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!latestMovement) {
        throw new Error("No stock movement found for rollback");
      }

      const isLatestMovement = latestMovement.id === movement.id;

      if (!isLatestMovement && !force) {
        throw new Error(
          "Only the latest stock movement can be deleted safely. Pass force=true if you really want to continue.",
        );
      }

      await tx.stockLevel.update({
        where: {
          id: stockLevel.id,
        },
        data: {
          onHand: movement.beforeOnHand,
          reserved: movement.beforeReserved,
          available: movement.beforeAvailable,
        },
      });

      await tx.productVariant.update({
        where: {
          id: movement.variantId,
        },
        data: {
          stockQty: movement.beforeAvailable,
        },
      });

      await tx.stockMovement.delete({
        where: {
          id: movement.id,
        },
      });

      const updatedStockLevel = await tx.stockLevel.findUnique({
        where: {
          id: stockLevel.id,
        },
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      });

      return {
        deletedMovementId: movement.id,
        rolledBackTo: {
          onHand: movement.beforeOnHand,
          reserved: movement.beforeReserved,
          available: movement.beforeAvailable,
        },
        stockLevel: updatedStockLevel,
      };
    });

    return NextResponse.json({
      message: "Stock movement deleted and rolled back successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/inventory/stock-movement/[id] error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 400 });
  }
}

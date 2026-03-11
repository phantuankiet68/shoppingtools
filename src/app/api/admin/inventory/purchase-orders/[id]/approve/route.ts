import { NextRequest, NextResponse } from "next/server";
import { PurchaseOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const APPROVABLE_STATUSES: PurchaseOrderStatus[] = ["DRAFT", "SUBMITTED"];

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      siteId,
      approvedBy,
      note,
      syncIncoming = true,
    } = body as {
      siteId: string;
      approvedBy?: string;
      note?: string;
      syncIncoming?: boolean;
    };

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        siteId,
      },
      include: {
        lines: true,
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json({ message: "Purchase order not found" }, { status: 404 });
    }

    if (!APPROVABLE_STATUSES.includes(purchaseOrder.status)) {
      return NextResponse.json(
        {
          message: `Purchase order in status ${purchaseOrder.status} cannot be approved`,
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPo = await tx.purchaseOrder.update({
        where: {
          id: purchaseOrder.id,
        },
        data: {
          status: "APPROVED",
          approvedBy: approvedBy ?? null,
          note: note ? [purchaseOrder.note, note].filter(Boolean).join("\n") : purchaseOrder.note,
        },
        include: {
          lines: true,
          receipts: {
            include: {
              lines: true,
            },
            orderBy: {
              receivedAt: "desc",
            },
          },
        },
      });

      if (syncIncoming) {
        const remainingByVariant = new Map<string, number>();

        for (const line of purchaseOrder.lines) {
          const remainingQty = Math.max(line.orderedQty - line.receivedQty, 0);
          if (remainingQty <= 0) continue;

          remainingByVariant.set(line.variantId, (remainingByVariant.get(line.variantId) || 0) + remainingQty);
        }

        for (const [variantId, incomingToAdd] of remainingByVariant.entries()) {
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
              },
            });
          }

          await tx.stockLevel.update({
            where: {
              variantId,
            },
            data: {
              incoming: stockLevel.incoming + incomingToAdd,
            },
          });
        }
      }

      return updatedPo;
    });

    return NextResponse.json({
      message: "Purchase order approved successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/admin/inventory/purchase-orders/[id]/approve error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 400 });
  }
}

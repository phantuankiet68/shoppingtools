import { NextRequest, NextResponse } from "next/server";
import { Prisma, PurchaseOrderLineStatus, PurchaseOrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function calcAvailable(onHand: number, reserved: number) {
  return onHand - reserved;
}

function buildReceiptNumber(poNumber: string) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `RCV-${poNumber}-${y}${m}${d}${hh}${mm}${ss}`;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const { siteId, receivedAt, note, createdBy, lines } = body as {
      siteId: string;
      receivedAt?: string;
      note?: string;
      createdBy?: string;
      lines: Array<{
        purchaseOrderLineId: string;
        receivedQty: number;
        unitCost?: number;
        note?: string;
      }>;
    };

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ message: "lines are required" }, { status: 400 });
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

    if (purchaseOrder.status === "CANCELLED") {
      return NextResponse.json({ message: "Cannot receive a cancelled purchase order" }, { status: 400 });
    }

    const poLineMap = new Map(purchaseOrder.lines.map((line) => [line.id, line]));

    for (const line of lines) {
      const poLine = poLineMap.get(line.purchaseOrderLineId);
      if (!poLine) {
        return NextResponse.json(
          { message: `Purchase order line not found: ${line.purchaseOrderLineId}` },
          { status: 400 },
        );
      }

      if (!Number.isInteger(line.receivedQty) || line.receivedQty <= 0) {
        return NextResponse.json(
          { message: `receivedQty must be greater than 0 for line ${line.purchaseOrderLineId}` },
          { status: 400 },
        );
      }

      if (line.receivedQty > poLine.remainingQty) {
        return NextResponse.json(
          {
            message: `receivedQty exceeds remainingQty for line ${line.purchaseOrderLineId}`,
          },
          { status: 400 },
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const receipt = await tx.purchaseOrderReceipt.create({
        data: {
          purchaseOrderId: purchaseOrder.id,
          siteId,
          receiptNumber: buildReceiptNumber(purchaseOrder.poNumber),
          receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
          note,
          createdBy,
        },
      });

      for (const inputLine of lines) {
        const poLine = poLineMap.get(inputLine.purchaseOrderLineId)!;
        const receiveQty = inputLine.receivedQty;

        await tx.purchaseOrderReceiptLine.create({
          data: {
            purchaseOrderReceiptId: receipt.id,
            purchaseOrderLineId: poLine.id,
            siteId,
            variantId: poLine.variantId,
            receivedQty: receiveQty,
            unitCost: inputLine.unitCost !== undefined ? new Prisma.Decimal(inputLine.unitCost) : poLine.unitCost,
            note: inputLine.note ?? null,
          },
        });

        const nextReceivedQty = poLine.receivedQty + receiveQty;
        const nextRemainingQty = poLine.orderedQty - nextReceivedQty;

        let nextLineStatus: PurchaseOrderLineStatus = "PENDING";
        if (nextReceivedQty === 0) {
          nextLineStatus = "PENDING";
        } else if (nextReceivedQty < poLine.orderedQty) {
          nextLineStatus = "PARTIALLY_RECEIVED";
        } else {
          nextLineStatus = "RECEIVED";
        }

        await tx.purchaseOrderLine.update({
          where: {
            id: poLine.id,
          },
          data: {
            receivedQty: nextReceivedQty,
            remainingQty: nextRemainingQty,
            status: nextLineStatus,
          },
        });

        let stockLevel = await tx.stockLevel.findUnique({
          where: {
            variantId: poLine.variantId,
          },
        });

        if (!stockLevel) {
          stockLevel = await tx.stockLevel.create({
            data: {
              siteId,
              variantId: poLine.variantId,
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

        const afterOnHand = beforeOnHand + receiveQty;
        const afterReserved = beforeReserved;
        const afterAvailable = calcAvailable(afterOnHand, afterReserved);

        const totalOrderedForVariant = purchaseOrder.lines
          .filter((line) => line.variantId === poLine.variantId)
          .reduce((sum, line) => sum + line.orderedQty, 0);

        const totalAlreadyReceivedForVariantBefore = purchaseOrder.lines
          .filter((line) => line.variantId === poLine.variantId)
          .reduce((sum, line) => sum + line.receivedQty, 0);

        const totalAlreadyReceivedForVariantAfter = totalAlreadyReceivedForVariantBefore + receiveQty;

        const nextIncoming = Math.max(totalOrderedForVariant - totalAlreadyReceivedForVariantAfter, 0);

        const updatedStockLevel = await tx.stockLevel.update({
          where: {
            variantId: poLine.variantId,
          },
          data: {
            onHand: afterOnHand,
            reserved: afterReserved,
            available: afterAvailable,
            incoming: nextIncoming,
          },
        });

        await tx.stockMovement.create({
          data: {
            siteId,
            variantId: poLine.variantId,
            stockLevelId: updatedStockLevel.id,
            type: "PURCHASE_RECEIPT",
            quantityDelta: receiveQty,
            beforeOnHand,
            afterOnHand,
            beforeReserved,
            afterReserved,
            beforeAvailable,
            afterAvailable,
            referenceType: "PURCHASE_ORDER",
            referenceId: purchaseOrder.id,
            note: inputLine.note ?? note ?? `Received from PO ${purchaseOrder.poNumber}`,
            createdBy,
            metadata: {
              purchaseOrderId: purchaseOrder.id,
              purchaseOrderLineId: poLine.id,
              purchaseOrderReceiptId: receipt.id,
              purchaseOrderReceiptLineQty: receiveQty,
            },
          },
        });

        await tx.productVariant.update({
          where: {
            id: poLine.variantId,
          },
          data: {
            stockQty: afterAvailable,
          },
        });

        poLine.receivedQty = nextReceivedQty;
        poLine.remainingQty = nextRemainingQty;
        poLine.status = nextLineStatus;
      }

      const refreshedLines = await tx.purchaseOrderLine.findMany({
        where: {
          purchaseOrderId: purchaseOrder.id,
        },
      });

      const totalOrdered = refreshedLines.reduce((sum, line) => sum + line.orderedQty, 0);
      const totalReceived = refreshedLines.reduce((sum, line) => sum + line.receivedQty, 0);

      let nextPoStatus: PurchaseOrderStatus = purchaseOrder.status;
      if (totalReceived === 0) {
        nextPoStatus = "APPROVED";
      } else if (totalReceived < totalOrdered) {
        nextPoStatus = "PARTIALLY_RECEIVED";
      } else {
        nextPoStatus = "RECEIVED";
      }

      const updatedPo = await tx.purchaseOrder.update({
        where: {
          id: purchaseOrder.id,
        },
        data: {
          status: nextPoStatus,
          receivedAt: totalReceived >= totalOrdered ? new Date() : purchaseOrder.receivedAt,
        },
        include: {
          lines: {
            orderBy: {
              createdAt: "asc",
            },
          },
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

      return {
        receipt,
        purchaseOrder: updatedPo,
      };
    });

    return NextResponse.json({
      message: "Purchase order received successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/admin/inventory/purchase-orders/[id]/receive error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 400 });
  }
}

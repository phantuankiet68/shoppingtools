import { NextRequest, NextResponse } from "next/server";
import { Prisma, PurchaseOrderStatus, PurchaseOrderLineStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const EDITABLE_STATUSES: PurchaseOrderStatus[] = ["DRAFT", "SUBMITTED", "APPROVED"];

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        siteId,
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

    if (!purchaseOrder) {
      return NextResponse.json({ message: "Purchase order not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: purchaseOrder,
    });
  } catch (error) {
    console.error("GET /api/admin/inventory/purchase-orders/[id] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      siteId,
      supplierName,
      supplierCode,
      supplierEmail,
      supplierPhone,
      status,
      orderedAt,
      expectedAt,
      currency,
      discountAmount,
      taxAmount,
      shippingAmount,
      note,
      approvedBy,
      lines,
    } = body as {
      siteId: string;
      supplierName?: string;
      supplierCode?: string | null;
      supplierEmail?: string | null;
      supplierPhone?: string | null;
      status?: PurchaseOrderStatus;
      orderedAt?: string | null;
      expectedAt?: string | null;
      currency?: string;
      discountAmount?: number;
      taxAmount?: number;
      shippingAmount?: number;
      note?: string | null;
      approvedBy?: string | null;
      lines?: Array<{
        id?: string;
        variantId: string;
        orderedQty: number;
        unitCost: number;
        note?: string | null;
      }>;
    };

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const existingPo = await prisma.purchaseOrder.findFirst({
      where: {
        id,
        siteId,
      },
      include: {
        lines: true,
      },
    });

    if (!existingPo) {
      return NextResponse.json({ message: "Purchase order not found" }, { status: 404 });
    }

    if (!EDITABLE_STATUSES.includes(existingPo.status)) {
      return NextResponse.json(
        { message: `Purchase order in status ${existingPo.status} cannot be edited` },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let lineCreates: Prisma.PurchaseOrderLineCreateManyPurchaseOrderInputEnvelope | undefined;
      let newLinePayloads:
        | Array<{
            siteId: string;
            variantId: string;
            sku: string;
            productName: string;
            variantTitle: string | null;
            orderedQty: number;
            receivedQty: number;
            remainingQty: number;
            unitCost: Prisma.Decimal;
            lineTotal: Prisma.Decimal;
            status: PurchaseOrderLineStatus;
            note?: string | null;
          }>
        | undefined;

      if (lines) {
        const variantIds = lines.map((line) => line.variantId);
        const variants = await tx.productVariant.findMany({
          where: {
            id: { in: variantIds },
            siteId,
          },
          include: {
            product: true,
          },
        });

        const variantMap = new Map(variants.map((v) => [v.id, v]));

        for (const line of lines) {
          if (!variantMap.has(line.variantId)) {
            throw new Error(`Variant not found: ${line.variantId}`);
          }
          if (line.orderedQty <= 0) {
            throw new Error("orderedQty must be greater than 0");
          }
          if (line.unitCost < 0) {
            throw new Error("unitCost must be greater than or equal to 0");
          }
        }

        const existingLineIds = new Set(existingPo.lines.map((line) => line.id));
        const incomingExistingLineIds = new Set(lines.filter((line) => line.id).map((line) => line.id as string));

        const lineIdsToDelete = [...existingLineIds].filter((lineId) => !incomingExistingLineIds.has(lineId));

        if (lineIdsToDelete.length > 0) {
          const linesToDelete = existingPo.lines.filter((line) => lineIdsToDelete.includes(line.id));

          const hasReceived = linesToDelete.some((line) => line.receivedQty > 0);
          if (hasReceived) {
            throw new Error("Cannot delete lines that already have received quantity");
          }

          await tx.purchaseOrderLine.deleteMany({
            where: {
              id: { in: lineIdsToDelete },
              purchaseOrderId: existingPo.id,
            },
          });
        }

        for (const line of lines) {
          const variant = variantMap.get(line.variantId)!;
          const lineTotal = new Prisma.Decimal(Number(line.orderedQty) * Number(line.unitCost));

          if (line.id) {
            const existingLine = existingPo.lines.find((item) => item.id === line.id);
            if (!existingLine) {
              throw new Error(`Purchase order line not found: ${line.id}`);
            }

            if (existingLine.receivedQty > line.orderedQty) {
              throw new Error(`orderedQty cannot be less than receivedQty for line ${existingLine.id}`);
            }

            const remainingQty = line.orderedQty - existingLine.receivedQty;
            const nextStatus: PurchaseOrderLineStatus =
              existingLine.receivedQty === 0
                ? "PENDING"
                : existingLine.receivedQty < line.orderedQty
                  ? "PARTIALLY_RECEIVED"
                  : "RECEIVED";

            await tx.purchaseOrderLine.update({
              where: {
                id: line.id,
              },
              data: {
                variantId: line.variantId,
                sku: variant.sku,
                productName: variant.product.name,
                variantTitle: variant.title,
                orderedQty: line.orderedQty,
                remainingQty,
                unitCost: new Prisma.Decimal(line.unitCost),
                lineTotal,
                status: nextStatus,
                note: line.note ?? null,
              },
            });
          }
        }

        const newLines = lines.filter((line) => !line.id);

        if (newLines.length > 0) {
          newLinePayloads = newLines.map((line) => {
            const variant = variantMap.get(line.variantId)!;
            return {
              siteId,
              variantId: line.variantId,
              sku: variant.sku,
              productName: variant.product.name,
              variantTitle: variant.title,
              orderedQty: line.orderedQty,
              receivedQty: 0,
              remainingQty: line.orderedQty,
              unitCost: new Prisma.Decimal(line.unitCost),
              lineTotal: new Prisma.Decimal(Number(line.orderedQty) * Number(line.unitCost)),
              status: "PENDING",
              note: line.note ?? null,
            };
          });

          lineCreates = {
            data: newLinePayloads,
          };
        }
      }

      if (lineCreates) {
        await tx.purchaseOrder.update({
          where: { id: existingPo.id },
          data: {
            lines: {
              createMany: lineCreates,
            },
          },
        });
      }

      const allLines = await tx.purchaseOrderLine.findMany({
        where: {
          purchaseOrderId: existingPo.id,
        },
      });

      const subtotalAmount = allLines.reduce((sum, line) => sum + Number(line.lineTotal), 0);

      const nextDiscount = discountAmount ?? Number(existingPo.discountAmount);
      const nextTax = taxAmount ?? Number(existingPo.taxAmount);
      const nextShipping = shippingAmount ?? Number(existingPo.shippingAmount);

      const totalAmount = subtotalAmount - nextDiscount + nextTax + nextShipping;

      const updatedPo = await tx.purchaseOrder.update({
        where: {
          id: existingPo.id,
        },
        data: {
          supplierName: supplierName ?? existingPo.supplierName,
          supplierCode: supplierCode === undefined ? existingPo.supplierCode : supplierCode,
          supplierEmail: supplierEmail === undefined ? existingPo.supplierEmail : supplierEmail,
          supplierPhone: supplierPhone === undefined ? existingPo.supplierPhone : supplierPhone,
          status: status ?? existingPo.status,
          orderedAt: orderedAt === undefined ? existingPo.orderedAt : orderedAt ? new Date(orderedAt) : null,
          expectedAt: expectedAt === undefined ? existingPo.expectedAt : expectedAt ? new Date(expectedAt) : null,
          currency: currency ?? existingPo.currency,
          discountAmount: new Prisma.Decimal(nextDiscount),
          taxAmount: new Prisma.Decimal(nextTax),
          shippingAmount: new Prisma.Decimal(nextShipping),
          subtotalAmount: new Prisma.Decimal(subtotalAmount),
          totalAmount: new Prisma.Decimal(totalAmount),
          note: note === undefined ? existingPo.note : note,
          approvedBy: approvedBy === undefined ? existingPo.approvedBy : approvedBy,
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

      return updatedPo;
    });

    return NextResponse.json({
      message: "Purchase order updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/inventory/purchase-orders/[id] error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");

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
        receipts: true,
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json({ message: "Purchase order not found" }, { status: 404 });
    }

    const hasReceivedLines = purchaseOrder.lines.some((line) => line.receivedQty > 0);
    const hasReceipts = purchaseOrder.receipts.length > 0;

    if (hasReceivedLines || hasReceipts) {
      return NextResponse.json({ message: "Cannot cancel purchase order that already has receipts" }, { status: 400 });
    }

    const cancelled = await prisma.purchaseOrder.update({
      where: {
        id: purchaseOrder.id,
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
      include: {
        lines: true,
      },
    });

    return NextResponse.json({
      message: "Purchase order cancelled successfully",
      data: cancelled,
    });
  } catch (error) {
    console.error("DELETE /api/admin/inventory/purchase-orders/[id] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

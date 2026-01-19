import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { isUnauthorized } from "@/lib/errors/errors";
import { Prisma } from "@prisma/client";

type ReceiveLine = {
  poLineId: string;
  qty: number;
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;
    const { lines }: { lines: ReceiveLine[] } = await req.json();

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id: params.id, userId },
        include: { lines: true },
      });
      if (!po) throw new Error("PO_NOT_FOUND");

      // create receipt
      const receipt = await tx.inventoryReceipt.create({
        data: {
          userId,
          supplierId: po.supplierId,
          poId: po.id,
          status: "RECEIVED",
          currency: po.currency,
          receivedAt: new Date(),
          reference: po.number,
        },
      });

      for (const l of lines) {
        const poLine = po.lines.find((x) => x.id === l.poLineId);
        if (!poLine || l.qty <= 0) continue;

        // receipt item
        const item = await tx.inventoryReceiptItem.create({
          data: {
            receiptId: receipt.id,
            poLineId: poLine.id,
            productId: poLine.productId,
            variantId: poLine.variantId,
            qty: l.qty,
            unitCostCents: poLine.unitCostCents,
            totalCents: l.qty * poLine.unitCostCents,
          },
        });

        // stock movement
        await tx.stockMovement.create({
          data: {
            userId,
            productId: poLine.productId,
            variantId: poLine.variantId,
            type: "IN",
            source: "RECEIPT",
            qtyDelta: l.qty,
            occurredAt: new Date(),
            receiptItemId: item.id,
            reference: po.number,
          },
        });

        // update stock snapshot
        if (poLine.variantId) {
          await tx.productVariant.update({
            where: { id: poLine.variantId },
            data: { stock: { increment: l.qty } },
          });
        } else {
          await tx.product.update({
            where: { id: poLine.productId },
            data: { stock: { increment: l.qty } },
          });
        }

        // update po line received
        await tx.purchaseOrderLine.update({
          where: { id: poLine.id },
          data: { qtyReceived: { increment: l.qty } },
        });
      }

      // update PO status
      const updatedLines = await tx.purchaseOrderLine.findMany({
        where: { poId: po.id },
      });

      const ordered = updatedLines.reduce((s, l) => s + l.qtyOrdered, 0);
      const received = updatedLines.reduce((s, l) => s + l.qtyReceived, 0);

      const status = received <= 0 ? "APPROVED" : received < ordered ? "PARTIAL" : "RECEIVED";

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status },
      });

      return receipt;
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e: any) {
    if (isUnauthorized(e)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (e.message === "PO_NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

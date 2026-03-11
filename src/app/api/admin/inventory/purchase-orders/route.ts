import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, PurchaseOrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const siteId = searchParams.get("siteId");
    const status = searchParams.get("status") as PurchaseOrderStatus | null;
    const supplierName = searchParams.get("supplierName");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const where: any = { siteId };

    if (status) where.status = status;
    if (supplierName) {
      where.supplierName = {
        contains: supplierName,
        mode: "insensitive",
      };
    }

    const [rows, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          lines: true,
          receipts: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
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
    console.error("GET /api/admin/inventory/purchase-orders error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      siteId,
      poNumber,
      supplierName,
      supplierCode,
      supplierEmail,
      supplierPhone,
      orderedAt,
      expectedAt,
      currency = "VND",
      discountAmount = 0,
      taxAmount = 0,
      shippingAmount = 0,
      note,
      createdBy,
      lines,
    } = body as {
      siteId: string;
      poNumber: string;
      supplierName: string;
      supplierCode?: string;
      supplierEmail?: string;
      supplierPhone?: string;
      orderedAt?: string;
      expectedAt?: string;
      currency?: string;
      discountAmount?: number;
      taxAmount?: number;
      shippingAmount?: number;
      note?: string;
      createdBy?: string;
      lines: Array<{
        variantId: string;
        orderedQty: number;
        unitCost: number;
        note?: string;
      }>;
    };

    if (!siteId || !poNumber || !supplierName || !lines?.length) {
      return NextResponse.json({ message: "siteId, poNumber, supplierName and lines are required" }, { status: 400 });
    }

    const variantIds = lines.map((line) => line.variantId);

    const variants = await prisma.productVariant.findMany({
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
        return NextResponse.json({ message: `Variant not found: ${line.variantId}` }, { status: 400 });
      }
    }

    const lineInputs: Prisma.PurchaseOrderLineCreateWithoutPurchaseOrderInput[] = lines.map((line) => {
      const variant = variantMap.get(line.variantId)!;
      const lineTotal = Number(line.orderedQty) * Number(line.unitCost);

      return {
        site: {
          connect: { id: siteId },
        },
        variant: {
          connect: { id: variant.id },
        },
        sku: variant.sku,
        productName: variant.product.name,
        variantTitle: variant.title,
        orderedQty: line.orderedQty,
        receivedQty: 0,
        remainingQty: line.orderedQty,
        unitCost: new Prisma.Decimal(line.unitCost),
        lineTotal: new Prisma.Decimal(lineTotal),
        note: line.note,
      };
    });

    const subtotalAmount = lines.reduce((sum, line) => sum + Number(line.orderedQty) * Number(line.unitCost), 0);

    const totalAmount = subtotalAmount - Number(discountAmount) + Number(taxAmount) + Number(shippingAmount);

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        site: {
          connect: { id: siteId },
        },
        poNumber,
        supplierName,
        supplierCode,
        supplierEmail,
        supplierPhone,
        status: "DRAFT",
        orderedAt: orderedAt ? new Date(orderedAt) : null,
        expectedAt: expectedAt ? new Date(expectedAt) : null,
        currency,
        subtotalAmount: new Prisma.Decimal(subtotalAmount),
        discountAmount: new Prisma.Decimal(discountAmount),
        taxAmount: new Prisma.Decimal(taxAmount),
        shippingAmount: new Prisma.Decimal(shippingAmount),
        totalAmount: new Prisma.Decimal(totalAmount),
        note,
        createdBy,
        lines: {
          create: lineInputs,
        },
      },
      include: {
        lines: true,
      },
    });

    return NextResponse.json({
      message: "Purchase order created successfully",
      data: purchaseOrder,
    });
  } catch (error: any) {
    console.error("POST /api/admin/inventory/purchase-orders error:", error);

    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const productId = String(body.productId || "");
    const quantity = Number(body.quantity || 0);
    const note = body.note ? String(body.note) : null;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product id is required",
        },
        { status: 400 },
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be greater than 0",
        },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    const inventory = await prisma.inventory.findUnique({
      where: {
        productId,
      },
    });

    let updatedInventory;

    if (!inventory) {
      updatedInventory = await prisma.inventory.create({
        data: {
          productId,
          stock: quantity,
          importQty: quantity,
        },
      });

      await prisma.inventoryTransaction.create({
        data: {
          productId,
          type: "IMPORT",
          quantity,
          beforeQty: 0,
          afterQty: quantity,
          note,
        },
      });
    } else {
      const beforeQty = inventory.stock;
      const afterQty = beforeQty + quantity;

      updatedInventory = await prisma.inventory.update({
        where: {
          productId,
        },
        data: {
          stock: afterQty,
          importQty: {
            increment: quantity,
          },
        },
      });

      await prisma.inventoryTransaction.create({
        data: {
          productId,
          type: "IMPORT",
          quantity,
          beforeQty,
          afterQty,
          note,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Import stock successfully",
      data: updatedInventory,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

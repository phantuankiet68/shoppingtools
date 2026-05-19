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

    if (!inventory) {
      return NextResponse.json(
        {
          success: false,
          message: "Inventory not found for this product",
        },
        { status: 404 },
      );
    }

    if (inventory.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient stock",
        },
        { status: 400 },
      );
    }

    const beforeQty = inventory.stock;

    const afterQty = beforeQty - quantity;

    const updatedInventory = await prisma.inventory.update({
      where: {
        productId,
      },

      data: {
        stock: afterQty,

        soldQty: {
          increment: quantity,
        },
      },
    });

    await prisma.inventoryTransaction.create({
      data: {
        productId,

        type: "SALE",

        quantity,

        beforeQty,

        afterQty,

        note,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sale processed successfully",
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

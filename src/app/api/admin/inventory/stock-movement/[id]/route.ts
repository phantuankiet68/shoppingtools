import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function isUnauthorized(e: any) {
  return e?.message === "UNAUTHORIZED";
}

async function applyStockDelta(
  tx: Prisma.TransactionClient,
  args: { productId: string; variantId?: string | null; qtyDelta: number },
) {
  const { productId, variantId, qtyDelta } = args;

  if (variantId) {
    await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: qtyDelta } },
    });
  } else {
    await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: qtyDelta } },
    });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;
    const id = ctx.params.id;

    const movement = await prisma.stockMovement.findFirst({
      where: { id, userId },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, sku: true, name: true } },
      },
    });

    if (!movement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: movement });
  } catch (e: any) {
    if (isUnauthorized(e)) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

type VoidBody = { note?: string };

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;
    const id = ctx.params.id;

    const body = (await req.json()) as VoidBody;

    const result = await prisma.$transaction(async (tx) => {
      const original = await tx.stockMovement.findFirst({
        where: { id, userId },
      });
      if (!original) {
        throw new Error("Not found");
      }
      if (original.type === "VOID") {
        throw new Error("Cannot void a VOID movement");
      }

      const reversed = await tx.stockMovement.create({
        data: {
          userId,
          productId: original.productId,
          variantId: original.variantId,
          type: "VOID",
          source: "MANUAL",
          qtyDelta: -original.qtyDelta,
          occurredAt: new Date(),
          note: body?.note ?? `Void movement ${original.id}`,
          reference: original.reference ?? undefined,
        },
      });

      await applyStockDelta(tx, {
        productId: original.productId,
        variantId: original.variantId ?? null,
        qtyDelta: -original.qtyDelta,
      });

      return reversed;
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e: any) {
    if (isUnauthorized(e)) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (e?.message === "Not found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

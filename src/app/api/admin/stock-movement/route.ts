import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function parseIntSafe(v: string | null, fallback: number) {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function isUnauthorized(e: any) {
  return e?.message === "UNAUTHORIZED";
}

async function applyStockDelta(tx: Prisma.TransactionClient, args: { productId: string; variantId?: string | null; qtyDelta: number }) {
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

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("productId");
    const variantId = searchParams.get("variantId");
    const type = searchParams.get("type"); // IN | OUT | ADJUST | RETURN_IN | VOID...
    const source = searchParams.get("source"); // RECEIPT | ORDER | MANUAL...

    const from = searchParams.get("from"); // ISO string
    const to = searchParams.get("to"); // ISO string

    const cursor = searchParams.get("cursor"); // movement id
    const take = Math.min(parseIntSafe(searchParams.get("take"), 20), 100);

    const where: Prisma.StockMovementWhereInput = {
      userId,
      ...(productId ? { productId } : {}),
      ...(variantId ? { variantId } : {}),
      ...(type ? { type: type as any } : {}),
      ...(source ? { source: source as any } : {}),
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const items = await prisma.stockMovement.findMany({
      where,
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, sku: true, name: true } },
      },
    });

    const hasNextPage = items.length > take;
    const data = hasNextPage ? items.slice(0, take) : items;
    const nextCursor = hasNextPage ? data[data.length - 1]?.id : null;

    return NextResponse.json({ data, nextCursor });
  } catch (e: any) {
    if (isUnauthorized(e)) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

type AdjustBody = {
  productId: string;
  variantId?: string | null;
  qtyDelta: number; // + hoặc -
  occurredAt?: string; // ISO optional
  note?: string;
  reference?: string;
};

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const body = (await req.json()) as AdjustBody;

    if (!body?.productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    if (!Number.isInteger(body.qtyDelta) || body.qtyDelta === 0) {
      return NextResponse.json({ error: "qtyDelta must be a non-zero integer" }, { status: 400 });
    }

    const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();

    const created = await prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          userId,
          productId: body.productId,
          variantId: body.variantId ?? null,
          type: "ADJUST",
          source: "MANUAL",
          qtyDelta: body.qtyDelta,
          occurredAt,
          note: body.note ?? undefined,
          reference: body.reference ?? undefined,
        },
      });

      await applyStockDelta(tx, {
        productId: body.productId,
        variantId: body.variantId ?? null,
        qtyDelta: body.qtyDelta,
      });

      return movement;
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) {
    if (isUnauthorized(e)) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

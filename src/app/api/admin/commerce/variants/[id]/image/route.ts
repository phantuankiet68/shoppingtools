// app/api/admin/product-variant/[id]/image/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { Prisma } from "@prisma/client";

function toInt(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function ensureVariantBelongsToUser(
  userId: string,
  variantId: string,
): Promise<{ id: string; productId: string } | null> {
  /**
   * TODO:
   * Thay phần ownership theo schema thật của bạn.
   * Ví dụ nếu Site có userId:
   * where: { id: variantId, deletedAt: null, site: { userId } }
   */
  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      deletedAt: null,
      // site: { userId },
    },
    select: {
      id: true,
      productId: true,
    },
  });

  void userId;
  return variant;
}

async function ensureImageBelongsToUser(
  userId: string,
  variantId: string,
  imageId: string,
): Promise<{ id: string; variantId: string | null } | null> {
  /**
   * Ảnh variant đang nằm trong ProductImage, nhận diện bằng variantId
   */
  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      variantId,
      // variant: { site: { userId } }, // sửa theo ownership thật nếu cần
    },
    select: {
      id: true,
      variantId: true,
    },
  });

  void userId;
  return image;
}

/**
 * GET /api/admin/product-variant/:id/image
 * - list images of a variant
 */
export async function GET(_req: Request, { params }: RouteContext) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id: variantId } = await params;

    const variant = await ensureVariantBelongsToUser(userId, variantId);
    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const items = await prisma.productImage.findMany({
      where: { variantId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        productId: true,
        variantId: true,
        imageUrl: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ items });
  } catch (error: unknown) {
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/product-variant/:id/image
 * body: { imageUrl*, sortOrder? }
 */
export async function POST(req: Request, { params }: RouteContext) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id: variantId } = await params;

    const variant = await ensureVariantBelongsToUser(userId, variantId);
    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const data = body as Record<string, unknown>;

    const imageUrl = String(data.imageUrl ?? "").trim();
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const created = await prisma.productImage.create({
      data: {
        productId: variant.productId,
        variantId,
        imageUrl,
        sortOrder: Math.max(0, toInt(data.sortOrder, 0)),
      },
      select: {
        id: true,
        productId: true,
        variantId: true,
        imageUrl: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/product-variant/[id]/image] ERROR:", error);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/product-variant/:id/image
 * body: { imageId*, imageUrl?, sortOrder? }
 */
export async function PATCH(req: Request, { params }: RouteContext) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id: variantId } = await params;

    const variant = await ensureVariantBelongsToUser(userId, variantId);
    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const dataIn = body as Record<string, unknown>;

    const imageId = String(dataIn.imageId ?? "").trim();
    if (!imageId) {
      return NextResponse.json({ error: "imageId is required" }, { status: 400 });
    }

    const owned = await ensureImageBelongsToUser(userId, variantId, imageId);
    if (!owned) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const data: Prisma.ProductImageUpdateInput = {};

    if (dataIn.imageUrl !== undefined) {
      const imageUrl = String(dataIn.imageUrl ?? "").trim();
      if (!imageUrl) {
        return NextResponse.json({ error: "imageUrl cannot be empty" }, { status: 400 });
      }
      data.imageUrl = imageUrl;
    }

    if (dataIn.sortOrder !== undefined) {
      const n = Number(dataIn.sortOrder);
      if (!Number.isFinite(n)) {
        return NextResponse.json({ error: "sortOrder must be a number" }, { status: 400 });
      }
      data.sortOrder = Math.max(0, Math.trunc(n));
    }

    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data,
      select: {
        id: true,
        productId: true,
        variantId: true,
        imageUrl: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error: unknown) {
    console.error("[PATCH /api/admin/product-variant/[id]/image] ERROR:", error);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/product-variant/:id/image?imageId=...
 */
export async function DELETE(req: Request, { params }: RouteContext) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const { id: variantId } = await params;

    const variant = await ensureVariantBelongsToUser(userId, variantId);
    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const imageId = (url.searchParams.get("imageId") ?? "").trim();
    if (!imageId) {
      return NextResponse.json({ error: "imageId is required" }, { status: 400 });
    }

    const owned = await ensureImageBelongsToUser(userId, variantId, imageId);
    if (!owned) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/product-variant/[id]/image] ERROR:", error);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

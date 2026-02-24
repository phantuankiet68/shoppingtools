// app/api/admin/product-variant/[id]/image/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function toInt(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
function cleanText(v: unknown, max = 2000) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

async function ensureVariantBelongsToUser(userId: string, variantId: string) {
  const v = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { userId } },
    select: { id: true },
  });
  return !!v;
}

async function ensureImageBelongsToUser(userId: string, variantId: string, imageId: string) {
  const img = await prisma.productVariantImage.findFirst({
    where: { id: imageId, variantId, variant: { product: { userId } } },
    select: { id: true, isCover: true },
  });
  return img; // null if not found
}

async function setCover(variantId: string, imageId: string) {
  await prisma.$transaction([
    prisma.productVariantImage.updateMany({
      where: { variantId, NOT: { id: imageId } },
      data: { isCover: false },
    }),
    prisma.productVariantImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);
}

/**
 * GET /api/admin/product-variant/:id/image
 * - list images of a variant
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const variantId = params.id;

    const ok = await ensureVariantBelongsToUser(userId, variantId);
    if (!ok) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    const items = await prisma.productVariantImage.findMany({
      where: { variantId },
      orderBy: [{ isCover: "desc" }, { sort: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        variantId: true,
        url: true,
        fileName: true,
        sort: true,
        isCover: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/product-variant/:id/image
 * body: { url*, fileName?, sort?, isCover? }
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const variantId = params.id;

    const ok = await ensureVariantBelongsToUser(userId, variantId);
    if (!ok) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const url = String(body.url ?? "").trim();
    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

    const created = await prisma.productVariantImage.create({
      data: {
        variantId,
        url,
        fileName: cleanText(body.fileName, 255),
        sort: Math.max(0, toInt(body.sort, 0)),
        isCover: typeof body.isCover === "boolean" ? body.isCover : false,
      },
      select: {
        id: true,
        variantId: true,
        url: true,
        fileName: true,
        sort: true,
        isCover: true,
        createdAt: true,
      },
    });

    // if set cover -> unset all other covers
    if (created.isCover) {
      await setCover(variantId, created.id);
      const item = await prisma.productVariantImage.findUnique({
        where: { id: created.id },
        select: {
          id: true,
          variantId: true,
          url: true,
          fileName: true,
          sort: true,
          isCover: true,
          createdAt: true,
        },
      });
      return NextResponse.json({ item }, { status: 201 });
    }

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/admin/product-variant/[id]/image] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/product-variant/:id/image
 * body: { imageId*, url?, fileName?, sort?, isCover? }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const variantId = params.id;

    const ok = await ensureVariantBelongsToUser(userId, variantId);
    if (!ok) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const imageId = String(body.imageId ?? "").trim();
    if (!imageId) return NextResponse.json({ error: "imageId is required" }, { status: 400 });

    const owned = await ensureImageBelongsToUser(userId, variantId, imageId);
    if (!owned) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    const data: any = {};

    if (body.url !== undefined) {
      const u = String(body.url ?? "").trim();
      if (!u) return NextResponse.json({ error: "url cannot be empty" }, { status: 400 });
      data.url = u;
    }
    if (body.fileName !== undefined) data.fileName = cleanText(body.fileName, 255);

    if (body.sort !== undefined) {
      const n = Number(body.sort);
      if (!Number.isFinite(n)) return NextResponse.json({ error: "sort must be a number" }, { status: 400 });
      data.sort = Math.max(0, Math.trunc(n));
    }

    if (body.isCover !== undefined) data.isCover = !!body.isCover;

    const updated = await prisma.productVariantImage.update({
      where: { id: imageId },
      data,
      select: {
        id: true,
        variantId: true,
        url: true,
        fileName: true,
        sort: true,
        isCover: true,
        createdAt: true,
      },
    });

    if (body.isCover === true) {
      await setCover(variantId, imageId);
      const item = await prisma.productVariantImage.findUnique({
        where: { id: imageId },
        select: {
          id: true,
          variantId: true,
          url: true,
          fileName: true,
          sort: true,
          isCover: true,
          createdAt: true,
        },
      });
      return NextResponse.json({ item });
    }

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    console.error("[PATCH /api/admin/product-variant/[id]/image] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/product-variant/:id/image?imageId=...
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const variantId = params.id;

    const ok = await ensureVariantBelongsToUser(userId, variantId);
    if (!ok) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    const url = new URL(req.url);
    const imageId = (url.searchParams.get("imageId") ?? "").trim();
    if (!imageId) return NextResponse.json({ error: "imageId is required" }, { status: 400 });

    const owned = await ensureImageBelongsToUser(userId, variantId, imageId);
    if (!owned) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    await prisma.productVariantImage.delete({ where: { id: imageId } });

    // Nếu xoá cover -> set cover cho ảnh còn lại đầu tiên (tuỳ chọn)
    if (owned.isCover) {
      const first = await prisma.productVariantImage.findFirst({
        where: { variantId },
        orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      });
      if (first) await setCover(variantId, first.id);
    }

    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    console.error("[DELETE /api/admin/product-variant/[id]/image] ERROR:", e);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

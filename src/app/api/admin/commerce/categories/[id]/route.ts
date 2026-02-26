import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function slugify(input: string) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function cleanText(v: unknown, max = 2000) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

// ✅ Next.js 15: params là Promise
type Ctx = { params: Promise<{ id: string }> };

async function getId(ctx: Ctx) {
  const { id } = await ctx.params;
  return String(id ?? "").trim();
}

async function assertCategoryOwned(userId: string, id: string) {
  return prisma.productCategory.findFirst({
    where: { id, userId },
    select: { id: true, parentId: true },
  });
}

/** cycle check when changing parentId */
async function wouldCreateCycle(userId: string, id: string, newParentId: string | null) {
  if (!newParentId) return false;
  if (newParentId === id) return true;

  const rows = await prisma.productCategory.findMany({
    where: { userId },
    select: { id: true, parentId: true },
  });

  const byId = new Map(rows.map((r) => [r.id, r.parentId]));

  let p: string | null = newParentId;
  while (p) {
    if (p === id) return true;
    p = byId.get(p) ?? null;
  }
  return false;
}

export async function GET(_req: Request, ctx: Ctx) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const id = await getId(ctx);
    if (!id) return jsonError("Missing id", 400);

    const item = await prisma.productCategory.findFirst({
      where: { id, userId },
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        isActive: true,
        sort: true,
        icon: true,
        coverImage: true,
        seoTitle: true,
        seoDesc: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { products: true } },
      },
    });

    if (!item) return jsonError("Not found", 404);

    return NextResponse.json({
      item: {
        id: item.id,
        parentId: item.parentId,
        name: item.name,
        slug: item.slug,
        isActive: item.isActive,
        sort: item.sort,
        icon: item.icon,
        coverImage: item.coverImage,
        seoTitle: item.seoTitle,
        seoDesc: item.seoDesc,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        count: item._count.products,
      },
    });
  } catch (e: any) {
    if (!userId) return jsonError("Unauthorized", 401);
    return jsonError(e?.message || "Server error", 500);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const id = await getId(ctx);
    if (!id) return jsonError("Missing id", 400);

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return jsonError("Content-Type must be application/json", 415);
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const exists = await assertCategoryOwned(userId, id);
    if (!exists) return jsonError("Not found", 404);

    const patch: any = {};

    if (body.name != null) {
      const name = String(body.name ?? "").trim();
      if (!name) return jsonError("Name cannot be empty", 400);
      patch.name = name;
    }

    if (body.slug != null) {
      const raw = String(body.slug ?? "").trim();
      const slug = slugify(raw);
      if (!slug) return jsonError("Slug cannot be empty", 400);
      patch.slug = slug;
    }

    if (body.isActive != null) {
      patch.isActive = Boolean(body.isActive);
    }

    if (body.sort != null) {
      const s = Number(body.sort);
      if (!Number.isFinite(s)) return jsonError("Invalid sort", 400);
      patch.sort = Math.trunc(s);
    }

    if (body.icon !== undefined) patch.icon = cleanText(body.icon, 64);
    if (body.coverImage !== undefined) patch.coverImage = cleanText(body.coverImage, 2048);
    if (body.seoTitle !== undefined) patch.seoTitle = cleanText(body.seoTitle, 160);
    if (body.seoDesc !== undefined) patch.seoDesc = cleanText(body.seoDesc, 2000);

    if (body.parentId !== undefined) {
      const raw = body.parentId;
      const parentId = raw == null || raw === "" || raw === "null" ? null : String(raw);

      if (parentId) {
        const p = await prisma.productCategory.findFirst({
          where: { id: parentId, userId },
          select: { id: true },
        });
        if (!p) return jsonError("Parent not found", 400);
      }

      const cycle = await wouldCreateCycle(userId, id, parentId);
      if (cycle) return jsonError("Invalid parent (cycle detected)", 400);

      patch.parentId = parentId;
    }

    if (Object.keys(patch).length === 0) {
      return jsonError("No fields to update", 400);
    }

    // ✅ Bảo vệ theo userId: dùng updateMany
    const r = await prisma.productCategory.updateMany({
      where: { id, userId },
      data: patch,
    });

    if (r.count === 0) return jsonError("Not found", 404);

    // trả item mới nhất
    const updated = await prisma.productCategory.findFirst({
      where: { id, userId },
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        isActive: true,
        sort: true,
        icon: true,
        coverImage: true,
        seoTitle: true,
        seoDesc: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { products: true } },
      },
    });

    if (!updated) return jsonError("Not found", 404);

    return NextResponse.json({
      item: {
        id: updated.id,
        parentId: updated.parentId,
        name: updated.name,
        slug: updated.slug,
        isActive: updated.isActive,
        sort: updated.sort,
        icon: updated.icon,
        coverImage: updated.coverImage,
        seoTitle: updated.seoTitle,
        seoDesc: updated.seoDesc,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        count: updated._count.products,
      },
    });
  } catch (e: any) {
    if (!userId) return jsonError("Unauthorized", 401);

    // prisma unique
    if (e?.code === "P2002") {
      const target = e?.meta?.target;
      const t = Array.isArray(target) ? target.join(",") : String(target ?? "");
      if (t.includes("slug")) return jsonError("Slug already exists", 409);
      if (t.includes("name")) return jsonError("Name already exists", 409);
      return jsonError("Category already exists", 409);
    }

    return jsonError(e?.message || "Server error", 500);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  let userId: string | null = null;

  try {
    const user = await requireAdminAuthUser();
    userId = user.id;

    const categoryId = await getId(ctx);
    if (!categoryId) return jsonError("Missing id", 400);

    // optional: prevent deleting category that has children
    const childrenCount = await prisma.productCategory.count({
      where: { userId, parentId: categoryId },
    });
    if (childrenCount > 0) return jsonError("Cannot delete: category has children", 409);

    // ✅ Bảo vệ theo userId
    const r = await prisma.productCategory.deleteMany({
      where: { id: categoryId, userId },
    });

    if (r.count === 0) return jsonError("Not found", 404);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (!userId) return jsonError("Unauthorized", 401);
    return jsonError(e?.message || "Server error", 500);
  }
}

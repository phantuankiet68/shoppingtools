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

// ✅ Next.js 15: params là Promise
type Ctx = { params: Promise<{ id: string }> };

async function getId(ctx: Ctx) {
  const { id } = await ctx.params;
  return String(id ?? "").trim();
}

function getSiteIdFromUrl(req: Request) {
  const url = new URL(req.url);
  const siteId = String(url.searchParams.get("siteId") ?? "").trim();
  return siteId || null;
}

type PrismaErrorLike = {
  code?: string;
  meta?: { target?: unknown };
  message?: string;
};

function asPrismaError(e: unknown): PrismaErrorLike {
  if (typeof e !== "object" || e === null) return {};
  const obj = e as Record<string, unknown>;
  const meta = typeof obj.meta === "object" && obj.meta !== null ? (obj.meta as Record<string, unknown>) : undefined;

  return {
    code: typeof obj.code === "string" ? obj.code : undefined,
    meta: meta ? { target: meta.target } : undefined,
    message: typeof obj.message === "string" ? obj.message : undefined,
  };
}

type PatchData = {
  name?: string;
  slug?: string;
  parentId?: string | null;
  sortOrder?: number;
};

async function assertCategoryInSite(siteId: string, id: string) {
  return prisma.productCategory.findFirst({
    where: { id, siteId },
    select: { id: true, parentId: true },
  });
}

/** cycle check when changing parentId (within same site) */
async function wouldCreateCycle(siteId: string, id: string, newParentId: string | null) {
  if (!newParentId) return false;
  if (newParentId === id) return true;

  const rows = await prisma.productCategory.findMany({
    where: { siteId },
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

export async function GET(req: Request, ctx: Ctx) {
  try {
    await requireAdminAuthUser();

    const id = await getId(ctx);
    if (!id) return jsonError("Missing id", 400);

    const siteId = getSiteIdFromUrl(req);
    if (!siteId) return jsonError("siteId is required", 400);

    const item = await prisma.productCategory.findFirst({
      where: { id, siteId },
      select: {
        id: true,
        siteId: true,
        parentId: true,
        name: true,
        slug: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { products: true } },
      },
    });

    if (!item) return jsonError("Not found", 404);

    return NextResponse.json({
      item: {
        id: item.id,
        siteId: item.siteId,
        parentId: item.parentId,
        name: item.name,
        slug: item.slug,
        sortOrder: item.sortOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        count: item._count.products,
      },
    });
  } catch (e: unknown) {
    const pe = asPrismaError(e);
    // auth error
    if ((pe.message || "").toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);
    return jsonError(pe.message || "Server error", 500);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    await requireAdminAuthUser();

    const id = await getId(ctx);
    if (!id) return jsonError("Missing id", 400);

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return jsonError("Content-Type must be application/json", 415);
    }

    const bodyUnknown = await req.json().catch(() => null);
    if (!bodyUnknown || typeof bodyUnknown !== "object") return jsonError("Invalid JSON body", 400);
    const body = bodyUnknown as Record<string, unknown>;

    // siteId lấy từ query ưu tiên, fallback body.siteId
    const siteId = getSiteIdFromUrl(req) || (typeof body.siteId === "string" ? body.siteId.trim() : "") || null;

    if (!siteId) return jsonError("siteId is required", 400);

    const exists = await assertCategoryInSite(siteId, id);
    if (!exists) return jsonError("Not found", 404);

    const patch: PatchData = {};

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

    // sortOrder
    if (body.sortOrder != null) {
      const s = Number(body.sortOrder);
      if (!Number.isFinite(s)) return jsonError("Invalid sortOrder", 400);
      patch.sortOrder = Math.trunc(s);
    }

    // parentId
    if (Object.prototype.hasOwnProperty.call(body, "parentId")) {
      const raw = body.parentId;
      const parentId = raw == null || raw === "" || raw === "null" ? null : String(raw);

      if (parentId) {
        const p = await prisma.productCategory.findFirst({
          where: { id: parentId, siteId },
          select: { id: true },
        });
        if (!p) return jsonError("Parent not found", 400);
      }

      const cycle = await wouldCreateCycle(siteId, id, parentId);
      if (cycle) return jsonError("Invalid parent (cycle detected)", 400);

      patch.parentId = parentId;
    }

    if (Object.keys(patch).length === 0) {
      return jsonError("No fields to update", 400);
    }

    // ✅ bảo vệ theo siteId
    const r = await prisma.productCategory.updateMany({
      where: { id, siteId },
      data: patch,
    });

    if (r.count === 0) return jsonError("Not found", 404);

    const updated = await prisma.productCategory.findFirst({
      where: { id, siteId },
      select: {
        id: true,
        siteId: true,
        parentId: true,
        name: true,
        slug: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { products: true } },
      },
    });

    if (!updated) return jsonError("Not found", 404);

    return NextResponse.json({
      item: {
        id: updated.id,
        siteId: updated.siteId,
        parentId: updated.parentId,
        name: updated.name,
        slug: updated.slug,
        sortOrder: updated.sortOrder,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        count: updated._count.products,
      },
    });
  } catch (e: unknown) {
    const pe = asPrismaError(e);

    if ((pe.message || "").toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);

    if (pe.code === "P2002") {
      const target = pe.meta?.target;
      const t = Array.isArray(target) ? target.join(",") : String(target ?? "");
      if (t.includes("slug")) return jsonError("Slug already exists in this site", 409);
      return jsonError("Category already exists", 409);
    }

    return jsonError(pe.message || "Server error", 500);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    await requireAdminAuthUser();

    const categoryId = await getId(ctx);
    if (!categoryId) return jsonError("Missing id", 400);

    const siteId = getSiteIdFromUrl(req);
    if (!siteId) return jsonError("siteId is required", 400);

    // prevent deleting category that has children
    const childrenCount = await prisma.productCategory.count({
      where: { siteId, parentId: categoryId },
    });
    if (childrenCount > 0) return jsonError("Cannot delete: category has children", 409);

    const r = await prisma.productCategory.deleteMany({
      where: { id: categoryId, siteId },
    });

    if (r.count === 0) return jsonError("Not found", 404);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const pe = asPrismaError(e);
    if ((pe.message || "").toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);
    return jsonError(pe.message || "Server error", 500);
  }
}

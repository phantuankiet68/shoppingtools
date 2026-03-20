import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function normName(s: unknown) {
  return String(s ?? "").trim();
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

function normSlug(s: unknown, fallbackName?: string) {
  const raw = String(s ?? "").trim();
  const base = raw.length ? raw : String(fallbackName ?? "");
  const slug = slugify(base);
  return slug.length ? slug : "";
}

function decimalOrNull(v: unknown) {
  const raw = String(v ?? "").trim();
  if (!raw) return null;

  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

function intOrNull(v: unknown) {
  const raw = String(v ?? "").trim();
  if (!raw) return null;

  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function parseImages(input: unknown) {
  const arr = Array.isArray(input) ? input : [];

  return arr
    .map((x: any, idx) => {
      const url = String(x?.url ?? x?.imageUrl ?? "").trim();
      if (!url) return null;

      const sortOrder = Number.isFinite(Number(x?.sort ?? x?.sortOrder))
        ? Math.max(0, Math.trunc(Number(x?.sort ?? x?.sortOrder)))
        : idx;

      return {
        imageUrl: url,
        sortOrder,
      };
    })
    .filter(Boolean) as Array<{
    imageUrl: string;
    sortOrder: number;
  }>;
}

function safeDate(v: unknown) {
  if (!v) return null;
  try {
    return new Date(v as string | number | Date).toISOString();
  } catch {
    return null;
  }
}

function safeScalar(v: any) {
  if (v == null) return null;
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  if (typeof v?.toString === "function") return v.toString();
  return String(v);
}

function serializeProductForEdit(product: any) {
  return {
    id: String(product.id),
    siteId: String(product.siteId),

    name: String(product.name ?? ""),
    slug: String(product.slug ?? ""),
    shortDescription: product.shortDescription == null ? null : String(product.shortDescription),
    description: product.description == null ? null : String(product.description),

    categoryId: String(product.categoryId ?? ""),
    category: product.category
      ? {
          id: String(product.category.id),
          name: String(product.category.name),
        }
      : null,

    brandId: product.brandId == null ? null : String(product.brandId),
    brand: product.brand
      ? {
          id: String(product.brand.id),
          name: String(product.brand.name),
        }
      : null,

    productType: String(product.productType ?? "PHYSICAL"),
    tags: Array.isArray(product.tags) ? product.tags.map((x: unknown) => String(x)) : [],

    status: String(product.status ?? "DRAFT"),
    isVisible: Boolean(product.isVisible),
    publishedAt: safeDate(product.publishedAt),

    metaTitle: product.metaTitle == null ? null : String(product.metaTitle),
    metaDescription: product.metaDescription == null ? null : String(product.metaDescription),

    price: safeScalar(product.price),
    marketPrice: safeScalar(product.marketPrice),
    savingPrice: safeScalar(product.savingPrice),
    productQty: product.productQty == null ? 0 : Number(product.productQty),

    weight: safeScalar(product.weight),
    length: safeScalar(product.length),
    width: safeScalar(product.width),
    height: safeScalar(product.height),

    createdAt: safeDate(product.createdAt),
    updatedAt: safeDate(product.updatedAt),

    images: Array.isArray(product.images)
      ? product.images.map((img: any) => ({
          id: String(img.id),
          url: String(img.imageUrl ?? ""),
          sort: Number(img.sortOrder ?? 0),
        }))
      : [],
  };
}

async function findProductFull(id: string) {
  return prisma.product.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
      siteId: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,

      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },

      brandId: true,
      brand: {
        select: {
          id: true,
          name: true,
        },
      },

      productType: true,
      tags: true,
      status: true,
      isVisible: true,
      publishedAt: true,
      metaTitle: true,
      metaDescription: true,

      price: true,
      marketPrice: true,
      savingPrice: true,
      productQty: true,

      weight: true,
      length: true,
      width: true,
      height: true,

      createdAt: true,
      updatedAt: true,

      images: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          imageUrl: true,
          sortOrder: true,
        },
      },
    },
  });
}

async function findProductLite(id: string) {
  return prisma.product.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
      siteId: true,
      slug: true,
    },
  });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminAuthUser();

    const { id } = await ctx.params;
    const item = await findProductFull(String(id));

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const payload = serializeProductForEdit(item);
    return NextResponse.json({ item: payload });
  } catch (e: any) {
    console.error("GET /api/admin/commerce/products/[id] failed:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: e?.message?.includes("Unauthorized") ? 401 : 500 },
    );
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminAuthUser();

    const { id } = await ctx.params;
    const pid = String(id);

    const current = await findProductLite(pid);
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const data: Record<string, unknown> = {};

    const nextSlug = body.slug !== undefined ? normSlug(body.slug, body.name) : undefined;

    if (nextSlug !== undefined) {
      if (!nextSlug) {
        return NextResponse.json({ error: "Slug cannot be empty" }, { status: 400 });
      }

      const duplicate = await prisma.product.findFirst({
        where: {
          id: { not: pid },
          siteId: current.siteId,
          slug: nextSlug,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

      if (duplicate) {
        return NextResponse.json({ error: `Slug "${nextSlug}" already exists in this site` }, { status: 409 });
      }
    }

    if (body.name !== undefined) {
      const name = normName(body.name);
      if (!name) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      data.name = name;
    }

    if (body.slug !== undefined) {
      data.slug = nextSlug;
    }

    if (body.shortDescription !== undefined) {
      const v = String(body.shortDescription ?? "").trim();
      data.shortDescription = v || null;
    }

    if (body.description !== undefined) {
      const v = String(body.description ?? "").trim();
      data.description = v || null;
    }

    if (body.categoryId !== undefined) {
      const v = String(body.categoryId ?? "").trim();
      if (!v) {
        return NextResponse.json({ error: "Category is required" }, { status: 400 });
      }
      data.categoryId = v;
    }

    if (body.brandId !== undefined) {
      const v = String(body.brandId ?? "").trim();
      data.brandId = v || null;
    }

    if (body.productType !== undefined) {
      const v = String(body.productType ?? "")
        .trim()
        .toUpperCase();
      if (!["PHYSICAL", "DIGITAL", "SERVICE"].includes(v)) {
        return NextResponse.json({ error: "Invalid productType" }, { status: 400 });
      }
      data.productType = v;
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json({ error: "tags must be an array" }, { status: 400 });
      }
      data.tags = body.tags.map((x: unknown) => String(x ?? "").trim()).filter(Boolean);
    }

    if (body.status !== undefined) {
      const v = String(body.status ?? "")
        .trim()
        .toUpperCase();
      if (!["DRAFT", "ACTIVE", "ARCHIVED"].includes(v)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = v;
    }

    if (body.isVisible !== undefined) {
      data.isVisible = !!body.isVisible;
    }

    if (body.publishedAt !== undefined) {
      const raw = String(body.publishedAt ?? "").trim();
      data.publishedAt = raw ? new Date(raw) : null;
    }

    if (body.metaTitle !== undefined) {
      const v = String(body.metaTitle ?? "").trim();
      data.metaTitle = v || null;
    }

    if (body.metaDescription !== undefined) {
      const v = String(body.metaDescription ?? "").trim();
      data.metaDescription = v || null;
    }

    if (body.price !== undefined) data.price = decimalOrNull(body.price);
    if (body.marketPrice !== undefined) data.marketPrice = decimalOrNull(body.marketPrice);
    if (body.savingPrice !== undefined) data.savingPrice = decimalOrNull(body.savingPrice);
    if (body.productQty !== undefined) data.productQty = intOrNull(body.productQty) ?? 0;

    if (body.weight !== undefined) data.weight = decimalOrNull(body.weight);
    if (body.length !== undefined) data.length = decimalOrNull(body.length);
    if (body.width !== undefined) data.width = decimalOrNull(body.width);
    if (body.height !== undefined) data.height = decimalOrNull(body.height);

    const wantsReplaceImages = body.media !== undefined || body.images !== undefined;
    const nextImages = wantsReplaceImages ? parseImages(body.media !== undefined ? body.media : body.images) : [];

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: pid },
        data,
      });

      if (wantsReplaceImages) {
        await tx.productImage.deleteMany({
          where: { productId: pid },
        });

        if (nextImages.length > 0) {
          await tx.productImage.createMany({
            data: nextImages.map((x) => ({
              productId: pid,
              imageUrl: x.imageUrl,
              sortOrder: x.sortOrder,
            })),
          });
        }
      }

      return tx.product.findFirst({
        where: {
          id: pid,
          deletedAt: null,
        },
        select: {
          id: true,
          siteId: true,
          name: true,
          slug: true,
          shortDescription: true,
          description: true,

          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },

          brandId: true,
          brand: {
            select: {
              id: true,
              name: true,
            },
          },

          productType: true,
          tags: true,
          status: true,
          isVisible: true,
          publishedAt: true,
          metaTitle: true,
          metaDescription: true,

          price: true,
          marketPrice: true,
          savingPrice: true,
          productQty: true,

          weight: true,
          length: true,
          width: true,
          height: true,

          createdAt: true,
          updatedAt: true,

          images: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              imageUrl: true,
              sortOrder: true,
            },
          },
        },
      });
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ item: serializeProductForEdit(updated) });
  } catch (e: any) {
    console.error("PATCH /api/admin/commerce/products/[id] failed:", e);

    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint failed" }, { status: 409 });
    }

    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: e?.message?.includes("Unauthorized") ? 401 : 500 },
    );
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminAuthUser();

    const { id } = await ctx.params;
    const pid = String(id);

    const current = await findProductLite(pid);
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: pid },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        deletedAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    console.error("DELETE /api/admin/commerce/products/[id] failed:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: e?.message?.includes("Unauthorized") ? 401 : 500 },
    );
  }
}

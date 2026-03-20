import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import type { Prisma, ProductStatus, ProductType } from "@prisma/client";

/* ----------------------------- utils ----------------------------- */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toInt(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function parseISODateOrNull(v: string | null | undefined) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseNumberOrNull(v: unknown) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseIntOrDefault(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getSiteId(req: Request): Promise<string> {
  const url = new URL(req.url);
  const fromQuery = String(url.searchParams.get("siteId") ?? "").trim();
  if (fromQuery) return fromQuery;

  const cookieStore = await cookies();
  return String(cookieStore.get("siteId")?.value ?? "").trim();
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function whereFromStatus(status: string): Prisma.ProductWhereInput | null {
  const s = status.toLowerCase();

  if (s === "all") return null;
  if (s === "draft") return { status: "DRAFT" as ProductStatus };
  if (s === "active") return { status: "ACTIVE" as ProductStatus };
  if (s === "archived") return { status: "ARCHIVED" as ProductStatus };

  return null;
}

function orderByFromSort(sort: string): Prisma.ProductOrderByWithRelationInput {
  const s = sort.toLowerCase();

  if (s === "oldest") return { createdAt: "asc" };
  if (s === "name_asc" || s === "nameasc") return { name: "asc" };
  if (s === "name_desc" || s === "namedesc") return { name: "desc" };
  if (s === "updated_desc" || s === "updateddesc") return { updatedAt: "desc" };
  if (s === "updated_asc" || s === "updatedasc") return { updatedAt: "asc" };

  return { createdAt: "desc" };
}

/* ----------------------------- types ----------------------------- */

type MediaItem = {
  id?: string;
  type: "image" | "video";
  url: string;
  thumbUrl?: string;
};

type ProductSubmitPayload = {
  siteId?: string;

  name: string;
  slug?: string;

  categoryId?: string;
  category?: string;

  brandId?: string;
  brand?: string;

  productType?: ProductType;
  tags?: string[];

  status?: ProductStatus;
  isVisible?: boolean;
  publishedAt?: string;

  shortDescription?: string;
  description?: string;

  metaTitle?: string;
  metaDescription?: string;

  price?: number | string | null;
  marketPrice?: number | string | null;
  savingPrice?: number | string | null;
  productQty?: number | string | null;

  weight?: number | string | null;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;

  media?: MediaItem[];
};

/* ----------------------------- helpers ----------------------------- */

async function ensureUniqueSlug(siteId: string, rawSlug: string, excludeId?: string) {
  const base = slugify(rawSlug) || "product";
  let candidate = base;
  let i = 1;

  while (true) {
    const found = await prisma.product.findFirst({
      where: {
        siteId,
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!found) return candidate;
    candidate = `${base}-${i++}`;
  }
}

/* ----------------------------- GET ----------------------------- */

export async function GET(req: Request) {
  try {
    await requireAdminAuthUser();

    const siteId = await getSiteId(req);
    if (!siteId) return jsonError("siteId is required", 400);

    const url = new URL(req.url);
    const status = (url.searchParams.get("status") ?? "all").toLowerCase();
    const sort = (url.searchParams.get("sort") ?? "newest").toLowerCase();

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 200);
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {
      siteId,
      deletedAt: null,
    };

    const statusWhere = whereFromStatus(status);
    if (statusWhere) Object.assign(where, statusWhere);

    const orderBy = orderByFromSort(sort);

    const [total, rawItems] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          siteId: true,
          categoryId: true,
          brandId: true,
          name: true,
          slug: true,
          shortDescription: true,
          description: true,
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

          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
          images: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: { id: true, imageUrl: true, sortOrder: true },
          },
        },
      }),
    ]);

    const items = rawItems.map((p) => ({
      ...p,
      price: p.price?.toString() ?? null,
      marketPrice: p.marketPrice?.toString() ?? null,
      savingPrice: p.savingPrice?.toString() ?? null,
      weight: p.weight?.toString() ?? null,
      length: p.length?.toString() ?? null,
      width: p.width?.toString() ?? null,
      height: p.height?.toString() ?? null,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        sort: img.sortOrder,
      })),
    }));

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}

/* ----------------------------- POST ----------------------------- */

export async function POST(req: NextRequest) {
  try {
    await requireAdminAuthUser();

    const body = (await req.json()) as Partial<ProductSubmitPayload>;

    const cookieSiteId = await getSiteId(req);
    const siteId = String(body.siteId ?? cookieSiteId ?? "").trim();

    if (!siteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ message: "name is required" }, { status: 400 });
    }

    const rawSlug = String(body.slug ?? "").trim() || name;
    const finalSlug = await ensureUniqueSlug(siteId, rawSlug);

    const categoryInput = String(body.categoryId ?? body.category ?? "").trim();
    if (!categoryInput) {
      return NextResponse.json({ message: "categoryId is required" }, { status: 400 });
    }

    const category = await prisma.productCategory.findFirst({
      where: {
        siteId,
        OR: [{ id: categoryInput }, { slug: categoryInput }],
      },
      select: { id: true, name: true, slug: true },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found (provide valid category id or slug for this site)" },
        { status: 400 },
      );
    }

    let brandId: string | null = null;
    const brandInput = String(body.brandId ?? body.brand ?? "").trim();

    if (brandInput) {
      const brand = await prisma.productBrand.findFirst({
        where: {
          siteId,
          OR: [{ id: brandInput }, { slug: brandInput }, { name: brandInput }],
        },
        select: { id: true },
      });

      if (!brand) {
        return NextResponse.json(
          { message: "Brand not found (provide valid brand id, slug, or name for this site)" },
          { status: 400 },
        );
      }

      brandId = brand.id;
    }

    const imageMedia = (body.media ?? []).filter((m) => m.type === "image" && String(m.url ?? "").trim());

    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          siteId,
          categoryId: category.id,
          brandId,

          name,
          slug: finalSlug,

          shortDescription: String(body.shortDescription ?? "").trim() || null,
          description: String(body.description ?? "").trim() || null,

          productType: (body.productType ?? "PHYSICAL") as ProductType,
          tags: Array.isArray(body.tags) ? body.tags : [],

          status: (body.status ?? "DRAFT") as ProductStatus,
          isVisible: body.isVisible ?? true,
          publishedAt: parseISODateOrNull(body.publishedAt),

          metaTitle: String(body.metaTitle ?? "").trim() || null,
          metaDescription: String(body.metaDescription ?? "").trim() || null,

          price: parseNumberOrNull(body.price),
          marketPrice: parseNumberOrNull(body.marketPrice),
          savingPrice: parseNumberOrNull(body.savingPrice),
          productQty: parseIntOrDefault(body.productQty, 0),

          weight: parseNumberOrNull(body.weight),
          length: parseNumberOrNull(body.length),
          width: parseNumberOrNull(body.width),
          height: parseNumberOrNull(body.height),
        },
        select: {
          id: true,
        },
      });

      if (imageMedia.length) {
        await tx.productImage.createMany({
          data: imageMedia.map((m, idx) => ({
            productId: product.id,
            variantId: null,
            imageUrl: m.url,
            sortOrder: idx,
          })),
        });
      }

      const fullProduct = await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          brand: true,
          images: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      });

      if (!fullProduct) {
        throw new Error("Failed to load created product");
      }

      return {
        ...fullProduct,
        price: fullProduct.price?.toString() ?? null,
        marketPrice: fullProduct.marketPrice?.toString() ?? null,
        savingPrice: fullProduct.savingPrice?.toString() ?? null,
        weight: fullProduct.weight?.toString() ?? null,
        length: fullProduct.length?.toString() ?? null,
        width: fullProduct.width?.toString() ?? null,
        height: fullProduct.height?.toString() ?? null,
        images: fullProduct.images.map((img) => ({
          id: img.id,
          url: img.imageUrl,
          sort: img.sortOrder,
          createdAt: img.createdAt,
        })),
      };
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    console.error(err);

    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ message: "Duplicate unique value (slug or other unique field)." }, { status: 409 });
    }

    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

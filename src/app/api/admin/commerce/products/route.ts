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

function toIntOrDefault(v: string | number | null | undefined, def = 0) {
  const n = Number(v ?? def);
  return Number.isFinite(n) ? Math.trunc(n) : def;
}

function toDecimalOrNull(v: string | number | null | undefined) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseISODateOrNull(v: string | null | undefined) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
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

/**
 * Query status:
 * - all
 * - draft
 * - active
 * - archived
 */
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

type VariantOption = {
  name: string;
  values: string[];
};

type VariantRow = {
  id?: string;
  title: string;
  sku: string;
  barcode?: string;
  price: string;
  compareAtPrice?: string;
  cost?: string;
  stockQty: string;
  isActive: boolean;
  isDefault: boolean;
};

type ProductSubmitPayload = {
  siteId?: string;

  name: string;
  slug?: string;

  categoryId?: string;
  category?: string; // backward compatibility: id or slug

  brandId?: string;
  brand?: string; // backward compatibility: id, slug, or name

  productType?: ProductType;
  vendor?: string;
  tags?: string[];

  status?: ProductStatus;
  isVisible?: boolean;
  publishedAt?: string;

  shortDescription?: string;
  description?: string;

  cost?: string;
  price?: string;
  compareAtPrice?: string;

  sku?: string;
  barcode?: string;
  stockQty?: string;

  weight?: string;
  length?: string;
  width?: string;
  height?: string;

  metaTitle?: string;
  metaDescription?: string;

  media?: MediaItem[];

  hasVariants?: boolean;
  variantOptions?: VariantOption[];
  variants?: VariantRow[];
};

/* ----------------------------- helpers ----------------------------- */

/**
 * Từ variant.title ("White / S") + thứ tự variantOptions => map { optionName -> optionValue }
 */
function extractVariantSelections(title: string, optionNamesInOrder: string[]) {
  const parts = String(title ?? "")
    .split("/")
    .map((x) => x.trim())
    .filter(Boolean);

  const out: Record<string, string> = {};
  for (let i = 0; i < optionNamesInOrder.length; i++) {
    const name = optionNamesInOrder[i];
    const value = parts[i];
    if (name && value) out[name] = value;
  }
  return out;
}

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

/**
 * GET /api/admin/products
 * Query:
 * - status=all|draft|active|archived
 * - sort=newest|oldest|name_asc|name_desc|updated_desc|updated_asc
 * - page=1
 * - pageSize=50
 * - siteId=... (optional, can be read from cookie)
 */
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

    const where: Prisma.ProductWhereInput = { siteId };
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
          vendor: true,
          tags: true,
          status: true,
          isVisible: true,
          publishedAt: true,
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
            take: 1,
            select: { id: true, imageUrl: true, sortOrder: true },
          },
          variants: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
            take: 1,
            select: {
              id: true,
              sku: true,
              price: true,
              stockQty: true,
              isDefault: true,
            },
          },
        },
      }),
    ]);

    const items = rawItems.map((p) => ({
      ...p,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        sort: img.sortOrder,
      })),
      defaultVariant: p.variants[0] ?? null,
    }));

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}

/* ----------------------------- POST ----------------------------- */

/**
 * POST /api/admin/products
 *
 * Notes:
 * - categoryId is required (or category for backward compatibility: id/slug)
 * - brandId optional (or brand for backward compatibility: id/slug/name)
 * - if hasVariants=false => auto create 1 default variant
 * - if hasVariants=true => create variants + option links
 */
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
      // 1) Product
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
          vendor: String(body.vendor ?? "").trim() || null,
          tags: body.tags ?? [],

          status: (body.status ?? "DRAFT") as ProductStatus,
          isVisible: body.isVisible ?? true,
          publishedAt: parseISODateOrNull(body.publishedAt),

          metaTitle: String(body.metaTitle ?? "").trim() || null,
          metaDescription: String(body.metaDescription ?? "").trim() || null,

          weight: toDecimalOrNull(body.weight),
          length: toDecimalOrNull(body.length),
          width: toDecimalOrNull(body.width),
          height: toDecimalOrNull(body.height),
        },
        select: {
          id: true,
          siteId: true,
          slug: true,
        },
      });

      // 2) Images
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

      // 3) Variants + options
      const hasVariants = Boolean(body.hasVariants);
      const variants = body.variants ?? [];
      const optionNamesInOrder = (body.variantOptions ?? []).map((o) => String(o.name ?? "").trim()).filter(Boolean);

      const optionValueIdByKey = new Map<string, string>();

      if (hasVariants) {
        if (!variants.length) {
          throw new Error("hasVariants=true but variants is empty");
        }

        // 3.1 create unique ProductOptionValue
        const allPairs: { optionName: string; optionValue: string }[] = [];

        for (const v of variants) {
          const sel = extractVariantSelections(v.title, optionNamesInOrder);
          for (const [optionName, optionValue] of Object.entries(sel)) {
            allPairs.push({ optionName, optionValue });
          }
        }

        const uniqPairs = Array.from(new Map(allPairs.map((p) => [`${p.optionName}__${p.optionValue}`, p])).values());

        for (const p of uniqPairs) {
          const createdOv = await tx.productOptionValue.upsert({
            where: {
              productId_optionName_optionValue: {
                productId: product.id,
                optionName: p.optionName,
                optionValue: p.optionValue,
              },
            },
            update: {},
            create: {
              productId: product.id,
              optionName: p.optionName,
              optionValue: p.optionValue,
            },
            select: {
              id: true,
              optionName: true,
              optionValue: true,
            },
          });

          optionValueIdByKey.set(`${createdOv.optionName}__${createdOv.optionValue}`, createdOv.id);
        }

        // 3.2 create variants
        let hasDefault = false;

        for (const v of variants) {
          const sku = String(v.sku ?? "").trim();
          if (!sku) {
            throw new Error(`SKU is required for variant "${v.title || "(untitled)"}"`);
          }

          const isDefault = Boolean(v.isDefault);
          if (isDefault) hasDefault = true;

          const variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              siteId,

              sku,
              title: String(v.title ?? "").trim() || null,
              barcode: String(v.barcode ?? "").trim() || null,

              price: toDecimalOrNull(v.price) ?? 0,
              compareAtPrice: toDecimalOrNull(v.compareAtPrice),
              cost: toDecimalOrNull(v.cost),

              stockQty: toIntOrDefault(v.stockQty, 0),
              isActive: v.isActive ?? true,
              isDefault,
            },
            select: {
              id: true,
              title: true,
            },
          });

          const sel = extractVariantSelections(v.title, optionNamesInOrder);
          const linkData: { variantId: string; optionValueId: string }[] = [];

          for (const [optionName, optionValue] of Object.entries(sel)) {
            const ovId = optionValueIdByKey.get(`${optionName}__${optionValue}`);
            if (ovId) {
              linkData.push({
                variantId: variant.id,
                optionValueId: ovId,
              });
            }
          }

          if (linkData.length) {
            await tx.productVariantOptionValue.createMany({
              data: linkData,
              skipDuplicates: true,
            });
          }
        }

        // nếu frontend không đánh dấu default variant
        if (!hasDefault && variants.length > 0) {
          const firstVariant = await tx.productVariant.findFirst({
            where: { productId: product.id },
            orderBy: { createdAt: "asc" },
            select: { id: true },
          });

          if (firstVariant) {
            await tx.productVariant.update({
              where: { id: firstVariant.id },
              data: { isDefault: true },
            });
          }
        }
      } else {
        const sku = String(body.sku ?? "").trim();
        if (!sku) {
          throw new Error("SKU is required when hasVariants=false");
        }

        await tx.productVariant.create({
          data: {
            productId: product.id,
            siteId,

            sku,
            title: name,
            barcode: String(body.barcode ?? "").trim() || null,

            price: toDecimalOrNull(body.price) ?? 0,
            compareAtPrice: toDecimalOrNull(body.compareAtPrice),
            cost: toDecimalOrNull(body.cost),

            stockQty: toIntOrDefault(body.stockQty, 0),
            isActive: true,
            isDefault: true,
          },
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          brand: true,
          variants: {
            include: {
              optionLinks: {
                include: {
                  optionValue: true,
                },
              },
              images: true,
            },
            orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
          },
          optionValues: true,
          images: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      });
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    console.error(err);

    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { message: "Duplicate unique value (slug, sku, or other unique field)." },
        { status: 409 },
      );
    }

    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

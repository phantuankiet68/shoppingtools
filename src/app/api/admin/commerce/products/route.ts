import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import type { Prisma, ProductStatus } from "@prisma/client";

/* ----------------------------- utils ----------------------------- */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toInt(v: string | null, fallback: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

async function getSiteId(req: Request): Promise<string> {
  const url = new URL(req.url);
  const fromQuery = String(url.searchParams.get("siteId") ?? "").trim();
  if (fromQuery) return fromQuery;

  const cookieStore = await cookies();
  return String(cookieStore.get("siteId")?.value ?? "").trim();
}

/**
 * Map UI filter `active` -> Product.status
 * ⚠️ Bạn cần chỉnh mapping theo enum ProductStatus thực tế.
 */
function whereFromActive(active: string): Prisma.ProductWhereInput | null {
  const a = active.toLowerCase();
  if (a === "all") return null;

  // Ví dụ enum có ACTIVE / INACTIVE:
  if (a === "active") return { status: "ACTIVE" as ProductStatus };
  if (a === "inactive") return { status: "INACTIVE" as ProductStatus };

  return null;
}

function orderByFromSort(sort: string): Prisma.ProductOrderByWithRelationInput {
  const s = sort.toLowerCase();

  if (s === "oldest") return { createdAt: "asc" };
  if (s === "name_asc" || s === "nameasc") return { name: "asc" };
  if (s === "name_desc" || s === "namedesc") return { name: "desc" };

  return { createdAt: "desc" }; // newest
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/* ----------------------------- handlers ----------------------------- */

/**
 * GET /api/admin/products
 * Query:
 * - active=all|active|inactive
 * - sort=newest|oldest|name_asc|name_desc
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
    const active = (url.searchParams.get("active") ?? "all").toLowerCase();
    const sort = (url.searchParams.get("sort") ?? "newest").toLowerCase();

    const page = clamp(toInt(url.searchParams.get("page"), 1), 1, 1_000_000);
    const pageSize = clamp(toInt(url.searchParams.get("pageSize"), 50), 1, 200);
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = { siteId };
    const activeWhere = whereFromActive(active);
    if (activeWhere) Object.assign(where, activeWhere);

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
          name: true,
          slug: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          images: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 1,
            select: { id: true, imageUrl: true, sortOrder: true },
          },
          // Nếu muốn category theo mapping:
          // categoryMap: {
          //   take: 1,
          //   select: { category: { select: { id: true, name: true } } },
          // },
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
      // category: p.categoryMap?.[0]?.category ?? null,
      // categoryId: p.categoryMap?.[0]?.category?.id ?? null,
    }));

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);
    return jsonError("Server error", 500);
  }
}

/**
 * POST /api/admin/products
 * Body:
 * - name: string (required)
 * - slug?: string
 * - description?: string
 * - status?: ProductStatus (default DRAFT)
 * - images?: [{ url, sort }]
 */

type ProductType = "PHYSICAL" | "DIGITAL" | "SERVICE";

type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbUrl?: string;
};

type VariantOption = { name: string; values: string[] };

type VariantRow = {
  id: string;
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

type AttributeValue = {
  attributeId: string;
  value: string;
};

type ProductSubmitPayload = {
  // identity
  name: string;
  slug: string;

  /**
   * ✅ FIX: Frontend đang dùng categoryId
   * - categoryId: id category (khuyến nghị)
   * - category: giữ tương thích cũ (slug hoặc id)
   */
  categoryId?: string;
  category?: string;

  productType: ProductType;
  brand: string;
  vendor: string;
  tags: string[];

  // lifecycle
  status: ProductStatus;
  isVisible: boolean;
  publishedAt: string;

  // descriptions
  shortDescription: string;
  description: string;

  // pricing default
  cost: string;
  price: string;
  compareAtPrice: string;

  // inventory default
  sku: string;
  barcode: string;
  trackInventory: boolean;
  stockQty: string;
  lowStockThreshold: string;
  allowBackorder: boolean;

  // shipping defaults
  requiresShipping: boolean;
  weight: string;
  length: string;
  width: string;
  height: string;

  // SEO
  metaTitle: string;
  metaDescription: string;

  // extras
  media: MediaItem[];
  hasVariants: boolean;
  variantOptions: VariantOption[];
  variants: VariantRow[];
  specs: AttributeValue[];

  // REQUIRED for DB
  siteId: string;
};

// -----------------------
// Helpers
// -----------------------
function toDecimalOrNull(v: string) {
  const s = (v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return n;
}

function toIntOrDefault(v: string, def = 0) {
  const n = Number((v ?? "").trim());
  return Number.isFinite(n) ? Math.trunc(n) : def;
}

function parseISODateOrNull(v: string) {
  const s = (v ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Từ variant.title ("White / S") + thứ tự variantOptions => map { optionName -> optionValue }
 */
function extractVariantSelections(title: string, optionNamesInOrder: string[]) {
  const parts = title.split("/").map((x) => x.trim());
  const out: Record<string, string> = {};
  for (let i = 0; i < optionNamesInOrder.length; i++) {
    const name = optionNamesInOrder[i];
    const value = parts[i];
    if (name && value) out[name] = value;
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminAuthUser();

    const body = (await req.json()) as Partial<ProductSubmitPayload>;

    // Basic validation
    if (!body?.siteId) return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    if (!body?.name?.trim()) return NextResponse.json({ message: "name is required" }, { status: 400 });
    if (!body?.slug?.trim()) return NextResponse.json({ message: "slug is required" }, { status: 400 });

    // ✅ FIX: accept categoryId OR category
    const categoryInput = String(body.categoryId ?? body.category ?? "").trim();
    if (!categoryInput) {
      return NextResponse.json({ message: "categoryId is required" }, { status: 400 });
    }

    const siteId = body.siteId;

    // Resolve category:
    // - categoryInput có thể là id hoặc slug
    const category = await prisma.productCategory.findFirst({
      where: {
        siteId,
        OR: [{ id: categoryInput }, { slug: categoryInput }],
      },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found (provide valid category id or slug for this site)" },
        { status: 400 },
      );
    }

    // Prepare images
    const imageMedia = (body.media ?? []).filter((m) => m.type === "image");

    // Transaction create all
    const created = await prisma.$transaction(async (tx) => {
      // 1) Product
      const product = await tx.product.create({
        data: {
          siteId,
          name: body.name!.trim(),
          slug: body.slug!.trim(),

          shortDescription: body.shortDescription?.trim() || null,
          description: body.description?.trim() || null,

          productType: (body.productType ?? "PHYSICAL") as ProductType,
          brand: body.brand?.trim() || null,
          vendor: body.vendor?.trim() || null,
          tags: body.tags ?? [],

          status: (body.status ?? "DRAFT") as ProductStatus,
          isVisible: body.isVisible ?? true,
          publishedAt: parseISODateOrNull(body.publishedAt ?? ""),

          metaTitle: body.metaTitle?.trim() || null,
          metaDescription: body.metaDescription?.trim() || null,

          // shipping defaults
          weight: toDecimalOrNull(body.weight ?? ""),
          length: toDecimalOrNull(body.length ?? ""),
          width: toDecimalOrNull(body.width ?? ""),
          height: toDecimalOrNull(body.height ?? ""),
        },
        select: { id: true, siteId: true, slug: true },
      });

      // 2) Category map
      await tx.productCategoryMap.create({
        data: { productId: product.id, categoryId: category.id },
      });

      // 3) Images
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

      // 4) Variants + options
      const hasVariants = Boolean(body.hasVariants);
      const optionNamesInOrder = (body.variantOptions ?? [])
        .map((o) => o.name?.trim())
        .filter((x): x is string => Boolean(x));

      // ProductOptionValue cache: key = `${name}__${value}` -> id
      const optionValueIdByKey = new Map<string, string>();

      if (hasVariants) {
        const variants = body.variants ?? [];
        if (!variants.length) {
          throw new Error("hasVariants=true but variants is empty");
        }

        // 4.1) Create all ProductOptionValue (unique)
        const allPairs: { optionName: string; optionValue: string }[] = [];
        for (const v of variants) {
          const sel = extractVariantSelections(v.title, optionNamesInOrder);
          for (const [optionName, optionValue] of Object.entries(sel)) {
            allPairs.push({ optionName, optionValue });
          }
        }

        // unique pairs
        const uniqPairs = Array.from(new Map(allPairs.map((p) => [`${p.optionName}__${p.optionValue}`, p])).values());

        if (uniqPairs.length) {
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
              select: { id: true, optionName: true, optionValue: true },
            });
            optionValueIdByKey.set(`${createdOv.optionName}__${createdOv.optionValue}`, createdOv.id);
          }
        }

        // 4.2) Create variants, then link to option values
        for (const v of variants) {
          const variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              siteId,

              sku: v.sku.trim(),
              title: v.title?.trim() || null,
              isActive: v.isActive ?? true,

              price: toDecimalOrNull(v.price) ?? 0,
              compareAtPrice: toDecimalOrNull(v.compareAtPrice ?? ""),
              cost: toDecimalOrNull(v.cost ?? ""),

              stockQty: toIntOrDefault(v.stockQty, 0),
              barcode: v.barcode?.trim() || null,
              isDefault: v.isDefault ?? false,
            },
            select: { id: true, title: true },
          });

          const sel = extractVariantSelections(v.title, optionNamesInOrder);
          const linkData: { variantId: string; optionValueId: string }[] = [];

          for (const [optionName, optionValue] of Object.entries(sel)) {
            const ovId = optionValueIdByKey.get(`${optionName}__${optionValue}`);
            if (ovId) linkData.push({ variantId: variant.id, optionValueId: ovId });
          }

          if (linkData.length) {
            await tx.productVariantOptionValue.createMany({ data: linkData, skipDuplicates: true });
          }
        }
      } else {
        // Non-variant: tạo 1 default variant để quản lý giá/tồn kho thống nhất
        const sku = (body.sku ?? "").trim();
        if (!sku) throw new Error("SKU is required when hasVariants=false");

        await tx.productVariant.create({
          data: {
            productId: product.id,
            siteId,
            sku,
            title: body.name?.trim() || null,
            isActive: true,
            price: toDecimalOrNull(body.price ?? "") ?? 0,
            compareAtPrice: toDecimalOrNull(body.compareAtPrice ?? ""),
            cost: toDecimalOrNull(body.cost ?? ""),
            stockQty: toIntOrDefault(body.stockQty ?? "0", 0),
            barcode: body.barcode?.trim() || null,
            isDefault: true,
          },
        });
      }

      // 5) Specs (ProductAttributeValue)
      const specs = body.specs ?? [];
      if (specs.length) {
        const attributeIds = Array.from(new Set(specs.map((s) => s.attributeId)));
        const attrs = await tx.productAttribute.findMany({
          where: { id: { in: attributeIds }, siteId },
          include: { options: true },
        });
        const attrById = new Map(attrs.map((a) => [a.id, a]));

        for (const s of specs) {
          const attr = attrById.get(s.attributeId);
          if (!attr) continue;

          const raw = (s.value ?? "").trim();
          if (!raw) continue;

          const values =
            attr.type === "MULTISELECT"
              ? raw
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean)
              : [raw];

          for (const val of values) {
            if (attr.type === "TEXT") {
              await tx.productAttributeValue.create({
                data: {
                  productId: product.id,
                  variantId: null,
                  attributeId: attr.id,
                  valueText: val,
                },
              });
            } else if (attr.type === "NUMBER") {
              const num = toDecimalOrNull(val);
              if (num === null) continue;
              await tx.productAttributeValue.create({
                data: {
                  productId: product.id,
                  variantId: null,
                  attributeId: attr.id,
                  valueNumber: num,
                },
              });
            } else if (attr.type === "BOOLEAN") {
              const b = val === "true" ? true : val === "false" ? false : null;
              if (b === null) continue;
              await tx.productAttributeValue.create({
                data: {
                  productId: product.id,
                  variantId: null,
                  attributeId: attr.id,
                  valueBool: b,
                },
              });
            } else if (attr.type === "DATE") {
              const d = parseISODateOrNull(val);
              if (!d) continue;
              await tx.productAttributeValue.create({
                data: {
                  productId: product.id,
                  variantId: null,
                  attributeId: attr.id,
                  valueDate: d,
                },
              });
            } else if (attr.type === "SELECT" || attr.type === "MULTISELECT") {
              const opt = attr.options.find((o) => o.value === val);
              if (!opt) continue;

              await tx.productAttributeValue.create({
                data: {
                  productId: product.id,
                  variantId: null,
                  attributeId: attr.id,
                  optionId: opt.id,
                },
              });
            }
          }
        }
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          variants: { include: { optionLinks: true } },
          optionValues: true,
          images: true,
          categoryMap: true,
          attributeValues: true,
        },
      });
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

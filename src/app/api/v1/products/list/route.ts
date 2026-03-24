import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductStatus, type Prisma } from "@prisma/client";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function resolveSiteId(req: Request): Promise<{ siteId: string; domain: string }> {
  const url = new URL(req.url);
  const qpSiteId = String(url.searchParams.get("siteId") ?? "").trim();

  const hostHeader = req.headers.get("x-site-domain") ?? req.headers.get("host") ?? "";
  const domain = hostHeader.split(":")[0].toLowerCase();

  if (qpSiteId) return { siteId: qpSiteId, domain };

  if (domain && domain !== "localhost" && domain !== "127.0.0.1") {
    const site = await prisma.site.findUnique({
      where: { domain },
      select: { id: true },
    });

    if (site?.id) return { siteId: site.id, domain };
  }

  const defaultSite = await prisma.site.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, domain: true },
  });

  if (defaultSite) {
    return {
      siteId: defaultSite.id,
      domain: defaultSite.domain,
    };
  }

  return { siteId: "", domain };
}

function toNumberOrNull(value: Prisma.Decimal | null | undefined): number | null {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function buildStockText(qty: number | null | undefined): string | null {
  if (typeof qty !== "number") return null;
  if (qty <= 0) return "Out of stock";
  if (qty <= 8) return `Only ${qty} left in stock`;
  if (qty <= 24) return "Low stock";
  return "In stock";
}

function toPositiveInt(value: string | null, fallback: number) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return Math.floor(num);
}

export async function GET(req: Request) {
  try {
    const { siteId, domain } = await resolveSiteId(req);

    if (!siteId) {
      return jsonError(`Missing siteId. Query param not found and no site matched domain: ${domain || "(empty)"}`, 400);
    }

    const url = new URL(req.url);

    const page = toPositiveInt(url.searchParams.get("page"), 1);
    const size = Math.min(toPositiveInt(url.searchParams.get("size"), 12), 100);

    const q = String(url.searchParams.get("q") ?? "").trim();
    const categorySlug = String(url.searchParams.get("category") ?? "").trim();
    const brandSlug = String(url.searchParams.get("brand") ?? "").trim();
    const sort = String(url.searchParams.get("sort") ?? "newest").trim();

    const where: Prisma.ProductWhereInput = {
      siteId,
      deletedAt: null,
      isVisible: true,
      status: ProductStatus.ACTIVE,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { slug: { contains: q } },
              { shortDescription: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
      ...(categorySlug
        ? {
            category: {
              slug: categorySlug,
            },
          }
        : {}),
      ...(brandSlug
        ? {
            brand: {
              slug: brandSlug,
            },
          }
        : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      sort === "price_asc"
        ? [{ price: "asc" }, { createdAt: "desc" }]
        : sort === "price_desc"
          ? [{ price: "desc" }, { createdAt: "desc" }]
          : sort === "name_asc"
            ? [{ name: "asc" }]
            : sort === "name_desc"
              ? [{ name: "desc" }]
              : [{ createdAt: "desc" }];

    const skip = (page - 1) * size;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: size,
        select: {
          id: true,
          siteId: true,
          name: true,
          slug: true,
          shortDescription: true,
          productType: true,
          tags: true,
          status: true,
          isVisible: true,
          metaTitle: true,
          metaDescription: true,
          price: true,
          marketPrice: true,
          savingPrice: true,
          productQty: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
          images: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 2,
            select: {
              id: true,
              imageUrl: true,
              sortOrder: true,
              createdAt: true,
              variantId: true,
            },
          },
          variants: {
            where: {
              deletedAt: null,
              isActive: true,
            },
            orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
            take: 1,
            select: {
              id: true,
              sku: true,
              title: true,
              isActive: true,
              isDefault: true,
              price: true,
              compareAtPrice: true,
              stockQty: true,
              barcode: true,
              createdAt: true,
              images: {
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
                take: 1,
                select: {
                  id: true,
                  imageUrl: true,
                  sortOrder: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const items = products.map((product) => {
      const defaultVariant = product.variants[0] ?? null;
      const mainImage = product.images[0] ?? defaultVariant?.images[0] ?? null;

      const productPrice = toNumberOrNull(product.price);
      const productMarketPrice = toNumberOrNull(product.marketPrice);
      const productSavingPrice = toNumberOrNull(product.savingPrice);

      const variantPrice = toNumberOrNull(defaultVariant?.price);
      const variantCompareAtPrice = toNumberOrNull(defaultVariant?.compareAtPrice);

      const finalPrice = productPrice ?? variantPrice;
      const finalMarketPrice = productMarketPrice ?? variantCompareAtPrice;

      const discountPercent =
        typeof finalPrice === "number" && typeof finalMarketPrice === "number" && finalMarketPrice > finalPrice
          ? Math.round(((finalMarketPrice - finalPrice) / finalMarketPrice) * 100)
          : null;

      const derivedSavingPrice =
        productSavingPrice ??
        (typeof finalPrice === "number" && typeof finalMarketPrice === "number" && finalMarketPrice > finalPrice
          ? finalMarketPrice - finalPrice
          : null);

      return {
        id: product.id,
        siteId: product.siteId,
        name: product.name,
        slug: product.slug,
        href: product.slug ? `/product-detail/${product.slug}` : null,
        shortDescription: product.shortDescription,
        productType: product.productType,
        tags: product.tags,
        status: product.status,
        isVisible: product.isVisible,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,

        sku: defaultVariant?.sku ?? null,
        defaultVariantId: defaultVariant?.id ?? null,

        price: finalPrice,
        marketPrice: finalMarketPrice,
        savingPrice: derivedSavingPrice,
        discountPercent,

        productQty: product.productQty,
        stockText: buildStockText(product.productQty),

        publishedAt: product.publishedAt,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,

        category: product.category,
        brand: product.brand,

        image: mainImage
          ? {
              id: mainImage.id,
              url: mainImage.imageUrl,
              sort: mainImage.sortOrder,
              createdAt: mainImage.createdAt,
            }
          : null,

        images: product.images.map((img) => ({
          id: img.id,
          url: img.imageUrl,
          sort: img.sortOrder,
          createdAt: img.createdAt,
          variantId: img.variantId,
        })),

        variant: defaultVariant
          ? {
              id: defaultVariant.id,
              sku: defaultVariant.sku,
              title: defaultVariant.title,
              isActive: defaultVariant.isActive,
              isDefault: defaultVariant.isDefault,
              price: toNumberOrNull(defaultVariant.price),
              compareAtPrice: toNumberOrNull(defaultVariant.compareAtPrice),
              stockQty: defaultVariant.stockQty,
              barcode: defaultVariant.barcode,
              createdAt: defaultVariant.createdAt,
              images: defaultVariant.images.map((img) => ({
                id: img.id,
                url: img.imageUrl,
                sort: img.sortOrder,
                createdAt: img.createdAt,
              })),
            }
          : null,
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / size));

    return NextResponse.json({
      siteId,
      domain,
      filters: {
        q: q || null,
        category: categorySlug || null,
        brand: brandSlug || null,
        sort,
      },
      pagination: {
        page,
        size,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
      items,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return jsonError(message, 500);
  }
}

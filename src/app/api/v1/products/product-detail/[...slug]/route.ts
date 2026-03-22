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

function normalizeSlugParts(parts?: string[]): string[] {
  if (!Array.isArray(parts)) return [];

  return parts
    .map((item) => decodeURIComponent(String(item ?? "")).trim())
    .filter(Boolean);
}

function buildCandidateSlugs(parts: string[]): string[] {
  if (parts.length === 0) return [];

  const joined = parts.join("/").trim();
  const last = parts[parts.length - 1]?.trim();

  return Array.from(new Set([joined, last].filter(Boolean)));
}

function buildStockText(qty: number | null | undefined): string | null {
  if (typeof qty !== "number") return null;
  if (qty <= 0) return "Out of stock";
  if (qty <= 8) return `Only ${qty} left in stock`;
  if (qty <= 24) return "Low stock";
  return "In stock";
}

function toNumberOrNull(value: Prisma.Decimal | null | undefined): number | null {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ slug?: string[] }> | { slug?: string[] } },
) {
  try {
    const { siteId, domain } = await resolveSiteId(req);

    if (!siteId) {
      return jsonError(
        `Missing siteId. Query param not found and no site matched domain: ${domain || "(empty)"}`,
        400,
      );
    }

    const resolvedParams = await context.params;
    const slugParts = normalizeSlugParts(resolvedParams?.slug);
    const candidateSlugs = buildCandidateSlugs(slugParts);

    if (candidateSlugs.length === 0) {
      return jsonError("Missing product slug", 400);
    }

    const where: Prisma.ProductWhereInput = {
      siteId,
      deletedAt: null,
      isVisible: true,
      status: ProductStatus.ACTIVE,
      slug: {
        in: candidateSlugs,
      },
    };

    const product = await prisma.product.findFirst({
      where,
      select: {
        id: true,
        siteId: true,
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
    });

    if (!product) {
      return jsonError(`Product not found with slug: ${candidateSlugs.join(", ")}`, 404);
    }

    const defaultVariant =
      product.variants.find((variant) => variant.isDefault) ??
      product.variants.find((variant) => variant.isActive) ??
      null;

    const mainImage = product.images[0] ?? defaultVariant?.images[0] ?? null;

    const productPrice = toNumberOrNull(product.price);
    const productMarketPrice = toNumberOrNull(product.marketPrice);
    const productSavingPrice = toNumberOrNull(product.savingPrice);

    const variantPrice = toNumberOrNull(defaultVariant?.price);
    const variantCompareAtPrice = toNumberOrNull(defaultVariant?.compareAtPrice);

    const finalPrice = productPrice ?? variantPrice;
    const finalMarketPrice = productMarketPrice ?? variantCompareAtPrice;

    const discountPercent =
      typeof finalPrice === "number" &&
      typeof finalMarketPrice === "number" &&
      finalMarketPrice > finalPrice
        ? Math.round(((finalMarketPrice - finalPrice) / finalMarketPrice) * 100)
        : null;

    const derivedSavingPrice =
      productSavingPrice ??
      (typeof finalPrice === "number" &&
      typeof finalMarketPrice === "number" &&
      finalMarketPrice > finalPrice
        ? finalMarketPrice - finalPrice
        : null);

    return NextResponse.json({
      siteId,
      domain,
      product: {
        id: product.id,
        siteId: product.siteId,
        name: product.name,
        slug: product.slug,
        href: product.slug ? `/product-detail/${product.slug}` : null,
        shortDescription: product.shortDescription,
        description: product.description,
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

        shippingNote: "Fast local delivery available",

        weight: toNumberOrNull(product.weight),
        length: toNumberOrNull(product.length),
        width: toNumberOrNull(product.width),
        height: toNumberOrNull(product.height),

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

        variants: product.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          title: variant.title,
          isActive: variant.isActive,
          isDefault: variant.isDefault,
          price: toNumberOrNull(variant.price),
          compareAtPrice: toNumberOrNull(variant.compareAtPrice),
          stockQty: variant.stockQty,
          barcode: variant.barcode,
          createdAt: variant.createdAt,
          images: variant.images.map((img) => ({
            id: img.id,
            url: img.imageUrl,
            sort: img.sortOrder,
            createdAt: img.createdAt,
          })),
        })),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return jsonError(message, 500);
  }
}
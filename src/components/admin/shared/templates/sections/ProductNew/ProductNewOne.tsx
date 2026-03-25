"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import styles from "@/styles/templates/sections/ProductNew/ProductNewOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type ProductNewOneItem = {
  id?: string | number;
  name: string;
  href: string;
  imageSrc: string;
  brand?: string;
  badge?: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  soldText?: string;
  rating?: number;
  reviewCount?: number;
  stockText?: string;
  shippingNote?: string;
  tag?: string;
  isNew?: boolean;
};

export type ProductNewOneBanner = {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  href?: string;
  ctaText?: string;
};

export type ProductNewOneProps = {
  title?: string;
  subtitle?: string;
  viewAllText?: string;
  viewAllHref?: string;
  products?: ProductNewOneItem[];
  apiUrl?: string;
  banner?: ProductNewOneBanner;
  preview?: boolean;
  sectionAriaLabel?: string;
};

type ApiUnknownRecord = Record<string, unknown>;

/* ================= Defaults ================= */
const PRODUCTS_API_URL = "/api/v1/products/popular";

const DEFAULT_BANNER: ProductNewOneBanner = {
  title: "Premium Beauty Picks",
  subtitle: "Explore trusted skincare and wellness essentials curated for everyday confidence.",
  imageSrc: "/assets/images/new-product.png",
  href: "/collections/beauty",
  ctaText: "Explore Collection",
};

/* ================= Helpers ================= */
function safeJson<T>(raw?: unknown): T | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function toStringSafe(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function formatPrice(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `${new Intl.NumberFormat("en-US").format(value)} VND`;
}

function formatCompactCount(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function getImageFromRecord(item: ApiUnknownRecord): string {
  const imageObject = item.image && typeof item.image === "object" ? (item.image as ApiUnknownRecord) : undefined;
  const thumbnailObject =
    item.thumbnail && typeof item.thumbnail === "object" ? (item.thumbnail as ApiUnknownRecord) : undefined;
  const coverImageObject =
    item.coverImage && typeof item.coverImage === "object" ? (item.coverImage as ApiUnknownRecord) : undefined;

  const direct =
    toStringSafe(item.imageSrc) ||
    toStringSafe(item.image) ||
    toStringSafe(item.thumbnail) ||
    toStringSafe(item.thumb) ||
    toStringSafe(item.photo) ||
    toStringSafe(item.coverImage) ||
    toStringSafe(imageObject?.url) ||
    toStringSafe(imageObject?.src) ||
    toStringSafe(thumbnailObject?.url) ||
    toStringSafe(thumbnailObject?.src) ||
    toStringSafe(coverImageObject?.url) ||
    toStringSafe(coverImageObject?.src);

  if (direct) return direct;

  const images = item.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];

    if (typeof first === "string") return first;

    if (first && typeof first === "object") {
      const firstObj = first as ApiUnknownRecord;
      return (
        toStringSafe(firstObj.url) ||
        toStringSafe(firstObj.src) ||
        toStringSafe(firstObj.image) ||
        toStringSafe(firstObj.imageSrc) ||
        "/images/placeholder-product.png"
      );
    }
  }

  return "/images/placeholder-product.png";
}

function buildHrefFromRecord(item: ApiUnknownRecord): string {
  const href = toStringSafe(item.href);
  if (href) return href;

  const slug = toStringSafe(item.slug);
  if (slug) return `/products/${slug}`;

  const id = item._id ?? item.id;
  if (typeof id === "string" || typeof id === "number") {
    return `/products/${String(id)}`;
  }

  return "/";
}

function computeRating(raw: ApiUnknownRecord): number | undefined {
  const rating = toNumber(raw.rating ?? raw.averageRating ?? raw.avgRating, NaN);
  if (!Number.isFinite(rating) || rating <= 0) return undefined;
  return Math.max(0, Math.min(5, Number(rating.toFixed(1))));
}

function computeReviewCount(raw: ApiUnknownRecord): number | undefined {
  const value = toNumber(raw.reviewCount ?? raw.reviewsCount ?? raw.totalReviews ?? raw.numReviews, NaN);
  if (!Number.isFinite(value) || value < 0) return undefined;
  return Math.round(value);
}

function buildInventoryText(raw: ApiUnknownRecord): string | undefined {
  const stock = toNumber(raw.stock ?? raw.inventory ?? raw.quantity ?? raw.productQty, NaN);
  if (!Number.isFinite(stock)) return undefined;
  if (stock <= 0) return "Out of stock";
  if (stock <= 10) return `Only ${stock} left`;
  return "In stock";
}

function detectBrandFromName(name: string, fallback?: string): string | undefined {
  if (fallback) return fallback;
  const words = name.trim().split(/\s+/).slice(0, 2).join(" ").toUpperCase();
  return words || undefined;
}

function normalizeProductItem(raw: unknown, index: number): ProductNewOneItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as ApiUnknownRecord;
  const brandObject = item.brand && typeof item.brand === "object" ? (item.brand as ApiUnknownRecord) : undefined;

  const name =
    toStringSafe(item.name) ||
    toStringSafe(item.title) ||
    toStringSafe(item.productName) ||
    toStringSafe(item.product_title);

  if (!name) return null;

  const price = toNumber(item.salePrice ?? item.price ?? item.finalPrice, NaN);
  const originalPrice = toNumber(
    item.originalPrice ?? item.compareAtPrice ?? item.oldPrice ?? item.listPrice ?? item.marketPrice,
    NaN,
  );

  const discountFallback = toNumber(item.discountPercent ?? item.discount, NaN);
  const discountPercent = Number.isFinite(discountFallback)
    ? Math.max(0, Math.round(discountFallback))
    : Number.isFinite(price) && Number.isFinite(originalPrice) && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  const soldCount = toNumber(item.sold ?? item.soldCount ?? item.stockSold ?? item.ordersCount ?? item.totalSold, 0);
  const reviewCount = computeReviewCount(item);
  const rating = computeRating(item);

  return {
    id: (item.id as string | number | undefined) ?? (item._id as string | number | undefined) ?? index + 1,
    name,
    href: buildHrefFromRecord(item),
    imageSrc: getImageFromRecord(item),
    brand: detectBrandFromName(
      name,
      toStringSafe(item.brand) ||
        toStringSafe(brandObject?.name) ||
        toStringSafe(item.brandName) ||
        toStringSafe(item.vendor),
    ),
    badge: toStringSafe(item.badge) || "Best Seller",
    price: Number.isFinite(price) ? price : undefined,
    originalPrice: Number.isFinite(originalPrice) && originalPrice > 0 ? originalPrice : undefined,
    discountPercent,
    soldText: soldCount > 0 ? `${formatCompactCount(soldCount)} sold` : undefined,
    rating,
    reviewCount,
    stockText: toStringSafe(item.stockText) || buildInventoryText(item),
    shippingNote: toStringSafe(item.shippingNote) || "Fast delivery",
    tag:
      toStringSafe(item.tag) ||
      toStringSafe(item.code) ||
      toStringSafe(item.sku) ||
      (Array.isArray(item.tags) && item.tags.length > 0 ? toStringSafe(item.tags[0]) : "") ||
      undefined,
    isNew: Boolean(item.isNew),
  };
}

function extractProductsFromResponse(data: unknown): ProductNewOneItem[] {
  const source = data as
    | ProductNewOneItem[]
    | { data?: unknown; items?: unknown; products?: unknown; result?: unknown };

  const candidates = Array.isArray(source)
    ? source
    : Array.isArray(source?.data)
      ? source.data
      : Array.isArray(source?.items)
        ? source.items
        : Array.isArray(source?.products)
          ? source.products
          : Array.isArray(source?.result)
            ? source.result
            : [];

  return candidates
    .map((item, index) => normalizeProductItem(item, index))
    .filter((item): item is ProductNewOneItem => Boolean(item));
}

function getDiscountPercent(item: ProductNewOneItem): number {
  if (typeof item.discountPercent === "number") return Math.max(0, Math.round(item.discountPercent));
  if (typeof item.originalPrice === "number" && typeof item.price === "number" && item.originalPrice > item.price) {
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  }
  return 0;
}

function getProductAriaLabel(item: ProductNewOneItem): string {
  const price = typeof item.price === "number" ? `, price ${formatPrice(item.price)}` : "";
  const discount = getDiscountPercent(item);
  const savings = discount > 0 ? `, discount ${discount}%` : "";
  return `${item.name}${price}${savings}`;
}

function renderStars(rating?: number): string {
  if (!rating) return "";
  const rounded = Math.round(rating);
  return `${"★".repeat(Math.max(0, Math.min(5, rounded)))}${"☆".repeat(Math.max(0, 5 - rounded))}`;
}

/* ================= Component ================= */
export function ProductNewOne({
  title = "New Arrivals",
  subtitle = "Fresh picks designed to bring premium quality, style, and everyday value.",
  viewAllText = "View All Products",
  viewAllHref = "/products",
  products,
  apiUrl = PRODUCTS_API_URL,
  banner = DEFAULT_BANNER,
  preview = false,
  sectionAriaLabel = "New products section",
}: ProductNewOneProps) {
  const regionId = useId();
  const [remoteProducts, setRemoteProducts] = useState<ProductNewOneItem[]>([]);
  const [loading, setLoading] = useState(false);

  const items = useMemo(() => {
    if (Array.isArray(products) && products.length > 0) return products.slice(0, 8);
    return remoteProducts.slice(0, 8);
  }, [products, remoteProducts]);

  const headingId = `${regionId}-product-new-one-heading`;
  const descriptionId = `${regionId}-product-new-one-description`;

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) return;

    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const data = (await res.json()) as unknown;
        const normalized = extractProductsFromResponse(data);
        setRemoteProducts(normalized);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("ProductNewOne fetch error:", error);
        setRemoteProducts([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchProducts();

    return () => controller.abort();
  }, [apiUrl, products]);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const renderProductLink = (item: ProductNewOneItem, children: React.ReactNode) =>
    preview ? (
      <a href="#" onClick={onBlockClick} className={styles.cardLink} aria-label={getProductAriaLabel(item)}>
        {children}
      </a>
    ) : (
      <Link href={(item.href || "/") as Route} className={styles.cardLink} aria-label={getProductAriaLabel(item)}>
        {children}
      </Link>
    );

  const renderBannerLink = (children: React.ReactNode) =>
    preview ? (
      <a href="#" onClick={onBlockClick} className={styles.promoLink} aria-label="Promotional collection banner">
        {children}
      </a>
    ) : (
      <Link
        href={(banner.href || "/collections") as Route}
        className={styles.promoLink}
        aria-label="Promotional collection banner"
      >
        {children}
      </Link>
    );

  return (
    <section
      className={styles.section}
      aria-label={sectionAriaLabel}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      <div className={styles.shell}>
        <div className={styles.hero}>
          <div className={styles.heroMain}>
            <div className={styles.heroTop}>
              <span className={styles.kicker}>New collection</span>
              <div className={styles.heroLine} aria-hidden="true" />
            </div>

            <div className={styles.heroContent}>
              <div className={styles.headingGroup}>
                <h2 className={styles.title} id={headingId}>
                  {title}
                </h2>
                <p className={styles.subtitle} id={descriptionId}>
                  {subtitle}
                </p>
              </div>

              <div className={styles.heroMeta} aria-label="Store highlights">
                <span className={styles.metaChip}>Secure checkout</span>
                <span className={styles.metaChip}>Fast delivery</span>
                <span className={styles.metaChip}>Best-selling picks</span>
              </div>
            </div>
          </div>

          <div className={styles.heroAction}>
            {preview ? (
              <a href="#" onClick={onBlockClick} className={styles.viewAllBtn}>
                <span>{viewAllText}</span>
                <span className={styles.btnArrow} aria-hidden="true">
                  →
                </span>
              </a>
            ) : (
              <Link href={(viewAllHref || "/products") as Route} className={styles.viewAllBtn}>
                <span>{viewAllText}</span>
                <span className={styles.btnArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </div>
        </div>

        <div className={styles.layout}>
          <aside className={styles.promoColumn}>
            {renderBannerLink(
              <div className={styles.promoCard}>
                <div className={styles.promoMedia}>
                  <Image
                    src={banner.imageSrc || DEFAULT_BANNER.imageSrc || "/images/placeholder-product.png"}
                    alt={banner.title || "Collection banner"}
                    fill
                    className={styles.promoImage}
                    sizes="(max-width: 991px) 100vw, 380px"
                    priority
                  />
                </div>

                <div className={styles.promoOverlay} />

                <div className={styles.promoContent}>
                  <span className={styles.promoBadge}>Featured Collection</span>
                  <h3 className={styles.promoTitle}>{banner.title || DEFAULT_BANNER.title}</h3>
                  <p className={styles.promoSubtitle}>{banner.subtitle || DEFAULT_BANNER.subtitle}</p>

                  <div className={styles.promoFooter}>
                    <span className={styles.promoCta}>{banner.ctaText || DEFAULT_BANNER.ctaText}</span>
                    <span className={styles.promoMeta}>Trusted by modern shoppers</span>
                  </div>
                </div>
              </div>,
            )}
          </aside>

          <div className={styles.gridColumn}>
            {loading && items.length === 0 ? (
              <div className={styles.emptyState} role="status" aria-live="polite">
                Loading products...
              </div>
            ) : items.length === 0 ? (
              <div className={styles.emptyState} role="status" aria-live="polite">
                No products available right now.
              </div>
            ) : (
              <div className={styles.grid} role="list">
                {items.map((item, index) => {
                  const discount = getDiscountPercent(item);

                  return (
                    <article className={styles.card} key={item.id ?? index} role="listitem">
                      {renderProductLink(
                        item,
                        <>
                          <div className={styles.mediaArea}>
                            <div className={styles.topBadges}>
                              {item.badge ? <span className={styles.primaryBadge}>{item.badge}</span> : null}
                              {item.isNew ? <span className={styles.secondaryBadge}>New</span> : null}
                            </div>

                            {discount > 0 ? (
                              <span className={styles.discountBadge} aria-label={`${discount}% discount`}>
                                Save {discount}%
                              </span>
                            ) : null}

                            <div className={styles.imageWrap}>
                              <Image
                                src={item.imageSrc}
                                alt={item.name}
                                fill
                                className={styles.productImage}
                                sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                priority={index < 4}
                              />
                            </div>
                          </div>

                          <div className={styles.content}>
                            <h3 className={styles.productName}>{item.name}</h3>

                            {(typeof item.rating === "number" || typeof item.reviewCount === "number") && (
                              <div className={styles.reviewRow} aria-label="Product rating and review summary">
                                {typeof item.rating === "number" ? (
                                  <>
                                    <span className={styles.stars} aria-hidden="true">
                                      {renderStars(item.rating)}
                                    </span>
                                    <span className={styles.ratingValue}>{item.rating.toFixed(1)}</span>
                                  </>
                                ) : null}

                                {typeof item.reviewCount === "number" ? (
                                  <span className={styles.reviewCount}>
                                    {formatCompactCount(item.reviewCount)} reviews
                                  </span>
                                ) : null}
                              </div>
                            )}

                            <div className={styles.priceRow}>
                              {typeof item.price === "number" ? (
                                <span className={styles.currentPrice}>{formatPrice(item.price)}</span>
                              ) : null}

                              {typeof item.originalPrice === "number" ? (
                                <span className={styles.oldPrice}>{formatPrice(item.originalPrice)}</span>
                              ) : null}
                            </div>

                            <div className={styles.metaInfo}>
                              {item.soldText ? <span className={styles.metaPill}>{item.soldText}</span> : null}
                              <span className={styles.metaPill}>{item.stockText || "In stock"}</span>
                              <span className={styles.metaPill}>{item.shippingNote || "Fast delivery"}</span>
                            </div>

                            <div className={styles.bottomRow}>
                              <span className={styles.trustNote}>Secure payment available</span>
                              <span className={styles.ctaText}>Shop now</span>
                            </div>
                          </div>
                        </>,
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_PRODUCT_NEW_ONE: RegItem = {
  kind: "ProductNewOne",
  label: "Product New One",
  defaults: {
    title: "New Arrivals",
    subtitle: "Fresh picks designed to bring premium quality, style, and everyday value.",
    viewAllText: "View All Products",
    viewAllHref: "/products",
    apiUrl: PRODUCTS_API_URL,
    products: JSON.stringify([], null, 2),
    banner: JSON.stringify(DEFAULT_BANNER, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "textarea", rows: 3 },
    { key: "viewAllText", label: "View all text", kind: "text" },
    { key: "viewAllHref", label: "View all URL", kind: "text" },
    { key: "apiUrl", label: "Products API URL", kind: "text" },
    { key: "products", label: "Products override (JSON)", kind: "textarea", rows: 12 },
    { key: "banner", label: "Banner (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (p) => {
    const products = safeJson<ProductNewOneItem[]>(p.products);
    const banner = safeJson<ProductNewOneBanner>(p.banner);

    return (
      <div className="sectionContainer" aria-label="Product New One">
        <ProductNewOne
          title={String(p.title || "New Arrivals")}
          subtitle={String(p.subtitle || "Fresh picks designed to bring premium quality, style, and everyday value.")}
          viewAllText={String(p.viewAllText || "View All Products")}
          viewAllHref={String(p.viewAllHref || "/products")}
          apiUrl={String(p.apiUrl || PRODUCTS_API_URL)}
          products={products}
          banner={banner}
          preview={true}
        />
      </div>
    );
  },
};

export default ProductNewOne;

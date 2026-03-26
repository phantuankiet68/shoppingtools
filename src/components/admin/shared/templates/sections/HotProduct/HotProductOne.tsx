"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import styles from "@/styles/templates/sections/HotProduct/HotProductOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type HotProductOneItem = {
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

export type HotProductOneBanner = {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  href?: string;
  eyebrow?: string;
  ctaText?: string;
};

export type HotProductOneProps = {
  title?: string;
  subtitle?: string;
  viewAllText?: string;
  viewAllHref?: string;
  products?: HotProductOneItem[];
  apiUrl?: string;
  banner?: HotProductOneBanner;
  preview?: boolean;
  sectionAriaLabel?: string;
};

type ApiUnknownRecord = Record<string, unknown>;

/* ================= Defaults ================= */
const PRODUCTS_API_URL = "/api/v1/products/hot-product";

const DEFAULT_BANNER: HotProductOneBanner = {
  eyebrow: "Curated Picks",
  title: "Beauty That Feels Premium",
  subtitle: "Explore high-performing Japanese skincare and daily essentials selected for modern routines.",
  imageSrc: "/assets/images/PopularProduct.png",
  href: "/collections/beauty",
  ctaText: "Shop Collection",
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

function normalizeProductItem(raw: unknown, index: number): HotProductOneItem | null {
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
    badge: toStringSafe(item.badge) || "Trending",
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

function extractProductsFromResponse(data: unknown): HotProductOneItem[] {
  const source = data as
    | HotProductOneItem[]
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
    .filter((item): item is HotProductOneItem => Boolean(item));
}

function getDiscountPercent(item: HotProductOneItem): number {
  if (typeof item.discountPercent === "number") return Math.max(0, Math.round(item.discountPercent));
  if (typeof item.originalPrice === "number" && typeof item.price === "number" && item.originalPrice > item.price) {
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  }
  return 0;
}

function getProductAriaLabel(item: HotProductOneItem): string {
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
export function HotProductOne({
  title = "Hot Products",
  subtitle = "High-converting favorites curated for shoppers who value quality, trust, and fast delivery.",
  viewAllText = "View all products",
  viewAllHref = "/products",
  products,
  apiUrl = PRODUCTS_API_URL,
  banner = DEFAULT_BANNER,
  preview = false,
  sectionAriaLabel = "Hot products section",
}: HotProductOneProps) {
  const regionId = useId();
  const [remoteProducts, setRemoteProducts] = useState<HotProductOneItem[]>([]);
  const [loading, setLoading] = useState(false);

  const items = useMemo(() => {
    if (Array.isArray(products) && products.length > 0) return products.slice(0, 8);
    return remoteProducts.slice(0, 8);
  }, [products, remoteProducts]);

  const featuredProduct = items[0];
  const relatedProducts = items.slice(1, 5);

  const sectionHeadingId = `${regionId}-hot-products-heading`;
  const sectionDescId = `${regionId}-hot-products-description`;

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
        console.error("HotProductOne fetch error:", error);
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

  const renderProductLink = (item: HotProductOneItem, children: React.ReactNode, className?: string) =>
    preview ? (
      <a href="#" onClick={onBlockClick} className={className} aria-label={getProductAriaLabel(item)}>
        {children}
      </a>
    ) : (
      <Link href={(item.href || "/") as Route} className={className} aria-label={getProductAriaLabel(item)}>
        {children}
      </Link>
    );

  const renderBannerLink = (children: React.ReactNode) =>
    preview ? (
      <a href="#" onClick={onBlockClick} className={styles.promoCard} aria-label="Promotional collection banner">
        {children}
      </a>
    ) : (
      <Link
        href={(banner.href || "/collections") as Route}
        className={styles.promoCard}
        aria-label="Promotional collection banner"
      >
        {children}
      </Link>
    );

  return (
    <section
      className={styles.section}
      aria-label={sectionAriaLabel}
      aria-labelledby={sectionHeadingId}
      aria-describedby={sectionDescId}
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.titleRow}>
              <h2 id={sectionHeadingId} className={styles.title}>
                {title}
              </h2>
              <span className={styles.kicker}>Editor&apos;s Choice</span>
            </div>

            <p id={sectionDescId} className={styles.subtitle}>
              {subtitle}
            </p>
          </div>

          <div className={styles.headerAside}>
            <div className={styles.headerStat}>
              <span className={styles.headerStatValue}>{Math.max(items.length, 0)}</span>
              <span className={styles.headerStatLabel}>sản phẩm nổi bật</span>
            </div>

            {!preview ? (
              <Link href={(viewAllHref || "/products") as Route} className={styles.headerLink}>
                {viewAllText}
              </Link>
            ) : (
              <a href="#" onClick={onBlockClick} className={styles.headerLink}>
                {viewAllText}
              </a>
            )}
          </div>
        </header>

        <div className={styles.grid}>
          <div className={styles.mainColumn}>
            {featuredProduct ? (
              renderProductLink(
                featuredProduct,
                <article className={styles.featureCard}>
                  <div className={styles.featureVisual}>
                    <div className={styles.featureBadgeRow}>
                      {featuredProduct.badge ? (
                        <span className={styles.featureBadge}>{featuredProduct.badge}</span>
                      ) : null}
                      {featuredProduct.isNew ? <span className={styles.featureGhostBadge}>New Arrival</span> : null}
                    </div>

                    <div className={styles.featureImageWrap}>
                      <Image
                        src={featuredProduct.imageSrc}
                        alt={featuredProduct.name}
                        fill
                        priority
                        className={styles.featureImage}
                        sizes="(max-width: 991px) 100vw, 42vw"
                      />
                    </div>

                    <div className={styles.featureTags}>
                      {featuredProduct.brand ? <span className={styles.tagChip}>{featuredProduct.brand}</span> : null}
                      {featuredProduct.tag ? <span className={styles.tagChip}>{featuredProduct.tag}</span> : null}
                      {featuredProduct.stockText ? (
                        <span className={`${styles.tagChip} ${styles.tagChipSoft}`}>{featuredProduct.stockText}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className={styles.featureContent}>
                    <div className={styles.featureMetaRow}>
                      <span className={styles.eyebrow}>Featured Product</span>
                      {getDiscountPercent(featuredProduct) > 0 ? (
                        <span className={styles.discountPill}>-{getDiscountPercent(featuredProduct)}%</span>
                      ) : null}
                    </div>

                    <h3 className={styles.featureTitle}>{featuredProduct.name}</h3>

                    <div className={styles.featureInfo}>
                      {typeof featuredProduct.rating === "number" ? (
                        <div className={styles.ratingWrap}>
                          <span className={styles.stars} aria-hidden="true">
                            {renderStars(featuredProduct.rating)}
                          </span>
                          <span className={styles.ratingText}>
                            {featuredProduct.rating.toFixed(1)}
                            {typeof featuredProduct.reviewCount === "number"
                              ? ` (${featuredProduct.reviewCount} reviews)`
                              : ""}
                          </span>
                        </div>
                      ) : null}

                      {featuredProduct.soldText ? (
                        <span className={styles.infoText}>{featuredProduct.soldText}</span>
                      ) : null}
                      {featuredProduct.shippingNote ? (
                        <span className={styles.infoText}>{featuredProduct.shippingNote}</span>
                      ) : null}
                    </div>

                    <div className={styles.priceRow}>
                      {typeof featuredProduct.price === "number" ? (
                        <span className={styles.currentPrice}>{formatPrice(featuredProduct.price)}</span>
                      ) : null}

                      {typeof featuredProduct.originalPrice === "number" ? (
                        <span className={styles.oldPrice}>{formatPrice(featuredProduct.originalPrice)}</span>
                      ) : null}
                    </div>

                    <p className={styles.featureDescription}>
                      Thiết kế hiện đại, bố cục rõ ràng và cảm giác premium hơn cho nhóm sản phẩm chủ lực. Phù hợp để
                      đẩy CTR vào sản phẩm đang cần ưu tiên.
                    </p>

                    <div className={styles.actionRow}>
                      <span className={styles.primaryButton}>Xem chi tiết</span>
                      <span className={styles.secondaryButton}>So sánh nhanh</span>
                    </div>

                    <div className={styles.featureFootnote}>
                      <span className={styles.liveDot} aria-hidden="true" />
                      <span>Được quan tâm nhiều trong 24 giờ gần đây</span>
                    </div>
                  </div>
                </article>,
                styles.cardLink,
              )
            ) : (
              <div className={styles.emptyState}>No featured product available.</div>
            )}
            {banner?.imageSrc || banner?.title
              ? renderBannerLink(
                  <>
                    <div className={styles.promoContent}>
                      {banner.eyebrow ? <span className={styles.promoEyebrow}>{banner.eyebrow}</span> : null}
                      <h4 className={styles.promoTitle}>{banner.title || "Premium Collection"}</h4>
                      {banner.subtitle ? <p className={styles.promoSubtitle}>{banner.subtitle}</p> : null}
                      <span className={styles.promoAction}>{banner.ctaText || "Shop now"}</span>
                    </div>

                    {banner.imageSrc ? (
                      <div className={styles.promoMedia}>
                        <Image
                          src={banner.imageSrc}
                          alt={banner.title || "Promotional banner"}
                          fill
                          className={styles.promoImage}
                          sizes="(max-width: 991px) 100vw, 24vw"
                        />
                      </div>
                    ) : null}
                  </>,
                )
              : null}
          </div>

          <aside className={styles.sideColumn}>
            <div className={styles.relatedPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Recommendation</p>
                  <h3 className={styles.panelTitle}>Sản phẩm liên quan</h3>
                </div>
                <span className={styles.panelCount}>{relatedProducts.length} đề xuất</span>
              </div>

              {loading && items.length === 0 ? (
                <div className={styles.emptyState} role="status" aria-live="polite">
                  Loading products...
                </div>
              ) : relatedProducts.length === 0 ? (
                <div className={styles.emptyState} role="status" aria-live="polite">
                  No related products available right now.
                </div>
              ) : (
                <div className={styles.relatedList}>
                  {relatedProducts.map((item, index) => (
                    <article className={styles.relatedCard} key={item.id ?? index}>
                      {renderProductLink(
                        item,
                        <div className={styles.relatedLinkInner}>
                          <div className={styles.relatedThumb}>
                            <Image
                              src={item.imageSrc}
                              alt={item.name}
                              fill
                              className={styles.relatedImage}
                              sizes="88px"
                            />
                          </div>

                          <div className={styles.relatedContent}>
                            <div className={styles.relatedTop}>
                              {item.badge ? <span className={styles.relatedBadge}>{item.badge}</span> : null}
                            </div>

                            <h4 className={styles.relatedName}>{item.name}</h4>

                            <div className={styles.relatedMeta}>
                              {item.brand ? <span>{item.brand}</span> : null}
                              {item.soldText ? <span>{item.soldText}</span> : null}
                            </div>

                            <div className={styles.relatedPriceRow}>
                              {typeof item.price === "number" ? (
                                <span className={styles.relatedPrice}>{formatPrice(item.price)}</span>
                              ) : null}

                              {typeof item.originalPrice === "number" ? (
                                <span className={styles.relatedOldPrice}>{formatPrice(item.originalPrice)}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>,
                        styles.relatedLink,
                      )}
                    </article>
                  ))}
                </div>
              )}

              {!preview ? (
                <Link href={(viewAllHref || "/products") as Route} className={styles.viewAllButton}>
                  {viewAllText}
                </Link>
              ) : (
                <a href="#" onClick={onBlockClick} className={styles.viewAllButton}>
                  {viewAllText}
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_HOT_PRODUCT_ONE: RegItem = {
  kind: "HotProductOne",
  label: "Hot Product One",
  defaults: {
    title: "Hot Products",
    viewAllText: "View all products",
    viewAllHref: "/products",
    apiUrl: PRODUCTS_API_URL,
    products: JSON.stringify([], null, 2),
    banner: JSON.stringify(DEFAULT_BANNER, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "viewAllText", label: "View all text", kind: "text" },
    { key: "viewAllHref", label: "View all URL", kind: "text" },
    { key: "apiUrl", label: "Products API URL", kind: "text" },
    { key: "products", label: "Products override (JSON)", kind: "textarea", rows: 12 },
    { key: "banner", label: "Banner (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (p) => {
    const products = safeJson<HotProductOneItem[]>(p.products);
    const banner = safeJson<HotProductOneBanner>(p.banner);

    return (
      <div className="sectionContainer" aria-label="Hot Product One">
        <HotProductOne
          title={String(p.title || "Hot Products")}
          subtitle={String(
            p.subtitle || "High-converting favorites curated for shoppers who value quality, trust, and fast delivery.",
          )}
          viewAllText={String(p.viewAllText || "View all products")}
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

export default HotProductOne;

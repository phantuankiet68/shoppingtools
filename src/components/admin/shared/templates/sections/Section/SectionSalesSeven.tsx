"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Section/SectionSalesSeven.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* =========================
 * Types
 * ========================= */
export type SectionSalesCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type SectionSalesProductItem = {
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
  soldPercent?: number;
  tag?: string;
  rating?: number;
  reviewCount?: number;
  shippingNote?: string;
  stockText?: string;
  isNew?: boolean;
  shortDescription?: string;
  category?: string;
};

export type SectionSalesSevenProps = {
  title?: string;
  eyebrow?: string;
  highlightText?: string;
  noteText?: string;
  ctaText?: string;
  ctaHref?: string;
  countdown?: SectionSalesCountdown;
  products?: SectionSalesProductItem[];
  apiUrl?: string;
  preview?: boolean;
  sectionAriaLabel?: string;
};

type ApiUnknownRecord = Record<string, unknown>;

/* =========================
 * Constants
 * ========================= */
const SALES_API_URL = "/api/v1/products/sales";
const AUTO_ROTATE_INTERVAL = 5200;

const DEFAULT_COUNTDOWN: SectionSalesCountdown = {
  days: 6,
  hours: 14,
  minutes: 32,
  seconds: 0,
};

const DEFAULT_CTA_TEXT = "Browse all sale items";
const DEFAULT_CTA_HREF = "/products/sale";

/* =========================
 * Helpers
 * ========================= */
function safeJson<T>(raw?: unknown): T | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
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

function toStringSafe(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function clampPercent(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatPrice(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `${new Intl.NumberFormat("en-US").format(value)}đ`;
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

function detectBrandFromName(name: string, fallback?: string): string | undefined {
  if (fallback) return fallback;
  const words = name.trim().split(/\s+/).slice(0, 2).join(" ").toUpperCase();
  return words || undefined;
}

function computeSoldPercent(soldCount: number): number {
  if (soldCount <= 0) return 26;
  if (soldCount >= 3000) return 96;
  if (soldCount >= 2000) return 90;
  if (soldCount >= 1000) return 82;
  if (soldCount >= 500) return 68;
  if (soldCount >= 100) return 52;
  return 38;
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
  if (stock <= 25) return "Low stock";
  return "In stock";
}

function buildShortDescription(raw: ApiUnknownRecord): string | undefined {
  return (
    toStringSafe(raw.shortDescription) ||
    toStringSafe(raw.description) ||
    toStringSafe(raw.summary) ||
    toStringSafe(raw.excerpt) ||
    undefined
  );
}

function normalizeProductItem(raw: unknown, index: number): SectionSalesProductItem | null {
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
  const soldCount = toNumber(item.sold ?? item.soldCount ?? item.stockSold ?? item.ordersCount ?? item.totalSold, 0);

  const discountFallback = toNumber(item.discountPercent ?? item.discount, NaN);
  const discountPercent = Number.isFinite(discountFallback)
    ? Math.max(0, Math.round(discountFallback))
    : Number.isFinite(price) && Number.isFinite(originalPrice) && originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  const fallbackTag =
    toStringSafe(item.tag) ||
    toStringSafe(item.code) ||
    toStringSafe(item.sku) ||
    toStringSafe(item.variantCode) ||
    (Array.isArray(item.tags) && item.tags.length > 0 ? toStringSafe(item.tags[0]) : "");

  const reviewCount = computeReviewCount(item);
  const rating = computeRating(item) ?? (reviewCount ? 4.8 : undefined);

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
    badge: toStringSafe(item.badge) || (Boolean(item.isNew) ? "New arrival" : "Staff pick"),
    price: Number.isFinite(price) ? price : undefined,
    originalPrice: Number.isFinite(originalPrice) && originalPrice > 0 ? originalPrice : undefined,
    discountPercent,
    soldText: soldCount > 0 ? `${formatCompactCount(soldCount)} sold recently` : "Trending this week",
    soldPercent: computeSoldPercent(soldCount),
    tag: fallbackTag || undefined,
    rating,
    reviewCount,
    shippingNote: toStringSafe(item.shippingNote) || "Fast local delivery",
    stockText: toStringSafe(item.stockText) || buildInventoryText(item),
    isNew: Boolean(item.isNew),
    shortDescription: buildShortDescription(item),
    category: toStringSafe(item.category) || toStringSafe(item.collection) || undefined,
  };
}

function extractProductsFromResponse(data: unknown): SectionSalesProductItem[] {
  const source = data as
    | SectionSalesProductItem[]
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
    .filter((item): item is SectionSalesProductItem => Boolean(item));
}

function getSavings(item: SectionSalesProductItem): number | undefined {
  if (typeof item.originalPrice !== "number" || typeof item.price !== "number") return undefined;
  if (item.originalPrice <= item.price) return undefined;
  return item.originalPrice - item.price;
}

function getDiscountPercent(item: SectionSalesProductItem): number {
  if (typeof item.discountPercent === "number") return Math.max(0, Math.round(item.discountPercent));

  if (typeof item.originalPrice === "number" && typeof item.price === "number" && item.originalPrice > item.price) {
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  }

  return 0;
}

function renderStars(rating?: number): string {
  if (!rating) return "";
  const rounded = Math.round(rating);
  return `${"★".repeat(Math.max(0, Math.min(5, rounded)))}${"☆".repeat(Math.max(0, 5 - rounded))}`;
}

function getProductAriaLabel(item: SectionSalesProductItem): string {
  const price = typeof item.price === "number" ? `, current price ${formatPrice(item.price)}` : "";
  const discount = getDiscountPercent(item);
  const savings = discount > 0 ? `, save ${discount}%` : "";
  const rating = typeof item.rating === "number" ? `, rated ${item.rating} out of 5` : "";
  return `${item.name}${price}${savings}${rating}`;
}

function getCountdownLiveText(timeLeft: SectionSalesCountdown): string {
  return `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes and ${timeLeft.seconds} seconds remaining.`;
}

function getReviewSummary(item: SectionSalesProductItem): string {
  const ratingText = typeof item.rating === "number" ? item.rating.toFixed(1) : "";
  const reviewText =
    typeof item.reviewCount === "number" ? `${formatCompactCount(item.reviewCount)} reviews` : "verified reviews";
  return ratingText ? `${ratingText} • ${reviewText}` : reviewText;
}

function getTrustBullets(item: SectionSalesProductItem): string[] {
  const bullets: string[] = [];

  bullets.push(item.stockText || "In stock");
  bullets.push(item.shippingNote || "Fast delivery");

  if (typeof item.reviewCount === "number" && item.reviewCount > 0) {
    bullets.push(`${formatCompactCount(item.reviewCount)} verified reviews`);
  }

  if (typeof item.rating === "number") {
    bullets.push(`Rated ${item.rating.toFixed(1)}/5`);
  }

  return bullets.slice(0, 4);
}

function buildProductJsonLd(item: SectionSalesProductItem) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    image: item.imageSrc ? [item.imageSrc] : undefined,
    brand: item.brand
      ? {
          "@type": "Brand",
          name: item.brand,
        }
      : undefined,
    category: item.category,
    offers:
      typeof item.price === "number"
        ? {
            "@type": "Offer",
            priceCurrency: "VND",
            price: item.price,
            availability:
              item.stockText === "Out of stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            url: item.href,
          }
        : undefined,
    aggregateRating:
      typeof item.rating === "number" && typeof item.reviewCount === "number" && item.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: item.rating,
            reviewCount: item.reviewCount,
          }
        : undefined,
  };
}

/* =========================
 * Component
 * ========================= */
export function SectionSalesSeven({
  ctaText = DEFAULT_CTA_TEXT,
  ctaHref = DEFAULT_CTA_HREF,
  countdown,
  products,
  apiUrl = SALES_API_URL,
  preview = false,
  sectionAriaLabel = "Featured editorial sale collection",
}: SectionSalesSevenProps) {
  const initialCountdown = useMemo(() => countdown ?? DEFAULT_COUNTDOWN, [countdown]);
  const regionId = useId();

  const [timeLeft, setTimeLeft] = useState<SectionSalesCountdown>(initialCountdown);
  const [remoteProducts, setRemoteProducts] = useState<SectionSalesProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const autoTimerRef = useRef<number | null>(null);

  const items = useMemo(() => {
    if (Array.isArray(products) && products.length > 0) return products;
    return remoteProducts;
  }, [products, remoteProducts]);

  const heroItem = items[activeIndex] ?? items[0];
  const gridItems = items.filter((_, index) => index !== activeIndex).slice(0, 4);

  const sectionHeadingId = `${regionId}-sales-seven-heading`;
  const sectionDescId = `${regionId}-sales-seven-description`;
  const liveStatusId = `${regionId}-sales-seven-live-status`;

  useEffect(() => {
    setTimeLeft(initialCountdown);
  }, [initialCountdown]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
          return prev;
        }

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days -= 1;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;

    autoTimerRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, AUTO_ROTATE_INTERVAL);

    return () => {
      if (autoTimerRef.current) {
        window.clearInterval(autoTimerRef.current);
      }
    };
  }, [items.length]);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) return;

    const controller = new AbortController();

    async function fetchSalesProducts() {
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
          throw new Error(`Failed to fetch sale products: ${res.status}`);
        }

        const data = (await res.json()) as unknown;
        const normalized = extractProductsFromResponse(data);
        setRemoteProducts(normalized);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("SectionSalesSeven fetch error:", error);
        setRemoteProducts([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchSalesProducts();

    return () => controller.abort();
  }, [apiUrl, products]);

  useEffect(() => {
    if (activeIndex > Math.max(items.length - 1, 0)) {
      setActiveIndex(0);
    }
  }, [activeIndex, items.length]);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const renderProductLink = (
    item: SectionSalesProductItem,
    className: string,
    children: React.ReactNode,
    ariaLabel?: string,
  ) =>
    preview ? (
      <a href="#" onClick={onBlockClick} className={className} aria-label={ariaLabel || getProductAriaLabel(item)}>
        {children}
      </a>
    ) : (
      <Link
        href={(item.href || "/") as Route}
        className={className}
        aria-label={ariaLabel || getProductAriaLabel(item)}
      >
        {children}
      </Link>
    );

  const renderCtaLink = (className: string, children: React.ReactNode, ariaLabel?: string) =>
    preview ? (
      <a href="#" onClick={onBlockClick} className={className} aria-label={ariaLabel || ctaText}>
        {children}
      </a>
    ) : (
      <Link href={(ctaHref || "/") as Route} className={className} aria-label={ariaLabel || ctaText}>
        {children}
      </Link>
    );

  const goPrev = () => {
    if (items.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goNext = () => {
    if (items.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const countdownBoxes = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section
      className={cls.section}
      aria-label={sectionAriaLabel}
      aria-labelledby={sectionHeadingId}
      aria-describedby={sectionDescId}
    >
      {heroItem ? (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildProductJsonLd(heroItem)),
          }}
        />
      ) : null}

      <div className={cls.shell}>
        <header className={cls.header}>
          <div className={cls.headerContent}>
            <div className={cls.kickerRow}>
              <span className={cls.liveChip}>Live sale</span>
            </div>
          </div>

          <div className={cls.headerActions}>
            {renderCtaLink(
              cls.catalogCta,
              <>
                <span>{ctaText}</span>
                <span aria-hidden="true">→</span>
              </>,
              ctaText,
            )}
          </div>
        </header>

        {loading && items.length === 0 ? (
          <div className={cls.emptyState} role="status" aria-live="polite">
            Loading promotional products...
          </div>
        ) : items.length === 0 || !heroItem ? (
          <div className={cls.emptyState} role="status" aria-live="polite">
            No promotional products are available right now.
          </div>
        ) : (
          <div className={cls.layout}>
            <article className={cls.heroCard} aria-labelledby={`${regionId}-hero-product-title`}>
              <div className={cls.heroVisualPanel}>
                <div className={cls.heroBadgeRow}>
                  {heroItem.badge ? <span className={cls.saleBadge}>{heroItem.badge}</span> : null}
                  {heroItem.isNew ? <span className={cls.newBadge}>New</span> : null}
                </div>

                {renderProductLink(
                  heroItem,
                  cls.heroImageLink,
                  <div className={cls.heroImageWrap}>
                    <Image
                      src={heroItem.imageSrc}
                      alt={heroItem.name}
                      fill
                      className={cls.heroImage}
                      sizes="(max-width: 767px) 100vw, (max-width: 1200px) 55vw, 620px"
                      priority
                    />
                  </div>,
                )}

                {getDiscountPercent(heroItem) > 0 ? (
                  <div className={cls.heroDiscountCard}>
                    <span className={cls.heroDiscountValue}>-{getDiscountPercent(heroItem)}%</span>
                    <span className={cls.heroDiscountLabel}>Limited offer</span>
                  </div>
                ) : null}
              </div>

              <div className={cls.heroContent}>
                <div className={cls.heroMetaRow}>
                  {heroItem.brand ? <span className={cls.brandPill}>{heroItem.brand}</span> : null}
                  {heroItem.category ? <span className={cls.categoryPill}>{heroItem.category}</span> : null}
                </div>

                {renderProductLink(
                  heroItem,
                  cls.heroTitleLink,
                  <h3 className={cls.heroTitle} id={`${regionId}-hero-product-title`}>
                    {heroItem.name}
                  </h3>,
                )}

                {heroItem.shortDescription ? (
                  <p className={cls.heroDescription}>{heroItem.shortDescription}</p>
                ) : (
                  <p className={cls.heroDescription}>
                    A premium promotional selection designed to surface value, credibility, and immediate purchase
                    intent.
                  </p>
                )}

                {(typeof heroItem.rating === "number" || typeof heroItem.reviewCount === "number") && (
                  <div className={cls.reviewRow} aria-label={`Customer review summary: ${getReviewSummary(heroItem)}`}>
                    {typeof heroItem.rating === "number" ? (
                      <>
                        <span className={cls.stars} aria-hidden="true">
                          {renderStars(heroItem.rating)}
                        </span>
                        <span className={cls.ratingValue}>{heroItem.rating.toFixed(1)}</span>
                      </>
                    ) : null}

                    {typeof heroItem.reviewCount === "number" ? (
                      <span className={cls.reviewCount}>{formatCompactCount(heroItem.reviewCount)} reviews</span>
                    ) : null}
                  </div>
                )}

                <div className={cls.pricePanel}>
                  <div className={cls.priceRow}>
                    {typeof heroItem.price === "number" ? (
                      <span className={cls.currentPrice}>{formatPrice(heroItem.price)}</span>
                    ) : null}

                    {typeof heroItem.originalPrice === "number" ? (
                      <span className={cls.originalPrice}>{formatPrice(heroItem.originalPrice)}</span>
                    ) : null}
                  </div>

                  {typeof getSavings(heroItem) === "number" ? (
                    <p className={cls.savingsText}>You save {formatPrice(getSavings(heroItem))}</p>
                  ) : null}
                </div>

                <div className={cls.progressModule}>
                  <div className={cls.progressMeta}>
                    <span className={cls.progressLabel}>Buyer momentum</span>
                    <span className={cls.progressText}>{heroItem.soldText || "Trending this week"}</span>
                  </div>

                  <div className={cls.progressBar} aria-label={heroItem.soldText || "Trending this week"}>
                    <span className={cls.progressFill} style={{ width: `${clampPercent(heroItem.soldPercent)}%` }} />
                  </div>
                </div>

                <ul className={cls.trustList} aria-label="Trust and purchase confidence highlights">
                  {getTrustBullets(heroItem).map((item, index) => (
                    <li className={cls.trustItem} key={`${heroItem.id ?? "hero"}-${index}`}>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className={cls.heroActions}>
                  {renderProductLink(
                    heroItem,
                    cls.primaryCta,
                    <>
                      <span>Shop now</span>
                      <span aria-hidden="true">→</span>
                    </>,
                    `Shop now: ${getProductAriaLabel(heroItem)}`,
                  )}

                  {renderProductLink(
                    heroItem,
                    cls.secondaryCta,
                    <span>View details</span>,
                    `View details for ${heroItem.name}`,
                  )}
                </div>
              </div>
            </article>

            <aside className={cls.sidebar} aria-label="Sale insights and more products">
              <section className={cls.countdownCard} aria-labelledby={`${regionId}-countdown-title`}>
                <div className={cls.countdownHead}>
                  <h3 className={cls.sidebarTitle} id={`${regionId}-countdown-title`}>
                    Offer countdown
                  </h3>
                  <span className={cls.sidebarHint}>Auto-updated</span>
                </div>

                <div className={cls.countdownGrid} aria-label="Promotion countdown timer">
                  {countdownBoxes.map((item) => (
                    <div className={cls.countdownItem} key={item.label}>
                      <span className={cls.countdownValue}>{pad(item.value)}</span>
                      <span className={cls.countdownLabel}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <span className={cls.srOnly} aria-live="polite" id={liveStatusId}>
                  {getCountdownLiveText(timeLeft)}
                </span>
              </section>

              <section className={cls.metricsCard} aria-labelledby={`${regionId}-trust-title`}>
                <div className={cls.metricsHead}>
                  <h3 className={cls.sidebarTitle} id={`${regionId}-trust-title`}>
                    Conversion signals
                  </h3>

                  <div className={cls.navRow}>
                    <button type="button" className={cls.navButton} aria-label="Previous product" onClick={goPrev}>
                      ‹
                    </button>
                    <button type="button" className={cls.navButton} aria-label="Next product" onClick={goNext}>
                      ›
                    </button>
                  </div>
                </div>

                <div className={cls.metricsGrid}>
                  <div className={cls.productGrid} role="list" aria-describedby={liveStatusId}>
                    {items.slice(0, 4).map((item, index) => {
                      const isActive = index === activeIndex;
                      const discount = getDiscountPercent(item);

                      return (
                        <button
                          key={item.id ?? index + 1}
                          type="button"
                          className={`${cls.gridProduct} ${isActive ? cls.gridProductActive : ""}`}
                          onClick={() => setActiveIndex(index)}
                          aria-pressed={isActive}
                          aria-label={`Set featured product to ${getProductAriaLabel(item)}`}
                          role="listitem"
                        >
                          <div className={cls.gridImageWrap}>
                            <Image
                              src={item.imageSrc}
                              alt={item.name}
                              fill
                              className={cls.gridImage}
                              sizes="(max-width: 767px) 44vw, 160px"
                            />
                            {discount > 0 ? <span className={cls.gridDiscount}>-{discount}%</span> : null}
                          </div>

                          <div className={cls.gridContent}>
                            <span className={cls.gridBrand}>{item.brand || "Top pick"}</span>
                            <span className={cls.gridName}>{item.name}</span>

                            <div className={cls.gridMeta}>
                              {typeof item.price === "number" ? (
                                <span className={cls.gridPrice}>{formatPrice(item.price)}</span>
                              ) : null}
                              {typeof item.rating === "number" ? (
                                <span className={cls.gridRating}>{item.rating.toFixed(1)}★</span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================
 * RegItem
 * ========================= */
export const SHOP_SECTION_SALES_SEVEN: RegItem = {
  kind: "SectionSalesSeven",
  label: "Section Sales Seven",
  defaults: {
    ctaText: DEFAULT_CTA_TEXT,
    ctaHref: DEFAULT_CTA_HREF,
    countdown: JSON.stringify(DEFAULT_COUNTDOWN, null, 2),
    products: JSON.stringify([], null, 2),
    apiUrl: SALES_API_URL,
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "highlightText", label: "Highlight text", kind: "text" },
    { key: "noteText", label: "Note text", kind: "textarea", rows: 4 },
    { key: "ctaText", label: "CTA text", kind: "text" },
    { key: "ctaHref", label: "CTA href", kind: "text" },
    { key: "countdown", label: "Countdown (JSON)", kind: "textarea", rows: 8 },
    { key: "products", label: "Products override (JSON)", kind: "textarea", rows: 12 },
    { key: "apiUrl", label: "Sales API URL", kind: "text" },
  ],
  render: (p) => {
    const countdown = safeJson<SectionSalesCountdown>(p.countdown);
    const products = safeJson<SectionSalesProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Sales Seven">
        <SectionSalesSeven
          ctaText={String(p.ctaText || DEFAULT_CTA_TEXT)}
          ctaHref={String(p.ctaHref || DEFAULT_CTA_HREF)}
          countdown={countdown}
          products={products}
          apiUrl={String(p.apiUrl || SALES_API_URL)}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionSalesSeven;

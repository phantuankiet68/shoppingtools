"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Section/SectionSalesFour.module.css";
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
};

export type SectionSalesFourProps = {
  title?: string;
  highlightText?: string;
  discountText?: string;
  noteText?: string;
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
const AUTO_ROTATE_INTERVAL = 4200;
const DOTS_COUNT = 5;

const DEFAULT_COUNTDOWN: SectionSalesCountdown = {
  days: 7,
  hours: 14,
  minutes: 28,
  seconds: 40,
};

const DEFAULT_TITLE = "Signature Sale Edit";
const DEFAULT_HIGHLIGHT = "Premium deals with stronger value signals";
const DEFAULT_SUFFIX = "Fresh markdowns";
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
  if (soldCount <= 0) return 28;
  if (soldCount >= 3000) return 96;
  if (soldCount >= 2000) return 90;
  if (soldCount >= 1000) return 82;
  if (soldCount >= 500) return 72;
  if (soldCount >= 100) return 56;
  return 40;
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
    badge: toStringSafe(item.badge) || "Featured Deal",
    price: Number.isFinite(price) ? price : undefined,
    originalPrice: Number.isFinite(originalPrice) && originalPrice > 0 ? originalPrice : undefined,
    discountPercent,
    soldText: soldCount > 0 ? `${formatCompactCount(soldCount)} sold recently` : "Trending now",
    soldPercent: computeSoldPercent(soldCount),
    tag: fallbackTag || undefined,
    rating,
    reviewCount,
    shippingNote: toStringSafe(item.shippingNote) || "Fast local shipping",
    stockText: toStringSafe(item.stockText) || buildInventoryText(item),
    isNew: Boolean(item.isNew),
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

function getTrustText(item: SectionSalesProductItem): string {
  return item.shippingNote || "Secure checkout and reliable delivery";
}

function getSpotlightLabel(item: SectionSalesProductItem): string {
  if (getDiscountPercent(item) >= 40) return "Best markdown";
  if (item.isNew) return "New arrival";
  if ((item.reviewCount || 0) >= 100) return "Top rated";
  return "Editor approved";
}

/* =========================
 * Component
 * ========================= */
export function SectionSalesFour({
  title = DEFAULT_TITLE,
  highlightText = DEFAULT_HIGHLIGHT,
  discountText = DEFAULT_SUFFIX,
  countdown,
  products,
  apiUrl = SALES_API_URL,
  preview = false,
  sectionAriaLabel = "Featured sales collection",
}: SectionSalesFourProps) {
  const initialCountdown = useMemo(() => countdown ?? DEFAULT_COUNTDOWN, [countdown]);
  const regionId = useId();

  const [timeLeft, setTimeLeft] = useState<SectionSalesCountdown>(initialCountdown);
  const [activeDot, setActiveDot] = useState(0);
  const [remoteProducts, setRemoteProducts] = useState<SectionSalesProductItem[]>([]);
  const [loading, setLoading] = useState(false);

  const autoTimerRef = useRef<number | null>(null);

  const items = useMemo(() => {
    if (Array.isArray(products) && products.length > 0) return products;
    return remoteProducts;
  }, [products, remoteProducts]);

  const featuredItem = items[0];
  const secondaryItems = items.slice(1, 5);

  const sectionHeadingId = `${regionId}-sales-four-heading`;
  const sectionDescId = `${regionId}-sales-four-description`;
  const liveStatusId = `${regionId}-sales-four-live-status`;

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
    autoTimerRef.current = window.setInterval(() => {
      setActiveDot((prev) => (prev + 1) % DOTS_COUNT);
    }, AUTO_ROTATE_INTERVAL);

    return () => {
      if (autoTimerRef.current) {
        window.clearInterval(autoTimerRef.current);
      }
    };
  }, []);

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
        console.error("SectionSalesFour fetch error:", error);
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

  return (
    <section
      className={cls.section}
      aria-label={sectionAriaLabel}
      aria-labelledby={sectionHeadingId}
      aria-describedby={sectionDescId}
    >
      <div className={cls.shell}>
        <header className={cls.hero}>
          <div className={cls.heroMain}>
            <div className={cls.heroEyebrowRow}>
              <span className={cls.eyebrow}>Sale Spotlight</span>
              <span className={cls.eyebrowDivider} aria-hidden="true" />
              <span className={cls.eyebrowSubtle}>{discountText}</span>
            </div>

            <div className={cls.heroCopy}>
              <p className={cls.overline}>{title}</p>
              <h2 className={cls.title} id={sectionHeadingId}>
                {highlightText}
              </h2>
            </div>
          </div>

          <aside className={cls.heroAside}>
            <div className={cls.insightCard}>
              <div className={cls.insightTop}>
                <span className={cls.insightLabel}>Offer closes in</span>
                <span className={cls.insightLive}>
                  <span className={cls.insightLiveDot} aria-hidden="true" />
                  Live
                </span>
              </div>

              <div className={cls.timerGrid} aria-label="Promotion countdown timer">
                <div className={cls.timerItem}>
                  <span className={cls.timerValue}>{pad(timeLeft.days)}</span>
                  <span className={cls.timerText}>Days</span>
                </div>
                <div className={cls.timerItem}>
                  <span className={cls.timerValue}>{pad(timeLeft.hours)}</span>
                  <span className={cls.timerText}>Hours</span>
                </div>
                <div className={cls.timerItem}>
                  <span className={cls.timerValue}>{pad(timeLeft.minutes)}</span>
                  <span className={cls.timerText}>Mins</span>
                </div>
                <div className={cls.timerItem}>
                  <span className={cls.timerValue}>{pad(timeLeft.seconds)}</span>
                  <span className={cls.timerText}>Secs</span>
                </div>
              </div>
            </div>

            <span className={cls.srOnly} aria-live="polite" id={liveStatusId}>
              {getCountdownLiveText(timeLeft)}
            </span>
          </aside>
        </header>

        <div className={cls.body}>
          {loading && items.length === 0 ? (
            <div className={cls.emptyState} role="status" aria-live="polite">
              Loading featured deals...
            </div>
          ) : items.length === 0 ? (
            <div className={cls.emptyState} role="status" aria-live="polite">
              No promotional products are available right now.
            </div>
          ) : (
            <>
              <div className={cls.layout} role="list" aria-describedby={liveStatusId}>
                {featuredItem ? (
                  <article className={cls.featuredCard} role="listitem">
                    {renderProductLink(
                      featuredItem,
                      cls.featuredLink,
                      <>
                        <div className={cls.featuredMedia}>
                          <div className={cls.featuredImageWrap}>
                            <Image
                              src={featuredItem.imageSrc}
                              alt={featuredItem.name}
                              fill
                              priority
                              className={cls.featuredImage}
                              sizes="(max-width: 991px) 100vw, 42vw"
                            />
                          </div>

                          <div className={cls.featuredBadgeStack}>
                            <span className={cls.badgePrimary}>{featuredItem.badge || "Featured Deal"}</span>
                            <span className={cls.badgeNeutral}>{getSpotlightLabel(featuredItem)}</span>
                            {featuredItem.isNew ? <span className={cls.badgeSuccess}>New</span> : null}
                          </div>
                        </div>

                        <div className={cls.featuredContent}>
                          <div className={cls.featuredTopMeta}>
                            <div className={cls.metaChips}>
                              <span className={cls.brandChip}>{featuredItem.brand || "Featured Brand"}</span>
                              {featuredItem.tag ? <span className={cls.tagChip}>{featuredItem.tag}</span> : null}
                            </div>

                            {getDiscountPercent(featuredItem) > 0 ? (
                              <span className={cls.discountPill}>Save {getDiscountPercent(featuredItem)}%</span>
                            ) : null}
                          </div>

                          <h3 className={cls.featuredName}>{featuredItem.name}</h3>

                          {(typeof featuredItem.rating === "number" ||
                            typeof featuredItem.reviewCount === "number") && (
                            <div
                              className={cls.reviewRow}
                              aria-label={`Customer review summary: ${getReviewSummary(featuredItem)}`}
                            >
                              {typeof featuredItem.rating === "number" ? (
                                <>
                                  <span className={cls.stars} aria-hidden="true">
                                    {renderStars(featuredItem.rating)}
                                  </span>
                                  <span className={cls.ratingValue}>{featuredItem.rating.toFixed(1)}</span>
                                </>
                              ) : null}

                              {typeof featuredItem.reviewCount === "number" ? (
                                <span className={cls.reviewCount}>
                                  {formatCompactCount(featuredItem.reviewCount)} reviews
                                </span>
                              ) : null}
                            </div>
                          )}

                          <div className={cls.priceBlock}>
                            {typeof featuredItem.price === "number" ? (
                              <span className={cls.priceMain}>{formatPrice(featuredItem.price)}</span>
                            ) : null}

                            <div className={cls.priceMeta}>
                              {typeof featuredItem.originalPrice === "number" ? (
                                <span className={cls.oldPrice}>{formatPrice(featuredItem.originalPrice)}</span>
                              ) : null}
                              {typeof getSavings(featuredItem) === "number" ? (
                                <span className={cls.savingsBadge}>
                                  You save {formatPrice(getSavings(featuredItem))}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className={cls.keyFacts}>
                            <span className={cls.factItem}>{featuredItem.stockText || "In stock"}</span>
                            <span className={cls.factDivider} aria-hidden="true">
                              •
                            </span>
                            <span className={cls.factItem}>{getTrustText(featuredItem)}</span>
                          </div>

                          <div className={cls.progressBlock} aria-label={featuredItem.soldText || "Trending now"}>
                            <div className={cls.progressHead}>
                              <span className={cls.progressLabel}>Demand signal</span>
                              <span className={cls.progressText}>{featuredItem.soldText || "Trending now"}</span>
                            </div>

                            <div className={cls.progressTrack}>
                              <span
                                className={cls.progressFill}
                                style={{ width: `${clampPercent(featuredItem.soldPercent)}%` }}
                              />
                            </div>
                          </div>

                          <div className={cls.actionRow}>
                            <span className={cls.primaryAction}>Explore deal</span>
                            <span className={cls.secondaryAction}>View details</span>
                          </div>
                        </div>
                      </>,
                    )}
                  </article>
                ) : null}

                <div className={cls.sideColumn}>
                  {secondaryItems.map((item, index) => {
                    const discount = getDiscountPercent(item);

                    return (
                      <article className={cls.sideCard} key={item.id ?? index + 1} role="listitem">
                        {renderProductLink(
                          item,
                          cls.sideLink,
                          <>
                            <div className={cls.sideThumb}>
                              <Image
                                src={item.imageSrc}
                                alt={item.name}
                                fill
                                className={cls.sideImage}
                                sizes="(max-width: 767px) 100vw, (max-width: 991px) 40vw, 15vw"
                              />
                              {discount > 0 ? <span className={cls.sideDiscount}>-{discount}%</span> : null}
                            </div>

                            <div className={cls.sideContent}>
                              <div className={cls.sideMetaRow}>
                                <span className={cls.sideBrand}>{item.brand || "Top Pick"}</span>
                                {item.badge ? <span className={cls.sideBadge}>{item.badge}</span> : null}
                              </div>

                              <h3 className={cls.sideName}>{item.name}</h3>

                              {(typeof item.rating === "number" || typeof item.reviewCount === "number") && (
                                <div
                                  className={cls.sideReview}
                                  aria-label={`Customer review summary: ${getReviewSummary(item)}`}
                                >
                                  {typeof item.rating === "number" ? (
                                    <>
                                      <span className={cls.sideStars} aria-hidden="true">
                                        {renderStars(item.rating)}
                                      </span>
                                      <span className={cls.sideRating}>{item.rating.toFixed(1)}</span>
                                    </>
                                  ) : null}

                                  {typeof item.reviewCount === "number" ? (
                                    <span className={cls.sideReviewCount}>
                                      {formatCompactCount(item.reviewCount)} reviews
                                    </span>
                                  ) : null}
                                </div>
                              )}

                              <div className={cls.sidePriceRow}>
                                {typeof item.price === "number" ? (
                                  <span className={cls.sidePrice}>{formatPrice(item.price)}</span>
                                ) : null}
                                {typeof item.originalPrice === "number" ? (
                                  <span className={cls.sideOldPrice}>{formatPrice(item.originalPrice)}</span>
                                ) : null}
                              </div>

                              <div className={cls.sideInfo}>
                                <span className={cls.sideInfoText}>{item.stockText || "In stock"}</span>
                                <span className={cls.sideInfoDot} aria-hidden="true">
                                  •
                                </span>
                                <span className={cls.sideInfoText}>{item.shippingNote || "Fast delivery"}</span>
                              </div>

                              <div className={cls.sideProgress} aria-label={item.soldText || "Trending now"}>
                                <div className={cls.sideProgressTrack}>
                                  <span
                                    className={cls.sideProgressFill}
                                    style={{ width: `${clampPercent(item.soldPercent)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </>,
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>

              <footer className={cls.footer}>
                <div className={cls.pagination} aria-label="Product slider pagination">
                  {Array.from({ length: DOTS_COUNT }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`${cls.dot} ${i === activeDot ? cls.dotActive : ""}`}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-pressed={i === activeDot}
                      onClick={() => setActiveDot(i)}
                    />
                  ))}
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================
 * RegItem
 * ========================= */
export const SHOP_SECTION_SALES_FOUR: RegItem = {
  kind: "SectionSalesFour",
  label: "Section Sales Four",
  defaults: {
    title: DEFAULT_TITLE,
    highlightText: DEFAULT_HIGHLIGHT,
    discountText: DEFAULT_SUFFIX,
    countdown: JSON.stringify(DEFAULT_COUNTDOWN, null, 2),
    products: JSON.stringify([], null, 2),
    apiUrl: SALES_API_URL,
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "highlightText", label: "Highlight text", kind: "text" },
    { key: "discountText", label: "Status text", kind: "text" },
    { key: "noteText", label: "Note text", kind: "textarea", rows: 4 },
    { key: "countdown", label: "Countdown (JSON)", kind: "textarea", rows: 8 },
    { key: "products", label: "Products override (JSON)", kind: "textarea", rows: 12 },
    { key: "apiUrl", label: "Sales API URL", kind: "text" },
  ],
  render: (p) => {
    const countdown = safeJson<SectionSalesCountdown>(p.countdown);
    const products = safeJson<SectionSalesProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Sales Four">
        <SectionSalesFour
          title={String(p.title || DEFAULT_TITLE)}
          highlightText={String(p.highlightText || DEFAULT_HIGHLIGHT)}
          discountText={String(p.discountText || DEFAULT_SUFFIX)}
          countdown={countdown}
          products={products}
          apiUrl={String(p.apiUrl || SALES_API_URL)}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionSalesFour;

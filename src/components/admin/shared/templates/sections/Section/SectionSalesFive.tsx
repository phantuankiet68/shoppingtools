"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Section/SectionSalesFive.module.css";
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

export type SectionSalesFiveProps = {
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
const DOTS_COUNT = 9;

const DEFAULT_COUNTDOWN: SectionSalesCountdown = {
  days: 9,
  hours: 20,
  minutes: 15,
  seconds: 0,
};

const DEFAULT_TITLE = "Hot deals this week";
const DEFAULT_HIGHLIGHT = "Up to 65% off";
const DEFAULT_SUFFIX = "Limited stock";
const DEFAULT_NOTE = "Trending weekly deals with strong savings, verified demand, and fast local delivery.";

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
  if (soldCount <= 0) return 30;
  if (soldCount >= 3000) return 96;
  if (soldCount >= 2000) return 90;
  if (soldCount >= 1000) return 82;
  if (soldCount >= 500) return 70;
  if (soldCount >= 100) return 56;
  return 42;
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
    badge: toStringSafe(item.badge) || "Hot Deal",
    price: Number.isFinite(price) ? price : undefined,
    originalPrice: Number.isFinite(originalPrice) && originalPrice > 0 ? originalPrice : undefined,
    discountPercent,
    soldText: soldCount > 0 ? `${formatCompactCount(soldCount)} sold recently` : "Trending now",
    soldPercent: computeSoldPercent(soldCount),
    tag: fallbackTag || undefined,
    rating,
    reviewCount,
    shippingNote: toStringSafe(item.shippingNote) || "Fast local delivery",
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

function getTrustBullets(item: SectionSalesProductItem): string[] {
  const bullets: string[] = [];

  bullets.push(`Brand ${item.brand || "trusted seller"}`);
  bullets.push(item.stockText || "In stock");
  bullets.push(item.shippingNote || "Fast delivery");

  if (typeof item.rating === "number") {
    bullets.push(`Rated ${item.rating.toFixed(1)}/5`);
  }

  return bullets.slice(0, 4);
}

/* =========================
 * Component
 * ========================= */
export function SectionSalesFive({
  title = DEFAULT_TITLE,
  highlightText = DEFAULT_HIGHLIGHT,
  discountText = DEFAULT_SUFFIX,
  noteText = DEFAULT_NOTE,
  countdown,
  products,
  apiUrl = SALES_API_URL,
  preview = false,
  sectionAriaLabel = "Featured weekly sale products",
}: SectionSalesFiveProps) {
  const initialCountdown = useMemo(() => countdown ?? DEFAULT_COUNTDOWN, [countdown]);
  const regionId = useId();

  const [timeLeft, setTimeLeft] = useState<SectionSalesCountdown>(initialCountdown);
  const [activeDot, setActiveDot] = useState(2);
  const [remoteProducts, setRemoteProducts] = useState<SectionSalesProductItem[]>([]);
  const [loading, setLoading] = useState(false);

  const autoTimerRef = useRef<number | null>(null);

  const items = useMemo(() => {
    if (Array.isArray(products) && products.length > 0) return products;
    return remoteProducts;
  }, [products, remoteProducts]);

  const featuredItems = items.slice(0, 2);

  const sectionHeadingId = `${regionId}-sales-five-heading`;
  const sectionDescId = `${regionId}-sales-five-description`;
  const liveStatusId = `${regionId}-sales-five-live-status`;

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
        console.error("SectionSalesFive fetch error:", error);
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
        <header className={cls.header}>
          <div className={cls.headerLeft}>
            <div className={cls.kickerRow}>
              <span className={cls.fireBadge} aria-hidden="true">
                ✦
              </span>
              <span className={cls.kickerText}>Curated weekly picks</span>
            </div>

            <h2 className={cls.title} id={sectionHeadingId}>
              {title}
            </h2>

            <p className={cls.subtitle}>
              <strong>{highlightText}</strong>
              <span className={cls.subtitleDivider}>•</span>
              <span>{discountText}</span>
            </p>

            <p className={cls.note} id={sectionDescId}>
              {noteText}
            </p>
          </div>

          <div className={cls.headerRight}>
            <div className={cls.countdownWrap}>
              <span className={cls.countdownPrefix}>Time left</span>

              <div className={cls.countdown} aria-label="Promotion countdown timer">
                <div className={cls.countItem}>
                  <span className={cls.countBox}>{pad(timeLeft.days)}</span>
                  <span className={cls.countLabel}>Days</span>
                </div>
                <div className={cls.countItem}>
                  <span className={cls.countBox}>{pad(timeLeft.hours)}</span>
                  <span className={cls.countLabel}>Hours</span>
                </div>
                <div className={cls.countItem}>
                  <span className={cls.countBox}>{pad(timeLeft.minutes)}</span>
                  <span className={cls.countLabel}>Mins</span>
                </div>
                <div className={cls.countItem}>
                  <span className={cls.countBox}>{pad(timeLeft.seconds)}</span>
                  <span className={cls.countLabel}>Secs</span>
                </div>
              </div>
            </div>

            <span className={cls.srOnly} aria-live="polite" id={liveStatusId}>
              {getCountdownLiveText(timeLeft)}
            </span>
          </div>
        </header>

        <div className={cls.body}>
          {loading && featuredItems.length === 0 ? (
            <div className={cls.emptyState} role="status" aria-live="polite">
              Loading featured deals...
            </div>
          ) : featuredItems.length === 0 ? (
            <div className={cls.emptyState} role="status" aria-live="polite">
              No promotional products are available right now.
            </div>
          ) : (
            <>
              <div className={cls.carouselFrame}>
                <button type="button" className={`${cls.navButton} ${cls.navPrev}`} aria-label="Previous products">
                  ‹
                </button>

                <div className={cls.track} role="list" aria-describedby={liveStatusId}>
                  {featuredItems.map((item, index) => {
                    const discount = getDiscountPercent(item);
                    const savings = getSavings(item);
                    const trustBullets = getTrustBullets(item);

                    return (
                      <article className={cls.card} key={item.id ?? index + 1} role="listitem">
                        {renderProductLink(
                          item,
                          cls.cardLink,
                          <>
                            <div className={cls.cardTopMeta}>
                              <span className={cls.slideIndex}>
                                {index + 1}/{Math.max(featuredItems.length, 1)}
                              </span>
                              {item.badge ? <span className={cls.floatingBadge}>{item.badge}</span> : null}
                            </div>

                            <div className={cls.cardMain}>
                              <div className={cls.visualWrap}>
                                <div className={cls.visualGlow} aria-hidden="true" />
                                <div className={cls.imageWrap}>
                                  <Image
                                    src={item.imageSrc}
                                    alt={item.name}
                                    fill
                                    className={cls.image}
                                    sizes="(max-width: 767px) 90vw, (max-width: 1200px) 45vw, 240px"
                                    priority={index < 2}
                                  />
                                </div>

                                {discount > 0 ? (
                                  <span className={cls.discountBlob}>
                                    <strong>-{discount}%</strong>
                                  </span>
                                ) : null}
                              </div>

                              <div className={cls.content}>
                                <div className={cls.titleBlock}>
                                  {item.brand ? <span className={cls.brandText}>{item.brand}</span> : null}
                                  <h3 className={cls.productName}>{item.name}</h3>

                                  {(typeof item.rating === "number" || typeof item.reviewCount === "number") && (
                                    <div
                                      className={cls.reviewRow}
                                      aria-label={`Customer review summary: ${getReviewSummary(item)}`}
                                    >
                                      {typeof item.rating === "number" ? (
                                        <>
                                          <span className={cls.stars} aria-hidden="true">
                                            {renderStars(item.rating)}
                                          </span>
                                          <span className={cls.ratingValue}>{item.rating.toFixed(1)}</span>
                                        </>
                                      ) : null}

                                      {typeof item.reviewCount === "number" ? (
                                        <span className={cls.reviewCount}>
                                          {formatCompactCount(item.reviewCount)} reviews
                                        </span>
                                      ) : null}
                                    </div>
                                  )}
                                </div>

                                <div className={cls.priceBlock}>
                                  <div className={cls.priceRow}>
                                    {typeof item.price === "number" ? (
                                      <span className={cls.currentPrice}>{formatPrice(item.price)}</span>
                                    ) : null}

                                    {typeof item.originalPrice === "number" ? (
                                      <span className={cls.oldPrice}>{formatPrice(item.originalPrice)}</span>
                                    ) : null}
                                  </div>

                                  {typeof savings === "number" ? (
                                    <div className={cls.savingsText}>Save {formatPrice(savings)}</div>
                                  ) : null}
                                </div>

                                <ul className={cls.bulletList} aria-label="Product highlights">
                                  {trustBullets.slice(0, 3).map((bullet, bulletIndex) => (
                                    <li className={cls.bulletItem} key={`${item.id ?? index}-${bulletIndex}`}>
                                      {bullet}
                                    </li>
                                  ))}
                                </ul>

                                <div className={cls.bottomArea}>
                                  <div className={cls.progressWrap} aria-label={item.soldText || "Trending now"}>
                                    <div className={cls.progressBar}>
                                      <span
                                        className={cls.progressFill}
                                        style={{ width: `${clampPercent(item.soldPercent)}%` }}
                                      />
                                    </div>
                                    <span className={cls.progressText}>{item.soldText || "Trending now"}</span>
                                  </div>

                                  <div className={cls.ctaRow}>
                                    <span className={cls.ctaPrimary}>Buy now</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>,
                        )}
                      </article>
                    );
                  })}
                </div>

                <button type="button" className={`${cls.navButton} ${cls.navNext}`} aria-label="Next products">
                  ›
                </button>
              </div>

              <footer className={cls.footer}>
                <div className={cls.pagination} aria-label="Slider pagination">
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
export const SHOP_SECTION_SALES_FIVE: RegItem = {
  kind: "SectionSalesFive",
  label: "Section Sales Five",
  defaults: {
    title: DEFAULT_TITLE,
    highlightText: DEFAULT_HIGHLIGHT,
    discountText: DEFAULT_SUFFIX,
    noteText: DEFAULT_NOTE,
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
      <div className="sectionContainer" aria-label="Shop Section Sales Five">
        <SectionSalesFive
          title={String(p.title || DEFAULT_TITLE)}
          highlightText={String(p.highlightText || DEFAULT_HIGHLIGHT)}
          discountText={String(p.discountText || DEFAULT_SUFFIX)}
          noteText={String(p.noteText || DEFAULT_NOTE)}
          countdown={countdown}
          products={products}
          apiUrl={String(p.apiUrl || SALES_API_URL)}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionSalesFive;

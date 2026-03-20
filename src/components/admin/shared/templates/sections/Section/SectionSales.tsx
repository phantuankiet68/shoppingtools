"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Section/SectionSales.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
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

export type SectionSalesProps = {
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

/* ================= Defaults ================= */
const SALES_API_URL = "/api/v1/products/sales";
const AUTO_ROTATE_INTERVAL = 3600;
const DOTS_COUNT = 8;

const DEFAULT_COUNTDOWN: SectionSalesCountdown = {
  days: 10,
  hours: 15,
  minutes: 55,
  seconds: 59,
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

function clampPercent(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
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
  if (soldCount <= 0) return 34;
  if (soldCount >= 3000) return 94;
  if (soldCount >= 2000) return 88;
  if (soldCount >= 1000) return 80;
  if (soldCount >= 500) return 68;
  if (soldCount >= 100) return 54;
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
    badge: toStringSafe(item.badge) || "Flash Deal",
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

function getProductAriaLabel(item: SectionSalesProductItem): string {
  const price = typeof item.price === "number" ? `, now ${formatPrice(item.price)}` : "";
  const discount = getDiscountPercent(item);
  const savings = discount > 0 ? `, save ${discount}%` : "";
  return `${item.name}${price}${savings}`;
}

function renderStars(rating?: number): string {
  if (!rating) return "";
  const rounded = Math.round(rating);
  return `${"★".repeat(Math.max(0, Math.min(5, rounded)))}${"☆".repeat(Math.max(0, 5 - rounded))}`;
}

/* ================= Component ================= */
export function SectionSales({
  title = "International Women's Day gifts",
  highlightText = "Up to 65% off",
  discountText = "⚡",
  countdown,
  products,
  apiUrl = SALES_API_URL,
  preview = false,
  sectionAriaLabel = "Featured sale products",
}: SectionSalesProps) {
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

  const sectionHeadingId = `${regionId}-sale-heading`;
  const sectionDescId = `${regionId}-sale-description`;
  const liveStatusId = `${regionId}-sale-live-status`;

  useEffect(() => {
    setTimeLeft(initialCountdown);
  }, [initialCountdown]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) return prev;

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
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) return;

    const controller = new AbortController();

    const fetchSalesProducts = async () => {
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
        console.error("SectionSales fetch error:", error);
        setRemoteProducts([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchSalesProducts();

    return () => controller.abort();
  }, [apiUrl, products]);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const renderProductLink = (item: SectionSalesProductItem, children: React.ReactNode) =>
    preview ? (
      <a href="#" onClick={onBlockClick} className={cls.cardLink} aria-label={getProductAriaLabel(item)}>
        {children}
      </a>
    ) : (
      <Link href={(item.href || "/") as Route} className={cls.cardLink} aria-label={getProductAriaLabel(item)}>
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
      <div className={cls.inner}>
        <header className={cls.head}>
          <div className={cls.headLeft}>
            <h2 className={cls.title} id={sectionHeadingId}>
              <span>{title}</span>
              <strong>{highlightText}</strong>
              <em aria-hidden="true">{discountText}</em>
            </h2>
            <div className={cls.kickerRow}>
              <span className={cls.kicker}>Limited-time event</span>
              <span className={cls.kickerDivider} aria-hidden="true" />
              <span className={cls.kickerSubtle}>Curated bestsellers</span>
            </div>
          </div>

          <div className={cls.headRight}>
            <div className={cls.countdown} aria-label="Sale countdown timer">
              <div className={cls.countUnit}>
                <div className={cls.countBox}>{pad(timeLeft.days)}</div>
              </div>

              <span className={cls.countSep} aria-hidden="true">
                :
              </span>

              <div className={cls.countUnit}>
                <div className={cls.countBox}>{pad(timeLeft.hours)}</div>
              </div>

              <span className={cls.countSep} aria-hidden="true">
                :
              </span>

              <div className={cls.countUnit}>
                <div className={cls.countBox}>{pad(timeLeft.minutes)}</div>
              </div>

              <span className={cls.countSep} aria-hidden="true">
                :
              </span>

              <div className={cls.countUnit}>
                <div className={cls.countBox}>{pad(timeLeft.seconds)}</div>
              </div>
            </div>
            <span className={cls.srOnly} aria-live="polite" id={liveStatusId}>
              {`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, and ${timeLeft.seconds} seconds remaining.`}
            </span>
          </div>
        </header>

        <div className={cls.body}>
          {loading && items.length === 0 ? (
            <div className={cls.emptyState} role="status" aria-live="polite">
              Loading promotional products...
            </div>
          ) : items.length === 0 ? (
            <div className={cls.emptyState} role="status" aria-live="polite">
              No sale products are available right now.
            </div>
          ) : (
            <>
              <div className={cls.grid} role="list" aria-describedby={liveStatusId}>
                {items.map((item, index) => {
                  const soldPercent = clampPercent(item.soldPercent);
                  const discount = getDiscountPercent(item);
                  const savings = getSavings(item);
                  const hasSocialProof = typeof item.rating === "number" || typeof item.reviewCount === "number";

                  return (
                    <article className={cls.card} key={item.id ?? index} role="listitem">
                      {renderProductLink(
                        item,
                        <>
                          <div className={cls.thumbWrap}>
                            <div className={cls.mediaTopRow}>
                              {item.brand ? (
                                <span className={cls.brandMark}>{item.brand}</span>
                              ) : (
                                <span className={cls.brandMark}>Editor's pick</span>
                              )}
                              <div className={cls.mediaBadges}>
                                {item.isNew ? <span className={cls.floatingPill}>New</span> : null}
                                {discount > 0 ? <span className={cls.floatingAccent}>-{discount}%</span> : null}
                              </div>
                            </div>

                            <div className={cls.thumb}>
                              <Image
                                src={item.imageSrc}
                                alt={item.name}
                                fill
                                className={cls.image}
                                sizes="(max-width: 767px) 86vw, (max-width: 1200px) 42vw, 24vw"
                                priority={index < 2}
                              />
                            </div>

                            {item.tag ? <span className={cls.imageTag}>{item.tag}</span> : null}
                          </div>

                          <div className={cls.content}>
                            <div className={cls.badgeRow}>
                              <span className={cls.badgeIcon} aria-hidden="true">
                                ⚡
                              </span>
                              <span className={cls.badge}>{item.badge || "Flash Deal"}</span>
                            </div>

                            <h3 className={cls.productName}>{item.name}</h3>

                            {hasSocialProof ? (
                              <div className={cls.reviewRow} aria-label="Product rating and reviews">
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
                                    ({formatCompactCount(item.reviewCount)} reviews)
                                  </span>
                                ) : null}
                              </div>
                            ) : null}

                            <div className={cls.priceRow}>
                              {typeof item.price === "number" ? (
                                <div className={cls.currentPrice}>{formatPrice(item.price)}</div>
                              ) : null}

                              <div className={cls.metaPrice}>
                                {typeof item.originalPrice === "number" ? (
                                  <span className={cls.oldPrice}>{formatPrice(item.originalPrice)}</span>
                                ) : null}

                                {discount > 0 ? <span className={cls.discount}>Save {discount}%</span> : null}
                              </div>
                            </div>

                            {typeof savings === "number" ? (
                              <div className={cls.savingsRow}>You save {formatPrice(savings)}</div>
                            ) : null}

                            <div className={cls.supportMeta}>
                              {item.stockText ? (
                                <span className={cls.stockText}>{item.stockText}</span>
                              ) : (
                                <span className={cls.stockText}>In stock</span>
                              )}
                              <span className={cls.metaDot} aria-hidden="true">
                                •
                              </span>
                              <span className={cls.returnPolicy}>7-day easy return</span>
                            </div>

                            <div className={cls.soldWrap} aria-label={item.soldText || "Trending now"}>
                              <div className={cls.soldBar}>
                                <span className={cls.soldFill} style={{ width: `${soldPercent}%` }} />
                              </div>
                            </div>
                          </div>
                        </>,
                      )}
                    </article>
                  );
                })}
              </div>

              <div className={cls.bottomBar}>
                <div className={cls.dots} aria-label="Slider pagination">
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
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_SECTION_SALES: RegItem = {
  kind: "SectionSales",
  label: "Section Sales",
  defaults: {
    title: "International Women's Day gifts",
    highlightText: "Up to 65% off",
    discountText: "⚡",
    countdown: JSON.stringify(DEFAULT_COUNTDOWN, null, 2),
    products: JSON.stringify([], null, 2),
    apiUrl: SALES_API_URL,
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "highlightText", label: "Highlight text", kind: "text" },
    { key: "discountText", label: "Suffix / icon", kind: "text" },
    { key: "noteText", label: "Promotion note", kind: "text" },
    { key: "countdown", label: "Countdown (JSON)", kind: "textarea", rows: 8 },
    { key: "products", label: "Products override (JSON)", kind: "textarea", rows: 12 },
    { key: "apiUrl", label: "Sales API URL", kind: "text" },
  ],
  render: (p) => {
    const countdown = safeJson<SectionSalesCountdown>(p.countdown);
    const products = safeJson<SectionSalesProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Sales">
        <SectionSales
          title={String(p.title || "International Women's Day gifts")}
          highlightText={String(p.highlightText || "Up to 65% off")}
          discountText={String(p.discountText || "⚡")}
          noteText={String(p.noteText || "Extra 120k off on orders over 900k")}
          countdown={countdown}
          products={products}
          apiUrl={String(p.apiUrl || SALES_API_URL)}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionSales;

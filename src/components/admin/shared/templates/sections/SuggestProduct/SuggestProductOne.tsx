"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import styles from "@/styles/templates/sections/SuggestProduct/SuggestProductOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SuggestedProductOneItem = {
  id?: string | number;
  name: string;
  href: string;
  imageSrc: string;
  category?: string;
  badge?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  tags?: string[];
  shortNote?: string;
  isNew?: boolean;
};

export type SuggestedProductOneProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  viewAllText?: string;
  viewAllHref?: string;
  apiUrl?: string;
  products?: SuggestedProductOneItem[];
  preview?: boolean;
  sectionAriaLabel?: string;
};

type ApiRecord = Record<string, unknown>;

/* ================= Defaults ================= */
const PRODUCTS_API_URL = "/api/v1/products/suggested";
const ALL_TAB = "Tất cả";

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

function toNumber(value: unknown, fallback = Number.NaN): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function formatMoney(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function formatCompact(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "0";

  if (value >= 1000) {
    const compact = value / 1000;
    return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1).replace(".0", "")}k`;
  }

  return new Intl.NumberFormat("vi-VN").format(value);
}

function normalizeCategory(value?: string): string {
  if (!value) return ALL_TAB;
  const lowered = value.trim().toLowerCase();

  if (/(office|work|business|cong so|công sở)/.test(lowered)) return "Công sở";
  if (/(daily|everyday|casual)/.test(lowered)) return "Học sinh / sinh viên";
  if (/(travel|trip|du lich|du-lịch|du lịch|cong tac|công tác)/.test(lowered)) return "Du lịch / công tác";
  if (/(student|school|campus|hoc sinh|học sinh|sinh vien|sinh viên)/.test(lowered)) return "Học sinh / sinh viên";
  if (/(waterproof|water resistant|water-resistant|chong nuoc|chống nước)/.test(lowered)) return "Chống nước";
  if (/(hybrid|convertible|2 in 1|2-in-1|crossbody)/.test(lowered)) return "Công sở";

  return value
    .split(/[-_/]/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getImageFromRecord(item: ApiRecord): string {
  const image = item.image && typeof item.image === "object" ? (item.image as ApiRecord) : undefined;
  const thumbnail = item.thumbnail && typeof item.thumbnail === "object" ? (item.thumbnail as ApiRecord) : undefined;
  const coverImage =
    item.coverImage && typeof item.coverImage === "object" ? (item.coverImage as ApiRecord) : undefined;

  const direct =
    toStringSafe(item.imageSrc) ||
    toStringSafe(item.image) ||
    toStringSafe(item.thumbnail) ||
    toStringSafe(item.coverImage) ||
    toStringSafe(image?.url) ||
    toStringSafe(image?.src) ||
    toStringSafe(thumbnail?.url) ||
    toStringSafe(thumbnail?.src) ||
    toStringSafe(coverImage?.url) ||
    toStringSafe(coverImage?.src);

  if (direct) return direct;

  if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const record = first as ApiRecord;
      return (
        toStringSafe(record.url) ||
        toStringSafe(record.src) ||
        toStringSafe(record.image) ||
        toStringSafe(record.imageSrc) ||
        "/images/placeholder-product.png"
      );
    }
  }

  return "/images/placeholder-product.png";
}

function buildHref(item: ApiRecord): string {
  const href = toStringSafe(item.href);
  if (href) return href;

  const slug = toStringSafe(item.slug);
  if (slug) return `/products/${slug}`;

  const id = item.id ?? item._id;
  if (typeof id === "string" || typeof id === "number") return `/products/${String(id)}`;

  return "/products";
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function computeTags(item: ApiRecord): string[] {
  if (Array.isArray(item.tags)) {
    return dedupeStrings(item.tags.map((tag) => (typeof tag === "string" ? tag.trim() : "")).filter(Boolean)).slice(
      0,
      3,
    );
  }

  const candidates = [
    toStringSafe(item.tag),
    toStringSafe(item.feature),
    toStringSafe(item.material),
    toStringSafe(item.capacity),
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  return dedupeStrings(candidates).slice(0, 3);
}

function getBadgeFromCategory(category: string): string {
  if (category === "Công sở") return "OFFICE";
  if (category === "Học sinh / sinh viên") return "STUDENT";
  if (category === "Du lịch / công tác") return "TRAVEL";
  if (category === "Chống nước") return "WATERPROOF";
  if (category === ALL_TAB) return "FEATURED";
  return category.toUpperCase();
}

function normalizeItem(raw: unknown, index: number): SuggestedProductOneItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as ApiRecord;

  const name =
    toStringSafe(item.name) ||
    toStringSafe(item.title) ||
    toStringSafe(item.productName) ||
    toStringSafe(item.product_title);

  if (!name) return null;

  const price = toNumber(item.salePrice ?? item.price ?? item.finalPrice);
  const originalPrice = toNumber(item.originalPrice ?? item.compareAtPrice ?? item.oldPrice ?? item.listPrice);
  const rating = toNumber(item.rating ?? item.averageRating ?? item.avgRating);
  const reviewCount = toNumber(item.reviewCount ?? item.totalReviews ?? item.numReviews, 0);
  const soldCount = toNumber(item.sold ?? item.soldCount ?? item.totalSold ?? item.ordersCount, 0);
  const category = normalizeCategory(
    toStringSafe(item.category) || toStringSafe(item.group) || toStringSafe(item.segment) || toStringSafe(item.useCase),
  );

  return {
    id: (item.id as string | number | undefined) ?? (item._id as string | number | undefined) ?? index + 1,
    name,
    href: buildHref(item),
    imageSrc: getImageFromRecord(item),
    category,
    badge: toStringSafe(item.badge) || getBadgeFromCategory(category),
    price: Number.isFinite(price) ? price : undefined,
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : undefined,
    rating: Number.isFinite(rating) ? Number(rating.toFixed(1)) : undefined,
    reviewCount: Math.max(0, Math.round(reviewCount)),
    soldCount: Math.max(0, Math.round(soldCount)),
    tags: computeTags(item),
    shortNote: toStringSafe(item.shortNote) || toStringSafe(item.shippingNote) || undefined,
    isNew: Boolean(item.isNew),
  };
}

function extractProducts(payload: unknown): SuggestedProductOneItem[] {
  const source = payload as
    | SuggestedProductOneItem[]
    | { data?: unknown; items?: unknown; products?: unknown; result?: unknown };

  const list = Array.isArray(source)
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

  return list
    .map((item, index) => normalizeItem(item, index))
    .filter((item): item is SuggestedProductOneItem => Boolean(item));
}

function getTabs(items: SuggestedProductOneItem[]): string[] {
  const categories = dedupeStrings(
    items
      .map((item) => item.category)
      .filter((category): category is string => Boolean(category) && category !== ALL_TAB),
  );

  return [ALL_TAB, ...categories].slice(0, 6);
}

function renderStars(rating?: number): string {
  if (!rating) return "";
  const rounded = Math.round(Math.max(0, Math.min(5, rating)));
  return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
}

function productAriaLabel(item: SuggestedProductOneItem): string {
  const category = item.category ? `, danh mục ${item.category}` : "";
  const price = typeof item.price === "number" ? `, giá ${formatMoney(item.price)}` : "";
  return `${item.name}${category}${price}`;
}

/* ================= Component ================= */
export function SuggestedProductOne({
  eyebrow = "SẢN PHẨM LIÊN QUAN",
  title = "Chọn kiểu cặp phù hợp với bạn",
  subtitle = "Lọc nhanh theo nhu cầu sử dụng: đi làm, đi học, du lịch, công tác.",
  viewAllText = "Xem tất cả",
  viewAllHref = "/products",
  apiUrl = PRODUCTS_API_URL,
  products,
  preview = false,
  sectionAriaLabel = "Sản phẩm liên quan",
}: SuggestedProductOneProps) {
  const regionId = useId();
  const [remoteProducts, setRemoteProducts] = useState<SuggestedProductOneItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(ALL_TAB);

  const items = useMemo(() => {
    if (Array.isArray(products) && products.length > 0) return products.slice(0, 12);
    return remoteProducts.slice(0, 12);
  }, [products, remoteProducts]);

  const tabs = useMemo(() => getTabs(items), [items]);

  const filteredItems = useMemo(() => {
    if (activeTab === ALL_TAB) return items;
    return items.filter((item) => item.category === activeTab);
  }, [activeTab, items]);

  useEffect(() => {
    if (!tabs.includes(activeTab)) setActiveTab(ALL_TAB);
  }, [tabs, activeTab]);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) return;

    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);

        const data = (await res.json()) as unknown;
        setRemoteProducts(extractProducts(data));
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("SuggestedProductOne fetch error:", error);
        setRemoteProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchProducts();

    return () => controller.abort();
  }, [apiUrl, products]);

  const headingId = `${regionId}-suggested-products-title`;
  const descId = `${regionId}-suggested-products-description`;

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const renderLink = (item: SuggestedProductOneItem, children: React.ReactNode, className?: string) =>
    preview ? (
      <a href="#" onClick={onBlockClick} className={className} aria-label={productAriaLabel(item)}>
        {children}
      </a>
    ) : (
      <Link href={(item.href || "/products") as Route} className={className} aria-label={productAriaLabel(item)}>
        {children}
      </Link>
    );

  return (
    <section
      className={styles.section}
      aria-label={sectionAriaLabel}
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            <div className={styles.kickerRow}>
              <span className={styles.kicker}>{eyebrow}</span>
            </div>

            <h2 id={headingId} className={styles.title}>
              {title}
            </h2>

            <p id={descId} className={styles.subtitle}>
              {subtitle}
            </p>
          </div>

          <div className={styles.headerAside}>
            <div className={styles.tabs} role="tablist" aria-label="Danh mục sản phẩm gợi ý">
              {tabs.map((tab, index) => {
                const isActive = tab === activeTab;
                return (
                  <button
                    key={`${tab}-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    <span className={styles.tabDot} aria-hidden="true" />
                    {tab}
                  </button>
                );
              })}
            </div>

            {!preview ? (
              <Link href={(viewAllHref || "/products") as Route} className={styles.viewAllDesktop}>
                {viewAllText}
              </Link>
            ) : (
              <a href="#" onClick={onBlockClick} className={styles.viewAllDesktop}>
                {viewAllText}
              </a>
            )}
          </div>
        </header>

        {loading && items.length === 0 ? (
          <div className={styles.emptyState} role="status" aria-live="polite">
            Đang tải sản phẩm gợi ý...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState} role="status" aria-live="polite">
            Không có sản phẩm phù hợp trong nhóm này.
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredItems.map((item, index) => (
              <article className={styles.card} key={item.id ?? index}>
                {renderLink(
                  item,
                  <>
                    <div className={styles.media}>
                      <div className={styles.badgeRow}>
                        <span className={styles.badge}>{item.badge || "FEATURED"}</span>
                        {item.isNew ? <span className={styles.secondaryBadge}>Mới</span> : null}
                      </div>

                      <div className={styles.imageWrap}>
                        <Image
                          src={item.imageSrc}
                          alt={item.name}
                          fill
                          className={styles.image}
                          sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                    </div>

                    <div className={styles.body}>
                      <h3 className={styles.cardTitle}>{item.name}</h3>

                      {item.tags && item.tags.length > 0 ? (
                        <div className={styles.tagList}>
                          {item.tags.map((tag, tagIndex) => (
                            <span key={`${tag}-${tagIndex}`} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className={styles.priceRow}>
                        <div className={styles.priceGroup}>
                          {typeof item.price === "number" ? (
                            <span className={styles.currentPrice}>{formatMoney(item.price)}</span>
                          ) : null}
                          {typeof item.originalPrice === "number" ? (
                            <span className={styles.oldPrice}>{formatMoney(item.originalPrice)}</span>
                          ) : null}
                        </div>

                        {typeof item.soldCount === "number" && item.soldCount > 0 ? (
                          <span className={styles.soldText}>Đã bán {formatCompact(item.soldCount)}</span>
                        ) : null}
                      </div>

                      <div className={styles.metaRow}>
                        {typeof item.rating === "number" ? (
                          <div className={styles.rating}>
                            <span className={styles.stars} aria-hidden="true">
                              {renderStars(item.rating)}
                            </span>
                            <span className={styles.ratingText}>{item.rating.toFixed(1)}</span>
                          </div>
                        ) : null}

                        {typeof item.reviewCount === "number" && item.reviewCount > 0 ? (
                          <span className={styles.reviewText}>{formatCompact(item.reviewCount)} đánh giá</span>
                        ) : null}
                      </div>
                    </div>
                  </>,
                  styles.cardLink,
                )}
              </article>
            ))}
          </div>
        )}

        {!preview ? (
          <Link href={(viewAllHref || "/products") as Route} className={styles.viewAllMobile}>
            {viewAllText}
          </Link>
        ) : (
          <a href="#" onClick={onBlockClick} className={styles.viewAllMobile}>
            {viewAllText}
          </a>
        )}
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_SUGGESTED_PRODUCT_ONE: RegItem = {
  kind: "SuggestedProductOne",
  label: "Suggested Product One",
  defaults: {
    eyebrow: "SẢN PHẨM LIÊN QUAN",
    title: "Chọn kiểu cặp phù hợp với bạn",
    subtitle: "Lọc nhanh theo nhu cầu sử dụng: đi làm, đi học, du lịch, công tác.",
    viewAllText: "Xem tất cả",
    viewAllHref: "/products",
    apiUrl: PRODUCTS_API_URL,
    products: JSON.stringify([], null, 2),
  },
  inspector: [
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "text" },
    { key: "viewAllText", label: "View all text", kind: "text" },
    { key: "viewAllHref", label: "View all URL", kind: "text" },
    { key: "apiUrl", label: "Products API URL", kind: "text" },
    { key: "products", label: "Products override (JSON)", kind: "textarea", rows: 12 },
  ],
  render: (p) => {
    const products = safeJson<SuggestedProductOneItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Suggested Product One">
        <SuggestedProductOne
          eyebrow={String(p.eyebrow || "SẢN PHẨM LIÊN QUAN")}
          title={String(p.title || "Chọn kiểu cặp phù hợp với bạn")}
          subtitle={String(p.subtitle || "Lọc nhanh theo nhu cầu sử dụng: đi làm, đi học, du lịch, công tác.")}
          viewAllText={String(p.viewAllText || "Xem tất cả")}
          viewAllHref={String(p.viewAllHref || "/products")}
          apiUrl={String(p.apiUrl || PRODUCTS_API_URL)}
          products={products}
          preview={true}
        />
      </div>
    );
  },
};

export default SuggestedProductOne;

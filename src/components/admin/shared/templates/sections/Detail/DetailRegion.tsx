"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Detail/DetailRegion.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* =========================
 * Types
 * ========================= */
type UnknownRecord = Record<string, unknown>;
type ProductIdentifier = string | number;

export type ProductReviewItem = {
  id?: string | number;
  author?: string;
  avatar?: string;
  rating?: number;
  title?: string;
  content?: string;
  createdAt?: string;
  verified?: boolean;
};

export type DetailRegionProduct = {
  id?: ProductIdentifier;
  name: string;
  slug?: string;
  href?: string;
  imageSrc: string;
  gallery?: string[];
  brand?: string;
  category?: string;
  badge?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  marketPrice?: number;
  savingPrice?: number;
  discountPercent?: number;
  stockText?: string;
  stockCount?: number;
  sku?: string;
  tag?: string;
  shippingNote?: string;
  rating?: number;
  reviewCount?: number;
  soldText?: string;
  soldCount?: number;
  isNew?: boolean;
  reviews?: ProductReviewItem[];
};

export type DetailRegionProps = {
  title?: string;
  eyebrow?: string;
  noteText?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  apiBasePath?: string;
  orderApiPath?: string;
  reviewApiPath?: string;
  preview?: boolean;
  product?: DetailRegionProduct | null;
  fallbackBreadcrumbText?: string;
  sectionAriaLabel?: string;
};

/* =========================
 * Constants
 * ========================= */
const DEFAULT_TITLE = "Product Detail Experience";
const DEFAULT_EYEBROW = "Premium product layout";
const DEFAULT_PRIMARY_CTA = "Buy now";
const DEFAULT_SECONDARY_CTA = "Add to cart";
const DEFAULT_API_BASE_PATH = "/api/v1/products/product-detail";
const DEFAULT_ORDER_API_PATH = "/api/v1/order";
const DEFAULT_REVIEW_API_PATH = "/api/v1/reviews";
const DEFAULT_FALLBACK_BREADCRUMB = "Products";
const DEFAULT_SECTION_ARIA_LABEL = "Product detail section";
const PLACEHOLDER_IMAGE = "/images/placeholder-product.png";
const DEFAULT_PRODUCT_NAME = "Product";

type TabKey = "overview" | "specs" | "shipping" | "reviews";

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

function toStringSafe(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback = NaN): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function isProductIdentifier(value: unknown): value is ProductIdentifier {
  return typeof value === "string" || typeof value === "number";
}

function normalizePath(path?: string, fallback = "/"): string {
  if (!path) return fallback;
  const trimmed = path.trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function joinUrl(base: string, segment: string): string {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanSegment = segment.replace(/^\/+/, "");
  return `${cleanBase}/${cleanSegment}`;
}

function formatPrice(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "Contact us";
  return `${new Intl.NumberFormat("en-US").format(value)}₫`;
}

function formatCompactCount(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "0";

  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatDate(value?: string): string {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function clampRating(value?: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(5, Number(value.toFixed(1))));
}

function getInitials(value?: string): string {
  const text = (value || "User").trim();
  if (!text) return "U";

  return (
    text
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("") || "U"
  );
}

function buildStars(rating = 0): Array<"full" | "empty"> {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => (index < rounded ? "full" : "empty"));
}

function renderStarsLabel(rating = 0): string {
  const rounded = Math.round(rating);
  return `${"★".repeat(rounded)}${"☆".repeat(Math.max(0, 5 - rounded))}`;
}

/* =========================
 * Product normalization
 * ========================= */
function getImageFromRecord(item: UnknownRecord): string {
  const imageObject = item.image && typeof item.image === "object" ? (item.image as UnknownRecord) : undefined;
  const thumbnailObject =
    item.thumbnail && typeof item.thumbnail === "object" ? (item.thumbnail as UnknownRecord) : undefined;
  const coverImageObject =
    item.coverImage && typeof item.coverImage === "object" ? (item.coverImage as UnknownRecord) : undefined;

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
      const obj = first as UnknownRecord;
      return toStringSafe(obj.url) || toStringSafe(obj.src) || toStringSafe(obj.image) || PLACEHOLDER_IMAGE;
    }
  }

  return PLACEHOLDER_IMAGE;
}

function getGalleryFromRecord(item: UnknownRecord): string[] {
  const galleryValues: string[] = [];

  const pushValue = (value: unknown) => {
    const str = toStringSafe(value);
    if (str) galleryValues.push(str);
  };

  pushValue(item.imageSrc);

  if (item.image && typeof item.image === "object") {
    const imageObj = item.image as UnknownRecord;
    pushValue(imageObj.url);
    pushValue(imageObj.src);
  }

  if (Array.isArray(item.images)) {
    item.images.forEach((entry) => {
      if (typeof entry === "string") {
        pushValue(entry);
        return;
      }

      if (entry && typeof entry === "object") {
        const obj = entry as UnknownRecord;
        pushValue(obj.url);
        pushValue(obj.src);
        pushValue(obj.image);
        pushValue(obj.imageSrc);
      }
    });
  }

  return Array.from(new Set(galleryValues.filter(Boolean)));
}

function computeDiscountPercent(price?: number, originalPrice?: number, rawDiscount?: number): number {
  if (typeof rawDiscount === "number" && Number.isFinite(rawDiscount)) {
    return Math.max(0, Math.round(rawDiscount));
  }

  if (
    typeof price === "number" &&
    typeof originalPrice === "number" &&
    Number.isFinite(price) &&
    Number.isFinite(originalPrice) &&
    originalPrice > price &&
    originalPrice > 0
  ) {
    return Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100));
  }

  return 0;
}

function computeRating(item: UnknownRecord): number | undefined {
  return clampRating(toNumber(item.rating ?? item.averageRating ?? item.avgRating, NaN));
}

function computeReviewCount(item: UnknownRecord): number | undefined {
  const count = toNumber(item.reviewCount ?? item.reviewsCount ?? item.totalReviews ?? item.numReviews, NaN);
  if (!Number.isFinite(count) || count < 0) return undefined;
  return Math.round(count);
}

function buildStockText(item: UnknownRecord): string | undefined {
  const stock = toNumber(item.stock ?? item.inventory ?? item.quantity ?? item.productQty ?? item.stockQty, NaN);
  if (!Number.isFinite(stock)) return undefined;
  if (stock <= 0) return "Out of stock";
  if (stock <= 8) return `Only ${stock} left`;
  if (stock <= 24) return "Low stock";
  return "In stock";
}

function buildShippingNote(item: UnknownRecord): string {
  return toStringSafe(item.shippingNote) || "Delivery in 2–4 business days";
}

function buildShortDescription(item: UnknownRecord): string | undefined {
  return (
    toStringSafe(item.shortDescription) ||
    toStringSafe(item.summary) ||
    toStringSafe(item.excerpt) ||
    toStringSafe(item.description) ||
    undefined
  );
}

function detectBrand(item: UnknownRecord, name: string): string | undefined {
  const brandObject = item.brand && typeof item.brand === "object" ? (item.brand as UnknownRecord) : undefined;

  const explicitBrand =
    toStringSafe(item.brand) ||
    toStringSafe(brandObject?.name) ||
    toStringSafe(item.brandName) ||
    toStringSafe(item.vendor);

  if (explicitBrand) return explicitBrand;

  const extracted = name.trim().split(/\s+/).slice(0, 2).join(" ");
  return extracted || undefined;
}

function detectCategory(item: UnknownRecord): string | undefined {
  const categoryObject =
    item.category && typeof item.category === "object" ? (item.category as UnknownRecord) : undefined;

  return (
    toStringSafe(item.category) || toStringSafe(categoryObject?.name) || toStringSafe(item.collection) || undefined
  );
}

function buildHref(item: UnknownRecord): string | undefined {
  const href = toStringSafe(item.href);
  if (href) return normalizePath(href);

  const slug = toStringSafe(item.slug);
  if (slug) return joinUrl("/product-detail", slug);

  const id = item.id ?? item._id;
  if (isProductIdentifier(id)) {
    return joinUrl("/product-detail", String(id));
  }

  return undefined;
}

function normalizeReview(raw: unknown, index: number): ProductReviewItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as UnknownRecord;
  const rating = toNumber(item.rating ?? item.star ?? item.stars, NaN);

  return {
    id: (item.id as string | number | undefined) ?? index,
    author: toStringSafe(item.author) || toStringSafe(item.userName) || toStringSafe(item.name) || "Customer",
    avatar: toStringSafe(item.avatar) || toStringSafe(item.photo) || undefined,
    rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, Math.round(rating))) : 5,
    title: toStringSafe(item.title) || undefined,
    content:
      toStringSafe(item.content) ||
      toStringSafe(item.comment) ||
      toStringSafe(item.review) ||
      "Exactly as described, well packaged, and easy to wear throughout the day.",
    createdAt: toStringSafe(item.createdAt) || toStringSafe(item.date) || undefined,
    verified: Boolean(item.verified ?? item.isVerified ?? true),
  };
}

function getReviewsFromRecord(item: UnknownRecord): ProductReviewItem[] {
  if (!Array.isArray(item.reviews)) return [];
  return item.reviews.map(normalizeReview).filter(Boolean) as ProductReviewItem[];
}

function normalizeProduct(raw: unknown): DetailRegionProduct | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as UnknownRecord;
  const name =
    toStringSafe(item.name) ||
    toStringSafe(item.title) ||
    toStringSafe(item.productName) ||
    toStringSafe(item.product_title);

  if (!name) return null;

  const imageSrc = getImageFromRecord(item);
  const price = toNumber(item.salePrice ?? item.price ?? item.finalPrice, NaN);
  const originalPrice = toNumber(
    item.originalPrice ?? item.compareAtPrice ?? item.oldPrice ?? item.listPrice ?? item.marketPrice,
    NaN,
  );
  const marketPrice = toNumber(item.marketPrice, NaN);
  const savingPrice = toNumber(item.savingPrice, NaN);
  const stockCount = toNumber(item.stock ?? item.inventory ?? item.quantity ?? item.productQty ?? item.stockQty, NaN);
  const soldCount = toNumber(item.sold ?? item.soldCount ?? item.stockSold ?? item.ordersCount ?? item.totalSold, NaN);
  const reviewCount = computeReviewCount(item);
  const rating = computeRating(item);
  const normalizedReviews = getReviewsFromRecord(item);

  return {
    id: isProductIdentifier(item.id) ? item.id : isProductIdentifier(item._id) ? item._id : undefined,
    name,
    slug: toStringSafe(item.slug) || undefined,
    href: buildHref(item),
    imageSrc: imageSrc || PLACEHOLDER_IMAGE,
    gallery: getGalleryFromRecord(item),
    brand: detectBrand(item, name),
    category: detectCategory(item),
    badge: toStringSafe(item.badge) || (Boolean(item.isNew) ? "New arrival" : "Official store"),
    shortDescription: buildShortDescription(item),
    description: toStringSafe(item.description) || undefined,
    price: Number.isFinite(price) ? price : undefined,
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : undefined,
    marketPrice: Number.isFinite(marketPrice) ? marketPrice : undefined,
    savingPrice: Number.isFinite(savingPrice) ? savingPrice : undefined,
    discountPercent: computeDiscountPercent(
      Number.isFinite(price) ? price : undefined,
      Number.isFinite(originalPrice) ? originalPrice : undefined,
      toNumber(item.discountPercent ?? item.discount, NaN),
    ),
    stockText: toStringSafe(item.stockText) || buildStockText(item),
    stockCount: Number.isFinite(stockCount) ? stockCount : undefined,
    sku: toStringSafe(item.sku) || toStringSafe(item.code) || undefined,
    tag:
      toStringSafe(item.tag) ||
      toStringSafe(item.variantCode) ||
      (Array.isArray(item.tags) && item.tags.length > 0 ? toStringSafe(item.tags[0]) : "") ||
      undefined,
    shippingNote: buildShippingNote(item),
    rating: rating ?? (reviewCount ? 4.7 : 4.8),
    reviewCount: reviewCount ?? normalizedReviews.length ?? 0,
    soldText:
      toStringSafe(item.soldText) ||
      (Number.isFinite(soldCount) && soldCount > 0 ? `${formatCompactCount(soldCount)} sold` : "10k+ sold"),
    soldCount: Number.isFinite(soldCount) ? soldCount : undefined,
    isNew: Boolean(item.isNew),
    reviews: normalizedReviews,
  };
}

function extractProductFromResponse(data: unknown): DetailRegionProduct | null {
  if (!data) return null;

  if (typeof data === "object" && data !== null) {
    const source = data as UnknownRecord;

    if (source.data && typeof source.data === "object") {
      const normalized = normalizeProduct(source.data);
      if (normalized) return normalized;
    }

    if (source.product && typeof source.product === "object") {
      const normalized = normalizeProduct(source.product);
      if (normalized) return normalized;
    }

    if (source.result && typeof source.result === "object") {
      const normalized = normalizeProduct(source.result);
      if (normalized) return normalized;
    }

    if (Array.isArray(source.items) && source.items.length > 0) {
      const normalized = normalizeProduct(source.items[0]);
      if (normalized) return normalized;
    }
  }

  return normalizeProduct(data);
}

/* =========================
 * Derived data
 * ========================= */
function getSavings(product?: DetailRegionProduct | null): number | undefined {
  if (!product) return undefined;
  if (typeof product.price !== "number" || typeof product.originalPrice !== "number") return undefined;
  if (product.originalPrice <= product.price) return undefined;
  return product.originalPrice - product.price;
}

function getImageAlt(
  product?: DetailRegionProduct | null,
  kind: "hero" | "thumbnail" = "hero",
  index?: number,
): string {
  const productName = product?.name?.trim() || DEFAULT_PRODUCT_NAME;

  if (kind === "thumbnail" && typeof index === "number") {
    return `${productName} gallery image ${index + 1}`;
  }

  return `${productName} product image`;
}

function buildProductJsonLd(product: DetailRegionProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery && product.gallery.length > 0 ? product.gallery : [product.imageSrc],
    description: product.shortDescription || product.description,
    sku: product.sku,
    category: product.category,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    offers:
      typeof product.price === "number"
        ? {
            "@type": "Offer",
            priceCurrency: "VND",
            price: product.price,
            availability:
              product.stockText === "Out of stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            url: product.href,
          }
        : undefined,
    aggregateRating:
      typeof product.rating === "number" && typeof product.reviewCount === "number" && product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };
}

function deriveSlugSegmentsFromPathname(pathname: string | null): string[] {
  if (!pathname) return [];

  const clean = pathname.split("?")[0].split("#")[0];
  const marker = "/product-detail/";
  const index = clean.indexOf(marker);

  if (index === -1) return [];

  const slugPart = clean.slice(index + marker.length).trim();
  if (!slugPart) return [];

  return slugPart.split("/").filter(Boolean).map(decodeURIComponent);
}

function getLastSlugSegment(slugSegments: string[]): string {
  return slugSegments.length > 0 ? slugSegments[slugSegments.length - 1] || "" : "";
}

function buildProductRequestCandidates(apiBasePath: string, slugSegments: string[]): string[] {
  const base = normalizePath(apiBasePath, DEFAULT_API_BASE_PATH).replace(/\/+$/, "");
  const encodedSegments = slugSegments.map(encodeURIComponent);
  const joinedPath = encodedSegments.join("/");
  const lastSegment = getLastSlugSegment(slugSegments);
  const encodedLast = encodeURIComponent(lastSegment);

  const candidates = new Set<string>();
  candidates.add(base);

  if (joinedPath) candidates.add(`${base}/${joinedPath}`);

  if (encodedLast) {
    candidates.add(`${base}/${encodedLast}`);
    candidates.add(`${base}?slug=${encodedLast}`);
    candidates.add(`${base}?productSlug=${encodedLast}`);
    candidates.add(`${base}?id=${encodedLast}`);
    candidates.add(`${base}?productId=${encodedLast}`);
    candidates.add(`${base}?code=${encodedLast}`);
    candidates.add(`${base}?sku=${encodedLast}`);
  }

  return Array.from(candidates);
}

function buildReviewsApiUrl(reviewApiPath: string, productId: ProductIdentifier): string {
  const base = normalizePath(reviewApiPath, DEFAULT_REVIEW_API_PATH);
  const url = new URL(base, "http://localhost");
  url.searchParams.set("productId", String(productId));
  return `${url.pathname}${url.search}`;
}

function getRatingBreakdown(rating = 4.8) {
  const score = Math.max(1, Math.min(5, rating));
  const five = Math.max(45, Math.round(score * 18));
  const four = Math.max(10, 100 - five - 12);
  const three = 7;
  const two = 3;
  const one = 2;
  const total = five + four + three + two + one;

  return [5, 4, 3, 2, 1].map((star, index) => {
    const values = [five, four, three, two, one];
    return { star, percent: Math.round((values[index] / total) * 100) };
  });
}

function buildAddToOrderPayload(product: DetailRegionProduct, qty: number) {
  const unitPrice = typeof product.price === "number" ? product.price : 0;
  const subtotal = unitPrice * qty;

  return {
    qty,
    source: "detail-region",
    productId: isProductIdentifier(product.id) ? String(product.id) : null,
    variantId: product.tag || null,
    item: {
      productId: isProductIdentifier(product.id) ? String(product.id) : null,
      variantId: product.tag || null,
      productNameSnapshot: product.name,
      variantNameSnapshot: product.tag || null,
      skuSnapshot: product.sku || null,
      imageSnapshot: product.imageSrc || null,
      qty,
      unitPriceCents: unitPrice,
      subtotalCents: subtotal,
      discountCents: 0,
      taxCents: 0,
      totalCents: subtotal,
    },
  };
}

async function fetchProductByCandidates(
  candidates: string[],
  signal: AbortSignal,
): Promise<DetailRegionProduct | null> {
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal,
      });

      if (res.status === 404) continue;
      if (!res.ok) {
        console.warn("DetailRegion fetch product failed:", res.status, url);
        continue;
      }

      const data = (await res.json()) as unknown;
      const normalized = extractProductFromResponse(data);
      if (normalized) return normalized;
    } catch (error) {
      if (signal.aborted) return null;
      console.warn("DetailRegion fetch candidate error:", url, error);
    }
  }

  return null;
}

/* =========================
 * Small UI helpers
 * ========================= */
function ReviewStars({ rating }: { rating?: number }) {
  const stars = buildStars(rating ?? 0);

  return (
    <span className={cls.starRow} aria-label={`Rated ${rating ?? 0} out of 5`}>
      {stars.map((state, index) => (
        <span key={`${state}-${index}`} className={state === "full" ? cls.starFull : cls.starEmpty}>
          ★
        </span>
      ))}
    </span>
  );
}

function FeatureBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className={cls.featureBadge}>
      <span aria-hidden="true">{icon}</span>
      <span>{text}</span>
    </span>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={cls.metricCard}>
      <span className={cls.metricLabel}>{label}</span>
      <strong className={cls.metricValue}>{value}</strong>
    </div>
  );
}

/* =========================
 * Component
 * ========================= */
export function DetailRegion({
  title = DEFAULT_TITLE,
  eyebrow = DEFAULT_EYEBROW,
  noteText,
  primaryCtaText = DEFAULT_PRIMARY_CTA,
  secondaryCtaText = DEFAULT_SECONDARY_CTA,
  apiBasePath = DEFAULT_API_BASE_PATH,
  orderApiPath = DEFAULT_ORDER_API_PATH,
  reviewApiPath = DEFAULT_REVIEW_API_PATH,
  preview = false,
  product,
  fallbackBreadcrumbText = DEFAULT_FALLBACK_BREADCRUMB,
  sectionAriaLabel = DEFAULT_SECTION_ARIA_LABEL,
}: DetailRegionProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [remoteProduct, setRemoteProduct] = useState<DetailRegionProduct | null>(null);
  const [remoteReviews, setRemoteReviews] = useState<ProductReviewItem[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const slugSegments = useMemo(() => deriveSlugSegmentsFromPathname(pathname), [pathname]);
  const requestCandidates = useMemo(
    () => buildProductRequestCandidates(apiBasePath, slugSegments),
    [apiBasePath, slugSegments],
  );

  const stableIdBase = useMemo(() => {
    const raw = String(
      product?.id ?? remoteProduct?.id ?? product?.slug ?? remoteProduct?.slug ?? pathname ?? "detail-region",
    );

    return (
      raw
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "detail-region"
    );
  }, [pathname, product?.id, product?.slug, remoteProduct?.id, remoteProduct?.slug]);

  const headingId = `${stableIdBase}-detail-region-heading`;
  const tabsId = `${stableIdBase}-detail-region-tabs`;

  const normalizedPropProduct = useMemo(() => (product ? normalizeProduct(product) : null), [product]);
  const currentProduct = normalizedPropProduct ?? remoteProduct;

  const gallery = useMemo(() => {
    if (!currentProduct) return [];
    return Array.from(new Set([currentProduct.imageSrc, ...(currentProduct.gallery || [])].filter(Boolean)));
  }, [currentProduct]);

  const heroImage = gallery[selectedImage] || currentProduct?.imageSrc || PLACEHOLDER_IMAGE;
  const detailHref =
    currentProduct?.href || (slugSegments.length > 0 ? `/product-detail/${slugSegments.join("/")}` : "/product-detail");

  const reviews = useMemo(() => {
    if (remoteReviews.length > 0) return remoteReviews;
    return currentProduct?.reviews || [];
  }, [remoteReviews, currentProduct?.reviews]);

  const averageRating = useMemo(() => {
    if (remoteReviews.length > 0) {
      const validRatings = remoteReviews
        .map((item) => item.rating)
        .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

      if (validRatings.length > 0) {
        const avg = validRatings.reduce((sum, value) => sum + value, 0) / validRatings.length;
        return Number(avg.toFixed(1));
      }
    }

    return currentProduct?.rating ?? 4.8;
  }, [remoteReviews, currentProduct?.rating]);

  const visibleReviewCount =
    remoteReviews.length > 0 ? remoteReviews.length : (currentProduct?.reviewCount ?? reviews.length);

  const savings = getSavings(currentProduct);
  const subtotal = typeof currentProduct?.price === "number" ? currentProduct.price * quantity : undefined;
  const ratingBreakdown = getRatingBreakdown(averageRating);

  useEffect(() => {
    setSelectedImage(0);
  }, [currentProduct?.id, currentProduct?.imageSrc]);

  useEffect(() => {
    setOrderMessage("");
  }, [currentProduct?.id, quantity]);

  useEffect(() => {
    if (normalizedPropProduct || preview) return;

    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        const normalized = await fetchProductByCandidates(requestCandidates, controller.signal);
        if (!controller.signal.aborted) setRemoteProduct(normalized);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("DetailRegion fetch error:", error);
        setRemoteProduct(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void run();
    return () => controller.abort();
  }, [normalizedPropProduct, preview, requestCandidates]);

  useEffect(() => {
    const productId = currentProduct?.id;

    if (!isProductIdentifier(productId) || preview) {
      setRemoteReviews([]);
      return;
    }

    const controller = new AbortController();

    async function run() {
      try {
        setReviewsLoading(true);

        const reviewUrl = buildReviewsApiUrl(reviewApiPath, productId as ProductIdentifier);
        const res = await fetch(reviewUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });

        if (res.status === 404) {
          setRemoteReviews([]);
          return;
        }

        if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);

        const data = (await res.json()) as unknown;
        const source = typeof data === "object" && data !== null ? (data as UnknownRecord) : null;
        const rawList =
          (Array.isArray(source?.data) && source.data) ||
          (Array.isArray(source?.reviews) && source.reviews) ||
          (Array.isArray(source?.items) && source.items) ||
          [];

        setRemoteReviews(rawList.map(normalizeReview).filter(Boolean) as ProductReviewItem[]);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("DetailRegion reviews fetch error:", error);
        setRemoteReviews([]);
      } finally {
        if (!controller.signal.aborted) setReviewsLoading(false);
      }
    }

    void run();
    return () => controller.abort();
  }, [currentProduct?.id, preview, reviewApiPath]);

  const onPreviewClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!preview) return;
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (isModified) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const renderLink = (href: string, className: string, children: React.ReactNode, ariaLabel?: string) => {
    const finalHref = normalizePath(href);

    if (preview) {
      return (
        <a href={finalHref} onClick={onPreviewClick} className={className} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }

    if (/^https?:\/\//i.test(finalHref)) {
      return (
        <a href={finalHref} className={className} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }

    return (
      <Link href={finalHref as Route} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  };

  const handleAddToOrder = async () => {
    const productToOrder = currentProduct;
    if (!productToOrder) return;

    if (preview) {
      setOrderMessage("Preview mode: order API was not called.");
      return;
    }

    try {
      setOrdering(true);
      setOrderMessage("");

      const payload = buildAddToOrderPayload(productToOrder, quantity);
      const res = await fetch(normalizePath(orderApiPath, DEFAULT_ORDER_API_PATH), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = (await res.json().catch(() => null)) as UnknownRecord | null;

      if (!res.ok) {
        throw new Error(
          toStringSafe(raw?.message) || toStringSafe(raw?.error) || "Unable to add this product to the cart.",
        );
      }

      setOrderMessage(toStringSafe(raw?.message) || "Product added successfully.");
    } catch (error) {
      console.error("Add to cart error:", error);
      setOrderMessage(error instanceof Error ? error.message : "Something went wrong while adding the product.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading && !currentProduct) {
    return (
      <section className={cls.section} aria-label={sectionAriaLabel} aria-labelledby={headingId}>
        <div className={cls.container}>
          <div className={cls.stateCard}>Loading product details...</div>
        </div>
      </section>
    );
  }

  if (!currentProduct) {
    return (
      <section className={cls.section} aria-label={sectionAriaLabel} aria-labelledby={headingId}>
        <div className={cls.container}>
          <div className={cls.stateCard}>No product data available.</div>
        </div>
      </section>
    );
  }

  return (
    <section className={cls.section} aria-label={sectionAriaLabel} aria-labelledby={headingId}>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildProductJsonLd({
              ...currentProduct,
              rating: averageRating,
              reviewCount: visibleReviewCount,
            }),
          ),
        }}
      />

      <div className={cls.container}>
        <header className={cls.topbar}>
          <nav className={cls.breadcrumbs} aria-label="Breadcrumb">
            <Link href={"/" as Route} className={cls.breadcrumbLink}>
              Home
            </Link>
            <span className={cls.breadcrumbDivider}>/</span>
            <Link href={"/product-detail" as Route} className={cls.breadcrumbLink}>
              {fallbackBreadcrumbText}
            </Link>
            <span className={cls.breadcrumbDivider}>/</span>
            <span className={cls.breadcrumbCurrent}>{currentProduct.name}</span>
          </nav>

          <div className={cls.headlineBlock}>
            <div className={cls.headlineLeft}>
              <span className={cls.eyebrow}>{eyebrow}</span>
              <h2 id={headingId} className={cls.title}>
                {title}
              </h2>
              <p className={cls.subtitle}>
                {noteText ||
                  "A modern commerce-ready product detail layout focused on clarity, trust, and conversion performance."}
              </p>
            </div>

            <div className={cls.headlineRight}>
              <MetricCard label="Rating" value={`${averageRating.toFixed(1)}/5`} />
              <MetricCard label="Reviews" value={formatCompactCount(visibleReviewCount)} />
              <MetricCard label="Sold" value={currentProduct.soldText || "10k+ sold"} />
            </div>
          </div>
        </header>

        <div className={cls.heroGrid}>
          <article className={cls.mediaCard} aria-label="Product gallery">
            <div className={cls.mediaTop}>
              <div className={cls.badgeGroup}>
                {currentProduct.badge ? <span className={cls.primaryBadge}>{currentProduct.badge}</span> : null}
                {currentProduct.discountPercent ? (
                  <span className={cls.secondaryBadge}>{currentProduct.discountPercent}% off</span>
                ) : null}
              </div>

              <div className={cls.quickReview}>
                <ReviewStars rating={averageRating} />
                <span>{averageRating.toFixed(1)}</span>
                <span className={cls.dot}>•</span>
                <span>{formatCompactCount(visibleReviewCount)} reviews</span>
              </div>
            </div>

            <div className={cls.heroVisual}>
              <div className={cls.heroGlow} aria-hidden="true" />
              <Image
                src={heroImage}
                alt={getImageAlt(currentProduct, "hero")}
                fill
                priority
                className={cls.heroImage}
                sizes="(max-width: 991px) 100vw, 720px"
              />
            </div>

            {gallery.length > 1 ? (
              <div className={cls.thumbRail} role="list" aria-label="Product thumbnails">
                {gallery.slice(0, 7).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`${cls.thumbButton} ${selectedImage === index ? cls.thumbButtonActive : ""}`}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Select product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                  >
                    <span className={cls.thumbFrame}>
                      <Image
                        src={image}
                        alt={getImageAlt(currentProduct, "thumbnail", index)}
                        fill
                        className={cls.thumbImage}
                        sizes="96px"
                      />
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className={cls.infoStrip}>
              <FeatureBadge icon="✓" text="Verified quality" />
              <FeatureBadge icon="↺" text="Easy returns" />
              <FeatureBadge icon="⚡" text={currentProduct.shippingNote || "Fast delivery"} />
              <FeatureBadge icon="🔒" text="Secure checkout" />
            </div>
            <section className={cls.contentShell} aria-labelledby={tabsId}>
              <div className={cls.tabsHeader}>
                <div>
                  <span className={cls.sectionEyebrow}>Product content</span>
                  <h3 id={tabsId} className={cls.sectionTitle}>
                    Information built for confidence
                  </h3>
                </div>

                <div className={cls.tabList} role="tablist" aria-label="Product information tabs">
                  {[
                    { key: "overview", label: "Overview" },
                    { key: "specs", label: "Specs" },
                    { key: "shipping", label: "Shipping" },
                    { key: "reviews", label: "Reviews" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.key}
                      className={`${cls.tabButton} ${activeTab === tab.key ? cls.tabButtonActive : ""}`}
                      onClick={() => setActiveTab(tab.key as TabKey)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={cls.tabPanel}>
                {activeTab === "overview" ? (
                  <div className={cls.panelGrid}>
                    <div className={cls.contentCard}>
                      <span className={cls.cardEyebrow}>Overview</span>
                      <h4 className={cls.cardTitle}>Why customers choose this product</h4>
                      <div className={cls.richText}>
                        <p>
                          {currentProduct.shortDescription ||
                            "This product detail experience is designed to communicate premium quality, simplify decision-making, and improve customer confidence at every step."}
                        </p>
                        <p>
                          {currentProduct.description ||
                            "The layout prioritizes strong visual hierarchy, clean pricing communication, practical trust signals, and merchant credibility. It works well for modern ecommerce storefronts that need better UX without sacrificing maintainability."}
                        </p>
                      </div>
                    </div>

                    <div className={cls.contentCard}>
                      <span className={cls.cardEyebrow}>Highlights</span>
                      <h4 className={cls.cardTitle}>What stands out</h4>
                      <ul className={cls.bulletList}>
                        <li>Premium-first product presentation</li>
                        <li>Clear pricing and savings visibility</li>
                        <li>Trust-focused purchase panel</li>
                        <li>Improved scanability on desktop and mobile</li>
                        <li>Structured for scalable template usage</li>
                      </ul>
                    </div>
                  </div>
                ) : null}

                {activeTab === "specs" ? (
                  <div className={cls.panelGrid}>
                    <div className={cls.contentCard}>
                      <span className={cls.cardEyebrow}>Specifications</span>
                      <h4 className={cls.cardTitle}>Product details</h4>
                      <div className={cls.specGrid}>
                        <div className={cls.specItem}>
                          <span className={cls.specLabel}>Category</span>
                          <strong className={cls.specValue}>{currentProduct.category || "Fashion"}</strong>
                        </div>
                        <div className={cls.specItem}>
                          <span className={cls.specLabel}>Brand</span>
                          <strong className={cls.specValue}>{currentProduct.brand || "Official seller"}</strong>
                        </div>
                        <div className={cls.specItem}>
                          <span className={cls.specLabel}>SKU</span>
                          <strong className={cls.specValue}>
                            {currentProduct.sku || currentProduct.tag || "Updating"}
                          </strong>
                        </div>
                        <div className={cls.specItem}>
                          <span className={cls.specLabel}>Availability</span>
                          <strong className={cls.specValue}>{currentProduct.stockText || "In stock"}</strong>
                        </div>
                      </div>
                    </div>

                    <div className={cls.contentCard}>
                      <span className={cls.cardEyebrow}>Commerce notes</span>
                      <h4 className={cls.cardTitle}>Operational info</h4>
                      <ul className={cls.bulletList}>
                        <li>Optimized for product pages in Next.js 16</li>
                        <li>Schema.org product JSON-LD included</li>
                        <li>Accessible interactions and semantic structure</li>
                        <li>Supports dynamic product and review fetching</li>
                      </ul>
                    </div>
                  </div>
                ) : null}

                {activeTab === "shipping" ? (
                  <div className={cls.panelGrid}>
                    <div className={cls.contentCard}>
                      <span className={cls.cardEyebrow}>Delivery</span>
                      <h4 className={cls.cardTitle}>Shipping & fulfillment</h4>
                      <ul className={cls.bulletList}>
                        <li>{currentProduct.shippingNote || "Delivery in 2–4 business days"}</li>
                        <li>Order packed with protective handling</li>
                        <li>Support available for status updates</li>
                        <li>Easy return or exchange guidance</li>
                      </ul>
                    </div>

                    <div className={cls.contentCard}>
                      <span className={cls.cardEyebrow}>Policy</span>
                      <h4 className={cls.cardTitle}>Customer assurance</h4>
                      <ul className={cls.bulletList}>
                        <li>Secure checkout process</li>
                        <li>Official seller trust indicators</li>
                        <li>Responsive support after purchase</li>
                        <li>Clear product and pricing presentation</li>
                      </ul>
                    </div>
                  </div>
                ) : null}

                {activeTab === "reviews" ? (
                  <div className={cls.reviewGrid}>
                    <aside className={cls.reviewSummaryCard} aria-label="Rating summary">
                      <div className={cls.reviewSummaryTop}>
                        <strong className={cls.reviewScore}>{averageRating.toFixed(1)}</strong>
                        <ReviewStars rating={averageRating} />
                        <p className={cls.reviewMetaText}>
                          Based on {formatCompactCount(visibleReviewCount)} reviews •{" "}
                          {currentProduct.soldText || "10k+ sold"}
                        </p>
                      </div>

                      <div className={cls.reviewBars}>
                        {ratingBreakdown.map((item) => (
                          <div key={item.star} className={cls.reviewBarRow}>
                            <span className={cls.reviewBarLabel}>{item.star} stars</span>
                            <div className={cls.reviewBarTrack} aria-hidden="true">
                              <div className={cls.reviewBarFill} style={{ width: `${item.percent}%` }} />
                            </div>
                            <span className={cls.reviewBarPercent}>{item.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </aside>

                    <div className={cls.reviewListCard}>
                      {reviewsLoading ? (
                        <div className={cls.stateCard}>Loading reviews...</div>
                      ) : reviews.length === 0 ? (
                        <div className={cls.stateCard}>No reviews yet.</div>
                      ) : (
                        <div className={cls.reviewList}>
                          {reviews.slice(0, 4).map((review, index) => (
                            <article
                              key={String(review.id ?? index)}
                              className={cls.reviewItem}
                              aria-label={`Review by ${review.author || "Customer"}`}
                            >
                              <div className={cls.reviewAvatar}>
                                {review.avatar ? (
                                  <Image
                                    src={review.avatar}
                                    alt={review.author || "Customer"}
                                    fill
                                    className={cls.reviewAvatarImage}
                                    sizes="56px"
                                  />
                                ) : (
                                  <span className={cls.reviewAvatarFallback}>{getInitials(review.author)}</span>
                                )}
                              </div>

                              <div className={cls.reviewBody}>
                                <div className={cls.reviewTop}>
                                  <div>
                                    <strong className={cls.reviewAuthor}>{review.author || "Customer"}</strong>
                                    <div className={cls.reviewMeta}>
                                      <span>{renderStarsLabel(review.rating ?? 5)}</span>
                                      <span>{formatDate(review.createdAt)}</span>
                                      {review.verified ? (
                                        <span className={cls.verifiedBadge}>Verified purchase</span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>

                                {review.title ? <h4 className={cls.reviewTitle}>{review.title}</h4> : null}
                                <p className={cls.reviewText}>
                                  {review.content ||
                                    "Exactly as described, with a reliable and smooth buying experience."}
                                </p>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </article>

          <article className={cls.purchaseCard} aria-label="Purchase panel">
            <div className={cls.purchaseHeader}>
              <div className={cls.categoryRow}>
                <span className={cls.categoryChip}>{currentProduct.category || "Fashion"}</span>
                {currentProduct.stockText ? <span className={cls.stockChip}>{currentProduct.stockText}</span> : null}
              </div>

              <h1 className={cls.productName}>{currentProduct.name}</h1>
              <p className={cls.shortDescription}>
                {currentProduct.shortDescription ||
                  "Refined, modern, and easy to style. Designed for daily wear with an elevated silhouette and clean finish."}
              </p>

              <div className={cls.pricePanel}>
                <div className={cls.priceLine}>
                  <strong className={cls.currentPrice}>{formatPrice(currentProduct.price)}</strong>
                  {((typeof currentProduct.originalPrice === "number" &&
                    currentProduct.originalPrice > (currentProduct.price || 0)) ||
                    (typeof currentProduct.marketPrice === "number" &&
                      currentProduct.marketPrice > (currentProduct.price || 0))) && (
                    <span className={cls.originalPrice}>
                      {formatPrice(currentProduct.marketPrice ?? currentProduct.originalPrice)}
                    </span>
                  )}
                </div>

                <div className={cls.priceMeta}>
                  {(savings || currentProduct.savingPrice) && (
                    <span className={cls.savingsPill}>Save {formatPrice(currentProduct.savingPrice ?? savings)}</span>
                  )}
                  <span className={cls.shippingPill}>
                    {currentProduct.shippingNote || "Delivery in 2–4 business days"}
                  </span>
                </div>
              </div>
            </div>

            <div className={cls.summaryGrid}>
              <div className={cls.summaryItem}>
                <span className={cls.summaryLabel}>Brand</span>
                <strong className={cls.summaryValue}>{currentProduct.brand || "Official seller"}</strong>
              </div>
              <div className={cls.summaryItem}>
                <span className={cls.summaryLabel}>SKU</span>
                <strong className={cls.summaryValue}>{currentProduct.sku || currentProduct.tag || "Updating"}</strong>
              </div>
              <div className={cls.summaryItem}>
                <span className={cls.summaryLabel}>Availability</span>
                <strong className={cls.summaryValue}>{currentProduct.stockText || "In stock"}</strong>
              </div>
              <div className={cls.summaryItem}>
                <span className={cls.summaryLabel}>Fulfillment</span>
                <strong className={cls.summaryValue}>Official logistics</strong>
              </div>
            </div>

            <div className={cls.offerPanel}>
              <strong className={cls.panelTitle}>Included benefits</strong>
              <div className={cls.offerList}>
                <span className={cls.offerChip}>Store voucher</span>
                <span className={cls.offerChip}>Priority support</span>
                <span className={cls.offerChip}>Fast dispatch</span>
                <span className={cls.offerChip}>Protected packaging</span>
              </div>
            </div>

            <div className={cls.checkoutRow}>
              <div className={cls.quantityBox}>
                <span className={cls.controlLabel}>Quantity</span>
                <div className={cls.quantityControl} role="group" aria-label="Quantity selector">
                  <button
                    type="button"
                    className={cls.quantityButton}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className={cls.quantityValue} aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className={cls.quantityButton}
                    onClick={() => setQuantity((prev) => prev + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={cls.subtotalBox}>
                <span className={cls.controlLabel}>Subtotal</span>
                <strong className={cls.subtotalValue}>
                  {typeof subtotal === "number" ? formatPrice(subtotal) : "Contact us"}
                </strong>
              </div>
            </div>

            <div className={cls.ctaStack}>
              <button
                type="button"
                className={cls.secondaryButton}
                onClick={handleAddToOrder}
                disabled={ordering}
                aria-label={`Add ${currentProduct.name} to cart`}
              >
                <span aria-hidden="true">{ordering ? "…" : "🛒"}</span>
                <span>{ordering ? "Adding..." : secondaryCtaText}</span>
              </button>

              {renderLink(
                detailHref,
                cls.primaryButton,
                <>
                  <span>{primaryCtaText}</span>
                  {typeof currentProduct.price === "number" ? (
                    <strong>{formatPrice(currentProduct.price)}</strong>
                  ) : null}
                </>,
                `Go to purchase page for ${currentProduct.name}`,
              )}
            </div>

            {orderMessage ? (
              <p className={cls.feedbackMessage} role="status" aria-live="polite">
                {orderMessage}
              </p>
            ) : null}

            <div className={cls.promiseList}>
              <div className={cls.promiseItem}>
                <span className={cls.promiseIcon} aria-hidden="true">
                  🔐
                </span>
                <div>
                  <strong>Secure payment</strong>
                  <p>Protected checkout with trusted payment flow.</p>
                </div>
              </div>

              <div className={cls.promiseItem}>
                <span className={cls.promiseIcon} aria-hidden="true">
                  📦
                </span>
                <div>
                  <strong>Fast fulfillment</strong>
                  <p>Prepared quickly with careful quality inspection.</p>
                </div>
              </div>

              <div className={cls.promiseItem}>
                <span className={cls.promiseIcon} aria-hidden="true">
                  💬
                </span>
                <div>
                  <strong>Responsive support</strong>
                  <p>Helpful assistance before and after purchase.</p>
                </div>
              </div>
            </div>

            <div className={cls.merchantCard}>
              <div className={cls.merchantTop}>
                <div className={cls.merchantIdentity}>
                  <div className={cls.merchantAvatar}>{(currentProduct.brand || "S").slice(0, 1).toUpperCase()}</div>
                  <div>
                    <strong className={cls.merchantName}>{currentProduct.brand || "Official seller"}</strong>
                    <p className={cls.merchantMeta}>Typically replies within minutes</p>
                  </div>
                </div>

                <div className={cls.merchantActions}>
                  <button type="button" className={cls.ghostButton}>
                    Chat
                  </button>
                  <button type="button" className={cls.ghostButton}>
                    Store
                  </button>
                </div>
              </div>

              <div className={cls.merchantStats}>
                <MetricCard label="Reviews" value={formatCompactCount(visibleReviewCount)} />
                <MetricCard label="Response" value="93%" />
                <MetricCard label="Member" value="6 years" />
                <MetricCard
                  label="Products"
                  value={currentProduct.stockCount ? formatCompactCount(currentProduct.stockCount) : "864"}
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* =========================
 * RegItem
 * ========================= */
export const SHOP_DETAIL_REGION: RegItem = {
  kind: "DetailRegion",
  label: "Detail Region",
  defaults: {
    title: DEFAULT_TITLE,
    eyebrow: DEFAULT_EYEBROW,
    noteText: "",
    primaryCtaText: DEFAULT_PRIMARY_CTA,
    secondaryCtaText: DEFAULT_SECONDARY_CTA,
    apiBasePath: DEFAULT_API_BASE_PATH,
    orderApiPath: DEFAULT_ORDER_API_PATH,
    reviewApiPath: DEFAULT_REVIEW_API_PATH,
    preview: false,
    product: JSON.stringify({}, null, 2),
    fallbackBreadcrumbText: DEFAULT_FALLBACK_BREADCRUMB,
    sectionAriaLabel: DEFAULT_SECTION_ARIA_LABEL,
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "noteText", label: "Note text", kind: "textarea", rows: 4 },
    { key: "primaryCtaText", label: "Primary CTA text", kind: "text" },
    { key: "secondaryCtaText", label: "Secondary CTA text", kind: "text" },
    { key: "apiBasePath", label: "API base path", kind: "text" },
    { key: "orderApiPath", label: "Order API path", kind: "text" },
    { key: "reviewApiPath", label: "Review API path", kind: "text" },
    { key: "product", label: "Product override (JSON)", kind: "textarea", rows: 12 },
    { key: "fallbackBreadcrumbText", label: "Breadcrumb text", kind: "text" },
    { key: "sectionAriaLabel", label: "Section aria label", kind: "text" },
  ],
  render: (p) => {
    const parsedProduct = safeJson<DetailRegionProduct>(p.product);
    const productOverride = parsedProduct ? normalizeProduct(parsedProduct) || undefined : undefined;

    return (
      <div className="sectionContainer" aria-label="Shop Detail Region">
        <DetailRegion
          title={String(p.title || DEFAULT_TITLE)}
          eyebrow={String(p.eyebrow || DEFAULT_EYEBROW)}
          noteText={String(p.noteText || "")}
          primaryCtaText={String(p.primaryCtaText || DEFAULT_PRIMARY_CTA)}
          secondaryCtaText={String(p.secondaryCtaText || DEFAULT_SECONDARY_CTA)}
          apiBasePath={String(p.apiBasePath || DEFAULT_API_BASE_PATH)}
          orderApiPath={String(p.orderApiPath || DEFAULT_ORDER_API_PATH)}
          reviewApiPath={String(p.reviewApiPath || DEFAULT_REVIEW_API_PATH)}
          preview={Boolean(p.preview)}
          product={productOverride}
          fallbackBreadcrumbText={String(p.fallbackBreadcrumbText || DEFAULT_FALLBACK_BREADCRUMB)}
          sectionAriaLabel={String(p.sectionAriaLabel || DEFAULT_SECTION_ARIA_LABEL)}
        />
      </div>
    );
  },
};

export default DetailRegion;

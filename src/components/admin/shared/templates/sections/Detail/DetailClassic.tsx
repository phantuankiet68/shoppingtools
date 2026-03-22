"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Detail/DetailClassic.module.css";
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

export type DetailClassicProduct = {
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
  features?: string[];
};

export type DetailClassicProps = {
  title?: string;
  eyebrow?: string;
  noteText?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  apiBasePath?: string;
  orderApiPath?: string;
  reviewApiPath?: string;
  preview?: boolean;
  product?: DetailClassicProduct | null;
  fallbackBreadcrumbText?: string;
  sectionAriaLabel?: string;
};

/* =========================
 * Constants
 * ========================= */
const DEFAULT_TITLE = "Product details";
const DEFAULT_EYEBROW = "Premium selection";
const DEFAULT_PRIMARY_CTA = "Buy now";
const DEFAULT_SECONDARY_CTA = "Add to cart";
const DEFAULT_API_BASE_PATH = "/api/v1/products/product-detail";
const DEFAULT_ORDER_API_PATH = "/api/v1/order";
const DEFAULT_REVIEW_API_PATH = "/api/v1/reviews";
const DEFAULT_FALLBACK_BREADCRUMB = "Products";
const DEFAULT_SECTION_ARIA_LABEL = "Product details";
const PLACEHOLDER_IMAGE = "/images/placeholder-product.png";
const DEFAULT_PRODUCT_NAME = "Product";

/* =========================
 * Generic helpers
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

function clampRating(value?: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(5, Number(value.toFixed(1))));
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
  return toStringSafe(item.shippingNote) || "Delivery in 2-4 business days";
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

  return toStringSafe(item.category) || toStringSafe(categoryObject?.name) || toStringSafe(item.collection) || undefined;
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
      "Well packaged, reliable quality, and the shopping experience felt smooth from checkout to delivery.",
    createdAt: toStringSafe(item.createdAt) || toStringSafe(item.date) || undefined,
    verified: Boolean(item.verified ?? item.isVerified ?? true),
  };
}

function getReviewsFromRecord(item: UnknownRecord): ProductReviewItem[] {
  if (!Array.isArray(item.reviews)) return [];
  return item.reviews.map(normalizeReview).filter(Boolean) as ProductReviewItem[];
}

function getFeaturesFromRecord(item: UnknownRecord): string[] {
  if (Array.isArray(item.features)) {
    return item.features.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  if (Array.isArray(item.highlights)) {
    return item.highlights.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  return [
    "Premium presentation with conversion-focused layout",
    "Clear pricing, trust cues, and seller confidence blocks",
    "Responsive structure optimized for modern Next.js storefronts",
  ];
}

function normalizeProduct(raw: unknown): DetailClassicProduct | null {
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
    features: getFeaturesFromRecord(item),
  };
}

function extractProductFromResponse(data: unknown): DetailClassicProduct | null {
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
 * SEO + derived values
 * ========================= */
function getSavings(product?: DetailClassicProduct | null): number | undefined {
  if (!product) return undefined;
  if (typeof product.price !== "number" || typeof product.originalPrice !== "number") return undefined;
  if (product.originalPrice <= product.price) return undefined;
  return product.originalPrice - product.price;
}

function getImageAlt(
  product?: DetailClassicProduct | null,
  kind: "hero" | "thumbnail" = "hero",
  index?: number,
): string {
  const productName = product?.name?.trim() || DEFAULT_PRODUCT_NAME;

  if (kind === "thumbnail" && typeof index === "number") {
    return `${productName} gallery image ${index + 1}`;
  }

  return `${productName} product image`;
}

function buildProductJsonLd(product: DetailClassicProduct) {
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

function buildAddToOrderPayload(product: DetailClassicProduct, qty: number) {
  const unitPrice = typeof product.price === "number" ? product.price : 0;
  const subtotal = unitPrice * qty;

  return {
    qty,
    source: "detail-classic",
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

async function fetchProductByCandidates(candidates: string[], signal: AbortSignal): Promise<DetailClassicProduct | null> {
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
        console.warn("DetailClassic fetch product failed:", res.status, url);
        continue;
      }

      const data = (await res.json()) as unknown;
      const normalized = extractProductFromResponse(data);
      if (normalized) return normalized;
    } catch (error) {
      if (signal.aborted) return null;
      console.warn("DetailClassic fetch candidate error:", url, error);
    }
  }

  return null;
}

/* =========================
 * UI helpers
 * ========================= */
function InfoStat({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className={cls.infoStat}>
      {icon ? (
        <span className={cls.infoStatIcon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div>
        <span className={cls.infoStatLabel}>{label}</span>
        <strong className={cls.infoStatValue}>{value}</strong>
      </div>
    </div>
  );
}

function TrustRow({ title, text, icon }: { title: string; text: string; icon: string }) {
  return (
    <div className={cls.trustRow}>
      <span className={cls.trustRowIcon} aria-hidden="true">
        {icon}
      </span>
      <div>
        <strong className={cls.trustRowTitle}>{title}</strong>
        <p className={cls.trustRowText}>{text}</p>
      </div>
    </div>
  );
}

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

/* =========================
 * Component
 * ========================= */
export function DetailClassic({
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
}: DetailClassicProps) {
  const pathname = usePathname();
  const regionId = useId();

  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [remoteProduct, setRemoteProduct] = useState<DetailClassicProduct | null>(null);
  const [remoteReviews, setRemoteReviews] = useState<ProductReviewItem[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const headingId = `${regionId}-detail-classic-heading`;
  const reviewHeadingId = `${regionId}-detail-classic-review-heading`;
  const detailsHeadingId = `${regionId}-detail-classic-details-heading`;

  const slugSegments = useMemo(() => deriveSlugSegmentsFromPathname(pathname), [pathname]);
  const requestCandidates = useMemo(
    () => buildProductRequestCandidates(apiBasePath, slugSegments),
    [apiBasePath, slugSegments],
  );

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
    remoteReviews.length > 0 ? remoteReviews.length : currentProduct?.reviewCount ?? reviews.length;
  const savings = getSavings(currentProduct);
  const ratingBreakdown = getRatingBreakdown(averageRating);
  const subtotal = typeof currentProduct?.price === "number" ? currentProduct.price * quantity : undefined;
  const featureList = currentProduct?.features?.length ? currentProduct.features : [];

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
        console.error("DetailClassic fetch error:", error);
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
        console.error("DetailClassic reviews fetch error:", error);
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
          toStringSafe(raw?.message) || toStringSafe(raw?.error) || "Unable to add this product to the order.",
        );
      }

      setOrderMessage(toStringSafe(raw?.message) || "Product added to the order successfully.");
    } catch (error) {
      console.error("Add to order error:", error);
      setOrderMessage(error instanceof Error ? error.message : "Something went wrong while adding to the order.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading && !currentProduct) {
    return (
      <section className={cls.section} aria-label={sectionAriaLabel} aria-labelledby={headingId}>
        <div className={cls.container}>
          <div className={cls.loadingState}>Loading product details...</div>
        </div>
      </section>
    );
  }

  if (!currentProduct) {
    return (
      <section className={cls.section} aria-label={sectionAriaLabel} aria-labelledby={headingId}>
        <div className={cls.container}>
          <div className={cls.emptyState}>No product data available.</div>
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
        <header className={cls.header}>
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
        </header>

        <div className={cls.heroLayout}>
          <article className={cls.mediaPanel} aria-label="Product gallery">
            <div className={cls.mediaFrame}>
              <div className={cls.mediaBadgeRow}>
                {currentProduct.badge ? <span className={cls.primaryBadge}>{currentProduct.badge}</span> : null}
                {currentProduct.discountPercent ? (
                  <span className={cls.secondaryBadge}>Save {currentProduct.discountPercent}%</span>
                ) : null}
              </div>

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
              <div className={cls.thumbnailRail} role="list" aria-label="Product thumbnails">
                {gallery.slice(0, 6).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`${cls.thumbnailButton} ${selectedImage === index ? cls.thumbnailButtonActive : ""}`}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Select product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                  >
                    <span className={cls.thumbnailFrame}>
                      <Image
                        src={image}
                        alt={getImageAlt(currentProduct, "thumbnail", index)}
                        fill
                        className={cls.thumbnailImage}
                        sizes="100px"
                      />
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className={cls.mediaFooter}>
              <TrustRow title="Quality checked" text="Reviewed before shipping to keep expectations clear." icon="✓" />
              <TrustRow
                title="Fast fulfillment"
                text={currentProduct.shippingNote || "Delivery in 2-4 business days"}
                icon="⚡"
              />
              <TrustRow title="Flexible support" text="Returns and exchanges supported when eligible." icon="↺" />
            </div>
          </article>

          <article className={cls.summaryPanel} aria-label="Purchase panel">
            <div className={cls.summaryTop}>
              <div className={cls.metaRow}>
                <span className={cls.categoryChip}>{currentProduct.category || "Electronics"}</span>
                {currentProduct.stockText ? <span className={cls.stockChip}>{currentProduct.stockText}</span> : null}
              </div>

              <h1 className={cls.productName}>{currentProduct.name}</h1>

              <div className={cls.ratingRow}>
                <ReviewStars rating={averageRating} />
                <span className={cls.ratingValue}>{averageRating.toFixed(1)}</span>
                <span className={cls.ratingDivider}>•</span>
                <span className={cls.ratingMeta}>{formatCompactCount(visibleReviewCount)} verified reviews</span>
              </div>

              <p className={cls.shortDescription}>
                {currentProduct.shortDescription ||
                  "A professional product layout focused on premium storytelling, cleaner purchase intent, and stronger merchant credibility."}
              </p>
            </div>

            <div className={cls.priceCard}>
              <div className={cls.priceMain}>
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

              <div className={cls.priceSupport}>
                {(savings || currentProduct.savingPrice) && (
                  <span className={cls.savingsPill}>You save {formatPrice(currentProduct.savingPrice ?? savings)}</span>
                )}
                <span className={cls.shippingPill}>{currentProduct.shippingNote || "Delivery in 2-4 business days"}</span>
              </div>
            </div>

            <div className={cls.quickFacts}>
              <div className={cls.quickFactItem}>
                <span className={cls.quickFactLabel}>Brand</span>
                <strong className={cls.quickFactValue}>{currentProduct.brand || "Official seller"}</strong>
              </div>
              <div className={cls.quickFactItem}>
                <span className={cls.quickFactLabel}>SKU</span>
                <strong className={cls.quickFactValue}>{currentProduct.sku || currentProduct.tag || "Updating"}</strong>
              </div>
              <div className={cls.quickFactItem}>
                <span className={cls.quickFactLabel}>Availability</span>
                <strong className={cls.quickFactValue}>{currentProduct.stockText || "In stock"}</strong>
              </div>
              <div className={cls.quickFactItem}>
                <span className={cls.quickFactLabel}>Merchant</span>
                <strong className={cls.quickFactValue}>Trusted fulfillment</strong>
              </div>
            </div>

            <div className={cls.checkoutCard}>
              <div className={cls.quantitySection}>
                <span className={cls.checkoutLabel}>Quantity</span>
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

              <div className={cls.subtotalSection}>
                <span className={cls.checkoutLabel}>Subtotal</span>
                <strong className={cls.subtotalValue}>{typeof subtotal === "number" ? formatPrice(subtotal) : "Contact us"}</strong>
              </div>
            </div>

            <div className={cls.actionRow}>
              <button
                type="button"
                className={cls.secondaryButton}
                onClick={handleAddToOrder}
                disabled={ordering}
                aria-label={`Add ${currentProduct.name} to order`}
              >
                <span aria-hidden="true">{ordering ? "…" : "🛒"}</span>
                <span>{ordering ? "Adding..." : secondaryCtaText}</span>
              </button>

              {renderLink(
                detailHref,
                cls.primaryButton,
                <>
                  <span>{primaryCtaText}</span>
                  {typeof currentProduct.price === "number" ? <strong>{formatPrice(currentProduct.price)}</strong> : null}
                </>,
                `Go to purchase page for ${currentProduct.name}`,
              )}
            </div>

            {orderMessage ? (
              <p className={cls.feedbackMessage} role="status" aria-live="polite">
                {orderMessage}
              </p>
            ) : null}

            <div className={cls.sellerCard}>
              <div className={cls.sellerHeader}>
                <div className={cls.sellerIdentity}>
                  <div className={cls.sellerAvatar}>{(currentProduct.brand || "S").slice(0, 1).toUpperCase()}</div>
                  <div>
                    <strong className={cls.sellerName}>{currentProduct.brand || "Official seller"}</strong>
                    <p className={cls.sellerSubtext}>Fast response • High fulfillment confidence</p>
                  </div>
                </div>
                <div className={cls.sellerActions}>
                  <button type="button" className={cls.ghostButton}>
                    Chat
                  </button>
                  <button type="button" className={cls.ghostButton}>
                    Visit store
                  </button>
                </div>
              </div>

              <div className={cls.sellerStats}>
                <InfoStat label="Reviews" value={formatCompactCount(visibleReviewCount)} />
                <InfoStat label="Response" value="93%" />
                <InfoStat label="Member" value="6 years" />
                <InfoStat label="Products" value={currentProduct.stockCount ? formatCompactCount(currentProduct.stockCount) : "864"} />
              </div>
            </div>
          </article>
        </div>

        <div className={cls.contentGrid}>
          <section className={cls.contentCard} aria-labelledby={detailsHeadingId}>
            <div className={cls.sectionHead}>
              <span className={cls.sectionKicker}>Specifications</span>
              <h3 id={detailsHeadingId} className={cls.sectionTitle}>
                Product information
              </h3>
            </div>

             <div className={cls.reviewLayout}>
            <aside className={cls.reviewSummaryCard} aria-label="Rating summary">
              <div className={cls.reviewSummaryTop}>
                <strong className={cls.reviewSummaryScore}>{averageRating.toFixed(1)}</strong>
                <ReviewStars rating={averageRating} />
              </div>
               <p className={cls.reviewSummaryMeta}>
                  Based on {formatCompactCount(visibleReviewCount)} reviews • {currentProduct.soldText || "10k+ sold"}
                </p>

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
                <div className={cls.emptyState}>Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className={cls.emptyState}>No reviews yet.</div>
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

                      <div className={cls.reviewContentWrap}>
                        <div className={cls.reviewTopRow}>
                          <div>
                            <strong className={cls.reviewAuthor}>{review.author || "Customer"}</strong>
                            <div className={cls.reviewMeta}>
                              <span>{renderStarsLabel(review.rating ?? 5)}</span>
                              <span>{formatDate(review.createdAt)}</span>
                              {review.verified ? <span className={cls.verifiedBadge}>Verified purchase</span> : null}
                            </div>
                          </div>
                        </div>

                        {review.title ? <h4 className={cls.reviewTitle}>{review.title}</h4> : null}
                        <p className={cls.reviewText}>
                          {review.content || "Exactly as described, with a confident buying experience from start to finish."}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

            {featureList.length > 0 ? (
              <div className={cls.featurePanel}>
                <strong className={cls.featurePanelTitle}>Highlights</strong>
                <ul className={cls.featureList}>
                  {featureList.map((feature, index) => (
                    <li key={`${feature}-${index}`} className={cls.featureListItem}>
                      <span className={cls.featureBullet} aria-hidden="true">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className={cls.contentCard} aria-label="Product description">
            <div className={cls.sectionHead}>
              <span className={cls.sectionKicker}>Overview</span>
              <h3 className={cls.sectionTitle}>Why customers choose it</h3>
            </div>

            <div className={cls.descriptionBlock}>
              <p>
                {currentProduct.shortDescription ||
                  "This premium product detail experience uses a clearer hierarchy, more confident spacing, and a stronger purchasing flow to feel more modern and trustworthy."}
              </p>
              <p>
                {currentProduct.description ||
                  "The layout emphasizes hero imagery, persuasive pricing, trust messaging, and seller transparency above the fold, while supporting details remain neatly structured below for faster scanning across desktop and mobile."}
              </p>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

/* =========================
 * RegItem
 * ========================= */
export const SHOP_DETAIL_CLASSIC: RegItem = {
  kind: "DetailClassic",
  label: "Detail Classic",
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
    const parsedProduct = safeJson<DetailClassicProduct>(p.product);
    const productOverride = parsedProduct ? normalizeProduct(parsedProduct) || undefined : undefined;

    return (
      <div className="sectionContainer" aria-label="Shop Detail Classic">
        <DetailClassic
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

export default DetailClassic;

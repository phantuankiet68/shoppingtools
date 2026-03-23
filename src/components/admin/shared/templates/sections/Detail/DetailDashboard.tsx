"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Detail/DetailDashboard.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* =========================
 * Types
 * ========================= */
type UnknownRecord = Record<string, unknown>;
type ProductIdentifier = string | number;
type DetailTabKey = "description" | "reviews" | "support";

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

export type RelatedProductItem = {
  id?: ProductIdentifier;
  name: string;
  imageSrc: string;
  href?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  soldText?: string;
  badge?: string;
};

export type DetailDashboardProduct = {
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
  colors?: string[];
  sizes?: string[];
  relatedProducts?: RelatedProductItem[];
};

export type DetailDashboardProps = {
  title?: string;
  eyebrow?: string;
  noteText?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  apiBasePath?: string;
  orderApiPath?: string;
  reviewApiPath?: string;
  preview?: boolean;
  product?: DetailDashboardProduct | null;
  fallbackBreadcrumbText?: string;
  sectionAriaLabel?: string;
};

/* =========================
 * Constants
 * ========================= */
const DEFAULT_TITLE = "Product Details";
const DEFAULT_EYEBROW = "Men fashion";
const DEFAULT_PRIMARY_CTA = "Buy now";
const DEFAULT_SECONDARY_CTA = "Add to cart";
const DEFAULT_API_BASE_PATH = "/api/v1/products/product-detail";
const DEFAULT_ORDER_API_PATH = "/api/v1/order";
const DEFAULT_REVIEW_API_PATH = "/api/v1/reviews";
const DEFAULT_FALLBACK_BREADCRUMB = "Products";
const DEFAULT_SECTION_ARIA_LABEL = "Product detail section";
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

function getDiscountPercent(price?: number, originalPrice?: number): number {
  if (
    typeof price !== "number" ||
    typeof originalPrice !== "number" ||
    !Number.isFinite(price) ||
    !Number.isFinite(originalPrice) ||
    originalPrice <= price ||
    originalPrice <= 0
  ) {
    return 0;
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
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

  return getDiscountPercent(price, originalPrice);
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
  return toStringSafe(item.shippingNote) || "Free shipping worldwide";
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
      "Excellent quality and the product looks just like the photos.",
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

  return ["Slim fit body", "Long sleeve casual style", "Soft cotton blend", "Button closure"];
}

function getColorOptionsFromRecord(item: UnknownRecord): string[] {
  if (Array.isArray(item.colors)) {
    return item.colors.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  if (Array.isArray(item.colorOptions)) {
    return item.colorOptions.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  return ["#6b7280", "#e5e7eb", "#c4b5fd"];
}

function getSizeOptionsFromRecord(item: UnknownRecord): string[] {
  if (Array.isArray(item.sizes)) {
    return item.sizes.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  if (Array.isArray(item.sizeOptions)) {
    return item.sizeOptions.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  return ["S", "M", "L"];
}

function normalizeRelatedProduct(raw: unknown, index: number): RelatedProductItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as UnknownRecord;
  const name =
    toStringSafe(item.name) ||
    toStringSafe(item.title) ||
    toStringSafe(item.productName) ||
    `Similar product ${index + 1}`;

  return {
    id: isProductIdentifier(item.id) ? item.id : isProductIdentifier(item._id) ? item._id : index,
    name,
    imageSrc: getImageFromRecord(item),
    href: buildHref(item) || "#",
    price: toNumber(item.salePrice ?? item.price ?? item.finalPrice, NaN),
    originalPrice: toNumber(
      item.originalPrice ?? item.compareAtPrice ?? item.oldPrice ?? item.listPrice ?? item.marketPrice,
      NaN,
    ),
    rating: computeRating(item) ?? 4.5,
    soldText: toStringSafe(item.soldText) || "100 sold",
    badge: toStringSafe(item.badge) || "",
  };
}

function getRelatedProductsFromRecord(item: UnknownRecord): RelatedProductItem[] {
  if (Array.isArray(item.relatedProducts)) {
    return item.relatedProducts.map(normalizeRelatedProduct).filter(Boolean) as RelatedProductItem[];
  }

  if (Array.isArray(item.similarProducts)) {
    return item.similarProducts.map(normalizeRelatedProduct).filter(Boolean) as RelatedProductItem[];
  }

  return [];
}

function normalizeProduct(raw: unknown): DetailDashboardProduct | null {
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
    badge: toStringSafe(item.badge) || (Boolean(item.isNew) ? "New" : "Hot"),
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
      (Number.isFinite(soldCount) && soldCount > 0 ? `${formatCompactCount(soldCount)} sold` : "300 sold"),
    soldCount: Number.isFinite(soldCount) ? soldCount : undefined,
    isNew: Boolean(item.isNew),
    reviews: normalizedReviews,
    features: getFeaturesFromRecord(item),
    colors: getColorOptionsFromRecord(item),
    sizes: getSizeOptionsFromRecord(item),
    relatedProducts: getRelatedProductsFromRecord(item),
  };
}

function extractProductFromResponse(data: unknown): DetailDashboardProduct | null {
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
 * Derived values
 * ========================= */
function getSavings(product?: DetailDashboardProduct | null): number | undefined {
  if (!product) return undefined;
  if (typeof product.price !== "number" || typeof product.originalPrice !== "number") return undefined;
  if (product.originalPrice <= product.price) return undefined;
  return product.originalPrice - product.price;
}

function getImageAlt(
  product?: DetailDashboardProduct | null,
  kind: "hero" | "thumbnail" = "hero",
  index?: number,
): string {
  const productName = product?.name?.trim() || DEFAULT_PRODUCT_NAME;

  if (kind === "thumbnail" && typeof index === "number") {
    return `${productName} gallery image ${index + 1}`;
  }

  return `${productName} product image`;
}

function buildProductJsonLd(product: DetailDashboardProduct) {
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
  const five = Math.max(46, Math.round(score * 18));
  const four = Math.max(10, 100 - five - 12);
  const three = 6;
  const two = 4;
  const one = 2;
  const total = five + four + three + two + one;

  return [5, 4, 3, 2, 1].map((star, index) => {
    const values = [five, four, three, two, one];
    return { star, percent: Math.round((values[index] / total) * 100) };
  });
}

function buildAddToOrderPayload(product: DetailDashboardProduct, qty: number, color?: string, size?: string) {
  const unitPrice = typeof product.price === "number" ? product.price : 0;
  const subtotal = unitPrice * qty;

  return {
    qty,
    source: "detail-dashboard",
    productId: isProductIdentifier(product.id) ? String(product.id) : null,
    variantId: product.tag || null,
    selectedColor: color || null,
    selectedSize: size || null,
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
): Promise<DetailDashboardProduct | null> {
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal,
      });

      if (res.status === 404) continue;
      if (!res.ok) continue;

      const data = (await res.json()) as unknown;
      const normalized = extractProductFromResponse(data);
      if (normalized) return normalized;
    } catch (error) {
      if (signal.aborted) return null;
      console.warn("DetailDashboard fetch candidate error:", url, error);
    }
  }

  return null;
}

/* =========================
 * UI helpers
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

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={cls.metricCard}>
      <span className={cls.metricLabel}>{label}</span>
      <strong className={cls.metricValue}>{value}</strong>
      {hint ? <span className={cls.metricHint}>{hint}</span> : null}
    </div>
  );
}

function DotColor({ value, active, onClick }: { value: string; active: boolean; onClick: () => void }) {
  const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(value);

  return (
    <button
      type="button"
      className={`${cls.colorSwatch} ${active ? cls.colorSwatchActive : ""}`}
      onClick={onClick}
      aria-label={`Select color ${value}`}
      aria-pressed={active}
      style={{ background: isHex ? value : "#d1d5db" }}
      title={value}
    />
  );
}

function PolicyItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className={cls.policyItem}>
      <span className={cls.policyIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={cls.policyText}>{text}</span>
    </div>
  );
}

function SimilarProductCard({
  item,
  preview,
  onPreviewClick,
}: {
  item: RelatedProductItem;
  preview: boolean;
  onPreviewClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const href = normalizePath(item.href || "#");
  const discount = getDiscountPercent(item.price, item.originalPrice);

  const content = (
    <>
      <div className={cls.similarThumb}>
        <Image
          src={item.imageSrc || PLACEHOLDER_IMAGE}
          alt={item.name}
          fill
          className={cls.similarThumbImage}
          sizes="120px"
        />
      </div>

      <div className={cls.similarBody}>
        <h4 className={cls.similarName}>{item.name}</h4>

        <div className={cls.similarMeta}>
          <span className={cls.similarStars}>★ {typeof item.rating === "number" ? item.rating.toFixed(1) : "4.5"}</span>
          <span className={cls.similarSold}>{item.soldText || "100 sold"}</span>
        </div>

        <div className={cls.similarPriceRow}>
          <strong className={cls.similarPrice}>{formatPrice(item.price)}</strong>
          {discount > 0 ? <span className={cls.similarDiscount}>-{discount}%</span> : null}
        </div>
      </div>
    </>
  );

  if (preview) {
    return (
      <a href={href} onClick={onPreviewClick} className={cls.similarCard}>
        {content}
      </a>
    );
  }

  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} className={cls.similarCard}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={cls.similarCard}>
      {content}
    </Link>
  );
}

/* =========================
 * Component
 * ========================= */
export function DetailDashboard({
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
}: DetailDashboardProps) {
  const pathname = usePathname();
  const regionId = useId();

  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [remoteProduct, setRemoteProduct] = useState<DetailDashboardProduct | null>(null);
  const [remoteReviews, setRemoteReviews] = useState<ProductReviewItem[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<DetailTabKey>("description");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const headingId = `${regionId}-detail-dashboard-heading`;
  const reviewHeadingId = `${regionId}-detail-dashboard-review-heading`;
  const infoHeadingId = `${regionId}-detail-dashboard-info-heading`;

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
    remoteReviews.length > 0 ? remoteReviews.length : (currentProduct?.reviewCount ?? reviews.length);

  const savings = getSavings(currentProduct);
  const ratingBreakdown = getRatingBreakdown(averageRating);
  const subtotal = typeof currentProduct?.price === "number" ? currentProduct.price * quantity : undefined;
  const colorOptions = currentProduct?.colors?.length ? currentProduct.colors : ["#6b7280", "#e5e7eb", "#c4b5fd"];
  const sizeOptions = currentProduct?.sizes?.length ? currentProduct.sizes : ["S", "M", "L"];
  const relatedProducts = currentProduct?.relatedProducts?.length ? currentProduct.relatedProducts : [];

  useEffect(() => {
    setSelectedImage(0);
  }, [currentProduct?.id, currentProduct?.imageSrc]);

  useEffect(() => {
    if (colorOptions.length > 0 && !selectedColor) {
      setSelectedColor(colorOptions[0] || "");
    }
  }, [colorOptions, selectedColor]);

  useEffect(() => {
    if (sizeOptions.length > 0 && !selectedSize) {
      setSelectedSize(sizeOptions[0] || "");
    }
  }, [sizeOptions, selectedSize]);

  useEffect(() => {
    setOrderMessage("");
  }, [currentProduct?.id, quantity, selectedColor, selectedSize]);

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
        console.error("DetailDashboard fetch error:", error);
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
        console.error("DetailDashboard reviews fetch error:", error);
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

      const payload = buildAddToOrderPayload(productToOrder, quantity, selectedColor, selectedSize);
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
        <div className={cls.detailShell}>
          <header className={cls.topbar}>
            <div className={cls.topbarIntro}>
              <span className={cls.eyebrow}>{eyebrow}</span>
            </div>

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

          <div className={cls.shopGrid}>
            {/* LEFT: gallery */}
            <section className={cls.galleryPanel} aria-label="Product gallery">
              <div className={cls.galleryLayout}>
                <div className={cls.thumbColumn}>
                  {gallery.slice(0, 4).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`${cls.thumbItem} ${selectedImage === index ? cls.thumbItemActive : ""}`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Select image ${index + 1}`}
                      aria-pressed={selectedImage === index}
                    >
                      <span className={cls.thumbInner}>
                        <Image
                          src={image}
                          alt={getImageAlt(currentProduct, "thumbnail", index)}
                          fill
                          className={cls.thumbImage}
                          sizes="80px"
                        />
                      </span>
                    </button>
                  ))}
                </div>

                <div className={cls.heroCard}>
                  <Image
                    src={heroImage}
                    alt={getImageAlt(currentProduct, "hero")}
                    fill
                    priority
                    className={cls.heroImage}
                    sizes="(max-width: 991px) 100vw, 520px"
                  />
                </div>
              </div>
              <div className={cls.tabBar} role="tablist" aria-label="Product detail tabs">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedTab === "description"}
                  className={`${cls.tabButton} ${selectedTab === "description" ? cls.tabButtonActive : ""}`}
                  onClick={() => setSelectedTab("description")}
                >
                  Description
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedTab === "reviews"}
                  className={`${cls.tabButton} ${selectedTab === "reviews" ? cls.tabButtonActive : ""}`}
                  onClick={() => setSelectedTab("reviews")}
                >
                  Reviews
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedTab === "support"}
                  className={`${cls.tabButton} ${selectedTab === "support" ? cls.tabButtonActive : ""}`}
                  onClick={() => setSelectedTab("support")}
                >
                  Support
                </button>
              </div>

              {selectedTab === "description" ? (
                <div className={cls.tabPanel}>
                  <div className={cls.contentCard}>
                    <div className={cls.sectionHead}>
                      <span className={cls.sectionKicker}>Product Details</span>
                      <h3 id={infoHeadingId} className={cls.sectionTitle}>
                        Premium quality long sleeve casual shirt
                      </h3>
                    </div>

                    <div className={cls.infoTable}>
                      <div className={cls.infoRow}>
                        <span className={cls.infoKey}>Product Type:</span>
                        <span className={cls.infoValue}>{currentProduct.category || "Shirt"}</span>
                      </div>
                      <div className={cls.infoRow}>
                        <span className={cls.infoKey}>Main Material:</span>
                        <span className={cls.infoValue}>Cotton Stylish and fashionable</span>
                      </div>
                      <div className={cls.infoRow}>
                        <span className={cls.infoKey}>Gender:</span>
                        <span className={cls.infoValue}>Men</span>
                      </div>
                      <div className={cls.infoRow}>
                        <span className={cls.infoKey}>Color:</span>
                        <span className={cls.infoValue}>{selectedColor || "Default"}</span>
                      </div>
                      <div className={cls.infoRow}>
                        <span className={cls.infoKey}>Size:</span>
                        <span className={cls.infoValue}>{selectedSize || "M"}</span>
                      </div>
                      <div className={cls.infoRow}>
                        <span className={cls.infoKey}>Brand:</span>
                        <span className={cls.infoValue}>{currentProduct.brand || "Fashion Brand"}</span>
                      </div>
                    </div>

                    <p className={cls.longText}>
                      {currentProduct.description ||
                        currentProduct.shortDescription ||
                        "A premium quality stylish long sleeve casual shirt designed for modern daily wear. Clean silhouette, comfortable fabric, and a versatile color palette make it suitable for work, travel, and smart casual outfits."}
                    </p>

                    {noteText ? <p className={cls.noteText}>{noteText}</p> : null}
                  </div>
                </div>
              ) : null}

              {selectedTab === "reviews" ? (
                <div className={cls.tabPanel}>
                  <section className={cls.contentCard} aria-labelledby={reviewHeadingId}>
                    <div className={cls.sectionHead}>
                      <span className={cls.sectionKicker}>Customer feedback</span>
                      <h3 id={reviewHeadingId} className={cls.sectionTitle}>
                        Ratings & reviews
                      </h3>
                    </div>

                    <div className={cls.reviewLayout}>
                      <aside className={cls.reviewSummaryCard} aria-label="Rating summary">
                        <div className={cls.reviewSummaryTop}>
                          <strong className={cls.reviewSummaryScore}>{averageRating.toFixed(1)}/5</strong>
                          <ReviewStars rating={averageRating} />
                        </div>

                        <p className={cls.reviewSummaryMeta}>
                          Based on {formatCompactCount(visibleReviewCount)} reviews
                        </p>

                        <div className={cls.reviewBars}>
                          {ratingBreakdown.map((item) => (
                            <div key={item.star} className={cls.reviewBarRow}>
                              <span className={cls.reviewBarLabel}>{item.star} Star</span>
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
                                        {review.verified ? (
                                          <span className={cls.verifiedBadge}>Verified purchase</span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>

                                  {review.title ? <h4 className={cls.reviewTitle}>{review.title}</h4> : null}
                                  <p className={cls.reviewText}>
                                    {review.content ||
                                      "Exactly as described, packaged well, and easy to trust through checkout."}
                                  </p>
                                </div>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              ) : null}

              {selectedTab === "support" ? (
                <div className={cls.tabPanel}>
                  <div className={cls.contentCard}>
                    <div className={cls.sectionHead}>
                      <span className={cls.sectionKicker}>Support</span>
                      <h3 className={cls.sectionTitle}>Shipping, return and care</h3>
                    </div>

                    <div className={cls.supportGrid}>
                      <MetricCard label="Shipping" value="Free" hint="Worldwide available" />
                      <MetricCard label="Return" value="7 Days" hint="Eligible items only" />
                      <MetricCard label="Support" value="24/7" hint="Fast response" />
                    </div>

                    <p className={cls.longText}>
                      We provide fast delivery, secured payment processing, and responsive support to help customers
                      shop with confidence. For garment care, machine wash cold and avoid high heat drying to preserve
                      fabric quality.
                    </p>
                  </div>
                </div>
              ) : null}
            </section>

            {/* CENTER: product content */}
            <section className={cls.centerPanel} aria-labelledby={infoHeadingId}>
              <div className={cls.headMeta}>
                <div className={cls.badgeLine}>
                  {currentProduct.badge ? <span className={cls.badgePrimary}>{currentProduct.badge}</span> : null}
                  <span className={cls.shippingPill}>{currentProduct.shippingNote || "Free shipping worldwide"}</span>
                  {currentProduct.discountPercent ? (
                    <span className={cls.badgeSecondary}>-{currentProduct.discountPercent}%</span>
                  ) : null}
                </div>

                <h1 className={cls.productName}>{currentProduct.name}</h1>

                <div className={cls.ratingRow}>
                  <ReviewStars rating={averageRating} />
                  <span className={cls.ratingValue}>{averageRating.toFixed(1)}</span>
                  <span className={cls.ratingDivider}>|</span>
                  <span className={cls.ratingMeta}>{formatCompactCount(visibleReviewCount)} Reviews</span>
                  <span className={cls.ratingDivider}>|</span>
                  <span className={cls.ratingMeta}>{currentProduct.soldText || "300 sold"}</span>
                </div>
              </div>

              <div className={cls.priceBox}>
                <div className={cls.priceMainRow}>
                  <strong className={cls.currentPrice}>{formatPrice(currentProduct.price)}</strong>
                  {typeof currentProduct.originalPrice === "number" &&
                  currentProduct.originalPrice > (currentProduct.price || 0) ? (
                    <span className={cls.originalPrice}>{formatPrice(currentProduct.originalPrice)}</span>
                  ) : null}
                </div>

                <div className={cls.priceSupport}>
                  {savings ? <span className={cls.savingsPill}>Save {formatPrice(savings)}</span> : null}
                </div>
              </div>

              <div className={cls.optionGroup}>
                <span className={cls.optionLabel}>Colors</span>
                <div className={cls.colorRow}>
                  {colorOptions.map((color, index) => (
                    <DotColor
                      key={`${color}-${index}`}
                      value={color}
                      active={selectedColor === color}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className={cls.optionGroup}>
                <span className={cls.optionLabel}>Size</span>
                <div className={cls.sizeRow}>
                  {sizeOptions.map((size, index) => (
                    <button
                      key={`${size}-${index}`}
                      type="button"
                      className={`${cls.sizeButton} ${selectedSize === size ? cls.sizeButtonActive : ""}`}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className={cls.buyBox}>
                <div className={cls.quantityLine}>
                  <span className={cls.optionLabel}>Qty</span>
                  <div className={cls.quantityControl} role="group" aria-label="Quantity selector">
                    <button
                      type="button"
                      className={cls.quantityButton}
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      aria-label="Decrease quantity"
                    >
                      -
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

                  <div className={cls.subtotalWrap}>
                    <span className={cls.optionLabel}>Subtotal</span>
                    <strong className={cls.subtotalValue}>
                      {typeof subtotal === "number" ? formatPrice(subtotal) : "Contact us"}
                    </strong>
                  </div>
                </div>

                <div className={cls.ctaStack}>
                  <button
                    type="button"
                    className={cls.primaryButton}
                    onClick={handleAddToOrder}
                    disabled={ordering}
                    aria-label={`Add ${currentProduct.name} to order`}
                  >
                    {ordering ? "Adding..." : secondaryCtaText}
                  </button>

                  {renderLink(
                    detailHref,
                    cls.secondaryButton,
                    <span>{primaryCtaText}</span>,
                    `Go to purchase page for ${currentProduct.name}`,
                  )}
                </div>

                {orderMessage ? (
                  <p className={cls.feedbackMessage} role="status" aria-live="polite">
                    {orderMessage}
                  </p>
                ) : null}
              </div>

              <div className={cls.policyGrid}>
                <PolicyItem icon="✓" text="Free shipping worldwide" />
                <PolicyItem icon="↺" text="100% Secured Payment" />
                <PolicyItem icon="★" text="100% Secured Payment" />
              </div>
              {/* RIGHT: similar products */}
              <aside className={cls.sidebarPanel} aria-label="Similar products">
                <div className={cls.sidebarCard}>
                  <h3 className={cls.sidebarTitle}>Similar Products</h3>

                  <div className={cls.similarList}>
                    {relatedProducts.length > 0 ? (
                      relatedProducts
                        .slice(0, 5)
                        .map((item, index) => (
                          <SimilarProductCard
                            key={String(item.id ?? index)}
                            item={item}
                            preview={preview}
                            onPreviewClick={onPreviewClick}
                          />
                        ))
                    ) : (
                      <>
                        {[1, 2, 3].map((item) => (
                          <div key={item} className={cls.similarCard}>
                            <div className={cls.similarThumb}>
                              <Image
                                src={currentProduct.imageSrc || PLACEHOLDER_IMAGE}
                                alt={currentProduct.name}
                                fill
                                className={cls.similarThumbImage}
                                sizes="120px"
                              />
                            </div>

                            <div className={cls.similarBody}>
                              <h4 className={cls.similarName}>{currentProduct.name}</h4>
                              <div className={cls.similarMeta}>
                                <span className={cls.similarStars}>★ {averageRating.toFixed(1)}</span>
                                <span className={cls.similarSold}>{currentProduct.soldText || "100 sold"}</span>
                              </div>
                              <div className={cls.similarPriceRow}>
                                <strong className={cls.similarPrice}>{formatPrice(currentProduct.price)}</strong>
                                {currentProduct.discountPercent ? (
                                  <span className={cls.similarDiscount}>-{currentProduct.discountPercent}%</span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
 * RegItem
 * ========================= */
export const SHOP_DETAIL_DASHBOARD: RegItem = {
  kind: "DetailDashboard",
  label: "Detail Dashboard",
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
    { key: "product", label: "Product override (JSON)", kind: "textarea", rows: 16 },
    { key: "fallbackBreadcrumbText", label: "Breadcrumb text", kind: "text" },
    { key: "sectionAriaLabel", label: "Section aria label", kind: "text" },
  ],
  render: (p) => {
    const parsedProduct = safeJson<DetailDashboardProduct>(p.product);
    const productOverride = parsedProduct ? normalizeProduct(parsedProduct) || undefined : undefined;

    return (
      <div className="sectionContainer" aria-label="Shop Detail Dashboard">
        <DetailDashboard
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

export default DetailDashboard;

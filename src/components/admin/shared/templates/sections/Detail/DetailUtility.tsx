"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import styles from "@/styles/templates/sections/Detail/DetailUtility.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* =========================
 * Types
 * ========================= */
type UnknownRecord = Record<string, unknown>;
type ProductIdentifier = string | number;
type DetailTabKey = "overview" | "reviews" | "shipping";

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

export type DetailUtilityProduct = {
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
  qualityOptions?: string[];
  styleOptions?: string[];
};

export type DetailUtilityProps = {
  title?: string;
  eyebrow?: string;
  noteText?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  apiBasePath?: string;
  orderApiPath?: string;
  reviewApiPath?: string;
  preview?: boolean;
  product?: DetailUtilityProduct | null;
  fallbackBreadcrumbText?: string;
  sectionAriaLabel?: string;
};

/* =========================
 * Constants
 * ========================= */
const DEFAULT_TITLE = "Product Detail";
const DEFAULT_EYEBROW = "Home collection";
const DEFAULT_PRIMARY_CTA = "Buy now";
const DEFAULT_SECONDARY_CTA = "Add to cart";
const DEFAULT_API_BASE_PATH = "/api/v1/products/product-detail";
const DEFAULT_ORDER_API_PATH = "/api/v1/order";
const DEFAULT_REVIEW_API_PATH = "/api/v1/reviews";
const DEFAULT_FALLBACK_BREADCRUMB = "Catalog";
const DEFAULT_SECTION_ARIA_LABEL = "Professional ecommerce product detail";
const PLACEHOLDER_IMAGE = "/images/placeholder-product.png";
const DEFAULT_PRODUCT_NAME = "Product";

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

function toNumber(value: unknown, fallback = Number.NaN): number {
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
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
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
  return clampRating(toNumber(item.rating ?? item.averageRating ?? item.avgRating, Number.NaN));
}

function computeReviewCount(item: UnknownRecord): number | undefined {
  const count = toNumber(item.reviewCount ?? item.reviewsCount ?? item.totalReviews ?? item.numReviews, Number.NaN);
  if (!Number.isFinite(count) || count < 0) return undefined;
  return Math.round(count);
}

function buildStockText(item: UnknownRecord): string | undefined {
  const stock = toNumber(item.stock ?? item.inventory ?? item.quantity ?? item.productQty ?? item.stockQty, Number.NaN);
  if (!Number.isFinite(stock)) return undefined;
  if (stock <= 0) return "Out of stock";
  if (stock <= 8) return `Only ${stock} left in stock`;
  if (stock <= 24) return "Low stock";
  return "Ready to ship";
}

function buildShippingNote(item: UnknownRecord): string {
  return toStringSafe(item.shippingNote) || "Free shipping on eligible orders. Easy return within 30 days.";
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
  const rating = toNumber(item.rating ?? item.star ?? item.stars, Number.NaN);

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
      "Looks premium, feels comfortable, and delivers exactly what I expected.",
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
    "Premium build with carefully selected materials",
    "Balanced proportions for everyday comfort and visual appeal",
    "Designed to blend durability, aesthetics, and convenience",
    "A refined product experience from unboxing to long-term use",
  ];
}

function getColorOptionsFromRecord(item: UnknownRecord): string[] {
  if (Array.isArray(item.colors)) {
    return item.colors.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  if (Array.isArray(item.colorOptions)) {
    return item.colorOptions.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  return ["#111827", "#d4b483", "#93c5fd", "#f8fafc"];
}

function getSizeOptionsFromRecord(item: UnknownRecord): string[] {
  if (Array.isArray(item.sizes)) {
    return item.sizes.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  if (Array.isArray(item.sizeOptions)) {
    return item.sizeOptions.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  return ["S", "M", "L", "XL"];
}

function getQualityOptionsFromRecord(item: UnknownRecord): string[] {
  if (Array.isArray(item.qualityOptions)) {
    return item.qualityOptions.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  return ["Standard", "Premium", "Signature"];
}

function getStyleOptionsFromRecord(item: UnknownRecord): string[] {
  if (Array.isArray(item.styleOptions)) {
    return item.styleOptions.map((entry) => toStringSafe(entry)).filter(Boolean);
  }

  return ["Modern", "Minimal", "Classic", "Bold"];
}

function normalizeRelatedProduct(raw: unknown, index: number): RelatedProductItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as UnknownRecord;
  const name =
    toStringSafe(item.name) ||
    toStringSafe(item.title) ||
    toStringSafe(item.productName) ||
    `Related product ${index + 1}`;

  return {
    id: isProductIdentifier(item.id) ? item.id : isProductIdentifier(item._id) ? item._id : index,
    name,
    imageSrc: getImageFromRecord(item),
    href: buildHref(item) || "#",
    price: toNumber(item.salePrice ?? item.price ?? item.finalPrice, Number.NaN),
    originalPrice: toNumber(
      item.originalPrice ?? item.compareAtPrice ?? item.oldPrice ?? item.listPrice ?? item.marketPrice,
      Number.NaN,
    ),
    rating: computeRating(item) ?? 4.5,
    soldText: toStringSafe(item.soldText) || "Popular choice",
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

function normalizeProduct(raw: unknown): DetailUtilityProduct | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as UnknownRecord;
  const name =
    toStringSafe(item.name) ||
    toStringSafe(item.title) ||
    toStringSafe(item.productName) ||
    toStringSafe(item.product_title);

  if (!name) return null;

  const imageSrc = getImageFromRecord(item);
  const price = toNumber(item.salePrice ?? item.price ?? item.finalPrice, Number.NaN);
  const originalPrice = toNumber(
    item.originalPrice ?? item.compareAtPrice ?? item.oldPrice ?? item.listPrice ?? item.marketPrice,
    Number.NaN,
  );
  const marketPrice = toNumber(item.marketPrice, Number.NaN);
  const savingPrice = toNumber(item.savingPrice, Number.NaN);
  const stockCount = toNumber(
    item.stock ?? item.inventory ?? item.quantity ?? item.productQty ?? item.stockQty,
    Number.NaN,
  );
  const soldCount = toNumber(
    item.sold ?? item.soldCount ?? item.stockSold ?? item.ordersCount ?? item.totalSold,
    Number.NaN,
  );
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
    badge: toStringSafe(item.badge) || (Boolean(item.isNew) ? "New arrival" : ""),
    shortDescription: buildShortDescription(item),
    description: toStringSafe(item.description) || undefined,
    price: Number.isFinite(price) ? price : undefined,
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : undefined,
    marketPrice: Number.isFinite(marketPrice) ? marketPrice : undefined,
    savingPrice: Number.isFinite(savingPrice) ? savingPrice : undefined,
    discountPercent: computeDiscountPercent(
      Number.isFinite(price) ? price : undefined,
      Number.isFinite(originalPrice) ? originalPrice : undefined,
      toNumber(item.discountPercent ?? item.discount, Number.NaN),
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
    rating: rating ?? (reviewCount ? 4.6 : 4.8),
    reviewCount: reviewCount ?? normalizedReviews.length ?? 0,
    soldText:
      toStringSafe(item.soldText) ||
      (Number.isFinite(soldCount) && soldCount > 0 ? `${formatCompactCount(soldCount)} sold` : "Best seller"),
    soldCount: Number.isFinite(soldCount) ? soldCount : undefined,
    isNew: Boolean(item.isNew),
    reviews: normalizedReviews,
    features: getFeaturesFromRecord(item),
    colors: getColorOptionsFromRecord(item),
    sizes: getSizeOptionsFromRecord(item),
    relatedProducts: getRelatedProductsFromRecord(item),
    qualityOptions: getQualityOptionsFromRecord(item),
    styleOptions: getStyleOptionsFromRecord(item),
  };
}

function extractProductFromResponse(data: unknown): DetailUtilityProduct | null {
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
 * Derived helpers
 * ========================= */
function getSavings(product?: DetailUtilityProduct | null): number | undefined {
  if (!product) return undefined;
  if (typeof product.price !== "number" || typeof product.originalPrice !== "number") return undefined;
  if (product.originalPrice <= product.price) return undefined;
  return product.originalPrice - product.price;
}

function getImageAlt(
  product?: DetailUtilityProduct | null,
  kind: "hero" | "thumbnail" = "hero",
  index?: number,
): string {
  const productName = product?.name?.trim() || DEFAULT_PRODUCT_NAME;

  if (kind === "thumbnail" && typeof index === "number") {
    return `${productName} gallery image ${index + 1}`;
  }

  return `${productName} product image`;
}

function buildProductJsonLd(product: DetailUtilityProduct) {
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
            priceCurrency: "USD",
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

function buildAddToOrderPayload(
  product: DetailUtilityProduct,
  qty: number,
  color?: string,
  size?: string,
  quality?: string,
  style?: string,
) {
  const unitPrice = typeof product.price === "number" ? product.price : 0;
  const subtotal = unitPrice * qty;

  return {
    qty,
    source: "detail-utility",
    productId: isProductIdentifier(product.id) ? String(product.id) : null,
    variantId: product.tag || null,
    selectedColor: color || null,
    selectedSize: size || null,
    selectedQuality: quality || null,
    selectedStyle: style || null,
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
): Promise<DetailUtilityProduct | null> {
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
      console.warn("DetailUtility fetch candidate error:", url, error);
    }
  }

  return null;
}

/* =========================
 * UI pieces
 * ========================= */
function ReviewStars({ rating }: { rating?: number }) {
  const stars = buildStars(rating ?? 0);

  return (
    <span className={styles.starRow} aria-label={`Rated ${rating ?? 0} out of 5`}>
      {stars.map((state, index) => (
        <span key={`${state}-${index}`} className={state === "full" ? styles.starFull : styles.starEmpty}>
          ★
        </span>
      ))}
    </span>
  );
}

function ColorSwatch({ value, active, onClick }: { value: string; active: boolean; onClick: () => void }) {
  const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(value);

  return (
    <button
      type="button"
      className={`${styles.colorSwatch} ${active ? styles.colorSwatchActive : ""}`}
      onClick={onClick}
      aria-label={`Select color ${value}`}
      aria-pressed={active}
      title={value}
      style={{ background: isHex ? value : "#e5e7eb" }}
    />
  );
}

function RelatedCard({
  item,
  preview,
  onPreviewClick,
}: {
  item: RelatedProductItem;
  preview: boolean;
  onPreviewClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const href = normalizePath(item.href || "#");

  const body = (
    <>
      <div className={styles.relatedThumb}>
        <Image
          src={item.imageSrc || PLACEHOLDER_IMAGE}
          alt={item.name}
          fill
          className={styles.relatedImage}
          sizes="120px"
        />
      </div>

      <div className={styles.relatedBody}>
        <div className={styles.relatedMetaTop}>
          {item.badge ? <span className={styles.relatedBadge}>{item.badge}</span> : null}
          <span className={styles.relatedRating}>★ {(item.rating ?? 4.5).toFixed(1)}</span>
        </div>
        <strong className={styles.relatedTitle}>{item.name}</strong>
        <div className={styles.relatedPriceRow}>
          <span className={styles.relatedPrice}>{formatPrice(item.price)}</span>
          {typeof item.originalPrice === "number" && item.originalPrice > (item.price ?? 0) ? (
            <span className={styles.relatedOriginal}>{formatPrice(item.originalPrice)}</span>
          ) : null}
        </div>
      </div>
    </>
  );

  if (preview) {
    return (
      <a href={href} onClick={onPreviewClick} className={styles.relatedCard}>
        {body}
      </a>
    );
  }

  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} className={styles.relatedCard}>
        {body}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={styles.relatedCard}>
      {body}
    </Link>
  );
}

/* =========================
 * Component
 * ========================= */
export function DetailUtility({
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
}: DetailUtilityProps) {
  const pathname = usePathname();
  const regionId = useId();

  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [remoteProduct, setRemoteProduct] = useState<DetailUtilityProduct | null>(null);
  const [remoteReviews, setRemoteReviews] = useState<ProductReviewItem[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<DetailTabKey>("overview");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");

  const headingId = `${regionId}-detail-utility-heading`;

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
  const subtotal = typeof currentProduct?.price === "number" ? currentProduct.price * quantity : undefined;

  const colorOptions = currentProduct?.colors?.length
    ? currentProduct.colors
    : ["#111827", "#d4b483", "#93c5fd", "#f8fafc"];

  const sizeOptions = currentProduct?.sizes?.length ? currentProduct.sizes : ["S", "M", "L", "XL"];
  const qualityOptions = currentProduct?.qualityOptions?.length
    ? currentProduct.qualityOptions
    : ["Standard", "Premium", "Signature"];
  const styleOptions = currentProduct?.styleOptions?.length
    ? currentProduct.styleOptions
    : ["Modern", "Minimal", "Classic", "Bold"];
  const relatedProducts = currentProduct?.relatedProducts?.length ? currentProduct.relatedProducts : [];

  useEffect(() => {
    setSelectedImage(0);
  }, [currentProduct?.id, currentProduct?.imageSrc]);

  useEffect(() => {
    if (colorOptions.length > 0 && !selectedColor) setSelectedColor(colorOptions[0] || "");
  }, [colorOptions, selectedColor]);

  useEffect(() => {
    if (sizeOptions.length > 0 && !selectedSize) setSelectedSize(sizeOptions[0] || "");
  }, [sizeOptions, selectedSize]);

  useEffect(() => {
    if (qualityOptions.length > 0 && !selectedQuality) setSelectedQuality(qualityOptions[0] || "");
  }, [qualityOptions, selectedQuality]);

  useEffect(() => {
    if (styleOptions.length > 0 && !selectedStyle) setSelectedStyle(styleOptions[0] || "");
  }, [styleOptions, selectedStyle]);

  useEffect(() => {
    setOrderMessage("");
  }, [currentProduct?.id, quantity, selectedColor, selectedSize, selectedQuality, selectedStyle]);

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
        console.error("DetailUtility fetch error:", error);
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
        console.error("DetailUtility reviews fetch error:", error);
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

      const payload = buildAddToOrderPayload(
        productToOrder,
        quantity,
        selectedColor,
        selectedSize,
        selectedQuality,
        selectedStyle,
      );

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
      <section className={styles.section} aria-label={sectionAriaLabel} aria-labelledby={headingId}>
        <div className={styles.container}>
          <div className={styles.stateCard}>Loading product details...</div>
        </div>
      </section>
    );
  }

  if (!currentProduct) {
    return (
      <section className={styles.section} aria-label={sectionAriaLabel} aria-labelledby={headingId}>
        <div className={styles.container}>
          <div className={styles.stateCard}>No product data available.</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label={sectionAriaLabel} aria-labelledby={headingId}>
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

      <div className={styles.container}>
        <div className={styles.shell}>
          <div className={styles.heroGrid}>
            <section className={styles.mediaColumn} aria-label="Product gallery">
              <div className={styles.mediaShell}>
                <div className={styles.galleryRail} aria-label="Gallery thumbnails">
                  {gallery.slice(0, 6).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`${styles.thumbnailButton} ${selectedImage === index ? styles.thumbnailButtonActive : ""}`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Select image ${index + 1}`}
                      aria-pressed={selectedImage === index}
                    >
                      <span className={styles.thumbnailInner}>
                        <Image
                          src={image}
                          alt={getImageAlt(currentProduct, "thumbnail", index)}
                          fill
                          className={styles.thumbnailImage}
                          sizes="88px"
                        />
                      </span>
                    </button>
                  ))}
                </div>

                <div className={styles.heroCard}>
                  <div className={styles.heroTopBar}>
                    <div className={styles.heroBadges}>
                      {currentProduct.badge ? (
                        <span className={styles.badgePrimary}>{currentProduct.badge}</span>
                      ) : null}
                      {currentProduct.stockText ? (
                        <span className={styles.badgeSoft}>{currentProduct.stockText}</span>
                      ) : null}
                    </div>
                    <div className={styles.heroInsight}>360° premium display</div>
                  </div>

                  <div className={styles.heroStage}>
                    <div className={styles.heroGlow} aria-hidden="true" />
                    <Image
                      src={heroImage}
                      alt={getImageAlt(currentProduct, "hero")}
                      fill
                      priority
                      className={styles.heroImage}
                      sizes="(max-width: 1199px) 100vw, 760px"
                    />
                  </div>

                  <div className={styles.heroStats}>
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatLabel}>Rating</span>
                      <strong>{averageRating.toFixed(1)}/5</strong>
                    </div>
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatLabel}>Reviews</span>
                      <strong>{formatCompactCount(visibleReviewCount)}</strong>
                    </div>
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatLabel}>Sold</span>
                      <strong>{currentProduct.soldText || "Best seller"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.contentColumn} aria-labelledby={headingId}>
              <div className={styles.breadcrumbs}>
                {renderLink(
                  "/product-detail",
                  styles.backLink,
                  `← ${fallbackBreadcrumbText}`,
                  "Back to product listing",
                )}
              </div>

              <div className={styles.headerCard}>
                <div className={styles.headerTop}>
                  <div>
                    <p className={styles.eyebrow}>{currentProduct.category || eyebrow}</p>
                    <h1 id={headingId} className={styles.productName}>
                      {currentProduct.name || title}
                    </h1>
                  </div>
                  {currentProduct.brand ? <span className={styles.brandPill}>by {currentProduct.brand}</span> : null}
                </div>

                <div className={styles.ratingRow}>
                  <ReviewStars rating={averageRating} />
                  <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
                  <span className={styles.ratingMeta}>{formatCompactCount(visibleReviewCount)} verified reviews</span>
                </div>

                <p className={styles.summary}>
                  {currentProduct.shortDescription ||
                    currentProduct.description ||
                    "A modern premium product detail experience built to showcase value, trust, and craftsmanship."}
                </p>

                <div className={styles.highlightGrid}>
                  <div className={styles.highlightCard}>
                    <span className={styles.highlightLabel}>Fast dispatch</span>
                    <strong>Ships in 24 hours</strong>
                  </div>
                  <div className={styles.highlightCard}>
                    <span className={styles.highlightLabel}>Returns</span>
                    <strong>30-day easy return</strong>
                  </div>
                  <div className={styles.highlightCard}>
                    <span className={styles.highlightLabel}>Warranty</span>
                    <strong>Quality guaranteed</strong>
                  </div>
                </div>
              </div>

              <div className={styles.purchaseCard}>
                <div className={styles.priceRow}>
                  <div>
                    <div className={styles.priceWrap}>
                      <strong className={styles.priceValue}>{formatPrice(currentProduct.price)}</strong>
                      {typeof currentProduct.originalPrice === "number" &&
                      currentProduct.originalPrice > (currentProduct.price ?? 0) ? (
                        <span className={styles.originalPrice}>{formatPrice(currentProduct.originalPrice)}</span>
                      ) : null}
                    </div>
                    <div className={styles.priceNote}>
                      {savings ? `You save ${formatPrice(savings)} today` : currentProduct.shippingNote}
                    </div>
                  </div>

                  {currentProduct.discountPercent ? (
                    <div className={styles.discountBubble}>-{currentProduct.discountPercent}%</div>
                  ) : null}
                </div>

                <div className={styles.configGrid}>
                  <div className={styles.optionGroup}>
                    <span className={styles.optionTitle}>Quality</span>
                    <div className={styles.segmented}>
                      {qualityOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`${styles.segmentButton} ${selectedQuality === option ? styles.segmentButtonActive : ""}`}
                          onClick={() => setSelectedQuality(option)}
                          aria-pressed={selectedQuality === option}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.optionGroup}>
                    <span className={styles.optionTitle}>Style</span>
                    <div className={styles.chipRow}>
                      {styleOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`${styles.chip} ${selectedStyle === option ? styles.chipActive : ""}`}
                          onClick={() => setSelectedStyle(option)}
                          aria-pressed={selectedStyle === option}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.optionGroup}>
                    <span className={styles.optionTitle}>Color</span>
                    <div className={styles.colorRow}>
                      {colorOptions.map((color, index) => (
                        <ColorSwatch
                          key={`${color}-${index}`}
                          value={color}
                          active={selectedColor === color}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={styles.optionGroup}>
                    <span className={styles.optionTitle}>Size</span>
                    <div className={styles.chipRow}>
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`${styles.chip} ${selectedSize === size ? styles.chipActive : ""}`}
                          onClick={() => setSelectedSize(size)}
                          aria-pressed={selectedSize === size}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <div className={styles.quantityBox} aria-label="Quantity selector">
                    <button
                      type="button"
                      className={styles.qtyButton}
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyButton}
                      onClick={() => setQuantity((prev) => prev + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className={styles.cartButton}
                    onClick={handleAddToOrder}
                    disabled={ordering}
                    aria-label={`Add ${currentProduct.name} to cart`}
                  >
                    {ordering ? "Adding..." : secondaryCtaText}
                  </button>

                  {renderLink(
                    detailHref,
                    styles.buyButton,
                    <span>{primaryCtaText}</span>,
                    `Go to purchase page for ${currentProduct.name}`,
                  )}
                </div>

                <div className={styles.metaStrip}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>SKU</span>
                    <strong>{currentProduct.sku || "Auto generated"}</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Subtotal</span>
                    <strong>{formatPrice(subtotal ?? currentProduct.price)}</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Protection</span>
                    <strong>Secure payment</strong>
                  </div>
                </div>
              </div>

              <div className={styles.tabsCard}>
                <div className={styles.tabs} role="tablist" aria-label="Product information tabs">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTab === "overview"}
                    className={`${styles.tab} ${selectedTab === "overview" ? styles.tabActive : ""}`}
                    onClick={() => setSelectedTab("overview")}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTab === "reviews"}
                    className={`${styles.tab} ${selectedTab === "reviews" ? styles.tabActive : ""}`}
                    onClick={() => setSelectedTab("reviews")}
                  >
                    Reviews
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedTab === "shipping"}
                    className={`${styles.tab} ${selectedTab === "shipping" ? styles.tabActive : ""}`}
                    onClick={() => setSelectedTab("shipping")}
                  >
                    Shipping & care
                  </button>
                </div>

                <div className={styles.tabPanel}>
                  {selectedTab === "overview" ? (
                    <div className={styles.overviewPanel}>
                      <div className={styles.featureGrid}>
                        {(currentProduct.features || []).slice(0, 4).map((feature, index) => (
                          <div key={`${feature}-${index}`} className={styles.featureCard}>
                            <span className={styles.featureIndex}>0{index + 1}</span>
                            <p>{feature}</p>
                          </div>
                        ))}
                      </div>

                      {relatedProducts.length > 0 ? (
                        <div className={styles.bundleSection}>
                          <div className={styles.sectionHead}>
                            <strong>Pairs well with</strong>
                            <span>Curated complementary items to increase perceived value.</span>
                          </div>

                          <div className={styles.relatedGrid}>
                            {relatedProducts.slice(0, 3).map((item, index) => (
                              <RelatedCard
                                key={String(item.id ?? index)}
                                item={item}
                                preview={preview}
                                onPreviewClick={onPreviewClick}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className={styles.noteCard}>
                        <strong>Why customers trust this product</strong>
                        <p>
                          {noteText ||
                            "Built for premium visual presentation and strong commercial intent, with clear information hierarchy, social proof, and purchase confidence."}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {selectedTab === "reviews" ? (
                    <div className={styles.reviewPanel}>
                      {reviewsLoading ? (
                        <div className={styles.emptyState}>Loading reviews...</div>
                      ) : reviews.length === 0 ? (
                        <div className={styles.emptyState}>No reviews yet.</div>
                      ) : (
                        reviews.slice(0, 3).map((review, index) => (
                          <article key={String(review.id ?? index)} className={styles.reviewItem}>
                            <div className={styles.reviewAvatar}>
                              {review.avatar ? (
                                <Image
                                  src={review.avatar}
                                  alt={review.author || "Customer"}
                                  fill
                                  className={styles.reviewAvatarImage}
                                  sizes="52px"
                                />
                              ) : (
                                <span className={styles.reviewAvatarFallback}>{getInitials(review.author)}</span>
                              )}
                            </div>

                            <div className={styles.reviewBody}>
                              <div className={styles.reviewTop}>
                                <div>
                                  <strong>{review.author || "Customer"}</strong>
                                  <div className={styles.reviewMetaLine}>
                                    <ReviewStars rating={review.rating ?? 5} />
                                    <span>{formatDate(review.createdAt)}</span>
                                  </div>
                                </div>
                                {review.verified !== false ? (
                                  <span className={styles.verifiedPill}>Verified</span>
                                ) : null}
                              </div>

                              {review.title ? <h3 className={styles.reviewTitle}>{review.title}</h3> : null}
                              <p className={styles.reviewText}>
                                {review.content || "Excellent quality and thoughtful packaging."}
                              </p>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  ) : null}

                  {selectedTab === "shipping" ? (
                    <div className={styles.shippingPanel}>
                      <div className={styles.shippingCard}>
                        <strong>Shipping</strong>
                        <p>
                          {currentProduct.shippingNote ||
                            "Fast worldwide shipping with careful packaging and tracking updates."}
                        </p>
                      </div>
                      <div className={styles.shippingCard}>
                        <strong>Returns</strong>
                        <p>Return within 30 days if the item is unused and in original condition.</p>
                      </div>
                      <div className={styles.shippingCard}>
                        <strong>Care guide</strong>
                        <p>Use a soft cloth and store properly to maintain premium look and performance over time.</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.trustStrip}>
                <div className={styles.trustItem}>Encrypted checkout</div>
                <div className={styles.trustItem}>Authenticity guarantee</div>
                <div className={styles.trustItem}>Responsive support team</div>
              </div>
            </section>
          </div>

          {orderMessage ? (
            <p className={styles.feedbackMessage} role="status" aria-live="polite">
              {orderMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* =========================
 * RegItem
 * ========================= */
export const SHOP_DETAIL_UTILITY: RegItem = {
  kind: "DetailUtility",
  label: "Detail Utility",
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
    const parsedProduct = safeJson<DetailUtilityProduct>(p.product);
    const productOverride = parsedProduct ? normalizeProduct(parsedProduct) || undefined : undefined;

    return (
      <div className="sectionContainer" aria-label="Shop Detail Utility">
        <DetailUtility
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

export default DetailUtility;

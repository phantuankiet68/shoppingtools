"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Detail/DetailAnnouncement.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* =========================
 * Types
 * ========================= */
type UnknownRecord = Record<string, unknown>;

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

export type DetailAnnouncementProduct = {
  id?: string | number;
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

export type DetailAnnouncementProps = {
  title?: string;
  eyebrow?: string;
  noteText?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  apiBasePath?: string;
  orderApiPath?: string;
  reviewApiPath?: string;
  preview?: boolean;
  product?: DetailAnnouncementProduct | null;
  fallbackBreadcrumbText?: string;
  sectionAriaLabel?: string;
};

/* =========================
 * Constants
 * ========================= */
const DEFAULT_TITLE = "Chi tiết sản phẩm";
const DEFAULT_PRIMARY_CTA = "Mua ngay";
const DEFAULT_SECONDARY_CTA = "Thêm vào đơn";
const DEFAULT_API_BASE_PATH = "/api/v1/products/product-detail";
const DEFAULT_ORDER_API_PATH = "/api/v1/order";
const DEFAULT_REVIEW_API_PATH = "/api/v1/reviews";
const DEFAULT_FALLBACK_BREADCRUMB = "Sản phẩm";
const DEFAULT_SECTION_ARIA_LABEL = "Chi tiết sản phẩm";
const PLACEHOLDER_IMAGE = "/images/placeholder-product.png";
const DEFAULT_PRODUCT_NAME = "Product image";

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
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `${new Intl.NumberFormat("vi-VN").format(value)}₫`;
}

function formatCompactCount(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "0";

  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function formatDate(value?: string): string {
  if (!value) return "Gần đây";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getInitials(value?: string): string {
  const text = (value || "U").trim();
  if (!text) return "U";
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "U";
}

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
      return (
        toStringSafe(obj.url) ||
        toStringSafe(obj.src) ||
        toStringSafe(obj.image) ||
        toStringSafe(obj.imageSrc) ||
        PLACEHOLDER_IMAGE
      );
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
  const rating = toNumber(item.rating ?? item.averageRating ?? item.avgRating, NaN);
  if (!Number.isFinite(rating) || rating <= 0) return undefined;
  return Math.max(0, Math.min(5, Number(rating.toFixed(1))));
}

function computeReviewCount(item: UnknownRecord): number | undefined {
  const count = toNumber(item.reviewCount ?? item.reviewsCount ?? item.totalReviews ?? item.numReviews, NaN);
  if (!Number.isFinite(count) || count < 0) return undefined;
  return Math.round(count);
}

function buildStockText(item: UnknownRecord): string | undefined {
  const stock = toNumber(item.stock ?? item.inventory ?? item.quantity ?? item.productQty ?? item.stockQty, NaN);
  if (!Number.isFinite(stock)) return undefined;
  if (stock <= 0) return "Hết hàng";
  if (stock <= 8) return `Chỉ còn ${stock} sản phẩm`;
  if (stock <= 24) return "Sắp hết hàng";
  return "Còn hàng";
}

function buildShippingNote(item: UnknownRecord): string {
  return toStringSafe(item.shippingNote) || "Nhận hàng trong 2 - 4 ngày";
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
  if (typeof id === "string" || typeof id === "number") {
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
    author: toStringSafe(item.author) || toStringSafe(item.userName) || toStringSafe(item.name) || "Khách hàng",
    avatar: toStringSafe(item.avatar) || toStringSafe(item.photo) || undefined,
    rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, Math.round(rating))) : 5,
    title: toStringSafe(item.title) || undefined,
    content:
      toStringSafe(item.content) ||
      toStringSafe(item.comment) ||
      toStringSafe(item.review) ||
      "Sản phẩm đúng mô tả, giao hàng ổn, trải nghiệm sử dụng tốt.",
    createdAt: toStringSafe(item.createdAt) || toStringSafe(item.date) || undefined,
    verified: Boolean(item.verified ?? item.isVerified ?? true),
  };
}

function getReviewsFromRecord(item: UnknownRecord): ProductReviewItem[] {
  const rawReviews = item.reviews;

  if (Array.isArray(rawReviews)) {
    return rawReviews.map(normalizeReview).filter(Boolean) as ProductReviewItem[];
  }

  return [];
}

function normalizeProduct(raw: unknown): DetailAnnouncementProduct | null {
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
    id: (item.id as string | number | undefined) ?? (item._id as string | number | undefined),
    name,
    slug: toStringSafe(item.slug) || undefined,
    href: buildHref(item),
    imageSrc: imageSrc || PLACEHOLDER_IMAGE,
    gallery: getGalleryFromRecord(item),
    brand: detectBrand(item, name),
    category: detectCategory(item),
    badge: toStringSafe(item.badge) || (Boolean(item.isNew) ? "Mới" : "Chính hãng"),
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
      (Number.isFinite(soldCount) && soldCount > 0 ? `${formatCompactCount(soldCount)} đã bán` : "10k+"),
    soldCount: Number.isFinite(soldCount) ? soldCount : undefined,
    isNew: Boolean(item.isNew),
    reviews: normalizedReviews,
  };
}

function extractProductFromResponse(data: unknown): DetailAnnouncementProduct | null {
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

function renderStars(rating?: number): string {
  if (!rating) return "";
  const rounded = Math.round(rating);
  return `${"★".repeat(Math.max(0, Math.min(5, rounded)))}${"☆".repeat(Math.max(0, 5 - rounded))}`;
}

function getSavings(product?: DetailAnnouncementProduct | null): number | undefined {
  if (!product) return undefined;
  if (typeof product.price !== "number" || typeof product.originalPrice !== "number") return undefined;
  if (product.originalPrice <= product.price) return undefined;
  return product.originalPrice - product.price;
}

function getImageAlt(
  product?: DetailAnnouncementProduct | null,
  kind: "hero" | "thumbnail" = "hero",
  index?: number,
): string {
  const productName = product?.name?.trim() || DEFAULT_PRODUCT_NAME;

  if (kind === "thumbnail" && typeof index === "number") {
    return `${productName} thumbnail ${index + 1}`;
  }

  return `${productName} product image`;
}

function buildProductJsonLd(product: DetailAnnouncementProduct) {
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
              product.stockText === "Hết hàng" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
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
  if (slugSegments.length === 0) return "";
  return slugSegments[slugSegments.length - 1] || "";
}

function buildApiUrl(apiBasePath: string, slugSegments: string[]): string {
  const base = normalizePath(apiBasePath, DEFAULT_API_BASE_PATH).replace(/\/+$/, "");
  if (slugSegments.length === 0) return base;
  return `${base}/${slugSegments.map(encodeURIComponent).join("/")}`;
}

function buildProductRequestCandidates(apiBasePath: string, slugSegments: string[]): string[] {
  const base = normalizePath(apiBasePath, DEFAULT_API_BASE_PATH).replace(/\/+$/, "");
  const encodedSegments = slugSegments.map(encodeURIComponent);
  const joinedPath = encodedSegments.join("/");
  const lastSegment = getLastSlugSegment(slugSegments);
  const encodedLast = encodeURIComponent(lastSegment);

  const candidates = new Set<string>();

  candidates.add(base);

  if (joinedPath) {
    candidates.add(`${base}/${joinedPath}`);
  }

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

function buildReviewsApiUrl(reviewApiPath: string, productId: string | number): string {
  const base = normalizePath(reviewApiPath, DEFAULT_REVIEW_API_PATH);
  const url = new URL(base, "http://localhost");
  url.searchParams.set("productId", String(productId));
  return `${url.pathname}${url.search}`;
}

function getRatingBreakdown(rating = 4.8) {
  const r = Math.max(1, Math.min(5, rating));

  const five = Math.max(40, Math.round(r * 18));
  const four = Math.max(10, 100 - five - 12);
  const three = 7;
  const two = 3;
  const one = 2;

  const total = five + four + three + two + one;

  return [
    { star: 5, percent: Math.round((five / total) * 100) },
    { star: 4, percent: Math.round((four / total) * 100) },
    { star: 3, percent: Math.round((three / total) * 100) },
    { star: 2, percent: Math.round((two / total) * 100) },
    { star: 1, percent: Math.round((one / total) * 100) },
  ];
}

function buildAddToOrderPayload(product: DetailAnnouncementProduct, qty: number) {
  const unitPrice = typeof product.price === "number" ? product.price : 0;
  const subtotal = unitPrice * qty;

  return {
    qty,
    source: "detail-announcement",
    productId: product.id ? String(product.id) : null,
    variantId: product.tag || null,
    item: {
      productId: product.id ? String(product.id) : null,
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
): Promise<DetailAnnouncementProduct | null> {
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal,
      });

      if (res.status === 404) {
        continue;
      }

      if (!res.ok) {
        console.warn("DetailAnnouncement fetch product failed:", res.status, url);
        continue;
      }

      const data = (await res.json()) as unknown;
      const normalized = extractProductFromResponse(data);

      if (normalized) {
        return normalized;
      }
    } catch (error) {
      if (signal.aborted) return null;
      console.warn("DetailAnnouncement fetch candidate error:", url, error);
    }
  }

  return null;
}

/* =========================
 * Component
 * ========================= */
export function DetailAnnouncement({
  title = DEFAULT_TITLE,
  primaryCtaText = DEFAULT_PRIMARY_CTA,
  secondaryCtaText = DEFAULT_SECONDARY_CTA,
  apiBasePath = DEFAULT_API_BASE_PATH,
  orderApiPath = DEFAULT_ORDER_API_PATH,
  reviewApiPath = DEFAULT_REVIEW_API_PATH,
  preview = false,
  product,
  fallbackBreadcrumbText = DEFAULT_FALLBACK_BREADCRUMB,
  sectionAriaLabel = DEFAULT_SECTION_ARIA_LABEL,
}: DetailAnnouncementProps) {
  const pathname = usePathname();
  const regionId = useId();

  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string>("");
  const [remoteProduct, setRemoteProduct] = useState<DetailAnnouncementProduct | null>(null);
  const [remoteReviews, setRemoteReviews] = useState<ProductReviewItem[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const slugSegments = useMemo(() => deriveSlugSegmentsFromPathname(pathname), [pathname]);
  const apiUrl = useMemo(() => buildApiUrl(apiBasePath, slugSegments), [apiBasePath, slugSegments]);
  const productRequestCandidates = useMemo(
    () => buildProductRequestCandidates(apiBasePath, slugSegments),
    [apiBasePath, slugSegments],
  );

  const normalizedPropProduct = useMemo(() => {
    return product ? normalizeProduct(product) : null;
  }, [product]);

  const currentProduct = normalizedPropProduct ?? remoteProduct;

  const gallery = useMemo(() => {
    if (!currentProduct) return [];
    const merged = [currentProduct.imageSrc, ...(currentProduct.gallery || [])].filter(Boolean);
    return Array.from(new Set(merged));
  }, [currentProduct]);

  const heroImage = gallery[selectedImage] || currentProduct?.imageSrc || PLACEHOLDER_IMAGE;

  const detailHref =
    currentProduct?.href || (slugSegments.length > 0 ? `/product-detail/${slugSegments.join("/")}` : "/product-detail");

  const sectionHeadingId = `${regionId}-detail-announcement-heading`;

  useEffect(() => {
    setSelectedImage(0);
  }, [currentProduct?.id, currentProduct?.imageSrc]);

  useEffect(() => {
    setOrderMessage("");
  }, [currentProduct?.id, quantity]);

  useEffect(() => {
    if (normalizedPropProduct) return;
    if (preview) return;

    const controller = new AbortController();

    async function fetchProduct() {
      try {
        setLoading(true);

        const normalized = await fetchProductByCandidates(productRequestCandidates, controller.signal);

        if (!controller.signal.aborted) {
          setRemoteProduct(normalized);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("DetailAnnouncement fetch error:", error);
        setRemoteProduct(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchProduct();

    return () => controller.abort();
  }, [apiUrl, normalizedPropProduct, preview, productRequestCandidates]);

  useEffect(() => {
    const productId = currentProduct?.id;

    if (!productId) {
      setRemoteReviews([]);
      return;
    }

    if (preview) {
      setRemoteReviews([]);
      return;
    }

    const controller = new AbortController();

    async function fetchReviews() {
      try {
        setReviewsLoading(true);

        const reviewUrl = buildReviewsApiUrl(reviewApiPath, productId as string | number);
        const res = await fetch(reviewUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (res.status === 404) {
          setRemoteReviews([]);
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch reviews: ${res.status}`);
        }

        const data = (await res.json()) as unknown;
        const source = typeof data === "object" && data !== null ? (data as UnknownRecord) : null;

        const rawList =
          (Array.isArray(source?.data) && source.data) ||
          (Array.isArray(source?.reviews) && source.reviews) ||
          (Array.isArray(source?.items) && source.items) ||
          [];

        const normalized = rawList.map(normalizeReview).filter(Boolean) as ProductReviewItem[];
        setRemoteReviews(normalized);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("DetailAnnouncement reviews fetch error:", error);
        setRemoteReviews([]);
      } finally {
        if (!controller.signal.aborted) {
          setReviewsLoading(false);
        }
      }
    }

    void fetchReviews();

    return () => controller.abort();
  }, [currentProduct?.id, preview, reviewApiPath]);

  const onPreviewClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!preview) return;

    const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    if (isModified) return;

    e.preventDefault();
    e.stopPropagation();
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
      setOrderMessage("Preview mode: chưa gọi API tạo order.");
      return;
    }

    try {
      setOrdering(true);
      setOrderMessage("");

      const payload = buildAddToOrderPayload(productToOrder, quantity);

      const res = await fetch(normalizePath(orderApiPath, DEFAULT_ORDER_API_PATH), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const raw = (await res.json().catch(() => null)) as UnknownRecord | null;

      if (!res.ok) {
        const message =
          toStringSafe(raw?.message) ||
          toStringSafe(raw?.error) ||
          "Không thể thêm sản phẩm vào order.";
        throw new Error(message);
      }

      setOrderMessage(toStringSafe(raw?.message) || "Đã thêm sản phẩm vào order.");
    } catch (error) {
      console.error("Add to order error:", error);
      setOrderMessage(error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm vào order.");
    } finally {
      setOrdering(false);
    }
  };

  const savings = getSavings(currentProduct);

  const reviews = useMemo(() => {
    if (remoteReviews.length > 0) return remoteReviews;
    if ((currentProduct?.reviews || []).length > 0) return currentProduct?.reviews || [];
    return [];
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

  const ratingBreakdown = getRatingBreakdown(averageRating);

  if (loading && !currentProduct) {
    return (
      <section className={cls.section} aria-label={sectionAriaLabel} aria-labelledby={sectionHeadingId}>
        <div className={cls.shell}>
          <header className={cls.header}>
            <nav className={cls.breadcrumbs} aria-label="Breadcrumb">
              <Link href={"/" as Route} className={cls.breadcrumbLink}>
                Home
              </Link>
              <span className={cls.breadcrumbDivider}>/</span>
              <span className={cls.breadcrumbCurrent}>{fallbackBreadcrumbText}</span>
            </nav>
          </header>
          <div className={cls.emptyState}>Đang tải chi tiết sản phẩm...</div>
        </div>
      </section>
    );
  }

  if (!currentProduct) {
    return (
      <section className={cls.section} aria-label={sectionAriaLabel} aria-labelledby={sectionHeadingId}>
        <div className={cls.shell}>
          <header className={cls.header}>
            <nav className={cls.breadcrumbs} aria-label="Breadcrumb">
              <Link href={"/" as Route} className={cls.breadcrumbLink}>
                Home
              </Link>
              <span className={cls.breadcrumbDivider}>/</span>
              <span className={cls.breadcrumbCurrent}>{fallbackBreadcrumbText}</span>
            </nav>
          </header>
          <div className={cls.emptyState}>Không có dữ liệu sản phẩm.</div>
        </div>
      </section>
    );
  }

  return (
    <section className={cls.section} aria-label={sectionAriaLabel} aria-labelledby={sectionHeadingId}>
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

      <div className={cls.shell}>
        <header className={cls.header}>
          <nav className={cls.breadcrumbs} aria-label="Breadcrumb">
            <Link href={"/" as Route} className={cls.breadcrumbLink}>
              Home
            </Link>
            <span className={cls.breadcrumbDivider}>/</span>
            <Link href={"/product-detail" as Route} className={cls.breadcrumbLink}>
              {fallbackBreadcrumbText}
            </Link>
            {currentProduct.name ? (
              <>
                <span className={cls.breadcrumbDivider}>/</span>
                <span className={cls.breadcrumbCurrent}>{currentProduct.name}</span>
              </>
            ) : null}
          </nav>
        </header>

        <div className={cls.mainGrid}>
          <article className={cls.galleryCol} aria-label="Product gallery">
            <div className={cls.galleryPanel}>
              <div className={cls.galleryTop}>
                <div className={cls.productFlags}>
                  {currentProduct.badge ? <span className={cls.flagNeutral}>{currentProduct.badge}</span> : null}
                  {currentProduct.discountPercent ? (
                    <span className={cls.flagAccent}>-{currentProduct.discountPercent}%</span>
                  ) : null}
                </div>

                <div className={cls.metaInline}>
                  {typeof averageRating === "number" ? (
                    <span className={cls.metaInlineItem}>
                      {averageRating.toFixed(1)} <em>{renderStars(averageRating)}</em>
                    </span>
                  ) : null}
                  <span className={cls.metaInlineItem}>{formatCompactCount(visibleReviewCount)} đánh giá</span>
                  <span className={cls.metaInlineItem}>{currentProduct.soldText || "10k+ đã bán"}</span>
                </div>
              </div>

              <div className={cls.heroFrame}>
                <Image
                  src={heroImage}
                  alt={getImageAlt(currentProduct, "hero")}
                  fill
                  priority
                  className={cls.heroImage}
                  sizes="(max-width: 991px) 100vw, 680px"
                />
              </div>

              {gallery.length > 1 ? (
                <div className={cls.thumbRail} role="list" aria-label="Product image thumbnails">
                  {gallery.slice(0, 6).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`${cls.thumbButton} ${selectedImage === index ? cls.thumbButtonActive : ""}`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Preview image ${index + 1} for ${currentProduct.name}`}
                      aria-pressed={selectedImage === index}
                    >
                      <span className={cls.thumbMedia}>
                        <Image
                          src={image}
                          alt={getImageAlt(currentProduct, "thumbnail", index)}
                          fill
                          className={cls.thumbImage}
                          sizes="88px"
                        />
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className={cls.trustBar}>
                <div className={cls.trustItem}>
                  <span className={cls.trustDot}>✓</span>
                  <span>Kiểm tra trước khi nhận</span>
                </div>
                <div className={cls.trustItem}>
                  <span className={cls.trustDot}>⚡</span>
                  <span>Giao nhanh toàn quốc</span>
                </div>
                <div className={cls.trustItem}>
                  <span className={cls.trustDot}>↺</span>
                  <span>Hỗ trợ đổi trả</span>
                </div>
              </div>
            </div>
          </article>

          <article className={cls.infoCol}>
            <div className={cls.infoPanel}>
              <div className={cls.titleBlock}>
                <div className={cls.categoryRow}>
                  <span className={cls.categoryTag}>{currentProduct.category || "Điện thoại & Phụ kiện"}</span>
                  {currentProduct.stockText ? <span className={cls.stockTag}>{currentProduct.stockText}</span> : null}
                </div>

                <h3 className={cls.productName}>{currentProduct.name}</h3>

                <p className={cls.shortDesc}>
                  {currentProduct.shortDescription ||
                    "Thiết kế nhỏ gọn, dễ sử dụng, tập trung vào nhu cầu mua hàng thực tế và trải nghiệm quét thông tin nhanh."}
                </p>
              </div>

              <div className={cls.priceBox}>
                <div className={cls.priceRow}>
                  {typeof currentProduct.price === "number" ? (
                    <span className={cls.currentPrice}>{formatPrice(currentProduct.price)}</span>
                  ) : null}

                  {(typeof currentProduct.originalPrice === "number" &&
                    currentProduct.originalPrice > (currentProduct.price || 0)) ||
                  (typeof currentProduct.marketPrice === "number" &&
                    currentProduct.marketPrice > (currentProduct.price || 0)) ? (
                    <span className={cls.originalPrice}>
                      {formatPrice(currentProduct.marketPrice ?? currentProduct.originalPrice)}
                    </span>
                  ) : null}
                </div>

                <div className={cls.priceSupport}>
                  {savings || currentProduct.savingPrice ? (
                    <span className={cls.savingsChip}>
                      Tiết kiệm {formatPrice(currentProduct.savingPrice ?? savings)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className={cls.infoList}>
                <div className={cls.infoRow}>
                  <span className={cls.infoLabel}>Ưu đãi</span>
                  <div className={cls.infoValue}>
                    <div className={cls.promoWrap}>
                      <span className={cls.promoChip}>Giảm 20%</span>
                      <span className={cls.promoChip}>Giảm 5k</span>
                      <span className={cls.promoChip}>Voucher shop</span>
                      <span className={cls.promoChip}>Freeship</span>
                    </div>
                  </div>
                </div>

                <div className={cls.infoRow}>
                  <span className={cls.infoLabel}>Mã sản phẩm</span>
                  <div className={cls.infoValueStack}>
                    <strong>{currentProduct.sku || currentProduct.tag || "Đang cập nhật"}</strong>
                    <span>{currentProduct.brand || "Shop chính hãng"}</span>
                  </div>
                </div>
              </div>

              <div className={cls.buyBox}>
                <div className={cls.buyLeft}>
                  <span className={cls.buyLabel}>Số lượng</span>

                  <div className={cls.quantityControl}>
                    <button
                      type="button"
                      className={cls.quantityButton}
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span className={cls.quantityValue}>{quantity}</span>
                    <button
                      type="button"
                      className={cls.quantityButton}
                      onClick={() => setQuantity((prev) => prev + 1)}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={cls.buyRight}>
                  <span className={cls.buyLabel}>Tạm tính</span>
                  <strong className={cls.totalPrice}>
                    {typeof currentProduct.price === "number" ? formatPrice(currentProduct.price * quantity) : "Liên hệ"}
                  </strong>
                </div>
              </div>

              <div className={cls.ctaRow}>
                <button
                  type="button"
                  className={cls.secondaryButton}
                  onClick={handleAddToOrder}
                  disabled={ordering}
                  aria-label={`Thêm ${currentProduct.name} vào order`}
                >
                  <span className={cls.buttonIcon}>{ordering ? "…" : "🛒"}</span>
                  <span>{ordering ? "Đang thêm..." : secondaryCtaText}</span>
                </button>

                {renderLink(
                  detailHref,
                  cls.primaryButton,
                  <>
                    <span>{primaryCtaText}</span>
                    {typeof currentProduct.price === "number" ? <strong>{formatPrice(currentProduct.price)}</strong> : null}
                  </>,
                )}
              </div>

              {orderMessage ? (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {orderMessage}
                </div>
              ) : null}
            </div>

            <div className={cls.shopPanel}>
              <div className={cls.shopHeader}>
                <div className={cls.shopIdentity}>
                  <div className={cls.shopAvatar}>{(currentProduct.brand || "S").slice(0, 1).toUpperCase()}</div>

                  <div className={cls.shopMeta}>
                    <strong>{currentProduct.brand || "Shop chính hãng"}</strong>
                    <span>Online vài phút trước</span>
                  </div>
                </div>

                <div className={cls.shopActions}>
                  <button type="button" className={cls.chatButton}>
                    Chat ngay
                  </button>
                  <button type="button" className={cls.viewShopButton}>
                    Xem shop
                  </button>
                </div>
              </div>

              <div className={cls.shopStats}>
                <div className={cls.shopStat}>
                  <span>Đánh giá</span>
                  <strong>{formatCompactCount(visibleReviewCount)}</strong>
                </div>

                <div className={cls.shopStat}>
                  <span>Tỷ lệ phản hồi</span>
                  <strong>93%</strong>
                </div>

                <div className={cls.shopStat}>
                  <span>Tham gia</span>
                  <strong>6 năm</strong>
                </div>

                <div className={cls.shopStat}>
                  <span>Sản phẩm</span>
                  <strong>{currentProduct.stockCount ? formatCompactCount(currentProduct.stockCount) : "864"}</strong>
                </div>

                <div className={cls.shopStat}>
                  <span>Người theo dõi</span>
                  <strong>{currentProduct.soldCount ? formatCompactCount(currentProduct.soldCount) : "16.3k"}</strong>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className={cls.bottomGrid}>
          <section className={cls.contentPanel}>
            <div className={cls.panelHeader}>
              <span className={cls.panelKicker}>Thông tin</span>
              <h4 className={cls.panelTitle}>Chi tiết sản phẩm</h4>
            </div>

            <div className={cls.specTable}>
              <div className={cls.specRow}>
                <div className={cls.specLabel}>Danh mục</div>
                <div className={cls.specValue}>{currentProduct.category || "Điện thoại & Phụ kiện"}</div>
              </div>

              <div className={cls.specRow}>
                <div className={cls.specLabel}>Kho hàng</div>
                <div className={cls.specValue}>{currentProduct.stockText || "Còn hàng"}</div>
              </div>

              <div className={cls.specRow}>
                <div className={cls.specLabel}>Thương hiệu</div>
                <div className={cls.specValue}>{currentProduct.brand || "No brand"}</div>
              </div>

              <div className={cls.specRow}>
                <div className={cls.specLabel}>Mã sản phẩm</div>
                <div className={cls.specValue}>{currentProduct.sku || currentProduct.tag || "Đang cập nhật"}</div>
              </div>
            </div>
          </section>

          <section className={cls.contentPanel}>
            <div className={cls.panelHeader}>
              <span className={cls.panelKicker}>Mô tả</span>
              <h4 className={cls.panelTitle}>Nội dung sản phẩm</h4>
            </div>

            <div className={cls.descriptionBlock}>
              <p>
                {currentProduct.shortDescription ||
                  "Sản phẩm được trình bày lại theo hướng ưu tiên độ tin cậy, thông tin cô đọng và khả năng quét nhanh trên cả desktop lẫn mobile."}
              </p>
              <p>
                {currentProduct.description ||
                  "Thiết kế mới loại bỏ cảm giác landing page dư thừa, thay bằng hệ khối rõ ràng, logic mua hàng mạch lạc và visual hierarchy chuẩn ecommerce production. Giá, trạng thái hàng, ưu đãi và CTA là các điểm nhìn chính; phần shop, chi tiết kỹ thuật và mô tả được đẩy xuống dưới theo hành vi đọc tự nhiên."}
              </p>
            </div>
          </section>
        </div>

        <section className={cls.reviewSection} aria-label="Đánh giá sản phẩm">
          <div className={cls.reviewHeader}>
            <div className={cls.reviewHeaderLeft}>
              <span className={cls.panelKicker}>Đánh giá</span>
              <h4 className={cls.panelTitle}>Khách hàng nói gì về sản phẩm</h4>
            </div>
          </div>

          <div className={cls.reviewGrid}>
            <div className={cls.reviewSummaryCard}>
              <div className={cls.reviewScoreTop}>
                <div className={cls.reviewScoreMain}>
                  <strong>{averageRating.toFixed(1)}</strong>
                  <span>{renderStars(averageRating)}</span>
                </div>

                <div className={cls.reviewScoreMeta}>
                  <span>{formatCompactCount(visibleReviewCount)} đánh giá</span>
                  <span>{currentProduct.soldText || "10k+ đã bán"}</span>
                </div>
              </div>

              <div className={cls.reviewBars}>
                {ratingBreakdown.map((item) => (
                  <div className={cls.reviewBarRow} key={item.star}>
                    <span className={cls.reviewBarLabel}>{item.star} sao</span>
                    <div className={cls.reviewBarTrack}>
                      <div className={cls.reviewBarFill} style={{ width: `${item.percent}%` }} />
                    </div>
                    <span className={cls.reviewBarPercent}>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={cls.reviewListCard}>
              <div className={cls.reviewList}>
                {reviewsLoading ? (
                  <div className={cls.emptyState}>Đang tải đánh giá...</div>
                ) : reviews.length === 0 ? (
                  <div className={cls.emptyState}>Chưa có đánh giá nào.</div>
                ) : (
                  reviews.slice(0, 4).map((review, index) => (
                    <article
                      key={String(review.id ?? index)}
                      className={cls.reviewItem}
                      aria-label={`Đánh giá của ${review.author || "Khách hàng"}`}
                    >
                      <div className={cls.reviewAvatarWrap}>
                        {review.avatar ? (
                          <Image
                            src={review.avatar}
                            alt={review.author || "Khách hàng"}
                            fill
                            className={cls.reviewAvatarImage}
                            sizes="52px"
                          />
                        ) : (
                          <span className={cls.reviewAvatarFallback}>{getInitials(review.author)}</span>
                        )}
                      </div>

                      <div className={cls.reviewBody}>
                        <div className={cls.reviewTopRow}>
                          <div className={cls.reviewAuthorBlock}>
                            <strong>{review.author || "Khách hàng"}</strong>
                            <div className={cls.reviewMetaLine}>
                              <span>{renderStars(review.rating ?? 5)}</span>
                              <span>{formatDate(review.createdAt)}</span>
                              {review.verified ? <span className={cls.verifiedBadge}>Đã mua hàng</span> : null}
                            </div>
                          </div>
                        </div>

                        {review.title ? <h5 className={cls.reviewTitle}>{review.title}</h5> : null}

                        <p className={cls.reviewContent}>
                          {review.content || "Sản phẩm đúng mô tả, trải nghiệm sử dụng tốt."}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

/* =========================
 * RegItem
 * ========================= */
export const SHOP_DETAIL_ANNOUNCEMENT: RegItem = {
  kind: "DetailAnnouncement",
  label: "Detail Announcement",
  defaults: {
    title: DEFAULT_TITLE,
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
    const parsedProduct = safeJson<DetailAnnouncementProduct>(p.product);
    const productOverride = parsedProduct ? normalizeProduct(parsedProduct) || undefined : undefined;

    return (
      <div className="sectionContainer" aria-label="Shop Detail Announcement">
        <DetailAnnouncement
          title={String(p.title || DEFAULT_TITLE)}
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

export default DetailAnnouncement;
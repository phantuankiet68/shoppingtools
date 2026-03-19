"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "./SectionTicker.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SectionTickerFilterItem = {
  label: string;
  value: string;
  active?: boolean;
};

export type SectionTickerBanner = {
  title: string;
  imageSrc: string;
  href?: string;
  alt?: string;
  eyebrow?: string;
  description?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
};

export type SectionTickerProductItem = {
  brand?: string;
  title: string;
  imageSrc: string;
  href?: string;
  soldLabel?: string;
  soldValue?: number;
  soldMax?: number;
  price: string;
  oldPrice?: string;
  ctaLabel?: string;
  badge?: string;
  outOfStock?: boolean;
  rating?: number;
  reviewCount?: number;
  tag?: string;
};

export type SectionTickerProps = {
  title?: string;
  filters?: SectionTickerFilterItem[];
  banner?: SectionTickerBanner;
  products?: SectionTickerProductItem[];
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_FILTERS: SectionTickerFilterItem[] = [
  { label: "Tất Cả", value: "all", active: true },
  { label: "Flash Sale", value: "flash-sale" },
  { label: "Bán Chạy", value: "best-seller" },
  { label: "Mới Lên Kệ", value: "new-arrival" },
];

const DEFAULT_BANNER: SectionTickerBanner = {
  title: "Deal hot mỗi ngày",
  eyebrow: "TICKER SALE",
  description:
    "Không gian bán hàng hiện đại, nhấn mạnh deal nổi bật, cảm giác cao cấp hơn và tối ưu chuyển đổi cho website thương mại điện tử.",
  imageSrc: "/images/sections/announcement/skin-bright-banner.jpg",
  href: "/collections/deal-hot-moi-ngay",
  alt: "Deal hot mỗi ngày",
  primaryCtaLabel: "Khám phá ngay",
  secondaryCtaLabel: "Xem ưu đãi",
};

const DEFAULT_PRODUCTS: SectionTickerProductItem[] = [
  {
    brand: "HƯƠNG THỊ",
    title: "Bộ chăm sóc da mặt ngọc trai trắng sáng Pearl Shine",
    imageSrc: "/images/sections/announcement/product-1.jpg",
    href: "/products/bo-cham-soc-da-mat-ngoc-trai-trang-sang",
    soldLabel: "Đã bán",
    soldValue: 9543,
    soldMax: 12000,
    price: "1.300.000₫",
    oldPrice: "1.550.000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "Hot",
    rating: 4.9,
    reviewCount: 218,
    tag: "flash-sale",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Bộ serum Rejuvenating phục hồi và cấp ẩm chuyên sâu",
    imageSrc: "/images/sections/announcement/product-2.jpg",
    href: "/products/bo-serum-rejuvenating",
    soldLabel: "Đã bán",
    soldValue: 7354,
    soldMax: 12000,
    price: "580.000₫",
    oldPrice: "720.000₫",
    ctaLabel: "Hết hàng",
    badge: "Hết hàng",
    outOfStock: true,
    rating: 4.8,
    reviewCount: 143,
    tag: "best-seller",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Chống nắng trang điểm Sunscreen Foundation",
    imageSrc: "/images/sections/announcement/product-3.jpg",
    href: "/products/chong-nang-trang-diem",
    soldLabel: "Đã bán",
    soldValue: 7543,
    soldMax: 12000,
    price: "660.000₫",
    oldPrice: "790.000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "Bán chạy",
    rating: 4.9,
    reviewCount: 264,
    tag: "best-seller",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Mặt nạ gel trắng da cấp ẩm Peeling Cel Mask",
    imageSrc: "/images/sections/announcement/product-4.jpg",
    href: "/products/mat-na-gel-trang-da-cap-am",
    soldLabel: "Đã bán",
    soldValue: 6343,
    soldMax: 12000,
    price: "280.000₫",
    oldPrice: "350.000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "Ưu đãi",
    rating: 4.7,
    reviewCount: 97,
    tag: "flash-sale",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Nám tàn nhang chuyên sâu Melasma Advanced",
    imageSrc: "/images/sections/announcement/product-5.jpg",
    href: "/products/nam-tan-nhang-chuyen-sau",
    soldLabel: "Đã bán",
    soldValue: 5643,
    soldMax: 12000,
    price: "1.200.000₫",
    oldPrice: "1.600.000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "-25%",
    rating: 4.9,
    reviewCount: 186,
    tag: "flash-sale",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Sữa rửa mặt Pearl Shine 24K Gold",
    imageSrc: "/images/sections/announcement/product-6.jpg",
    href: "/products/sua-rua-mat-pearl-shine-24k-gold",
    soldLabel: "Đã bán",
    soldValue: 5864,
    soldMax: 12000,
    price: "490.000₫",
    oldPrice: "610.000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "Mới",
    rating: 4.8,
    reviewCount: 122,
    tag: "new-arrival",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Tinh chất ngọc trai trắng sáng cho da mặt",
    imageSrc: "/images/sections/announcement/product-7.jpg",
    href: "/products/tinh-chat-cham-soc-da-mat-ngoc-trai-trang-sang",
    soldLabel: "Đã bán",
    soldValue: 4543,
    soldMax: 12000,
    price: "850.000₫",
    oldPrice: "990.000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "Premium",
    rating: 4.9,
    reviewCount: 88,
    tag: "new-arrival",
  },
];

/* ================= JSON Helpers ================= */
function safeJson<T>(raw?: unknown): T | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/* ================= Helpers ================= */
function getProgressWidth(value?: number, max?: number) {
  if (!value || !max || max <= 0) return "0%";
  const percent = Math.max(6, Math.min(100, Math.round((value / max) * 100)));
  return `${percent}%`;
}

function formatCompactNumber(value?: number) {
  if (!value) return "0";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function renderStars(rating?: number) {
  if (!rating) return "★★★★★";
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function getFilteredProducts(products: SectionTickerProductItem[], active: string) {
  if (!active || active === "all") return products;
  return products.filter((item) => item.tag === active);
}

/* ================= Component ================= */
export function SectionTicker({
  title = "Nhịp ưu đãi nổi bật cho gian hàng hiện đại",
  filters,
  banner,
  products,
  preview = false,
}: SectionTickerProps) {
  const filterItems = useMemo(() => filters ?? DEFAULT_FILTERS, [filters]);
  const bannerData = useMemo(() => banner ?? DEFAULT_BANNER, [banner]);
  const productItems = useMemo(() => products ?? DEFAULT_PRODUCTS, [products]);

  const initialFilter = filterItems.find((item) => item.active)?.value ?? filterItems[0]?.value ?? "all";

  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const onPreviewBlock = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFilter = (value: string, e: React.SyntheticEvent) => {
    if (preview) {
      onPreviewBlock(e);
      return;
    }
    setActiveFilter(value);
  };

  const visibleProducts = useMemo(() => getFilteredProducts(productItems, activeFilter), [productItems, activeFilter]);

  const tickerPills = useMemo(() => {
    const source = visibleProducts.length ? visibleProducts : productItems;
    return source.slice(0, 8).map((item, index) => ({
      key: `${item.title}-${index}`,
      label: `${item.badge || "Deal"} · ${item.title}`,
    }));
  }, [visibleProducts, productItems]);

  const renderBanner = () => {
    const content = (
      <div className={cls.bannerCard}>
        <div className={cls.bannerGlow} />

        <div className={cls.bannerTop}>
          <span className={cls.bannerEyebrow}>
            <span className={cls.liveDot} />
            {bannerData.eyebrow || "TICKER SALE"}
          </span>
        </div>

        <div className={cls.bannerContent}>
          <div className={cls.bannerText}>
            <h3 className={cls.bannerTitle}>{bannerData.title}</h3>
            {bannerData.description ? <p className={cls.bannerDesc}>{bannerData.description}</p> : null}

            <div className={cls.bannerActions}>
              <span className={cls.primaryAction}>{bannerData.primaryCtaLabel || "Mua ngay"}</span>
              <span className={cls.secondaryAction}>{bannerData.secondaryCtaLabel || "Xem thêm"}</span>
            </div>
          </div>

          <div className={cls.bannerMedia}>
            <Image
              src={bannerData.imageSrc}
              alt={bannerData.alt || bannerData.title}
              fill
              className={cls.bannerImage}
              sizes="(max-width: 991px) 100vw, 460px"
            />
          </div>
        </div>

        <div className={cls.bannerFooter}>
          <span className={cls.bannerMetric}>+24 deal mới trong hôm nay</span>
          <span className={cls.bannerMetric}>Giao diện chuẩn bán hàng hiện đại</span>
        </div>
      </div>
    );

    if (preview) {
      return (
        <a href="#" className={cls.bannerLink} onClick={onPreviewBlock}>
          {content}
        </a>
      );
    }

    return (
      <Link href={(bannerData.href || "/") as Route} className={cls.bannerLink}>
        {content}
      </Link>
    );
  };

  const renderProductCard = (item: SectionTickerProductItem, index: number) => {
    const cardContent = (
      <>
        <div className={cls.cardMediaWrap}>
          {item.badge ? (
            <span className={`${cls.cardBadge} ${item.outOfStock ? cls.cardBadgeMuted : cls.cardBadgeHot}`}>
              {item.badge}
            </span>
          ) : null}

          <div className={cls.cardMedia}>
            <Image
              src={item.imageSrc}
              alt={item.title}
              fill
              className={cls.cardImage}
              sizes="(max-width: 991px) 50vw, 280px"
            />
          </div>
        </div>

        <div className={cls.cardBody}>
          <div className={cls.cardMeta}>
            <span className={cls.brand}>{item.brand || "Thương hiệu"}</span>

            <div className={cls.ratingRow} aria-label={`Đánh giá ${item.rating || 5} trên 5`}>
              <span className={cls.stars}>{renderStars(item.rating)}</span>
              <span className={cls.reviewCount}>({formatCompactNumber(item.reviewCount)})</span>
            </div>
          </div>

          <h3 className={cls.productTitle}>{item.title}</h3>

          <div className={cls.progressMeta}>
            <div className={cls.soldRow}>
              <span className={cls.soldLabel}>{item.soldLabel || "Đã bán"}</span>
              <span className={cls.soldValue}>{formatCompactNumber(item.soldValue)}</span>
            </div>

            <div className={cls.progress}>
              <span
                className={`${cls.progressBar} ${item.outOfStock ? cls.progressBarMuted : ""}`}
                style={{ width: getProgressWidth(item.soldValue, item.soldMax) }}
              />
            </div>
          </div>

          <div className={cls.priceRow}>
            <div className={cls.priceStack}>
              <span className={cls.price}>{item.price}</span>
              {item.oldPrice ? <span className={cls.oldPrice}>{item.oldPrice}</span> : null}
            </div>

            <button
              type="button"
              className={`${cls.cartBtn} ${item.outOfStock ? cls.cartBtnDisabled : ""}`}
              onClick={preview ? onPreviewBlock : undefined}
              aria-label={item.ctaLabel || "Thêm vào giỏ"}
              disabled={item.outOfStock}
            >
              <span className={cls.cartBtnText}>{item.ctaLabel || "Thêm vào giỏ"}</span>
              <span className={cls.cartIcon} aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="20" r="1.5" />
                  <circle cx="18" cy="20" r="1.5" />
                  <path d="M3 4h2l2.3 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2" />
                  <path d="M12 9v5" />
                  <path d="M9.5 11.5h5" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </>
    );

    if (preview) {
      return (
        <a key={index} href="#" className={cls.productCard} onClick={onPreviewBlock}>
          {cardContent}
        </a>
      );
    }

    return (
      <Link key={index} href={(item.href || "/") as Route} className={cls.productCard}>
        {cardContent}
      </Link>
    );
  };

  return (
    <section className={cls.section} aria-label={title}>
      <div className={cls.shell}>
        <div className={cls.topbar}>
          <div className={cls.headingWrap}>
            <span className={cls.kicker}>Section Ticker</span>
            <h2 className={cls.title}>{title}</h2>
          </div>

          <div className={cls.filterGroup} role="tablist" aria-label="Ticker filters">
            {filterItems.map((item, index) => {
              const active = item.value === activeFilter;

              return (
                <button
                  key={index}
                  type="button"
                  className={`${cls.filterBtn} ${active ? cls.filterBtnActive : ""}`}
                  aria-pressed={active}
                  onClick={(e) => handleFilter(item.value, e)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={cls.tickerBar} aria-label="Thông báo deal nổi bật">
          <div className={cls.tickerTrack}>
            {[...tickerPills, ...tickerPills].map((item, index) => (
              <span key={`${item.key}-${index}`} className={cls.tickerItem}>
                <span className={cls.tickerDot} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className={cls.layout}>
          <div className={cls.bannerCol}>{renderBanner()}</div>

          <div className={cls.productsCol}>
            <div className={cls.productsHeader}>
              <div>
                <h3 className={cls.productsTitle}>Sản phẩm nổi bật</h3>
                <p className={cls.productsDesc}>
                  Phong cách mới tập trung vào chuyển đổi, thẻ sản phẩm sáng rõ, cao cấp hơn và phù hợp website bán hàng
                  hiện đại.
                </p>
              </div>

              <span className={cls.countBadge}>{visibleProducts.length} sản phẩm</span>
            </div>

            <div className={cls.productsGrid}>
              {visibleProducts.map((item, index) => renderProductCard(item, index))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_SECTION_TICKER: RegItem = {
  kind: "SectionTicker",
  label: "Section Ticker",
  defaults: {
    title: "Nhịp ưu đãi nổi bật cho gian hàng hiện đại",
    filters: JSON.stringify(DEFAULT_FILTERS, null, 2),
    banner: JSON.stringify(DEFAULT_BANNER, null, 2),
    products: JSON.stringify(DEFAULT_PRODUCTS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "filters", label: "Filters (JSON)", kind: "textarea", rows: 8 },
    { key: "banner", label: "Banner (JSON)", kind: "textarea", rows: 10 },
    { key: "products", label: "Products (JSON)", kind: "textarea", rows: 22 },
  ],
  render: (p) => {
    const filters = safeJson<SectionTickerFilterItem[]>(p.filters);
    const banner = safeJson<SectionTickerBanner>(p.banner);
    const products = safeJson<SectionTickerProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Ticker">
        <SectionTicker
          title={String(p.title || "Nhịp ưu đãi nổi bật cho gian hàng hiện đại")}
          filters={filters}
          banner={banner}
          products={products}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionTicker;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Section/SectionMinimal.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SectionMinimalFilterItem = {
  label: string;
  value: string;
  active?: boolean;
};

export type SectionMinimalBanner = {
  title: string;
  imageSrc: string;
  href?: string;
  alt?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
};

export type SectionMinimalProductItem = {
  brand: string;
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
};

export type SectionMinimalProps = {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  filters?: SectionMinimalFilterItem[];
  banner?: SectionMinimalBanner;
  products?: SectionMinimalProductItem[];
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_FILTERS: SectionMinimalFilterItem[] = [
  { label: "Tất cả", value: "all", active: true },
  { label: "Dưỡng sáng", value: "brightening" },
  { label: "Chăm da", value: "skin-care" },
  { label: "Chống nắng", value: "sun-care" },
];

const DEFAULT_BANNER: SectionMinimalBanner = {
  eyebrow: "Minimal collection",
  title: "Chăm Da Trắng Sáng",
  subtitle: "Thiết kế tối giản nhưng cao cấp, giúp sản phẩm nổi bật hơn và phù hợp trải nghiệm mua sắm hiện đại.",
  imageSrc: "/images/sections/announcement/skin-bright-banner.jpg",
  href: "/collections/cham-da-trang-sang",
  alt: "Chăm da trắng sáng",
  ctaLabel: "Khám phá bộ sưu tập",
};

const DEFAULT_PRODUCTS: SectionMinimalProductItem[] = [
  {
    brand: "HƯƠNG THỊ",
    title: "Bộ chăm sóc da mặt ngọc trai trắng sáng (Pearl Shine)",
    imageSrc: "/images/sections/announcement/product-1.jpg",
    href: "/products/bo-cham-soc-da-mat-ngoc-trai-trang-sang",
    soldLabel: "Đã bán",
    soldValue: 9543,
    soldMax: 12000,
    price: "1,300,000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "Best Seller",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Bộ serum (Rejuvenating serum)",
    imageSrc: "/images/sections/announcement/product-2.jpg",
    href: "/products/bo-serum-rejuvenating",
    soldLabel: "Đã bán",
    soldValue: 7354,
    soldMax: 12000,
    price: "580,000₫",
    ctaLabel: "Hết hàng",
    badge: "Hết hàng",
    outOfStock: true,
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Chống nắng trang điểm (Sunscreen Foundation)",
    imageSrc: "/images/sections/announcement/product-3.jpg",
    href: "/products/chong-nang-trang-diem",
    soldLabel: "Đã bán",
    soldValue: 7543,
    soldMax: 12000,
    price: "660,000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "Hot",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Mặt nạ gel trắng da cấp ẩm (Peeling cel mask)",
    imageSrc: "/images/sections/announcement/product-4.jpg",
    href: "/products/mat-na-gel-trang-da-cap-am",
    soldLabel: "Đã bán",
    soldValue: 6343,
    soldMax: 12000,
    price: "280,000₫",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Nám Tàn Nhang chuyên sâu (Melasma advanced...)",
    imageSrc: "/images/sections/announcement/product-5.jpg",
    href: "/products/nam-tan-nhang-chuyen-sau",
    soldLabel: "Đã bán",
    soldValue: 5643,
    soldMax: 12000,
    price: "1,200,000₫",
    oldPrice: "1,600,000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "-25%",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Sữa rửa mặt (Pearl shine 24k gold)",
    imageSrc: "/images/sections/announcement/product-6.jpg",
    href: "/products/sua-rua-mat-pearl-shine-24k-gold",
    soldLabel: "Đã bán",
    soldValue: 5864,
    soldMax: 12000,
    price: "490,000₫",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Tinh chất chăm sóc da mặt ngọc trai trắng sáng",
    imageSrc: "/images/sections/announcement/product-7.jpg",
    href: "/products/tinh-chat-cham-soc-da-mat-ngoc-trai-trang-sang",
    soldLabel: "Đã bán",
    soldValue: 4543,
    soldMax: 12000,
    price: "850,000₫",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "HƯƠNG THỊ",
    title: "Kem dưỡng phục hồi sáng da chuyên sâu",
    imageSrc: "/images/sections/announcement/product-1.jpg",
    href: "/products/kem-duong-phuc-hoi-sang-da",
    soldLabel: "Đã bán",
    soldValue: 3982,
    soldMax: 12000,
    price: "720,000₫",
    ctaLabel: "Thêm vào giỏ",
    badge: "Mới",
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
  const percent = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return `${percent}%`;
}

function getDiscountPercent(price?: string, oldPrice?: string) {
  if (!price || !oldPrice) return undefined;

  const normalizePrice = (input: string) => Number(input.replace(/[^\d]/g, ""));
  const current = normalizePrice(price);
  const previous = normalizePrice(oldPrice);

  if (!current || !previous || previous <= current) return undefined;
  return Math.round(((previous - current) / previous) * 100);
}

/* ================= Component ================= */
export function SectionMinimal({
  title = "Sản phẩm nổi bật",
  subtitle = "Thiết kế tối giản giúp làm nổi bật sản phẩm, hình ảnh và giá trị thương hiệu trong không gian mua sắm hiện đại.",
  actionLabel = "Xem tất cả",
  actionHref = "/collections/all",
  filters,
  banner,
  products,
  preview = false,
}: SectionMinimalProps) {
  const filterItems = useMemo(() => filters ?? DEFAULT_FILTERS, [filters]);
  const bannerData = useMemo(() => banner ?? DEFAULT_BANNER, [banner]);
  const productItems = useMemo(() => products ?? DEFAULT_PRODUCTS, [products]);

  const initialFilter = filterItems.find((item) => item.active)?.value ?? filterItems[0]?.value ?? "all";

  const [activeFilter, setActiveFilter] = useState(initialFilter);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

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

  const renderAction = () => {
    if (preview) {
      return (
        <a href="#" className={cls.actionLink} onClick={onPreviewBlock}>
          {actionLabel}
        </a>
      );
    }

    return (
      <Link href={(actionHref || "/") as Route} className={cls.actionLink}>
        {actionLabel}
      </Link>
    );
  };

  const renderBanner = () => {
    const content = (
      <div className={cls.bannerCard}>
        <div className={cls.bannerMedia}>
          <Image
            src={bannerData.imageSrc}
            alt={bannerData.alt || bannerData.title}
            fill
            className={cls.bannerImage}
            sizes="(max-width: 991px) 100vw, 520px"
          />
        </div>

        <div className={cls.bannerContent}>
          {bannerData.eyebrow ? <span className={cls.bannerEyebrow}>{bannerData.eyebrow}</span> : null}

          <h3 className={cls.bannerTitle}>{bannerData.title}</h3>

          {bannerData.subtitle ? <p className={cls.bannerSubtitle}>{bannerData.subtitle}</p> : null}

          <span className={cls.bannerCta}>{bannerData.ctaLabel || "Khám phá bộ sưu tập"}</span>
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

  const renderProductCard = (item: SectionMinimalProductItem, index: number) => {
    const discount = getDiscountPercent(item.price, item.oldPrice);
    const badgeText = item.badge || (discount ? `-${discount}%` : undefined);

    const cardContent = (
      <>
        <div className={cls.cardMediaWrap}>
          {badgeText ? (
            <span className={`${cls.cardBadge} ${item.outOfStock ? cls.cardBadgeMuted : cls.cardBadgeHot}`}>
              {badgeText}
            </span>
          ) : null}

          <div className={cls.cardMedia}>
            <Image
              src={item.imageSrc}
              alt={item.title}
              fill
              className={cls.cardImage}
              sizes="(max-width: 767px) 100vw, (max-width: 1200px) 33vw, 260px"
            />
          </div>
        </div>

        <div className={cls.cardBody}>
          <div className={cls.cardMeta}>
            <span className={cls.brand}>{item.brand}</span>
            <span className={`${cls.stockTag} ${item.outOfStock ? cls.stockTagMuted : ""}`}>
              {item.outOfStock ? "Hết hàng" : "Có sẵn"}
            </span>
          </div>

          <h3 className={cls.productTitle}>{item.title}</h3>

          <div className={cls.priceRow}>
            <span className={`${cls.price} ${item.oldPrice ? cls.priceHot : ""}`}>{item.price}</span>
            {item.oldPrice ? <span className={cls.oldPrice}>{item.oldPrice}</span> : null}
          </div>

          <div className={cls.progressMeta}>
            <span className={cls.soldLabel}>{item.soldLabel || "Đã bán"}</span>
            <span className={cls.soldValue}>{item.soldValue || 0}</span>
          </div>

          <div className={cls.progress}>
            <span
              className={`${cls.progressBar} ${item.outOfStock ? cls.progressBarMuted : ""}`}
              style={{ width: getProgressWidth(item.soldValue, item.soldMax) }}
            />
          </div>

          <div className={cls.cardFooter}>
            <button
              type="button"
              className={`${cls.cartBtn} ${item.outOfStock ? cls.cartBtnDisabled : ""}`}
              onClick={preview ? onPreviewBlock : undefined}
              aria-label={item.ctaLabel || "Thêm vào giỏ"}
            >
              <span className={cls.cartBtnText}>{item.ctaLabel || "Thêm vào giỏ"}</span>
              <span className={cls.cartIcon}>
                <i className={item.outOfStock ? "bi bi-slash-circle" : "bi bi-bag-plus"} aria-hidden="true" />
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
        <div className={cls.header}>
          <div className={cls.headerMain}>
            <h2 className={cls.title}>{title}</h2>
            <p className={cls.subtitle}>{subtitle}</p>
          </div>

          <div className={cls.headerSide}>
            <div className={cls.filterGroup} role="tablist" aria-label="Minimal filters">
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

            {renderAction()}
          </div>
        </div>

        <div className={cls.layout}>
          <div className={cls.bannerCol}>{renderBanner()}</div>

          <div className={cls.productsCol}>
            <div className={cls.productsGrid}>{productItems.map((item, index) => renderProductCard(item, index))}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_SECTION_MINIMAL: RegItem = {
  kind: "SectionMinimal",
  label: "Section Minimal",
  defaults: {
    title: "Sản phẩm nổi bật",
    subtitle:
      "Thiết kế tối giản giúp làm nổi bật sản phẩm, hình ảnh và giá trị thương hiệu trong không gian mua sắm hiện đại.",
    actionLabel: "Xem tất cả",
    actionHref: "/collections/all",
    filters: JSON.stringify(DEFAULT_FILTERS, null, 2),
    banner: JSON.stringify(DEFAULT_BANNER, null, 2),
    products: JSON.stringify(DEFAULT_PRODUCTS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "textarea", rows: 3 },
    { key: "actionLabel", label: "Action Label", kind: "text" },
    { key: "actionHref", label: "Action Href", kind: "text" },
    { key: "filters", label: "Filters (JSON)", kind: "textarea", rows: 8 },
    { key: "banner", label: "Banner (JSON)", kind: "textarea", rows: 10 },
    { key: "products", label: "Products (JSON)", kind: "textarea", rows: 22 },
  ],
  render: (p) => {
    const filters = safeJson<SectionMinimalFilterItem[]>(p.filters);
    const banner = safeJson<SectionMinimalBanner>(p.banner);
    const products = safeJson<SectionMinimalProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Minimal">
        <SectionMinimal
          title={String(p.title || "Sản phẩm nổi bật")}
          subtitle={String(
            p.subtitle ||
              "Thiết kế tối giản giúp làm nổi bật sản phẩm, hình ảnh và giá trị thương hiệu trong không gian mua sắm hiện đại.",
          )}
          actionLabel={String(p.actionLabel || "Xem tất cả")}
          actionHref={String(p.actionHref || "/collections/all")}
          filters={filters}
          banner={banner}
          products={products}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionMinimal;

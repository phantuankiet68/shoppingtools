"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Section/SectionAnnouncement.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SectionAnnouncementFilterItem = {
  label: string;
  value: string;
  active?: boolean;
};

export type SectionAnnouncementBanner = {
  title: string;
  imageSrc: string;
  href?: string;
  alt?: string;
};

export type SectionAnnouncementProductItem = {
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

export type SectionAnnouncementProps = {
  title?: string;
  filters?: SectionAnnouncementFilterItem[];
  banner?: SectionAnnouncementBanner;
  products?: SectionAnnouncementProductItem[];
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_FILTERS: SectionAnnouncementFilterItem[] = [
  { label: "Tất Cả", value: "all", active: true },
  { label: "Chăm Sóc Da Mặt", value: "face-care" },
];

const DEFAULT_BANNER: SectionAnnouncementBanner = {
  title: "Chăm Da Trắng Sáng",
  imageSrc: "/images/sections/announcement/skin-bright-banner.jpg",
  href: "/collections/cham-da-trang-sang",
  alt: "Chăm da trắng sáng",
};

const DEFAULT_PRODUCTS: SectionAnnouncementProductItem[] = [
  {
    brand: "HƯƠNG THỊ",
    title: "Bộ chăm sóc da mặt ngọc trai trắng sáng (Pearl Shine)",
    imageSrc: "/images/sections/announcement/product-1.jpg",
    href: "/products/bo-cham-soc-da-mat-ngoc-trai-trang-sang",
    soldLabel: "Đã bán",
    soldValue: 9543,
    soldMax: 12000,
    price: "1,300,000₫",
    ctaLabel: "THÊM VÀO GIỎ",
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
    ctaLabel: "HẾT HÀNG",
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
    ctaLabel: "THÊM VÀO GIỎ",
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
    ctaLabel: "THÊM VÀO GIỎ",
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
    ctaLabel: "THÊM VÀO GIỎ",
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
    ctaLabel: "THÊM VÀO GIỎ",
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
    ctaLabel: "THÊM VÀO GIỎ",
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

/* ================= Component ================= */
export function SectionAnnouncement({
  title = "CHĂM DA TRẮNG SÁNG",
  filters,
  banner,
  products,
  preview = false,
}: SectionAnnouncementProps) {
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

  const renderBanner = () => {
    const content = (
      <div className={cls.bannerCard}>
        <div className={cls.bannerMedia}>
          <Image
            src={bannerData.imageSrc}
            alt={bannerData.alt || bannerData.title}
            fill
            className={cls.bannerImage}
            sizes="(max-width: 991px) 100vw, 340px"
          />
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

  const renderProductCard = (item: SectionAnnouncementProductItem, index: number) => {
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
              sizes="(max-width: 991px) 50vw, 220px"
            />
          </div>
        </div>

        <div className={cls.cardBody}>
          <div className={cls.soldRow}>
            <span className={cls.soldLabel}>{item.soldLabel || "Đã bán"}</span>
            <span className={cls.soldValue}>{item.soldValue || 0}</span>
          </div>

          <div className={cls.progress}>
            <span
              className={`${cls.progressBar} ${item.outOfStock ? cls.progressBarMuted : ""}`}
              style={{ width: getProgressWidth(item.soldValue, item.soldMax) }}
            />
          </div>

          <div className={cls.brand}>{item.brand}</div>
          <div className={cls.productTitle}>{item.title}</div>

          <div className={cls.priceRow}>
            <span className={`${cls.price} ${item.oldPrice ? cls.priceHot : ""}`}>{item.price}</span>
            {item.oldPrice ? <span className={cls.oldPrice}>{item.oldPrice}</span> : null}
          </div>

          <div className={cls.cardFooter}>
            <button
              type="button"
              className={`${cls.cartBtn} ${item.outOfStock ? cls.cartBtnDisabled : ""}`}
              onClick={preview ? onPreviewBlock : undefined}
              aria-label={item.ctaLabel || "Thêm vào giỏ"}
            >
              <span className={cls.cartBtnText}>{item.ctaLabel || "THÊM VÀO GIỎ"}</span>
              <span className={cls.cartIcon}>
                <i className="bi bi-bag" aria-hidden="true" />
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
      <div className={cls.header}>
        <h2 className={cls.title}>{title}</h2>

        <div className={cls.filterGroup} role="tablist" aria-label="Announcement filters">
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

      <div className={cls.layout}>
        <div className={cls.bannerCol}>{renderBanner()}</div>

        <div className={cls.productsCol}>
          <div className={cls.productsGrid}>{productItems.map((item, index) => renderProductCard(item, index))}</div>
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_SECTION_ANNOUNCEMENT: RegItem = {
  kind: "SectionAnnouncement",
  label: "Section Announcement",
  defaults: {
    title: "CHĂM DA TRẮNG SÁNG",
    filters: JSON.stringify(DEFAULT_FILTERS, null, 2),
    banner: JSON.stringify(DEFAULT_BANNER, null, 2),
    products: JSON.stringify(DEFAULT_PRODUCTS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "filters", label: "Filters (JSON)", kind: "textarea", rows: 8 },
    { key: "banner", label: "Banner (JSON)", kind: "textarea", rows: 8 },
    { key: "products", label: "Products (JSON)", kind: "textarea", rows: 22 },
  ],
  render: (p) => {
    const filters = safeJson<SectionAnnouncementFilterItem[]>(p.filters);
    const banner = safeJson<SectionAnnouncementBanner>(p.banner);
    const products = safeJson<SectionAnnouncementProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Announcement">
        <SectionAnnouncement
          title={String(p.title || "CHĂM DA TRẮNG SÁNG")}
          filters={filters}
          banner={banner}
          products={products}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionAnnouncement;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Section/SectionRegion.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SectionRegionFilterItem = {
  label: string;
  value: string;
  active?: boolean;
};

export type SectionRegionBanner = {
  title: string;
  imageSrc: string;
  href?: string;
  alt?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
};

export type SectionRegionProductItem = {
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

export type SectionRegionProps = {
  title?: string;
  filters?: SectionRegionFilterItem[];
  banner?: SectionRegionBanner;
  products?: SectionRegionProductItem[];
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_FILTERS: SectionRegionFilterItem[] = [
  { label: "Collagen, chống lão hóa", value: "collagen", active: true },
  { label: "Tảo", value: "algae" },
  { label: "Giảm cân, tăng chiều cao", value: "diet-height" },
  { label: "Chăm sóc mắt, bổ não", value: "eye-brain" },
  { label: "Bảo vệ xương khớp", value: "bones" },
];

const DEFAULT_BANNER: SectionRegionBanner = {
  eyebrow: "Menard Japan",
  title: "Collagen nội sinh",
  subtitle:
    "Thực phẩm chức năng và chăm sóc sức khỏe cao cấp theo phong cách trưng bày hiện đại, sáng và chuyên nghiệp.",
  imageSrc: "/images/sections/announcement/skin-bright-banner.jpg",
  href: "/collections/thuc-pham-chuc-nang",
  alt: "Thực phẩm chức năng",
  ctaLabel: "Mua ngay",
};

const DEFAULT_PRODUCTS: SectionRegionProductItem[] = [
  {
    brand: "KORI",
    title: "Dầu cá nhuận thể Omega-3 Krill Kori 152 viên - Hàng Nhật Bản",
    imageSrc: "/images/sections/announcement/product-1.jpg",
    href: "/products/dau-ca-kori-omega-3",
    soldLabel: "Đã bán",
    soldValue: 9543,
    soldMax: 12000,
    price: "700.000₫",
    oldPrice: "1.200.000₫",
    badge: "-42%",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "Noguchi",
    title: "Viên uống tinh chất nghệ cô đặc Noguchi Turmeric Concentrate",
    imageSrc: "/images/sections/announcement/product-2.jpg",
    href: "/products/noguchi-turmeric-concentrate",
    soldLabel: "Đã bán",
    soldValue: 7354,
    soldMax: 12000,
    price: "450.000₫",
    oldPrice: "600.000₫",
    badge: "-25%",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "Super Cool",
    title: "Nhỏ mắt bổ sung 3 loại vitamin B6-A-E giúp sáng mắt siêu mát",
    imageSrc: "/images/sections/announcement/product-3.jpg",
    href: "/products/nho-mat-vitamin-b6-a-e",
    soldLabel: "Đã bán",
    soldValue: 7543,
    soldMax: 12000,
    price: "135.000₫",
    oldPrice: "300.000₫",
    badge: "-55%",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "Arubin",
    title: "Kem dưỡng mắt AP ngừa lão hoá và giảm thâm 20g - Hàng Nhật",
    imageSrc: "/images/sections/announcement/product-4.jpg",
    href: "/products/kem-duong-mat-arubin",
    soldLabel: "Đã bán",
    soldValue: 6343,
    soldMax: 12000,
    price: "195.000₫",
    oldPrice: "330.000₫",
    badge: "-41%",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "ORIHIRO",
    title: "Thực phẩm bổ sung: ORIHIRO Most chewable Collagen",
    imageSrc: "/images/sections/announcement/product-5.jpg",
    href: "/products/orihiro-most-chewable-collagen",
    soldLabel: "Đã bán",
    soldValue: 5643,
    soldMax: 12000,
    price: "250.000₫",
    oldPrice: "300.000₫",
    badge: "-17%",
    ctaLabel: "Thêm vào giỏ",
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
export function SectionRegion({
  title = "THỰC PHẨM CHỨC NĂNG",
  filters,
  banner,
  products,
  preview = false,
}: SectionRegionProps) {
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

  const renderBanner = () => {
    const content = (
      <div className={cls.bannerCard}>
        <div className={cls.bannerMedia}>
          <Image
            src={bannerData.imageSrc}
            alt={bannerData.alt || bannerData.title}
            fill
            className={cls.bannerImage}
            sizes="100vw"
          />
        </div>

        <div className={cls.bannerOverlay} />

        <div className={cls.bannerContent}>
          {bannerData.eyebrow ? <span className={cls.bannerEyebrow}>{bannerData.eyebrow}</span> : null}
          <h3 className={cls.bannerTitle}>{bannerData.title}</h3>
          {bannerData.subtitle ? <p className={cls.bannerSubtitle}>{bannerData.subtitle}</p> : null}

          <span className={cls.bannerCta}>
            {bannerData.ctaLabel || "Mua ngay"}
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </span>
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

  const renderProductCard = (item: SectionRegionProductItem, index: number) => {
    const cardContent = (
      <>
        <div className={cls.cardMediaWrap}>
          {item.badge ? <span className={cls.cardBadge}>{item.badge}</span> : null}

          <div className={cls.cardMedia}>
            <Image
              src={item.imageSrc}
              alt={item.title}
              fill
              className={cls.cardImage}
              sizes="(max-width: 767px) 100vw, (max-width: 1200px) 25vw, 220px"
            />
          </div>
        </div>

        <div className={cls.cardBody}>
          <div className={cls.brand}>{item.brand}</div>

          <h3 className={cls.productTitle}>{item.title}</h3>

          <div className={cls.priceRow}>
            <span className={cls.price}>{item.price}</span>
          </div>

          {item.oldPrice || item.badge ? (
            <div className={cls.oldPriceRow}>
              {item.oldPrice ? <span className={cls.oldPrice}>{item.oldPrice}</span> : null}
              {item.badge ? <span className={cls.discount}>{item.badge}</span> : null}
            </div>
          ) : null}

          <div className={cls.progressMeta}>
            <span className={cls.soldLabel}>{item.soldLabel || "Đã bán"}</span>
            <span className={cls.soldValue}>{item.soldValue || 0}</span>
          </div>

          <div className={cls.progress}>
            <span className={cls.progressBar} style={{ width: getProgressWidth(item.soldValue, item.soldMax) }} />
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
        <div className={cls.bannerBlock}>{renderBanner()}</div>

        <div className={cls.toolbar}>
          <div className={cls.regionTitleWrap}>
            <span className={cls.regionIcon}>
              <i className="bi bi-capsule-pill" aria-hidden="true" />
            </span>
            <h2 className={cls.title}>{title}</h2>
          </div>

          <div className={cls.filterGroup} role="tablist" aria-label="Region filters">
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

        <div className={cls.productsGrid}>{productItems.map((item, index) => renderProductCard(item, index))}</div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_SECTION_REGION: RegItem = {
  kind: "SectionRegion",
  label: "Section Region",
  defaults: {
    title: "THỰC PHẨM CHỨC NĂNG",
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
    const filters = safeJson<SectionRegionFilterItem[]>(p.filters);
    const banner = safeJson<SectionRegionBanner>(p.banner);
    const products = safeJson<SectionRegionProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Region">
        <SectionRegion
          title={String(p.title || "THỰC PHẨM CHỨC NĂNG")}
          filters={filters}
          banner={banner}
          products={products}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionRegion;

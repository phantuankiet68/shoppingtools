"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Section/SectionClassic.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SectionClassicFilterItem = {
  label: string;
  value: string;
  active?: boolean;
};

export type SectionClassicBanner = {
  title: string;
  imageSrc: string;
  href?: string;
  alt?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
};

export type SectionClassicProductItem = {
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

export type SectionClassicProps = {
  title?: string;
  subtitle?: string;
  filters?: SectionClassicFilterItem[];
  banner?: SectionClassicBanner;
  products?: SectionClassicProductItem[];
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_FILTERS: SectionClassicFilterItem[] = [
  { label: "Tất Cả", value: "all", active: true },
  { label: "Chăm Sóc Da Mặt", value: "face-care" },
  { label: "Dưỡng Sáng", value: "brightening" },
  { label: "Chống Nắng", value: "sun-care" },
];

const DEFAULT_BANNER: SectionClassicBanner = {
  eyebrow: "Bộ sưu tập nổi bật",
  title: "Chăm Da Trắng Sáng",
  subtitle: "Giải pháp chăm da chuyên nghiệp, hiện đại và sang trọng cho trải nghiệm mua sắm thế hệ mới.",
  imageSrc: "/images/sections/announcement/skin-bright-banner.jpg",
  href: "/collections/cham-da-trang-sang",
  alt: "Chăm da trắng sáng",
  ctaLabel: "Khám phá ngay",
};

const DEFAULT_PRODUCTS: SectionClassicProductItem[] = [
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
    badge: "Ưa chuộng",
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

  const normalize = (input: string) => Number(input.replace(/[^\d]/g, "").trim());

  const current = normalize(price);
  const old = normalize(oldPrice);

  if (!current || !old || old <= current) return undefined;
  return `${Math.round(((old - current) / old) * 100)}%`;
}

/* ================= Component ================= */
export function SectionClassic({
  title = "CHĂM DA TRẮNG SÁNG",
  subtitle = "Không gian mua sắm hiện đại dành cho các dòng sản phẩm chăm sóc da bán chạy nhất.",
  filters,
  banner,
  products,
  preview = false,
}: SectionClassicProps) {
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
      <div className={cls.heroCard}>
        <div className={cls.heroMedia}>
          <Image
            src={bannerData.imageSrc}
            alt={bannerData.alt || bannerData.title}
            fill
            className={cls.heroImage}
            sizes="(max-width: 991px) 100vw, 420px"
          />
        </div>

        <div className={cls.heroOverlay} />

        <div className={cls.heroContent}>
          {bannerData.eyebrow ? <span className={cls.heroEyebrow}>{bannerData.eyebrow}</span> : null}

          <h3 className={cls.heroTitle}>{bannerData.title}</h3>

          {bannerData.subtitle ? <p className={cls.heroSubtitle}>{bannerData.subtitle}</p> : null}

          <span className={cls.heroCta}>
            {bannerData.ctaLabel || "Khám phá ngay"}
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </span>
        </div>
      </div>
    );

    if (preview) {
      return (
        <a href="#" className={cls.heroLink} onClick={onPreviewBlock}>
          {content}
        </a>
      );
    }

    return (
      <Link href={(bannerData.href || "/") as Route} className={cls.heroLink}>
        {content}
      </Link>
    );
  };

  const renderProductCard = (item: SectionClassicProductItem, index: number) => {
    const computedDiscount = getDiscountPercent(item.price, item.oldPrice);
    const displayBadge = item.badge || (computedDiscount ? `-${computedDiscount}` : undefined);

    const cardContent = (
      <>
        <div className={cls.productTop}>
          <div className={cls.cardMediaWrap}>
            {displayBadge ? (
              <span className={`${cls.cardBadge} ${item.outOfStock ? cls.cardBadgeMuted : cls.cardBadgeHot}`}>
                {displayBadge}
              </span>
            ) : null}

            <div className={cls.cardMedia}>
              <Image
                src={item.imageSrc}
                alt={item.title}
                fill
                className={cls.cardImage}
                sizes="(max-width: 767px) 50vw, (max-width: 1200px) 33vw, 260px"
              />
            </div>
          </div>
        </div>

        <div className={cls.cardBody}>
          <div className={cls.cardMeta}>
            <span className={cls.brand}>{item.brand}</span>
            <span className={cls.stockState}>{item.outOfStock ? "Tạm hết hàng" : "Có sẵn"}</span>
          </div>

          <h3 className={cls.productTitle}>{item.title}</h3>

          <div className={cls.priceBlock}>
            <div className={cls.priceRow}>
              <span className={`${cls.price} ${item.oldPrice ? cls.priceHot : ""}`}>{item.price}</span>
              {item.oldPrice ? <span className={cls.oldPrice}>{item.oldPrice}</span> : null}
            </div>

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
          <div className={cls.headerContent}>
            <span className={cls.eyebrow}>Classic Commerce</span>
            <h2 className={cls.title}>{title}</h2>
            <p className={cls.subtitle}>{subtitle}</p>
          </div>

          <div className={cls.filterGroup} role="tablist" aria-label="Classic filters">
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
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_SECTION_CLASSIC: RegItem = {
  kind: "SectionClassic",
  label: "Section Classic",
  defaults: {
    title: "CHĂM DA TRẮNG SÁNG",
    subtitle: "Không gian mua sắm hiện đại dành cho các dòng sản phẩm chăm sóc da bán chạy nhất.",
    filters: JSON.stringify(DEFAULT_FILTERS, null, 2),
    banner: JSON.stringify(DEFAULT_BANNER, null, 2),
    products: JSON.stringify(DEFAULT_PRODUCTS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "text" },
    { key: "filters", label: "Filters (JSON)", kind: "textarea", rows: 8 },
    { key: "banner", label: "Banner (JSON)", kind: "textarea", rows: 10 },
    { key: "products", label: "Products (JSON)", kind: "textarea", rows: 22 },
  ],
  render: (p) => {
    const filters = safeJson<SectionClassicFilterItem[]>(p.filters);
    const banner = safeJson<SectionClassicBanner>(p.banner);
    const products = safeJson<SectionClassicProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Classic">
        <SectionClassic
          title={String(p.title || "CHĂM DA TRẮNG SÁNG")}
          subtitle={String(
            p.subtitle || "Không gian mua sắm hiện đại dành cho các dòng sản phẩm chăm sóc da bán chạy nhất.",
          )}
          filters={filters}
          banner={banner}
          products={products}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionClassic;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Section/SectionDashboard.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SectionDashboardFilterItem = {
  label: string;
  value: string;
  active?: boolean;
};

export type SectionDashboardBanner = {
  title: string;
  imageSrc: string;
  href?: string;
  alt?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
  statsLabel?: string;
  statsValue?: string;
};

export type SectionDashboardProductItem = {
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

export type SectionDashboardProps = {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  filters?: SectionDashboardFilterItem[];
  banner?: SectionDashboardBanner;
  products?: SectionDashboardProductItem[];
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_FILTERS: SectionDashboardFilterItem[] = [
  { label: "Tất cả", value: "all", active: true },
  { label: "Bán chạy", value: "best-seller" },
  { label: "Mới ra mắt", value: "new-arrivals" },
  { label: "Ưu đãi tốt", value: "hot-deals" },
];

const DEFAULT_BANNER: SectionDashboardBanner = {
  eyebrow: "Dashboard commerce",
  title: "Bộ Sưu Tập Chăm Da Trắng Sáng",
  subtitle:
    "Trải nghiệm bán hàng hiện đại với bố cục trực quan, chỉ số nổi bật và giao diện phù hợp phong cách website thương mại điện tử thế hệ mới.",
  imageSrc: "/images/sections/announcement/skin-bright-banner.jpg",
  href: "/collections/cham-da-trang-sang",
  alt: "Chăm da trắng sáng",
  ctaLabel: "Khám phá ngay",
  statsLabel: "Tăng trưởng",
  statsValue: "+24%",
};

const DEFAULT_PRODUCTS: SectionDashboardProductItem[] = [
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
    title: "Kem dưỡng sáng da phục hồi chuyên sâu",
    imageSrc: "/images/sections/announcement/product-1.jpg",
    href: "/products/kem-duong-sang-da-phuc-hoi",
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
export function SectionDashboard({
  title = "Bảng sản phẩm nổi bật",
  subtitle = "Khu vực hiển thị sản phẩm dạng dashboard hiện đại, phù hợp cho landing page bán hàng và giao diện thương mại điện tử thế hệ mới.",
  actionLabel = "Xem tất cả",
  actionHref = "/collections/all",
  filters,
  banner,
  products,
  preview = false,
}: SectionDashboardProps) {
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
          <i className="bi bi-arrow-up-right" aria-hidden="true" />
        </a>
      );
    }

    return (
      <Link href={(actionHref || "/") as Route} className={cls.actionLink}>
        {actionLabel}
        <i className="bi bi-arrow-up-right" aria-hidden="true" />
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
            sizes="(max-width: 991px) 100vw, 420px"
          />
        </div>

        <div className={cls.bannerOverlay} />

        <div className={cls.bannerPanel}>
          <div className={cls.bannerTopRow}>
            {bannerData.eyebrow ? <span className={cls.bannerEyebrow}>{bannerData.eyebrow}</span> : null}

            {bannerData.statsLabel || bannerData.statsValue ? (
              <div className={cls.bannerStat}>
                {bannerData.statsLabel ? <span className={cls.bannerStatLabel}>{bannerData.statsLabel}</span> : null}
                {bannerData.statsValue ? (
                  <strong className={cls.bannerStatValue}>{bannerData.statsValue}</strong>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className={cls.bannerBody}>
            <h3 className={cls.bannerTitle}>{bannerData.title}</h3>

            {bannerData.subtitle ? <p className={cls.bannerSubtitle}>{bannerData.subtitle}</p> : null}

            <span className={cls.bannerCta}>
              {bannerData.ctaLabel || "Khám phá ngay"}
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </span>
          </div>
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

  const renderProductCard = (item: SectionDashboardProductItem, index: number) => {
    const discount = getDiscountPercent(item.price, item.oldPrice);
    const badgeText = item.badge || (discount ? `-${discount}%` : undefined);

    const cardContent = (
      <>
        <div className={cls.cardHead}>
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
                sizes="(max-width: 767px) 100vw, (max-width: 1200px) 33vw, 240px"
              />
            </div>
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

          <div className={cls.metricsRow}>
            <div className={cls.metricBlock}>
              <span className={cls.metricLabel}>{item.soldLabel || "Đã bán"}</span>
              <span className={cls.metricValue}>{item.soldValue || 0}</span>
            </div>

            <div className={cls.metricBlockRight}>
              <span className={cls.metricLabel}>Tiến độ</span>
              <span className={cls.metricValue}>{getProgressWidth(item.soldValue, item.soldMax)}</span>
            </div>
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
            <span className={cls.kicker}>Sales dashboard</span>
            <h2 className={cls.title}>{title}</h2>
            <p className={cls.subtitle}>{subtitle}</p>
          </div>

          <div className={cls.headerSide}>
            <div className={cls.filterGroup} role="tablist" aria-label="Dashboard filters">
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

        <div className={cls.dashboardGrid}>
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
export const SHOP_SECTION_DASHBOARD: RegItem = {
  kind: "SectionDashboard",
  label: "Section Dashboard",
  defaults: {
    title: "Bảng sản phẩm nổi bật",
    subtitle:
      "Khu vực hiển thị sản phẩm dạng dashboard hiện đại, phù hợp cho landing page bán hàng và giao diện thương mại điện tử thế hệ mới.",
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
    const filters = safeJson<SectionDashboardFilterItem[]>(p.filters);
    const banner = safeJson<SectionDashboardBanner>(p.banner);
    const products = safeJson<SectionDashboardProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Dashboard">
        <SectionDashboard
          title={String(p.title || "Bảng sản phẩm nổi bật")}
          subtitle={String(
            p.subtitle ||
              "Khu vực hiển thị sản phẩm dạng dashboard hiện đại, phù hợp cho landing page bán hàng và giao diện thương mại điện tử thế hệ mới.",
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

export default SectionDashboard;

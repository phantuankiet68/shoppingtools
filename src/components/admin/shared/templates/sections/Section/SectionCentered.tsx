"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Centered/SectionCentered.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SectionCenteredFilterItem = {
  label: string;
  value: string;
  active?: boolean;
};

export type SectionCenteredHero = {
  eyebrow?: string;
  title?: string;
  description?: string;
  imageSrc: string;
  href?: string;
  alt?: string;
  ctaLabel?: string;
  secondaryLabel?: string;
};

export type SectionCenteredProductItem = {
  brand?: string;
  title: string;
  imageSrc: string;
  href?: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  soldText?: string;
  ctaLabel?: string;
};

export type SectionCenteredProps = {
  title?: string;
  subtitle?: string;
  filters?: SectionCenteredFilterItem[];
  hero?: SectionCenteredHero;
  products?: SectionCenteredProductItem[];
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_FILTERS: SectionCenteredFilterItem[] = [
  { label: "Nổi bật", value: "featured", active: true },
  { label: "Bán chạy", value: "best-seller" },
  { label: "Mới nhất", value: "new-arrivals" },
];

const DEFAULT_HERO: SectionCenteredHero = {
  eyebrow: "Premium Beauty",
  title: "Bộ sưu tập chăm sóc da cao cấp cho phong cách bán hàng hiện đại",
  description:
    "Thiết kế section trung tâm theo ngôn ngữ giao diện 2026, cân bằng giữa hình ảnh thương mại, cảm giác cao cấp và khả năng chuyển đổi cho website bán hàng.",
  imageSrc: "/images/sections/centered/hero-premium-skincare.png",
  href: "/collections/premium-skincare",
  alt: "Premium skincare collection",
  ctaLabel: "Khám phá ngay",
  secondaryLabel: "Xem bộ sưu tập",
};

const DEFAULT_PRODUCTS: SectionCenteredProductItem[] = [
  {
    brand: "LUXEBEAUTY",
    title: "Tinh chất dưỡng sáng da chuyên sâu Premium Radiance",
    imageSrc: "/images/sections/centered/product-1.png",
    href: "/products/premium-radiance-serum",
    price: "890,000₫",
    oldPrice: "1,120,000₫",
    badge: "-20%",
    rating: 5,
    reviewCount: 128,
    soldText: "Đã bán 2.1k",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "LUXEBEAUTY",
    title: "Kem dưỡng phục hồi da ban đêm Velvet Repair Cream",
    imageSrc: "/images/sections/centered/product-2.png",
    href: "/products/velvet-repair-cream",
    price: "760,000₫",
    rating: 5,
    reviewCount: 94,
    soldText: "Đã bán 1.4k",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "LUXEBEAUTY",
    title: "Sữa rửa mặt dịu nhẹ Pearl Cleanser cao cấp",
    imageSrc: "/images/sections/centered/product-3.png",
    href: "/products/pearl-cleanser",
    price: "420,000₫",
    oldPrice: "520,000₫",
    badge: "Hot",
    rating: 4,
    reviewCount: 77,
    soldText: "Đã bán 980",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    brand: "LUXEBEAUTY",
    title: "Bộ dưỡng da trắng sáng 4 bước Glow Signature Set",
    imageSrc: "/images/sections/centered/product-4.png",
    href: "/products/glow-signature-set",
    price: "1,490,000₫",
    oldPrice: "1,790,000₫",
    badge: "Best Seller",
    rating: 5,
    reviewCount: 213,
    soldText: "Đã bán 3.8k",
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

/* ================= Component ================= */
export function SectionCentered({
  title = "CHĂM SÓC DA CAO CẤP",
  subtitle = "Section centered dành cho website bán hàng hiện đại, nhấn mạnh trải nghiệm thương hiệu, hình ảnh cao cấp và hành vi mua sắm trực quan.",
  filters,
  hero,
  products,
  preview = false,
}: SectionCenteredProps) {
  const filterItems = useMemo(() => filters ?? DEFAULT_FILTERS, [filters]);
  const heroData = useMemo(() => hero ?? DEFAULT_HERO, [hero]);
  const productItems = useMemo(() => products ?? DEFAULT_PRODUCTS, [products]);

  const initialFilter = filterItems.find((item) => item.active)?.value ?? filterItems[0]?.value ?? "featured";

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

  const renderStars = (rating = 5) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const filled = index < Math.max(0, Math.min(5, rating));
      return (
        <span key={index} className={`${cls.star} ${filled ? cls.starFilled : ""}`} aria-hidden="true">
          ★
        </span>
      );
    });
  };

  const renderHero = () => {
    const content = (
      <div className={cls.heroCard}>
        <div className={cls.heroContent}>
          {heroData.eyebrow ? <div className={cls.heroEyebrow}>{heroData.eyebrow}</div> : null}
          {heroData.title ? <h3 className={cls.heroTitle}>{heroData.title}</h3> : null}
          {heroData.description ? <p className={cls.heroDescription}>{heroData.description}</p> : null}

          <div className={cls.heroActions}>
            <button type="button" className={cls.primaryBtn} onClick={preview ? onPreviewBlock : undefined}>
              {heroData.ctaLabel || "Khám phá ngay"}
            </button>

            <button type="button" className={cls.secondaryBtn} onClick={preview ? onPreviewBlock : undefined}>
              {heroData.secondaryLabel || "Xem thêm"}
            </button>
          </div>
        </div>

        <div className={cls.heroMedia}>
          <Image
            src={heroData.imageSrc}
            alt={heroData.alt || heroData.title || "Hero image"}
            fill
            className={cls.heroImage}
            sizes="(max-width: 991px) 100vw, 520px"
          />
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
      <Link href={(heroData.href || "/") as Route} className={cls.heroLink}>
        {content}
      </Link>
    );
  };

  const renderProduct = (item: SectionCenteredProductItem, index: number) => {
    const content = (
      <>
        <div className={cls.productMediaWrap}>
          {item.badge ? <span className={cls.productBadge}>{item.badge}</span> : null}

          <div className={cls.productMedia}>
            <Image
              src={item.imageSrc}
              alt={item.title}
              fill
              className={cls.productImage}
              sizes="(max-width: 991px) 50vw, 280px"
            />
          </div>
        </div>

        <div className={cls.productBody}>
          {item.brand ? <div className={cls.productBrand}>{item.brand}</div> : null}
          <div className={cls.productTitle}>{item.title}</div>

          <div className={cls.metaRow}>
            <div className={cls.ratingWrap}>
              <div className={cls.starRow}>{renderStars(item.rating || 5)}</div>
              <span className={cls.reviewText}>({item.reviewCount || 0})</span>
            </div>

            {item.soldText ? <span className={cls.soldText}>{item.soldText}</span> : null}
          </div>

          <div className={cls.priceRow}>
            <span className={cls.productPrice}>{item.price}</span>
            {item.oldPrice ? <span className={cls.productOldPrice}>{item.oldPrice}</span> : null}
          </div>

          <div className={cls.productActions}>
            <button
              type="button"
              className={cls.cartBtn}
              onClick={preview ? onPreviewBlock : undefined}
              aria-label={item.ctaLabel || "Thêm vào giỏ"}
            >
              <span>{item.ctaLabel || "Thêm vào giỏ"}</span>
              <i className="bi bi-bag" aria-hidden="true" />
            </button>
          </div>
        </div>
      </>
    );

    if (preview) {
      return (
        <a key={index} href="#" className={cls.productCard} onClick={onPreviewBlock}>
          {content}
        </a>
      );
    }

    return (
      <Link key={index} href={(item.href || "/") as Route} className={cls.productCard}>
        {content}
      </Link>
    );
  };

  return (
    <section className={cls.section} aria-label={title}>
      <div className={cls.header}>
        <div className={cls.headerInner}>
          <div className={cls.kicker}>Modern Commerce Section</div>
          <h2 className={cls.title}>{title}</h2>
          <p className={cls.subtitle}>{subtitle}</p>

          <div className={cls.filterGroup} role="tablist" aria-label="Section centered filters">
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
      </div>

      <div className={cls.heroWrap}>{renderHero()}</div>

      <div className={cls.productsWrap}>
        <div className={cls.productsGrid}>{productItems.map((item, index) => renderProduct(item, index))}</div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_SECTION_CENTERED: RegItem = {
  kind: "SectionCentered",
  label: "Section Centered",
  defaults: {
    title: "CHĂM SÓC DA CAO CẤP",
    subtitle:
      "Section centered dành cho website bán hàng hiện đại, nhấn mạnh trải nghiệm thương hiệu, hình ảnh cao cấp và hành vi mua sắm trực quan.",
    filters: JSON.stringify(DEFAULT_FILTERS, null, 2),
    hero: JSON.stringify(DEFAULT_HERO, null, 2),
    products: JSON.stringify(DEFAULT_PRODUCTS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "textarea", rows: 4 },
    { key: "filters", label: "Filters (JSON)", kind: "textarea", rows: 8 },
    { key: "hero", label: "Hero (JSON)", kind: "textarea", rows: 12 },
    { key: "products", label: "Products (JSON)", kind: "textarea", rows: 22 },
  ],
  render: (p) => {
    const filters = safeJson<SectionCenteredFilterItem[]>(p.filters);
    const hero = safeJson<SectionCenteredHero>(p.hero);
    const products = safeJson<SectionCenteredProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Centered">
        <SectionCentered
          title={String(p.title || "CHĂM SÓC DA CAO CẤP")}
          subtitle={String(
            p.subtitle ||
              "Section centered dành cho website bán hàng hiện đại, nhấn mạnh trải nghiệm thương hiệu, hình ảnh cao cấp và hành vi mua sắm trực quan.",
          )}
          filters={filters}
          hero={hero}
          products={products}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionCentered;

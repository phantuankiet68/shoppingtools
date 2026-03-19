"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "./SectionSplit.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type SectionSplitFilterItem = {
  label: string;
  value: string;
  active?: boolean;
};

export type SectionSplitBanner = {
  title: string;
  imageSrc: string;
  href?: string;
  alt?: string;
};

export type SectionSplitProductItem = {
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
  tones?: string[];
};

export type SectionSplitProps = {
  title?: string;
  filters?: SectionSplitFilterItem[];
  banner?: SectionSplitBanner;
  products?: SectionSplitProductItem[];
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_FILTERS: SectionSplitFilterItem[] = [{ label: "Tất cả", value: "all", active: true }];

const DEFAULT_BANNER: SectionSplitBanner = {
  title: "Đồng giá hot",
  imageSrc: "/images/sections/announcement/skin-bright-banner.jpg",
  href: "/collections/dong-gia-hot",
  alt: "Đồng giá hot",
};

const DEFAULT_PRODUCTS: SectionSplitProductItem[] = [
  {
    title: "Kéo văn phòng, thủ công mini gấp gọn bỏ túi 1.3cm",
    imageSrc: "/images/sections/announcement/product-1.jpg",
    href: "/products/keo-van-phong-mini",
    price: "25.000đ",
    ctaLabel: "Thêm vào giỏ",
    badge: "BEST SELLER",
    tones: ["#d9d2c8", "#d3b2a8", "#8fc9c3"],
  },
  {
    title: "Bút xóa ngòi mảnh nhỏ 2mm 8ml",
    imageSrc: "/images/sections/announcement/product-2.jpg",
    href: "/products/but-xoa-ngoi-manh",
    price: "25.000đ",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    title: "Bút dạ quang 6 cây 6 màu",
    imageSrc: "/images/sections/announcement/product-3.jpg",
    href: "/products/but-da-quang-6-mau",
    price: "25.000đ",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    title: "Bút bi đen 0.7mm 8 cây",
    imageSrc: "/images/sections/announcement/product-4.jpg",
    href: "/products/but-bi-den-8-cay",
    price: "25.000đ",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    title: "Nhiệt kế đo nhiệt độ phòng có nam châm hít",
    imageSrc: "/images/sections/announcement/product-5.jpg",
    href: "/products/nhiet-ke-do-phong",
    price: "25.000đ",
    ctaLabel: "Thêm vào giỏ",
    tones: ["#cfc6bf", "#91a8c4"],
  },
  {
    title: "Găng tay làm vườn chống trượt",
    imageSrc: "/images/sections/announcement/product-6.jpg",
    href: "/products/gang-tay-lam-vuon",
    price: "30.000đ",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    title: "Bộ tua vít chính xác mini",
    imageSrc: "/images/sections/announcement/product-7.jpg",
    href: "/products/bo-tua-vit-mini",
    price: "30.000đ",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    title: "Miếng lót chà chân tạo bọt",
    imageSrc: "/images/sections/announcement/product-8.jpg",
    href: "/products/mieng-lot-cha-chan",
    price: "35.000đ",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    title: "Móc dán tường trong suốt siêu chắc",
    imageSrc: "/images/sections/announcement/product-9.jpg",
    href: "/products/moc-dan-tuong-trong-suot",
    price: "35.000đ",
    ctaLabel: "Thêm vào giỏ",
  },
  {
    title: "Khăn microfiber lau bếp đa năng",
    imageSrc: "/images/sections/announcement/product-10.jpg",
    href: "/products/khan-microfiber-lau-bep",
    price: "35.000đ",
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
function parsePriceNumber(price: string) {
  const raw = price.replace(/[^\d]/g, "");
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

function extractHeadline(title?: string) {
  if (!title) return "Săn ngay hàng hot đồng giá 25K, 30K, 35K";
  return title;
}

function getTierItems(products: SectionSplitProductItem[]) {
  const grouped = { "25K": 0, "30K": 0, "35K": 0 };

  products.forEach((item) => {
    const num = parsePriceNumber(item.price);
    if (num <= 25000) grouped["25K"] += 1;
    else if (num <= 30000) grouped["30K"] += 1;
    else grouped["35K"] += 1;
  });

  return grouped;
}

/* ================= Component ================= */
export function SectionSplit({
  title = "Săn ngay hàng hot đồng giá 25K, 30K, 35K",
  filters,
  banner,
  products,
  preview = false,
}: SectionSplitProps) {
  const filterItems = useMemo(() => filters ?? DEFAULT_FILTERS, [filters]);
  const bannerData = useMemo(() => banner ?? DEFAULT_BANNER, [banner]);
  const productItems = useMemo(() => products ?? DEFAULT_PRODUCTS, [products]);
  const tierMap = useMemo(() => getTierItems(productItems), [productItems]);

  const onPreviewBlock = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const activeFilter = filterItems.find((f) => f.active)?.value ?? "all";

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return productItems;
    return productItems;
  }, [activeFilter, productItems]);

  const bubbleContent = (
    <div className={cls.bubble} aria-hidden="true">
      <div className={cls.bubbleInner}>
        <span className={cls.bubbleTop}>ĐỒNG GIÁ</span>
        <span className={`${cls.bubblePrice} ${cls.bubblePriceA}`}>25k</span>
        <span className={`${cls.bubblePrice} ${cls.bubblePriceB}`}>30k</span>
        <span className={`${cls.bubblePrice} ${cls.bubblePriceC}`}>35k</span>
      </div>
    </div>
  );

  const renderCard = (item: SectionSplitProductItem, index: number) => {
    const content = (
      <article className={cls.card}>
        <div className={cls.mediaWrap}>
          {item.badge ? <span className={cls.tag}>{item.badge}</span> : null}

          <div className={cls.media}>
            <Image
              src={item.imageSrc}
              alt={item.title}
              fill
              className={cls.image}
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          </div>

          {item.tones?.length ? (
            <div className={cls.swatches} aria-label="Biến thể màu">
              {item.tones.map((tone, toneIndex) => (
                <span key={`${index}-${toneIndex}`} className={cls.swatch} style={{ backgroundColor: tone }} />
              ))}
            </div>
          ) : null}
        </div>

        <div className={cls.body}>
          {item.brand ? <div className={cls.brand}>{item.brand}</div> : null}

          <h3 className={cls.productTitle}>{item.title}</h3>

          <div className={cls.metaRow}>
            <div className={cls.priceWrap}>
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
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7" />
                <path d="M12 9v5" />
                <path d="M9.5 11.5H14.5" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    );

    if (preview) {
      return (
        <a key={index} href="#" className={cls.cardLink} onClick={onPreviewBlock}>
          {content}
        </a>
      );
    }

    return (
      <Link key={index} href={(item.href || "/") as Route} className={cls.cardLink}>
        {content}
      </Link>
    );
  };

  return (
    <section className={cls.section} aria-label={title}>
      <div className={cls.shell}>
        <div className={cls.header}>
          <div className={cls.bubbleCol}>
            {preview ? (
              <a href="#" onClick={onPreviewBlock} className={cls.bubbleLink}>
                {bubbleContent}
              </a>
            ) : (
              <Link href={(bannerData.href || "/") as Route} className={cls.bubbleLink}>
                {bubbleContent}
              </Link>
            )}
          </div>

          <div className={cls.headlineWrap}>
            <h2 className={cls.headline}>{extractHeadline(title)}</h2>

            <div className={cls.priceChips} aria-label="Mức giá nổi bật">
              <span className={cls.chip}>25K · {tierMap["25K"]} sản phẩm</span>
              <span className={cls.chip}>30K · {tierMap["30K"]} sản phẩm</span>
              <span className={cls.chip}>35K · {tierMap["35K"]} sản phẩm</span>
            </div>
          </div>
        </div>

        <div className={cls.grid}>{filteredProducts.map((item, index) => renderCard(item, index))}</div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_SECTION_SPLIT: RegItem = {
  kind: "SectionSplit",
  label: "Section Split",
  defaults: {
    title: "Săn ngay hàng hot đồng giá 25K, 30K, 35K",
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
    const filters = safeJson<SectionSplitFilterItem[]>(p.filters);
    const banner = safeJson<SectionSplitBanner>(p.banner);
    const products = safeJson<SectionSplitProductItem[]>(p.products);

    return (
      <div className="sectionContainer" aria-label="Shop Section Split">
        <SectionSplit
          title={String(p.title || "Săn ngay hàng hot đồng giá 25K, 30K, 35K")}
          filters={filters}
          banner={banner}
          products={products}
          preview={true}
        />
      </div>
    );
  },
};

export default SectionSplit;

"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/makeup/makeup1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type MakeupTab = "all" | "lip" | "eye" | "base";

export type MakeupBanner = {
  href: string;
  imageSrc: string;
  imageAlt?: string;
  tag: string;
  title: string;
  sub: string;
};

export type MakeupProduct = {
  id: string;
  name: string;
  imageSrc: string;
  imageAlt?: string;
  href?: string;

  price: string; // "255,000đ"
  categoryLabel?: string; // "Lip"
  cat: Exclude<MakeupTab, "all">;

  ribbon?: string; // "NEW" | "HOT"
  countBubble?: string; // "23"

  rating?: number; // 4.8
};

export type Makeup1Props = {
  title?: string;
  badgeText?: string;
  moreLabel?: string;
  moreHref?: string;

  tabs?: { label: string; value: MakeupTab }[];

  banner?: MakeupBanner;

  /** runtime direct */
  products?: MakeupProduct[];

  /** builder JSON string */
  productsJson?: string;

  preview?: boolean;

  /** default tab */
  defaultTab?: MakeupTab;
};

/* ================= Defaults ================= */
const DEFAULT_TABS: { label: string; value: MakeupTab }[] = [
  { label: "All", value: "all" },
  { label: "Lip Makeup", value: "lip" },
  { label: "Eye Makeup", value: "eye" },
  { label: "Base Makeup", value: "base" },
];

const DEFAULT_BANNER: MakeupBanner = {
  href: "/makeup",
  imageSrc: "/images/product.jpg",
  imageAlt: "Makeup banner",
  tag: "Authentic • New Arrivals",
  title: "Makeup picks for you",
  sub: "Top brands • Best sellers • Great deals",
};

const DEFAULT_PRODUCTS: MakeupProduct[] = [
  {
    id: "mk-1",
    cat: "lip",
    categoryLabel: "Lip",
    ribbon: "NEW",
    rating: 4.8,
    price: "255,000đ",
    name: "Daliv Silky Glow Lip Balm – Pink shade, moisturizing and softening lips",
    imageSrc: "/images/product.jpg",
    imageAlt: "Lip makeup product",
    href: "/product/mk-1",
  },
  {
    id: "mk-2",
    cat: "lip",
    categoryLabel: "Lip",
    ribbon: "NEW",
    rating: 4.7,
    price: "255,000đ",
    name: "Daliv Silky Glow Lip Balm – Orange shade, moisturizing and softening lips",
    imageSrc: "/images/product.jpg",
    imageAlt: "Lip makeup product",
    href: "/product/mk-2",
  },
  {
    id: "mk-3",
    cat: "base",
    categoryLabel: "Base",
    ribbon: "HOT",
    countBubble: "23",
    rating: 4.9,
    price: "596,000đ",
    name: "Daliv Ultra-Fine Setting Powder No.23 – 20g",
    imageSrc: "/images/product.jpg",
    imageAlt: "Base makeup product",
    href: "/product/mk-3",
  },
  {
    id: "mk-4",
    cat: "lip",
    categoryLabel: "Lip",
    rating: 4.6,
    price: "86,000đ",
    name: "Eveline Extra Soft Bio Lip Balm – Coconut scent, moisturizing, 4g",
    imageSrc: "/images/product.jpg",
    imageAlt: "Lip care product",
    href: "/product/mk-4",
  },
  {
    id: "mk-5",
    cat: "eye",
    categoryLabel: "Eye",
    rating: 4.5,
    price: "199,000đ",
    name: "Waterproof Mascara – Long lash & curl, all day",
    imageSrc: "/images/product.jpg",
    imageAlt: "Eye makeup product",
    href: "/product/mk-5",
  },
  {
    id: "mk-6",
    cat: "base",
    categoryLabel: "Base",
    rating: 4.6,
    price: "289,000đ",
    name: "Lightweight Cushion Foundation – Natural finish",
    imageSrc: "/images/product.jpg",
    imageAlt: "Base makeup product",
    href: "/product/mk-6",
  },
];

/* ================= JSON Helpers (Hero1-like) ================= */
function safeJson<T>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function parseProducts(raw?: string): MakeupProduct[] | undefined {
  const val = safeJson<unknown>(raw);
  if (!val || !Array.isArray(val)) return undefined;

  const cleaned: MakeupProduct[] = [];

  for (const it of val) {
    if (!it) continue;

    const id = String((it as any).id ?? "");
    const name = String((it as any).name ?? "");
    const imageSrc = String((it as any).imageSrc ?? "");
    const price = String((it as any).price ?? "");
    const cat = String((it as any).cat ?? "") as MakeupTab;

    if (!id || !name || !imageSrc || !price) continue;
    if (cat !== "lip" && cat !== "eye" && cat !== "base") continue;

    cleaned.push({
      id,
      name,
      imageSrc,
      price,
      cat,
      imageAlt: (it as any).imageAlt ? String((it as any).imageAlt) : undefined,
      href: (it as any).href ? String((it as any).href) : undefined,
      categoryLabel: (it as any).categoryLabel ? String((it as any).categoryLabel) : undefined,
      ribbon: (it as any).ribbon ? String((it as any).ribbon) : undefined,
      countBubble: (it as any).countBubble ? String((it as any).countBubble) : undefined,
      rating: typeof (it as any).rating === "number" ? (it as any).rating : undefined,
    });
  }

  return cleaned.length ? cleaned : undefined;
}

/* ================= Component ================= */
export function Makeup1({
  title = "MAKE UP",
  badgeText = "Hot",
  moreLabel = "View more",
  moreHref = "/makeup",

  tabs,
  banner,

  products,
  productsJson,

  preview = false,
  defaultTab = "lip",
}: Makeup1Props) {
  const tabItems = useMemo(() => tabs ?? DEFAULT_TABS, [tabs]);
  const bn = useMemo(() => banner ?? DEFAULT_BANNER, [banner]);

  const list = useMemo(() => {
    return products ?? parseProducts(productsJson) ?? DEFAULT_PRODUCTS;
  }, [products, productsJson]);

  const [active, setActive] = useState<MakeupTab>(defaultTab);

  const filtered = useMemo(() => {
    if (active === "all") return list;
    return list.filter((p) => p.cat === active);
  }, [active, list]);

  const block = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <section className={cls.mk} aria-label="Makeup products">
      {/* Header */}
      <div className={cls.head}>
        <div className={cls.left}>
          <h2 className={cls.title}>{title}</h2>
          {!!badgeText && <span className={cls.badge}>{badgeText}</span>}
        </div>

        <div className={cls.tabs} role="tablist" aria-label="Makeup tabs">
          {tabItems.map((t) => {
            const isActive = t.value === active;

            return (
              <button
                key={t.value}
                suppressHydrationWarning
                className={`${cls.tab} ${isActive ? cls.tabActive : ""}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={(e) => {
                  if (preview) return block(e);
                  setActive(t.value);
                }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {preview ? (
          <button className={cls.more} type="button" onClick={block}>
            {moreLabel}
          </button>
        ) : (
          <Link className={cls.more} href={(moreHref || "/makeup") as Route}>
            {moreLabel}
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className={cls.grid}>
        {/* Banner (always visible) */}
        {preview ? (
          <a className={cls.banner} href="#" aria-label="Makeup banner" onClick={block}>
            <div className={cls.bannerImg}>
              <Image src={bn.imageSrc} alt={bn.imageAlt || "Makeup banner"} fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            </div>
            <div className={cls.bannerText}>
              <div className={cls.bannerTag}>{bn.tag}</div>
              <div className={cls.bannerTitle}>{bn.title}</div>
              <div className={cls.bannerSub}>{bn.sub}</div>
            </div>
          </a>
        ) : (
          <Link className={cls.banner} href={(bn.href || "/makeup") as Route} aria-label="Makeup banner">
            <div className={cls.bannerImg}>
              <Image src={bn.imageSrc} alt={bn.imageAlt || "Makeup banner"} fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            </div>
            <div className={cls.bannerText}>
              <div className={cls.bannerTag}>{bn.tag}</div>
              <div className={cls.bannerTitle}>{bn.title}</div>
              <div className={cls.bannerSub}>{bn.sub}</div>
            </div>
          </Link>
        )}

        {/* Products */}
        {filtered.map((p) => {
          const rating = p.rating;

          const CardInner = (
            <div className={cls.p}>
              {!!p.ribbon && <span className={cls.ribbon}>{p.ribbon}</span>}
              {!!p.countBubble && <span className={cls.countBubble}>{p.countBubble}</span>}

              <div className={cls.pImg}>
                <div className={cls.pImgInner}>
                  <Image src={p.imageSrc} alt={p.imageAlt || p.name} fill sizes="(max-width: 520px) 100vw, (max-width: 820px) 50vw, 25vw" style={{ objectFit: "contain" }} />
                </div>
              </div>

              <div className={cls.pInfo}>
                <div className={cls.pRow}>
                  <div className={cls.pPrice}>{p.price}</div>

                  {rating != null && (
                    <div className={cls.pRating} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
                      <span className={cls.stars} style={{ ["--rating" as any]: rating }} />
                      <span className={cls.score}>{rating.toFixed(1)}</span>
                      {!!p.categoryLabel && <span className={cls.pCategory}>{p.categoryLabel}</span>}
                    </div>
                  )}
                </div>

                <div className={cls.pName} title={p.name}>
                  {p.name}
                </div>
              </div>
            </div>
          );

          return (
            <article key={p.id} className={cls.pWrap}>
              {preview || !p.href ? (
                <div className={cls.pLink} role="group" aria-label={p.name}>
                  {CardInner}
                </div>
              ) : (
                <Link className={cls.pLink} href={p.href as Route} aria-label={p.name}>
                  {CardInner}
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Makeup1;

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_MAKEUP_GREEN_ONE: RegItem = {
  kind: "Makeup1",
  label: "Makeup Grid",
  defaults: {
    title: "MAKE UP",
    badgeText: "Hot",
    moreLabel: "View more",
    moreHref: "/makeup",
    defaultTab: "lip",

    tabs: JSON.stringify(DEFAULT_TABS, null, 2),
    banner: JSON.stringify(DEFAULT_BANNER, null, 2),
    products: JSON.stringify(DEFAULT_PRODUCTS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "badgeText", label: "Badge", kind: "text" },
    { key: "moreLabel", label: "More label", kind: "text" },
    { key: "moreHref", label: "More href", kind: "text" },
    { key: "defaultTab", label: "Default tab (all/lip/eye/base)", kind: "text" },

    { key: "tabs", label: "Tabs (JSON)", kind: "textarea", rows: 8 },
    { key: "banner", label: "Banner (JSON)", kind: "textarea", rows: 8 },
    { key: "products", label: "Products (JSON)", kind: "textarea", rows: 14 },
  ],
  render: (p) => {
    const tabs = safeJson<{ label: string; value: MakeupTab }[]>(p.tabs);
    const banner = safeJson<MakeupBanner>(p.banner);
    const productsJson = typeof p.products === "string" ? p.products : undefined;

    const def = String(p.defaultTab ?? "lip") as MakeupTab;

    return (
      <div className="sectionContainer" aria-label="Shop Makeup (Green One)">
        <Makeup1
          title={String(p.title ?? "MAKE UP")}
          badgeText={String(p.badgeText ?? "Hot")}
          moreLabel={String(p.moreLabel ?? "View more")}
          moreHref={String(p.moreHref ?? "/makeup")}
          defaultTab={def}
          tabs={tabs}
          banner={banner}
          productsJson={productsJson}
          preview={true}
        />
      </div>
    );
  },
};

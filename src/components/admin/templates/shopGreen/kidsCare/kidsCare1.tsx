"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/kidsCare/kidsCare1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type Ribbon = "NEW" | "HOT" | "BEST";

function isRibbon(v: unknown): v is Ribbon {
  return v === "NEW" || v === "HOT" || v === "BEST";
}

/* ================= Types ================= */
export type KidsTab = {
  label: string;
  value: string; // "all" | "bath" | ...
};

export type KidsBanner = {
  href: string;
  imageSrc: string;
  imageAlt?: string;
  tag: string;
  title: string;
  sub: string;
};

export type KidsProduct = {
  id: string;
  cat: string; // must match tab value (except "all")
  ribbon?: "NEW" | "HOT" | "BEST";
  bubble?: string; // e.g. "SPF 50"

  imageSrc: string;
  imageAlt?: string;

  price: string;
  rating?: number; // 0..5
  categoryLabel?: string; // "Bath"
  name: string;

  href?: string;
};

export type KidsCare1Props = {
  title?: string;
  badgeText?: string;

  tabs?: KidsTab[];
  defaultTab?: string;

  moreLabel?: string;
  moreHref?: string;

  banner?: KidsBanner;

  items?: KidsProduct[];
  itemsJson?: string;

  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_TABS: KidsTab[] = [
  { label: "All", value: "all" },
  { label: "Bath & Wash", value: "bath" },
  { label: "Moisturizer", value: "lotion" },
  { label: "Sun Care", value: "sun" },
  { label: "Diaper Care", value: "diaper" },
];

const DEFAULT_BANNER: KidsBanner = {
  href: "/kids-care",
  imageSrc: "/images/product.jpg",
  imageAlt: "Kids care banner",
  tag: "Gentle • Safe picks",
  title: "Kids essentials for everyday care",
  sub: "Bath time • Moisture • Sun protection",
};

const DEFAULT_ITEMS: KidsProduct[] = [
  {
    id: "kc-1",
    cat: "bath",
    ribbon: "NEW",
    imageSrc: "/images/product.jpg",
    imageAlt: "Kids gentle shampoo",
    price: "129,000đ",
    rating: 4.8,
    categoryLabel: "Bath",
    name: "Gentle Shampoo & Body Wash — mild formula for kids 250ml",
    href: "/product/kc-1",
  },
  {
    id: "kc-2",
    cat: "lotion",
    ribbon: "HOT",
    imageSrc: "/images/product.jpg",
    imageAlt: "Kids body lotion",
    price: "159,000đ",
    rating: 4.7,
    categoryLabel: "Lotion",
    name: "Daily Moisturizing Lotion — soft skin & long hydration 200ml",
    href: "/product/kc-2",
  },
  {
    id: "kc-3",
    cat: "sun",
    ribbon: "BEST",
    bubble: "SPF 50",
    imageSrc: "/images/product.jpg",
    imageAlt: "Kids sunscreen",
    price: "219,000đ",
    rating: 4.9,
    categoryLabel: "Sun",
    name: "Kids Sunscreen SPF50+ — lightweight, non-sticky 50ml",
    href: "/product/kc-3",
  },
  {
    id: "kc-4",
    cat: "diaper",
    ribbon: "NEW",
    imageSrc: "/images/product.jpg",
    imageAlt: "Diaper rash cream",
    price: "145,000đ",
    rating: 4.6,
    categoryLabel: "Diaper",
    name: "Diaper Rash Cream — protective barrier & soothing care 50g",
    href: "/product/kc-4",
  },
];

/* ================= JSON Helpers (like Hero1) ================= */
function safeJson<T>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function parseProducts(raw?: string): KidsProduct[] | undefined {
  const val = safeJson<unknown>(raw);
  if (!val || !Array.isArray(val)) return undefined;

  const cleaned: KidsProduct[] = [];
  for (const it of val) {
    if (!it) continue;

    const id = String((it as any).id ?? "");
    const cat = String((it as any).cat ?? "");
    const imageSrc = String((it as any).imageSrc ?? "");
    const price = String((it as any).price ?? "");
    const name = String((it as any).name ?? "");

    if (!id || !cat || !imageSrc || !price || !name) continue;

    const rawRibbon = (it as any).ribbon;
    const rawRating = (it as any).rating;

    cleaned.push({
      id,
      cat,
      imageSrc,
      price,
      name,

      imageAlt: (it as any).imageAlt ? String((it as any).imageAlt) : undefined,
      href: (it as any).href ? String((it as any).href) : undefined,

      ribbon: isRibbon(rawRibbon) ? rawRibbon : undefined,
      bubble: (it as any).bubble ? String((it as any).bubble) : undefined,

      categoryLabel: (it as any).categoryLabel ? String((it as any).categoryLabel) : undefined,
      rating: typeof rawRating === "number" ? rawRating : undefined,
    });
  }

  return cleaned.length ? cleaned : undefined;
}

/* ================= Component ================= */
export function KidsCare1({
  title = "KIDS CARE",
  badgeText = "Gentle",
  tabs,
  defaultTab = "all",
  moreLabel = "View more",
  moreHref = "/kids-care",
  banner,
  items,
  itemsJson,
  preview = false,
}: KidsCare1Props) {
  const tb = useMemo(() => tabs ?? DEFAULT_TABS, [tabs]);
  const bn = useMemo(() => banner ?? DEFAULT_BANNER, [banner]);
  const list = useMemo(() => items ?? parseProducts(itemsJson) ?? DEFAULT_ITEMS, [items, itemsJson]);

  const [active, setActive] = useState(defaultTab);

  const block = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const filtered = useMemo(() => {
    if (active === "all") return list;
    return list.filter((p) => p.cat === active);
  }, [active, list]);

  return (
    <section className={cls.mk} aria-label="Kids & Baby Care">
      {/* Header */}
      <div className={cls.mkHead}>
        <div className={cls.bsLeft}>
          <h2 className={cls.bsTitle}>{title}</h2>
          {!!badgeText && <span className={cls.bsBadge}>{badgeText}</span>}
        </div>

        <div className={cls.mkTabs} role="tablist" aria-label="Kids care tabs">
          {tb.map((t) => {
            const isActive = t.value === active;
            return (
              <button
                key={t.value}
                suppressHydrationWarning
                className={`${cls.mkTab} ${isActive ? cls.active : ""}`}
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
          <button className={cls.mkMore} type="button" onClick={block}>
            {moreLabel}
          </button>
        ) : (
          <Link className={cls.mkMore} href={(moreHref || "/kids-care") as Route}>
            {moreLabel}
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className={cls.mkGrid}>
        {/* Banner (always visible) */}
        {preview ? (
          <a className={cls.mkBanner} href="#" aria-label="Kids care banner" onClick={block}>
            <div className={cls.mkBannerImg}>
              <Image src={bn.imageSrc} alt={bn.imageAlt || "Kids care banner"} fill sizes="(max-width: 820px) 100vw, 40vw" style={{ objectFit: "cover" }} />
            </div>

            <div className={cls.mkBannerText}>
              <div className={cls.mkBannerTag}>{bn.tag}</div>
              <div className={cls.mkBannerTitle}>{bn.title}</div>
              <div className={cls.mkBannerSub}>{bn.sub}</div>
            </div>
          </a>
        ) : (
          <Link className={cls.mkBanner} href={(bn.href || "/kids-care") as Route} aria-label="Kids care banner">
            <div className={cls.mkBannerImg}>
              <Image src={bn.imageSrc} alt={bn.imageAlt || "Kids care banner"} fill sizes="(max-width: 820px) 100vw, 40vw" style={{ objectFit: "cover" }} />
            </div>

            <div className={cls.mkBannerText}>
              <div className={cls.mkBannerTag}>{bn.tag}</div>
              <div className={cls.mkBannerTitle}>{bn.title}</div>
              <div className={cls.mkBannerSub}>{bn.sub}</div>
            </div>
          </Link>
        )}

        {/* Products */}
        {filtered.map((p) => {
          const rating = p.rating;
          const Card = (
            <article className={cls.p} data-cat={p.cat} aria-label={p.name}>
              {!!p.ribbon && <span className={cls.ribbon}>{p.ribbon}</span>}
              {!!p.bubble && <span className={cls.countBubble}>{p.bubble}</span>}

              <div className={cls.pImg}>
                <div className={cls.pImgInner}>
                  <Image src={p.imageSrc} alt={p.imageAlt || p.name} fill sizes="(max-width: 520px) 100vw, (max-width: 820px) 50vw, 20vw" style={{ objectFit: "contain" }} />
                </div>
              </div>

              <div className={cls.pInfo}>
                <div className={cls.pRow}>
                  <div className={cls.pPrice}>{p.price}</div>

                  {rating != null && (
                    <div className={cls.pRating} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
                      <span className={cls.stars} style={{ ["--rating" as any]: rating } as React.CSSProperties} />
                      <span className={cls.score}>{rating.toFixed(1)}</span>
                      {!!p.categoryLabel && <span className={cls.pCategory}>{p.categoryLabel}</span>}
                    </div>
                  )}
                </div>

                <div className={cls.pName} title={p.name}>
                  {p.name}
                </div>
              </div>
            </article>
          );

          if (preview || !p.href) return <div key={p.id}>{Card}</div>;

          return (
            <Link key={p.id} href={p.href as Route} className={cls.itemLink}>
              {Card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default KidsCare1;

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_KIDS_CARE_GREEN_ONE: RegItem = {
  kind: "KidsCare1",
  label: "Kids Care",
  defaults: {
    title: "KIDS CARE",
    badgeText: "Gentle",
    defaultTab: "all",
    moreLabel: "View more",
    moreHref: "/kids-care",

    tabs: JSON.stringify(DEFAULT_TABS, null, 2),
    banner: JSON.stringify(DEFAULT_BANNER, null, 2),
    items: JSON.stringify(DEFAULT_ITEMS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "badgeText", label: "Badge", kind: "text" },
    { key: "defaultTab", label: "Default tab", kind: "text" },
    { key: "moreLabel", label: "More label", kind: "text" },
    { key: "moreHref", label: "More href", kind: "text" },

    { key: "tabs", label: "Tabs (JSON)", kind: "textarea", rows: 10 },
    { key: "banner", label: "Banner (JSON)", kind: "textarea", rows: 10 },
    { key: "items", label: "Items (JSON)", kind: "textarea", rows: 14 },
  ],
  render: (p) => {
    const tabs = safeJson<KidsTab[]>(p.tabs);
    const banner = safeJson<KidsBanner>(p.banner);

    return (
      <div className="sectionContainer" aria-label="Shop Kids Care (Green One)">
        <KidsCare1
          title={String(p.title ?? "KIDS CARE")}
          badgeText={String(p.badgeText ?? "Gentle")}
          defaultTab={String(p.defaultTab ?? "all")}
          moreLabel={String(p.moreLabel ?? "View more")}
          moreHref={String(p.moreHref ?? "/kids-care")}
          tabs={tabs}
          banner={banner}
          itemsJson={typeof p.items === "string" ? p.items : undefined}
          preview={true}
        />
      </div>
    );
  },
};

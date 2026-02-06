"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/menCare/menCare1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type MenCareTabValue = "all" | "face" | "hair" | "body" | "shaving" | "fragrance";
export type MenCareBadge = "NEW" | "HOT" | "BEST";

export type MenCareTab = {
  label: string;
  value: MenCareTabValue;
};

export type MenCareItem = {
  id: string;
  cat: MenCareTabValue;

  name: string;
  imageSrc: string;
  imageAlt?: string;
  href?: string;

  price: string;

  brand?: string;
  chip?: string;

  rating?: number;
  ratingCount?: number;

  badge?: MenCareBadge;
};

export type MenCare1Props = {
  title?: string;
  subtitle?: string;

  tabs?: MenCareTab[];
  defaultTab?: MenCareTabValue;

  moreLabel?: string;
  moreHref?: string;

  // spotlight
  spotTag?: string;
  spotTitle?: string;
  spotSub?: string;
  spotStats?: Array<{ num: string; text: string }>;
  spotPrimaryLabel?: string;
  spotGhostLabel?: string;
  spotImageSrc?: string;
  spotOverlayTitle?: string;
  spotOverlaySub?: string;

  // items
  items?: MenCareItem[];
  itemsJson?: string;

  preview?: boolean;
};

/* ================= Type Guards ================= */
function isBadge(v: unknown): v is MenCareBadge {
  return v === "NEW" || v === "HOT" || v === "BEST";
}

function isTabValue(v: unknown): v is MenCareTabValue {
  return v === "all" || v === "face" || v === "hair" || v === "body" || v === "shaving" || v === "fragrance";
}

/* ================= Defaults ================= */
const DEFAULT_TABS: MenCareTab[] = [
  { label: "All", value: "all" },
  { label: "Face", value: "face" },
  { label: "Hair", value: "hair" },
  { label: "Body", value: "body" },
  { label: "Shaving", value: "shaving" },
  { label: "Fragrance", value: "fragrance" },
];

const DEFAULT_ITEMS: MenCareItem[] = [
  {
    id: "m1",
    cat: "face",
    name: "Daily Face Cleanser — deep clean without dryness 150ml",
    imageSrc: "/images/product.jpg",
    price: "189,000₫",
    brand: "MenLab",
    chip: "Face",
    rating: 4.8,
    ratingCount: 128,
    badge: "NEW",
    href: "/product/m1",
  },
  {
    id: "m2",
    cat: "shaving",
    name: "Shave Gel — smooth glide, no irritation 200ml",
    imageSrc: "/images/product.jpg",
    price: "159,000₫",
    brand: "GroomPro",
    chip: "Shaving",
    rating: 4.7,
    ratingCount: 94,
    badge: "HOT",
    href: "/product/m2",
  },
  {
    id: "m3",
    cat: "hair",
    name: "Anti-Oil Shampoo — fresh scalp & clean finish 300ml",
    imageSrc: "/images/product.jpg",
    price: "175,000₫",
    brand: "MenLab",
    chip: "Hair",
    rating: 4.9,
    ratingCount: 210,
    badge: "BEST",
    href: "/product/m3",
  },
];

/* ================= JSON Helpers (Hero1-style) ================= */
function safeJson<T>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function parseTabs(raw?: string): MenCareTab[] | undefined {
  const val = safeJson<unknown>(raw);
  if (!val || !Array.isArray(val)) return undefined;

  const out: MenCareTab[] = [];
  for (const it of val) {
    if (!it) continue;
    const label = String((it as any).label ?? "");
    const value = (it as any).value;
    if (!label || !isTabValue(value)) continue;
    out.push({ label, value });
  }
  return out.length ? out : undefined;
}

function parseItems(raw?: string): MenCareItem[] | undefined {
  const val = safeJson<unknown>(raw);
  if (!val || !Array.isArray(val)) return undefined;

  const cleaned: MenCareItem[] = [];
  for (const it of val) {
    if (!it) continue;

    const id = String((it as any).id ?? "");
    const cat = (it as any).cat;
    const name = String((it as any).name ?? "");
    const imageSrc = String((it as any).imageSrc ?? "");
    const price = String((it as any).price ?? "");

    if (!id || !name || !imageSrc || !price || !isTabValue(cat)) continue;

    cleaned.push({
      id,
      cat,
      name,
      imageSrc,
      price,

      imageAlt: (it as any).imageAlt ? String((it as any).imageAlt) : undefined,
      href: (it as any).href ? String((it as any).href) : undefined,

      brand: (it as any).brand ? String((it as any).brand) : undefined,
      chip: (it as any).chip ? String((it as any).chip) : undefined,

      rating: typeof (it as any).rating === "number" ? (it as any).rating : undefined,
      ratingCount: typeof (it as any).ratingCount === "number" ? (it as any).ratingCount : undefined,

      badge: isBadge((it as any).badge) ? (it as any).badge : undefined,
    });
  }

  return cleaned.length ? cleaned : undefined;
}

/* ================= Component ================= */
export function MenCare1({
  title = "FOR MEN",
  subtitle = "Daily essentials for face, hair, body & grooming.",

  tabs,
  defaultTab = "all",

  moreLabel = "View more →",
  moreHref = "/men",

  spotTag = "Editor’s selection",
  spotTitle = "Clean look. Fresh feel. All day.",
  spotSub = "Top picks with minimalist formulas and strong performance.",
  spotStats = [
    { num: "200+", text: "Products" },
    { num: "4.8★", text: "Rating" },
    { num: "Fast", text: "Delivery" },
  ],
  spotPrimaryLabel = "Explore combos",
  spotGhostLabel = "Get advice",
  spotImageSrc = "/images/product.jpg",
  spotOverlayTitle = "Grooming Essentials",
  spotOverlaySub = "Smart picks for modern men",

  items,
  itemsJson,

  preview = false,
}: MenCare1Props) {
  const tb = useMemo(() => tabs ?? DEFAULT_TABS, [tabs]);
  const list = useMemo(() => items ?? parseItems(itemsJson) ?? DEFAULT_ITEMS, [items, itemsJson]);

  const [active, setActive] = useState<MenCareTabValue>(defaultTab);
  useEffect(() => setActive(defaultTab), [defaultTab]);

  const railRef = React.useRef<HTMLDivElement | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const block = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const filtered = useMemo(() => {
    if (active === "all") return list;
    return list.filter((x) => x.cat === active);
  }, [active, list]);

  const onNav = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = Math.max(320, rail.clientWidth * 0.85);
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const toggleWish = (id: string) => setLiked((m) => ({ ...m, [id]: !m[id] }));

  return (
    <section className={cls.menSection} aria-label="Men care">
      {/* Head */}
      <header className={cls.menHead}>
        <div className={cls.menTitleWrap}>
          <h2 className={cls.menTitle}>{title}</h2>
          {!!subtitle && <p className={cls.menSubtitle}>{subtitle}</p>}
        </div>

        <div className={cls.menControls}>
          <div className={cls.menTabs} role="tablist" aria-label="Men care tabs">
            {tb.map((t) => {
              const isActive = t.value === active;
              return (
                <button
                  key={t.value}
                  className={`${cls.menTab} ${isActive ? cls.isActive : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={(e) => {
                    if (preview) return block(e);
                    setActive(t.value);
                    railRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                  }}>
                  {t.label}
                </button>
              );
            })}
          </div>

          {preview ? (
            <button className={cls.menMore} type="button" onClick={block}>
              {moreLabel}
            </button>
          ) : (
            <Link className={cls.menMore} href={(moreHref || "/men") as Route}>
              {moreLabel}
            </Link>
          )}
        </div>
      </header>

      {/* Spotlight */}
      <div className={cls.menSpotlight}>
        <div className={cls.menSpotCard}>
          {!!spotTag && <div className={cls.menSpotTag}>{spotTag}</div>}
          {!!spotTitle && <div className={cls.menSpotTitle}>{spotTitle}</div>}
          {!!spotSub && <div className={cls.menSpotSub}>{spotSub}</div>}

          {!!spotStats?.length && (
            <div className={cls.menSpotStats}>
              {spotStats.slice(0, 3).map((s, idx) => (
                <div className={cls.menStat} key={idx}>
                  <div className={cls.menStatNum}>{s.num}</div>
                  <div className={cls.menStatText}>{s.text}</div>
                </div>
              ))}
            </div>
          )}

          <div className={cls.menSpotActions}>
            <button className={`${cls.menBtn} ${cls.menBtnPrimary}`} type="button" onClick={block}>
              {spotPrimaryLabel}
            </button>
            <button className={`${cls.menBtn} ${cls.menBtnGhost}`} type="button" onClick={block}>
              {spotGhostLabel}
            </button>
          </div>
        </div>

        <div className={cls.menSpotMedia} aria-hidden="true">
          <Image src={spotImageSrc} alt="" fill sizes="(max-width: 980px) 100vw, 40vw" style={{ objectFit: "cover" }} />
          <div className={cls.menSpotOverlay}>
            <div className={cls.menOverlayTitle}>{spotOverlayTitle}</div>
            <div className={cls.menOverlaySub}>{spotOverlaySub}</div>
          </div>
        </div>
      </div>

      {/* Rail */}
      <div className={cls.menRailWrap}>
        <div className={cls.menRail} ref={railRef} aria-label="Men products list">
          {filtered.map((it) => {
            const rating = it.rating;
            const isLiked = !!liked[it.id];

            const CardInner = (
              <>
                {!!it.badge && <span className={`${cls.menBadge} ${it.badge === "HOT" ? cls.menBadgeHot : ""}`}>{it.badge}</span>}

                <button
                  className={`${cls.menWish} ${isLiked ? cls.isLiked : ""}`}
                  type="button"
                  aria-label="Wishlist"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (preview) return;
                    toggleWish(it.id);
                  }}>
                  <i className={`bi ${isLiked ? "bi-heart-fill" : "bi-heart"}`} />
                </button>

                <div className={cls.menThumb}>
                  <Image src={it.imageSrc} alt={it.imageAlt || it.name} fill sizes="160px" style={{ objectFit: "contain" }} />
                </div>

                <div className={cls.menInfo}>
                  <div className={cls.menTopLine}>
                    <div className={cls.menPrice}>{it.price}</div>

                    {rating != null && (
                      <div className={cls.menRating} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
                        <span className={cls.menStars} style={{ ["--rating" as any]: rating } as React.CSSProperties} />
                        <span className={cls.menScore}>{rating.toFixed(1)}</span>
                        {it.ratingCount != null && <span className={cls.menCount}>({it.ratingCount})</span>}
                      </div>
                    )}
                  </div>

                  <div className={cls.menMeta}>
                    {!!it.chip && <span className={cls.menChip}>{it.chip}</span>}
                    {!!it.brand && <span className={cls.menBrand}>{it.brand}</span>}
                  </div>

                  <h3 className={cls.menName}>{it.name}</h3>

                  <div className={cls.menCtaRow}>
                    <button className={`${cls.menCta} ${cls.menCtaAdd}`} type="button" onClick={block}>
                      Add to cart
                    </button>
                    <button className={`${cls.menCta} ${cls.menCtaQuick}`} type="button" onClick={block}>
                      Quick view
                    </button>
                  </div>
                </div>
              </>
            );

            if (preview || !it.href) {
              return (
                <article className={cls.menItem} data-cat={it.cat} key={it.id}>
                  {CardInner}
                </article>
              );
            }

            return (
              <Link className={cls.menItem} data-cat={it.cat} key={it.id} href={it.href as Route} aria-label={it.name}>
                {CardInner}
              </Link>
            );
          })}
        </div>

        <div className={cls.menNav}>
          <button className={cls.menNavBtn} type="button" aria-label="Previous" onClick={preview ? (e) => block(e) : () => onNav(-1)}>
            <i className="bi bi-chevron-left" />
          </button>
          <button className={cls.menNavBtn} type="button" aria-label="Next" onClick={preview ? (e) => block(e) : () => onNav(1)}>
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default MenCare1;

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_MEN_CARE_GREEN_ONE: RegItem = {
  kind: "MenCare1",
  label: "Men Care",
  defaults: {
    title: "FOR MEN",
    subtitle: "Daily essentials for face, hair, body & grooming.",

    defaultTab: "all",
    moreLabel: "View more →",
    moreHref: "/men",

    spotTag: "Editor’s selection",
    spotTitle: "Clean look. Fresh feel. All day.",
    spotSub: "Top picks with minimalist formulas and strong performance.",
    spotStats: JSON.stringify(
      [
        { num: "200+", text: "Products" },
        { num: "4.8★", text: "Rating" },
        { num: "Fast", text: "Delivery" },
      ],
      null,
      2,
    ),
    spotPrimaryLabel: "Explore combos",
    spotGhostLabel: "Get advice",
    spotImageSrc: "/images/product.jpg",
    spotOverlayTitle: "Grooming Essentials",
    spotOverlaySub: "Smart picks for modern men",

    tabs: JSON.stringify(DEFAULT_TABS, null, 2),
    items: JSON.stringify(DEFAULT_ITEMS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "text" },
    { key: "defaultTab", label: "Default tab", kind: "text" },

    { key: "moreLabel", label: "More label", kind: "text" },
    { key: "moreHref", label: "More href", kind: "text" },

    { key: "spotTag", label: "Spot tag", kind: "text" },
    { key: "spotTitle", label: "Spot title", kind: "text" },
    { key: "spotSub", label: "Spot sub", kind: "text" },
    { key: "spotPrimaryLabel", label: "Spot primary label", kind: "text" },
    { key: "spotGhostLabel", label: "Spot ghost label", kind: "text" },
    { key: "spotImageSrc", label: "Spot image src", kind: "text" },
    { key: "spotOverlayTitle", label: "Overlay title", kind: "text" },
    { key: "spotOverlaySub", label: "Overlay sub", kind: "text" },

    { key: "tabs", label: "Tabs (JSON)", kind: "textarea", rows: 10 },
    { key: "items", label: "Items (JSON)", kind: "textarea", rows: 14 },
    { key: "spotStats", label: "Spot stats (JSON)", kind: "textarea", rows: 8 },
  ],
  render: (p: any) => {
    const tabs = parseTabs(typeof p.tabs === "string" ? p.tabs : undefined);
    const spotStats = safeJson<Array<{ num: string; text: string }>>(typeof p.spotStats === "string" ? p.spotStats : undefined);

    return (
      <div className="sectionContainer" aria-label="Shop Men Care (Green One)">
        <MenCare1
          title={String(p.title ?? "FOR MEN")}
          subtitle={String(p.subtitle ?? "Daily essentials for face, hair, body & grooming.")}
          defaultTab={isTabValue(p.defaultTab) ? p.defaultTab : "all"}
          moreLabel={String(p.moreLabel ?? "View more →")}
          moreHref={String(p.moreHref ?? "/men")}
          tabs={tabs}
          spotTag={String(p.spotTag ?? "Editor’s selection")}
          spotTitle={String(p.spotTitle ?? "Clean look. Fresh feel. All day.")}
          spotSub={String(p.spotSub ?? "Top picks with minimalist formulas and strong performance.")}
          spotStats={Array.isArray(spotStats) ? spotStats : undefined}
          spotPrimaryLabel={String(p.spotPrimaryLabel ?? "Explore combos")}
          spotGhostLabel={String(p.spotGhostLabel ?? "Get advice")}
          spotImageSrc={String(p.spotImageSrc ?? "/images/product.jpg")}
          spotOverlayTitle={String(p.spotOverlayTitle ?? "Grooming Essentials")}
          spotOverlaySub={String(p.spotOverlaySub ?? "Smart picks for modern men")}
          itemsJson={typeof p.items === "string" ? p.items : undefined}
          preview={true}
        />
      </div>
    );
  },
};

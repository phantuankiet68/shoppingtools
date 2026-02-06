"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/bodyCare/bodyCare1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type BodyCareTab = {
  label: string;
  value: string; // "all" | "wax" | ...
};

export type BodyCareSpotlight = {
  tag: string;
  title: string;
  sub: string;
  stats: { num: string; text: string }[];

  primaryLabel: string;
  primaryHref?: string;
  ghostLabel: string;
  ghostHref?: string;

  mediaSrc: string;
  mediaAlt?: string;
};

export type BodyCareItem = {
  id: string;
  cat: string; // must match tab value except "all"
  badge?: string; // NEW/BEST/HOT
  badgeVariant?: "hot";

  imageSrc: string;
  imageAlt?: string;

  price: string;

  rating?: number;
  ratingCount?: number;

  chip?: string;
  brand?: string;
  name: string;

  href?: string;

  ctaAddLabel?: string; // default "Add to cart"
  ctaQuickLabel?: string; // default "Quick view"
};

export type BodyCare1Props = {
  title?: string;
  subtitle?: string;

  tabs?: BodyCareTab[];
  moreLabel?: string;
  moreHref?: string;

  spotlight?: BodyCareSpotlight;

  items?: BodyCareItem[];
  itemsJson?: string;

  defaultTab?: string; // default "all"
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_TABS: BodyCareTab[] = [
  { label: "All", value: "all" },
  { label: "Hair Removal", value: "wax" },
  { label: "Slimming", value: "slim" },
  { label: "Body Lotion", value: "lotion" },
  { label: "Shower Gel", value: "bath" },
  { label: "Body Scrub", value: "scrub" },
  { label: "Hand & Foot", value: "hand" },
  { label: "Bath Salt", value: "salt" },
];

const DEFAULT_SPOTLIGHT: BodyCareSpotlight = {
  tag: "Editor’s pick",
  title: "Soft, clean & fresh all day",
  sub: "Top choices for shower time, smooth skin & hydration.",
  stats: [
    { num: "120+", text: "Body items" },
    { num: "4.8★", text: "Avg rating" },
    { num: "Fast", text: "Delivery" },
  ],
  primaryLabel: "Explore bundles",
  primaryHref: "/bundles",
  ghostLabel: "Get consultation",
  ghostHref: "/consultation",
  mediaSrc: "/images/product.jpg",
  mediaAlt: "",
};

const DEFAULT_ITEMS: BodyCareItem[] = [
  {
    id: "bc-1",
    cat: "hand",
    badge: "NEW",
    imageSrc: "/images/product.jpg",
    price: "125,000₫",
    rating: 4.8,
    ratingCount: 128,
    chip: "Hand & Foot",
    brand: "Eveline",
    name: "Eveline Argan Vanilla Professional — hand & nail cream",
    href: "/product/bc-1",
  },
  {
    id: "bc-2",
    cat: "bath",
    badge: "BEST",
    imageSrc: "/images/product.jpg",
    price: "169,000₫",
    rating: 4.7,
    ratingCount: 94,
    chip: "Shower Gel",
    brand: "Treaclemoon",
    name: "Treaclemoon Brazilian Love — tropical scented moisturizing shower gel",
    href: "/product/bc-2",
  },
  {
    id: "bc-3",
    cat: "wax",
    badge: "HOT",
    badgeVariant: "hot",
    imageSrc: "/images/product.jpg",
    price: "159,000₫",
    rating: 4.9,
    ratingCount: 210,
    chip: "Hair Removal",
    brand: "Eveline",
    name: "Eveline Sensitive Epil — soothing hair removal cream (rose extract)",
    href: "/product/bc-3",
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

function parseItems(raw?: string): BodyCareItem[] | undefined {
  const val = safeJson<unknown>(raw);
  if (!val || !Array.isArray(val)) return undefined;

  const cleaned: BodyCareItem[] = [];
  for (const it of val) {
    if (!it) continue;

    const id = String((it as any).id ?? "");
    const name = String((it as any).name ?? "");
    const imageSrc = String((it as any).imageSrc ?? "");
    const price = String((it as any).price ?? "");
    const cat = String((it as any).cat ?? "");

    if (!id || !name || !imageSrc || !price || !cat) continue;

    cleaned.push({
      id,
      cat,
      name,
      imageSrc,
      price,
      imageAlt: (it as any).imageAlt ? String((it as any).imageAlt) : undefined,
      href: (it as any).href ? String((it as any).href) : undefined,
      badge: (it as any).badge ? String((it as any).badge) : undefined,
      badgeVariant: (it as any).badgeVariant === "hot" ? "hot" : undefined,
      rating: typeof (it as any).rating === "number" ? (it as any).rating : undefined,
      ratingCount: typeof (it as any).ratingCount === "number" ? (it as any).ratingCount : undefined,
      chip: (it as any).chip ? String((it as any).chip) : undefined,
      brand: (it as any).brand ? String((it as any).brand) : undefined,
      ctaAddLabel: (it as any).ctaAddLabel ? String((it as any).ctaAddLabel) : undefined,
      ctaQuickLabel: (it as any).ctaQuickLabel ? String((it as any).ctaQuickLabel) : undefined,
    });
  }

  return cleaned.length ? cleaned : undefined;
}

/* ================= Component ================= */
export function BodyCare1({
  title = "BODY CARE",
  subtitle = "Choose products for smooth skin, hydration, and daily comfort.",
  tabs,
  moreLabel = "View more →",
  moreHref = "/body-care",
  spotlight,
  items,
  itemsJson,
  defaultTab = "all",
  preview = false,
}: BodyCare1Props) {
  const tabItems = useMemo(() => tabs ?? DEFAULT_TABS, [tabs]);
  const sp = useMemo(() => spotlight ?? DEFAULT_SPOTLIGHT, [spotlight]);
  const list = useMemo(() => items ?? parseItems(itemsJson) ?? DEFAULT_ITEMS, [items, itemsJson]);

  const [active, setActive] = useState<string>(defaultTab);
  const [liked, setLiked] = useState<Set<string>>(() => new Set());

  const railRef = useRef<HTMLDivElement | null>(null);

  const block = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const filtered = useMemo(() => {
    if (active === "all") return list;
    return list.filter((x) => x.cat === active);
  }, [active, list]);

  // đổi tab -> scroll về đầu (giống script cũ)
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: 0, behavior: "smooth" });
  }, [active]);

  const scrollRail = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = Math.max(320, rail.clientWidth * 0.85);
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className={cls.bodyCare} aria-label="Body care">
      {/* Head */}
      <header className={cls.bodyCareHead}>
        <div className={cls.bodyCareTitleWrap}>
          <h2 className={cls.bodyCareTitle}>{title}</h2>
          {!!subtitle && <p className={cls.bodyCareSubtitle}>{subtitle}</p>}
        </div>

        <div className={cls.bodyCareControls}>
          <div className={cls.bodyCareTabs} role="tablist" aria-label="Body care tabs">
            {tabItems.map((t) => {
              const isActive = t.value === active;
              return (
                <button
                  key={t.value}
                  suppressHydrationWarning
                  className={`${cls.bodyCareTab} ${isActive ? cls.isActive : ""}`}
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
            <a className={cls.bodyCareMore} href="#" onClick={block}>
              {moreLabel}
            </a>
          ) : (
            <Link className={cls.bodyCareMore} href={(moreHref || "/body-care") as Route}>
              {moreLabel}
            </Link>
          )}
        </div>
      </header>

      {/* Spotlight */}
      <div className={cls.bodyCareSpotlight}>
        <div className={cls.bodyCareSpotCard}>
          <div className={cls.bodyCareSpotTag}>{sp.tag}</div>
          <div className={cls.bodyCareSpotTitle}>{sp.title}</div>
          <div className={cls.bodyCareSpotSub}>{sp.sub}</div>

          {!!sp.stats?.length && (
            <div className={cls.bodyCareSpotStats}>
              {sp.stats.slice(0, 3).map((s, i) => (
                <div key={i} className={cls.bodyCareStat}>
                  <div className={cls.bodyCareStatNum}>{s.num}</div>
                  <div className={cls.bodyCareStatText}>{s.text}</div>
                </div>
              ))}
            </div>
          )}

          <div className={cls.bodyCareSpotActions}>
            {preview ? (
              <>
                <button className={`${cls.bodyCareBtn} ${cls.bodyCareBtnPrimary}`} type="button" onClick={block}>
                  {sp.primaryLabel}
                </button>
                <button className={`${cls.bodyCareBtn} ${cls.bodyCareBtnGhost}`} type="button" onClick={block}>
                  {sp.ghostLabel}
                </button>
              </>
            ) : (
              <>
                <Link className={`${cls.bodyCareBtn} ${cls.bodyCareBtnPrimary}`} href={(sp.primaryHref || "/bundles") as Route}>
                  {sp.primaryLabel}
                </Link>
                <Link className={`${cls.bodyCareBtn} ${cls.bodyCareBtnGhost}`} href={(sp.ghostHref || "/consultation") as Route}>
                  {sp.ghostLabel}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={cls.bodyCareSpotMedia} aria-hidden="true">
          <div className={cls.bodyCareSpotMediaInner}>
            <Image src={sp.mediaSrc} alt={sp.mediaAlt || ""} fill sizes="(max-width: 980px) 100vw, 40vw" style={{ objectFit: "cover" }} />
          </div>
        </div>
      </div>

      {/* Rail */}
      <div className={cls.bodyCareRailWrap}>
        <div className={cls.bodyCareRail} ref={railRef} aria-label="Body care product list">
          {filtered.map((it) => {
            const isLiked = liked.has(it.id);

            const Card = (
              <article className={cls.bodyCareItem} data-cat={it.cat} aria-label={it.name}>
                {!!it.badge && <span className={`${cls.bodyCareBadge} ${it.badgeVariant === "hot" ? cls.bodyCareBadgeHot : ""}`}>{it.badge}</span>}

                <button
                  suppressHydrationWarning
                  className={`${cls.bodyCareWish} ${isLiked ? cls.isLiked : ""}`}
                  type="button"
                  aria-label="Wishlist"
                  onClick={(e) => {
                    if (preview) return block(e);
                    toggleLike(it.id);
                  }}>
                  <i className={`bi ${isLiked ? "bi-heart-fill" : "bi-heart"}`} />
                </button>

                <div className={cls.bodyCareThumb}>
                  <div className={cls.bodyCareThumbInner}>
                    <Image src={it.imageSrc} alt={it.imageAlt || it.name} fill sizes="160px" style={{ objectFit: "contain" }} />
                  </div>
                </div>

                <div className={cls.bodyCareInfo}>
                  <div className={cls.bodyCareTopLine}>
                    <div className={cls.bodyCarePrice}>{it.price}</div>

                    {it.rating != null && (
                      <div className={cls.bodyCareRating} aria-label={`Rated ${it.rating.toFixed(1)} out of 5`}>
                        {/* nếu bạn có bodyCareStars class thì add vào CSS, còn không thì giữ text */}
                        <span className={cls.bodyCareScore}>{it.rating.toFixed(1)}</span>
                        {it.ratingCount != null && <span className={cls.bodyCareCount}>({it.ratingCount})</span>}
                      </div>
                    )}
                  </div>

                  <div className={cls.bodyCareMeta}>
                    {!!it.chip && <span className={cls.bodyCareChip}>{it.chip}</span>}
                    {!!it.brand && <span className={cls.bodyCareBrand}>{it.brand}</span>}
                  </div>

                  <h3 className={cls.bodyCareName} title={it.name}>
                    {it.name}
                  </h3>

                  <div className={cls.bodyCareCtaRow}>
                    {preview ? (
                      <>
                        <button className={`${cls.bodyCareCta} ${cls.bodyCareCtaAdd}`} type="button" onClick={block}>
                          {it.ctaAddLabel || "Add to cart"}
                        </button>
                        <button className={`${cls.bodyCareCta} ${cls.bodyCareCtaQuick}`} type="button" onClick={block}>
                          {it.ctaQuickLabel || "Quick view"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button className={`${cls.bodyCareCta} ${cls.bodyCareCtaAdd}`} type="button">
                          {it.ctaAddLabel || "Add to cart"}
                        </button>
                        <button className={`${cls.bodyCareCta} ${cls.bodyCareCtaQuick}`} type="button">
                          {it.ctaQuickLabel || "Quick view"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );

            if (preview || !it.href) return <div key={it.id}>{Card}</div>;

            return (
              <Link key={it.id} href={it.href as Route} style={{ textDecoration: "none", color: "inherit" }}>
                {Card}
              </Link>
            );
          })}
        </div>

        <div className={cls.bodyCareNav}>
          <button suppressHydrationWarning className={cls.bodyCareNavBtn} type="button" aria-label="Previous" onClick={(e) => (preview ? block(e) : scrollRail(-1))}>
            <i className="bi bi-arrow-left" />
          </button>
          <button suppressHydrationWarning className={cls.bodyCareNavBtn} type="button" aria-label="Next" onClick={(e) => (preview ? block(e) : scrollRail(1))}>
            <i className="bi bi-arrow-right" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default BodyCare1;

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_BODY_CARE_GREEN_ONE: RegItem = {
  kind: "BodyCare1",
  label: "Body Care",
  defaults: {
    title: "BODY CARE",
    subtitle: "Choose products for smooth skin, hydration, and daily comfort.",
    moreLabel: "View more →",
    moreHref: "/body-care",
    defaultTab: "all",

    tabs: JSON.stringify(DEFAULT_TABS, null, 2),
    spotlight: JSON.stringify(DEFAULT_SPOTLIGHT, null, 2),
    items: JSON.stringify(DEFAULT_ITEMS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "text" },
    { key: "moreLabel", label: "More label", kind: "text" },
    { key: "moreHref", label: "More href", kind: "text" },
    { key: "defaultTab", label: "Default tab", kind: "text" },

    { key: "tabs", label: "Tabs (JSON)", kind: "textarea", rows: 10 },
    { key: "spotlight", label: "Spotlight (JSON)", kind: "textarea", rows: 12 },
    { key: "items", label: "Items (JSON)", kind: "textarea", rows: 14 },
  ],
  render: (p) => {
    const tabs = safeJson<BodyCareTab[]>(p.tabs);
    const spotlight = safeJson<BodyCareSpotlight>(p.spotlight);

    return (
      <div className="sectionContainer" aria-label="Shop Body Care (Green One)">
        <BodyCare1
          title={String(p.title ?? "BODY CARE")}
          subtitle={String(p.subtitle ?? "")}
          moreLabel={String(p.moreLabel ?? "View more →")}
          moreHref={String(p.moreHref ?? "/body-care")}
          defaultTab={String(p.defaultTab ?? "all")}
          tabs={tabs}
          spotlight={spotlight}
          itemsJson={typeof p.items === "string" ? p.items : undefined}
          preview={true}
        />
      </div>
    );
  },
};

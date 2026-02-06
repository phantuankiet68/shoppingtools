"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/skincare/skincare1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type Sk2Tab = "all" | "clean" | "care";

export type Sk2Spotlight = {
  tag: string;
  title: string;
  sub: string;

  stats: { num: string; text: string }[];

  primaryLabel: string;
  primaryHref?: string;

  ghostLabel: string;
  ghostHref?: string;

  benefits: string[];

  steps: { num: string; title: string; sub: string }[];

  trust: string[];

  mediaSrc: string;
  mediaAlt?: string;
};

export type Sk2Item = {
  id: string;
  cat: Exclude<Sk2Tab, "all">; // "clean" | "care"
  badge?: string; // NEW/HOT
  badgeVariant?: "hot"; // optional

  imageSrc: string;
  imageAlt?: string;

  price: string;

  rating?: number; // 4.8
  ratingCount?: number; // 128

  chip?: string; // "Skincare" | "Cleansing"
  brandName?: string; // "Daliv"
  name: string;

  href?: string;
};

export type Skincare1Props = {
  title?: string;
  desc?: string;

  tabs?: { label: string; value: Sk2Tab }[];

  moreLabel?: string;
  moreHref?: string;

  spotlight?: Sk2Spotlight;

  items?: Sk2Item[];
  itemsJson?: string;

  defaultTab?: Sk2Tab;

  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_TABS: { label: string; value: Sk2Tab }[] = [
  { label: "All", value: "all" },
  { label: "Cleansing", value: "clean" },
  { label: "Skincare", value: "care" },
];

const DEFAULT_SPOTLIGHT: Sk2Spotlight = {
  tag: "Recommended routine",
  title: "Cleanse + Hydrate + Repair",
  sub: "Quick picks for sensitive skin.",
  stats: [
    { num: "233+", text: "Products" },
    { num: "Top", text: "Brands" },
    { num: "4.8★", text: "Rating" },
  ],
  primaryLabel: "Explore bundles",
  primaryHref: "/bundles",
  ghostLabel: "Skin consultation",
  ghostHref: "/consultation",
  benefits: ["Gentle cleanse • No tight feeling", "Hydration boost for up to 24h", "Barrier repair for sensitive skin"],
  steps: [
    { num: "1", title: "Cleanse", sub: "Remove sunscreen & impurities" },
    { num: "2", title: "Hydrate", sub: "Lock in moisture & calm skin" },
    { num: "3", title: "Repair", sub: "Strengthen the skin barrier" },
  ],
  trust: ["✓ Authentic products", "✓ Easy returns", "✓ Fast delivery"],
  mediaSrc: "/images/product.jpg",
  mediaAlt: "",
};

const DEFAULT_ITEMS: Sk2Item[] = [
  {
    id: "sk2-1",
    cat: "care",
    badge: "NEW",
    imageSrc: "/images/product.jpg",
    price: "16,900₫",
    rating: 4.8,
    ratingCount: 128,
    chip: "Skincare",
    brandName: "Daliv",
    name: "Daliv Charcoal Mask — hydrating & deep cleansing 27g",
    href: "/product/sk2-1",
  },
  {
    id: "sk2-2",
    cat: "care",
    badge: "NEW",
    imageSrc: "/images/product.jpg",
    price: "16,900₫",
    rating: 4.7,
    ratingCount: 94,
    chip: "Skincare",
    brandName: "Daliv",
    name: "Daliv Cica Mask — soothing & hydrating 27g",
    href: "/product/sk2-2",
  },
  {
    id: "sk2-3",
    cat: "clean",
    badge: "HOT",
    badgeVariant: "hot",
    imageSrc: "/images/product.jpg",
    price: "198,000₫",
    rating: 4.9,
    ratingCount: 210,
    chip: "Cleansing",
    brandName: "Daliv",
    name: "Daliv Facial Cleanser — hydrating & brightening 120ml",
    href: "/product/sk2-3",
  },
];

/* ================= JSON Helpers ================= */
function safeJson<T>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function parseItems(raw?: string): Sk2Item[] | undefined {
  const val = safeJson<unknown>(raw);
  if (!val || !Array.isArray(val)) return undefined;

  const cleaned: Sk2Item[] = [];
  for (const it of val) {
    if (!it) continue;

    const id = String((it as any).id ?? "");
    const name = String((it as any).name ?? "");
    const imageSrc = String((it as any).imageSrc ?? "");
    const price = String((it as any).price ?? "");
    const cat = String((it as any).cat ?? "") as Sk2Tab;

    if (!id || !name || !imageSrc || !price) continue;
    if (cat !== "clean" && cat !== "care") continue;

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
      brandName: (it as any).brandName ? String((it as any).brandName) : undefined,
    });
  }

  return cleaned.length ? cleaned : undefined;
}

/* ================= Component ================= */
export function Skincare1({
  title = "FACIAL SKINCARE",
  desc = "Routine guide: “Cleanse first, then nourish.”",
  tabs,
  moreLabel = "View more →",
  moreHref = "/skincare",
  spotlight,
  items,
  itemsJson,
  defaultTab = "all",
  preview = false,
}: Skincare1Props) {
  const tabItems = useMemo(() => tabs ?? DEFAULT_TABS, [tabs]);
  const sp = useMemo(() => spotlight ?? DEFAULT_SPOTLIGHT, [spotlight]);

  const list = useMemo(() => items ?? parseItems(itemsJson) ?? DEFAULT_ITEMS, [items, itemsJson]);

  const [active, setActive] = useState<Sk2Tab>(defaultTab);

  const railRef = useRef<HTMLDivElement | null>(null);
  const [liked, setLiked] = useState<Set<string>>(() => new Set());

  const filtered = useMemo(() => {
    if (active === "all") return list;
    return list.filter((x) => x.cat === active);
  }, [active, list]);

  // đổi tab -> scroll về đầu (giống script bạn)
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: 0, behavior: "smooth" });
  }, [active]);

  const block = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

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
    <section className={cls.sk2} aria-label="Facial Skincare">
      {/* Header */}
      <header className={cls.head}>
        <div className={cls.brand}>
          <h2 className={cls.title}>{title}</h2>
          {!!desc && <p className={cls.desc}>{desc}</p>}
        </div>

        <div className={cls.controls}>
          <div className={cls.tabs} role="tablist" aria-label="Skincare tabs">
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
            <a className={cls.more} href="#" onClick={block}>
              {moreLabel}
            </a>
          ) : (
            <Link className={cls.more} href={(moreHref || "/skincare") as Route}>
              {moreLabel}
            </Link>
          )}
        </div>
      </header>

      {/* Spotlight */}
      <div className={cls.spotlight}>
        <div className={cls.spotCard}>
          <div className={cls.spotTag}>{sp.tag}</div>
          <div className={cls.spotTitle}>{sp.title}</div>
          <div className={cls.spotSub}>{sp.sub}</div>

          {!!sp.stats?.length && (
            <div className={cls.spotStats}>
              {sp.stats.slice(0, 3).map((s, i) => (
                <div key={i} className={cls.stat}>
                  <div className={cls.statNum}>{s.num}</div>
                  <div className={cls.statText}>{s.text}</div>
                </div>
              ))}
            </div>
          )}

          <div className={cls.spotActions}>
            {preview ? (
              <>
                <button className={`${cls.btn} ${cls.btnPrimary}`} type="button" onClick={block}>
                  {sp.primaryLabel}
                </button>
                <button className={`${cls.btn} ${cls.btnGhost}`} type="button" onClick={block}>
                  {sp.ghostLabel}
                </button>
              </>
            ) : (
              <>
                <Link className={`${cls.btn} ${cls.btnPrimary}`} href={(sp.primaryHref || "/bundles") as Route}>
                  {sp.primaryLabel}
                </Link>
                <Link className={`${cls.btn} ${cls.btnGhost}`} href={(sp.ghostHref || "/consultation") as Route}>
                  {sp.ghostLabel}
                </Link>
              </>
            )}
          </div>

          {!!sp.benefits?.length && (
            <ul className={cls.benefits} aria-label="Key benefits">
              {sp.benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}

          {!!sp.steps?.length && (
            <div className={cls.steps} aria-label="Routine steps">
              {sp.steps.slice(0, 3).map((st, i) => (
                <div key={i} className={cls.step}>
                  <span className={cls.stepNum}>{st.num}</span>
                  <div className={cls.stepText}>
                    <div className={cls.stepTitle}>{st.title}</div>
                    <div className={cls.stepSub}>{st.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!!sp.trust?.length && (
            <div className={cls.trust} aria-label="Trust badges">
              {sp.trust.map((t, i) => (
                <span key={i} className={cls.trustItem}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={cls.spotMedia} aria-hidden="true">
          <div className={cls.spotMediaInner}>
            <Image src={sp.mediaSrc} alt={sp.mediaAlt || ""} fill sizes="(max-width: 980px) 100vw, 40vw" style={{ objectFit: "cover" }} />
          </div>
        </div>
      </div>

      {/* Rail */}
      <div className={cls.railWrap}>
        <div className={cls.rail} ref={railRef} aria-label="Skincare product list">
          {filtered.map((it) => {
            const isLiked = liked.has(it.id);

            const Card = (
              <article className={cls.item} data-cat={it.cat} aria-label={it.name}>
                {!!it.badge && <div className={`${cls.badge} ${it.badgeVariant === "hot" ? cls.badgeHot : ""}`}>{it.badge}</div>}

                <div className={cls.thumb}>
                  <div className={cls.thumbInner}>
                    <Image src={it.imageSrc} alt={it.imageAlt || it.name} fill sizes="160px" style={{ objectFit: "contain" }} />
                  </div>
                </div>

                <div className={cls.info}>
                  <div className={cls.topline}>
                    <div className={cls.price}>{it.price}</div>

                    {it.rating != null && (
                      <div className={cls.rate} aria-label={`Rated ${it.rating.toFixed(1)} out of 5`}>
                        <span className={cls.stars} style={{ ["--rating" as any]: it.rating }} />
                        <span className={cls.score}>{it.rating.toFixed(1)}</span>
                        {it.ratingCount != null && <span className={cls.count}>({it.ratingCount})</span>}
                      </div>
                    )}
                  </div>

                  <div className={cls.meta}>
                    {!!it.chip && <span className={cls.chip}>{it.chip}</span>}
                    {!!it.brandName && <span className={cls.brandName}>{it.brandName}</span>}
                  </div>

                  <h3 className={cls.name} title={it.name}>
                    {it.name}
                  </h3>

                  <div className={cls.ctaRow}>
                    {preview ? (
                      <>
                        <button className={`${cls.cta} ${cls.ctaAdd}`} type="button" onClick={block}>
                          Add to cart
                        </button>
                        <button
                          suppressHydrationWarning
                          className={`${cls.cta} ${cls.ctaWish} ${isLiked ? cls.liked : ""}`}
                          type="button"
                          aria-label="Wishlist"
                          onClick={(e) => {
                            if (preview) return block(e);
                            toggleLike(it.id);
                          }}>
                          <i className={`bi ${isLiked ? "bi-heart-fill" : "bi-heart"}`} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className={`${cls.cta} ${cls.ctaAdd}`} type="button">
                          Add to cart
                        </button>
                        <button suppressHydrationWarning className={`${cls.cta} ${cls.ctaWish} ${isLiked ? cls.liked : ""}`} type="button" aria-label="Wishlist" onClick={() => toggleLike(it.id)}>
                          <i className={`bi ${isLiked ? "bi-heart-fill" : "bi-heart"}`} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );

            if (preview || !it.href) {
              return (
                <div key={it.id} className={cls.itemLink} role="group" aria-label={it.name}>
                  {Card}
                </div>
              );
            }

            return (
              <Link key={it.id} className={cls.itemLink} href={it.href as Route} aria-label={it.name}>
                {Card}
              </Link>
            );
          })}
        </div>

        <div className={cls.nav}>
          <button suppressHydrationWarning className={cls.navBtn} type="button" aria-label="Previous" onClick={(e) => (preview ? block(e) : scrollRail(-1))}>
            <i className="bi bi-arrow-left" />
          </button>
          <button suppressHydrationWarning className={cls.navBtn} type="button" aria-label="Next" onClick={(e) => (preview ? block(e) : scrollRail(1))}>
            <i className="bi bi-arrow-right" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Skincare1;

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_SKINCARE_GREEN_ONE: RegItem = {
  kind: "Skincare1",
  label: "Skincare Rail",
  defaults: {
    title: "FACIAL SKINCARE",
    desc: "Routine guide: “Cleanse first, then nourish.”",
    moreLabel: "View more →",
    moreHref: "/skincare",
    defaultTab: "all",

    tabs: JSON.stringify(DEFAULT_TABS, null, 2),
    spotlight: JSON.stringify(DEFAULT_SPOTLIGHT, null, 2),
    items: JSON.stringify(DEFAULT_ITEMS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "desc", label: "Description", kind: "text" },
    { key: "moreLabel", label: "More label", kind: "text" },
    { key: "moreHref", label: "More href", kind: "text" },
    { key: "defaultTab", label: "Default tab (all/clean/care)", kind: "text" },

    { key: "tabs", label: "Tabs (JSON)", kind: "textarea", rows: 8 },
    { key: "spotlight", label: "Spotlight (JSON)", kind: "textarea", rows: 16 },
    { key: "items", label: "Items (JSON)", kind: "textarea", rows: 14 },
  ],
  render: (p) => {
    const tabs = safeJson<{ label: string; value: Sk2Tab }[]>(p.tabs);
    const spotlight = safeJson<Sk2Spotlight>(p.spotlight);

    const itemsJson = typeof p.items === "string" ? p.items : undefined;

    return (
      <div className="sectionContainer" aria-label="Shop Skincare (Green Two)">
        <Skincare1
          title={String(p.title ?? "FACIAL SKINCARE")}
          desc={String(p.desc ?? "Routine guide: “Cleanse first, then nourish.”")}
          moreLabel={String(p.moreLabel ?? "View more →")}
          moreHref={String(p.moreHref ?? "/skincare")}
          defaultTab={String(p.defaultTab ?? "all") as Sk2Tab}
          tabs={tabs}
          spotlight={spotlight}
          itemsJson={itemsJson}
          preview={true}
        />
      </div>
    );
  },
};

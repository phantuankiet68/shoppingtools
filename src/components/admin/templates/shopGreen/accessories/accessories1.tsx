"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/accessories/accessories1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type AccTab = { key: string; label: string };

export type AccTile = {
  kind: "tile";
  cat: string;
  href: string;
  tag: string;
  title: string;
  sub: string;
  cta: string;
  imageSrc: string;
  variant?: "hero" | "wide" | "tall";
};

export type AccCard = {
  kind: "card";
  cat: string;
  badge?: string;
  badgeVariant?: "default" | "new";
  name: string;
  brand: string;
  note: string;
  imageSrc: string;
};

export type AccItem = AccTile | AccCard;

export type Accessories1Props = {
  title?: string;
  subtitle?: string;

  tabs?: AccTab[];
  items?: AccItem[];

  initialCount?: number;
  step?: number;
  preview?: boolean;
};

/* ================= Defaults ================= */
/**
 * ✅ IMPORTANT (Next/Image):
 * - src dạng "/images/..." phải tồn tại trong /public/images/...
 * - fallback cũng nên là local để khỏi cần cấu hình hostname
 */
const DEFAULT_IMAGE = "/images/product.jpg";
const FALLBACK_IMG = "/images/fallback.png";

const DEFAULT_TABS: AccTab[] = [
  { key: "all", label: "All" },
  { key: "tools", label: "Tools" },
  { key: "brushes", label: "Brushes" },
  { key: "bags", label: "Bags" },
  { key: "organizers", label: "Organizers" },
  { key: "mirrors", label: "Mirrors" },
];

const DEFAULT_ITEMS: AccItem[] = [
  {
    kind: "tile",
    cat: "tools",
    href: "/accessories/tools",
    tag: "Bestseller",
    title: "Beauty Tools",
    sub: "Clips • Sponges • Razors",
    cta: "Explore →",
    imageSrc: DEFAULT_IMAGE,
    variant: "hero",
  },
  {
    kind: "tile",
    cat: "bags",
    href: "/accessories/bags",
    tag: "New",
    title: "Cosmetic Bags",
    sub: "Neat • Easy to carry",
    cta: "View collection →",
    imageSrc: DEFAULT_IMAGE,
    variant: "wide",
  },
  {
    kind: "tile",
    cat: "organizers",
    href: "/accessories/organizers",
    tag: "Pro",
    title: "Organizers & Storage",
    sub: "Optimize your vanity",
    cta: "Find the right organizer →",
    imageSrc: DEFAULT_IMAGE,
    variant: "tall",
  },

  {
    kind: "card",
    cat: "brushes",
    badge: "HOT",
    name: "Mini makeup brush set — soft bristles, no shedding",
    brand: "ProBrush",
    note: "Travel-friendly",
    imageSrc: DEFAULT_IMAGE,
  },
  {
    kind: "card",
    cat: "tools",
    badge: "NEW",
    badgeVariant: "new",
    name: "Foundation blending sponge — smooth application, no caking",
    brand: "SoftBlend",
    note: "Easy to clean",
    imageSrc: DEFAULT_IMAGE,
  },
  {
    kind: "card",
    cat: "mirrors",
    badge: "BEST",
    name: "Double-sided compact mirror — portable, clear reflection",
    brand: "GlowMirror",
    note: "Pocket size",
    imageSrc: DEFAULT_IMAGE,
  },
  {
    kind: "card",
    cat: "mirrors",
    badge: "BEST",
    name: "Double-sided compact mirror — portable, clear reflection",
    brand: "GlowMirror",
    note: "Pocket size",
    imageSrc: DEFAULT_IMAGE,
  },
];

/* ================= Helpers ================= */
function safeJson<T>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/**
 * ✅ Next/Image safe fallback:
 * - Nếu src lỗi (404 hoặc decode fail) thì đổi sang FALLBACK_IMG (local)
 * - Không dùng remote placeholder => khỏi cần next.config.js images.domains
 */
function Img({ src, alt, sizes, className, fill = true }: { src: string; alt: string; sizes?: string; className?: string; fill?: boolean }) {
  const [okSrc, setOkSrc] = useState<string>(src || FALLBACK_IMG);

  useEffect(() => {
    setOkSrc(src || FALLBACK_IMG);
  }, [src]);

  return (
    <Image
      src={okSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      style={{ objectFit: "cover" }}
      onError={() => {
        // đổi 1 lần sang fallback để tránh request lại ảnh hỏng
        if (okSrc !== FALLBACK_IMG) setOkSrc(FALLBACK_IMG);
      }}
    />
  );
}

/* ================= Component ================= */
export function Accessories1({ title = "ACCESSORIES", subtitle = "Tools & add-ons that upgrade your routine.", tabs, items, initialCount = 8, step = 6, preview = false }: Accessories1Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const tbs = useMemo(() => tabs ?? DEFAULT_TABS, [tabs]);
  const its = useMemo(() => items ?? DEFAULT_ITEMS, [items]);

  const [active, setActive] = useState<string>("all");
  const [limit, setLimit] = useState<number>(Math.max(1, initialCount));

  useEffect(() => {
    setLimit(Math.max(1, initialCount));
  }, [active, initialCount]);

  const filtered = useMemo(() => {
    if (active === "all") return its;
    return its.filter((x) => x.cat === active);
  }, [its, active]);

  const visible = useMemo(() => filtered.slice(0, limit), [filtered, limit]);
  const canLoadMore = filtered.length > limit;

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const jumpToBoard = () => boardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section className={cls.accSection} aria-label="Accessories">
      <header className={cls.accHead}>
        <div className={cls.accTitleWrap}>
          <h2 className={cls.accTitle}>{title}</h2>
          <p className={cls.accSubtitle}>{subtitle}</p>
        </div>

        <div className={cls.accActions}>
          <div className={cls.accTabs} role="tablist" aria-label="Accessories tabs">
            {tbs.map((t) => {
              const isActive = t.key === active;
              return (
                <button key={t.key} className={`${cls.accTab} ${isActive ? cls.isActive : ""}`} type="button" role="tab" aria-selected={isActive ? "true" : "false"} onClick={() => setActive(t.key)}>
                  {t.label}
                </button>
              );
            })}
          </div>

          <button className={cls.accMoreTop} type="button" onClick={jumpToBoard}>
            Quick view
          </button>
        </div>
      </header>

      <div className={cls.accBoard} ref={boardRef} aria-label="Accessories board">
        {visible.map((it, idx) => {
          if (it.kind === "tile") {
            const v = it.variant ?? "wide";
            const tileClass = v === "hero" ? `${cls.accTile} ${cls.accTileHero}` : v === "tall" ? `${cls.accTile} ${cls.accTileTall}` : `${cls.accTile} ${cls.accTileWide}`;

            const tileInner = (
              <>
                <div className={cls.accTileTag}>{it.tag}</div>
                <div className={cls.accTileTitle}>{it.title}</div>
                <div className={cls.accTileSub}>{it.sub}</div>
                <div className={cls.accTileCta}>{it.cta}</div>

                <div className={cls.accTileImgWrap} aria-hidden="true">
                  <Img src={it.imageSrc || FALLBACK_IMG} alt="" sizes="(max-width: 760px) 100vw, 33vw" className={cls.accTileImg} fill />
                </div>
              </>
            );

            return preview ? (
              <a key={`tile-${idx}`} className={tileClass} href="#" onClick={onBlockClick} aria-label={it.title}>
                {tileInner}
              </a>
            ) : (
              <Link key={`tile-${idx}`} className={tileClass} href={(it.href || "/") as Route} aria-label={it.title}>
                {tileInner}
              </Link>
            );
          }

          const badgeCls = it.badgeVariant === "new" ? `${cls.accBadge} ${cls.accBadgeNew}` : cls.accBadge;

          return (
            <article key={`card-${idx}`} className={cls.accCard} aria-label={it.name}>
              <div className={cls.accCardMedia}>
                <div className={cls.accCardImgWrap} aria-hidden="true">
                  <Img src={it.imageSrc || FALLBACK_IMG} alt={it.name} sizes="(max-width: 760px) 100vw, 33vw" className={cls.accCardImg} fill />
                </div>

                {it.badge ? <span className={badgeCls}>{it.badge}</span> : null}
              </div>

              <div className={cls.accCardBody}>
                <div className={cls.accName}>{it.name}</div>

                <div className={cls.accMeta}>
                  <span className={cls.accBrand}>{it.brand}</span>
                  <span className={cls.accDot}>•</span>
                  <span className={cls.accNote}>{it.note}</span>
                </div>

                <div className={cls.accCardCtaRow}>
                  <button className={`${cls.accBtn} ${cls.accBtnPrimary}`} type="button" onClick={onBlockClick}>
                    Add to cart
                  </button>
                  <button className={`${cls.accBtn} ${cls.accBtnGhost}`} type="button" onClick={onBlockClick}>
                    Details
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className={cls.accFooter}>
        {canLoadMore ? (
          <button className={cls.accLoadMore} type="button" onClick={() => setLimit((v) => v + Math.max(1, step))}>
            View more
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_ACCESSORIES_GREEN_ONE: RegItem = {
  kind: "Accessories1",
  label: "Accessories",
  defaults: {
    title: "ACCESSORIES",
    subtitle: "Tools & add-ons that upgrade your routine.",
    initialCount: 8,
    step: 6,
    tabs: JSON.stringify(DEFAULT_TABS, null, 2),
    items: JSON.stringify(DEFAULT_ITEMS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "text" },
    { key: "initialCount", label: "Initial count", kind: "number" },
    { key: "step", label: "Load more step", kind: "number" },
    { key: "tabs", label: "Tabs (JSON)", kind: "textarea", rows: 10 },
    { key: "items", label: "Items (JSON)", kind: "textarea", rows: 14 },
  ],
  render: (p) => {
    const tabs = safeJson<AccTab[]>(p.tabs);
    const items = safeJson<AccItem[]>(p.items);

    return (
      <div className="sectionContainer" aria-label="Shop Accessories (Green One)">
        <Accessories1
          title={String(p.title || "ACCESSORIES")}
          subtitle={String(p.subtitle || "Tools & add-ons that upgrade your routine.")}
          initialCount={Number(p.initialCount) || 8}
          step={Number(p.step) || 6}
          tabs={tabs}
          items={items}
          preview={true}
        />
      </div>
    );
  },
};

export default Accessories1;

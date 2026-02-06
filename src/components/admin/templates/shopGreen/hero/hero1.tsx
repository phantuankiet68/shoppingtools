"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/hero/hero1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type CategoryItem = { label: string; icon: string; href: string };

export type SlideItem = {
  headline: string; // dùng \n để xuống dòng
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  // optional override background (css string)
  bg?: string;
  chips?: string[];
};

export type PromoItem = {
  icon: string;
  title: string;
  sub: string;
  off: string;
  href: string;
};

export type RightBanner = {
  variant: "top" | "bot";
  badge: string;
  title: string;
  sub: string;
  imageSrc?: string; // chỉ banner top dùng hình
};

export type Hero1Props = {
  categories?: CategoryItem[];
  slides?: SlideItem[];
  promos?: PromoItem[];
  rightBanners?: RightBanner[];

  autoMs?: number; // default 4500
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_CATEGORIES: CategoryItem[] = [
  { label: "Skincare", icon: "bi-droplet", href: "/skincare" },
  { label: "Makeup", icon: "bi-bag-heart", href: "/makeup" },
  { label: "Eye & Lip", icon: "bi-eye", href: "/eye-lip" },
  { label: "Sunscreen", icon: "bi-brightness-high", href: "/sunscreen" },
  { label: "Body Care", icon: "bi-heart-pulse", href: "/body-care" },
  { label: "Personal Care", icon: "bi-person-hearts", href: "/personal-care" },
  { label: "Best Sellers", icon: "bi-stars", href: "/best-sellers" },
  { label: "Gift Sets", icon: "bi-gift", href: "/gift-sets" },
  { label: "Fast Delivery", icon: "bi-truck", href: "/delivery" },
];

const DEFAULT_SLIDES: SlideItem[] = [
  {
    headline: "GLOW UP TODAY\nSKINCARE AT HOME",
    sub: "Authentic products • Fast delivery • Support 24/7",
    ctaLabel: "SHOP NOW",
    ctaHref: "/shop",
    // base bg nằm ở css slider, slide 1 không cần bg
    chips: ["Cleanser", "Serum", "Moisturizer"],
  },
  {
    headline: "BEAUTY DEALS\nUP TO 50% OFF",
    sub: "Limited-time offers • Best prices every week",
    ctaLabel: "VIEW OFFERS",
    ctaHref: "/promotions",
    bg: "linear-gradient(135deg, #faa8d0, #fb9faf 55%, #c8b6f0)",
  },
  {
    headline: "AUTHENTIC BRANDS\n100% GUARANTEED",
    sub: "Easy returns • Genuine products • Trusted stores",
    ctaLabel: "EXPLORE BRANDS",
    ctaHref: "/brands",
    bg: "linear-gradient(135deg, #9bd7f5, #8ec6fb 55%, #b6d1fd)",
  },
];

const DEFAULT_PROMOS: PromoItem[] = [
  { icon: "bi-droplet", title: "SKINCARE", sub: "Save up to 30%", off: "-30%", href: "/skincare" },
  { icon: "bi-bag-heart", title: "MAKEUP", sub: "Buy 2 get 1", off: "HOT", href: "/makeup" },
  { icon: "bi-brightness-high", title: "SUNSCREEN", sub: "Up to 40% off", off: "-40%", href: "/sunscreen" },
];

const DEFAULT_RIGHT: RightBanner[] = [
  {
    variant: "top",
    badge: "ONLINE 24/7",
    title: "FREE CONSULTATION",
    sub: "Skin routine & product matching",
    imageSrc: "/images/product.jpg",
  },
  {
    variant: "bot",
    badge: "BEST SELLERS",
    title: "TOP BRANDS",
    sub: "Popular picks this week",
  },
];

/* ================= Component ================= */
export function Hero1({ categories, slides, promos, rightBanners, autoMs = 4500, preview = false }: Hero1Props) {
  const cats = useMemo(() => categories ?? DEFAULT_CATEGORIES, [categories]);
  const sds = useMemo(() => slides ?? DEFAULT_SLIDES, [slides]);
  const prs = useMemo(() => promos ?? DEFAULT_PROMOS, [promos]);
  const rbs = useMemo(() => rightBanners ?? DEFAULT_RIGHT, [rightBanners]);

  const total = sds.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // interval cleanup chuẩn (không leak)
  useEffect(() => {
    if (paused) return;
    if (total <= 1) return;

    const t = window.setInterval(
      () => {
        setIndex((cur) => (cur + 1) % total);
      },
      Math.max(1200, autoMs),
    );

    return () => window.clearInterval(t);
  }, [paused, autoMs, total]);

  const goTo = (i: number) => {
    if (total <= 0) return;
    setIndex((i + total) % total);
  };

  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const sliderStyle = {
    transform: `translateX(-${index * 100}%)`,
  } as React.CSSProperties;

  return (
    <section className={cls.hero}>
      {/* LEFT: categories */}
      <aside className={cls.cat} aria-label="Product Categories">
        <div className={cls.catHeader}>
          <i className="bi bi-list" />
          Product Categories
        </div>

        <ul className={cls.catList}>
          {cats.map((c, i) =>
            preview ? (
              <li key={i}>
                <a href="#" onClick={onBlockClick}>
                  <i className={`bi ${c.icon}`} />
                  {c.label}
                </a>
              </li>
            ) : (
              <li key={i}>
                <Link href={(c.href || "/") as Route}>
                  <i className={`bi ${c.icon}`} />
                  {c.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </aside>

      {/* CENTER: slider + promos */}
      <div className={cls.center}>
        <div
          className={cls.slider}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          aria-label="Hero slider">
          {/* arrows */}
          <button suppressHydrationWarning className={`${cls.arrow} ${cls.prev}`} aria-label="Previous slide" type="button" onClick={(e) => (preview ? onBlockClick(e) : prev())}>
            <i className="bi bi-chevron-left" />
          </button>
          <button suppressHydrationWarning className={`${cls.arrow} ${cls.next}`} aria-label="Next slide" type="button" onClick={(e) => (preview ? onBlockClick(e) : next())}>
            <i className="bi bi-chevron-right" />
          </button>

          {/* slides */}
          <div className={cls.slides} style={sliderStyle}>
            {sds.map((s, i) => {
              const slideBg = i === 0 ? undefined : s.bg;
              return (
                <div key={i} className={cls.slide} style={slideBg ? ({ background: slideBg } as React.CSSProperties) : undefined} aria-hidden={i !== index}>
                  <div>
                    <div className={cls.headline}>
                      {s.headline.split("\n").map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < s.headline.split("\n").length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className={cls.sub}>{s.sub}</div>

                    {preview ? (
                      <button className={cls.cta} type="button" onClick={onBlockClick}>
                        {s.ctaLabel} <i className="bi bi-arrow-right" />
                      </button>
                    ) : (
                      <Link className={cls.cta} href={(s.ctaHref || "/") as Route} onClick={(e) => e.stopPropagation()}>
                        {s.ctaLabel} <i className="bi bi-arrow-right" />
                      </Link>
                    )}
                  </div>

                  <div className={cls.art} aria-hidden="true">
                    {!!s.chips?.length && (
                      <div className={cls.mini}>
                        {s.chips.map((chip, ci) => (
                          <span key={ci} className={cls.chip}>
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* dots */}
          <div className={cls.dots} aria-label="Slider dots">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${cls.dot} ${i === index ? cls.dotActive : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={(e) => {
                  if (preview) return onBlockClick(e);
                  goTo(i);
                }}
              />
            ))}
          </div>
        </div>

        {/* promos */}
        <div className={cls.promos} aria-label="Promo cards">
          {prs.map((p, i) =>
            preview ? (
              <a key={i} className={cls.promo} href="#" onClick={onBlockClick}>
                <div className={cls.pIc}>
                  <i className={`bi ${p.icon}`} />
                </div>
                <div>
                  <div className={cls.pTitle}>{p.title}</div>
                  <div className={cls.pSub}>{p.sub}</div>
                </div>
                <div className={cls.pOff}>{p.off}</div>
              </a>
            ) : (
              <Link key={i} className={cls.promo} href={(p.href || "/") as Route}>
                <div className={cls.pIc}>
                  <i className={`bi ${p.icon}`} />
                </div>
                <div>
                  <div className={cls.pTitle}>{p.title}</div>
                  <div className={cls.pSub}>{p.sub}</div>
                </div>
                <div className={cls.pOff}>{p.off}</div>
              </Link>
            ),
          )}
        </div>
      </div>

      {/* RIGHT: banners */}
      <aside className={cls.right} aria-label="Right banners">
        {rbs.map((b, i) => (
          <div key={i} className={`${cls.rb} ${b.variant === "top" ? cls.rbTop : cls.rbBot}`}>
            <span className={cls.rbBadge}>{b.badge}</span>
            <div className={cls.pad}>
              <div className={cls.rbTitle}>{b.title}</div>
              <div className={cls.rbSub}>{b.sub}</div>
            </div>

            <div className={cls.mockImg} aria-hidden="true">
              {b.imageSrc ? <Image src={b.imageSrc} alt="" fill style={{ objectFit: "cover" }} /> : null}
            </div>
          </div>
        ))}
      </aside>
    </section>
  );
}

/* ================= JSON Helpers (like BannerPro) ================= */
function safeJson<T>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_HERO_GREEN_ONE: RegItem = {
  kind: "Hero1",
  label: "Hero",
  defaults: {
    autoMs: 4500,

    categories: JSON.stringify(DEFAULT_CATEGORIES, null, 2),
    slides: JSON.stringify(DEFAULT_SLIDES, null, 2),
    promos: JSON.stringify(DEFAULT_PROMOS, null, 2),
    rightBanners: JSON.stringify(DEFAULT_RIGHT, null, 2),
  },
  inspector: [
    { key: "autoMs", label: "Auto slide (ms)", kind: "number" },

    { key: "categories", label: "Categories (JSON)", kind: "textarea", rows: 10 },
    { key: "slides", label: "Slides (JSON)", kind: "textarea", rows: 12 },
    { key: "promos", label: "Promos (JSON)", kind: "textarea", rows: 10 },
    { key: "rightBanners", label: "Right banners (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (p) => {
    const categories = safeJson<CategoryItem[]>(p.categories);
    const slides = safeJson<SlideItem[]>(p.slides);
    const promos = safeJson<PromoItem[]>(p.promos);
    const rightBanners = safeJson<RightBanner[]>(p.rightBanners);

    return (
      <div className="sectionContainer" aria-label="Shop Hero (Green One)">
        <Hero1 autoMs={Number(p.autoMs) || 4500} categories={categories} slides={slides} promos={promos} rightBanners={rightBanners} preview={true} />
      </div>
    );
  },
};

export default Hero1;

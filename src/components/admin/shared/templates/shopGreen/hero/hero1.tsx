"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/hero/hero1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
type ApiCategory = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  icon: string | null;
  sort: number;
  isActive: boolean;
  count: number;
};

type SidebarCategoryResponse = {
  siteId: string;
  domain?: string;
  activeOnly?: boolean;
  basePath?: string;
  items: ApiCategory[];
  tree?: unknown;
};

export type SlideItem = {
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  bg?: string;
  chips?: string[];
  imageSrc?: string;
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
  imageSrc?: string;
  /** ✅ NEW: nếu không có imageSrc thì dùng icon */
  icon?: string; // bootstrap icon name, e.g. "bi-share", "bi-ticket-perforated", "bi-truck"
};

export type Hero1Props = {
  siteId?: string;
  categoryApiPath?: string;
  categoryBasePath?: string;
  activeOnly?: boolean;
  onlyRootCategories?: boolean;

  slides?: SlideItem[];
  promos?: PromoItem[];
  rightBanners?: RightBanner[];

  autoMs?: number;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_SLIDES: SlideItem[] = [
  {
    headline: "GLOW UP TODAY\nSKINCARE AT HOME",
    sub: "Authentic products • Fast delivery • Support 24/7",
    ctaLabel: "SHOP NOW",
    ctaHref: "/shop",
    chips: ["Cleanser", "Serum", "Moisturizer"],
    imageSrc: "/assets/images/product.jpg",
  },
  {
    headline: "BEAUTY DEALS\nUP TO 50% OFF",
    sub: "Limited-time offers • Best prices every week",
    ctaLabel: "VIEW OFFERS",
    ctaHref: "/promotions",
    bg: "linear-gradient(135deg, #06dc35ff, #9ffbd5ff 55%, #b6f0efff)",
    imageSrc: "/assets/images/product.jpg",
  },
  {
    headline: "AUTHENTIC BRANDS\n100% GUARANTEED",
    sub: "Easy returns • Genuine products • Trusted stores",
    ctaLabel: "EXPLORE BRANDS",
    ctaHref: "/brands",
    bg: "linear-gradient(135deg, #9bd7f5, #8ec6fb 55%, #b6d1fd)",
    imageSrc: "/assets/images/product.jpg",
  },
];

const DEFAULT_PROMOS: PromoItem[] = [
  { icon: "bi-droplet", title: "SKINCARE", sub: "Save up to 30%", off: "-30%", href: "/skincare" },
  { icon: "bi-bag-heart", title: "MAKEUP", sub: "Buy 2 get 1", off: "HOT", href: "/makeup" },
  { icon: "bi-brightness-high", title: "SUNSCREEN", sub: "Up to 40% off", off: "-40%", href: "/sunscreen" },
];

/**
 * ✅ UPDATED: 3 RIGHT cards: Share / Voucher / Free ship
 * - Không dùng imageSrc -> sẽ render icon
 */
const DEFAULT_RIGHT: RightBanner[] = [
  {
    variant: "top",
    badge: "SHARE & EARN",
    title: "SHARE TO GET POINTS",
    sub: "Invite friends and receive rewards",
    icon: "bi-share",
  },
  {
    variant: "bot",
    badge: "VOUCHER",
    title: "DAILY DISCOUNT CODES",
    sub: "Collect vouchers before checkout",
    icon: "bi-ticket-perforated",
  },
  {
    variant: "bot",
    badge: "FREE SHIP",
    title: "FREE SHIPPING",
    sub: "Orders from 299k • Fast delivery",
    icon: "bi-truck",
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

function normalizeBasePath(p: string) {
  const s = String(p || "").trim();
  if (!s) return "/category";
  if (!s.startsWith("/")) return `/${s}`;
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

function ensureBiIcon(icon?: string | null) {
  if (!icon) return "bi-tag";
  return icon.startsWith("bi-") ? icon : `bi-${icon}`;
}

/* ================= Component ================= */
export function Hero1({
  siteId = "sitea01",
  categoryApiPath = "/api/admin/product-categories/sidebar-category",
  categoryBasePath = "/category",
  activeOnly = true,
  onlyRootCategories = true,

  slides,
  promos,
  rightBanners,

  autoMs = 4500,
  preview = false,
}: Hero1Props) {
  const [cats, setCats] = useState<ApiCategory[] | null>(null);

  useEffect(() => {
    if (preview) return;
    if (!siteId) return;

    const controller = new AbortController();

    (async () => {
      try {
        const bp = normalizeBasePath(categoryBasePath);
        const url =
          `${categoryApiPath}?siteId=${encodeURIComponent(siteId)}` +
          `&active=${activeOnly ? "1" : "0"}` +
          `&basePath=${encodeURIComponent(bp)}`;

        const res = await fetch(url, { cache: "no-store", signal: controller.signal });
        if (!res.ok) {
          console.error("[Hero1] load categories failed:", res.status, await res.text());
          setCats([]);
          return;
        }

        const data = (await res.json()) as SidebarCategoryResponse;

        const items = Array.isArray(data.items) ? data.items : [];
        const filtered = onlyRootCategories ? items.filter((x) => x.parentId === null) : items;

        const sorted = filtered
          .slice()
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.name.localeCompare(b.name));

        setCats(sorted);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("[Hero1] load categories error:", err);
        setCats([]);
      }
    })();

    return () => controller.abort();
  }, [preview, siteId, categoryApiPath, categoryBasePath, activeOnly, onlyRootCategories]);

  const sds = useMemo(() => slides ?? DEFAULT_SLIDES, [slides]);
  const prs = useMemo(() => promos ?? DEFAULT_PROMOS, [promos]);
  const rbs = useMemo(() => rightBanners ?? DEFAULT_RIGHT, [rightBanners]);

  const total = sds.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (total <= 1) return;

    const t = window.setInterval(() => {
      setIndex((cur) => (cur + 1) % total);
    }, Math.max(1200, autoMs));

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

  const sliderStyle = useMemo(
    () => ({ transform: `translateX(-${index * 100}%)` } as React.CSSProperties),
    [index],
  );

  const bp = normalizeBasePath(categoryBasePath);

  return (
    <section className={cls.hero}>
      {/* LEFT: categories */}
      <aside className={cls.cat} aria-label="Product Categories">
        <div className={cls.catHeader}>
          <i className="bi bi-list" />
          Product Categories
        </div>

        <ul className={cls.catList}>
          {(cats ?? []).length === 0 ? (
            <li>
              <span style={{ opacity: 0.7, fontSize: 12 }}>No categories</span>
            </li>
          ) : (
            (cats ?? []).map((c) =>
              preview ? (
                <li key={c.id}>
                  <a href="#" onClick={onBlockClick}>
                    <i className={`bi ${ensureBiIcon(c.icon)}`} />
                    {c.name}
                  </a>
                </li>
              ) : (
                <li key={c.id}>
                  <Link href={`${bp}/${c.slug}` as Route}>
                    <i className={`bi ${ensureBiIcon(c.icon)}`} />
                    {c.name}
                  </Link>
                </li>
              ),
            )
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
          <button className={`${cls.arrow} ${cls.prev}`} aria-label="Previous slide" type="button" onClick={prev}>
            <i className="bi bi-chevron-left" />
          </button>
          <button className={`${cls.arrow} ${cls.next}`} aria-label="Next slide" type="button" onClick={next}>
            <i className="bi bi-chevron-right" />
          </button>

          {/* slides */}
          <div className={cls.slides} style={sliderStyle}>
            {sds.map((s, i) => {
              const slideBg = i === 0 ? undefined : s.bg;
              const lines = s.headline.split("\n");
              return (
                <div
                  key={`${i}-${s.ctaHref}-${s.headline}`}
                  className={cls.slide}
                  style={slideBg ? ({ background: slideBg } as React.CSSProperties) : undefined}
                  aria-hidden={i !== index}>
                  <div>
                    <div className={cls.headline}>
                      {lines.map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < lines.length - 1 && <br />}
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
                    {s.imageSrc ? (
                      <div style={{ position: "relative", width: "100%", height: "100%" }}>
                        <Image src={s.imageSrc} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "contain" }} />
                      </div>
                    ) : (
                      !!s.chips?.length && (
                        <div className={cls.mini}>
                          {s.chips.map((chip) => (
                            <span key={chip} className={cls.chip}>
                              {chip}
                            </span>
                          ))}
                        </div>
                      )
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
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>

        {/* promos */}
        <div className={cls.promos} aria-label="Promo cards">
          {prs.map((p) =>
            preview ? (
              <a key={p.href || p.title} className={cls.promo} href="#" onClick={onBlockClick}>
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
              <Link key={p.href || p.title} className={cls.promo} href={(p.href || "/") as Route}>
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

    <aside className={cls.right} aria-label="Right banners">
      {rbs.map((b, i) => {
        const variantClass =
          i === 0
            ? cls.rbTop
            : i === 1
            ? cls.rbMid
            : cls.rbShip;

        return (
          <div
            key={`${b.badge}-${i}-${b.title}`}
            className={`${cls.rb} ${variantClass}`}>
            <span className={cls.rbBadge}>{b.badge}</span>

            <div className={cls.pad}>
              <div className={cls.rbTitle}>{b.title}</div>
              <div className={cls.rbSub}>{b.sub}</div>
            </div>

            <div className={cls.mockImg} aria-hidden="true">
              {b.imageSrc ? (
                <Image
                  src={b.imageSrc}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className={cls.rbIconWrap}>
                  <i
                    className={`bi ${b.icon} ${cls.rbIcon}`}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </aside>

    </section>
  );
}

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_HERO_GREEN_ONE: RegItem = {
  kind: "Hero1",
  label: "Hero",
  defaults: {
    autoMs: 4500,

    // API config (categories lấy từ API)
    siteId: "sitea01",
    categoryApiPath: "/api/admin/product-categories/sidebar-category",
    categoryBasePath: "/category",
    activeOnly: true,
    onlyRootCategories: true,

    // Các phần khác vẫn editable bằng JSON như cũ
    slides: JSON.stringify(DEFAULT_SLIDES, null, 2),
    promos: JSON.stringify(DEFAULT_PROMOS, null, 2),

    // ✅ RIGHT banners now 3 cards (share/voucher/free ship)
    rightBanners: JSON.stringify(DEFAULT_RIGHT, null, 2),
  },
  inspector: [
    { key: "autoMs", label: "Auto slide (ms)", kind: "number" },

    { key: "siteId", label: "Site ID (API)", kind: "text" },
    { key: "categoryApiPath", label: "Category API path", kind: "text" },
    { key: "categoryBasePath", label: "Category base path", kind: "text" },
    { key: "activeOnly", label: "Active only (true/false)", kind: "text" },
    { key: "onlyRootCategories", label: "Only root categories (true/false)", kind: "text" },

    { key: "slides", label: "Slides (JSON)", kind: "textarea", rows: 12 },
    { key: "promos", label: "Promos (JSON)", kind: "textarea", rows: 10 },
    { key: "rightBanners", label: "Right banners (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (p) => {
    const slides = safeJson<SlideItem[]>(p.slides);
    const promos = safeJson<PromoItem[]>(p.promos);
    const rightBanners = safeJson<RightBanner[]>(p.rightBanners);

    const siteId = String(p.siteId || "").trim() || "sitea01";
    const categoryApiPath = String(p.categoryApiPath || "").trim() || "/api/admin/product-categories/sidebar-category";
    const categoryBasePath = String(p.categoryBasePath || "").trim() || "/category";

    const activeOnly = String(p.activeOnly ?? "true").toLowerCase() !== "false" && String(p.activeOnly ?? "1") !== "0";
    const onlyRootCategories = String(p.onlyRootCategories ?? "true").toLowerCase() !== "false";

    return (
      <div className="sectionContainer" aria-label="Shop Hero (Green One)">
        <Hero1
          autoMs={Number(p.autoMs) || 4500}
          slides={slides}
          promos={promos}
          rightBanners={rightBanners}
          preview={p.preview}
          siteId={siteId}
          categoryApiPath={categoryApiPath}
          categoryBasePath={categoryBasePath}
          activeOnly={activeOnly}
          onlyRootCategories={onlyRootCategories}
        />
      </div>
    );
  },
};

export default Hero1;

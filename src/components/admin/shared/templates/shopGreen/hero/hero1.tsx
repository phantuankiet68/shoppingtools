"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/shopGreen/hero/hero1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
type ApiCategory = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder?: number;
  sort?: number;
  isActive?: boolean;
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
  icon?: string;
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
    headline: "Glow Up Today\nSkincare At Home",
    sub: "Authentic products • Fast delivery • Personalized support for your daily beauty routine",
    ctaLabel: "Shop Now",
    ctaHref: "/shop",
    chips: ["Cleanser", "Serum", "Moisturizer"],
    imageSrc: "/assets/images/product.jpg",
    bg: "linear-gradient(135deg, #7c2d12 0%, #ea580c 25%, #fb923c 55%, #7292f4 100%)",
  },
  {
    headline: "Beauty Deals\nUp To 50% Off",
    sub: "Weekly flash deals from trusted brands with premium product curation",
    ctaLabel: "View Offers",
    ctaHref: "/promotions",
    chips: ["Flash Sale", "Top Rated", "Exclusive"],
    imageSrc: "/assets/images/product.jpg",
    bg: "linear-gradient(135deg, #6697ff 0%, #1e293b 18%, #0ea5a4 58%, #7dd3fc 100%)",
  },
  {
    headline: "Authentic Brands\n100% Guaranteed",
    sub: "Easy returns • Genuine products • Elevated shopping experience for modern beauty stores",
    ctaLabel: "Explore Brands",
    ctaHref: "/brands",
    chips: ["Official", "Trusted", "Best Seller"],
    imageSrc: "/assets/images/product.jpg",
    bg: "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), linear-gradient(135deg, #f97316, #f472b6)",
  },
];

const DEFAULT_PROMOS: PromoItem[] = [
  { icon: "bi-droplet", title: "Skincare", sub: "Save up to 30%", off: "-30%", href: "/skincare" },
  { icon: "bi-bag-heart", title: "Makeup", sub: "Buy 2 get 1", off: "Hot", href: "/makeup" },
  { icon: "bi-brightness-high", title: "Sunscreen", sub: "Up to 40% off", off: "-40%", href: "/sunscreen" },
];

const DEFAULT_RIGHT: RightBanner[] = [
  {
    variant: "top",
    badge: "SHARE & EARN",
    title: "Share To Get Points",
    sub: "Invite friends and receive loyalty rewards instantly",
    icon: "bi-share",
  },
  {
    variant: "bot",
    badge: "VOUCHER",
    title: "Daily Discount Codes",
    sub: "Collect and apply special codes before checkout",
    icon: "bi-ticket-perforated",
  },
  {
    variant: "bot",
    badge: "FREE SHIP",
    title: "Free Shipping",
    sub: "Orders from 299k with fast delivery nationwide",
    icon: "bi-truck",
  },
];

/* ================= Helpers ================= */
function safeJson<T>(raw: unknown): T | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes") return true;
    if (v === "false" || v === "0" || v === "no") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function normalizeBasePath(p: string) {
  const s = String(p || "").trim();
  if (!s) return "/category";
  if (!s.startsWith("/")) return `/${s}`;
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

function ensureBiIcon(icon?: string | null) {
  if (!icon) return "bi-grid";
  return icon.startsWith("bi-") ? icon : `bi-${icon}`;
}

function getCategorySort(c: ApiCategory) {
  if (typeof c.sortOrder === "number") return c.sortOrder;
  if (typeof c.sort === "number") return c.sort;
  return 0;
}

function headlineToLines(headline: string) {
  return headline.split("\n").filter(Boolean);
}

function formatCount(count: number) {
  if (!Number.isFinite(count)) return "0";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

/* ================= Component ================= */
export function Hero1({
  siteId = "sitea01",
  categoryApiPath = "/api/v1/categories",
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
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

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

        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

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
          .sort((a, b) => getCategorySort(a) - getCategorySort(b) || a.name.localeCompare(b.name));

        setCats(sorted);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
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

  useEffect(() => {
    if (paused) return;
    if (total <= 1) return;

    const timer = window.setInterval(
      () => {
        setIndex((cur) => (cur + 1) % total);
      },
      Math.max(1800, autoMs),
    );

    return () => window.clearInterval(timer);
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
    () =>
      ({
        transform: `translate3d(-${index * 100}%, 0, 0)`,
      }) as React.CSSProperties,
    [index],
  );

  const bp = normalizeBasePath(categoryBasePath);
  const currentSlide = sds[index] ?? sds[0];
  const currentSlideLines = headlineToLines(currentSlide?.headline || "");

  return (
    <section className={cls.hero} aria-label="Commerce hero">
      {/* LEFT SIDEBAR */}
      <aside className={cls.cat} aria-label="Product Categories">
        <div className={cls.catHeader}>
          <div className={cls.catHeaderIcon}>
            <i className="bi bi-grid-1x2" />
          </div>

          <div className={cls.catHeaderText}>
            <div className={cls.catEyebrow}>Collections</div>
            <div className={cls.catTitle}>Product Categories</div>
          </div>
        </div>

        <div className={cls.catBody}>
          <ul className={cls.catList}>
            {(cats ?? []).length === 0 ? (
              <li className={cls.catEmpty}>
                <div className={cls.catEmptyIcon}>
                  <i className="bi bi-inboxes" />
                </div>
                <div className={cls.catEmptyTitle}>No categories</div>
                <div className={cls.catEmptySub}>Danh mục sẽ hiển thị khi API có dữ liệu.</div>
              </li>
            ) : (
              (cats ?? []).map((c, idx) => {
                const content = (
                  <>
                    <span className={cls.catItemLeft}>
                      <span className={cls.catItemIcon}>
                        <i className={`bi ${ensureBiIcon(c.icon)}`} />
                      </span>
                      <span className={cls.catItemText}>
                        <span className={cls.catItemName}>{c.name}</span>
                        <span className={cls.catItemMeta}>Featured collection</span>
                      </span>
                    </span>

                    <span className={cls.catItemRight}>
                      <span className={cls.catCount}>{formatCount(c.count)}</span>
                      <i className={`bi bi-arrow-up-right ${cls.catArrow}`} />
                    </span>
                  </>
                );

                return preview ? (
                  <li key={c.id} className={cls.catItem}>
                    <a
                      href="#"
                      onClick={onBlockClick}
                      className={`${cls.catLink} ${idx === 0 ? cls.catLinkActive : ""}`}
                    >
                      {content}
                    </a>
                  </li>
                ) : (
                  <li key={c.id} className={cls.catItem}>
                    <Link
                      href={`${bp}/${c.slug}` as Route}
                      className={`${cls.catLink} ${idx === 0 ? cls.catLinkActive : ""}`}
                    >
                      {content}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </aside>

      {/* CENTER */}
      <div className={cls.center}>
        <div
          className={cls.slider}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          aria-label="Hero slider"
        >
          <div className={cls.sliderViewport}>
            <div className={cls.sliderRail} style={sliderStyle}>
              {sds.map((s, i) => {
                const lines = headlineToLines(s.headline);
                const slideBg = s.bg;

                return (
                  <article
                    key={`${i}-${s.ctaHref}-${s.headline}`}
                    className={cls.slide}
                    style={{ background: slideBg }}
                    aria-hidden={i !== index}
                  >
                    <div className={cls.slideGlow} />
                    <div className={cls.slideNoise} />

                    <div className={cls.slideInner}>
                      <div className={cls.copy}>
                        <div className={cls.kickerRow}>
                          <span className={cls.kickerBadge}>Modern</span>
                          <span className={cls.kickerLine} />
                          <span className={cls.kickerText}>Curated beauty experience</span>
                        </div>

                        <div className={cls.headline}>
                          {lines.map((line, idx) => (
                            <React.Fragment key={idx}>
                              <span className={cls.headlineLine}>{line}</span>
                              {idx < lines.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>
                        {!!s.chips?.length && (
                          <div className={cls.heroChips}>
                            {s.chips.map((chip) => (
                              <span key={chip} className={cls.heroChip}>
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className={cls.ctaRow}>
                          {preview ? (
                            <button className={cls.cta} type="button" onClick={onBlockClick}>
                              <span>{s.ctaLabel}</span>
                              <i className="bi bi-arrow-right" />
                            </button>
                          ) : (
                            <Link
                              className={cls.cta}
                              href={(s.ctaHref || "/") as Route}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{s.ctaLabel}</span>
                              <i className="bi bi-arrow-right" />
                            </Link>
                          )}

                          <div className={cls.ctaGhost}>
                            <div className={cls.ctaGhostTitle}>Trusted by stores</div>
                            <div className={cls.ctaGhostSub}>Fast order flow • better conversion</div>
                          </div>
                        </div>

                        <div className={cls.metrics}>
                          <div className={cls.metric}>
                            <div className={cls.metricValue}>24/7</div>
                            <div className={cls.metricLabel}>Support</div>
                          </div>
                          <div className={cls.metric}>
                            <div className={cls.metricValue}>100%</div>
                            <div className={cls.metricLabel}>Authentic</div>
                          </div>
                          <div className={cls.metric}>
                            <div className={cls.metricValue}>48H</div>
                            <div className={cls.metricLabel}>Delivery</div>
                          </div>
                        </div>
                      </div>

                      <div className={cls.art} aria-hidden="true">
                        <div className={cls.visualShell}>
                          <div className={cls.visualOrbA} />
                          <div className={cls.visualOrbB} />
                          <div className={cls.visualCard}>
                            {s.imageSrc ? (
                              <div className={cls.visualImageWrap}>
                                <Image
                                  src={s.imageSrc}
                                  alt=""
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 45vw"
                                  className={cls.visualImage}
                                />
                              </div>
                            ) : (
                              <div className={cls.visualFallback}>
                                <div className={cls.visualFallbackIcon}>
                                  <i className="bi bi-stars" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className={cls.floatCardA}>
                            <span className={cls.floatCardLabel}>Premium</span>
                            <strong>Best seller</strong>
                          </div>

                          <div className={cls.floatCardB}>
                            <i className="bi bi-patch-check-fill" />
                            <span>Verified products</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <button className={`${cls.arrow} ${cls.prev}`} aria-label="Previous slide" type="button" onClick={prev}>
            <i className="bi bi-chevron-left" />
          </button>

          <button className={`${cls.arrow} ${cls.next}`} aria-label="Next slide" type="button" onClick={next}>
            <i className="bi bi-chevron-right" />
          </button>

          <div className={cls.bottomBar}>
            <div className={cls.progressInfo}>
              <span className={cls.progressCurrent}>{String(index + 1).padStart(2, "0")}</span>
              <span className={cls.progressDivider}>/</span>
              <span className={cls.progressTotal}>{String(total).padStart(2, "0")}</span>
            </div>

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

            <div className={cls.trustStrip}>
              <span className={cls.trustItem}>
                <i className="bi bi-shield-check" />
                Secure checkout
              </span>
              <span className={cls.trustItem}>
                <i className="bi bi-truck" />
                Fast shipping
              </span>
            </div>
          </div>
        </div>

        <div className={cls.promos} aria-label="Promo cards">
          {prs.map((p) => {
            const promoContent = (
              <>
                <div className={cls.promoLeft}>
                  <div className={cls.pIc}>
                    <i className={`bi ${ensureBiIcon(p.icon)}`} />
                  </div>
                  <div className={cls.pText}>
                    <div className={cls.pTitle}>{p.title}</div>
                    <div className={cls.pSub}>{p.sub}</div>
                  </div>
                </div>

                <div className={cls.promoRight}>
                  <span className={cls.pOff}>{p.off}</span>
                  <i className={`bi bi-arrow-up-right ${cls.pArrow}`} />
                </div>
              </>
            );

            return preview ? (
              <a key={p.href || p.title} className={cls.promo} href="#" onClick={onBlockClick}>
                {promoContent}
              </a>
            ) : (
              <Link key={p.href || p.title} className={cls.promo} href={(p.href || "/") as Route}>
                {promoContent}
              </Link>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <aside className={cls.right} aria-label="Right banners">
        {rbs.map((b, i) => {
          const variantClass = i === 0 ? cls.rbTop : i === 1 ? cls.rbMid : cls.rbShip;

          return (
            <article key={`${b.badge}-${i}-${b.title}`} className={`${cls.rb} ${variantClass}`}>
              <div className={cls.rbGlow} />
              <div className={cls.rbHead}>
                <span className={cls.rbBadge}>{b.badge}</span>
              </div>
              <div className={cls.rbTitle}>{b.title}</div>
              <div className={cls.rbBody}>
                <div className={cls.rbText}>
                  <div className={cls.rbSub}>{b.sub}</div>
                </div>

                <div className={cls.mockImg} aria-hidden="true">
                  {b.imageSrc ? (
                    <Image
                      src={b.imageSrc}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className={cls.rbImage}
                    />
                  ) : (
                    <div className={cls.rbIconWrap}>
                      <i className={`bi ${ensureBiIcon(b.icon)} ${cls.rbIcon}`} />
                    </div>
                  )}
                </div>
              </div>

              <div className={cls.rbFoot}>
                <span className={cls.rbAction}>Learn more</span>
                <i className="bi bi-arrow-right" />
              </div>
            </article>
          );
        })}
      </aside>

      {/* accessibility hidden text */}
      <div className={cls.srOnly} aria-hidden="true">
        {currentSlideLines.join(" ")}
      </div>
    </section>
  );
}

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_HERO_GREEN_ONE: RegItem = {
  kind: "Hero1",
  label: "Hero",
  defaults: {
    autoMs: 4500,
    siteId: "sitea01",
    categoryApiPath: "/api/v1/categories",
    categoryBasePath: "/category",
    activeOnly: true,
    onlyRootCategories: true,
    slides: JSON.stringify(DEFAULT_SLIDES, null, 2),
    promos: JSON.stringify(DEFAULT_PROMOS, null, 2),
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

    const siteId = asString(p.siteId, "sitea01").trim() || "sitea01";
    const categoryApiPath = asString(p.categoryApiPath, "/api/v1/categories").trim() || "/api/v1/categories";
    const categoryBasePath = asString(p.categoryBasePath, "/category").trim() || "/category";

    const activeOnly = asBoolean(p.activeOnly, true);
    const onlyRootCategories = asBoolean(p.onlyRootCategories, true);
    const preview = asBoolean(p.preview, false);
    const autoMs = asNumber(p.autoMs, 4500);

    return (
      <div className="sectionContainer" aria-label="Shop Hero (Green One)">
        <Hero1
          autoMs={autoMs}
          slides={slides}
          promos={promos}
          rightBanners={rightBanners}
          preview={preview}
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

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Hero/HeroUtility.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
type CategoryApiItem = {
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

type CategoryApiResponse = {
  siteId: string;
  domain?: string;
  activeOnly?: boolean;
  basePath?: string;
  items: CategoryApiItem[];
  tree?: unknown;
};

export type HeroUtilitySlide = {
  imageSrc: string;
  mobileImageSrc?: string;
  href: string;
  alt?: string;
  title?: string;
  sub?: string;
  badge?: string;
  bg?: string;
};

export type HeroUtilityTool = {
  label: string;
  href: string;
  icon?: string;
  sub?: string;
};

export type HeroUtilityCard = {
  title: string;
  sub?: string;
  href: string;
  imageSrc?: string;
  icon?: string;
  tone?: "rose" | "peach" | "pearl" | "mint" | "violet";
};

export type HeroUtilityStat = {
  label: string;
  value: string;
  icon?: string;
  href?: string;
};

export type HeroUtilityProps = {
  siteId?: string;
  categoryApiPath?: string;
  categoryBasePath?: string;
  activeOnly?: boolean;
  onlyRootCategories?: boolean;
  slides?: HeroUtilitySlide[];
  tools?: HeroUtilityTool[];
  cards?: HeroUtilityCard[];
  stats?: HeroUtilityStat[];
  autoMs?: number;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_SLIDES: HeroUtilitySlide[] = [
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/new",
    alt: "Modern premium shopping banner",
    title: "Modern beauty, curated for daily ritual",
    sub: "A cleaner hero direction for 2026 marketplaces with stronger hierarchy, richer trust cues, and faster product discovery.",
    badge: "2026 edit",
    bg: "linear-gradient(135deg, #f7f3ff 0%, #fff7fb 45%, #ffffff 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/gifts",
    alt: "Premium gift collection banner",
    title: "Gift-led collections with elevated presentation",
    sub: "Highlight seasonal gifting, soft luxury packaging, and premium bestsellers in a layout built to convert.",
    badge: "gift focus",
    bg: "linear-gradient(135deg, #fff6ef 0%, #fffaf7 48%, #ffffff 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/decor",
    alt: "Decor and lifestyle collection banner",
    title: "Design-forward living starts with better browsing",
    sub: "Blend utility, trust, and editorial polish for a storefront that feels current, credible, and commerce-ready.",
    badge: "living now",
    bg: "linear-gradient(135deg, #eef7ff 0%, #f7fbff 48%, #ffffff 100%)",
  },
];

const DEFAULT_TOOLS: HeroUtilityTool[] = [
  { label: "New Arrivals", href: "/collections/new", icon: "bi-bag-heart", sub: "Fresh drops" },
  { label: "Gift Studio", href: "/collections/gifts", icon: "bi-gift", sub: "Curated gifting" },
  { label: "Home Decor", href: "/collections/decor", icon: "bi-house-heart", sub: "Interior mood" },
  { label: "Beauty Edit", href: "/collections/beauty", icon: "bi-stars", sub: "Top selections" },
  { label: "Offers", href: "/promotions", icon: "bi-ticket-perforated", sub: "Smart savings" },
  { label: "Wishlist", href: "/wishlist", icon: "bi-heart", sub: "Saved favorites" },
];

const DEFAULT_CARDS: HeroUtilityCard[] = [
  {
    title: "Gift Sets",
    sub: "Premium gifting with thoughtful presentation",
    href: "/collections/gifts",
    imageSrc: "/assets/images/product.jpg",
    icon: "bi-heart",
    tone: "rose",
  },
  {
    title: "Home Styling",
    sub: "Soft, modern accents for elevated spaces",
    href: "/collections/decor",
    imageSrc: "/assets/images/product.jpg",
    icon: "bi-house-heart",
    tone: "pearl",
  },
  {
    title: "Beauty Essentials",
    sub: "Weekly bestsellers trusted by customers",
    href: "/collections/beauty",
    imageSrc: "/assets/images/product.jpg",
    icon: "bi-stars",
    tone: "peach",
  },
];

const DEFAULT_STATS: HeroUtilityStat[] = [
  { label: "New collections", value: "128+", icon: "bi-stars", href: "/collections/new" },
  { label: "Active offers", value: "32", icon: "bi-ticket-perforated", href: "/promotions" },
  { label: "Trusted shops", value: "240", icon: "bi-shop", href: "/shops" },
  { label: "Featured orders", value: "96", icon: "bi-box-seam", href: "/orders" },
];

/* ================= Helpers ================= */
function safeJsonParse<T>(raw: unknown): T | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toBooleanValue(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
    if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  }

  if (typeof value === "number") return value !== 0;

  return fallback;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function normalizeBasePath(path: string): string {
  const trimmed = String(path || "").trim();

  if (!trimmed) return "/category";
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function getCategorySortValue(category: CategoryApiItem): number {
  if (typeof category.sortOrder === "number") return category.sortOrder;
  if (typeof category.sort === "number") return category.sort;
  return 0;
}

function ensureBootstrapIcon(icon?: string | null): string {
  if (!icon) return "bi-grid";
  return icon.startsWith("bi-") ? icon : `bi-${icon}`;
}

function formatCategoryCount(count: number): string {
  if (!Number.isFinite(count)) return "0";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

function resolveToneClass(tone?: HeroUtilityCard["tone"]): string {
  switch (tone) {
    case "peach":
      return cls.cardTonePeach;
    case "pearl":
      return cls.cardTonePearl;
    case "mint":
      return cls.cardToneMint;
    case "violet":
      return cls.cardToneViolet;
    case "rose":
    default:
      return cls.cardToneRose;
  }
}

/* ================= Component ================= */
export function HeroUtility({
  siteId = "sitea01",
  categoryApiPath = "/api/v1/categories",
  categoryBasePath = "/category",
  activeOnly = true,
  onlyRootCategories = true,
  slides = DEFAULT_SLIDES,
  tools = DEFAULT_TOOLS,
  cards = DEFAULT_CARDS,
  stats = DEFAULT_STATS,
  autoMs = 4200,
  preview = false,
}: HeroUtilityProps) {
  const [categories, setCategories] = useState<CategoryApiItem[] | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const totalSlides = slides.length;
  const normalizedBasePath = normalizeBasePath(categoryBasePath);

  useEffect(() => {
    if (preview || !siteId) return;

    const controller = new AbortController();
    let alive = true;

    const loadCategories = async () => {
      try {
        const params = new URLSearchParams({
          siteId,
          active: activeOnly ? "1" : "0",
          basePath: normalizedBasePath,
        });

        const response = await fetch(`${categoryApiPath}?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          console.error("[HeroUtility] load categories failed:", response.status, await response.text());
          if (alive) setCategories([]);
          return;
        }

        const data = (await response.json()) as CategoryApiResponse;
        const items = Array.isArray(data.items) ? data.items : [];
        const filteredItems = onlyRootCategories ? items.filter((item) => item.parentId === null) : items;
        const sortedItems = filteredItems
          .slice()
          .sort((a, b) => getCategorySortValue(a) - getCategorySortValue(b) || a.name.localeCompare(b.name));

        if (alive) setCategories(sortedItems);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("[HeroUtility] load categories error:", error);
        if (alive) setCategories([]);
      }
    };

    void loadCategories();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [preview, siteId, categoryApiPath, normalizedBasePath, activeOnly, onlyRootCategories]);

  useEffect(() => {
    if (totalSlides === 0) {
      if (activeSlideIndex !== 0) setActiveSlideIndex(0);
      return;
    }

    if (activeSlideIndex >= totalSlides) {
      setActiveSlideIndex(0);
    }
  }, [activeSlideIndex, totalSlides]);

  useEffect(() => {
    if (paused || totalSlides <= 1) return;

    const intervalId = window.setInterval(
      () => {
        setActiveSlideIndex((current) => (current + 1) % totalSlides);
      },
      Math.max(2500, autoMs),
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [paused, autoMs, totalSlides]);

  const handlePreviewBlockClick = (event: React.SyntheticEvent) => {
    if (!preview) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const goToSlide = (targetIndex: number) => {
    if (totalSlides <= 0) return;
    setActiveSlideIndex((targetIndex + totalSlides) % totalSlides);
  };

  const goToPreviousSlide = () => goToSlide(activeSlideIndex - 1);
  const goToNextSlide = () => goToSlide(activeSlideIndex + 1);

  const currentSlide = slides[activeSlideIndex] ?? slides[0];
  const categoryItems = useMemo(() => (categories ?? []).slice(0, 8), [categories]);
  const toolItems = useMemo(() => tools.slice(0, 6), [tools]);
  const cardItems = useMemo(() => cards.slice(0, 3), [cards]);
  const statItems = useMemo(() => stats.slice(0, 4), [stats]);

  const renderNavTarget = (href: string, className: string, content: React.ReactNode, ariaLabel?: string) => {
    if (preview) {
      return (
        <a href="#" onClick={handlePreviewBlockClick} className={className} aria-label={ariaLabel}>
          {content}
        </a>
      );
    }

    return (
      <Link href={(href || "/") as Route} className={className} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  };

  return (
    <section className={cls.hero} aria-label="Hero Utility promotional section">
      <div className={cls.shell}>
        <aside className={cls.sidebar} aria-label="Product categories">
          <div className={cls.sidebarPanel}>
            <div className={cls.sidebarHead}>
              <span className={cls.sidebarEyebrow}>Browse</span>
              <h2 className={cls.sidebarTitle}>Categories</h2>
            </div>

            <ul className={cls.categoryList}>
              {categoryItems.length === 0 ? (
                <li className={cls.categoryEmpty} aria-live="polite">
                  <div className={cls.categoryEmptyIcon} aria-hidden="true">
                    <i className="bi bi-grid-3x3-gap" />
                  </div>
                  <div className={cls.categoryEmptyTitle}>No categories yet</div>
                  <div className={cls.categoryEmptySub}>Categories will appear here once the API returns data.</div>
                </li>
              ) : (
                categoryItems.map((category) => {
                  const content = (
                    <>
                      <span className={cls.categoryLeft}>
                        <span className={cls.categoryIcon} aria-hidden="true">
                          <i className={`bi ${ensureBootstrapIcon(category.icon)}`} />
                        </span>
                        <span className={cls.categoryName}>{category.name}</span>
                      </span>
                      <span className={cls.categoryMeta}>{formatCategoryCount(category.count)}</span>
                    </>
                  );

                  return (
                    <li key={category.id} className={cls.categoryItem}>
                      {preview ? (
                        <a
                          href="#"
                          onClick={handlePreviewBlockClick}
                          className={cls.categoryLink}
                          aria-label={`Open ${category.name} category`}
                        >
                          {content}
                        </a>
                      ) : (
                        <Link
                          href={`${normalizedBasePath}/${category.slug}` as Route}
                          className={cls.categoryLink}
                          aria-label={`Open ${category.name} category`}
                        >
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </aside>

        <div className={cls.contentCol}>
          <div className={cls.mainGrid}>
            <div className={cls.heroBlock}>
              <div
                className={cls.heroMain}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocusCapture={() => setPaused(true)}
                onBlurCapture={() => setPaused(false)}
              >
                <div className={cls.infoPanel}>
                  <div className={cls.copySurface}>
                    <div className={cls.heroBadge}>{currentSlide?.badge || "featured"}</div>
                    <h1 className={cls.heroTitle}>
                      {currentSlide?.title || "Modern beauty, curated for daily ritual"}
                    </h1>
                    <p className={cls.heroSub}>
                      {currentSlide?.sub ||
                        "A utility-focused hero layout built for quick navigation, stronger trust, and a clean premium browsing experience."}
                    </p>

                    <div className={cls.heroActions}>
                      {renderNavTarget(
                        currentSlide?.href || "/",
                        cls.primaryCta,
                        <>
                          Shop now
                          <i className="bi bi-arrow-up-right" aria-hidden="true" />
                        </>,
                        "Shop the featured collection",
                      )}
                      {renderNavTarget("/collections/new", cls.secondaryCta, <>New arrivals</>, "See new arrivals")}
                    </div>
                  </div>

                  <div className={cls.toolGrid} aria-label="Quick shopping tools">
                    {toolItems.map((item, index) => {
                      const content = (
                        <>
                          <span className={cls.toolIcon} aria-hidden="true">
                            <i className={`bi ${ensureBootstrapIcon(item.icon)}`} />
                          </span>
                          <span className={cls.toolMeta}>
                            <span className={cls.toolLabel}>{item.label}</span>
                            {item.sub ? <span className={cls.toolSub}>{item.sub}</span> : null}
                          </span>
                        </>
                      );

                      return (
                        <React.Fragment key={`${item.href}-${index}`}>
                          {renderNavTarget(item.href, cls.toolItem, content, `Open ${item.label}`)}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                <div className={cls.visualPanel}>
                  <div className={cls.mediaFrame}>
                    <div
                      className={cls.sliderViewport}
                      aria-roledescription="carousel"
                      aria-label="Featured utility promotions"
                    >
                      <div
                        className={cls.sliderRail}
                        style={{ transform: `translate3d(-${activeSlideIndex * 100}%, 0, 0)` }}
                      >
                        {slides.map((slide, index) => {
                          const slideContent = (
                            <article
                              key={`${slide.href}-${index}`}
                              className={cls.slide}
                              aria-hidden={index !== activeSlideIndex}
                              aria-label={slide.title || `Slide ${index + 1}`}
                              style={{ background: slide.bg || undefined }}
                            >
                              <div className={cls.slideAura} aria-hidden="true" />
                              <div className={cls.slideMedia}>
                                <Image
                                  src={slide.imageSrc}
                                  alt={slide.alt || slide.title || "Featured utility banner"}
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 42vw"
                                  className={cls.slideImage}
                                  priority={index === 0}
                                />
                              </div>
                            </article>
                          );

                          return preview ? (
                            <a
                              key={`${slide.href}-${index}`}
                              href="#"
                              onClick={handlePreviewBlockClick}
                              className={cls.slideLink}
                              aria-label={`Open ${slide.title || `slide ${index + 1}`}`}
                            >
                              {slideContent}
                            </a>
                          ) : (
                            <Link
                              key={`${slide.href}-${index}`}
                              href={(slide.href || "/") as Route}
                              className={cls.slideLink}
                              aria-label={`Open ${slide.title || `slide ${index + 1}`}`}
                            >
                              {slideContent}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className={cls.previewMeta} aria-label="Featured shopping note">
                      <span className={cls.previewTag}>Editor&apos;s pick</span>
                      <p className={cls.previewText}>
                        Built for premium commerce, faster discovery, and a cleaner 2026 visual rhythm.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`${cls.arrowBtn} ${cls.arrowPrev}`}
                  aria-label="Show previous slide"
                  onClick={goToPreviousSlide}
                >
                  <i className="bi bi-arrow-left" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className={`${cls.arrowBtn} ${cls.arrowNext}`}
                  aria-label="Show next slide"
                  onClick={goToNextSlide}
                >
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>

                <div className={cls.heroDots} role="tablist" aria-label="Slide navigation">
                  {slides.map((slide, index) => (
                    <button
                      key={`${slide.href}-${index}`}
                      type="button"
                      className={`${cls.heroDot} ${index === activeSlideIndex ? cls.heroDotActive : ""}`}
                      role="tab"
                      aria-label={`Show ${slide.title || `slide ${index + 1}`}`}
                      aria-selected={index === activeSlideIndex}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              </div>

              <div className={cls.cardGrid} aria-label="Featured shopping cards">
                {cardItems.map((card, index) => {
                  const content = (
                    <>
                      <div className={cls.cardCopy}>
                        <span className={cls.cardIcon} aria-hidden="true">
                          <i className={`bi ${ensureBootstrapIcon(card.icon)}`} />
                        </span>
                        <div className={cls.cardTitle}>{card.title}</div>
                        {card.sub ? <div className={cls.cardSub}>{card.sub}</div> : null}
                      </div>

                      <div className={cls.cardMedia}>
                        {card.imageSrc ? (
                          <Image
                            src={card.imageSrc}
                            alt={card.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 16vw"
                            className={cls.cardImage}
                          />
                        ) : (
                          <div className={cls.cardFallback} aria-hidden="true">
                            <i className={`bi ${ensureBootstrapIcon(card.icon)}`} />
                          </div>
                        )}
                      </div>
                    </>
                  );

                  return (
                    <React.Fragment key={`${card.href}-${index}`}>
                      {renderNavTarget(
                        card.href,
                        `${cls.card} ${resolveToneClass(card.tone)}`,
                        content,
                        `Open ${card.title}`,
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_HERO_UTILITY: RegItem = {
  kind: "HeroUtility",
  label: "Hero Utility",
  defaults: {
    autoMs: 4200,
    siteId: "sitea01",
    categoryApiPath: "/api/v1/categories",
    categoryBasePath: "/category",
    activeOnly: true,
    onlyRootCategories: true,
    slides: JSON.stringify(DEFAULT_SLIDES, null, 2),
    tools: JSON.stringify(DEFAULT_TOOLS, null, 2),
    cards: JSON.stringify(DEFAULT_CARDS, null, 2),
    stats: JSON.stringify(DEFAULT_STATS, null, 2),
  },
  inspector: [
    { key: "autoMs", label: "Auto slide (ms)", kind: "number" },
    { key: "siteId", label: "Site ID (API)", kind: "text" },
    { key: "categoryApiPath", label: "Category API path", kind: "text" },
    { key: "categoryBasePath", label: "Category base path", kind: "text" },
    { key: "activeOnly", label: "Active only (true/false)", kind: "text" },
    { key: "onlyRootCategories", label: "Only root categories (true/false)", kind: "text" },
    { key: "slides", label: "Slides (JSON)", kind: "textarea", rows: 12 },
    { key: "tools", label: "Tools (JSON)", kind: "textarea", rows: 10 },
    { key: "cards", label: "Cards (JSON)", kind: "textarea", rows: 10 },
    { key: "stats", label: "Stats (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const slides = safeJsonParse<HeroUtilitySlide[]>(props.slides);
    const tools = safeJsonParse<HeroUtilityTool[]>(props.tools);
    const cards = safeJsonParse<HeroUtilityCard[]>(props.cards);
    const stats = safeJsonParse<HeroUtilityStat[]>(props.stats);

    const siteId = toStringValue(props.siteId, "sitea01").trim() || "sitea01";
    const categoryApiPath = toStringValue(props.categoryApiPath, "/api/v1/categories").trim() || "/api/v1/categories";
    const categoryBasePath = toStringValue(props.categoryBasePath, "/category").trim() || "/category";

    const activeOnly = toBooleanValue(props.activeOnly, true);
    const onlyRootCategories = toBooleanValue(props.onlyRootCategories, true);
    const preview = toBooleanValue(props.preview, false);
    const autoMs = toNumberValue(props.autoMs, 4200);

    return (
      <div className="sectionContainer" aria-label="Shop Hero Utility">
        <HeroUtility
          autoMs={autoMs}
          slides={slides}
          tools={tools}
          cards={cards}
          stats={stats}
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

export default HeroUtility;

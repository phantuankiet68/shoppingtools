"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Hero/HeroTicker.module.css";
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

export type HeroTickerSlide = {
  imageSrc: string;
  mobileImageSrc?: string;
  href: string;
  alt?: string;
  title?: string;
  sub?: string;
  badge?: string;
  bg?: string;
};

export type HeroTickerChip = {
  label: string;
  href: string;
  icon?: string;
};

export type HeroTickerCard = {
  title: string;
  sub?: string;
  href: string;
  imageSrc?: string;
  icon?: string;
  tone?: "rose" | "peach" | "pearl" | "mint" | "violet";
};

export type HeroTickerTickerItem = {
  label: string;
  value?: string;
  href?: string;
  icon?: string;
};

export type HeroTickerProps = {
  siteId?: string;
  categoryApiPath?: string;
  categoryBasePath?: string;
  activeOnly?: boolean;
  onlyRootCategories?: boolean;
  slides?: HeroTickerSlide[];
  chips?: HeroTickerChip[];
  cards?: HeroTickerCard[];
  tickerItems?: HeroTickerTickerItem[];
  autoMs?: number;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_SLIDES: HeroTickerSlide[] = [
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/new",
    alt: "New arrivals collection banner",
    title: "Fresh arrivals for a softer everyday style",
    sub: "Explore curated picks in gifts, decor, and beauty with a clean premium look.",
    badge: "new in",
    bg: "linear-gradient(135deg, #fff0f5 0%, #fff8fb 55%, #ffffff 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/gifts",
    alt: "Gift ideas collection banner",
    title: "Thoughtful gifts for meaningful moments",
    sub: "Choose polished gift ideas for birthdays, celebrations, and heartfelt surprises.",
    badge: "gift edit",
    bg: "linear-gradient(135deg, #fff3ec 0%, #fff9f6 55%, #ffffff 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/decor",
    alt: "Home decor collection banner",
    title: "Bring warmth and elegance to your space",
    sub: "Shop bright, calm, and refined decor pieces designed for modern living.",
    badge: "decor mood",
    bg: "linear-gradient(135deg, #f7f0ff 0%, #fcf8ff 55%, #ffffff 100%)",
  },
];

const DEFAULT_CHIPS: HeroTickerChip[] = [
  { label: "New In", href: "/collections/new", icon: "bi-bag-heart" },
  { label: "Gifts", href: "/collections/gifts", icon: "bi-gift" },
  { label: "Decor", href: "/collections/decor", icon: "bi-flower1" },
  { label: "Beauty", href: "/collections/beauty", icon: "bi-stars" },
  { label: "Promotions", href: "/promotions", icon: "bi-ticket-perforated" },
  { label: "Wishlist", href: "/wishlist", icon: "bi-heart" },
];

const DEFAULT_CARDS: HeroTickerCard[] = [
  {
    title: "Daily Gift Picks",
    sub: "Gentle suggestions for someone special",
    href: "/collections/gifts",
    imageSrc: "/assets/images/product.jpg",
    icon: "bi-heart",
    tone: "rose",
  },
  {
    title: "Soft Decor Corner",
    sub: "Create a brighter, warmer, and more elegant home",
    href: "/collections/decor",
    imageSrc: "/assets/images/product.jpg",
    icon: "bi-house-heart",
    tone: "pearl",
  },
  {
    title: "Beauty Favorites",
    sub: "Customer-loved picks of the week",
    href: "/collections/beauty",
    imageSrc: "/assets/images/product.jpg",
    icon: "bi-stars",
    tone: "peach",
  },
];

const DEFAULT_TICKER_ITEMS: HeroTickerTickerItem[] = [
  { label: "New collections", value: "128+", href: "/collections/new", icon: "bi-stars" },
  { label: "Active offers", value: "32", href: "/promotions", icon: "bi-ticket-perforated" },
  { label: "Favorite shops", value: "240", href: "/shops", icon: "bi-shop" },
  { label: "Trending gifts", value: "76", href: "/collections/gifts", icon: "bi-gift" },
  { label: "Best-selling decor", value: "54", href: "/collections/decor", icon: "bi-house-heart" },
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

function resolveToneClass(tone?: HeroTickerCard["tone"]): string {
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
export function HeroTicker({
  siteId = "sitea01",
  categoryApiPath = "/api/v1/categories",
  categoryBasePath = "/category",
  activeOnly = true,
  onlyRootCategories = true,
  slides = DEFAULT_SLIDES,
  chips = DEFAULT_CHIPS,
  cards = DEFAULT_CARDS,
  tickerItems = DEFAULT_TICKER_ITEMS,
  autoMs = 4200,
  preview = false,
}: HeroTickerProps) {
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
          console.error("[HeroTicker] load categories failed:", response.status, await response.text());
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
        console.error("[HeroTicker] load categories error:", error);
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
  const chipItems = useMemo(() => chips.slice(0, 6), [chips]);
  const cardItems = useMemo(() => cards.slice(0, 3), [cards]);
  const tickerRowItems = useMemo(() => {
    const base = tickerItems.length > 0 ? tickerItems : DEFAULT_TICKER_ITEMS;
    return [...base, ...base];
  }, [tickerItems]);

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
    <section className={cls.hero} aria-label="Hero Ticker promotional section">
      <div className={cls.shell}>
        <aside className={cls.sidebar} aria-label="Product categories">
          <div className={cls.sidebarPanel}>
            <div className={cls.sidebarHead}>
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
          <div className={cls.tickerWrap} aria-label="Store highlights ticker">
            <div className={cls.tickerTrack}>
              {tickerRowItems.map((item, index) => {
                const content = (
                  <span className={cls.tickerItemInner}>
                    <span className={cls.tickerIcon} aria-hidden="true">
                      <i className={`bi ${ensureBootstrapIcon(item.icon)}`} />
                    </span>
                    <span className={cls.tickerLabel}>{item.label}</span>
                    {item.value ? <span className={cls.tickerValue}>{item.value}</span> : null}
                  </span>
                );

                if (preview) {
                  return (
                    <a
                      key={`${item.label}-${index}`}
                      href="#"
                      onClick={handlePreviewBlockClick}
                      className={cls.tickerItem}
                      aria-label={item.label}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <Link
                    key={`${item.label}-${index}`}
                    href={(item.href || "/") as Route}
                    className={cls.tickerItem}
                    aria-label={item.label}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className={cls.mainGrid}>
            <div className={cls.heroArea}>
              <div
                className={cls.heroMain}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocusCapture={() => setPaused(true)}
                onBlurCapture={() => setPaused(false)}
              >
                <div className={cls.heroCopy}>
                  <div className={cls.heroBadge}>{currentSlide?.badge || "featured"}</div>
                  <h1 className={cls.heroTitle}>
                    {currentSlide?.title || "Fresh arrivals for a softer everyday style"}
                  </h1>
                  <p className={cls.heroSub}>
                    {currentSlide?.sub ||
                      "A visually rich hero ticker layout with quick access, trust cues, and strong shopping intent."}
                  </p>
                  <div className={cls.heroActions}>
                    {renderNavTarget(
                      currentSlide?.href || "/",
                      cls.primaryCta,
                      <>
                        Shop now
                        <i className="bi bi-arrow-right" aria-hidden="true" />
                      </>,
                      "Shop the featured collection",
                    )}
                    {renderNavTarget("/collections/new", cls.secondaryCta, <>See new arrivals</>, "See new arrivals")}
                  </div>
                </div>

                <div className={cls.sliderViewport} aria-roledescription="carousel" aria-label="Featured promotions">
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
                          <div className={cls.slideGlow} aria-hidden="true" />
                          <div className={cls.slideMedia}>
                            <Image
                              src={slide.imageSrc}
                              alt={slide.alt || slide.title || "Featured hero banner"}
                              fill
                              sizes="(max-width: 1024px) 100vw, 48vw"
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

                <button
                  type="button"
                  className={`${cls.arrowBtn} ${cls.arrowPrev}`}
                  aria-label="Show previous slide"
                  onClick={goToPreviousSlide}
                >
                  <i className="bi bi-chevron-left" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className={`${cls.arrowBtn} ${cls.arrowNext}`}
                  aria-label="Show next slide"
                  onClick={goToNextSlide}
                >
                  <i className="bi bi-chevron-right" aria-hidden="true" />
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
                            sizes="(max-width: 1024px) 100vw, 14vw"
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

            <aside className={cls.sidePanel} aria-label="Quick links">
              <div className={cls.chipPanel}>
                <h2 className={cls.chipPanelTitle}>Quick Links</h2>
                <div className={cls.chipGrid}>
                  {chipItems.map((chip, index) => {
                    const content = (
                      <>
                        <span className={cls.chipIcon} aria-hidden="true">
                          <i className={`bi ${ensureBootstrapIcon(chip.icon)}`} />
                        </span>
                        <span className={cls.chipLabel}>{chip.label}</span>
                      </>
                    );

                    return (
                      <React.Fragment key={`${chip.href}-${index}`}>
                        {renderNavTarget(chip.href, cls.chipItem, content, `Open ${chip.label}`)}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_HERO_TICKER: RegItem = {
  kind: "HeroTicker",
  label: "Hero Ticker",
  defaults: {
    autoMs: 4200,
    siteId: "sitea01",
    categoryApiPath: "/api/v1/categories",
    categoryBasePath: "/category",
    activeOnly: true,
    onlyRootCategories: true,
    slides: JSON.stringify(DEFAULT_SLIDES, null, 2),
    chips: JSON.stringify(DEFAULT_CHIPS, null, 2),
    cards: JSON.stringify(DEFAULT_CARDS, null, 2),
    tickerItems: JSON.stringify(DEFAULT_TICKER_ITEMS, null, 2),
  },
  inspector: [
    { key: "autoMs", label: "Auto slide (ms)", kind: "number" },
    { key: "siteId", label: "Site ID (API)", kind: "text" },
    { key: "categoryApiPath", label: "Category API path", kind: "text" },
    { key: "categoryBasePath", label: "Category base path", kind: "text" },
    { key: "activeOnly", label: "Active only (true/false)", kind: "text" },
    { key: "onlyRootCategories", label: "Only root categories (true/false)", kind: "text" },
    { key: "slides", label: "Slides (JSON)", kind: "textarea", rows: 12 },
    { key: "chips", label: "Chips (JSON)", kind: "textarea", rows: 10 },
    { key: "cards", label: "Cards (JSON)", kind: "textarea", rows: 10 },
    { key: "tickerItems", label: "Ticker items (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const slides = safeJsonParse<HeroTickerSlide[]>(props.slides);
    const chips = safeJsonParse<HeroTickerChip[]>(props.chips);
    const cards = safeJsonParse<HeroTickerCard[]>(props.cards);
    const tickerItems = safeJsonParse<HeroTickerTickerItem[]>(props.tickerItems);

    const siteId = toStringValue(props.siteId, "sitea01").trim() || "sitea01";
    const categoryApiPath = toStringValue(props.categoryApiPath, "/api/v1/categories").trim() || "/api/v1/categories";
    const categoryBasePath = toStringValue(props.categoryBasePath, "/category").trim() || "/category";

    const activeOnly = toBooleanValue(props.activeOnly, true);
    const onlyRootCategories = toBooleanValue(props.onlyRootCategories, true);
    const preview = toBooleanValue(props.preview, false);
    const autoMs = toNumberValue(props.autoMs, 4200);

    return (
      <div className="sectionContainer" aria-label="Shop Hero Ticker">
        <HeroTicker
          autoMs={autoMs}
          slides={slides}
          chips={chips}
          cards={cards}
          tickerItems={tickerItems}
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

export default HeroTicker;

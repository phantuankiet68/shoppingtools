"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Hero/HeroMinimal.module.css";
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

export type HeroMinimalSlide = {
  imageSrc: string;
  mobileImageSrc?: string;
  href: string;
  alt?: string;
  bg?: string;
};

export type HeroMinimalCard = {
  title: string;
  sub?: string;
  href: string;
  imageSrc?: string;
  icon?: string;
  tone?: "rose" | "pearl" | "sand" | "mint" | "violet";
};

export type HeroMinimalPill = {
  label: string;
  href: string;
  icon?: string;
};

export type HeroMinimalProps = {
  siteId?: string;
  categoryApiPath?: string;
  categoryBasePath?: string;
  activeOnly?: boolean;
  onlyRootCategories?: boolean;
  slides?: HeroMinimalSlide[];
  cards?: HeroMinimalCard[];
  pills?: HeroMinimalPill[];
  autoMs?: number;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_SLIDES: HeroMinimalSlide[] = [
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/new",
    alt: "Luxury skincare collection",
    bg: "linear-gradient(135deg, #f8f2ef 0%, #f6f0ec 45%, #f9f7f5 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/gifts",
    alt: "Elegant gift collection",
    bg: "linear-gradient(135deg, #f4ece8 0%, #f8f5f3 50%, #fbf9f7 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/decor",
    alt: "Premium beauty essentials",
    bg: "linear-gradient(135deg, #efeae7 0%, #f8f5f2 55%, #fcfbfa 100%)",
  },
];

const DEFAULT_CARDS: HeroMinimalCard[] = [
  {
    title: "Lovely Gifts",
    sub: "Thoughtful selections curated for elegant moments",
    href: "/collections/gifts",
    imageSrc: "/assets/images/product.jpg",
    tone: "rose",
    icon: "bi-heart",
  },
  {
    title: "Decor Corner",
    sub: "Refined pieces to elevate your daily atmosphere",
    href: "/collections/decor",
    imageSrc: "/assets/images/product.jpg",
    tone: "violet",
    icon: "bi-flower1",
  },
  {
    title: "Beauty Picks",
    sub: "Best-selling essentials loved by returning customers",
    href: "/collections/beauty",
    imageSrc: "/assets/images/product.jpg",
    tone: "sand",
    icon: "bi-stars",
  },
];

const DEFAULT_PILLS: HeroMinimalPill[] = [
  { label: "New Arrivals", href: "/collections/new", icon: "bi-bag-heart" },
  { label: "Gift Ideas", href: "/collections/gifts", icon: "bi-gift" },
  { label: "Decor", href: "/collections/decor", icon: "bi-house-heart" },
  { label: "Vouchers", href: "/promotions", icon: "bi-ticket-perforated" },
  { label: "Wishlist", href: "/wishlist", icon: "bi-heart" },
  { label: "Support", href: "/support", icon: "bi-chat-heart" },
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

function resolveCardTone(tone?: HeroMinimalCard["tone"]): string {
  switch (tone) {
    case "pearl":
      return cls.cardTonePearl;
    case "sand":
      return cls.cardToneSand;
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
export function HeroMinimal({
  siteId = "sitea01",
  categoryApiPath = "/api/v1/categories",
  categoryBasePath = "/category",
  activeOnly = true,
  onlyRootCategories = true,
  slides = DEFAULT_SLIDES,
  cards = DEFAULT_CARDS,
  pills = DEFAULT_PILLS,
  autoMs = 4200,
  preview = false,
}: HeroMinimalProps) {
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
          console.error("[HeroMinimal] load categories failed:", response.status, await response.text());
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
        console.error("[HeroMinimal] load categories error:", error);
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

    return () => window.clearInterval(intervalId);
  }, [paused, autoMs, totalSlides]);

  const categoryItems = useMemo(() => (categories ?? []).slice(0, 7), [categories]);
  const cardItems = useMemo(() => cards.slice(0, 3), [cards]);
  const pillItems = useMemo(() => pills.slice(0, 6), [pills]);
  const activeSlide = slides[activeSlideIndex] ?? DEFAULT_SLIDES[0];

  const handlePreviewBlockClick = (event: React.SyntheticEvent) => {
    if (!preview) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const goToSlide = (targetIndex: number) => {
    if (totalSlides <= 0) return;
    setActiveSlideIndex((targetIndex + totalSlides) % totalSlides);
  };

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
    <section className={cls.hero} aria-label="Hero minimal premium section">
      <div className={cls.frame}>
        <aside className={cls.sidebar} aria-label="Product categories">
          <div className={cls.cardGrid}>
            {cardItems.map((card, index) => (
              <React.Fragment key={`${card.href}-${index}`}>
                {renderNavTarget(
                  card.href,
                  `${cls.card} ${resolveCardTone(card.tone)}`,
                  <>
                    <div className={cls.cardBody}>
                      <div className={cls.cardHead}>
                        <span className={cls.cardIcon}>
                          <i className={`bi ${ensureBootstrapIcon(card.icon)}`} aria-hidden="true" />
                        </span>
                        <span className={cls.cardEyebrow}>Curated pick</span>
                      </div>

                      <div className={cls.cardCopy}>
                        <h3 className={cls.cardTitle}>{card.title}</h3>
                        {card.sub ? <p className={cls.cardSub}>{card.sub}</p> : null}
                      </div>

                      <div className={cls.cardFooter}>
                        <span className={cls.cardCta}>
                          Discover now
                          <i className="bi bi-arrow-right" aria-hidden="true" />
                        </span>
                      </div>
                    </div>

                    <div className={cls.cardMedia}>
                      {card.imageSrc ? (
                        <Image
                          src={card.imageSrc}
                          alt={card.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 20vw"
                          className={cls.cardImage}
                        />
                      ) : (
                        <div className={cls.cardFallback}>
                          <i className={`bi ${ensureBootstrapIcon(card.icon)}`} aria-hidden="true" />
                        </div>
                      )}
                      <div className={cls.cardMediaOverlay} />
                    </div>
                  </>,
                )}
              </React.Fragment>
            ))}
          </div>
        </aside>

        <div className={cls.mainCol}>
          <div
            className={cls.heroMain}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div className={cls.sliderViewport}>
              <div className={cls.sliderRail} style={{ transform: `translate3d(-${activeSlideIndex * 100}%, 0, 0)` }}>
                {slides.map((slide, index) => {
                  const slideNode = (
                    <article
                      key={`${slide.href}-${index}`}
                      className={cls.slide}
                      aria-hidden={index !== activeSlideIndex}
                      style={{ background: slide.bg || undefined }}
                    >
                      <div className={cls.slideMedia}>
                        <Image
                          src={slide.imageSrc}
                          alt={slide.alt || "Hero banner"}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 1024px) 100vw, 70vw"
                          className={cls.slideImage}
                        />
                      </div>
                      <div className={cls.slideOverlay} />
                    </article>
                  );

                  return preview ? (
                    <a
                      key={`${slide.href}-${index}`}
                      href="#"
                      onClick={handlePreviewBlockClick}
                      className={cls.slideLink}
                      aria-label={slide.alt || `Go to slide ${index + 1}`}
                    >
                      {slideNode}
                    </a>
                  ) : (
                    <Link
                      key={`${slide.href}-${index}`}
                      href={(slide.href || "/") as Route}
                      className={cls.slideLink}
                      aria-label={slide.alt || `Go to slide ${index + 1}`}
                    >
                      {slideNode}
                    </Link>
                  );
                })}
              </div>

              <div className={cls.heroContent}>
                <div className={cls.heroBadge}>Modern Beauty Edit</div>
                <h1 className={cls.heroTitle}>A fresher, more premium storefront experience.</h1>
                <p className={cls.heroText}>
                  Minimal, elegant, and conversion-friendly — designed to make your hero section feel like a real brand.
                </p>

                <div className={cls.heroActions}>
                  {renderNavTarget(
                    activeSlide?.href || "/collections/new",
                    cls.primaryAction,
                    <>
                      Shop now <i className="bi bi-arrow-up-right" aria-hidden="true" />
                    </>,
                  )}
                  {renderNavTarget(
                    "/collections/all",
                    cls.secondaryAction,
                    <>
                      Explore all <i className="bi bi-grid" aria-hidden="true" />
                    </>,
                  )}
                </div>

                <div className={cls.heroMeta}>
                  <div className={cls.metaItem}>
                    <span className={cls.metaValue}>03</span>
                    <span className={cls.metaLabel}>Featured stories</span>
                  </div>
                  <div className={cls.metaDivider} />
                  <div className={cls.metaItem}>
                    <span className={cls.metaValue}>24h</span>
                    <span className={cls.metaLabel}>Trend refresh</span>
                  </div>
                  <div className={cls.metaDivider} />
                  <div className={cls.metaItem}>
                    <span className={cls.metaValue}>Premium</span>
                    <span className={cls.metaLabel}>Visual language</span>
                  </div>
                </div>
              </div>

              <div className={cls.controls}>
                <button
                  type="button"
                  className={cls.arrowBtn}
                  aria-label="Previous slide"
                  onClick={() => goToSlide(activeSlideIndex - 1)}
                >
                  <i className="bi bi-arrow-left" aria-hidden="true" />
                </button>

                <div className={cls.heroDots} role="tablist" aria-label="Slide navigation">
                  {slides.map((slide, index) => (
                    <button
                      key={`${slide.href}-${index}`}
                      type="button"
                      className={`${cls.heroDot} ${index === activeSlideIndex ? cls.heroDotActive : ""}`}
                      aria-label={`Go to slide ${index + 1}`}
                      aria-selected={index === activeSlideIndex}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className={cls.arrowBtn}
                  aria-label="Next slide"
                  onClick={() => goToSlide(activeSlideIndex + 1)}
                >
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className={cls.quickPanel}>
              <div className={cls.quickPanelHead}>
                <div>
                  <div className={cls.quickLabel}>Quick access</div>
                  <div className={cls.quickTitle}>Popular links</div>
                </div>
                <span className={cls.quickChip}>Hot</span>
              </div>

              <div className={cls.pillGrid}>
                {pillItems.map((pill, index) => (
                  <React.Fragment key={`${pill.href}-${index}`}>
                    {renderNavTarget(
                      pill.href,
                      cls.pill,
                      <>
                        <span className={cls.pillIcon}>
                          <i className={`bi ${ensureBootstrapIcon(pill.icon)}`} aria-hidden="true" />
                        </span>
                        <span className={cls.pillLabel}>{pill.label}</span>
                        <i className={`bi bi-arrow-up-right ${cls.pillArrow}`} aria-hidden="true" />
                      </>,
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_HERO_MINIMAL: RegItem = {
  kind: "HeroMinimal",
  label: "Hero Minimal",
  defaults: {
    autoMs: 4200,
    siteId: "sitea01",
    categoryApiPath: "/api/v1/categories",
    categoryBasePath: "/category",
    activeOnly: true,
    onlyRootCategories: true,
    slides: JSON.stringify(DEFAULT_SLIDES, null, 2),
    cards: JSON.stringify(DEFAULT_CARDS, null, 2),
    pills: JSON.stringify(DEFAULT_PILLS, null, 2),
  },
  inspector: [
    { key: "autoMs", label: "Auto slide (ms)", kind: "number" },
    { key: "siteId", label: "Site ID (API)", kind: "text" },
    { key: "categoryApiPath", label: "Category API path", kind: "text" },
    { key: "categoryBasePath", label: "Category base path", kind: "text" },
    { key: "activeOnly", label: "Active only (true/false)", kind: "text" },
    { key: "onlyRootCategories", label: "Only root categories (true/false)", kind: "text" },
    { key: "slides", label: "Slides (JSON)", kind: "textarea", rows: 12 },
    { key: "cards", label: "Cards (JSON)", kind: "textarea", rows: 10 },
    { key: "pills", label: "Pills (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const slides = safeJsonParse<HeroMinimalSlide[]>(props.slides) ?? DEFAULT_SLIDES;
    const cards = safeJsonParse<HeroMinimalCard[]>(props.cards) ?? DEFAULT_CARDS;
    const pills = safeJsonParse<HeroMinimalPill[]>(props.pills) ?? DEFAULT_PILLS;

    const siteId = toStringValue(props.siteId, "sitea01").trim() || "sitea01";
    const categoryApiPath = toStringValue(props.categoryApiPath, "/api/v1/categories").trim() || "/api/v1/categories";
    const categoryBasePath = toStringValue(props.categoryBasePath, "/category").trim() || "/category";

    const activeOnly = toBooleanValue(props.activeOnly, true);
    const onlyRootCategories = toBooleanValue(props.onlyRootCategories, true);
    const preview = toBooleanValue(props.preview, false);
    const autoMs = toNumberValue(props.autoMs, 4200);

    return (
      <div className="sectionContainer" aria-label="Shop Hero Minimal">
        <HeroMinimal
          autoMs={autoMs}
          slides={slides}
          cards={cards}
          pills={pills}
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

export default HeroMinimal;

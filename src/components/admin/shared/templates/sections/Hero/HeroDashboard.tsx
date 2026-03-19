"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Hero/HeroDashboard.module.css";
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

export type HeroDashboardSlide = {
  imageSrc: string;
  mobileImageSrc?: string;
  href: string;
  alt?: string;
  bg?: string;
};

export type HeroDashboardStat = {
  label: string;
  value: string;
  icon?: string;
  href?: string;
};

export type HeroDashboardShortcut = {
  label: string;
  href: string;
  icon?: string;
};

export type HeroDashboardTile = {
  title: string;
  sub?: string;
  href: string;
  imageSrc?: string;
  icon?: string;
  tone?: "rose" | "peach" | "sky" | "mint" | "violet";
};

export type HeroDashboardProps = {
  siteId?: string;
  categoryApiPath?: string;
  categoryBasePath?: string;
  activeOnly?: boolean;
  onlyRootCategories?: boolean;
  slides?: HeroDashboardSlide[];
  stats?: HeroDashboardStat[];
  shortcuts?: HeroDashboardShortcut[];
  tiles?: HeroDashboardTile[];
  autoMs?: number;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_SLIDES: HeroDashboardSlide[] = [
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/romance",
    alt: "Soft romantic banner",
    bg: "linear-gradient(135deg, #ffe1ea 0%, #fff1f6 48%, #fffafc 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/living",
    alt: "Sweet lifestyle banner",
    bg: "linear-gradient(135deg, #ffe9df 0%, #fff5f0 48%, #fffaf8 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/beauty",
    alt: "Lovely beauty banner",
    bg: "linear-gradient(135deg, #f2e4ff 0%, #fbf4ff 50%, #fffafe 100%)",
  },
];

const DEFAULT_STATS: HeroDashboardStat[] = [
  { label: "New Collections", value: "128+", icon: "bi-stars", href: "/collections/new" },
  { label: "Cute Promo Codes", value: "32", icon: "bi-ticket-perforated", href: "/promotions" },
  { label: "Featured Gifts", value: "76", icon: "bi-gift", href: "/collections/gifts" },
  { label: "Most Loved Shops", value: "240", icon: "bi-heart", href: "/shops" },
];

const DEFAULT_SHORTCUTS: HeroDashboardShortcut[] = [
  { label: "New Arrivals", href: "/collections/new", icon: "bi-bag-heart" },
  { label: "Beauty", href: "/collections/beauty", icon: "bi-droplet-heart" },
  { label: "Gift Ideas", href: "/collections/gifts", icon: "bi-gift" },
  { label: "Decor", href: "/collections/decor", icon: "bi-flower1" },
  { label: "Vouchers", href: "/promotions", icon: "bi-ticket-perforated" },
  { label: "Wishlist", href: "/wishlist", icon: "bi-heart" },
  { label: "Orders", href: "/orders", icon: "bi-box-seam" },
  { label: "Support", href: "/support", icon: "bi-chat-heart" },
];

const DEFAULT_TILES: HeroDashboardTile[] = [
  {
    title: "Lovely Gifts Every Day",
    sub: "Gentle picks for someone you care about",
    href: "/collections/gifts",
    imageSrc: "/assets/images/product.jpg",
    tone: "rose",
    icon: "bi-heart",
  },
  {
    title: "Soft Home Corner",
    sub: "Decor with a bright, poetic, and cozy style",
    href: "/collections/decor",
    imageSrc: "/assets/images/product.jpg",
    tone: "mint",
    icon: "bi-house-heart",
  },
  {
    title: "Charming Beauty",
    sub: "Top-picked items customers loved this week",
    href: "/collections/beauty",
    imageSrc: "/assets/images/product.jpg",
    tone: "peach",
    icon: "bi-stars",
  },
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

function resolveToneClass(tone?: HeroDashboardTile["tone"]): string {
  switch (tone) {
    case "peach":
      return cls.tileTonePeach;
    case "sky":
      return cls.tileToneSky;
    case "mint":
      return cls.tileToneMint;
    case "violet":
      return cls.tileToneViolet;
    case "rose":
    default:
      return cls.tileToneRose;
  }
}

/* ================= Component ================= */
export function HeroDashboard({
  siteId = "sitea01",
  categoryApiPath = "/api/v1/categories",
  categoryBasePath = "/category",
  activeOnly = true,
  onlyRootCategories = true,
  slides = DEFAULT_SLIDES,
  stats = DEFAULT_STATS,
  shortcuts = DEFAULT_SHORTCUTS,
  tiles = DEFAULT_TILES,
  autoMs = 4200,
  preview = false,
}: HeroDashboardProps) {
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
          console.error("[HeroDashboard] load categories failed:", response.status, await response.text());
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
        console.error("[HeroDashboard] load categories error:", error);
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
  const categoryItems = useMemo(() => (categories ?? []).slice(0, 9), [categories]);
  const statItems = useMemo(() => stats.slice(0, 4), [stats]);
  const shortcutItems = useMemo(() => shortcuts.slice(0, 8), [shortcuts]);
  const tileItems = useMemo(() => tiles.slice(0, 3), [tiles]);

  const renderNavTarget = (href: string, className: string, content: React.ReactNode) => {
    if (preview) {
      return (
        <a href="#" onClick={handlePreviewBlockClick} className={className}>
          {content}
        </a>
      );
    }

    return (
      <Link href={(href || "/") as Route} className={className}>
        {content}
      </Link>
    );
  };

  return (
    <section className={cls.hero} aria-label="Hero Dashboard promotional section">
      <div className={cls.shell}>
        <aside className={cls.sidebar} aria-label="Product categories">
          <div className={cls.sidebarPanel}>
            <div className={cls.sidebarHead}>
              <span className={cls.sidebarTitle}>Categories</span>
              <span className={cls.sidebarHint}>soft pick</span>
            </div>

            <ul className={cls.categoryList}>
              {categoryItems.length === 0 ? (
                <li className={cls.categoryEmpty}>
                  <div className={cls.categoryEmptyIcon}>
                    <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
                  </div>
                  <div className={cls.categoryEmptyTitle}>No categories yet</div>
                  <div className={cls.categoryEmptySub}>Categories will appear when the API returns data.</div>
                </li>
              ) : (
                categoryItems.map((category) => {
                  const content = (
                    <>
                      <span className={cls.categoryLeft}>
                        <span className={cls.categoryDot} />
                        <span className={cls.categoryName}>{category.name}</span>
                      </span>
                      <span className={cls.categoryMeta}>{formatCategoryCount(category.count)}</span>
                    </>
                  );

                  return (
                    <li key={category.id} className={cls.categoryItem}>
                      {preview ? (
                        <a href="#" onClick={handlePreviewBlockClick} className={cls.categoryLink}>
                          {content}
                        </a>
                      ) : (
                        <Link
                          href={`${normalizedBasePath}/${category.slug}` as Route}
                          className={cls.categoryLink}
                          aria-label={`Browse category ${category.name}`}
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
          <div className={cls.sidePreviewCard} aria-label="Featured preview image">
            <div className={cls.sidePreviewMedia}>
              <Image
                src={currentSlide?.mobileImageSrc || currentSlide?.imageSrc || "/assets/images/product.jpg"}
                alt={currentSlide?.alt || "Featured promotional preview"}
                fill
                sizes="(max-width: 1024px) 100vw, 18vw"
                className={cls.sidePreviewImage}
              />
            </div>
          </div>
        </aside>

        <div className={cls.contentCol}>
          <div className={cls.statsRow} aria-label="Highlighted shopping stats">
            {statItems.map((item, index) => {
              const content = (
                <>
                  <span className={cls.statIcon}>
                    <i className={`bi ${ensureBootstrapIcon(item.icon)}`} aria-hidden="true" />
                  </span>
                  <div className={cls.statText}>
                    <div className={cls.statValue}>{item.value}</div>
                    <div className={cls.statLabel}>{item.label}</div>
                  </div>
                </>
              );

              const href = item.href || "/";
              return (
                <React.Fragment key={`${href}-${index}`}>{renderNavTarget(href, cls.statCard, content)}</React.Fragment>
              );
            })}
          </div>

          <div className={cls.mainGrid}>
            <div className={cls.centerCol}>
              <div
                className={cls.heroMain}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocusCapture={() => setPaused(true)}
                onBlurCapture={() => setPaused(false)}
              >
                <div className={cls.sliderViewport}>
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
                          style={{ background: slide.bg || undefined }}
                        >
                          <div className={cls.slideOverlay} />
                          <div className={cls.slideMedia}>
                            <Image
                              src={slide.imageSrc}
                              alt={slide.alt || "Hero dashboard banner"}
                              fill
                              sizes="(max-width: 1024px) 100vw, 52vw"
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
                          aria-label={slide.alt || `Go to slide ${index + 1}`}
                        >
                          {slideContent}
                        </a>
                      ) : (
                        <Link
                          key={`${slide.href}-${index}`}
                          href={(slide.href || "/") as Route}
                          className={cls.slideLink}
                          aria-label={slide.alt || `Go to slide ${index + 1}`}
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
                  aria-label="Previous slide"
                  onClick={goToPreviousSlide}
                >
                  <i className="bi bi-chevron-left" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className={`${cls.arrowBtn} ${cls.arrowNext}`}
                  aria-label="Next slide"
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
                      aria-label={`Go to slide ${index + 1}`}
                      aria-selected={index === activeSlideIndex}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              </div>

              <div className={cls.tileGrid}>
                {tileItems.map((tile, index) => {
                  const content = (
                    <>
                      <div className={cls.tileCopy}>
                        <span className={cls.tileIcon}>
                          <i className={`bi ${ensureBootstrapIcon(tile.icon)}`} aria-hidden="true" />
                        </span>
                        <div className={cls.tileTitle}>{tile.title}</div>
                        {tile.sub ? <div className={cls.tileSub}>{tile.sub}</div> : null}
                      </div>

                      <div className={cls.tileMedia}>
                        {tile.imageSrc ? (
                          <Image
                            src={tile.imageSrc}
                            alt={tile.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 15vw"
                            className={cls.tileImage}
                          />
                        ) : (
                          <div className={cls.tileFallback}>
                            <i className={`bi ${ensureBootstrapIcon(tile.icon)}`} aria-hidden="true" />
                          </div>
                        )}
                      </div>
                    </>
                  );

                  return (
                    <React.Fragment key={`${tile.href}-${index}`}>
                      {renderNavTarget(tile.href, `${cls.tileCard} ${resolveToneClass(tile.tone)}`, content)}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <aside className={cls.sidePanel} aria-label="Quick dashboard actions">
              <div className={cls.sidePanelMain}>
                <div className={cls.sidePanelHead}>
                  <div className={cls.sidePanelBadge}>sweet flow</div>
                  <div className={cls.sidePanelTitle}>A gentle navigation board</div>
                </div>

                <div className={cls.shortcutGrid}>
                  {shortcutItems.map((item, index) => {
                    const content = (
                      <>
                        <span className={cls.shortcutIcon}>
                          <i className={`bi ${ensureBootstrapIcon(item.icon)}`} aria-hidden="true" />
                        </span>
                        <span className={cls.shortcutLabel}>{item.label}</span>
                      </>
                    );

                    return (
                      <React.Fragment key={`${item.href}-${index}`}>
                        {renderNavTarget(item.href, cls.shortcutCard, content)}
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
export const SHOP_HERO_DASHBOARD: RegItem = {
  kind: "HeroDashboard",
  label: "Hero Dashboard",
  defaults: {
    autoMs: 4200,
    siteId: "sitea01",
    categoryApiPath: "/api/v1/categories",
    categoryBasePath: "/category",
    activeOnly: true,
    onlyRootCategories: true,
    slides: JSON.stringify(DEFAULT_SLIDES, null, 2),
    stats: JSON.stringify(DEFAULT_STATS, null, 2),
    shortcuts: JSON.stringify(DEFAULT_SHORTCUTS, null, 2),
    tiles: JSON.stringify(DEFAULT_TILES, null, 2),
  },
  inspector: [
    { key: "autoMs", label: "Auto slide (ms)", kind: "number" },
    { key: "siteId", label: "Site ID (API)", kind: "text" },
    { key: "categoryApiPath", label: "Category API path", kind: "text" },
    { key: "categoryBasePath", label: "Category base path", kind: "text" },
    { key: "activeOnly", label: "Active only (true/false)", kind: "text" },
    { key: "onlyRootCategories", label: "Only root categories (true/false)", kind: "text" },
    { key: "slides", label: "Slides (JSON)", kind: "textarea", rows: 12 },
    { key: "stats", label: "Stats (JSON)", kind: "textarea", rows: 10 },
    { key: "shortcuts", label: "Shortcuts (JSON)", kind: "textarea", rows: 10 },
    { key: "tiles", label: "Tiles (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const slides = safeJsonParse<HeroDashboardSlide[]>(props.slides) ?? DEFAULT_SLIDES;
    const stats = safeJsonParse<HeroDashboardStat[]>(props.stats) ?? DEFAULT_STATS;
    const shortcuts = safeJsonParse<HeroDashboardShortcut[]>(props.shortcuts) ?? DEFAULT_SHORTCUTS;
    const tiles = safeJsonParse<HeroDashboardTile[]>(props.tiles) ?? DEFAULT_TILES;

    const siteId = toStringValue(props.siteId, "sitea01").trim() || "sitea01";
    const categoryApiPath = toStringValue(props.categoryApiPath, "/api/v1/categories").trim() || "/api/v1/categories";
    const categoryBasePath = toStringValue(props.categoryBasePath, "/category").trim() || "/category";

    const activeOnly = toBooleanValue(props.activeOnly, true);
    const onlyRootCategories = toBooleanValue(props.onlyRootCategories, true);
    const preview = toBooleanValue(props.preview, false);
    const autoMs = toNumberValue(props.autoMs, 4200);

    return (
      <div className="sectionContainer" aria-label="Shop Hero Dashboard">
        <HeroDashboard
          autoMs={autoMs}
          slides={slides}
          stats={stats}
          shortcuts={shortcuts}
          tiles={tiles}
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

export default HeroDashboard;

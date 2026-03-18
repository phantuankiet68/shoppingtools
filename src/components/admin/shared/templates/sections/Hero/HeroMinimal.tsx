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
    alt: "Minimal romantic banner",
    bg: "linear-gradient(135deg, #fff0f5 0%, #fff7fa 50%, #ffffff 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/gifts",
    alt: "Minimal gift banner",
    bg: "linear-gradient(135deg, #fff3ee 0%, #fff8f5 50%, #ffffff 100%)",
  },
  {
    imageSrc: "/assets/images/product.jpg",
    mobileImageSrc: "/assets/images/product.jpg",
    href: "/collections/decor",
    alt: "Minimal decor banner",
    bg: "linear-gradient(135deg, #f7f1ff 0%, #fcf8ff 50%, #ffffff 100%)",
  },
];

const DEFAULT_CARDS: HeroMinimalCard[] = [
  {
    title: "Quà xinh",
    sub: "Chọn nhanh những món dịu dàng",
    href: "/collections/gifts",
    imageSrc: "/assets/images/product.jpg",
    tone: "rose",
    icon: "bi-heart",
  },
  {
    title: "Góc decor",
    sub: "Nhẹ nhàng và tinh tế mỗi ngày",
    href: "/collections/decor",
    imageSrc: "/assets/images/product.jpg",
    tone: "violet",
    icon: "bi-flower1",
  },
  {
    title: "Beauty pick",
    sub: "Các sản phẩm được yêu thích",
    href: "/collections/beauty",
    imageSrc: "/assets/images/product.jpg",
    tone: "sand",
    icon: "bi-stars",
  },
];

const DEFAULT_PILLS: HeroMinimalPill[] = [
  { label: "Mới về", href: "/collections/new", icon: "bi-bag-heart" },
  { label: "Quà tặng", href: "/collections/gifts", icon: "bi-gift" },
  { label: "Decor", href: "/collections/decor", icon: "bi-house-heart" },
  { label: "Voucher", href: "/promotions", icon: "bi-ticket-perforated" },
  { label: "Yêu thích", href: "/wishlist", icon: "bi-heart" },
  { label: "Hỗ trợ", href: "/support", icon: "bi-chat-heart" },
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

function resolveToneClass(tone?: HeroMinimalCard["tone"]): string {
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

    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((current) => (current + 1) % totalSlides);
    }, Math.max(2500, autoMs));

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

  const categoryItems = useMemo(() => (categories ?? []).slice(0, 8), [categories]);
  const cardItems = useMemo(() => cards.slice(0, 3), [cards]);
  const pillItems = useMemo(() => pills.slice(0, 6), [pills]);

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
    <section className={cls.hero} aria-label="Hero Minimal">
      <div className={cls.shell}>
        <aside className={cls.sidebar} aria-label="Danh mục sản phẩm">
          <div className={cls.sidebarPanel}>
            <div className={cls.sidebarHead}>
              <span className={cls.sidebarTitle}>Danh mục</span>
            </div>

            <ul className={cls.categoryList}>
              {categoryItems.length === 0 ? (
                <li className={cls.categoryEmpty}>
                  <div className={cls.categoryEmptyIcon}>
                    <i className="bi bi-grid-3x3-gap" />
                  </div>
                  <div className={cls.categoryEmptyTitle}>Chưa có danh mục</div>
                  <div className={cls.categoryEmptySub}>Danh mục sẽ hiển thị khi API trả dữ liệu.</div>
                </li>
              ) : (
                categoryItems.map((category) => {
                  const content = (
                    <>
                      <span className={cls.categoryName}>{category.name}</span>
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
                        <Link href={`${normalizedBasePath}/${category.slug}` as Route} className={cls.categoryLink}>
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
                      <div className={cls.slideGlow} />
                      <div className={cls.slideMedia}>
                        <Image
                          src={slide.imageSrc}
                          alt={slide.alt || "Hero minimal banner"}
                          fill
                          sizes="(max-width: 1024px) 100vw, 64vw"
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
                    >
                      {slideContent}
                    </a>
                  ) : (
                    <Link key={`${slide.href}-${index}`} href={(slide.href || "/") as Route} className={cls.slideLink}>
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
              <i className="bi bi-chevron-left" />
            </button>

            <button
              type="button"
              className={`${cls.arrowBtn} ${cls.arrowNext}`}
              aria-label="Next slide"
              onClick={goToNextSlide}
            >
              <i className="bi bi-chevron-right" />
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

          <div className={cls.bottomRow}>
            <div className={cls.cardGrid}>
              {cardItems.map((card, index) => {
                const content = (
                  <>
                    <div className={cls.cardCopy}>
                      <span className={cls.cardIcon}>
                        <i className={`bi ${ensureBootstrapIcon(card.icon)}`} />
                      </span>
                      <div className={cls.cardTitle}>{card.title}</div>
                      {card.sub ? <div className={cls.cardSub}>{card.sub}</div> : null}
                    </div>

                    <div className={cls.cardMedia}>
                      {card.imageSrc ? (
                        <Image
                          src={card.imageSrc}
                          alt=""
                          fill
                          sizes="(max-width: 1024px) 100vw, 14vw"
                          className={cls.cardImage}
                        />
                      ) : (
                        <div className={cls.cardFallback}>
                          <i className={`bi ${ensureBootstrapIcon(card.icon)}`} />
                        </div>
                      )}
                    </div>
                  </>
                );

                return (
                  <React.Fragment key={`${card.href}-${index}`}>
                    {renderNavTarget(card.href, `${cls.card} ${resolveToneClass(card.tone)}`, content)}
                  </React.Fragment>
                );
              })}
            </div>

            <div className={cls.pillPanel}>
              <div className={cls.pillPanelTitle}>Lối tắt</div>
              <div className={cls.pillGrid}>
                {pillItems.map((pill, index) => {
                  const content = (
                    <>
                      <span className={cls.pillIcon}>
                        <i className={`bi ${ensureBootstrapIcon(pill.icon)}`} />
                      </span>
                      <span className={cls.pillLabel}>{pill.label}</span>
                    </>
                  );

                  return (
                    <React.Fragment key={`${pill.href}-${index}`}>
                      {renderNavTarget(pill.href, cls.pill, content)}
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
    const slides = safeJsonParse<HeroMinimalSlide[]>(props.slides);
    const cards = safeJsonParse<HeroMinimalCard[]>(props.cards);
    const pills = safeJsonParse<HeroMinimalPill[]>(props.pills);

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

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Hero/HeroAnnouncement.module.css";
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

export type HeroSlide = {
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  bg?: string;
  chips?: string[];
  imageSrc?: string;
};

export type HeroPromo = {
  icon: string;
  title: string;
  sub: string;
  off: string;
  href: string;
};

export type HeroSideBanner = {
  variant: "top" | "bot";
  badge: string;
  title: string;
  sub: string;
  imageSrc?: string;
  icon?: string;
};

export type HeroAnnouncementProps = {
  siteId?: string;
  categoryApiPath?: string;
  categoryBasePath?: string;
  activeOnly?: boolean;
  onlyRootCategories?: boolean;

  slides?: HeroSlide[];
  promos?: HeroPromo[];
  rightBanners?: HeroSideBanner[];

  autoMs?: number;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    headline: "Glow Up Today\nSkincare At Home",
    sub: "Authentic products • Fast delivery • Personalized support for your daily beauty routine",
    ctaLabel: "Shop Now",
    ctaHref: "/shop",
    chips: ["Cleanser", "Serum", "Moisturizer"],
    imageSrc: "/assets/images/product.jpg",
    bg: "linear-gradient(135deg, rgb(102 208 255) 0%, rgb(85 198 149) 18%, rgb(14, 165, 164) 58%, rgb(125, 211, 252) 100%)",
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
    bg: "linear-gradient(135deg, rgb(255 175 102) 0%, rgb(30 55 59) 18%, rgb(115 230 230) 58%, rgb(40 178 244) 100%)",
  },
];

const DEFAULT_PROMOS: HeroPromo[] = [
  { icon: "bi-droplet", title: "Skincare", sub: "Save up to 30%", off: "-30%", href: "/skincare" },
  { icon: "bi-bag-heart", title: "Makeup", sub: "Buy 2 get 1", off: "Hot", href: "/makeup" },
  { icon: "bi-brightness-high", title: "Sunscreen", sub: "Up to 40% off", off: "-40%", href: "/sunscreen" },
];

const DEFAULT_RIGHT_BANNERS: HeroSideBanner[] = [
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

function ensureBootstrapIcon(icon?: string | null): string {
  if (!icon) return "bi-grid";
  return icon.startsWith("bi-") ? icon : `bi-${icon}`;
}

function getCategorySortValue(category: CategoryApiItem): number {
  if (typeof category.sortOrder === "number") return category.sortOrder;
  if (typeof category.sort === "number") return category.sort;
  return 0;
}

function splitHeadlineLines(headline: string): string[] {
  return headline.split("\n").filter(Boolean);
}

function formatCategoryCount(count: number): string {
  if (!Number.isFinite(count)) return "0";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

/* ================= Component ================= */
export function HeroAnnouncement({
  siteId = "sitea01",
  categoryApiPath = "/api/v1/categories",
  categoryBasePath = "/category",
  activeOnly = true,
  onlyRootCategories = true,
  slides = DEFAULT_SLIDES,
  promos = DEFAULT_PROMOS,
  rightBanners = DEFAULT_RIGHT_BANNERS,
  autoMs = 4500,
  preview = false,
}: HeroAnnouncementProps) {
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
          console.error("[HeroAnnouncement] load categories failed:", response.status, await response.text());
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

        console.error("[HeroAnnouncement] load categories error:", error);
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
      if (activeSlideIndex !== 0) {
        setActiveSlideIndex(0);
      }
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
      Math.max(1800, autoMs),
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [paused, autoMs, totalSlides]);

  const goToSlide = (targetIndex: number) => {
    if (totalSlides <= 0) return;
    setActiveSlideIndex((targetIndex + totalSlides) % totalSlides);
  };

  const goToPreviousSlide = () => goToSlide(activeSlideIndex - 1);
  const goToNextSlide = () => goToSlide(activeSlideIndex + 1);

  const handlePreviewBlockClick = (event: React.SyntheticEvent) => {
    if (!preview) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const currentHeadlineLines = splitHeadlineLines(slides[activeSlideIndex]?.headline ?? slides[0]?.headline ?? "");

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
            {(categories ?? []).length === 0 ? (
              <li className={cls.catEmpty}>
                <div className={cls.catEmptyIcon}>
                  <i className="bi bi-inboxes" />
                </div>
                <div className={cls.catEmptyTitle}>No categories</div>
                <div className={cls.catEmptySub}>Danh mục sẽ hiển thị khi API có dữ liệu.</div>
              </li>
            ) : (
              (categories ?? []).map((category, index) => {
                const content = (
                  <>
                    <span className={cls.catItemLeft}>
                      <span className={cls.catItemIcon}>
                        <i className={`bi ${ensureBootstrapIcon(category.icon)}`} />
                      </span>
                      <span className={cls.catItemText}>
                        <span className={cls.catItemName}>{category.name}</span>
                        <span className={cls.catItemMeta}>Featured collection</span>
                      </span>
                    </span>

                    <span className={cls.catItemRight}>
                      <span className={cls.catCount}>{formatCategoryCount(category.count)}</span>
                      <i className={`bi bi-arrow-up-right ${cls.catArrow}`} />
                    </span>
                  </>
                );

                return preview ? (
                  <li key={category.id} className={cls.catItem}>
                    <a
                      href="#"
                      onClick={handlePreviewBlockClick}
                      className={`${cls.catLink} ${index === 0 ? cls.catLinkActive : ""}`}
                    >
                      {content}
                    </a>
                  </li>
                ) : (
                  <li key={category.id} className={cls.catItem}>
                    <Link
                      href={`${normalizedBasePath}/${category.slug}` as Route}
                      className={`${cls.catLink} ${index === 0 ? cls.catLinkActive : ""}`}
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
            <div className={cls.sliderRail} style={{ transform: `translate3d(-${activeSlideIndex * 100}%, 0, 0)` }}>
              {slides.map((slide, index) => {
                const headlineLines = splitHeadlineLines(slide.headline);

                return (
                  <article
                    key={`${index}-${slide.ctaHref}-${slide.headline}`}
                    className={cls.slide}
                    style={{ background: slide.bg }}
                    aria-hidden={index !== activeSlideIndex}
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
                          {headlineLines.map((line, lineIndex) => (
                            <React.Fragment key={lineIndex}>
                              <span className={cls.headlineLine}>{line}</span>
                              {lineIndex < headlineLines.length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>

                        {!!slide.chips?.length && (
                          <div className={cls.heroChips}>
                            {slide.chips.map((chip) => (
                              <span key={chip} className={cls.heroChip}>
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className={cls.ctaRow}>
                          {preview ? (
                            <button className={cls.cta} type="button" onClick={handlePreviewBlockClick}>
                              <span>{slide.ctaLabel}</span>
                              <i className="bi bi-arrow-right" />
                            </button>
                          ) : (
                            <Link
                              className={cls.cta}
                              href={(slide.ctaHref || "/") as Route}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <span>{slide.ctaLabel}</span>
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
                            {slide.imageSrc ? (
                              <div className={cls.visualImageWrap}>
                                <Image
                                  src={slide.imageSrc}
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

          <button
            className={`${cls.arrow} ${cls.prev}`}
            aria-label="Previous slide"
            type="button"
            onClick={goToPreviousSlide}
          >
            <i className="bi bi-chevron-left" />
          </button>

          <button className={`${cls.arrow} ${cls.next}`} aria-label="Next slide" type="button" onClick={goToNextSlide}>
            <i className="bi bi-chevron-right" />
          </button>

          <div className={cls.bottomBar}>
            <div className={cls.progressInfo}>
              <span className={cls.progressCurrent}>{String(activeSlideIndex + 1).padStart(2, "0")}</span>
              <span className={cls.progressDivider}>/</span>
              <span className={cls.progressTotal}>{String(totalSlides).padStart(2, "0")}</span>
            </div>

            <div className={cls.dots} aria-label="Slider dots">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${cls.dot} ${index === activeSlideIndex ? cls.dotActive : ""}`}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => goToSlide(index)}
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
          {promos.map((promo) => {
            const promoContent = (
              <>
                <div className={cls.promoLeft}>
                  <div className={cls.pIc}>
                    <i className={`bi ${ensureBootstrapIcon(promo.icon)}`} />
                  </div>
                  <div className={cls.pText}>
                    <div className={cls.pTitle}>{promo.title}</div>
                    <div className={cls.pSub}>{promo.sub}</div>
                  </div>
                </div>

                <div className={cls.promoRight}>
                  <span className={cls.pOff}>{promo.off}</span>
                  <i className={`bi bi-arrow-up-right ${cls.pArrow}`} />
                </div>
              </>
            );

            return preview ? (
              <a key={promo.href || promo.title} className={cls.promo} href="#" onClick={handlePreviewBlockClick}>
                {promoContent}
              </a>
            ) : (
              <Link key={promo.href || promo.title} className={cls.promo} href={(promo.href || "/") as Route}>
                {promoContent}
              </Link>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <aside className={cls.right} aria-label="Right banners">
        {rightBanners.map((banner, index) => {
          const variantClass = index === 0 ? cls.rbTop : index === 1 ? cls.rbMid : cls.rbShip;

          return (
            <article key={`${banner.badge}-${index}-${banner.title}`} className={`${cls.rb} ${variantClass}`}>
              <div className={cls.rbGlow} />
              <div className={cls.rbHead}>
                <span className={cls.rbBadge}>{banner.badge}</span>
              </div>

              <div className={cls.rbTitle}>{banner.title}</div>

              <div className={cls.rbBody}>
                <div className={cls.rbText}>
                  <div className={cls.rbSub}>{banner.sub}</div>
                </div>

                <div className={cls.mockImg} aria-hidden="true">
                  {banner.imageSrc ? (
                    <Image
                      src={banner.imageSrc}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className={cls.rbImage}
                    />
                  ) : (
                    <div className={cls.rbIconWrap}>
                      <i className={`bi ${ensureBootstrapIcon(banner.icon)} ${cls.rbIcon}`} />
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

      <div className={cls.srOnly} aria-hidden="true">
        {currentHeadlineLines.join(" ")}
      </div>
    </section>
  );
}

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_HERO_ANNOUNCEMENT: RegItem = {
  kind: "HeroAnnouncement",
  label: "Hero Announcement",
  defaults: {
    autoMs: 4500,
    siteId: "sitea01",
    categoryApiPath: "/api/v1/categories",
    categoryBasePath: "/category",
    activeOnly: true,
    onlyRootCategories: true,
    slides: JSON.stringify(DEFAULT_SLIDES, null, 2),
    promos: JSON.stringify(DEFAULT_PROMOS, null, 2),
    rightBanners: JSON.stringify(DEFAULT_RIGHT_BANNERS, null, 2),
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
  render: (props) => {
    const slides = safeJsonParse<HeroSlide[]>(props.slides);
    const promos = safeJsonParse<HeroPromo[]>(props.promos);
    const rightBanners = safeJsonParse<HeroSideBanner[]>(props.rightBanners);

    const siteId = toStringValue(props.siteId, "sitea01").trim() || "sitea01";
    const categoryApiPath = toStringValue(props.categoryApiPath, "/api/v1/categories").trim() || "/api/v1/categories";
    const categoryBasePath = toStringValue(props.categoryBasePath, "/category").trim() || "/category";

    const activeOnly = toBooleanValue(props.activeOnly, true);
    const onlyRootCategories = toBooleanValue(props.onlyRootCategories, true);
    const preview = toBooleanValue(props.preview, false);
    const autoMs = toNumberValue(props.autoMs, 4500);

    return (
      <div className="sectionContainer" aria-label="Shop Hero Announcement">
        <HeroAnnouncement
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

export default HeroAnnouncement;

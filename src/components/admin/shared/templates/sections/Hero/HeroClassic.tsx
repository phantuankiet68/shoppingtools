"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Hero/HeroClassic.module.css";
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

export type HeroClassicSlide = {
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  bg?: string;
  chips?: string[];
  imageSrc?: string;
  imageSrcList?: string[];
};

export type HeroClassicPromo = {
  icon: string;
  title: string;
  sub: string;
  off: string;
  href: string;
  imageSrc?: string;
};

export type HeroClassicBanner = {
  variant: "top" | "bot";
  badge: string;
  title: string;
  sub: string;
  imageSrc?: string;
  icon?: string;
};

export type HeroClassicProps = {
  siteId?: string;
  categoryApiPath?: string;
  categoryBasePath?: string;
  activeOnly?: boolean;
  onlyRootCategories?: boolean;
  slides?: HeroClassicSlide[];
  promos?: HeroClassicPromo[];
  rightBanners?: HeroClassicBanner[];
  autoMs?: number;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_SLIDES: HeroClassicSlide[] = [
  {
    headline: "Furniture Mega Sale\nDiscounted Shipping",
    sub: "New marketplace-style hero layout: the center block features one large image, with two smaller banners below, matching the sample layout.",
    ctaLabel: "Shop Now",
    ctaHref: "/promotions",
    chips: ["New Deals", "Fast Delivery", "Best Price"],
    imageSrc: "/assets/images/product.jpg",
    imageSrcList: ["/assets/images/product.jpg", "/assets/images/product.jpg", "/assets/images/product.jpg"],
    bg: "linear-gradient(135deg, #7cc7ff 0%, #8dd7ff 28%, #c6ecff 62%, #f3fbff 100%)",
  },
  {
    headline: "Mega Sale\nDeals Every Day",
    sub: "A highlighted main image, with two smaller cards below to promote side campaigns or trending product categories.",
    ctaLabel: "View Deals",
    ctaHref: "/deals",
    chips: ["Flash Sale", "Best Seller", "Voucher"],
    imageSrc: "/assets/images/product.jpg",
    imageSrcList: ["/assets/images/product.jpg", "/assets/images/product.jpg", "/assets/images/product.jpg"],
    bg: "linear-gradient(135deg, #8cc8ff 0%, #72b8ff 38%, #a8dbff 68%, #f5fbff 100%)",
  },
  {
    headline: "Shopping\nMarketplace Style",
    sub: "A conversion-focused layout with a category sidebar, one large center visual, and a support information cluster in the right column.",
    ctaLabel: "Explore",
    ctaHref: "/shop",
    chips: ["Hot Trend", "Trusted Shop", "Fast Checkout"],
    imageSrc: "/assets/images/product.jpg",
    imageSrcList: ["/assets/images/product.jpg", "/assets/images/product.jpg", "/assets/images/product.jpg"],
    bg: "linear-gradient(135deg, #89c4ff 0%, #7fd0ff 35%, #bee8ff 72%, #f7fcff 100%)",
  },
];

const DEFAULT_PROMOS: HeroClassicPromo[] = [
  {
    icon: "bi-book",
    title: "Great Books at Great Prices",
    sub: "Featured offers on bestselling books and gifts.",
    off: "Book Deals",
    href: "/deals/books",
    imageSrc: "/assets/images/product.jpg",
  },
  {
    icon: "bi-house-door",
    title: "Home Essentials Online",
    sub: "A collection of home appliances, furniture, and daily living essentials.",
    off: "Trending Home",
    href: "/deals/home",
    imageSrc: "/assets/images/product.jpg",
  },
  {
    icon: "bi-phone",
    title: "Daily Tech Picks",
    sub: "Electronics and accessories that shoppers are loving right now.",
    off: "Tech Picks",
    href: "/deals/tech",
    imageSrc: "/assets/images/product.jpg",
  },
];

const DEFAULT_RIGHT_BANNERS: HeroClassicBanner[] = [
  {
    variant: "top",
    badge: "WELCOME",
    title: "Hi - welcome",
    sub: "Sign in to track your orders and save your favorite products.",
    icon: "bi-person-circle",
  },
  {
    variant: "bot",
    badge: "PAYMENT",
    title: "International Payments",
    sub: "Multiple flexible and secure payment methods available.",
    icon: "bi-credit-card",
  },
  {
    variant: "bot",
    badge: "SUPPORT",
    title: "Complete Service",
    sub: "Fast support before and after purchase.",
    icon: "bi-headset",
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

function getInitials(input: string): string {
  return input
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getSlideImages(slide: HeroClassicSlide): string[] {
  if (Array.isArray(slide.imageSrcList) && slide.imageSrcList.length > 0) {
    return slide.imageSrcList
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, 3);
  }

  if (typeof slide.imageSrc === "string" && slide.imageSrc.trim()) {
    return [slide.imageSrc];
  }

  return [];
}

/* ================= Component ================= */
export function HeroClassic({
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
}: HeroClassicProps) {
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
          console.error("[HeroClassic] load categories failed:", response.status, await response.text());
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
        console.error("[HeroClassic] load categories error:", error);
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

  const currentSlide = slides[activeSlideIndex] ?? slides[0];
  const currentHeadlineLines = splitHeadlineLines(currentSlide?.headline ?? "");
  const currentSlideImages = getSlideImages(currentSlide ?? DEFAULT_SLIDES[0]);
  const heroMainImage = currentSlideImages[0] || currentSlide?.imageSrc || "/assets/images/product.jpg";
  const heroBottomCards = currentSlideImages.slice(1, 3);

  const visibleTopBanner = rightBanners.find((item) => item.variant === "top");
  const visibleBotBanners = rightBanners.filter((item) => item.variant === "bot").slice(0, 2);

  const intlPaymentItems = useMemo(() => ["VISA", "Mastercard", "PayPal", "JCB", "AE"], []);

  const featureItems = useMemo(
    () => [
      { icon: "bi-chat-dots", label: "Messages" },
      { icon: "bi-box-seam", label: "Orders" },
      { icon: "bi-heart", label: "Favorites" },
    ],
    [],
  );

  const supportItems = useMemo(
    () => [
      { icon: "bi-patch-check", label: "Authentic Guarantee" },
      { icon: "bi-truck", label: "Fast Delivery" },
      { icon: "bi-arrow-repeat", label: "Easy Returns" },
    ],
    [],
  );

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
    <section className={cls.hero} aria-label="Marketplace hero">
      <div className={cls.shell}>
        <aside className={cls.sidebar} aria-label="Product categories">
          <div className={cls.sidebarPanel}>
            <ul className={cls.categoryList}>
              {(categories ?? []).length === 0 ? (
                <li className={cls.categoryEmpty}>
                  <div className={cls.categoryEmptyIcon}>
                    <i className="bi bi-grid-3x3-gap" />
                  </div>
                  <div className={cls.categoryEmptyTitle}>No categories yet</div>
                  <div className={cls.categoryEmptySub}>Categories will appear when the API returns data.</div>
                </li>
              ) : (
                (categories ?? []).slice(0, 12).map((category) => {
                  const content = (
                    <>
                      <span className={cls.categoryLead}>
                        <span className={cls.categoryMeta}>
                          <span className={cls.categoryName}>{category.name}</span>
                        </span>
                      </span>
                      <span className={cls.categoryArrow}>
                        <i className="bi bi-chevron-right" />
                      </span>
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

        <div className={cls.centerCol}>
          <div
            className={cls.mainGrid}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div className={cls.heroArea}>
              <div className={cls.heroStack}>
                <div className={cls.heroMain} style={{ background: currentSlide?.bg || undefined }}>
                  <div className={cls.heroSlideOverlay} />

                  <div className={cls.heroContent}>
                    <div className={cls.heroCopy}>
                      <div className={cls.heroBadgeRow}>
                        <span className={cls.heroBadge}>Global Offers</span>
                      </div>

                      <h2 className={cls.heroHeadline}>
                        {currentHeadlineLines.map((line, lineIndex) => (
                          <React.Fragment key={lineIndex}>
                            <span>{line}</span>
                            {lineIndex < currentHeadlineLines.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </h2>

                      <div className={cls.heroBigSub}>Delivery may arrive within 3-7 days</div>
                      <p className={cls.heroSub}>{currentSlide?.sub}</p>

                      {!!currentSlide?.chips?.length && (
                        <div className={cls.heroChips}>
                          {currentSlide.chips.map((chip) => (
                            <span key={chip} className={cls.heroChip}>
                              {chip}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={cls.heroActions}>
                        {preview ? (
                          <button type="button" className={cls.primaryBtn} onClick={handlePreviewBlockClick}>
                            {currentSlide?.ctaLabel}
                          </button>
                        ) : (
                          <Link href={(currentSlide?.ctaHref || "/") as Route} className={cls.primaryBtn}>
                            {currentSlide?.ctaLabel}
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className={cls.heroVisual} aria-hidden="true">
                      <div className={cls.heroVisualMainCard}>
                        <div className={cls.heroVisualMainMedia}>
                          <Image
                            src={heroMainImage}
                            alt=""
                            fill
                            sizes="(max-width: 1024px) 100vw, 32vw"
                            className={cls.heroImage}
                            priority
                          />
                        </div>
                      </div>
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
                        key={`${slide.ctaHref}-${index}`}
                        type="button"
                        className={`${cls.heroDot} ${index === activeSlideIndex ? cls.heroDotActive : ""}`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-selected={index === activeSlideIndex}
                        onClick={() => goToSlide(index)}
                      />
                    ))}
                  </div>
                </div>

                <div className={cls.dealsSection}>
                  <div className={cls.dealsGrid}>
                    {[0, 1].map((index) => {
                      const slideImage =
                        heroBottomCards[index] || promos[index]?.imageSrc || "/assets/images/product.jpg";
                      const promo = promos[index] ?? promos[0];

                      const content = (
                        <>
                          <div className={cls.dealCardInner}>
                            <div className={cls.dealBody}>
                              <div className={cls.dealBadge}>{promo?.off}</div>
                              <div className={cls.dealTitle}>{promo?.title}</div>
                              <div className={cls.dealSub}>{promo?.sub}</div>
                            </div>

                            <div className={cls.dealThumbWrap}>
                              <Image
                                src={slideImage}
                                alt=""
                                fill
                                sizes="(max-width: 1024px) 100vw, 18vw"
                                className={cls.dealImage}
                              />
                            </div>
                          </div>
                        </>
                      );

                      return renderNavTarget(promo?.href || "/", cls.dealCard, content);
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className={cls.sidePromo}>
              {visibleTopBanner && (
                <div className={cls.accountCard}>
                  <div className={cls.accountTop}>
                    <div className={cls.accountAvatar}>
                      <i className={`bi ${ensureBootstrapIcon(visibleTopBanner.icon)}`} />
                    </div>
                    <div className={cls.accountText}>
                      <div className={cls.accountHello}>{visibleTopBanner.title}</div>
                      <div className={cls.accountSub}>{visibleTopBanner.sub}</div>
                    </div>
                  </div>

                  <div className={cls.accountActions}>
                    {preview ? (
                      <button type="button" className={cls.joinBtn} onClick={handlePreviewBlockClick}>
                        Sign Up
                      </button>
                    ) : (
                      <Link href={"/register" as Route} className={cls.joinBtn}>
                        Sign Up
                      </Link>
                    )}

                    {preview ? (
                      <button type="button" className={cls.signInBtn} onClick={handlePreviewBlockClick}>
                        Sign In
                      </button>
                    ) : (
                      <Link href={"/login" as Route} className={cls.signInBtn}>
                        Sign In
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className={cls.serviceCard}>
                <div className={cls.serviceCardHead}>
                  <div className={cls.serviceCardTitle}>Global Highlights</div>
                </div>

                <div className={cls.serviceList}>
                  {supportItems.map((item) => (
                    <div key={item.label} className={cls.serviceRow}>
                      <span className={cls.serviceItemIcon}>
                        <i className={`bi ${item.icon}`} />
                      </span>
                      <span className={cls.serviceItemLabel}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={cls.paymentCard}>
                <div className={cls.paymentTitle}>{visibleBotBanners[0]?.title || "International Payments"}</div>
                <div className={cls.paymentSub}>{visibleBotBanners[0]?.sub}</div>
                <div className={cls.paymentLogos}>
                  {intlPaymentItems.map((item) => (
                    <span key={item} className={cls.paymentLogo}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={cls.srOnly} aria-hidden="true">
          {currentHeadlineLines.join(" ")}
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_HERO_CLASSIC: RegItem = {
  kind: "HeroClassic",
  label: "Hero Classic",
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
    const slides = safeJsonParse<HeroClassicSlide[]>(props.slides);
    const promos = safeJsonParse<HeroClassicPromo[]>(props.promos);
    const rightBanners = safeJsonParse<HeroClassicBanner[]>(props.rightBanners);

    const siteId = toStringValue(props.siteId, "sitea01").trim() || "sitea01";
    const categoryApiPath = toStringValue(props.categoryApiPath, "/api/v1/categories").trim() || "/api/v1/categories";
    const categoryBasePath = toStringValue(props.categoryBasePath, "/category").trim() || "/category";

    const activeOnly = toBooleanValue(props.activeOnly, true);
    const onlyRootCategories = toBooleanValue(props.onlyRootCategories, true);
    const preview = toBooleanValue(props.preview, false);
    const autoMs = toNumberValue(props.autoMs, 4500);

    return (
      <div className="sectionContainer" aria-label="Shop Hero Classic">
        <HeroClassic
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

export default HeroClassic;
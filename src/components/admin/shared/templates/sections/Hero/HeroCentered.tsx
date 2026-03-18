"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Hero/HeroCentered.module.css";
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

export type HeroCenteredSlide = {
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  bg?: string;
  chips?: string[];
  imageSrc?: string;
};

export type HeroCenteredPromo = {
  icon: string;
  title: string;
  sub: string;
  off: string;
  href: string;
  imageSrc?: string;
};

export type HeroCenteredBanner = {
  variant: "top" | "bot";
  badge: string;
  title: string;
  sub: string;
  imageSrc?: string;
  icon?: string;
};

export type HeroCenteredProps = {
  siteId?: string;
  categoryApiPath?: string;
  categoryBasePath?: string;
  activeOnly?: boolean;
  onlyRootCategories?: boolean;

  slides?: HeroCenteredSlide[];
  promos?: HeroCenteredPromo[];
  rightBanners?: HeroCenteredBanner[];

  autoMs?: number;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_SLIDES: HeroCenteredSlide[] = [
  {
    headline: "Future Commerce\nPremium Shopping Experience",
    sub: "Hero section theo phong cách retail hiện đại 2026, nhấn mạnh thương hiệu, ưu đãi và trải nghiệm mua sắm trực quan trên mọi thiết bị.",
    ctaLabel: "Khám phá ngay",
    ctaHref: "/shop",
    chips: ["New arrival", "Premium brands", "Fast checkout"],
    imageSrc: "/assets/images/product.jpg",
    bg: "linear-gradient(135deg, #0f172a 0%, #172554 35%, #1d4ed8 100%)",
  },
  {
    headline: "Smart Deals\nCurated For Modern Buyers",
    sub: "Tối ưu cho website bán hàng với bố cục rõ ràng, category nổi bật, CTA mạnh và cảm giác chuyên nghiệp cao cấp.",
    ctaLabel: "Xem ưu đãi",
    ctaHref: "/promotions",
    chips: ["Best deals", "Trusted payment", "Global delivery"],
    imageSrc: "/assets/images/product.jpg",
    bg: "linear-gradient(135deg, #111827 0%, #3b0764 45%, #7c3aed 100%)",
  },
  {
    headline: "Sell Better\nDesign For Conversion",
    sub: "Tập trung vào conversion, niềm tin thương hiệu và trải nghiệm mua sắm mới mẻ phù hợp ecommerce hiện đại.",
    ctaLabel: "Mua sắm ngay",
    ctaHref: "/collections",
    chips: ["Conversion-first", "Modern UI", "Retail ready"],
    imageSrc: "/assets/images/product.jpg",
    bg: "linear-gradient(135deg, #0b1120 0%, #134e4a 45%, #0f766e 100%)",
  },
];

const DEFAULT_PROMOS: HeroCenteredPromo[] = [
  {
    icon: "bi-stars",
    title: "Bộ sưu tập nổi bật",
    sub: "Chọn lọc sản phẩm bán chạy cho khách hàng hiện đại",
    off: "Editor picks",
    href: "/collections",
    imageSrc: "/assets/images/product.jpg",
  },
  {
    icon: "bi-lightning-charge",
    title: "Ưu đãi trong tuần",
    sub: "Tăng chuyển đổi với các deal nổi bật và CTA rõ ràng",
    off: "Weekly hot",
    href: "/deals",
    imageSrc: "/assets/images/product.jpg",
  },
];

const DEFAULT_RIGHT_BANNERS: HeroCenteredBanner[] = [
  {
    variant: "top",
    badge: "MEMBER",
    title: "Quyền lợi thành viên",
    sub: "Ưu đãi riêng, tích điểm và hành trình mua sắm cá nhân hóa.",
    icon: "bi-gem",
  },
  {
    variant: "bot",
    badge: "PAYMENT",
    title: "Thanh toán linh hoạt",
    sub: "Tương thích đa cổng thanh toán, thao tác nhanh và bảo mật.",
    icon: "bi-credit-card-2-front",
  },
  {
    variant: "bot",
    badge: "SUPPORT",
    title: "Hỗ trợ hậu mãi",
    sub: "Tư vấn nhanh, chăm sóc đơn hàng và xử lý sau bán chuyên nghiệp.",
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

/* ================= Component ================= */
export function HeroCentered({
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
}: HeroCenteredProps) {
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
          console.error("[HeroCentered] load categories failed:", response.status, await response.text());
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
        console.error("[HeroCentered] load categories error:", error);
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

  const serviceItems = useMemo(
    () => [
      { icon: "bi-truck", label: "Fast Delivery" },
      { icon: "bi-shield-check", label: "Security" },
      { icon: "bi-arrow-repeat", label: "Returns" },
      { icon: "bi-headset", label: "Support" },
    ],
    [],
  );

  const paymentItems = useMemo(() => ["VISA", "Mastercard", "PayPal", "JCB"], []);

  const stats = useMemo(
    () => [
      { value: "24/7", label: "Support" },
      { value: "99%", label: "Satisfaction" },
      { value: "1K+", label: "Products" },
    ],
    [],
  );

  return (
    <section className={cls.hero} aria-label="Marketplace hero">
      <div className={cls.shell}>
        {/* LEFT CATEGORY SIDEBAR */}
        <aside className={cls.sidebar} aria-label="Product categories">
          <div className={cls.sidebarPanel}>
            <div className={cls.sidebarTop}>
              <div className={cls.sidebarEyebrow}>Browse</div>
              <div className={cls.sidebarHeading}>Featured Categories</div>
            </div>

            <ul className={cls.categoryList}>
              {(categories ?? []).length === 0 ? (
                <li className={cls.categoryEmpty}>
                  <div className={cls.categoryEmptyIcon}>
                    <i className="bi bi-grid-3x3-gap" />
                  </div>
                  <div className={cls.categoryEmptyTitle}>Categories are not yet available</div>
                  <div className={cls.categoryEmptySub}>Categories will be displayed when the API returns data.</div>
                </li>
              ) : (
                (categories ?? []).slice(0, 10).map((category) => {
                  const content = (
                    <>
                      <div className={cls.categoryMain}>
                        <div className={cls.categoryAvatar}>{getInitials(category.name)}</div>
                        <div className={cls.categoryMeta}>
                          <span className={cls.categoryNameCompact}>{category.name}</span>
                          <span className={cls.categoryCount}>{formatCategoryCount(category.count)} items</span>
                        </div>
                      </div>
                      <span className={cls.categoryArrowCompact}>
                        <i className="bi bi-arrow-up-right" />
                      </span>
                    </>
                  );

                  return preview ? (
                    <li key={category.id} className={cls.categoryItemCompact}>
                      <a href="#" onClick={handlePreviewBlockClick} className={cls.categoryLinkCompact}>
                        {content}
                      </a>
                    </li>
                  ) : (
                    <li key={category.id} className={cls.categoryItemCompact}>
                      <Link
                        href={`${normalizedBasePath}/${category.slug}` as Route}
                        className={cls.categoryLinkCompact}
                      >
                        {content}
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>

            <div className={cls.sidebarFooter}>
              <div className={cls.sidebarFooterBadge}>Retail ready</div>
              <div className={cls.sidebarFooterText}>
                Tối ưu cho bố cục bán hàng hiện đại và điều hướng sản phẩm rõ ràng.
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER MAIN */}
        <div className={cls.centerCol}>
          <div
            className={cls.heroCard}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            aria-label="Main banner slider"
          >
            <div className={cls.heroTopBar}>
              <div className={cls.heroTopLeft}>
                <span className={cls.heroTopPill}>2026 Commerce UI</span>
                <span className={cls.heroTopText}>New design for e-commerce website</span>
              </div>

              <div className={cls.heroTopRight}>
                {stats.map((item) => (
                  <div key={item.label} className={cls.heroStat}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={cls.heroRailWrap}>
              <div className={cls.heroRail} style={{ transform: `translate3d(-${activeSlideIndex * 100}%, 0, 0)` }}>
                {slides.map((slide, index) => {
                  const headlineLines = splitHeadlineLines(slide.headline);

                  return (
                    <article
                      key={`${index}-${slide.ctaHref}-${slide.headline}`}
                      className={cls.heroSlide}
                      aria-hidden={index !== activeSlideIndex}
                      style={{ background: slide.bg || undefined }}
                    >
                      <div className={cls.heroPattern} aria-hidden="true" />
                      <div className={cls.heroGlow} aria-hidden="true" />
                      <div className={cls.bannerInner}>
                        <div className={cls.bannerCopy}>
                          <div className={cls.bannerBadge}>
                            <span className={cls.bannerBadgeDot} />
                            Premium commerce
                          </div>

                          <h2 className={cls.bannerHeadline}>
                            {headlineLines.map((line, lineIndex) => (
                              <React.Fragment key={lineIndex}>
                                <span>{line}</span>
                                {lineIndex < headlineLines.length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </h2>

                          <p className={cls.bannerSub}>{slide.sub}</p>

                          {!!slide.chips?.length && (
                            <div className={cls.bannerChips}>
                              {slide.chips.map((chip) => (
                                <span key={chip} className={cls.bannerChip}>
                                  {chip}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className={cls.bannerActions}>
                            {preview ? (
                              <button type="button" className={cls.bannerCtaPrimary} onClick={handlePreviewBlockClick}>
                                {slide.ctaLabel}
                              </button>
                            ) : (
                              <Link href={(slide.ctaHref || "/") as Route} className={cls.bannerCtaPrimary}>
                                {slide.ctaLabel}
                              </Link>
                            )}

                            {preview ? (
                              <button type="button" className={cls.bannerCtaGhost} onClick={handlePreviewBlockClick}>
                                Xem bộ sưu tập
                              </button>
                            ) : (
                              <Link href={"/collections" as Route} className={cls.bannerCtaGhost}>
                                Xem bộ sưu tập
                              </Link>
                            )}
                          </div>

                          <div className={cls.bannerTrustRow}>
                            <div className={cls.bannerTrustItem}>
                              <i className="bi bi-patch-check-fill" />
                              <span>Trusted brand</span>
                            </div>
                            <div className={cls.bannerTrustItem}>
                              <i className="bi bi-lightning-charge-fill" />
                              <span>Fast checkout</span>
                            </div>
                            <div className={cls.bannerTrustItem}>
                              <i className="bi bi-globe2" />
                              <span>Multi-platform</span>
                            </div>
                          </div>
                        </div>

                        <div className={cls.bannerVisual} aria-hidden="true">
                          <div className={cls.bannerVisualAura} />
                          <div className={cls.bannerFloatingCard}>
                            <div className={cls.bannerFloatingLabel}>New UI</div>
                            <div className={cls.bannerFloatingValue}>Conversion+</div>
                          </div>

                          <div className={cls.bannerImageFrame}>
                            {slide.imageSrc ? (
                              <Image
                                src={slide.imageSrc}
                                alt=""
                                fill
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className={cls.bannerImage}
                                priority={index === 0}
                              />
                            ) : (
                              <div className={cls.bannerImageFallback}>
                                <i className="bi bi-image" />
                              </div>
                            )}
                          </div>

                          <div className={cls.bannerMiniMetrics}>
                            <div className={cls.bannerMiniMetric}>
                              <strong>4.9/5</strong>
                              <span>Customer rating</span>
                            </div>
                            <div className={cls.bannerMiniMetric}>
                              <strong>Secure</strong>
                              <span>Protected payment</span>
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
              type="button"
              className={`${cls.heroArrow} ${cls.heroArrowPrev}`}
              aria-label="Previous slide"
              onClick={goToPreviousSlide}
            >
              <i className="bi bi-chevron-left" />
            </button>

            <button
              type="button"
              className={`${cls.heroArrow} ${cls.heroArrowNext}`}
              aria-label="Next slide"
              onClick={goToNextSlide}
            >
              <i className="bi bi-chevron-right" />
            </button>

            <div className={cls.heroBottomBar}>
              <div className={cls.heroPager}>
                <span className={cls.heroPagerCurrent}>{String(activeSlideIndex + 1).padStart(2, "0")}</span>
                <span className={cls.heroPagerDivider}>/</span>
                <span className={cls.heroPagerTotal}>{String(totalSlides).padStart(2, "0")}</span>
              </div>

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
          </div>
        </div>

        {/* RIGHT UTILITIES */}
        <aside className={cls.rightCol} aria-label="User utilities">
          <div className={cls.infoCard}>
            <div className={cls.infoHeader}>
              <div>
                <div className={cls.infoTitle}>Sales Advantage</div>
              </div>
              <div className={cls.infoMore}>Brand trust</div>
            </div>

            <div className={cls.serviceGrid}>
              {serviceItems.map((item) => (
                <div key={item.label} className={cls.serviceItem}>
                  <i className={`bi ${item.icon}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={cls.promoRow} aria-label="Promotions">
            {promos.map((promo) => {
              const content = (
                <>
                  <div className={cls.promoCopy}>
                    <div className={cls.promoOverline}>{promo.off}</div>
                    <div className={cls.promoTitle}>{promo.title}</div>
                    <div className={cls.promoSub}>{promo.sub}</div>
                    <div className={cls.promoCtaText}>
                      Xem thêm <i className="bi bi-arrow-right" />
                    </div>
                  </div>

                  <div className={cls.promoMedia} aria-hidden="true">
                    {promo.imageSrc ? (
                      <Image
                        src={promo.imageSrc}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 30vw"
                        className={cls.promoImage}
                      />
                    ) : (
                      <i className={`bi ${ensureBootstrapIcon(promo.icon)} ${cls.promoIcon}`} />
                    )}
                  </div>
                </>
              );

              return preview ? (
                <a
                  key={promo.href || promo.title}
                  href="#"
                  onClick={handlePreviewBlockClick}
                  className={cls.promoCardWide}
                >
                  {content}
                </a>
              ) : (
                <Link key={promo.href || promo.title} href={(promo.href || "/") as Route} className={cls.promoCardWide}>
                  {content}
                </Link>
              );
            })}
          </div>
        </aside>

        <div className={cls.srOnly} aria-hidden="true">
          {currentHeadlineLines.join(" ")}
        </div>
      </div>
    </section>
  );
}

/* ================= RegItem ================= */
export const SHOP_HERO_CENTERED: RegItem = {
  kind: "HeroCentered",
  label: "Hero Centered",
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
    const slides = safeJsonParse<HeroCenteredSlide[]>(props.slides);
    const promos = safeJsonParse<HeroCenteredPromo[]>(props.promos);
    const rightBanners = safeJsonParse<HeroCenteredBanner[]>(props.rightBanners);

    const siteId = toStringValue(props.siteId, "sitea01").trim() || "sitea01";
    const categoryApiPath = toStringValue(props.categoryApiPath, "/api/v1/categories").trim() || "/api/v1/categories";
    const categoryBasePath = toStringValue(props.categoryBasePath, "/category").trim() || "/category";

    const activeOnly = toBooleanValue(props.activeOnly, true);
    const onlyRootCategories = toBooleanValue(props.onlyRootCategories, true);
    const preview = toBooleanValue(props.preview, false);
    const autoMs = toNumberValue(props.autoMs, 4500);

    return (
      <div className="sectionContainer" aria-label="Shop Hero Centered">
        <HeroCentered
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

export default HeroCentered;

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/templates/sections/RelatedProducts/RelatedProducts.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type ApiProductImage = {
  id?: string;
  url?: string | null;
};

type ApiProductBrand = {
  id?: string;
  name?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
};

type ApiProductCategory = {
  id?: string;
  name?: string | null;
  slug?: string | null;
};

export type RelatedProductsApiProduct = {
  id: string;
  name: string;
  slug?: string | null;
  href?: string | null;
  price?: number | null;
  marketPrice?: number | null;
  discountPercent?: number | null;
  stockText?: string | null;
  productQty?: number | null;
  soldCount?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  image?: ApiProductImage | null;
  images?: ApiProductImage[];
  brand?: ApiProductBrand | null;
  category?: ApiProductCategory | null;
};

type ProductListResponse = {
  siteId?: string;
  domain?: string;
  items?: RelatedProductsApiProduct[];
};

type CardTone = "soft" | "warm" | "bold";

export type RelatedProductsProps = {
  title?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
  apiUrl?: string;
  currency?: string;
  locale?: string;
  emptyText?: string;
  maxItems?: number;
  cardTone?: CardTone;
  showArrows?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoParagraphOne?: string;
  seoParagraphTwo?: string;
  seoParagraphThree?: string;
  seoHighlightsTitle?: string;
  seoHighlights?: string[];
};

function normalizeProducts(items?: RelatedProductsApiProduct[]) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item?.id && item?.name);
}

function formatCurrency(value: number, locale: string, currency: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

function getProductImage(product: RelatedProductsApiProduct) {
  return product.image?.url || product.images?.find((item) => item?.url)?.url || "/assets/images/logo.jpg";
}

function getProductHref(product: RelatedProductsApiProduct) {
  if (product.href && typeof product.href === "string") return product.href;
  if (product.slug) return `/product-detail/${product.slug}`;
  return "#";
}

function getSoldText(product: RelatedProductsApiProduct) {
  const sold = Number(product.soldCount ?? product.productQty ?? 0);
  if (sold >= 1000) return `Sold ${Math.floor(sold / 1000)}k+`;
  if (sold > 0) return `Sold ${sold}`;
  return "Trending now";
}

function getRatingValue(product: RelatedProductsApiProduct) {
  const raw = Number(product.rating ?? 4.8);
  return Math.max(0, Math.min(5, Number.isFinite(raw) ? raw : 4.8));
}

function buildBadge(product: RelatedProductsApiProduct) {
  const discount = Number(product.discountPercent ?? 0);
  const qty = Number(product.productQty ?? 0);

  if (discount > 0) return `-${discount}%`;
  if (qty > 0 && qty <= 8) return "Low stock";
  return "New";
}

function getCardClassName(tone: CardTone) {
  if (tone === "warm") return styles.cardWarm;
  if (tone === "bold") return styles.cardBold;
  return styles.cardSoft;
}

function Stars({ value }: { value: number }) {
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;

  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => {
        const isFull = index < fullStars;
        const isHalf = !isFull && hasHalf && index === fullStars;

        return (
          <span key={index} className={styles.star}>
            {isFull ? "★" : isHalf ? "⯨" : "☆"}
          </span>
        );
      })}
    </span>
  );
}

export function RelatedProducts({
  title = "More Products From This Shop",
  viewAllLabel = "View all",
  viewAllHref = "/products",
  apiUrl = "/api/v1/products/list",
  currency = "USD",
  locale = "en-US",
  emptyText = "No related products available right now.",
  maxItems = 12,
  cardTone = "warm",
  showArrows = true,
  seoTitle = "Discover more quality products with better value and dependable shopping confidence",
  seoDescription = "Browse more product recommendations carefully selected to help shoppers compare quality, pricing, and everyday usability with confidence.",
  seoParagraphOne = "This related products section is designed to support a stronger shopping journey by helping customers discover similar, complementary, or trending items without leaving the page. Clear pricing, product visuals, and quick comparison points make it easier to continue browsing and reduce decision friction.",
  seoParagraphTwo = "Showing additional products below the main experience also improves internal product discovery and creates more opportunities for users to explore relevant categories, brands, and price points. This contributes to a more complete eCommerce experience while supporting deeper engagement across the catalog.",
  seoParagraphThree = "For shoppers, that means better visibility into available options and stronger confidence before purchasing. For the storefront, it helps highlight bestsellers, discounted products, and in-demand items in a professional layout that feels trustworthy, modern, and conversion-focused.",
  seoHighlightsTitle = "Why this product section works well",
  seoHighlights = [
    "Improves product discovery with relevant recommendations",
    "Supports SEO with meaningful descriptive content below the product rail",
    "Builds shopper trust through clear pricing, ratings, and visual consistency",
    "Encourages deeper browsing across categories and related items",
  ],
}: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProductsApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setErrorText("");

      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("size", String(Math.max(1, maxItems)));

        const response = await fetch(`${apiUrl}?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "x-site-domain": typeof window !== "undefined" ? window.location.host : "",
          },
        });

        const data = (await response.json()) as ProductListResponse & { error?: string };

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load related products.");
        }

        setProducts(normalizeProducts(data.items).slice(0, maxItems));
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        setProducts([]);
        setErrorText(error instanceof Error ? error.message : "Failed to load related products.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [apiUrl, maxItems]);

  const visibleProducts = useMemo(() => products.slice(0, maxItems), [products, maxItems]);

  const updateScrollState = () => {
    const node = railRef.current;
    if (!node) return;

    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    setCanScrollPrev(node.scrollLeft > 8);
    setCanScrollNext(node.scrollLeft < maxScrollLeft - 8);
  };

  useEffect(() => {
    updateScrollState();

    const node = railRef.current;
    if (!node) return;

    const onScroll = () => updateScrollState();
    node.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      node.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [visibleProducts.length, loading]);

  const scrollByCardGroup = (direction: "prev" | "next") => {
    const node = railRef.current;
    if (!node) return;

    const amount = Math.max(280, Math.round(node.clientWidth * 0.72));
    node.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.section} aria-labelledby="related-products-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <p className={styles.eyebrow}>Recommended for shoppers</p>
            <h2 id="related-products-title" className={styles.title}>
              {title}
            </h2>
          </div>

          <div className={styles.headerActions}>
            {showArrows ? (
              <div className={styles.arrowGroup} aria-label="Carousel navigation">
                <button
                  type="button"
                  className={styles.arrowButton}
                  onClick={() => scrollByCardGroup("prev")}
                  disabled={!canScrollPrev}
                  aria-label="Scroll left"
                >
                  <span aria-hidden="true">‹</span>
                </button>

                <button
                  type="button"
                  className={styles.arrowButton}
                  onClick={() => scrollByCardGroup("next")}
                  disabled={!canScrollNext}
                  aria-label="Scroll right"
                >
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            ) : null}

            <Link href={viewAllHref} className={styles.viewAllLink}>
              <span>{viewAllLabel}</span>
              <span aria-hidden="true" className={styles.viewAllIcon}>
                ›
              </span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox} role="status" aria-live="polite">
            <div className={styles.loader} aria-hidden="true" />
            <div>
              <h3>Loading products</h3>
              <p>Please wait while we prepare more recommendations.</p>
            </div>
          </div>
        ) : errorText ? (
          <div className={styles.stateBox} role="alert">
            <div className={styles.stateIcon} aria-hidden="true">
              !
            </div>
            <div>
              <h3>Unable to load products</h3>
              <p>{errorText}</p>
            </div>
          </div>
        ) : visibleProducts.length ? (
          <div className={styles.railWrap}>
            <div className={styles.rail} ref={railRef}>
              {visibleProducts.map((product) => {
                const productHref = getProductHref(product);
                const priceValue = Number(product.price ?? 0);
                const marketPriceValue =
                  typeof product.marketPrice === "number" ? Number(product.marketPrice) : undefined;
                const showOriginalPrice = typeof marketPriceValue === "number" && marketPriceValue > priceValue;
                const badge = buildBadge(product);
                const rating = getRatingValue(product);
                const reviewCount = Math.max(0, Number(product.reviewCount ?? 0));
                const soldText = getSoldText(product);

                return (
                  <article
                    key={product.id}
                    className={`${styles.card} ${getCardClassName(cardTone)}`}
                    itemScope
                    itemType="https://schema.org/Product"
                  >
                    <Link href={productHref} className={styles.cardMedia} aria-label={product.name}>
                      <div className={styles.imageWrap}>
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 220px"
                          className={styles.image}
                        />
                      </div>

                      <span className={styles.badge}>{badge}</span>
                    </Link>

                    <div className={styles.cardBody}>
                      <h3 className={styles.productName} itemProp="name">
                        <Link href={productHref}>{product.name}</Link>
                      </h3>

                      <div className={styles.priceRow} itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <meta itemProp="priceCurrency" content={currency} />
                        <span className={styles.price} itemProp="price">
                          {formatCurrency(priceValue, locale, currency)}
                        </span>
                        {showOriginalPrice ? (
                          <span className={styles.originalPrice}>
                            {formatCurrency(marketPriceValue!, locale, currency)}
                          </span>
                        ) : null}
                      </div>

                      <div className={styles.metaRow}>
                        <div className={styles.ratingBox} aria-label={`Rated ${rating} out of 5`}>
                          <Stars value={rating} />
                          <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
                        </div>

                        <span className={styles.reviewText}>
                          {reviewCount > 0 ? `${reviewCount} reviews` : soldText}
                        </span>
                      </div>

                      <p className={styles.soldText}>{soldText}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.stateBox} role="status">
            <div className={styles.stateIcon} aria-hidden="true">
              •
            </div>
            <div>
              <h3>No products found</h3>
              <p>{emptyText}</p>
            </div>
          </div>
        )}

        <section className={styles.seoSection} aria-labelledby="related-products-seo-title">
          <div className={styles.seoShell}>
            <div className={styles.seoMain}>
              <span className={styles.seoBadge}>SEO Content</span>
              <h3 id="related-products-seo-title" className={styles.seoTitle}>
                {seoTitle}
              </h3>
              <p className={styles.seoLead}>{seoDescription}</p>

              <div className={styles.seoCopy}>
                <p>{seoParagraphOne}</p>
                <p>{seoParagraphTwo}</p>
                <p>{seoParagraphThree}</p>
              </div>
            </div>

            <aside className={styles.seoAside} aria-label="Related products content benefits">
              <div className={styles.seoCard}>
                <h4 className={styles.seoCardTitle}>{seoHighlightsTitle}</h4>

                <ul className={styles.seoFeatureList}>
                  {seoHighlights.map((item, index) => (
                    <li key={`${item}-${index}`} className={styles.seoFeatureItem}>
                      <span className={styles.seoFeatureIcon} aria-hidden="true">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </section>
  );
}

export const SHOP_RELATED_PRODUCTS: RegItem = {
  kind: "RelatedProducts",
  label: "Related Products",
  defaults: {
    title: "More Products From This Shop",
    viewAllLabel: "View all",
    viewAllHref: "/products",
    apiUrl: "/api/v1/products/list",
    currency: "USD",
    locale: "en-US",
    emptyText: "No related products available right now.",
    maxItems: 12,
    cardTone: "warm",
    showArrows: true,
    seoTitle: "Discover more quality products with better value and dependable shopping confidence",
    seoDescription:
      "Browse more product recommendations carefully selected to help shoppers compare quality, pricing, and everyday usability with confidence.",
    seoParagraphOne:
      "This related products section is designed to support a stronger shopping journey by helping customers discover similar, complementary, or trending items without leaving the page. Clear pricing, product visuals, and quick comparison points make it easier to continue browsing and reduce decision friction.",
    seoParagraphTwo:
      "Showing additional products below the main experience also improves internal product discovery and creates more opportunities for users to explore relevant categories, brands, and price points. This contributes to a more complete eCommerce experience while supporting deeper engagement across the catalog.",
    seoParagraphThree:
      "For shoppers, that means better visibility into available options and stronger confidence before purchasing. For the storefront, it helps highlight bestsellers, discounted products, and in-demand items in a professional layout that feels trustworthy, modern, and conversion-focused.",
    seoHighlights: JSON.stringify(
      [
        "Improves product discovery with relevant recommendations",
        "Supports SEO with meaningful descriptive content below the product rail",
        "Builds shopper trust through clear pricing, ratings, and visual consistency",
        "Encourages deeper browsing across categories and related items",
      ],
      null,
      2,
    ),
    seoHighlightsTitle: "Why this product section works well",
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "viewAllLabel", label: "View All Label", kind: "text" },
    { key: "viewAllHref", label: "View All Href", kind: "text" },
    { key: "apiUrl", label: "API URL", kind: "text" },
    { key: "currency", label: "Currency", kind: "text" },
    { key: "locale", label: "Locale", kind: "text" },
    { key: "emptyText", label: "Empty Text", kind: "text" },
    { key: "maxItems", label: "Max Items", kind: "number" },
    { key: "cardTone", label: "Card Tone", kind: "text" },
    { key: "showArrows", label: "Show Arrows", kind: "check" },
    { key: "seoTitle", label: "SEO Title", kind: "text" },
    { key: "seoDescription", label: "SEO Description", kind: "textarea", rows: 3 },
    { key: "seoParagraphOne", label: "SEO Paragraph One", kind: "textarea", rows: 5 },
    { key: "seoParagraphTwo", label: "SEO Paragraph Two", kind: "textarea", rows: 5 },
    { key: "seoParagraphThree", label: "SEO Paragraph Three", kind: "textarea", rows: 5 },
    { key: "seoHighlightsTitle", label: "SEO Highlights Title", kind: "text" },
    { key: "seoHighlights", label: "SEO Highlights (JSON)", kind: "textarea", rows: 8 },
  ],
  render: (props) => {
    const p = props as Record<string, any>;

    const parsedHighlights = (() => {
      try {
        const value = JSON.parse(p.seoHighlights || "[]");
        return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
      } catch {
        return [];
      }
    })();

    return (
      <div aria-label="Related Products">
        <RelatedProducts
          title={p.title || "More Products From This Shop"}
          viewAllLabel={p.viewAllLabel || "View all"}
          viewAllHref={p.viewAllHref || "/products"}
          apiUrl={p.apiUrl || "/api/v1/products/list"}
          currency={p.currency || "USD"}
          locale={p.locale || "en-US"}
          emptyText={p.emptyText || "No related products available right now."}
          maxItems={Number(p.maxItems) > 0 ? Number(p.maxItems) : 12}
          cardTone={p.cardTone === "soft" || p.cardTone === "warm" || p.cardTone === "bold" ? p.cardTone : "warm"}
          showArrows={typeof p.showArrows === "boolean" ? p.showArrows : true}
          seoTitle={p.seoTitle || "Discover more quality products with better value and dependable shopping confidence"}
          seoDescription={
            p.seoDescription ||
            "Browse more product recommendations carefully selected to help shoppers compare quality, pricing, and everyday usability with confidence."
          }
          seoParagraphOne={
            p.seoParagraphOne ||
            "This related products section is designed to support a stronger shopping journey by helping customers discover similar, complementary, or trending items without leaving the page. Clear pricing, product visuals, and quick comparison points make it easier to continue browsing and reduce decision friction."
          }
          seoParagraphTwo={
            p.seoParagraphTwo ||
            "Showing additional products below the main experience also improves internal product discovery and creates more opportunities for users to explore relevant categories, brands, and price points. This contributes to a more complete eCommerce experience while supporting deeper engagement across the catalog."
          }
          seoParagraphThree={
            p.seoParagraphThree ||
            "For shoppers, that means better visibility into available options and stronger confidence before purchasing. For the storefront, it helps highlight bestsellers, discounted products, and in-demand items in a professional layout that feels trustworthy, modern, and conversion-focused."
          }
          seoHighlightsTitle={p.seoHighlightsTitle || "Why this product section works well"}
          seoHighlights={
            parsedHighlights.length
              ? parsedHighlights
              : [
                  "Improves product discovery with relevant recommendations",
                  "Supports SEO with meaningful descriptive content below the product rail",
                  "Builds shopper trust through clear pricing, ratings, and visual consistency",
                  "Encourages deeper browsing across categories and related items",
                ]
          }
        />
      </div>
    );
  },
};

export default RelatedProducts;

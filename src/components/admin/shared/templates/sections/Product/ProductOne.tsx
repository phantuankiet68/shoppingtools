"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/templates/sections/Product/ProductOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type ProductOneBrandFilter = {
  label: string;
  value: string;
};

export type ProductOnePriceFilter = {
  label: string;
  min?: number;
  max?: number;
  value: string;
};

export type ProductOneColorFilter = {
  label: string;
  value: string;
  hex: string;
};

type SortValue = "featured" | "price-asc" | "price-desc" | "name-asc";
type LayoutValue = "grid" | "list";

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

export type ProductOneApiProduct = {
  id: string;
  name: string;
  slug?: string | null;
  href?: string | null;
  price?: number | null;
  marketPrice?: number | null;
  discountPercent?: number | null;
  stockText?: string | null;
  productQty?: number | null;
  image?: ApiProductImage | null;
  images?: ApiProductImage[];
  brand?: ApiProductBrand | null;
  category?: ApiProductCategory | null;
};

type ProductListResponse = {
  siteId?: string;
  domain?: string;
  items?: ProductOneApiProduct[];
  pagination?: {
    page?: number;
    size?: number;
    total?: number;
    totalPages?: number;
    hasPrev?: boolean;
    hasNext?: boolean;
  };
};

export type ProductOneProps = {
  title?: string;
  apiUrl?: string;
  currency?: string;
  locale?: string;
  emptyText?: string;
  brandFilters?: ProductOneBrandFilter[];
  priceFilters?: ProductOnePriceFilter[];
  colorFilters?: ProductOneColorFilter[];
  pageSize?: number;
  defaultSort?: SortValue;
};

const DEFAULT_BRANDS: ProductOneBrandFilter[] = [
  { label: "Hada A", value: "Hada A" },
  { label: "Reymond", value: "Reymond" },
  { label: "Blue World", value: "Blue World" },
  { label: "Vanhuesen", value: "Vanhuesen" },
  { label: "Bimsbos", value: "Bimsbos" },
  { label: "Vanhuesen Pro", value: "Vanhuesen Pro" },
];

const DEFAULT_PRICES: ProductOnePriceFilter[] = [
  { label: "$50 - $100", min: 50, max: 100, value: "50-100" },
  { label: "$100 - $150", min: 100, max: 150, value: "100-150" },
  { label: "$150 - $200", min: 150, max: 200, value: "150-200" },
  { label: "$200 - $250", min: 200, max: 250, value: "200-250" },
  { label: "$250 - $300", min: 250, max: 300, value: "250-300" },
];

const DEFAULT_COLORS: ProductOneColorFilter[] = [
  { label: "Rose", value: "pink", hex: "#d98892" },
  { label: "Amber", value: "orange", hex: "#d58847" },
  { label: "Slate", value: "blue", hex: "#6e86d8" },
  { label: "Orchid", value: "violet", hex: "#c86cc6" },
  { label: "Mint", value: "teal", hex: "#2ac8bf" },
];

const sortOptions: { label: string; value: SortValue }[] = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
];

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

function parseBrandFilters(raw?: string): ProductOneBrandFilter[] | undefined {
  if (!raw) return undefined;

  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return undefined;

    const cleaned = value
      .filter(Boolean)
      .map((item: any) => ({
        label: String(item?.label ?? ""),
        value: String(item?.value ?? item?.label ?? ""),
      }))
      .filter((item) => item.label && item.value);

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

function parsePriceFilters(raw?: string): ProductOnePriceFilter[] | undefined {
  if (!raw) return undefined;

  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return undefined;

    const cleaned = value
      .filter(Boolean)
      .map((item: any) => ({
        label: String(item?.label ?? ""),
        value: String(item?.value ?? ""),
        min: item?.min !== undefined ? Number(item.min) : undefined,
        max: item?.max !== undefined ? Number(item.max) : undefined,
      }))
      .filter((item) => item.label && item.value);

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

function parseColorFilters(raw?: string): ProductOneColorFilter[] | undefined {
  if (!raw) return undefined;

  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return undefined;

    const cleaned = value
      .filter(Boolean)
      .map((item: any) => ({
        label: String(item?.label ?? ""),
        value: String(item?.value ?? ""),
        hex: String(item?.hex ?? ""),
      }))
      .filter((item) => item.label && item.value && item.hex);

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

function normalizeProducts(items?: ProductOneApiProduct[]): ProductOneApiProduct[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item?.id && item?.name);
}

function getProductImage(product: ProductOneApiProduct) {
  return product.image?.url || product.images?.find((item) => item?.url)?.url || "/assets/images/logo.jpg";
}

function getProductHref(product: ProductOneApiProduct) {
  if (product.href && typeof product.href === "string") return product.href;
  if (product.slug) return `/product-detail/${product.slug}`;
  return "#";
}

function buildBadge(product: ProductOneApiProduct) {
  if (typeof product.discountPercent === "number" && product.discountPercent > 0) {
    return { text: `-${product.discountPercent}%`, tone: "sale" as const };
  }

  if ((product.productQty ?? 0) > 0 && (product.productQty ?? 0) <= 8) {
    return { text: "Hot", tone: "hot" as const };
  }

  return { text: "New", tone: "new" as const };
}

function getDiscountAmount(product: ProductOneApiProduct) {
  const price = Number(product.price ?? 0);
  const marketPrice = Number(product.marketPrice ?? 0);

  if (marketPrice > price && price > 0) {
    return marketPrice - price;
  }

  return 0;
}

function includesSearch(product: ProductOneApiProduct, keyword: string) {
  if (!keyword.trim()) return true;

  const q = keyword.trim().toLowerCase();
  const haystacks = [
    product.name,
    product.slug ?? "",
    product.brand?.name ?? "",
    product.category?.name ?? "",
    product.stockText ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystacks.includes(q);
}

function isProductInPrice(product: ProductOneApiProduct, filters: ProductOnePriceFilter[], selected: string[]) {
  if (!selected.length) return true;

  const price = typeof product.price === "number" ? product.price : 0;

  return selected.some((priceValue) => {
    const found = filters.find((item) => item.value === priceValue);
    if (!found) return false;

    const minOk = found.min === undefined || price >= found.min;
    const maxOk = found.max === undefined || price <= found.max;
    return minOk && maxOk;
  });
}

function isProductInBrand(product: ProductOneApiProduct, selected: string[]) {
  if (!selected.length) return true;

  const brandName = String(product.brand?.name ?? "").trim();
  return selected.includes(brandName);
}

function isProductInColor(product: ProductOneApiProduct, selected: string[]) {
  if (!selected.length) return true;

  const text = `${product.name} ${product.brand?.name ?? ""} ${product.category?.name ?? ""}`.toLowerCase();
  return selected.some((color) => text.includes(color.toLowerCase()));
}

export function ProductOne({
  title = "Product List",
  apiUrl = "/api/v1/products/list",
  currency = "USD",
  locale = "en-US",
  emptyText = "No products match your current filters.",
  brandFilters = DEFAULT_BRANDS,
  priceFilters = DEFAULT_PRICES,
  colorFilters = DEFAULT_COLORS,
  pageSize = 12,
  defaultSort = "price-asc",
}: ProductOneProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<SortValue>(defaultSort);
  const [layout, setLayout] = useState<LayoutValue>("grid");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const [products, setProducts] = useState<ProductOneApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSortValue(defaultSort);
  }, [defaultSort]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedBrands, selectedColors, selectedPrices, onlyDiscounted, onlyInStock, sortValue]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setErrorText("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(pageSize));

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
          throw new Error(data?.error || "Failed to load products.");
        }

        const nextItems = normalizeProducts(data.items);
        setProducts(nextItems);
        setTotalItems(Number(data.pagination?.total ?? nextItems.length ?? 0));
        setTotalPages(Math.max(1, Number(data.pagination?.totalPages ?? 1)));
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;

        setProducts([]);
        setTotalItems(0);
        setTotalPages(1);
        setErrorText(error instanceof Error ? error.message : "Failed to load products.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [apiUrl, page, pageSize]);

  const availableBrands = useMemo(() => {
    const dynamicBrands = products.map((product) => String(product.brand?.name ?? "").trim()).filter(Boolean);
    const fallbackBrands = brandFilters.map((item) => item.value);
    const unique = Array.from(new Set([...dynamicBrands, ...fallbackBrands]));

    return unique.map((value) => {
      const found = brandFilters.find((item) => item.value === value);
      return found ?? { label: value, value };
    });
  }, [brandFilters, products]);

  const filteredProducts = useMemo(() => {
    const result = [...products]
      .filter((product) => includesSearch(product, searchTerm))
      .filter((product) => isProductInBrand(product, selectedBrands))
      .filter((product) => isProductInPrice(product, priceFilters, selectedPrices))
      .filter((product) => isProductInColor(product, selectedColors))
      .filter((product) => (onlyDiscounted ? Number(product.discountPercent ?? 0) > 0 : true))
      .filter((product) => (onlyInStock ? Number(product.productQty ?? 0) > 0 : true));

    switch (sortValue) {
      case "price-asc":
        result.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
        break;
      case "price-desc":
        result.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => Number(b.discountPercent ?? 0) - Number(a.discountPercent ?? 0));
        break;
    }

    return result;
  }, [
    onlyDiscounted,
    onlyInStock,
    priceFilters,
    products,
    searchTerm,
    selectedBrands,
    selectedColors,
    selectedPrices,
    sortValue,
  ]);

  const toggleSelection = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((current) =>
      current.includes(productId) ? current.filter((item) => item !== productId) : [...current, productId],
    );
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedPrices([]);
    setSearchTerm("");
    setOnlyDiscounted(false);
    setOnlyInStock(false);
    setPage(1);
  };

  const activeFilterCount =
    selectedBrands.length +
    selectedColors.length +
    selectedPrices.length +
    (searchTerm.trim() ? 1 : 0) +
    (onlyDiscounted ? 1 : 0) +
    (onlyInStock ? 1 : 0);

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <section className={styles.section} aria-labelledby="product-one-title">
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="Product filters">
          <div className={styles.sidebarCard}>
            <div className={styles.filterHero}>
              <div className={styles.filterHeader}>
                <span className={styles.filterIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 6h16" />
                    <path d="M7 12h10" />
                    <path d="M10 18h4" />
                  </svg>
                </span>
                <div>
                  <p className={styles.filterEyebrow}>Smart refine</p>
                  <h2 className={styles.filterTitle}>Shop Filters</h2>
                </div>
              </div>

              <div className={styles.filterSummary}>
                <span className={styles.filterSummaryDot} />
                <span>{activeFilterCount} active filters</span>
              </div>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.filterBlockHead}>
                <h3 className={styles.filterBlockTitle}>Search</h3>
              </div>

              <div className={styles.searchBox}>
                <span className={styles.searchIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={searchTerm}
                  className={styles.searchInput}
                  placeholder="Search by name, category, brand..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.filterBlockHead}>
                <h3 className={styles.filterBlockTitle}>Quick filters</h3>
              </div>

              <div className={styles.quickToggleList}>
                <label className={styles.checkboxRow}>
                  <input
                    suppressHydrationWarning
                    type="checkbox"
                    checked={onlyDiscounted}
                    onChange={() => setOnlyDiscounted((v) => !v)}
                  />
                  <span className={styles.fakeCheckbox} aria-hidden="true" />
                  <span className={styles.checkboxLabel}>Only discounted items</span>
                </label>

                <label className={styles.checkboxRow}>
                  <input
                    suppressHydrationWarning
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={() => setOnlyInStock((v) => !v)}
                  />
                  <span className={styles.fakeCheckbox} aria-hidden="true" />
                  <span className={styles.checkboxLabel}>Only in stock</span>
                </label>
              </div>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.filterBlockHead}>
                <h3 className={styles.filterBlockTitle}>Pick color</h3>
              </div>

              <div className={styles.colorRow}>
                {colorFilters.map((color) => {
                  const active = selectedColors.includes(color.value);
                  return (
                    <button
                      suppressHydrationWarning
                      key={color.value}
                      type="button"
                      className={`${styles.colorSwatch} ${active ? styles.colorSwatchActive : ""}`}
                      style={{ backgroundColor: color.hex }}
                      aria-pressed={active}
                      aria-label={`Filter by ${color.label}`}
                      title={color.label}
                      onClick={() => toggleSelection(color.value, setSelectedColors)}
                    >
                      <span className={styles.colorSwatchInner} />
                    </button>
                  );
                })}
              </div>

              {!!selectedColors.length && (
                <div className={styles.selectedChipRow}>
                  {selectedColors.map((item) => {
                    const found = colorFilters.find((color) => color.value === item);
                    return (
                      <button
                        suppressHydrationWarning
                        key={item}
                        type="button"
                        className={styles.filterChip}
                        onClick={() => toggleSelection(item, setSelectedColors)}
                      >
                        {found?.label ?? item}
                        <span aria-hidden="true">×</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.filterBlockHead}>
                <h3 className={styles.filterBlockTitle}>Brand</h3>
              </div>

              <div className={styles.filterList}>
                {availableBrands.map((brand) => {
                  const checked = selectedBrands.includes(brand.value);
                  return (
                    <label key={brand.value} className={styles.checkboxRow}>
                      <input
                        suppressHydrationWarning
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelection(brand.value, setSelectedBrands)}
                      />
                      <span className={styles.fakeCheckbox} aria-hidden="true" />
                      <span className={styles.checkboxLabel}>{brand.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.filterBlockHead}>
                <h3 className={styles.filterBlockTitle}>Price range</h3>
              </div>

              <div className={styles.filterList}>
                {priceFilters.map((price) => {
                  const checked = selectedPrices.includes(price.value);
                  return (
                    <label key={price.value} className={styles.checkboxRow}>
                      <input
                        suppressHydrationWarning
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelection(price.value, setSelectedPrices)}
                      />
                      <span className={styles.fakeCheckbox} aria-hidden="true" />
                      <span className={styles.checkboxLabel}>{price.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button suppressHydrationWarning type="button" className={styles.resetButton} onClick={resetFilters}>
              Clear all filters
            </button>
          </div>
        </aside>

        <div className={styles.content}>
          <header className={styles.catalogToolbar}>
            <div className={styles.catalogToolbarMain}>
              <div className={styles.catalogMetaRow}>
                <div className={styles.metaPill}>
                  <span className={styles.metaPillLabel}>{title}</span>
                  <span>{loading ? "Loading..." : `${filteredProducts.length} items`}</span>
                </div>

                <div className={styles.metaPill}>
                  <span className={styles.metaPillLabel}>Page</span>
                  <span>
                    {page} / {totalPages}
                  </span>
                </div>

                <div className={styles.metaPill}>
                  <span className={styles.metaPillLabel}>Layout</span>
                  <span>{layout === "grid" ? "Grid" : "List"}</span>
                </div>

                <div className={styles.metaPill}>
                  <span className={styles.metaPillLabel}>Total</span>
                  <span>{totalItems}</span>
                </div>
              </div>
            </div>

            <div className={styles.catalogToolbarActions}>
              <label className={styles.sortWrap}>
                <select
                  suppressHydrationWarning
                  value={sortValue}
                  onChange={(e) => setSortValue(e.target.value as SortValue)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.layoutSwitch} aria-label="Layout switch">
                <button
                  suppressHydrationWarning
                  type="button"
                  className={`${styles.layoutButton} ${layout === "list" ? styles.layoutButtonActive : ""}`}
                  aria-pressed={layout === "list"}
                  onClick={() => setLayout("list")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M8 7h12" />
                    <path d="M8 12h12" />
                    <path d="M8 17h12" />
                    <path d="M4 7h.01" />
                    <path d="M4 12h.01" />
                    <path d="M4 17h.01" />
                  </svg>
                </button>

                <button
                  suppressHydrationWarning
                  type="button"
                  className={`${styles.layoutButton} ${layout === "grid" ? styles.layoutButtonActive : ""}`}
                  aria-pressed={layout === "grid"}
                  onClick={() => setLayout("grid")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="4" width="6" height="6" rx="1.2" />
                    <rect x="14" y="4" width="6" height="6" rx="1.2" />
                    <rect x="4" y="14" width="6" height="6" rx="1.2" />
                    <rect x="14" y="14" width="6" height="6" rx="1.2" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {loading ? (
            <div className={styles.emptyState} role="status" aria-live="polite">
              <div className={styles.emptyIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="M4.93 4.93l2.83 2.83" />
                  <path d="M16.24 16.24l2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="M4.93 19.07l2.83-2.83" />
                  <path d="M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <h2>Loading products...</h2>
              <p>Please wait while the latest catalog is being prepared.</p>
            </div>
          ) : errorText ? (
            <div className={styles.emptyState} role="alert">
              <div className={styles.emptyIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <h2>Unable to load products</h2>
              <p>{errorText}</p>
            </div>
          ) : (
            <>
              <div className={`${styles.grid} ${layout === "list" ? styles.gridList : ""}`}>
                {filteredProducts.length ? (
                  filteredProducts.map((product) => {
                    const isWished = wishlist.includes(product.id);
                    const priceValue = Number(product.price ?? 0);
                    const marketPriceValue =
                      typeof product.marketPrice === "number" ? Number(product.marketPrice) : undefined;
                    const priceText = formatCurrency(priceValue, locale, currency);
                    const originalPriceText =
                      typeof marketPriceValue === "number"
                        ? formatCurrency(marketPriceValue, locale, currency)
                        : undefined;
                    const badge = buildBadge(product);
                    const productHref = getProductHref(product);
                    const savingAmount = getDiscountAmount(product);
                    const savingText =
                      savingAmount > 0 ? `Save ${formatCurrency(savingAmount, locale, currency)}` : null;
                    const inStock = Number(product.productQty ?? 0) > 0;

                    return (
                      <article key={product.id} className={styles.card} itemScope itemType="https://schema.org/Product">
                        <div className={styles.cardMedia}>
                          <div className={styles.cardMediaTop}>
                            <div className={styles.cardBadgeGroup}>
                              {badge ? (
                                <span className={`${styles.badge} ${styles[`badge${badge.tone}`]}`}>{badge.text}</span>
                              ) : null}
                              {savingText ? <span className={styles.miniBadge}>{savingText}</span> : null}
                            </div>

                            <button
                              suppressHydrationWarning
                              type="button"
                              className={`${styles.wishlistButton} ${isWished ? styles.wishlistButtonActive : ""}`}
                              aria-label={
                                isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
                              }
                              onClick={() => toggleWishlist(product.id)}
                            >
                              <i className={`bi ${isWished ? "bi-heart-fill" : "bi-heart"}`} />
                            </button>
                          </div>

                          <Link className={styles.imageLink} href={productHref} aria-label={product.name}>
                            <div className={styles.imageWrap}>
                              <Image
                                src={getProductImage(product)}
                                alt={product.name}
                                fill
                                sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw"
                                className={styles.image}
                              />
                            </div>
                          </Link>

                          <div className={styles.mediaOverlay}>
                            {product.category?.name ? (
                              <span className={styles.overlayPill}>{product.category.name}</span>
                            ) : null}
                            {product.brand?.name ? (
                              <span className={styles.overlayPill}>{product.brand.name}</span>
                            ) : null}
                          </div>
                        </div>

                        <div className={styles.cardBody}>
                          <div className={styles.cardHeader}>
                            <div className={styles.cardMetaCopy}>
                              <p className={styles.cardKicker}>{product.category?.name || "Featured product"}</p>
                              <h2 className={styles.productName} itemProp="name">
                                <Link href={productHref}>{product.name}</Link>
                              </h2>
                            </div>

                            <span
                              className={`${styles.stockPill} ${inStock ? styles.stockPillIn : styles.stockPillOut}`}
                            >
                              <i className={`bi ${inStock ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
                              <span>{product.stockText || (inStock ? "In stock" : "Out of stock")}</span>
                            </span>
                          </div>

                          <div className={styles.ratingRow} aria-label="Rated 5 out of 5">
                            <div className={styles.stars}>
                              <i className="bi bi-star-fill" />
                              <i className="bi bi-star-fill" />
                              <i className="bi bi-star-fill" />
                              <i className="bi bi-star-fill" />
                              <i className="bi bi-star-half" />
                            </div>
                            <span className={styles.reviewCount}>
                              {typeof product.productQty === "number" ? `${product.productQty} sold` : "Popular item"}
                            </span>
                          </div>

                          <div
                            className={styles.pricePanel}
                            itemProp="offers"
                            itemScope
                            itemType="https://schema.org/Offer"
                          >
                            <meta itemProp="priceCurrency" content={currency} />
                            <meta
                              itemProp="availability"
                              content={inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"}
                            />

                            <div className={styles.priceRow}>
                              <div className={styles.priceWrap}>
                                <span className={styles.price} itemProp="price">
                                  {priceText}
                                </span>
                                {originalPriceText ? (
                                  <span className={styles.originalPrice}>{originalPriceText}</span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className={styles.cardFooterMeta}>
                            <span className={styles.footerMetaItem}>
                              <i className="bi bi-truck" />
                              <span>Fast delivery</span>
                            </span>
                            <span className={styles.footerMetaItem}>
                              <i className="bi bi-arrow-repeat" />
                              <span>Easy return</span>
                            </span>
                          </div>

                          <div className={styles.cardActions}>
                            <button suppressHydrationWarning type="button" className={styles.cartButton}>
                              <span className={styles.cartIcon} aria-hidden="true">
                                <i className="bi bi-bag-plus" />
                              </span>
                              <span>Add to cart</span>
                            </button>

                            <Link href={productHref} className={styles.viewButton}>
                              <i className="bi bi-arrow-right" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className={styles.emptyState} role="status">
                    <div className={styles.emptyIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 6h18" />
                        <path d="M7 12h10" />
                        <path d="M10 18h4" />
                      </svg>
                    </div>
                    <h2>No matching products</h2>
                    <p>{emptyText}</p>
                    <button
                      suppressHydrationWarning
                      type="button"
                      className={styles.resetButton}
                      onClick={resetFilters}
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.paginationWrap} aria-label="Product pagination">
                <div className={styles.pagination}>
                  <button
                    suppressHydrationWarning
                    type="button"
                    className={`${styles.paginationNav} ${styles.paginationArrow}`}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={!canGoPrev}
                    aria-label="Previous page"
                  >
                    <i className="bi bi-chevron-left" />
                  </button>

                  <div className={styles.paginationNumbers}>
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .filter((pageNumber) => {
                        if (totalPages <= 9) return true;
                        return (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          Math.abs(pageNumber - page) <= 1 ||
                          (page <= 3 && pageNumber <= 5) ||
                          (page >= totalPages - 2 && pageNumber >= totalPages - 4)
                        );
                      })
                      .map((pageNumber, index, arr) => {
                        const prev = arr[index - 1];
                        const showDots = prev && pageNumber - prev > 1;

                        return (
                          <React.Fragment key={pageNumber}>
                            {showDots ? <span className={styles.paginationDots}>...</span> : null}

                            <button
                              suppressHydrationWarning
                              type="button"
                              className={`${styles.paginationPage} ${
                                page === pageNumber ? styles.paginationPageActive : ""
                              }`}
                              onClick={() => setPage(pageNumber)}
                              aria-current={page === pageNumber ? "page" : undefined}
                            >
                              {pageNumber}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    suppressHydrationWarning
                    type="button"
                    className={`${styles.paginationNav} ${styles.paginationArrow}`}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={!canGoNext}
                    aria-label="Next page"
                  >
                    <i className="bi bi-chevron-right" />
                  </button>

                  <div className={styles.paginationGoto}>
                    <span className={styles.paginationGotoLabel}>Go to page</span>

                    <input
                      suppressHydrationWarning
                      type="number"
                      min={1}
                      max={totalPages}
                      className={styles.paginationInput}
                      value={page}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!Number.isNaN(value) && value >= 1 && value <= totalPages) {
                          setPage(value);
                        }
                      }}
                    />

                    <button
                      suppressHydrationWarning
                      type="button"
                      className={styles.paginationGoButton}
                      onClick={() => setPage((current) => Math.min(Math.max(1, current), totalPages))}
                    >
                      Go
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <section className={styles.seoSection} aria-labelledby="catalog-seo-title">
        <div className={styles.seoGrid}>
          <div className={styles.seoMain}>
            <div className={styles.seoBadge}>SEO Content</div>

            <h2 id="catalog-seo-title" className={styles.seoTitle}>
              Shop with trusted quality, transparent pricing, and fast delivery
            </h2>

            <div className={styles.seoText}>
              <p>
                Explore our curated collection of designed for modern shoppers who care about quality, value, and
                convenience. From bestselling items to newly added products, this catalog helps you compare options
                quickly with clear pricing, stock availability, and trusted product information.
              </p>

              <p>
                Whether you are looking for premium essentials, daily-use products, or standout featured items, our
                collection is updated regularly to surface relevant choices across trusted brands and categories. Use
                filters to narrow your search by brand, price, and product attributes so you can find the right fit
                faster.
              </p>

              <p>
                We focus on a cleaner shopping experience with transparent product listings, reliable delivery, and
                simple navigation. Browse confidently, compare products with ease, and discover items that match both
                your budget and your preferences.
              </p>
            </div>
          </div>

          <aside className={styles.seoSidebar}>
            <div className={styles.seoCard}>
              <h3 className={styles.seoCardTitle}>Why shoppers choose us</h3>

              <div className={styles.seoFeatureList}>
                <div className={styles.seoFeatureItem}>
                  <i className="bi bi-patch-check" />
                  <div>
                    <strong>Curated quality</strong>
                    <span>Carefully selected products from trusted brands.</span>
                  </div>
                </div>

                <div className={styles.seoFeatureItem}>
                  <i className="bi bi-truck" />
                  <div>
                    <strong>Fast delivery</strong>
                    <span>Quick fulfillment and reliable shipping updates.</span>
                  </div>
                </div>

                <div className={styles.seoFeatureItem}>
                  <i className="bi bi-arrow-repeat" />
                  <div>
                    <strong>Easy returns</strong>
                    <span>Smooth return flow for eligible products.</span>
                  </div>
                </div>

                <div className={styles.seoFeatureItem}>
                  <i className="bi bi-shield-lock" />
                  <div>
                    <strong>Secure checkout</strong>
                    <span>Safer payment experience and protected transactions.</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className={styles.seoLinksBlock}>
          <div className={styles.seoLinkGroup}>
            <h3 className={styles.seoSubTitle}>Popular related searches</h3>
            <div className={styles.seoChips}>
              <Link href="/products?sort=featured" className={styles.seoChip}>
                Best sellers
              </Link>
              <Link href="/products?sort=price-asc" className={styles.seoChip}>
                Affordable picks
              </Link>
              <Link href="/products?sort=price-desc" className={styles.seoChip}>
                Premium products
              </Link>
              <Link href="/products?tag=new" className={styles.seoChip}>
                New arrivals
              </Link>
            </div>
          </div>

          <div className={styles.seoLinkGroup}>
            <h3 className={styles.seoSubTitle}>Shop by category</h3>
            <div className={styles.seoChips}>
              <Link href="/category/skincare" className={styles.seoChip}>
                Skincare
              </Link>
              <Link href="/category/supplements" className={styles.seoChip}>
                Supplements
              </Link>
              <Link href="/category/wellness" className={styles.seoChip}>
                Wellness
              </Link>
              <Link href="/category/featured" className={styles.seoChip}>
                Featured products
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.faqBlock}>
          <h3 className={styles.seoSubTitle}>Frequently asked questions</h3>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>How do I choose the right product?</summary>
              <p>
                Start by filtering products by price, brand, and availability. Compare product details, pricing, and
                category information to find the most suitable option for your needs.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>Are prices and stock updated regularly?</summary>
              <p>
                Yes. Product pricing, stock status, and catalog visibility should be updated regularly so shoppers can
                browse with more accurate information.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>Can I browse products by brand or category?</summary>
              <p>
                Yes. Use the filter panel to narrow products by brand, price, and other available product attributes, or
                explore related category links below the listing.
              </p>
            </details>
          </div>
        </div>
      </section>

      {!mounted ? null : <span className={styles.srOnly}>Interactive product catalog loaded.</span>}
    </section>
  );
}

export const SHOP_PRODUCT_ONE: RegItem = {
  kind: "ProductOne",
  label: "Product One",
  defaults: {
    title: "Product List",
    apiUrl: "/api/v1/products/list",
    currency: "USD",
    locale: "en-US",
    emptyText: "No products match your current filters.",
    pageSize: 12,
    defaultSort: "price-asc",
    brandFilters: JSON.stringify(DEFAULT_BRANDS, null, 2),
    priceFilters: JSON.stringify(DEFAULT_PRICES, null, 2),
    colorFilters: JSON.stringify(DEFAULT_COLORS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "apiUrl", label: "API URL", kind: "text" },
    { key: "currency", label: "Currency", kind: "text" },
    { key: "locale", label: "Locale", kind: "text" },
    { key: "emptyText", label: "Empty Text", kind: "text" },
    { key: "pageSize", label: "Page Size", kind: "number" },
    { key: "defaultSort", label: "Default Sort", kind: "text" },
    { key: "brandFilters", label: "Brand Filters (JSON)", kind: "textarea", rows: 10 },
    { key: "priceFilters", label: "Price Filters (JSON)", kind: "textarea", rows: 10 },
    { key: "colorFilters", label: "Color Filters (JSON)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const p = props as Record<string, any>;

    return (
      <div aria-label="Product One">
        <ProductOne
          title={p.title || "Product List"}
          apiUrl={p.apiUrl || "/api/v1/products/list"}
          currency={p.currency || "USD"}
          locale={p.locale || "en-US"}
          emptyText={p.emptyText || "No products match your current filters."}
          pageSize={Number(p.pageSize) > 0 ? Number(p.pageSize) : 12}
          defaultSort={
            p.defaultSort === "featured" ||
            p.defaultSort === "price-asc" ||
            p.defaultSort === "price-desc" ||
            p.defaultSort === "name-asc"
              ? p.defaultSort
              : "price-asc"
          }
          brandFilters={parseBrandFilters(p.brandFilters) ?? DEFAULT_BRANDS}
          priceFilters={parsePriceFilters(p.priceFilters) ?? DEFAULT_PRICES}
          colorFilters={parseColorFilters(p.colorFilters) ?? DEFAULT_COLORS}
        />
      </div>
    );
  },
};

export default ProductOne;

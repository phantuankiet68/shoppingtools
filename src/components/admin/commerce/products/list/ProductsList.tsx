"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "@/styles/admin/commerce/products/list/productsList.module.css";
import type { ApiProduct, Filters, SortKey } from "@/components/admin/commerce/products/client/AdminProductsClient";

type ApiCategory = {
  id: string;
  name: string;
  isActive: boolean;
  count?: number;
};

type SiteOption = {
  id: string;
  name?: string | null;
};

type ApiError = {
  error?: string;
};

type ProductImage = {
  id?: string;
  url?: string;
  sort?: number;
  isCover?: boolean;
};

type ProductCategory = {
  id: string;
  name: string;
};

type ProductLike = ApiProduct & {
  status?: string;
  isActive?: boolean;
  priceCents?: number;
  stock?: number;
  sku?: string;
  barcode?: string | number | null;
  images?: ProductImage[];
  category?: {
    id?: string;
    name?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

type NormalizedProduct = ApiProduct & {
  isActive: boolean;
  priceCents: number;
  stock: number;
  images: ProductImage[];
  category: ProductCategory | null;
  statusLabel: string;
  sku?: string;
  barcode?: string | number | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

function moneyFromCents(cents: number) {
  const n = (cents ?? 0) / 100;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => "");
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

function normalizeStatus(rawStatus?: string, rawIsActive?: boolean) {
  if (typeof rawIsActive === "boolean") {
    return {
      isActive: rawIsActive,
      label: rawIsActive ? "Active" : "Inactive",
      tone: rawIsActive ? "active" : "inactive",
    };
  }

  const status = String(rawStatus ?? "")
    .trim()
    .toUpperCase();

  switch (status) {
    case "ACTIVE":
      return { isActive: true, label: "Active", tone: "active" };
    case "DRAFT":
      return { isActive: false, label: "Draft", tone: "draft" };
    case "INACTIVE":
      return { isActive: false, label: "Inactive", tone: "inactive" };
    case "ARCHIVED":
      return { isActive: false, label: "Archived", tone: "archived" };
    default:
      return { isActive: false, label: status || "Inactive", tone: "inactive" };
  }
}

function normalizeCategory(category: ProductLike["category"]): ProductCategory | null {
  if (!category) return null;

  const id = String(category.id ?? "").trim();
  const name = String(category.name ?? "").trim();

  if (!id || !name) return null;
  return { id, name };
}

function normalizeProduct(p: ApiProduct): NormalizedProduct {
  const product = p as ProductLike;
  const statusInfo = normalizeStatus(product.status, product.isActive);

  return {
    ...p,
    status: product.status,
    isActive: statusInfo.isActive,
    statusLabel: statusInfo.label,
    priceCents: Number(product.priceCents ?? 0),
    stock: Number(product.stock ?? 0),
    sku: product.sku,
    barcode: product.barcode,
    images: Array.isArray(product.images) ? product.images : [],
    category: normalizeCategory(product.category),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function getThumb(product: NormalizedProduct) {
  const images = Array.isArray(product.images) ? product.images : [];
  const cover = images.find((img) => img?.isCover && String(img?.url ?? "").trim());
  const first = images.find((img) => String(img?.url ?? "").trim());
  return String(cover?.url ?? first?.url ?? "").trim();
}

function getStatusTone(product: NormalizedProduct) {
  const s = String(product.status ?? "").toUpperCase();
  if (s === "ACTIVE") return "active";
  if (s === "DRAFT") return "draft";
  if (s === "ARCHIVED") return "archived";
  return product.isActive ? "active" : "inactive";
}

function formatDate(date?: string) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function relativeDate(date?: string) {
  if (!date) return "Unknown";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown";

  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;

  return formatDate(date);
}

function matchesAdvancedSearch(product: NormalizedProduct, query: string) {
  const q = String(query ?? "")
    .trim()
    .toLowerCase();
  if (!q) return true;

  const tokens = q.split(/\s+/).filter(Boolean);

  return tokens.every((token) => {
    if (token.startsWith("sku:")) {
      return String(product.sku ?? "")
        .toLowerCase()
        .includes(token.replace("sku:", ""));
    }

    if (token.startsWith("barcode:")) {
      return String(product.barcode ?? "")
        .toLowerCase()
        .includes(token.replace("barcode:", ""));
    }

    if (token.startsWith("cat:")) {
      return String(product.category?.name ?? "")
        .toLowerCase()
        .includes(token.replace("cat:", ""));
    }

    if (token.startsWith("name:")) {
      return String(product.name ?? "")
        .toLowerCase()
        .includes(token.replace("name:", ""));
    }

    if (token === "active") return product.isActive;
    if (token === "inactive") return !product.isActive;
    if (token === "draft") return String(product.status ?? "").toUpperCase() === "DRAFT";
    if (token === "outofstock") return (product.stock ?? 0) <= 0;
    if (token === "lowstock") return (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5;
    if (token === "nocategory") return !product.category?.name;

    const haystack = [
      String(product.name ?? ""),
      String(product.sku ?? ""),
      String(product.barcode ?? ""),
      String(product.category?.name ?? ""),
      String(product.statusLabel ?? ""),
      String(product.stock ?? ""),
      moneyFromCents(product.priceCents),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(token);
  });
}

function matchesStatus(product: NormalizedProduct, activeFilter: Filters["active"]) {
  if (activeFilter === "all") return true;
  if (activeFilter === "active") return product.isActive;
  return !product.isActive;
}

function matchesCategory(product: NormalizedProduct, categoryIds?: string[]) {
  if (!categoryIds || categoryIds.length === 0) return true;
  return categoryIds.includes(String(product.category?.id ?? ""));
}

function matchesPrice(product: NormalizedProduct, priceMin?: string, priceMax?: string) {
  const price = Number(product.priceCents ?? 0) / 100;

  const min = priceMin === "" || priceMin == null ? null : Number(priceMin);
  const max = priceMax === "" || priceMax == null ? null : Number(priceMax);

  const validMin = min == null || Number.isNaN(min) ? null : min;
  const validMax = max == null || Number.isNaN(max) ? null : max;

  if (validMin != null && price < validMin) return false;
  if (validMax != null && price > validMax) return false;

  return true;
}

function sortProducts(items: NormalizedProduct[], sort: SortKey) {
  const arr = [...items];

  switch (sort) {
    case "Oldest":
      arr.sort((a, b) => {
        const aTime = new Date(String(a.createdAt ?? a.updatedAt ?? 0)).getTime();
        const bTime = new Date(String(b.createdAt ?? b.updatedAt ?? 0)).getTime();
        return aTime - bTime;
      });
      break;
    case "NameAsc":
      arr.sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
      break;
    case "NameDesc":
      arr.sort((a, b) => String(b.name ?? "").localeCompare(String(a.name ?? "")));
      break;
    case "CategoryAsc":
      arr.sort((a, b) =>
        String(a.category?.name ?? "No category").localeCompare(String(b.category?.name ?? "No category")),
      );
      break;
    case "CategoryDesc":
      arr.sort((a, b) =>
        String(b.category?.name ?? "No category").localeCompare(String(a.category?.name ?? "No category")),
      );
      break;
    case "PriceAsc":
      arr.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "PriceDesc":
      arr.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "StockAsc":
      arr.sort((a, b) => a.stock - b.stock);
      break;
    case "StockDesc":
      arr.sort((a, b) => b.stock - a.stock);
      break;
    case "StatusAsc":
      arr.sort((a, b) => a.statusLabel.localeCompare(b.statusLabel));
      break;
    case "StatusDesc":
      arr.sort((a, b) => b.statusLabel.localeCompare(a.statusLabel));
      break;
    case "Newest":
    default:
      arr.sort((a, b) => {
        const aTime = new Date(String(a.updatedAt ?? a.createdAt ?? 0)).getTime();
        const bTime = new Date(String(b.updatedAt ?? b.createdAt ?? 0)).getTime();
        return bTime - aTime;
      });
      break;
  }

  return arr;
}

export default function ProductsList(props: {
  title: string;
  subtitle: string;
  items: ApiProduct[];
  categories: ApiCategory[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  loading: boolean;
  busy: boolean;
  error: string;
  onRefresh: () => void;
  onApply: () => void;
  onEdit: (id: string) => void;
  setBusy: (v: boolean) => void;
  afterMutate: () => void;
  sites: SiteOption[];
  sitesLoading: boolean;
  sitesErr?: string | null;
  selectedSiteId: string;
  onChangeSite: (siteId: string) => void;
  tab: "list" | "form";
  editingId: string | null;
  onOpenList: () => void;
  onOpenForm: () => void;
}) {
  const {
    items,
    categories,
    filters,
    setFilters,
    loading,
    busy,
    error,
    onEdit,
    sites,
    sitesLoading,
    sitesErr,
    selectedSiteId,
    onChangeSite,
    editingId,
    onOpenList,
    onOpenForm,
  } = props;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const blurTimer = useRef<number | null>(null);

  const normalizedItems = useMemo(() => (items ?? []).map(normalizeProduct), [items]);

  const filtered = useMemo(() => {
    const result = normalizedItems.filter((product) => {
      return (
        matchesAdvancedSearch(product, filters.q) &&
        matchesStatus(product, filters.active) &&
        matchesCategory(product, filters.categoryIds) &&
        matchesPrice(product, filters.priceMin, filters.priceMax)
      );
    });

    return sortProducts(result, filters.sort ?? "Newest");
  }, [normalizedItems, filters]);

  const suggestions = useMemo(() => {
    const q = String(filters.q ?? "").trim();
    if (!q) return [];
    return normalizedItems.filter((p) => matchesAdvancedSearch(p, q)).slice(0, 8);
  }, [normalizedItems, filters.q]);

  const checkedCount = filtered.reduce((acc, p) => acc + (selected[p.id] ? 1 : 0), 0);
  const allChecked = filtered.length > 0 && filtered.every((p) => selected[p.id]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((p) => p.isActive).length;
    const draft = filtered.filter((p) => String(p.status ?? "").toUpperCase() === "DRAFT").length;
    const outOfStock = filtered.filter((p) => (p.stock ?? 0) <= 0).length;
    const lowStock = filtered.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length;
    const categoriesInUse = new Set(filtered.map((p) => p.category?.id).filter(Boolean)).size;
    const uncategorized = filtered.filter((p) => !p.category?.id).length;
    const totalPrice = filtered.reduce((sum, p) => sum + Number(p.priceCents ?? 0), 0);
    const avgPrice = filtered.length > 0 ? Math.round(totalPrice / filtered.length) : 0;

    return {
      total,
      active,
      draft,
      outOfStock,
      lowStock,
      categoriesInUse,
      uncategorized,
      avgPrice,
    };
  }, [filtered]);

  async function softDeleteOne(product: NormalizedProduct) {
    if (!confirm(`Deactivate “${product.name}”?`)) return;

    props.setBusy(true);

    try {
      const res = await fetch(`/api/admin/commerce/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      const json = await safeJson<ApiError>(res);
      if (!res.ok) throw new Error(json?.error || "Delete failed");

      props.afterMutate();
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error("Delete failed");
      alert(err.message || "Delete failed");
    } finally {
      props.setBusy(false);
    }
  }

  function resetFilters() {
    setFilters((prev) => ({
      ...prev,
      q: "",
      categoryIds: [],
      priceMin: "",
      priceMax: "",
      active: "all",
      sort: "Newest",
    }));
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.toolbarTop}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon} aria-hidden>
                ⌕
              </span>

              <input
                className={styles.searchInput}
                value={filters.q}
                placeholder="Search name, SKU, barcode... Tips: sku:TS-01 cat:shoe active outofstock lowstock nocategory"
                onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
                onFocus={() => {
                  if (blurTimer.current) window.clearTimeout(blurTimer.current);
                  setSearchOpen(true);
                }}
                onBlur={() => {
                  blurTimer.current = window.setTimeout(() => setSearchOpen(false), 140);
                }}
              />

              {searchOpen && String(filters.q ?? "").trim() && suggestions.length > 0 ? (
                <div className={styles.suggest} role="listbox" aria-label="Search suggestions">
                  <div className={styles.suggestHead}>
                    <span className={styles.suggestTitle}>Quick results</span>
                    <span className={styles.suggestHint}>{suggestions.length} items</span>
                  </div>

                  <div className={styles.suggestList}>
                    {suggestions.map((product) => {
                      const thumb = getThumb(product);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          className={styles.suggestItem}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFilters((s) => ({ ...s, q: product.name ?? s.q }));
                            setSearchOpen(false);
                          }}
                        >
                          <span className={styles.suggestThumb}>
                            {thumb ? (
                              <Image
                                unoptimized
                                src={thumb}
                                alt=""
                                width={40}
                                height={40}
                                className={styles.suggestImg}
                              />
                            ) : (
                              <span className={styles.suggestEmpty} />
                            )}
                          </span>

                          <span className={styles.suggestMeta}>
                            <span className={styles.suggestName}>{product.name}</span>
                            <span className={styles.suggestSub}>
                              {product.category?.name ?? "No category"} • {moneyFromCents(product.priceCents)}
                            </span>
                          </span>

                          <span className={`${styles.statusDot} ${styles[`statusDot_${getStatusTone(product)}`]}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              className={styles.filterToggle}
              type="button"
              aria-label="Advanced filters"
              onClick={() => setFiltersOpen((v) => !v)}
              disabled={loading || busy}
              aria-expanded={filtersOpen}
            >
              Filters
            </button>
          </div>

          <div className={styles.toolbarRight}>
            <select
              className={styles.select}
              value={filters.sort}
              onChange={(e) => setFilters((s) => ({ ...s, sort: e.target.value as Filters["sort"] }))}
              disabled={busy}
            >
              <option value="Newest">Newest first</option>
              <option value="Oldest">Oldest first</option>
              <option value="NameAsc">Name A → Z</option>
              <option value="NameDesc">Name Z → A</option>
              <option value="CategoryAsc">Category A → Z</option>
              <option value="CategoryDesc">Category Z → A</option>
              <option value="PriceAsc">Price Low → High</option>
              <option value="PriceDesc">Price High → Low</option>
              <option value="StockAsc">Stock Low → High</option>
              <option value="StockDesc">Stock High → Low</option>
              <option value="StatusAsc">Status A → Z</option>
              <option value="StatusDesc">Status Z → A</option>
            </select>

            <button className={styles.ghostBtn} type="button" onClick={resetFilters} disabled={busy}>
              Reset
            </button>

            <label className={styles.checkAllCard}>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => {
                  const next: Record<string, boolean> = {};
                  filtered.forEach((p) => {
                    next[p.id] = e.target.checked;
                  });
                  setSelected(next);
                }}
              />
              <span>{checkedCount ? `${checkedCount} selected` : "Select all"}</span>
            </label>
          </div>
        </div>

        <div className={styles.pageHeaderRight}>
          <div className={styles.siteSelectorWrap}>
            <div className={styles.siteSelectorGroup}>
              <label className={styles.siteLabel} htmlFor="site-selector">
                Store
              </label>

              <select
                id="site-selector"
                value={selectedSiteId}
                onChange={(e) => onChangeSite(e.target.value)}
                disabled={sitesLoading}
                className={styles.selectSite}
              >
                <option value="">{sitesLoading ? "Loading sites..." : "Select site"}</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? s.id} ({s.id})
                  </option>
                ))}
              </select>

              {sitesErr ? <span className={styles.siteError}>{sitesErr}</span> : null}
            </div>
          </div>

          <div className={styles.tabs}>
            <button className={`${styles.tabBtn} ${styles.tabActive}`} type="button" onClick={onOpenList}>
              Product list
            </button>

            <button
              className={styles.tabBtn}
              type="button"
              onClick={onOpenForm}
              disabled={!selectedSiteId}
              title={!selectedSiteId ? "Please select site first" : undefined}
            >
              {editingId ? "Edit product" : "Create product"}
            </button>
          </div>
        </div>
      </header>
      <div className={styles.toolbarCard}>
        {filtersOpen ? (
          <div className={styles.filtersPanel}>
            <div className={styles.filtersPanelHeader}>
              <div className={styles.filtersPanelTitleWrap}>
                <h3 className={styles.filtersPanelTitle}>Advanced filters</h3>
              </div>

              <div className={styles.filtersQuickRow}>
                <button
                  type="button"
                  className={styles.quickFilterChip}
                  onClick={() => setFilters((s) => ({ ...s, active: "active" }))}
                  disabled={busy}
                >
                  Active
                </button>

                <button
                  type="button"
                  className={styles.quickFilterChip}
                  onClick={() => setFilters((s) => ({ ...s, q: `${s.q} draft`.trim() }))}
                  disabled={busy}
                >
                  Draft
                </button>

                <button
                  type="button"
                  className={styles.quickFilterChip}
                  onClick={() => setFilters((s) => ({ ...s, q: `${s.q} outofstock`.trim() }))}
                  disabled={busy}
                >
                  Out of stock
                </button>

                <button
                  type="button"
                  className={styles.quickFilterChip}
                  onClick={() => setFilters((s) => ({ ...s, q: `${s.q} lowstock`.trim() }))}
                  disabled={busy}
                >
                  Low stock
                </button>

                <button
                  type="button"
                  className={styles.quickFilterChip}
                  onClick={() => setFilters((s) => ({ ...s, q: `${s.q} nocategory`.trim() }))}
                  disabled={busy}
                >
                  No category
                </button>
              </div>
            </div>

            <div className={styles.filterGrid}>
              <div className={styles.fieldCard}>
                <label className={styles.fieldLabel}>Status</label>
                <select
                  className={styles.select}
                  value={filters.active}
                  onChange={(e) => setFilters((s) => ({ ...s, active: e.target.value as Filters["active"] }))}
                  disabled={busy}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive / Draft</option>
                </select>
              </div>

              <div className={styles.fieldCard}>
                <label className={styles.fieldLabel}>Category</label>
                <select
                  className={styles.select}
                  value={filters.categoryIds?.[0] ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters((s) => ({ ...s, categoryIds: value ? [value] : [] }));
                  }}
                  disabled={busy}
                >
                  <option value="">All categories</option>
                  {categories
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.fieldCard}>
                <label className={styles.fieldLabel}>Min price</label>
                <input
                  className={styles.input}
                  value={filters.priceMin}
                  placeholder="0"
                  onChange={(e) => setFilters((s) => ({ ...s, priceMin: e.target.value }))}
                  inputMode="decimal"
                  disabled={busy}
                />
              </div>

              <div className={styles.fieldCard}>
                <label className={styles.fieldLabel}>Max price</label>
                <input
                  className={styles.input}
                  value={filters.priceMax}
                  placeholder="9999"
                  onChange={(e) => setFilters((s) => ({ ...s, priceMax: e.target.value }))}
                  inputMode="decimal"
                  disabled={busy}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.hero}>
        <div className={styles.heroStats}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>📦</span>
              <span className={styles.metricLabel}>Total</span>
            </div>

            <div className={styles.metricBody}>
              <strong className={styles.metricValue}>{stats.total}</strong>
              <span className={styles.metricHint}>Products shown</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>🟢</span>
              <span className={styles.metricLabel}>Active</span>
            </div>

            <div className={styles.metricBody}>
              <strong className={styles.metricValue}>{stats.active}</strong>
              <span className={styles.metricHint}>Ready to sell</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>📝</span>
              <span className={styles.metricLabel}>Draft</span>
            </div>

            <div className={styles.metricBody}>
              <strong className={styles.metricValue}>{stats.draft}</strong>
              <span className={styles.metricHint}>Pending review</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>📦</span>
              <span className={styles.metricLabel}>Out of stock</span>
            </div>

            <div className={styles.metricBody}>
              <strong className={styles.metricValue}>{stats.outOfStock}</strong>
              <span className={styles.metricHint}>Need replenishment</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>⚠️</span>
              <span className={styles.metricLabel}>Low stock</span>
            </div>

            <div className={styles.metricBody}>
              <strong className={styles.metricValue}>{stats.lowStock}</strong>
              <span className={styles.metricHint}>≤ 5 items left</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>🗂️</span>
              <span className={styles.metricLabel}>Categories</span>
            </div>

            <div className={styles.metricBody}>
              <strong className={styles.metricValue}>{stats.categoriesInUse}</strong>
              <span className={styles.metricHint}>{stats.uncategorized} uncategorized</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>💲</span>
              <span className={styles.metricLabel}>Price</span>
            </div>

            <div className={styles.metricBody}>
              <strong className={styles.metricValue}>{moneyFromCents(stats.avgPrice)}</strong>
              <span className={styles.metricHint}>Current filtered set</span>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className={styles.alertError} role="alert">
          <span className={styles.alertText}>{error}</span>
        </div>
      ) : null}

      <section className={styles.productsCardSection} aria-label="Products grid">
        {filtered.length === 0 && !loading ? <div className={styles.emptyProductState}>No products found</div> : null}

        <div className={styles.productGrid}>
          {filtered.map((product) => {
            const thumb = getThumb(product);
            const tone = getStatusTone(product);

            return (
              <article key={product.id} className={styles.productCard}>
                <div className={styles.productCardTop}>
                  <label className={styles.productCheck}>
                    <input
                      type="checkbox"
                      checked={!!selected[product.id]}
                      onChange={(e) =>
                        setSelected((s) => ({
                          ...s,
                          [product.id]: e.target.checked,
                        }))
                      }
                    />
                  </label>

                  <span className={`${styles.statusBadge} ${styles[`statusBadge_${tone}`]}`}>
                    {product.statusLabel}
                  </span>
                </div>

                <div className={styles.productImageWrap}>
                  {thumb ? (
                    <Image
                      unoptimized
                      src={thumb}
                      alt={product.name}
                      width={320}
                      height={220}
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={styles.productImageEmpty}>No image</div>
                  )}
                </div>

                <div className={styles.productCardBody}>
                  <div className={styles.productCardMain}>
                    <div className={styles.productCardTitleRow}>
                      <h3 className={styles.productCardName}>{product.name}</h3>

                      {product.category?.name ? (
                        <span className={styles.categoryTag}>{product.category.name}</span>
                      ) : (
                        <span className={styles.categoryEmpty}>No category</span>
                      )}
                    </div>

                    <p className={styles.productCardDesc}>
                      {product.description?.trim() ? product.description : "No description available"}
                    </p>
                  </div>

                  <div className={styles.productMetaGroup}>
                    {product.sku ? <span className={styles.metaChip}>SKU: {product.sku}</span> : null}
                    {product.barcode ? (
                      <span className={styles.metaChip}>Barcode: {String(product.barcode)}</span>
                    ) : null}
                  </div>
                </div>

                <div className={styles.productCardFooter}>
                  <button className={styles.actionBtn} type="button" onClick={() => onEdit(product.id)} disabled={busy}>
                    <i className="bi bi-pen-fill"></i> Edit product
                  </button>

                  <button
                    className={styles.moreBtn}
                    type="button"
                    onClick={() => void softDeleteOne(product)}
                    disabled={busy}
                    title="Deactivate"
                  >
                    ⋯
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

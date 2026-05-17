"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "@/styles/admin/products/list/productsList.module.css";
import { useModal } from "@/components/admin/shared/common/modal";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import type { ApiProduct, Filters, SortKey } from "@/components/admin/products/client/AdminProductsClient";

type ApiCategory = {
  id: string;
  name: string;
  isActive?: boolean;
};

type ApiBrand = {
  id: string;
  name: string;
  isActive?: boolean;
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
  isCover?: boolean;
};

type ProductCategory = {
  id: string;
  name: string;
};

type ProductBrand = {
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

  brand?: {
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
  brand: ProductBrand | null;
  statusLabel: string;
  sku?: string;
  barcode?: string | number | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

function moneyFromCents(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function moneyFromMaket(value?: string | number | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("vi-VN").format(amount);
}

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => "");

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

function normalizeStatus(rawStatus?: string, rawIsActive?: boolean, t?: (key: string) => string) {
  const activeLabel = t?.("products.active") || "Active";
  const inactiveLabel = t?.("products.inactive") || "Inactive";
  const draftLabel = t?.("products.draft") || "Draft";
  const archivedLabel = t?.("products.archived") || "Archived";

  if (typeof rawIsActive === "boolean") {
    return {
      isActive: rawIsActive,
      label: rawIsActive ? activeLabel : inactiveLabel,
      tone: rawIsActive ? "active" : "inactive",
    };
  }

  const status = String(rawStatus ?? "")
    .trim()
    .toUpperCase();

  switch (status) {
    case "ACTIVE":
      return {
        isActive: true,
        label: activeLabel,
        tone: "active",
      };

    case "DRAFT":
      return {
        isActive: false,
        label: draftLabel,
        tone: "draft",
      };

    case "INACTIVE":
      return {
        isActive: false,
        label: inactiveLabel,
        tone: "inactive",
      };

    case "ARCHIVED":
      return {
        isActive: false,
        label: archivedLabel,
        tone: "archived",
      };

    default:
      return {
        isActive: false,
        label: status || inactiveLabel,
        tone: "inactive",
      };
  }
}

function normalizeCategory(category: ProductLike["category"]): ProductCategory | null {
  if (!category) {
    return null;
  }

  const id = String(category.id ?? "").trim();
  const name = String(category.name ?? "").trim();

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
  };
}

function normalizeBrand(brand: ProductLike["brand"]): ProductBrand | null {
  if (!brand) {
    return null;
  }

  const id = String(brand.id ?? "").trim();
  const name = String(brand.name ?? "").trim();

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
  };
}

function normalizeProduct(p: ApiProduct): NormalizedProduct {
  const product = p as ProductLike;

  const statusInfo = normalizeStatus(product.status, product.isActive);

  return {
    ...p,
    status: product.status,
    isActive: statusInfo.isActive,
    statusLabel: statusInfo.label,
    priceCents: Number(product.price ?? product.priceCents ?? 0),
    stock: Number(product.productQty ?? product.stock ?? 0),
    sku: product.sku,
    barcode: product.barcode,
    images: Array.isArray(product.images) ? product.images : [],
    category: normalizeCategory(product.category),
    brand: normalizeBrand(product.brand),
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

function getStatusTone(product: NormalizedProduct, t?: (key: string) => string) {
  const status = String(product.status ?? "")
    .trim()
    .toUpperCase();

  switch (status) {
    case "ACTIVE":
      return {
        tone: "active",
        label: t?.("products.active") || "Active",
      };

    case "DRAFT":
      return {
        tone: "draft",
        label: t?.("products.draft") || "Draft",
      };

    case "ARCHIVED":
      return {
        tone: "archived",
        label: t?.("products.archived") || "Archived",
      };

    case "INACTIVE":
      return {
        tone: "inactive",
        label: t?.("products.inactive") || "Inactive",
      };

    default:
      return {
        tone: product.isActive ? "active" : "inactive",
        label: product.isActive ? t?.("products.active") || "Active" : t?.("products.inactive") || "Inactive",
      };
  }
}

function matchesAdvancedSearch(product: NormalizedProduct, query: string, t?: (key: string) => string) {
  const q = String(query ?? "")
    .trim()
    .toLowerCase();

  if (!q) {
    return true;
  }

  const activeLabel = (t?.("products.active") || "Active").toLowerCase();
  const inactiveLabel = (t?.("products.inactive") || "Inactive").toLowerCase();
  const draftLabel = (t?.("products.draft") || "Draft").toLowerCase();

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

    if (token.startsWith("brand:")) {
      return String(product.brand?.name ?? "")
        .toLowerCase()
        .includes(token.replace("brand:", ""));
    }

    if (token.startsWith("name:")) {
      return String(product.name ?? "")
        .toLowerCase()
        .includes(token.replace("name:", ""));
    }

    if (token === "active" || token === activeLabel) {
      return product.isActive;
    }

    if (token === "inactive" || token === inactiveLabel) {
      return !product.isActive;
    }

    if (token === "draft" || token === draftLabel) {
      return String(product.status ?? "").toUpperCase() === "DRAFT";
    }

    if (token === "outofstock") {
      return (product.stock ?? 0) <= 0;
    }

    if (token === "lowstock") {
      return (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5;
    }

    if (token === "nocategory") {
      return !product.category?.name;
    }

    const haystack = [
      String(product.name ?? ""),
      String(product.sku ?? ""),
      String(product.barcode ?? ""),
      String(product.category?.name ?? ""),
      String(product.brand?.name ?? ""),
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
  if (activeFilter === "all") {
    return true;
  }

  if (activeFilter === "active") {
    return product.isActive;
  }

  return !product.isActive;
}

function matchesCategory(product: NormalizedProduct, categoryIds?: string[]) {
  if (!categoryIds || categoryIds.length === 0) {
    return true;
  }

  return categoryIds.includes(String(product.category?.id ?? ""));
}

function matchesBrand(product: NormalizedProduct, brandIds?: string[]) {
  if (!brandIds || brandIds.length === 0) {
    return true;
  }

  return brandIds.includes(String(product.brand?.id ?? ""));
}

function matchesPrice(product: NormalizedProduct, priceMin?: string, priceMax?: string) {
  const price = Number(product.priceCents ?? 0) / 100;

  const min = priceMin === "" || priceMin == null ? null : Number(priceMin);

  const max = priceMax === "" || priceMax == null ? null : Number(priceMax);

  const validMin = min == null || Number.isNaN(min) ? null : min;

  const validMax = max == null || Number.isNaN(max) ? null : max;

  if (validMin != null && price < validMin) {
    return false;
  }

  if (validMax != null && price > validMax) {
    return false;
  }

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
  items: ApiProduct[];
  categories: ApiCategory[];
  brands: ApiBrand[];
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
    brands,
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

  const modal = useModal();

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const blurTimer = useRef<number | null>(null);

  const normalizedItems = useMemo(() => (items ?? []).map(normalizeProduct), [items]);
  const { t } = useAdminI18n();

  useEffect(() => {
    return () => {
      if (blurTimer.current) {
        clearTimeout(blurTimer.current);
      }
    };
  }, []);

  const filtered = useMemo(() => {
    const result = normalizedItems.filter((product) => {
      return (
        matchesAdvancedSearch(product, filters.q) &&
        matchesStatus(product, filters.active) &&
        matchesCategory(product, filters.categoryIds) &&
        matchesBrand(product, filters.brandIds) &&
        matchesPrice(product, filters.priceMin, filters.priceMax)
      );
    });

    return sortProducts(result, filters.sort ?? "Newest");
  }, [normalizedItems, filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const suggestions = useMemo(() => {
    const q = String(filters.q ?? "").trim();
    if (!q) return [];
    return normalizedItems.filter((p) => matchesAdvancedSearch(p, q)).slice(0, 8);
  }, [normalizedItems, filters.q]);

  const selectedIds = useMemo(() => new Set(Object.keys(selected).filter((k) => selected[k])), [selected]);

  const selectedProducts = useMemo(() => filtered.filter((p) => selectedIds.has(p.id)), [filtered, selectedIds]);

  const checkedCount = selectedProducts.length;

  async function deactivateProducts(products: NormalizedProduct[]) {
    if (products.length === 0) {
      modal.error(t("products.noProductsSelected"), t("products.pleaseSelectAtLeastOneProduct"));

      return;
    }

    props.setBusy(true);

    try {
      for (const product of products) {
        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        });

        const json = await safeJson<ApiError>(res);

        if (!res.ok) {
          throw new Error(json?.error || `${t("products.deactivateFailed")} “${product.name}”.`);
        }
      }

      setSelected({});
      props.afterMutate();

      if (products.length === 1) {
        modal.success(t("products.success"), t("products.deactivateSuccessSingle").replace("{name}", products[0].name));
      } else {
        modal.success(
          t("products.success"),
          t("products.deactivateSuccessMultiple").replace("{count}", String(products.length)),
        );
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(t("products.deactivateFailed"));

      modal.error(t("products.deactivateFailed"), err.message || t("products.deactivateFailed"));
    } finally {
      props.setBusy(false);
    }
  }

  function handleToggleFilters() {
    setFiltersOpen((v) => !v);
  }

  function handleCreateProduct() {
    if (!selectedSiteId) {
      modal.error(t("products.missingSite"), t("products.pleaseSelectSiteFirst"));

      return;
    }

    onOpenForm();
  }

  function handleEditSelected() {
    if (checkedCount === 0) {
      modal.error(t("products.noProductSelected"), t("products.pleaseSelectOneProductToEdit"));

      return;
    }

    if (checkedCount > 1) {
      modal.error(t("products.multipleProductsSelected"), t("products.pleaseSelectOnlyOneProductToEdit"));

      return;
    }

    onEdit(selectedProducts[0].id);
  }

  function handleDeactivateSelected() {
    if (checkedCount === 0) {
      modal.error(t("products.noProductSelected"), t("products.pleaseSelectAtLeastOneProductToDeactivate"));

      return;
    }

    const namesPreview =
      checkedCount === 1
        ? t("products.deactivateConfirmSingle").replace("{name}", selectedProducts[0].name)
        : t("products.deactivateConfirmMultiple").replace("{count}", String(checkedCount));

    modal.confirmDelete(t("products.deactivateProduct"), namesPreview, () => {
      void deactivateProducts(selectedProducts);
    });
  }

  const filteredCategories = categories.filter((c) => c.isActive !== false);
  const filteredBrands = brands.filter((c) => c.isActive !== false);

  const functionKeyActions = useMemo(
    () => ({
      F2: {
        action: handleToggleFilters,
        label: "Filters",
        icon: "bi-funnel",
      },
      F3: {
        action: handleDeactivateSelected,
        label: "Deactivate",
        icon: "bi-trash",
      },
      F5: {
        action: handleCreateProduct,
        label: "Create",
        icon: "bi-plus-circle",
      },
      F6: {
        action: handleEditSelected,
        label: "Edit",
        icon: "bi-pencil-square",
      },
    }),
    [checkedCount, selectedProducts, selectedSiteId],
  );

  usePageFunctionKeys(functionKeyActions);

  async function handleDeleteProduct(product: NormalizedProduct) {
    modal.confirmDelete(
      t("products.deleteProduct"),
      t("products.deleteConfirm").replace("{name}", product.name),
      async () => {
        props.setBusy(true);

        try {
          const response = await fetch(`/api/admin/products/${product.id}`, {
            method: "DELETE",
            credentials: "include",
            cache: "no-store",
          });

          const data = await safeJson<ApiError>(response);

          if (!response.ok) {
            throw new Error(data?.error || `${t("products.deleteFailed")} “${product.name}”.`);
          }

          props.afterMutate();

          modal.success(t("products.success"), t("products.deleteSuccess").replace("{name}", product.name));
        } catch (error) {
          const err = error instanceof Error ? error : new Error(t("products.deleteFailed"));

          modal.error(t("products.deleteFailed"), err.message);
        } finally {
          props.setBusy(false);
        }
      },
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.toolbarTop}>
          <div className={styles.toolbarRight}>
            <div className={styles.selectWrap}>
              <i className={`bi bi-sort-down ${styles.selectIcon}`} />

              <select
                id="site-selector"
                value={selectedSiteId}
                onChange={(e) => onChangeSite(e.target.value)}
                disabled={sitesLoading}
                className={styles.select}
              >
                <option value="">{sitesLoading ? t("products.loadingSites") : t("products.selectSite")}</option>

                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? s.id}
                  </option>
                ))}
              </select>

              {sitesErr ? <span className={styles.siteError}>{sitesErr}</span> : null}
            </div>
          </div>

          <div className={styles.toolbarLeft}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon} aria-hidden>
                <i className="bi bi-search-heart"></i>
              </span>

              <input
                className={styles.searchInput}
                value={filters.q}
                placeholder={t("products.searchPlaceholder")}
                onChange={(e) =>
                  setFilters((s) => ({
                    ...s,
                    q: e.target.value,
                  }))
                }
                onFocus={() => {
                  if (blurTimer.current) {
                    window.clearTimeout(blurTimer.current);
                  }

                  setSearchOpen(true);
                }}
                onBlur={() => {
                  blurTimer.current = window.setTimeout(() => setSearchOpen(false), 140);
                }}
              />

              {searchOpen && String(filters.q ?? "").trim() && suggestions.length > 0 ? (
                <div className={styles.suggest} role="listbox" aria-label={t("products.searchSuggestions")}>
                  <div className={styles.suggestHead}>
                    <span className={styles.suggestTitle}>{t("products.searchSuggestions")}</span>

                    <span className={styles.suggestHint}>
                      {t("products.itemsCount").replace("{count}", String(suggestions.length))}
                    </span>
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
                            setFilters((s) => ({
                              ...s,
                              q: product.name ?? s.q,
                            }));

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
                              {product.category?.name ?? t("products.noCategory")} •{" "}
                              {moneyFromCents(product.priceCents)}
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
          </div>

          <div className={styles.toolbarRight}>
            <div className={styles.selectWrap}>
              <i className={`bi bi-sort-down ${styles.selectIcon}`} />

              <select
                className={styles.select}
                value={filters.sort}
                onChange={(e) =>
                  setFilters((s) => ({
                    ...s,
                    sort: e.target.value as Filters["sort"],
                  }))
                }
                disabled={busy}
              >
                <option value="Newest">{t("products.newestFirst")}</option>

                <option value="Oldest">{t("products.oldestFirst")}</option>

                <option value="StatusAsc">{t("products.statusAsc")}</option>

                <option value="StatusDesc">{t("products.statusDesc")}</option>
              </select>
            </div>
          </div>

          <div className={styles.toolbarRight}>
            <div className={styles.selectWrap}>
              <i className={`bi bi-sort-down ${styles.selectIcon}`} />

              <select
                className={styles.select}
                value={filters.categoryIds?.[0] ?? ""}
                onChange={(e) => {
                  const value = e.target.value;

                  setFilters((s) => ({
                    ...s,
                    categoryIds: value ? [value] : [],
                  }));
                }}
              >
                <option value="">{t("products.allCategories")}</option>

                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.toolbarRight}>
            <div className={styles.selectWrap}>
              <i className={`bi bi-sort-down ${styles.selectIcon}`} />

              <select
                className={styles.select}
                value={filters.brandIds?.[0] ?? ""}
                onChange={(e) => {
                  const value = e.target.value;

                  setFilters((s) => ({
                    ...s,
                    brandIds: value ? [value] : [],
                  }));
                }}
                disabled={busy}
              >
                <option value="">{t("products.allBrands")}</option>

                {filteredBrands.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.pageHeaderRight}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${!editingId ? styles.tabActive : ""}`}
              type="button"
              onClick={onOpenList}
            >
              {t("products.productList")}
            </button>

            <button
              className={styles.tabBtn}
              type="button"
              onClick={handleCreateProduct}
              disabled={!selectedSiteId}
              title={!selectedSiteId ? t("products.pleaseSelectSiteFirst") : undefined}
            >
              {editingId ? t("products.editProduct") : t("products.createProduct")}
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className={styles.alertError} role="alert">
          <span className={styles.alertText}>{error}</span>
        </div>
      ) : null}

      <div className={styles.productsGrid}>
        <div className={styles.tableHeader}>
          <button className={styles.sortHeader}>
            <span>{t("products.no")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <button className={styles.sortHeader}>
            <span>{t("products.product")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <button className={styles.sortHeader}>
            <span>{t("products.sku")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <button className={styles.sortHeader}>
            <span>{t("products.qty")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <button className={styles.sortHeader}>
            <span>{t("products.brand")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <button className={styles.sortHeader}>
            <span>{t("products.category")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <button className={styles.sortHeader}>
            <span>{t("products.pricing")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <button className={styles.sortHeader}>
            <span>{t("products.marketPrice")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <button className={styles.sortHeader}>
            <span>{t("products.status")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <button className={styles.sortHeader}>
            <span>{t("products.updated")}</span>
            <i className="bi bi-arrow-down-up" />
          </button>

          <div className={styles.actionHeader}>{t("products.actions")}</div>
        </div>

        {paginatedProducts.map((product, index) => {
          const thumb = getThumb(product);
          const tone = getStatusTone(product);

          return (
            <div key={product.id} className={styles.productRow}>
              <div className={styles.indexCol}>
                <span className={styles.indexColText}>
                  {String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className={styles.productCell}>
                <div className={styles.productThumb}>
                  {thumb ? (
                    <Image
                      unoptimized
                      src={thumb}
                      alt={product.name}
                      width={84}
                      height={84}
                      className={styles.productThumbImg}
                    />
                  ) : (
                    <div className={styles.productThumbEmpty}>
                      <i className="bi bi-image" />
                    </div>
                  )}
                </div>

                <div className={styles.productInfo}>
                  <div className={styles.productTop}>
                    <div className={styles.productHeading}>
                      <h3 className={styles.productTitle}>{product.name}</h3>

                      <div className={styles.productSlug}>/{product.slug}</div>
                    </div>

                    {!product.isVisible && <span className={styles.hiddenBadge}>{t("products.hidden")}</span>}
                  </div>
                </div>
              </div>

              <div className={styles.productMeta}>
                {product.sku && (
                  <div className={styles.metaItem}>
                    <i className="bi bi-upc-scan" />
                    <span>{product.sku}</span>
                  </div>
                )}
              </div>

              <div className={styles.stockBox}>
                <div className={styles.stockQty}>
                  <span className={styles.stockQtyNumber}>{product.productQty ?? 0}</span>
                </div>
              </div>

              <div className={styles.brandCell}>
                <div className={styles.brandName}>
                  <span className={styles.NameText}>{product.brand?.name ?? t("products.noBrand")}</span>
                </div>
              </div>

              <div className={styles.categoryCell}>
                <div className={styles.categoryName}>
                  <span className={styles.NameText}>{product.category?.name ?? t("products.noCategory")}</span>
                </div>
              </div>

              <div className={styles.priceCard}>
                <div className={styles.currentPrice}>{moneyFromCents(product.priceCents)}</div>
              </div>

              <div className={styles.priceCard}>
                <div className={styles.currentPrice}>{moneyFromMaket(product.marketPrice)}</div>
              </div>

              <div>
                <span className={`${styles.statusPill} ${styles[`statusPill_${tone}`]}`}>{product.statusLabel}</span>
              </div>

              <div className={styles.dateCell}>
                {new Date(product.updatedAt ?? product.createdAt ?? "").toLocaleDateString()}
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.iconBtn} onClick={() => onEdit(product.id)}>
                  <i className="bi bi-pencil-square" />
                </button>

                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => handleDeleteProduct(product)}
                  disabled={busy}
                  aria-label={t("products.deleteProductAria").replace("{name}", product.name)}
                >
                  <i className="bi bi-trash3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.paginationBtn}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          {t("products.prev")}
        </button>

        <div className={styles.paginationInfo}>
          {t("products.page")} {currentPage} / {totalPages || 1}
        </div>

        <button
          type="button"
          className={styles.paginationBtn}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          {t("products.next")}
        </button>
      </div>
    </div>
  );
}

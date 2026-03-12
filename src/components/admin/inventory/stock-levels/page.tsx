"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/stock-levels/stock-levels.module.css";
import { useSiteStore } from "@/store/site/site.store";
import { useVariantStore } from "@/store/inventory/purchase-orders/purchase-orders.store";

type MovementType =
  | "OPENING"
  | "SALE"
  | "RESTOCK"
  | "RESERVE"
  | "RELEASE_RESERVATION"
  | "ADJUSTMENT_INCREASE"
  | "ADJUSTMENT_DECREASE"
  | "RETURN"
  | "DAMAGE"
  | "LOSS"
  | "PURCHASE_RECEIPT"
  | "PURCHASE_RECEIPT_CANCEL"
  | "MANUAL";

type ProductLite = {
  id: string;
  name: string;
  slug?: string;
};

type SiteLite = {
  id: string;
  name: string;
  code?: string | null;
};

type VariantLite = {
  id: string;
  sku: string;
  title?: string | null;
  stockQty?: number;
  product?: ProductLite | null;
};

type StockLevel = {
  id: string;
  siteId: string;
  variantId: string;
  onHand: number;
  reserved: number;
  available: number;
  incoming: number;
  reorderPoint?: number | null;
  safetyStock?: number | null;
  createdAt: string;
  updatedAt: string;
  variant?: VariantLite | null;
};

type JsonObject = Record<string, unknown>;

type StockMovement = {
  id: string;
  siteId: string;
  variantId: string;
  stockLevelId?: string | null;
  type: MovementType;
  quantityDelta: number;
  beforeOnHand: number;
  afterOnHand: number;
  beforeReserved: number;
  afterReserved: number;
  beforeAvailable: number;
  afterAvailable: number;
  referenceType?: string | null;
  referenceId?: string | null;
  note?: string | null;
  metadata?: JsonObject | null;
  createdBy?: string | null;
  createdAt: string;
  variant?: VariantLite | null;
  stockLevel?: StockLevel | null;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

type StockLevelsResponse = {
  data: StockLevel[];
  meta?: PaginationMeta;
};

type StockLevelDetailResponse = {
  data: StockLevel;
};

type StockMovementsResponse = {
  data: StockMovement[];
  meta?: PaginationMeta;
};

type StockMovementCreateResponse = {
  message: string;
  data: {
    stockLevel: StockLevel;
    movement: StockMovement;
  };
};

type ApiErrorResponse = {
  message?: string;
};

type EditFormState = {
  onHand: number;
  reserved: number;
  incoming: number;
  reorderPoint: number;
  safetyStock: number;
  note: string;
  createdBy: string;
};

type MovementFormState = {
  type: MovementType;
  quantity: number;
  note: string;
  referenceType: string;
  referenceId: string;
  createdBy: string;
};

const DEFAULT_CREATED_BY = "admin_001";

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return data as T;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toSafeInt(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.trunc(value);
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function movementLabel(type: MovementType) {
  switch (type) {
    case "OPENING":
      return "Tồn đầu kỳ";
    case "SALE":
      return "Bán hàng";
    case "RESTOCK":
      return "Nhập thêm";
    case "RESERVE":
      return "Giữ hàng";
    case "RELEASE_RESERVATION":
      return "Nhả giữ hàng";
    case "ADJUSTMENT_INCREASE":
      return "Điều chỉnh tăng";
    case "ADJUSTMENT_DECREASE":
      return "Điều chỉnh giảm";
    case "RETURN":
      return "Hoàn hàng";
    case "DAMAGE":
      return "Hàng hỏng";
    case "LOSS":
      return "Thất thoát";
    case "PURCHASE_RECEIPT":
      return "Nhập từ PO";
    case "PURCHASE_RECEIPT_CANCEL":
      return "Huỷ nhập PO";
    case "MANUAL":
      return "Thủ công";
    default:
      return type;
  }
}

function movementBadgeClass(type: MovementType) {
  if (
    type === "RESTOCK" ||
    type === "RETURN" ||
    type === "PURCHASE_RECEIPT" ||
    type === "ADJUSTMENT_INCREASE" ||
    type === "OPENING"
  ) {
    return styles.badgeOk;
  }

  if (
    type === "SALE" ||
    type === "DAMAGE" ||
    type === "LOSS" ||
    type === "ADJUSTMENT_DECREASE" ||
    type === "PURCHASE_RECEIPT_CANCEL"
  ) {
    return styles.badgeBad;
  }

  return styles.badgeOff;
}

function shortId(id: string) {
  if (!id) return "";
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

function buildDefaultEditForm(stock?: StockLevel | null): EditFormState {
  return {
    onHand: Number(stock?.onHand ?? 0),
    reserved: Number(stock?.reserved ?? 0),
    incoming: Number(stock?.incoming ?? 0),
    reorderPoint: Number(stock?.reorderPoint ?? 0),
    safetyStock: Number(stock?.safetyStock ?? 0),
    note: "",
    createdBy: DEFAULT_CREATED_BY,
  };
}

function buildDefaultMovementForm(): MovementFormState {
  return {
    type: "ADJUSTMENT_INCREASE",
    quantity: 1,
    note: "",
    referenceType: "",
    referenceId: "",
    createdBy: DEFAULT_CREATED_BY,
  };
}

export default function StockLevelsPage() {
  const sites = useSiteStore((state) => state.sites as SiteLite[]);
  const selectedSiteId = useSiteStore((state) => state.siteId);
  const setSelectedSiteId = useSiteStore((state) => state.setSiteId);
  const hydrateFromStorage = useSiteStore((state) => state.hydrateFromStorage);
  const loadSites = useSiteStore((state) => state.loadSites);

  const variants = useVariantStore((state) => state.variants as VariantLite[]);
  const variantsLoading = useVariantStore((state) => state.loading);
  const variantsErr = useVariantStore((state) => state.err as string | null);
  const loadVariants = useVariantStore((state) => state.loadVariants);

  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [selectedVariantFilterId, setSelectedVariantFilterId] = useState<string>("");
  const [activeVariantId, setActiveVariantId] = useState<string>("");
  const [activeStockLevel, setActiveStockLevel] = useState<StockLevel | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [query, setQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [movementTypeFilter, setMovementTypeFilter] = useState<MovementType | "ALL">("ALL");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busy, setBusy] = useState<"saveStockLevel" | "createMovement" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(buildDefaultEditForm());
  const [movementForm, setMovementForm] = useState<MovementFormState>(buildDefaultMovementForm());

  const selectedSite = useMemo(() => {
    return sites.find((site) => site.id === selectedSiteId) ?? null;
  }, [sites, selectedSiteId]);

  const variantOptions = useMemo(() => {
    return variants
      .map((variant) => ({
        id: variant.id,
        label: `${variant.product?.name ?? "Unnamed product"} · ${variant.sku}${variant.title ? ` · ${variant.title}` : ""}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [variants]);

  const visibleStockLevels = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = stockLevels.filter((item) => {
      const matchLowStock = lowStockOnly
        ? item.reorderPoint != null && item.available <= Number(item.reorderPoint)
        : true;

      const matchVariant = selectedVariantFilterId ? item.variantId === selectedVariantFilterId : true;

      if (!matchLowStock || !matchVariant) return false;

      if (!q) return true;

      const productName = item.variant?.product?.name ?? "";
      const sku = item.variant?.sku ?? "";
      const title = item.variant?.title ?? "";
      const text = `${productName} ${sku} ${title} ${item.variantId}`.toLowerCase();
      return text.includes(q);
    });

    return [...filtered].sort((a, b) => {
      const aLow = a.reorderPoint != null && a.available <= Number(a.reorderPoint) ? 1 : 0;
      const bLow = b.reorderPoint != null && b.available <= Number(b.reorderPoint) ? 1 : 0;

      if (aLow !== bLow) return bLow - aLow;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [lowStockOnly, query, selectedVariantFilterId, stockLevels]);

  const visibleMovements = useMemo(() => {
    const list =
      movementTypeFilter === "ALL" ? movements : movements.filter((movement) => movement.type === movementTypeFilter);

    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [movementTypeFilter, movements]);

  const stats = useMemo(() => {
    const total = stockLevels.length;
    const lowStock = stockLevels.filter((item) =>
      item.reorderPoint != null ? item.available <= Number(item.reorderPoint) : false,
    ).length;
    const outOfStock = stockLevels.filter((item) => item.available <= 0).length;
    const totalOnHand = stockLevels.reduce((sum, item) => sum + Number(item.onHand || 0), 0);
    const totalReserved = stockLevels.reduce((sum, item) => sum + Number(item.reserved || 0), 0);

    return {
      total,
      lowStock,
      outOfStock,
      totalOnHand,
      totalReserved,
    };
  }, [stockLevels]);

  const loadStockLevels = useCallback(async () => {
    if (!selectedSiteId) {
      setStockLevels([]);
      setActiveVariantId("");
      setActiveStockLevel(null);
      setMovements([]);
      return;
    }

    try {
      setLoadingList(true);
      setError(null);

      const params = new URLSearchParams({
        siteId: selectedSiteId,
        page: "1",
        limit: "200",
      });

      if (lowStockOnly) params.set("lowStockOnly", "true");
      if (selectedVariantFilterId) params.set("variantId", selectedVariantFilterId);

      const response = await apiJson<StockLevelsResponse>(`/api/admin/inventory/stock-levels?${params.toString()}`);

      const list = response.data ?? [];
      setStockLevels(list);

      setActiveVariantId((previous) => {
        if (previous && list.some((item) => item.variantId === previous)) return previous;
        return list[0]?.variantId ?? "";
      });
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : "Không tải được stock levels";
      setError(message);
    } finally {
      setLoadingList(false);
    }
  }, [lowStockOnly, selectedSiteId, selectedVariantFilterId]);

  const loadStockLevelDetail = useCallback(
    async (variantId: string) => {
      if (!selectedSiteId || !variantId) return;

      try {
        setLoadingDetail(true);
        setError(null);

        const params = new URLSearchParams({ siteId: selectedSiteId });

        const [stockResponse, movementsResponse] = await Promise.all([
          apiJson<StockLevelDetailResponse>(`/api/admin/inventory/stock-levels/${variantId}?${params.toString()}`),
          apiJson<StockMovementsResponse>(
            `/api/admin/inventory/stock-movements?siteId=${encodeURIComponent(selectedSiteId)}&variantId=${encodeURIComponent(
              variantId,
            )}&page=1&limit=100`,
          ),
        ]);

        const stock = stockResponse.data;
        setActiveStockLevel(stock);
        setMovements(movementsResponse.data ?? []);
        setEditForm(buildDefaultEditForm(stock));
        setMovementForm(buildDefaultMovementForm());
      } catch (caughtError: unknown) {
        const message = caughtError instanceof Error ? caughtError.message : "Không tải được chi tiết stock level";
        setError(message);
      } finally {
        setLoadingDetail(false);
      }
    },
    [selectedSiteId],
  );

  useEffect(() => {
    hydrateFromStorage();
    void loadSites();
  }, [hydrateFromStorage, loadSites]);

  useEffect(() => {
    if (!selectedSiteId) return;
    void loadVariants(selectedSiteId);
  }, [loadVariants, selectedSiteId]);

  useEffect(() => {
    void loadStockLevels();
  }, [loadStockLevels]);

  useEffect(() => {
    if (!activeVariantId) {
      setActiveStockLevel(null);
      setMovements([]);
      return;
    }

    void loadStockLevelDetail(activeVariantId);
  }, [activeVariantId, loadStockLevelDetail]);

  useEffect(() => {
    setMovementTypeFilter("ALL");
  }, [activeVariantId]);

  const selectVariant = (variantId: string) => {
    setActiveVariantId(variantId);
  };

  const saveStockLevel = async () => {
    if (!activeVariantId || !selectedSiteId) return;

    try {
      setBusy("saveStockLevel");
      setError(null);

      const payload = {
        siteId: selectedSiteId,
        onHand: clamp(toSafeInt(Number(editForm.onHand || 0)), 0, 1_000_000_000),
        reserved: clamp(toSafeInt(Number(editForm.reserved || 0)), 0, 1_000_000_000),
        incoming: clamp(toSafeInt(Number(editForm.incoming || 0)), 0, 1_000_000_000),
        reorderPoint: clamp(toSafeInt(Number(editForm.reorderPoint || 0)), 0, 1_000_000_000),
        safetyStock: clamp(toSafeInt(Number(editForm.safetyStock || 0)), 0, 1_000_000_000),
        note: editForm.note || "Manual stock level update",
        createdBy: editForm.createdBy || DEFAULT_CREATED_BY,
        syncStockQty: true,
      };

      await apiJson(`/api/admin/inventory/stock-levels/${activeVariantId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      await loadStockLevels();
      await loadStockLevelDetail(activeVariantId);
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : "Cập nhật stock level thất bại";
      setError(message);
    } finally {
      setBusy(null);
    }
  };

  const createMovement = async () => {
    if (!activeVariantId || !selectedSiteId) return;

    try {
      setBusy("createMovement");
      setError(null);

      const payload = {
        siteId: selectedSiteId,
        variantId: activeVariantId,
        type: movementForm.type,
        quantity: clamp(toSafeInt(Number(movementForm.quantity || 0)), 1, 1_000_000_000),
        note: movementForm.note || undefined,
        referenceType: movementForm.referenceType.trim() || undefined,
        referenceId: movementForm.referenceId.trim() || undefined,
        createdBy: movementForm.createdBy || DEFAULT_CREATED_BY,
      };

      await apiJson<StockMovementCreateResponse>(`/api/admin/inventory/stock-movements`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMovementForm(buildDefaultMovementForm());
      await loadStockLevels();
      await loadStockLevelDetail(activeVariantId);
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : "Tạo stock movement thất bại";
      setError(message);
    } finally {
      setBusy(null);
    }
  };

  const activeProductName = activeStockLevel?.variant?.product?.name || "Unknown product";
  const activeSku = activeStockLevel?.variant?.sku || shortId(activeStockLevel?.variantId || "");
  const activeVariantTitle = activeStockLevel?.variant?.title || "";

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <i className="bi bi-box-seam" />
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.title}>Inventory Stock Levels</h1>
            <p className={styles.subtitle}>
              Theo dõi tồn kho, điều chỉnh số lượng, quản lý theo site và audit stock movements.
            </p>
          </div>
        </div>

        <div className={styles.topActions}>
          <button
            className={styles.btnGhost}
            type="button"
            onClick={() => void loadStockLevels()}
            disabled={loadingList || busy !== null || !selectedSiteId}
          >
            <i className="bi bi-arrow-clockwise" />
            Refresh
          </button>

          <button
            className={styles.btnPrimary}
            type="button"
            onClick={() => setLowStockOnly((previous) => !previous)}
            disabled={busy !== null || !selectedSiteId}
          >
            <i className="bi bi-exclamation-diamond" />
            {lowStockOnly ? "Show all" : "Low stock only"}
          </button>
        </div>
      </header>

      <section className={styles.filterBar}>
        <div className={styles.filterCard}>
          <label className={styles.filterLabel} htmlFor="site-select">
            Site
          </label>
          <select
            id="site-select"
            className={styles.select}
            value={selectedSiteId ?? ""}
            onChange={(event) => {
              const nextSiteId = event.target.value;
              setSelectedSiteId(nextSiteId);
              setSelectedVariantFilterId("");
              setActiveVariantId("");
              setActiveStockLevel(null);
              setMovements([]);
              setEditForm(buildDefaultEditForm());
              setMovementForm(buildDefaultMovementForm());
            }}
          >
            <option value="">Chọn site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
                {site.code ? ` (${site.code})` : ""}
              </option>
            ))}
          </select>
          <div className={styles.filterHint}>{selectedSite ? `Đang xem: ${selectedSite.name}` : "Chưa chọn site"}</div>
        </div>

        <div className={styles.filterCard}>
          <label className={styles.filterLabel} htmlFor="variant-filter">
            Variant filter
          </label>
          <select
            id="variant-filter"
            className={styles.select}
            value={selectedVariantFilterId}
            onChange={(event) => {
              const nextVariantId = event.target.value;
              setSelectedVariantFilterId(nextVariantId);
              if (nextVariantId) setActiveVariantId(nextVariantId);
            }}
            disabled={!selectedSiteId || variantsLoading}
          >
            <option value="">Tất cả variants</option>
            {variantOptions.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.label}
              </option>
            ))}
          </select>
          <div className={styles.filterHint}>
            {variantsLoading
              ? "Đang tải variants..."
              : variantsErr
                ? variantsErr
                : `${variantOptions.length} variants khả dụng`}
          </div>
        </div>

        <div className={styles.filterCardWide}>
          <label className={styles.filterLabel} htmlFor="stock-search">
            Search
          </label>
          <div className={styles.searchWrapLarge}>
            <i className="bi bi-search" />
            <input
              id="stock-search"
              className={styles.search}
              placeholder="Search by product, sku, variant..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </section>

      {error ? (
        <div className={styles.errorBar}>
          <i className="bi bi-exclamation-triangle" />
          <div>
            <div className={styles.errorTitle}>Something went wrong</div>
            <div className={styles.errorText}>{error}</div>
          </div>
        </div>
      ) : null}

      <section className={styles.statsStrip}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total variants</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Low stock</div>
          <div className={styles.statValue}>{stats.lowStock}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Out of stock</div>
          <div className={styles.statValue}>{stats.outOfStock}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total on hand</div>
          <div className={styles.statValue}>{stats.totalOnHand}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Reserved</div>
          <div className={styles.statValue}>{stats.totalReserved}</div>
        </div>
      </section>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Stock levels</div>
            <div className={styles.panelHint}>Danh sách variant tồn kho hiện tại theo site</div>
          </div>

          <div className={styles.list}>
            {loadingList ? (
              <div className={styles.skeletonList}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div className={styles.skeletonRow} key={index} />
                ))}
              </div>
            ) : visibleStockLevels.length === 0 ? (
              <div className={styles.empty}>
                <i className="bi bi-inboxes" />
                <div>
                  <div className={styles.emptyTitle}>No stock levels</div>
                  <div className={styles.emptyText}>Chưa có dữ liệu tồn kho phù hợp.</div>
                </div>
              </div>
            ) : (
              visibleStockLevels.map((item) => {
                const isActive = item.variantId === activeVariantId;
                const isLow = item.reorderPoint != null ? item.available <= Number(item.reorderPoint) : false;
                const isOut = Number(item.available) <= 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.rowBtn} ${isActive ? styles.rowActive : ""}`}
                    onClick={() => selectVariant(item.variantId)}
                  >
                    <div className={styles.rowMain}>
                      <div className={styles.rowTitle}>
                        <span className={styles.dot} />
                        <span>{item.variant?.product?.name || "Unnamed product"}</span>
                      </div>

                      <div className={styles.rowSub}>
                        <span className={styles.muted}>
                          <i className="bi bi-upc-scan" /> {item.variant?.sku || shortId(item.variantId)}
                        </span>
                        {item.variant?.title ? (
                          <span className={styles.muted}>
                            <i className="bi bi-tag" /> {item.variant.title}
                          </span>
                        ) : null}
                      </div>

                      <div className={styles.rowMetrics}>
                        <span className={styles.metricChip}>On hand: {item.onHand}</span>
                        <span className={styles.metricChip}>Reserved: {item.reserved}</span>
                        <span className={styles.metricChip}>Available: {item.available}</span>
                        {item.incoming > 0 ? (
                          <span className={styles.metricChip}>Incoming: {item.incoming}</span>
                        ) : null}
                        {item.reorderPoint != null ? (
                          <span className={styles.metricChip}>ROP: {item.reorderPoint}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.rowActions}>
                      {isOut ? (
                        <span className={`${styles.badge} ${styles.badgeBad}`}>Out</span>
                      ) : isLow ? (
                        <span className={`${styles.badge} ${styles.badgeOff}`}>Low</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeOk}`}>Healthy</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className={styles.detail}>
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelTitle}>Stock detail</div>
              <div className={styles.panelHint}>Xem tồn kho chi tiết, cập nhật trực tiếp và theo dõi movement log.</div>
            </div>
          </div>

          {!selectedSiteId ? (
            <div className={styles.emptyBig}>
              <i className="bi bi-buildings" />
              <div>
                <div className={styles.emptyTitle}>Select a site</div>
                <div className={styles.emptyText}>Vui lòng chọn site trước khi thao tác tồn kho.</div>
              </div>
            </div>
          ) : !activeVariantId ? (
            <div className={styles.emptyBig}>
              <i className="bi bi-layout-text-sidebar-reverse" />
              <div>
                <div className={styles.emptyTitle}>Select a stock level</div>
                <div className={styles.emptyText}>Chọn một variant bên trái để xem thông tin chi tiết.</div>
              </div>
            </div>
          ) : loadingDetail ? (
            <div className={styles.detailLoading}>
              <div className={styles.skeletonBlock} />
              <div className={styles.skeletonBlock} />
              <div className={styles.skeletonBlock} />
            </div>
          ) : !activeStockLevel ? (
            <div className={styles.emptyBig}>
              <i className="bi bi-exclamation-circle" />
              <div>
                <div className={styles.emptyTitle}>Stock level not found</div>
                <div className={styles.emptyText}>Không tìm thấy dữ liệu chi tiết.</div>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <div className={styles.detailTitle}>
                    <span className={`${styles.badge} ${styles.badgeOk}`}>
                      <i className="bi bi-box-seam" />
                      ACTIVE
                    </span>
                    <span className={styles.detailRef}>{activeProductName}</span>
                  </div>

                  <div className={styles.detailRight}>
                    <div className={styles.moneyBig}>{activeSku}</div>
                    <div className={styles.moneySub}>
                      <span className={styles.muted}>{activeVariantTitle || "Default variant"}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.metaGrid}>
                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>On hand</div>
                    <div className={styles.metaValue}>
                      <span className={styles.mono}>{activeStockLevel.onHand}</span>
                    </div>
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Reserved</div>
                    <div className={styles.metaValue}>
                      <span className={styles.mono}>{activeStockLevel.reserved}</span>
                    </div>
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Available</div>
                    <div className={styles.metaValue}>
                      <span className={styles.mono}>{activeStockLevel.available}</span>
                    </div>
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Incoming</div>
                    <div className={styles.metaValue}>
                      <span className={styles.mono}>{activeStockLevel.incoming}</span>
                    </div>
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Reorder point</div>
                    <div className={styles.metaValue}>
                      <span className={styles.mono}>{activeStockLevel.reorderPoint ?? "--"}</span>
                    </div>
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Safety stock</div>
                    <div className={styles.metaValue}>
                      <span className={styles.mono}>{activeStockLevel.safetyStock ?? "--"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.itemsCard}>
                <div className={styles.itemsHead}>
                  <div className={styles.itemsTitle}>
                    <i className="bi bi-sliders2" /> Update stock level
                  </div>
                  <div className={styles.itemsHint}>Cập nhật trực tiếp các số tồn và đồng bộ stockQty</div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>On hand</div>
                    <input
                      className={styles.search}
                      type="number"
                      value={editForm.onHand}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          onHand: clamp(Number(event.target.value || 0), 0, 1_000_000_000),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Reserved</div>
                    <input
                      className={styles.search}
                      type="number"
                      value={editForm.reserved}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          reserved: clamp(Number(event.target.value || 0), 0, 1_000_000_000),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Incoming</div>
                    <input
                      className={styles.search}
                      type="number"
                      value={editForm.incoming}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          incoming: clamp(Number(event.target.value || 0), 0, 1_000_000_000),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Reorder point</div>
                    <input
                      className={styles.search}
                      type="number"
                      value={editForm.reorderPoint}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          reorderPoint: clamp(Number(event.target.value || 0), 0, 1_000_000_000),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Safety stock</div>
                    <input
                      className={styles.search}
                      type="number"
                      value={editForm.safetyStock}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          safetyStock: clamp(Number(event.target.value || 0), 0, 1_000_000_000),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Created by</div>
                    <input
                      className={styles.search}
                      value={editForm.createdBy}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          createdBy: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaFieldFull}>
                    <div className={styles.metaLabel}>Note</div>
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      value={editForm.note}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          note: event.target.value,
                        }))
                      }
                      placeholder="Manual stock audit, stock correction, etc."
                    />
                  </div>
                </div>

                <div className={styles.statusActions}>
                  <button className={styles.btnPrimary} type="button" onClick={saveStockLevel} disabled={busy !== null}>
                    <i className="bi bi-check2-square" />
                    {busy === "saveStockLevel" ? "Saving..." : "Save stock level"}
                  </button>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.itemsHead}>
                  <div className={styles.itemsTitle}>
                    <i className="bi bi-plus-slash-minus" /> Manual stock movement
                  </div>
                  <div className={styles.itemsHint}>Tạo movement để audit thay đổi tồn kho theo nghiệp vụ</div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Movement type</div>
                    <select
                      className={styles.select}
                      value={movementForm.type}
                      onChange={(event) =>
                        setMovementForm((previous) => ({
                          ...previous,
                          type: event.target.value as MovementType,
                        }))
                      }
                    >
                      <option value="ADJUSTMENT_INCREASE">ADJUSTMENT_INCREASE</option>
                      <option value="ADJUSTMENT_DECREASE">ADJUSTMENT_DECREASE</option>
                      <option value="RESTOCK">RESTOCK</option>
                      <option value="RESERVE">RESERVE</option>
                      <option value="RELEASE_RESERVATION">RELEASE_RESERVATION</option>
                      <option value="RETURN">RETURN</option>
                      <option value="DAMAGE">DAMAGE</option>
                      <option value="LOSS">LOSS</option>
                      <option value="SALE">SALE</option>
                      <option value="MANUAL">MANUAL</option>
                    </select>
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Quantity</div>
                    <input
                      className={styles.search}
                      type="number"
                      min={1}
                      value={movementForm.quantity}
                      onChange={(event) =>
                        setMovementForm((previous) => ({
                          ...previous,
                          quantity: clamp(Number(event.target.value || 1), 1, 1_000_000_000),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Created by</div>
                    <input
                      className={styles.search}
                      value={movementForm.createdBy}
                      onChange={(event) =>
                        setMovementForm((previous) => ({
                          ...previous,
                          createdBy: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Reference type</div>
                    <input
                      className={styles.search}
                      value={movementForm.referenceType}
                      onChange={(event) =>
                        setMovementForm((previous) => ({
                          ...previous,
                          referenceType: event.target.value,
                        }))
                      }
                      placeholder="ORDER / MANUAL / RETURN / AUDIT"
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Reference ID</div>
                    <input
                      className={styles.search}
                      value={movementForm.referenceId}
                      onChange={(event) =>
                        setMovementForm((previous) => ({
                          ...previous,
                          referenceId: event.target.value,
                        }))
                      }
                      placeholder="order_123 / audit_001"
                    />
                  </div>

                  <div className={styles.metaFieldFull}>
                    <div className={styles.metaLabel}>Note</div>
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      value={movementForm.note}
                      onChange={(event) =>
                        setMovementForm((previous) => ({
                          ...previous,
                          note: event.target.value,
                        }))
                      }
                      placeholder="Lý do tạo stock movement"
                    />
                  </div>
                </div>

                <div className={styles.statusActions}>
                  <button className={styles.btnGhost} type="button" onClick={createMovement} disabled={busy !== null}>
                    <i className="bi bi-plus-lg" />
                    {busy === "createMovement" ? "Creating..." : "Create movement"}
                  </button>
                </div>
              </div>

              <div className={styles.itemsCard}>
                <div className={styles.itemsHead}>
                  <div className={styles.itemsTitle}>
                    <i className="bi bi-clock-history" /> Stock movements ({movements.length})
                  </div>
                  <div className={styles.itemsHint}>Lịch sử tăng giảm tồn kho theo variant</div>
                </div>

                <div className={styles.toolbar}>
                  <div className={styles.pillGroup}>
                    {[
                      "ALL",
                      "ADJUSTMENT_INCREASE",
                      "ADJUSTMENT_DECREASE",
                      "RESTOCK",
                      "RESERVE",
                      "SALE",
                      "RETURN",
                      "DAMAGE",
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`${styles.pill} ${movementTypeFilter === type ? styles.pillActive : ""}`}
                        onClick={() => setMovementTypeFilter(type as MovementType | "ALL")}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {visibleMovements.length === 0 ? (
                  <div className={styles.emptySmall}>
                    <i className="bi bi-activity" />
                    <div>
                      <div className={styles.emptyTitle}>No stock movements</div>
                      <div className={styles.emptyText}>Chưa có lịch sử movement cho variant này.</div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Qty</th>
                          <th>Before</th>
                          <th>After</th>
                          <th>Reference</th>
                          <th>By</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleMovements.map((movement) => (
                          <tr key={movement.id} className={styles.trHover}>
                            <td>
                              <span className={`${styles.badge} ${movementBadgeClass(movement.type)}`}>
                                {movementLabel(movement.type)}
                              </span>
                            </td>
                            <td>
                              <span className={styles.mono}>{movement.quantityDelta}</span>
                            </td>
                            <td>
                              <div className={styles.cellTitle}>
                                <div className={styles.cellMain}>
                                  OH: {movement.beforeOnHand} · RS: {movement.beforeReserved}
                                </div>
                                <div className={styles.cellSub}>AV: {movement.beforeAvailable}</div>
                              </div>
                            </td>
                            <td>
                              <div className={styles.cellTitle}>
                                <div className={styles.cellMain}>
                                  OH: {movement.afterOnHand} · RS: {movement.afterReserved}
                                </div>
                                <div className={styles.cellSub}>AV: {movement.afterAvailable}</div>
                              </div>
                            </td>
                            <td>
                              <div className={styles.cellTitle}>
                                <div className={styles.cellMain}>{movement.referenceType || "--"}</div>
                                <div className={styles.cellSub}>{movement.referenceId || shortId(movement.id)}</div>
                              </div>
                            </td>
                            <td>
                              <span className={styles.mono}>{movement.createdBy || "--"}</span>
                            </td>
                            <td>
                              <div className={styles.cellTitle}>
                                <div className={styles.cellMain}>{formatDate(movement.createdAt)}</div>
                                <div className={styles.cellSub}>{movement.note || "--"}</div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className={styles.footerNote}>
                <i className="bi bi-shield-check" />
                <span>
                  Tip: available = onHand - reserved. Khi manual update hoặc tạo movement, hệ thống sẽ sync lại
                  ProductVariant.stockQty.
                </span>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

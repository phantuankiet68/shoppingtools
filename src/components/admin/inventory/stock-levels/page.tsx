"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/stock-levels/stock-levels.module.css";

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
  | "MANUAL"
  | string;

type ProductLite = {
  id: string;
  name: string;
  slug?: string;
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
  metadata?: any;
  createdBy?: string | null;
  createdAt: string;
  variant?: VariantLite | null;
  stockLevel?: StockLevel | null;
};

type StockLevelsResponse = {
  data: StockLevel[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

type StockLevelDetailResponse = {
  data: StockLevel;
};

type StockMovementsResponse = {
  data: StockMovement[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

type StockMovementCreateResponse = {
  message: string;
  data: {
    stockLevel: StockLevel;
    movement: StockMovement;
  };
};

const SITE_ID = "site_123"; // đổi theo site thật của bạn

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as any)?.message || `HTTP ${res.status}`);
  }

  return data as T;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
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
  switch (String(type).toUpperCase()) {
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
  const t = String(type).toUpperCase();

  if (t === "RESTOCK" || t === "RETURN" || t === "PURCHASE_RECEIPT" || t === "ADJUSTMENT_INCREASE" || t === "OPENING") {
    return styles.badgeOk;
  }

  if (
    t === "SALE" ||
    t === "DAMAGE" ||
    t === "LOSS" ||
    t === "ADJUSTMENT_DECREASE" ||
    t === "PURCHASE_RECEIPT_CANCEL"
  ) {
    return styles.badgeBad;
  }

  return styles.badgeOff;
}

function shortId(id: string) {
  if (!id) return "";
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

export default function StockLevelsPage() {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [activeVariantId, setActiveVariantId] = useState<string>("");

  const [activeStockLevel, setActiveStockLevel] = useState<StockLevel | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [query, setQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [movementTypeFilter, setMovementTypeFilter] = useState<MovementType | "ALL">("ALL");

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    onHand: 0,
    reserved: 0,
    incoming: 0,
    reorderPoint: 0,
    safetyStock: 0,
    note: "",
    createdBy: "admin_001",
  });

  const [movementForm, setMovementForm] = useState({
    type: "ADJUSTMENT_INCREASE" as MovementType,
    quantity: 1,
    note: "",
    referenceType: "",
    referenceId: "",
    createdBy: "admin_001",
  });

  const visibleStockLevels = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = lowStockOnly
      ? stockLevels.filter((x) => (x.reorderPoint != null ? x.available <= Number(x.reorderPoint) : false))
      : stockLevels;

    if (!q) {
      return [...list].sort((a, b) => {
        const aLow = a.reorderPoint != null && a.available <= Number(a.reorderPoint) ? 1 : 0;
        const bLow = b.reorderPoint != null && b.available <= Number(b.reorderPoint) ? 1 : 0;
        if (aLow !== bLow) return bLow - aLow;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }

    return list
      .filter((item) => {
        const productName = item.variant?.product?.name ?? "";
        const sku = item.variant?.sku ?? "";
        const title = item.variant?.title ?? "";
        const text = `${productName} ${sku} ${title} ${item.variantId}`.toLowerCase();
        return text.includes(q);
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [stockLevels, lowStockOnly, query]);

  const visibleMovements = useMemo(() => {
    const list =
      movementTypeFilter === "ALL"
        ? movements
        : movements.filter((m) => String(m.type).toUpperCase() === String(movementTypeFilter).toUpperCase());

    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [movements, movementTypeFilter]);

  const stats = useMemo(() => {
    const total = stockLevels.length;
    const lowStock = stockLevels.filter((x) =>
      x.reorderPoint != null ? x.available <= Number(x.reorderPoint) : false,
    ).length;
    const outOfStock = stockLevels.filter((x) => x.available <= 0).length;
    const totalOnHand = stockLevels.reduce((sum, x) => sum + Number(x.onHand || 0), 0);
    const totalReserved = stockLevels.reduce((sum, x) => sum + Number(x.reserved || 0), 0);

    return {
      total,
      lowStock,
      outOfStock,
      totalOnHand,
      totalReserved,
    };
  }, [stockLevels]);

  async function loadStockLevels() {
    try {
      setLoadingList(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("siteId", SITE_ID);
      params.set("page", "1");
      params.set("limit", "200");
      if (lowStockOnly) params.set("lowStockOnly", "true");

      const res = await apiJson<StockLevelsResponse>(`/api/admin/inventory/stock-levels?${params.toString()}`);

      const list = res.data ?? [];
      setStockLevels(list);

      setActiveVariantId((prev) => {
        if (prev && list.some((x) => x.variantId === prev)) return prev;
        return list[0]?.variantId || "";
      });
    } catch (e: any) {
      setError(e?.message || "Không tải được stock levels");
    } finally {
      setLoadingList(false);
    }
  }

  async function loadStockLevelDetail(variantId: string) {
    try {
      setLoadingDetail(true);
      setError(null);

      const params = new URLSearchParams({ siteId: SITE_ID });

      const [stockRes, movementsRes] = await Promise.all([
        apiJson<StockLevelDetailResponse>(`/api/admin/inventory/stock-levels/${variantId}?${params.toString()}`),
        apiJson<StockMovementsResponse>(
          `/api/admin/inventory/stock-movements?siteId=${encodeURIComponent(
            SITE_ID,
          )}&variantId=${encodeURIComponent(variantId)}&page=1&limit=100`,
        ),
      ]);

      const stock = stockRes.data;
      setActiveStockLevel(stock);
      setMovements(movementsRes.data ?? []);

      setEditForm({
        onHand: Number(stock.onHand || 0),
        reserved: Number(stock.reserved || 0),
        incoming: Number(stock.incoming || 0),
        reorderPoint: Number(stock.reorderPoint || 0),
        safetyStock: Number(stock.safetyStock || 0),
        note: "",
        createdBy: "admin_001",
      });

      setMovementForm((prev) => ({
        ...prev,
        quantity: 1,
        note: "",
        referenceType: "",
        referenceId: "",
      }));
    } catch (e: any) {
      setError(e?.message || "Không tải được chi tiết stock level");
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadStockLevels();
  }, [lowStockOnly]);

  useEffect(() => {
    if (activeVariantId) {
      loadStockLevelDetail(activeVariantId);
    } else {
      setActiveStockLevel(null);
      setMovements([]);
    }
  }, [activeVariantId]);

  function selectVariant(variantId: string) {
    setActiveVariantId(variantId);
    setMovementTypeFilter("ALL");
  }

  async function saveStockLevel() {
    if (!activeVariantId) return;

    try {
      setBusy("saveStockLevel");
      setError(null);

      const payload = {
        siteId: SITE_ID,
        onHand: clamp(Math.trunc(Number(editForm.onHand || 0)), 0, 1_000_000_000),
        reserved: clamp(Math.trunc(Number(editForm.reserved || 0)), 0, 1_000_000_000),
        incoming: clamp(Math.trunc(Number(editForm.incoming || 0)), 0, 1_000_000_000),
        reorderPoint: clamp(Math.trunc(Number(editForm.reorderPoint || 0)), 0, 1_000_000_000),
        safetyStock: clamp(Math.trunc(Number(editForm.safetyStock || 0)), 0, 1_000_000_000),
        note: editForm.note || "Manual stock level update",
        createdBy: editForm.createdBy || "admin_001",
        syncStockQty: true,
      };

      await apiJson(`/api/admin/inventory/stock-levels/${activeVariantId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      await loadStockLevels();
      await loadStockLevelDetail(activeVariantId);
    } catch (e: any) {
      setError(e?.message || "Cập nhật stock level thất bại");
    } finally {
      setBusy(null);
    }
  }

  async function createMovement() {
    if (!activeVariantId) return;

    try {
      setBusy("createMovement");
      setError(null);

      const payload = {
        siteId: SITE_ID,
        variantId: activeVariantId,
        type: movementForm.type,
        quantity: clamp(Math.trunc(Number(movementForm.quantity || 0)), 1, 1_000_000_000),
        note: movementForm.note || undefined,
        referenceType: movementForm.referenceType.trim() || undefined,
        referenceId: movementForm.referenceId.trim() || undefined,
        createdBy: movementForm.createdBy || "admin_001",
      };

      await apiJson<StockMovementCreateResponse>(`/api/admin/inventory/stock-movements`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMovementForm((prev) => ({
        ...prev,
        quantity: 1,
        note: "",
        referenceType: "",
        referenceId: "",
      }));

      await loadStockLevels();
      await loadStockLevelDetail(activeVariantId);
    } catch (e: any) {
      setError(e?.message || "Tạo stock movement thất bại");
    } finally {
      setBusy(null);
    }
  }

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
            <div className={styles.title}>Inventory Stock Levels</div>
            <div className={styles.subtitle}>Theo dõi tồn kho, điều chỉnh số lượng và audit stock movements</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button
            className={styles.btnGhost}
            type="button"
            onClick={() => loadStockLevels()}
            disabled={loadingList || busy !== null}
          >
            <i className="bi bi-arrow-clockwise" />
            Refresh
          </button>

          <button
            className={styles.btnPrimary}
            type="button"
            onClick={() => setLowStockOnly((prev) => !prev)}
            disabled={busy !== null}
          >
            <i className="bi bi-exclamation-diamond" />
            {lowStockOnly ? "Show all" : "Low stock only"}
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorBar}>
          <i className="bi bi-exclamation-triangle" />
          <div>
            <div className={styles.errorTitle}>Something went wrong</div>
            <div className={styles.errorText}>{error}</div>
          </div>
        </div>
      )}

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
        {/* Left panel */}
        <aside className={styles.sidebar}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Stock levels</div>
            <div className={styles.panelHint}>Danh sách variant tồn kho hiện tại</div>
          </div>

          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input
              className={styles.search}
              placeholder="Search by product, sku, variant..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.list}>
            {loadingList ? (
              <div className={styles.skeletonList}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div className={styles.skeletonRow} key={i} />
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
                const active = item.variantId === activeVariantId;
                const isLow = item.reorderPoint != null ? item.available <= Number(item.reorderPoint) : false;
                const isOut = Number(item.available) <= 0;

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    className={`${styles.rowBtn} ${active ? styles.rowActive : ""}`}
                    onClick={() => selectVariant(item.variantId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") selectVariant(item.variantId);
                    }}
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
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right detail */}
        <section className={styles.detail}>
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelTitle}>Stock detail</div>
              <div className={styles.panelHint}>Xem tồn kho chi tiết, cập nhật trực tiếp và theo dõi movement log</div>
            </div>
          </div>

          {!activeVariantId ? (
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
                  <div className={styles.itemsHint}>Cập nhật trực tiếp các số tồn và đồng bộ `stockQty`</div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>On hand</div>
                    <input
                      className={styles.search}
                      type="number"
                      value={editForm.onHand}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          onHand: clamp(Number(e.target.value || 0), 0, 1_000_000_000),
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
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          reserved: clamp(Number(e.target.value || 0), 0, 1_000_000_000),
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
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          incoming: clamp(Number(e.target.value || 0), 0, 1_000_000_000),
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
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          reorderPoint: clamp(Number(e.target.value || 0), 0, 1_000_000_000),
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
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          safetyStock: clamp(Number(e.target.value || 0), 0, 1_000_000_000),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Created by</div>
                    <input
                      className={styles.search}
                      value={editForm.createdBy}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          createdBy: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField} style={{ gridColumn: "1 / -1" }}>
                    <div className={styles.metaLabel}>Note</div>
                    <textarea
                      className={styles.search}
                      rows={3}
                      value={editForm.note}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          note: e.target.value,
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
                      className={styles.search}
                      value={movementForm.type}
                      onChange={(e) =>
                        setMovementForm((prev) => ({
                          ...prev,
                          type: e.target.value,
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
                      onChange={(e) =>
                        setMovementForm((prev) => ({
                          ...prev,
                          quantity: clamp(Number(e.target.value || 1), 1, 1_000_000_000),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Created by</div>
                    <input
                      className={styles.search}
                      value={movementForm.createdBy}
                      onChange={(e) =>
                        setMovementForm((prev) => ({
                          ...prev,
                          createdBy: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Reference type</div>
                    <input
                      className={styles.search}
                      value={movementForm.referenceType}
                      onChange={(e) =>
                        setMovementForm((prev) => ({
                          ...prev,
                          referenceType: e.target.value,
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
                      onChange={(e) =>
                        setMovementForm((prev) => ({
                          ...prev,
                          referenceId: e.target.value,
                        }))
                      }
                      placeholder="order_123 / audit_001"
                    />
                  </div>

                  <div className={styles.metaField} style={{ gridColumn: "1 / -1" }}>
                    <div className={styles.metaLabel}>Note</div>
                    <textarea
                      className={styles.search}
                      rows={3}
                      value={movementForm.note}
                      onChange={(e) =>
                        setMovementForm((prev) => ({
                          ...prev,
                          note: e.target.value,
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
                  Tip: `available = onHand - reserved`. Khi manual update hoặc tạo movement, hệ thống sẽ sync lại
                  `ProductVariant.stockQty`.
                </span>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

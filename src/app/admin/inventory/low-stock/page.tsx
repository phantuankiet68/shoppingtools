"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/styles/admin/inventory/low-stock.module.css";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

type InventoryItem = {
  id: string;
  stock: number;
  soldQty: number;
  importQty: number;
  reservedQty: number;
  updatedAt: string;

  product: {
    id: string;
    name: string;
    sku: string | null;
    barcode: string | null;
    price: number;

    category?: {
      name: string;
    } | null;

    brand?: {
      name: string;
    } | null;

    images?: {
      imageUrl: string;
    }[];
  };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type InventoryStats = {
  totalSkus: number;
  totalUnits: number;
  lowStock: number;
  totalValue: number;
};

export default function LowStockPage() {
  const { t, locale } = useAdminI18n();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState(10);
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [stats, setStats] = useState<InventoryStats>({
    totalSkus: 0,
    totalUnits: 0,
    lowStock: 0,
    totalValue: 0,
  });

  const abortRef = useRef<AbortController | null>(null);

  const fetchLowStock = useCallback(async () => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        threshold: String(threshold),
        search: search.trim(),
      });

      const res = await fetch(`/api/admin/inventory/low-stock?${params.toString()}`, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${t("inventory.lowStock.httpError")} ${res.status}`);
      }

      const data = await res.json();

      if (controller.signal.aborted) return;

      if (data.success) {
        setItems(data.data || []);

        setPagination(
          data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
        );

        if (data.stats) {
          setStats(data.stats);
        }

        if (data.pagination?.totalPages > 0 && page > data.pagination.totalPages) {
          setPage(1);
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error(t("inventory.lowStock.fetchFailed"), error);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, threshold, search]);

  useEffect(() => {
    fetchLowStock();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchLowStock]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (page !== 1) {
      setPage(1);
      return;
    }

    fetchLowStock();
  }

  function handleThresholdChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setThreshold(Number(e.target.value));
    setPage(1);
  }

  function renderStatus(stock: number) {
    if (stock <= 0) {
      return <span className={`${styles.badge} ${styles.reorder}`}>{t("inventory.lowStock.status.reorder")}</span>;
    }

    if (stock <= threshold) {
      return <span className={`${styles.badge} ${styles.low}`}>{t("inventory.lowStock.status.lowStock")}</span>;
    }

    return <span className={`${styles.badge} ${styles.instock}`}>{t("inventory.lowStock.status.inStock")}</span>;
  }

  function escapeCsv(value: unknown) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  }

  function handleExport() {
    const headers = [
      t("inventory.lowStock.table.sku"),
      t("inventory.lowStock.table.name"),
      t("inventory.lowStock.table.barcode"),
      t("inventory.lowStock.table.stock"),
      t("inventory.lowStock.table.category"),
      t("inventory.lowStock.table.status"),
    ];

    const rows = items.map((item) => [
      item.product.sku ?? "-",
      item.product.name,
      item.product.barcode ?? "-",
      item.stock,
      item.product.category?.name ?? "-",
      item.stock <= 0
        ? t("inventory.lowStock.status.reorder")
        : item.stock <= threshold
          ? t("inventory.lowStock.status.lowStock")
          : t("inventory.lowStock.status.inStock"),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `low-stock-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function handleFilter() {
    if (process.env.NODE_ENV === "development") {
      console.log(t("inventory.lowStock.logs.filterClicked"));
    }
  }

  function handleRowAction(itemId: string) {
    if (process.env.NODE_ENV === "development") {
      console.log(t("inventory.lowStock.logs.rowAction"), itemId);
    }
  }

  const formattedTotalValue = stats.totalValue.toLocaleString(
    locale === "vi" ? "vi-VN" : locale === "ja" ? "ja-JP" : "en-US",
  );

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.mainGrid}>
          <div className={styles.inventoryCard}>
            <div className={styles.inventoryHeader}>
              <div className={styles.inventoryTitle}>
                <div>
                  <h2>{t("inventory.lowStock.title")}</h2>

                  <p>{t("inventory.lowStock.description")}</p>
                </div>

                <div className={styles.liveBadge}>
                  <span className={styles.liveDot} />

                  {t("inventory.lowStock.live")}
                </div>
              </div>

              <div className={styles.actions}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <div className={styles.searchBox}>
                    <i className={`bi bi-search ${styles.searchIcon}`} />

                    <input
                      type="text"
                      placeholder={t("inventory.lowStock.searchPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>
                </form>

                <select value={threshold} onChange={handleThresholdChange} className={styles.select}>
                  <option value={5}>{t("inventory.lowStock.threshold.lessThan")} 5</option>

                  <option value={10}>{t("inventory.lowStock.threshold.lessThan")} 10</option>

                  <option value={20}>{t("inventory.lowStock.threshold.lessThan")} 20</option>

                  <option value={50}>{t("inventory.lowStock.threshold.lessThan")} 50</option>
                </select>

                <button
                  className={styles.iconBtn}
                  onClick={handleFilter}
                  type="button"
                  title={t("inventory.lowStock.actions.filter")}
                >
                  <i className="bi bi-funnel" />
                </button>

                <button
                  className={styles.iconBtn}
                  onClick={handleExport}
                  type="button"
                  title={t("inventory.lowStock.actions.exportCsv")}
                >
                  <i className="bi bi-download" />
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t("inventory.lowStock.table.sku")}</th>

                    <th>{t("inventory.lowStock.table.name")}</th>

                    <th>{t("inventory.lowStock.table.thumb")}</th>

                    <th>{t("inventory.lowStock.table.quantity")}</th>

                    <th>{t("inventory.lowStock.table.category")}</th>

                    <th>{t("inventory.lowStock.table.status")}</th>

                    <th>{t("inventory.lowStock.table.action")}</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.loading}>{t("inventory.lowStock.loadingInventory")}</div>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.empty}>{t("inventory.lowStock.noInventory")}</div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const image = item.product.images?.[0]?.imageUrl || "/no-image.png";

                      return (
                        <tr key={item.id}>
                          <td className={styles.sku}>{item.product.sku || "-"}</td>

                          <td>
                            <div className={styles.productInfo}>
                              <div>
                                <h4>{item.product.name}</h4>

                                <span>{item.product.barcode || "-"}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <img src={image} alt={item.product.name} className={styles.thumb} />
                          </td>

                          <td className={styles.qty}>{item.stock}</td>

                          <td>{item.product.category?.name || "-"}</td>

                          <td>{renderStatus(item.stock)}</td>

                          <td>
                            <button
                              className={styles.moreBtn}
                              onClick={() => handleRowAction(item.id)}
                              type="button"
                              title={t("inventory.lowStock.actions.moreActions")}
                            >
                              <i className="bi bi-three-dots" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.footer}>
              <span>
                {t("inventory.lowStock.showing")} {items.length} {t("inventory.lowStock.of")} {pagination.total}{" "}
                {t("inventory.lowStock.results")}
              </span>

              <div className={styles.pagination}>
                <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)} type="button">
                  <i className="bi bi-chevron-left" />

                  {t("inventory.lowStock.pagination.prev")}
                </button>

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  type="button"
                >
                  {t("inventory.lowStock.pagination.next")}

                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.activityCard}>
              <div className={styles.statsGrid}>
                <div className={styles.card}>
                  <div className={styles.cardTop}>
                    <span>{t("inventory.lowStock.stats.totalSkus")}</span>

                    <div className={styles.iconBlue}>
                      <i className="bi bi-box-seam" />
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <h2>{stats.totalSkus}</h2>

                    <p>+2.4%</p>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardTop}>
                    <span>{t("inventory.lowStock.stats.totalUnits")}</span>

                    <div className={styles.iconGray}>
                      <i className="bi bi-stack" />
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <h2>{stats.totalUnits}</h2>

                    <p>+0.8%</p>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardTop}>
                    <span>{t("inventory.lowStock.stats.lowStockAlerts")}</span>

                    <div className={styles.iconYellow}>
                      <i className="bi bi-bell" />
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <h2>{stats.lowStock}</h2>

                    <p>{t("inventory.lowStock.stats.unchanged")}</p>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardTop}>
                    <span>{t("inventory.lowStock.stats.totalValue")}</span>

                    <div className={styles.iconGreen}>
                      <i className="bi bi-cash-stack" />
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <h2>${stats.totalValue.toLocaleString()}</h2>

                    <p>+1.2%</p>
                  </div>
                </div>
              </div>

              <h3>{t("inventory.lowStock.recentActivity")}</h3>

              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${styles.blue}`}>
                    <i className="bi bi-box-arrow-in-down" />
                  </div>

                  <div>
                    <h4>{t("inventory.lowStock.activities.stockReceived.title")}</h4>

                    <p>{t("inventory.lowStock.activities.stockReceived.description")}</p>

                    <span>{t("inventory.lowStock.activities.stockReceived.time")}</span>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${styles.green}`}>
                    <i className="bi bi-check-circle" />
                  </div>

                  <div>
                    <h4>{t("inventory.lowStock.activities.orderFulfilled.title")}</h4>

                    <p>{t("inventory.lowStock.activities.orderFulfilled.description")}</p>

                    <span>{t("inventory.lowStock.activities.orderFulfilled.time")}</span>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${styles.gray}`}>
                    <i className="bi bi-pencil" />
                  </div>

                  <div>
                    <h4>{t("inventory.lowStock.activities.adjustmentMade.title")}</h4>

                    <p>{t("inventory.lowStock.activities.adjustmentMade.description")}</p>

                    <span>{t("inventory.lowStock.activities.adjustmentMade.time")}</span>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${styles.yellow}`}>
                    <i className="bi bi-exclamation-circle" />
                  </div>

                  <div>
                    <h4>{t("inventory.lowStock.activities.lowStockTriggered.title")}</h4>

                    <p>{t("inventory.lowStock.activities.lowStockTriggered.description")}</p>

                    <span>{t("inventory.lowStock.activities.lowStockTriggered.time")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

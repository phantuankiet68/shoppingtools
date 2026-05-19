"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  RefreshCcw,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import styles from "@/styles/admin/inventory/history.module.css";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

type HistoryItem = {
  id: string;
  type: "IMPORT" | "SALE" | "RETURN" | "ADJUST" | "EXPORT";
  quantity: number;
  beforeQty: number;
  afterQty: number;
  note: string | null;
  createdAt: string;

  product: {
    id: string;
    name: string;
    sku: string | null;

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

export default function InventoryHistoryPage() {
  const { t } = useAdminI18n();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [typeFilter, setTypeFilter] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  async function fetchHistory(signal?: AbortSignal) {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });

      if (typeFilter) {
        params.append("type", typeFilter);
      }

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await fetch(`/api/admin/inventory/history?${params.toString()}`, {
        cache: "no-store",
        signal,
      });

      if (!res.ok) {
        throw new Error("Failed to fetch inventory history");
      }

      const data = await res.json();

      if (data.success) {
        setItems(data.data || []);

        setPagination(
          data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
          },
        );
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    fetchHistory(controller.signal);

    return () => {
      controller.abort();
    };
  }, [page, typeFilter, search]);

  const stats = useMemo(() => {
    const imports = items.filter((item) => item.type === "IMPORT").length;

    const sales = items.filter((item) => item.type === "SALE").length;

    const returns = items.filter((item) => item.type === "RETURN").length;

    const adjusts = items.filter((item) => item.type === "ADJUST").length;

    return {
      imports,
      sales,
      returns,
      adjusts,
    };
  }, [items]);

  function renderBadge(type: string) {
    switch (type) {
      case "IMPORT":
        return (
          <div className={`${styles.badge} ${styles.import}`}>
            <ArrowDownToLine size={14} />
            {t("inventoryHistory.import")}
          </div>
        );

      case "SALE":
        return (
          <div className={`${styles.badge} ${styles.sale}`}>
            <ArrowUpFromLine size={14} />
            {t("inventoryHistory.sale")}
          </div>
        );

      case "RETURN":
        return (
          <div className={`${styles.badge} ${styles.return}`}>
            <RotateCcw size={14} />
            {t("inventoryHistory.return")}
          </div>
        );

      case "ADJUST":
        return (
          <div className={`${styles.badge} ${styles.adjust}`}>
            <SlidersHorizontal size={14} />
            {t("inventoryHistory.adjust")}
          </div>
        );

      default:
        return (
          <div className={`${styles.badge} ${styles.export}`}>
            <Package size={14} />
            EXPORT
          </div>
        );
    }
  }

  function handleFilter(type: string) {
    setTypeFilter(type);
    setPage(1);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.mainContent}>
        <div className={styles.leftSide}>
          <div className={styles.statsGrid}>
            <div className={`${styles.card} ${styles.importCard}`}>
              <div className={styles.cardTop}>
                <div>
                  <span className={styles.cardLabel}>{t("inventoryHistory.totalImports")}</span>

                  <h2>{stats.imports}</h2>
                </div>

                <div className={styles.iconBox}>
                  <ArrowDownToLine size={18} />
                </div>
              </div>

              <p>{t("inventoryHistory.incomingWarehouseStock")}</p>
            </div>

            <div className={`${styles.card} ${styles.saleCard}`}>
              <div className={styles.cardTop}>
                <div>
                  <span className={styles.cardLabel}>{t("inventoryHistory.totalSales")}</span>

                  <h2>{stats.sales}</h2>
                </div>

                <div className={styles.iconBox}>
                  <ArrowUpFromLine size={18} />
                </div>
              </div>

              <p>{t("inventoryHistory.outgoingProductQuantity")}</p>
            </div>

            <div className={`${styles.card} ${styles.returnCard}`}>
              <div className={styles.cardTop}>
                <div>
                  <span className={styles.cardLabel}>{t("inventoryHistory.returns")}</span>

                  <h2>{stats.returns}</h2>
                </div>

                <div className={styles.iconBox}>
                  <RotateCcw size={18} />
                </div>
              </div>

              <p>{t("inventoryHistory.customerReturnActivities")}</p>
            </div>

            <div className={`${styles.card} ${styles.adjustCard}`}>
              <div className={styles.cardTop}>
                <div>
                  <span className={styles.cardLabel}>{t("inventoryHistory.adjustments")}</span>

                  <h2>{stats.adjusts}</h2>
                </div>

                <div className={styles.iconBox}>
                  <SlidersHorizontal size={18} />
                </div>
              </div>

              <p>{t("inventoryHistory.manualStockUpdates")}</p>
            </div>
          </div>

          <div className={styles.chartArea}>
            <div className={styles.chartGrid}>
              {[100, 80, 60, 40, 20].map((line) => (
                <div key={line} className={styles.gridLine}>
                  <span>{line}</span>
                </div>
              ))}
            </div>

            <div className={styles.chartBars}>
              {[
                { month: t("months.jan"), value: 35 },
                { month: t("months.feb"), value: 55 },
                { month: t("months.mar"), value: 42 },
                { month: t("months.apr"), value: 75 },
                { month: t("months.may"), value: 60 },
                { month: t("months.jun"), value: 90 },
                { month: t("months.jul"), value: 70 },
                { month: t("months.aug"), value: 95 },
                { month: t("months.sep"), value: 82 },
                { month: t("months.oct"), value: 100 },
                { month: t("months.nov"), value: 78 },
                { month: t("months.dec"), value: 65 },
              ].map((item) => (
                <div key={item.month} className={styles.chartItem}>
                  <div className={styles.barWrapper}>
                    <div className={styles.tooltip}>
                      {item.value} {t("inventoryHistory.transactions")}
                    </div>

                    <div
                      className={styles.bar}
                      style={{
                        height: `${item.value}%`,
                      }}
                    >
                      <div className={styles.barGlow} />
                    </div>
                  </div>

                  <span className={styles.month}>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />

                <input
                  type="text"
                  placeholder={t("inventoryHistory.searchPlaceholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className={styles.segmented}>
                <button className={typeFilter === "" ? styles.segmentActive : ""} onClick={() => handleFilter("")}>
                  {t("inventoryHistory.all")}
                </button>

                <button
                  className={typeFilter === "IMPORT" ? styles.segmentActive : ""}
                  onClick={() => handleFilter("IMPORT")}
                >
                  {t("inventoryHistory.import")}
                </button>

                <button
                  className={typeFilter === "SALE" ? styles.segmentActive : ""}
                  onClick={() => handleFilter("SALE")}
                >
                  {t("inventoryHistory.sale")}
                </button>

                <button
                  className={typeFilter === "RETURN" ? styles.segmentActive : ""}
                  onClick={() => handleFilter("RETURN")}
                >
                  {t("inventoryHistory.return")}
                </button>

                <button
                  className={typeFilter === "ADJUST" ? styles.segmentActive : ""}
                  onClick={() => handleFilter("ADJUST")}
                >
                  {t("inventoryHistory.adjust")}
                </button>
              </div>
            </div>

            <div className={styles.toolbarRight}>
              <div className={styles.resultBox}>
                <span>{pagination.total}</span>

                {t("inventoryHistory.results")}
              </div>

              <button className={styles.iconBtn} onClick={() => fetchHistory()}>
                <RefreshCcw size={16} />
              </button>

              <button className={styles.exportBtn}>
                <Download size={15} />

                {t("inventoryHistory.export")}
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <div className={styles.table}>
              <div className={`${styles.row} ${styles.head}`}>
                <div>{t("inventoryHistory.product")}</div>

                <div>{t("inventoryHistory.sku")}</div>

                <div>{t("inventoryHistory.note")}</div>

                <div>{t("inventoryHistory.transaction")}</div>

                <div>{t("inventoryHistory.quantity")}</div>

                <div>{t("inventoryHistory.before")}</div>

                <div>{t("inventoryHistory.after")}</div>

                <div>{t("inventoryHistory.date")}</div>
              </div>

              {loading ? (
                <div className={styles.loading}>{t("inventoryHistory.loadingHistory")}</div>
              ) : items.length === 0 ? (
                <div className={styles.empty}>
                  <Package size={48} />

                  <h3>{t("inventoryHistory.noInventoryHistory")}</h3>

                  <p>{t("inventoryHistory.warehouseActivitiesWillAppearHere")}</p>
                </div>
              ) : (
                items.map((item) => {
                  const image = item.product.images?.[0]?.imageUrl || "/no-image.png";

                  return (
                    <div key={item.id} className={styles.row}>
                      <div className={styles.productCell}>
                        <Image
                          src={image}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          className={styles.image}
                          onError={(e: any) => {
                            e.currentTarget.src = "/no-image.png";
                          }}
                        />

                        <div>
                          <p className={styles.productName}>{item.product.name}</p>
                        </div>
                      </div>

                      <div className={styles.productSku}>{item.product.sku || "-"}</div>

                      <div className={styles.productSku}>{item.note || "-"}</div>

                      <div>{renderBadge(item.type)}</div>

                      <div className={item.type === "SALE" ? styles.minusQty : styles.plusQty}>
                        {item.type === "SALE" ? "-" : "+"}
                        {item.quantity}
                      </div>

                      <div className={styles.numberText}>{item.beforeQty}</div>

                      <div className={styles.numberText}>{item.afterQty}</div>

                      <div className={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={styles.pagination}>
            <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)} className={styles.pageBtn}>
              <ChevronLeft size={18} />
            </button>

            <div className={styles.pageNumber}>
              {pagination.page} / {pagination.totalPages}
            </div>

            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className={styles.pageBtn}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

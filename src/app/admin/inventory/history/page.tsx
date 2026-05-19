"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/history.module.css";

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

  async function fetchHistory() {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });

      if (typeFilter) {
        params.append("type", typeFilter);
      }

      const res = await fetch(`/api/admin/inventory/history?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setItems(data.data || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, [page, typeFilter]);

  const stats = useMemo(() => {
    const importCount = items.filter((item) => item.type === "IMPORT").length;

    const saleCount = items.filter((item) => item.type === "SALE").length;

    const returnCount = items.filter((item) => item.type === "RETURN").length;

    return {
      importCount,
      saleCount,
      returnCount,
    };
  }, [items]);

  function renderBadge(type: string) {
    switch (type) {
      case "IMPORT":
        return <span className={styles.importBadge}>IMPORT</span>;

      case "SALE":
        return <span className={styles.saleBadge}>SALE</span>;

      case "RETURN":
        return <span className={styles.returnBadge}>RETURN</span>;

      case "ADJUST":
        return <span className={styles.adjustBadge}>ADJUST</span>;

      default:
        return <span className={styles.exportBadge}>EXPORT</span>;
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div>
          <div className={styles.badge}>Warehouse Activity</div>

          <h1 className={styles.title}>Inventory History</h1>

          <p className={styles.subtitle}>
            Track all inventory movements, imports, sales and stock adjustments in real time.
          </p>
        </div>

        <div className={styles.heroCards}>
          <div className={styles.heroCard}>
            <span>Imports</span>
            <strong>{stats.importCount}</strong>
          </div>

          <div className={styles.heroCard}>
            <span>Sales</span>
            <strong>{stats.saleCount}</strong>
          </div>

          <div className={styles.heroCard}>
            <span>Returns</span>
            <strong>{stats.returnCount}</strong>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={styles.select}>
          <option value="">All Transactions</option>

          <option value="IMPORT">IMPORT</option>

          <option value="SALE">SALE</option>

          <option value="RETURN">RETURN</option>

          <option value="ADJUST">ADJUST</option>

          <option value="EXPORT">EXPORT</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`}>
            <div>Product</div>
            <div>Type</div>
            <div>Quantity</div>
            <div>Before</div>
            <div>After</div>
            <div>Note</div>
            <div>Date</div>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading history...</div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>No transaction history found.</div>
          ) : (
            items.map((item) => {
              const image = item.product.images?.[0]?.imageUrl || "/no-image.png";

              return (
                <div key={item.id} className={styles.row}>
                  <div className={styles.productCell}>
                    <img src={image} alt={item.product.name} className={styles.image} />

                    <div>
                      <p className={styles.productName}>{item.product.name}</p>

                      <span className={styles.productSku}>{item.product.sku || "-"}</span>
                    </div>
                  </div>

                  <div>{renderBadge(item.type)}</div>

                  <div className={item.type === "SALE" ? styles.minusQty : styles.plusQty}>
                    {item.type === "SALE" ? "-" : "+"}
                    {item.quantity}
                  </div>

                  <div>{item.beforeQty}</div>

                  <div>{item.afterQty}</div>

                  <div className={styles.note}>{item.note || "-"}</div>

                  <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.pagination}>
        <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)} className={styles.pageBtn}>
          Previous
        </button>

        <span className={styles.pageInfo}>
          Page {pagination.page} / {pagination.totalPages}
        </span>

        <button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className={styles.pageBtn}
        >
          Next
        </button>
      </div>
    </div>
  );
}

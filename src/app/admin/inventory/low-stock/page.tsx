"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/low-stock.module.css";

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

export default function LowStockPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [threshold, setThreshold] = useState(5);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  async function fetchLowStock() {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        threshold: String(threshold),
        search,
      });

      const res = await fetch(`/api/admin/inventory/low-stock?${params.toString()}`, {
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
    fetchLowStock();
  }, [page, threshold]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    setPage(1);

    fetchLowStock();
  }

  const stats = useMemo(() => {
    const critical = items.filter((item) => item.stock <= 0).length;

    const low = items.filter((item) => item.stock > 0 && item.stock <= threshold).length;

    return {
      critical,
      low,
    };
  }, [items, threshold]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroIcon}>
            <i className="bi bi-exclamation-triangle" />
          </div>

          <div>
            <div className={styles.heroBadge}>Inventory Alert System</div>

            <h1 className={styles.heroTitle}>Low Stock Products</h1>

            <p className={styles.heroText}>
              Monitor products with low inventory levels and prevent out-of-stock situations before they affect sales.
            </p>
          </div>
        </div>

        <div className={styles.heroCards}>
          <div className={styles.heroCard}>
            <span>Critical Stock</span>

            <strong>{stats.critical}</strong>
          </div>

          <div className={styles.heroCard}>
            <span>Low Stock</span>

            <strong>{stats.low}</strong>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search product, SKU, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />

          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>

        <select value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className={styles.select}>
          <option value={5}>≤ 5 Stock</option>

          <option value={10}>≤ 10 Stock</option>

          <option value={20}>≤ 20 Stock</option>

          <option value={50}>≤ 50 Stock</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`}>
            <div>Product</div>
            <div>SKU</div>
            <div>Category</div>
            <div>Brand</div>
            <div>Stock</div>
            <div>Sold</div>
            <div>Status</div>
            <div>Updated</div>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading low stock products...</div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📦</div>

              <h3>No low stock products found</h3>

              <p>All products currently have healthy stock levels.</p>
            </div>
          ) : (
            items.map((item) => {
              const image = item.product.images?.[0]?.imageUrl || "/no-image.png";

              return (
                <div key={item.id} className={styles.row}>
                  <div className={styles.productCell}>
                    <img src={image} alt={item.product.name} className={styles.image} />

                    <div>
                      <p className={styles.productName}>{item.product.name}</p>

                      <span className={styles.barcode}>{item.product.barcode || "-"}</span>
                    </div>
                  </div>

                  <div>{item.product.sku || "-"}</div>

                  <div>{item.product.category?.name || "-"}</div>

                  <div>{item.product.brand?.name || "-"}</div>

                  <div>
                    <span className={item.stock <= 0 ? styles.outStock : styles.lowStock}>{item.stock}</span>
                  </div>

                  <div>{item.soldQty}</div>

                  <div>
                    {item.stock <= 0 ? (
                      <span className={styles.outBadge}>Out Stock</span>
                    ) : (
                      <span className={styles.lowBadge}>Low Stock</span>
                    )}
                  </div>

                  <div>{new Date(item.updatedAt).toLocaleDateString()}</div>
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

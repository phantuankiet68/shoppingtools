"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/inventory.module.css";
import Image from "next/image";
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
    status: string;

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

type ProductOption = {
  id: string;
  name: string;
};

export default function InventoryPage() {
  const { t } = useAdminI18n();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [openImport, setOpenImport] = useState(false);

  const [products, setProducts] = useState<ProductOption[]>([]);

  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [note, setNote] = useState("");

  const [importLoading, setImportLoading] = useState(false);

  async function fetchInventory() {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
      });

      const res = await fetch(`/api/admin/inventory?${params.toString()}`, {
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
    fetchInventory();
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  const stats = useMemo(() => {
    const totalStock = items.reduce((acc, item) => {
      return acc + item.stock;
    }, 0);

    const totalSold = items.reduce((acc, item) => {
      return acc + item.soldQty;
    }, 0);

    const lowStock = items.filter((item) => item.stock <= 5).length;

    const outStock = items.filter((item) => item.stock <= 0).length;

    return {
      totalStock,
      totalSold,
      lowStock,
      outStock,
    };
  }, [items]);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/admin/products/simple");

      const data = await res.json();

      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleImportStock(e: React.FormEvent) {
    e.preventDefault();

    try {
      setImportLoading(true);

      const res = await fetch("/api/admin/inventory/import", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          productId,
          quantity,
          note,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(t("inventory.importStockSuccess"));

        setOpenImport(false);

        setProductId("");
        setQuantity(1);
        setNote("");

        fetchInventory();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setImportLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topbar}>
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIcon}>
              <i className="bi bi-box-seam" />
            </div>

            <div>
              <h1 className={styles.heroTitle}>{t("inventory.inventoryDashboard")}</h1>

              <div className={styles.heroBadge}>{t("inventory.warehouseManagement")}</div>
            </div>
          </div>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <span>{t("inventory.totalStock")}</span>
            <strong>{stats.totalStock}</strong>
          </div>

          <div className={styles.card}>
            <span>{t("inventory.totalSold")}</span>
            <strong>{stats.totalSold}</strong>
          </div>

          <div className={styles.card}>
            <span>{t("inventory.lowStock")}</span>
            <strong>{stats.lowStock}</strong>
          </div>

          <div className={styles.card}>
            <span>{t("inventory.outOfStock")}</span>
            <strong>{stats.outStock}</strong>
          </div>
        </div>

        <form onSubmit={handleSearch} className={styles.searchBar}>
          <div className={styles.searchInputWrap}>
            <i className={`bi bi-search ${styles.searchIcon}`} />

            <input
              type="text"
              placeholder={t("inventory.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button type="submit" className={styles.searchBtn}>
            <i className="bi bi-search" />
          </button>
        </form>

        <button className={styles.importBtn} onClick={() => setOpenImport(true)}>
          + {t("inventory.importStock")}
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`}>
            <div>{t("inventory.product")}</div>
            <div>{t("inventory.sku")}</div>
            <div>{t("inventory.category")}</div>
            <div>{t("inventory.brand")}</div>
            <div>{t("inventory.stock")}</div>
            <div>{t("inventory.sold")}</div>
            <div>{t("inventory.imported")}</div>
            <div>{t("inventory.reserved")}</div>
            <div>{t("inventory.status")}</div>
            <div>{t("inventory.updated")}</div>
          </div>

          {loading ? (
            <div className={styles.loading}>{t("inventory.loadingInventory")}</div>
          ) : items.length === 0 ? (
            <div className={styles.empty}>{t("inventory.noInventoryFound")}</div>
          ) : (
            items.map((item) => {
              const image = item.product.images?.[0]?.imageUrl || "/no-image.png";

              return (
                <div key={item.id} className={styles.row}>
                  <div className={styles.productCell}>
                    <Image src={image} alt={item.product.name} width={60} height={60} className={styles.image} />

                    <div>
                      <p className={styles.productName}>{item.product.name}</p>

                      <span className={styles.barcode}>{item.product.barcode || "-"}</span>
                    </div>
                  </div>

                  <div>{item.product.sku || "-"}</div>

                  <div>{item.product.category?.name || "-"}</div>

                  <div>{item.product.brand?.name || "-"}</div>

                  <div>
                    <span className={item.stock <= 5 ? styles.lowStock : styles.stock}>{item.stock}</span>
                  </div>

                  <div>{item.soldQty}</div>

                  <div>{item.importQty}</div>

                  <div>{item.reservedQty}</div>

                  <div>
                    {item.stock <= 0 ? (
                      <span className={styles.outBadge}>{t("inventory.outStock")}</span>
                    ) : item.stock <= 5 ? (
                      <span className={styles.lowBadge}>{t("inventory.lowStockStatus")}</span>
                    ) : (
                      <span className={styles.inBadge}>{t("inventory.inStock")}</span>
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
          {t("inventory.previous")}
        </button>

        <span className={styles.pageInfo}>
          {t("inventory.page")} {pagination.page} / {pagination.totalPages}
        </span>

        <button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className={styles.pageBtn}
        >
          {t("inventory.next")}
        </button>
      </div>

      {openImport && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalGlow} />

            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalBadge}>
                  <i className="bi bi-box-arrow-in-down" />
                  <span>{t("inventory.warehouseManagement")}</span>
                </div>

                <p className={styles.modalDesc}>Add inventory quantity into warehouse stock</p>
              </div>

              <button type="button" onClick={() => setOpenImport(false)} className={styles.closeBtn}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleImportStock} className={styles.form}>
              <div className={styles.formGroup}>
                <label>{t("inventory.product")}</label>

                <div className={styles.inputWrap}>
                  <i className={`bi bi-box-seam ${styles.inputIcon}`} />

                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="">{t("inventory.selectProduct")}</option>

                    {products.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>{t("inventory.quantity")}</label>

                <div className={styles.inputWrap}>
                  <i className={`bi bi-123 ${styles.inputIcon}`} />

                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>{t("inventory.note")}</label>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Write import note..."
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setOpenImport(false)} className={styles.cancelBtn}>
                  Cancel
                </button>

                <button type="submit" className={styles.submitBtn} disabled={importLoading}>
                  {importLoading ? (
                    <>
                      <span className={styles.spinner} />
                      {t("inventory.importing")}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle" />
                      {t("inventory.importStock")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

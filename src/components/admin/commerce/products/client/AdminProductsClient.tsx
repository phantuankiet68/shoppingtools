"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "@/styles/admin/commerce/products/products.module.css";
import ProductsList from "@/components/admin/commerce/products/list/ProductsList";
import ProductForm from "@/components/admin/commerce/products/add/ProductForm";

/** ========== Types (rút gọn từ bạn) ========== */
type ApiImage = { id?: string; url: string; isCover?: boolean; sort?: number };
type ApiCategory = { id: string; name: string; isActive: boolean; count?: number };
export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  priceCents: number;
  costCents: number;
  stock: number;
  isActive: boolean;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  images?: ApiImage[];
};

type SortKey = "Newest" | "PriceAsc" | "PriceDesc" | "NameAsc";

export type Filters = {
  q: string;
  categoryIds: string[];
  priceMin: string;
  priceMax: string;
  active: "all" | "active" | "inactive";
  sort: SortKey;
};

type ApiError = { error?: string };
type ApiListResponse<T> = ApiError & { items?: T[]; total?: number };

const DEFAULT_FILTERS: Filters = {
  q: "",
  categoryIds: [],
  priceMin: "",
  priceMax: "",
  active: "all",
  sort: "Newest",
};

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => "");
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

function centsFromInput(v: string) {
  const raw = String(v ?? "")
    .trim()
    .replace(/\s+/g, "");
  const noThousands = raw.replace(/,/g, "");
  const cleaned = noThousands.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  const normalized = parts.length <= 2 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n * 100));
}

function readCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

export default function AdminProductsClient() {
  const [tab, setTab] = useState<"list" | "form">("list");

  const [items, setItems] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // form state: create vs edit
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = useCallback(async (signal?: AbortSignal) => {
    try {
      const siteId = readCookie("siteId");
      if (!siteId) return setCategories([]);

      const params = new URLSearchParams({
        page: "1",
        pageSize: "200",
        active: "all",
        sort: "nameAsc",
        siteId,
      });

      const res = await fetch(`/api/admin/commerce/products/product-categories?${params.toString()}`, {
        cache: "no-store",
        signal,
        credentials: "include",
      });

      const json = await safeJson<ApiListResponse<ApiCategory>>(res);
      if (!res.ok) throw new Error(json?.error || "Failed to load categories");
      setCategories(Array.isArray(json.items) ? json.items : []);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadWithFilters = useCallback(async (f: Filters, signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (f.q.trim()) params.set("q", f.q.trim());
      params.set("active", f.active);

      params.set(
        "sort",
        f.sort === "PriceAsc"
          ? "priceAsc"
          : f.sort === "PriceDesc"
            ? "priceDesc"
            : f.sort === "NameAsc"
              ? "nameAsc"
              : "newest",
      );

      if (f.categoryIds.length > 0) params.set("categoryIds", f.categoryIds.join(","));

      if (f.priceMin.trim()) params.set("priceMinCents", String(centsFromInput(f.priceMin)));
      if (f.priceMax.trim()) params.set("priceMaxCents", String(centsFromInput(f.priceMax)));

      params.set("page", "1");
      params.set("pageSize", "50");

      const res = await fetch(`/api/admin/commerce/products?${params.toString()}`, { cache: "no-store", signal });
      const json = await safeJson<ApiListResponse<ApiProduct>>(res);
      if (!res.ok) throw new Error(json?.error || "Failed to load products");

      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error("Failed to load products");
      setItems([]);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void loadWithFilters(DEFAULT_FILTERS, ac.signal);
    void loadCategories(ac.signal);
    return () => ac.abort();
  }, [loadWithFilters, loadCategories]);

  const onCreateNew = () => {
    setEditingId(null);
    setTab("form");
  };

  const onEdit = (id: string) => {
    setEditingId(id);
    setTab("form");
  };

  const onSaved = async () => {
    setTab("list");
    await loadWithFilters(filters);
  };

  const onCancelForm = () => {
    setTab("list");
    setEditingId(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.title}>Product Builder</div>
          <div className={styles.subtitle}>Create, manage products, pricing, stock & images.</div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${tab === "list" ? styles.tabActive : ""}`}
              onClick={() => setTab("list")}
              type="button"
            >
              Product list
            </button>
            <button
              className={`${styles.tabBtn} ${tab === "form" ? styles.tabActive : ""}`}
              onClick={() => setTab("form")}
              type="button"
            >
              {editingId ? "Edit product" : "Create product"}
            </button>
          </div>

          {tab === "list" ? (
            <button className={styles.primaryBtn} type="button" onClick={onCreateNew} disabled={busy}>
              + New product
            </button>
          ) : null}
        </div>
      </header>

      <main className={styles.content}>
        {tab === "list" ? (
          <ProductsList
            items={items}
            categories={categories}
            filters={filters}
            setFilters={setFilters}
            loading={loading}
            busy={busy}
            error={error}
            onRefresh={() => void loadWithFilters(filters)}
            onApply={() => void loadWithFilters(filters)}
            onEdit={onEdit}
            setBusy={setBusy}
            afterMutate={() => void loadWithFilters(filters)}
          />
        ) : (
          <ProductForm
            editingId={editingId}
            categories={categories}
            busy={busy}
            setBusy={setBusy}
            onCancel={onCancelForm}
            onSaved={() => void onSaved()}
          />
        )}
      </main>
    </div>
  );
}

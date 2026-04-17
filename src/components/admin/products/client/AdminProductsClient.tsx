"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/styles/admin/commerce/products/products.module.css";
import ProductsList from "@/components/admin/products/list/ProductsList";
import ProductForm from "@/components/admin/products/add/ProductForm";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

/* =========================
   TYPES
========================= */

type ApiImage = {
  id?: string;
  url: string;
  isCover?: boolean;
  sort?: number;
};

type ApiCategory = {
  id: string;
  name: string;
  isActive: boolean;
  count?: number;
};

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
  status?: string;
};

export type SortKey =
  | "Newest"
  | "Oldest"
  | "NameAsc"
  | "NameDesc"
  | "CategoryAsc"
  | "CategoryDesc"
  | "PriceAsc"
  | "PriceDesc"
  | "StockAsc"
  | "StockDesc"
  | "StatusAsc"
  | "StatusDesc";

export type Filters = {
  q: string;
  categoryIds: string[];
  priceMin: string;
  priceMax: string;
  active: "all" | "active" | "inactive";
  sort: SortKey;
};

type ApiError = { error?: string };
type ApiListResponse<T> = ApiError & { items?: T[] };

const DEFAULT_FILTERS: Filters = {
  q: "",
  categoryIds: [],
  priceMin: "",
  priceMax: "",
  active: "all",
  sort: "Newest",
};

/* =========================
   HELPERS
========================= */

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : ({} as T);
  } catch {
    return {} as T;
  }
}

function centsFromInput(v: string) {
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function toApiSort(sort: SortKey) {
  switch (sort) {
    case "PriceAsc":
      return "priceAsc";
    case "PriceDesc":
      return "priceDesc";
    case "NameAsc":
      return "nameAsc";
    case "NameDesc":
      return "nameDesc";
    case "Oldest":
      return "oldest";
    default:
      return "newest";
  }
}

/* =========================
   COMPONENT
========================= */

export default function AdminProductsClient() {
  const { sites, currentSite } = useAdminAuth();

  const siteId = currentSite?.id ?? sites?.[0]?.id ?? "";

  const [tab, setTab] = useState<"list" | "form">("list");
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /* =========================
     LOAD DATA
  ========================= */

  const fetchProducts = useCallback(async (f: Filters) => {
    if (!siteId) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("siteId", siteId);
      params.set("active", f.active);
      params.set("sort", toApiSort(f.sort));

      if (f.q.trim()) params.set("q", f.q.trim());
      if (f.categoryIds.length) params.set("categoryIds", f.categoryIds.join(","));
      if (f.priceMin) params.set("priceMinCents", String(centsFromInput(f.priceMin)));
      if (f.priceMax) params.set("priceMaxCents", String(centsFromInput(f.priceMax)));

      const res = await fetch(`/api/admin/commerce/products?${params}`, {
        signal: controller.signal,
        cache: "no-store",
      });

      const json = await safeJson<ApiListResponse<ApiProduct>>(res);
      if (!res.ok) throw new Error(json.error || "Load products failed");

      setItems(json.items ?? []);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message || "Error");
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  const fetchCategories = useCallback(async () => {
    if (!siteId) return;

    try {
      const res = await fetch(`/api/admin/products/product-categories?siteId=${siteId}`, {
        cache: "no-store",
      });

      const json = await safeJson<ApiListResponse<ApiCategory>>(res);
      setCategories(json.items ?? []);
    } catch {
      setCategories([]);
    }
  }, [siteId]);

  /* =========================
     EFFECTS
  ========================= */

  // load lần đầu
  useEffect(() => {
    if (!siteId) return;

    fetchProducts(DEFAULT_FILTERS);
    fetchCategories();
  }, [siteId]);

  // debounce filter (🔥 giảm load server mạnh)
  useEffect(() => {
    if (!siteId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchProducts(filters);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, siteId]);

  /* =========================
     ACTIONS
  ========================= */

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
    fetchProducts(filters);
  };

  const onCancelForm = () => {
    setTab("list");
    setEditingId(null);
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        {tab === "list" ? (
          <ProductsList
            title="Product Builder"
            subtitle="Create, manage products..."
            items={items}
            categories={categories}
            filters={filters}
            setFilters={setFilters}
            loading={loading}
            busy={busy}
            error={error}
            onRefresh={() => fetchProducts(filters)}
            onApply={() => fetchProducts(filters)}
            onEdit={onEdit}
            setBusy={setBusy}
            afterMutate={() => fetchProducts(filters)}
            tab={tab}
            editingId={editingId}
            onOpenList={() => setTab("list")}
            onOpenForm={onCreateNew}

            // multi-site
            sites={sites}
            sitesLoading={false}
            selectedSiteId={siteId}
            onChangeSite={(id) => {
              console.log("switch site:", id);
            }}
          />
        ) : (
          <ProductForm
            editingId={editingId}
            categories={categories}
            busy={busy}
            setBusy={setBusy}
            onCancel={onCancelForm}
            onSaved={onSaved}
          />
        )}
      </main>
    </div>
  );
}
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/styles/admin/commerce/products/products.module.css";
import ProductsList from "@/components/admin/products/list/ProductsList";
import ProductForm from "@/components/admin/products/add/ProductForm";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

type ApiImage = {
  id?: string;
  url: string;
  isCover?: boolean;
  sort?: number;
};

type ApiCategory = {
  id: string;
  name: string;
  isActive?: boolean;
  count?: number;
};

type ApiBrand = {
  id: string;
  name: string;
  isActive?: boolean;
};

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  sku?: string;
  barcode?: string | null;

  price?: string | number;
  marketPrice?: string | number;
  savingPrice?: string | number;

  priceCents?: number;
  costCents?: number;

  stock?: number;
  productQty?: number;

  isActive?: boolean;
  isVisible?: boolean;

  status?: string;
  productType?: string;

  categoryId: string | null;

  category?: {
    id: string;
    name: string;
  } | null;

  brandId: string | null;

  brand?: {
    id: string;
    name: string;
  } | null;

  createdAt: string;
  updatedAt: string;

  images?: ApiImage[];
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
  brandIds: string[];
  priceMin: string;
  priceMax: string;
  active: "all" | "active" | "inactive";
  sort: SortKey;
};

type ApiError = {
  error?: string;
};

type ApiListResponse<T> = ApiError & {
  success?: boolean;
  data?: T[];
  items?: T[];
};

const DEFAULT_FILTERS: Filters = {
  q: "",
  categoryIds: [],
  brandIds: [],
  priceMin: "",
  priceMax: "",
  active: "all",
  sort: "Newest",
};

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

export default function AdminProductsClient() {
  const { sites, currentSite } = useAdminAuth();

  const [selectedSiteId, setSelectedSiteId] = useState(currentSite?.id ?? sites?.[0]?.id ?? "");

  const [tab, setTab] = useState<"list" | "form">("list");

  const [items, setItems] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProducts = useCallback(
    async (f: Filters) => {
      if (!selectedSiteId) {
        setItems([]);
        return;
      }

      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("siteId", selectedSiteId);
        params.set("active", f.active);
        params.set("sort", toApiSort(f.sort));

        if (f.q.trim()) {
          params.set("q", f.q.trim());
        }

        if (f.categoryIds.length) {
          params.set("categoryIds", f.categoryIds.join(","));
        }

        if (f.brandIds.length) {
          params.set("brandIds", f.brandIds.join(","));
        }

        if (f.priceMin) {
          params.set("priceMinCents", String(centsFromInput(f.priceMin)));
        }

        if (f.priceMax) {
          params.set("priceMaxCents", String(centsFromInput(f.priceMax)));
        }

        const res = await fetch(`/api/admin/products?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        const json = await safeJson<ApiListResponse<ApiProduct>>(res);

        if (!res.ok) {
          throw new Error(json.error || "Load products failed");
        }

        setItems(json.items ?? json.data ?? []);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message || "Error");
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedSiteId],
  );

  const fetchCategories = useCallback(async () => {
    if (!selectedSiteId) {
      setCategories([]);
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/product-categories?siteId=${selectedSiteId}`, {
        cache: "no-store",
      });

      const json = await safeJson<ApiListResponse<ApiCategory>>(res);
      setCategories(json.items ?? []);
    } catch {
      setCategories([]);
    }
  }, [selectedSiteId]);

  const fetchBrands = useCallback(async () => {
    if (!selectedSiteId) {
      setBrands([]);
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/product-brands?siteId=${selectedSiteId}`, {
        cache: "no-store",
      });

      const json = await safeJson<ApiListResponse<ApiBrand>>(res);

      setBrands(json.data ?? []);
    } catch {
      setBrands([]);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (!selectedSiteId) {
      setItems([]);
      setCategories([]);
      setBrands([]);
      return;
    }

    fetchCategories();
    fetchBrands();
  }, [selectedSiteId, fetchCategories, fetchBrands]);

  useEffect(() => {
    if (!selectedSiteId) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchProducts(filters);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters, selectedSiteId, fetchProducts]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      abortRef.current?.abort();
    };
  }, []);

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

    await fetchProducts(filters);
  };

  const onCancelForm = () => {
    setTab("list");
    setEditingId(null);
  };

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        {tab === "list" ? (
          <ProductsList
            items={items}
            categories={categories}
            brands={brands}
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
            sites={sites}
            sitesLoading={false}
            selectedSiteId={selectedSiteId}
            onChangeSite={(id) => {
              setSelectedSiteId(id);
            }}
          />
        ) : (
          <ProductForm
            editingId={editingId}
            busy={busy}
            setBusy={setBusy}
            onCancel={onCancelForm}
            categories={categories}
            brands={brands}
            onSaved={onSaved}
            siteId={selectedSiteId}
            sites={sites}
            selectedSiteId={selectedSiteId}
            onChangeSite={setSelectedSiteId}
          />
        )}
      </main>
    </div>
  );
}

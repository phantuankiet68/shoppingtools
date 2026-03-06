"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/commerce/products/products.module.css";
import ProductsList from "@/components/admin/commerce/products/list/ProductsList";
import ProductForm from "@/components/admin/commerce/products/add/ProductForm";
import { useSiteStore } from "@/store/site/site.store";

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
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const m = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; samesite=lax`;
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
    case "Newest":
    case "CategoryAsc":
    case "CategoryDesc":
    case "StockAsc":
    case "StockDesc":
    case "StatusAsc":
    case "StatusDesc":
    default:
      return "newest";
  }
}

export default function AdminProductsClient() {
  const [tab, setTab] = useState<"list" | "form">("list");
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const sites = useSiteStore((s) => s.sites);
  const sitesLoading = useSiteStore((s) => s.loading);
  const sitesErr = useSiteStore((s) => s.err);
  const selectedSiteId = useSiteStore((s) => s.siteId);
  const setSelectedSiteId = useSiteStore((s) => s.setSiteId);
  const loadSites = useSiteStore((s) => s.loadSites);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  useEffect(() => {
    if (selectedSiteId) return;
    const fromCookie = readCookie("siteId").trim();
    if (fromCookie) setSelectedSiteId(fromCookie);
  }, [selectedSiteId, setSelectedSiteId]);

  const siteId = useMemo(() => {
    const storeValue = (selectedSiteId ?? "").trim();
    if (storeValue) return storeValue;

    const cookieValue = readCookie("siteId").trim();
    if (cookieValue) return cookieValue;

    return "";
  }, [selectedSiteId]);

  useEffect(() => {
    if (!siteId) return;
    const current = readCookie("siteId").trim();
    if (current !== siteId) setCookie("siteId", siteId);
  }, [siteId]);

  const loadCategories = useCallback(
    async (signal?: AbortSignal) => {
      try {
        if (!siteId) {
          setCategories([]);
          return;
        }

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
    },
    [siteId],
  );

  const loadWithFilters = useCallback(
    async (f: Filters, signal?: AbortSignal) => {
      setLoading(true);
      setError("");

      try {
        if (!siteId) throw new Error("Missing siteId. Please re-select site.");

        const params = new URLSearchParams();
        params.set("siteId", siteId);

        if (f.q.trim()) params.set("q", f.q.trim());
        params.set("active", f.active);
        params.set("sort", toApiSort(f.sort));

        if (f.categoryIds.length > 0) {
          params.set("categoryIds", f.categoryIds.join(","));
        }

        if (f.priceMin.trim()) {
          params.set("priceMinCents", String(centsFromInput(f.priceMin)));
        }

        if (f.priceMax.trim()) {
          params.set("priceMaxCents", String(centsFromInput(f.priceMax)));
        }

        params.set("page", "1");
        params.set("pageSize", "50");

        const res = await fetch(`/api/admin/commerce/products?${params.toString()}`, {
          cache: "no-store",
          signal,
          credentials: "include",
        });

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
    },
    [siteId],
  );

  useEffect(() => {
    const ac = new AbortController();

    if (!siteId) {
      setItems([]);
      setCategories([]);
      setError("Missing siteId. Please re-select site.");
      setLoading(false);
      return () => ac.abort();
    }

    void loadWithFilters(DEFAULT_FILTERS, ac.signal);
    void loadCategories(ac.signal);

    return () => ac.abort();
  }, [siteId, loadWithFilters, loadCategories]);

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
      <main className={styles.content}>
        {tab === "list" ? (
          <ProductsList
            title="Product Builder"
            subtitle="Create, manage products, pricing, stock, categories and images."
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
            sites={sites}
            sitesLoading={sitesLoading}
            sitesErr={sitesErr}
            selectedSiteId={selectedSiteId || ""}
            onChangeSite={(next) => {
              setSelectedSiteId(next);

              if (next) setCookie("siteId", next);
              else clearCookie("siteId");

              setFilters(DEFAULT_FILTERS);
              setEditingId(null);
              setTab("list");
            }}
            tab={tab}
            editingId={editingId}
            onOpenList={() => setTab("list")}
            onOpenForm={onCreateNew}
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

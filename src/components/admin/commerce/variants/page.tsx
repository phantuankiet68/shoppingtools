"use client";

import { useEffect, useMemo, useState } from "react";
import { useSiteStore } from "@/store/site/site.store";
import styles from "@/styles/admin/commerce/variants/variants.module.css";

type ProductRow = {
  id: string;
  name: string;
  skuPrefix: string;
  image?: string | null;
};

type VariantImageRow = {
  id: string;
  url: string;
  isCover: boolean;
  sort: number;
};

type VariantRow = {
  id: string;
  productId: string;
  siteId: string;
  sku: string;
  title?: string | null;
  isActive: boolean;
  price: number;
  compareAtPrice?: number | null;
  cost?: number | null;
  stockQty: number;
  barcode?: string | null;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  isDefault: boolean;
  images: VariantImageRow[];
  createdAt: string;
  updatedAt: string;
};

type LooseDbVariant = {
  id: string;
  productId: string;
  siteId?: string | null;
  sku?: string | null;
  title?: string | null;
  isActive?: boolean | null;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  cost?: number | string | null;
  stockQty?: number | null;
  barcode?: string | null;
  weight?: number | string | null;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  isDefault?: boolean | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  images?: Array<{
    id: string;
    url?: string | null;
    imageUrl?: string | null;
    isCover?: boolean | null;
    sort?: number | null;
    sortOrder?: number | null;
  }>;
};

type ProductLiteResponse = {
  items: ProductRow[];
};

type VariantListResponse = {
  items: LooseDbVariant[];
};

type VariantItemResponse = {
  item: LooseDbVariant;
};

type VariantImagesResponse = {
  items: Array<{
    id: string;
    url?: string;
    imageUrl?: string;
    isCover?: boolean;
    sort?: number;
    sortOrder?: number;
  }>;
};

type VariantCreatePayload = {
  productId: string;
  siteId: string;
  sku: string;
  title: string | null;
  isActive: boolean;
  price: number;
  compareAtPrice: number | null;
  cost: number | null;
  stockQty: number;
  barcode: string | null;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  isDefault: boolean;
};

type VariantPatchPayload = Partial<{
  sku: string;
  title: string | null;
  isActive: boolean;
  price: number;
  compareAtPrice: number | null;
  cost: number | null;
  stockQty: number;
  barcode: string | null;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  isDefault: boolean;
}>;

const SAVE_METHOD: "PATCH" | "PUT" = "PATCH";

function nowIso() {
  return new Date().toISOString();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function slugSku(s: string) {
  return s
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatMoney(value: number | null | undefined) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function uniqueSkuForProduct(prefix: string, existingSkus: Set<string>, base = "NEW") {
  const baseSku = slugSku(`${prefix}-${base}`);
  if (!existingSkus.has(baseSku)) return baseSku;

  for (let i = 2; i < 10000; i += 1) {
    const sku = slugSku(`${prefix}-${base}-${i}`);
    if (!existingSkus.has(sku)) return sku;
  }

  return slugSku(`${prefix}-${base}-${Date.now()}`);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function safeIso(v: unknown) {
  const d = v ? new Date(v as string | Date) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeNullableNumber(value: unknown) {
  if (value === "" || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeImage(im: {
  id: string;
  url?: string | null;
  imageUrl?: string | null;
  isCover?: boolean | null;
  sort?: number | null;
  sortOrder?: number | null;
}): VariantImageRow {
  return {
    id: String(im.id),
    url: im.url || im.imageUrl || "",
    isCover: !!im.isCover,
    sort: typeof im.sort === "number" ? im.sort : (im.sortOrder ?? 0),
  };
}

function dbToUiVariant(v: LooseDbVariant): VariantRow {
  const images = Array.isArray(v.images) ? v.images.map(normalizeImage) : [];

  return {
    id: String(v.id),
    productId: String(v.productId),
    siteId: String(v.siteId ?? ""),
    sku: String(v.sku ?? ""),
    title: v.title?.trim() || "",
    isActive: !!v.isActive,
    price: toNumber(v.price, 0),
    compareAtPrice: v.compareAtPrice == null ? null : toNumber(v.compareAtPrice, 0),
    cost: v.cost == null ? null : toNumber(v.cost, 0),
    stockQty: Number.isFinite(Number(v.stockQty)) ? Number(v.stockQty) : 0,
    barcode: v.barcode ?? null,
    weight: v.weight == null ? null : toNumber(v.weight, 0),
    length: v.length == null ? null : toNumber(v.length, 0),
    width: v.width == null ? null : toNumber(v.width, 0),
    height: v.height == null ? null : toNumber(v.height, 0),
    isDefault: !!v.isDefault,
    images,
    createdAt: safeIso(v.createdAt),
    updatedAt: safeIso(v.updatedAt),
  };
}

function uiToDbCreatePayload(
  v: Partial<VariantRow> & { productId: string; siteId: string; sku: string },
): VariantCreatePayload {
  return {
    productId: v.productId,
    siteId: v.siteId,
    sku: v.sku,
    title: v.title?.trim() ? v.title.trim() : null,
    isActive: !!v.isActive,
    price: toNumber(v.price, 0),
    compareAtPrice: v.compareAtPrice == null ? null : toNumber(v.compareAtPrice, 0),
    cost: v.cost == null ? null : toNumber(v.cost, 0),
    stockQty: Math.max(0, Math.trunc(toNumber(v.stockQty, 0))),
    barcode: v.barcode?.trim() ? v.barcode.trim() : null,
    weight: v.weight == null ? null : toNumber(v.weight, 0),
    length: v.length == null ? null : toNumber(v.length, 0),
    width: v.width == null ? null : toNumber(v.width, 0),
    height: v.height == null ? null : toNumber(v.height, 0),
    isDefault: !!v.isDefault,
  };
}

function uiToDbPatchPayload(patch: Partial<VariantRow>): VariantPatchPayload {
  const data: VariantPatchPayload = {};

  if (patch.sku !== undefined) data.sku = patch.sku;
  if (patch.title !== undefined) data.title = patch.title?.trim() ? patch.title.trim() : null;
  if (patch.isActive !== undefined) data.isActive = !!patch.isActive;
  if (patch.price !== undefined) data.price = toNumber(patch.price, 0);
  if (patch.compareAtPrice !== undefined) {
    data.compareAtPrice = patch.compareAtPrice == null ? null : toNumber(patch.compareAtPrice, 0);
  }
  if (patch.cost !== undefined) {
    data.cost = patch.cost == null ? null : toNumber(patch.cost, 0);
  }
  if (patch.stockQty !== undefined) {
    data.stockQty = Math.max(0, Math.trunc(toNumber(patch.stockQty, 0)));
  }
  if (patch.barcode !== undefined) data.barcode = patch.barcode?.trim() ? patch.barcode.trim() : null;
  if (patch.weight !== undefined) data.weight = patch.weight == null ? null : toNumber(patch.weight, 0);
  if (patch.length !== undefined) data.length = patch.length == null ? null : toNumber(patch.length, 0);
  if (patch.width !== undefined) data.width = patch.width == null ? null : toNumber(patch.width, 0);
  if (patch.height !== undefined) data.height = patch.height == null ? null : toNumber(patch.height, 0);
  if (patch.isDefault !== undefined) data.isDefault = !!patch.isDefault;

  return data;
}

async function apiJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(input, {
    ...init,
    headers,
  });

  if (res.status === 204) return null as T;

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    if (data && typeof data === "object") {
      const errObj = data as { error?: string; message?: string };
      throw new Error(errObj.error || errObj.message || `HTTP ${res.status}`);
    }
    throw new Error(`HTTP ${res.status}`);
  }

  return data as T;
}

export default function VariantsPage() {
  const sites = useSiteStore((s) => s.sites);
  const sitesLoading = useSiteStore((s) => s.loading);
  const sitesErr = useSiteStore((s) => s.err);
  const selectedSiteId = useSiteStore((s) => s.siteId);
  const setSelectedSiteId = useSiteStore((s) => s.setSiteId);
  const hydrateFromStorage = useSiteStore((s) => s.hydrateFromStorage);
  const loadSites = useSiteStore((s) => s.loadSites);

  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [activeProductId, setActiveProductId] = useState("");

  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [variantQuery, setVariantQuery] = useState("");
  const [activeVariantId, setActiveVariantId] = useState("");

  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeProduct = useMemo(
    () => products.find((p) => p.id === activeProductId) || null,
    [products, activeProductId],
  );

  const visibleProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.skuPrefix.toLowerCase().includes(q));
  }, [products, productQuery]);

  const productVariants = useMemo(() => {
    const q = variantQuery.trim().toLowerCase();
    return variants
      .filter((v) => v.productId === activeProductId)
      .filter((v) => {
        if (!q) return true;
        return `${v.title ?? ""} ${v.sku} ${v.barcode ?? ""}`.toLowerCase().includes(q);
      })
      .slice()
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [variants, activeProductId, variantQuery]);

  const activeVariant = useMemo(
    () => variants.find((v) => v.id === activeVariantId) || null,
    [variants, activeVariantId],
  );

  useEffect(() => {
    hydrateFromStorage();
    void loadSites();
  }, [hydrateFromStorage, loadSites]);

  useEffect(() => {
    const ac = new AbortController();

    async function loadProducts() {
      if (!selectedSiteId) {
        setProducts([]);
        setActiveProductId("");
        setVariants([]);
        setActiveVariantId("");
        return;
      }

      try {
        setError(null);

        const data = await apiJson<ProductLiteResponse>(
          `/api/admin/commerce/products/lite?siteId=${encodeURIComponent(selectedSiteId)}`,
          { signal: ac.signal },
        );

        const items = data.items ?? [];
        setProducts(items);

        setActiveProductId((prev) => {
          if (prev && items.some((item) => item.id === prev)) return prev;
          return items[0]?.id || "";
        });

        setVariants([]);
        setActiveVariantId("");
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        setProducts([]);
        setActiveProductId("");
        setVariants([]);
        setActiveVariantId("");
        setError(getErrorMessage(e, "Failed to load products"));
      }
    }

    void loadProducts();
    return () => ac.abort();
  }, [selectedSiteId]);

  async function fetchVariantsByProduct(productId: string, signal?: AbortSignal) {
    const data = await apiJson<VariantListResponse>(
      `/api/admin/commerce/variants?productId=${encodeURIComponent(productId)}`,
      { signal },
    );

    const rows = (data.items ?? []).map(dbToUiVariant);

    setVariants((prev) => {
      const other = prev.filter((v) => v.productId !== productId);
      return [...other, ...rows];
    });

    return rows;
  }

  async function reloadActiveProductVariants(preferredVariantId?: string) {
    if (!activeProductId) return;

    setLoading(true);
    setError(null);

    try {
      const rows = await fetchVariantsByProduct(activeProductId);

      setActiveVariantId((prev) => {
        if (preferredVariantId && rows.some((row) => row.id === preferredVariantId)) return preferredVariantId;
        if (prev && rows.some((row) => row.id === prev)) return prev;
        return rows[0]?.id || "";
      });
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to load variants"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!activeProductId) {
      setActiveVariantId("");
      return;
    }

    const ac = new AbortController();

    async function loadVariants() {
      setLoading(true);
      setError(null);

      try {
        const rows = await fetchVariantsByProduct(activeProductId, ac.signal);
        setActiveVariantId((prev) => (prev && rows.some((row) => row.id === prev) ? prev : rows[0]?.id || ""));
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        setError(getErrorMessage(e, "Failed to load variants"));
      } finally {
        setLoading(false);
      }
    }

    void loadVariants();
    return () => ac.abort();
  }, [activeProductId]);

  function selectProduct(id: string) {
    setActiveProductId(id);
    setVariantQuery("");
    setActiveVariantId("");
  }

  function patchVariantLocal(id: string, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch, updatedAt: nowIso() } : v)));
  }

  async function saveVariantRemote(id: string, patch: Partial<VariantRow>) {
    setSavingId(id);
    setError(null);

    try {
      await apiJson<unknown>(`/api/admin/commerce/variants/${id}`, {
        method: SAVE_METHOD,
        body: JSON.stringify(uiToDbPatchPayload(patch)),
      });

      await reloadActiveProductVariants(id);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to save"));
    } finally {
      setSavingId(null);
    }
  }

  async function createVariantRemote() {
    if (!activeProduct || !selectedSiteId) return;

    setError(null);

    const existing = new Set(variants.filter((v) => v.productId === activeProduct.id).map((v) => v.sku));
    const sku = uniqueSkuForProduct(activeProduct.skuPrefix, existing, "NEW");

    try {
      const res = await apiJson<VariantItemResponse>(`/api/admin/commerce/variants`, {
        method: "POST",
        body: JSON.stringify(
          uiToDbCreatePayload({
            productId: activeProduct.id,
            siteId: selectedSiteId,
            sku,
            title: "New variant",
            isActive: false,
            price: 0,
            compareAtPrice: null,
            cost: null,
            stockQty: 0,
            barcode: null,
            weight: null,
            length: null,
            width: null,
            height: null,
            isDefault: false,
          }),
        ),
      });

      const createdId = res?.item?.id ? String(res.item.id) : undefined;
      await reloadActiveProductVariants(createdId);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to create"));
    }
  }

  async function duplicateVariantRemote(id: string) {
    const v = variants.find((x) => x.id === id);
    if (!v) return;

    setError(null);

    const p = products.find((pp) => pp.id === v.productId);
    const prefix = p?.skuPrefix || "SKU";

    const existing = new Set(variants.filter((x) => x.productId === v.productId).map((x) => x.sku));
    const sku = uniqueSkuForProduct(prefix, existing, "COPY");

    try {
      const res = await apiJson<VariantItemResponse>(`/api/admin/commerce/variants`, {
        method: "POST",
        body: JSON.stringify(
          uiToDbCreatePayload({
            productId: v.productId,
            siteId: v.siteId || selectedSiteId || "",
            sku,
            title: `${v.title || "Variant"} Copy`,
            isActive: false,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            cost: v.cost,
            stockQty: v.stockQty,
            barcode: v.barcode,
            weight: v.weight,
            length: v.length,
            width: v.width,
            height: v.height,
            isDefault: false,
          }),
        ),
      });

      const createdId = res?.item?.id ? String(res.item.id) : undefined;
      await reloadActiveProductVariants(createdId);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to duplicate"));
    }
  }

  async function deleteVariantRemote(id: string) {
    const v = variants.find((x) => x.id === id);
    if (!v) return;

    const ok = confirm(`Delete variant "${v.title || v.sku}"?`);
    if (!ok) return;

    setError(null);

    try {
      await apiJson<null>(`/api/admin/commerce/variants/${id}`, { method: "DELETE" });
      await reloadActiveProductVariants();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to delete"));
    }
  }

  async function reloadImages(variantId: string) {
    const res = await apiJson<VariantImagesResponse>(`/api/admin/commerce/variants/${variantId}/image`);

    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              images: (res.items ?? []).map(normalizeImage),
              updatedAt: nowIso(),
            }
          : v,
      ),
    );
  }

  async function addImageRemote() {
    if (!activeVariant) return;

    const url = prompt("Image URL?");
    if (!url?.trim()) return;

    setError(null);

    try {
      await apiJson<{ item: unknown }>(`/api/admin/commerce/variants/${activeVariant.id}/image`, {
        method: "POST",
        body: JSON.stringify({
          url: url.trim(),
          isCover: activeVariant.images.length === 0,
          sort: activeVariant.images.length,
        }),
      });

      await reloadImages(activeVariant.id);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to add image"));
    }
  }

  async function setCoverRemote(imageId: string) {
    if (!activeVariant) return;

    setError(null);

    try {
      await apiJson<{ item: unknown }>(`/api/admin/commerce/variants/${activeVariant.id}/image`, {
        method: "PATCH",
        body: JSON.stringify({ imageId, isCover: true }),
      });

      await reloadImages(activeVariant.id);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to set cover"));
    }
  }

  async function removeImageRemote(imageId: string) {
    if (!activeVariant) return;

    setError(null);

    try {
      await apiJson<null>(
        `/api/admin/commerce/variants/${activeVariant.id}/image?imageId=${encodeURIComponent(imageId)}`,
        { method: "DELETE" },
      );

      await reloadImages(activeVariant.id);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to remove image"));
    }
  }

  async function saveActiveVariant() {
    if (!activeVariant) return;

    await saveVariantRemote(activeVariant.id, {
      sku: activeVariant.sku,
      title: activeVariant.title,
      isActive: activeVariant.isActive,
      price: activeVariant.price,
      compareAtPrice: activeVariant.compareAtPrice,
      cost: activeVariant.cost,
      stockQty: activeVariant.stockQty,
      barcode: activeVariant.barcode,
      weight: activeVariant.weight,
      length: activeVariant.length,
      width: activeVariant.width,
      height: activeVariant.height,
      isDefault: activeVariant.isDefault,
    });
  }

  return (
    <div className={styles.shell} style={{ fontSize: 14 }}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Variants</div>
            <div className={styles.brandSub}>Products · Variants · Images</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button
            className={styles.primaryBtn}
            type="button"
            onClick={createVariantRemote}
            disabled={!activeProduct || loading}
            title="Create a single new variant"
          >
            <i className="bi bi-plus-lg" /> New variant
          </button>

          <button
            className={styles.ghostBtn}
            type="button"
            onClick={() => void reloadActiveProductVariants(activeVariantId || undefined)}
            disabled={!activeProductId || loading}
            title="Reload variants"
          >
            <i className="bi bi-arrow-clockwise" /> Reload
          </button>
        </div>
      </header>

      {error && (
        <div style={{ padding: 12, color: "#b91c1c" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Products</div>
            <div className={styles.WrapSite}>
              <span style={{ fontWeight: 700 }}>Site:</span>

              <select
                value={selectedSiteId || ""}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                disabled={sitesLoading}
                className={styles.selectSite}
              >
                <option value="">{sitesLoading ? "Loading sites..." : "Select site"}</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ?? s.id} ({s.id})
                  </option>
                ))}
              </select>

              {sitesErr ? <span style={{ marginLeft: 8, opacity: 0.8 }}>({sitesErr})</span> : null}
            </div>
          </div>

          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input
              className={styles.search}
              placeholder="Search product..."
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              disabled={!selectedSiteId}
            />
          </div>

          <div className={styles.productList}>
            {!selectedSiteId ? (
              <div className={styles.emptyRow} style={{ margin: 12 }}>
                <i className="bi bi-diagram-3" />
                <div>
                  <div className={styles.emptyTitle}>No site selected</div>
                  <div className={styles.emptyText}>Choose a site first.</div>
                </div>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className={styles.emptyRow} style={{ margin: 12 }}>
                <i className="bi bi-inbox" />
                <div>
                  <div className={styles.emptyTitle}>No products</div>
                  <div className={styles.emptyText}>This site has no products yet.</div>
                </div>
              </div>
            ) : (
              visibleProducts.map((p) => {
                const active = p.id === activeProductId;

                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`${styles.productBtn} ${active ? styles.productActive : ""}`}
                    onClick={() => selectProduct(p.id)}
                  >
                    <div className={styles.productLeft}>
                      <div className={styles.thumb}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className={styles.thumbImg}
                          src={p.image || "https://picsum.photos/seed/na/200/200"}
                          alt={p.name}
                        />
                      </div>
                      <div className={styles.productText}>
                        <div className={styles.productName}>{p.name}</div>
                        <div className={styles.productMeta}>
                          <span className={styles.mono}>{p.skuPrefix}</span>
                        </div>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right" />
                  </button>
                );
              })
            )}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>
                Variants unique theo <span className={styles.mono}>[siteId, sku]</span>.
              </span>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.content}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Variants list</div>
                  <div className={styles.panelSub}>{loading ? "Loading..." : "Search, quick actions"}</div>
                </div>
              </div>

              <div className={styles.toolbar}>
                <div className={styles.searchWrapInline}>
                  <i className="bi bi-search" />
                  <input
                    className={styles.searchInline}
                    placeholder="Search variant..."
                    value={variantQuery}
                    onChange={(e) => setVariantQuery(e.target.value)}
                    disabled={!activeProductId}
                  />
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Variant</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className={styles.thRight}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {productVariants.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className={styles.emptyRow}>
                            <i className="bi bi-inbox" />
                            <div>
                              <div className={styles.emptyTitle}>No variants</div>
                              <div className={styles.emptyText}>
                                {activeProductId ? "Create a variant." : "Select a product first."}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      productVariants.map((v) => {
                        const active = v.id === activeVariantId;

                        return (
                          <tr
                            key={v.id}
                            className={`${styles.tr} ${active ? styles.trActive : ""}`}
                            onClick={() => setActiveVariantId(v.id)}
                            role="button"
                          >
                            <td>
                              <div className={styles.cellTitle}>
                                <span className={styles.dot} />
                                <div>
                                  <div className={styles.nameRow}>
                                    <span className={styles.name}>{v.title || "Untitled variant"}</span>
                                  </div>
                                  <div className={styles.sub}>
                                    <span className={styles.mono}>
                                      {v.isDefault ? "Default" : "Custom"}
                                      {v.barcode ? `  ·  ${v.barcode}` : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className={styles.mono}>{v.sku}</td>
                            <td className={styles.mono}>{formatMoney(v.price)}</td>
                            <td className={styles.mono}>{v.stockQty}</td>

                            <td>
                              <span className={`${styles.status} ${v.isActive ? styles.ok : styles.off}`}>
                                <i className={`bi ${v.isActive ? "bi-check2-circle" : "bi-pencil"}`} />
                                {v.isActive ? "ACTIVE" : "DRAFT"}
                              </span>
                            </td>

                            <td className={styles.tdRight} onClick={(e) => e.stopPropagation()}>
                              <button
                                className={styles.iconBtn}
                                type="button"
                                title="Toggle status"
                                onClick={() =>
                                  void saveVariantRemote(v.id, {
                                    isActive: !v.isActive,
                                  })
                                }
                              >
                                <i className="bi bi-toggle2-on" />
                              </button>

                              <button
                                className={styles.iconBtn}
                                type="button"
                                title="Duplicate"
                                onClick={() => duplicateVariantRemote(v.id)}
                              >
                                <i className="bi bi-files" />
                              </button>

                              <button
                                className={`${styles.iconBtn} ${styles.dangerBtn}`}
                                type="button"
                                title="Delete"
                                onClick={() => deleteVariantRemote(v.id)}
                              >
                                <i className="bi bi-trash" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className={styles.inspector}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Inspector</div>
                    <div className={styles.panelSub}>{savingId ? "Saving..." : "Edit fields and images"}</div>
                  </div>

                  {activeVariant ? (
                    <button
                      className={styles.primaryBtn}
                      type="button"
                      onClick={saveActiveVariant}
                      disabled={savingId === activeVariant.id}
                    >
                      <i className="bi bi-floppy" /> Save
                    </button>
                  ) : null}
                </div>

                {!activeVariant ? (
                  <div className={styles.panelBody}>
                    <div className={styles.emptyInspector}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.emptyTitle}>Select a variant</div>
                        <div className={styles.emptyText}>Click a row to edit.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    <label className={styles.label}>Title</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-tag" />
                      <input
                        className={styles.input}
                        value={activeVariant.title ?? ""}
                        onChange={(e) => patchVariantLocal(activeVariant.id, { title: e.target.value })}
                      />
                    </div>

                    <label className={styles.label}>SKU</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-hash" />
                      <input
                        className={styles.input}
                        value={activeVariant.sku}
                        onChange={(e) => patchVariantLocal(activeVariant.id, { sku: slugSku(e.target.value) })}
                      />
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Price</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-cash-stack" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.01"
                            value={activeVariant.price}
                            onChange={(e) =>
                              patchVariantLocal(activeVariant.id, {
                                price: toNumber(e.target.value, 0),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Compare at price</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-currency-dollar" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.01"
                            value={activeVariant.compareAtPrice ?? ""}
                            onChange={(e) =>
                              patchVariantLocal(activeVariant.id, {
                                compareAtPrice: normalizeNullableNumber(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Cost</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-wallet2" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.01"
                            value={activeVariant.cost ?? ""}
                            onChange={(e) =>
                              patchVariantLocal(activeVariant.id, {
                                cost: normalizeNullableNumber(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Stock Qty</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-box-seam" />
                          <input
                            className={styles.input}
                            type="number"
                            value={activeVariant.stockQty}
                            onChange={(e) =>
                              patchVariantLocal(activeVariant.id, {
                                stockQty: clamp(Number(e.target.value || 0), 0, 1_000_000),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Barcode</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-upc-scan" />
                          <input
                            className={styles.input}
                            value={activeVariant.barcode ?? ""}
                            onChange={(e) => patchVariantLocal(activeVariant.id, { barcode: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Status</label>
                        <div className={styles.selectWrap}>
                          <i className="bi bi-flag" />
                          <select
                            className={styles.select}
                            value={String(activeVariant.isActive)}
                            onChange={(e) =>
                              patchVariantLocal(activeVariant.id, {
                                isActive: e.target.value === "true",
                              })
                            }
                          >
                            <option value="true">ACTIVE</option>
                            <option value="false">DRAFT</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Weight</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-box" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.001"
                            value={activeVariant.weight ?? ""}
                            onChange={(e) =>
                              patchVariantLocal(activeVariant.id, {
                                weight: normalizeNullableNumber(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Is default</label>
                        <div className={styles.selectWrap}>
                          <i className="bi bi-star" />
                          <select
                            className={styles.select}
                            value={String(activeVariant.isDefault)}
                            onChange={(e) =>
                              patchVariantLocal(activeVariant.id, {
                                isDefault: e.target.value === "true",
                              })
                            }
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-bounding-box" /> Dimensions
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Length</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-arrows-expand" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.001"
                            value={activeVariant.length ?? ""}
                            onChange={(e) =>
                              patchVariantLocal(activeVariant.id, {
                                length: normalizeNullableNumber(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Width</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-arrows-angle-expand" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.001"
                            value={activeVariant.width ?? ""}
                            onChange={(e) =>
                              patchVariantLocal(activeVariant.id, {
                                width: normalizeNullableNumber(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={styles.label}>Height</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-arrows-vertical" />
                        <input
                          className={styles.input}
                          type="number"
                          step="0.001"
                          value={activeVariant.height ?? ""}
                          onChange={(e) =>
                            patchVariantLocal(activeVariant.id, {
                              height: normalizeNullableNumber(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-images" /> Images (DB)
                    </div>

                    <div className={styles.images}>
                      {activeVariant.images.length === 0 ? (
                        <div className={styles.emptySmall}>No images. Add an image URL.</div>
                      ) : (
                        activeVariant.images
                          .slice()
                          .sort((a, b) => a.sort - b.sort)
                          .map((im) => (
                            <div key={im.id} className={styles.imageRow}>
                              <div className={styles.imageThumb}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={im.url} alt="" />
                              </div>
                              <div className={styles.imageMeta}>
                                <div className={styles.mono}>{im.url}</div>
                                <div className={styles.imageBadges}>
                                  {im.isCover && <span className={styles.badge}>Cover</span>}
                                </div>
                              </div>
                              <div className={styles.imageActions}>
                                <button
                                  className={styles.iconBtn}
                                  type="button"
                                  title="Set cover"
                                  onClick={() => setCoverRemote(im.id)}
                                >
                                  <i className="bi bi-star" />
                                </button>
                                <button
                                  className={`${styles.iconBtn} ${styles.dangerBtn}`}
                                  type="button"
                                  title="Remove"
                                  onClick={() => removeImageRemote(im.id)}
                                >
                                  <i className="bi bi-trash" />
                                </button>
                              </div>
                            </div>
                          ))
                      )}

                      <button className={styles.ghostBtn} type="button" onClick={addImageRemote}>
                        <i className="bi bi-plus-lg" /> Add image URL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

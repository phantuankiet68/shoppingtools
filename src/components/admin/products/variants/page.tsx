"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/product/variants/variants.module.css";

/**
 * API sử dụng:
 *  - GET    /api/admin/products/lite
 *  - GET    /api/admin/product-variant?productId=...
 *  - POST   /api/admin/product-variant
 *  - PATCH  /api/admin/product-variant/[id]
 *  - DELETE /api/admin/product-variant/[id]
 *  - GET/POST/PATCH/DELETE /api/admin/product-variant/[id]/image  (id = variantId)
 */

type Currency = "USD" | "VND";
type VariantStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

type ProductRow = {
  id: string;
  name: string;
  skuPrefix: string; // bạn đang dùng Product.sku làm prefix
  image?: string | null;
};

type VariantImageRow = { id: string; url: string; isCover: boolean; sort: number };

type VariantRow = {
  id: string;
  productId: string;

  name: string;
  sku: string;
  barcode?: string;

  priceCents: number;
  currency: Currency;

  stock: number;

  status: VariantStatus; // map sang DB isActive

  // ✅ map trực tiếp sang DB (không dùng Record nữa để tránh nhầm)
  option1?: string;
  value1?: string;
  option2?: string;
  value2?: string;

  images: VariantImageRow[];

  createdAt: string;
  updatedAt: string;
};

type OptionDef = {
  id: string;
  name: string; // "Color"
  values: string[]; // ["Xanh", "Đỏ"]
};

type DbVariant = {
  id: string;
  productId: string;
  name: string | null;
  sku: string;
  barcode: string | null;
  priceCents: number;
  costCents: number;
  stock: number;
  isActive: boolean;
  option1: string | null;
  value1: string | null;
  option2: string | null;
  value2: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  images: { id: string; url: string; isCover: boolean; sort: number }[];
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

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

function fmtMoney(cents: number, ccy: Currency) {
  if (ccy === "VND") {
    const v = Math.round(cents / 100);
    return v.toLocaleString("vi-VN");
  }
  return (cents / 100).toFixed(2);
}

function uniqueSkuForProduct(prefix: string, existingSkus: Set<string>, base = "NEW") {
  const baseSku = slugSku(`${prefix}-${base}`);
  if (!existingSkus.has(baseSku)) return baseSku;
  for (let i = 2; i < 10000; i++) {
    const sku = slugSku(`${prefix}-${base}-${i}`);
    if (!existingSkus.has(sku)) return sku;
  }
  return slugSku(`${prefix}-${base}-${Date.now()}`);
}

/** ===== DB <-> UI ===== */
function dbToUiVariant(v: DbVariant): VariantRow {
  const status: VariantStatus = v.isActive ? "ACTIVE" : "DRAFT";
  const opt1 = (v.option1 ?? "").trim() || undefined;
  const val1 = (v.value1 ?? "").trim() || undefined;
  const opt2 = (v.option2 ?? "").trim() || undefined;
  const val2 = (v.value2 ?? "").trim() || undefined;

  const displayName = (v.name ?? "").trim() || [val1, val2].filter(Boolean).join(" / ") || "Default";

  return {
    id: v.id,
    productId: v.productId,
    name: displayName,
    sku: v.sku,
    barcode: v.barcode ?? undefined,
    priceCents: v.priceCents ?? 0,
    currency: "USD",
    stock: v.stock ?? 0,
    status,
    option1: opt1,
    value1: val1,
    option2: opt2,
    value2: val2,
    images: (v.images ?? []).map((im) => ({
      id: im.id,
      url: im.url,
      isCover: !!im.isCover,
      sort: im.sort ?? 0,
    })),
    createdAt: new Date(v.createdAt).toISOString(),
    updatedAt: new Date(v.updatedAt).toISOString(),
  };
}

function uiToDbCreatePayload(v: {
  productId: string;
  sku: string;
  name?: string;
  barcode?: string;
  priceCents?: number;
  stock?: number;
  status?: VariantStatus;
  option1?: string;
  value1?: string;
  option2?: string;
  value2?: string;
}) {
  return {
    productId: v.productId,
    sku: v.sku,
    name: v.name?.trim() ? v.name.trim() : null,
    barcode: v.barcode?.trim() ? v.barcode.trim() : null,
    priceCents: Number.isFinite(Number(v.priceCents)) ? Math.max(0, Math.trunc(Number(v.priceCents))) : 0,
    costCents: 0,
    stock: Number.isFinite(Number(v.stock)) ? Math.max(0, Math.trunc(Number(v.stock))) : 0,
    isActive: (v.status ?? "ACTIVE") === "ACTIVE",
    option1: v.option1?.trim() ? v.option1.trim() : null,
    value1: v.value1?.trim() ? v.value1.trim() : null,
    option2: v.option2?.trim() ? v.option2.trim() : null,
    value2: v.value2?.trim() ? v.value2.trim() : null,
  };
}

function uiToDbPatchPayload(patch: Partial<VariantRow>) {
  const data: any = {};

  if (patch.name !== undefined) data.name = patch.name?.trim() ? patch.name.trim() : null;
  if (patch.sku !== undefined) data.sku = patch.sku;
  if (patch.barcode !== undefined) data.barcode = patch.barcode?.trim() ? patch.barcode.trim() : null;

  if (patch.priceCents !== undefined) data.priceCents = Math.max(0, Math.trunc(Number(patch.priceCents)));
  if (patch.stock !== undefined) data.stock = Math.max(0, Math.trunc(Number(patch.stock)));

  if (patch.status !== undefined) data.isActive = patch.status === "ACTIVE";

  if (patch.option1 !== undefined) data.option1 = patch.option1?.trim() ? patch.option1.trim() : null;
  if (patch.value1 !== undefined) data.value1 = patch.value1?.trim() ? patch.value1.trim() : null;
  if (patch.option2 !== undefined) data.option2 = patch.option2?.trim() ? patch.option2.trim() : null;
  if (patch.value2 !== undefined) data.value2 = patch.value2?.trim() ? patch.value2.trim() : null;

  return data;
}

/** ===== fetch helper ===== */
async function apiJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Content-Type": "application/json",
    },
  });

  if (res.status === 204) return null as unknown as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

function optionSummary(v: VariantRow) {
  const a: string[] = [];
  if (v.option1 && v.value1) a.push(`${v.option1}:${v.value1}`);
  if (v.option2 && v.value2) a.push(`${v.option2}:${v.value2}`);
  return a.join("  ·  ");
}

function buildLabelFromValues(v1?: string, v2?: string) {
  const s = [v1, v2].filter(Boolean).join(" / ");
  return s || "Default";
}

export default function VariantsPage() {
  /** ===== UI state ===== */
  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [activeProductId, setActiveProductId] = useState<string>("");

  const activeProduct = useMemo(() => products.find((p) => p.id === activeProductId) || null, [products, activeProductId]);

  /** ===== Option defs: local per product (chỉ dùng Generate) ===== */
  const [optionDefs, setOptionDefs] = useState<Record<string, OptionDef[]>>({});
  const defs = optionDefs[activeProductId] ?? [];

  /** ===== Variants ===== */
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [variantQuery, setVariantQuery] = useState("");
  const [activeVariantId, setActiveVariantId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.skuPrefix.toLowerCase().includes(q));
  }, [products, productQuery]);

  const productVariants = useMemo(() => {
    const q = variantQuery.trim().toLowerCase();
    return variants
      .filter((v) => v.productId === activeProductId)
      .filter((v) => (q ? (v.name + " " + v.sku).toLowerCase().includes(q) : true))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [variants, activeProductId, variantQuery]);

  const activeVariant = useMemo(() => variants.find((v) => v.id === activeVariantId) || null, [variants, activeVariantId]);

  /** ===== load products ===== */
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const data = await apiJson<{ items: ProductRow[] }>("/api/admin/products/lite");
        if (cancelled) return;

        const items = data.items ?? [];
        setProducts(items);
        setActiveProductId(items[0]?.id || "");
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load products");
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  /** ===== load variants when change product ===== */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!activeProductId) return;
      setLoading(true);
      setError(null);

      try {
        const data = await apiJson<{ items: DbVariant[] }>(`/api/admin/product-variant?productId=${encodeURIComponent(activeProductId)}`);
        if (cancelled) return;

        const rows = (data.items ?? []).map(dbToUiVariant);

        setVariants((prev) => {
          const other = prev.filter((v) => v.productId !== activeProductId);
          return [...other, ...rows];
        });

        setActiveVariantId(rows[0]?.id || "");
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load variants");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeProductId]);

  function selectProduct(id: string) {
    setActiveProductId(id);
    setVariantQuery("");
    setActiveVariantId("");
  }

  /** ===== local patch ===== */
  function patchVariantLocal(id: string, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch, updatedAt: nowIso() } : v)));
  }

  async function patchVariantRemote(id: string, patch: Partial<VariantRow>) {
    setSavingId(id);
    setError(null);

    try {
      const res = await apiJson<{ item: DbVariant }>(`/api/admin/product-variant/${id}`, {
        method: "PATCH",
        body: JSON.stringify(uiToDbPatchPayload(patch)),
      });

      const next = dbToUiVariant(res.item as any);
      setVariants((prev) => prev.map((v) => (v.id === id ? next : v)));
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSavingId(null);
    }
  }

  /** ===== CRUD variant ===== */
  async function createVariantRemote() {
    if (!activeProduct) return;
    setError(null);

    const existing = new Set(variants.filter((v) => v.productId === activeProduct.id).map((v) => v.sku));
    const sku = uniqueSkuForProduct(activeProduct.skuPrefix, existing, "NEW");

    try {
      const res = await apiJson<{ item: DbVariant }>(`/api/admin/product-variant`, {
        method: "POST",
        body: JSON.stringify(
          uiToDbCreatePayload({
            productId: activeProduct.id,
            sku,
            name: "New variant",
            priceCents: 0,
            stock: 0,
            status: "DRAFT",
          })
        ),
      });

      const created = dbToUiVariant(res.item as any);
      setVariants((prev) => [...prev, created]);
      setActiveVariantId(created.id);
    } catch (e: any) {
      setError(e?.message || "Failed to create");
    }
  }

  async function duplicateVariantRemote(id: string) {
    const v = variants.find((x) => x.id === id);
    if (!v) return;
    setError(null);

    const existing = new Set(variants.filter((x) => x.productId === v.productId).map((x) => x.sku));
    const sku = uniqueSkuForProduct(v.sku, existing, "COPY");

    try {
      const res = await apiJson<{ item: DbVariant }>(`/api/admin/product-variant`, {
        method: "POST",
        body: JSON.stringify(
          uiToDbCreatePayload({
            productId: v.productId,
            sku,
            name: `${v.name} Copy`,
            barcode: v.barcode,
            priceCents: v.priceCents,
            stock: v.stock,
            status: "DRAFT",
            option1: v.option1,
            value1: v.value1,
            option2: v.option2,
            value2: v.value2,
          })
        ),
      });

      const created = dbToUiVariant(res.item as any);
      setVariants((prev) => [...prev, created]);
      setActiveVariantId(created.id);
    } catch (e: any) {
      setError(e?.message || "Failed to duplicate");
    }
  }

  async function deleteVariantRemote(id: string) {
    const v = variants.find((x) => x.id === id);
    if (!v) return;

    const ok = confirm(`Delete variant "${v.name}"?`);
    if (!ok) return;

    setError(null);
    try {
      await apiJson(`/api/admin/product-variant/${id}`, { method: "DELETE" });
      setVariants((prev) => prev.filter((x) => x.id !== id));

      if (activeVariantId === id) {
        const remain = variants.filter((x) => x.id !== id && x.productId === activeProductId);
        setActiveVariantId(remain[0]?.id || "");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    }
  }

  /** ===== OPTION DEFINITIONS (local) ===== */
  function addOptionDef() {
    const name = prompt("Option name? (e.g. Color, Size)");
    if (!name?.trim()) return;

    setOptionDefs((prev) => ({
      ...prev,
      [activeProductId]: [...(prev[activeProductId] ?? []), { id: uid(), name: name.trim(), values: ["Value"] }],
    }));
  }

  function patchOptionDef(optId: string, patch: Partial<OptionDef>) {
    setOptionDefs((prev) => ({
      ...prev,
      [activeProductId]: (prev[activeProductId] ?? []).map((o) => (o.id === optId ? { ...o, ...patch } : o)),
    }));
  }

  function removeOptionDef(optId: string) {
    const ok = confirm("Remove this option definition?");
    if (!ok) return;

    setOptionDefs((prev) => ({
      ...prev,
      [activeProductId]: (prev[activeProductId] ?? []).filter((o) => o.id !== optId),
    }));
  }

  /** ===== Generate variants from defs (POST many) ===== */
  function cartesian(defsIn: OptionDef[]) {
    const valid = defsIn.filter((o) => o.name.trim() && o.values.length > 0);
    if (valid.length === 0) return [{} as Record<string, string>];

    let acc: Record<string, string>[] = [{}];
    for (const opt of valid) {
      const next: Record<string, string>[] = [];
      for (const a of acc) {
        for (const v of opt.values) next.push({ ...a, [opt.name]: v });
      }
      acc = next;
    }
    return acc;
  }

  async function generateVariantsRemote() {
    if (!activeProduct) return;
    setError(null);

    const cleaned = defs
      .map((d) => ({
        ...d,
        name: d.name.trim(),
        values: d.values.map((x) => x.trim()).filter(Boolean),
      }))
      .filter((d) => d.name && d.values.length);

    if (cleaned.length === 0) {
      return;
    }

    if (cleaned.length > 2) {
      alert("Schema hiện tại chỉ hỗ trợ tối đa 2 options (option1/option2). Hãy giảm còn 2 option.");
      return;
    }

    const combos = cartesian(cleaned);
    if (!combos.length) return;

    const existingSkus = new Set(variants.filter((v) => v.productId === activeProduct.id).map((v) => v.sku));

    // tạo tuần tự để dễ debug (cần nhanh hơn thì mình sẽ thêm limit concurrency)
    const created: VariantRow[] = [];

    for (const opts of combos) {
      const optNames = Object.keys(opts);
      const o1 = optNames[0];
      const o2 = optNames[1];
      const v1 = o1 ? opts[o1] : undefined;
      const v2 = o2 ? opts[o2] : undefined;

      const label = buildLabelFromValues(v1, v2);
      const skuParts = [activeProduct.skuPrefix, v1, v2].filter(Boolean).map((x) => slugSku(String(x)));
      let sku = slugSku(skuParts.join("-") || `${activeProduct.skuPrefix}-DEFAULT`);

      if (existingSkus.has(sku)) continue;

      // đảm bảo unique nếu trùng do format
      sku = uniqueSkuForProduct(activeProduct.skuPrefix, existingSkus, sku.replace(activeProduct.skuPrefix + "-", ""));
      existingSkus.add(sku);

      try {
        const res = await apiJson<{ item: DbVariant }>(`/api/admin/product-variant`, {
          method: "POST",
          body: JSON.stringify(
            uiToDbCreatePayload({
              productId: activeProduct.id,
              sku,
              name: label,
              priceCents: 0,
              stock: 0,
              status: "DRAFT",
              option1: o1,
              value1: v1,
              option2: o2,
              value2: v2,
            })
          ),
        });

        created.push(dbToUiVariant(res.item as any));
      } catch (e: any) {
        setError(e?.message || "Failed to generate some variants");
        break;
      }
    }

    if (!created.length) {
      alert("No new variants to generate (all combinations already exist).");
      return;
    }

    setVariants((prev) => [...prev, ...created]);
    setActiveVariantId(created[0].id);
  }

  /** ===== Images APIs ===== */
  async function reloadImages(variantId: string) {
    const res = await apiJson<{ items: VariantImageRow[] }>(`/api/admin/product-variant/${variantId}/image`);

    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              images: (res.items ?? []).map((im) => ({
                id: im.id,
                url: im.url,
                isCover: !!im.isCover,
                sort: im.sort ?? 0,
              })),
              updatedAt: nowIso(),
            }
          : v
      )
    );
  }

  async function addImageRemote() {
    if (!activeVariant) return;

    const url = prompt("Image URL?");
    if (!url?.trim()) return;

    setError(null);
    try {
      await apiJson<{ item: any }>(`/api/admin/product-variant/${activeVariant.id}/image`, {
        method: "POST",
        body: JSON.stringify({
          url: url.trim(),
          isCover: activeVariant.images.length === 0,
          sort: activeVariant.images.length,
        }),
      });
      await reloadImages(activeVariant.id);
    } catch (e: any) {
      setError(e?.message || "Failed to add image");
    }
  }

  async function setCoverRemote(imageId: string) {
    if (!activeVariant) return;
    setError(null);

    try {
      await apiJson<{ item: any }>(`/api/admin/product-variant/${activeVariant.id}/image`, {
        method: "PATCH",
        body: JSON.stringify({ imageId, isCover: true }),
      });
      await reloadImages(activeVariant.id);
    } catch (e: any) {
      setError(e?.message || "Failed to set cover");
    }
  }

  async function removeImageRemote(imageId: string) {
    if (!activeVariant) return;
    setError(null);

    try {
      await apiJson(`/api/admin/product-variant/${activeVariant.id}/image?imageId=${encodeURIComponent(imageId)}`, { method: "DELETE" });
      await reloadImages(activeVariant.id);
    } catch (e: any) {
      setError(e?.message || "Failed to remove image");
    }
  }

  return (
    <div className={styles.shell} style={{ fontSize: 14 }}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Variants</div>
            <div className={styles.brandSub}>Products · Variants · Options · Generate · Images</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={generateVariantsRemote} disabled={!activeProduct || loading} title="Generate variants from option definitions">
            <i className="bi bi-shuffle" /> Generate
          </button>

          <button className={styles.primaryBtn} type="button" onClick={createVariantRemote} disabled={!activeProduct || loading} title="Create a single new variant">
            <i className="bi bi-plus-lg" /> New variant
          </button>
        </div>
      </header>

      {error && (
        <div style={{ padding: 12, color: "#b91c1c" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className={styles.body}>
        {/* Products sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Products</div>
            <div className={styles.sidebarHint}>Select a product to manage variants</div>
          </div>

          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input className={styles.search} placeholder="Search product..." value={productQuery} onChange={(e) => setProductQuery(e.target.value)} />
          </div>

          <div className={styles.productList}>
            {visibleProducts.map((p) => {
              const active = p.id === activeProductId;
              return (
                <button key={p.id} type="button" className={`${styles.productBtn} ${active ? styles.productActive : ""}`} onClick={() => selectProduct(p.id)}>
                  <div className={styles.productLeft}>
                    <div className={styles.thumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className={styles.thumbImg} src={p.image || "https://picsum.photos/seed/na/200/200"} alt={p.name} />
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
            })}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>
                Variants unique theo <span className={styles.mono}>[productId, sku]</span>.
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.content}>
            {/* Variants table */}
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
                  <input className={styles.searchInline} placeholder="Search variant..." value={variantQuery} onChange={(e) => setVariantQuery(e.target.value)} />
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
                              <div className={styles.emptyText}>Create a variant or generate from options.</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      productVariants.map((v) => {
                        const active = v.id === activeVariantId;
                        const sub = optionSummary(v);

                        return (
                          <tr key={v.id} className={`${styles.tr} ${active ? styles.trActive : ""}`} onClick={() => setActiveVariantId(v.id)} role="button">
                            <td>
                              <div className={styles.cellTitle}>
                                <span className={styles.dot} />
                                <div>
                                  <div className={styles.nameRow}>
                                    <span className={styles.name}>{v.name}</span>
                                  </div>
                                  <div className={styles.sub}>{sub ? <span className={styles.mono}>{sub}</span> : <span className={styles.muted}>No options</span>}</div>
                                </div>
                              </div>
                            </td>

                            <td className={styles.mono}>{v.sku}</td>

                            <td className={styles.mono}>
                              {v.currency} {fmtMoney(v.priceCents, v.currency)}
                            </td>

                            <td className={styles.mono}>{v.stock}</td>

                            <td>
                              <span className={`${styles.status} ${v.status === "ACTIVE" ? styles.ok : v.status === "DRAFT" ? styles.off : styles.bad}`}>
                                <i className={`bi ${v.status === "ACTIVE" ? "bi-check2-circle" : v.status === "DRAFT" ? "bi-pencil" : "bi-archive"}`} />
                                {v.status}
                              </span>
                            </td>

                            <td className={styles.tdRight} onClick={(e) => e.stopPropagation()}>
                              <button
                                className={styles.iconBtn}
                                type="button"
                                title="Toggle status"
                                onClick={() =>
                                  patchVariantRemote(v.id, {
                                    status: v.status === "ACTIVE" ? "DRAFT" : "ACTIVE",
                                  })
                                }>
                                <i className="bi bi-toggle2-on" />
                              </button>

                              <button className={styles.iconBtn} type="button" title="Duplicate" onClick={() => duplicateVariantRemote(v.id)}>
                                <i className="bi bi-files" />
                              </button>

                              <button className={`${styles.iconBtn} ${styles.dangerBtn}`} type="button" title="Delete" onClick={() => deleteVariantRemote(v.id)}>
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

            {/* Inspector */}
            <aside className={styles.inspector}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Inspector</div>
                    <div className={styles.panelSub}>{savingId ? "Saving..." : "Edit fields and images"}</div>
                  </div>
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
                    {/* BASIC */}
                    <label className={styles.label}>Name</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-tag" />
                      <input
                        className={styles.input}
                        value={activeVariant.name}
                        onChange={(e) => patchVariantLocal(activeVariant.id, { name: e.target.value })}
                        onBlur={() => patchVariantRemote(activeVariant.id, { name: activeVariant.name })}
                      />
                    </div>

                    <label className={styles.label}>SKU</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-hash" />
                      <input
                        className={styles.input}
                        value={activeVariant.sku}
                        onChange={(e) => patchVariantLocal(activeVariant.id, { sku: slugSku(e.target.value) })}
                        onBlur={() => patchVariantRemote(activeVariant.id, { sku: activeVariant.sku })}
                      />
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Currency</label>
                        <div className={styles.selectWrap}>
                          <i className="bi bi-currency-dollar" />
                          <select className={styles.select} value={activeVariant.currency} disabled>
                            <option value="USD">USD</option>
                            <option value="VND">VND</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Price</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-cash-stack" />
                          <input
                            className={styles.input}
                            type="number"
                            value={Math.round(activeVariant.priceCents / 100)}
                            onChange={(e) => {
                              const v = clamp(Number(e.target.value || 0), 0, 1_000_000);
                              patchVariantLocal(activeVariant.id, { priceCents: v * 100 });
                            }}
                            onBlur={() => patchVariantRemote(activeVariant.id, { priceCents: activeVariant.priceCents })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Stock</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-box-seam" />
                          <input
                            className={styles.input}
                            type="number"
                            value={activeVariant.stock}
                            onChange={(e) => patchVariantLocal(activeVariant.id, { stock: clamp(Number(e.target.value || 0), 0, 1_000_000) })}
                            onBlur={() => patchVariantRemote(activeVariant.id, { stock: activeVariant.stock })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Status</label>
                        <div className={styles.selectWrap}>
                          <i className="bi bi-flag" />
                          <select className={styles.select} value={activeVariant.status} onChange={(e) => patchVariantRemote(activeVariant.id, { status: e.target.value as VariantStatus })}>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.hr} />

                    {/* ✅ VARIANT OPTIONS (SAVE TO DB) */}
                    <div className={styles.sectionTitle}>
                      <i className="bi bi-sliders" /> Options (Variant) — saved to DB
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Option 1 (name)</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-grid-1x2" />
                          <input
                            className={styles.input}
                            placeholder="e.g. Color"
                            value={activeVariant.option1 ?? ""}
                            onChange={(e) => patchVariantLocal(activeVariant.id, { option1: e.target.value })}
                            onBlur={() => patchVariantRemote(activeVariant.id, { option1: activeVariant.option1 })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Value 1</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-tag" />
                          <input
                            className={styles.input}
                            placeholder="e.g. Xanh"
                            value={activeVariant.value1 ?? ""}
                            onChange={(e) => {
                              const v1 = e.target.value;
                              patchVariantLocal(activeVariant.id, {
                                value1: v1,
                                name: buildLabelFromValues(v1, activeVariant.value2),
                              });
                            }}
                            onBlur={() =>
                              patchVariantRemote(activeVariant.id, {
                                value1: activeVariant.value1,
                                name: activeVariant.name,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Option 2 (name)</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-grid-1x2" />
                          <input
                            className={styles.input}
                            placeholder="e.g. Size"
                            value={activeVariant.option2 ?? ""}
                            onChange={(e) => patchVariantLocal(activeVariant.id, { option2: e.target.value })}
                            onBlur={() => patchVariantRemote(activeVariant.id, { option2: activeVariant.option2 })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Value 2</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-tag" />
                          <input
                            className={styles.input}
                            placeholder="e.g. M"
                            value={activeVariant.value2 ?? ""}
                            onChange={(e) => {
                              const v2 = e.target.value;
                              patchVariantLocal(activeVariant.id, {
                                value2: v2,
                                name: buildLabelFromValues(activeVariant.value1, v2),
                              });
                            }}
                            onBlur={() =>
                              patchVariantRemote(activeVariant.id, {
                                value2: activeVariant.value2,
                                name: activeVariant.name,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.hr} />

                    {/* Images */}
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
                                <div className={styles.imageBadges}>{im.isCover && <span className={styles.badge}>Cover</span>}</div>
                              </div>
                              <div className={styles.imageActions}>
                                <button className={styles.iconBtn} type="button" title="Set cover" onClick={() => setCoverRemote(im.id)}>
                                  <i className="bi bi-star" />
                                </button>
                                <button className={`${styles.iconBtn} ${styles.dangerBtn}`} type="button" title="Remove" onClick={() => removeImageRemote(im.id)}>
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

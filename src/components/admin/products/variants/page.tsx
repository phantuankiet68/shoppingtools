"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/product/variants/variants.module.css";

type Currency = "USD" | "VND";

type ProductRow = {
  id: string;
  name: string;
  skuPrefix: string;
  image?: string;
};

type VariantStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

type VariantRow = {
  id: string;
  productId: string;

  name: string; // e.g. "Red / M"
  sku: string;
  barcode?: string;

  priceCents: number;
  compareAtCents?: number;
  currency: Currency;

  stock: number;
  trackInventory: boolean;

  status: VariantStatus;
  isDefault: boolean;

  options: Record<string, string>; // { Color: "Red", Size: "M" }
  images: { id: string; url: string; isCover: boolean; sort: number }[];

  createdAt: string;
  updatedAt: string;
};

type OptionDef = {
  id: string;
  name: string; // "Color"
  values: string[]; // ["Red", "Blue"]
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

function cartesian(options: OptionDef[]) {
  const valid = options.filter((o) => o.name.trim() && o.values.length > 0);
  if (valid.length === 0) return [{} as Record<string, string>];

  let acc: Record<string, string>[] = [{}];
  for (const opt of valid) {
    const next: Record<string, string>[] = [];
    for (const a of acc) {
      for (const v of opt.values) {
        next.push({ ...a, [opt.name]: v });
      }
    }
    acc = next;
  }
  return acc;
}

function optionLabel(opts: Record<string, string>) {
  const keys = Object.keys(opts);
  if (keys.length === 0) return "Default";
  return keys.map((k) => opts[k]).join(" / ");
}

export default function VariantsPage() {
  // demo products
  const [products] = useState<ProductRow[]>(() => [
    { id: "p1", name: "T-Shirt Classic", skuPrefix: "TSHIRT", image: "https://picsum.photos/seed/tshirt/200/200" },
    { id: "p2", name: "Sneakers Runner", skuPrefix: "SNEAK", image: "https://picsum.photos/seed/sneak/200/200" },
    { id: "p3", name: "Backpack Urban", skuPrefix: "BAG", image: "https://picsum.photos/seed/bag/200/200" },
  ]);

  const [productQuery, setProductQuery] = useState("");
  const [activeProductId, setActiveProductId] = useState<string>(() => products[0]?.id || "");

  const activeProduct = useMemo(() => products.find((p) => p.id === activeProductId) || null, [products, activeProductId]);

  // demo option defs per product (in real app: load from DB)
  const [optionDefs, setOptionDefs] = useState<Record<string, OptionDef[]>>(() => ({
    p1: [
      { id: uid(), name: "Color", values: ["Red", "Black", "White"] },
      { id: uid(), name: "Size", values: ["S", "M", "L"] },
    ],
    p2: [{ id: uid(), name: "Size", values: ["40", "41", "42"] }],
    p3: [],
  }));

  const [variants, setVariants] = useState<VariantRow[]>(() => {
    const base: VariantRow[] = [];

    // p1 seed
    base.push({
      id: uid(),
      productId: "p1",
      name: "Red / M",
      sku: "TSHIRT-RED-M",
      priceCents: 1900,
      compareAtCents: 2500,
      currency: "USD",
      stock: 12,
      trackInventory: true,
      status: "ACTIVE",
      isDefault: true,
      options: { Color: "Red", Size: "M" },
      images: [{ id: uid(), url: "https://picsum.photos/seed/redm/900/900", isCover: true, sort: 0 }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    base.push({
      id: uid(),
      productId: "p1",
      name: "Black / L",
      sku: "TSHIRT-BLACK-L",
      priceCents: 1900,
      currency: "USD",
      stock: 6,
      trackInventory: true,
      status: "ACTIVE",
      isDefault: false,
      options: { Color: "Black", Size: "L" },
      images: [{ id: uid(), url: "https://picsum.photos/seed/blackl/900/900", isCover: true, sort: 0 }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    // p2 seed
    base.push({
      id: uid(),
      productId: "p2",
      name: "41",
      sku: "SNEAK-41",
      priceCents: 5900,
      currency: "USD",
      stock: 3,
      trackInventory: true,
      status: "DRAFT",
      isDefault: true,
      options: { Size: "41" },
      images: [{ id: uid(), url: "https://picsum.photos/seed/s41/900/900", isCover: true, sort: 0 }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    // p3 seed default
    base.push({
      id: uid(),
      productId: "p3",
      name: "Default",
      sku: "BAG-DEFAULT",
      priceCents: 3900,
      currency: "USD",
      stock: 20,
      trackInventory: true,
      status: "ACTIVE",
      isDefault: true,
      options: {},
      images: [{ id: uid(), url: "https://picsum.photos/seed/bagdefault/900/900", isCover: true, sort: 0 }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    return base;
  });

  const [variantQuery, setVariantQuery] = useState("");
  const [activeVariantId, setActiveVariantId] = useState<string>(() => {
    const first = variants.find((v) => v.productId === activeProductId);
    return first?.id || "";
  });

  // re-sync active variant when switching product
  function selectProduct(id: string) {
    setActiveProductId(id);
    const first = variants.find((v) => v.productId === id);
    setActiveVariantId(first?.id || "");
    setVariantQuery("");
  }

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
      .sort((a, b) => (a.isDefault === b.isDefault ? a.name.localeCompare(b.name) : a.isDefault ? -1 : 1));
  }, [variants, activeProductId, variantQuery]);

  const activeVariant = useMemo(() => variants.find((v) => v.id === activeVariantId) || null, [variants, activeVariantId]);

  const defs = optionDefs[activeProductId] ?? [];

  function patchVariant(id: string, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch, updatedAt: nowIso() } : v)));
  }

  function setDefaultVariant(id: string) {
    if (!activeProductId) return;
    setVariants((prev) => prev.map((v) => (v.productId === activeProductId ? { ...v, isDefault: v.id === id } : v)));
  }

  function toggleStatus(id: string) {
    const v = variants.find((x) => x.id === id);
    if (!v) return;
    const next: VariantStatus = v.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    patchVariant(id, { status: next });
  }

  function createVariant() {
    if (!activeProduct) return;
    const row: VariantRow = {
      id: uid(),
      productId: activeProduct.id,
      name: "New variant",
      sku: slugSku(`${activeProduct.skuPrefix}-NEW`),
      priceCents: 0,
      currency: "USD",
      stock: 0,
      trackInventory: true,
      status: "DRAFT",
      isDefault: productVariants.length === 0,
      options: {},
      images: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setVariants((prev) => [...prev, row]);
    setTimeout(() => setActiveVariantId(row.id), 0);
  }

  function duplicateVariant(id: string) {
    const v = variants.find((x) => x.id === id);
    if (!v) return;
    const copy: VariantRow = {
      ...JSON.parse(JSON.stringify(v)),
      id: uid(),
      name: v.name + " Copy",
      sku: slugSku(v.sku + "-COPY"),
      isDefault: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setVariants((prev) => [...prev, copy]);
    setTimeout(() => setActiveVariantId(copy.id), 0);
  }

  function deleteVariant(id: string) {
    const v = variants.find((x) => x.id === id);
    if (!v) return;
    const ok = confirm(`Delete variant "${v.name}"?`);
    if (!ok) return;

    setVariants((prev) => prev.filter((x) => x.id !== id));
    if (activeVariantId === id) {
      const remain = variants.filter((x) => x.id !== id && x.productId === activeProductId);
      setActiveVariantId(remain[0]?.id || "");
    }
  }

  // Option defs editor (right panel)
  function addOption() {
    const name = prompt("Option name? (e.g. Color)");
    if (!name?.trim()) return;
    const next: OptionDef = { id: uid(), name: name.trim(), values: ["Value"] };
    setOptionDefs((prev) => ({ ...prev, [activeProductId]: [...(prev[activeProductId] ?? []), next] }));
  }

  function patchOption(optId: string, patch: Partial<OptionDef>) {
    setOptionDefs((prev) => ({
      ...prev,
      [activeProductId]: (prev[activeProductId] ?? []).map((o) => (o.id === optId ? { ...o, ...patch } : o)),
    }));
  }

  function removeOption(optId: string) {
    const ok = confirm("Remove this option?");
    if (!ok) return;
    setOptionDefs((prev) => ({
      ...prev,
      [activeProductId]: (prev[activeProductId] ?? []).filter((o) => o.id !== optId),
    }));
  }

  function generateVariants() {
    if (!activeProduct) return;

    const combos = cartesian(defs);
    if (combos.length === 0) return;

    const existingSkus = new Set(variants.filter((v) => v.productId === activeProduct.id).map((v) => v.sku));
    const created: VariantRow[] = [];

    for (const opts of combos) {
      const label = optionLabel(opts);
      const skuParts = [activeProduct.skuPrefix, ...Object.values(opts).map((x) => slugSku(x))].filter(Boolean);
      const sku = slugSku(skuParts.join("-") || `${activeProduct.skuPrefix}-DEFAULT`);

      if (existingSkus.has(sku)) continue;

      created.push({
        id: uid(),
        productId: activeProduct.id,
        name: label,
        sku,
        priceCents: 0,
        currency: "USD",
        stock: 0,
        trackInventory: true,
        status: "DRAFT",
        isDefault: false,
        options: opts,
        images: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      existingSkus.add(sku);
    }

    if (created.length === 0) {
      alert("No new variants to generate (all combinations already exist).");
      return;
    }

    setVariants((prev) => [...prev, ...created]);
    setTimeout(() => setActiveVariantId(created[0].id), 0);
  }

  function addImage() {
    if (!activeVariant) return;
    const url = prompt("Image URL?");
    if (!url?.trim()) return;

    const next = { id: uid(), url: url.trim(), isCover: activeVariant.images.length === 0, sort: activeVariant.images.length };
    patchVariant(activeVariant.id, { images: [...activeVariant.images, next] });
  }

  function setCover(imgId: string) {
    if (!activeVariant) return;
    patchVariant(activeVariant.id, {
      images: activeVariant.images.map((im) => ({ ...im, isCover: im.id === imgId })),
    });
  }

  function removeImage(imgId: string) {
    if (!activeVariant) return;
    const next = activeVariant.images.filter((im) => im.id !== imgId).map((im, i) => ({ ...im, sort: i }));
    // ensure cover
    if (next.length > 0 && !next.some((x) => x.isCover)) next[0].isCover = true;
    patchVariant(activeVariant.id, { images: next });
  }

  return (
    <div className={styles.shell}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Variants</div>
            <div className={styles.brandSub}>Products · Options · Generate · Inventory · Pricing</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={generateVariants} disabled={!activeProduct}>
            <i className="bi bi-shuffle" /> Generate
          </button>
          <button className={styles.primaryBtn} type="button" onClick={createVariant} disabled={!activeProduct}>
            <i className="bi bi-plus-lg" /> New variant
          </button>
        </div>
      </header>

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
                Variants nên unique theo <span className={styles.mono}>[productId, sku]</span>.
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
                  <div className={styles.panelSub}>Search, set default, quick toggle</div>
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
                        return (
                          <tr key={v.id} className={`${styles.tr} ${active ? styles.trActive : ""}`} onClick={() => setActiveVariantId(v.id)} role="button">
                            <td>
                              <div className={styles.cellTitle}>
                                <span className={`${styles.dot} ${v.isDefault ? styles.dotHot : ""}`} />
                                <div>
                                  <div className={styles.nameRow}>
                                    <span className={styles.name}>{v.name}</span>
                                    {v.isDefault && <span className={styles.badge}>Default</span>}
                                  </div>
                                  <div className={styles.sub}>
                                    {Object.keys(v.options).length ? (
                                      <span className={styles.mono}>
                                        {Object.entries(v.options)
                                          .map(([k, val]) => `${k}:${val}`)
                                          .join("  ·  ")}
                                      </span>
                                    ) : (
                                      <span className={styles.muted}>No options</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className={styles.mono}>{v.sku}</td>

                            <td className={styles.mono}>
                              {v.currency} {fmtMoney(v.priceCents, v.currency)}
                            </td>

                            <td className={styles.mono}>{v.trackInventory ? v.stock : "—"}</td>

                            <td>
                              <span className={`${styles.status} ${v.status === "ACTIVE" ? styles.ok : v.status === "DRAFT" ? styles.off : styles.bad}`}>
                                <i className={`bi ${v.status === "ACTIVE" ? "bi-check2-circle" : v.status === "DRAFT" ? "bi-pencil" : "bi-archive"}`} />
                                {v.status}
                              </span>
                            </td>

                            <td className={styles.tdRight} onClick={(e) => e.stopPropagation()}>
                              <button className={styles.iconBtn} type="button" title="Set default" onClick={() => setDefaultVariant(v.id)}>
                                <i className={`bi ${v.isDefault ? "bi-star-fill" : "bi-star"}`} />
                              </button>
                              <button className={styles.iconBtn} type="button" title="Toggle status" onClick={() => toggleStatus(v.id)}>
                                <i className="bi bi-toggle2-on" />
                              </button>
                              <button className={styles.iconBtn} type="button" title="Duplicate" onClick={() => duplicateVariant(v.id)}>
                                <i className="bi bi-files" />
                              </button>
                              <button className={`${styles.iconBtn} ${styles.dangerBtn}`} type="button" title="Delete" onClick={() => deleteVariant(v.id)}>
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
                    <div className={styles.panelSub}>Options, pricing, inventory, images</div>
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
                    <div className={styles.headerRow}>
                      <div>
                        <div className={styles.headTitle}>{activeVariant.name}</div>
                        <div className={styles.headMeta}>
                          <span className={styles.badgeMini}>
                            <i className="bi bi-upc-scan" /> {activeVariant.sku}
                          </span>
                          {activeVariant.isDefault && (
                            <span className={styles.badgeMini}>
                              <i className="bi bi-star-fill" /> default
                            </span>
                          )}
                        </div>
                      </div>

                      <button className={`${styles.iconBtn} ${activeVariant.isDefault ? styles.hotBtn : ""}`} type="button" title="Set default" onClick={() => setDefaultVariant(activeVariant.id)}>
                        <i className={`bi ${activeVariant.isDefault ? "bi-star-fill" : "bi-star"}`} />
                      </button>
                    </div>

                    <label className={styles.label}>Name</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-tag" />
                      <input className={styles.input} value={activeVariant.name} onChange={(e) => patchVariant(activeVariant.id, { name: e.target.value })} />
                    </div>

                    <label className={styles.label}>SKU</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-hash" />
                      <input className={styles.input} value={activeVariant.sku} onChange={(e) => patchVariant(activeVariant.id, { sku: slugSku(e.target.value) })} />
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Currency</label>
                        <div className={styles.selectWrap}>
                          <i className="bi bi-currency-dollar" />
                          <select className={styles.select} value={activeVariant.currency} onChange={(e) => patchVariant(activeVariant.id, { currency: e.target.value as Currency })}>
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
                              patchVariant(activeVariant.id, { priceCents: v * 100 });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <button
                        className={`${styles.toggleLine} ${activeVariant.trackInventory ? styles.toggleLineOn : ""}`}
                        type="button"
                        onClick={() => patchVariant(activeVariant.id, { trackInventory: !activeVariant.trackInventory })}>
                        <i className={`bi ${activeVariant.trackInventory ? "bi-toggle2-on" : "bi-toggle2-off"}`} />
                        <span>Track inventory</span>
                      </button>

                      <div>
                        <label className={styles.label}>Stock</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-box-seam" />
                          <input
                            className={styles.input}
                            type="number"
                            disabled={!activeVariant.trackInventory}
                            value={activeVariant.stock}
                            onChange={(e) => patchVariant(activeVariant.id, { stock: clamp(Number(e.target.value || 0), 0, 1_000_000) })}
                          />
                        </div>
                      </div>
                    </div>

                    <label className={styles.label}>Status</label>
                    <div className={styles.selectWrap}>
                      <i className="bi bi-flag" />
                      <select className={styles.select} value={activeVariant.status} onChange={(e) => patchVariant(activeVariant.id, { status: e.target.value as VariantStatus })}>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-sliders" /> Options (Product)
                    </div>

                    <div className={styles.optionDefs}>
                      {defs.length === 0 ? (
                        <div className={styles.emptySmall}>No options. Add option definitions.</div>
                      ) : (
                        defs.map((o) => (
                          <div key={o.id} className={styles.optionDef}>
                            <div className={styles.optionHead}>
                              <div className={styles.optionName}>
                                <i className="bi bi-grid-1x2" /> <input className={styles.optionNameInput} value={o.name} onChange={(e) => patchOption(o.id, { name: e.target.value })} />
                              </div>
                              <button className={`${styles.iconBtn} ${styles.dangerBtn}`} type="button" title="Remove option" onClick={() => removeOption(o.id)}>
                                <i className="bi bi-x-lg" />
                              </button>
                            </div>

                            <div className={styles.chips}>
                              {o.values.map((val, idx) => (
                                <div key={idx} className={styles.chip}>
                                  <input
                                    className={styles.chipInput}
                                    value={val}
                                    onChange={(e) => {
                                      const next = [...o.values];
                                      next[idx] = e.target.value;
                                      patchOption(o.id, { values: next });
                                    }}
                                  />
                                  <button
                                    className={styles.chipX}
                                    type="button"
                                    title="Remove value"
                                    onClick={() => {
                                      const next = o.values.filter((_, i) => i !== idx);
                                      patchOption(o.id, { values: next });
                                    }}>
                                    <i className="bi bi-x" />
                                  </button>
                                </div>
                              ))}

                              <button className={styles.chipAdd} type="button" onClick={() => patchOption(o.id, { values: [...o.values, "Value"] })}>
                                <i className="bi bi-plus" /> Add value
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      <div className={styles.optionActions}>
                        <button className={styles.ghostBtn} type="button" onClick={addOption}>
                          <i className="bi bi-plus-lg" /> Add option
                        </button>
                        <button className={styles.primaryBtn} type="button" onClick={generateVariants}>
                          <i className="bi bi-shuffle" /> Generate variants
                        </button>
                      </div>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-images" /> Images
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
                                <button className={styles.iconBtn} type="button" title="Set cover" onClick={() => setCover(im.id)}>
                                  <i className="bi bi-star" />
                                </button>
                                <button className={`${styles.iconBtn} ${styles.dangerBtn}`} type="button" title="Remove" onClick={() => removeImage(im.id)}>
                                  <i className="bi bi-trash" />
                                </button>
                              </div>
                            </div>
                          ))
                      )}

                      <button className={styles.ghostBtn} type="button" onClick={addImage}>
                        <i className="bi bi-plus-lg" /> Add image URL
                      </button>
                    </div>

                    <div className={styles.tipInline}>
                      <i className="bi bi-shield-check" />
                      <span>
                        Khi nối DB: nên có table <span className={styles.mono}>ProductVariant</span> + <span className={styles.mono}>VariantImage</span> và index{" "}
                        <span className={styles.mono}>productId, sku</span>.
                      </span>
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

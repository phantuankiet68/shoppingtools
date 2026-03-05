"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "@/styles/admin/commerce/products/list/productsList.module.css";
import type { ApiProduct, Filters } from "@/components/admin/commerce/products/client/AdminProductsClient";

type ApiCategory = { id: string; name: string; isActive: boolean; count?: number };
type ApiError = { error?: string };

function moneyFromCents(cents: number) {
  const n = (cents ?? 0) / 100;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => "");
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export default function ProductsList(props: {
  items: ApiProduct[];
  categories: ApiCategory[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  loading: boolean;
  busy: boolean;
  error: string;
  onRefresh: () => void;
  onApply: () => void;
  onEdit: (id: string) => void;
  setBusy: (v: boolean) => void;
  afterMutate: () => void;
}) {
  const { items, categories, filters, setFilters, loading, busy, error, onApply, onEdit } = props;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const blurTimer = useRef<number | null>(null);

  const filtered = useMemo(() => {
    // server đã filter rồi; local chỉ sort cho mượt
    const arr = [...items];
    switch (filters.sort) {
      case "PriceAsc":
        arr.sort((a, b) => (a.priceCents ?? 0) - (b.priceCents ?? 0));
        break;
      case "PriceDesc":
        arr.sort((a, b) => (b.priceCents ?? 0) - (a.priceCents ?? 0));
        break;
      case "NameAsc":
        arr.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
        break;
      default:
        break;
    }
    return arr;
  }, [items, filters.sort]);

  const checkedCount = filtered.reduce((acc, p) => acc + (selected[p.id] ? 1 : 0), 0);
  const allChecked = filtered.length > 0 && filtered.every((p) => selected[p.id]);

  function getThumb(p: ApiProduct) {
    const imgs = Array.isArray(p.images) ? p.images : [];
    const cover = imgs.find((x) => x?.isCover && String(x?.url ?? "").trim().length > 0);
    const first = imgs.find((x) => String(x?.url ?? "").trim().length > 0);
    return (cover?.url ?? first?.url ?? "").trim();
  }

  const suggestions = useMemo(() => {
    const q = (filters.q ?? "").trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((p) => {
        const name = (p.name ?? "").toLowerCase();
        const sku = (p.sku ?? "").toLowerCase();
        const barcode = String(p.barcode ?? "").toLowerCase();
        return name.includes(q) || sku.includes(q) || barcode.includes(q);
      })
      .slice(0, 6);
  }, [items, filters.q]);

  async function softDeleteOne(p: ApiProduct) {
    if (!confirm(`Deactivate “${p.name}”?`)) return;
    props.setBusy(true);
    try {
      const res = await fetch(`/api/admin/commerce/products/${p.id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const json = await safeJson<ApiError>(res);
      if (!res.ok) throw new Error(json?.error || "Delete failed");
      props.afterMutate();
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error("Delete failed");
      alert(err.message || "Delete failed");
    } finally {
      props.setBusy(false);
    }
  }

  function exportCsv() {
    if (filtered.length === 0) return;
    const rows = filtered.map((p) => ({
      name: p.name,
      sku: p.sku,
      category: p.category?.name ?? "",
      price: moneyFromCents(p.priceCents),
      stock: String(p.stock ?? 0),
      status: p.isActive ? "Active" : "Inactive",
      updatedAt: p.updatedAt,
    }));

    const header = Object.keys(rows[0]) as Array<keyof (typeof rows)[0]>;
    const csv =
      header.join(",") +
      "\n" +
      rows.map((r) => header.map((k) => `"${String(r[k] ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const activeCounts = useMemo(() => {
    const active = filtered.filter((p) => p.isActive).length;
    const inactive = filtered.length - active;
    return { active, inactive, total: filtered.length };
  }, [filtered]);

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden>
              ⌕
            </span>

            <input
              className={styles.searchInput}
              value={filters.q}
              placeholder="Sports shoes"
              onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
              onFocus={() => {
                if (blurTimer.current) window.clearTimeout(blurTimer.current);
                setSearchOpen(true);
              }}
              onBlur={() => {
                blurTimer.current = window.setTimeout(() => setSearchOpen(false), 130);
              }}
            />

            {/* Dropdown suggest */}
            {searchOpen && (filters.q ?? "").trim() && suggestions.length > 0 ? (
              <div className={styles.suggest} role="listbox" aria-label="Search suggestions">
                <div className={styles.suggestHead}>
                  <span className={styles.suggestDot} aria-hidden />
                  <span className={styles.suggestTitle}>Collections</span>
                </div>

                <div className={styles.suggestList}>
                  {suggestions.map((p) => {
                    const thumb = getThumb(p);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={styles.suggestItem}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFilters((s) => ({ ...s, q: p.name ?? s.q }));
                          setSearchOpen(false);
                        }}
                      >
                        <span className={styles.suggestThumb}>
                          {thumb ? (
                            <Image
                              unoptimized
                              src={thumb}
                              alt=""
                              width={36}
                              height={36}
                              className={styles.suggestImg}
                            />
                          ) : (
                            <span className={styles.suggestEmpty} />
                          )}
                        </span>

                        <span className={styles.suggestMeta}>
                          <span className={styles.suggestName}>{p.name}</span>
                          <span className={styles.suggestSub}>{moneyFromCents(p.priceCents)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className={styles.suggestFoot}>
                  <span className={styles.suggestMore}>View all results</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* nút đỏ vuông: mở filter panel */}
          <button
            className={styles.redSquare}
            type="button"
            aria-label="Quick filters"
            onClick={() => setFiltersOpen((v) => !v)}
            disabled={loading || busy}
            aria-expanded={filtersOpen}
          >
            <span aria-hidden>≡</span>
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <select
            className={styles.select}
            value={filters.sort}
            onChange={(e) => setFilters((s) => ({ ...s, sort: e.target.value as Filters["sort"] }))}
            disabled={busy}
          >
            <option value="Newest">Sort by</option>
            <option value="NameAsc">Name A → Z</option>
            <option value="PriceAsc">Price Low → High</option>
            <option value="PriceDesc">Price High → Low</option>
          </select>

          <button className={styles.applyBtn} type="button" onClick={onApply} disabled={busy}>
            Apply
          </button>

          <button
            className={styles.exportBtn}
            type="button"
            onClick={exportCsv}
            disabled={busy || filtered.length === 0}
          >
            Export
          </button>
        </div>
      </div>

      {/* Quick filters panel */}
      {filtersOpen ? (
        <div className={styles.card} style={{ marginTop: 12 }}>
          <div className={styles.cardHead}>
            <div className={styles.cardTitle}>
              Quick filters{" "}
              <span className={styles.pill}>
                {activeCounts.total} total • {activeCounts.active} active • {activeCounts.inactive} inactive
              </span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={styles.exportBtn}
                onClick={() => {
                  setFilters((s) => ({
                    ...s,
                    q: "",
                    categoryIds: [],
                    priceMin: "",
                    priceMax: "",
                    active: "all",
                    sort: "Newest",
                  }));
                }}
                disabled={busy}
              >
                Reset
              </button>
              <button type="button" className={styles.applyBtn} onClick={onApply} disabled={busy}>
                Apply
              </button>
            </div>
          </div>

          <div style={{ padding: 16, display: "grid", gap: 12, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Status</div>
              <select
                className={styles.select}
                value={filters.active}
                onChange={(e) => setFilters((s) => ({ ...s, active: e.target.value as Filters["active"] }))}
                disabled={busy}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Category</div>
              <select
                className={styles.select}
                value={filters.categoryIds?.[0] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((s) => ({ ...s, categoryIds: v ? [v] : [] }));
                }}
                disabled={busy}
              >
                <option value="">All categories</option>
                {categories
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Min price</div>
              <input
                className={styles.searchInput}
                value={filters.priceMin}
                placeholder="0"
                onChange={(e) => setFilters((s) => ({ ...s, priceMin: e.target.value }))}
                inputMode="decimal"
                disabled={busy}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Max price</div>
              <input
                className={styles.searchInput}
                value={filters.priceMax}
                placeholder="9999"
                onChange={(e) => setFilters((s) => ({ ...s, priceMax: e.target.value }))}
                inputMode="decimal"
                disabled={busy}
              />
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className={styles.alertError} role="alert">
          <span className={styles.alertIcon} aria-hidden>
            !
          </span>
          <span className={styles.alertText}>{error}</span>
        </div>
      ) : null}

      {/* Table card */}
      <section className={styles.card} aria-label="Products table">
        <div className={styles.cardHead}>
          <div className={styles.cardTitle}>
            Products{" "}
            <span className={styles.pill}>
              {loading ? "Loading…" : `${filtered.length} item${filtered.length === 1 ? "" : "s"}`}
            </span>
          </div>

          <label className={styles.checkAll}>
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => {
                const next: Record<string, boolean> = {};
                filtered.forEach((p) => (next[p.id] = e.target.checked));
                setSelected(next);
              }}
            />
            <span>{checkedCount ? `${checkedCount} selected` : "Select all"}</span>
          </label>
        </div>

        {filtered.length === 0 && !loading ? <div className={styles.emptyState}>No products found</div> : null}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thCheckbox}></th>
                <th>Product Name</th>
                <th>Category</th>
                <th className={styles.thRight}>Price</th>
                <th className={styles.thRight}>Stock</th>
                <th>Status</th>
                <th className={styles.thActions}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => {
                const thumb = getThumb(p);
                return (
                  <tr key={p.id}>
                    <td className={styles.tdCheckbox}>
                      <input
                        type="checkbox"
                        checked={!!selected[p.id]}
                        onChange={(e) => setSelected((s) => ({ ...s, [p.id]: e.target.checked }))}
                      />
                    </td>

                    <td>
                      <div className={styles.prodCell}>
                        <span className={styles.thumb}>
                          {thumb ? (
                            <Image unoptimized src={thumb} alt="" width={44} height={44} className={styles.thumbImg} />
                          ) : (
                            <span className={styles.thumbEmpty} />
                          )}
                        </span>

                        <span className={styles.prodInfo}>
                          <span className={styles.prodName}>{p.name}</span>
                          <span className={styles.prodSub}>
                            {p.sku ? <span className={styles.mono}>{p.sku}</span> : null}
                            {p.barcode ? (
                              <>
                                <span className={styles.dot}>•</span>
                                <span className={styles.muted}>#{String(p.barcode)}</span>
                              </>
                            ) : null}
                          </span>
                        </span>
                      </div>
                    </td>

                    <td>
                      {p.category?.name ? (
                        <span className={styles.tag}>{p.category.name}</span>
                      ) : (
                        <span className={styles.muted}>No category</span>
                      )}
                    </td>

                    <td className={styles.tdRight}>{moneyFromCents(p.priceCents)}</td>
                    <td className={styles.tdRight}>{p.stock ?? 0}</td>

                    <td>
                      <span className={`${styles.badge} ${p.isActive ? styles.badgeOk : styles.badgeOff}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.actionBtn} type="button" onClick={() => onEdit(p.id)} disabled={busy}>
                          Edit
                        </button>
                        <button
                          className={styles.moreBtn}
                          type="button"
                          onClick={() => void softDeleteOne(p)}
                          disabled={busy}
                          title="Deactivate"
                        >
                          …
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

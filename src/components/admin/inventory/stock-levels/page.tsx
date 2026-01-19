"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/stock-levels/stock-levels.module.css";

type CurrencyCode = "USD" | "VND" | string;
type ReceiptStatus = "PENDING" | "RECEIVED" | "CANCELLED" | string;

type Supplier = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  receiptsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Receipt = {
  id: string;
  supplierId?: string | null;
  supplier?: { id: string; name: string } | null;
  status: ReceiptStatus;
  currency: CurrencyCode;
  receivedAt?: string | null;
  reference?: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  notes?: string | null;
  itemsCount?: number;
  createdAt: string;
  updatedAt: string;
};

type ReceiptItem = {
  id: string;
  receiptId: string;
  productId: string;
  variantId?: string | null;
  qty: number;
  unitCostCents: number;
  totalCents: number;
  product?: { id: string; name: string; sku?: string | null } | null;
  variant?: { id: string; name?: string | null; sku?: string | null } | null;
  createdAt?: string;
  updatedAt?: string;
};

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmtMoney(cents: number, currency: string) {
  if (!Number.isFinite(cents)) cents = 0;
  if (currency === "VND") {
    const v = Math.round(cents / 100);
    return v.toLocaleString("vi-VN") + " ₫";
  }
  return (cents / 100).toFixed(2) + " " + currency;
}

function badgeStatusClass(status: ReceiptStatus) {
  const s = String(status || "").toUpperCase();
  if (s === "RECEIVED") return styles.badgeOk;
  if (s === "CANCELLED") return styles.badgeBad;
  return styles.badgeOff;
}

function shortId(id: string) {
  if (!id) return "";
  return id.length > 10 ? id.slice(0, 6) + "…" + id.slice(-4) : id;
}

export default function StockLevelsPage() {
  /** ===== left: suppliers ===== */
  const [supplierQuery, setSupplierQuery] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeSupplierId, setActiveSupplierId] = useState<string>("");

  /** ===== middle: receipts ===== */
  const [receiptQuery, setReceiptQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "RECEIVED" | "CANCELLED">("ALL");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [activeReceiptId, setActiveReceiptId] = useState<string>("");

  /** ===== right: receipt detail ===== */
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);

  /** ===== UX states ===== */
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** ===== computed: visible lists ===== */
  const visibleSuppliers = useMemo(() => {
    const q = supplierQuery.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) => {
      const t = `${s.name} ${s.email ?? ""} ${s.phone ?? ""}`.toLowerCase();
      return t.includes(q);
    });
  }, [suppliers, supplierQuery]);

  const visibleReceipts = useMemo(() => {
    const q = receiptQuery.trim().toLowerCase();
    return receipts
      .filter((r) => (statusFilter === "ALL" ? true : String(r.status).toUpperCase() === statusFilter))
      .filter((r) => {
        if (!q) return true;
        const t = `${r.reference ?? ""} ${r.supplier?.name ?? ""} ${r.id}`.toLowerCase();
        return t.includes(q);
      })
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [receipts, receiptQuery, statusFilter]);

  const itemSummary = useMemo(() => {
    // summary by productId+variantId within selected receipt
    const map = new Map<string, { label: string; qty: number; totalCents: number }>();
    for (const it of items) {
      const key = `${it.productId}::${it.variantId ?? ""}`;
      const productName = it.product?.name ?? "Unknown product";
      const variantLabel = it.variant?.name || it.variant?.sku ? ` · ${it.variant?.name ?? it.variant?.sku}` : "";
      const label = `${productName}${variantLabel}`;

      const prev = map.get(key) || { label, qty: 0, totalCents: 0 };
      prev.qty += it.qty || 0;
      prev.totalCents += it.totalCents || 0;
      map.set(key, prev);
    }
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
  }, [items]);

  /** ===== load suppliers ===== */
  useEffect(() => {
    let cancelled = false;

    async function loadSuppliers() {
      setLoadingSuppliers(true);
      setError(null);
      try {
        const res = await apiJson<{ items: Supplier[] }>(`/api/admin/supplier?sort=nameasc&pageSize=200`);
        if (cancelled) return;
        const list = res.items ?? [];
        setSuppliers(list);
        setActiveSupplierId((prev) => prev || list[0]?.id || "");
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load suppliers");
      } finally {
        if (!cancelled) setLoadingSuppliers(false);
      }
    }

    loadSuppliers();
    return () => {
      cancelled = true;
    };
  }, []);

  /** ===== load receipts when supplier changes ===== */
  useEffect(() => {
    let cancelled = false;

    async function loadReceipts() {
      if (!activeSupplierId) return;
      setLoadingReceipts(true);
      setError(null);
      try {
        const url = `/api/admin/inventory/receipt?supplierId=${encodeURIComponent(activeSupplierId)}&pageSize=200`;
        const res = await apiJson<{ items: Receipt[] }>(url);
        if (cancelled) return;
        const list = res.items ?? [];
        setReceipts(list);
        setActiveReceiptId((prev) => (prev && list.some((x) => x.id === prev) ? prev : list[0]?.id || ""));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load receipts");
      } finally {
        if (!cancelled) setLoadingReceipts(false);
      }
    }

    loadReceipts();
    return () => {
      cancelled = true;
    };
  }, [activeSupplierId]);

  /** ===== load receipt detail when receipt changes ===== */
  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      if (!activeReceiptId) {
        setActiveReceipt(null);
        setItems([]);
        return;
      }
      setLoadingDetail(true);
      setError(null);
      try {
        const res = await apiJson<{ item: Receipt & { items: ReceiptItem[] } }>(`/api/admin/inventory/receipt/${activeReceiptId}`);
        if (cancelled) return;
        setActiveReceipt(res.item as any);
        setItems((res.item as any).items ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load receipt detail");
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [activeReceiptId]);

  /** ===== actions ===== */
  function selectSupplier(id: string) {
    setActiveSupplierId(id);
    setReceiptQuery("");
    setActiveReceiptId("");
    setActiveReceipt(null);
    setItems([]);
  }

  async function createSupplier() {
    const name = prompt("Supplier name?");
    if (!name?.trim()) return;

    setBusy("createSupplier");
    setError(null);
    try {
      const res = await apiJson<{ item: Supplier }>(`/api/admin/supplier`, {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      const created = res.item;
      setSuppliers((prev) => [created, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      setActiveSupplierId(created.id);
    } catch (e: any) {
      setError(e?.message || "Failed to create supplier");
    } finally {
      setBusy(null);
    }
  }

  async function editSupplier(s: Supplier) {
    const name = prompt("Supplier name:", s.name);
    if (name == null) return;

    const email = prompt("Email:", s.email ?? "") ?? undefined;
    const phone = prompt("Phone:", s.phone ?? "") ?? undefined;
    const address = prompt("Address:", s.address ?? "") ?? undefined;

    setBusy("editSupplier");
    setError(null);
    try {
      const res = await apiJson<{ item: Supplier }>(`/api/admin/supplier/${s.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
        }),
      });
      const updated = res.item;
      setSuppliers((prev) => prev.map((x) => (x.id === s.id ? updated : x)).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e: any) {
      setError(e?.message || "Failed to update supplier");
    } finally {
      setBusy(null);
    }
  }

  async function deleteSupplier(s: Supplier) {
    const ok = confirm(`Delete supplier "${s.name}"?\nReceipts will keep but supplierId will become null.`);
    if (!ok) return;

    setBusy("deleteSupplier");
    setError(null);
    try {
      await apiJson(`/api/admin/supplier/${s.id}`, { method: "DELETE" });
      setSuppliers((prev) => prev.filter((x) => x.id !== s.id));
      if (activeSupplierId === s.id) {
        const next = suppliers.filter((x) => x.id !== s.id)[0]?.id || "";
        selectSupplier(next);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to delete supplier");
    } finally {
      setBusy(null);
    }
  }

  async function createReceipt() {
    if (!activeSupplierId) return;

    const reference = prompt("Reference (PO / invoice)?") ?? "";
    const receivedAt = new Date().toISOString();

    setBusy("createReceipt");
    setError(null);
    try {
      const res = await apiJson<{ item: Receipt }>(`/api/admin/inventory/receipt`, {
        method: "POST",
        body: JSON.stringify({
          supplierId: activeSupplierId,
          status: "PENDING",
          currency: "USD",
          receivedAt: receivedAt,
          reference: reference.trim() || null,
          taxCents: 0,
          items: [],
        }),
      });
      const created = res.item;
      setReceipts((prev) => [created, ...prev]);
      setActiveReceiptId(created.id);
    } catch (e: any) {
      setError(e?.message || "Failed to create receipt");
    } finally {
      setBusy(null);
    }
  }

  async function setReceiptStatus(next: "PENDING" | "RECEIVED" | "CANCELLED") {
    if (!activeReceipt) return;

    setBusy("setReceiptStatus");
    setError(null);
    try {
      const res = await apiJson<{ item: Receipt }>(`/api/admin/inventory/receipt/${activeReceipt.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: next,
          receivedAt: activeReceipt.receivedAt ?? new Date().toISOString(),
        }),
      });

      const updated = res.item;
      setActiveReceipt(updated);
      setReceipts((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } catch (e: any) {
      setError(e?.message || "Failed to change status");
    } finally {
      setBusy(null);
    }
  }

  async function updateReceiptMeta(patch: Partial<Pick<Receipt, "reference" | "notes" | "taxCents">>) {
    if (!activeReceipt) return;

    setBusy("updateReceiptMeta");
    setError(null);
    try {
      const res = await apiJson<{ item: Receipt }>(`/api/admin/inventory/receipt/${activeReceipt.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      const updated = res.item;
      setActiveReceipt((prev) => (prev ? { ...prev, ...updated } : prev));
      setReceipts((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } catch (e: any) {
      setError(e?.message || "Failed to update receipt");
    } finally {
      setBusy(null);
    }
  }

  async function addItem() {
    if (!activeReceipt) return;

    // input kiểu nhanh (bạn có thể thay bằng modal / picker)
    const productId = prompt("productId?")?.trim();
    if (!productId) return;

    const variantId = (prompt("variantId? (optional)") ?? "").trim() || null;

    const qtyStr = prompt("qty? (e.g. 10)") ?? "1";
    const unitStr = prompt("unitCostCents? (e.g. 500 = $5.00)") ?? "0";

    const qty = clamp(Math.trunc(Number(qtyStr)), 1, 1_000_000);
    const unitCostCents = clamp(Math.trunc(Number(unitStr)), 0, 1_000_000_000);

    setBusy("addItem");
    setError(null);
    try {
      const res = await apiJson<{ item: ReceiptItem }>(`/api/admin/inventory/receipt/item`, {
        method: "POST",
        body: JSON.stringify({
          receiptId: activeReceipt.id,
          productId,
          variantId,
          qty,
          unitCostCents,
        }),
      });

      // reload receipt detail to sync totals + joins (product/variant)
      const detail = await apiJson<{ item: Receipt & { items: ReceiptItem[] } }>(`/api/admin/inventory/receipt/${activeReceipt.id}`);
      setActiveReceipt(detail.item as any);
      setItems((detail.item as any).items ?? []);
      setReceipts((prev) => prev.map((r) => (r.id === detail.item.id ? { ...r, ...detail.item } : r)));
    } catch (e: any) {
      setError(e?.message || "Failed to add item");
    } finally {
      setBusy(null);
    }
  }

  async function editItem(it: ReceiptItem) {
    if (!activeReceipt) return;

    const qtyStr = prompt("qty:", String(it.qty));
    if (qtyStr == null) return;

    const unitStr = prompt("unitCostCents:", String(it.unitCostCents));
    if (unitStr == null) return;

    const qty = clamp(Math.trunc(Number(qtyStr)), 1, 1_000_000);
    const unitCostCents = clamp(Math.trunc(Number(unitStr)), 0, 1_000_000_000);

    setBusy("editItem");
    setError(null);
    try {
      await apiJson<{ item: ReceiptItem }>(`/api/admin/inventory/receipt/item/${it.id}`, {
        method: "PATCH",
        body: JSON.stringify({ qty, unitCostCents }),
      });

      const detail = await apiJson<{ item: Receipt & { items: ReceiptItem[] } }>(`/api/admin/inventory/receipt/${activeReceipt.id}`);
      setActiveReceipt(detail.item as any);
      setItems((detail.item as any).items ?? []);
      setReceipts((prev) => prev.map((r) => (r.id === detail.item.id ? { ...r, ...detail.item } : r)));
    } catch (e: any) {
      setError(e?.message || "Failed to update item");
    } finally {
      setBusy(null);
    }
  }

  async function deleteItem(it: ReceiptItem) {
    if (!activeReceipt) return;
    const ok = confirm("Delete this item?");
    if (!ok) return;

    setBusy("deleteItem");
    setError(null);
    try {
      await apiJson(`/api/admin/inventory/receipt/item/${it.id}`, { method: "DELETE" });

      const detail = await apiJson<{ item: Receipt & { items: ReceiptItem[] } }>(`/api/admin/inventory/receipt/${activeReceipt.id}`);
      setActiveReceipt(detail.item as any);
      setItems((detail.item as any).items ?? []);
      setReceipts((prev) => prev.map((r) => (r.id === detail.item.id ? { ...r, ...detail.item } : r)));
    } catch (e: any) {
      setError(e?.message || "Failed to delete item");
    } finally {
      setBusy(null);
    }
  }

  /** ===== UI helpers ===== */
  const activeSupplier = useMemo(() => suppliers.find((s) => s.id === activeSupplierId) || null, [suppliers, activeSupplierId]);

  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <i className="bi bi-boxes" />
          </div>
          <div className={styles.brandText}>
            <div className={styles.title}>Stock Levels</div>
            <div className={styles.subtitle}>Suppliers · Receipts · Items · Reconciliation</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.btnGhost} type="button" onClick={createSupplier} disabled={busy !== null}>
            <i className="bi bi-plus-lg" />
            New supplier
          </button>

          <button className={styles.btnPrimary} type="button" onClick={createReceipt} disabled={!activeSupplierId || busy !== null}>
            <i className="bi bi-receipt" />
            New receipt
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorBar}>
          <i className="bi bi-exclamation-triangle" />
          <div>
            <div className={styles.errorTitle}>Something went wrong</div>
            <div className={styles.errorText}>{error}</div>
          </div>
        </div>
      )}

      <div className={styles.body}>
        {/* Left: Suppliers */}
        <aside className={styles.sidebar}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Suppliers</div>
            <div className={styles.panelHint}>Manage contacts & receipts</div>
          </div>

          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input className={styles.search} placeholder="Search supplier..." value={supplierQuery} onChange={(e) => setSupplierQuery(e.target.value)} />
          </div>

          <div className={styles.list}>
            {loadingSuppliers ? (
              <div className={styles.skeletonList}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div className={styles.skeletonRow} key={i} />
                ))}
              </div>
            ) : visibleSuppliers.length === 0 ? (
              <div className={styles.empty}>
                <i className="bi bi-person-x" />
                <div>
                  <div className={styles.emptyTitle}>No suppliers</div>
                  <div className={styles.emptyText}>Create your first supplier.</div>
                </div>
              </div>
            ) : (
              visibleSuppliers.map((s) => {
                const active = s.id === activeSupplierId;
                return (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    className={`${styles.rowBtn} ${active ? styles.rowActive : ""}`}
                    onClick={() => selectSupplier(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") selectSupplier(s.id);
                    }}>
                    <div className={styles.rowMain}>
                      <div className={styles.rowTitle}>
                        <span className={styles.dot} />
                        <span>{s.name}</span>
                      </div>
                      <div className={styles.rowSub}>
                        <span className={styles.muted}>
                          <i className="bi bi-receipt-cutoff" /> {s.receiptsCount ?? 0} receipts
                        </span>
                        {s.phone ? (
                          <span className={styles.muted}>
                            <i className="bi bi-telephone" /> {s.phone}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                      <button className={styles.iconBtn} type="button" title="Edit" onClick={() => editSupplier(s)} disabled={busy !== null}>
                        <i className="bi bi-pencil" />
                      </button>

                      <button className={`${styles.iconBtn} ${styles.danger}`} type="button" title="Delete" onClick={() => deleteSupplier(s)} disabled={busy !== null}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.sideFooter}>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>
                Nếu bạn xoá supplier, receipts vẫn còn nhưng supplierId sẽ <b>null</b>.
              </span>
            </div>
          </div>
        </aside>

        {/* Middle: Receipts */}
        <section className={styles.center}>
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelTitle}>Receipts</div>
              <div className={styles.panelHint}>
                {activeSupplier ? (
                  <>
                    Supplier: <b>{activeSupplier.name}</b>
                  </>
                ) : (
                  "Select a supplier to view receipts"
                )}
              </div>
            </div>

            <div className={styles.filters}>
              <div className={styles.pillGroup}>
                {(["ALL", "PENDING", "RECEIVED", "CANCELLED"] as const).map((k) => (
                  <button key={k} type="button" className={`${styles.pill} ${statusFilter === k ? styles.pillActive : ""}`} onClick={() => setStatusFilter(k)} disabled={busy !== null}>
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrapInline}>
              <i className="bi bi-search" />
              <input
                className={styles.searchInline}
                placeholder="Search receipt (reference, id)..."
                value={receiptQuery}
                onChange={(e) => setReceiptQuery(e.target.value)}
                disabled={!activeSupplierId}
              />
            </div>

            <button className={styles.btnGhost} type="button" onClick={createReceipt} disabled={!activeSupplierId || busy !== null}>
              <i className="bi bi-plus-lg" />
              Add receipt
            </button>
          </div>

          <div className={styles.cardList}>
            {loadingReceipts ? (
              <div className={styles.skeletonCards}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div className={styles.skeletonCard} key={i} />
                ))}
              </div>
            ) : !activeSupplierId ? (
              <div className={styles.empty}>
                <i className="bi bi-arrow-left-circle" />
                <div>
                  <div className={styles.emptyTitle}>Choose a supplier</div>
                  <div className={styles.emptyText}>Then you can create receipts and add items.</div>
                </div>
              </div>
            ) : visibleReceipts.length === 0 ? (
              <div className={styles.empty}>
                <i className="bi bi-receipt" />
                <div>
                  <div className={styles.emptyTitle}>No receipts</div>
                  <div className={styles.emptyText}>Create a receipt to start tracking imports.</div>
                </div>
              </div>
            ) : (
              visibleReceipts.map((r) => {
                const active = r.id === activeReceiptId;
                return (
                  <button key={r.id} type="button" className={`${styles.receiptCard} ${active ? styles.receiptActive : ""}`} onClick={() => setActiveReceiptId(r.id)}>
                    <div className={styles.receiptTop}>
                      <div className={styles.receiptTitle}>
                        <span className={`${styles.badge} ${badgeStatusClass(r.status)}`}>
                          <i
                            className={`bi ${
                              String(r.status).toUpperCase() === "RECEIVED" ? "bi-check2-circle" : String(r.status).toUpperCase() === "CANCELLED" ? "bi-x-circle" : "bi-hourglass-split"
                            }`}
                          />
                          {String(r.status).toUpperCase()}
                        </span>

                        <span className={styles.receiptRef}>{r.reference ? r.reference : `Receipt ${shortId(r.id)}`}</span>
                      </div>

                      <div className={styles.receiptMeta}>
                        <span className={styles.muted}>
                          <i className="bi bi-calendar3" /> {r.receivedAt ? new Date(r.receivedAt).toLocaleString() : "—"}
                        </span>
                        <span className={styles.muted}>
                          <i className="bi bi-list-check" /> {r.itemsCount ?? 0} items
                        </span>
                      </div>
                    </div>

                    <div className={styles.receiptBottom}>
                      <div className={styles.moneyBig}>{fmtMoney(r.totalCents ?? 0, r.currency ?? "USD")}</div>
                      <div className={styles.moneySub}>
                        <span className={styles.muted}>Subtotal: {fmtMoney(r.subtotalCents ?? 0, r.currency ?? "USD")}</span>
                        <span className={styles.muted}>Tax: {fmtMoney(r.taxCents ?? 0, r.currency ?? "USD")}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right: Receipt detail + items */}
        <aside className={styles.detail}>
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelTitle}>Receipt detail</div>
              <div className={styles.panelHint}>Edit meta, add items, mark received</div>
            </div>

            <div className={styles.detailActions}>
              <button className={styles.btnGhost} type="button" onClick={addItem} disabled={!activeReceipt || busy !== null}>
                <i className="bi bi-plus-lg" />
                Add item
              </button>
            </div>
          </div>

          {!activeReceiptId ? (
            <div className={styles.emptyBig}>
              <i className="bi bi-layout-text-sidebar-reverse" />
              <div>
                <div className={styles.emptyTitle}>Select a receipt</div>
                <div className={styles.emptyText}>Choose a receipt from the middle column to view items.</div>
              </div>
            </div>
          ) : loadingDetail ? (
            <div className={styles.detailLoading}>
              <div className={styles.skeletonBlock} />
              <div className={styles.skeletonBlock} />
              <div className={styles.skeletonBlock} />
            </div>
          ) : !activeReceipt ? (
            <div className={styles.emptyBig}>
              <i className="bi bi-exclamation-circle" />
              <div>
                <div className={styles.emptyTitle}>Receipt not found</div>
                <div className={styles.emptyText}>Try reloading this page.</div>
              </div>
            </div>
          ) : (
            <>
              {/* Receipt header card */}
              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <div className={styles.detailTitle}>
                    <span className={`${styles.badge} ${badgeStatusClass(activeReceipt.status)}`}>
                      <i
                        className={`bi ${
                          String(activeReceipt.status).toUpperCase() === "RECEIVED"
                            ? "bi-check2-circle"
                            : String(activeReceipt.status).toUpperCase() === "CANCELLED"
                            ? "bi-x-circle"
                            : "bi-hourglass-split"
                        }`}
                      />
                      {String(activeReceipt.status).toUpperCase()}
                    </span>
                    <span className={styles.detailRef}>{activeReceipt.reference || `Receipt ${shortId(activeReceipt.id)}`}</span>
                  </div>

                  <div className={styles.detailRight}>
                    <div className={styles.moneyBig}>{fmtMoney(activeReceipt.totalCents ?? 0, activeReceipt.currency ?? "USD")}</div>
                    <div className={styles.moneySub}>
                      <span className={styles.muted}>Subtotal: {fmtMoney(activeReceipt.subtotalCents ?? 0, activeReceipt.currency ?? "USD")}</span>
                      <span className={styles.muted}>Tax: {fmtMoney(activeReceipt.taxCents ?? 0, activeReceipt.currency ?? "USD")}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.metaGrid}>
                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Reference</div>
                    <div className={styles.metaValue}>
                      <button
                        type="button"
                        className={styles.metaEditBtn}
                        onClick={() => {
                          const v = prompt("Reference:", activeReceipt.reference ?? "");
                          if (v == null) return;
                          updateReceiptMeta({ reference: v.trim() || null });
                        }}
                        disabled={busy !== null}>
                        <i className="bi bi-pencil" /> {activeReceipt.reference ?? "—"}
                      </button>
                    </div>
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Received at</div>
                    <div className={styles.metaValue}>
                      <span className={styles.mono}>
                        <i className="bi bi-calendar3" /> {activeReceipt.receivedAt ? new Date(activeReceipt.receivedAt).toLocaleString() : "—"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Tax (cents)</div>
                    <div className={styles.metaValue}>
                      <button
                        type="button"
                        className={styles.metaEditBtn}
                        onClick={() => {
                          const v = prompt("taxCents:", String(activeReceipt.taxCents ?? 0));
                          if (v == null) return;
                          const n = clamp(Math.trunc(Number(v)), 0, 1_000_000_000);
                          updateReceiptMeta({ taxCents: n });
                        }}
                        disabled={busy !== null}>
                        <i className="bi bi-pencil" /> {activeReceipt.taxCents ?? 0}
                      </button>
                    </div>
                  </div>

                  <div className={styles.metaField}>
                    <div className={styles.metaLabel}>Notes</div>
                    <div className={styles.metaValue}>
                      <button
                        type="button"
                        className={styles.metaEditBtn}
                        onClick={() => {
                          const v = prompt("Notes:", activeReceipt.notes ?? "");
                          if (v == null) return;
                          updateReceiptMeta({ notes: v.trim() || null });
                        }}
                        disabled={busy !== null}>
                        <i className="bi bi-pencil" /> {activeReceipt.notes ? "Edit notes" : "Add notes"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.statusActions}>
                  <button
                    className={`${styles.btnSoft} ${String(activeReceipt.status).toUpperCase() === "PENDING" ? styles.btnSoftActive : ""}`}
                    type="button"
                    onClick={() => setReceiptStatus("PENDING")}
                    disabled={busy !== null}>
                    <i className="bi bi-hourglass-split" /> Pending
                  </button>
                  <button
                    className={`${styles.btnSoft} ${String(activeReceipt.status).toUpperCase() === "RECEIVED" ? styles.btnSoftActive : ""}`}
                    type="button"
                    onClick={() => setReceiptStatus("RECEIVED")}
                    disabled={busy !== null}
                    title="Mark RECEIVED will increment stock">
                    <i className="bi bi-check2-circle" /> Received
                  </button>
                  <button
                    className={`${styles.btnSoft} ${String(activeReceipt.status).toUpperCase() === "CANCELLED" ? styles.btnSoftActive : ""}`}
                    type="button"
                    onClick={() => setReceiptStatus("CANCELLED")}
                    disabled={busy !== null}
                    title="Cancel will revert stock if previously RECEIVED">
                    <i className="bi bi-x-circle" /> Cancelled
                  </button>
                </div>
              </div>

              {/* Items table */}
              <div className={styles.itemsCard}>
                <div className={styles.itemsHead}>
                  <div className={styles.itemsTitle}>
                    <i className="bi bi-list-check" /> Items ({items.length})
                  </div>
                  <div className={styles.itemsHint}>Click to edit qty / unit cost</div>
                </div>

                {items.length === 0 ? (
                  <div className={styles.emptySmall}>
                    <i className="bi bi-inbox" />
                    <div>
                      <div className={styles.emptyTitle}>No items</div>
                      <div className={styles.emptyText}>Add items to track stock and cost.</div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Variant</th>
                          <th className={styles.thRight}>Qty</th>
                          <th className={styles.thRight}>Unit</th>
                          <th className={styles.thRight}>Total</th>
                          <th className={styles.thRight}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it) => (
                          <tr key={it.id} className={styles.trHover}>
                            <td>
                              <div className={styles.cellTitle}>
                                <div className={styles.cellMain}>{it.product?.name ?? it.productId}</div>
                                <div className={styles.cellSub}>
                                  <span className={styles.mono}>{it.product?.sku ?? shortId(it.productId)}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              {it.variantId ? (
                                <div className={styles.cellTitle}>
                                  <div className={styles.cellMain}>{it.variant?.name ?? "Variant"}</div>
                                  <div className={styles.cellSub}>
                                    <span className={styles.mono}>{it.variant?.sku ?? shortId(it.variantId)}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className={styles.muted}>—</span>
                              )}
                            </td>
                            <td className={styles.tdRight}>
                              <span className={styles.mono}>{it.qty}</span>
                            </td>
                            <td className={styles.tdRight}>
                              <span className={styles.mono}>{fmtMoney(it.unitCostCents, activeReceipt.currency ?? "USD")}</span>
                            </td>
                            <td className={styles.tdRight}>
                              <span className={styles.mono}>{fmtMoney(it.totalCents, activeReceipt.currency ?? "USD")}</span>
                            </td>
                            <td className={styles.tdRight}>
                              <button className={styles.iconBtn} type="button" title="Edit" onClick={() => editItem(it)} disabled={busy !== null}>
                                <i className="bi bi-pencil" />
                              </button>
                              <button className={`${styles.iconBtn} ${styles.danger}`} type="button" title="Delete" onClick={() => deleteItem(it)} disabled={busy !== null}>
                                <i className="bi bi-trash" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className={styles.summaryCard}>
                <div className={styles.itemsHead}>
                  <div className={styles.itemsTitle}>
                    <i className="bi bi-graph-up-arrow" /> Summary
                  </div>
                  <div className={styles.itemsHint}>Quick view of quantities by line</div>
                </div>

                {itemSummary.length === 0 ? (
                  <div className={styles.emptySmall}>
                    <i className="bi bi-activity" />
                    <div>
                      <div className={styles.emptyTitle}>Nothing to summarize</div>
                      <div className={styles.emptyText}>Add items first.</div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.summaryList}>
                    {itemSummary.slice(0, 10).map((x, idx) => (
                      <div key={idx} className={styles.summaryRow}>
                        <div className={styles.summaryLeft}>
                          <div className={styles.summaryLabel}>{x.label}</div>
                          <div className={styles.summarySub}>
                            <span className={styles.muted}>Line total:</span> <span className={styles.mono}>{fmtMoney(x.totalCents, activeReceipt.currency ?? "USD")}</span>
                          </div>
                        </div>
                        <div className={styles.summaryQty}>
                          <div className={styles.qtyChip}>
                            <i className="bi bi-box-seam" /> {x.qty}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.footerNote}>
                <i className="bi bi-shield-check" />
                <span>
                  Tip: Khi bạn đổi status sang <b>RECEIVED</b>, API sẽ tăng stock. Nếu đổi ngược (RECEIVED → PENDING/CANCELLED), API sẽ revert stock.
                </span>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

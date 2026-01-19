"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/purchase-orders/purchase-orders.module.css";

type POStatus = "DRAFT" | "APPROVED" | "PARTIAL" | "RECEIVED" | "CANCELLED";
type Currency = "USD" | "VND";

type SupplierRow = {
  id: string;
  name: string;
  code: string;
  email?: string;
};

type POLine = {
  id: string;

  // DB link (chuẩn)
  productId: string;
  variantId?: string | null;

  // display
  sku: string;
  name: string;

  qtyOrdered: number;
  qtyReceived: number;
  unitCostCents: number;
};

type PurchaseOrder = {
  id: string;
  number: string;
  supplierId: string | null;
  status: POStatus;

  currency: Currency;
  expectedAt?: string; // YYYY-MM-DD
  notes?: string;

  lines: POLine[];

  createdAt: string;
  updatedAt: string;
};

function clampInt(v: number, min = 0, max = 1_000_000) {
  const n = Math.trunc(Number(v || 0));
  return Math.max(min, Math.min(max, n));
}

function fmtMoney(cents: number, ccy: Currency) {
  if (ccy === "VND") return Math.round(cents / 100).toLocaleString("vi-VN");
  return (cents / 100).toFixed(2);
}

function sumItems(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + (l.qtyOrdered || 0), 0);
}

function sumCostCents(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + (l.qtyOrdered || 0) * (l.unitCostCents || 0), 0);
}

function receivedCostCents(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + (l.qtyReceived || 0) * (l.unitCostCents || 0), 0);
}

function statusBadgeClass(s: POStatus) {
  if (s === "DRAFT") return "off";
  if (s === "APPROVED") return "info";
  if (s === "PARTIAL") return "warn";
  if (s === "RECEIVED") return "ok";
  return "bad";
}

// Small fetch helper
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json as T;
}

function mapPOFromApi(po: any): PurchaseOrder {
  return {
    id: po.id,
    number: po.number,
    supplierId: po.supplierId ?? null,
    status: po.status,
    currency: po.currency,
    expectedAt: po.expectedAt ? String(po.expectedAt).slice(0, 10) : undefined,
    notes: po.notes ?? "",
    lines: (po.lines ?? []).map((l: any) => ({
      id: l.id,
      productId: l.productId,
      variantId: l.variantId ?? null,
      sku: l.skuSnapshot || l.variant?.sku || l.product?.sku || "SKU",
      name: l.nameSnapshot || l.variant?.name || l.product?.name || "Item",
      qtyOrdered: l.qtyOrdered,
      qtyReceived: l.qtyReceived,
      unitCostCents: l.unitCostCents,
    })),
    createdAt: po.createdAt,
    updatedAt: po.updatedAt,
  };
}

export default function PurchaseOrdersPage() {
  // NOTE: Suppliers trong UI demo của bạn đang hardcode.
  // Khi bạn có DB supplier list, thay block này bằng fetch /api/admin/suppliers
  const [suppliers] = useState<SupplierRow[]>(() => [
    { id: "all", name: "All suppliers", code: "ALL" },
    { id: "s1", name: "Blue Ocean Trading", code: "BOT", email: "po@blueocean.test" },
    { id: "s2", name: "Hanoi Textile Co.", code: "HTX", email: "sales@hanoitextile.test" },
    { id: "s3", name: "Saigon Footwear", code: "SGF", email: "ops@saigonfootwear.test" },
  ]);

  const [activeSupplierId, setActiveSupplierId] = useState("all");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<POStatus | "ALL">("ALL");

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const supplierName = (id: string | null) => suppliers.find((s) => s.id === id)?.name || id || "—";

  // debounced query
  const [qDebounced, setQDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  async function refresh(opts?: { keepActive?: boolean }) {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (activeSupplierId !== "all") qs.set("supplierId", activeSupplierId);
      if (statusFilter !== "ALL") qs.set("status", statusFilter);
      if (qDebounced) qs.set("q", qDebounced);

      const res = await api<{ data: any[] }>(`/api/admin/purchase-orders?${qs.toString()}`);
      const mapped = res.data.map(mapPOFromApi);
      setOrders(mapped);

      if (!opts?.keepActive) {
        setActiveId(mapped[0]?.id || "");
      } else {
        // keep if exists
        const still = mapped.some((x) => x.id === activeId);
        if (!still) setActiveId(mapped[0]?.id || "");
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh({ keepActive: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSupplierId, statusFilter, qDebounced]);

  const visible = useMemo(() => {
    // server already filtered by supplier/status/q; keep a stable sort locally
    return orders.slice().sort((a, b) => b.number.localeCompare(a.number));
  }, [orders]);

  const active = useMemo(() => orders.find((x) => x.id === activeId) || null, [orders, activeId]);

  // --- actions (API) ---
  async function createPO() {
    setSaving(true);
    setErr(null);
    try {
      const res = await api<{ data: any }>(`/api/admin/purchase-orders`, { method: "POST" });
      const newId = res.data?.id as string | undefined;
      await refresh({ keepActive: true });
      if (newId) setActiveId(newId);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function patchPO(id: string, patch: Partial<PurchaseOrder>) {
    setSaving(true);
    setErr(null);
    try {
      await api(`/api/admin/purchase-orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          supplierId: patch.supplierId ?? undefined,
          currency: patch.currency ?? undefined,
          expectedAt: patch.expectedAt ?? undefined,
          notes: patch.notes ?? undefined,
        }),
      });
      await refresh({ keepActive: true });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Product lookup (requires you to create this endpoint)
  // Expected response:
  // { data: { productId, variantId?, sku, name } }
  async function lookupSku(sku: string) {
    const s = sku.trim().toUpperCase();
    if (!s) throw new Error("SKU is required");
    const res = await api<{ data: any }>(`/api/admin/products/lookup?sku=${encodeURIComponent(s)}`);
    if (!res?.data?.productId) throw new Error("SKU not found");
    return res.data;
  }

  async function addLine() {
    if (!active) return;

    if (active.status !== "DRAFT") {
      alert("Only DRAFT PO can be edited.");
      return;
    }

    const sku = prompt("Enter SKU to add (Product.sku or Variant.sku):", "");
    if (!sku) return;

    setSaving(true);
    setErr(null);

    try {
      const found = await lookupSku(sku);

      await api<{ data: any }>(`/api/admin/purchase-orders/${active.id}/lines`, {
        method: "POST",
        body: JSON.stringify({
          productId: found.productId,
          variantId: found.variantId ?? null,
          qtyOrdered: 1,
          unitCostCents: 0,
          skuSnapshot: found.sku ?? sku.trim().toUpperCase(),
          nameSnapshot: found.name ?? "Item",
        }),
      });

      await refresh({ keepActive: true });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateLine(poId: string, lineId: string, patch: { qtyOrdered?: number; unitCostCents?: number }) {
    if (!active) return;
    if (active.status !== "DRAFT") return;

    setSaving(true);
    setErr(null);
    try {
      await api(`/api/admin/purchase-orders/${poId}/lines?lineId=${encodeURIComponent(lineId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(patch.qtyOrdered !== undefined ? { qtyOrdered: clampInt(patch.qtyOrdered, 0) } : {}),
          ...(patch.unitCostCents !== undefined ? { unitCostCents: clampInt(patch.unitCostCents, 0) } : {}),
        }),
      });
      await refresh({ keepActive: true });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeLine(lineId: string) {
    if (!active) return;
    if (active.status !== "DRAFT") return;

    const ok = confirm("Remove this line?");
    if (!ok) return;

    setSaving(true);
    setErr(null);
    try {
      await api(`/api/admin/purchase-orders/${active.id}/lines/${lineId}`, { method: "DELETE" });
      await refresh({ keepActive: true });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function approvePO() {
    if (!active) return;
    setSaving(true);
    setErr(null);
    try {
      await api(`/api/admin/purchase-orders/${active.id}/approve`, { method: "POST" });
      await refresh({ keepActive: true });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function receive(poId: string, lines: Array<{ poLineId: string; qty: number }>) {
    setSaving(true);
    setErr(null);
    try {
      await api(`/api/admin/purchase-orders/${poId}/receive`, {
        method: "POST",
        body: JSON.stringify({ lines }),
      });
      await refresh({ keepActive: true });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function receiveLine(poLineId: string, qty: number) {
    if (!active) return;
    if (active.status === "DRAFT" || active.status === "CANCELLED") return;
    const add = clampInt(qty, 0);
    if (!add) return;
    await receive(active.id, [{ poLineId, qty: add }]);
  }

  async function receiveAllRemaining() {
    if (!active) return;
    if (active.status === "DRAFT" || active.status === "CANCELLED") return;

    const lines = active.lines.map((l) => ({ poLineId: l.id, qty: Math.max(0, l.qtyOrdered - l.qtyReceived) })).filter((x) => x.qty > 0);

    if (lines.length === 0) return;

    await receive(active.id, lines);
  }

  // Stats for sidebar (client side)
  const stats = useMemo(() => {
    const list = orders.filter((po) => (activeSupplierId === "all" ? true : po.supplierId === activeSupplierId));
    const open = list.filter((po) => po.status !== "RECEIVED" && po.status !== "CANCELLED").length;
    const received = list.filter((po) => po.status === "RECEIVED").length;
    const draft = list.filter((po) => po.status === "DRAFT").length;
    const spend = list.reduce((s, po) => s + sumCostCents(po), 0);
    return { open, received, draft, spend };
  }, [orders, activeSupplierId]);

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Purchase Orders</div>
            <div className={styles.brandSub}>Suppliers · Lines · Approve · Receive · Audit</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={() => refresh({ keepActive: true })} disabled={loading || saving}>
            <i className="bi bi-arrow-repeat" /> Refresh
          </button>
          <button className={styles.primaryBtn} type="button" onClick={createPO} disabled={saving}>
            <i className="bi bi-plus-lg" /> New PO
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Suppliers</div>
            <div className={styles.sidebarHint}>Filter purchase orders</div>
          </div>

          <div className={styles.supplierList}>
            {suppliers.map((s) => {
              const isActive = s.id === activeSupplierId;
              return (
                <button key={s.id} type="button" className={`${styles.supplierBtn} ${isActive ? styles.supplierActive : ""}`} onClick={() => setActiveSupplierId(s.id)}>
                  <div className={styles.supplierLeft}>
                    <span className={`${styles.dot} ${isActive ? styles.dotHot : ""}`} />
                    <div className={styles.supplierText}>
                      <div className={styles.supplierName}>{s.name}</div>
                      <div className={styles.supplierMeta}>
                        <span className={styles.mono}>{s.code}</span>
                      </div>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right" />
                </button>
              );
            })}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Open</div>
                <div className={styles.statValue}>{stats.open}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Draft</div>
                <div className={styles.statValue}>{stats.draft}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Spend</div>
                <div className={styles.statValue}>{fmtMoney(stats.spend, "USD")}</div>
              </div>
            </div>

            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>
                PO workflow: <span className={styles.mono}>DRAFT → APPROVED → PARTIAL → RECEIVED</span>
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.content}>
            {/* List */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>PO list</div>
                  <div className={styles.panelSub}>
                    {loading ? "Loading..." : saving ? "Saving..." : "Search and filter by status"}
                    {err ? ` · Error: ${err}` : ""}
                  </div>
                </div>
              </div>

              <div className={styles.toolbar}>
                <div className={styles.searchWrapInline}>
                  <i className="bi bi-search" />
                  <input className={styles.searchInline} placeholder="Search PO, supplier, SKU..." value={q} onChange={(e) => setQ(e.target.value)} />
                </div>

                <div className={styles.selectWrapInline}>
                  <i className="bi bi-funnel" />
                  <select className={styles.selectInline} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                    <option value="ALL">All</option>
                    <option value="DRAFT">Draft</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="RECEIVED">Received</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>PO</th>
                      <th>Supplier</th>
                      <th>Status</th>
                      <th>Expected</th>
                      <th className={styles.thNum}>Items</th>
                      <th className={styles.thNum}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className={styles.emptyRow}>
                            <i className="bi bi-inbox" />
                            <div>
                              <div className={styles.emptyTitle}>No purchase orders</div>
                              <div className={styles.emptyText}>Create a new PO to get started.</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visible.map((po) => {
                        const isActive = po.id === activeId;
                        const items = sumItems(po);
                        const total = sumCostCents(po);
                        return (
                          <tr key={po.id} className={`${styles.tr} ${isActive ? styles.trActive : ""}`} onClick={() => setActiveId(po.id)} role="button">
                            <td className={styles.mono}>
                              <div className={styles.poCell}>
                                <div className={styles.poNumber}>{po.number}</div>
                                <div className={styles.sub}>Updated: {new Date(po.updatedAt).toLocaleString()}</div>
                              </div>
                            </td>
                            <td>{supplierName(po.supplierId)}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[statusBadgeClass(po.status)]}`}>
                                <i className="bi bi-circle-fill" /> {po.status}
                              </span>
                            </td>
                            <td className={styles.mono}>{po.expectedAt || "—"}</td>
                            <td className={`${styles.thNum} ${styles.mono}`}>{items}</td>
                            <td className={`${styles.thNum} ${styles.mono}`}>
                              {po.currency} {fmtMoney(total, po.currency)}
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
                    <div className={styles.panelSub}>Edit header & lines, receive items</div>
                  </div>
                </div>

                {!active ? (
                  <div className={styles.panelBody}>
                    <div className={styles.emptyInspector}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.emptyTitle}>Select a PO</div>
                        <div className={styles.emptyText}>Click a row to edit.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    <div className={styles.headerRow}>
                      <div>
                        <div className={styles.headTitle}>{active.number}</div>
                        <div className={styles.headMeta}>
                          <span className={styles.badgeMini}>
                            <i className="bi bi-truck" /> {supplierName(active.supplierId)}
                          </span>
                          <span className={styles.badgeMini}>
                            <i className="bi bi-activity" /> {active.status}
                          </span>
                        </div>
                      </div>

                      <span className={`${styles.badge} ${styles[statusBadgeClass(active.status)]}`}>
                        <i className="bi bi-circle-fill" /> {active.status}
                      </span>
                    </div>

                    <label className={styles.label}>Supplier</label>
                    <div className={styles.selectWrap}>
                      <i className="bi bi-building" />
                      <select
                        className={styles.select}
                        value={active.supplierId ?? ""}
                        onChange={(e) => patchPO(active.id, { supplierId: e.target.value })}
                        disabled={active.status !== "DRAFT" || saving}>
                        <option value="" disabled>
                          Select supplier
                        </option>
                        {suppliers
                          .filter((s) => s.id !== "all")
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Currency</label>
                        <div className={styles.selectWrap}>
                          <i className="bi bi-currency-dollar" />
                          <select
                            className={styles.select}
                            value={active.currency}
                            onChange={(e) => patchPO(active.id, { currency: e.target.value as Currency })}
                            disabled={active.status !== "DRAFT" || saving}>
                            <option value="USD">USD</option>
                            <option value="VND">VND</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Expected date</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-calendar3" />
                          <input
                            className={styles.input}
                            type="date"
                            value={active.expectedAt || ""}
                            onChange={(e) => patchPO(active.id, { expectedAt: e.target.value || undefined })}
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>

                    <label className={styles.label}>Notes</label>
                    <textarea
                      className={styles.textarea}
                      value={active.notes || ""}
                      onChange={(e) => patchPO(active.id, { notes: e.target.value })}
                      placeholder="Packing / shipping instructions..."
                      disabled={saving}
                    />

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-list-check" /> Line items
                    </div>

                    {active.lines.length === 0 ? (
                      <div className={styles.emptySmall}>No lines. Add items to this PO.</div>
                    ) : (
                      <div className={styles.lines}>
                        {active.lines.map((l) => {
                          const remaining = Math.max(0, (l.qtyOrdered || 0) - (l.qtyReceived || 0));
                          return (
                            <div key={l.id} className={styles.lineCard}>
                              <div className={styles.lineTop}>
                                <div className={styles.lineMain}>
                                  <div className={styles.lineName}>{l.name}</div>
                                  <div className={styles.lineSku}>
                                    <span className={styles.mono}>{l.sku}</span>
                                  </div>
                                </div>

                                <button
                                  className={`${styles.iconBtn} ${styles.dangerBtn}`}
                                  type="button"
                                  title="Remove line"
                                  onClick={() => removeLine(l.id)}
                                  disabled={active.status !== "DRAFT" || saving}>
                                  <i className="bi bi-trash" />
                                </button>
                              </div>

                              <div className={styles.lineGrid}>
                                <div>
                                  <div className={styles.smallLabel}>Ordered</div>
                                  <div className={styles.inputMiniWrap}>
                                    <i className="bi bi-bag" />
                                    <input
                                      className={styles.inputMini}
                                      type="number"
                                      value={l.qtyOrdered}
                                      disabled={active.status !== "DRAFT" || saving}
                                      onChange={(e) => updateLine(active.id, l.id, { qtyOrdered: clampInt(Number(e.target.value || 0), 0) })}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className={styles.smallLabel}>Received</div>
                                  <div className={styles.inputMiniWrap}>
                                    <i className="bi bi-box-seam" />
                                    <input className={styles.inputMini} type="number" value={l.qtyReceived} disabled readOnly />
                                  </div>
                                </div>

                                <div>
                                  <div className={styles.smallLabel}>Unit cost</div>
                                  <div className={styles.inputMiniWrap}>
                                    <i className="bi bi-cash-stack" />
                                    <input
                                      className={styles.inputMini}
                                      type="number"
                                      value={Math.round(l.unitCostCents / 100)}
                                      disabled={active.status !== "DRAFT" || saving}
                                      onChange={(e) => updateLine(active.id, l.id, { unitCostCents: clampInt(Number(e.target.value || 0), 0) * 100 })}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className={styles.receiveRow}>
                                <span className={styles.receiveHint}>
                                  Remaining: <span className={styles.mono}>{remaining}</span>
                                </span>

                                <button
                                  className={styles.ghostBtn}
                                  type="button"
                                  onClick={() => receiveLine(l.id, remaining)}
                                  disabled={saving || active.status === "DRAFT" || active.status === "CANCELLED" || remaining <= 0}
                                  title="Receive remaining for this line">
                                  <i className="bi bi-box-arrow-in-down" /> Receive all
                                </button>

                                <button
                                  className={styles.primaryBtn}
                                  type="button"
                                  onClick={() => receiveLine(l.id, 1)}
                                  disabled={saving || active.status === "DRAFT" || active.status === "CANCELLED" || remaining <= 0}
                                  title="Receive 1 unit">
                                  <i className="bi bi-plus-lg" /> +1
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button className={styles.ghostBtn} type="button" onClick={addLine} disabled={active.status !== "DRAFT" || saving}>
                      <i className="bi bi-plus-lg" /> Add line (by SKU)
                    </button>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-lightning" /> Actions
                    </div>

                    <div className={styles.actions}>
                      <button className={styles.primaryBtn} type="button" onClick={approvePO} disabled={active.status !== "DRAFT" || saving}>
                        <i className="bi bi-check2-circle" /> Approve
                      </button>

                      <button className={styles.ghostBtn} type="button" onClick={receiveAllRemaining} disabled={saving || active.status === "DRAFT" || active.status === "CANCELLED"}>
                        <i className="bi bi-box-arrow-in-down" /> Receive all remaining
                      </button>

                      <button
                        className={`${styles.ghostBtn} ${styles.dangerGhost}`}
                        type="button"
                        onClick={() => alert("Wire cancel API if you want to support CANCELLED (recommended: POST /purchase-orders/[id]/cancel)")}
                        disabled={saving || active.status === "RECEIVED"}>
                        <i className="bi bi-x-circle" /> Cancel
                      </button>
                    </div>

                    <div className={styles.summaryBox}>
                      <div className={styles.summaryLine}>
                        <span>Ordered total</span>
                        <span className={styles.mono}>
                          {active.currency} {fmtMoney(sumCostCents(active), active.currency)}
                        </span>
                      </div>
                      <div className={styles.summaryLine}>
                        <span>Received value</span>
                        <span className={styles.mono}>
                          {active.currency} {fmtMoney(receivedCostCents(active), active.currency)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.tipInline}>
                      <i className="bi bi-shield-check" />
                      <span>
                        Receive PO sẽ tạo <span className={styles.mono}>InventoryReceipt</span> + <span className={styles.mono}>StockMovement(IN)</span> để tăng tồn kho & audit.
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

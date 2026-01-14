"use client";

import { useMemo, useState } from "react";
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
  sku: string;
  name: string; // product/variant label
  qtyOrdered: number;
  qtyReceived: number;
  unitCostCents: number;
};

type PurchaseOrder = {
  id: string;
  number: string; // PO-00012
  supplierId: string;
  status: POStatus;

  currency: Currency;
  expectedAt?: string; // ISO date
  notes?: string;

  lines: POLine[];

  createdAt: string;
  updatedAt: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function nowIso() {
  return new Date().toISOString();
}

function clampInt(v: number, min = 0, max = 1_000_000) {
  const n = Math.trunc(Number(v || 0));
  return Math.max(min, Math.min(max, n));
}

function fmtMoney(cents: number, ccy: Currency) {
  if (ccy === "VND") return Math.round(cents / 100).toLocaleString("vi-VN");
  return (cents / 100).toFixed(2);
}

function sumItems(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + l.qtyOrdered, 0);
}

function sumCostCents(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + l.qtyOrdered * l.unitCostCents, 0);
}

function receivedCostCents(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + l.qtyReceived * l.unitCostCents, 0);
}

function statusBadgeClass(s: POStatus) {
  if (s === "DRAFT") return "off";
  if (s === "APPROVED") return "info";
  if (s === "PARTIAL") return "warn";
  if (s === "RECEIVED") return "ok";
  return "bad";
}

function nextStatusFromLines(po: PurchaseOrder): POStatus {
  if (po.status === "CANCELLED") return "CANCELLED";
  if (po.status === "DRAFT") return "DRAFT";
  const ordered = po.lines.reduce((s, l) => s + l.qtyOrdered, 0);
  const rec = po.lines.reduce((s, l) => s + l.qtyReceived, 0);
  if (ordered === 0) return po.status;
  if (rec <= 0) return "APPROVED";
  if (rec < ordered) return "PARTIAL";
  return "RECEIVED";
}

export default function PurchaseOrdersPage() {
  const [suppliers] = useState<SupplierRow[]>(() => [
    { id: "all", name: "All suppliers", code: "ALL" },
    { id: "s1", name: "Blue Ocean Trading", code: "BOT", email: "po@blueocean.test" },
    { id: "s2", name: "Hanoi Textile Co.", code: "HTX", email: "sales@hanoitextile.test" },
    { id: "s3", name: "Saigon Footwear", code: "SGF", email: "ops@saigonfootwear.test" },
  ]);

  const [activeSupplierId, setActiveSupplierId] = useState("all");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<POStatus | "ALL">("ALL");

  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const seed: PurchaseOrder[] = [
      {
        id: uid(),
        number: "PO-00012",
        supplierId: "s1",
        status: "APPROVED",
        currency: "USD",
        expectedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
        notes: "Ship by sea. Pack by color/size.",
        lines: [
          { id: uid(), sku: "TSHIRT-RED-M", name: "T-Shirt Classic — Red / M", qtyOrdered: 50, qtyReceived: 0, unitCostCents: 600 },
          { id: uid(), sku: "TSHIRT-BLACK-L", name: "T-Shirt Classic — Black / L", qtyOrdered: 30, qtyReceived: 0, unitCostCents: 600 },
        ],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: uid(),
        number: "PO-00011",
        supplierId: "s2",
        status: "PARTIAL",
        currency: "USD",
        expectedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
        notes: "Urgent restock.",
        lines: [{ id: uid(), sku: "TSHIRT-WHITE-S", name: "T-Shirt Classic — White / S", qtyOrdered: 40, qtyReceived: 10, unitCostCents: 580 }],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: uid(),
        number: "PO-00010",
        supplierId: "s3",
        status: "DRAFT",
        currency: "USD",
        expectedAt: undefined,
        notes: "",
        lines: [{ id: uid(), sku: "SNEAK-41", name: "Sneakers Runner — 41", qtyOrdered: 20, qtyReceived: 0, unitCostCents: 3200 }],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ];
    return seed.sort((a, b) => b.number.localeCompare(a.number));
  });

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders
      .filter((po) => (activeSupplierId === "all" ? true : po.supplierId === activeSupplierId))
      .filter((po) => (statusFilter === "ALL" ? true : po.status === statusFilter))
      .filter((po) => {
        if (!qq) return true;
        const sup = suppliers.find((s) => s.id === po.supplierId)?.name || "";
        const hay = `${po.number} ${sup} ${po.status} ${po.lines.map((l) => l.sku + " " + l.name).join(" ")}`.toLowerCase();
        return hay.includes(qq);
      })
      .slice()
      .sort((a, b) => b.number.localeCompare(a.number));
  }, [orders, activeSupplierId, statusFilter, q, suppliers]);

  const [activeId, setActiveId] = useState<string>(() => visible[0]?.id || orders[0]?.id || "");
  const active = useMemo(() => orders.find((x) => x.id === activeId) || null, [orders, activeId]);

  function patchPO(id: string, patch: Partial<PurchaseOrder>) {
    setOrders((prev) => prev.map((po) => (po.id === id ? { ...po, ...patch, updatedAt: nowIso() } : po)));
  }

  function patchLine(poId: string, lineId: string, patch: Partial<POLine>) {
    setOrders((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        const lines = po.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l));
        const next = { ...po, lines, updatedAt: nowIso() };
        return { ...next, status: nextStatusFromLines(next) };
      })
    );
  }

  function addLine() {
    if (!active) return;
    const next: POLine = {
      id: uid(),
      sku: "SKU",
      name: "Item name",
      qtyOrdered: 1,
      qtyReceived: 0,
      unitCostCents: 0,
    };
    patchPO(active.id, { lines: [...active.lines, next] });
  }

  function removeLine(lineId: string) {
    if (!active) return;
    const ok = confirm("Remove this line?");
    if (!ok) return;
    const lines = active.lines.filter((l) => l.id !== lineId);
    const next = { ...active, lines, updatedAt: nowIso() };
    patchPO(active.id, { lines, status: nextStatusFromLines(next) });
  }

  function createPO() {
    const nextNumber = "PO-" + String(orders.length + 10).padStart(5, "0");
    const po: PurchaseOrder = {
      id: uid(),
      number: nextNumber,
      supplierId: activeSupplierId === "all" ? "s1" : activeSupplierId,
      status: "DRAFT",
      currency: "USD",
      expectedAt: undefined,
      notes: "",
      lines: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setOrders((prev) => [po, ...prev]);
    setActiveId(po.id);
  }

  function setStatus(next: POStatus) {
    if (!active) return;
    if (active.status === "CANCELLED") return;

    if (next === "APPROVED" && active.lines.length === 0) {
      alert("Add at least one line before approving.");
      return;
    }
    if (next === "RECEIVED") {
      // receive all remaining
      setOrders((prev) =>
        prev.map((po) => {
          if (po.id !== active.id) return po;
          const lines = po.lines.map((l) => ({ ...l, qtyReceived: l.qtyOrdered }));
          const nextPO = { ...po, status: "RECEIVED" as const, lines, updatedAt: nowIso() };
          return nextPO;
        })
      );
      return;
    }

    patchPO(active.id, { status: next });
  }

  // Receive partial (by entering qty per line)
  function receiveLine(lineId: string, qty: number) {
    if (!active) return;
    const line = active.lines.find((l) => l.id === lineId);
    if (!line) return;

    const add = clampInt(qty, 0, 1_000_000);
    const nextReceived = clampInt(Math.min(line.qtyOrdered, line.qtyReceived + add), 0);
    patchLine(active.id, lineId, { qtyReceived: nextReceived });
  }

  // Stats for sidebar
  const stats = useMemo(() => {
    const list = orders.filter((po) => (activeSupplierId === "all" ? true : po.supplierId === activeSupplierId));
    const open = list.filter((po) => po.status !== "RECEIVED" && po.status !== "CANCELLED").length;
    const received = list.filter((po) => po.status === "RECEIVED").length;
    const draft = list.filter((po) => po.status === "DRAFT").length;
    const spend = list.reduce((s, po) => s + sumCostCents(po), 0);
    return { open, received, draft, spend };
  }, [orders, activeSupplierId]);

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name || id;

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
          <button className={styles.ghostBtn} type="button" onClick={() => alert("Demo only. Wire export to CSV/PDF.")}>
            <i className="bi bi-download" /> Export
          </button>
          <button className={styles.primaryBtn} type="button" onClick={createPO}>
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
              const active = s.id === activeSupplierId;
              return (
                <button key={s.id} type="button" className={`${styles.supplierBtn} ${active ? styles.supplierActive : ""}`} onClick={() => setActiveSupplierId(s.id)}>
                  <div className={styles.supplierLeft}>
                    <span className={`${styles.dot} ${active ? styles.dotHot : ""}`} />
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
                  <div className={styles.panelSub}>Search and filter by status</div>
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
                        const active = po.id === activeId;
                        const items = sumItems(po);
                        const total = sumCostCents(po);
                        return (
                          <tr key={po.id} className={`${styles.tr} ${active ? styles.trActive : ""}`} onClick={() => setActiveId(po.id)} role="button">
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
                      <select className={styles.select} value={active.supplierId} onChange={(e) => patchPO(active.id, { supplierId: e.target.value })} disabled={active.status !== "DRAFT"}>
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
                          <select className={styles.select} value={active.currency} onChange={(e) => patchPO(active.id, { currency: e.target.value as Currency })} disabled={active.status !== "DRAFT"}>
                            <option value="USD">USD</option>
                            <option value="VND">VND</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={styles.label}>Expected date</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-calendar3" />
                          <input className={styles.input} type="date" value={active.expectedAt || ""} onChange={(e) => patchPO(active.id, { expectedAt: e.target.value || undefined })} />
                        </div>
                      </div>
                    </div>

                    <label className={styles.label}>Notes</label>
                    <textarea className={styles.textarea} value={active.notes || ""} onChange={(e) => patchPO(active.id, { notes: e.target.value })} placeholder="Packing / shipping instructions..." />

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-list-check" /> Line items
                    </div>

                    {active.lines.length === 0 ? (
                      <div className={styles.emptySmall}>No lines. Add items to this PO.</div>
                    ) : (
                      <div className={styles.lines}>
                        {active.lines.map((l) => {
                          const remaining = Math.max(0, l.qtyOrdered - l.qtyReceived);
                          return (
                            <div key={l.id} className={styles.lineCard}>
                              <div className={styles.lineTop}>
                                <div className={styles.lineMain}>
                                  <div className={styles.lineName}>{l.name}</div>
                                  <div className={styles.lineSku}>
                                    <span className={styles.mono}>{l.sku}</span>
                                  </div>
                                </div>
                                <button className={`${styles.iconBtn} ${styles.dangerBtn}`} type="button" title="Remove line" onClick={() => removeLine(l.id)} disabled={active.status !== "DRAFT"}>
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
                                      disabled={active.status !== "DRAFT"}
                                      onChange={(e) => patchLine(active.id, l.id, { qtyOrdered: clampInt(Number(e.target.value || 0), 0) })}
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
                                      disabled={active.status !== "DRAFT"}
                                      onChange={(e) => patchLine(active.id, l.id, { unitCostCents: clampInt(Number(e.target.value || 0), 0) * 100 })}
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
                                  disabled={active.status === "DRAFT" || active.status === "CANCELLED" || remaining <= 0}
                                  title="Receive remaining for this line">
                                  <i className="bi bi-box-arrow-in-down" /> Receive all
                                </button>

                                <button
                                  className={styles.primaryBtn}
                                  type="button"
                                  onClick={() => receiveLine(l.id, 1)}
                                  disabled={active.status === "DRAFT" || active.status === "CANCELLED" || remaining <= 0}
                                  title="Receive 1 unit">
                                  <i className="bi bi-plus-lg" /> +1
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button className={styles.ghostBtn} type="button" onClick={addLine} disabled={active.status !== "DRAFT"}>
                      <i className="bi bi-plus-lg" /> Add line
                    </button>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-lightning" /> Actions
                    </div>

                    <div className={styles.actions}>
                      <button className={styles.primaryBtn} type="button" onClick={() => setStatus("APPROVED")} disabled={active.status !== "DRAFT"}>
                        <i className="bi bi-check2-circle" /> Approve
                      </button>

                      <button className={styles.ghostBtn} type="button" onClick={() => setStatus("RECEIVED")} disabled={active.status === "DRAFT" || active.status === "CANCELLED"}>
                        <i className="bi bi-box-arrow-in-down" /> Receive all
                      </button>

                      <button className={`${styles.ghostBtn} ${styles.dangerGhost}`} type="button" onClick={() => setStatus("CANCELLED")} disabled={active.status === "RECEIVED"}>
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
                        Khi nối DB: Receive PO nên tạo <span className={styles.mono}>InventoryLedger(RECEIVE)</span> theo từng line để update tồn kho.
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

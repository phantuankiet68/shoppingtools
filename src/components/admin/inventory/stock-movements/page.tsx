"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/stock-movements/stock-movements.module.css";

type MovementType = "RECEIVE" | "SHIP" | "RESERVE" | "RELEASE" | "ADJUST";

type LocationRow = {
  id: string;
  name: string;
  code: string;
};

type MovementRow = {
  id: string;
  createdAt: string;

  locationId: string;

  productName: string;
  variantName: string;
  sku: string;

  type: MovementType;
  qty: number; // signed: + for RECEIVE/RELEASE? (we will keep signed for ADJUST; others use +/- below)
  beforeOnHand: number;
  afterOnHand: number;

  beforeReserved: number;
  afterReserved: number;

  reference?: string; // orderId / poId / note
  createdBy: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function nowIso() {
  return new Date().toISOString();
}

function clampInt(n: number, min = -1_000_000, max = 1_000_000) {
  const v = Math.trunc(n);
  return Math.max(min, Math.min(max, v));
}

function fmtType(t: MovementType) {
  if (t === "RECEIVE") return "Receive";
  if (t === "SHIP") return "Ship";
  if (t === "RESERVE") return "Reserve";
  if (t === "RELEASE") return "Release";
  return "Adjust";
}

function fmtQty(t: MovementType, qty: number) {
  // show sign convention:
  // RECEIVE +, SHIP -, RESERVE + (reserved increases), RELEASE - (reserved decreases), ADJUST signed
  const sign = qty > 0 ? "+" : qty < 0 ? "−" : "";
  return `${sign}${Math.abs(qty)}`;
}

function badgeClass(t: MovementType) {
  if (t === "RECEIVE") return "ok";
  if (t === "SHIP") return "bad";
  if (t === "RESERVE") return "info";
  if (t === "RELEASE") return "off";
  return "warn";
}

export default function StockMovementsPage() {
  const [locations] = useState<LocationRow[]>(() => [
    { id: "all", name: "All locations", code: "ALL" },
    { id: "hcm", name: "HCM Warehouse", code: "HCM" },
    { id: "hn", name: "Hanoi Warehouse", code: "HN" },
    { id: "dn", name: "Da Nang Hub", code: "DN" },
  ]);

  const [activeLocationId, setActiveLocationId] = useState("all");

  const [typeFilter, setTypeFilter] = useState<MovementType | "ALL">("ALL");
  const [q, setQ] = useState("");

  const [rangePreset, setRangePreset] = useState<"today" | "7d" | "30d" | "all">("7d");

  const [rows, setRows] = useState<MovementRow[]>(() => {
    const base: MovementRow[] = [];

    // Seed data (demo)
    base.push({
      id: uid(),
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      locationId: "hcm",
      productName: "T-Shirt Classic",
      variantName: "Red / M",
      sku: "TSHIRT-RED-M",
      type: "RECEIVE",
      qty: +10,
      beforeOnHand: 2,
      afterOnHand: 12,
      beforeReserved: 0,
      afterReserved: 0,
      reference: "PO-00012",
      createdBy: "admin",
    });

    base.push({
      id: uid(),
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      locationId: "hcm",
      productName: "T-Shirt Classic",
      variantName: "Red / M",
      sku: "TSHIRT-RED-M",
      type: "RESERVE",
      qty: +4,
      beforeOnHand: 12,
      afterOnHand: 12,
      beforeReserved: 0,
      afterReserved: 4,
      reference: "ORDER-1049",
      createdBy: "system",
    });

    base.push({
      id: uid(),
      createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
      locationId: "hn",
      productName: "Sneakers Runner",
      variantName: "41",
      sku: "SNEAK-41",
      type: "SHIP",
      qty: -2,
      beforeOnHand: 5,
      afterOnHand: 3,
      beforeReserved: 2,
      afterReserved: 0,
      reference: "ORDER-1048",
      createdBy: "admin",
    });

    base.push({
      id: uid(),
      createdAt: new Date(Date.now() - 1000 * 60 * 350).toISOString(),
      locationId: "dn",
      productName: "Backpack Urban",
      variantName: "Default",
      sku: "BAG-DEFAULT",
      type: "ADJUST",
      qty: -1,
      beforeOnHand: 21,
      afterOnHand: 20,
      beforeReserved: 2,
      afterReserved: 2,
      reference: "Cycle count correction",
      createdBy: "auditor",
    });

    base.push({
      id: uid(),
      createdAt: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
      locationId: "hcm",
      productName: "T-Shirt Classic",
      variantName: "Black / L",
      sku: "TSHIRT-BLACK-L",
      type: "RELEASE",
      qty: -1,
      beforeOnHand: 6,
      afterOnHand: 6,
      beforeReserved: 2,
      afterReserved: 1,
      reference: "ORDER-1046 cancel",
      createdBy: "system",
    });

    return base.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  const [activeId, setActiveId] = useState<string>(() => rows[0]?.id || "");
  const active = useMemo(() => rows.find((r) => r.id === activeId) || null, [rows, activeId]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    const now = Date.now();
    const minTime =
      rangePreset === "today" ? new Date(new Date().toDateString()).getTime() : rangePreset === "7d" ? now - 1000 * 60 * 60 * 24 * 7 : rangePreset === "30d" ? now - 1000 * 60 * 60 * 24 * 30 : 0;

    return rows
      .filter((r) => (activeLocationId === "all" ? true : r.locationId === activeLocationId))
      .filter((r) => (typeFilter === "ALL" ? true : r.type === typeFilter))
      .filter((r) => (minTime ? new Date(r.createdAt).getTime() >= minTime : true))
      .filter((r) => (qq ? (r.sku + " " + r.productName + " " + r.variantName + " " + (r.reference || "") + " " + r.createdBy).toLowerCase().includes(qq) : true))
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [rows, activeLocationId, typeFilter, rangePreset, q]);

  // ---- create movement (demo append) ----
  const [formSku, setFormSku] = useState("TSHIRT-RED-M");
  const [formProduct, setFormProduct] = useState("T-Shirt Classic");
  const [formVariant, setFormVariant] = useState("Red / M");
  const [formType, setFormType] = useState<MovementType>("RECEIVE");
  const [formQty, setFormQty] = useState<number>(1);
  const [formRef, setFormRef] = useState<string>("");

  function appendMovement() {
    const loc = activeLocationId === "all" ? "hcm" : activeLocationId;

    const qtyRaw = clampInt(Number(formQty || 0), -1_000_000, 1_000_000);
    if (!qtyRaw) return alert("Quantity must be non-zero.");

    // For non-ADJUST types, enforce sign conventions
    let qty = qtyRaw;
    if (formType === "RECEIVE") qty = Math.abs(qtyRaw);
    if (formType === "SHIP") qty = -Math.abs(qtyRaw);
    if (formType === "RESERVE") qty = Math.abs(qtyRaw);
    if (formType === "RELEASE") qty = -Math.abs(qtyRaw);
    if (formType === "ADJUST") qty = qtyRaw;

    // In real app: compute before/after from InventoryBalance (atomic transaction)
    const last = rows.find((r) => r.locationId === loc && r.sku === formSku);
    const beforeOnHand = last ? last.afterOnHand : 0;
    const beforeReserved = last ? last.afterReserved : 0;

    let afterOnHand = beforeOnHand;
    let afterReserved = beforeReserved;

    if (formType === "RECEIVE" || formType === "SHIP" || formType === "ADJUST") {
      afterOnHand = Math.max(0, beforeOnHand + qty);
      afterReserved = Math.min(afterReserved, afterOnHand);
    } else {
      // reserve/release only change reserved
      afterReserved = Math.max(0, beforeReserved + qty); // qty might be negative for RELEASE
      afterReserved = Math.min(afterReserved, afterOnHand);
    }

    const row: MovementRow = {
      id: uid(),
      createdAt: nowIso(),
      locationId: loc,
      productName: formProduct.trim() || "Unknown",
      variantName: formVariant.trim() || "Default",
      sku: formSku.trim().toUpperCase() || "SKU",
      type: formType,
      qty,
      beforeOnHand,
      afterOnHand,
      beforeReserved,
      afterReserved,
      reference: formRef.trim() || undefined,
      createdBy: "admin",
    };

    setRows((prev) => [row, ...prev]);
    setActiveId(row.id);

    setFormQty(1);
    setFormRef("");
  }

  const summary = useMemo(() => {
    const total = filtered.length;
    const byType: Record<string, number> = {};
    for (const r of filtered) byType[r.type] = (byType[r.type] || 0) + 1;
    return { total, byType };
  }, [filtered]);

  return (
    <div className={styles.shell}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Stock Movements</div>
            <div className={styles.brandSub}>Ledger · Filters · References · Audit trail</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={() => alert("Demo only. Wire export to CSV.")}>
            <i className="bi bi-download" /> Export
          </button>
          <button className={styles.primaryBtn} type="button" onClick={appendMovement}>
            <i className="bi bi-plus-lg" /> New movement
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Filters</div>
            <div className={styles.sidebarHint}>Location, type, time range</div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-geo-alt" /> Location
            </div>

            <div className={styles.locationList}>
              {locations.map((l) => {
                const active = l.id === activeLocationId;
                return (
                  <button key={l.id} type="button" className={`${styles.locationBtn} ${active ? styles.locationActive : ""}`} onClick={() => setActiveLocationId(l.id)}>
                    <div className={styles.locationLeft}>
                      <span className={`${styles.dot} ${active ? styles.dotHot : ""}`} />
                      <div className={styles.locationText}>
                        <div className={styles.locationName}>{l.name}</div>
                        <div className={styles.locationMeta}>
                          <span className={styles.mono}>{l.code}</span>
                        </div>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-funnel" /> Type
            </div>

            <div className={styles.typeGrid}>
              {(["ALL", "RECEIVE", "SHIP", "RESERVE", "RELEASE", "ADJUST"] as const).map((t) => {
                const active = t === typeFilter;
                return (
                  <button key={t} type="button" className={`${styles.pill} ${active ? styles.pillOn : ""}`} onClick={() => setTypeFilter(t)}>
                    {t === "ALL" ? <i className="bi bi-layers" /> : <i className="bi bi-lightning" />}
                    {t === "ALL" ? "All" : fmtType(t)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-clock-history" /> Range
            </div>

            <div className={styles.rangeRow}>
              {(["today", "7d", "30d", "all"] as const).map((p) => (
                <button key={p} type="button" className={`${styles.pill} ${rangePreset === p ? styles.pillOn : ""}`} onClick={() => setRangePreset(p)}>
                  <i className="bi bi-calendar3" /> {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <i className="bi bi-activity" /> Summary
              </div>
              <div className={styles.summaryLine}>
                <span>Total</span>
                <span className={styles.mono}>{summary.total}</span>
              </div>
              <div className={styles.summaryChips}>
                {Object.entries(summary.byType).map(([k, v]) => (
                  <span key={k} className={styles.chip}>
                    {k}: <span className={styles.mono}>{v}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.tip}>
              <i className="bi bi-shield-check" />
              <span>Movements là ledger (audit). Snapshot tồn kho nên rebuild được từ ledger.</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.content}>
            {/* Table */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Movements</div>
                  <div className={styles.panelSub}>Click a row to view details</div>
                </div>
              </div>

              <div className={styles.toolbar}>
                <div className={styles.searchWrapInline}>
                  <i className="bi bi-search" />
                  <input className={styles.searchInline} placeholder="Search by SKU, reference, user..." value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>SKU</th>
                      <th>Type</th>
                      <th className={styles.thNum}>Qty</th>
                      <th className={styles.thNum}>On hand</th>
                      <th className={styles.thNum}>Reserved</th>
                      <th>Ref</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8}>
                          <div className={styles.emptyRow}>
                            <i className="bi bi-inbox" />
                            <div>
                              <div className={styles.emptyTitle}>No movements</div>
                              <div className={styles.emptyText}>Try different filters.</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => {
                        const active = r.id === activeId;
                        return (
                          <tr key={r.id} className={`${styles.tr} ${active ? styles.trActive : ""}`} onClick={() => setActiveId(r.id)} role="button">
                            <td className={styles.mono}>{new Date(r.createdAt).toLocaleString()}</td>
                            <td className={styles.mono}>
                              <div className={styles.skuCell}>
                                <span className={styles.sku}>{r.sku}</span>
                                <span className={styles.sub}>
                                  {r.productName} · {r.variantName}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${styles[badgeClass(r.type)]}`}>
                                <i className="bi bi-lightning-charge" /> {fmtType(r.type)}
                              </span>
                            </td>
                            <td className={`${styles.tdNum} ${styles.mono}`}>{fmtQty(r.type, r.qty)}</td>
                            <td className={`${styles.tdNum} ${styles.mono}`}>
                              {r.beforeOnHand} → {r.afterOnHand}
                            </td>
                            <td className={`${styles.tdNum} ${styles.mono}`}>
                              {r.beforeReserved} → {r.afterReserved}
                            </td>
                            <td className={styles.mono}>{r.reference || "—"}</td>
                            <td className={styles.mono}>{r.createdBy}</td>
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
                    <div className={styles.panelSub}>Create & review movement</div>
                  </div>
                </div>

                <div className={styles.panelBody}>
                  <div className={styles.sectionTitle}>
                    <i className="bi bi-plus-circle" /> Create movement
                  </div>

                  <label className={styles.label}>SKU</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-upc-scan" />
                    <input className={styles.input} value={formSku} onChange={(e) => setFormSku(e.target.value.toUpperCase())} />
                  </div>

                  <div className={styles.twoCols}>
                    <div>
                      <label className={styles.label}>Product</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-box" />
                        <input className={styles.input} value={formProduct} onChange={(e) => setFormProduct(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={styles.label}>Variant</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-tags" />
                        <input className={styles.input} value={formVariant} onChange={(e) => setFormVariant(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.twoCols}>
                    <div>
                      <label className={styles.label}>Type</label>
                      <div className={styles.selectWrap}>
                        <i className="bi bi-lightning" />
                        <select className={styles.select} value={formType} onChange={(e) => setFormType(e.target.value as MovementType)}>
                          <option value="RECEIVE">Receive</option>
                          <option value="SHIP">Ship</option>
                          <option value="RESERVE">Reserve</option>
                          <option value="RELEASE">Release</option>
                          <option value="ADJUST">Adjust</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={styles.label}>Qty</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-123" />
                        <input
                          className={styles.input}
                          type="number"
                          value={formQty}
                          onChange={(e) => setFormQty(Number(e.target.value))}
                          placeholder={formType === "ADJUST" ? "e.g. -2 or 5" : "e.g. 2"}
                        />
                      </div>
                    </div>
                  </div>

                  <label className={styles.label}>Reference</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-link-45deg" />
                    <input className={styles.input} value={formRef} onChange={(e) => setFormRef(e.target.value)} placeholder="ORDER-123 / PO-9 / note" />
                  </div>

                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} type="button" onClick={appendMovement}>
                      <i className="bi bi-check2" /> Add movement
                    </button>
                    <button className={styles.ghostBtn} type="button" onClick={() => setFormRef("")}>
                      <i className="bi bi-arrow-counterclockwise" /> Clear ref
                    </button>
                  </div>

                  <div className={styles.hr} />

                  <div className={styles.sectionTitle}>
                    <i className="bi bi-eye" /> Selected movement
                  </div>

                  {!active ? (
                    <div className={styles.emptySmall}>Select a row to see details.</div>
                  ) : (
                    <div className={styles.detailCard}>
                      <div className={styles.detailTop}>
                        <div>
                          <div className={styles.detailSku}>{active.sku}</div>
                          <div className={styles.detailSub}>
                            {active.productName} · {active.variantName}
                          </div>
                        </div>
                        <span className={`${styles.badge} ${styles[badgeClass(active.type)]}`}>
                          <i className="bi bi-lightning-charge" /> {fmtType(active.type)}
                        </span>
                      </div>

                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Time</div>
                          <div className={styles.mono}>{new Date(active.createdAt).toLocaleString()}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Location</div>
                          <div className={styles.mono}>{locations.find((x) => x.id === active.locationId)?.code || active.locationId}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Qty</div>
                          <div className={styles.mono}>{fmtQty(active.type, active.qty)}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Reference</div>
                          <div className={styles.mono}>{active.reference || "—"}</div>
                        </div>
                      </div>

                      <div className={styles.detailLine}>
                        <div className={styles.detailLabel}>On hand</div>
                        <div className={styles.mono}>
                          {active.beforeOnHand} → {active.afterOnHand}
                        </div>
                      </div>

                      <div className={styles.detailLine}>
                        <div className={styles.detailLabel}>Reserved</div>
                        <div className={styles.mono}>
                          {active.beforeReserved} → {active.afterReserved}
                        </div>
                      </div>

                      <div className={styles.detailFooter}>
                        <span className={styles.chip}>
                          <i className="bi bi-person" /> {active.createdBy}
                        </span>
                        <span className={styles.chip}>
                          <i className="bi bi-shield-lock" /> audit
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={styles.tipInline}>
                    <i className="bi bi-shield-check" />
                    <span>Production: tạo movement phải chạy transaction (ledger append + update balance) để tránh race condition.</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

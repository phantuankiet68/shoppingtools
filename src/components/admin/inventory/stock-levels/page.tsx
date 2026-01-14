"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/stock-levels/stock-levels.module.css";

type LocationRow = {
  id: string;
  name: string;
  code: string;
};

type StockRow = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;

  locationId: string;

  onHand: number; // tổng tồn
  reserved: number; // đã giữ cho đơn
  incoming: number; // đang về (PO)
  reorderPoint: number;

  track: boolean; // track inventory
  updatedAt: string;
};

type StockAction =
  | { kind: "RECEIVE"; qty: number; note?: string }
  | { kind: "SHIP"; qty: number; note?: string }
  | { kind: "RESERVE"; qty: number; note?: string }
  | { kind: "RELEASE"; qty: number; note?: string }
  | { kind: "ADJUST"; qty: number; note?: string }; // can be +/- (inventory correction)

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function nowIso() {
  return new Date().toISOString();
}

function clampInt(v: number, min = 0, max = 1_000_000) {
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

function available(row: StockRow) {
  return Math.max(0, row.onHand - row.reserved);
}

function isLow(row: StockRow) {
  return row.track && available(row) <= row.reorderPoint;
}

export default function StockLevelsPage() {
  const [locations] = useState<LocationRow[]>(() => [
    { id: "all", name: "All locations", code: "ALL" },
    { id: "hcm", name: "HCM Warehouse", code: "HCM" },
    { id: "hn", name: "Hanoi Warehouse", code: "HN" },
    { id: "dn", name: "Da Nang Hub", code: "DN" },
  ]);

  const [activeLocationId, setActiveLocationId] = useState("all");
  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);

  const [rows, setRows] = useState<StockRow[]>(() => [
    {
      id: uid(),
      productName: "T-Shirt Classic",
      variantName: "Red / M",
      sku: "TSHIRT-RED-M",
      locationId: "hcm",
      onHand: 12,
      reserved: 4,
      incoming: 10,
      reorderPoint: 5,
      track: true,
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      productName: "T-Shirt Classic",
      variantName: "Black / L",
      sku: "TSHIRT-BLACK-L",
      locationId: "hcm",
      onHand: 6,
      reserved: 1,
      incoming: 0,
      reorderPoint: 5,
      track: true,
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      productName: "T-Shirt Classic",
      variantName: "White / S",
      sku: "TSHIRT-WHITE-S",
      locationId: "hn",
      onHand: 2,
      reserved: 0,
      incoming: 20,
      reorderPoint: 6,
      track: true,
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      productName: "Sneakers Runner",
      variantName: "41",
      sku: "SNEAK-41",
      locationId: "hn",
      onHand: 3,
      reserved: 3,
      incoming: 5,
      reorderPoint: 2,
      track: true,
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      productName: "Backpack Urban",
      variantName: "Default",
      sku: "BAG-DEFAULT",
      locationId: "dn",
      onHand: 20,
      reserved: 2,
      incoming: 0,
      reorderPoint: 8,
      track: true,
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      productName: "Gift Card",
      variantName: "Default",
      sku: "GIFT-DEFAULT",
      locationId: "all",
      onHand: 999999,
      reserved: 0,
      incoming: 0,
      reorderPoint: 0,
      track: false,
      updatedAt: nowIso(),
    },
  ]);

  const [activeId, setActiveId] = useState<string>(() => rows[0]?.id || "");
  const active = useMemo(() => rows.find((x) => x.id === activeId) || null, [rows, activeId]);

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => (activeLocationId === "all" ? true : r.locationId === activeLocationId))
      .filter((r) => (qq ? (r.productName + " " + r.variantName + " " + r.sku).toLowerCase().includes(qq) : true))
      .filter((r) => (onlyLow ? isLow(r) : true))
      .slice()
      .sort((a, b) => {
        const al = isLow(a);
        const bl = isLow(b);
        if (al !== bl) return al ? -1 : 1;
        return (a.productName + a.sku).localeCompare(b.productName + b.sku);
      });
  }, [rows, q, activeLocationId, onlyLow]);

  // keep selection in view list
  function selectRow(id: string) {
    setActiveId(id);
  }

  function patchRow(id: string, patch: Partial<StockRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r)));
  }

  function applyAction(id: string, action: StockAction) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    let onHand = row.onHand;
    let reserved = row.reserved;

    const qty = clampInt(action.qty, 0, 1_000_000);

    if (!row.track) {
      alert("This item is not tracking inventory.");
      return;
    }

    switch (action.kind) {
      case "RECEIVE":
        onHand = clampInt(onHand + qty);
        break;
      case "SHIP":
        // ship reduces onHand; reserved should not exceed onHand
        onHand = clampInt(onHand - qty, 0);
        reserved = clampInt(Math.min(reserved, onHand), 0);
        break;
      case "RESERVE":
        // reserve cannot exceed onHand
        reserved = clampInt(Math.min(onHand, reserved + qty), 0);
        break;
      case "RELEASE":
        reserved = clampInt(reserved - qty, 0);
        break;
      case "ADJUST":
        // qty can be negative via note input UI; here we treat qty as signed from UI
        // handled by passing negative in qty when needed (see inspector)
        break;
    }

    patchRow(id, { onHand, reserved });
  }

  // Inspector controls
  const [adjMode, setAdjMode] = useState<"RECEIVE" | "SHIP" | "RESERVE" | "RELEASE" | "ADJUST">("ADJUST");
  const [adjQty, setAdjQty] = useState<number>(0);
  const [adjNote, setAdjNote] = useState<string>("");

  function runAdjust() {
    if (!active) return;
    if (!active.track) return alert("This item is not tracking inventory.");

    const qty = Math.trunc(Number(adjQty || 0));
    if (!qty) return alert("Quantity must be non-zero.");

    if (adjMode === "ADJUST") {
      // signed adjust onHand directly
      const nextOnHand = clampInt(active.onHand + qty, 0);
      const nextReserved = clampInt(Math.min(active.reserved, nextOnHand), 0);
      patchRow(active.id, { onHand: nextOnHand, reserved: nextReserved });
      setAdjQty(0);
      setAdjNote("");
      return;
    }

    // other actions use absolute qty
    const abs = Math.abs(qty);
    applyAction(active.id, { kind: adjMode, qty: abs, note: adjNote });
    setAdjQty(0);
    setAdjNote("");
  }

  const stats = useMemo(() => {
    const list = rows.filter((r) => (activeLocationId === "all" ? true : r.locationId === activeLocationId));
    const tracked = list.filter((r) => r.track);
    const low = tracked.filter((r) => isLow(r));
    const totalOnHand = tracked.reduce((s, r) => s + r.onHand, 0);
    const totalReserved = tracked.reduce((s, r) => s + r.reserved, 0);
    const totalAvail = tracked.reduce((s, r) => s + available(r), 0);
    return { tracked: tracked.length, low: low.length, totalOnHand, totalReserved, totalAvail };
  }, [rows, activeLocationId]);

  return (
    <div className={styles.shell}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Stock Levels</div>
            <div className={styles.brandSub}>Locations · Low stock · Adjustments · Reorder points</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={`${styles.pill} ${onlyLow ? styles.pillOn : ""}`} type="button" onClick={() => setOnlyLow(!onlyLow)}>
            <i className={`bi ${onlyLow ? "bi-exclamation-triangle-fill" : "bi-exclamation-triangle"}`} />
            Low stock only
          </button>

          <button className={styles.primaryBtn} type="button" onClick={() => alert("Demo only. Wire API to export/report.")}>
            <i className="bi bi-file-earmark-bar-graph" /> Report
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar locations */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Locations</div>
            <div className={styles.sidebarHint}>Filter stock by warehouse</div>
          </div>

          <div className={styles.locationList}>
            {locations.map((l) => {
              const active = l.id === activeLocationId;
              return (
                <button key={l.id} type="button" className={`${styles.locationBtn} ${active ? styles.locationActive : ""}`} onClick={() => setActiveLocationId(l.id)}>
                  <div className={styles.locationLeft}>
                    <span className={`${styles.locDot} ${active ? styles.locDotHot : ""}`} />
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

          <div className={styles.sidebarFooter}>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Tracked</div>
                <div className={styles.statValue}>{stats.tracked}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Low</div>
                <div className={styles.statValue}>{stats.low}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Avail</div>
                <div className={styles.statValue}>{stats.totalAvail}</div>
              </div>
            </div>

            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>
                Available = <span className={styles.mono}>onHand - reserved</span>. Low stock khi Available ≤ reorder point.
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.content}>
            {/* Table panel */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Stock table</div>
                  <div className={styles.panelSub}>Search by SKU/product/variant</div>
                </div>
              </div>

              <div className={styles.toolbar}>
                <div className={styles.searchWrapInline}>
                  <i className="bi bi-search" />
                  <input className={styles.searchInline} placeholder="Search stock..." value={q} onChange={(e) => setQ(e.target.value)} />
                </div>

                <div className={styles.quickActions}>
                  <button
                    className={styles.ghostBtn}
                    type="button"
                    onClick={() => active && patchRow(active.id, { reorderPoint: 0 })}
                    disabled={!active || !active.track}
                    title="Set reorder point to 0">
                    <i className="bi bi-arrow-counterclockwise" /> Reset reorder
                  </button>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>SKU</th>
                      <th className={styles.thNum}>On hand</th>
                      <th className={styles.thNum}>Reserved</th>
                      <th className={styles.thNum}>Available</th>
                      <th className={styles.thNum}>Incoming</th>
                      <th className={styles.thNum}>Reorder</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={8}>
                          <div className={styles.emptyRow}>
                            <i className="bi bi-inbox" />
                            <div>
                              <div className={styles.emptyTitle}>No results</div>
                              <div className={styles.emptyText}>Try another search or location.</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visible.map((r) => {
                        const a = available(r);
                        const low = isLow(r);
                        const active = r.id === activeId;

                        return (
                          <tr key={r.id} className={`${styles.tr} ${active ? styles.trActive : ""} ${low ? styles.trLow : ""}`} onClick={() => selectRow(r.id)} role="button">
                            <td>
                              <div className={styles.cellTitle}>
                                <span className={`${styles.dot} ${low ? styles.dotWarn : ""}`} />
                                <div>
                                  <div className={styles.nameRow}>
                                    <span className={styles.name}>{r.productName}</span>
                                    <span className={styles.variant}>{r.variantName}</span>
                                    {!r.track && <span className={styles.badgeOff}>No track</span>}
                                  </div>
                                  <div className={styles.sub}>
                                    Updated: <span className={styles.mono}>{new Date(r.updatedAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className={styles.mono}>{r.sku}</td>
                            <td className={`${styles.tdNum} ${styles.mono}`}>{r.track ? r.onHand : "—"}</td>
                            <td className={`${styles.tdNum} ${styles.mono}`}>{r.track ? r.reserved : "—"}</td>
                            <td className={`${styles.tdNum} ${styles.mono} ${low ? styles.warnText : ""}`}>{r.track ? a : "—"}</td>
                            <td className={`${styles.tdNum} ${styles.mono}`}>{r.track ? r.incoming : "—"}</td>
                            <td className={`${styles.tdNum} ${styles.mono}`}>{r.track ? r.reorderPoint : "—"}</td>

                            <td>
                              {r.track ? (
                                low ? (
                                  <span className={`${styles.status} ${styles.bad}`}>
                                    <i className="bi bi-exclamation-triangle-fill" /> LOW
                                  </span>
                                ) : (
                                  <span className={`${styles.status} ${styles.ok}`}>
                                    <i className="bi bi-check2-circle" /> OK
                                  </span>
                                )
                              ) : (
                                <span className={`${styles.status} ${styles.off}`}>
                                  <i className="bi bi-slash-circle" /> N/A
                                </span>
                              )}
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
                    <div className={styles.panelSub}>Adjust stock & reorder point</div>
                  </div>
                </div>

                {!active ? (
                  <div className={styles.panelBody}>
                    <div className={styles.emptyInspector}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.emptyTitle}>Select an item</div>
                        <div className={styles.emptyText}>Click a row to manage stock.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    <div className={styles.headerRow}>
                      <div>
                        <div className={styles.headTitle}>{active.productName}</div>
                        <div className={styles.headMeta}>
                          <span className={styles.badgeMini}>
                            <i className="bi bi-upc-scan" /> {active.sku}
                          </span>
                          <span className={styles.badgeMini}>
                            <i className="bi bi-geo-alt" /> {locations.find((x) => x.id === active.locationId)?.name || active.locationId}
                          </span>
                        </div>
                      </div>

                      <span className={`${styles.chip} ${isLow(active) ? styles.chipBad : styles.chipOk}`}>
                        <i className={`bi ${isLow(active) ? "bi-exclamation-triangle-fill" : "bi-check2-circle"}`} />
                        {active.track ? (isLow(active) ? "LOW" : "OK") : "N/A"}
                      </span>
                    </div>

                    <div className={styles.kpis}>
                      <div className={styles.kpi}>
                        <div className={styles.kpiLabel}>On hand</div>
                        <div className={styles.kpiValue}>{active.track ? active.onHand : "—"}</div>
                      </div>
                      <div className={styles.kpi}>
                        <div className={styles.kpiLabel}>Reserved</div>
                        <div className={styles.kpiValue}>{active.track ? active.reserved : "—"}</div>
                      </div>
                      <div className={styles.kpi}>
                        <div className={styles.kpiLabel}>Available</div>
                        <div className={styles.kpiValue}>{active.track ? available(active) : "—"}</div>
                      </div>
                      <div className={styles.kpi}>
                        <div className={styles.kpiLabel}>Incoming</div>
                        <div className={styles.kpiValue}>{active.track ? active.incoming : "—"}</div>
                      </div>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-pencil-square" /> Adjustments
                    </div>

                    <label className={styles.label}>Action</label>
                    <div className={styles.selectWrap}>
                      <i className="bi bi-lightning" />
                      <select className={styles.select} value={adjMode} onChange={(e) => setAdjMode(e.target.value as any)}>
                        <option value="ADJUST">Adjust (+/-)</option>
                        <option value="RECEIVE">Receive</option>
                        <option value="SHIP">Ship</option>
                        <option value="RESERVE">Reserve</option>
                        <option value="RELEASE">Release</option>
                      </select>
                    </div>

                    <label className={styles.label}>Quantity</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-123" />
                      <input
                        className={styles.input}
                        type="number"
                        value={adjQty}
                        onChange={(e) => setAdjQty(Number(e.target.value))}
                        placeholder={adjMode === "ADJUST" ? "e.g. -5 or 10" : "e.g. 5"}
                        disabled={!active.track}
                      />
                    </div>

                    <label className={styles.label}>Note (optional)</label>
                    <textarea className={styles.textarea} value={adjNote} onChange={(e) => setAdjNote(e.target.value)} placeholder="Reason / reference..." disabled={!active.track} />

                    <div className={styles.actions}>
                      <button className={styles.primaryBtn} type="button" onClick={runAdjust} disabled={!active.track}>
                        <i className="bi bi-check2" /> Apply
                      </button>
                      <button
                        className={styles.ghostBtn}
                        type="button"
                        onClick={() => {
                          setAdjMode("ADJUST");
                          setAdjQty(0);
                          setAdjNote("");
                        }}>
                        <i className="bi bi-arrow-counterclockwise" /> Clear
                      </button>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-bell" /> Reorder point
                    </div>

                    <label className={styles.label}>Reorder point</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-flag" />
                      <input
                        className={styles.input}
                        type="number"
                        value={active.reorderPoint}
                        onChange={(e) => patchRow(active.id, { reorderPoint: clampInt(Number(e.target.value || 0), 0, 1_000_000) })}
                        disabled={!active.track}
                      />
                    </div>

                    <div className={styles.tipInline}>
                      <i className="bi bi-shield-check" />
                      <span>
                        Khi nối DB: log mọi thay đổi vào <span className={styles.mono}>StockLedger</span> (audit) để tránh lệch tồn.
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

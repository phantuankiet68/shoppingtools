"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/inventory/stock-movements/stock-movements.module.css";

// Backend enums (theo ledger chuẩn bạn đang làm)
type StockMovementType = "IN" | "OUT" | "ADJUST" | "VOID" | "RETURN_IN";
type StockMovementSource = "RECEIPT" | "ORDER" | "MANUAL";

type MovementRow = {
  id: string;
  occurredAt: string;
  createdAt: string;

  type: StockMovementType;
  source: StockMovementSource;

  qtyDelta: number; // signed: IN +, OUT -, ADJUST signed, VOID signed (thường là đảo)

  reference?: string | null;
  note?: string | null;

  product?: { id: string; name: string; sku: string };
  variant?: { id: string; sku: string; name: string | null };

  // Nếu bạn thêm before/after vào schema thì bật 2 field này:
  beforeStock?: number | null;
  afterStock?: number | null;
};

type ListResponse = {
  data: MovementRow[];
  nextCursor: string | null;
};

type DetailResponse = {
  data: MovementRow;
};

function fmtType(t: StockMovementType) {
  if (t === "IN") return "Receive (IN)";
  if (t === "OUT") return "Ship (OUT)";
  if (t === "RETURN_IN") return "Return (IN)";
  if (t === "VOID") return "Void";
  return "Adjust";
}

function badgeClass(t: StockMovementType) {
  if (t === "IN" || t === "RETURN_IN") return "ok";
  if (t === "OUT") return "bad";
  if (t === "VOID") return "off";
  return "warn";
}

function fmtSignedQty(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n)}`;
}

function toISODateRange(preset: "today" | "7d" | "30d" | "all") {
  if (preset === "all") return { from: "", to: "" };

  const now = new Date();
  if (preset === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from: start.toISOString(), to: "" };
  }

  const days = preset === "7d" ? 7 : 30;
  const start = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);
  return { from: start.toISOString(), to: "" };
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

async function apiGetJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "GET" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json as T;
}

async function apiPostJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json as T;
}

export default function StockMovementsPage() {
  // Filters
  const [typeFilter, setTypeFilter] = useState<StockMovementType | "ALL">("ALL");
  const [rangePreset, setRangePreset] = useState<"today" | "7d" | "30d" | "all">("7d");
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 250);

  // Data
  const [rows, setRows] = useState<MovementRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  // Selection + detail
  const [activeId, setActiveId] = useState<string>("");
  const [active, setActive] = useState<MovementRow | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Create ADJUST form
  const [formProductId, setFormProductId] = useState("");
  const [formVariantId, setFormVariantId] = useState("");
  const [formQty, setFormQty] = useState<number>(1);
  const [formRef, setFormRef] = useState("");
  const [formNote, setFormNote] = useState("");
  const [creating, setCreating] = useState(false);

  // Prevent race reload
  const lastListQueryKeyRef = useRef<string>("");

  const { from, to } = useMemo(() => toISODateRange(rangePreset), [rangePreset]);

  // Build list URL
  const listUrl = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("take", "30");
    if (typeFilter !== "ALL") sp.set("type", typeFilter);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);

    // NOTE: API hiện tại chưa hỗ trợ search free-text.
    // Bạn có thể:
    // - implement search ở backend (contains reference/note/sku/name)
    // - hoặc filter client-side tạm thời như dưới (mình đang làm client-side)
    // Ở đây mình KHÔNG gửi q lên server.
    return `/api/admin/stock-movement?${sp.toString()}`;
  }, [typeFilter, from, to]);

  async function loadFirstPage() {
    const queryKey = listUrl; // đủ đại diện filter hiện tại
    lastListQueryKeyRef.current = queryKey;

    setLoadingList(true);
    setErrorList(null);
    try {
      const json = await apiGetJSON<ListResponse>(listUrl);
      // nếu filter đổi trong lúc request chạy, bỏ kết quả cũ
      if (lastListQueryKeyRef.current !== queryKey) return;

      setRows(json.data);
      setNextCursor(json.nextCursor);
      setActiveId(json.data[0]?.id || "");
    } catch (e: any) {
      setErrorList(e?.message || "Failed to load movements");
      setRows([]);
      setNextCursor(null);
      setActiveId("");
    } finally {
      setLoadingList(false);
    }
  }

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingList(true);
    setErrorList(null);
    try {
      const url = `${listUrl}&cursor=${encodeURIComponent(nextCursor)}`;
      const json = await apiGetJSON<ListResponse>(url);
      setRows((prev) => [...prev, ...json.data]);
      setNextCursor(json.nextCursor);
    } catch (e: any) {
      setErrorList(e?.message || "Failed to load more");
    } finally {
      setLoadingList(false);
    }
  }

  // Fetch list when filters change
  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl]);

  // Client-side search filter (tạm thời)
  const filtered = useMemo(() => {
    const qq = qDebounced.trim().toLowerCase();
    if (!qq) return rows;

    return rows.filter((r) => {
      const sku = r.variant?.sku || r.product?.sku || "";
      const name = `${r.product?.name || ""} ${r.variant?.name || ""}`.trim();
      const ref = r.reference || "";
      const note = r.note || "";
      const hay = `${sku} ${name} ${ref} ${note} ${r.type} ${r.source}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [rows, qDebounced]);

  // Load detail when activeId changes
  useEffect(() => {
    if (!activeId) {
      setActive(null);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoadingDetail(true);
      setErrorDetail(null);
      try {
        const json = await apiGetJSON<DetailResponse>(`/api/admin/stock-movement/${activeId}`);
        if (cancelled) return;
        setActive(json.data);
      } catch (e: any) {
        if (cancelled) return;
        setErrorDetail(e?.message || "Failed to load detail");
        setActive(null);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const byType: Record<string, number> = {};
    for (const r of filtered) byType[r.type] = (byType[r.type] || 0) + 1;
    return { total, byType };
  }, [filtered]);

  async function createAdjust() {
    if (!formProductId.trim()) return alert("productId is required");
    const qty = Number(formQty);
    if (!Number.isInteger(qty) || qty === 0) return alert("qty must be a non-zero integer");

    setCreating(true);
    try {
      const payload = {
        productId: formProductId.trim(),
        variantId: formVariantId.trim() ? formVariantId.trim() : null,
        qtyDelta: qty,
        reference: formRef.trim() || undefined,
        note: formNote.trim() || undefined,
      };

      await apiPostJSON<{ data: MovementRow }>(`/api/admin/stock-movement`, payload);

      // Reload first page to reflect new movement on top
      setFormQty(1);
      setFormRef("");
      setFormNote("");
      await loadFirstPage();
    } catch (e: any) {
      alert(e?.message || "Create adjust failed");
    } finally {
      setCreating(false);
    }
  }

  async function voidMovement() {
    if (!activeId) return;
    if (!confirm("Void this movement? This will append a reverse movement.")) return;

    try {
      await apiPostJSON(`/api/admin/stock-movement/${activeId}`, { note: "Voided from UI" });
      await loadFirstPage();
    } catch (e: any) {
      alert(e?.message || "Void failed");
    }
  }

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
          <button className={styles.ghostBtn} type="button" onClick={() => alert("Export: wire to backend CSV later.")}>
            <i className="bi bi-download" /> Export
          </button>
          <button className={styles.primaryBtn} type="button" onClick={createAdjust} disabled={creating}>
            <i className="bi bi-plus-lg" /> {creating ? "Saving..." : "New ADJUST"}
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Filters</div>
            <div className={styles.sidebarHint}>Type, time range, search</div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-funnel" /> Type
            </div>

            <div className={styles.typeGrid}>
              {(["ALL", "IN", "OUT", "ADJUST", "VOID"] as const).map((t) => {
                const active = t === typeFilter;
                return (
                  <button key={t} type="button" className={`${styles.pill} ${active ? styles.pillOn : ""}`} onClick={() => setTypeFilter(t)}>
                    {t === "ALL" ? <i className="bi bi-layers" /> : <i className="bi bi-lightning" />}
                    {t === "ALL" ? "All" : fmtType(t as StockMovementType)}
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

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-search" /> Search
            </div>
            <div className={styles.searchWrapInline}>
              <i className="bi bi-search" />
              <input className={styles.searchInline} placeholder="Search SKU, reference, note..." value={q} onChange={(e) => setQ(e.target.value)} />
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
              <span>Ledger chuẩn: mọi thay đổi tồn kho đều append vào StockMovement.</span>
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
                  <div className={styles.panelSub}>{loadingList ? "Loading..." : errorList ? `Error: ${errorList}` : "Click a row to view details"}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className={styles.ghostBtn} type="button" onClick={loadFirstPage} disabled={loadingList}>
                    <i className="bi bi-arrow-repeat" /> Refresh
                  </button>
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
                      <th>Ref</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
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
                        const isActive = r.id === activeId;
                        const sku = r.variant?.sku || r.product?.sku || "—";
                        const title = `${r.product?.name || "Unknown"} · ${r.variant?.name || "Default"}`;
                        return (
                          <tr key={r.id} className={`${styles.tr} ${isActive ? styles.trActive : ""}`} onClick={() => setActiveId(r.id)} role="button">
                            <td className={styles.mono}>{new Date(r.occurredAt || r.createdAt).toLocaleString()}</td>
                            <td className={styles.mono}>
                              <div className={styles.skuCell}>
                                <span className={styles.sku}>{sku}</span>
                                <span className={styles.sub}>{title}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${styles[badgeClass(r.type)]}`}>
                                <i className="bi bi-lightning-charge" /> {fmtType(r.type)}
                              </span>
                            </td>
                            <td className={`${styles.tdNum} ${styles.mono}`}>{fmtSignedQty(r.qtyDelta)}</td>
                            <td className={styles.mono}>{r.reference || "—"}</td>
                            <td className={styles.mono}>{r.source}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
                <div className={styles.mono} style={{ opacity: 0.7 }}>
                  Showing {filtered.length} rows
                </div>
                <button className={styles.ghostBtn} type="button" onClick={loadMore} disabled={!nextCursor || loadingList} title={!nextCursor ? "No more" : "Load more"}>
                  <i className="bi bi-chevron-down" /> {loadingList ? "Loading..." : "Load more"}
                </button>
              </div>
            </section>

            {/* Inspector */}
            <aside className={styles.inspector}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Inspector</div>
                    <div className={styles.panelSub}>Create ADJUST & review movement</div>
                  </div>
                </div>

                <div className={styles.panelBody}>
                  <div className={styles.sectionTitle}>
                    <i className="bi bi-plus-circle" /> Create ADJUST
                  </div>

                  <label className={styles.label}>Product ID</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-box" />
                    <input className={styles.input} value={formProductId} onChange={(e) => setFormProductId(e.target.value)} placeholder="productId" />
                  </div>

                  <label className={styles.label}>Variant ID (optional)</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-tags" />
                    <input className={styles.input} value={formVariantId} onChange={(e) => setFormVariantId(e.target.value)} placeholder="variantId (optional)" />
                  </div>

                  <label className={styles.label}>Qty (signed)</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-123" />
                    <input className={styles.input} type="number" value={formQty} onChange={(e) => setFormQty(Number(e.target.value))} placeholder="e.g. -2 or 5" />
                  </div>

                  <label className={styles.label}>Reference</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-link-45deg" />
                    <input className={styles.input} value={formRef} onChange={(e) => setFormRef(e.target.value)} placeholder="PO / ORDER / note" />
                  </div>

                  <label className={styles.label}>Note</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-chat-left-text" />
                    <input className={styles.input} value={formNote} onChange={(e) => setFormNote(e.target.value)} placeholder="Why adjust?" />
                  </div>

                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} type="button" onClick={createAdjust} disabled={creating}>
                      <i className="bi bi-check2" /> {creating ? "Saving..." : "Add ADJUST"}
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => {
                        setFormQty(1);
                        setFormRef("");
                        setFormNote("");
                      }}
                      disabled={creating}>
                      <i className="bi bi-arrow-counterclockwise" /> Reset
                    </button>
                  </div>

                  <div className={styles.hr} />

                  <div className={styles.sectionTitle}>
                    <i className="bi bi-eye" /> Selected movement
                  </div>

                  {loadingDetail ? (
                    <div className={styles.emptySmall}>Loading detail...</div>
                  ) : errorDetail ? (
                    <div className={styles.emptySmall}>Error: {errorDetail}</div>
                  ) : !active ? (
                    <div className={styles.emptySmall}>Select a row to see details.</div>
                  ) : (
                    <div className={styles.detailCard}>
                      <div className={styles.detailTop}>
                        <div>
                          <div className={styles.detailSku}>{active.variant?.sku || active.product?.sku || active.id}</div>
                          <div className={styles.detailSub}>{(active.product?.name || "Unknown") + " · " + (active.variant?.name || "Default")}</div>
                        </div>
                        <span className={`${styles.badge} ${styles[badgeClass(active.type)]}`}>
                          <i className="bi bi-lightning-charge" /> {fmtType(active.type)}
                        </span>
                      </div>

                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Time</div>
                          <div className={styles.mono}>{new Date(active.occurredAt || active.createdAt).toLocaleString()}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Qty</div>
                          <div className={styles.mono}>{fmtSignedQty(active.qtyDelta)}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Source</div>
                          <div className={styles.mono}>{active.source}</div>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Reference</div>
                          <div className={styles.mono}>{active.reference || "—"}</div>
                        </div>
                      </div>

                      {/* Nếu bạn thêm before/after stock vào schema thì mở đoạn này */}
                      {"beforeStock" in active && (
                        <div className={styles.detailLine}>
                          <div className={styles.detailLabel}>Stock</div>
                          <div className={styles.mono}>
                            {(active.beforeStock ?? "—") as any} → {(active.afterStock ?? "—") as any}
                          </div>
                        </div>
                      )}

                      <div className={styles.detailLine}>
                        <div className={styles.detailLabel}>Note</div>
                        <div className={styles.mono}>{active.note || "—"}</div>
                      </div>

                      <div className={styles.actions}>
                        <button className={styles.ghostBtn} type="button" onClick={voidMovement}>
                          <i className="bi bi-slash-circle" /> Void
                        </button>
                      </div>

                      <div className={styles.detailFooter}>
                        <span className={styles.chip}>
                          <i className="bi bi-shield-lock" /> audit
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={styles.tipInline}>
                    <i className="bi bi-shield-check" />
                    <span>Production: tạo movement phải chạy transaction (append ledger + update stock snapshot) để tránh race.</span>
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

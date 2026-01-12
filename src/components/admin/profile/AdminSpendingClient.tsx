"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/profile/spending.module.css";

/** =========================
 * Types returned from APIs
 * ========================= */

type ApiSpendCategory = {
  id: string;
  name: string;
  type: string; // INVENTORY | SOFTWARE | ...
  icon?: string | null;
  color?: string | null;
};

type ApiSummary = {
  totals: {
    totalCents: number;
    paidCents: number;
    subsCents: number;
    avgPerDayCents: number;
    days: number;
  };
  spark: number[]; // cents, length <= 12
  byCategory: Array<{
    categoryId: string | null;
    name: string;
    type: string;
    icon: string | null;
    color: string | null;
    totalCents: number;
  }>;
  inventory: {
    receivedQty: number;
    soldQty: number;
    inStockQty: number;
    deliveringQty: number;
    returnedQty: number;
    inventorySpendPaidCents: number;
  };
  pnl: {
    revenueCents: number;
    cogsCents: number;
    refundsCents: number;
    grossProfitCents: number;
  };
  revenue12m: {
    months: Array<{ key: string; label: string; totalCents: number }>;
    totalCents: number;
    maxCents: number;
  };
};

type ApiTxListItem = {
  id: string;
  title: string;
  description: string | null;
  occurredAt: string | Date;
  status: string;
  method: string;
  currency: string;
  totalCents: number;
  merchant: { id: string; name: string } | null;
  category: { id: string; name: string; type: string; icon: string | null; color: string | null } | null;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function moneyUSD(n: number) {
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  return fmt.format(n);
}

function moneyCents(cents: number) {
  return moneyUSD((cents ?? 0) / 100);
}

function toSparkHeightsFromCents(sparkCents: number[]) {
  const last = (sparkCents ?? []).slice(-12);
  const max = Math.max(1, ...last.map((n) => Math.abs(n)));
  return last.map((n) => clamp(Math.round((Math.abs(n) / max) * 100), 8, 100));
}

function buildQuery(params: Record<string, string | number | boolean | null | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "boolean") sp.set(k, v ? "1" : "0");
    else sp.set(k, String(v));
  }
  return sp.toString();
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { method: "GET", signal, headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as any)?.error ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export default function AdminSpendingClient() {
  // UI state
  const [cat, setCat] = useState<"All" | string>("All"); // string can be category type (INVENTORY) or categoryId
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"date_desc" | "amount_desc" | "amount_asc">("date_desc");
  const [onlyPaid, setOnlyPaid] = useState(false);

  // Data state
  const [cats, setCats] = useState<ApiSpendCategory[]>([]);
  const [summary, setSummary] = useState<ApiSummary | null>(null);

  // optional: tx list (ready to use if you want to render table later)
  const [txItems, setTxItems] = useState<ApiTxListItem[]>([]);
  const [txTotal, setTxTotal] = useState(0);

  // UI meta
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // Fetch categories
  // =========================
  useEffect(() => {
    const ctrl = new AbortController();
    setLoadingCats(true);
    setError(null);

    fetchJson<{ items: ApiSpendCategory[] }>("/api/admin/spending/categories", ctrl.signal)
      .then((r) => setCats(r.items ?? []))
      .catch((e) => setError(e?.message ?? "Failed to load categories"))
      .finally(() => setLoadingCats(false));

    return () => ctrl.abort();
  }, []);

  // =========================
  // Fetch summary (depends on filters)
  // =========================
  const summaryUrl = useMemo(() => {
    const qs = buildQuery({
      cat,
      q: q.trim() || "",
      onlyPaid,
      sort,
    });
    return `/api/admin/spending/summary?${qs}`;
  }, [cat, q, onlyPaid, sort]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoadingSummary(true);
    setError(null);

    fetchJson<ApiSummary>(summaryUrl, ctrl.signal)
      .then((r) => setSummary(r))
      .catch((e) => setError(e?.message ?? "Failed to load summary"))
      .finally(() => setLoadingSummary(false));

    return () => ctrl.abort();
  }, [summaryUrl]);

  // =========================
  // Optional: fetch tx list (for future table)
  // =========================
  const txListUrl = useMemo(() => {
    const qs = buildQuery({
      cat,
      q: q.trim() || "",
      onlyPaid,
      sort,
      take: 50,
      skip: 0,
    });
    return `/api/admin/spending/transactions?${qs}`;
  }, [cat, q, onlyPaid, sort]);

  useEffect(() => {
    const ctrl = new AbortController();

    fetchJson<{ items: ApiTxListItem[]; total: number }>(txListUrl, ctrl.signal)
      .then((r) => {
        setTxItems(r.items ?? []);
        setTxTotal(r.total ?? 0);
      })
      .catch(() => {
        // tx list is optional, don't block UI if fails
        setTxItems([]);
        setTxTotal(0);
      });

    return () => ctrl.abort();
  }, [txListUrl]);

  // =========================
  // Derived UI data (from summary)
  // =========================
  const totals = useMemo(() => {
    const t = summary?.totals;
    return {
      total: t?.totalCents ?? 0,
      paid: t?.paidCents ?? 0,
      subs: t?.subsCents ?? 0,
      avg: t?.avgPerDayCents ?? 0,
    };
  }, [summary]);

  const sparkHeights = useMemo(() => {
    return toSparkHeightsFromCents(summary?.spark ?? []);
  }, [summary]);

  const inv = useMemo(() => {
    const i = summary?.inventory;
    const p = summary?.pnl;
    return {
      receivedQty: i?.receivedQty ?? 0,
      soldQty: i?.soldQty ?? 0,
      inStockQty: i?.inStockQty ?? 0,
      deliveringQty: i?.deliveringQty ?? 0,
      returnedQty: i?.returnedQty ?? 0,

      // keep your old fields for UI rendering
      inventorySpendPaid: i?.inventorySpendPaidCents ?? 0,
      revenue: p?.revenueCents ?? 0,
      cogs: p?.cogsCents ?? 0,
      refunds: p?.refundsCents ?? 0,
      grossProfit: p?.grossProfitCents ?? 0,
    };
  }, [summary]);

  const revenue12m = useMemo(() => {
    const r = summary?.revenue12m;
    return {
      months: (r?.months ?? []).map((m) => ({ key: m.key, label: m.label, valueCents: m.totalCents })),
      totalCents: r?.totalCents ?? 0,
      maxCents: r?.maxCents ?? 1,
    };
  }, [summary]);

  // dropdown options
  const categoryOptions = useMemo(() => {
    // show types like your old UI (Inventory/Software/...)
    // If your API supports cat type filter: pass "INVENTORY" etc.
    // Otherwise, you can pass categoryId.
    const typeOptions: Array<{ value: string; label: string }> = [
      { value: "INVENTORY", label: "Inventory" },
      { value: "SOFTWARE", label: "Software" },
      { value: "MARKETING", label: "Marketing" },
      { value: "OPS", label: "Ops" },
      { value: "TRAVEL", label: "Travel" },
      { value: "OFFICE", label: "Office" },
    ];

    // if you prefer DB-defined categories, uncomment this block to list by name:
    // const dbCats = cats.map((c) => ({ value: c.id, label: c.name }));

    return typeOptions;
  }, [cats]);

  const ready = !loadingSummary && !!summary;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.titleBlock}>
            <div className={styles.title}>Spending</div>
            <div className={styles.subtitle}>Track expenses, inventory flow, and profit at a glance.</div>
          </div>
        </div>

        <div className={styles.headRight}>
          <button className={styles.ghostBtn} type="button" onClick={() => window.open("/api/admin/spending/export", "_blank")}>
            <i className="bi bi-download" /> <span>Export</span>
          </button>
          <button className={styles.primaryBtn} type="button" onClick={() => alert("TODO: open create expense modal")}>
            <i className="bi bi-plus-lg" /> <span>Add expense</span>
          </button>
        </div>
      </div>

      {/* Inline status */}
      {(loadingCats || loadingSummary) && (
        <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13 }}>
          <i className="bi bi-arrow-repeat" /> Loading…
        </div>
      )}
      {error && (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)" }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Couldn’t load spending data</div>
          <div style={{ opacity: 0.85 }}>{error}</div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <button type="button" className={`${styles.toggleBtn} ${onlyPaid ? styles.toggleOn : ""}`} onClick={() => setOnlyPaid((v) => !v)} title="Only paid">
            <i className={`bi ${onlyPaid ? "bi-check2-circle" : "bi-circle"}`} />
            <span>Paid only</span>
          </button>

          <div className={styles.sortWrap}>
            <i className={`bi bi-arrow-down-up ${styles.sortIcon}`} />
            <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value as any)} aria-label="Sort">
              <option value="date_desc">Newest</option>
              <option value="amount_desc">Amount (high)</option>
              <option value="amount_asc">Amount (low)</option>
            </select>
            <i className={`bi bi-chevron-down ${styles.sortChev}`} />
          </div>
        </div>

        <div className={styles.selectWrap}>
          <i className={`bi bi-tags ${styles.selectIcon}`} />
          <select className={styles.select} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
            <option value="All">All categories</option>
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <i className={`bi bi-chevron-down ${styles.chev}`} />
        </div>

        <div className={styles.search}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input className={styles.searchInput} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions..." />
          {q && (
            <button className={styles.clearBtn} type="button" onClick={() => setQ("")} title="Clear">
              <i className="bi bi-x" />
            </button>
          )}
        </div>
      </div>

      {/* KPI: Spending */}
      <div className={styles.kpis} aria-busy={!ready}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Total</span>
            <span className={`${styles.kpiIcon} ${styles.c_blue}`}>
              <i className="bi bi-cash-stack" />
            </span>
          </div>
          <div className={styles.kpiValue}>{moneyCents(totals.total)}</div>
          <div className={styles.spark} aria-hidden="true">
            {sparkHeights.map((h, i) => (
              <span key={i} className={styles.sparkBar} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Paid</span>
            <span className={`${styles.kpiIcon} ${styles.c_green}`}>
              <i className="bi bi-check2-circle" />
            </span>
          </div>
          <div className={styles.kpiValue}>{moneyCents(totals.paid)}</div>
          <div className={styles.kpiHint}>
            <span className={styles.dot} /> Cleared payments
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Subscriptions</span>
            <span className={`${styles.kpiIcon} ${styles.c_purple}`}>
              <i className="bi bi-box-seam" />
            </span>
          </div>
          <div className={styles.kpiValue}>{moneyCents(totals.subs)}</div>
          <div className={styles.kpiHint}>
            <span className={styles.dot} /> Software & tools
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Avg / day</span>
            <span className={`${styles.kpiIcon} ${styles.c_amber}`}>
              <i className="bi bi-graph-up-arrow" />
            </span>
          </div>
          <div className={styles.kpiValue}>{moneyCents(totals.avg)}</div>
          <div className={styles.kpiHint}>
            <span className={styles.dot} /> Estimated
          </div>
        </div>
      </div>

      {/* KPI: Inventory */}
      <div className={styles.kpis} aria-busy={!ready}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Received</span>
            <span className={`${styles.kpiIcon} ${styles.c_blue}`}>
              <i className="bi bi-box-arrow-in-down" />
            </span>
          </div>
          <div className={styles.kpiValue}>{inv.receivedQty}</div>
          <div className={styles.kpiHint}>
            <span className={styles.dot} /> Stocked in
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Sold</span>
            <span className={`${styles.kpiIcon} ${styles.c_green}`}>
              <i className="bi bi-bag-check" />
            </span>
          </div>
          <div className={styles.kpiValue}>{inv.soldQty}</div>
          <div className={styles.kpiHint}>
            <span className={styles.dot} /> Delivered + delivering
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>In stock</span>
            <span className={`${styles.kpiIcon} ${styles.c_purple}`}>
              <i className="bi bi-inboxes" />
            </span>
          </div>
          <div className={styles.kpiValue}>{inv.inStockQty}</div>
          <div className={styles.kpiHint}>
            <span className={styles.dot} /> Available
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Delivering</span>
            <span className={`${styles.kpiIcon} ${styles.c_amber}`}>
              <i className="bi bi-truck" />
            </span>
          </div>
          <div className={styles.kpiValue}>{inv.deliveringQty}</div>
          <div className={styles.kpiHint}>
            <span className={styles.dot} /> In transit
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Profit & loss */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelTitle}>Profit & loss</div>
              <div className={styles.panelSub}>Revenue vs cost of goods (simple)</div>
            </div>
            <button className={styles.iconBtn} type="button" title="Details" onClick={() => alert("TODO: open report details")}>
              <i className="bi bi-info-circle" />
            </button>
          </div>

          <div className={styles.summaryList}>
            <div className={styles.summaryRow}>
              <div className={styles.summaryLeft}>
                <span className={`${styles.summaryIcon} ${styles.si_blue}`}>
                  <i className="bi bi-graph-up" />
                </span>
                <div className={styles.summaryMeta}>
                  <div className={styles.summaryTitle}>Revenue</div>
                  <div className={styles.summarySub}>Delivered + delivering</div>
                </div>
              </div>
              <div className={styles.summaryValue}>{moneyCents(inv.revenue)}</div>
            </div>

            <div className={styles.summaryRow}>
              <div className={styles.summaryLeft}>
                <span className={`${styles.summaryIcon} ${styles.si_purple}`}>
                  <i className="bi bi-boxes" />
                </span>
                <div className={styles.summaryMeta}>
                  <div className={styles.summaryTitle}>COGS</div>
                  <div className={styles.summarySub}>Cost of goods sold</div>
                </div>
              </div>
              <div className={styles.summaryValue}>{moneyCents(inv.cogs)}</div>
            </div>

            <div className={styles.summaryRow}>
              <div className={styles.summaryLeft}>
                <span className={`${styles.summaryIcon} ${styles.si_red}`}>
                  <i className="bi bi-arrow-counterclockwise" />
                </span>
                <div className={styles.summaryMeta}>
                  <div className={styles.summaryTitle}>Refunds</div>
                  <div className={styles.summarySub}>Returned orders</div>
                </div>
              </div>
              <div className={styles.summaryValue}>{moneyCents(inv.refunds)}</div>
            </div>

            <div className={`${styles.summaryRow} ${styles.summaryRowStrong}`}>
              <div className={styles.summaryLeft}>
                <span className={`${styles.summaryIcon} ${styles.si_green}`}>
                  <i className="bi bi-currency-dollar" />
                </span>
                <div className={styles.summaryMeta}>
                  <div className={styles.summaryTitle}>Gross profit</div>
                  <div className={styles.summarySub}>Revenue - COGS - refunds</div>
                </div>
              </div>
              <div className={`${styles.summaryValue} ${inv.grossProfit >= 0 ? styles.valPos : styles.valNeg}`}>{moneyCents(inv.grossProfit)}</div>
            </div>
          </div>

          <div className={styles.panelFoot}>
            <button className={styles.ghostBtn} type="button" onClick={() => alert("TODO: open report")}>
              <i className="bi bi-journal-text" /> <span>Open report</span>
            </button>
          </div>
        </div>

        {/* Revenue (last 12 months) */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelTitle}>Revenue (last 12 months)</div>
              <div className={styles.panelSub}>Delivered orders only</div>
            </div>
            <div className={styles.panelHeadRight}>
              <span className={styles.headMetric}>
                <i className="bi bi-graph-up" /> {moneyCents(revenue12m.totalCents)}
              </span>
            </div>
          </div>

          <div className={styles.catList}>
            {(revenue12m.months ?? []).map((m) => {
              const pct = Math.round((m.valueCents / Math.max(1, revenue12m.maxCents)) * 100);
              return (
                <div key={m.key} className={styles.catRow}>
                  <div className={styles.catLeft}>
                    <div className={styles.catName}>{m.label}</div>
                    <div className={styles.catAmt}>{moneyCents(m.valueCents)}</div>
                  </div>
                  <div className={styles.bar}>
                    <div className={styles.barFill} style={{ width: `${clamp(pct, 0, 100)}%` }} />
                  </div>
                  <div className={styles.catPct}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optional: quick debug footer (remove if you want) */}
      <div style={{ marginTop: 14, opacity: 0.7, fontSize: 12 }}>
        Loaded tx: {txItems.length} / {txTotal}
      </div>
    </div>
  );
}

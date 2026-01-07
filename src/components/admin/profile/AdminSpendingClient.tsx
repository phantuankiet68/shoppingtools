"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/profile/spending.module.css";

type Tx = {
  id: string;
  title: string;
  merchant: string;
  date: string;
  category: "Software" | "Marketing" | "Ops" | "Travel" | "Office";
  method: "Card" | "Bank" | "Cash";
  amount: number;
  status: "Paid" | "Pending" | "Refunded";
};

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  return `${sign}$${v.toFixed(2)}`;
}

export default function AdminSpendingClient() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "ytd">("30d");
  const [cat, setCat] = useState<"All" | Tx["category"]>("All");
  const [q, setQ] = useState("");

  const txs: Tx[] = useMemo(
    () => [
      { id: "t1", title: "Figma Team", merchant: "Figma", date: "Jan 7, 2026", category: "Software", method: "Card", amount: 24.0, status: "Paid" },
      { id: "t2", title: "Google Ads", merchant: "Google", date: "Jan 6, 2026", category: "Marketing", method: "Card", amount: 320.25, status: "Paid" },
      { id: "t3", title: "AWS Cloud", merchant: "Amazon Web Services", date: "Jan 5, 2026", category: "Ops", method: "Bank", amount: 512.88, status: "Pending" },
      { id: "t4", title: "Team Lunch", merchant: "Local Restaurant", date: "Jan 4, 2026", category: "Office", method: "Cash", amount: 78.4, status: "Paid" },
    ],
    []
  );

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return txs.filter((x) => (cat === "All" ? true : x.category === cat)).filter((x) => (t ? (x.title + " " + x.merchant).toLowerCase().includes(t) : true));
  }, [txs, cat, q]);

  const totals = useMemo(() => {
    const total = filtered.reduce((s, x) => s + x.amount, 0);
    const paid = filtered.filter((x) => x.status === "Paid").reduce((s, x) => s + x.amount, 0);
    const subs = filtered.filter((x) => x.category === "Software").reduce((s, x) => s + x.amount, 0);
    const avg = total / Math.max(1, 30);
    return { total, paid, subs, avg };
  }, [filtered]);

  const byCat = useMemo(() => {
    const cats: Tx["category"][] = ["Software", "Marketing", "Ops", "Travel", "Office"];
    const map = new Map<Tx["category"], number>();
    for (const c of cats) map.set(c, 0);
    for (const t of filtered) map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    const arr = cats.map((c) => ({ cat: c, value: map.get(c) ?? 0 }));
    const max = Math.max(1, ...arr.map((a) => Math.abs(a.value)));
    return { arr, max };
  }, [filtered]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.title}>Spending</div>
        </div>

        <div className={styles.headRight}>
          <button className={styles.ghostBtn} type="button">
            <i className="bi bi-download" /> <span>Export</span>
          </button>
          <button className={styles.primaryBtn} type="button">
            <i className="bi bi-plus-lg" /> <span>Add expense</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.rangeGroup}>
          {(["7d", "30d", "90d", "ytd"] as const).map((r) => (
            <button key={r} type="button" className={`${styles.pill} ${range === r ? styles.pillActive : ""}`} onClick={() => setRange(r)}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.selectWrap}>
          <i className={`bi bi-tags ${styles.selectIcon}`} />
          <select className={styles.select} value={cat} onChange={(e) => setCat(e.target.value as any)}>
            <option value="All">All categories</option>
            <option value="Software">Software</option>
            <option value="Marketing">Marketing</option>
            <option value="Ops">Ops</option>
            <option value="Travel">Travel</option>
            <option value="Office">Office</option>
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

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Total</span>
            <span className={`${styles.kpiIcon} ${styles.c_blue}`}>
              <i className="bi bi-cash-stack" />
            </span>
          </div>
          <div className={styles.kpiValue}>{money(totals.total)}</div>
          <div className={styles.kpiHint}>
            <span className={styles.dot} /> {range.toUpperCase()} range
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Paid</span>
            <span className={`${styles.kpiIcon} ${styles.c_green}`}>
              <i className="bi bi-check2-circle" />
            </span>
          </div>
          <div className={styles.kpiValue}>{money(totals.paid)}</div>
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
          <div className={styles.kpiValue}>{money(totals.subs)}</div>
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
          <div className={styles.kpiValue}>{money(totals.avg)}</div>
          <div className={styles.kpiHint}>
            <span className={styles.dot} /> Approx estimate
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className={styles.mainGrid}>
        {/* Category breakdown */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelTitle}>Spending by category</div>
              <div className={styles.panelSub}>Quick breakdown of where money goes</div>
            </div>
            <button className={styles.iconBtn} type="button" title="Insights">
              <i className="bi bi-lightbulb" />
            </button>
          </div>

          <div className={styles.catList}>
            {byCat.arr.map((x) => {
              const pct = Math.min(100, Math.round((Math.abs(x.value) / byCat.max) * 100));
              return (
                <div key={x.cat} className={styles.catRow}>
                  <div className={styles.catLeft}>
                    <div className={styles.catName}>{x.cat}</div>
                    <div className={styles.catAmt}>{money(x.value)}</div>
                  </div>
                  <div className={styles.bar}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  </div>
                  <div className={styles.catPct}>{pct}%</div>
                </div>
              );
            })}
          </div>

          <div className={styles.panelFoot}>
            <button className={styles.ghostBtn} type="button">
              <i className="bi bi-sliders" /> <span>Budget settings</span>
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className={styles.panelWide}>
          <div className={styles.panelHead}>
            <div>
              <div className={styles.panelTitle}>Recent transactions</div>
              <div className={styles.panelSub}>Latest activity in the selected range</div>
            </div>

            <div className={styles.tableActions}>
              <button className={styles.iconBtn} type="button" title="Filter">
                <i className="bi bi-funnel" />
              </button>
              <button className={styles.iconBtn} type="button" title="Sort">
                <i className="bi bi-arrow-down-up" />
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th className={styles.right}>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className={styles.tr}>
                    <td>
                      <div className={styles.txTitle}>{t.title}</div>
                      <div className={styles.txSub}>{t.merchant}</div>
                    </td>
                    <td>
                      <span className={styles.badge}>{t.category}</span>
                    </td>
                    <td>
                      <span className={styles.mono}>
                        <i className="bi bi-credit-card" /> {t.method}
                      </span>
                    </td>
                    <td className={styles.muted}>{t.date}</td>
                    <td className={`${styles.right} ${t.amount < 0 ? styles.amtPos : styles.amtNeg}`}>{money(t.amount)}</td>
                    <td>
                      <span className={`${styles.status} ${t.status === "Paid" ? styles.s_paid : t.status === "Pending" ? styles.s_pending : styles.s_refunded}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.panelFoot}>
            <button className={styles.ghostBtn} type="button">
              <i className="bi bi-receipt" /> <span>View all</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

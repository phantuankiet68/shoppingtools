"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/orders/payments/payments.module.css";

type Status = "PAID" | "PENDING" | "FAILED" | "REFUNDED";
type Method = "CARD" | "BANK_TRANSFER" | "MOMO" | "ZALOPAY" | "CASH";

type PaymentRow = {
  id: string;
  createdAt: string; // ISO
  orderCode: string;
  customer: { name: string; email: string };
  method: Method;
  amount: number; // VND
  status: Status;
  fee: number; // VND
  net: number; // VND
  reference?: string;
};

const seed: PaymentRow[] = [
  {
    id: "pay_10001",
    createdAt: "2026-01-15T08:21:00+07:00",
    orderCode: "ORD-24018",
    customer: { name: "Nguyễn Minh", email: "minh.nguyen@example.com" },
    method: "CARD",
    amount: 1250000,
    status: "PAID",
    fee: 31250,
    net: 1218750,
    reference: "VNPAY-8S2K1A",
  },
  {
    id: "pay_10002",
    createdAt: "2026-01-15T10:02:00+07:00",
    orderCode: "ORD-24021",
    customer: { name: "Trần Huy", email: "huy.tran@example.com" },
    method: "MOMO",
    amount: 349000,
    status: "PENDING",
    fee: 8725,
    net: 340275,
    reference: "MOMO-2K9Q0D",
  },
  {
    id: "pay_10003",
    createdAt: "2026-01-14T16:40:00+07:00",
    orderCode: "ORD-24002",
    customer: { name: "Lê Anh", email: "anh.le@example.com" },
    method: "BANK_TRANSFER",
    amount: 799000,
    status: "FAILED",
    fee: 0,
    net: 0,
    reference: "BANK-FT-8841",
  },
  {
    id: "pay_10004",
    createdAt: "2026-01-13T12:12:00+07:00",
    orderCode: "ORD-23981",
    customer: { name: "Phạm Mai", email: "mai.pham@example.com" },
    method: "ZALOPAY",
    amount: 1599000,
    status: "REFUNDED",
    fee: 39975,
    net: 0,
    reference: "ZLP-7W1H9K",
  },
];

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}
function formatDT(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function badgeClass(status: Status) {
  switch (status) {
    case "PAID":
      return styles.badgePaid;
    case "PENDING":
      return styles.badgePending;
    case "FAILED":
      return styles.badgeFailed;
    case "REFUNDED":
      return styles.badgeRefunded;
  }
}

function methodLabel(m: Method) {
  switch (m) {
    case "CARD":
      return "Card";
    case "BANK_TRANSFER":
      return "Bank transfer";
    case "MOMO":
      return "MoMo";
    case "ZALOPAY":
      return "ZaloPay";
    case "CASH":
      return "Cash";
  }
}

export default function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>(seed);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [method, setMethod] = useState<Method | "ALL">("ALL");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [selected, setSelected] = useState<PaymentRow | null>(null);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();

    return rows.filter((r) => {
      const hitKw =
        !kw ||
        r.id.toLowerCase().includes(kw) ||
        r.orderCode.toLowerCase().includes(kw) ||
        r.customer.name.toLowerCase().includes(kw) ||
        r.customer.email.toLowerCase().includes(kw) ||
        (r.reference || "").toLowerCase().includes(kw);

      const hitStatus = status === "ALL" ? true : r.status === status;
      const hitMethod = method === "ALL" ? true : r.method === method;

      const t = new Date(r.createdAt).getTime();
      const hitFrom = from ? t >= new Date(from + "T00:00:00+07:00").getTime() : true;
      const hitTo = to ? t <= new Date(to + "T23:59:59+07:00").getTime() : true;

      return hitKw && hitStatus && hitMethod && hitFrom && hitTo;
    });
  }, [rows, q, status, method, from, to]);

  const stats = useMemo(() => {
    const paid = filtered.filter((r) => r.status === "PAID");
    const pending = filtered.filter((r) => r.status === "PENDING");
    const failed = filtered.filter((r) => r.status === "FAILED");
    const refunded = filtered.filter((r) => r.status === "REFUNDED");

    const gross = paid.reduce((s, r) => s + r.amount, 0);
    const fees = paid.reduce((s, r) => s + r.fee, 0);
    const net = paid.reduce((s, r) => s + r.net, 0);

    return {
      count: filtered.length,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      gross,
      fees,
      net,
    };
  }, [filtered]);

  function clearFilters() {
    setQ("");
    setStatus("ALL");
    setMethod("ALL");
    setFrom("");
    setTo("");
  }

  function exportCSV() {
    const header = ["id", "createdAt", "orderCode", "customerName", "customerEmail", "method", "amount", "status", "fee", "net", "reference"];
    const data = filtered.map((r) => [r.id, r.createdAt, r.orderCode, r.customer.name, r.customer.email, r.method, r.amount, r.status, r.fee, r.net, r.reference || ""]);

    const csv = [header, ...data].map((line) => line.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function markAsPaid(id: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.status === "PAID") return r;

        const fee = Math.round(r.amount * 0.025);
        return { ...r, status: "PAID", fee, net: r.amount - fee };
      })
    );
  }

  function refund(id: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.status !== "PAID") return r;
        return { ...r, status: "REFUNDED", net: 0 };
      })
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <i className={`bi bi-credit-card-2-front ${styles.titleIcon}`} />
            <h1 className={styles.title}>Payments</h1>
          </div>
          <p className={styles.subtitle}>Manage transactions, fees, payouts and payment methods.</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnGhost} onClick={clearFilters} type="button">
            <i className="bi bi-arrow-counterclockwise" />
            Reset
          </button>
          <button className={styles.btnGhost} onClick={exportCSV} type="button">
            <i className="bi bi-download" />
            Export CSV
          </button>
          <button className={styles.btnPrimary} type="button" onClick={() => alert("Hook this to your real 'Create manual payment' flow")}>
            <i className="bi bi-plus-lg" />
            New payment
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Gross (Paid)</span>
            <i className="bi bi-cash-stack" />
          </div>
          <div className={styles.statValue}>{formatVND(stats.gross)}</div>
          <div className={styles.statHint}>
            {stats.paid} paid / {stats.count} shown
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Fees</span>
            <i className="bi bi-receipt" />
          </div>
          <div className={styles.statValue}>{formatVND(stats.fees)}</div>
          <div className={styles.statHint}>Processor fees on paid transactions</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Net</span>
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div className={styles.statValue}>{formatVND(stats.net)}</div>
          <div className={styles.statHint}>Gross - fees (paid only)</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Statuses</span>
            <i className="bi bi-bar-chart-line" />
          </div>
          <div className={styles.statPills}>
            <span className={`${styles.pill} ${styles.pillPaid}`}>
              <i className="bi bi-check2-circle" /> {stats.paid}
            </span>
            <span className={`${styles.pill} ${styles.pillPending}`}>
              <i className="bi bi-hourglass-split" /> {stats.pending}
            </span>
            <span className={`${styles.pill} ${styles.pillFailed}`}>
              <i className="bi bi-x-circle" /> {stats.failed}
            </span>
            <span className={`${styles.pill} ${styles.pillRefunded}`}>
              <i className="bi bi-arrow-return-left" /> {stats.refunded}
            </span>
          </div>
          <div className={styles.statHint}>Counts in current view</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <i className="bi bi-funnel" />
              <h2>Filters</h2>
            </div>
            <span className={styles.panelHint}>Refine the payments list</span>
          </div>

          <div className={styles.filters}>
            <label className={styles.field}>
              <span className={styles.label}>Search</span>
              <div className={styles.inputWrap}>
                <i className={`bi bi-search ${styles.inputIcon}`} />
                <input className={styles.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order, customer, email, payment id, reference..." />
              </div>
            </label>

            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.label}>Status</span>
                <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="ALL">All</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Method</span>
                <select className={styles.select} value={method} onChange={(e) => setMethod(e.target.value as any)}>
                  <option value="ALL">All</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="MOMO">MoMo</option>
                  <option value="ZALOPAY">ZaloPay</option>
                  <option value="CASH">Cash</option>
                </select>
              </label>
            </div>

            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.label}>From</span>
                <input className={styles.input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>To</span>
                <input className={styles.input} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </div>

            <div className={styles.filterActions}>
              <button className={styles.btnSoft} type="button" onClick={clearFilters}>
                <i className="bi bi-eraser" />
                Clear
              </button>
              <div className={styles.miniTip}>
                <i className="bi bi-info-circle" />
                Tip: click a row to view details.
              </div>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <i className="bi bi-list-check" />
              <h2>Transactions</h2>
            </div>
            <span className={styles.panelHint}>{filtered.length} results</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Payment</th>
                  <th>Customer</th>
                  <th>Method</th>
                  <th className={styles.thRight}>Amount</th>
                  <th>Status</th>
                  <th className={styles.thRight}>Net</th>
                  <th className={styles.thActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.empty}>
                      <div className={styles.emptyBox}>
                        <i className="bi bi-inboxes" />
                        <div>
                          <div className={styles.emptyTitle}>No payments found</div>
                          <div className={styles.emptySub}>Try adjusting filters or search keyword.</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className={styles.tr} onClick={() => setSelected(r)} role="button" tabIndex={0}>
                      <td className={styles.muted}>{formatDT(r.createdAt)}</td>
                      <td>
                        <div className={styles.paymentCell}>
                          <div className={styles.payId}>{r.id}</div>
                          <div className={styles.paySub}>
                            <i className="bi bi-bag" /> {r.orderCode}
                            {r.reference ? (
                              <>
                                <span className={styles.dot} />
                                <i className="bi bi-hash" /> {r.reference}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.customer}>
                          <div className={styles.customerName}>{r.customer.name}</div>
                          <div className={styles.customerEmail}>{r.customer.email}</div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.methodPill}>
                          <i className="bi bi-credit-card" />
                          {methodLabel(r.method)}
                        </span>
                      </td>
                      <td className={styles.tdRight}>{formatVND(r.amount)}</td>
                      <td>
                        <span className={`${styles.badge} ${badgeClass(r.status)}`}>
                          {r.status === "PAID" && <i className="bi bi-check2-circle" />}
                          {r.status === "PENDING" && <i className="bi bi-hourglass-split" />}
                          {r.status === "FAILED" && <i className="bi bi-x-circle" />}
                          {r.status === "REFUNDED" && <i className="bi bi-arrow-return-left" />}
                          {r.status}
                        </span>
                      </td>
                      <td className={styles.tdRight}>{formatVND(r.net)}</td>
                      <td className={styles.tdActions} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.iconBtn} title="View" onClick={() => setSelected(r)} type="button">
                          <i className="bi bi-eye" />
                        </button>
                        <button className={styles.iconBtn} title="Mark as paid" onClick={() => markAsPaid(r.id)} disabled={r.status === "PAID" || r.status === "REFUNDED"} type="button">
                          <i className="bi bi-check2" />
                        </button>
                        <button className={styles.iconBtnDanger} title="Refund" onClick={() => refund(r.id)} disabled={r.status !== "PAID"} type="button">
                          <i className="bi bi-arrow-return-left" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <i className="bi bi-wallet2" />
              <h2>Payment methods</h2>
            </div>
            <span className={styles.panelHint}>Quick overview</span>
          </div>

          <div className={styles.methods}>
            <div className={styles.methodCard}>
              <div className={styles.methodTop}>
                <div className={styles.methodIcon}>
                  <i className="bi bi-credit-card" />
                </div>
                <div>
                  <div className={styles.methodName}>Card</div>
                  <div className={styles.methodSub}>3DS • Visa/Master</div>
                </div>
              </div>
              <div className={styles.methodMeta}>
                <span className={styles.kv}>
                  <i className="bi bi-shield-check" /> Enabled
                </span>
                <span className={styles.kv}>
                  <i className="bi bi-percent" /> ~2.5% fee
                </span>
              </div>
              <button className={styles.btnSoftFull} type="button">
                <i className="bi bi-gear" />
                Configure
              </button>
            </div>

            <div className={styles.methodCard}>
              <div className={styles.methodTop}>
                <div className={styles.methodIcon}>
                  <i className="bi bi-bank" />
                </div>
                <div>
                  <div className={styles.methodName}>Bank transfer</div>
                  <div className={styles.methodSub}>Manual reconciliation</div>
                </div>
              </div>
              <div className={styles.methodMeta}>
                <span className={styles.kv}>
                  <i className="bi bi-shield-check" /> Enabled
                </span>
                <span className={styles.kv}>
                  <i className="bi bi-clock-history" /> T+0/T+1
                </span>
              </div>
              <button className={styles.btnSoftFull} type="button">
                <i className="bi bi-gear" />
                Configure
              </button>
            </div>

            <div className={styles.methodCard}>
              <div className={styles.methodTop}>
                <div className={styles.methodIcon}>
                  <i className="bi bi-phone" />
                </div>
                <div>
                  <div className={styles.methodName}>Wallets</div>
                  <div className={styles.methodSub}>MoMo • ZaloPay</div>
                </div>
              </div>
              <div className={styles.methodMeta}>
                <span className={styles.kv}>
                  <i className="bi bi-shield-check" /> Enabled
                </span>
                <span className={styles.kv}>
                  <i className="bi bi-lightning-charge" /> Fast confirm
                </span>
              </div>
              <button className={styles.btnSoftFull} type="button">
                <i className="bi bi-gear" />
                Configure
              </button>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <i className="bi bi-send-check" />
              <h2>Payouts</h2>
            </div>
            <span className={styles.panelHint}>Settlement status</span>
          </div>

          <div className={styles.payoutBox}>
            <div className={styles.payoutRow}>
              <div className={styles.payoutLeft}>
                <div className={styles.payoutTitle}>
                  <i className="bi bi-calendar2-week" /> Next payout
                </div>
                <div className={styles.payoutSub}>Estimated settlement based on processor schedule</div>
              </div>
              <div className={styles.payoutRight}>
                <div className={styles.payoutValue}>Mon, 2026-01-19</div>
                <button className={styles.btnSoft} type="button">
                  <i className="bi bi-link-45deg" /> View payouts
                </button>
              </div>
            </div>

            <div className={styles.payoutRow}>
              <div className={styles.payoutLeft}>
                <div className={styles.payoutTitle}>
                  <i className="bi bi-piggy-bank" /> Available balance
                </div>
                <div className={styles.payoutSub}>Net amount ready to settle</div>
              </div>
              <div className={styles.payoutRight}>
                <div className={styles.payoutValue}>{formatVND(stats.net)}</div>
                <button className={styles.btnPrimary} type="button">
                  <i className="bi bi-send" /> Request payout
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {selected ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" onMouseDown={() => setSelected(null)}>
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>
                  <i className="bi bi-receipt-cutoff" /> Payment details
                </div>
                <div className={styles.modalSub}>
                  {selected.id} • {formatDT(selected.createdAt)}
                </div>
              </div>
              <button className={styles.modalClose} onClick={() => setSelected(null)} type="button" aria-label="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <div className={styles.detailLabel}>
                    <i className="bi bi-bag" /> Order
                  </div>
                  <div className={styles.detailValue}>{selected.orderCode}</div>
                  <div className={styles.detailHint}>Reference: {selected.reference || "—"}</div>
                </div>

                <div className={styles.detailCard}>
                  <div className={styles.detailLabel}>
                    <i className="bi bi-person" /> Customer
                  </div>
                  <div className={styles.detailValue}>{selected.customer.name}</div>
                  <div className={styles.detailHint}>{selected.customer.email}</div>
                </div>

                <div className={styles.detailCard}>
                  <div className={styles.detailLabel}>
                    <i className="bi bi-credit-card" /> Method
                  </div>
                  <div className={styles.detailValue}>{methodLabel(selected.method)}</div>
                  <div className={styles.detailHint}>
                    Status: <span className={`${styles.badge} ${badgeClass(selected.status)}`}>{selected.status}</span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <div className={styles.detailLabel}>
                    <i className="bi bi-cash" /> Amount
                  </div>
                  <div className={styles.detailValue}>{formatVND(selected.amount)}</div>
                  <div className={styles.detailHint}>
                    Fee: {formatVND(selected.fee)} • Net: {formatVND(selected.net)}
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.btnSoft} type="button" onClick={() => navigator.clipboard.writeText(selected.id)}>
                  <i className="bi bi-clipboard" />
                  Copy payment id
                </button>

                <button className={styles.btnSoft} type="button" onClick={() => navigator.clipboard.writeText(selected.orderCode)}>
                  <i className="bi bi-clipboard-check" />
                  Copy order code
                </button>

                <div className={styles.modalActionsRight}>
                  <button className={styles.btnSoft} type="button" onClick={() => markAsPaid(selected.id)} disabled={selected.status === "PAID" || selected.status === "REFUNDED"}>
                    <i className="bi bi-check2" />
                    Mark as paid
                  </button>
                  <button className={styles.btnDanger} type="button" onClick={() => refund(selected.id)} disabled={selected.status !== "PAID"}>
                    <i className="bi bi-arrow-return-left" />
                    Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

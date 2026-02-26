"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}
function formatDT(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(d);
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

/** --- MAPPING UI <-> DB --- */
type DbStatus = "PENDING" | "PAID" | "REFUNDED" | "CANCELLED";
type DbMethod = "CARD" | "BANK" | "CASH" | "EWALLET" | "COD";

function uiStatusToDb(s: Status): DbStatus {
  if (s === "FAILED") return "CANCELLED";
  return s;
}
function dbStatusToUi(s: DbStatus): Status {
  if (s === "CANCELLED") return "FAILED";
  return s;
}

function uiMethodToDb(m: Method): DbMethod {
  switch (m) {
    case "BANK_TRANSFER":
      return "BANK";
    case "MOMO":
    case "ZALOPAY":
      return "EWALLET";
    case "CARD":
      return "CARD";
    case "CASH":
      return "CASH";
  }
}
function dbMethodToUi(m: DbMethod, provider?: string | null): Method {
  // nếu bạn muốn phân biệt MoMo/ZaloPay theo provider thì làm ở đây
  if (m === "BANK") return "BANK_TRANSFER";
  if (m === "EWALLET") {
    if (provider === "MOMO") return "MOMO";
    if (provider === "ZALOPAY") return "ZALOPAY";
    return "MOMO";
  }
  if (m === "CARD") return "CARD";
  return "CASH";
}

/** fee demo: 2.5% cho paid */
function calcFee(amount: number) {
  return Math.round(amount * 0.025);
}

type ApiRow = {
  id: string;
  orderId: string;
  occurredAt: string;
  amountCents: number;
  currency: "USD" | "VND";
  status: "PENDING" | "PAID" | "REFUNDED" | "CANCELLED";
  method: "CARD" | "BANK" | "CASH" | "EWALLET" | "COD";
  provider?: string | null;
  reference?: string | null;
  notes?: string | null;
  order?: {
    id: string;
    number?: string | null;
    reference?: string | null;
    customerNameSnapshot?: string | null;
    customerEmailSnapshot?: string | null;
    shipToName?: string | null;
  } | null;
};

function centsToVnd(amountCents: number) {
  // bạn đang lưu amountCents nhưng UI đang hiển thị VND integer -> coi như cents = VND
  // Nếu sau này muốn đúng cents, đổi: return Math.round(amountCents / 100)
  return amountCents;
}

function toPaymentRow(api: ApiRow): PaymentRow {
  const amount = centsToVnd(api.amountCents);
  const uiStatus = dbStatusToUi(api.status);
  const fee = uiStatus === "PAID" ? calcFee(amount) : 0;
  const net = uiStatus === "PAID" ? amount - fee : 0;

  const orderCode = api.order?.number || api.order?.reference || api.orderId;

  return {
    id: api.id,
    createdAt: api.occurredAt,
    orderCode,
    customer: {
      name: api.order?.customerNameSnapshot || api.order?.shipToName || "—",
      email: api.order?.customerEmailSnapshot || "—",
    },
    method: dbMethodToUi(api.method, api.provider || null),
    amount,
    status: uiStatus,
    fee,
    net,
    reference: api.reference || undefined,
  };
}

export default function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [method, setMethod] = useState<Method | "ALL">("ALL");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [selected, setSelected] = useState<PaymentRow | null>(null);

  // debounce search để không spam API
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const abortRef = useRef<AbortController | null>(null);

  async function fetchPayments() {
    setLoading(true);
    setErr("");

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const params = new URLSearchParams();
      if (qDebounced.trim()) params.set("q", qDebounced.trim());

      if (status !== "ALL") params.set("status", uiStatusToDb(status));
      if (method !== "ALL") params.set("method", uiMethodToDb(method));

      if (from) params.set("from", new Date(from + "T00:00:00+07:00").toISOString());
      if (to) params.set("to", new Date(to + "T23:59:59+07:00").toISOString());

      params.set("take", "100"); // hoặc 20/50, tuỳ UI bạn

      const res = await fetch(`/api/payments?${params.toString()}`, {
        method: "GET",
        signal: abortRef.current.signal,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to fetch payments");

      const apiRows: ApiRow[] = json.data || [];
      const mapped: PaymentRow[] = apiRows.map((r: any) => {
        // patch fallback field nếu API không select order number
        const patched: any = { ...r, orderIdFallback: r.orderId };
        return toPaymentRow(patched);
      });

      setRows(mapped);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setErr(e?.message || "SERVER_ERROR");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, status, method, from, to]);

  const filtered = useMemo(() => {
    // vì đã filter trên server, client filter chỉ dùng nếu bạn muốn
    return rows;
  }, [rows]);

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

  async function patchPayment(id: string, data: any) {
    const res = await fetch(`/api/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Update failed");
    return json.data;
  }

  async function markAsPaid(id: string) {
    // optimistic
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.status === "PAID" || r.status === "REFUNDED") return r;
        const fee = calcFee(r.amount);
        return { ...r, status: "PAID", fee, net: r.amount - fee };
      }),
    );

    try {
      await patchPayment(id, { status: "PAID", direction: "CAPTURE" });
      // optional: refetch để đồng bộ
      // await fetchPayments();
    } catch (e: any) {
      setErr(e?.message || "Update failed");
      // rollback bằng cách refetch (đơn giản nhất)
      await fetchPayments();
    }
  }

  async function refund(id: string) {
    // optimistic
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.status !== "PAID") return r;
        return { ...r, status: "REFUNDED", net: 0 };
      }),
    );

    try {
      await patchPayment(id, { status: "REFUNDED", direction: "REFUND" });
      // await fetchPayments();
    } catch (e: any) {
      setErr(e?.message || "Refund failed");
      await fetchPayments();
    }
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
          {err ? <div className={styles.errorBanner}>⚠️ {err}</div> : null}
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnGhost} onClick={clearFilters} type="button" disabled={loading}>
            <i className="bi bi-arrow-counterclockwise" />
            Reset
          </button>
          <button className={styles.btnGhost} onClick={exportCSV} type="button" disabled={loading}>
            <i className="bi bi-download" />
            Export CSV
          </button>
          <button className={styles.btnPrimary} type="button" disabled={loading} onClick={() => alert("Hook this to POST /api/payments (create manual payment)")}>
            <i className="bi bi-plus-lg" />
            New payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Gross (Paid)</span>
            <i className="bi bi-cash-stack" />
          </div>
          <div className={styles.statValue}>{loading ? "…" : formatVND(stats.gross)}</div>
          <div className={styles.statHint}>
            {stats.paid} paid / {stats.count} shown
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Fees</span>
            <i className="bi bi-receipt" />
          </div>
          <div className={styles.statValue}>{loading ? "…" : formatVND(stats.fees)}</div>
          <div className={styles.statHint}>Processor fees on paid transactions</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Net</span>
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div className={styles.statValue}>{loading ? "…" : formatVND(stats.net)}</div>
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
        {/* Filters panel */}
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
                <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as any)} disabled={loading}>
                  <option value="ALL">All</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Method</span>
                <select className={styles.select} value={method} onChange={(e) => setMethod(e.target.value as any)} disabled={loading}>
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
                <input className={styles.input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={loading} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>To</span>
                <input className={styles.input} type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={loading} />
              </label>
            </div>

            <div className={styles.filterActions}>
              <button className={styles.btnSoft} type="button" onClick={clearFilters} disabled={loading}>
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

        {/* Table panel */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <i className="bi bi-list-check" />
              <h2>Transactions</h2>
            </div>
            <span className={styles.panelHint}>{loading ? "Loading…" : `${filtered.length} results`}</span>
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
                {loading ? (
                  <tr>
                    <td colSpan={8} className={styles.empty}>
                      <div className={styles.emptyBox}>
                        <i className="bi bi-hourglass-split" />
                        <div>
                          <div className={styles.emptyTitle}>Loading payments…</div>
                          <div className={styles.emptySub}>Please wait.</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
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

        {/* các section còn lại giữ nguyên của bạn */}
        {/* ... Payment methods / Payouts ... */}
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

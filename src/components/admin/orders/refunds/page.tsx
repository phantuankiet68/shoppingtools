"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/orders/refunds/refunds.module.css";

/** -------------------------
 * UI types (keep your UI stable)
 * -------------------------- */
type RefundStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "PROCESSING" | "REFUNDED";
type Reason = "DUPLICATE" | "DAMAGED" | "NOT_AS_DESCRIBED" | "LATE_DELIVERY" | "OTHER";
type Channel = "CARD" | "BANK_TRANSFER" | "MOMO" | "ZALOPAY" | "CASH";

type RefundRow = {
  id: string;
  createdAt: string; // ISO
  orderCode: string;
  paymentId?: string;
  customer: { name: string; email: string };
  channel: Channel;
  amount: number; // VND
  feeReturn: number; // VND
  status: RefundStatus;
  reason: Reason;
  note?: string;
  reference?: string; // gateway ref
  timeline: { at: string; label: string; by?: string }[];
};

/** -------------------------
 * DB / API types (Prisma)
 * -------------------------- */
type DbRefundStatus = "PENDING" | "APPROVED" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
type DbRefundReason = "CUSTOMER_REQUEST" | "DAMAGED" | "WRONG_ITEM" | "NOT_RECEIVED" | "CANCELLED_ORDER" | "DUPLICATE_PAYMENT" | "OTHER";

type DbPaymentMethod = "CARD" | "BANK" | "CASH" | "EWALLET" | "COD";
type DbPaymentProvider = "MANUAL" | "VNPAY" | "MOMO" | "ZALOPAY" | "STRIPE" | "PAYPAL" | "OTHER";

type ApiRefundRow = {
  id: string;
  requestedAt: string;
  approvedAt?: string | null;
  processedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  status: DbRefundStatus;
  reason: DbRefundReason;

  amountCents: number;
  currency: "USD" | "VND";

  reference?: string | null;
  notes?: string | null;

  orderId: string;
  originalPaymentId?: string | null;
  refundPaymentId?: string | null;

  order?: {
    id: string;
    number?: string | null;
    reference?: string | null;
    customerNameSnapshot?: string | null;
    customerEmailSnapshot?: string | null;
    customerPhoneSnapshot?: string | null;
    shipToName?: string | null;
    shipToPhone?: string | null;
  } | null;

  refundPayment?: {
    id: string;
    method: DbPaymentMethod;
    provider: DbPaymentProvider;
    status: string;
    reference?: string | null;
    occurredAt: string;
    amountCents: number;
    currency: "USD" | "VND";
  } | null;

  originalPayment?: {
    id: string;
    method: DbPaymentMethod;
    provider: DbPaymentProvider;
    status: string;
    reference?: string | null;
    occurredAt: string;
    amountCents: number;
    currency: "USD" | "VND";
  } | null;
};

/** -------------------------
 * Formatting helpers
 * -------------------------- */
function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}
function formatDT(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

/** -------------------------
 * UI labels / classes
 * -------------------------- */
function statusLabel(s: RefundStatus) {
  switch (s) {
    case "REQUESTED":
      return "Requested";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "PROCESSING":
      return "Processing";
    case "REFUNDED":
      return "Refunded";
  }
}
function reasonLabel(r: Reason) {
  switch (r) {
    case "DUPLICATE":
      return "Duplicate order";
    case "DAMAGED":
      return "Damaged item";
    case "NOT_AS_DESCRIBED":
      return "Not as described";
    case "LATE_DELIVERY":
      return "Late delivery";
    case "OTHER":
      return "Other";
  }
}
function channelLabel(c: Channel) {
  switch (c) {
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
function badgeClass(s: RefundStatus) {
  switch (s) {
    case "REQUESTED":
      return styles.badgeRequested;
    case "APPROVED":
      return styles.badgeApproved;
    case "REJECTED":
      return styles.badgeRejected;
    case "PROCESSING":
      return styles.badgeProcessing;
    case "REFUNDED":
      return styles.badgeRefunded;
  }
}

/** -------------------------
 * Mapping UI <-> DB
 * -------------------------- */
function dbStatusToUi(s: DbRefundStatus): RefundStatus {
  switch (s) {
    case "PENDING":
      return "REQUESTED";
    case "APPROVED":
      return "APPROVED";
    case "PROCESSING":
      return "PROCESSING";
    case "SUCCEEDED":
      return "REFUNDED";
    case "FAILED":
    case "CANCELLED":
      return "REJECTED";
  }
}
function uiStatusToDb(s: RefundStatus): DbRefundStatus {
  switch (s) {
    case "REQUESTED":
      return "PENDING";
    case "APPROVED":
      return "APPROVED";
    case "PROCESSING":
      return "PROCESSING";
    case "REFUNDED":
      return "SUCCEEDED";
    case "REJECTED":
      return "CANCELLED";
  }
}
function dbReasonToUi(r: DbRefundReason): Reason {
  switch (r) {
    case "DUPLICATE_PAYMENT":
      return "DUPLICATE";
    case "DAMAGED":
      return "DAMAGED";
    case "NOT_RECEIVED":
      return "LATE_DELIVERY";
    default:
      return "OTHER";
  }
}
function paymentToChannel(p?: { method: DbPaymentMethod; provider: DbPaymentProvider } | null): Channel {
  if (!p) return "CASH";
  if (p.provider === "MOMO") return "MOMO";
  if (p.provider === "ZALOPAY") return "ZALOPAY";
  if (p.method === "BANK") return "BANK_TRANSFER";
  if (p.method === "CASH") return "CASH";
  return "CARD";
}

/** -------------------------
 * Safe JSON parsing (avoid "Unexpected token <")
 * -------------------------- */
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON but got: ${text.slice(0, 120)}`);
  }
}

/** -------------------------
 * Timeline builder from API timestamps
 * -------------------------- */
function buildTimeline(api: ApiRefundRow): RefundRow["timeline"] {
  const t: RefundRow["timeline"] = [];
  t.push({ at: api.requestedAt, label: "Refund requested", by: "Customer" });

  if (api.approvedAt) t.push({ at: api.approvedAt, label: "Approved", by: "Admin" });
  if (api.processedAt) t.push({ at: api.processedAt, label: "Processing payout", by: "System" });
  if (api.completedAt) t.push({ at: api.completedAt, label: "Refunded", by: "Gateway" });

  if (api.status === "FAILED") t.push({ at: api.updatedAt, label: "Failed", by: "System" });
  if (api.status === "CANCELLED") t.push({ at: api.updatedAt, label: "Cancelled", by: "Admin" });

  return t.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

/** -------------------------
 * Transform API row -> UI row
 * -------------------------- */
function toRefundRow(api: ApiRefundRow): RefundRow {
  const orderCode = api.order?.number || api.order?.reference || api.orderId;
  const channel = paymentToChannel(api.refundPayment ? { method: api.refundPayment.method, provider: api.refundPayment.provider } : null);

  return {
    id: api.id,
    createdAt: api.requestedAt,
    orderCode,
    paymentId: api.originalPaymentId || undefined,
    customer: {
      name: api.order?.customerNameSnapshot || api.order?.shipToName || "—",
      email: api.order?.customerEmailSnapshot || "—",
    },
    channel,
    amount: Math.max(0, Math.trunc(api.amountCents)), // treat cents as VND integer in your app
    feeReturn: 0,
    status: dbStatusToUi(api.status),
    reason: dbReasonToUi(api.reason),
    note: api.notes || undefined,
    reference: api.reference || api.refundPayment?.reference || undefined,
    timeline: buildTimeline(api),
  };
}

export default function RefundsPage() {
  const [rows, setRows] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<RefundStatus | "ALL">("ALL");
  const [channel, setChannel] = useState<Channel | "ALL">("ALL");
  const [reason, setReason] = useState<Reason | "ALL">("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selected, setSelected] = useState<RefundRow | null>(null);

  async function fetchRefunds() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/refunds?take=200`, { method: "GET" });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || "Failed to load refunds");

      const apiRows: ApiRefundRow[] = json.data || [];
      setRows(apiRows.map(toRefundRow));
    } catch (e: any) {
      setErr(e?.message || "Failed to load refunds");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();

    return rows.filter((r) => {
      const hitKw =
        !kw ||
        r.id.toLowerCase().includes(kw) ||
        r.orderCode.toLowerCase().includes(kw) ||
        (r.paymentId || "").toLowerCase().includes(kw) ||
        r.customer.name.toLowerCase().includes(kw) ||
        r.customer.email.toLowerCase().includes(kw) ||
        (r.reference || "").toLowerCase().includes(kw);

      const hitStatus = status === "ALL" ? true : r.status === status;
      const hitChannel = channel === "ALL" ? true : r.channel === channel;
      const hitReason = reason === "ALL" ? true : r.reason === reason;

      const t = new Date(r.createdAt).getTime();
      const hitFrom = from ? t >= new Date(from + "T00:00:00+07:00").getTime() : true;
      const hitTo = to ? t <= new Date(to + "T23:59:59+07:00").getTime() : true;

      return hitKw && hitStatus && hitChannel && hitReason && hitFrom && hitTo;
    });
  }, [rows, q, status, channel, reason, from, to]);

  const stats = useMemo(() => {
    const requested = filtered.filter((r) => r.status === "REQUESTED").length;
    const processing = filtered.filter((r) => r.status === "PROCESSING").length;
    const approved = filtered.filter((r) => r.status === "APPROVED").length;
    const rejected = filtered.filter((r) => r.status === "REJECTED").length;
    const refunded = filtered.filter((r) => r.status === "REFUNDED").length;

    const totalAmount = filtered.reduce((s, r) => s + r.amount, 0);
    const refundedAmount = filtered.filter((r) => r.status === "REFUNDED").reduce((s, r) => s + r.amount, 0);

    return { requested, processing, approved, rejected, refunded, totalAmount, refundedAmount, count: filtered.length };
  }, [filtered]);

  function clearFilters() {
    setQ("");
    setStatus("ALL");
    setChannel("ALL");
    setReason("ALL");
    setFrom("");
    setTo("");
  }

  function exportCSV() {
    const header = ["id", "createdAt", "orderCode", "paymentId", "customerName", "customerEmail", "channel", "amount", "feeReturn", "status", "reason", "reference", "note"];
    const data = filtered.map((r) => [
      r.id,
      r.createdAt,
      r.orderCode,
      r.paymentId || "",
      r.customer.name,
      r.customer.email,
      r.channel,
      r.amount,
      r.feeReturn,
      r.status,
      r.reason,
      r.reference || "",
      r.note || "",
    ]);

    const csv = [header, ...data].map((line) => line.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `refunds_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function patchRefund(id: string, next: RefundStatus) {
    // optimistic update
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const now = new Date().toISOString();
        let label = "";
        let by = "";

        if (next === "APPROVED") {
          label = "Approved";
          by = "Admin";
        } else if (next === "REJECTED") {
          label = "Rejected";
          by = "Admin";
        } else if (next === "PROCESSING") {
          label = "Processing payout";
          by = "System";
        } else if (next === "REFUNDED") {
          label = "Refunded";
          by = "Gateway";
        }

        const timeline = label ? [...r.timeline, { at: now, label, by }] : r.timeline;
        const updated: RefundRow = { ...r, status: next, timeline };

        if (selected?.id === id) setSelected(updated);
        return updated;
      }),
    );

    try {
      const res = await fetch(`/api/admin/refunds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: uiStatusToDb(next) }),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || "Update failed");

      const api: ApiRefundRow = json.data;
      const row = toRefundRow(api);

      setRows((prev) => prev.map((x) => (x.id === id ? row : x)));
      if (selected?.id === id) setSelected(row);
    } catch (e: any) {
      await fetchRefunds(); // rollback to server truth
      alert(e?.message || "Update failed");
    }
  }

  function approve(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r || r.status !== "REQUESTED") return;
    patchRefund(id, "APPROVED");
  }

  function reject(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r || r.status !== "REQUESTED") return;
    patchRefund(id, "REJECTED");
  }

  function startProcessing(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r || r.status !== "APPROVED") return;
    patchRefund(id, "PROCESSING");
  }

  function markRefunded(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r || r.status !== "PROCESSING") return;
    patchRefund(id, "REFUNDED");
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <i className={`bi bi-arrow-counterclockwise ${styles.titleIcon}`} />
            <h1 className={styles.title}>Refunds</h1>
          </div>
          <p className={styles.subtitle}>Review, approve and track refund requests across channels.</p>
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
          <button className={styles.btnPrimary} type="button" onClick={() => alert("Hook this to your low-code 'Create refund' flow")}>
            <i className="bi bi-plus-lg" />
            New refund
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Refunded amount</span>
            <i className="bi bi-cash-coin" />
          </div>
          <div className={styles.statValue}>{formatVND(stats.refundedAmount)}</div>
          <div className={styles.statHint}>
            {stats.refunded} refunded / {stats.count} shown
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Total in view</span>
            <i className="bi bi-receipt" />
          </div>
          <div className={styles.statValue}>{formatVND(stats.totalAmount)}</div>
          <div className={styles.statHint}>Sum of all refund requests in current view</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Queue</span>
            <i className="bi bi-inboxes" />
          </div>
          <div className={styles.statPills}>
            <span className={`${styles.pill} ${styles.pillRequested}`}>
              <i className="bi bi-hourglass-split" /> {stats.requested}
            </span>
            <span className={`${styles.pill} ${styles.pillProcessing}`}>
              <i className="bi bi-gear" /> {stats.processing}
            </span>
          </div>
          <div className={styles.statHint}>Needs review / processing</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Decisions</span>
            <i className="bi bi-check2-square" />
          </div>
          <div className={styles.statPills}>
            <span className={`${styles.pill} ${styles.pillApproved}`}>
              <i className="bi bi-check2-circle" /> {stats.approved}
            </span>
            <span className={`${styles.pill} ${styles.pillRejected}`}>
              <i className="bi bi-x-circle" /> {stats.rejected}
            </span>
            <span className={`${styles.pill} ${styles.pillRefunded}`}>
              <i className="bi bi-arrow-return-left" /> {stats.refunded}
            </span>
          </div>
          <div className={styles.statHint}>Approved / Rejected / Completed</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Filters */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <i className="bi bi-funnel" />
              <h2>Filters</h2>
            </div>
            <span className={styles.panelHint}>Low-code friendly filters</span>
          </div>

          <div className={styles.filters}>
            <label className={styles.field}>
              <span className={styles.label}>Search</span>
              <div className={styles.inputWrap}>
                <i className={`bi bi-search ${styles.inputIcon}`} />
                <input className={styles.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Refund id, order, payment id, customer, reference..." />
              </div>
            </label>

            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.label}>Status</span>
                <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="ALL">All</option>
                  <option value="REQUESTED">Requested</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Channel</span>
                <select className={styles.select} value={channel} onChange={(e) => setChannel(e.target.value as any)}>
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
                <span className={styles.label}>Reason</span>
                <select className={styles.select} value={reason} onChange={(e) => setReason(e.target.value as any)}>
                  <option value="ALL">All</option>
                  <option value="DUPLICATE">Duplicate order</option>
                  <option value="DAMAGED">Damaged item</option>
                  <option value="NOT_AS_DESCRIBED">Not as described</option>
                  <option value="LATE_DELIVERY">Late delivery</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <div className={styles.fieldInline}>
                <label className={styles.field}>
                  <span className={styles.label}>From</span>
                  <input className={styles.inputPlain} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>To</span>
                  <input className={styles.inputPlain} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </label>
              </div>
            </div>

            <div className={styles.filterActions}>
              <button className={styles.btnSoft} type="button" onClick={fetchRefunds} disabled={loading}>
                <i className="bi bi-arrow-repeat" />
                Refresh
              </button>
              <button className={styles.btnSoft} type="button" onClick={clearFilters}>
                <i className="bi bi-eraser" />
                Clear
              </button>
              <div className={styles.miniTip}>
                <i className="bi bi-info-circle" />
                {loading ? "Loading..." : err ? err : "Click a row to open details drawer."}
              </div>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <i className="bi bi-list-check" />
              <h2>Refund requests</h2>
            </div>
            <span className={styles.panelHint}>{loading ? "Loading..." : err ? err : `${filtered.length} results`}</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Refund</th>
                  <th>Customer</th>
                  <th>Reason</th>
                  <th>Channel</th>
                  <th className={styles.thRight}>Amount</th>
                  <th>Status</th>
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
                          <div className={styles.emptyTitle}>{loading ? "Loading..." : "No refund requests"}</div>
                          <div className={styles.emptySub}>{err ? err : "Try changing filters or search keyword."}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className={styles.tr} onClick={() => setSelected(r)} role="button" tabIndex={0}>
                      <td className={styles.muted}>{formatDT(r.createdAt)}</td>
                      <td>
                        <div className={styles.refCell}>
                          <div className={styles.refId}>{r.id}</div>
                          <div className={styles.refSub}>
                            <i className="bi bi-bag" /> {r.orderCode}
                            {r.paymentId ? (
                              <>
                                <span className={styles.dot} />
                                <i className="bi bi-credit-card-2-front" /> {r.paymentId}
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
                        <span className={styles.reasonPill}>
                          <i className="bi bi-chat-left-text" />
                          {reasonLabel(r.reason)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.channelPill}>
                          <i className="bi bi-wallet2" />
                          {channelLabel(r.channel)}
                        </span>
                      </td>
                      <td className={styles.tdRight}>{formatVND(r.amount)}</td>
                      <td>
                        <span className={`${styles.badge} ${badgeClass(r.status)}`}>
                          {r.status === "REQUESTED" && <i className="bi bi-hourglass-split" />}
                          {r.status === "APPROVED" && <i className="bi bi-check2-circle" />}
                          {r.status === "REJECTED" && <i className="bi bi-x-circle" />}
                          {r.status === "PROCESSING" && <i className="bi bi-gear" />}
                          {r.status === "REFUNDED" && <i className="bi bi-arrow-return-left" />}
                          {statusLabel(r.status)}
                        </span>
                      </td>

                      <td className={styles.tdActions} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.iconBtn} title="View" onClick={() => setSelected(r)} type="button">
                          <i className="bi bi-eye" />
                        </button>

                        <button className={styles.iconBtn} title="Approve" onClick={() => approve(r.id)} disabled={r.status !== "REQUESTED"} type="button">
                          <i className="bi bi-check2" />
                        </button>

                        <button className={styles.iconBtnDanger} title="Reject" onClick={() => reject(r.id)} disabled={r.status !== "REQUESTED"} type="button">
                          <i className="bi bi-x-lg" />
                        </button>

                        <button className={styles.iconBtn} title="Start processing" onClick={() => startProcessing(r.id)} disabled={r.status !== "APPROVED"} type="button">
                          <i className="bi bi-gear" />
                        </button>

                        <button className={styles.iconBtn} title="Mark refunded" onClick={() => markRefunded(r.id)} disabled={r.status !== "PROCESSING"} type="button">
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

        {/* Sidebar: policy / quick actions */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <i className="bi bi-shield-check" />
              <h2>Refund policy</h2>
            </div>
            <span className={styles.panelHint}>Low-code notes</span>
          </div>

          <div className={styles.policy}>
            <div className={styles.policyItem}>
              <div className={styles.policyTitle}>
                <i className="bi bi-clock-history" /> SLA
              </div>
              <div className={styles.policyText}>Review requests within 24–48h. Escalate bank-transfer refunds to finance.</div>
            </div>

            <div className={styles.policyItem}>
              <div className={styles.policyTitle}>
                <i className="bi bi-exclamation-triangle" /> Risk checks
              </div>
              <div className={styles.policyText}>Flag high-value refunds, repeated requests, and mismatched customer email.</div>
            </div>

            <div className={styles.policyItem}>
              <div className={styles.policyTitle}>
                <i className="bi bi-journal-text" /> Audit
              </div>
              <div className={styles.policyText}>Always keep timeline entries and internal note for admin actions.</div>
            </div>

            <button className={styles.btnSoftFull} type="button" onClick={() => alert("Hook to your low-code workflow builder")}>
              <i className="bi bi-diagram-3" />
              Open workflow builder
            </button>
          </div>
        </section>
      </div>

      {/* Drawer / Modal */}
      {selected ? (
        <div className={styles.drawerOverlay} role="dialog" aria-modal="true" onMouseDown={() => setSelected(null)}>
          <aside className={styles.drawer} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <div className={styles.drawerTitle}>
                  <i className="bi bi-receipt-cutoff" /> Refund details
                </div>
                <div className={styles.drawerSub}>
                  {selected.id} • {formatDT(selected.createdAt)}
                </div>
              </div>
              <button className={styles.drawerClose} onClick={() => setSelected(null)} type="button" aria-label="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>
                    <i className="bi bi-bag" /> Order
                  </div>
                  <div className={styles.kpiValue}>{selected.orderCode}</div>
                  <div className={styles.kpiHint}>Payment: {selected.paymentId || "—"}</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>
                    <i className="bi bi-person" /> Customer
                  </div>
                  <div className={styles.kpiValue}>{selected.customer.name}</div>
                  <div className={styles.kpiHint}>{selected.customer.email}</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>
                    <i className="bi bi-wallet2" /> Channel
                  </div>
                  <div className={styles.kpiValue}>{channelLabel(selected.channel)}</div>
                  <div className={styles.kpiHint}>Reference: {selected.reference || "—"}</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>
                    <i className="bi bi-cash" /> Amount
                  </div>
                  <div className={styles.kpiValue}>{formatVND(selected.amount)}</div>
                  <div className={styles.kpiHint}>Fee return: {formatVND(selected.feeReturn)}</div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <i className="bi bi-chat-left-text" /> Reason & note
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Reason</span>
                    <span className={styles.rowValue}>{reasonLabel(selected.reason)}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Status</span>
                    <span className={`${styles.badge} ${badgeClass(selected.status)}`}>{statusLabel(selected.status)}</span>
                  </div>
                  <div className={styles.noteBox}>
                    <i className="bi bi-journal-text" />
                    <div>
                      <div className={styles.noteTitle}>Internal note</div>
                      <div className={styles.noteText}>{selected.note || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <i className="bi bi-clock-history" /> Timeline
                </div>
                <div className={styles.timeline}>
                  {selected.timeline.map((t, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineBody}>
                        <div className={styles.timelineTop}>
                          <span className={styles.timelineLabel}>{t.label}</span>
                          <span className={styles.timelineAt}>{formatDT(t.at)}</span>
                        </div>
                        <div className={styles.timelineBy}>{t.by ? `by ${t.by}` : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.drawerActions}>
                <button className={styles.btnGhost} type="button" onClick={() => navigator.clipboard.writeText(selected.id)}>
                  <i className="bi bi-clipboard" />
                  Copy refund id
                </button>

                <div className={styles.drawerActionsRight}>
                  <button className={styles.btnSoft} type="button" onClick={() => approve(selected.id)} disabled={selected.status !== "REQUESTED"}>
                    <i className="bi bi-check2" />
                    Approve
                  </button>
                  <button className={styles.btnDanger} type="button" onClick={() => reject(selected.id)} disabled={selected.status !== "REQUESTED"}>
                    <i className="bi bi-x-lg" />
                    Reject
                  </button>
                  <button className={styles.btnSoft} type="button" onClick={() => startProcessing(selected.id)} disabled={selected.status !== "APPROVED"}>
                    <i className="bi bi-gear" />
                    Processing
                  </button>
                  <button className={styles.btnPrimary} type="button" onClick={() => markRefunded(selected.id)} disabled={selected.status !== "PROCESSING"}>
                    <i className="bi bi-arrow-return-left" />
                    Mark refunded
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

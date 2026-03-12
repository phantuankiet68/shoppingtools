"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/orders/payments/payments.module.css";
import { useSiteStore } from "@/store/site/site.store";

/* =========================
 * UI types
 * ========================= */

type UiPaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";
type UiPaymentMethod = "CARD" | "BANK_TRANSFER" | "MOMO" | "ZALOPAY" | "CASH";

type PaymentRow = {
  id: string;
  createdAt: string;
  orderCode: string;
  customer: {
    name: string;
    email: string;
  };
  method: UiPaymentMethod;
  amount: number;
  status: UiPaymentStatus;
  fee: number;
  net: number;
  reference?: string;
};

/* =========================
 * API types
 * ========================= */

type ApiPaymentTxStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED";
type ApiPaymentMethod = "COD" | "CARD" | "BANK_TRANSFER" | "WALLET";

type ApiOrderSummary = {
  id: string;
  orderNumber?: string | null;
  status?: string | null;
  paymentStatus?: string | null;
  fulfillmentStatus?: string | null;
  totalCents?: number | null;
  currency?: string | null;
  createdAt?: string | null;
  customerNameSnapshot?: string | null;
  customerEmailSnapshot?: string | null;
  shipToName?: string | null;
} | null;

type ApiPaymentRow = {
  id: string;
  siteId: string;
  orderId: string;
  direction: "CAPTURE" | "REFUND";
  status: ApiPaymentTxStatus;
  method: ApiPaymentMethod;
  currency: string;
  amountCents: number;
  provider?: string | null;
  providerTransactionId?: string | null;
  reference?: string | null;
  occurredAt: string;
  idempotencyKey?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: ApiOrderSummary;
};

type PaymentsListResponse = {
  data?: ApiPaymentRow[];
  nextCursor?: string | null;
  error?: string;
};

type PaymentDetailResponse = {
  data?: ApiPaymentRow;
  error?: string;
};

type PatchPaymentPayload = Partial<{
  direction: "CAPTURE" | "REFUND";
  status: ApiPaymentTxStatus;
  method: ApiPaymentMethod;
  currency: string;
  amountCents: number;
  provider: string | null;
  providerTransactionId: string | null;
  reference: string | null;
  occurredAt: string;
  idempotencyKey: string | null;
}>;

/* =========================
 * Constants
 * ========================= */

const API_LIST = "/api/admin/orders/payments";
const API_DETAIL = "/api/admin/orders/payments";

const SEARCH_DEBOUNCE_MS = 300;
const FETCH_TAKE = 100;

/* =========================
 * Utils
 * ========================= */

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function formatDT(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function badgeClass(status: UiPaymentStatus) {
  switch (status) {
    case "PAID":
      return styles.badgePaid;
    case "PENDING":
      return styles.badgePending;
    case "FAILED":
      return styles.badgeFailed;
    case "REFUNDED":
      return styles.badgeRefunded;
    default:
      return "";
  }
}

function methodLabel(method: UiPaymentMethod) {
  switch (method) {
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
    default:
      return "Unknown";
  }
}

function calcFee(amount: number) {
  return Math.round(amount * 0.025);
}

/**
 * Hiện tại backend đang dùng amountCents nhưng thực tế đang lưu theo VND integer.
 * Nếu sau này bạn lưu đúng cents thì đổi thành Math.round(amountCents / 100).
 */
function centsToDisplayAmount(amountCents: number) {
  return amountCents;
}

/* =========================
 * UI <-> API mapping
 * ========================= */

function uiStatusToApi(status: UiPaymentStatus): ApiPaymentTxStatus {
  switch (status) {
    case "PAID":
      return "SUCCEEDED";
    case "PENDING":
      return "PENDING";
    case "FAILED":
      return "FAILED";
    case "REFUNDED":
      return "SUCCEEDED";
    default:
      return "PENDING";
  }
}

function apiStatusToUi(status: ApiPaymentTxStatus, direction: "CAPTURE" | "REFUND"): UiPaymentStatus {
  if (direction === "REFUND" && status === "SUCCEEDED") return "REFUNDED";
  if (status === "SUCCEEDED") return "PAID";
  if (status === "PENDING") return "PENDING";
  return "FAILED";
}

function uiMethodToApi(method: UiPaymentMethod): ApiPaymentMethod {
  switch (method) {
    case "BANK_TRANSFER":
      return "BANK_TRANSFER";
    case "MOMO":
    case "ZALOPAY":
      return "WALLET";
    case "CARD":
      return "CARD";
    case "CASH":
      return "COD";
    default:
      return "COD";
  }
}

function apiMethodToUi(method: ApiPaymentMethod, provider?: string | null): UiPaymentMethod {
  if (method === "BANK_TRANSFER") return "BANK_TRANSFER";

  if (method === "WALLET") {
    if (provider === "ZALOPAY") return "ZALOPAY";
    return "MOMO";
  }

  if (method === "CARD") return "CARD";
  return "CASH";
}

function toPaymentRow(api: ApiPaymentRow): PaymentRow {
  const amount = centsToDisplayAmount(api.amountCents);
  const status = apiStatusToUi(api.status, api.direction);
  const fee = status === "PAID" ? calcFee(amount) : 0;
  const net = status === "PAID" ? amount - fee : 0;

  const orderCode = api.order?.orderNumber || api.orderId;

  return {
    id: api.id,
    createdAt: api.occurredAt,
    orderCode,
    customer: {
      name: api.order?.customerNameSnapshot || api.order?.shipToName || "—",
      email: api.order?.customerEmailSnapshot || "—",
    },
    method: apiMethodToUi(api.method, api.provider),
    amount,
    status,
    fee,
    net,
    reference: api.reference || undefined,
  };
}

/* =========================
 * Component
 * ========================= */

export default function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");

  const [status, setStatus] = useState<UiPaymentStatus | "ALL">("ALL");
  const [method, setMethod] = useState<UiPaymentMethod | "ALL">("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selected, setSelected] = useState<PaymentRow | null>(null);

  const sites = useSiteStore((state) => state.sites);
  const sitesLoading = useSiteStore((state) => state.loading);
  const sitesErr = useSiteStore((state) => state.err);
  const selectedSiteId = useSiteStore((state) => state.siteId);
  const setSelectedSiteId = useSiteStore((state) => state.setSiteId);
  const hydrateFromStorage = useSiteStore((state) => state.hydrateFromStorage);
  const loadSites = useSiteStore((state) => state.loadSites);

  const selectedSite = useMemo(() => {
    return sites.find((site) => site.id === selectedSiteId) ?? null;
  }, [sites, selectedSiteId]);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    void loadSites();
  }, [loadSites]);

  useEffect(() => {
    if (!selectedSiteId && sites.length > 0) {
      setSelectedSiteId(sites[0].id);
    }
  }, [selectedSiteId, setSelectedSiteId, sites]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQDebounced(q.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [q]);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    if (qDebounced) params.set("q", qDebounced);
    if (status !== "ALL") params.set("status", uiStatusToApi(status));
    if (method !== "ALL") params.set("method", uiMethodToApi(method));

    if (from) {
      params.set("from", new Date(`${from}T00:00:00+07:00`).toISOString());
    }

    if (to) {
      params.set("to", new Date(`${to}T23:59:59+07:00`).toISOString());
    }

    params.set("take", String(FETCH_TAKE));

    return params.toString();
  }, [from, method, qDebounced, status, to]);

  const fetchPayments = useCallback(async () => {
    if (!selectedSiteId) {
      setRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const query = buildQueryString();

      const res = await fetch(`${API_LIST}?${query}`, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "x-site-id": selectedSiteId,
        },
      });

      const json: PaymentsListResponse = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch payments");
      }

      const apiRows = Array.isArray(json.data) ? json.data : [];
      const mappedRows = apiRows.map(toPaymentRow);

      setRows(mappedRows);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const message = error instanceof Error ? error.message : "SERVER_ERROR";
      setErr(message);
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }, [buildQueryString, selectedSiteId]);

  useEffect(() => {
    if (sitesLoading) return;

    void fetchPayments();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchPayments, sitesLoading]);

  const stats = useMemo(() => {
    const paidRows = rows.filter((row) => row.status === "PAID");
    const pendingRows = rows.filter((row) => row.status === "PENDING");
    const failedRows = rows.filter((row) => row.status === "FAILED");
    const refundedRows = rows.filter((row) => row.status === "REFUNDED");

    const gross = paidRows.reduce((sum, row) => sum + row.amount, 0);
    const fees = paidRows.reduce((sum, row) => sum + row.fee, 0);
    const net = paidRows.reduce((sum, row) => sum + row.net, 0);

    return {
      count: rows.length,
      paid: paidRows.length,
      pending: pendingRows.length,
      failed: failedRows.length,
      refunded: refundedRows.length,
      gross,
      fees,
      net,
    };
  }, [rows]);

  const clearFilters = useCallback(() => {
    setQ("");
    setStatus("ALL");
    setMethod("ALL");
    setFrom("");
    setTo("");
  }, []);

  const exportCSV = useCallback(() => {
    const header = [
      "id",
      "createdAt",
      "orderCode",
      "customerName",
      "customerEmail",
      "method",
      "amount",
      "status",
      "fee",
      "net",
      "reference",
    ];

    const data = rows.map((row) => [
      row.id,
      row.createdAt,
      row.orderCode,
      row.customer.name,
      row.customer.email,
      row.method,
      row.amount,
      row.status,
      row.fee,
      row.net,
      row.reference || "",
    ]);

    const csv = [header, ...data]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }, [rows]);

  const patchPayment = useCallback(
    async (id: string, payload: PatchPaymentPayload) => {
      if (!selectedSiteId) {
        throw new Error("Missing selected site");
      }

      const res = await fetch(`${API_DETAIL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-site-id": selectedSiteId,
        },
        body: JSON.stringify(payload),
      });

      const json: PaymentDetailResponse = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Update failed");
      }

      return json.data;
    },
    [selectedSiteId],
  );

  const markAsPaid = useCallback(
    async (id: string) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          if (row.status === "PAID" || row.status === "REFUNDED") return row;

          const fee = calcFee(row.amount);

          return {
            ...row,
            status: "PAID",
            fee,
            net: row.amount - fee,
          };
        }),
      );

      setSelected((prev) => {
        if (!prev || prev.id !== id) return prev;
        if (prev.status === "PAID" || prev.status === "REFUNDED") return prev;

        const fee = calcFee(prev.amount);

        return {
          ...prev,
          status: "PAID",
          fee,
          net: prev.amount - fee,
        };
      });

      try {
        await patchPayment(id, {
          status: "SUCCEEDED",
          direction: "CAPTURE",
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Update failed";
        setErr(message);
        await fetchPayments();
      }
    },
    [fetchPayments, patchPayment],
  );

  const refund = useCallback(
    async (id: string) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          if (row.status !== "PAID") return row;

          return {
            ...row,
            status: "REFUNDED",
            fee: 0,
            net: 0,
          };
        }),
      );

      setSelected((prev) => {
        if (!prev || prev.id !== id) return prev;
        if (prev.status !== "PAID") return prev;

        return {
          ...prev,
          status: "REFUNDED",
          fee: 0,
          net: 0,
        };
      });

      try {
        await patchPayment(id, {
          status: "SUCCEEDED",
          direction: "REFUND",
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Refund failed";
        setErr(message);
        await fetchPayments();
      }
    },
    [fetchPayments, patchPayment],
  );

  const pageError = err || sitesErr || "";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <i className={`bi bi-credit-card-2-front ${styles.titleIcon}`} />
            <h1 className={styles.title}>Payments</h1>
          </div>

          <p className={styles.subtitle}>Manage transactions, fees, payouts and payment methods.</p>

          <p className={styles.subtitle}>
            Site: <strong>{selectedSite?.name || "Chưa chọn site"}</strong>
          </p>

          {pageError ? <div className={styles.errorBanner}>⚠️ {pageError}</div> : null}
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnGhost} onClick={clearFilters} type="button" disabled={loading}>
            <i className="bi bi-arrow-counterclockwise" />
            Reset
          </button>

          <button className={styles.btnGhost} onClick={exportCSV} type="button" disabled={loading || rows.length === 0}>
            <i className="bi bi-download" />
            Export CSV
          </button>

          <button
            className={styles.btnPrimary}
            type="button"
            disabled={loading || !selectedSiteId}
            onClick={() => alert("Hook this button to POST /api/admin/orders/payments")}
          >
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
                <input
                  className={styles.input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Order, customer, email, payment id, reference..."
                  disabled={!selectedSiteId || sitesLoading}
                />
              </div>
            </label>

            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span className={styles.label}>Status</span>
                <select
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UiPaymentStatus | "ALL")}
                  disabled={loading || !selectedSiteId}
                >
                  <option value="ALL">All</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Method</span>
                <select
                  className={styles.select}
                  value={method}
                  onChange={(e) => setMethod(e.target.value as UiPaymentMethod | "ALL")}
                  disabled={loading || !selectedSiteId}
                >
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
                <input
                  className={styles.input}
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  disabled={loading || !selectedSiteId}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>To</span>
                <input
                  className={styles.input}
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  disabled={loading || !selectedSiteId}
                />
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

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <i className="bi bi-list-check" />
              <h2>Transactions</h2>
            </div>
            <span className={styles.panelHint}>{loading ? "Loading…" : `${rows.length} results`}</span>
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
                {sitesLoading || loading ? (
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
                ) : !selectedSiteId ? (
                  <tr>
                    <td colSpan={8} className={styles.empty}>
                      <div className={styles.emptyBox}>
                        <i className="bi bi-shop" />
                        <div>
                          <div className={styles.emptyTitle}>No site selected</div>
                          <div className={styles.emptySub}>Please select a site to view payments.</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
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
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className={styles.tr}
                      onClick={() => setSelected(row)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(row);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <td className={styles.muted}>{formatDT(row.createdAt)}</td>

                      <td>
                        <div className={styles.paymentCell}>
                          <div className={styles.payId}>{row.id}</div>
                          <div className={styles.paySub}>
                            <i className="bi bi-bag" /> {row.orderCode}
                            {row.reference ? (
                              <>
                                <span className={styles.dot} />
                                <i className="bi bi-hash" /> {row.reference}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className={styles.customer}>
                          <div className={styles.customerName}>{row.customer.name}</div>
                          <div className={styles.customerEmail}>{row.customer.email}</div>
                        </div>
                      </td>

                      <td>
                        <span className={styles.methodPill}>
                          <i className="bi bi-credit-card" />
                          {methodLabel(row.method)}
                        </span>
                      </td>

                      <td className={styles.tdRight}>{formatVND(row.amount)}</td>

                      <td>
                        <span className={`${styles.badge} ${badgeClass(row.status)}`}>
                          {row.status === "PAID" && <i className="bi bi-check2-circle" />}
                          {row.status === "PENDING" && <i className="bi bi-hourglass-split" />}
                          {row.status === "FAILED" && <i className="bi bi-x-circle" />}
                          {row.status === "REFUNDED" && <i className="bi bi-arrow-return-left" />}
                          {row.status}
                        </span>
                      </td>

                      <td className={styles.tdRight}>{formatVND(row.net)}</td>

                      <td className={styles.tdActions} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.iconBtn} title="View" onClick={() => setSelected(row)} type="button">
                          <i className="bi bi-eye" />
                        </button>

                        <button
                          className={styles.iconBtn}
                          title="Mark as paid"
                          onClick={() => markAsPaid(row.id)}
                          disabled={row.status === "PAID" || row.status === "REFUNDED" || !selectedSiteId}
                          type="button"
                        >
                          <i className="bi bi-check2" />
                        </button>

                        <button
                          className={styles.iconBtnDanger}
                          title="Refund"
                          onClick={() => refund(row.id)}
                          disabled={row.status !== "PAID" || !selectedSiteId}
                          type="button"
                        >
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
                <button
                  className={styles.btnSoft}
                  type="button"
                  onClick={() => navigator.clipboard.writeText(selected.id)}
                >
                  <i className="bi bi-clipboard" />
                  Copy payment id
                </button>

                <button
                  className={styles.btnSoft}
                  type="button"
                  onClick={() => navigator.clipboard.writeText(selected.orderCode)}
                >
                  <i className="bi bi-clipboard-check" />
                  Copy order code
                </button>

                <div className={styles.modalActionsRight}>
                  <button
                    className={styles.btnSoft}
                    type="button"
                    onClick={() => markAsPaid(selected.id)}
                    disabled={selected.status === "PAID" || selected.status === "REFUNDED" || !selectedSiteId}
                  >
                    <i className="bi bi-check2" />
                    Mark as paid
                  </button>

                  <button
                    className={styles.btnDanger}
                    type="button"
                    onClick={() => refund(selected.id)}
                    disabled={selected.status !== "PAID" || !selectedSiteId}
                  >
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

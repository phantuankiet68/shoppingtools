"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import styles from "@/styles/admin/orders/orders.module.css";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERING" | "DELIVERED" | "CANCELLED" | "RETURNED";
type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED" | "CANCELLED";
type FulfillmentStatus = "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "CANCELLED" | "RETURNED";
type SalesChannel = "SHOP" | "MARKETPLACE" | "WHOLESALE";
type CurrencyCode = "USD" | "VND";

type OrderListRow = {
  id: string;
  number: string | null;
  reference: string | null;
  channel: SalesChannel;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  currency: CurrencyCode;

  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;

  customerNameSnapshot: string | null;
  customerPhoneSnapshot: string | null;
  shipToName: string | null;
  shipToPhone: string | null;

  createdAt: string;
  updatedAt: string;

  _count: { items: number };
};

type OrderItem = {
  id: string;
  productId: string;
  variantId: string | null;
  qty: number;
  qtyReserved: number;
  qtyShipped: number;
  qtyReturned: number;

  unitPriceCents: number;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;

  skuSnapshot: string | null;
  productNameSnapshot: string | null;
  variantNameSnapshot: string | null;
};

type OrderDetail = OrderListRow & {
  notes: string | null;
  carrier: string | null;
  trackingCode: string | null;

  shipToAddress1: string | null;
  shipToAddress2: string | null;
  shipToCity: string | null;
  shipToState: string | null;
  shipToPostal: string | null;
  shipToCountry: string | null;

  items: OrderItem[];
};

function fmtMoney(cents: number, ccy: CurrencyCode) {
  if (ccy === "VND") return Math.round(cents / 100).toLocaleString("vi-VN");
  return (cents / 100).toFixed(2);
}

function badgeClassStatus(s: OrderStatus) {
  if (s === "PENDING") return styles.badgeMuted;
  if (s === "CONFIRMED") return styles.badgeInfo;
  if (s === "DELIVERING") return styles.badgeWarn;
  if (s === "DELIVERED") return styles.badgeSuccess;
  if (s === "RETURNED") return styles.badgePurple;
  return styles.badgeDanger;
}

function badgeClassPay(s: PaymentStatus) {
  if (s === "UNPAID") return styles.badgeMuted;
  if (s === "PARTIAL") return styles.badgeWarn;
  if (s === "PAID") return styles.badgeSuccess;
  if (s === "REFUNDED") return styles.badgePurple;
  return styles.badgeDanger;
}

function badgeClassFull(s: FulfillmentStatus) {
  if (s === "UNFULFILLED") return styles.badgeMuted;
  if (s === "PARTIAL") return styles.badgeWarn;
  if (s === "FULFILLED") return styles.badgeSuccess;
  if (s === "RETURNED") return styles.badgePurple;
  return styles.badgeDanger;
}

function idKey(prefix: string, id: string) {
  return `${prefix}:${id}:${Date.now()}`;
}

function channelLabel(channel: SalesChannel) {
  if (channel === "SHOP") return "Shop";
  if (channel === "MARKETPLACE") return "Marketplace";
  return "Wholesale";
}

export default function OrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus | "ALL">("ALL");
  const [channel, setChannel] = useState<SalesChannel | "ALL">("ALL");

  const [loadingList, setLoadingList] = useState(false);
  const [rows, setRows] = useState<OrderListRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string>("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const [editNotes, setEditNotes] = useState("");
  const [editCarrier, setEditCarrier] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editShipName, setEditShipName] = useState("");
  const [editShipPhone, setEditShipPhone] = useState("");
  const [editAddr1, setEditAddr1] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCountry, setEditCountry] = useState("");

  const [returnItemId, setReturnItemId] = useState<string>("");
  const [returnQty, setReturnQty] = useState<number>(1);
  const [returnNote, setReturnNote] = useState<string>("");

  const activeRow = useMemo(() => rows.find((r) => r.id === activeId) || null, [rows, activeId]);

  async function fetchList(reset = true) {
    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status !== "ALL") params.set("status", status);
      if (paymentStatus !== "ALL") params.set("paymentStatus", paymentStatus);
      if (fulfillmentStatus !== "ALL") params.set("fulfillmentStatus", fulfillmentStatus);
      if (channel !== "ALL") params.set("channel", channel);
      params.set("take", "20");
      if (!reset && nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load orders");

      const data: OrderListRow[] = json.data || [];
      const nc: string | null = json.nextCursor ?? null;

      if (reset) {
        setRows(data);
        setNextCursor(nc);

        if (activeId) {
          const stillExists = data.some((x) => x.id === activeId);
          if (!stillExists) {
            setActiveId("");
            setDetail(null);
            setIsInspectorOpen(false);
          }
        }
      } else {
        setRows((prev) => [...prev, ...data]);
        setNextCursor(nc);
      }
    } catch (e: any) {
      alert(e?.message || "Load orders error");
    } finally {
      setLoadingList(false);
    }
  }

  async function fetchDetail(id: string) {
    if (!id) return;
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load order detail");

      const o: OrderDetail = json.data;
      setDetail(o);

      setEditNotes(o.notes || "");
      setEditCarrier(o.carrier || "");
      setEditTracking(o.trackingCode || "");
      setEditShipName(o.shipToName || "");
      setEditShipPhone(o.shipToPhone || "");
      setEditAddr1(o.shipToAddress1 || "");
      setEditCity(o.shipToCity || "");
      setEditCountry(o.shipToCountry || "");

      const firstItem = o.items?.[0]?.id || "";
      setReturnItemId(firstItem);
      setReturnQty(1);
      setReturnNote("");
    } catch (e: any) {
      alert(e?.message || "Load order detail error");
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    fetchList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeId) fetchDetail(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    if (!isInspectorOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsInspectorOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isInspectorOpen]);

  async function saveShippingAndNotes() {
    if (!detail) return;
    try {
      const res = await fetch(`/api/admin/orders/${detail.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          notes: editNotes,
          carrier: editCarrier,
          trackingCode: editTracking,
          shipTo: {
            name: editShipName,
            phone: editShipPhone,
            address1: editAddr1,
            city: editCity,
            country: editCountry,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Save failed");

      await fetchDetail(detail.id);
      await fetchList(true);
    } catch (e: any) {
      alert(e?.message || "Save error");
    }
  }

  async function doConfirm() {
    if (!detail) return;
    try {
      const res = await fetch(`/api/admin/orders/${detail.id}/confirm`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idempotencyKey: idKey("confirm", detail.id) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Confirm failed");
      await fetchDetail(detail.id);
      await fetchList(true);
    } catch (e: any) {
      alert(e?.message || "Confirm error");
    }
  }

  const doShipAll = useCallback(async () => {
    if (!detail) return;
    try {
      const res = await fetch(`/api/admin/orders/${detail.id}/ship`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idempotencyKey: idKey("ship", detail.id) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Ship failed");
      await fetchDetail(detail.id);
      await fetchList(true);
    } catch (e: any) {
      alert(e?.message || "Ship error");
    }
  }, [detail]);

  async function doCancel() {
    if (!detail) return;
    const ok = confirm("Cancel this order?");
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/orders/${detail.id}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idempotencyKey: idKey("cancel", detail.id) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Cancel failed");
      await fetchDetail(detail.id);
      await fetchList(true);
    } catch (e: any) {
      alert(e?.message || "Cancel error");
    }
  }

  async function doReturn() {
    if (!detail) return;
    if (!returnItemId) return alert("Select item to return.");
    const qty = Math.max(1, Math.trunc(Number(returnQty || 0)));

    try {
      const res = await fetch(`/api/admin/orders/${detail.id}/return`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idKey("return", detail.id),
          note: returnNote || "Customer returned",
          items: [{ orderItemId: returnItemId, qty }],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Return failed");
      await fetchDetail(detail.id);
      await fetchList(true);
    } catch (e: any) {
      alert(e?.message || "Return error");
    }
  }

  function clearFilters() {
    setQ("");
    setStatus("ALL");
    setPaymentStatus("ALL");
    setFulfillmentStatus("ALL");
    setChannel("ALL");

    setTimeout(() => {
      fetchList(true);
    }, 0);
  }

  const computedTitle = useMemo(() => {
    if (!activeRow) return "Orders";
    const code = activeRow.number || activeRow.id.slice(0, 8);
    return `Order ${code}`;
  }, [activeRow]);

  const functionKeyActions = useMemo(
    () => ({
      F2: {
        action: doShipAll,
        label: "Ship all",
        icon: "bi-plus-circle",
      },
    }),
    [doShipAll],
  );

  usePageFunctionKeys(functionKeyActions);

  function labelPayment(s: PaymentStatus) {
    if (s === "PAID") return "Paid";
    if (s === "PARTIAL") return "Partially Paid";
    if (s === "REFUNDED") return "Refunded";
    if (s === "CANCELLED") return "Cancelled";
    return "Unpaid";
  }

  function labelFulfillment(s: FulfillmentStatus) {
    if (s === "FULFILLED") return "Fulfilled";
    if (s === "PARTIAL") return "Partially Fulfilled";
    if (s === "RETURNED") return "Returned";
    if (s === "CANCELLED") return "Cancelled";
    return "Unfulfilled";
  }

  function paymentStatusClass(s: PaymentStatus, styles: Record<string, string>) {
    if (s === "PAID") return styles.chipBlue;
    if (s === "PARTIAL") return styles.chipAmber;
    if (s === "REFUNDED") return styles.chipRose;
    if (s === "CANCELLED") return styles.chipGray;
    return styles.chipGray;
  }

  function fulfillmentStatusClass(s: FulfillmentStatus, styles: Record<string, string>) {
    if (s === "FULFILLED") return styles.chipBlue;
    if (s === "PARTIAL") return styles.chipAmber;
    if (s === "RETURNED") return styles.chipRose;
    if (s === "CANCELLED") return styles.chipGray;
    return styles.chipAmber;
  }

  return (
    <div className={styles.page}>
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidePanel}>
            <div className={styles.sideHero}>
              <div className={styles.sideHeroBadge}>
                <i className="bi bi-funnel" />
              </div>
              <div className={styles.sideHeroText}>
                <div className={styles.sidePanelTitle}>Filters</div>
                <div className={styles.sidePanelSub}>Search, channel and quick actions</div>
              </div>
            </div>

            <div className={styles.quickChips}>
              <button className={styles.quickChip} type="button" onClick={() => fetchList(true)}>
                <i className="bi bi-arrow-repeat" />
                Refresh
              </button>
              <button
                className={styles.quickChip}
                type="button"
                onClick={() => {
                  setStatus("PENDING");
                  setTimeout(() => fetchList(true), 0);
                }}
              >
                <i className="bi bi-clock-history" />
                Pending
              </button>
              <button
                className={styles.quickChip}
                type="button"
                onClick={() => {
                  setPaymentStatus("PAID");
                  setTimeout(() => fetchList(true), 0);
                }}
              >
                <i className="bi bi-credit-card" />
                Paid
              </button>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.blockHead}>
                <div className={styles.blockIcon}>
                  <i className="bi bi-search" />
                </div>
                <div>
                  <div className={styles.blockTitle}>Search</div>
                </div>
              </div>

              <div className={styles.searchField}>
                <i className="bi bi-search" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Enter number, customer, SKU..." />
              </div>

              <div className={styles.blockActions}>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => fetchList(true)}
                  disabled={loadingList}
                >
                  <i className="bi bi-funnel" />
                  Apply
                </button>
                <button className={styles.ghostButton} type="button" onClick={clearFilters}>
                  <i className="bi bi-x-lg" />
                  Clear
                </button>
              </div>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.blockHead}>
                <div className={styles.blockIcon}>
                  <i className="bi bi-sliders2" />
                </div>
                <div>
                  <div className={styles.blockTitle}>Order filters</div>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.selectLabel}>Order status</label>
                <div className={styles.selectField}>
                  <i className="bi bi-list-check" />
                  <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "ALL")}>
                    <option value="ALL">All orders</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="DELIVERING">Delivering</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURNED">Returned</option>
                  </select>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.selectLabel}>Payment status</label>
                <div className={styles.selectField}>
                  <i className="bi bi-credit-card-2-front" />
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | "ALL")}
                  >
                    <option value="ALL">All payment</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="PAID">Paid</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.selectLabel}>Fulfillment status</label>
                <div className={styles.selectField}>
                  <i className="bi bi-box-seam" />
                  <select
                    value={fulfillmentStatus}
                    onChange={(e) => setFulfillmentStatus(e.target.value as FulfillmentStatus | "ALL")}
                  >
                    <option value="ALL">All fulfillment</option>
                    <option value="UNFULFILLED">Unfulfilled</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="RETURNED">Returned</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.selectLabel}>Sales channel</label>
                <div className={styles.selectField}>
                  <i className="bi bi-shop" />
                  <select value={channel} onChange={(e) => setChannel(e.target.value as SalesChannel | "ALL")}>
                    <option value="ALL">All channels</option>
                    <option value="SHOP">Shop</option>
                    <option value="MARKETPLACE">Marketplace</option>
                    <option value="WHOLESALE">Wholesale</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.sideStats}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total rows</div>
                <div className={styles.statValue}>{rows.length}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statLabel}>Selected</div>
                <div className={styles.statValue}>{activeId ? "1" : "0"}</div>
              </div>
            </div>

            <div className={styles.helpCard}>
              <div className={styles.helpTitle}>
                <i className="bi bi-lightbulb" />
                Operation flow
              </div>
              <div className={styles.helpText}>
                Confirm → Reserve, Ship → OUT, Cancel → Release, Return → RETURN_IN.
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.center}>
          <div className={styles.ordersCard}>
            <div className={styles.ordersHead}>
              <div className={styles.ordersHeadLeft}>
                <h2 className={styles.ordersTitle}>Orders</h2>
                <p className={styles.ordersSub}>{loadingList ? "Loading orders..." : `${rows.length} order(s)`}</p>
              </div>

              <div className={styles.ordersHeadRight}>
                {nextCursor ? (
                  <button
                    className={styles.headAction}
                    type="button"
                    onClick={() => fetchList(false)}
                    disabled={loadingList}
                  >
                    <i className="bi bi-arrow-down-circle" />
                    Load more
                  </button>
                ) : (
                  <span className={styles.headPill}>
                    <i className="bi bi-check2-circle" />
                    End
                  </span>
                )}
              </div>
            </div>

            <div className={styles.ordersTableWrap}>
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th className={styles.checkboxCol}>
                      <input type="checkbox" />
                    </th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Location</th>
                    <th>Payment Status</th>
                    <th>Date</th>
                    <th>Fulfillment Status</th>
                    <th className={styles.numeric}>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className={styles.emptyStateModern}>
                          <div className={styles.emptyStateIcon}>
                            <i className="bi bi-bag-x" />
                          </div>
                          <div>
                            <div className={styles.emptyStateTitle}>No orders found</div>
                            <div className={styles.emptyStateText}>Try changing filters or create a new order.</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => {
                      const active = r.id === activeId;

                      const orderCode = r.number || r.reference || r.id.slice(0, 8);
                      const customerName = r.customerNameSnapshot || r.shipToName || "Guest customer";
                      const customerPhone = r.customerPhoneSnapshot || r.shipToPhone || "No phone";
                      const location = [detail?.shipToCity, detail?.shipToCountry].filter(Boolean).join(", ") || "—";
                      const dateText = new Date(r.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <tr
                          key={r.id}
                          className={active ? styles.orderRowActive : styles.orderRow}
                          onClick={() => {
                            setActiveId(r.id);
                            setIsInspectorOpen(true);
                          }}
                        >
                          <td className={styles.checkboxCol}>
                            <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                          </td>

                          <td>
                            <div className={styles.orderIdCell}>
                              <div className={styles.orderIdMain}>#{orderCode}</div>
                              <div className={styles.orderIdSub}>{r._count?.items ?? 0} item(s)</div>
                            </div>
                          </td>

                          <td>
                            <div className={styles.customerModern}>
                              <div className={styles.customerAvatar}>{customerName.charAt(0).toUpperCase()}</div>
                              <div className={styles.customerModernBody}>
                                <div className={styles.customerModernName}>{customerName}</div>
                                <div className={styles.customerModernSub}>{customerPhone}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className={styles.locationCell}>
                              <span className={styles.locationText}>
                                {[r.shipToName, r.shipToPhone].filter(Boolean).join(" · ") || "—"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className={`${styles.statusChip} ${paymentStatusClass(r.paymentStatus, styles)}`}>
                              {labelPayment(r.paymentStatus)}
                            </span>
                          </td>

                          <td>
                            <div className={styles.dateCell}>{dateText}</div>
                          </td>

                          <td>
                            <span
                              className={`${styles.statusChip} ${fulfillmentStatusClass(r.fulfillmentStatus, styles)}`}
                            >
                              {labelFulfillment(r.fulfillmentStatus)}
                            </span>
                          </td>

                          <td className={styles.numeric}>
                            <div className={styles.totalCell}>
                              {r.currency} {fmtMoney(r.totalCents, r.currency)}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.ordersFooter}>
              <div className={styles.footerLeft}>
                <button className={styles.footerSelect} type="button">
                  10 Documents
                  <i className="bi bi-chevron-down" />
                </button>
              </div>

              <div className={styles.footerRight}>
                <button className={styles.pageNavBtn} type="button">
                  <i className="bi bi-chevron-left" />
                  Previous
                </button>

                <button className={`${styles.pageBtn} ${styles.pageBtnActive}`} type="button">
                  1
                </button>
                <button className={styles.pageBtn} type="button">
                  2
                </button>
                <button className={styles.pageBtn} type="button">
                  3
                </button>

                <span className={styles.pageDots}>...</span>

                <button className={styles.pageNavBtn} type="button">
                  Next
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isInspectorOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsInspectorOpen(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Order inspector"
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <div className={styles.panelTitle}>{computedTitle}</div>
                <div className={styles.panelSub}>
                  {loadingDetail ? "Loading detail..." : "Shipping · Items · Actions"}
                </div>
              </div>

              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setIsInspectorOpen(false)}
                aria-label="Close inspector"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {!detail ? (
              <div className={styles.emptyInspector}>
                <div className={styles.emptyInspectorIcon}>
                  <i className="bi bi-info-circle" />
                </div>
                <div>
                  <div className={styles.emptyTitle}>Select an order</div>
                  <div className={styles.emptyText}>Choose a row to see details.</div>
                </div>
              </div>
            ) : (
              <div className={styles.modalBody}>
                <div className={styles.summaryTop}>
                  <div>
                    <div className={styles.orderCodeLine}>{detail.number || detail.id.slice(0, 8)}</div>
                    <div className={styles.badges}>
                      <span className={`${styles.badge} ${badgeClassStatus(detail.status)}`}>{detail.status}</span>
                      <span className={`${styles.badge} ${badgeClassPay(detail.paymentStatus)}`}>
                        {detail.paymentStatus}
                      </span>
                      <span className={`${styles.badge} ${badgeClassFull(detail.fulfillmentStatus)}`}>
                        {detail.fulfillmentStatus}
                      </span>
                    </div>
                  </div>

                  <span className={styles.metaPill}>
                    <i className="bi bi-shop" />
                    {channelLabel(detail.channel)}
                  </span>
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Shipping</div>

                  <div className={styles.grid2}>
                    <div>
                      <label className={styles.label}>Ship to name</label>
                      <div className={styles.inputField}>
                        <i className="bi bi-person" />
                        <input
                          value={editShipName}
                          onChange={(e) => setEditShipName(e.target.value)}
                          placeholder="Name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={styles.label}>Phone</label>
                      <div className={styles.inputField}>
                        <i className="bi bi-telephone" />
                        <input
                          value={editShipPhone}
                          onChange={(e) => setEditShipPhone(e.target.value)}
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  </div>

                  <label className={styles.label}>Address</label>
                  <div className={styles.inputField}>
                    <i className="bi bi-geo-alt" />
                    <input
                      value={editAddr1}
                      onChange={(e) => setEditAddr1(e.target.value)}
                      placeholder="Address line"
                    />
                  </div>

                  <div className={styles.grid2}>
                    <div>
                      <label className={styles.label}>City</label>
                      <div className={styles.inputField}>
                        <i className="bi bi-building" />
                        <input value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="City" />
                      </div>
                    </div>

                    <div>
                      <label className={styles.label}>Country</label>
                      <div className={styles.inputField}>
                        <i className="bi bi-globe" />
                        <input value={editCountry} onChange={(e) => setEditCountry(e.target.value)} placeholder="VN" />
                      </div>
                    </div>
                  </div>

                  <div className={styles.grid2}>
                    <div>
                      <label className={styles.label}>Carrier</label>
                      <div className={styles.inputField}>
                        <i className="bi bi-truck-flatbed" />
                        <input
                          value={editCarrier}
                          onChange={(e) => setEditCarrier(e.target.value)}
                          placeholder="GHN / GHTK..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className={styles.label}>Tracking</label>
                      <div className={styles.inputField}>
                        <i className="bi bi-upc-scan" />
                        <input
                          value={editTracking}
                          onChange={(e) => setEditTracking(e.target.value)}
                          placeholder="Tracking code"
                        />
                      </div>
                    </div>
                  </div>

                  <label className={styles.label}>Notes</label>
                  <textarea
                    className={styles.textarea}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Customer note / internal note..."
                  />

                  <div className={styles.actionRow}>
                    <button className={styles.primaryButton} type="button" onClick={saveShippingAndNotes}>
                      <i className="bi bi-save2" />
                      Save
                    </button>
                    <button className={styles.ghostButton} type="button" onClick={() => fetchDetail(detail.id)}>
                      <i className="bi bi-arrow-counterclockwise" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Items</div>

                  {detail.items.length === 0 ? (
                    <div className={styles.smallEmpty}>No items.</div>
                  ) : (
                    <div className={styles.itemList}>
                      {detail.items.map((it) => {
                        const label = it.productNameSnapshot || "Item";
                        const variant = it.variantNameSnapshot ? ` · ${it.variantNameSnapshot}` : "";
                        const sku = it.skuSnapshot || it.id.slice(0, 6);

                        return (
                          <div key={it.id} className={styles.itemCard}>
                            <div className={styles.itemHeader}>
                              <div className={styles.itemHeader}>
                                <div className={styles.itemName}>
                                  {label}
                                  {variant}
                                </div>
                                <div className={styles.itemSku}>{sku}</div>
                              </div>
                              <span className={styles.metaPill}>x{it.qty}</span>
                            </div>

                            <div className={styles.itemStats}>
                              <div className={styles.kv}>
                                <span>Reserved</span>
                                <strong>{it.qtyReserved}</strong>
                              </div>
                              <div className={styles.kv}>
                                <span>Shipped</span>
                                <strong>{it.qtyShipped}</strong>
                              </div>
                              <div className={styles.kv}>
                                <span>Returned</span>
                                <strong>{it.qtyReturned}</strong>
                              </div>
                              <div className={styles.kv}>
                                <span>Line total</span>
                                <strong>
                                  {detail.currency} {fmtMoney(it.totalCents ?? it.subtotalCents ?? 0, detail.currency)}
                                </strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Actions</div>

                  <div className={styles.actionRow}>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={doConfirm}
                      disabled={detail.status !== "PENDING"}
                    >
                      <i className="bi bi-check2-circle" />
                      Confirm
                    </button>

                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={doShipAll}
                      disabled={detail.status === "CANCELLED"}
                    >
                      <i className="bi bi-truck" />
                      Ship
                    </button>

                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={doCancel}
                      disabled={detail.status === "CANCELLED"}
                    >
                      <i className="bi bi-x-circle" />
                      Cancel
                    </button>
                  </div>

                  <div className={styles.returnCard}>
                    <div className={styles.returnTitle}>
                      <i className="bi bi-arrow-return-left" />
                      Return
                    </div>

                    <div className={styles.selectField}>
                      <i className="bi bi-box-seam" />
                      <select value={returnItemId} onChange={(e) => setReturnItemId(e.target.value)}>
                        {detail.items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {(it.skuSnapshot || it.id.slice(0, 6)) + " · x" + it.qty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.grid2}>
                      <div>
                        <label className={styles.label}>Qty</label>
                        <div className={styles.inputField}>
                          <i className="bi bi-123" />
                          <input
                            type="number"
                            value={returnQty}
                            onChange={(e) => setReturnQty(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={styles.label}>Note</label>
                        <div className={styles.inputField}>
                          <i className="bi bi-chat-left-text" />
                          <input
                            value={returnNote}
                            onChange={(e) => setReturnNote(e.target.value)}
                            placeholder="Reason..."
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      className={styles.ghostButton}
                      type="button"
                      onClick={doReturn}
                      disabled={detail.status === "CANCELLED"}
                    >
                      <i className="bi bi-arrow-return-left" />
                      Submit return
                    </button>
                  </div>
                </div>

                <div className={styles.totalCard}>
                  <div className={styles.totalRow}>
                    <span>Subtotal</span>
                    <strong>
                      {detail.currency} {fmtMoney(detail.subtotalCents, detail.currency)}
                    </strong>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Shipping</span>
                    <strong>
                      {detail.currency} {fmtMoney(detail.shippingCents, detail.currency)}
                    </strong>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <strong>
                      {detail.currency} {fmtMoney(detail.totalCents, detail.currency)}
                    </strong>
                  </div>
                </div>

                <div className={styles.bottomHint}>
                  <i className="bi bi-shield-check" />
                  <span>Pro tip: Confirm để reserve, Ship tạo OUT movement, Return tạo RETURN_IN.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

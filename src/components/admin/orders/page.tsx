"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/orders/orders.module.css";

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

function safeStr(v: any) {
  return typeof v === "string" ? v : "";
}

function badgeClassStatus(s: OrderStatus) {
  if (s === "PENDING") return "off";
  if (s === "CONFIRMED") return "info";
  if (s === "DELIVERING") return "warn";
  if (s === "DELIVERED") return "ok";
  if (s === "RETURNED") return "violet";
  return "bad";
}

function badgeClassPay(s: PaymentStatus) {
  if (s === "UNPAID") return "off";
  if (s === "PARTIAL") return "warn";
  if (s === "PAID") return "ok";
  if (s === "REFUNDED") return "violet";
  return "bad";
}

function badgeClassFull(s: FulfillmentStatus) {
  if (s === "UNFULFILLED") return "off";
  if (s === "PARTIAL") return "warn";
  if (s === "FULFILLED") return "ok";
  if (s === "RETURNED") return "violet";
  return "bad";
}

function idKey(prefix: string, id: string) {
  return `${prefix}:${id}:${Date.now()}`;
}

export default function OrdersPage() {
  // Filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus | "ALL">("ALL");
  const [channel, setChannel] = useState<SalesChannel | "ALL">("ALL");

  // List state
  const [loadingList, setLoadingList] = useState(false);
  const [rows, setRows] = useState<OrderListRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Selection + detail
  const [activeId, setActiveId] = useState<string>("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  // Edit fields (shipping / notes)
  const [editNotes, setEditNotes] = useState("");
  const [editCarrier, setEditCarrier] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editShipName, setEditShipName] = useState("");
  const [editShipPhone, setEditShipPhone] = useState("");
  const [editAddr1, setEditAddr1] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCountry, setEditCountry] = useState("");

  // Return modal-lite
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
        const firstId = data[0]?.id || "";
        setActiveId((prev) => (prev ? prev : firstId));
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

      // hydrate edit fields
      setEditNotes(o.notes || "");
      setEditCarrier(o.carrier || "");
      setEditTracking(o.trackingCode || "");
      setEditShipName(o.shipToName || "");
      setEditShipPhone(o.shipToPhone || "");
      setEditAddr1(o.shipToAddress1 || "");
      setEditCity(o.shipToCity || "");
      setEditCountry(o.shipToCountry || "");

      // default return item
      const firstItem = o.items?.[0]?.id || "";
      setReturnItemId((prev) => prev || firstItem);
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

      // refresh detail + list row
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

  async function doShipAll() {
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
  }

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

  const computedTitle = useMemo(() => {
    if (!activeRow) return "Orders";
    const code = activeRow.number || activeRow.id.slice(0, 8);
    return `Order ${code}`;
  }, [activeRow]);

  return (
    <div className={styles.shell}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Orders</div>
            <div className={styles.brandSub}>List · Inspector · Confirm · Ship · Cancel · Return</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={() => fetchList(true)} disabled={loadingList}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
          <button className={styles.primaryBtn} type="button" onClick={doShipAll} disabled={!detail || detail.status === "CANCELLED"}>
            <i className="bi bi-truck" /> Ship all
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar filters */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Filters</div>
            <div className={styles.sidebarHint}>Search & statuses</div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-search" /> Search
            </div>
            <div className={styles.searchWrap}>
              <i className="bi bi-search" />
              <input className={styles.searchInput} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number, customer, SKU..." />
            </div>
            <div className={styles.inlineActions}>
              <button className={styles.primaryBtn} type="button" onClick={() => fetchList(true)} disabled={loadingList}>
                <i className="bi bi-funnel" /> Apply
              </button>
              <button
                className={styles.ghostBtn}
                type="button"
                onClick={() => {
                  setQ("");
                  setStatus("ALL");
                  setPaymentStatus("ALL");
                  setFulfillmentStatus("ALL");
                  setChannel("ALL");
                  setTimeout(() => fetchList(true), 0);
                }}>
                <i className="bi bi-x-lg" /> Clear
              </button>
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-activity" /> Order
            </div>
            <div className={styles.selectWrap}>
              <i className="bi bi-list-check" />
              <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="DELIVERING">Delivering</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>

            <div className={styles.selectWrap}>
              <i className="bi bi-credit-card" />
              <select className={styles.select} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)}>
                <option value="ALL">All payment</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className={styles.selectWrap}>
              <i className="bi bi-box-seam" />
              <select className={styles.select} value={fulfillmentStatus} onChange={(e) => setFulfillmentStatus(e.target.value as any)}>
                <option value="ALL">All fulfillment</option>
                <option value="UNFULFILLED">Unfulfilled</option>
                <option value="PARTIAL">Partial</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="RETURNED">Returned</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className={styles.selectWrap}>
              <i className="bi bi-shop" />
              <select className={styles.select} value={channel} onChange={(e) => setChannel(e.target.value as any)}>
                <option value="ALL">All channels</option>
                <option value="SHOP">Shop</option>
                <option value="MARKETPLACE">Marketplace</option>
                <option value="WHOLESALE">Wholesale</option>
              </select>
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.miniStat}>
              <span>Total rows</span>
              <span className={styles.mono}>{rows.length}</span>
            </div>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>Confirm → Reserve, Ship → OUT, Cancel → Release, Return → RETURN_IN.</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.content}>
            {/* List */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Order list</div>
                  <div className={styles.panelSub}>{loadingList ? "Loading..." : "Click a row to inspect."}</div>
                </div>
                <div className={styles.headerRight}>
                  {nextCursor ? (
                    <button className={styles.ghostBtn} type="button" onClick={() => fetchList(false)} disabled={loadingList}>
                      <i className="bi bi-chevron-double-down" /> Load more
                    </button>
                  ) : (
                    <span className={styles.mutedPill}>
                      <i className="bi bi-check2-circle" /> End
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Badges</th>
                      <th className={styles.thNum}>Items</th>
                      <th className={styles.thNum}>Total</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className={styles.emptyRow}>
                            <i className="bi bi-inbox" />
                            <div>
                              <div className={styles.emptyTitle}>No orders</div>
                              <div className={styles.emptyText}>Try filters or create orders.</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => {
                        const active = r.id === activeId;
                        const code = r.number || r.id.slice(0, 8);
                        const customer = r.customerNameSnapshot || r.shipToName || "—";
                        const phone = r.customerPhoneSnapshot || r.shipToPhone || "";
                        return (
                          <tr key={r.id} className={`${styles.tr} ${active ? styles.trActive : ""}`} onClick={() => setActiveId(r.id)} role="button">
                            <td className={styles.mono}>
                              <div className={styles.cellMain}>
                                <div className={styles.cellTitle}>
                                  <i className="bi bi-receipt" /> {code}
                                </div>
                                <div className={styles.cellSub}>
                                  <span className={styles.subPill}>
                                    <i className="bi bi-shop" /> {r.channel}
                                  </span>
                                  <span className={styles.subPill}>
                                    <i className="bi bi-link-45deg" /> {r.reference || "—"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className={styles.cellMain}>
                                <div className={styles.cellTitle}>
                                  <i className="bi bi-person" /> {customer}
                                </div>
                                <div className={styles.cellSub}>
                                  <span className={styles.mono}>{phone || ""}</span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className={styles.badgeRow}>
                                <span className={`${styles.badge} ${styles[badgeClassStatus(r.status)]}`}>
                                  <i className="bi bi-activity" /> {r.status}
                                </span>
                                <span className={`${styles.badge} ${styles[badgeClassPay(r.paymentStatus)]}`}>
                                  <i className="bi bi-credit-card" /> {r.paymentStatus}
                                </span>
                                <span className={`${styles.badge} ${styles[badgeClassFull(r.fulfillmentStatus)]}`}>
                                  <i className="bi bi-box-seam" /> {r.fulfillmentStatus}
                                </span>
                              </div>
                            </td>

                            <td className={`${styles.tdNum} ${styles.mono}`}>{r._count?.items ?? 0}</td>

                            <td className={`${styles.tdNum} ${styles.mono}`}>
                              {r.currency} {fmtMoney(r.totalCents, r.currency)}
                            </td>

                            <td className={styles.mono}>{new Date(r.updatedAt).toLocaleString()}</td>
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
                    <div className={styles.panelTitle}>{computedTitle}</div>
                    <div className={styles.panelSub}>{loadingDetail ? "Loading detail..." : "Shipping · Items · Actions"}</div>
                  </div>
                </div>

                {!detail ? (
                  <div className={styles.panelBody}>
                    <div className={styles.emptyInspector}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.emptyTitle}>Select an order</div>
                        <div className={styles.emptyText}>Choose a row to see details.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    {/* Quick badges */}
                    <div className={styles.headerRow}>
                      <div className={styles.headLeft}>
                        <div className={styles.headCode}>
                          <i className="bi bi-receipt" /> {detail.number || detail.id.slice(0, 8)}
                        </div>
                        <div className={styles.headMeta}>
                          <span className={`${styles.badge} ${styles[badgeClassStatus(detail.status)]}`}>
                            <i className="bi bi-activity" /> {detail.status}
                          </span>
                          <span className={`${styles.badge} ${styles[badgeClassPay(detail.paymentStatus)]}`}>
                            <i className="bi bi-credit-card" /> {detail.paymentStatus}
                          </span>
                          <span className={`${styles.badge} ${styles[badgeClassFull(detail.fulfillmentStatus)]}`}>
                            <i className="bi bi-box-seam" /> {detail.fulfillmentStatus}
                          </span>
                        </div>
                      </div>

                      <span className={styles.mutedPill}>
                        <i className="bi bi-shop" /> {detail.channel}
                      </span>
                    </div>

                    {/* Shipping edit */}
                    <div className={styles.sectionTitle}>
                      <i className="bi bi-truck" /> Shipping
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Ship to name</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-person" />
                          <input className={styles.input} value={editShipName} onChange={(e) => setEditShipName(e.target.value)} placeholder="Name" />
                        </div>
                      </div>
                      <div>
                        <label className={styles.label}>Phone</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-telephone" />
                          <input className={styles.input} value={editShipPhone} onChange={(e) => setEditShipPhone(e.target.value)} placeholder="Phone" />
                        </div>
                      </div>
                    </div>

                    <label className={styles.label}>Address</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-geo-alt" />
                      <input className={styles.input} value={editAddr1} onChange={(e) => setEditAddr1(e.target.value)} placeholder="Address line" />
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>City</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-building" />
                          <input className={styles.input} value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="City" />
                        </div>
                      </div>
                      <div>
                        <label className={styles.label}>Country</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-globe" />
                          <input className={styles.input} value={editCountry} onChange={(e) => setEditCountry(e.target.value)} placeholder="VN" />
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Carrier</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-truck-flatbed" />
                          <input className={styles.input} value={editCarrier} onChange={(e) => setEditCarrier(e.target.value)} placeholder="GHN / GHTK..." />
                        </div>
                      </div>
                      <div>
                        <label className={styles.label}>Tracking</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-upc-scan" />
                          <input className={styles.input} value={editTracking} onChange={(e) => setEditTracking(e.target.value)} placeholder="Tracking code" />
                        </div>
                      </div>
                    </div>

                    <label className={styles.label}>Notes</label>
                    <textarea className={styles.textarea} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Customer note / internal note..." />

                    <div className={styles.actions}>
                      <button className={styles.primaryBtn} type="button" onClick={saveShippingAndNotes}>
                        <i className="bi bi-save2" /> Save
                      </button>
                      <button className={styles.ghostBtn} type="button" onClick={() => fetchDetail(detail.id)}>
                        <i className="bi bi-arrow-counterclockwise" /> Reset
                      </button>
                    </div>

                    <div className={styles.hr} />

                    {/* Items */}
                    <div className={styles.sectionTitle}>
                      <i className="bi bi-list-check" /> Items
                    </div>

                    {detail.items.length === 0 ? (
                      <div className={styles.emptySmall}>No items.</div>
                    ) : (
                      <div className={styles.items}>
                        {detail.items.map((it) => {
                          const label = it.productNameSnapshot || "Item";
                          const v = it.variantNameSnapshot ? ` · ${it.variantNameSnapshot}` : "";
                          const sku = it.skuSnapshot || it.id.slice(0, 6);
                          return (
                            <div key={it.id} className={styles.itemCard}>
                              <div className={styles.itemTop}>
                                <div className={styles.itemMain}>
                                  <div className={styles.itemName}>
                                    <i className="bi bi-box" /> {label}
                                    {v}
                                  </div>
                                  <div className={styles.itemSku}>
                                    <span className={styles.mono}>{sku}</span>
                                  </div>
                                </div>
                                <span className={styles.mutedPill}>
                                  <i className="bi bi-hash" /> x{it.qty}
                                </span>
                              </div>

                              <div className={styles.itemGrid}>
                                <div className={styles.kv}>
                                  <span className={styles.k}>Reserved</span>
                                  <span className={styles.mono}>{it.qtyReserved}</span>
                                </div>
                                <div className={styles.kv}>
                                  <span className={styles.k}>Shipped</span>
                                  <span className={styles.mono}>{it.qtyShipped}</span>
                                </div>
                                <div className={styles.kv}>
                                  <span className={styles.k}>Returned</span>
                                  <span className={styles.mono}>{it.qtyReturned}</span>
                                </div>
                                <div className={styles.kv}>
                                  <span className={styles.k}>Line total</span>
                                  <span className={styles.mono}>
                                    {detail.currency} {fmtMoney(it.totalCents ?? it.subtotalCents ?? 0, detail.currency)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className={styles.hr} />

                    {/* Actions */}
                    <div className={styles.sectionTitle}>
                      <i className="bi bi-lightning" /> Actions
                    </div>

                    <div className={styles.actions}>
                      <button className={styles.primaryBtn} type="button" onClick={doConfirm} disabled={detail.status !== "PENDING"}>
                        <i className="bi bi-check2-circle" /> Confirm
                      </button>

                      <button className={styles.primaryBtn} type="button" onClick={doShipAll} disabled={detail.status === "CANCELLED"}>
                        <i className="bi bi-truck" /> Ship
                      </button>

                      <button className={`${styles.ghostBtn} ${styles.dangerGhost}`} type="button" onClick={doCancel} disabled={detail.status === "CANCELLED"}>
                        <i className="bi bi-x-circle" /> Cancel
                      </button>
                    </div>

                    <div className={styles.returnBox}>
                      <div className={styles.returnTitle}>
                        <i className="bi bi-arrow-return-left" /> Return
                      </div>

                      <div className={styles.selectWrap}>
                        <i className="bi bi-box-seam" />
                        <select className={styles.select} value={returnItemId} onChange={(e) => setReturnItemId(e.target.value)}>
                          {detail.items.map((it) => (
                            <option key={it.id} value={it.id}>
                              {(it.skuSnapshot || it.id.slice(0, 6)) + " · x" + it.qty}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.twoCols}>
                        <div>
                          <label className={styles.label}>Qty</label>
                          <div className={styles.inputWrap}>
                            <i className="bi bi-123" />
                            <input className={styles.input} type="number" value={returnQty} onChange={(e) => setReturnQty(Number(e.target.value))} />
                          </div>
                        </div>
                        <div>
                          <label className={styles.label}>Note</label>
                          <div className={styles.inputWrap}>
                            <i className="bi bi-chat-left-text" />
                            <input className={styles.input} value={returnNote} onChange={(e) => setReturnNote(e.target.value)} placeholder="Reason..." />
                          </div>
                        </div>
                      </div>

                      <button className={styles.ghostBtn} type="button" onClick={doReturn} disabled={detail.status === "CANCELLED"}>
                        <i className="bi bi-arrow-return-left" /> Submit return
                      </button>
                    </div>

                    {/* Summary */}
                    <div className={styles.summaryBox}>
                      <div className={styles.summaryLine}>
                        <span>Subtotal</span>
                        <span className={styles.mono}>
                          {detail.currency} {fmtMoney(detail.subtotalCents, detail.currency)}
                        </span>
                      </div>
                      <div className={styles.summaryLine}>
                        <span>Shipping</span>
                        <span className={styles.mono}>
                          {detail.currency} {fmtMoney(detail.shippingCents, detail.currency)}
                        </span>
                      </div>
                      <div className={styles.summaryLine}>
                        <span>Total</span>
                        <span className={styles.mono}>
                          {detail.currency} {fmtMoney(detail.totalCents, detail.currency)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.tipInline}>
                      <i className="bi bi-shield-check" />
                      <span>Pro tip: Confirm để reserve, Ship tạo OUT movement, Return tạo RETURN_IN.</span>
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

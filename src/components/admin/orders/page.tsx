"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/orders/orders.module.css";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERING" | "DELIVERED" | "CANCELLED" | "RETURNED";
type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
type SalesChannel = "SHOP" | "MARKETPLACE" | "WHOLESALE";

type OrderItem = {
  id: string;
  sku: string;
  name: string;
  qty: number;
  unitPriceCents: number;
};

type Address = {
  fullName: string;
  phone: string;
  line1: string;
  ward?: string;
  district?: string;
  city: string;
  country: string;
};

type OrderRow = {
  id: string;
  number: string; // ORD-1001
  channel: SalesChannel;
  status: OrderStatus;

  paymentStatus: PaymentStatus;
  paymentMethod: "CARD" | "BANK" | "CASH" | "EWALLET" | "COD";

  customerEmail: string;
  customerName: string;

  items: OrderItem[];

  shippingAddress: Address;
  note?: string;

  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;

  createdAt: string;
  updatedAt: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function nowIso() {
  return new Date().toISOString();
}

function cents(n: number) {
  return Math.max(0, Math.trunc(Number(n || 0)));
}

function fmtMoney(centsValue: number, currency = "USD") {
  if (currency === "VND") return Math.round(centsValue / 100).toLocaleString("vi-VN");
  return (centsValue / 100).toFixed(2);
}

function badgeClassStatus(s: OrderStatus) {
  if (s === "PENDING") return "warn";
  if (s === "CONFIRMED") return "info";
  if (s === "DELIVERING") return "info2";
  if (s === "DELIVERED") return "ok";
  if (s === "RETURNED") return "off";
  return "bad";
}

function badgeClassPay(s: PaymentStatus) {
  if (s === "PAID") return "ok";
  if (s === "REFUNDED") return "off";
  return "warn";
}

function channelLabel(c: SalesChannel) {
  if (c === "SHOP") return "Shop";
  if (c === "MARKETPLACE") return "Marketplace";
  return "Wholesale";
}

export default function OrdersPage() {
  const [channels] = useState<{ id: "all" | SalesChannel; name: string; icon: string }[]>(() => [
    { id: "all", name: "All channels", icon: "bi-grid-1x2" },
    { id: "SHOP", name: "Shop", icon: "bi-bag" },
    { id: "MARKETPLACE", name: "Marketplace", icon: "bi-shop" },
    { id: "WHOLESALE", name: "Wholesale", icon: "bi-building" },
  ]);

  const [activeChannel, setActiveChannel] = useState<"all" | SalesChannel>("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [payFilter, setPayFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [q, setQ] = useState("");

  const [orders, setOrders] = useState<OrderRow[]>(() => {
    const seed: OrderRow[] = [
      {
        id: uid(),
        number: "ORD-1051",
        channel: "SHOP",
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: "COD",
        customerEmail: "linh@example.com",
        customerName: "Linh Nguyen",
        items: [
          { id: uid(), sku: "TSHIRT-RED-M", name: "T-Shirt Classic — Red / M", qty: 2, unitPriceCents: 1500 },
          { id: uid(), sku: "BAG-DEFAULT", name: "Backpack Urban — Default", qty: 1, unitPriceCents: 4500 },
        ],
        shippingAddress: {
          fullName: "Linh Nguyen",
          phone: "0900 000 111",
          line1: "12 Nguyen Trai",
          district: "District 1",
          city: "Ho Chi Minh City",
          country: "VN",
        },
        note: "Call before delivery",
        subtotalCents: 2 * 1500 + 1 * 4500,
        shippingCents: 500,
        discountCents: 0,
        totalCents: 2 * 1500 + 1 * 4500 + 500,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: uid(),
        number: "ORD-1050",
        channel: "MARKETPLACE",
        status: "DELIVERING",
        paymentStatus: "PAID",
        paymentMethod: "CARD",
        customerEmail: "minh@example.com",
        customerName: "Minh Tran",
        items: [{ id: uid(), sku: "SNEAK-41", name: "Sneakers Runner — 41", qty: 1, unitPriceCents: 8900 }],
        shippingAddress: {
          fullName: "Minh Tran",
          phone: "0911 222 333",
          line1: "88 Le Loi",
          district: "Hai Chau",
          city: "Da Nang",
          country: "VN",
        },
        note: "",
        subtotalCents: 8900,
        shippingCents: 0,
        discountCents: 500,
        totalCents: 8400,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        updatedAt: nowIso(),
      },
      {
        id: uid(),
        number: "ORD-1049",
        channel: "SHOP",
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentMethod: "BANK",
        customerEmail: "hoa@example.com",
        customerName: "Hoa Pham",
        items: [{ id: uid(), sku: "TSHIRT-BLACK-L", name: "T-Shirt Classic — Black / L", qty: 3, unitPriceCents: 1500 }],
        shippingAddress: {
          fullName: "Hoa Pham",
          phone: "0988 777 666",
          line1: "5 Tran Hung Dao",
          district: "Hoan Kiem",
          city: "Ha Noi",
          country: "VN",
        },
        note: "Gift wrap",
        subtotalCents: 3 * 1500,
        shippingCents: 400,
        discountCents: 0,
        totalCents: 3 * 1500 + 400,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
        updatedAt: nowIso(),
      },
      {
        id: uid(),
        number: "ORD-1048",
        channel: "WHOLESALE",
        status: "DELIVERED",
        paymentStatus: "PAID",
        paymentMethod: "BANK",
        customerEmail: "buyer@company.test",
        customerName: "ACME Buyer",
        items: [
          { id: uid(), sku: "TSHIRT-WHITE-S", name: "T-Shirt Classic — White / S", qty: 50, unitPriceCents: 900 },
          { id: uid(), sku: "TSHIRT-RED-M", name: "T-Shirt Classic — Red / M", qty: 50, unitPriceCents: 900 },
        ],
        shippingAddress: {
          fullName: "ACME Buyer",
          phone: "028 1234 5678",
          line1: "Industrial Zone 1",
          city: "Ho Chi Minh City",
          country: "VN",
        },
        note: "Invoice required",
        subtotalCents: 100 * 900,
        shippingCents: 0,
        discountCents: 5000,
        totalCents: 100 * 900 - 5000,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
        updatedAt: nowIso(),
      },
    ];

    return seed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders
      .filter((o) => (activeChannel === "all" ? true : o.channel === activeChannel))
      .filter((o) => (statusFilter === "ALL" ? true : o.status === statusFilter))
      .filter((o) => (payFilter === "ALL" ? true : o.paymentStatus === payFilter))
      .filter((o) => {
        if (!qq) return true;
        const hay = `${o.number} ${o.customerName} ${o.customerEmail} ${o.items.map((i) => i.sku + " " + i.name).join(" ")} ${o.paymentMethod}`.toLowerCase();
        return hay.includes(qq);
      })
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, activeChannel, statusFilter, payFilter, q]);

  const [activeId, setActiveId] = useState<string>(() => visible[0]?.id || orders[0]?.id || "");
  const active = useMemo(() => orders.find((o) => o.id === activeId) || null, [orders, activeId]);

  function patchOrder(id: string, patch: Partial<OrderRow>) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: nowIso() } : o)));
  }

  function recomputeTotals(o: OrderRow) {
    const subtotal = o.items.reduce((s, it) => s + it.qty * it.unitPriceCents, 0);
    const total = subtotal + o.shippingCents - o.discountCents;
    return { ...o, subtotalCents: subtotal, totalCents: Math.max(0, total) };
  }

  // actions (demo transitions)
  function doAction(action: "CONFIRM" | "SHIP" | "DELIVER" | "CANCEL" | "REFUND") {
    if (!active) return;

    if (action === "CONFIRM") {
      if (active.status !== "PENDING") return;
      patchOrder(active.id, { status: "CONFIRMED" });
      return;
    }
    if (action === "SHIP") {
      if (active.status !== "CONFIRMED") return;
      patchOrder(active.id, { status: "DELIVERING" });
      return;
    }
    if (action === "DELIVER") {
      if (active.status !== "DELIVERING") return;
      patchOrder(active.id, { status: "DELIVERED" });
      return;
    }
    if (action === "CANCEL") {
      if (active.status === "DELIVERED") return alert("Delivered orders can’t be cancelled (demo rule).");
      patchOrder(active.id, { status: "CANCELLED" });
      return;
    }
    if (action === "REFUND") {
      if (active.paymentStatus !== "PAID") return;
      patchOrder(active.id, { paymentStatus: "REFUNDED" });
      return;
    }
  }

  const stats = useMemo(() => {
    const list = orders.filter((o) => (activeChannel === "all" ? true : o.channel === activeChannel));
    const pending = list.filter((o) => o.status === "PENDING").length;
    const delivering = list.filter((o) => o.status === "DELIVERING").length;
    const paid = list.filter((o) => o.paymentStatus === "PAID").length;
    const revenue = list.reduce((s, o) => (o.paymentStatus === "PAID" ? s + o.totalCents : s), 0);
    return { pending, delivering, paid, revenue };
  }, [orders, activeChannel]);

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Orders</div>
            <div className={styles.brandSub}>Status · Payment · Shipping · Actions</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={() => alert("Demo only. Wire export to CSV.")}>
            <i className="bi bi-download" /> Export
          </button>
          <button className={styles.primaryBtn} type="button" onClick={() => alert("Demo only. Wire create order flow.")}>
            <i className="bi bi-plus-lg" /> Create
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Filters</div>
            <div className={styles.sidebarHint}>Channel, status, payment</div>
          </div>

          <div className={styles.channelList}>
            {channels.map((c) => {
              const active = c.id === activeChannel;
              return (
                <button key={c.id} type="button" className={`${styles.channelBtn} ${active ? styles.channelActive : ""}`} onClick={() => setActiveChannel(c.id)}>
                  <div className={styles.channelLeft}>
                    <span className={`${styles.dot} ${active ? styles.dotHot : ""}`} />
                    <div className={styles.channelText}>
                      <div className={styles.channelName}>
                        <i className={`bi ${c.icon}`} /> {c.name}
                      </div>
                      <div className={styles.channelMeta}>
                        <span className={styles.mono}>{c.id === "all" ? "ALL" : c.id}</span>
                      </div>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right" />
                </button>
              );
            })}
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-funnel" /> Status
            </div>
            <div className={styles.pillGrid}>
              {(["ALL", "PENDING", "CONFIRMED", "DELIVERING", "DELIVERED", "CANCELLED", "RETURNED"] as const).map((s) => (
                <button key={s} type="button" className={`${styles.pill} ${statusFilter === s ? styles.pillOn : ""}`} onClick={() => setStatusFilter(s)}>
                  <i className="bi bi-lightning" /> {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-credit-card" /> Payment
            </div>
            <div className={styles.pillGrid}>
              {(["ALL", "PAID", "UNPAID", "REFUNDED"] as const).map((s) => (
                <button key={s} type="button" className={`${styles.pill} ${payFilter === s ? styles.pillOn : ""}`} onClick={() => setPayFilter(s)}>
                  <i className="bi bi-cash-stack" /> {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Pending</div>
                <div className={styles.statValue}>{stats.pending}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Delivering</div>
                <div className={styles.statValue}>{stats.delivering}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Paid</div>
                <div className={styles.statValue}>{stats.paid}</div>
              </div>
            </div>

            <div className={styles.tip}>
              <i className="bi bi-graph-up" />
              <span>
                Paid revenue: <span className={styles.mono}>USD {fmtMoney(stats.revenue, "USD")}</span>
              </span>
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
                  <div className={styles.panelTitle}>Orders table</div>
                  <div className={styles.panelSub}>Search order #, customer, SKU</div>
                </div>
              </div>

              <div className={styles.toolbar}>
                <div className={styles.searchWrapInline}>
                  <i className="bi bi-search" />
                  <input className={styles.searchInline} placeholder="Search orders..." value={q} onChange={(e) => setQ(e.target.value)} />
                </div>

                <button className={styles.ghostBtn} type="button" onClick={() => setQ("")}>
                  <i className="bi bi-x-lg" /> Clear
                </button>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Channel</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th className={styles.thNum}>Total</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className={styles.emptyRow}>
                            <i className="bi bi-inbox" />
                            <div>
                              <div className={styles.emptyTitle}>No orders</div>
                              <div className={styles.emptyText}>Try a different filter.</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visible.map((o) => {
                        const active = o.id === activeId;
                        return (
                          <tr key={o.id} className={`${styles.tr} ${active ? styles.trActive : ""}`} onClick={() => setActiveId(o.id)} role="button">
                            <td className={styles.mono}>
                              <div className={styles.orderCell}>
                                <div className={styles.orderNumber}>{o.number}</div>
                                <div className={styles.sub}>
                                  {o.items.length} item(s) · {o.paymentMethod}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className={styles.customerCell}>
                                <div className={styles.customerName}>{o.customerName}</div>
                                <div className={styles.sub}>{o.customerEmail}</div>
                              </div>
                            </td>
                            <td>{channelLabel(o.channel)}</td>
                            <td>
                              <span className={`${styles.badge} ${styles[badgeClassStatus(o.status)]}`}>
                                <i className="bi bi-circle-fill" /> {o.status}
                              </span>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${styles[badgeClassPay(o.paymentStatus)]}`}>
                                <i className="bi bi-credit-card" /> {o.paymentStatus}
                              </span>
                            </td>
                            <td className={`${styles.thNum} ${styles.mono}`}>USD {fmtMoney(o.totalCents, "USD")}</td>
                            <td className={styles.mono}>{new Date(o.createdAt).toLocaleString()}</td>
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
                    <div className={styles.panelSub}>Details & actions</div>
                  </div>
                </div>

                {!active ? (
                  <div className={styles.panelBody}>
                    <div className={styles.emptyInspector}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.emptyTitle}>Select an order</div>
                        <div className={styles.emptyText}>Click a row to view details.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    <div className={styles.headerRow}>
                      <div>
                        <div className={styles.headTitle}>{active.number}</div>
                        <div className={styles.headMeta}>
                          <span className={styles.badgeMini}>
                            <i className="bi bi-person" /> {active.customerName}
                          </span>
                          <span className={styles.badgeMini}>
                            <i className="bi bi-bag" /> {channelLabel(active.channel)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.badgeStack}>
                        <span className={`${styles.badge} ${styles[badgeClassStatus(active.status)]}`}>
                          <i className="bi bi-circle-fill" /> {active.status}
                        </span>
                        <span className={`${styles.badge} ${styles[badgeClassPay(active.paymentStatus)]}`}>
                          <i className="bi bi-credit-card" /> {active.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-basket" /> Items
                    </div>

                    <div className={styles.items}>
                      {active.items.map((it) => (
                        <div key={it.id} className={styles.itemRow}>
                          <div className={styles.itemLeft}>
                            <div className={styles.itemName}>{it.name}</div>
                            <div className={styles.sub}>
                              <span className={styles.mono}>{it.sku}</span> · Qty <span className={styles.mono}>{it.qty}</span>
                            </div>
                          </div>
                          <div className={`${styles.itemRight} ${styles.mono}`}>USD {fmtMoney(it.qty * it.unitPriceCents, "USD")}</div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-truck" /> Shipping
                    </div>

                    <div className={styles.card}>
                      <div className={styles.cardLine}>
                        <span>Name</span>
                        <span className={styles.mono}>{active.shippingAddress.fullName}</span>
                      </div>
                      <div className={styles.cardLine}>
                        <span>Phone</span>
                        <span className={styles.mono}>{active.shippingAddress.phone}</span>
                      </div>
                      <div className={styles.cardLine}>
                        <span>Address</span>
                        <span className={styles.mono}>
                          {active.shippingAddress.line1}
                          {active.shippingAddress.district ? `, ${active.shippingAddress.district}` : ""}, {active.shippingAddress.city} · {active.shippingAddress.country}
                        </span>
                      </div>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-receipt" /> Payment & totals
                    </div>

                    <div className={styles.summaryBox}>
                      <div className={styles.summaryLine}>
                        <span>Subtotal</span>
                        <span className={styles.mono}>USD {fmtMoney(active.subtotalCents, "USD")}</span>
                      </div>
                      <div className={styles.summaryLine}>
                        <span>Shipping</span>
                        <span className={styles.mono}>USD {fmtMoney(active.shippingCents, "USD")}</span>
                      </div>
                      <div className={styles.summaryLine}>
                        <span>Discount</span>
                        <span className={styles.mono}>- USD {fmtMoney(active.discountCents, "USD")}</span>
                      </div>
                      <div className={styles.hrSoft} />
                      <div className={styles.summaryLineStrong}>
                        <span>Total</span>
                        <span className={styles.mono}>USD {fmtMoney(active.totalCents, "USD")}</span>
                      </div>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-lightning" /> Actions
                    </div>

                    <div className={styles.actions}>
                      <button className={styles.primaryBtn} type="button" onClick={() => doAction("CONFIRM")} disabled={active.status !== "PENDING"}>
                        <i className="bi bi-check2-circle" /> Confirm
                      </button>

                      <button className={styles.ghostBtn} type="button" onClick={() => doAction("SHIP")} disabled={active.status !== "CONFIRMED"}>
                        <i className="bi bi-truck" /> Ship
                      </button>

                      <button className={styles.ghostBtn} type="button" onClick={() => doAction("DELIVER")} disabled={active.status !== "DELIVERING"}>
                        <i className="bi bi-box-seam" /> Deliver
                      </button>

                      <button className={styles.ghostBtn} type="button" onClick={() => doAction("REFUND")} disabled={active.paymentStatus !== "PAID"}>
                        <i className="bi bi-arrow-counterclockwise" /> Refund
                      </button>

                      <button
                        className={`${styles.ghostBtn} ${styles.dangerGhost}`}
                        type="button"
                        onClick={() => doAction("CANCEL")}
                        disabled={active.status === "DELIVERED" || active.status === "CANCELLED"}>
                        <i className="bi bi-x-circle" /> Cancel
                      </button>
                    </div>

                    <div className={styles.tipInline}>
                      <i className="bi bi-shield-check" />
                      <span>
                        Khi nối DB: Confirm/Ship/Deliver nên tạo audit log + trừ tồn kho theo <span className={styles.mono}>InventoryLedger(SHIP/RESERVE)</span>.
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

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import styles from "@/styles/admin/orders/orders.module.css";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

type OrderStatus = "PENDING" | "CONFIRMED" | "PACKING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

type OrderItem = {
  id: string;
  qty: number;
  totalCents: number;

  productNameSnapshot: string;
  imageSnapshot: string | null;
  skuSnapshot: string | null;
};

type Payment = {
  id: string;
  status: PaymentStatus;
  method: string;
  amountCents: number;
  occurredAt: string;
};

type Fulfillment = {
  id: string;
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
};

type Order = {
  id: string;
  orderNumber: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: string;

  totalCents: number;
  currency: string;

  customerNameSnapshot: string | null;
  customerPhoneSnapshot: string | null;

  createdAt: string;

  items: OrderItem[];
  payments: Payment[];
  fulfillments: Fulfillment[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function OrdersPage() {
  const { currentSite } = useAdminAuth();
  const { t } = useAdminI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      try {
        setLoading(true);

        if (!currentSite?.id) return;

        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          siteId: currentSite.id,
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (status !== "ALL") {
          params.set("status", status);
        }

        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();

        if (!ignore && data.success) {
          setOrders(data.data || []);

          setPagination(
            data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
            },
          );
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    const timeout = setTimeout(() => {
      loadOrders();
    }, 400);

    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [page, search, status, currentSite]);

  async function handleStatusUpdate(orderId: string, nextStatus: OrderStatus) {
    try {
      setUpdatingId(orderId);

      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",

          "x-site-id": currentSite?.id || "",
        },

        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: nextStatus,
                }
              : order,
          ),
        );

        if (selectedOrder?.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: nextStatus,
          });
        }
      }
    } catch (error) {
      console.error("Failed to update order status", error);
    } finally {
      setUpdatingId(null);
    }
  }

  const stats = useMemo(() => {
    const totalOrders = pagination.total;

    const pendingOrders = orders.filter((order) => order.status === "PENDING").length;

    const shippingOrders = orders.filter((order) => order.status === "SHIPPING").length;

    const revenue = orders.reduce((sum, order) => sum + order.totalCents, 0);

    return {
      totalOrders,
      pendingOrders,
      shippingOrders,
      revenue,
    };
  }, [orders, pagination.total]);

  function formatPrice(value: number) {
    return `$${(value / 100).toLocaleString()}`;
  }

  function getStatusClass(status: OrderStatus) {
    switch (status) {
      case "PENDING":
        return styles.pending;

      case "CONFIRMED":
        return styles.confirmed;

      case "PACKING":
        return styles.packing;

      case "SHIPPING":
        return styles.shipping;

      case "DELIVERED":
        return styles.delivered;

      case "CANCELLED":
        return styles.cancelled;

      default:
        return "";
    }
  }

  function getStatusLabel(status: OrderStatus) {
    switch (status) {
      case "PENDING":
        return t("orders.pending");

      case "CONFIRMED":
        return t("orders.confirmed");

      case "PACKING":
        return t("orders.packing");

      case "SHIPPING":
        return t("orders.shipping");

      case "DELIVERED":
        return t("orders.delivered");

      case "CANCELLED":
        return t("orders.cancelled");

      default:
        return status;
    }
  }

  function getPaymentLabel(status: PaymentStatus) {
    switch (status) {
      case "PENDING":
        return t("orders.pending");

      case "PAID":
        return t("orders.paid");

      case "FAILED":
        return t("orders.failed");

      case "REFUNDED":
        return t("orders.refunded");

      default:
        return status;
    }
  }

  function renderNextAction(order: Order) {
    switch (order.status) {
      case "PENDING":
        return (
          <button
            className={styles.actionBtn}
            type="button"
            disabled={updatingId === order.id}
            onClick={(e) => {
              e.stopPropagation();

              handleStatusUpdate(order.id, "CONFIRMED");
            }}
          >
            <i className="bi bi-check2" />
          </button>
        );

      case "CONFIRMED":
        return (
          <button
            className={styles.actionBtn}
            type="button"
            disabled={updatingId === order.id}
            onClick={(e) => {
              e.stopPropagation();

              handleStatusUpdate(order.id, "PACKING");
            }}
          >
            <i className="bi bi-box-seam" />
          </button>
        );

      case "PACKING":
        return (
          <button
            className={styles.actionBtn}
            type="button"
            disabled={updatingId === order.id}
            onClick={(e) => {
              e.stopPropagation();

              handleStatusUpdate(order.id, "SHIPPING");
            }}
          >
            <i className="bi bi-truck" />
          </button>
        );

      case "SHIPPING":
        return (
          <button
            className={styles.actionBtn}
            type="button"
            disabled={updatingId === order.id}
            onClick={(e) => {
              e.stopPropagation();

              handleStatusUpdate(order.id, "DELIVERED");
            }}
          >
            <i className="bi bi-check2-circle" />
          </button>
        );

      default:
        return null;
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageMain}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerBadge}>
              <i className="bi bi-bag-check-fill" />

              {t("orders.dashboard")}
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.liveStatus}>
              <span className={styles.liveDot} />

              {t("orders.liveData")}
            </div>

            <button className={styles.exportBtn} type="button">
              <i className="bi bi-download" />

              {t("orders.exportReport")}
            </button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={`${styles.card} ${styles.blueCard}`}>
            <div className={styles.cardGlow} />
            <div className={styles.cardTop}>
              <span>{t("orders.totalOrders")}</span>
              <div className={styles.iconBlue}>
                <i className="bi bi-bag-check" />
              </div>
            </div>

            <div className={styles.cardFooter}>
              <h2>{stats.totalOrders}</h2>
              <p>
                <i className="bi bi-graph-up-arrow" />
                +12.4%
              </p>
            </div>
          </div>
          <div className={`${styles.card} ${styles.yellowCard}`}>
            <div className={styles.cardGlow} />
            <div className={styles.cardTop}>
              <span>{t("orders.pendingOrders")}</span>
              <div className={styles.iconYellow}>
                <i className="bi bi-clock-history" />
              </div>
            </div>

            <div className={styles.cardFooter}>
              <h2>{stats.pendingOrders}</h2>
              <p>
                <i className="bi bi-exclamation-circle" />
                {t("orders.needsAttention")}
              </p>
            </div>
          </div>

          <div className={`${styles.card} ${styles.purpleCard}`}>
            <div className={styles.cardGlow} />
            <div className={styles.cardTop}>
              <span>{t("orders.shippingOrders")}</span>
              <div className={styles.iconPurple}>
                <i className="bi bi-truck" />
              </div>
            </div>

            <div className={styles.cardFooter}>
              <h2>{stats.shippingOrders}</h2>
              <p>
                <i className="bi bi-box-seam" />
                {t("orders.inDelivery")}
              </p>
            </div>
          </div>

          <div className={`${styles.card} ${styles.greenCard}`}>
            <div className={styles.cardGlow} />
            <div className={styles.cardTop}>
              <span>{t("orders.totalRevenue")}</span>
              <div className={styles.iconGreen}>
                <i className="bi bi-cash-stack" />
              </div>
            </div>

            <div className={styles.cardFooter}>
              <h2>{formatPrice(stats.revenue)}</h2>
              <p>
                <i className="bi bi-currency-dollar" />

                {t("orders.thisMonth")}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div className={styles.searchForm}>
              <div className={styles.searchBox}>
                <i className={`bi bi-search ${styles.searchIcon}`} />
                <input
                  type="text"
                  placeholder={t("orders.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            <div className={styles.filters}>
              {["ALL", "PENDING", "SHIPPING", "DELIVERED", "CANCELLED"].map((item) => (
                <button
                  key={item}
                  className={`${styles.filterBtn} ${status === item ? styles.active : ""}`}
                  onClick={() => {
                    setStatus(item as "ALL" | OrderStatus);

                    setPage(1);
                  }}
                >
                  {item === "ALL" ? t("orders.all") : getStatusLabel(item as OrderStatus)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("orders.order")}</th>
                  <th>{t("orders.customer")}</th>
                  <th>{t("orders.items")}</th>
                  <th>{t("orders.total")}</th>
                  <th>{t("orders.payment")}</th>
                  <th>{t("orders.status")}</th>
                  <th>{t("orders.date")}</th>
                  <th>{t("orders.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={styles.loading}>{t("orders.loadingOrders")}</div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={styles.empty}>{t("orders.noOrdersFound")}</div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className={styles.row} onClick={() => setSelectedOrder(order)}>
                      <td>
                        <div className={styles.orderCell}>
                          <h4>#{order.orderNumber}</h4>
                          <span>
                            {order.items.length} {t("orders.items")}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <h4>{order.customerNameSnapshot || "-"}</h4>
                          <span>{order.customerPhoneSnapshot || "-"}</span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.items}>
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className={styles.item}>
                              <Image
                                src={item.imageSnapshot || "/no-image.png"}
                                alt={item.productNameSnapshot}
                                width={42}
                                height={42}
                              />
                              <span>{item.productNameSnapshot}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td>
                        <strong>{formatPrice(order.totalCents)}</strong>
                      </td>

                      <td>
                        <span className={`${styles.badge} ${styles[order.paymentStatus.toLowerCase()]}`}>
                          {getPaymentLabel(order.paymentStatus)}
                        </span>
                      </td>

                      <td>
                        <span className={`${styles.badge} ${getStatusClass(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>

                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>

                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              setSelectedOrder(order);
                            }}
                          >
                            <i className="bi bi-eye" />
                          </button>
                          {renderNextAction(order)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* =========================================================
              FOOTER
          ========================================================= */}

          <div className={styles.footer}>
            <span>
              {t("orders.showing")} {orders.length} {t("orders.of")} {pagination.total} {t("orders.order")}
            </span>

            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
                <i className="bi bi-chevron-left" />

                {t("orders.prev")}
              </button>

              <button disabled={page >= pagination.totalPages} onClick={() => setPage((prev) => prev + 1)}>
                {t("orders.next")}

                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SIDEBAR
      ========================================================= */}

      <div className={styles.sidebar}>
        {!selectedOrder ? (
          <div className={styles.emptyDetail}>
            <div className={styles.emptyIcon}>
              <i className="bi bi-bag" />
            </div>

            <h3>{t("orders.selectOrder")}</h3>

            <p>{t("orders.selectOrderDescription")}</p>
          </div>
        ) : (
          <div className={styles.orderDetailCard}>
            <div className={styles.detailHeader}>
              <div>
                <h3>#{selectedOrder.orderNumber}</h3>

                <span>{getStatusLabel(selectedOrder.status)}</span>
              </div>

              <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.detailSection}>
              <h4>{t("orders.customer")}</h4>

              <div className={styles.detailInfo}>
                <div>
                  <span>{t("orders.name")}</span>

                  <strong>{selectedOrder.customerNameSnapshot || "-"}</strong>
                </div>

                <div>
                  <span>{t("orders.phone")}</span>

                  <strong>{selectedOrder.customerPhoneSnapshot || "-"}</strong>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>{t("orders.products")}</h4>

              <div className={styles.detailItems}>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className={styles.detailItem}>
                    <Image
                      src={item.imageSnapshot || "/no-image.png"}
                      alt={item.productNameSnapshot}
                      width={56}
                      height={56}
                    />

                    <div>
                      <h5>{item.productNameSnapshot}</h5>

                      <span>
                        {t("orders.qty")}: {item.qty}
                      </span>
                    </div>

                    <strong>{formatPrice(item.totalCents)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>{t("orders.payment")}</h4>

              <div className={styles.paymentBox}>
                <div className={styles.paymentList}>
                  <span>{t("orders.status")}</span>

                  <strong>{getPaymentLabel(selectedOrder.paymentStatus)}</strong>
                </div>

                <div className={styles.paymentList}>
                  <span>{t("orders.total")}</span>

                  <strong>{formatPrice(selectedOrder.totalCents)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>{t("orders.timeline")}</h4>

              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineDot} />

                  <div>
                    <strong>{t("orders.orderCreated")}</strong>

                    <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className={styles.timelineItem}>
                  <div className={styles.timelineDot} />

                  <div>
                    <strong>{t("orders.currentStatus")}</strong>

                    <span>{getStatusLabel(selectedOrder.status)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.detailActions}>
              <button className={styles.cancelBtn}>{t("orders.cancel")}</button>

              <button className={styles.confirmBtn}>{t("orders.updateStatus")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

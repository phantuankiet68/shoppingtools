"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { ArrowLeft, CreditCard, Download, RefreshCcw, Search, ShoppingCart, TrendingUp, Wallet } from "lucide-react";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import styles from "@/styles/admin/payments/payments.module.css";

type Payment = {
  id: string;
  method: string;
  status: string;
  amountCents: number;
  occurredAt: string;
  providerTransactionId?: string | null;

  order?: {
    id: string;
    orderNumber: string;
    paymentStatus: string;
    totalCents: number;
  } | null;
};

type PaymentStats = {
  totalRevenue: number;
  totalTransactions: number;
  paidOrders: number;
  failedOrders: number;
  paymentMethods: Record<string, number>;
};

type Analytics = {
  monthlyRevenue: Record<string, number>;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function PaymentClient() {
  const { t } = useAdminI18n();

  const [payments, setPayments] = useState<Payment[]>([]);

  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    paidOrders: 0,
    failedOrders: 0,
    paymentMethods: {},
  });

  const [analytics, setAnalytics] = useState<Analytics>({
    monthlyRevenue: {},
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const fetchPayments = async (page = pagination.page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (search) {
        params.append("search", search);
      }
      if (status) {
        params.append("status", status);
      }
      if (method) {
        params.append("method", method);
      }
      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!response.ok) {
        throw new Error(t("payments.errors.fetchPayments"));
      }
      const result = await response.json();
      setPayments(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/payments/stats");
      if (!response.ok) {
        throw new Error(t("payments.errors.fetchStats"));
      }
      const result = await response.json();
      setStats(result);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/payments/analytics");
      if (!response.ok) {
        throw new Error(t("payments.errors.fetchAnalytics"));
      }
      const result = await response.json();
      setAnalytics(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPayments(), fetchStats(), fetchAnalytics()]);
    };
    loadData();
  }, []);

  const handleFilter = async () => {
    await fetchPayments(1);
  };
  const handleRefresh = async () => {
    await Promise.all([fetchPayments(), fetchStats(), fetchAnalytics()]);
  };
  const handleConfirmPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/confirm`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(t("payments.errors.confirmPayment"));
      }
      await handleRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefundPayment = async (paymentId: string) => {
    const confirmed = window.confirm(t("payments.confirmRefund"));
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(t("payments.errors.refundPayment"));
      }
      await handleRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = () => {
    window.open("/api/admin/payments/export", "_blank");
  };

  const paymentMethods = useMemo(() => {
    return Object.keys(stats.paymentMethods || {});
  }, [stats.paymentMethods]);

  const salesRatio = useMemo(() => {
    if (stats.totalTransactions === 0) {
      return 0;
    }
    return Math.round((stats.paidOrders / stats.totalTransactions) * 100);
  }, [stats.paidOrders, stats.totalTransactions]);

  const chartData = useMemo(() => {
    const monthKeys = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const monthLabels = [
      t("months.jan"),
      t("months.feb"),
      t("months.mar"),
      t("months.apr"),
      t("months.may"),
      t("months.jun"),
      t("months.jul"),
      t("months.aug"),
      t("months.sep"),
      t("months.oct"),
      t("months.nov"),
      t("months.dec"),
    ];

    return monthKeys.map((key, index) => ({
      label: monthLabels[index],
      value: analytics.monthlyRevenue?.[key] || 0,
    }));
  }, [analytics.monthlyRevenue, t]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loader}></div>

        <p>{t("payments.loading")}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <div className={styles.headerBadge}>
          <CreditCard size={26} />

          <h1 className={styles.title}>{t("payments.title")}</h1>
        </div>

        <div className={styles.filterContainer}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchIcon}>
              <Search size={18} />
            </div>

            <input
              type="text"
              placeholder={t("payments.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterActions}>
            <div className={styles.selectWrapper}>
              <label>{t("payments.status")}</label>

              <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.select}>
                <option value="">{t("payments.allStatus")}</option>

                <option value="SUCCEEDED">SUCCEEDED</option>

                <option value="PENDING">PENDING</option>

                <option value="FAILED">FAILED</option>

                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div className={styles.selectWrapper}>
              <label>{t("payments.method")}</label>

              <select value={method} onChange={(e) => setMethod(e.target.value)} className={styles.select}>
                <option value="">{t("payments.allMethods")}</option>

                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleFilter} className={styles.filterButton}>
              <i className="bi bi-funnel-fill"></i>

              {t("payments.applyFilter")}
            </button>
          </div>
        </div>

        <div className={styles.topbarActions}>
          <button onClick={handleExport} className={styles.exportButton}>
            <Download size={18} />

            {t("payments.exportCsv")}
          </button>

          <button onClick={handleRefresh} className={styles.refreshButton}>
            <RefreshCcw size={18} />

            {t("payments.refresh")}
          </button>

          <Link href="/admin/orders" className={styles.backButton}>
            <ArrowLeft size={18} />

            {t("payments.backOrders")}
          </Link>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.leftSection}>
          <div className={styles.chartCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2>{t("payments.monthlyRevenue")}</h2>

                <p>{t("payments.revenueAnalytics")}</p>
              </div>

              <div className={styles.analyticsBadge}>{t("payments.liveData")}</div>
            </div>

            <div className={styles.chartContainer}>
              {/* Y AXIS */}
              <div className={styles.chartYAxis}>
                <span>1M</span>
                <span>800K</span>
                <span>600K</span>
                <span>400K</span>
                <span>200K</span>
                <span>0</span>
              </div>

              {/* CHART */}
              <div className={styles.chartGrid}>
                {chartData.map((item) => (
                  <div key={item.label} className={styles.chartColumn}>
                    <div className={styles.chartBarWrapper}>
                      <div
                        className={styles.paidBar}
                        style={{
                          height: `${item.value === 0 ? 12 : Math.max(Number(item.value) / 100000, 40)}px`,
                        }}
                      >
                        <span className={styles.chartValue}>₫{Number(item.value).toLocaleString()}</span>
                      </div>
                    </div>

                    <p className={styles.chartLabel}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className={styles.paymentCard}>
            <div className={styles.paymentTableWrapper}>
              <table className={styles.paymentTable}>
                <thead>
                  <tr>
                    <th>{t("payments.order")}</th>
                    <th>{t("payments.method")}</th>
                    <th>{t("payments.status")}</th>
                    <th>{t("payments.amount")}</th>
                    <th>{t("payments.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment.id}>
                        {/* ORDER */}
                        <td>
                          <div className={styles.transactionInfo}>
                            <div className={styles.transactionAvatar}>
                              <i className="bi bi-wallet2"></i>
                            </div>

                            <div>
                              <strong>{payment.order?.orderNumber}</strong>

                              <span>{new Date(payment.occurredAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>

                        {/* METHOD */}
                        <td>
                          <div className={styles.methodBadge}>
                            <i className="bi bi-credit-card"></i>

                            {payment.method}
                          </div>
                        </td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              payment.status === "SUCCEEDED"
                                ? styles.success
                                : payment.status === "REFUNDED" || payment.status === "FAILED"
                                  ? styles.failed
                                  : styles.pending
                            }`}
                          >
                            <span className={styles.statusDot}></span>

                            {payment.status}
                          </span>
                        </td>

                        {/* AMOUNT */}
                        <td>
                          <strong className={styles.amount}>₫{(payment.amountCents / 100).toLocaleString()}</strong>
                        </td>

                        {/* ACTION */}
                        <td>
                          <div className={styles.actionButtons}>
                            {payment.status !== "SUCCEEDED" && (
                              <button onClick={() => handleConfirmPayment(payment.id)} className={styles.confirmBtn}>
                                <i className="bi bi-check-circle-fill"></i>

                                {t("payments.confirm")}
                              </button>
                            )}

                            {payment.status === "SUCCEEDED" && (
                              <button onClick={() => handleRefundPayment(payment.id)} className={styles.refundBtn}>
                                <i className="bi bi-arrow-counterclockwise"></i>

                                {t("payments.refund")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyIcon}>
                            <i className="bi bi-receipt"></i>
                          </div>

                          <h3>{t("payments.noPaymentHistory")}</h3>

                          <p>{t("payments.noPaymentDescription")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className={styles.pagination}>
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchPayments(pagination.page - 1)}
                className={styles.pageButton}
              >
                <i className="bi bi-arrow-left"></i>

                {t("payments.previous")}
              </button>

              <div className={styles.pageInfo}>
                <span>
                  {t("payments.page")}

                  <strong>{pagination.page}</strong>
                </span>

                <div className={styles.pageDivider}></div>

                <span>
                  {t("payments.total")}

                  <strong>{pagination.totalPages}</strong>
                </span>
              </div>

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchPayments(pagination.page + 1)}
                className={styles.pageButton}
              >
                {t("payments.next")}

                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.rightSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statsCard}>
              <div className={`${styles.iconWrapper} ${styles.blue}`}>
                <ShoppingCart size={24} />
              </div>

              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>{t("payments.transactions")}</span>

                <h3 className={styles.cardValue}>{stats.totalTransactions}</h3>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={`${styles.iconWrapper} ${styles.green}`}>
                <Wallet size={24} />
              </div>

              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>{t("payments.revenue")}</span>

                <h3 className={styles.cardValue}>₫{(stats.totalRevenue / 100).toLocaleString()}</h3>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={`${styles.iconWrapper} ${styles.purple}`}>
                <CreditCard size={24} />
              </div>

              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>{t("payments.methods")}</span>

                <h3 className={styles.cardValue}>{paymentMethods.length}</h3>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={`${styles.iconWrapper} ${styles.orange}`}>
                <TrendingUp size={24} />
              </div>

              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>{t("payments.successRatio")}</span>

                <h3 className={styles.cardValue}>{salesRatio}%</h3>
              </div>
            </div>
          </div>

          <div className={styles.analyticsCard}>
            <div className={styles.analyticsHeader}>
              <span className={styles.analyticsTag}>{t("payments.performance")}</span>

              <h3>{t("payments.salesRatio")}</h3>
            </div>

            <div className={styles.circleWrapper}>
              <div className={styles.circleChart}>
                <div className={styles.circleCenter}>
                  <strong>{salesRatio}%</strong>

                  <span>{t("payments.completed")}</span>
                </div>
              </div>
            </div>

            <div className={styles.analyticsStats}>
              <div className={styles.analyticsItem}>
                <span>{t("payments.paidOrders")}</span>

                <strong>{stats.paidOrders}</strong>
              </div>

              <div className={styles.analyticsItem}>
                <span>{t("payments.failedOrders")}</span>

                <strong>{stats.failedOrders}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

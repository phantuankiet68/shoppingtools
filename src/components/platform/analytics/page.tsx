'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './analytics.module.css';
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

type PaymentItem = {
    id: string;
    siteId: string;
    site: string;
    domain: string;
    siteType: string;
    amount: number;
    currency: string;
    date: string | null;
    icon: string;
};

type ExpiringSite = {
    siteId: string;
    site: string;
    domain: string;
    siteType: string;
    plan: string;
    daysLeft: number;
    icon: string;
};

type Notification = {
    id: string;
    type: 'warning' | 'success' | 'danger' | 'info';
    message: string;
    createdAt: string;
};

type RevenuePoint = {
    month: number;
    label: string;
    revenue: number;
    pending: number;
    expense: number;
};

type AnalyticsOverview = {
    period: {
        year: number;
        start: string;
        end: string;
    };
    cards: {
        totalRevenue: number;
        totalExpense: number;
        pendingRevenue: number;
        pendingTransactions: number;
        negativeBalance: number;
        negativeSites: number;
        revenueChangePercent: number | null;
        expenseChangePercent: number | null;
    };
};

type SubscriptionAnalytics = {
    year: number;
    registered: number;
    expired: number;
    pendingApproval: number;
    active: number;
    trial: number;
    suspended: number;
    expiring7Days: number;
    expiring30Days: number;
    awaitingConfirmation: number;
    processing: number;
};

type PaymentResponse = {
    type: 'paid' | 'unpaid' | 'awaiting_confirmation';
    year: number;
    total: number;
    items: Array<{
        id: string;
        siteId: string;
        siteName: string;
        domain: string;
        siteType: string;
        amount: number;
        currency: string;
        status: string;
        provider: string;
        method: string | null;
        paymentCode: string;
        paidAt: string | null;
        createdAt: string;
        confirmationRequestedAt: string | null;
    }>;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    error?: {
        message: string;
    };
};

const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const currency = new Intl.NumberFormat('vi-VN');

const SITE_ICONS: Record<string, string> = {
    landing: 'bi-window',
    blog: 'bi-file-earmark-text',
    ecommerce: 'bi-shop',
    booking: 'bi-calendar-event',
    lms: 'bi-mortarboard',
};

function formatCurrency(value: number) {
    return `${currency.format(Math.round(value || 0))} đ`;
}

const formatCurrencyShort = (value: number) => {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}B`;
    }

    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(0)}K`;
    }

    return `${value}`;
};

function formatDate(value: string | null) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatRelativeTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (minutes < 1) return 'vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return formatDate(value);
}

function getSiteIcon(siteType: string) {
    return SITE_ICONS[siteType] ?? 'bi-globe2';
}

function useElementWidth() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const element = ref.current;

        if (!element) return;

        const updateWidth = () => {
            const nextWidth = Math.floor(element.getBoundingClientRect().width);

            if (nextWidth > 0) {
                setWidth(nextWidth);
            }
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return {
        ref,
        width,
    };
}

function Donut({
    value,
    label,
    data,
}: {
    value: number;
    label: string;
    data: Array<{
        name: string;
        value: number;
        color: string;
    }>;
}) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const chartData =
        total > 0
            ? data
            : [
                  {
                      name: 'empty',
                      value: 1,
                      color: '#e8eef6',
                  },
              ];

    return (
        <div className={styles.donutItem}>
            <div className={styles.donutChart}>
                <PieChart width={112} height={112}>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx={56}
                        cy={56}
                        innerRadius={38}
                        outerRadius={50}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={2}
                        stroke="none"
                        isAnimationActive={false}
                    >
                        {chartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>

                <div className={styles.donutCenter}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                </div>
            </div>
        </div>
    );
}

function PaymentList({
    title,
    icon,
    items,
    loading,
    total,
}: {
    title: string;
    icon: string;
    items: PaymentItem[];
    loading: boolean;
    total: number;
}) {
    return (
        <section className={styles.listCard}>
            <div className={styles.listHeader}>
                <div className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>
                        <i className={`bi ${icon}`} />
                    </span>
                    <h3>{title}</h3>
                </div>

                <button type="button" className={styles.textButton}>
                    Xem tất cả
                    {total > 5 ? ` (${total})` : ''}
                </button>
            </div>

            <div className={styles.listColumns}>
                <span>Site</span>
                <span>Số tiền</span>
                <span>Ngày {title === 'Site đã chuyển khoản' ? 'thanh toán' : 'tạo'}</span>
            </div>

            <div className={styles.paymentRows}>
                {loading ? (
                    <div className={styles.paymentRow}>
                        <span>Đang tải...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className={styles.paymentRow}>
                        <span>Không có dữ liệu</span>
                    </div>
                ) : (
                    items.map((item) => (
                        <div className={styles.paymentRow} key={item.id}>
                            <div className={styles.siteCell}>
                                <span className={styles.siteIcon}>
                                    <i className={`bi ${item.icon}`} />
                                </span>
                                <span>{item.site || item.domain}</span>
                            </div>

                            <span className={styles.amount}>{formatCurrency(item.amount)}</span>

                            <span className={styles.date}>{formatDate(item.date)}</span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

export default function AnalyticsPage() {
    const currentYear = new Date().getFullYear();

    const [year, setYear] = useState(currentYear);
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
    const [subscriptions, setSubscriptions] = useState<SubscriptionAnalytics | null>(null);

    const [paidSites, setPaidSites] = useState<PaymentItem[]>([]);
    const [unpaidSites, setUnpaidSites] = useState<PaymentItem[]>([]);
    const [pendingSites, setPendingSites] = useState<PaymentItem[]>([]);

    const [paidTotal, setPaidTotal] = useState(0);
    const [unpaidTotal, setUnpaidTotal] = useState(0);
    const [pendingTotal, setPendingTotal] = useState(0);

    const [expiringSites, setExpiringSites] = useState<ExpiringSite[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { ref: chartRef, width: chartWidth } = useElementWidth();

    const fetchJson = useCallback(async <T,>(url: string): Promise<T> => {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            headers: {
                Accept: 'application/json',
            },
        });

        const result = (await response.json()) as ApiResponse<T>;

        if (!response.ok || !result.success) {
            throw new Error(result.error?.message || `Request failed with ${response.status}`);
        }

        return result.data;
    }, []);

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const query = `year=${year}`;

            const [
                overviewData,
                revenueResponse,
                subscriptionData,
                paidResponse,
                unpaidResponse,
                pendingResponse,
                expiringResponse,
                notificationResponse,
            ] = await Promise.all([
                fetchJson<AnalyticsOverview>(`/api/platform/analytics/overview?${query}`),
                fetchJson<{
                    year: number;
                    months: RevenuePoint[];
                }>(`/api/platform/analytics/revenue?${query}`),
                fetchJson<SubscriptionAnalytics>(`/api/platform/analytics/subscriptions?${query}`),
                fetchJson<PaymentResponse>(`/api/platform/analytics/payments?${query}&type=paid`),
                fetchJson<PaymentResponse>(`/api/platform/analytics/payments?${query}&type=unpaid`),
                fetchJson<PaymentResponse>(
                    `/api/platform/analytics/payments?${query}&type=awaiting_confirmation`,
                ),
                fetchJson<
                    Array<{
                        siteId: string;
                        siteName: string;
                        domain: string;
                        siteType: string;
                        planName: string;
                        planCode: string;
                        subscriptionStatus: string;
                        currentPeriodEnd: string;
                        daysLeft: number;
                    }>
                >('/api/platform/analytics/expiring-sites?days=30&limit=5'),
                fetchJson<Notification[]>('/api/platform/analytics/notifications?limit=5'),
            ]);

            setOverview(overviewData);
            setRevenueData(revenueResponse.months);
            setSubscriptions(subscriptionData);

            const mapPayment = (response: PaymentResponse): PaymentItem[] =>
                response.items.map((item) => ({
                    id: item.id,
                    siteId: item.siteId,
                    site: item.siteName,
                    domain: item.domain,
                    siteType: item.siteType,
                    amount: item.amount,
                    currency: item.currency,
                    date:
                        response.type === 'paid'
                            ? item.paidAt
                            : response.type === 'awaiting_confirmation'
                              ? item.confirmationRequestedAt
                              : item.createdAt,
                    icon: getSiteIcon(item.siteType),
                }));

            setPaidSites(mapPayment(paidResponse));
            setUnpaidSites(mapPayment(unpaidResponse));
            setPendingSites(mapPayment(pendingResponse));

            setPaidTotal(paidResponse.total);
            setUnpaidTotal(unpaidResponse.total);
            setPendingTotal(pendingResponse.total);

            setExpiringSites(
                expiringResponse.map((item) => ({
                    siteId: item.siteId,
                    site: item.siteName,
                    domain: item.domain,
                    siteType: item.siteType,
                    plan: item.planName,
                    daysLeft: item.daysLeft,
                    icon: getSiteIcon(item.siteType),
                })),
            );

            setNotifications(notificationResponse);
        } catch (loadError) {
            setError(
                loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu analytics.',
            );
        } finally {
            setLoading(false);
        }
    }, [fetchJson, year]);

    useEffect(() => {
        void loadAnalytics();
    }, [loadAnalytics]);

    const cards = overview?.cards;

    const subscriptionData = useMemo(
        () => [
            {
                name: 'Đang hoạt động',
                value: subscriptions?.active ?? 0,
                color: '#14b87a',
            },
            {
                name: 'Dùng thử',
                value: subscriptions?.trial ?? 0,
                color: '#63b6ee',
            },
            {
                name: 'Tạm ngưng',
                value: subscriptions?.suspended ?? 0,
                color: '#9aa8bc',
            },
        ],
        [subscriptions],
    );

    const expiringData = useMemo(
        () => [
            {
                name: 'Trong 7 ngày',
                value: subscriptions?.expiring7Days ?? 0,
                color: '#4285ed',
            },
            {
                name: 'Trong 30 ngày',
                value: subscriptions?.expiring30Days ?? 0,
                color: '#a7d2f5',
            },
        ],
        [subscriptions],
    );

    const approvalData = useMemo(
        () => [
            {
                name: 'Chờ xác nhận',
                value: subscriptions?.awaitingConfirmation ?? 0,
                color: '#f28b13',
            },
            {
                name: 'Đang xử lý',
                value: subscriptions?.processing ?? 0,
                color: '#f7d5a7',
            },
        ],
        [subscriptions],
    );

    const registeredTotal = subscriptions?.registered ?? 0;

    const expiringTotal =
        (subscriptions?.expiring7Days ?? 0) + (subscriptions?.expiring30Days ?? 0);

    const approvalTotal = subscriptions?.pendingApproval ?? 0;

    const maxChartValue = useMemo(() => {
        const max = revenueData.reduce(
            (currentMax, item) => Math.max(currentMax, item.revenue, item.pending, item.expense),
            0,
        );

        if (max <= 0) return 50_000_000;

        const step = 10_000_000;

        return Math.max(step, Math.ceil(max / step) * step);
    }, [revenueData]);

    const chartTicks = useMemo(() => {
        const step = maxChartValue / 5;

        return Array.from({ length: 6 }, (_, index) => Math.round(step * index));
    }, [maxChartValue]);

    const renderChange = (value: number | null | undefined) => {
        if (value == null) {
            return <small>Chưa có dữ liệu năm trước</small>;
        }

        if (value === 0) {
            return <small>Không thay đổi so với năm trước</small>;
        }

        const positive = value > 0;

        return (
            <small className={positive ? styles.positive : styles.negative}>
                <i className={`bi ${positive ? 'bi-arrow-up' : 'bi-arrow-down'}`} />{' '}
                {Math.abs(value)}% so với năm trước
            </small>
        );
    };

    return (
        <main className={styles.page}>
            <div className={styles.mainColumn}>
                <header className={styles.pageHeader}>
                    <div className={styles.heading}>
                        <span className={styles.headingIcon}>
                            <i className="bi bi-bar-chart-fill" />
                        </span>

                        <div>
                            <h1>Analytics</h1>
                            <p>Tổng quan doanh thu, thanh toán và đăng ký site</p>
                        </div>
                    </div>

                    <label className={styles.yearSelect}>
                        <i className="bi bi-calendar3" />

                        <select
                            value={year}
                            onChange={(event) => setYear(Number(event.target.value))}
                            aria-label="Chọn năm analytics"
                        >
                            {Array.from({ length: 7 }, (_, index) => {
                                const optionYear = currentYear - 3 + index;

                                return (
                                    <option key={optionYear} value={optionYear}>
                                        Năm {optionYear}
                                    </option>
                                );
                            })}
                        </select>

                        <i className="bi bi-chevron-down" />
                    </label>
                </header>

                {error && (
                    <section className={styles.listCard}>
                        <div className={styles.notificationItem}>
                            <span className={`${styles.notificationDot} ${styles.danger}`} />

                            <span>{error}</span>

                            <button
                                type="button"
                                className={styles.textButton}
                                onClick={() => void loadAnalytics()}
                            >
                                Thử lại
                            </button>
                        </div>
                    </section>
                )}

                <section className={styles.kpiGrid}>
                    <article className={`${styles.kpiCard} ${styles.revenueCard}`}>
                        <span className={`${styles.kpiIcon} ${styles.green}`}>
                            <i className="bi bi-wallet2" />
                        </span>

                        <div className={styles.kpiContent}>
                            <span className={styles.kpiLabel}>Tổng doanh thu</span>

                            <strong>{formatCurrency(cards?.totalRevenue ?? 0)}</strong>

                            {renderChange(cards?.revenueChangePercent)}
                        </div>
                    </article>

                    <article className={`${styles.kpiCard} ${styles.expenseCard}`}>
                        <span className={`${styles.kpiIcon} ${styles.pink}`}>
                            <i className="bi bi-box-arrow-up-right" />
                        </span>

                        <div className={styles.kpiContent}>
                            <span className={styles.kpiLabel}>Tổng chi tiêu</span>

                            <strong>{formatCurrency(cards?.totalExpense ?? 0)}</strong>

                            {renderChange(cards?.expenseChangePercent)}
                        </div>
                    </article>

                    <article className={`${styles.kpiCard} ${styles.pendingCard}`}>
                        <span className={`${styles.kpiIcon} ${styles.blue}`}>
                            <i className="bi bi-credit-card-2-front" />
                        </span>

                        <div className={styles.kpiContent}>
                            <span className={styles.kpiLabel}>Đang chờ thanh toán</span>

                            <strong>{formatCurrency(cards?.pendingRevenue ?? 0)}</strong>

                            <small>{cards?.pendingTransactions ?? 0} giao dịch</small>
                        </div>
                    </article>

                    <article className={`${styles.kpiCard} ${styles.negativeCard}`}>
                        <span className={`${styles.kpiIcon} ${styles.orange}`}>
                            <i className="bi bi-exclamation-circle" />
                        </span>

                        <div className={styles.kpiContent}>
                            <span className={styles.kpiLabel}>Số dư đang âm</span>

                            <strong>{formatCurrency(cards?.negativeBalance ?? 0)}</strong>

                            <small>{cards?.negativeSites ?? 0} site</small>
                        </div>
                    </article>
                </section>

                <section className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <div className={styles.sectionTitle}>
                            <span className={styles.chartTitleIcon}>
                                <i className="bi bi-bar-chart-fill" />
                            </span>

                            <h2>Doanh thu theo tháng ({year})</h2>
                        </div>

                        <div className={styles.chartTools}>
                            <div className={styles.legend}>
                                <span>
                                    <i className={`${styles.legendDot} ${styles.dotRevenue}`} />
                                    Doanh thu
                                </span>

                                <span>
                                    <i className={`${styles.legendDot} ${styles.dotPending}`} />
                                    Chờ thanh toán
                                </span>

                                <span>
                                    <i className={`${styles.legendDot} ${styles.dotExpense}`} />
                                    Chi tiêu
                                </span>
                            </div>

                            <span className={styles.periodSelect}>Theo tháng</span>
                        </div>
                    </div>

                    <div ref={chartRef} className={styles.chartWrap}>
                        {chartWidth > 0 && (
                            <ResponsiveContainer
                                width={chartWidth}
                                height={224}
                                minWidth={1}
                                minHeight={224}
                            >
                                <ComposedChart
                                    data={
                                        revenueData.length
                                            ? revenueData
                                            : MONTHS.map((label, index) => ({
                                                  month: index + 1,
                                                  label,
                                                  revenue: 0,
                                                  pending: 0,
                                                  expense: 0,
                                              }))
                                    }
                                    margin={{
                                        top: 12,
                                        right: 10,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid stroke="#e5edf7" vertical />

                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: '#64748b',
                                            fontSize: 12,
                                        }}
                                        dy={8}
                                    />

                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: '#64748b',
                                            fontSize: 12,
                                        }}
                                        tickFormatter={formatCurrencyShort}
                                        width={48}
                                        domain={[0, maxChartValue]}
                                        ticks={chartTicks}
                                    />

                                    <Tooltip
                                        cursor={{
                                            fill: 'rgba(66, 133, 237, 0.04)',
                                        }}
                                        formatter={(value, name) => [
                                            formatCurrency(Number(value ?? 0)),
                                            name === 'revenue'
                                                ? 'Doanh thu'
                                                : name === 'pending'
                                                  ? 'Chờ thanh toán'
                                                  : 'Chi tiêu',
                                        ]}
                                        contentStyle={{
                                            border: '1px solid #e4ebf5',
                                            borderRadius: 12,
                                            boxShadow: '0 12px 30px rgba(44, 72, 120, 0.12)',
                                        }}
                                    />

                                    <Bar
                                        dataKey="revenue"
                                        fill="#4b8ff0"
                                        radius={[5, 5, 0, 0]}
                                        barSize={20}
                                    />

                                    <Bar
                                        dataKey="pending"
                                        fill="#8cccf0"
                                        radius={[5, 5, 0, 0]}
                                        barSize={20}
                                    />

                                    <Bar
                                        dataKey="expense"
                                        fill="#ef73b7"
                                        radius={[5, 5, 0, 0]}
                                        barSize={20}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#54a8f5"
                                        strokeWidth={2}
                                        dot={{
                                            r: 3.5,
                                            fill: '#fff',
                                            stroke: '#54a8f5',
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{
                                            r: 5,
                                        }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </section>

                <section className={styles.paymentGrid}>
                    <PaymentList
                        title="Site đã chuyển khoản"
                        icon="bi-check-circle-fill"
                        items={paidSites}
                        loading={loading}
                        total={paidTotal}
                    />

                    <PaymentList
                        title="Site chưa thanh toán"
                        icon="bi-credit-card"
                        items={unpaidSites}
                        loading={loading}
                        total={unpaidTotal}
                    />

                    <PaymentList
                        title="Site chờ xác nhận"
                        icon="bi-hourglass-split"
                        items={pendingSites}
                        loading={loading}
                        total={pendingTotal}
                    />
                </section>
            </div>

            <aside className={styles.sideColumn}>
                <section className={styles.notificationsCard}>
                    <div className={styles.sideHeader}>
                        <div className={styles.sideTitle}>
                            <span className={styles.bellIcon}>
                                <i className="bi bi-bell-fill" />
                            </span>
                            <h2>Thông báo</h2>
                        </div>

                        <button type="button" className={styles.textButton}>
                            Xem tất cả
                        </button>
                    </div>

                    <div className={styles.notificationList}>
                        {notifications.length === 0 ? (
                            <div className={styles.notificationItem}>
                                <span className={`${styles.notificationDot} ${styles.success}`} />
                                <span>Hiện chưa có thông báo mới</span>
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <div className={styles.notificationItem} key={item.id}>
                                    <span
                                        className={`${styles.notificationDot} ${styles[item.type]}`}
                                    />

                                    <span>{item.message}</span>

                                    <time>{formatRelativeTime(item.createdAt)}</time>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className={styles.subscriptionCard}>
                    <div className={styles.sideHeader}>
                        <div className={styles.sideTitle}>
                            <span className={styles.blueCircle}>
                                <i className="bi bi-record-circle-fill" />
                            </span>
                            <h2>Tổng quan đăng ký site</h2>
                        </div>
                    </div>

                    <div className={styles.donutGrid}>
                        <Donut value={registeredTotal} label="Đã đăng ký" data={subscriptionData} />

                        <Donut value={expiringTotal} label="Sắp hết hạn" data={expiringData} />

                        <Donut value={approvalTotal} label="Chờ duyệt" data={approvalData} />
                    </div>

                    <div className={styles.statsLegendGrid}>
                        <div>
                            <p>
                                <i className={styles.legendGreen} />
                                Đang hoạt động <b>{subscriptions?.active ?? 0}</b>
                            </p>

                            <p>
                                <i className={styles.legendCyan} />
                                Dùng thử <b>{subscriptions?.trial ?? 0}</b>
                            </p>

                            <p>
                                <i className={styles.legendGray} />
                                Tạm ngưng <b>{subscriptions?.suspended ?? 0}</b>
                            </p>
                        </div>

                        <div>
                            <p>
                                <i className={styles.legendBlue} />
                                Trong 7 ngày <b>{subscriptions?.expiring7Days ?? 0}</b>
                            </p>

                            <p>
                                <i className={styles.legendLightBlue} />
                                Trong 30 ngày <b>{subscriptions?.expiring30Days ?? 0}</b>
                            </p>
                        </div>

                        <div>
                            <p>
                                <i className={styles.legendOrange} />
                                Chờ xác nhận <b>{subscriptions?.awaitingConfirmation ?? 0}</b>
                            </p>

                            <p>
                                <i className={styles.legendLightOrange} />
                                Đang xử lý <b>{subscriptions?.processing ?? 0}</b>
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.expiringCard}>
                    <div className={styles.sideHeader}>
                        <div className={styles.sideTitle}>
                            <span className={styles.expiringIcon}>
                                <i className="bi bi-calendar2-week-fill" />
                            </span>
                            <h2>Danh sách sắp hết hạn</h2>
                        </div>

                        <button type="button" className={styles.textButton}>
                            Xem tất cả
                        </button>
                    </div>

                    <div className={styles.expiringList}>
                        {expiringSites.length === 0 ? (
                            <div className={styles.expiringRow}>
                                <span>Không có site sắp hết hạn trong 30 ngày.</span>
                            </div>
                        ) : (
                            expiringSites.slice(0, 5).map((item) => (
                                <div className={styles.expiringRow} key={item.siteId}>
                                    <span className={styles.expiringSiteIcon}>
                                        <i className={`bi ${item.icon}`} />
                                    </span>

                                    <span className={styles.expiringSite}>
                                        {item.site || item.domain}
                                    </span>

                                    <span className={styles.planBadge}>{item.plan}</span>

                                    <strong>Còn {item.daysLeft} ngày</strong>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </aside>
        </main>
    );
}

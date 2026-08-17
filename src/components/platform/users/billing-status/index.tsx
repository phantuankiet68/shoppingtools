'use client';
import { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/platform/users/billing-status/billing-status.module.css';
import type { BillingItem, BillingStatus } from './billing';
import Image from 'next/image';

interface BillingSummary {
    totalSites: number;
    active: number;
    trial: number;
    expiringSoon: number;
    overdue: number;
    expired: number;
    canceled: number;
    suspended: number;
    noSubscription: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    nextBillingToday: number;
    nextBillingThisWeek: number;
}

const DEFAULT_SUMMARY: BillingSummary = {
    totalSites: 0,
    active: 0,
    trial: 0,
    expiringSoon: 0,
    overdue: 0,
    expired: 0,
    canceled: 0,
    suspended: 0,
    noSubscription: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    nextBillingToday: 0,
    nextBillingThisWeek: 0,
};

const STATUS_MAP: Record<
    BillingStatus,
    {
        label: string;
        className: string;
        icon: string;
    }
> = {
    PAID: {
        label: 'Paid',
        className: styles.paid,
        icon: 'bi-check-circle-fill',
    },

    EXPIRING_SOON: {
        label: 'Expiring Soon',
        className: styles.expiring,
        icon: 'bi-exclamation-circle-fill',
    },

    OVERDUE: {
        label: 'Overdue',
        className: styles.overdue,
        icon: 'bi-x-circle-fill',
    },

    TRIAL: {
        label: 'Trial',
        className: styles.trial,
        icon: 'bi-clock-fill',
    },

    SUSPENDED: {
        label: 'Suspended',
        className: styles.overdue,
        icon: 'bi-pause-circle-fill',
    },

    CANCELED: {
        label: 'Canceled',
        className: styles.overdue,
        icon: 'bi-slash-circle-fill',
    },

    EXPIRED: {
        label: 'Expired',
        className: styles.overdue,
        icon: 'bi-calendar-x-fill',
    },

    NO_SUBSCRIPTION: {
        label: 'No Subscription',
        className: styles.trial,
        icon: 'bi-dash-circle-fill',
    },
};

const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);

const getProgress = (status: BillingStatus, days: number | null) => {
    switch (status) {
        case 'PAID':
            return 100;

        case 'EXPIRING_SOON':
            return Math.max(25, days ? days * 10 : 25);

        case 'TRIAL':
            return 45;

        case 'OVERDUE':
            return 8;

        case 'SUSPENDED':
            return 5;

        case 'EXPIRED':
            return 0;

        case 'CANCELED':
            return 0;

        default:
            return 0;
    }
};

export default function BillingStatus({ userId }: { userId: string | null }) {
    const [loading, setLoading] = useState(true);

    const [summaryLoading, setSummaryLoading] = useState(true);

    const [items, setItems] = useState<BillingItem[]>([]);

    const [summary, setSummary] = useState<BillingSummary>(DEFAULT_SUMMARY);

    const [error, setError] = useState<string | null>(null);

    const [renewLoading, setRenewLoading] = useState<string | null>(null);

    const [reminderLoading, setReminderLoading] = useState<string | null>(null);
    const [confirmLoading, setConfirmLoading] = useState<string | null>(null);

    const resetState = () => {
        setItems([]);

        setSummary(DEFAULT_SUMMARY);

        setError(null);
    };

    const loadItems = useCallback(async () => {
        if (!userId) {
            resetState();

            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`/api/platform/users/${userId}/billing`, {
                cache: 'no-store',
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message ?? 'Failed to load billing.');
            }

            setItems(json.data ?? []);
        } catch (error) {
            console.error('LOAD_BILLING_ERROR', error);

            setItems([]);

            setError('Unable to load billing information.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const loadSummary = useCallback(async () => {
        if (!userId) {
            setSummary(DEFAULT_SUMMARY);

            return;
        }

        try {
            setSummaryLoading(true);

            const response = await fetch(`/api/platform/users/${userId}/billing/summary`, {
                cache: 'no-store',
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.message ?? 'Failed to load billing summary.');
            }

            setSummary(json.data ?? DEFAULT_SUMMARY);
        } catch (error) {
            console.error('LOAD_BILLING_SUMMARY_ERROR', error);

            setSummary(DEFAULT_SUMMARY);
        } finally {
            setSummaryLoading(false);
        }
    }, [userId]);

    const sendReminder = useCallback(
        async (siteId: string) => {
            if (!userId) return;

            try {
                setReminderLoading(siteId);

                const response = await fetch(`/api/platform/users/${userId}/billing/reminder`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        siteId,
                    }),
                });

                const json = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.message ?? 'Failed to send reminder.');
                }

                alert(json.message);

                await Promise.all([loadItems(), loadSummary()]);
            } catch (error) {
                console.error('SEND_REMINDER_ERROR', error);

                alert('Failed to send reminder.');
            } finally {
                setReminderLoading(null);
            }
        },
        [userId, loadItems, loadSummary],
    );

    const renewSubscription = useCallback(
        async (siteId: string) => {
            if (!userId) return;

            try {
                setRenewLoading(siteId);

                const response = await fetch(`/api/platform/users/${userId}/billing/renew`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        siteId,
                    }),
                });

                const json = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.message ?? 'Failed to renew.');
                }

                /*
                 * Sau này Stripe/VNPay
                 */
                if (json.checkoutUrl) {
                    window.location.href = json.checkoutUrl;

                    return;
                }

                alert(json.message);

                await Promise.all([loadItems(), loadSummary()]);
            } catch (error) {
                console.error('RENEW_ERROR', error);

                alert('Failed to renew.');
            } finally {
                setRenewLoading(null);
            }
        },
        [userId, loadItems, loadSummary],
    );

    const confirmPayment = useCallback(
        async (siteId: string, paymentId: string) => {
            try {
                setConfirmLoading(paymentId);

                const response = await fetch(
                    `/api/platform/sites/${siteId}/payments/${paymentId}/confirm`,
                    {
                        method: 'POST',
                    },
                );

                const json = await response.json();

                if (!response.ok || json.success !== true) {
                    throw new Error(json.message ?? 'Failed to confirm payment.');
                }

                alert(json.message ?? 'Payment confirmed successfully.');

                await Promise.all([loadItems(), loadSummary()]);
            } catch (error) {
                console.error('CONFIRM_PAYMENT_ERROR', error);

                alert(error instanceof Error ? error.message : 'Failed to confirm payment.');
            } finally {
                setConfirmLoading(null);
            }
        },
        [loadItems, loadSummary],
    );

    useEffect(() => {
        if (!userId) {
            resetState();

            return;
        }

        loadItems();

        loadSummary();
    }, [userId, loadItems, loadSummary]);

    if (error) {
        return (
            <section className={styles.section}>
                <header className={styles.header}>
                    <h2>Billing Status</h2>
                </header>

                <div className={styles.error}>
                    <i className="bi bi-exclamation-circle-fill" />

                    <p>{error}</p>
                    <button
                        className={styles.retry}
                        onClick={() => {
                            loadItems();
                            loadSummary();
                        }}
                    >
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className={styles.section}>
                <header className={styles.header}>
                    <h2>Billing Status</h2>
                </header>

                <div className={styles.skeletonList}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className={styles.skeletonCard} />
                    ))}
                </div>
            </section>
        );
    }
    if (items.length === 0) {
        return (
            <section className={styles.section}>
                <header className={styles.header}>
                    <h2>Billing Status</h2>
                </header>

                <div className={styles.empty}>
                    <i className="bi bi-credit-card-2-front" />

                    <h3>No Billing Information</h3>

                    <p>This customer doesn't have any subscriptions yet.</p>
                </div>
            </section>
        );
    }
    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <div className={styles.bgCircle1} />
                <div className={styles.bgCircle2} />
                <div className={styles.bgDotsTop} />
                <div className={styles.bgDotsBottom} />

                <div className={styles.left}>
                    <div className={styles.iconBox}>
                        <i className="bi bi-credit-card-2-front-fill" />
                    </div>

                    <div className={styles.headerContent}>
                        <h2>Billing Status</h2>
                        <p>View subscriptions, invoices and recent payment activity.</p>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <button className={styles.button}>
                        <i className="bi bi-receipt-cutoff" />
                        <span>Billing History</span>
                        <i className="bi bi-chevron-right" />
                    </button>
                </div>
            </header>

            <div className={styles.list}>
                {items.map((rawItem) => {
                    const item = rawItem;
                    const status = STATUS_MAP[item.status] ?? STATUS_MAP.NO_SUBSCRIPTION;

                    return (
                        <article key={item.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.site}>
                                    <div
                                        className={styles.logo}
                                        style={
                                            {
                                                '--accent': item.color,
                                            } as React.CSSProperties
                                        }
                                    >
                                        <i className={`bi ${item.icon}`} />
                                    </div>

                                    <div className={styles.siteContent}>
                                        <h3>{item.site}</h3>

                                        <span>{item.domain}</span>
                                    </div>
                                </div>

                                <div className={styles.right}>
                                    {item.nextBilling && (
                                        <small>
                                            Next Billing
                                            {' · '}
                                            {new Date(item.nextBilling).toLocaleDateString('en-GB')}
                                        </small>
                                    )}
                                    <span className={`${styles.badge} ${status.className}`}>
                                        <i className={`bi ${status.icon}`} />

                                        {status.label}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.grid}>
                                <div>
                                    <label>Customer</label>

                                    <div className={styles.customer}>
                                        <div className={styles.avatar}>
                                            {item.customer.avatar ? (
                                                <Image
                                                    src={item.customer.avatar}
                                                    alt={item.customer.name}
                                                    width={44}
                                                    height={44}
                                                    className={styles.avatarImage}
                                                />
                                            ) : (
                                                <i className="bi bi-person-fill" />
                                            )}
                                        </div>

                                        <div>
                                            <strong>{item.customer.name}</strong>

                                            <small>{item.customer.email}</small>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label>Plan</label>
                                    <span className={styles.plan}>{item.plan ?? 'Free'}</span>
                                </div>

                                <div>
                                    <label>Amount</label>

                                    <strong>
                                        {formatCurrency(item.amount, item.currency)}

                                        {item.billingCycle &&
                                            ` / ${item.billingCycle.toLowerCase()}`}
                                    </strong>
                                </div>

                                <div>
                                    <label>Status</label>

                                    <strong>{item.subscriptionStatus ?? '-'}</strong>
                                </div>
                            </div>

                            <div className={styles.progressSection}>
                                <div className={styles.progressTop}>
                                    <span>Subscription Health</span>

                                    <span>
                                        {item.daysRemaining !== null
                                            ? `${item.daysRemaining} days`
                                            : '--'}
                                    </span>
                                </div>

                                <div className={styles.progress}>
                                    <div
                                        className={styles.progressValue}
                                        style={{
                                            width: `${getProgress(
                                                item.status,
                                                item.daysRemaining,
                                            )}%`,
                                            background: item.color,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <div className={styles.notify}>
                                    <i className="bi bi-bell-fill" />

                                    <span>{item.notification}</span>
                                </div>

                                <div className={styles.actions}>
                                    {item.paymentStatus === 'PENDING' && item.pendingPaymentId ? (
                                        <button
                                            className={styles.primaryAction}
                                            disabled={confirmLoading === item.pendingPaymentId}
                                            onClick={() =>
                                                confirmPayment(item.id, item.pendingPaymentId!)
                                            }
                                        >
                                            <i
                                                className={`bi ${
                                                    confirmLoading === item.pendingPaymentId
                                                        ? 'bi-arrow-repeat spin'
                                                        : 'bi-check-circle'
                                                }`}
                                            />

                                            {confirmLoading === item.pendingPaymentId
                                                ? 'Confirming...'
                                                : 'Confirm Payment'}
                                        </button>
                                    ) : (
                                        <>
                                            {(item.status === 'EXPIRING_SOON' ||
                                                item.status === 'OVERDUE') && (
                                                <>
                                                    <button
                                                        className={styles.secondaryAction}
                                                        disabled={reminderLoading === item.id}
                                                        onClick={() => sendReminder(item.id)}
                                                    >
                                                        <i
                                                            className={`bi ${
                                                                reminderLoading === item.id
                                                                    ? 'bi-arrow-repeat spin'
                                                                    : 'bi-bell'
                                                            }`}
                                                        />
                                                        {reminderLoading === item.id
                                                            ? 'Sending...'
                                                            : 'Remind'}
                                                    </button>

                                                    <button
                                                        className={styles.primaryAction}
                                                        disabled={renewLoading === item.id}
                                                        onClick={() => renewSubscription(item.id)}
                                                    >
                                                        <i
                                                            className={`bi ${
                                                                renewLoading === item.id
                                                                    ? 'bi-arrow-repeat spin'
                                                                    : 'bi-arrow-repeat'
                                                            }`}
                                                        />

                                                        {renewLoading === item.id
                                                            ? 'Processing...'
                                                            : 'Renew'}
                                                    </button>
                                                </>
                                            )}

                                            {item.status === 'PAID' && (
                                                <button className={styles.primaryAction}>
                                                    <i className="bi bi-eye" />
                                                    Details
                                                </button>
                                            )}

                                            {item.status === 'TRIAL' && (
                                                <button className={styles.primaryAction}>
                                                    <i className="bi bi-stars" />
                                                    Upgrade
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

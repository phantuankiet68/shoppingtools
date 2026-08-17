'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './payment-history-modal.module.css';
import { SiteLike } from '@/features/sites/types';

type Tab = 'history' | 'renew' | 'plan';

type PaymentItem = {
    id: string;
    amount: string;
    currency: string;
    billingMonths?: number;
    paymentCode: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' | 'REFUNDED';
    provider: 'STRIPE' | 'PAYPAL' | 'MOMO' | 'VNPAY' | 'MANUAL';
    method: 'CARD' | 'BANK_TRANSFER' | 'WALLET' | 'CASH' | null;
    transactionId: string | null;
    invoiceNumber: string | null;
    receiptUrl: string | null;
    description: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
};

type Props = {
    open: boolean;
    site: SiteLike | null;
    onClose: () => void;
    onRenew?: (site: SiteLike) => void;
};

const BILLING_MONTHS = [1, 3, 6, 12];

const formatMoney = (value: string | number, currency = 'VND') => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '-';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (value: string | null | undefined) => {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
};

const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const getStatusClass = (status: PaymentItem['status']) => {
    switch (status) {
        case 'SUCCESS':
            return styles.statusSuccess;
        case 'PENDING':
            return styles.statusPending;
        case 'FAILED':
            return styles.statusFailed;
        case 'CANCELED':
            return styles.statusCanceled;
        case 'REFUNDED':
            return styles.statusRefunded;
        default:
            return '';
    }
};

const getStatusIcon = (status: PaymentItem['status']) => {
    switch (status) {
        case 'SUCCESS':
            return 'bi-check-circle-fill';
        case 'PENDING':
            return 'bi-clock-fill';
        case 'FAILED':
            return 'bi-x-circle-fill';
        case 'CANCELED':
            return 'bi-slash-circle-fill';
        case 'REFUNDED':
            return 'bi-arrow-counterclockwise';
        default:
            return 'bi-circle';
    }
};

const getMethodLabel = (method: PaymentItem['method'], provider: PaymentItem['provider']) => {
    if (method === 'BANK_TRANSFER') {
        return `Bank Transfer (${provider})`;
    }

    if (method === 'CARD') {
        return `Card (${provider})`;
    }

    if (method === 'WALLET') {
        return `Wallet (${provider})`;
    }

    if (method === 'CASH') {
        return 'Cash';
    }

    return provider;
};

export default function PaymentHistoryModal({ open, site, onClose, onRenew }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('history');
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
    const [selectedMonths, setSelectedMonths] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadPayments = useCallback(async () => {
        if (!site?.id) return;

        try {
            setLoading(true);
            setError('');

            const response = await fetch(`/api/admin/sites/${site.id}/payments`, {
                cache: 'no-store',
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load payment history.');
            }

            const items = data.payments ?? data.items ?? data.paymentSites ?? [];

            setPayments(items);

            if (items.length > 0) {
                setSelectedPayment(items[0]);
            } else {
                setSelectedPayment(null);
            }
        } catch (err) {
            console.error('Load payment history error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load payment history.');
        } finally {
            setLoading(false);
        }
    }, [site?.id]);

    useEffect(() => {
        if (!open || !site) return;

        setActiveTab('history');
        setSelectedMonths(1);
        void loadPayments();
    }, [open, site, loadPayments]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    const latestPayment = payments[0] ?? null;

    const successfulPayments = useMemo(
        () => payments.filter((payment) => payment.status === 'SUCCESS'),
        [payments],
    );

    const totalPaid = useMemo(
        () => successfulPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
        [successfulPayments],
    );

    const monthlyPrice = Number(site?.subscription?.plan?.price ?? 0);

    const renewAmount = monthlyPrice * selectedMonths;

    const plan = site?.subscription?.plan ?? null;

    const currentSubscriptionStatus = site?.subscription?.status ?? 'TRIAL';

    if (!open || !site) return null;

    return (
        <div
            className={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-history-title"
            >
                <header className={styles.header}>
                    <div className={styles.siteSummary}>
                        <div className={styles.siteIdentity}>
                            <div className={styles.siteAvatar}>
                                {site.logoUrl ? (
                                    <img src={site.logoUrl} alt="" />
                                ) : (
                                    <i className="bi bi-globe2" />
                                )}
                            </div>

                            <div>
                                <div className={styles.siteNameRow}>
                                    <strong>{site.name}</strong>

                                    <span className={styles.typeBadge}>{site.type}</span>
                                </div>

                                <div className={styles.siteMeta}>
                                    <span>
                                        <i className="bi bi-link-45deg" />
                                        {site.domain}
                                    </span>

                                    <span>
                                        <i className="bi bi-box-arrow-up-right" />
                                    </span>

                                    <span>Site ID: #{site.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.summaryItem}>
                            <span>Current Plan</span>
                            <strong>{plan?.name ?? 'No Plan'}</strong>
                            {plan && <small>{formatMoney(plan.price)} / month</small>}
                        </div>

                        <div className={styles.summaryItem}>
                            <span>Next Billing</span>
                            <strong>
                                {site.subscription?.nextBillingAt
                                    ? formatDate(site.subscription.nextBillingAt)
                                    : '-'}
                            </strong>
                            <small>{site.subscription?.billingCycle ?? '-'}</small>
                        </div>

                        <div className={styles.summaryItem}>
                            <span>Status</span>
                            <strong className={styles.activeText}>
                                <span />
                                {currentSubscriptionStatus}
                            </strong>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </header>

                <div className={styles.body}>
                    <nav className={styles.tabs}>
                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === 'history' ? styles.tabActive : ''
                            }`}
                            onClick={() => setActiveTab('history')}
                        >
                            <i className="bi bi-receipt" />
                            Payment History
                        </button>

                        <button
                            type="button"
                            className={`${styles.tab} ${
                                activeTab === 'renew' ? styles.tabActive : ''
                            }`}
                            onClick={() => setActiveTab('renew')}
                        >
                            <i className="bi bi-arrow-repeat" />
                            Renew Subscription
                        </button>
                    </nav>

                    <div className={styles.content}>
                        {activeTab === 'history' && (
                            <div className={styles.historyLayout}>
                                <div className={styles.historyMain}>
                                    <div className={styles.statsGrid}>
                                        <div className={styles.statCard}>
                                            <div
                                                className={`${styles.statIcon} ${styles.statIconBlue}`}
                                            >
                                                <i className="bi bi-receipt" />
                                            </div>
                                            <div>
                                                <span>Total Payments</span>
                                                <strong>{payments.length}</strong>
                                                <small>All time transactions</small>
                                            </div>
                                        </div>

                                        <div className={styles.statCard}>
                                            <div
                                                className={`${styles.statIcon} ${styles.statIconGreen}`}
                                            >
                                                <i className="bi bi-currency-dollar" />
                                            </div>
                                            <div>
                                                <span>Total Paid</span>
                                                <strong>{formatMoney(totalPaid)}</strong>
                                                <small>Successful payments</small>
                                            </div>
                                        </div>

                                        <div className={styles.statCard}>
                                            <div
                                                className={`${styles.statIcon} ${styles.statIconPurple}`}
                                            >
                                                <i className="bi bi-calendar-check" />
                                            </div>
                                            <div>
                                                <span>Last Payment</span>
                                                <strong>
                                                    {latestPayment
                                                        ? formatDate(
                                                              latestPayment.paidAt ??
                                                                  latestPayment.createdAt,
                                                          )
                                                        : '-'}
                                                </strong>
                                                <small>{latestPayment?.status ?? '-'}</small>
                                            </div>
                                        </div>

                                        <div className={styles.statCard}>
                                            <div
                                                className={`${styles.statIcon} ${styles.statIconBlue}`}
                                            >
                                                <i className="bi bi-shield-check" />
                                            </div>
                                            <div>
                                                <span>Subscription</span>
                                                <strong className={styles.greenValue}>
                                                    {currentSubscriptionStatus}
                                                </strong>
                                                <small>{plan?.name ?? 'No Plan'}</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.tableCard}>
                                        <div className={styles.tableHeader}>
                                            <div>
                                                <h3>Payment History</h3>
                                                <p>All transactions for this website.</p>
                                            </div>

                                            <button
                                                type="button"
                                                className={styles.refreshButton}
                                                onClick={() => void loadPayments()}
                                                disabled={loading}
                                            >
                                                <i
                                                    className={`bi bi-arrow-clockwise ${loading ? styles.spin : ''}`}
                                                />
                                                Refresh
                                            </button>
                                        </div>

                                        {error ? (
                                            <div className={styles.errorBox}>
                                                <i className="bi bi-exclamation-triangle" />
                                                <span>{error}</span>
                                            </div>
                                        ) : loading ? (
                                            <div className={styles.loadingState}>
                                                <i className="bi bi-arrow-repeat" />
                                                Loading payment history...
                                            </div>
                                        ) : payments.length === 0 ? (
                                            <div className={styles.emptyState}>
                                                <div>
                                                    <i className="bi bi-receipt" />
                                                </div>
                                                <strong>No payment history</strong>
                                                <span>
                                                    No payment transactions have been recorded for
                                                    this site yet.
                                                </span>
                                            </div>
                                        ) : (
                                            <div className={styles.tableScroll}>
                                                <table className={styles.table}>
                                                    <thead>
                                                        <tr>
                                                            <th>Payment Code</th>
                                                            <th>Invoice</th>
                                                            <th>Date</th>
                                                            <th>Period</th>
                                                            <th>Amount</th>
                                                            <th>Method</th>
                                                            <th>Status</th>
                                                            <th />
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {payments.map((payment) => (
                                                            <tr
                                                                key={payment.id}
                                                                className={
                                                                    selectedPayment?.id ===
                                                                    payment.id
                                                                        ? styles.selectedRow
                                                                        : ''
                                                                }
                                                                onClick={() =>
                                                                    setSelectedPayment(payment)
                                                                }
                                                            >
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.codeButton
                                                                        }
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            setSelectedPayment(
                                                                                payment,
                                                                            );
                                                                        }}
                                                                    >
                                                                        {payment.paymentCode}
                                                                        <i className="bi bi-copy" />
                                                                    </button>
                                                                </td>

                                                                <td>
                                                                    {payment.invoiceNumber ?? '-'}
                                                                </td>

                                                                <td>
                                                                    <strong>
                                                                        {formatDate(
                                                                            payment.createdAt,
                                                                        )}
                                                                    </strong>
                                                                    <small>
                                                                        {
                                                                            formatDateTime(
                                                                                payment.createdAt,
                                                                            ).split(', ')[1]
                                                                        }
                                                                    </small>
                                                                </td>

                                                                <td>
                                                                    {payment.billingMonths ?? 1}{' '}
                                                                    {payment.billingMonths === 1
                                                                        ? 'month'
                                                                        : 'months'}
                                                                </td>

                                                                <td>
                                                                    <strong>
                                                                        {formatMoney(
                                                                            payment.amount,
                                                                            payment.currency,
                                                                        )}
                                                                    </strong>
                                                                </td>

                                                                <td>
                                                                    <span
                                                                        className={
                                                                            styles.methodCell
                                                                        }
                                                                    >
                                                                        <i className="bi bi-bank" />
                                                                        {getMethodLabel(
                                                                            payment.method,
                                                                            payment.provider,
                                                                        )}
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <span
                                                                        className={`${styles.statusBadge} ${getStatusClass(payment.status)}`}
                                                                    >
                                                                        <i
                                                                            className={`bi ${getStatusIcon(payment.status)}`}
                                                                        />
                                                                        {payment.status}
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    {payment.receiptUrl ? (
                                                                        <a
                                                                            href={
                                                                                payment.receiptUrl
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className={
                                                                                styles.receiptButton
                                                                            }
                                                                            onClick={(event) =>
                                                                                event.stopPropagation()
                                                                            }
                                                                        >
                                                                            <i className="bi bi-download" />
                                                                        </a>
                                                                    ) : (
                                                                        <span
                                                                            className={
                                                                                styles.noReceipt
                                                                            }
                                                                        >
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        <div className={styles.tableFooter}>
                                            Showing {payments.length} transaction
                                            {payments.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                <aside className={styles.detailCard}>
                                    <div className={styles.detailHeader}>
                                        <div>
                                            <h3>Payment Detail</h3>
                                            <p>Selected transaction</p>
                                        </div>

                                        <i className="bi bi-receipt" />
                                    </div>

                                    {selectedPayment ? (
                                        <>
                                            <div className={styles.detailHighlight}>
                                                <div>
                                                    <span>Payment Code</span>
                                                    <strong>{selectedPayment.paymentCode}</strong>
                                                </div>

                                                <span
                                                    className={`${styles.statusBadge} ${getStatusClass(selectedPayment.status)}`}
                                                >
                                                    {selectedPayment.status}
                                                </span>
                                            </div>

                                            <div className={styles.detailRows}>
                                                <div>
                                                    <span>Invoice</span>
                                                    <strong>
                                                        {selectedPayment.invoiceNumber ?? '-'}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Date</span>
                                                    <strong>
                                                        {formatDateTime(selectedPayment.createdAt)}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Period</span>
                                                    <strong>
                                                        {selectedPayment.billingMonths ?? 1}{' '}
                                                        {selectedPayment.billingMonths === 1
                                                            ? 'month'
                                                            : 'months'}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Amount</span>
                                                    <strong>
                                                        {formatMoney(
                                                            selectedPayment.amount,
                                                            selectedPayment.currency,
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Payment Method</span>
                                                    <strong>
                                                        {getMethodLabel(
                                                            selectedPayment.method,
                                                            selectedPayment.provider,
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Transaction ID</span>
                                                    <strong>
                                                        {selectedPayment.transactionId ?? '-'}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Paid At</span>
                                                    <strong>
                                                        {formatDateTime(selectedPayment.paidAt)}
                                                    </strong>
                                                </div>
                                            </div>

                                            {selectedPayment.receiptUrl && (
                                                <a
                                                    href={selectedPayment.receiptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={styles.downloadReceipt}
                                                >
                                                    <i className="bi bi-download" />
                                                    Download Receipt
                                                </a>
                                            )}
                                        </>
                                    ) : (
                                        <div className={styles.detailEmpty}>
                                            <i className="bi bi-receipt" />
                                            <span>Select a payment to view details.</span>
                                        </div>
                                    )}
                                </aside>
                            </div>
                        )}

                        {activeTab === 'renew' && (
                            <div className={styles.renewLayout}>
                                <div className={styles.renewLeft}>
                                    <div className={styles.sectionHeading}>
                                        <div>
                                            <span className={styles.eyebrow}>
                                                Subscription Renewal
                                            </span>
                                            <h3>Choose your billing period</h3>
                                            <p>
                                                Extend your current subscription with one payment.
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.periodGrid}>
                                        {BILLING_MONTHS.map((months) => {
                                            const amount = monthlyPrice * months;
                                            const selected = selectedMonths === months;

                                            return (
                                                <button
                                                    type="button"
                                                    key={months}
                                                    className={`${styles.periodCard} ${
                                                        selected ? styles.periodCardActive : ''
                                                    }`}
                                                    onClick={() => setSelectedMonths(months)}
                                                >
                                                    {selected && (
                                                        <span className={styles.checkMark}>
                                                            <i className="bi bi-check-lg" />
                                                        </span>
                                                    )}

                                                    <strong>{months}</strong>

                                                    <span>{months === 1 ? 'Month' : 'Months'}</span>

                                                    <b>{formatMoney(amount)}</b>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className={styles.renewSummary}>
                                        <div>
                                            <span>Current plan</span>
                                            <strong>{plan?.name ?? 'No Plan'}</strong>
                                        </div>

                                        <div>
                                            <span>Price per month</span>
                                            <strong>{formatMoney(monthlyPrice)}</strong>
                                        </div>

                                        <div>
                                            <span>Renewal period</span>
                                            <strong>
                                                {selectedMonths}{' '}
                                                {selectedMonths === 1 ? 'month' : 'months'}
                                            </strong>
                                        </div>

                                        <div className={styles.totalLine}>
                                            <span>Total Amount</span>
                                            <strong>{formatMoney(renewAmount)}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.paymentPreview}>
                                    <div>
                                        <div className={styles.previewHeader}>
                                            <div>
                                                <h3>Payment</h3>
                                                <p>Bank transfer / QR</p>
                                            </div>

                                            <span>
                                                <i className="bi bi-shield-check" />
                                                Secure
                                            </span>
                                        </div>

                                        <div className={styles.qrFrame}>
                                            <Image
                                                src="/assets/images/payment.jpg"
                                                alt="Payment QR"
                                                width={360}
                                                height={360}
                                                className={styles.qrImage}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.previewAmount}>
                                            <span>Total amount</span>
                                            <strong>{formatMoney(renewAmount)}</strong>
                                        </div>

                                        <div className={styles.transferInfo}>
                                            <div>
                                                <span>Bank</span>
                                                <strong>VIETCOMBANK</strong>
                                            </div>

                                            <div>
                                                <span>Account Name</span>
                                                <strong>CONG TY TNHH KBUILDER</strong>
                                            </div>

                                            <div>
                                                <span>Account Number</span>
                                                <strong>1234 5678 9999</strong>
                                            </div>

                                            <div>
                                                <span>Transfer Content</span>
                                                <strong>
                                                    KB{site.id.slice(0, 8).toUpperCase()}{' '}
                                                    {selectedMonths}M
                                                </strong>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className={styles.renewButton}
                                            onClick={() => onRenew?.(site)}
                                            disabled={!plan || monthlyPrice <= 0}
                                        >
                                            <i className="bi bi-arrow-repeat" />
                                            Renew Subscription
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <footer className={styles.footer}>
                    <div className={styles.secureMessage}>
                        <div>
                            <i className="bi bi-shield-check" />
                        </div>
                        <div>
                            <strong>Secure & Trusted</strong>
                            <span>Your payment information is protected and encrypted.</span>
                        </div>
                    </div>

                    <div className={styles.footerActions}>
                        <button
                            type="button"
                            className={styles.closeFooterButton}
                            onClick={onClose}
                        >
                            Close
                        </button>

                        {activeTab !== 'renew' && (
                            <button
                                type="button"
                                className={styles.footerRenewButton}
                                onClick={() => setActiveTab('renew')}
                                disabled={!plan}
                            >
                                <i className="bi bi-arrow-repeat" />
                                Renew Subscription
                            </button>
                        )}
                    </div>
                </footer>
            </section>
        </div>
    );
}

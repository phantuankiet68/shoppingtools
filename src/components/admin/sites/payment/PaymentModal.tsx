'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './payment-modal.module.css';
import { SiteLike } from '@/features/sites/types';

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' | 'REFUNDED';

export type PaymentInfo = {
    id?: string | null;
    paymentCode?: string | null;
    amount?: string | number | null;
    currency?: string | null;
    billingMonths?: number | null;
    invoiceNumber?: string | null;
    transactionId?: string | null;
    subscriptionLabel?: string | null;
    provider?: string | null;
    method?: string | null;
    status?: PaymentStatus;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
    paidAt?: string | Date | null;
    confirmationRequestedAt?: string | Date | null;
    confirmationRequestedById?: string | null;
    confirmationNote?: string | null;
};

type PaymentConfirmationResult = {
    payment?: PaymentInfo | null;
    paymentInfo?: {
        paymentId?: string | null;
        paymentCode?: string | null;
        invoiceNumber?: string | null;
        monthlyPrice?: string | number | null;
        months?: number | null;
        totalAmount?: string | number | null;
        currency?: string | null;
        provider?: string | null;
        method?: string | null;
        transferContent?: string | null;
        status?: PaymentStatus;
        confirmationRequestedAt?: string | null;
        confirmationRequestedById?: string | null;
        confirmationNote?: string | null;
        plan?: {
            id?: string | null;
            name?: string | null;
            code?: string | null;
            price?: string | number | null;
            currency?: string | null;
            billingCycle?: string | null;
        } | null;
    } | null;
    alreadyRequested?: boolean;
};

type PaymentModalProps = {
    open: boolean;
    onClose: () => void;
    site?: SiteLike | null;
    payment?: PaymentInfo | null;
    onCreatePayment?: (
        months: number,
    ) => Promise<PaymentConfirmationResult | void> | PaymentConfirmationResult | void;
    onPaymentConfirmation?: () =>
        | Promise<PaymentConfirmationResult | void>
        | PaymentConfirmationResult
        | void;
};

const PAYMENT_MINUTES = 15;

const BILLING_OPTIONS = [
    { months: 1, discount: 0 },
    { months: 3, discount: 0 },
    { months: 6, discount: 0 },
    { months: 12, discount: 0 },
] as const;

const ALLOWED_MONTHS = [1, 3, 6, 12];

export default function PaymentModal({
    open,
    onClose,
    site,
    payment,
    onCreatePayment,
    onPaymentConfirmation,
}: PaymentModalProps) {
    const [selectedMonths, setSelectedMonths] = useState(1);
    const [secondsLeft, setSecondsLeft] = useState(PAYMENT_MINUTES * 60);
    const [confirming, setConfirming] = useState(false);
    const [confirmationRequested, setConfirmationRequested] = useState(false);
    const [createdPayment, setCreatedPayment] = useState<PaymentInfo | null>(null);

    const monthlyPrice = Number(site?.subscription?.plan?.price ?? 0);

    const hasPricingPlan =
        !!site?.subscription?.plan && Number.isFinite(monthlyPrice) && monthlyPrice > 0;

    const activePayment = createdPayment ?? payment ?? null;

    const paymentStatus = activePayment?.status ?? null;

    const hasPayment = !!activePayment?.id;

    const hasPendingPayment = hasPayment && paymentStatus === 'PENDING';

    const hasConfirmationRequest =
        !!activePayment?.confirmationRequestedAt || confirmationRequested;

    const currency = activePayment?.currency ?? 'VND';

    useEffect(() => {
        if (!open) {
            return;
        }

        const initialPayment = payment ?? null;

        setSelectedMonths(
            initialPayment?.billingMonths && ALLOWED_MONTHS.includes(initialPayment.billingMonths)
                ? initialPayment.billingMonths
                : 1,
        );

        setConfirming(false);

        setCreatedPayment(initialPayment);

        setConfirmationRequested(!!initialPayment?.confirmationRequestedAt);
    }, [open, payment]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const createdAt = activePayment?.createdAt
            ? new Date(activePayment.createdAt).getTime()
            : Date.now();

        const expiresAt = createdAt + PAYMENT_MINUTES * 60 * 1000;

        const updateTimer = () => {
            const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

            setSecondsLeft(remaining);
        };

        updateTimer();

        const timer = window.setInterval(updateTimer, 1000);

        return () => window.clearInterval(timer);
    }, [open, activePayment?.createdAt, activePayment?.id]);

    const selectedOption = useMemo(
        () =>
            BILLING_OPTIONS.find((option) => option.months === selectedMonths) ??
            BILLING_OPTIONS[0],
        [selectedMonths],
    );

    const subtotal = monthlyPrice * selectedMonths;

    const discountAmount = Math.round(subtotal * (selectedOption.discount / 100));

    const total = subtotal - discountAmount;

    const paymentAmount = Number(activePayment?.amount ?? total);

    const minutes = Math.floor(secondsLeft / 60);

    const seconds = secondsLeft % 60;

    const paymentCode = activePayment?.paymentCode ?? '';

    const paymentId = activePayment?.id ?? 'Generated after payment creation';

    const invoiceNumber = activePayment?.invoiceNumber ?? 'Generated after payment creation';

    const transactionId = activePayment?.transactionId ?? 'Waiting for payment';

    const provider = activePayment?.provider ?? 'VNPAY';

    const method = activePayment?.method ?? 'BANK_TRANSFER';

    const subscriptionLabel =
        activePayment?.subscriptionLabel ??
        `${activePayment?.billingMonths ?? selectedMonths} ${
            (activePayment?.billingMonths ?? selectedMonths) === 1 ? 'month' : 'months'
        }`;

    const formattedMoney = (value: number) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number.isFinite(value) ? value : 0);

    const formatDate = (value?: string | Date | null) => {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    };

    const copyValue = async (value: string) => {
        if (!value || value === '-') {
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
        } catch {
            console.error('Clipboard unavailable.');
        }
    };

    const handleCreatePayment = async () => {
        if (confirming || !site?.id || !hasPricingPlan) {
            return;
        }

        if (secondsLeft <= 0) {
            console.error('Payment session expired.');
            return;
        }

        if (!ALLOWED_MONTHS.includes(selectedMonths)) {
            console.error('Invalid billing period.');
            return;
        }

        if (typeof onCreatePayment !== 'function') {
            console.error('[PaymentModal] onCreatePayment handler is not provided.');
            return;
        }

        try {
            setConfirming(true);

            const result = await onCreatePayment(selectedMonths);

            if (result?.payment) {
                setCreatedPayment(result.payment);

                setConfirmationRequested(!!result.payment.confirmationRequestedAt);

                return;
            }

            if (result?.paymentInfo) {
                setCreatedPayment({
                    id: result.paymentInfo.paymentId,
                    paymentCode: result.paymentInfo.paymentCode,
                    amount: result.paymentInfo.totalAmount,
                    currency: result.paymentInfo.currency,
                    billingMonths: result.paymentInfo.months ?? selectedMonths,
                    invoiceNumber: result.paymentInfo.invoiceNumber,
                    provider: result.paymentInfo.provider,
                    method: result.paymentInfo.method,
                    status: result.paymentInfo.status ?? 'PENDING',
                    confirmationRequestedAt: result.paymentInfo.confirmationRequestedAt ?? null,
                    confirmationRequestedById: result.paymentInfo.confirmationRequestedById ?? null,
                    confirmationNote: result.paymentInfo.confirmationNote ?? null,
                });

                setConfirmationRequested(!!result.paymentInfo.confirmationRequestedAt);
            }
        } catch (error) {
            console.error('[PaymentModal] Payment creation failed:', error);
        } finally {
            setConfirming(false);
        }
    };

    const handlePaymentConfirmation = async () => {
        if (confirming || !site?.id || !activePayment?.id) {
            return;
        }

        if (paymentStatus !== 'PENDING') {
            return;
        }

        if (secondsLeft <= 0) {
            console.error('Payment session expired.');
            return;
        }

        if (typeof onPaymentConfirmation !== 'function') {
            console.error('[PaymentModal] onPaymentConfirmation handler is not provided.');
            return;
        }

        try {
            setConfirming(true);

            const result = await onPaymentConfirmation();

            if (result?.payment) {
                setCreatedPayment(result.payment);
            } else if (result?.paymentInfo) {
                setCreatedPayment({
                    id: result.paymentInfo.paymentId ?? activePayment.id,
                    paymentCode: result.paymentInfo.paymentCode ?? activePayment.paymentCode,
                    amount: result.paymentInfo.totalAmount ?? activePayment.amount,
                    currency: result.paymentInfo.currency ?? activePayment.currency,
                    billingMonths: result.paymentInfo.months ?? activePayment.billingMonths,
                    invoiceNumber: result.paymentInfo.invoiceNumber ?? activePayment.invoiceNumber,
                    provider: result.paymentInfo.provider ?? activePayment.provider,
                    method: result.paymentInfo.method ?? activePayment.method,
                    status: result.paymentInfo.status ?? activePayment.status,
                    confirmationRequestedAt:
                        result.paymentInfo.confirmationRequestedAt ?? new Date().toISOString(),
                    confirmationRequestedById:
                        result.paymentInfo.confirmationRequestedById ??
                        activePayment.confirmationRequestedById,
                    confirmationNote:
                        result.paymentInfo.confirmationNote ?? activePayment.confirmationNote,
                });
            }

            setConfirmationRequested(true);
        } catch (error) {
            console.error('[PaymentModal] Confirmation failed:', error);
        } finally {
            setConfirming(false);
        }
    };

    const handlePrimaryAction = async () => {
        if (!hasPayment) {
            await handleCreatePayment();
            return;
        }

        if (hasPendingPayment && !hasConfirmationRequest) {
            await handlePaymentConfirmation();
        }
    };

    const primaryActionDisabled =
        confirming ||
        !site?.id ||
        secondsLeft <= 0 ||
        (!hasPayment && !hasPricingPlan) ||
        (hasPayment && (paymentStatus !== 'PENDING' || hasConfirmationRequest));

    const primaryIcon = confirming
        ? 'bi-arrow-repeat'
        : !hasPayment
          ? 'bi-credit-card-2-front'
          : hasConfirmationRequest
            ? 'bi-check2-circle'
            : 'bi-check2-circle';

    const primaryLabel = confirming
        ? hasPayment
            ? 'Submitting...'
            : 'Creating payment...'
        : !hasPayment
          ? 'Create payment'
          : hasConfirmationRequest
            ? 'Confirmation submitted'
            : 'I have paid';

    if (!open) {
        return null;
    }

    return (
        <div className={styles.overlay} onMouseDown={onClose} role="presentation">
            <div
                className={styles.modal}
                onMouseDown={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-modal-title"
            >
                <header className={styles.header}>
                    <div className={styles.headerIdentity}>
                        <div className={styles.headerIcon}>
                            <i className="bi bi-credit-card-2-front" />
                        </div>

                        <div className={styles.headerText}>
                            <div className={styles.headerTitleRow}>
                                <h2 id="payment-modal-title">Payment</h2>

                                <span className={styles.pendingBadge}>
                                    <i className="bi bi-circle-fill" />

                                    {paymentStatus === 'SUCCESS'
                                        ? 'Paid'
                                        : paymentStatus === 'PENDING'
                                          ? hasConfirmationRequest
                                              ? 'Confirmation requested'
                                              : hasPayment
                                                ? 'Pending'
                                                : 'Ready'
                                          : (paymentStatus ?? 'Ready')}
                                </span>
                            </div>

                            <p>
                                Review your subscription and complete the payment for your website.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close payment modal"
                        disabled={confirming}
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </header>

                <div className={styles.content}>
                    <section className={styles.summary}>
                        <div className={styles.siteCard}>
                            <div className={styles.sitePreview}>
                                {site?.logoUrl ? (
                                    <img
                                        src={site.logoUrl}
                                        alt=""
                                        className={styles.sitePreviewImage}
                                    />
                                ) : (
                                    <i className="bi bi-globe2" />
                                )}
                            </div>

                            <div className={styles.siteInfo}>
                                <div className={styles.siteNameRow}>
                                    <strong>{site?.name ?? 'Site'}</strong>

                                    <span>
                                        {site?.type
                                            ? site.type.charAt(0).toUpperCase() + site.type.slice(1)
                                            : 'Landing'}
                                    </span>
                                </div>

                                <div className={styles.domain}>
                                    <i className="bi bi-link-45deg" />

                                    <span>{site?.domain ?? '-'}</span>

                                    <i className="bi bi-box-arrow-up-right" />

                                    <small>
                                        Site ID:{' '}
                                        {site?.id ? `#${site.id.slice(0, 8).toUpperCase()}` : '-'}
                                    </small>
                                </div>
                            </div>
                        </div>

                        {!hasPricingPlan ? (
                            <div className={styles.subscriptionBox}>
                                <div className={styles.priceBreakdown}>
                                    <div className={styles.priceRow}>
                                        <span>Pricing plan</span>

                                        <strong>Unavailable</strong>
                                    </div>

                                    <div className={styles.totalDivider} />

                                    <div className={styles.totalRow}>
                                        <div>
                                            <strong>Payment unavailable</strong>

                                            <span>This site does not have a pricing plan.</span>
                                        </div>

                                        <b>—</b>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.subscriptionBox}>
                                <div className={styles.periodGrid}>
                                    {BILLING_OPTIONS.map((option) => {
                                        const active = selectedMonths === option.months;

                                        const price = monthlyPrice * option.months;

                                        const locked = confirming || hasPayment;

                                        return (
                                            <button
                                                key={option.months}
                                                type="button"
                                                className={`${styles.periodCard} ${
                                                    active ? styles.periodCardActive : ''
                                                }`}
                                                onClick={() => setSelectedMonths(option.months)}
                                                disabled={locked}
                                            >
                                                {active && (
                                                    <span className={styles.selectedMark}>
                                                        <i className="bi bi-check-lg" />
                                                    </span>
                                                )}

                                                {option.discount > 0 && (
                                                    <span className={styles.saveBadge}>
                                                        Save {option.discount}%
                                                    </span>
                                                )}

                                                <div className={styles.saveBadgeValue}>
                                                    <strong>{option.months}</strong>

                                                    <span>
                                                        {option.months === 1 ? 'Month' : 'Months'}
                                                    </span>
                                                </div>

                                                <b>{formattedMoney(price)}</b>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className={styles.priceBreakdown}>
                                    <div className={styles.priceRow}>
                                        <span>Price per month</span>

                                        <strong>{formattedMoney(monthlyPrice)}</strong>
                                    </div>

                                    <div className={styles.priceRow}>
                                        <span>Subscription period</span>

                                        <strong>
                                            {selectedMonths}{' '}
                                            {selectedMonths === 1 ? 'month' : 'months'}
                                        </strong>
                                    </div>

                                    <div className={styles.priceRow}>
                                        <span>Subtotal</span>

                                        <strong>{formattedMoney(subtotal)}</strong>
                                    </div>

                                    <div className={styles.priceRow}>
                                        <span>Discount</span>

                                        <strong
                                            className={discountAmount > 0 ? styles.discount : ''}
                                        >
                                            - {formattedMoney(discountAmount)}
                                        </strong>
                                    </div>

                                    <div className={styles.totalDivider} />

                                    <div className={styles.totalRow}>
                                        <div>
                                            <strong>Total Amount</strong>

                                            <span>VAT included</span>
                                        </div>

                                        <b>{formattedMoney(hasPayment ? paymentAmount : total)}</b>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.paymentMetaGrid}>
                            <PaymentMeta icon="bi-hash" label="Payment ID" value={paymentId} />

                            <PaymentMeta icon="bi-receipt" label="Invoice" value={invoiceNumber} />

                            <PaymentMeta icon="bi-credit-card" label="Provider" value={provider} />

                            <PaymentMeta icon="bi-wallet2" label="Method" value={method} />

                            <PaymentMeta
                                icon="bi-arrow-left-right"
                                label="Transaction"
                                value={transactionId}
                            />

                            <PaymentMeta
                                icon="bi-diagram-3"
                                label="Subscription"
                                value={subscriptionLabel}
                            />
                        </div>
                    </section>

                    <section className={styles.payment}>
                        <div className={styles.paymentContent}>
                            <div className={styles.qrAreaPanel}>
                                <div className={styles.qrArea}>
                                    <div className={styles.qrCard}>
                                        <strong>Scan to pay</strong>

                                        <div className={styles.qrFrame}>
                                            <Image
                                                src="/assets/images/payment.jpg"
                                                alt="Payment QR Code"
                                                width={280}
                                                height={280}
                                                className={styles.qrImage}
                                                priority
                                            />
                                        </div>

                                        <span>Total amount</span>

                                        <b>
                                            {hasPricingPlan
                                                ? formattedMoney(hasPayment ? paymentAmount : total)
                                                : '—'}
                                        </b>

                                        <small>
                                            <i className="bi bi-clock" />

                                            {hasPayment
                                                ? secondsLeft > 0
                                                    ? `Expires in ${String(minutes).padStart(
                                                          2,
                                                          '0',
                                                      )}:${String(seconds).padStart(2, '0')}`
                                                    : 'Payment QR expired'
                                                : 'Create payment to start'}
                                        </small>
                                    </div>
                                </div>

                                <p className={styles.qrHint}>
                                    QR payment supported by <strong>VNPAY</strong>
                                </p>
                            </div>

                            <div className={styles.transferCard}>
                                <div className={styles.transferHeader}>
                                    <div>
                                        <i className="bi bi-bank" />

                                        <strong>Bank transfer information</strong>
                                    </div>

                                    <span>Manual payment</span>
                                </div>

                                <PaymentDetail
                                    label="Bank"
                                    value="VIETCOMBANK"
                                    onCopy={() => copyValue('VIETCOMBANK')}
                                />

                                <PaymentDetail
                                    label="Account Name"
                                    value="CONG TY TNHH KBUILDER"
                                    onCopy={() => copyValue('CONG TY TNHH KBUILDER')}
                                />

                                <PaymentDetail
                                    label="Account Number"
                                    value="1234 5678 9999"
                                    onCopy={() => copyValue('123456789999')}
                                />

                                <PaymentDetail
                                    label="Transfer Content"
                                    value={paymentCode || 'Generated after payment creation'}
                                    onCopy={() => copyValue(paymentCode)}
                                />
                            </div>
                        </div>

                        <div className={styles.providerGrid}>
                            <div>
                                <span>Provider</span>

                                <strong>{provider}</strong>
                            </div>

                            <div>
                                <span>Method</span>

                                <strong>{method}</strong>
                            </div>

                            <div>
                                <span>Currency</span>

                                <strong>{currency}</strong>
                            </div>
                        </div>

                        <div className={styles.metaFooter}>
                            <div>
                                <span>Created</span>

                                <strong>{formatDate(activePayment?.createdAt ?? null)}</strong>
                            </div>

                            <div>
                                <span>Updated</span>

                                <strong>{formatDate(activePayment?.updatedAt ?? null)}</strong>
                            </div>

                            <div>
                                <span>Paid At</span>

                                <strong>{formatDate(activePayment?.paidAt ?? null)}</strong>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className={styles.footer}>
                    <div className={styles.secure}>
                        <span>
                            <i className="bi bi-shield-check" />
                        </span>

                        <div>
                            <strong>
                                {hasConfirmationRequest
                                    ? 'Confirmation requested'
                                    : hasPayment
                                      ? 'Payment pending'
                                      : 'Secure payment'}
                            </strong>

                            <p>
                                {hasConfirmationRequest
                                    ? 'Your payment has been submitted and is waiting for administrator confirmation.'
                                    : hasPayment
                                      ? 'Complete the bank transfer, then click I have paid.'
                                      : 'Create a payment first to generate your payment information.'}
                            </p>
                        </div>
                    </div>

                    <div className={styles.footerActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={confirming}
                        >
                            Close
                        </button>

                        <button
                            type="button"
                            className={styles.paidBtn}
                            onClick={handlePrimaryAction}
                            disabled={primaryActionDisabled}
                        >
                            <i className={`bi ${primaryIcon} ${confirming ? styles.spin : ''}`} />

                            {primaryLabel}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

type PaymentMetaProps = {
    icon: string;
    label: string;
    value: string;
};

function PaymentMeta({ icon, label, value }: PaymentMetaProps) {
    return (
        <div className={styles.paymentMeta}>
            <span className={styles.metaIcon}>
                <i className={`bi ${icon}`} />
            </span>

            <div>
                <span>{label}</span>

                <strong title={value}>{value}</strong>
            </div>
        </div>
    );
}

type PaymentDetailProps = {
    label: string;
    value: string;
    onCopy?: () => void;
};

function PaymentDetail({ label, value, onCopy }: PaymentDetailProps) {
    return (
        <div className={styles.detailRow}>
            <span>{label}</span>

            <div className={styles.detailValue}>
                <strong title={value}>{value}</strong>

                {onCopy && value !== '-' && (
                    <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={onCopy}
                        aria-label={`Copy ${label}`}
                    >
                        <i className="bi bi-copy" />
                    </button>
                )}
            </div>
        </div>
    );
}

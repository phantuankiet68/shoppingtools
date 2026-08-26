'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/styles/admin/sites/sites.module.css';
import { useModal } from '@/components/admin/shared/common/modal';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import SiteForm from '@/components/admin/sites/SiteForm';
import SiteTable from '@/components/admin/sites/SiteTable';
import WorkflowModal from '@/components/admin/sites/workflow/WorkflowModal';
import PaymentModal, { PaymentInfo } from '@/components/admin/sites/payment/PaymentModal';
import { useSiteActions } from '@/hooks/sites/useSiteActions';
import { SiteFormMode, SiteLike } from '@/features/sites/types';
import { CREATE_SITE_WORKFLOW } from '@/features/workflow/data';
import { WorkflowEvent } from '@/features/workflow/types';
import { applyWorkflowEvent } from '@/features/workflow/applyWorkflowEvent';
import PaymentHistoryModal from '@/components/admin/sites/payment/PaymentHistoryModal';

type PaymentApiResult = {
    success?: boolean;
    existing?: boolean;
    message?: string;
    error?: string;
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
        status?: PaymentInfo['status'];
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

function normalizePaymentInfo(result: PaymentApiResult): PaymentInfo | null {
    if (result.payment) {
        return {
            ...result.payment,
            amount:
                result.payment.amount !== undefined && result.payment.amount !== null
                    ? String(result.payment.amount)
                    : result.payment.amount,
        };
    }

    if (!result.paymentInfo) {
        return null;
    }

    return {
        id: result.paymentInfo.paymentId ?? null,
        paymentCode: result.paymentInfo.paymentCode ?? null,
        invoiceNumber: result.paymentInfo.invoiceNumber ?? null,
        amount:
            result.paymentInfo.totalAmount !== undefined && result.paymentInfo.totalAmount !== null
                ? String(result.paymentInfo.totalAmount)
                : null,
        currency: result.paymentInfo.currency ?? 'VND',
        billingMonths:
            result.paymentInfo.months !== undefined && result.paymentInfo.months !== null
                ? Number(result.paymentInfo.months)
                : null,
        provider: result.paymentInfo.provider ?? null,
        method: result.paymentInfo.method ?? null,
        status: result.paymentInfo.status ?? 'PENDING',
    };
}

export default function SitesPage() {
    const { t } = useAdminI18n();
    const modal = useModal();
    const { currentWorkspace, sites } = useAdminAuth();

    const maxSites = currentWorkspace?.accessPolicy?.maxSites ?? 1;
    const currentSiteCount = sites?.length ?? 0;
    const reachedSiteLimit = currentSiteCount >= maxSites;

    const [items, setItems] = useState<SiteLike[]>([]);
    const [busy, setBusy] = useState(false);
    const [activeId, setActiveId] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [type, setType] = useState('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
    });

    const [mode, setMode] = useState<SiteFormMode>('edit');
    const [openWorkflow, setOpenWorkflow] = useState(false);
    const [workflow, setWorkflow] = useState(CREATE_SITE_WORKFLOW);

    const [paymentSite, setPaymentSite] = useState<SiteLike | null>(null);

    const [payment, setPayment] = useState<PaymentInfo | null>(null);

    const [paymentHistorySite, setPaymentHistorySite] = useState<SiteLike | null>(null);

    const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            setBusy(true);

            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });

            if (query.trim()) {
                params.set('search', query.trim());
            }

            if (status !== 'all') {
                params.set('status', status);
            }

            if (type !== 'all') {
                params.set('type', type);
            }

            const response = await fetch(`/api/admin/sites?${params.toString()}`, {
                cache: 'no-store',
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Load failed');
            }

            setItems(data.items ?? data.sites ?? []);

            if (data.pagination) {
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Load sites error:', error);
        } finally {
            setBusy(false);
        }
    }, [page, limit, query, status, type]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void load();
        }, 300);

        return () => {
            window.clearTimeout(timer);
        };
    }, [load]);

    const active = useMemo(
        () => items.find((site) => site.id === activeId) ?? null,
        [items, activeId],
    );

    const handleWorkflowEvent = useCallback((event: WorkflowEvent) => {
        setWorkflow((current) => applyWorkflowEvent(current, event));
    }, []);

    const { handleCreate, handleSave, handleDelete } = useSiteActions({
        active,
        modal,
        t,
        load,
        setActiveId,
        maxSites,
        reachedSiteLimit,
        workspaceId: currentWorkspace?.id ?? '',
        locale: 'en',
        onWorkflowEvent: handleWorkflowEvent,
    });

    const handleCreateWorkflow = useCallback(
        async (form: Parameters<typeof handleCreate>[0]) => {
            if (!currentWorkspace?.id) {
                modal.error('Create Site Failed', 'Workspace is not available.');
                return;
            }

            setWorkflow(CREATE_SITE_WORKFLOW);

            setOpenWorkflow(true);

            await handleCreate(form);
        },
        [currentWorkspace?.id, handleCreate, modal],
    );

    const handleCreateMode = useCallback(() => {
        if (reachedSiteLimit) {
            modal.error(
                t('sites.messages.planLimitTitle'),
                t('sites.messages.planLimitDesc').replace('{count}', String(maxSites)),
            );
            return;
        }

        setActiveId('');
        setMode('create');
    }, [reachedSiteLimit, maxSites, modal, t]);

    const handleCloseForm = useCallback(() => {
        setActiveId('');
        setMode('edit');
    }, []);

    // ---------------------------------------------------------
    // Payment
    // ---------------------------------------------------------

    const findPendingPayment = useCallback((site: SiteLike | null) => {
        if (!site) {
            return null;
        }

        const pending = site.paymentSites?.find((item) => item.status === 'PENDING');

        if (!pending) {
            return null;
        }

        return {
            id: pending.id,
            paymentCode: pending.paymentCode,
            amount:
                pending.amount !== undefined && pending.amount !== null
                    ? String(pending.amount)
                    : null,
            currency: pending.currency ?? 'VND',
            billingMonths: pending.billingMonths ?? null,
            invoiceNumber: pending.invoiceNumber ?? null,
            transactionId: pending.transactionId ?? null,
            provider: pending.provider ?? null,
            method: pending.method ?? null,
            status: pending.status ?? 'PENDING',
            createdAt: pending.createdAt ?? null,
            updatedAt: pending.updatedAt ?? null,
            paidAt: pending.paidAt ?? null,
        } satisfies PaymentInfo;
    }, []);

    const handleOpenPayment = useCallback(
        (site: SiteLike) => {
            const plan = site.subscription?.plan;

            if (!plan?.id || Number(plan.price ?? 0) <= 0) {
                modal.error('Payment unavailable', 'This site does not have a pricing plan.');
                return;
            }

            const pendingPayment = findPendingPayment(site);

            setPaymentSite(site);
            setPayment(pendingPayment);
        },
        [findPendingPayment, modal],
    );

    const handleClosePayment = useCallback(() => {
        setPaymentSite(null);
        setPayment(null);
    }, []);

    /**
     * Create or reuse a pending payment.
     *
     * IMPORTANT:
     * This does NOT mean the user has paid.
     * It only creates the PaymentSite record
     * and returns its payment information.
     */
    const handleCreatePayment = useCallback(
        async (months: number) => {
            if (!paymentSite?.id) {
                throw new Error('Site is not available.');
            }

            const normalizedMonths = Number(months);

            if (![1, 3, 6, 12].includes(normalizedMonths)) {
                throw new Error('Invalid billing period. Allowed values are 1, 3, 6 or 12 months.');
            }

            const response = await fetch(`/api/admin/sites/${paymentSite.id}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    months: normalizedMonths,
                    provider: 'VNPAY',
                    method: 'BANK_TRANSFER',
                }),
            });

            const data = (await response.json().catch(() => ({}))) as PaymentApiResult;

            if (!response.ok) {
                throw new Error(data.error || 'Payment creation failed.');
            }

            const normalizedPayment = normalizePaymentInfo(data);

            if (normalizedPayment) {
                setPayment(normalizedPayment);
            }

            await load();

            return data;
        },
        [paymentSite, load],
    );

    /**
     * Submit "I have paid".
     *
     * IMPORTANT:
     * This does NOT create a new payment and
     * does NOT change payment to SUCCESS.
     * The backend confirmation endpoint only
     * records that the user requested confirmation.
     */
    const handlePaymentConfirmation = useCallback(async () => {
        if (!paymentSite?.id) {
            throw new Error('Site is not available.');
        }

        const activePayment = payment ?? findPendingPayment(paymentSite);

        if (!activePayment?.id) {
            throw new Error('No pending payment was found for this site.');
        }

        if (activePayment.status !== 'PENDING') {
            throw new Error(`This payment is no longer pending.`);
        }

        const response = await fetch(
            `/api/admin/sites/${paymentSite.id}/payments/${activePayment.id}/confirm`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            },
        );

        const data = (await response.json().catch(() => ({}))) as PaymentApiResult & {
            alreadyRequested?: boolean;
        };

        if (!response.ok) {
            throw new Error(data.error || 'Payment confirmation failed.');
        }

        const confirmedPayment = normalizePaymentInfo(data);

        if (confirmedPayment) {
            setPayment(confirmedPayment);
        }

        await load();

        return data;
    }, [paymentSite, payment, findPendingPayment, load]);

    return (
        <div className={styles.shell}>
            <div className={styles.page}>
                <aside className={styles.detail}>
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div className={styles.panelHeaderTop}>
                                <div className={styles.panelTitle}>{t('sites.form.title')}</div>

                                <div className={styles.panelSub}>
                                    {t('sites.form.sub')} ({currentSiteCount}/{maxSites})
                                </div>
                            </div>

                            <div className={styles.tableToolbar}>
                                <div className={styles.searchWrap}>
                                    <i className="bi bi-search" />

                                    <input
                                        type="search"
                                        value={query}
                                        placeholder={t('sites.table.search')}
                                        onChange={(event) => {
                                            setQuery(event.target.value);
                                            setPage(1);
                                        }}
                                    />

                                    {query && (
                                        <button
                                            type="button"
                                            className={styles.searchClear}
                                            onClick={() => {
                                                setQuery('');
                                                setPage(1);
                                            }}
                                            aria-label={t('sites.table.clearSearch')}
                                        >
                                            <i className="bi bi-x-circle-fill" />
                                        </button>
                                    )}
                                </div>

                                <div className={styles.filterGroup}>
                                    <div className={styles.filterSelect}>
                                        <i className="bi bi-funnel" />

                                        <select
                                            value={status}
                                            onChange={(event) => {
                                                setStatus(event.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="all">
                                                {t('sites.table.allStatus')}
                                            </option>

                                            <option value="DRAFT">{t('sites.status.draft')}</option>

                                            <option value="PUBLISHED">
                                                {t('sites.status.published')}
                                            </option>

                                            <option value="SUSPENDED">
                                                {t('sites.status.suspended')}
                                            </option>

                                            <option value="ARCHIVED">
                                                {t('sites.status.archived')}
                                            </option>
                                        </select>
                                    </div>

                                    <div className={styles.filterSelect}>
                                        <i className="bi bi-grid" />

                                        <select
                                            value={type}
                                            onChange={(event) => {
                                                setType(event.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="all">{t('sites.table.allTypes')}</option>

                                            <option value="landing">
                                                {t('sites.types.landing')}
                                            </option>

                                            <option value="blog">{t('sites.types.blog')}</option>

                                            <option value="ecommerce">
                                                {t('sites.types.ecommerce')}
                                            </option>

                                            <option value="booking">
                                                {t('sites.types.booking')}
                                            </option>

                                            <option value="lms">{t('sites.types.lms')}</option>
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.refreshBtn}
                                        onClick={load}
                                        disabled={busy}
                                        aria-label={t('sites.table.refresh')}
                                    >
                                        <i
                                            className={`bi bi-arrow-clockwise ${
                                                busy ? styles.spin : ''
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.panelHeaderActions}>
                                {(mode === 'create' || !!activeId) && (
                                    <button
                                        type="button"
                                        className={styles.closeBtn}
                                        onClick={handleCloseForm}
                                    >
                                        <i className="bi bi-x-lg" />
                                        {t('sites.form.close')}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className={`${styles.newBtn} ${
                                        reachedSiteLimit ? styles.newBtnDisabled : ''
                                    }`}
                                    onClick={handleCreateMode}
                                    disabled={reachedSiteLimit}
                                >
                                    <i className="bi bi-plus-lg" />
                                    {t('sites.table.newSite')}
                                </button>
                            </div>
                        </div>

                        <div className={styles.panelBody}>
                            {mode === 'edit' && !active ? (
                                <></>
                            ) : (
                                <SiteForm
                                    key={`${mode}-${active?.id ?? 'new'}`}
                                    mode={mode}
                                    active={active}
                                    busy={busy}
                                    onSave={handleSave}
                                    onCreate={handleCreateWorkflow}
                                />
                            )}
                        </div>
                    </div>
                </aside>

                <div className={styles.left}>
                    <WorkflowModal
                        open={openWorkflow}
                        workflow={workflow}
                        onClose={() => setOpenWorkflow(false)}
                    />

                    <SiteTable
                        items={items}
                        activeId={activeId}
                        t={t}
                        setActiveId={setActiveId}
                        setMode={setMode}
                        onDelete={handleDelete}
                        onPayment={handleOpenPayment}
                        onPaymentHistory={(site) => {
                            setPaymentHistorySite(site);
                            setPaymentHistoryOpen(true);
                        }}
                        pagination={pagination}
                        setPage={setPage}
                        busy={busy}
                    />
                </div>

                <PaymentModal
                    open={!!paymentSite}
                    onClose={handleClosePayment}
                    site={paymentSite}
                    payment={payment}
                    onCreatePayment={handleCreatePayment}
                    onPaymentConfirmation={handlePaymentConfirmation}
                />

                <PaymentHistoryModal
                    open={paymentHistoryOpen}
                    site={paymentHistorySite}
                    onClose={() => {
                        setPaymentHistoryOpen(false);
                        setPaymentHistorySite(null);
                    }}
                    onRenew={(site) => {
                        setPaymentHistoryOpen(false);
                        setPaymentHistorySite(null);
                        handleOpenPayment(site);
                    }}
                />
            </div>
        </div>
    );
}

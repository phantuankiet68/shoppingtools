'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/styles/admin/sites/sites.module.css';
import { useModal } from '@/components/admin/shared/common/modal';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import SiteForm from '@/components/admin/sites/SiteForm';
import SiteTable from '@/components/admin/sites/SiteTable';
import WorkflowModal from '@/components/admin/sites/workflow/WorkflowModal';
import PaymentModal from '@/components/admin/sites/payment/PaymentModal';
import { useSiteActions } from '@/hooks/sites/useSiteActions';
import { SiteFormMode, SiteLike } from '@/features/sites/types';
import { CREATE_SITE_WORKFLOW } from '@/features/workflow/data';
import { WorkflowEvent } from '@/features/workflow/types';
import { applyWorkflowEvent } from '@/features/workflow/applyWorkflowEvent';
import PaymentHistoryModal from '@/components/admin/sites/payment/PaymentHistoryModal';

type PaymentConfirmationPayload = {
    months: number;
    amount?: number;
    paymentCode?: string;
};

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

        return () => window.clearTimeout(timer);
    }, [load]);

    const active = useMemo(
        () => items.find((site) => site.id === activeId) ?? null,
        [items, activeId],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return items;
        }

        return items.filter((site) => `${site.name} ${site.domain}`.toLowerCase().includes(q));
    }, [items, query]);

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

    const handleOpenPayment = useCallback((site: SiteLike) => {
        setPaymentSite(site);
    }, []);

    const handleClosePayment = useCallback(() => {
        setPaymentSite(null);
    }, []);

    const handlePaymentConfirmation = useCallback(
        async (payload: PaymentConfirmationPayload) => {
            if (!paymentSite?.id) {
                throw new Error('Site is not available.');
            }

            const months = Number(payload.months);

            if (![1, 3, 6, 12].includes(months)) {
                throw new Error('Invalid billing period. Allowed values are 1, 3, 6 or 12 months.');
            }

            const response = await fetch(`/api/admin/sites/${paymentSite.id}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    months,
                    provider: 'VNPAY',
                    method: 'BANK_TRANSFER',
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Payment creation failed.');
            }

            // Refresh sites so the latest payment/subscription
            // information is available.
            await load();

            // Close payment modal after successful creation.
            setPaymentSite(null);
        },
        [paymentSite, load],
    );

    const handlePaymentHistory = useCallback((site: SiteLike) => {
        setPaymentHistorySite(site);
        setPaymentHistoryOpen(true);
    }, []);

    const handleClosePaymentHistory = useCallback(() => {
        setPaymentHistoryOpen(false);
        setPaymentHistorySite(null);
    }, []);

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
                        items={filtered}
                        activeId={activeId}
                        t={t}
                        setActiveId={setActiveId}
                        setMode={setMode}
                        onDelete={handleDelete}
                        onPayment={(site) => {
                            setPaymentSite(site);
                        }}
                        onPaymentHistory={(site) => {
                            setPaymentHistorySite(site);
                            setPaymentHistoryOpen(true);
                        }}
                        search={query}
                        setSearch={setQuery}
                        status={status}
                        setStatus={(value) => {
                            setStatus(value);
                            setPage(1);
                        }}
                        type={type}
                        setType={(value) => {
                            setType(value);
                            setPage(1);
                        }}
                        pagination={pagination}
                        setPage={setPage}
                        onRefresh={load}
                        busy={busy}
                    />
                </div>

                <PaymentModal
                    open={!!paymentSite}
                    onClose={handleClosePayment}
                    site={paymentSite}
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

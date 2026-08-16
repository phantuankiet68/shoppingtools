'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/styles/admin/sites/sites.module.css';
import { useModal } from '@/components/admin/shared/common/modal';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import SiteForm from '@/components/admin/sites/SiteForm';
import SiteTable from '@/components/admin/sites/SiteTable';
import WorkflowModal from '@/components/admin/sites/workflow/WorkflowModal';
import { useSiteActions } from '@/hooks/sites/useSiteActions';
import { SiteFormMode, SiteLike } from '@/features/sites/types';
import { CREATE_SITE_WORKFLOW } from '@/features/workflow/data';
import { WorkflowData, WorkflowEvent } from '@/features/workflow/types';
import { applyWorkflowEvent } from '@/features/workflow/applyWorkflowEvent';

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
    const [mode, setMode] = useState<SiteFormMode>('edit');
    const [openWorkflow, setOpenWorkflow] = useState(false);
    const [workflow, setWorkflow] = useState(CREATE_SITE_WORKFLOW);

    const load = useCallback(async () => {
        try {
            setBusy(true);
            const response = await fetch('/api/admin/sites', {
                cache: 'no-store',
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Load failed');
            }
            const sites = data.items ?? data.sites ?? [];
            setItems(sites);
        } catch (error) {
            console.error(error);
        } finally {
            setBusy(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const active = items.find((site) => site.id === activeId) ?? null;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((site) => `${site.name} ${site.domain}`.toLowerCase().includes(q));
    }, [items, query]);

    const handleWorkflowEvent = useCallback((event: WorkflowEvent) => {
        setWorkflow((current) => applyWorkflowEvent(current, event));
    }, []);

    const { handleCreate, handleSave, handleDelete, handleRefresh } = useSiteActions({
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
    }, [reachedSiteLimit, maxSites, modal, setActiveId, t]);

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

                            <button
                                className={`${styles.newBtn} ${reachedSiteLimit ? styles.newBtnDisabled : ''}`}
                                onClick={handleCreateMode}
                                disabled={reachedSiteLimit}
                            >
                                <i className="bi bi-plus-lg" />
                                {t('sites.table.newSite')}
                            </button>
                        </div>

                        <div className={styles.panelBody}>
                            {mode === 'edit' && !active ? (
                                <div className={styles.empty}>{t('sites.form.selectSite')}</div>
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
                    />
                </div>
            </div>
        </div>
    );
}

import { useCallback } from 'react';
import { SiteFormState, SiteLike } from '@/features/sites/types';
import { createSiteWorkflow } from '@/features/workflow/createSiteWorkflow';
import { WorkflowEvent } from '@/features/workflow/types';

type UseSiteActionsProps = {
    active?: SiteLike | null;
    modal: any;
    t: (key: string) => string;
    load: () => Promise<void>;
    setActiveId: (id: string) => void;
    maxSites: number;
    reachedSiteLimit: boolean;
    workspaceId: string;
    locale?: 'vi' | 'en' | 'ja';
    onWorkflowEvent?: (event: WorkflowEvent) => void;
};

export function useSiteActions({
    active,
    modal,
    t,
    load,
    setActiveId,
    maxSites,
    reachedSiteLimit,
    workspaceId,
    locale = 'en',
    onWorkflowEvent,
}: UseSiteActionsProps) {
    const handleRefresh = useCallback(async () => {
        await load();
    }, [load]);

    const handleCreate = useCallback(
        async (form: SiteFormState) => {
            if (reachedSiteLimit) {
                modal.error(
                    t('sites.messages.planLimitTitle'),
                    t('sites.messages.planLimitDesc').replace('{count}', String(maxSites)),
                );
                return;
            }

            if (!workspaceId) {
                modal.error(t('sites.messages.createFailed'), 'Workspace is not available.');
                return;
            }

            try {
                const result = await createSiteWorkflow({
                    form,
                    workspaceId,
                    locale,
                    load,
                    onEvent: onWorkflowEvent,
                });

                if (result?.siteId) {
                    setActiveId(result.siteId);
                }

                modal.success(
                    t('sites.messages.success'),
                    t('sites.messages.createSuccess').replace('{name}', form.name),
                );

                return result;
            } catch (error) {
                console.error('[Create Site Workflow]', error);

                modal.error(
                    t('sites.messages.createFailed'),
                    error instanceof Error ? error.message : t('sites.messages.createFailedDesc'),
                );

                throw error;
            }
        },
        [
            load,
            locale,
            maxSites,
            modal,
            onWorkflowEvent,
            reachedSiteLimit,
            setActiveId,
            t,
            workspaceId,
        ],
    );

    const handleSave = useCallback(
        async (form: SiteFormState) => {
            if (!active) return;

            try {
                const formData = new FormData();

                formData.append('name', form.name);
                formData.append('domain', form.domain);
                formData.append('type', form.type);
                formData.append('category', form.category);
                formData.append('contactEmail', form.contactEmail);
                formData.append('contactPhone', form.contactPhone);
                formData.append('seoTitle', form.seoTitle);
                formData.append('seoDescription', form.seoDescription);
                formData.append('status', form.status);
                formData.append('isPublic', String(form.isPublic));
                formData.append('publishedAt', form.publishedAt || '');

                if (form.logoFile) {
                    formData.append('logo', form.logoFile);
                }

                if (form.faviconFile) {
                    formData.append('favicon', form.faviconFile);
                }

                const response = await fetch(`/api/admin/sites/${active.id}`, {
                    method: 'PATCH',
                    body: formData,
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Update failed');
                }

                await load();

                modal.success(
                    t('sites.messages.success'),
                    t('sites.messages.updateSuccess').replace('{name}', form.name),
                );
            } catch (error) {
                console.error('[Update Site]', error);

                modal.error(
                    'Update Failed',
                    error instanceof Error ? error.message : 'Unknown error',
                );
            }
        },
        [active, load, modal, t],
    );

    const handleDelete = useCallback(
        (site: SiteLike) => {
            modal.confirmDelete(
                t('sites.messages.deleteTitle'),
                t('sites.messages.deleteDesc').replace('{name}', site.name),
                async () => {
                    try {
                        const response = await fetch(`/api/admin/sites/${site.id}`, {
                            method: 'DELETE',
                        });

                        const data = await response.json().catch(() => ({}));

                        if (!response.ok) {
                            throw new Error(data.message || data.error || 'Delete failed');
                        }

                        await load();

                        modal.success(
                            t('sites.messages.success'),
                            t('sites.messages.deleteSuccess').replace('{name}', site.name),
                        );
                    } catch (error) {
                        console.error('[Delete Site]', error);

                        modal.error(
                            'Delete Failed',
                            error instanceof Error ? error.message : 'Unknown error',
                        );
                    }
                },
            );
        },
        [load, modal, t],
    );

    return {
        handleCreate,
        handleSave,
        handleDelete,
        handleRefresh,
    };
}

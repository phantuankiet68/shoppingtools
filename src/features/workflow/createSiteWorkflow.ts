import { WorkflowEvent, WorkflowStageId } from '@/features/workflow/types';
import { SiteFormState } from '@/features/sites/types';

type WorkflowLocale = 'vi' | 'en' | 'ja';

type CreateSiteWorkflowOptions = {
    form: SiteFormState;
    workspaceId: string;
    locale?: WorkflowLocale;
    onEvent?: (event: WorkflowEvent) => void;
    load?: () => Promise<void>;
};

type ApiResponse<T = unknown> = {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
};

type CreateSiteResponse = {
    siteId: string;
    site: unknown;
};

type MenuTemplateResponse = {
    menus: unknown[];
};

type TranslateMenuResponse = {
    menus: unknown[];
};

type GenerateMenuResponse = {
    items: unknown[];
};

type StageResult<T = unknown> = {
    data: T;
    duration: number;
};

const now = () => Date.now();

async function readResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error =
            typeof data.error === 'string'
                ? data.error
                : typeof data.message === 'string'
                  ? data.message
                  : data.error
                    ? JSON.stringify(data.error)
                    : 'Request failed.';

        throw new Error(error);
    }

    if (data.success === false) {
        const error =
            typeof data.error === 'string'
                ? data.error
                : data.error
                  ? JSON.stringify(data.error)
                  : 'Request failed.';

        throw new Error(error);
    }

    return data;
}

async function postJson<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const result = await readResponse<T>(response);

    return (result.data ?? result) as T;
}

async function runStage<T>(
    stageId: WorkflowStageId,
    callback: () => Promise<T>,
    onEvent?: (event: WorkflowEvent) => void,
): Promise<StageResult<T>> {
    const startedAt = now();

    onEvent?.({
        type: 'node:start',
        nodeId: stageId,
        startedAt,
    });

    try {
        const data = await callback();
        const completedAt = now();
        const duration = completedAt - startedAt;

        onEvent?.({
            type: 'node:success',
            nodeId: stageId,
            completedAt,
            duration,
            responseData: data,
        });

        return {
            data,
            duration,
        };
    } catch (error) {
        const completedAt = now();
        const duration = completedAt - startedAt;
        const message = error instanceof Error ? error.message : 'Workflow stage failed.';

        onEvent?.({
            type: 'node:error',
            nodeId: stageId,
            completedAt,
            duration,
            error: message,
        });

        throw error;
    }
}

function buildCreatePayload(form: SiteFormState, workspaceId: string) {
    return {
        name: form.name,
        domain: form.domain,
        type: form.type,
        category: form.category || null,
        contactEmail: form.contactEmail || null,
        contactPhone: form.contactPhone || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        status: form.status,
        isPublic: form.isPublic,
        publishedAt: form.publishedAt || null,
        workspaceId,
    };
}

function buildPublicPages(menus: any[]) {
    return menus
        .filter(
            (menu) => menu?.path && typeof menu.path === 'string' && !menu.path.startsWith('/__'),
        )
        .map((menu) => ({
            title: String(menu.title ?? '').trim(),
            path: String(menu.path).trim(),
            sortOrder: typeof menu.sortOrder === 'number' ? menu.sortOrder : undefined,
        }))
        .filter(
            (page, index, array) =>
                page.title &&
                page.path &&
                array.findIndex((item) => item.path === page.path) === index,
        );
}

export async function createSiteWorkflow({
    form,
    workspaceId,
    locale = 'en',
    onEvent,
    load,
}: CreateSiteWorkflowOptions) {
    const workflowStartedAt = now();

    onEvent?.({
        type: 'workflow:start',
        startedAt: workflowStartedAt,
    });

    try {
        if (!workspaceId) {
            throw new Error('Workspace is required.');
        }

        const createPayload = buildCreatePayload(form, workspaceId);

        await runStage(
            'validate',
            () =>
                postJson('/api/admin/sites/validate', {
                    ...createPayload,
                }),
            onEvent,
        );

        await runStage(
            'check-domain',
            () =>
                postJson('/api/admin/sites/check-domain', {
                    domain: form.domain,
                }),
            onEvent,
        );

        const createResult = await runStage<CreateSiteResponse>(
            'create',
            () => postJson<CreateSiteResponse>('/api/admin/sites/create', createPayload),
            onEvent,
        );

        const siteId = String(createResult.data.siteId ?? '').trim();

        if (!siteId) {
            throw new Error('Site ID was not returned after site creation.');
        }

        const assetsFormData = new FormData();
        assetsFormData.append('siteId', siteId);

        if (form.logoFile) {
            assetsFormData.append('logo', form.logoFile);
        }

        if (form.faviconFile) {
            assetsFormData.append('favicon', form.faviconFile);
        }

        await runStage(
            'assets',
            async () => {
                const response = await fetch('/api/admin/sites/assets', {
                    method: 'POST',
                    body: assetsFormData,
                });
                const result = await readResponse(response);

                return result.data ?? result;
            },
            onEvent,
        );

        const templateResult = await runStage<MenuTemplateResponse>(
            'menu-template',
            () =>
                postJson<MenuTemplateResponse>('/api/admin/sites/menu/template', {
                    type: form.type,
                    category: form.category || null,
                }),
            onEvent,
        );

        const menus = templateResult.data.menus ?? [];

        if (!menus.length) {
            throw new Error('Menu template is empty.');
        }

        const translateResult = await runStage<TranslateMenuResponse>(
            'menu-translate',
            () =>
                postJson<TranslateMenuResponse>('/api/admin/sites/menu/translate', {
                    menus,
                    locale,
                }),
            onEvent,
        );

        const translatedMenus = translateResult.data.menus ?? [];

        if (!translatedMenus.length) {
            throw new Error('Translated menu is empty.');
        }

        const generateResult = await runStage<GenerateMenuResponse>(
            'menu-generate',
            () =>
                postJson<GenerateMenuResponse>('/api/admin/sites/menu/generate', {
                    siteId,
                    menus: translatedMenus,
                }),
            onEvent,
        );

        const items = generateResult.data.items ?? [];

        if (!items.length) {
            throw new Error('Generated menu items are empty.');
        }

        await runStage(
            'menu-save',
            () =>
                postJson('/api/admin/sites/menu/save', {
                    siteId,
                    items,
                }),
            onEvent,
        );

        await runStage(
            'system-pages',
            () =>
                postJson('/api/admin/sites/pages/system', {
                    siteId,
                }),
            onEvent,
        );

        const pages = buildPublicPages(translatedMenus);

        if (!pages.length) {
            throw new Error('Public pages are empty.');
        }

        await runStage(
            'public-pages',
            () =>
                postJson('/api/admin/sites/pages/public', {
                    siteId,
                    pages,
                }),
            onEvent,
        );

        await runStage(
            'page-seo',
            () =>
                postJson('/api/admin/sites/pages/seo', {
                    siteId,
                }),
            onEvent,
        );

        const completeResult = await runStage(
            'complete',
            () =>
                postJson('/api/admin/sites/complete', {
                    siteId,
                }),
            onEvent,
        );

        const reloadStartedAt = now();

        onEvent?.({
            type: 'node:start',
            nodeId: 'reload',
            startedAt: reloadStartedAt,
        });

        try {
            await load?.();

            const reloadCompletedAt = now();

            onEvent?.({
                type: 'node:success',
                nodeId: 'reload',
                completedAt: reloadCompletedAt,
                duration: reloadCompletedAt - reloadStartedAt,
            });
        } catch (error) {
            const reloadCompletedAt = now();
            const message = error instanceof Error ? error.message : 'Failed to reload site list.';

            onEvent?.({
                type: 'node:error',
                nodeId: 'reload',
                completedAt: reloadCompletedAt,
                duration: reloadCompletedAt - reloadStartedAt,
                error: message,
            });

            throw error;
        }

        const workflowCompletedAt = now();
        const workflowDuration = workflowCompletedAt - workflowStartedAt;

        onEvent?.({
            type: 'node:start',
            nodeId: 'end',
            startedAt: workflowCompletedAt,
        });

        onEvent?.({
            type: 'node:success',
            nodeId: 'end',
            completedAt: workflowCompletedAt,
            duration: 0,
        });

        onEvent?.({
            type: 'workflow:complete',
            completedAt: workflowCompletedAt,
            duration: workflowDuration,
        });

        return {
            success: true,
            siteId,
            result: completeResult.data,
            duration: workflowDuration,
        };
    } catch (error) {
        const completedAt = now();
        const duration = completedAt - workflowStartedAt;
        const message = error instanceof Error ? error.message : 'Failed to create site.';

        onEvent?.({
            type: 'workflow:error',
            completedAt,
            duration,
            error: message,
        });

        throw error;
    }
}

'use client';

import PageInspectorHeader from '@/components/admin/pages/PageInspector/PageInspectorHeader';
import PageSEOForm from '@/components/admin/pages/PageInspector/PageSEOForm';
import SyncPageModal from '@/components/admin/pages/PageInspector/SyncPageModal';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useModal } from '@/components/admin/shared/common/modal';
import { API_ROUTES } from '@/constants/api';
import { fillAutoSEO, PageRow, SEO } from '@/lib/pages/types';
import style from '@/styles/admin/pages/PageInspector.module.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
    page: PageRow | null;
    onEdit: () => void;
    onPreview: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    initialSeo?: SEO | null;
};

type SyncForm = {
    siteId: string;
    title: string;
    slug: string;
    path: string;
};

function hasMeaningfulSeo(seo?: Partial<SEO> | null) {
    if (!seo) return false;

    return Boolean(
        seo.metaTitle ||
        seo.metaDescription ||
        seo.focusKeyword ||
        seo.canonicalUrl ||
        seo.ogTitle ||
        seo.ogDescription ||
        seo.ogImage ||
        seo.ogImageAlt ||
        seo.structuredData,
    );
}

function normalizePath(raw?: string | null) {
    const s = (raw || '').trim();
    if (!s || s === '/') return '/';

    const parts = s
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean);

    return parts.length ? `/${parts.join('/')}` : '/';
}

function normalizeSlug(raw?: string | null) {
    const s = (raw || '').trim();
    if (!s || s === '/') return '';

    const parts = s
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean);

    return parts[parts.length - 1] || '';
}

function getLastSlugSegment(raw?: string | null) {
    return normalizeSlug(raw);
}

function buildPathFromSlug(slug: string) {
    const cleaned = normalizeSlug(slug);
    return cleaned ? `/${cleaned}` : '/';
}

function replaceLastPathSegment(path: string, slug: string) {
    const normalizedPath = normalizePath(path);
    const parts = normalizedPath.split('/').filter(Boolean);
    const cleanedSlug = normalizeSlug(slug);

    if (!cleanedSlug) {
        if (parts.length <= 1) return '/';
        return `/${parts.slice(0, -1).join('/')}`;
    }

    if (parts.length === 0) {
        return `/${cleanedSlug}`;
    }

    parts[parts.length - 1] = cleanedSlug;
    return `/${parts.join('/')}`;
}

function sanitizeSeo(seo?: Partial<SEO> | null): SEO {
    return {
        metaTitle: seo?.metaTitle ?? '',

        metaDescription: seo?.metaDescription ?? '',

        canonicalUrl: seo?.canonicalUrl ?? '',

        robots: seo?.robots ?? 'index,follow',

        focusKeyword: seo?.focusKeyword ?? '',

        ogTitle: seo?.ogTitle ?? '',

        ogDescription: seo?.ogDescription ?? '',

        ogImage: seo?.ogImage ?? '',

        ogImageAlt: seo?.ogImageAlt ?? '',

        ogType: seo?.ogType ?? 'website',

        sitemapChangefreq: seo?.sitemapChangefreq ?? 'weekly',

        sitemapPriority: seo?.sitemapPriority ?? 0.8,

        structuredData: seo?.structuredData ?? '',
    };
}

function buildDefaultSEO(page: PageRow | null, initialSeo?: Partial<SEO> | null): SEO {
    const base: SEO = {
        metaTitle: page?.title || '',
        metaDescription: '',

        canonicalUrl: '',

        robots: 'index,follow',

        focusKeyword: '',

        ogTitle: page?.title || '',
        ogDescription: '',

        ogImage: '',
        ogImageAlt: '',

        ogType: 'website',

        sitemapChangefreq: 'weekly',
        sitemapPriority: 0.8,

        structuredData: '',
    };

    return {
        ...base,
        ...sanitizeSeo(initialSeo),
    };
}

function isAbortError(error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
        return true;
    }

    if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name?: string }).name === 'AbortError'
    ) {
        return true;
    }

    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'ERR_CANCELED'
    ) {
        return true;
    }

    return false;
}

function PageInspector({
    page,
    onEdit,
    onPreview,
    onPublish,
    onUnpublish,
    onDelete,
    initialSeo = null,
}: Props) {
    const modal = useModal();
    const { currentSite } = useAdminAuth();
    const { t } = useAdminI18n();

    const siteId = currentSite?.id ?? '';
    const siteName = currentSite?.name ?? '';
    const hasPage = !!page?.id;

    const [seo, setSeo] = useState<SEO>(() => buildDefaultSEO(page, initialSeo));
    const [savingSEO, setSavingSEO] = useState(false);

    const [syncOpen, setSyncOpen] = useState(false);
    const [syncingPage, setSyncingPage] = useState(false);
    const [syncForm, setSyncForm] = useState<SyncForm>({
        siteId,
        title: '',
        slug: '',
        path: '/',
    });

    const initializedPageIdRef = useRef<string | null>(null);
    const fetchedSeoPageIdRef = useRef<string | null>(null);

    const pathPretty = useMemo(() => normalizePath(page?.path || '/'), [page?.path]);

    const dateTimeFormatter = useMemo(() => {
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }, []);

    const updatedText = useMemo(() => {
        if (!page) return '';
        const ts = page.updatedAt || page.createdAt || 0;
        return ts ? dateTimeFormatter.format(new Date(ts)) : t('pages.pageInspector.noDate');
    }, [page, dateTimeFormatter, t]);

    useEffect(() => {
        if (!page?.id) {
            initializedPageIdRef.current = null;
            fetchedSeoPageIdRef.current = null;
            setSeo(buildDefaultSEO(null, null));
            return;
        }

        if (initializedPageIdRef.current === page.id) return;

        initializedPageIdRef.current = page.id;
        fetchedSeoPageIdRef.current = null;

        setSeo(buildDefaultSEO(page, hasMeaningfulSeo(initialSeo) ? initialSeo : null));
    }, [page?.id, initialSeo, page]);

    useEffect(() => {
        if (!page?.id) return;
        if (hasMeaningfulSeo(initialSeo)) return;
        if (fetchedSeoPageIdRef.current === page.id) return;

        const controller = new AbortController();
        const pageId = page.id;
        let disposed = false;

        (async () => {
            try {
                const r = await fetch(API_ROUTES.ADMIN_BUILDER.PAGE_SEO(pageId), {
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!r.ok) {
                    if (disposed || controller.signal.aborted) return;

                    if (r.status === 404) {
                        fetchedSeoPageIdRef.current = pageId;
                        return;
                    }

                    modal.error(t('common.error'), t('pages.pageInspector.loadSeoFailed'));
                    return;
                }

                const data = await r.json();

                if (disposed || controller.signal.aborted) return;

                fetchedSeoPageIdRef.current = pageId;

                if (data?.seo) {
                    setSeo((prev) => ({
                        ...prev,
                        ...sanitizeSeo(data.seo),
                    }));
                }
            } catch (error) {
                if (isAbortError(error) || controller.signal.aborted || disposed) {
                    return;
                }

                modal.error(t('common.error'), t('pages.pageInspector.loadSeoFailed'));
            }
        })();

        return () => {
            disposed = true;
            controller.abort();
        };
    }, [page?.id, initialSeo, modal, t]);

    useEffect(() => {
        if (!page?.id) return;

        setSeo((prev) => ({
            ...prev,
            metaTitle: prev.metaTitle || page.title || '',
            ogTitle: prev.ogTitle || page.title || '',
        }));
    }, [page?.id, page?.title]);

    useEffect(() => {
        setSyncForm((prev) => {
            if (prev.siteId === siteId) return prev;
            return {
                ...prev,
                siteId,
            };
        });
    }, [siteId]);

    const openSyncModal = useCallback(() => {
        setSyncForm({
            siteId,
            title: page?.title || '',
            slug: getLastSlugSegment(page?.slug || page?.path || ''),
            path: normalizePath(page?.path || buildPathFromSlug(page?.slug || '')),
        });

        setSyncOpen(true);
    }, [page, siteId]);

    const closeSyncModal = useCallback(() => {
        if (syncingPage) return;
        setSyncOpen(false);
    }, [syncingPage]);

    const handleSyncFormChange = useCallback((field: keyof SyncForm, value: string) => {
        setSyncForm((prev) => {
            const next = { ...prev };

            if (field === 'siteId') {
                next.siteId = value;
                return next;
            }

            if (field === 'title') {
                next.title = value;
                return next;
            }

            if (field === 'slug') {
                const slug = normalizeSlug(value);
                next.slug = slug;
                next.path = replaceLastPathSegment(prev.path, slug);
                return next;
            }

            if (field === 'path') {
                const path = normalizePath(value);
                next.path = path;
                next.slug = getLastSlugSegment(path);
                return next;
            }

            return next;
        });
    }, []);

    const handleAutoSEO = useCallback(() => {
        if (!page?.id) return;

        const { seo: nextSeo } = fillAutoSEO(t, {
            title: page.title || t('pages.pageInspector.newPage'),

            path: page.path || '/',

            siteName: currentSite?.name,

            category: currentSite?.category,
        });

        setSeo((prev) => ({
            ...prev,
            ...sanitizeSeo(nextSeo),
        }));

        modal.success(t('pageList.common.success'), t('pages.pageInspector.autoSeoCompleted'));
    }, [page, modal, t]);

    const handleSaveSEO = useCallback(async () => {
        if (!page?.id) return;

        try {
            setSavingSEO(true);

            const res = await fetch(API_ROUTES.ADMIN_BUILDER.PAGE_SEO(page.id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seo }),
            });

            if (!res.ok) {
                const j = await res.json().catch(() => null);
                throw new Error(j?.error || t('pages.pageInspector.saveSeoFailed'));
            }

            modal.success(t('pageList.common.success'), t('pages.pageInspector.saveSeoSuccess'));
        } catch (e: unknown) {
            modal.error(
                t('common.error'),
                (e as Error)?.message || t('pages.pageInspector.saveSeoError'),
            );
        } finally {
            setSavingSEO(false);
        }
    }, [page?.id, seo, modal, t]);

    const handleSyncFromMenu = useCallback(async () => {
        try {
            const currentSiteId = syncForm.siteId.trim() || siteId;
            const title = syncForm.title.trim();
            const manualSlug = normalizeSlug(syncForm.slug);
            const path = syncForm.path.trim()
                ? normalizePath(syncForm.path)
                : buildPathFromSlug(manualSlug);
            const slug = getLastSlugSegment(path) || manualSlug;

            if (!currentSiteId) {
                modal.error(
                    t('pages.pageInspector.missingSite'),
                    t('pages.pageInspector.currentSiteNotFound'),
                );
                return;
            }

            if (!title) {
                modal.error(
                    t('pages.pageInspector.missingTitle'),
                    t('pages.pageInspector.pleaseEnterTitle'),
                );
                return;
            }

            if (!slug) {
                modal.error(
                    t('pages.pageInspector.missingSlug'),
                    t('pages.pageInspector.pleaseEnterSlug'),
                );
                return;
            }

            setSyncingPage(true);

            const res = await fetch(API_ROUTES.ADMIN_BUILDER_PAGE_SYNC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    siteId: currentSiteId,
                    items: [{ title, slug, path }],
                }),
                cache: 'no-store',
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.error || t('pages.pageInspector.syncPageFailed'));
            }

            modal.success(t('pageList.common.success'), t('pages.pageInspector.syncPageSuccess'));
            setSyncOpen(false);
            setSyncForm((prev) => ({
                ...prev,
                siteId: currentSiteId,
                title,
                slug,
                path,
            }));
        } catch (e: unknown) {
            modal.error(
                t('common.error'),
                (e as Error)?.message || t('pages.pageInspector.syncPageError'),
            );
        } finally {
            setSyncingPage(false);
        }
    }, [syncForm, siteId, modal, t]);
    const handleDelete = useCallback(() => {
        if (!page?.id) return;

        const pageTitle = page.title || t('pages.pageInspector.thisPage');

        modal.confirmDelete(
            t('pages.pageInspector.deletePageTitle'),
            `${t('pages.pageInspector.deletePageConfirm')} "${pageTitle}"`,
            () => onDelete(),
        );
    }, [page, onDelete, modal, t]);

    const actionButtons = useMemo(
        () => [
            {
                key: 'preview',
                label: t('pages.pageInspector.preview'),
                hotkey: 'F2',
                icon: 'bi-eye',
                onClick: onPreview,
                disabled: !hasPage,
            },
            {
                key: 'delete',
                label: t('pages.pageInspector.delete'),
                hotkey: 'F3',
                icon: 'bi-trash',
                onClick: handleDelete,
                disabled: !hasPage,
            },
            {
                key: 'edit',
                label: t('pages.pageInspector.edit'),
                hotkey: 'F6',
                icon: 'bi-pencil',
                onClick: onEdit,
                disabled: !hasPage,
            },
            {
                key: 'autoSeo',
                label: t('pages.pageInspector.autoSeo'),
                hotkey: 'F9',
                icon: 'bi-magic',
                onClick: handleAutoSEO,
                disabled: !hasPage,
            },
            {
                key: 'saveSeo',
                label: savingSEO
                    ? t('pages.pageInspector.saving')
                    : t('pages.pageInspector.saveSeo'),
                hotkey: 'F10',
                icon: 'bi-save',
                onClick: () => void handleSaveSEO(),
                disabled: !hasPage || savingSEO,
            },
            {
                key: 'publishToggle',
                label:
                    page?.status === 'PUBLISHED'
                        ? t('pages.pageInspector.unpublish')
                        : t('pages.pageInspector.publish'),
                hotkey: 'F11',
                icon: page?.status === 'PUBLISHED' ? 'bi-eye-slash' : 'bi-upload',
                onClick: () => {
                    if (!hasPage) return;
                    if (page?.status === 'PUBLISHED') onUnpublish();
                    else onPublish();
                },
                disabled: !hasPage,
            },
        ],
        [
            hasPage,
            onPreview,
            handleDelete,
            openSyncModal,
            onEdit,
            handleAutoSEO,
            handleSaveSEO,
            savingSEO,
            page?.status,
            onPublish,
            onUnpublish,
            siteId,
            t,
        ],
    );

    return (
        <>
            <section className={style.containerSeo}>
                {hasPage ? (
                    <>
                        <PageInspectorHeader
                            title={page?.title || t('pages.pageInspector.untitled')}
                            path={pathPretty}
                            status={page?.status || 'DRAFT'}
                            updatedText={updatedText}
                            hasPage={hasPage}
                            savingSEO={savingSEO}
                            onPreview={onPreview}
                            onEdit={onEdit}
                            onPublish={onPublish}
                            onUnpublish={onUnpublish}
                            onDelete={handleDelete}
                            onAutoSEO={handleAutoSEO}
                            onSaveSEO={() => void handleSaveSEO()}
                            t={t}
                        />

                        <PageSEOForm seo={seo} onChange={setSeo} />
                    </>
                ) : (
                    <div>
                        <p>{t('pages.pageInspector.emptyState')}</p>
                    </div>
                )}
            </section>

            <SyncPageModal
                open={syncOpen}
                syncing={syncingPage}
                siteId={siteId}
                siteName={siteName}
                title={syncForm.title}
                slug={syncForm.slug}
                path={syncForm.path}
                t={t}
                onClose={closeSyncModal}
                onTitleChange={(value) => handleSyncFormChange('title', value)}
                onSlugChange={(value) => handleSyncFormChange('slug', value)}
                onPathChange={(value) => handleSyncFormChange('path', value)}
                onSubmit={() => void handleSyncFromMenu()}
            />
        </>
    );
}

export default React.memo(PageInspector);

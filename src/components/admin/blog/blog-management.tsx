'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useModal } from '@/components/admin/shared/common/modal';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import styles from './blog-management.module.css';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import AddBlogModal from '@/components/admin/blog/modal/add-blog-modal';
type MainTab = 'posts' | 'taxonomy';
type TaxonomyTab = 'blog' | 'wiki' | 'tag';
type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
type Locale = 'vi' | 'en' | 'ja';

type Translation = {
    id?: string;
    locale: Locale;
    name: string;
};

type TaxonomyItem = {
    id: string;
    siteId: string;
    name: string;
    slug: string;
    icon: string;
    count: number;
    status: ContentStatus;
    sortOrder: number;
    isFeatured: boolean;
    isVisible: boolean;
    description?: string;
    color?: string;
    translations?: Translation[];
};

type BlogPost = {
    id: string;
    title: string;
    thumbnail: string;
    blogCategory: string;
    wikiCategory: string;
    tags: string[];
    status: ContentStatus;
    views: number;
    publishedAt: string;
};

type TaxonomyFormState = {
    slug: string;
    icon: string;
    status: ContentStatus;
    sortOrder: string;
    isFeatured: boolean;
    isVisible: boolean;
    translations: Record<Locale, string>;
    name: string;
    description: string;
    color: string;
};

type ApiResponse<T> = {
    data?: T;
    items?: T;
    results?: T;
    pagination?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
    message?: string;
    error?: string;
};

const LOCALES: Locale[] = ['vi', 'en', 'ja'];

const EMPTY_FORM: TaxonomyFormState = {
    slug: '',
    icon: '',
    status: 'DRAFT',
    sortOrder: '0',
    isFeatured: false,
    isVisible: true,
    translations: {
        vi: '',
        en: '',
        ja: '',
    },
    name: '',
    description: '',
    color: '',
};

const STATUS_OPTIONS: ContentStatus[] = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'];

const getApiError = async (response: Response): Promise<string> => {
    try {
        const payload = (await response.json()) as ApiResponse<unknown>;
        return payload.message || payload.error || `Request failed with status ${response.status}`;
    } catch {
        return `Request failed with status ${response.status}`;
    }
};

const requestJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
        credentials: 'include',
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(await getApiError(response));
    }

    const payload = (await response.json()) as ApiResponse<T>;

    if (payload.data !== undefined) {
        return payload.data;
    }

    if (payload.items !== undefined) {
        return payload.items;
    }

    if (payload.results !== undefined) {
        return payload.results;
    }

    return payload as T;
};

const normalizeArray = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) {
        return value as T[];
    }

    if (
        value &&
        typeof value === 'object' &&
        'items' in value &&
        Array.isArray((value as { items?: unknown }).items)
    ) {
        return (value as { items: T[] }).items;
    }

    if (
        value &&
        typeof value === 'object' &&
        'data' in value &&
        Array.isArray((value as { data?: unknown }).data)
    ) {
        return (value as { data: T[] }).data;
    }

    return [];
};

const getTranslationName = (translations: unknown, locale: Locale = 'vi'): string => {
    if (!Array.isArray(translations)) {
        return '';
    }

    const preferred = translations.find((translation) => translation?.locale === locale);

    if (preferred?.name) {
        return preferred.name;
    }

    const fallback = translations.find((translation) => typeof translation?.name === 'string');

    return fallback?.name || '';
};

const getPostCount = (item: Record<string, unknown>): number => {
    if (typeof item.postCount === 'number') {
        return item.postCount;
    }

    if (typeof item.count === 'number') {
        return item.count;
    }

    const count = item._count;

    if (
        count &&
        typeof count === 'object' &&
        typeof (count as Record<string, unknown>).posts === 'number'
    ) {
        return (count as Record<string, unknown>).posts as number;
    }

    if (Array.isArray(item.posts)) {
        return item.posts.length;
    }

    return 0;
};

const normalizeTaxonomyItem = (item: Record<string, unknown>, isTag: boolean): TaxonomyItem => {
    const translations = Array.isArray(item.translations)
        ? (item.translations as Translation[])
        : [];

    return {
        id: String(item.id || ''),
        siteId: String(item.siteId || ''),
        name: isTag ? String(item.name || '') : getTranslationName(translations),
        slug: String(item.slug || ''),
        icon: String(item.icon || (isTag ? 'bi-hash' : 'bi-folder2')),
        count: getPostCount(item),
        status:
            item.status === 'REVIEW' || item.status === 'PUBLISHED' || item.status === 'ARCHIVED'
                ? item.status
                : 'DRAFT',
        sortOrder:
            typeof item.sortOrder === 'number' ? item.sortOrder : Number(item.sortOrder || 0),
        isFeatured: Boolean(item.isFeatured),
        isVisible: item.isVisible === undefined ? true : Boolean(item.isVisible),
        description: typeof item.description === 'string' ? item.description : undefined,
        color: typeof item.color === 'string' ? item.color : undefined,
        translations,
    };
};

const getTaxonomyEndpoint = (taxonomyTab: TaxonomyTab): string => {
    if (taxonomyTab === 'wiki') {
        return '/api/admin/blog/wiki';
    }

    if (taxonomyTab === 'tag') {
        return '/api/admin/blog/tags';
    }

    return '/api/admin/blog/categories';
};

const getTaxonomySingleEndpoint = (taxonomyTab: TaxonomyTab, id: string): string => {
    return `${getTaxonomyEndpoint(taxonomyTab)}/${id}`;
};

const getStatusLabelKey = (status: ContentStatus): string => {
    if (status === 'PUBLISHED') {
        return 'blogManagement.status.published';
    }

    if (status === 'REVIEW') {
        return 'blogManagement.status.review';
    }

    if (status === 'ARCHIVED') {
        return 'blogManagement.status.archived';
    }

    return 'blogManagement.status.draft';
};

const getTaxonomyName = (item: TaxonomyItem, taxonomyTab: TaxonomyTab): string => {
    if (taxonomyTab === 'tag') {
        return item.name;
    }

    return item.name || item.slug;
};

export default function BlogManagement({ siteId: initialSiteId }: { siteId?: string }) {
    const { t } = useAdminI18n();
    const modal = useModal();
    const { currentSite } = useAdminAuth();
    const [mainTab, setMainTab] = useState<MainTab>('taxonomy');
    const [taxonomyTab, setTaxonomyTab] = useState<TaxonomyTab>('blog');
    const [search, setSearch] = useState('');

    const siteId = currentSite?.id || initialSiteId || '';
    const [taxonomyData, setTaxonomyData] = useState<TaxonomyItem[]>([]);
    const [taxonomyCounts, setTaxonomyCounts] = useState({
        blog: 0,
        wiki: 0,
        tag: 0,
    });
    const [posts, setPosts] = useState<BlogPost[]>([]);

    const [loading, setLoading] = useState(false);
    const [postsLoading, setPostsLoading] = useState(false);

    const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
    const [form, setForm] = useState<TaxonomyFormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [showAddBlogModal, setShowAddBlogModal] = useState(false);

    const loadTaxonomy = useCallback(async () => {
        if (!siteId) {
            setTaxonomyData([]);
            return;
        }

        setLoading(true);

        try {
            const endpoint = getTaxonomyEndpoint(taxonomyTab);
            const params = new URLSearchParams({
                siteId,
                page: '1',
                limit: '100',
            });

            if (search.trim()) {
                params.set('search', search.trim());
            }

            const response = await requestJson<unknown>(`${endpoint}?${params.toString()}`);

            const items = normalizeArray<Record<string, unknown>>(response);

            setTaxonomyData(
                items.map((item) => normalizeTaxonomyItem(item, taxonomyTab === 'tag')),
            );
        } catch (error: unknown) {
            modal.error(
                t('blogManagement.modal.loadFailed'),
                error instanceof Error ? error.message : t('blogManagement.modal.loadFailed'),
            );
            setTaxonomyData([]);
        } finally {
            setLoading(false);
        }
    }, [modal, search, siteId, t, taxonomyTab]);

    const loadTaxonomyCounts = useCallback(async () => {
        if (!siteId) {
            setTaxonomyCounts({
                blog: 0,
                wiki: 0,
                tag: 0,
            });
            return;
        }

        try {
            const tabs: TaxonomyTab[] = ['blog', 'wiki', 'tag'];
            const results = await Promise.all(
                tabs.map(async (tab) => {
                    const params = new URLSearchParams({
                        siteId,
                        page: '1',
                        limit: '100',
                    });

                    const response = await requestJson<unknown>(
                        `${getTaxonomyEndpoint(tab)}?${params.toString()}`,
                    );

                    return normalizeArray<Record<string, unknown>>(response).length;
                }),
            );

            setTaxonomyCounts({
                blog: results[0] || 0,
                wiki: results[1] || 0,
                tag: results[2] || 0,
            });
        } catch (error: unknown) {
            modal.error(
                t('blogManagement.modal.loadFailed'),
                error instanceof Error ? error.message : t('blogManagement.modal.loadFailed'),
            );
        }
    }, [modal, siteId, t]);

    const loadPosts = useCallback(async () => {
        if (!siteId) {
            setPosts([]);
            return;
        }

        setPostsLoading(true);

        try {
            const params = new URLSearchParams({
                siteId,
                page: '1',
                limit: '100',
            });

            const response = await requestJson<unknown>(`/api/admin/blog?${params.toString()}`);

            const items = normalizeArray<Record<string, unknown>>(response);

            setPosts(
                items.map((item) => {
                    const translations = Array.isArray(item.translations)
                        ? (item.translations as Array<Record<string, unknown>>)
                        : [];

                    const translation =
                        translations.find((value) => value.locale === 'vi') || translations[0];

                    const category =
                        item.category && typeof item.category === 'object'
                            ? (item.category as Record<string, unknown>)
                            : null;

                    const wikiCategory =
                        item.wikiCategory && typeof item.wikiCategory === 'object'
                            ? (item.wikiCategory as Record<string, unknown>)
                            : null;

                    const categoryTranslations = category?.translations;

                    const wikiTranslations = wikiCategory?.translations;

                    const tags = Array.isArray(item.tags)
                        ? item.tags
                              .map((postTag) => {
                                  if (postTag && typeof postTag === 'object' && 'tag' in postTag) {
                                      const tag = (
                                          postTag as {
                                              tag?: Record<string, unknown>;
                                          }
                                      ).tag;

                                      return tag?.name ? String(tag.name) : '';
                                  }

                                  return '';
                              })
                              .filter(Boolean)
                        : [];

                    return {
                        id: String(item.id || ''),
                        title: String(translation?.title || ''),
                        thumbnail: String(item.thumbnail || ''),
                        blogCategory: getTranslationName(categoryTranslations),
                        wikiCategory: getTranslationName(wikiTranslations),
                        tags,
                        status:
                            item.status === 'REVIEW' ||
                            item.status === 'PUBLISHED' ||
                            item.status === 'ARCHIVED'
                                ? (item.status as ContentStatus)
                                : 'DRAFT',
                        views:
                            typeof item.viewCount === 'number'
                                ? item.viewCount
                                : Number(item.viewCount || 0),
                        publishedAt: item.publishedAt
                            ? new Date(String(item.publishedAt)).toLocaleDateString('vi-VN')
                            : '',
                    };
                }),
            );
        } catch (error: unknown) {
            modal.error(
                t('blogManagement.modal.loadPostsFailed'),
                error instanceof Error ? error.message : t('blogManagement.modal.loadPostsFailed'),
            );
            setPosts([]);
        } finally {
            setPostsLoading(false);
        }
    }, [modal, siteId, t]);

    useEffect(() => {
        void loadTaxonomy();
    }, [loadTaxonomy]);

    useEffect(() => {
        void loadTaxonomyCounts();
    }, [loadTaxonomyCounts]);

    useEffect(() => {
        if (mainTab === 'posts') {
            void loadPosts();
        }
    }, [loadPosts, mainTab]);

    const resetForm = useCallback(() => {
        setEditingItem(null);
        setForm(EMPTY_FORM);
    }, []);

    const handleTaxonomyChange = useCallback(
        (tab: TaxonomyTab) => {
            setTaxonomyTab(tab);
            setSearch('');
            resetForm();
        },
        [resetForm],
    );

    const handleEdit = useCallback((item: TaxonomyItem) => {
        setEditingItem(item);

        const translations = item.translations || [];

        setForm({
            slug: item.slug,
            icon: item.icon || '',
            status: item.status,
            sortOrder: String(item.sortOrder),
            isFeatured: item.isFeatured,
            isVisible: item.isVisible,
            translations: {
                vi: translations.find((translation) => translation.locale === 'vi')?.name || '',
                en: translations.find((translation) => translation.locale === 'en')?.name || '',
                ja: translations.find((translation) => translation.locale === 'ja')?.name || '',
            },
            name: item.name || '',
            description: item.description || '',
            color: item.color || '',
        });
    }, []);

    const updateForm = <K extends keyof TaxonomyFormState>(key: K, value: TaxonomyFormState[K]) => {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const updateTranslation = (locale: Locale, value: string) => {
        setForm((current) => ({
            ...current,
            translations: {
                ...current.translations,
                [locale]: value,
            },
        }));
    };

    const validateForm = (): string | null => {
        if (!siteId) {
            return t('blogManagement.validation.siteRequired');
        }

        if (!form.slug.trim()) {
            return t('blogManagement.validation.slugRequired');
        }

        if (taxonomyTab === 'tag') {
            if (!form.name.trim()) {
                return t('blogManagement.validation.tagNameRequired');
            }

            return null;
        }

        if (
            !form.translations.vi.trim() &&
            !form.translations.en.trim() &&
            !form.translations.ja.trim()
        ) {
            return t('blogManagement.validation.translationRequired');
        }

        return null;
    };

    const buildPayload = () => {
        if (taxonomyTab === 'tag') {
            return {
                siteId,
                slug: form.slug.trim(),
                name: form.name.trim(),
                description: form.description.trim() || null,
                icon: form.icon.trim() || null,
                color: form.color.trim() || null,
            };
        }

        return {
            siteId,
            slug: form.slug.trim(),
            icon: form.icon.trim() || null,
            status: form.status,
            sortOrder: Number(form.sortOrder) || 0,
            isFeatured: form.isFeatured,
            isVisible: form.isVisible,
            translations: LOCALES.filter((locale) => form.translations[locale].trim()).map(
                (locale) => ({
                    locale,
                    name: form.translations[locale].trim(),
                }),
            ),
        };
    };

    const saveTaxonomy = async () => {
        const validationError = validateForm();

        if (validationError) {
            modal.error(t('blogManagement.modal.validation'), validationError);
            return;
        }

        setSaving(true);

        try {
            const endpoint = editingItem
                ? getTaxonomySingleEndpoint(taxonomyTab, editingItem.id)
                : getTaxonomyEndpoint(taxonomyTab);

            await requestJson<unknown>(endpoint, {
                method: editingItem ? 'PATCH' : 'POST',
                body: JSON.stringify(buildPayload()),
            });

            modal.success(
                t('blogManagement.modal.success'),
                editingItem
                    ? t('blogManagement.modal.updatedSuccess')
                    : t('blogManagement.modal.createdSuccess'),
            );

            resetForm();
            await Promise.all([loadTaxonomy(), loadTaxonomyCounts()]);
        } catch (error: unknown) {
            modal.error(
                editingItem
                    ? t('blogManagement.modal.updateFailed')
                    : t('blogManagement.modal.createFailed'),
                error instanceof Error ? error.message : t('blogManagement.modal.saveFailed'),
            );
        } finally {
            setSaving(false);
        }
    };

    const deleteTaxonomy = useCallback(
        async (item: TaxonomyItem) => {
            await requestJson<unknown>(getTaxonomySingleEndpoint(taxonomyTab, item.id), {
                method: 'DELETE',
            });

            if (editingItem?.id === item.id) {
                resetForm();
            }

            await Promise.all([loadTaxonomy(), loadTaxonomyCounts()]);
        },
        [editingItem?.id, loadTaxonomy, loadTaxonomyCounts, resetForm, taxonomyTab],
    );

    const confirmDeleteTaxonomy = useCallback(
        (item: TaxonomyItem) => {
            const name = getTaxonomyName(item, taxonomyTab);

            modal.confirmDelete(
                t('blogManagement.modal.deleteItem'),
                t('blogManagement.modal.deleteItemConfirm').replace('{name}', name),
                async () => {
                    try {
                        await deleteTaxonomy(item);
                        modal.success(
                            t('blogManagement.modal.success'),
                            t('blogManagement.modal.deletedSuccess').replace('{name}', name),
                        );
                    } catch (error: unknown) {
                        modal.error(
                            t('blogManagement.modal.deleteFailed'),
                            error instanceof Error
                                ? error.message
                                : t('blogManagement.modal.deleteFailed'),
                        );
                    }
                },
            );
        },
        [deleteTaxonomy, modal, t, taxonomyTab],
    );

    const deletePost = useCallback(
        async (post: BlogPost) => {
            await requestJson<unknown>(`/api/admin/blog/${post.id}`, {
                method: 'DELETE',
            });

            await loadPosts();
        },
        [loadPosts],
    );

    const confirmDeletePost = useCallback(
        (post: BlogPost) => {
            modal.confirmDelete(
                t('blogManagement.modal.deletePost'),
                t('blogManagement.modal.deletePostConfirm').replace('{name}', post.title),
                async () => {
                    try {
                        await deletePost(post);
                        modal.success(
                            t('blogManagement.modal.success'),
                            t('blogManagement.modal.postDeletedSuccess'),
                        );
                    } catch (error: unknown) {
                        modal.error(
                            t('blogManagement.modal.deleteFailed'),
                            error instanceof Error
                                ? error.message
                                : t('blogManagement.modal.deleteFailed'),
                        );
                    }
                },
            );
        },
        [deletePost, modal, t],
    );

    const taxonomyTitle = {
        blog: t('blogManagement.taxonomy.blog.title'),
        wiki: t('blogManagement.taxonomy.wiki.title'),
        tag: t('blogManagement.taxonomy.tag.title'),
    }[taxonomyTab];

    const taxonomyDescription = {
        blog: t('blogManagement.taxonomy.blog.description'),
        wiki: t('blogManagement.taxonomy.wiki.description'),
        tag: t('blogManagement.taxonomy.tag.description'),
    }[taxonomyTab];

    const taxonomyStats = useMemo(() => taxonomyCounts, [taxonomyCounts]);

    const filteredPosts = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return posts;
        }

        return posts.filter((post) => {
            return (
                post.title.toLowerCase().includes(keyword) ||
                post.blogCategory.toLowerCase().includes(keyword) ||
                post.wikiCategory.toLowerCase().includes(keyword) ||
                post.tags.some((tag) => tag.toLowerCase().includes(keyword))
            );
        });
    }, [posts, search]);

    const resetPosts = () => {
        setSearch('');
        void loadPosts();
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.topbar}>
                    <div className={styles.pageHeading}>
                        <div className={styles.headingEyebrow}>
                            <i className="bi bi-grid-1x2-fill" />
                            {t('blogManagement.header.eyebrow')}
                        </div>

                        <p>{t('blogManagement.header.description')}</p>
                    </div>

                    <div className={styles.mainTabs}>
                        <button
                            className={`${styles.mainTab} ${
                                mainTab === 'posts' ? styles.mainTabActive : ''
                            }`}
                            onClick={() => setMainTab('posts')}
                            type="button"
                        >
                            <i className="bi bi-file-earmark-text" />
                            {t('blogManagement.tabs.posts')}
                        </button>

                        <button
                            className={`${styles.mainTab} ${
                                mainTab === 'taxonomy' ? styles.mainTabActive : ''
                            }`}
                            onClick={() => setMainTab('taxonomy')}
                            type="button"
                        >
                            <i className="bi bi-collection" />
                            {t('blogManagement.tabs.taxonomy')}
                        </button>
                    </div>

                    <button
                        className={styles.createTopButton}
                        type="button"
                        onClick={() => {
                            if (mainTab === 'posts') {
                                setShowAddBlogModal(true);
                                return;
                            }

                            resetForm();
                        }}
                    >
                        <i className="bi bi-plus-lg" />
                        {mainTab === 'posts'
                            ? t('blogManagement.actions.createPost')
                            : t('blogManagement.actions.createTaxonomy')}
                        <i className="bi bi-chevron-down" />
                    </button>
                </div>

                {mainTab === 'taxonomy' ? (
                    <TaxonomyView
                        taxonomyTab={taxonomyTab}
                        setTaxonomyTab={handleTaxonomyChange}
                        title={taxonomyTitle}
                        description={taxonomyDescription}
                        search={search}
                        setSearch={setSearch}
                        data={taxonomyData}
                        loading={loading}
                        editingItem={editingItem}
                        form={form}
                        saving={saving}
                        stats={taxonomyStats}
                        onChange={updateForm}
                        onTranslationChange={updateTranslation}
                        onSave={saveTaxonomy}
                        onEdit={handleEdit}
                        onDelete={confirmDeleteTaxonomy}
                        onReset={resetForm}
                    />
                ) : (
                    <BlogPostView
                        posts={filteredPosts}
                        search={search}
                        setSearch={setSearch}
                        loading={postsLoading}
                        onRefresh={resetPosts}
                        onDelete={confirmDeletePost}
                    />
                )}
                <AddBlogModal
                    open={showAddBlogModal}
                    onClose={() => setShowAddBlogModal(false)}
                    onSuccess={async () => {
                        await loadPosts();
                        await loadTaxonomyCounts();
                    }}
                />
            </div>
        </main>
    );
}

function TaxonomyView({
    taxonomyTab,
    setTaxonomyTab,
    title,
    description,
    search,
    setSearch,
    data,
    loading,
    editingItem,
    form,
    saving,
    stats,
    onChange,
    onTranslationChange,
    onSave,
    onEdit,
    onDelete,
    onReset,
}: {
    taxonomyTab: TaxonomyTab;
    setTaxonomyTab: (value: TaxonomyTab) => void;
    title: string;
    description: string;
    search: string;
    setSearch: (value: string) => void;
    data: TaxonomyItem[];
    loading: boolean;
    editingItem: TaxonomyItem | null;
    form: TaxonomyFormState;
    saving: boolean;
    stats: {
        blog: number;
        wiki: number;
        tag: number;
    };
    onChange: <K extends keyof TaxonomyFormState>(key: K, value: TaxonomyFormState[K]) => void;
    onTranslationChange: (locale: Locale, value: string) => void;
    onSave: () => Promise<void>;
    onEdit: (item: TaxonomyItem) => void;
    onDelete: (item: TaxonomyItem) => void;
    onReset: () => void;
}) {
    const { t } = useAdminI18n();

    return (
        <>
            <section className={styles.statsGrid}>
                <StatCard
                    icon="bi-folder2-open"
                    label={t('blogManagement.stats.blogCategories')}
                    value={String(stats.blog)}
                    description={t('blogManagement.stats.blogCategoriesDescription')}
                    variant="blue"
                />

                <StatCard
                    icon="bi-book"
                    label={t('blogManagement.stats.wikiCategories')}
                    value={String(stats.wiki)}
                    description={t('blogManagement.stats.wikiCategoriesDescription')}
                    variant="purple"
                />

                <StatCard
                    icon="bi-tag"
                    label={t('blogManagement.stats.tags')}
                    value={String(stats.tag)}
                    description={t('blogManagement.stats.tagsDescription')}
                    variant="pink"
                />
            </section>

            <div className={styles.taxonomyTabs}>
                <button
                    className={taxonomyTab === 'blog' ? styles.taxonomyActive : ''}
                    onClick={() => setTaxonomyTab('blog')}
                    type="button"
                >
                    <i className="bi bi-folder2" />
                    {t('blogManagement.taxonomyTabs.blog')}
                </button>

                <button
                    className={taxonomyTab === 'wiki' ? styles.taxonomyActive : ''}
                    onClick={() => setTaxonomyTab('wiki')}
                    type="button"
                >
                    <i className="bi bi-book" />
                    {t('blogManagement.taxonomyTabs.wiki')}
                </button>

                <button
                    className={taxonomyTab === 'tag' ? styles.taxonomyActive : ''}
                    onClick={() => setTaxonomyTab('tag')}
                    type="button"
                >
                    <i className="bi bi-tag" />
                    {t('blogManagement.taxonomyTabs.tag')}
                </button>
            </div>

            <section className={styles.contentGrid}>
                <TaxonomyForm
                    taxonomyTab={taxonomyTab}
                    editingItem={editingItem}
                    form={form}
                    saving={saving}
                    onChange={onChange}
                    onTranslationChange={onTranslationChange}
                    onSave={onSave}
                    onReset={onReset}
                />

                <div className={styles.listCard}>
                    <div className={styles.listHeader}>
                        <div>
                            <div className={styles.listTitleRow}>
                                <h2>
                                    {t('blogManagement.list.title')} {title}
                                </h2>
                                <span className={styles.countBadge}>{data.length}</span>
                            </div>

                            <p>{description}</p>
                        </div>

                        <div className={styles.searchBox}>
                            <i className="bi bi-search" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t(
                                    taxonomyTab === 'tag'
                                        ? 'blogManagement.search.tag'
                                        : 'blogManagement.search.category',
                                )}
                            />

                            {search && (
                                <button onClick={() => setSearch('')} type="button">
                                    <i className="bi bi-x-lg" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{t('blogManagement.table.icon')}</th>
                                    <th>{t('blogManagement.table.name')}</th>
                                    <th>{t('blogManagement.table.slug')}</th>
                                    <th>{t('blogManagement.table.posts')}</th>
                                    <th>{t('blogManagement.table.status')}</th>
                                    <th />
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: 'center',
                                            }}
                                        >
                                            {t('blogManagement.table.loading')}
                                        </td>
                                    </tr>
                                ) : data.length ? (
                                    data.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className={styles.index}>{index + 1}</td>

                                            <td>
                                                <div className={styles.itemIcon}>
                                                    <i
                                                        className={`bi ${
                                                            item.icon || 'bi-folder2'
                                                        }`}
                                                    />
                                                </div>
                                            </td>

                                            <td>
                                                <strong>{item.name || item.slug}</strong>
                                            </td>

                                            <td>
                                                <code>{item.slug}</code>
                                            </td>

                                            <td>
                                                <span className={styles.postCount}>
                                                    {item.count}
                                                </span>
                                            </td>

                                            <td>
                                                <StatusBadge status={item.status} />
                                            </td>

                                            <td>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '4px',
                                                    }}
                                                >
                                                    <button
                                                        className={styles.moreButton}
                                                        onClick={() => onEdit(item)}
                                                        type="button"
                                                        title={t('blogManagement.actions.edit')}
                                                    >
                                                        <i className="bi bi-pencil" />
                                                    </button>

                                                    <button
                                                        className={styles.moreButton}
                                                        onClick={() => onDelete(item)}
                                                        type="button"
                                                        title={t('blogManagement.actions.delete')}
                                                    >
                                                        <i className="bi bi-trash3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: 'center',
                                            }}
                                        >
                                            {t('blogManagement.table.empty')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </>
    );
}

function TaxonomyForm({
    taxonomyTab,
    editingItem,
    form,
    saving,
    onChange,
    onTranslationChange,
    onSave,
    onReset,
}: {
    taxonomyTab: TaxonomyTab;
    editingItem: TaxonomyItem | null;
    form: TaxonomyFormState;
    saving: boolean;
    onChange: <K extends keyof TaxonomyFormState>(key: K, value: TaxonomyFormState[K]) => void;
    onTranslationChange: (locale: Locale, value: string) => void;
    onSave: () => Promise<void>;
    onReset: () => void;
}) {
    const { t } = useAdminI18n();

    const isTag = taxonomyTab === 'tag';

    const title = editingItem
        ? t('blogManagement.form.editTitle')
        : {
              blog: t('blogManagement.form.createBlogCategory'),
              wiki: t('blogManagement.form.createWikiCategory'),
              tag: t('blogManagement.form.createTag'),
          }[taxonomyTab];

    return (
        <div className={styles.formCard}>
            <div className={styles.formHeader}>
                <div className={styles.formIcon}>
                    <i
                        className={`bi ${
                            isTag ? 'bi-tag' : taxonomyTab === 'wiki' ? 'bi-book' : 'bi-folder-plus'
                        }`}
                    />
                </div>

                <div>
                    <h2>{title}</h2>
                    <p>
                        {isTag
                            ? t('blogManagement.form.tagDescription')
                            : t('blogManagement.form.categoryDescription')}
                    </p>
                </div>
            </div>

            <div className={styles.formBody}>
                {isTag ? (
                    <label>
                        <span>
                            {t('blogManagement.form.name')} <em>*</em>
                        </span>

                        <input
                            value={form.name}
                            onChange={(event) => onChange('name', event.target.value)}
                            placeholder={t('blogManagement.form.tagNamePlaceholder')}
                        />
                    </label>
                ) : (
                    <div className={styles.formDesign}>
                        {(['vi', 'en', 'ja'] as Locale[]).map((locale) => (
                            <label key={locale}>
                                <span>
                                    {t(`blogManagement.form.name${locale.toUpperCase()}`)}{' '}
                                    {locale === 'vi' && <em>*</em>}
                                </span>

                                <input
                                    value={form.translations[locale]}
                                    onChange={(event) =>
                                        onTranslationChange(locale, event.target.value)
                                    }
                                    placeholder={t(
                                        `blogManagement.form.namePlaceholder${locale.toUpperCase()}`,
                                    )}
                                />
                            </label>
                        ))}
                    </div>
                )}

                <div className={styles.formRow}>
                    <label>
                        <span>
                            {t('blogManagement.form.slug')} <em>*</em>
                        </span>

                        <input
                            value={form.slug}
                            onChange={(event) => onChange('slug', event.target.value)}
                            placeholder="web-development"
                        />
                    </label>

                    <label>
                        <span>{t('blogManagement.form.icon')}</span>

                        <div className={styles.iconInput}>
                            <input
                                value={form.icon}
                                onChange={(event) => onChange('icon', event.target.value)}
                                placeholder="bi-code-slash"
                            />

                            <button
                                type="button"
                                onClick={() => onChange('icon', isTag ? 'bi-hash' : 'bi-folder2')}
                            >
                                <i className="bi bi-grid" />
                            </button>
                        </div>
                    </label>
                </div>

                {isTag ? (
                    <>
                        <label>
                            <span>{t('blogManagement.form.description')}</span>

                            <textarea
                                value={form.description}
                                onChange={(event) => onChange('description', event.target.value)}
                                placeholder={t('blogManagement.form.descriptionPlaceholder')}
                            />
                        </label>

                        <label>
                            <span>{t('blogManagement.form.color')}</span>

                            <input
                                value={form.color}
                                onChange={(event) => onChange('color', event.target.value)}
                                placeholder="#6366f1"
                            />
                        </label>
                    </>
                ) : (
                    <>
                        <div className={styles.formRow}>
                            <label>
                                <span>{t('blogManagement.form.status')}</span>

                                <select
                                    value={form.status}
                                    onChange={(event) =>
                                        onChange('status', event.target.value as ContentStatus)
                                    }
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {t(getStatusLabelKey(status))}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span>{t('blogManagement.form.sortOrder')}</span>

                                <input
                                    type="number"
                                    min="0"
                                    value={form.sortOrder}
                                    onChange={(event) => onChange('sortOrder', event.target.value)}
                                />
                            </label>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                            }}
                        >
                            <label>
                                <span className={styles.checkboxManager}>
                                    <input
                                        className={styles.checkbox}
                                        type="checkbox"
                                        checked={form.isFeatured}
                                        onChange={(event) =>
                                            onChange('isFeatured', event.target.checked)
                                        }
                                    />{' '}
                                    <span>{t('blogManagement.form.isFeatured')}</span>
                                </span>
                            </label>

                            <label>
                                <span className={styles.checkboxManager}>
                                    <input
                                        className={styles.checkbox}
                                        type="checkbox"
                                        checked={form.isVisible}
                                        onChange={(event) =>
                                            onChange('isVisible', event.target.checked)
                                        }
                                    />{' '}
                                    <span>{t('blogManagement.form.isVisible')}</span>
                                </span>
                            </label>
                        </div>
                    </>
                )}

                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                    }}
                >
                    <button
                        className={styles.createButton}
                        onClick={() => void onSave()}
                        disabled={saving}
                        type="button"
                    >
                        <i
                            className={`bi ${
                                saving
                                    ? 'bi-arrow-repeat'
                                    : editingItem
                                      ? 'bi-check-lg'
                                      : 'bi-plus-lg'
                            }`}
                        />
                        {saving
                            ? t('blogManagement.form.saving')
                            : editingItem
                              ? t('blogManagement.form.update')
                              : isTag
                                ? t('blogManagement.form.createTag')
                                : t('blogManagement.form.createCategory')}
                    </button>

                    {editingItem && (
                        <button className={styles.refreshButton} onClick={onReset} type="button">
                            <i className="bi bi-x-lg" />
                            {t('blogManagement.actions.cancel')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function BlogPostView({
    posts,
    search,
    setSearch,
    loading,
    onRefresh,
    onDelete,
}: {
    posts: BlogPost[];
    search: string;
    setSearch: (value: string) => void;
    loading: boolean;
    onRefresh: () => void;
    onDelete: (post: BlogPost) => void;
}) {
    const { t } = useAdminI18n();

    return (
        <>
            <div className={styles.statsGrid}>
                <StatCard
                    icon="bi-file-earmark-text"
                    label={t('blogManagement.stats.posts')}
                    value={String(posts.length)}
                    description={t('blogManagement.stats.postsDescription')}
                    variant="blue"
                />

                <StatCard
                    icon="bi-folder2-open"
                    label={t('blogManagement.stats.blogCategories')}
                    value="—"
                    description={t('blogManagement.stats.blogCategoriesDescription')}
                    variant="blue"
                />

                <StatCard
                    icon="bi-book"
                    label={t('blogManagement.stats.wikiCategories')}
                    value="—"
                    description={t('blogManagement.stats.wikiCategoriesDescription')}
                    variant="purple"
                />

                <StatCard
                    icon="bi-tag"
                    label={t('blogManagement.stats.tags')}
                    value="—"
                    description={t('blogManagement.stats.tagsDescription')}
                    variant="pink"
                />
            </div>

            <section className={styles.postsCard}>
                <div className={styles.filterBar}>
                    <div className={styles.postSearch}>
                        <i className="bi bi-search" />

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('blogManagement.search.posts')}
                        />

                        <span className={styles.shortcut}>⌘ K</span>
                    </div>

                    <button className={styles.refreshButton} onClick={onRefresh} type="button">
                        <i className="bi bi-arrow-clockwise" />
                        {t('blogManagement.actions.refresh')}
                    </button>
                </div>

                <div className={styles.statusTabs}>
                    <StatusFilterButton active>
                        {t('blogManagement.filters.all')} <b>{posts.length}</b>
                    </StatusFilterButton>

                    <div className={styles.displayControl}>
                        {t('blogManagement.filters.displaying')} {posts.length}{' '}
                        {t('blogManagement.filters.posts')}
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={`${styles.table} ${styles.postsTable}`}>
                        <thead>
                            <tr>
                                <th>{t('blogManagement.table.index')}</th>
                                <th>{t('blogManagement.table.image')}</th>
                                <th>{t('blogManagement.table.title')}</th>
                                <th>{t('blogManagement.table.blogCategory')}</th>
                                <th>{t('blogManagement.table.wikiCategory')}</th>
                                <th>{t('blogManagement.table.tags')}</th>
                                <th>{t('blogManagement.table.status')}</th>
                                <th>{t('blogManagement.table.views')}</th>
                                <th>{t('blogManagement.table.publishedAt')}</th>
                                <th>{t('blogManagement.table.actions')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        style={{
                                            textAlign: 'center',
                                        }}
                                    >
                                        {t('blogManagement.table.loading')}
                                    </td>
                                </tr>
                            ) : posts.length ? (
                                posts.map((post, index) => (
                                    <tr key={post.id}>
                                        <td className={styles.index}>{index + 1}</td>

                                        <td>
                                            {post.thumbnail ? (
                                                <img
                                                    className={styles.thumbnail}
                                                    src={post.thumbnail}
                                                    alt=""
                                                />
                                            ) : (
                                                <div className={styles.itemIcon}>
                                                    <i className="bi bi-image" />
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            <div className={styles.postTitle}>
                                                <strong>{post.title}</strong>

                                                <span>Blog post</span>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`${styles.categoryBadge} ${styles.blue}`}
                                            >
                                                {post.blogCategory || '—'}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`${styles.categoryBadge} ${styles.purple}`}
                                            >
                                                {post.wikiCategory || '—'}
                                            </span>
                                        </td>

                                        <td>
                                            <div className={styles.tagList}>
                                                {post.tags.length
                                                    ? post.tags.map((tag) => (
                                                          <span key={tag}>{tag}</span>
                                                      ))
                                                    : '—'}
                                            </div>
                                        </td>

                                        <td>
                                            <PostStatus status={post.status} />
                                        </td>

                                        <td className={styles.views}>
                                            {post.views.toLocaleString('vi-VN')}
                                        </td>

                                        <td className={styles.date}>{post.publishedAt || '—'}</td>

                                        <td>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => onDelete(post)}
                                                type="button"
                                                title={t('blogManagement.actions.delete')}
                                            >
                                                <i className="bi bi-trash3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={10}
                                        style={{
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div className={styles.emptyState}>
                                            <i className="bi bi-search" />
                                            <strong>{t('blogManagement.table.postsEmpty')}</strong>
                                            <span>
                                                {t('blogManagement.table.postsEmptyDescription')}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <span>
                        {t('blogManagement.pagination.showing').replace(
                            '{count}',
                            String(posts.length),
                        )}
                    </span>
                </div>
            </section>
        </>
    );
}

function StatusFilterButton({
    active,
    dot,
    onClick,
    children,
}: {
    active: boolean;
    dot?: 'green' | 'gray' | 'orange' | 'red';
    onClick?: () => void;
    children: ReactNode;
}) {
    const className = active ? styles.statusTabActive : '';

    return (
        <button className={className} onClick={onClick} type="button">
            {dot && <span className={styles[`dot${dot[0].toUpperCase()}${dot.slice(1)}`]} />}
            {children}
        </button>
    );
}

function StatCard({
    icon,
    label,
    value,
    description,
    change,
    variant,
}: {
    icon: string;
    label: string;
    value: string;
    description: string;
    change?: string;
    variant: 'blue' | 'purple' | 'pink' | 'green';
}) {
    return (
        <article className={`${styles.statCard} ${styles[variant]}`}>
            <div className={styles.statCardGlow} />

            <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                    <i className={`bi ${icon}`} aria-hidden="true" />
                </div>

                {change && (
                    <span className={styles.change}>
                        <i className="bi bi-arrow-up-short" aria-hidden="true" />
                        {change}
                    </span>
                )}

                <div className={styles.statContent}>
                    <span className={styles.statLabel}>{label}</span>
                    <strong className={styles.statValue}>{value}</strong>
                </div>
            </div>

            <div className={styles.statDecoration} aria-hidden="true">
                <i className={`bi ${icon}`} />
            </div>
        </article>
    );
}

function StatusBadge({ status }: { status: ContentStatus }) {
    const { t } = useAdminI18n();

    const config: Record<
        ContentStatus,
        {
            label: string;
            className: string;
        }
    > = {
        PUBLISHED: {
            label: t('blogManagement.status.published'),
            className: styles.statusPublished,
        },
        DRAFT: {
            label: t('blogManagement.status.draft'),
            className: styles.statusDraft,
        },
        REVIEW: {
            label: t('blogManagement.status.review'),
            className: styles.statusReview,
        },
        ARCHIVED: {
            label: t('blogManagement.status.archived'),
            className: styles.statusHidden,
        },
    };

    const current = config[status];

    return (
        <span className={`${styles.statusBadge} ${current.className}`}>
            <span />
            {current.label}
        </span>
    );
}

function PostStatus({ status }: { status: ContentStatus }) {
    const { t } = useAdminI18n();

    const config: Record<
        ContentStatus,
        {
            label: string;
            className: string;
        }
    > = {
        PUBLISHED: {
            label: t('blogManagement.status.published'),
            className: styles.statusPublished,
        },
        DRAFT: {
            label: t('blogManagement.status.draft'),
            className: styles.statusDraft,
        },
        REVIEW: {
            label: t('blogManagement.status.review'),
            className: styles.statusReview,
        },
        ARCHIVED: {
            label: t('blogManagement.status.archived'),
            className: styles.statusHidden,
        },
    };

    const current = config[status];

    return (
        <span className={`${styles.statusBadge} ${current.className}`}>
            <span />
            {current.label}
        </span>
    );
}

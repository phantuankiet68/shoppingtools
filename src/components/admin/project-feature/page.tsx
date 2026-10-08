'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './project-feature-list.module.css';
import { useModal } from '@/components/admin/shared/common/modal';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import AddProjectFeatureModal from './modal/add-project-feature-modal';
type FeatureStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
type FeatureCategory =
    | 'WEBSITE_BUILDER'
    | 'SAAS'
    | 'ECOMMERCE'
    | 'MOBILE_APP'
    | 'AI'
    | 'DESIGN'
    | 'DEVELOPMENT'
    | 'OTHER';
type FeatureTranslation = {
    id?: string;
    locale: string;
    title: string;
    description?: unknown;
};
type FeatureImage = {
    id?: string;
    featureId?: string;
    image: string;
    sortOrder: number;
    isPrimary: boolean;
};
type ProjectFeature = {
    id: string;
    siteId: string;
    slug: string;
    category: FeatureCategory;
    status: FeatureStatus;
    developer: string | null;
    tags: unknown;
    viewCount: number;
    favoriteCount: number;
    shareCount: number;
    sortOrder: number;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    translations: FeatureTranslation[];
    images: FeatureImage[];
};
type FeatureStats = {
    total: number;
    published: number;
    draft: number;
    archived: number;
    views: number;
    favorites: number;
    shares: number;
};
type ApiResponse = {
    success: boolean;
    items?: ProjectFeature[];
    projectFeatures?: ProjectFeature[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    stats?: FeatureStats;
    message?: string;
};
type ProjectFeatureListProps = {
    siteId?: string;
    onAdd?: () => void;
    onEdit?: (feature: ProjectFeature) => void;
    onView?: (feature: ProjectFeature) => void;
};
const PAGE_SIZES = [10, 20, 50];
const CATEGORY_META: Record<
    FeatureCategory,
    {
        icon: string;
        tone: 'blue' | 'purple' | 'orange' | 'green' | 'pink' | 'indigo';
    }
> = {
    WEBSITE_BUILDER: {
        icon: 'bi-window-stack',
        tone: 'blue',
    },
    SAAS: {
        icon: 'bi-cloud-check',
        tone: 'pink',
    },
    ECOMMERCE: {
        icon: 'bi-cart3',
        tone: 'orange',
    },
    MOBILE_APP: {
        icon: 'bi-phone',
        tone: 'green',
    },
    AI: {
        icon: 'bi-stars',
        tone: 'purple',
    },
    DESIGN: {
        icon: 'bi-palette',
        tone: 'indigo',
    },
    DEVELOPMENT: {
        icon: 'bi-code-slash',
        tone: 'blue',
    },
    OTHER: {
        icon: 'bi-grid',
        tone: 'indigo',
    },
};
const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: value >= 1000 ? 1 : 0,
    }).format(value);
const getTranslation = (feature: ProjectFeature, locale: string) => {
    return (
        feature.translations.find((item) => item.locale === locale) ??
        feature.translations.find((item) => item.locale === 'en') ??
        feature.translations[0] ??
        null
    );
};
const getCategoryLabel = (category: FeatureCategory, t: (key: string) => string) => {
    const keyMap: Record<FeatureCategory, string> = {
        WEBSITE_BUILDER: 'projectFeature.category.websiteBuilder',
        SAAS: 'projectFeature.category.saas',
        ECOMMERCE: 'projectFeature.category.ecommerce',
        MOBILE_APP: 'projectFeature.category.mobileApp',
        AI: 'projectFeature.category.ai',
        DESIGN: 'projectFeature.category.design',
        DEVELOPMENT: 'projectFeature.category.development',
        OTHER: 'projectFeature.category.other',
    };
    return t(keyMap[category]);
};
const getStatusLabel = (status: FeatureStatus, t: (key: string) => string) => {
    const keyMap: Record<FeatureStatus, string> = {
        PUBLISHED: 'projectFeature.status.published',
        DRAFT: 'projectFeature.status.draft',
        ARCHIVED: 'projectFeature.status.archived',
    };
    return t(keyMap[status]);
};
export default function ProjectFeatureList({
    siteId,
    onAdd,
    onEdit,
    onView,
}: ProjectFeatureListProps) {
    const { currentSite } = useAdminAuth();
    const { t } = useAdminI18n();
    const modal = useModal();
    const resolvedSiteId = currentSite?.id ?? siteId ?? '';
    const [locale, setLocale] = useState('en');
    const [features, setFeatures] = useState<ProjectFeature[]>([]);
    const [stats, setStats] = useState<FeatureStats>({
        total: 0,
        published: 0,
        draft: 0,
        archived: 0,
        views: 0,
        favorites: 0,
        shares: 0,
    });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<FeatureCategory | 'ALL'>('ALL');
    const [status, setStatus] = useState<FeatureStatus | 'ALL'>('ALL');
    const [sort, setSort] = useState('sortOrder');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<ProjectFeature | null>(null);
    const categories = useMemo(() => {
        return Object.keys(CATEGORY_META) as FeatureCategory[];
    }, []);
    useEffect(() => {
        const storedLocale = localStorage.getItem('locale');
        if (storedLocale && ['en', 'vi', 'ja'].includes(storedLocale)) {
            setLocale(storedLocale);
        }
        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<{
                locale?: string;
            }>;
            const nextLocale = customEvent.detail?.locale;
            if (nextLocale && ['en', 'vi', 'ja'].includes(nextLocale)) {
                setLocale(nextLocale);
            }
        };
        window.addEventListener('locale-change', handleLocaleChange);
        return () => {
            window.removeEventListener('locale-change', handleLocaleChange);
        };
    }, []);
    const loadFeatures = useCallback(async () => {
        if (!resolvedSiteId) {
            setFeatures([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('siteId', resolvedSiteId);
            params.set('page', String(page));
            params.set('limit', String(pageSize));
            if (search.trim()) {
                params.set('search', search.trim());
            }
            if (category !== 'ALL') {
                params.set('category', category);
            }
            if (status !== 'ALL') {
                params.set('status', status);
            }
            params.set('locale', locale);
            params.set('sortBy', sort);
            params.set('sortOrder', 'desc');
            const response = await fetch(`/api/admin/project-features?${params.toString()}`, {
                method: 'GET',
                cache: 'no-store',
            });
            const raw = await response.text();
            let data: ApiResponse;
            try {
                data = JSON.parse(raw) as ApiResponse;
            } catch {
                throw new Error(t('projectFeature.modal.invalidServerResponse'));
            }
            if (!response.ok || !data.success) {
                throw new Error(data.message ?? t('projectFeature.modal.loadFailed'));
            }
            const nextFeatures = data.items ?? data.projectFeatures ?? [];
            setFeatures(nextFeatures);
            if (data.stats) {
                setStats(data.stats);
            } else {
                const total = data.pagination?.total ?? nextFeatures.length;
                setStats({
                    total,
                    published: nextFeatures.filter((item) => item.status === 'PUBLISHED').length,
                    draft: nextFeatures.filter((item) => item.status === 'DRAFT').length,
                    archived: nextFeatures.filter((item) => item.status === 'ARCHIVED').length,
                    views: nextFeatures.reduce((sum, item) => sum + (item.viewCount || 0), 0),
                    favorites: nextFeatures.reduce(
                        (sum, item) => sum + (item.favoriteCount || 0),
                        0,
                    ),
                    shares: nextFeatures.reduce((sum, item) => sum + (item.shareCount || 0), 0),
                });
            }
        } catch (error: unknown) {
            setFeatures([]);
            modal.error(
                t('projectFeature.modal.loadFailed'),
                error instanceof Error ? error.message : t('projectFeature.modal.loadFailed'),
            );
        } finally {
            setLoading(false);
        }
    }, [resolvedSiteId, page, pageSize, search, category, status, locale, sort, t, modal]);
    useEffect(() => {
        const timer = window.setTimeout(
            () => {
                void loadFeatures();
            },
            search.trim() ? 300 : 0,
        );
        return () => window.clearTimeout(timer);
    }, [loadFeatures]);
    const totalPages = Math.max(1, Math.ceil(stats.total / pageSize));
    const safePage = Math.min(page, totalPages);
    const showingFrom = stats.total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const showingTo = Math.min(safePage * pageSize, stats.total);
    const handleDelete = useCallback(
        (feature: ProjectFeature) => {
            const translation = getTranslation(feature, locale);
            const name = translation?.title ?? feature.slug;
            modal.confirmDelete(
                t('projectFeature.modal.deleteFeature'),
                t('projectFeature.modal.deleteFeatureConfirm').replace('{name}', name),
                async () => {
                    try {
                        setDeletingId(feature.id);
                        const response = await fetch(`/api/admin/project-features/${feature.id}`, {
                            method: 'DELETE',
                        });
                        const data = (await response.json()) as {
                            success?: boolean;
                            message?: string;
                        };
                        if (!response.ok || !data.success) {
                            throw new Error(data.message ?? t('projectFeature.modal.deleteFailed'));
                        }
                        modal.success(
                            t('projectFeature.modal.success'),
                            t('projectFeature.modal.deletedSuccess').replace('{name}', name),
                        );
                        if (features.length === 1 && page > 1) {
                            setPage((current) => Math.max(1, current - 1));
                        } else {
                            await loadFeatures();
                        }
                    } catch (error: unknown) {
                        modal.error(
                            t('projectFeature.modal.deleteFailed'),
                            error instanceof Error
                                ? error.message
                                : t('projectFeature.modal.deleteFailed'),
                        );
                    } finally {
                        setDeletingId(null);
                    }
                },
            );
        },
        [locale, modal, t, features.length, page, loadFeatures],
    );
    const handleEdit = useCallback(
        (feature: ProjectFeature) => {
            setEditingFeature(feature);
            setIsAddModalOpen(true);
            onEdit?.(feature);
        },
        [onEdit],
    );

    const changeStatus = (value: FeatureStatus | 'ALL') => {
        setStatus(value);
        setPage(1);
    };
    const changeCategory = (value: FeatureCategory | 'ALL') => {
        setCategory(value);
        setPage(1);
    };
    const clearFilters = () => {
        setSearch('');
        setCategory('ALL');
        setStatus('ALL');
        setSort('sortOrder');
        setPage(1);
    };
    return (
        <section className={styles.page}>
            <div className={styles.pageHeader}>
                <div className={styles.statsGrid}>
                    <StatCard
                        icon="bi-layers"
                        iconTone="blue"
                        label={t('projectFeature.stats.total')}
                        value={stats.total}
                        trend=""
                        helper={t('projectFeature.stats.allFeatures')}
                    />
                    <StatCard
                        icon="bi-eye"
                        iconTone="sky"
                        label={t('projectFeature.stats.views')}
                        value={formatNumber(stats.views)}
                        trend=""
                        helper={t('projectFeature.stats.totalViews')}
                    />
                    <StatCard
                        icon="bi-heart"
                        iconTone="pink"
                        label={t('projectFeature.stats.favorites')}
                        value={formatNumber(stats.favorites)}
                        trend=""
                        helper={t('projectFeature.stats.userFavorites')}
                    />
                    <StatCard
                        icon="bi-share"
                        iconTone="green"
                        label={t('projectFeature.stats.shares')}
                        value={formatNumber(stats.shares)}
                        trend=""
                        helper={t('projectFeature.stats.totalShares')}
                    />
                </div>
                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => {
                        setEditingFeature(null);
                        setIsAddModalOpen(true);
                        onAdd?.();
                    }}
                    disabled={!resolvedSiteId}
                >
                    <i className="bi bi-plus-lg" />
                    <span>{t('projectFeature.actions.add')}</span>
                </button>
            </div>
            <div className={styles.contentCard}>
                <div className={styles.toolbar}>
                    <div className={styles.statusTabs}>
                        <StatusTab
                            active={status === 'ALL'}
                            label={t('projectFeature.status.all')}
                            count={stats.total}
                            onClick={() => changeStatus('ALL')}
                        />
                        <StatusTab
                            active={status === 'PUBLISHED'}
                            label={t('projectFeature.status.published')}
                            count={stats.published}
                            tone="published"
                            onClick={() => changeStatus('PUBLISHED')}
                        />
                        <StatusTab
                            active={status === 'DRAFT'}
                            label={t('projectFeature.status.draft')}
                            count={stats.draft}
                            tone="draft"
                            onClick={() => changeStatus('DRAFT')}
                        />
                        <StatusTab
                            active={status === 'ARCHIVED'}
                            label={t('projectFeature.status.archived')}
                            count={stats.archived}
                            tone="archived"
                            onClick={() => changeStatus('ARCHIVED')}
                        />
                    </div>
                    <div className={styles.filters}>
                        <label className={styles.searchBox}>
                            <i className="bi bi-search" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t('projectFeature.search.placeholder')}
                                aria-label={t('projectFeature.search.label')}
                            />
                        </label>
                        <label className={styles.selectBox}>
                            <select
                                value={category}
                                onChange={(event) =>
                                    changeCategory(event.target.value as FeatureCategory | 'ALL')
                                }
                            >
                                <option value="ALL">{t('projectFeature.category.all')}</option>
                                {categories.map((item) => (
                                    <option key={item} value={item}>
                                        {getCategoryLabel(item, t)}
                                    </option>
                                ))}
                            </select>
                            <i className="bi bi-chevron-down" />
                        </label>
                        <label className={styles.selectBox}>
                            <select
                                value={sort}
                                onChange={(event) => {
                                    setSort(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="sortOrder">
                                    {t('projectFeature.sort.sortOrder')}
                                </option>
                                <option value="createdAt">{t('projectFeature.sort.newest')}</option>
                                <option value="views">{t('projectFeature.sort.views')}</option>
                                <option value="favorites">
                                    {t('projectFeature.sort.favorites')}
                                </option>
                            </select>
                            <i className="bi bi-chevron-down" />
                        </label>
                    </div>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t('projectFeature.table.feature')}</th>
                                <th>{t('projectFeature.table.category')}</th>
                                <th>{t('projectFeature.table.developer')}</th>
                                <th>{t('projectFeature.table.stats')}</th>
                                <th>{t('projectFeature.table.status')}</th>
                                <th>{t('projectFeature.table.sort')}</th>
                                <th>{t('projectFeature.table.created')}</th>
                                <th className={styles.actionsColumn}>
                                    {t('projectFeature.table.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <LoadingRows />
                            ) : features.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>
                                                <i className="bi bi-layers" />
                                            </div>
                                            <strong>{t('projectFeature.empty.title')}</strong>
                                            <span>{t('projectFeature.empty.description')}</span>
                                            <button type="button" onClick={clearFilters}>
                                                {t('projectFeature.empty.clearFilters')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                features.map((feature) => {
                                    const translation = getTranslation(feature, locale);
                                    const image =
                                        feature.images.find((item) => item.isPrimary) ??
                                        feature.images[0];
                                    const meta = CATEGORY_META[feature.category];
                                    return (
                                        <tr key={feature.id}>
                                            <td>
                                                <div className={styles.featureInfo}>
                                                    <div className={styles.thumbnail}>
                                                        {image?.image ? (
                                                            <img
                                                                src={image.image}
                                                                alt={
                                                                    translation?.title ??
                                                                    feature.slug
                                                                }
                                                                onError={(event) => {
                                                                    event.currentTarget.style.display =
                                                                        'none';
                                                                    event.currentTarget.parentElement?.classList.add(
                                                                        styles.thumbnailFallback,
                                                                    );
                                                                }}
                                                            />
                                                        ) : (
                                                            <i className={`bi ${meta.icon}`} />
                                                        )}
                                                    </div>
                                                    <div className={styles.featureText}>
                                                        <strong>
                                                            {translation?.title ?? feature.slug}
                                                        </strong>
                                                        <span>{feature.developer ?? '—'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`${styles.categoryBadge} ${styles[`category_${meta.tone}`]}`}
                                                >
                                                    <span />
                                                    {getCategoryLabel(feature.category, t)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.developer}>
                                                    <span>
                                                        {(feature.developer ?? 'K')
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                    {feature.developer ?? '—'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.statsCell}>
                                                    <span>
                                                        <i className="bi bi-eye" />
                                                        {formatNumber(feature.viewCount)}
                                                    </span>
                                                    <span>
                                                        <i className="bi bi-heart" />
                                                        {formatNumber(feature.favoriteCount)}
                                                    </span>
                                                    <span>
                                                        <i className="bi bi-share" />
                                                        {formatNumber(feature.shareCount)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`${styles.statusBadge} ${styles[`status_${feature.status.toLowerCase()}`]}`}
                                                >
                                                    <span />
                                                    {getStatusLabel(feature.status, t)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.sortBadge}>
                                                    {feature.sortOrder}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.createdDate}>
                                                    <strong>
                                                        {new Date(
                                                            feature.createdAt,
                                                        ).toLocaleDateString(locale, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </strong>
                                                    <span>
                                                        {new Date(
                                                            feature.createdAt,
                                                        ).toLocaleTimeString(locale, {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        type="button"
                                                        className={styles.actionButton}
                                                        onClick={() => handleEdit(feature)}
                                                        disabled={deletingId === feature.id}
                                                        aria-label={t(
                                                            'projectFeature.actions.edit',
                                                        )}
                                                    >
                                                        <i className="bi bi-pencil" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.actionButton}
                                                        onClick={() => onView?.(feature)}
                                                        aria-label={t(
                                                            'projectFeature.actions.view',
                                                        )}
                                                    >
                                                        <i className="bi bi-eye" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`${styles.actionButton} ${styles.deleteAction}`}
                                                        onClick={() => handleDelete(feature)}
                                                        disabled={deletingId === feature.id}
                                                        aria-label={t(
                                                            'projectFeature.actions.delete',
                                                        )}
                                                    >
                                                        {deletingId === feature.id ? (
                                                            <i className="bi bi-arrow-repeat" />
                                                        ) : (
                                                            <i className="bi bi-trash3" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className={styles.pagination}>
                    <span>
                        {t('projectFeature.pagination.showing')
                            .replace('{from}', String(showingFrom))
                            .replace('{to}', String(showingTo))
                            .replace('{total}', String(stats.total))}
                    </span>
                    <div className={styles.paginationControls}>
                        <button
                            type="button"
                            className={styles.pageButton}
                            disabled={safePage <= 1 || loading}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            aria-label={t('projectFeature.pagination.previous')}
                        >
                            <i className="bi bi-chevron-left" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                            const visibleCount = Math.min(totalPages, 5);
                            const start = Math.min(
                                Math.max(1, safePage - Math.floor(visibleCount / 2)),
                                Math.max(1, totalPages - visibleCount + 1),
                            );
                            return start + index;
                        }).map((item) => (
                            <button
                                key={item}
                                type="button"
                                className={`${styles.pageButton} ${
                                    safePage === item ? styles.pageButtonActive : ''
                                }`}
                                onClick={() => setPage(item)}
                            >
                                {item}
                            </button>
                        ))}
                        <button
                            type="button"
                            className={styles.pageButton}
                            disabled={safePage >= totalPages || loading}
                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                            aria-label={t('projectFeature.pagination.next')}
                        >
                            <i className="bi bi-chevron-right" />
                        </button>
                        <label className={styles.pageSize}>
                            <select
                                value={pageSize}
                                onChange={(event) => {
                                    setPageSize(Number(event.target.value));
                                    setPage(1);
                                }}
                            >
                                {PAGE_SIZES.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <i className="bi bi-chevron-down" />
                        </label>
                    </div>
                </div>
            </div>
            <AddProjectFeatureModal
                open={isAddModalOpen}
                siteId={resolvedSiteId}
                feature={editingFeature}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingFeature(null);
                }}
                onSuccess={async () => {
                    setIsAddModalOpen(false);
                    setEditingFeature(null);
                    if (page !== 1) {
                        setPage(1);
                        return;
                    }
                    await loadFeatures();
                }}
            />
        </section>
    );
}
function StatusTab({
    active,
    label,
    count,
    tone,
    onClick,
}: {
    active: boolean;
    label: string;
    count: number;
    tone?: 'published' | 'draft' | 'archived';
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={`${styles.statusTab} ${active ? styles.statusTabActive : ''}`}
            onClick={onClick}
        >
            <span
                className={`${styles.statusDot} ${
                    tone ? styles[`dot${tone.charAt(0).toUpperCase()}${tone.slice(1)}`] : ''
                }`}
            />
            {label}
            <span>{count}</span>
        </button>
    );
}
function LoadingRows() {
    return (
        <>
            {Array.from({ length: 6 }, (_, index) => (
                <tr key={`loading-${index}`}>
                    <td colSpan={8}>
                        <div
                            style={{
                                height: 54,
                            }}
                        />
                    </td>
                </tr>
            ))}
        </>
    );
}
function StatCard({
    icon,
    iconTone,
    label,
    value,
    trend,
    helper,
}: {
    icon: string;
    iconTone: 'blue' | 'sky' | 'pink' | 'green';
    label: string;
    value: string | number;
    trend: string;
    helper: string;
}) {
    return (
        <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles[`stat_${iconTone}`]}`}>
                <i className={`bi ${icon}`} />
            </div>
            <div className={styles.statContent}>
                <span className={styles.statLabel}>{label}</span>
                <div className={styles.statValueRow}>
                    <strong>{value}</strong>
                    {trend && (
                        <span className={styles.statTrend}>
                            <i className="bi bi-arrow-up" />
                            {trend}
                        </span>
                    )}
                    <span className={styles.statHelper}>{helper}</span>
                </div>
            </div>
        </div>
    );
}

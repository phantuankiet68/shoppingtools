'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './portfolio-list.module.css';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { useModal } from '@/components/admin/shared/common/modal';
import AddPortfolioModal, {
    type PortfolioEditData,
} from '@/components/admin/portfolios/model/add-portfolio-modal';
type PortfolioStatus = 'active' | 'inactive';

type PortfolioCategory = 'landing' | 'ecommerce' | 'blog' | 'booking' | 'lms';

type PortfolioSize = 'tall' | 'wide' | 'normal';

type Portfolio = {
    id: string;
    image: string;
    title: string;
    description: string;
    imageAlt: string;
    category: PortfolioCategory;
    size: PortfolioSize;
    status: PortfolioStatus;
    sortOrder: number;
    href: string;
    createdAt: string;
    time: string;
};

type PortfolioApiItem = {
    id: string;
    siteId: string;
    imageUrl: string;
    category: PortfolioCategory;
    size: PortfolioSize;
    href: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    translations: {
        id: string;
        locale: 'vi' | 'en' | 'ja';
        imageAlt: string;
        title: string;
        description: string | null;
    }[];
};

type PortfolioApiResponse = {
    success: boolean;
    message?: string;
    items: PortfolioApiItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

const CATEGORY_LABELS: Record<PortfolioCategory, string> = {
    landing: 'Landing',
    ecommerce: 'E-commerce',
    blog: 'Blog',
    booking: 'Booking',
    lms: 'LMS',
};

const SIZE_LABELS: Record<PortfolioSize, string> = {
    tall: 'Tall',
    wide: 'Wide',
    normal: 'Normal',
};

export default function PortfolioList() {
    const { currentSite } = useAdminAuth();
    const { t } = useAdminI18n();
    const modal = useModal();

    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [portfolioItems, setPortfolioItems] = useState<PortfolioApiItem[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState('sort');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(8);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPortfolio, setEditingPortfolio] = useState<PortfolioEditData | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 8,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const siteId = currentSite?.id ?? '';

    const formatDate = useCallback((value: string) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return {
                date: value,
                time: '',
            };
        }

        return {
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    }, []);

    const mapPortfolio = useCallback(
        (item: PortfolioApiItem): Portfolio => {
            const translation =
                item.translations.find((translation) => translation.locale === 'en') ??
                item.translations[0];

            const date = formatDate(item.createdAt);

            return {
                id: item.id,
                image: item.imageUrl,
                title: translation?.title ?? 'Untitled',
                description: translation?.description ?? '',
                imageAlt: translation?.imageAlt ?? translation?.title ?? 'Portfolio',
                category: item.category,
                size: item.size,
                status: item.isActive ? 'active' : 'inactive',
                sortOrder: item.sortOrder,
                href: item.href ?? '#',
                createdAt: date.date,
                time: date.time,
            };
        },
        [formatDate],
    );

    const fetchPortfolios = useCallback(
        async (signal?: AbortSignal) => {
            if (!siteId) {
                setPortfolios([]);
                setPortfolioItems([]);
                setPagination((current) => ({
                    ...current,
                    total: 0,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                }));
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const params = new URLSearchParams();

                params.set('siteId', siteId);
                params.set('page', String(page));
                params.set('limit', String(limit));

                if (search.trim()) {
                    params.set('search', search.trim());
                }

                if (category !== 'all') {
                    params.set('category', category);
                }

                if (status !== 'all') {
                    params.set('status', status);
                }

                if (sort === 'asc' || sort === 'desc') {
                    params.set('sortBy', 'sortOrder');
                    params.set('sortOrder', sort);
                }

                if (sort === 'newest') {
                    params.set('sortBy', 'createdAt');
                    params.set('sortOrder', 'desc');
                }

                if (sort === 'oldest') {
                    params.set('sortBy', 'createdAt');
                    params.set('sortOrder', 'asc');
                }

                const response = await fetch(`/api/admin/portfolios?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-store',
                    signal,
                });

                const data = (await response.json()) as PortfolioApiResponse;

                if (!response.ok || !data.success) {
                    throw new Error(data.message ?? t('portfolios.modal.loadFailed'));
                }

                setPortfolioItems(data.items);
                setPortfolios(data.items.map(mapPortfolio));

                setPagination(data.pagination);

                setSelected([]);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                console.error('[PortfolioList] Failed to fetch portfolios', error);
                modal.error(
                    t('portfolios.modal.loadFailed'),
                    error instanceof Error ? error.message : t('portfolios.modal.loadFailed'),
                );

                setPortfolios([]);
                setError(error instanceof Error ? error.message : t('portfolios.modal.loadFailed'));
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [siteId, page, limit, search, category, status, sort, mapPortfolio, modal, t],
    );

    useEffect(() => {
        const controller = new AbortController();

        fetchPortfolios(controller.signal);

        return () => controller.abort();
    }, [fetchPortfolios]);

    const activeCount = useMemo(
        () => portfolios.filter((item) => item.status === 'active').length,
        [portfolios],
    );

    const inactiveCount = useMemo(
        () => portfolios.filter((item) => item.status === 'inactive').length,
        [portfolios],
    );

    const totalCount = pagination.total;

    const toggleSelected = (id: string) => {
        setSelected((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    };

    const toggleAll = () => {
        if (selected.length === portfolios.length) {
            setSelected([]);
            return;
        }

        setSelected(portfolios.map((portfolio) => portfolio.id));
    };

    const toggleStatus = async (portfolio: Portfolio) => {
        if (busyId) return;
        setBusyId(portfolio.id);
        setError('');

        try {
            const response = await fetch(`/api/admin/portfolios/${portfolio.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isActive: portfolio.status !== 'active' }),
            });
            const data = (await response.json()) as { success: boolean; message?: string };

            if (!response.ok || !data.success) {
                throw new Error(data.message ?? t('portfolios.modal.updateFailed'));
            }

            setPortfolios((current) =>
                current.map((item) =>
                    item.id === portfolio.id
                        ? {
                              ...item,
                              status: item.status === 'active' ? 'inactive' : 'active',
                          }
                        : item,
                ),
            );
        } catch (error) {
            console.error('[PortfolioList:PATCH]', error);
            modal.error(
                t('portfolios.modal.updateFailed'),
                error instanceof Error ? error.message : t('portfolios.modal.updateFailed'),
            );
        } finally {
            setBusyId(null);
        }
    };

    const deletePortfolio = (portfolio: Portfolio) => {
        if (busyId) return;

        modal.confirmDelete(
            t('portfolios.modal.deletePortfolio'),
            t('portfolios.modal.deletePortfolioConfirm').replace('{name}', portfolio.title),
            async () => {
                try {
                    setBusyId(portfolio.id);
                    setError('');

                    const response = await fetch(`/api/admin/portfolios/${portfolio.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                    const data = (await response.json()) as { success: boolean; message?: string };

                    if (!response.ok || !data.success) {
                        throw new Error(data.message ?? t('portfolios.modal.deleteFailed'));
                    }

                    const total = Math.max(0, pagination.total - 1);
                    const totalPages = Math.max(1, Math.ceil(total / limit));

                    if (page > totalPages) {
                        setPage(totalPages);
                    } else {
                        await fetchPortfolios();
                    }

                    setSelected((current) => current.filter((id) => id !== portfolio.id));
                    modal.success(
                        t('portfolios.modal.success'),
                        t('portfolios.modal.deletedSuccess').replace('{name}', portfolio.title),
                    );
                } catch (error) {
                    console.error('[PortfolioList:DELETE]', error);
                    modal.error(
                        t('portfolios.modal.deleteFailed'),
                        error instanceof Error ? error.message : t('portfolios.modal.deleteFailed'),
                    );
                } finally {
                    setBusyId(null);
                }
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setCategory('all');
        setStatus('all');
        setSort('sort');
        setPage(1);
    };

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.content}>
                    <div className={styles.pageHeading}>
                        <div>
                            <h1>{t('portfolios.title')}</h1>

                            <p>{t('portfolios.description')}</p>
                        </div>
                        <div className={styles.statsGrid}>
                            <StatCard
                                icon="bi-grid-3x3-gap-fill"
                                iconType="blue"
                                label={t('portfolios.stats.total')}
                                value={String(pagination.total)}
                                trend="+12%"
                                trendType="positive"
                                chart="↗"
                            />

                            <StatCard
                                icon="bi-circle-fill"
                                iconType="green"
                                label={t('portfolios.stats.active')}
                                value={String(activeCount)}
                                trend="+8%"
                                trendType="positive"
                                chart="〽"
                            />

                            <StatCard
                                icon="bi-circle-fill"
                                iconType="pink"
                                label={t('portfolios.stats.inactive')}
                                value={String(inactiveCount)}
                                trend="-20%"
                                trendType="negative"
                                chart="⌁"
                            />

                            <StatCard
                                icon="bi-tags-fill"
                                iconType="orange"
                                label={t('portfolios.stats.categories')}
                                value="5"
                                trend=""
                                trendType="positive"
                                chart="•••"
                            />
                        </div>
                        <button
                            className={styles.addButton}
                            onClick={() => {
                                setEditingPortfolio(null);
                                setIsAddModalOpen(true);
                            }}
                        >
                            <i className="bi bi-plus-lg" />
                            {t('portfolios.actions.add')}
                        </button>
                    </div>

                    <section className={styles.tableCard}>
                        <div className={styles.filters}>
                            <div className={styles.searchBox}>
                                <i className="bi bi-search" />

                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder={t('portfolios.filters.searchPlaceholder')}
                                />
                            </div>

                            <SelectFilter
                                value={category}
                                onChange={(value) => {
                                    setCategory(value);
                                    setPage(1);
                                }}
                                options={[
                                    ['all', t('portfolios.filters.allCategories')],
                                    ['landing', t('portfolios.category.landing')],
                                    ['ecommerce', t('portfolios.category.ecommerce')],
                                    ['blog', t('portfolios.category.blog')],
                                    ['booking', t('portfolios.category.booking')],
                                    ['lms', t('portfolios.category.lms')],
                                ]}
                            />

                            <SelectFilter
                                value={status}
                                onChange={(value) => {
                                    setStatus(value);
                                    setPage(1);
                                }}
                                options={[
                                    ['all', t('portfolios.filters.allStatus')],
                                    ['active', t('portfolios.status.active')],
                                    ['inactive', t('portfolios.status.inactive')],
                                ]}
                            />

                            <SelectFilter
                                value={sort}
                                onChange={(value) => {
                                    setSort(value);
                                    setPage(1);
                                }}
                                options={[
                                    ['sort', t('portfolios.filters.sortAsc')],
                                    ['asc', t('portfolios.filters.sortAsc')],
                                    ['desc', t('portfolios.filters.sortDesc')],
                                    ['newest', t('portfolios.filters.newest')],
                                    ['oldest', t('portfolios.filters.oldest')],
                                ]}
                            />

                            <button className={styles.filterButton}>
                                <i className="bi bi-funnel" />
                                {t('portfolios.actions.filter')}
                            </button>

                            <button className={styles.resetButton} onClick={resetFilters}>
                                <i className="bi bi-arrow-counterclockwise" />
                                {t('portfolios.actions.reset')}
                            </button>
                        </div>

                        {error && (
                            <div style={{ padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
                                {error}
                            </div>
                        )}

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.checkboxColumn}>
                                            <label className={styles.checkbox}>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        portfolios.length > 0 &&
                                                        selected.length === portfolios.length
                                                    }
                                                    onChange={toggleAll}
                                                />
                                                <span />
                                            </label>
                                        </th>

                                        <th>{t('portfolios.table.number')}</th>
                                        <th>{t('portfolios.table.image')}</th>
                                        <th>{t('portfolios.table.title')}</th>
                                        <th>{t('portfolios.table.category')}</th>
                                        <th>{t('portfolios.table.size')}</th>
                                        <th>{t('portfolios.table.status')}</th>
                                        <th>{t('portfolios.table.sortOrder')}</th>
                                        <th>{t('portfolios.table.link')}</th>
                                        <th>{t('portfolios.table.createdDate')}</th>
                                        <th className={styles.actionsColumn}>
                                            {t('portfolios.table.actions')}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={11} className={styles.emptyState}>
                                                {t('portfolios.states.loading')}
                                            </td>
                                        </tr>
                                    ) : !portfolios.length ? (
                                        <tr>
                                            <td colSpan={11} className={styles.emptyState}>
                                                {t('portfolios.states.empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        portfolios.map((portfolio, index) => (
                                            <tr key={portfolio.id}>
                                                <td>
                                                    <label className={styles.checkbox}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.includes(
                                                                portfolio.id,
                                                            )}
                                                            onChange={() =>
                                                                toggleSelected(portfolio.id)
                                                            }
                                                        />
                                                        <span />
                                                    </label>
                                                </td>

                                                <td className={styles.number}>
                                                    {(page - 1) * limit + index + 1}
                                                </td>

                                                <td>
                                                    <div className={styles.thumbnail}>
                                                        <img
                                                            src={portfolio.image}
                                                            alt={portfolio.imageAlt}
                                                        />
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className={styles.titleCell}>
                                                        <strong>{portfolio.title}</strong>

                                                        <span>{portfolio.description}</span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`${styles.badge} ${styles[`category_${portfolio.category}`]}`}
                                                    >
                                                        {t(
                                                            `portfolios.category.${portfolio.category}`,
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`${styles.badge} ${styles[`size_${portfolio.size}`]}`}
                                                    >
                                                        {t(`portfolios.size.${portfolio.size}`)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`${styles.status} ${
                                                            portfolio.status === 'active'
                                                                ? styles.statusActive
                                                                : styles.statusInactive
                                                        }`}
                                                    >
                                                        <i className="bi bi-circle-fill" />
                                                        {portfolio.status === 'active'
                                                            ? t('portfolios.status.active')
                                                            : t('portfolios.status.inactive')}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className={styles.sortOrder}>
                                                        {portfolio.sortOrder}
                                                    </span>
                                                </td>

                                                <td>
                                                    <a
                                                        href={portfolio.href}
                                                        className={styles.viewLink}
                                                    >
                                                        <i className="bi bi-box-arrow-up-right" />
                                                        {t('portfolios.actions.view')}
                                                    </a>
                                                </td>

                                                <td>
                                                    <div className={styles.dateCell}>
                                                        <strong>{portfolio.createdAt}</strong>
                                                        <span>{portfolio.time}</span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className={styles.actions}>
                                                        <button
                                                            className={styles.editButton}
                                                            aria-label={t(
                                                                'portfolios.actions.edit',
                                                            )}
                                                            onClick={() => {
                                                                const source = portfolioItems.find(
                                                                    (item) =>
                                                                        item.id === portfolio.id,
                                                                );
                                                                if (!source) return;
                                                                setEditingPortfolio(source);
                                                                setIsAddModalOpen(true);
                                                            }}
                                                        >
                                                            <i className="bi bi-pencil" />
                                                        </button>

                                                        <button
                                                            className={`${styles.switch} ${
                                                                portfolio.status === 'active'
                                                                    ? styles.switchActive
                                                                    : ''
                                                            }`}
                                                            onClick={() => toggleStatus(portfolio)}
                                                            disabled={busyId === portfolio.id}
                                                            aria-label={t(
                                                                'portfolios.actions.toggleStatus',
                                                            )}
                                                        >
                                                            <span />
                                                        </button>

                                                        <button
                                                            className={styles.deleteButton}
                                                            aria-label={t(
                                                                'portfolios.actions.delete',
                                                            )}
                                                            onClick={() =>
                                                                deletePortfolio(portfolio)
                                                            }
                                                            disabled={busyId === portfolio.id}
                                                        >
                                                            <i className="bi bi-trash3" />
                                                        </button>

                                                        <button
                                                            className={styles.moreAction}
                                                            aria-label={t(
                                                                'portfolios.actions.more',
                                                            )}
                                                        >
                                                            <i className="bi bi-three-dots" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.tableFooter}>
                            <span>
                                Showing{' '}
                                <strong>{pagination.total ? (page - 1) * limit + 1 : 0}</strong> to{' '}
                                <strong>{Math.min(page * limit, pagination.total)}</strong> of{' '}
                                <strong>{pagination.total}</strong>{' '}
                                {t('portfolios.pagination.portfolios')}
                            </span>

                            <div className={styles.pagination}>
                                <select
                                    value={limit}
                                    onChange={(event) => {
                                        setLimit(Number(event.target.value));
                                        setPage(1);
                                    }}
                                >
                                    <option value="8">8</option>
                                    <option value="12">12</option>
                                    <option value="24">24</option>
                                </select>

                                <button
                                    disabled={!pagination.hasPreviousPage}
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                >
                                    <i className="bi bi-chevron-left" />
                                </button>

                                {Array.from(
                                    { length: pagination.totalPages },
                                    (_, index) => index + 1,
                                ).map((item) => (
                                    <button
                                        key={item}
                                        className={page === item ? styles.paginationActive : ''}
                                        onClick={() => setPage(item)}
                                    >
                                        {item}
                                    </button>
                                ))}

                                <button
                                    disabled={!pagination.hasNextPage}
                                    onClick={() => setPage((current) => current + 1)}
                                >
                                    <i className="bi bi-chevron-right" />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            {isAddModalOpen && (
                <AddPortfolioModal
                    key={editingPortfolio?.id ?? 'new'}
                    siteId={siteId}
                    initialPortfolio={editingPortfolio}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingPortfolio(null);
                    }}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        setEditingPortfolio(null);
                        setPage(1);
                        fetchPortfolios();
                    }}
                />
            )}
        </div>
    );
}

function StatCard({
    icon,
    iconType,
    label,
    value,
    trend,
    trendType,
    chart,
}: {
    icon: string;
    iconType: string;
    label: string;
    value: string;
    trend: string;
    trendType: 'positive' | 'negative';
    chart: string;
}) {
    return (
        <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles[iconType]}`}>
                <i className={`bi ${icon}`} />
            </div>

            <div className={styles.statContent}>
                <span>{label}</span>
                <strong>{value}</strong>
            </div>

            <div className={styles.statRight}>
                {trend && (
                    <span
                        className={
                            trendType === 'positive' ? styles.trendPositive : styles.trendNegative
                        }
                    >
                        {trend}
                    </span>
                )}

                <div className={`${styles.miniChart} ${styles[iconType]}`}>{chart}</div>
            </div>
        </div>
    );
}

function SelectFilter({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: [string, string][];
}) {
    return (
        <label className={styles.selectFilter}>
            <div>
                <select value={value} onChange={(event) => onChange(event.target.value)}>
                    {options.map(([optionValue, optionLabel]) => (
                        <option key={optionValue} value={optionValue}>
                            {optionLabel}
                        </option>
                    ))}
                </select>

                <i className="bi bi-chevron-down" />
            </div>
        </label>
    );
}

'use client';

import styles from '@/styles/admin/sites/sites.module.css';
import { SiteLike } from '@/features/sites/types';
import SiteTableRow from '@/components/admin/sites/SiteTableRow';

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

type Props = {
    items: SiteLike[];
    activeId: string | null;
    t: (key: string) => string;
    setActiveId: (id: string) => void;
    setMode: (mode: 'create' | 'edit') => void;
    onDelete: (site: SiteLike) => void;
    search: string;
    setSearch: (value: string) => void;
    status: string;
    setStatus: (value: string) => void;
    type: string;
    setType: (value: string) => void;
    pagination: Pagination;
    setPage: (page: number) => void;
    onRefresh: () => void;
    busy: boolean;
    onPayment: (site: SiteLike) => void;
    onPaymentHistory: (site: SiteLike) => void;
};

export default function SiteTable({
    items,
    activeId,
    t,
    setActiveId,
    setMode,
    onDelete,
    search,
    setSearch,
    status,
    setStatus,
    type,
    setType,
    pagination,
    setPage,
    onRefresh,
    busy,
    onPayment,
    onPaymentHistory,
}: Props) {
    return (
        <section className={styles.tableSection}>
            <div className={styles.tableToolbar}>
                <div className={styles.searchWrap}>
                    <i className="bi bi-search" />

                    <input
                        type="search"
                        value={search}
                        placeholder={t('sites.table.search')}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    {search && (
                        <button
                            type="button"
                            className={styles.searchClear}
                            onClick={() => setSearch('')}
                            aria-label={t('sites.table.clearSearch')}
                        >
                            <i className="bi bi-x-circle-fill" />
                        </button>
                    )}
                </div>

                <div className={styles.filterGroup}>
                    <div className={styles.filterSelect}>
                        <i className="bi bi-funnel" />

                        <select value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="all">{t('sites.table.allStatus')}</option>
                            <option value="DRAFT">{t('sites.status.draft')}</option>
                            <option value="PUBLISHED">{t('sites.status.published')}</option>
                            <option value="SUSPENDED">{t('sites.status.suspended')}</option>
                            <option value="ARCHIVED">{t('sites.status.archived')}</option>
                        </select>
                    </div>

                    <div className={styles.filterSelect}>
                        <i className="bi bi-grid" />

                        <select value={type} onChange={(event) => setType(event.target.value)}>
                            <option value="all">{t('sites.table.allTypes')}</option>
                            <option value="landing">{t('sites.types.landing')}</option>
                            <option value="blog">{t('sites.types.blog')}</option>
                            <option value="ecommerce">{t('sites.types.ecommerce')}</option>
                            <option value="booking">{t('sites.types.booking')}</option>
                            <option value="lms">{t('sites.types.lms')}</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className={styles.refreshBtn}
                        onClick={onRefresh}
                        disabled={busy}
                        aria-label={t('sites.table.refresh')}
                    >
                        <i className={`bi bi-arrow-clockwise ${busy ? styles.spin : ''}`} />
                    </button>
                </div>
            </div>

            <div className={styles.tableWrap}>
                <div className={styles.tableHeader}>
                    <div>{t('sites.table.site')}</div>
                    <div>{t('sites.table.type')}</div>
                    <div>{t('sites.table.status')}</div>
                    <div>{t('sites.table.domainSsl')}</div>
                    <div>{t('sites.table.deployment')}</div>
                    <div>{t('sites.table.usage')}</div>
                    <div>{t('sites.table.visits')}</div>
                    <div>{t('sites.table.updated')}</div>
                    <div>{t('sites.table.action')}</div>
                </div>

                <div className={styles.tableBody}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            {busy ? t('sites.table.loading') : t('sites.table.noSites')}
                        </div>
                    ) : (
                        items.map((site) => (
                            <SiteTableRow
                                key={site.id}
                                site={site}
                                activeId={activeId}
                                t={t}
                                setActiveId={setActiveId}
                                setMode={setMode}
                                onDelete={onDelete}
                                onPayment={onPayment}
                                onPaymentHistory={onPaymentHistory}
                            />
                        ))
                    )}
                </div>
            </div>

            <div className={styles.tableFooter}>
                <div className={styles.paginationInfo}>
                    {t('sites.table.showing')}{' '}
                    <strong>
                        {items.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
                    </strong>{' '}
                    -{' '}
                    <strong>
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </strong>{' '}
                    {t('sites.table.of')} <strong>{pagination.total}</strong>
                </div>

                <div className={styles.pagination}>
                    <button
                        type="button"
                        className={styles.pageBtn}
                        disabled={!pagination.hasPrevious || busy}
                        onClick={() => setPage(pagination.page - 1)}
                    >
                        <i className="bi bi-chevron-left" />
                    </button>

                    <span className={styles.pageCurrent}>{pagination.page}</span>

                    <button
                        type="button"
                        className={styles.pageBtn}
                        disabled={!pagination.hasNext || busy}
                        onClick={() => setPage(pagination.page + 1)}
                    >
                        <i className="bi bi-chevron-right" />
                    </button>
                </div>
            </div>
        </section>
    );
}

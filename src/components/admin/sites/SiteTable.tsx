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
    pagination: Pagination;
    setPage: (page: number) => void;
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
    pagination,
    setPage,
    busy,
    onPayment,
    onPaymentHistory,
}: Props) {
    return (
        <section className={styles.tableSection}>
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

'use client';

import styles from '@/styles/admin/sites/sites.module.css';

import { SiteLike } from '@/features/sites/types';

import SiteTableRow from '@/components/admin/sites/SiteTableRow';

type Props = {
    items: SiteLike[];

    activeId: string | null;

    t: (key: string) => string;

    setActiveId: (id: string) => void;

    setMode: (mode: 'create' | 'edit') => void;

    onDelete: (site: SiteLike) => void;
};

export default function SiteTable({ items, activeId, t, setActiveId, setMode, onDelete }: Props) {
    return (
        <div className={styles.tableWrap}>
            <div className={styles.tableHeader}>
                <div>{t('sites.table.site')}</div>

                <div>{t('sites.table.domain')}</div>

                <div>{t('sites.table.status')}</div>

                <div>{t('sites.table.type')}</div>

                <div>{t('sites.table.action')}</div>
            </div>

            <div className={styles.tableBody}>
                {items.length === 0 && (
                    <div className={styles.empty}>{t('sites.table.noSites')}</div>
                )}

                {items.map((site) => (
                    <SiteTableRow
                        key={site.id}
                        site={site}
                        activeId={activeId}
                        t={t}
                        setActiveId={setActiveId}
                        setMode={setMode}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}

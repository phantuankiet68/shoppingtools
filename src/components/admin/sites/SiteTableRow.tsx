'use client';

import styles from '@/styles/admin/sites/sites.module.css';

import { SiteLike } from '@/features/sites/types';

type Props = {
    site: SiteLike;

    activeId: string | null;

    t: (key: string) => string;

    setActiveId: (id: string) => void;

    setMode: (mode: 'create' | 'edit') => void;

    onDelete: (site: SiteLike) => void;
};

export default function SiteTableRow({ site, activeId, t, setActiveId, setMode, onDelete }: Props) {
    const isActive = site.id === activeId;

    return (
        <div
            className={`${styles.tableRow} ${isActive ? styles.tableRowActive : ''}`}
            onClick={() => {
                setMode('edit');

                setActiveId(site.id);
            }}
        >
            {/* Site */}

            <div className={styles.siteCell}>
                <div className={styles.siteIcon}>
                    <i className="bi bi-globe2" />
                </div>

                <div>
                    <div className={styles.siteName}>{site.domain}</div>

                    <div className={styles.siteId}>#{site.id.slice(0, 8)}</div>
                </div>
            </div>

            {/* Status */}

            <div>
                <span
                    className={`${styles.statusBadge} ${
                        site.status === 'ACTIVE'
                            ? styles.activeBadge
                            : site.status === 'SUSPENDED'
                              ? styles.suspendedBadge
                              : styles.draftBadge
                    }`}
                >
                    {site.status === 'ACTIVE'
                        ? t('sites.status.active')
                        : site.status === 'SUSPENDED'
                          ? t('sites.status.suspended')
                          : t('sites.status.draft')}
                </span>
            </div>

            {/* Type */}

            <div className={`${styles.dateCell} no-width`}>
                {site.type ? t(`sites.types.${site.type}`) : '-'}
            </div>

            {/* Actions */}

            <div className={styles.actionCell} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.dropdownItem}
                    onClick={() => {
                        setMode('edit');

                        setActiveId(site.id);
                    }}
                >
                    <i className="bi bi-pencil-square" />
                </button>

                <button
                    className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                    onClick={() => onDelete(site)}
                >
                    <i className="bi bi-trash3" />
                </button>
            </div>
        </div>
    );
}

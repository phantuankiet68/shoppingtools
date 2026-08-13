'use client';

import type { SiteFilterState } from './site-manager';
import SitePagination from './site-pagination';
import styles from '@/styles/platform/sites/site-filters.module.css';

interface SiteFiltersProps {
    filters: SiteFilterState;
    total: number;
    selectedCount: number;
    allSelected: boolean;
    hasSelection: boolean;

    page: number;
    totalPages: number;

    onFilterChange: (key: keyof SiteFilterState, value: string) => void;

    onReset: () => void;
    onSelectAll: () => void;

    onBulkAction: (action: 'publish' | 'suspend' | 'archive' | 'delete') => void;

    onPageChange: (page: number) => void;
}

export default function SiteFilters({
    filters,
    total,
    selectedCount,
    allSelected,
    hasSelection,

    page,
    totalPages,

    onFilterChange,
    onReset,
    onSelectAll,
    onBulkAction,
    onPageChange,
}: SiteFiltersProps) {
    return (
        <section className={styles.wrapper}>
            <div className={styles.top}>
                <div className={styles.left}>
                    <div className={styles.leftTop}>
                        <label className={styles.checkbox}>
                            <input type="checkbox" checked={allSelected} onChange={onSelectAll} />

                            <span>Select All</span>
                        </label>

                        <button type="button" className={styles.reset} onClick={onReset}>
                            <i className="bi bi-arrow-clockwise" />
                            Reset
                        </button>
                    </div>

                    <div className={styles.search}>
                        <i className="bi bi-search" />

                        <input
                            type="text"
                            value={filters.search}
                            onChange={(event) => onFilterChange('search', event.target.value)}
                            placeholder="Search website, domain, owner..."
                        />
                    </div>

                    <select
                        className={styles.select}
                        value={filters.type}
                        onChange={(event) => onFilterChange('type', event.target.value)}
                    >
                        <option value="">All Website Types</option>
                        <option value="landing">Landing</option>
                        <option value="blog">Blog</option>
                        <option value="ecommerce">Ecommerce</option>
                        <option value="booking">Booking</option>
                        <option value="lms">LMS</option>
                    </select>

                    <select
                        className={styles.select}
                        value={filters.status}
                        onChange={(event) => onFilterChange('status', event.target.value)}
                    >
                        <option value="">All Site Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>

                    <select
                        className={styles.select}
                        value={filters.subscription}
                        onChange={(event) => onFilterChange('subscription', event.target.value)}
                    >
                        <option value="">All Subscriptions</option>
                        <option value="TRIAL">Trial</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAST_DUE">Past Due</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="CANCELED">Canceled</option>
                        <option value="EXPIRED">Expired</option>
                    </select>

                    <select
                        className={styles.select}
                        value={filters.provider}
                        onChange={(event) => onFilterChange('provider', event.target.value)}
                    >
                        <option value="">Payment Provider</option>
                        <option value="STRIPE">Stripe</option>
                        <option value="PAYPAL">PayPal</option>
                        <option value="MOMO">MoMo</option>
                        <option value="VNPAY">VNPay</option>
                        <option value="MANUAL">Manual</option>
                    </select>
                </div>
            </div>

            <div className={styles.bottom}>
                <div className={styles.summary}>
                    <span>
                        <strong>{total}</strong> Websites
                    </span>

                    <span>
                        <strong>{selectedCount}</strong> Selected
                    </span>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        disabled={!hasSelection}
                        onClick={() => onBulkAction('publish')}
                    >
                        <i className="bi bi-upload" />
                        Publish
                    </button>

                    <button
                        type="button"
                        disabled={!hasSelection}
                        onClick={() => onBulkAction('suspend')}
                    >
                        <i className="bi bi-pause-circle" />
                        Suspend
                    </button>

                    <button
                        type="button"
                        disabled={!hasSelection}
                        onClick={() => onBulkAction('archive')}
                    >
                        <i className="bi bi-archive" />
                        Archive
                    </button>

                    <button
                        type="button"
                        className={styles.delete}
                        disabled={!hasSelection}
                        onClick={() => onBulkAction('delete')}
                    >
                        <i className="bi bi-trash" />
                        Delete
                    </button>
                </div>
            </div>
            <SitePagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </section>
    );
}

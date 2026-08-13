'use client';

import ApiHealthCard from '@/components/platform/api-health/api-health-card';
import ApiHealthSearch from '@/components/platform/api-health/api-health-search';

import type { ApiHealthSearchFilters } from '@/components/platform/api-health/api-health-search';
import type { ApiHealthEndpoint } from '@/services/platform/api-health/index.service';

import styles from '@/styles/platform/api-health/api-health-list.module.css';

interface Props {
    items: ApiHealthEndpoint[];
    selectedId: string | null;
    loading: boolean;
    filters: ApiHealthSearchFilters;
    onSearch: (filters: ApiHealthSearchFilters) => void;
    onSelect: (id: string) => void;
}

export default function ApiHealthList({
    items,
    selectedId,
    loading,
    filters,
    onSearch,
    onSelect,
}: Props) {
    return (
        <section className={styles.wrapper}>
            <ApiHealthSearch value={filters} onChange={onSearch} />

            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.loadingIcon}>
                        <i className="bi bi-arrow-repeat" />
                    </div>

                    <h3>Loading API endpoints</h3>

                    <p>Please wait while API health data is being loaded.</p>
                </div>
            ) : items.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>
                        <i className="bi bi-hdd-network" />
                    </div>

                    <h3>No API endpoints found</h3>

                    <p>There are no API endpoints matching your current search.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {items.map((item) => (
                        <ApiHealthCard
                            key={item.id}
                            item={item}
                            selected={item.id === selectedId}
                            onSelect={() => onSelect(item.id)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

'use client';

import { useEffect, useState } from 'react';

import styles from '@/styles/platform/api-health/api-health-search.module.css';

export type ApiHealthSearchMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiHealthSearchStatus = 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'PENDING';

export type ApiHealthSearchCategory = 'Platform' | 'Admin' | 'User';

export interface ApiHealthSearchFilters {
    q: string;
    method?: ApiHealthSearchMethod;
    status?: ApiHealthSearchStatus;
    category?: ApiHealthSearchCategory;
}

interface Props {
    value: ApiHealthSearchFilters;
    onChange: (filters: ApiHealthSearchFilters) => void;
}

const METHODS: ApiHealthSearchMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const STATUSES: ApiHealthSearchStatus[] = ['SUCCESS', 'FAILED', 'TIMEOUT', 'PENDING'];

const CATEGORIES: ApiHealthSearchCategory[] = ['Platform', 'Admin', 'User'];

const SEARCH_DELAY = 5000;

export default function ApiHealthSearch({ value, onChange }: Props) {
    const [query, setQuery] = useState(value.q);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (query !== value.q) {
                onChange({
                    ...value,
                    q: query,
                });
            }
        }, SEARCH_DELAY);

        return () => {
            window.clearTimeout(timer);
        };
    }, [query, value, onChange]);

    const updateFilter = <K extends keyof ApiHealthSearchFilters>(
        key: K,
        filterValue: ApiHealthSearchFilters[K],
    ) => {
        onChange({
            ...value,
            [key]: filterValue,
        });
    };

    const clearFilters = () => {
        setQuery('');

        onChange({
            q: '',
        });
    };

    const hasFilters =
        Boolean(value.q) ||
        Boolean(value.method) ||
        Boolean(value.status) ||
        Boolean(value.category);

    return (
        <div className={styles.wrapper}>
            <div className={styles.search}>
                <i className="bi bi-search" />

                <input
                    type="text"
                    value={query}
                    placeholder="Search endpoint..."
                    onChange={(event) => setQuery(event.target.value)}
                />

                {query && (
                    <button
                        type="button"
                        className={styles.clearSearch}
                        onClick={() => {
                            setQuery('');

                            onChange({
                                ...value,
                                q: '',
                            });
                        }}
                        aria-label="Clear search"
                    >
                        <i className="bi bi-x" />
                    </button>
                )}
            </div>

            <div className={styles.filters}>
                <select
                    value={value.method ?? ''}
                    onChange={(event) =>
                        updateFilter(
                            'method',
                            event.target.value
                                ? (event.target.value as ApiHealthSearchMethod)
                                : undefined,
                        )
                    }
                >
                    <option value="">All Methods</option>

                    {METHODS.map((method) => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </select>

                <select
                    value={value.status ?? ''}
                    onChange={(event) =>
                        updateFilter(
                            'status',
                            event.target.value
                                ? (event.target.value as ApiHealthSearchStatus)
                                : undefined,
                        )
                    }
                >
                    <option value="">All Status</option>

                    {STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {formatStatus(status)}
                        </option>
                    ))}
                </select>

                <select
                    value={value.category ?? ''}
                    onChange={(event) =>
                        updateFilter(
                            'category',
                            event.target.value
                                ? (event.target.value as ApiHealthSearchCategory)
                                : undefined,
                        )
                    }
                >
                    <option value="">All Categories</option>

                    {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                {hasFilters && (
                    <button type="button" className={styles.clear} onClick={clearFilters}>
                        <i className="bi bi-x-circle" />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}

function formatStatus(status: ApiHealthSearchStatus) {
    switch (status) {
        case 'SUCCESS':
            return 'Successful';

        case 'FAILED':
            return 'Failed';

        case 'TIMEOUT':
            return 'Timeout';

        case 'PENDING':
            return 'Pending';

        default:
            return status;
    }
}

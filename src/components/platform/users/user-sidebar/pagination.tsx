'use client';

import { useMemo } from 'react';
import styles from '@/styles/platform/users/user-sidebar/pagination.module.css';

interface PaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize?: number;
    onChange?: (page: number) => void;
}

export default function Pagination({
    page,
    totalPages,
    totalItems,
    pageSize = 6,
    onChange,
}: PaginationProps) {
    const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;

    const end = totalItems === 0 ? 0 : Math.min(page * pageSize, totalItems);

    const pages = useMemo<(number | '...')[]>(() => {
        if (totalPages <= 1) return [1];

        const result: (number | '...')[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                result.push(i);
            }

            return result;
        }

        result.push(1);

        if (page > 3) {
            result.push('...');
        }

        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            result.push(i);
        }

        if (page < totalPages - 2) {
            result.push('...');
        }

        result.push(totalPages);

        return result;
    }, [page, totalPages]);

    return (
        <div className={styles.wrapper}>
            <p>
                Showing <strong>{start}</strong> to <strong>{end}</strong> of{' '}
                <strong>{totalItems.toLocaleString()}</strong> users
            </p>

            <div className={styles.pagination}>
                <button
                    type="button"
                    disabled={page <= 1 || totalItems === 0}
                    onClick={() => onChange?.(page - 1)}
                >
                    <i className="bi bi-chevron-left" />
                </button>

                {pages.map((item, index) =>
                    item === '...' ? (
                        <span key={`ellipsis-${index}`}>...</span>
                    ) : (
                        <button
                            type="button"
                            key={item}
                            className={item === page ? styles.active : ''}
                            onClick={() => onChange?.(item)}
                        >
                            {item}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    disabled={page >= totalPages || totalItems === 0}
                    onClick={() => onChange?.(page + 1)}
                >
                    <i className="bi bi-chevron-right" />
                </button>
            </div>
        </div>
    );
}

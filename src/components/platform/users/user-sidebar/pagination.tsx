'use client';

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
    pageSize = 10,
    onChange,
}: PaginationProps) {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    const pages = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);

        if (page > 3) pages.push('...');

        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i);
        }

        if (page < totalPages - 2) pages.push('...');

        pages.push(totalPages);
    }

    return (
        <div className={styles.wrapper}>
            <p>
                Showing <strong>{start}</strong> to <strong>{end}</strong> of{' '}
                <strong>{totalItems.toLocaleString()}</strong> users
            </p>

            <div className={styles.pagination}>
                <button disabled={page === 1} onClick={() => onChange?.(page - 1)}>
                    <i className="bi bi-chevron-left" />
                </button>

                {pages.map((item, index) =>
                    item === '...' ? (
                        <span key={index}>...</span>
                    ) : (
                        <button
                            key={item}
                            onClick={() => onChange?.(Number(item))}
                            className={Number(item) === page ? styles.active : ''}
                        >
                            {item}
                        </button>
                    ),
                )}

                <button disabled={page === totalPages} onClick={() => onChange?.(page + 1)}>
                    <i className="bi bi-chevron-right" />
                </button>
            </div>
        </div>
    );
}

'use client';

import styles from '@/styles/platform/sites/site-pagination.module.css';

interface SitePaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function SitePagination({ page, totalPages, onPageChange }: SitePaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <footer className={styles.pagination}>
            <div className={styles.controls}>
                <button
                    type="button"
                    className={styles.button}
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <i className="bi bi-chevron-left" />
                </button>

                {pages.map((pageNumber) => (
                    <button
                        type="button"
                        key={pageNumber}
                        className={`${styles.button} ${pageNumber === page ? styles.active : ''}`}
                        onClick={() => onPageChange(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    type="button"
                    className={styles.button}
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <i className="bi bi-chevron-right" />
                </button>
            </div>
        </footer>
    );
}

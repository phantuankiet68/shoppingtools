'use client';

import styles from './StorageBreakdown.module.css';

const storageData = [
    {
        label: 'Images',
        value: '5.8 GB',
        percentage: 42,
        className: 'images',
    },
    {
        label: 'Videos',
        value: '3.1 GB',
        percentage: 25,
        className: 'videos',
    },
    {
        label: 'Documents',
        value: '2.4 GB',
        percentage: 18,
        className: 'documents',
    },
    {
        label: 'Other',
        value: '1.2 GB',
        percentage: 15,
        className: 'other',
    },
];

export default function StorageBreakdown() {
    return (
        <section className={styles.card}>
            {/* HEADER */}
            <div className={styles.header}>
                <h3>Storage breakdown</h3>

                <button type="button" className={styles.viewButton}>
                    <span>View details</span>
                    <i className="bi bi-arrow-up-right" />
                </button>
            </div>

            {/* CONTENT */}
            <div className={styles.content}>
                {/* DONUT */}
                <div className={styles.chartArea}>
                    <div className={styles.donut}>
                        <div className={styles.donutInner}>
                            <strong>12.5 GB</strong>
                            <span>/ 50 GB</span>
                        </div>
                    </div>
                </div>

                {/* LEGEND */}
                <div className={styles.legend}>
                    {storageData.map((item) => (
                        <div key={item.label} className={styles.legendItem}>
                            <span className={`${styles.legendDot} ${styles[item.className]}`} />

                            <span className={styles.legendName}>{item.label}</span>

                            <strong className={styles.legendValue}>{item.value}</strong>

                            <span className={styles.legendPercentage}>{item.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

'use client';

import styles from '@/styles/platform/api-health/api-health-summary.module.css';

interface Props {
    total: number;
    healthy: number;
    failed: number;
    timeout: number;
}

export default function ApiHealthSummary({ total, healthy, failed, timeout }: Props) {
    const summary = [
        {
            title: 'Total APIs',
            value: total,
            icon: 'bi-hdd-network',
            color: styles.blue,
        },
        {
            title: 'Healthy',
            value: healthy,
            icon: 'bi-check-circle-fill',
            color: styles.green,
        },
        {
            title: 'Failed',
            value: failed,
            icon: 'bi-x-circle-fill',
            color: styles.red,
        },
        {
            title: 'Timeout',
            value: timeout,
            icon: 'bi-stopwatch-fill',
            color: styles.orange,
        },
    ];

    return (
        <section className={styles.grid}>
            {summary.map((item) => (
                <article key={item.title} className={styles.card}>
                    <div className={`${styles.icon} ${item.color}`}>
                        <i className={`bi ${item.icon}`} />
                    </div>

                    <div className={styles.content}>
                        <span>{item.title}</span>: <strong>{item.value}</strong>
                    </div>
                </article>
            ))}
        </section>
    );
}

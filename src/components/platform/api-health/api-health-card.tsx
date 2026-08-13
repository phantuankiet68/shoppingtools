'use client';

import type { ApiHealthEndpoint } from '@/services/platform/api-health/index.service';

import styles from '@/styles/platform/api-health/api-health-card.module.css';

interface Props {
    item: ApiHealthEndpoint;
    selected: boolean;
    onSelect: () => void;
}

export default function ApiHealthCard({ item, selected, onSelect }: Props) {
    const methodClass = styles[item.method.toLowerCase()];

    const status = item.lastStatus?.toLowerCase() as
        | 'success'
        | 'failed'
        | 'timeout'
        | 'pending'
        | undefined;

    const statusClass = status ? styles[status] : undefined;

    const statusIcon = {
        success: 'bi-check-circle-fill',
        failed: 'bi-x-circle-fill',
        timeout: 'bi-stopwatch-fill',
        pending: 'bi-arrow-repeat',
    } as const;

    const statusText = {
        success: 'Successful',
        failed: 'Failed',
        timeout: 'Timeout',
        pending: 'Pending',
    } as const;

    const displayStatus = status ?? 'pending';

    return (
        <article className={`${styles.card} ${selected ? styles.selected : ''}`} onClick={onSelect}>
            <div className={styles.top}>
                <div>
                    <div className={styles.identity}>
                        <div className={styles.titleRow}>
                            <span className={styles.apiIcon}>
                                <i className="bi bi-braces" />
                            </span>

                            <h3>{item.name}</h3>
                        </div>
                    </div>

                    <span className={styles.endpoint}>{item.endpoint}</span>
                </div>

                <div className={styles.footer}>
                    <div>
                        <i className="bi bi-hdd-network" />
                        HTTP {item.lastHttpStatus ?? '—'}
                    </div>

                    <div>
                        <i className="bi bi-speedometer2" />

                        {item.lastResponseTime !== null ? `${item.lastResponseTime} ms` : '—'}
                    </div>

                    <div>
                        <i className="bi bi-clock-history" />

                        {item.lastCheckedAt ? formatCheckedAt(item.lastCheckedAt) : 'Never'}
                    </div>

                    <div className={styles.meta}>
                        <span className={`${styles.method} ${methodClass}`}>{item.method}</span>

                        <span className={styles.category}>{item.category}</span>

                        <span className={`${styles.status} ${statusClass ?? ''}`}>
                            <i className={`bi ${statusIcon[displayStatus]}`} />

                            {statusText[displayStatus]}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

function formatCheckedAt(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

'use client';

import styles from '@/styles/admin/sites/workflow/WorkflowInfo.module.css';
import { WorkflowNode } from '@/features/workflow/types';

type Props = {
    node?: WorkflowNode;
};

function formatDuration(duration?: number) {
    if (duration === undefined) return '-';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
}

function formatPayload(value: unknown) {
    if (value === undefined) {
        return 'No data';
    }

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function getStatus(node: WorkflowNode) {
    return node.runtimeStatus ?? node.status;
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'running':
            return 'Running';
        case 'success':
            return 'Success';
        case 'error':
            return 'Error';
        case 'skipped':
            return 'Skipped';
        default:
            return 'Waiting';
    }
}

export default function WorkflowInfo({ node }: Props) {
    if (!node) {
        return (
            <aside className={styles.info}>
                <div className={styles.empty}>
                    <i className="bi bi-diagram-3" />
                    <h3>No Node Selected</h3>
                    <p>Select a workflow node to inspect details.</p>
                </div>
            </aside>
        );
    }

    const status = getStatus(node);
    const method = node.method ?? 'INTERNAL';

    return (
        <aside className={styles.info}>
            <section className={styles.card}>
                <div className={styles.header}>
                    <div className={`${styles.icon} ${styles[node.color]}`}>
                        <i className={node.icon} />
                    </div>

                    <div className={styles.heading}>
                        <h2>{node.title}</h2>

                        {node.subtitle && <p>{node.subtitle}</p>}
                    </div>

                    <span className={`${styles.status} ${styles[status]}`}>
                        {getStatusLabel(status)}
                    </span>
                </div>

                <div className={styles.grid}>
                    <div className={styles.item}>
                        <span>Status</span>
                        <strong className={styles[status]}>{getStatusLabel(status)}</strong>
                    </div>

                    <div className={styles.item}>
                        <span>Progress</span>
                        <strong>{node.progress ?? 0}%</strong>
                    </div>

                    <div className={styles.item}>
                        <span>Method</span>
                        <strong>{method}</strong>
                    </div>

                    <div className={styles.item}>
                        <span>Duration</span>
                        <strong>{formatDuration(node.duration)}</strong>
                    </div>
                </div>

                {status === 'running' && (
                    <div className={styles.progress}>
                        <div
                            className={styles.fill}
                            style={{
                                width: `${node.progress ?? 0}%`,
                            }}
                        />
                    </div>
                )}

                {node.error && (
                    <div className={styles.error}>
                        <i className="bi bi-exclamation-triangle" />

                        <div>
                            <strong>Execution Error</strong>
                            <p>{node.error}</p>
                        </div>
                    </div>
                )}
            </section>

            <section className={styles.card}>
                <div className={styles.endpoint}>
                    <span className={styles.method}>{method}</span>

                    <code>{node.api ?? 'Internal workflow step'}</code>
                </div>
            </section>

            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Request Payload</h3>

                    {node.request?.length ? (
                        <span className={styles.count}>{node.request.length} fields</span>
                    ) : null}
                </div>

                {node.requestData !== undefined ? (
                    <pre className={styles.code}>{formatPayload(node.requestData)}</pre>
                ) : node.request?.length ? (
                    <div className={styles.fieldList}>
                        {node.request.map((field) => (
                            <span key={field} className={styles.field}>
                                {field}
                            </span>
                        ))}
                    </div>
                ) : (
                    <pre className={styles.code}>No request data</pre>
                )}
            </section>

            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Response</h3>

                    {node.response?.length ? (
                        <span className={styles.count}>{node.response.length} fields</span>
                    ) : null}
                </div>

                {node.responseData !== undefined ? (
                    <pre className={styles.code}>{formatPayload(node.responseData)}</pre>
                ) : node.response?.length ? (
                    <div className={styles.fieldList}>
                        {node.response.map((field) => (
                            <span key={field} className={styles.field}>
                                {field}
                            </span>
                        ))}
                    </div>
                ) : (
                    <pre className={styles.code}>No response data</pre>
                )}
            </section>

            {(node.startedAt || node.completedAt) && (
                <section className={styles.card}>
                    <div className={styles.grid}>
                        <div className={styles.item}>
                            <span>Started</span>
                            <strong>
                                {node.startedAt
                                    ? new Date(node.startedAt).toLocaleTimeString()
                                    : '-'}
                            </strong>
                        </div>

                        <div className={styles.item}>
                            <span>Completed</span>
                            <strong>
                                {node.completedAt
                                    ? new Date(node.completedAt).toLocaleTimeString()
                                    : '-'}
                            </strong>
                        </div>
                    </div>
                </section>
            )}
        </aside>
    );
}

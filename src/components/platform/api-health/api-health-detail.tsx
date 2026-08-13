'use client';

import { useState } from 'react';

import { testApiHealth } from '@/services/platform/api-health/index.service';

import type { ApiHealthDetailResponse } from '@/services/platform/api-health/index.service';

import styles from '@/styles/platform/api-health/api-health-detail.module.css';

interface Props {
    data: ApiHealthDetailResponse | null;
    loading: boolean;
    onRefresh: () => void;
}

type DetailTab = 'general' | 'response' | 'history';

export default function ApiHealthDetail({ data, loading, onRefresh }: Props) {
    const [testing, setTesting] = useState(false);
    const [activeTab, setActiveTab] = useState<DetailTab>('general');

    if (loading) {
        return (
            <aside className={styles.card}>
                <div className={styles.loading}>
                    <i className="bi bi-arrow-repeat" />
                    Loading API details...
                </div>
            </aside>
        );
    }

    if (!data) {
        return (
            <aside className={styles.card}>
                <div className={styles.loading}>
                    <i className="bi bi-hdd-network" />

                    <span>Select an API endpoint to view details.</span>
                </div>
            </aside>
        );
    }

    const { item, history } = data;

    const lastCheck = history[0];

    const status = item.lastStatus;

    const statusClass =
        status === 'SUCCESS'
            ? styles.success
            : status === 'FAILED'
              ? styles.failed
              : status === 'TIMEOUT'
                ? styles.failed
                : status === 'PENDING'
                  ? styles.testing
                  : styles.idle;

    const statusIcon =
        status === 'SUCCESS'
            ? 'bi-check-circle-fill'
            : status === 'FAILED'
              ? 'bi-x-circle-fill'
              : status === 'TIMEOUT'
                ? 'bi-stopwatch-fill'
                : status === 'PENDING'
                  ? 'bi-hourglass-split'
                  : 'bi-circle';

    const statusLabel =
        status === 'SUCCESS'
            ? 'Successful'
            : status === 'FAILED'
              ? 'Failed'
              : status === 'TIMEOUT'
                ? 'Timeout'
                : status === 'PENDING'
                  ? 'Testing'
                  : 'Not Tested';

    const responseText = formatResponse(lastCheck?.response);

    const handleTest = async () => {
        if (testing || !item.isActive) {
            return;
        }

        try {
            setTesting(true);

            await testApiHealth(item.id);

            onRefresh();
        } catch (error) {
            console.error('Failed to test API:', error);
        } finally {
            setTesting(false);
        }
    };

    return (
        <aside className={styles.card}>
            {testing && (
                <div className={styles.testingBar}>
                    <span />
                </div>
            )}

            <div className={styles.heading}>
                <div className={styles.headingTop}>
                    <div>
                        <div className={styles.headingTop}>
                            <span className={styles.label}>
                                <i className="bi bi-braces" />
                                API Details
                            </span>

                            <span className={`${styles.status} ${statusClass}`}>
                                <i className={`bi ${statusIcon}`} />

                                {statusLabel}
                            </span>
                        </div>

                        <div className={styles.headingTop}>
                            <div className={styles.headingTitle}>
                                <h2>{item.name}</h2>

                                <div className={styles.endpoint}>
                                    <span className={styles.method}>{item.method}</span>
                                    <span>{item.endpoint}</span>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.testButton}
                                    onClick={handleTest}
                                    disabled={testing || !item.isActive}
                                >
                                    <i
                                        className={`bi ${testing ? 'bi-arrow-repeat' : 'bi-play-fill'} ${
                                            testing ? styles.spin : ''
                                        }`}
                                    />

                                    {testing ? 'Testing...' : 'Test API'}
                                </button>

                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    onClick={onRefresh}
                                    title="Refresh"
                                    aria-label="Refresh"
                                >
                                    <i className="bi bi-arrow-clockwise" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.metrics}>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>HTTP Status</span>

                    <strong
                        className={
                            item.lastHttpStatus && item.lastHttpStatus >= 400
                                ? styles.metricDanger
                                : item.lastHttpStatus
                                  ? styles.metricSuccess
                                  : undefined
                        }
                    >
                        {item.lastHttpStatus ?? '—'}
                    </strong>
                </div>

                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Response Time</span>

                    <strong>
                        {item.lastResponseTime !== null ? `${item.lastResponseTime} ms` : '—'}
                    </strong>
                </div>

                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Last Checked</span>

                    <strong>{formatDate(item.lastCheckedAt)}</strong>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <span className={styles.sectionEyebrow}>API Status</span>
                    </div>

                    <i className="bi bi-info-circle" />
                </div>

                <div className={styles.details}>
                    <div className={styles.detailRow}>
                        <span>Method</span>

                        <strong>{item.method}</strong>
                    </div>

                    <div className={styles.detailRow}>
                        <span>Category</span>

                        <strong>{item.category}</strong>
                    </div>

                    <div className={styles.detailRow}>
                        <span>Active</span>

                        <strong>{item.isActive ? 'Yes' : 'No'}</strong>
                    </div>

                    <div className={styles.detailRow}>
                        <span>Created At</span>

                        <strong>{formatDate(item.createdAt)}</strong>
                    </div>

                    <div className={styles.detailRow}>
                        <span>Updated At</span>

                        <strong>{formatDate(item.updatedAt)}</strong>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button
                        type="button"
                        className={activeTab === 'general' ? styles.active : ''}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>

                    <button
                        type="button"
                        className={activeTab === 'response' ? styles.active : ''}
                        onClick={() => setActiveTab('response')}
                    >
                        Response
                    </button>

                    <button
                        type="button"
                        className={activeTab === 'history' ? styles.active : ''}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                </div>

                {activeTab === 'general' && (
                    <>
                        {lastCheck?.errorMessage && (
                            <div className={styles.error}>
                                <div className={styles.errorIcon}>
                                    <i className="bi bi-x-circle-fill" />
                                </div>

                                <div className={styles.errorContent}>
                                    <span>{lastCheck.errorCode ?? 'API Error'}</span>

                                    <p>{lastCheck.errorMessage}</p>
                                </div>
                            </div>
                        )}

                        <div className={styles.response}>
                            <div className={styles.responseHeader}>
                                <div>
                                    <span className={styles.sectionEyebrow}>Response</span>
                                </div>

                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    title="Copy response"
                                    aria-label="Copy response"
                                    onClick={() => copyToClipboard(responseText)}
                                >
                                    <i className="bi bi-copy" />
                                </button>
                            </div>

                            <div className={styles.code}>
                                <div className={styles.codeTop}>
                                    <span>
                                        <i className="bi bi-braces" />
                                        Response
                                    </span>

                                    <span>
                                        {lastCheck?.httpStatus
                                            ? `HTTP ${lastCheck.httpStatus}`
                                            : 'No response'}
                                    </span>
                                </div>

                                <pre>{responseText}</pre>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'response' && (
                    <div className={styles.response}>
                        <div className={styles.responseHeader}>
                            <div>
                                <span className={styles.sectionEyebrow}>Response Body</span>
                            </div>

                            <button
                                type="button"
                                className={styles.copyButton}
                                title="Copy response"
                                aria-label="Copy response"
                                onClick={() => copyToClipboard(responseText)}
                            >
                                <i className="bi bi-copy" />
                            </button>
                        </div>

                        <div className={styles.code}>
                            <div className={styles.codeTop}>
                                <span>
                                    <i className="bi bi-braces" />
                                    JSON
                                </span>
                            </div>

                            <pre>{responseText}</pre>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className={styles.details}>
                        {history.length === 0 ? (
                            <div className={styles.detailRow}>
                                <span>Check History</span>

                                <strong>No checks yet</strong>
                            </div>
                        ) : (
                            history.map((check) => (
                                <div key={check.id} className={styles.detailRow}>
                                    <span>{formatDate(check.checkedAt)}</span>

                                    <strong
                                        className={
                                            check.status === 'SUCCESS'
                                                ? styles.metricSuccess
                                                : styles.metricDanger
                                        }
                                    >
                                        {check.status}
                                        {' · '}
                                        {check.httpStatus ?? '—'}
                                        {' · '}
                                        {check.responseTime ?? '—'} ms
                                    </strong>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}

function formatDate(value: string | null) {
    if (!value) {
        return 'Never';
    }

    return new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatResponse(value: unknown) {
    if (value === null || value === undefined) {
        return 'No response body';
    }

    if (typeof value === 'string') {
        return value;
    }

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

async function copyToClipboard(value: string) {
    try {
        await navigator.clipboard.writeText(value);
    } catch (error) {
        console.error('Failed to copy response:', error);
    }
}

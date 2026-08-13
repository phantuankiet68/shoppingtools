'use client';

import ApiHealthSummary from '@/components/platform/api-health/api-health-summary';

import styles from '@/styles/platform/api-health/api-health-toolbar.module.css';

interface Props {
    checkingAll: boolean;
    summary: {
        total: number;
        healthy: number;
        failed: number;
        timeout: number;
    };
    onCreate: () => void;
    onCheckAll: () => void;
}

export default function ApiHealthToolbar({ checkingAll, summary, onCreate, onCheckAll }: Props) {
    return (
        <header className={styles.toolbar}>
            <div className={styles.left}>
                <ApiHealthSummary
                    total={summary.total}
                    healthy={summary.healthy}
                    failed={summary.failed}
                    timeout={summary.timeout}
                />
            </div>

            <div className={styles.right}>
                <div className={styles.buttons}>
                    <button type="button" className={styles.secondary} onClick={onCreate}>
                        <i className="bi bi-plus-lg" />
                        Create
                    </button>

                    <button
                        type="button"
                        className={styles.primary}
                        onClick={onCheckAll}
                        disabled={checkingAll}
                    >
                        <i
                            className={`bi ${
                                checkingAll ? 'bi-arrow-repeat' : 'bi-play-circle'
                            } ${checkingAll ? styles.spin : ''}`}
                        />

                        {checkingAll ? 'Checking...' : 'Check All'}
                    </button>
                </div>
            </div>
        </header>
    );
}

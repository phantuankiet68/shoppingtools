'use client';

import styles from '@/styles/admin/sites/workflow/WorkflowHeader.module.css';
import { WorkflowData } from '@/features/workflow/types';

type Props = {
    workflow: WorkflowData;
    onClose: () => void;
};

function getStatusLabel(status?: 'idle' | 'running' | 'success' | 'error') {
    switch (status) {
        case 'running':
            return 'Đang xử lý';
        case 'success':
            return 'Hoàn thành';
        case 'error':
            return 'Thất bại';
        default:
            return 'Chờ xử lý';
    }
}

function getStatusIcon(status?: 'idle' | 'running' | 'success' | 'error') {
    switch (status) {
        case 'running':
            return 'bi bi-arrow-repeat';
        case 'success':
            return 'bi bi-check-lg';
        case 'error':
            return 'bi bi-exclamation-lg';
        default:
            return 'bi bi-three-dots';
    }
}

function formatDuration(duration?: number) {
    if (duration === undefined || duration < 0) {
        return '0ms';
    }

    if (duration < 1000) {
        return `${duration}ms`;
    }

    return `${(duration / 1000).toFixed(2)}s`;
}

export default function WorkflowHeader({ workflow, onClose }: Props) {
    const runtime = workflow.runtime;
    const runtimeStatus = runtime?.status ?? 'idle';
    const completedSteps = runtime?.completedSteps ?? 0;
    const totalSteps = runtime?.totalSteps ?? 0;
    const currentNodeId = runtime?.currentNodeId;

    const currentNode = currentNodeId
        ? workflow.groups.flatMap((group) => group.nodes).find((node) => node.id === currentNodeId)
        : undefined;

    const progress = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <h1 className={styles.title}>{workflow.title}</h1>

                <div className={styles.runtime}>
                    <span className={`${styles.status} ${styles[runtimeStatus]}`}>
                        <span className={styles.statusIcon}>
                            <i className={getStatusIcon(runtimeStatus)} />
                        </span>

                        <span>{getStatusLabel(runtimeStatus)}</span>
                    </span>

                    <span className={styles.separator}>•</span>

                    <span className={styles.steps}>
                        {completedSteps}/{totalSteps} bước
                    </span>

                    <span className={styles.separator}>•</span>

                    <span className={styles.duration}>{formatDuration(runtime?.duration)}</span>
                </div>

                {currentNode && runtimeStatus === 'running' && (
                    <div className={styles.current}>
                        <span className={styles.currentLabel}>Đang xử lý</span>

                        <strong>{currentNode.title}</strong>
                    </div>
                )}

                {runtime?.error && runtimeStatus === 'error' && (
                    <div className={styles.errorMessage}>
                        <i className="bi bi-exclamation-triangle" />
                        <span>{runtime.error}</span>
                    </div>
                )}

                <div className={styles.progress}>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>

                    <span className={styles.progressValue}>{progress}%</span>
                </div>
            </div>

            <div className={styles.right}>
                <section className={styles.legend}>
                    <h3 className={styles.legendTitle}>TRẠNG THÁI NODE</h3>

                    <div className={styles.legendItem}>
                        <span className={`${styles.dot} ${styles.success}`}>
                            <i className="bi bi-check-lg" />
                        </span>

                        <span>Thành công</span>
                    </div>

                    <div className={styles.legendItem}>
                        <span className={`${styles.dot} ${styles.running}`}>
                            <i className="bi bi-arrow-repeat" />
                        </span>

                        <span>Đang xử lý</span>
                    </div>

                    <div className={styles.legendItem}>
                        <span className={`${styles.dot} ${styles.waiting}`}>
                            <i className="bi bi-three-dots" />
                        </span>

                        <span>Chờ xử lý</span>
                    </div>

                    <div className={styles.legendItem}>
                        <span className={`${styles.dot} ${styles.error}`}>
                            <i className="bi bi-exclamation-lg" />
                        </span>

                        <span>Lỗi / Thất bại</span>
                    </div>
                </section>

                <button type="button" className={styles.close} onClick={onClose}>
                    <i className="bi bi-x-lg" />
                </button>
            </div>
        </header>
    );
}

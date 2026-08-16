'use client';

import styles from '@/styles/admin/sites/workflow/WorkflowBenefits.module.css';
import { WorkflowData } from '@/features/workflow/types';

type Props = {
    workflow: WorkflowData;
};

export default function WorkflowBenefits({ workflow }: Props) {
    const nodes = workflow.groups.flatMap((group) => group.nodes);

    const total = workflow.runtime?.totalSteps ?? nodes.length;
    const success = nodes.filter(
        (node) => (node.runtimeStatus ?? node.status) === 'success',
    ).length;
    const running = nodes.filter(
        (node) => (node.runtimeStatus ?? node.status) === 'running',
    ).length;
    const waiting = nodes.filter(
        (node) =>
            (node.runtimeStatus ?? node.status) === 'idle' ||
            (node.runtimeStatus ?? node.status) === 'waiting',
    ).length;
    const error = nodes.filter((node) => (node.runtimeStatus ?? node.status) === 'error').length;

    const completedSteps = workflow.runtime?.completedSteps ?? success;
    const progress = total === 0 ? 0 : Math.min(100, Math.round((completedSteps / total) * 100));

    return (
        <footer className={styles.footer}>
            <div className={styles.overview}>
                <div className={styles.progress}>
                    <div className={styles.track}>
                        <div
                            className={styles.fill}
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>

                    <span className={styles.percent}>{progress}%</span>
                </div>

                <div className={styles.summary}>
                    <h4>Workflow Progress</h4>

                    <p>
                        {completedSteps} of {total} nodes completed
                    </p>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.card}>
                    <span className={`${styles.dot} ${styles.success}`} />

                    <div>
                        <strong>{success}</strong>
                        <small>Completed</small>
                    </div>
                </div>

                <div className={styles.card}>
                    <span className={`${styles.dot} ${styles.running}`} />

                    <div>
                        <strong>{running}</strong>
                        <small>Running</small>
                    </div>
                </div>

                <div className={styles.card}>
                    <span className={`${styles.dot} ${styles.waiting}`} />

                    <div>
                        <strong>{waiting}</strong>
                        <small>Waiting</small>
                    </div>
                </div>

                <div className={styles.card}>
                    <span className={`${styles.dot} ${styles.error}`} />

                    <div>
                        <strong>{error}</strong>
                        <small>Error</small>
                    </div>
                </div>
            </div>
        </footer>
    );
}

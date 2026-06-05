'use client';

import styles from '@/styles/platform/tasks/TaskStats.module.css';

export default function TaskStats({ analytics }: any) {
    return (
        <div className={styles.grid}>
            <div className={styles.card}>
                <span>Today's Tasks</span>

                <h2>{analytics?.today?.total}</h2>
            </div>

            <div className={styles.card}>
                <span>Done</span>

                <h2>{analytics?.today?.completed}</h2>
            </div>

            <div className={styles.card}>
                <span>Progress</span>

                <h2>{analytics?.today?.completionRate}%</h2>
            </div>
        </div>
    );
}

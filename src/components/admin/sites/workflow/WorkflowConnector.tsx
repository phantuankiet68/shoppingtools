'use client';

import styles from '@/styles/admin/sites/workflow/WorkflowConnector.module.css';

type Props = {
    active?: boolean;
};

export default function WorkflowConnector({ active = false }: Props) {
    return (
        <div className={`${styles.connector}`}>
            <span className={styles.line} />

            <span className={styles.arrow}>
                <i className="bi bi-chevron-right" />
            </span>
        </div>
    );
}

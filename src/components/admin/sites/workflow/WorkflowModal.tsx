'use client';

import { useEffect } from 'react';
import styles from '@/styles/admin/sites/workflow/WorkflowModal.module.css';
import { WorkflowData } from '@/features/workflow/types';
import WorkflowHeader from './WorkflowHeader';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowBenefits from './WorkflowBenefits';

type Props = {
    open: boolean;
    workflow: WorkflowData;
    onClose: () => void;
};

export default function WorkflowModal({ open, workflow, onClose }: Props) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <section className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <WorkflowHeader workflow={workflow} onClose={onClose} />

                <div className={styles.content}>
                    <WorkflowCanvas workflow={workflow} />
                </div>

                <WorkflowBenefits workflow={workflow} />
            </section>
        </div>
    );
}

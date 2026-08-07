import styles from '@/styles/platform/users/workspace-section/workspace-section.module.css';
import WorkspaceCard from './workspace-card';
import { WORKSPACES } from './workspaces';

export default function WorkspaceSection() {
    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div className={styles.heading}>
                    <div className={styles.titleRow}>
                        <h2>Workspaces</h2>

                        <div className={styles.count}>{WORKSPACES.length}</div>
                    </div>
                </div>

                <button className={styles.button}>
                    <i className="bi bi-plus-lg"></i>

                    <span>Create Workspace</span>
                </button>
            </div>

            <div className={styles.grid}>
                {WORKSPACES.map((workspace) => (
                    <WorkspaceCard key={workspace.id} workspace={workspace} />
                ))}
            </div>
        </section>
    );
}

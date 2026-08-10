import styles from '@/styles/platform/users/workspace-section/workspace-card.module.css';

export interface WorkspaceItem {
    id: string;
    name: string;
    role: string;
    owner: string;
    sites: number;
    members: number;
    plan: string;
    storageUsed: number;
    storageTotal: number;
    lastActivity: string;
    icon: string;
    accent: string;
}

interface WorkspaceCardProps {
    workspace: WorkspaceItem;
}

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
    const percent =
        workspace.storageTotal > 0
            ? Math.min((workspace.storageUsed / workspace.storageTotal) * 100, 100)
            : 0;

    return (
        <article className={styles.card}>
            <header className={styles.header}>
                <div className={styles.workspace}>
                    <div
                        className={styles.logo}
                        style={
                            {
                                '--accent': workspace.accent,
                            } as React.CSSProperties
                        }
                    >
                        <i
                            className={`bi ${workspace.icon}`}
                            style={{
                                color: workspace.accent,
                            }}
                        />
                    </div>

                    <div className={styles.content}>
                        <h3>{workspace.name}</h3>

                        <span>{workspace.role}</span>
                    </div>
                </div>

                <button type="button" className={styles.more} aria-label="Workspace menu">
                    <i className="bi bi-three-dots-vertical" />
                </button>
            </header>

            <section className={styles.meta}>
                <div>
                    <label>Owner</label>

                    <strong>{workspace.owner}</strong>
                </div>

                <div>
                    <label>Sites</label>

                    <strong>{workspace.sites}</strong>
                </div>

                <div>
                    <label>Members</label>

                    <strong>{workspace.members}</strong>
                </div>
            </section>

            <section className={styles.storage}>
                <div className={styles.storageHeader}>
                    <span>{workspace.plan}</span>

                    <strong>
                        {workspace.storageUsed} GB / {workspace.storageTotal} GB
                    </strong>
                </div>

                <div className={styles.progress}>
                    <div
                        style={{
                            width: `${percent}%`,
                            background: workspace.accent,
                        }}
                    />
                </div>
            </section>

            <footer className={styles.footer}>
                <span>Last activity</span>

                <strong>
                    {new Intl.DateTimeFormat('en', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    }).format(new Date(workspace.lastActivity))}
                </strong>
            </footer>
        </article>
    );
}

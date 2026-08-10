'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from '@/styles/platform/users/workspace-section/workspace-section.module.css';
import WorkspaceCard, { WorkspaceItem } from './workspace-card';
import { WorkspaceModal } from './WorkspaceModal';

export interface Workspace {
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

interface WorkspaceSectionProps {
    userId: string | null;
}

export default function WorkspaceSection({ userId }: WorkspaceSectionProps) {
    const [loading, setLoading] = useState(false);
    const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const loadWorkspaces = useCallback(async () => {
        if (!userId) {
            setWorkspaces([]);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`/api/platform/users/${userId}/workspaces`, {
                cache: 'no-store',
            });

            const json = await response.json();

            if (!response.ok || !json.ok) {
                throw new Error(json.message);
            }

            setWorkspaces(json.data);
        } catch (error) {
            console.error('LOAD_WORKSPACES_ERROR', error);
            setWorkspaces([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadWorkspaces();
    }, [loadWorkspaces]);

    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <div className={styles.bgCircle1} />
                <div className={styles.bgCircle2} />
                <div className={styles.bgDotsTop} />
                <div className={styles.bgDotsBottom} />

                <div className={styles.left}>
                    <div className={styles.iconBox}>
                        <i className="bi bi-window-stack" />
                    </div>

                    <div className={styles.headerContent}>
                        <div className={styles.headerContent}>
                            <h2>Workspaces</h2>
                            <p>Manage websites, projects and teams from a single workspace.</p>
                        </div>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <button className={styles.button}>
                        <i className="bi bi-plus-lg" />
                        <span>Create Workspace</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className={styles.empty}>Loading workspaces...</div>
            ) : workspaces.length === 0 ? (
                <div className={styles.empty}>No workspaces found.</div>
            ) : (
                <div className={styles.grid}>
                    {workspaces.map((workspace) => (
                        <WorkspaceCard key={workspace.id} workspace={workspace} />
                    ))}
                </div>
            )}
            <WorkspaceModal
                open={openModal}
                ownerUserId={userId ?? ''}
                onClose={() => setOpenModal(false)}
                onCreated={() => {
                    setOpenModal(false);
                    loadWorkspaces();
                }}
            />
        </section>
    );
}

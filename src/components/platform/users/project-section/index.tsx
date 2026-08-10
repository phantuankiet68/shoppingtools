'use client';

import { useCallback, useEffect, useState } from 'react';

import styles from '@/styles/platform/users/project-section/project-section.module.css';

import ProjectCard from './project-card';

export interface ProjectItem {
    id: string;
    userId: string;

    name: string;
    slug: string;

    websiteType: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';

    thumbnail: string | null;
    logo: string | null;
    domain: string | null;

    totalViews: number;
    totalTemplates: number;
    storageUsed: number;

    isPublished: boolean;

    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
}

interface ProjectSectionProps {
    userId?: string | null;
}

export default function ProjectSection({ userId }: ProjectSectionProps) {
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [loading, setLoading] = useState(false);

    const loadProjects = useCallback(async () => {
        if (!userId) {
            setProjects([]);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`/api/platform/users/${userId}/projects`, {
                cache: 'no-store',
            });

            const json = await response.json();

            if (!json.ok) {
                throw new Error(json.message);
            }

            setProjects(json.data);
        } catch (error) {
            console.error('LOAD_PROJECTS_ERROR', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    if (!userId) {
        return (
            <section className={styles.section}>
                <div className={styles.header}>
                    <h2>Projects</h2>
                </div>
            </section>
        );
    }

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
                            <h2>Projects</h2>
                            <p>
                                Organize projects, monitor progress and collaborate with your team.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <button className={styles.button}>
                        <i className="bi bi-grid-1x2-fill" />
                        <span>Browse Projects</span>
                        <i className="bi bi-chevron-right" />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className={styles.empty}>Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className={styles.empty}>No projects found.</div>
            ) : (
                <div className={styles.grid}>
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onStatusChange={loadProjects}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

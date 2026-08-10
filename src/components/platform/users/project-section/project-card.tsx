'use client';

import { useState } from 'react';
import Image from 'next/image';

import styles from '@/styles/platform/users/project-section/project-card.module.css';

import type { ProjectItem } from './index';

interface ProjectCardProps {
    project: ProjectItem;
    onStatusChange: () => void;
}

function getStatusClass(status: ProjectItem['status']) {
    switch (status) {
        case 'APPROVED':
            return styles.approved;

        case 'REJECTED':
            return styles.rejected;

        default:
            return styles.pending;
    }
}

function getStatusLabel(status: ProjectItem['status']) {
    switch (status) {
        case 'APPROVED':
            return 'Approved';

        case 'REJECTED':
            return 'Rejected';

        default:
            return 'Pending';
    }
}

function getWebsiteIcon(type: string) {
    switch (type.toLowerCase()) {
        case 'ecommerce':
            return 'bi-cart3';

        case 'blog':
            return 'bi-journal-text';

        case 'booking':
            return 'bi-calendar-check';

        case 'lms':
            return 'bi-mortarboard';

        case 'landing':
            return 'bi-window';

        default:
            return 'bi-globe';
    }
}

function formatStorage(storage: number) {
    const mb = storage / 1024 / 1024;

    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }

    return `${Math.round(mb)} MB`;
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
}

export default function ProjectCard({ project, onStatusChange }: ProjectCardProps) {
    const [loading, setLoading] = useState(false);

    const thumbnail = project.thumbnail ?? '/assets/images/blog-02.png';

    async function updateStatus(status: 'APPROVED' | 'REJECTED') {
        try {
            setLoading(true);

            const response = await fetch(
                `/api/platform/users/${project.userId}/projects/${project.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status,
                    }),
                },
            );

            const json = await response.json();

            if (!response.ok || !json.ok) {
                throw new Error(json.message);
            }

            onStatusChange();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Update failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <article className={styles.card}>
            <div className={styles.thumbnail}>
                <Image
                    src={thumbnail}
                    alt={project.name}
                    fill
                    sizes="(max-width:1000px)100vw,420px"
                    className={styles.image}
                />

                <div className={styles.overlay}>
                    <span className={`${styles.badge} ${getStatusClass(project.status)}`}>
                        {getStatusLabel(project.status)}
                    </span>

                    {project.isPublished && (
                        <span className={styles.live}>
                            <i className="bi bi-broadcast-pin" />
                            Live
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.heading}>
                    <div>
                        <h3>{project.name}</h3>

                        <p>{project.domain ?? `${project.slug}.kbuilder.app`}</p>
                    </div>

                    <button className={styles.more}>
                        <i className="bi bi-three-dots" />
                    </button>
                </div>

                <div className={styles.type}>
                    <i className={`bi ${getWebsiteIcon(project.websiteType)}`} />

                    <span>{project.websiteType}</span>
                </div>

                <div className={styles.stats}>
                    <div>
                        <i className="bi bi-eye" />

                        <strong>{project.totalViews.toLocaleString()}</strong>
                    </div>

                    <div>
                        <i className="bi bi-grid-1x2" />

                        <strong>{project.totalTemplates}</strong>
                    </div>

                    <div>
                        <i className="bi bi-hdd-stack" />

                        <strong>{formatStorage(project.storageUsed)}</strong>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div>
                        <label>Created</label>

                        <strong>{formatDate(project.createdAt)}</strong>
                    </div>

                    <div>
                        <label>Updated</label>

                        <strong>{formatDate(project.updatedAt)}</strong>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.primary}>
                        <i className="bi bi-box-arrow-up-right" />
                        Open
                    </button>

                    {project.status === 'PENDING' ? (
                        <>
                            <button
                                className={styles.success}
                                disabled={loading}
                                onClick={() => updateStatus('APPROVED')}
                            >
                                {loading ? 'Loading...' : 'Approve'}
                            </button>

                            <button
                                className={styles.danger}
                                disabled={loading}
                                onClick={() => updateStatus('REJECTED')}
                            >
                                {loading ? 'Loading...' : 'Reject'}
                            </button>
                        </>
                    ) : (
                        <button disabled={loading}>Manage</button>
                    )}
                </div>
            </div>
        </article>
    );
}

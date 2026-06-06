'use client';

import { useEffect, useMemo, useState } from 'react';

import styles from '@/styles/platform/tasks/TaskViewModal.module.css';

import { archiveTask, pinTask, updateProgress } from '@/features/tasks/task.service';

interface Props {
    open: boolean;
    task: any;
    onClose: () => void;
    onRefresh?: () => void;
}

export default function TaskViewModal({ open, task, onClose, onRefresh }: Props) {
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task) {
            setProgress(task.progress ?? 0);
        }
    }, [task]);

    const statusConfig = useMemo(() => {
        switch (task?.status) {
            case 'DONE':
                return {
                    label: 'Done',
                    className: styles.done,
                    icon: 'bi-check-circle-fill',
                };

            case 'IN_PROGRESS':
                return {
                    label: 'In Progress',
                    className: styles.inProgress,
                    icon: 'bi-arrow-repeat',
                };

            case 'OVERDUE':
                return {
                    label: 'Overdue',
                    className: styles.overdue,
                    icon: 'bi-exclamation-triangle-fill',
                };

            default:
                return {
                    label: 'Todo',
                    className: styles.todo,
                    icon: 'bi-list-task',
                };
        }
    }, [task]);

    const priorityConfig = useMemo(() => {
        switch (task?.priority) {
            case 'HIGH':
                return {
                    label: 'High',
                    className: styles.highPriority,
                };

            case 'MEDIUM':
                return {
                    label: 'Medium',
                    className: styles.mediumPriority,
                };

            default:
                return {
                    label: 'Low',
                    className: styles.lowPriority,
                };
        }
    }, [task]);

    if (!open || !task) {
        return null;
    }

    const handleSaveProgress = async () => {
        try {
            setLoading(true);

            await updateProgress(task.id, progress);

            onRefresh?.();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePinTask = async () => {
        try {
            setLoading(true);

            await pinTask(task.id);

            onRefresh?.();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleArchiveTask = async () => {
        try {
            setLoading(true);

            await archiveTask(task.id);

            onRefresh?.();

            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <i className="bi bi-x-lg" />
                </button>

                <div className={styles.hero}>
                    <div className={styles.heroContent}>
                        <div className={styles.badges}>
                            <span className={`${styles.badge} ${statusConfig.className}`}>
                                <i className={`bi ${statusConfig.icon}`} />
                                {statusConfig.label}
                            </span>

                            <span className={`${styles.badge} ${priorityConfig.className}`}>
                                <i className="bi bi-lightning-charge-fill" />
                                {priorityConfig.label}
                            </span>
                        </div>
                        <div className={styles.headerInfo}>
                            <h1 className={styles.title}>{task.title}</h1>
                            <p className={styles.subtitle}>{task.category || 'Task Management'}</p>
                        </div>
                    </div>

                    {task.imageUrl && (
                        <img src={task.imageUrl} alt={task.title} className={styles.cover} />
                    )}
                </div>

                <div className={styles.body}>
                    <div className={styles.left}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <i className="bi bi-card-text" />
                                Description
                            </div>

                            <p className={styles.description}>
                                {task.description || 'No description provided.'}
                            </p>
                        </div>
                        <div className={styles.infoCard}>
                            <div className={styles.infoItem}>
                                <i className="bi bi-calendar-event-fill" />
                                <div>
                                    <span>Start Date</span>
                                    <strong>{new Date(task.startAt).toLocaleString()}</strong>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <i className="bi bi-flag-fill" />
                                <div>
                                    <span>Due Date</span>
                                    <strong>{new Date(task.endAt).toLocaleString()}</strong>
                                </div>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <i className="bi bi-bar-chart-fill" />
                                Progress Tracking
                            </div>

                            <div className={styles.progressTop}>
                                <span>Current Progress</span>

                                <strong>{progress}%</strong>
                            </div>

                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={(e) => setProgress(Number(e.target.value))}
                                className={styles.slider}
                            />
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.metaGrid}>
                            <div className={styles.metaCard}>
                                <i className="bi bi-bookmark-fill" />

                                <span>Pinned</span>

                                <strong>{task.isPinned ? 'Yes' : 'No'}</strong>
                            </div>

                            <div className={styles.metaCard}>
                                <i className="bi bi-archive-fill" />

                                <span>Archived</span>

                                <strong>{task.isArchived ? 'Yes' : 'No'}</strong>
                            </div>

                            <div className={styles.metaCard}>
                                <i className="bi bi-folder-fill" />

                                <span>Category</span>

                                <strong>{task.category || 'General'}</strong>
                            </div>

                            <div className={styles.metaCard}>
                                <i className="bi bi-speedometer2" />

                                <span>Status</span>

                                <strong>{statusConfig.label}</strong>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.saveBtn}
                                disabled={loading}
                                onClick={handleSaveProgress}
                            >
                                <i className="bi bi-check2-circle" />
                                Save Progress
                            </button>

                            <button
                                className={styles.pinBtn}
                                disabled={loading}
                                onClick={handlePinTask}
                            >
                                <i className="bi bi-pin-angle-fill" />

                                {task.isPinned ? 'Unpin Task' : 'Pin Task'}
                            </button>

                            <button
                                className={styles.archiveBtn}
                                disabled={loading}
                                onClick={handleArchiveTask}
                            >
                                <i className="bi bi-archive-fill" />

                                {task.isArchived ? 'Restore Task' : 'Archive Task'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

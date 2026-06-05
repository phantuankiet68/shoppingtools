'use client';

import { useEffect, useState } from 'react';

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

                {task.imageUrl && (
                    <img src={task.imageUrl} alt={task.title} className={styles.image} />
                )}

                <div className={styles.content}>
                    <div className={styles.titleRow}>
                        <h2>{task.title}</h2>

                        <span className={styles.statusBadge}>{task.status}</span>
                    </div>

                    <p className={styles.description}>{task.description || 'No description'}</p>

                    <div className={styles.grid}>
                        <div>
                            <label>Priority</label>

                            <span>{task.priority}</span>
                        </div>

                        <div>
                            <label>Category</label>

                            <span>{task.category}</span>
                        </div>

                        <div>
                            <label>Pinned</label>

                            <span>{task.isPinned ? 'Yes' : 'No'}</span>
                        </div>

                        <div>
                            <label>Archived</label>

                            <span>{task.isArchived ? 'Yes' : 'No'}</span>
                        </div>
                    </div>

                    <div className={styles.timeRow}>
                        <div>
                            <label>Start Date</label>

                            <p>{new Date(task.startAt).toLocaleString()}</p>
                        </div>

                        <div>
                            <label>Due Date</label>

                            <p>{new Date(task.endAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                            <label>Progress</label>

                            <strong>{progress}%</strong>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => setProgress(Number(e.target.value))}
                            className={styles.slider}
                        />

                        <div className={styles.progress}>
                            <div
                                className={styles.fill}
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.primaryBtn}
                            disabled={loading}
                            onClick={handleSaveProgress}
                        >
                            <i className="bi bi-check2-circle" />
                            Save Progress
                        </button>

                        <button
                            className={styles.warningBtn}
                            disabled={loading}
                            onClick={handlePinTask}
                        >
                            <i className="bi bi-pin-angle-fill" />

                            {task.isPinned ? 'Unpin Task' : 'Pin Task'}
                        </button>

                        <button
                            className={styles.dangerBtn}
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
    );
}

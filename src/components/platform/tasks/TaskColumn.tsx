'use client';

import { useDroppable } from '@dnd-kit/core';

import TaskCard from './TaskCard';

import styles from '@/styles/platform/tasks/TaskColumn.module.css';

interface Props {
    status: string;
    title: string;
    tasks: any[];
    icon: string;
    color: string;
    description: string;
    count: number;
    onViewTask: (task: any) => void;
}

export default function TaskColumn({
    status,
    title,
    tasks,
    icon,
    color,
    description,
    count,
    onViewTask,
}: Props) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div ref={setNodeRef} className={`${styles.column} ${isOver ? styles.columnActive : ''}`}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div
                        className={styles.icon}
                        style={{
                            backgroundColor: color,
                        }}
                    >
                        <i className={`bi ${icon}`} />
                    </div>

                    <div>
                        <h3>{title}</h3>

                        <p>{description}</p>
                    </div>
                </div>

                <div className={styles.count}>{count}</div>
            </div>

            <div ref={setNodeRef} data-status={status} className={styles.content}>
                {tasks.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            <i className="bi bi-inbox" />
                        </div>

                        <div className={styles.emptyTitle}>No Tasks</div>

                        <div className={styles.emptyText}>There are no tasks in this column.</div>
                    </div>
                ) : (
                    tasks.map((task) => <TaskCard key={task.id} task={task} onView={onViewTask} />)
                )}
            </div>
        </div>
    );
}

'use client';

import Image from 'next/image';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import styles from '@/styles/platform/tasks/TaskCard.module.css';

interface Props {
    task: any;
    onView?: (task: any) => void;
}

const priorityConfig = {
    LOW: {
        label: 'Low',
        icon: 'bi-arrow-down-circle-fill',
        className: 'low',
    },
    MEDIUM: {
        label: 'Medium',
        icon: 'bi-dash-circle-fill',
        className: 'medium',
    },
    HIGH: {
        label: 'High',
        icon: 'bi-arrow-up-circle-fill',
        className: 'high',
    },
    URGENT: {
        label: 'Urgent',
        icon: 'bi-fire',
        className: 'urgent',
    },
};

export default function TaskCard({ task, onView }: Props) {
    const priority =
        priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 9999 : 1,
    };

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onView?.(task);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
            onClick={() => onView?.(task)}
        >
            {task.imageUrl && (
                <div className={styles.cover}>
                    <Image
                        src={task.imageUrl}
                        alt={task.title}
                        fill
                        sizes="400px"
                        className={styles.image}
                    />
                </div>
            )}

            <div className={styles.top}>
                <span className={`${styles.priorityBadge} ${styles[priority.className]}`}>
                    <i className={`bi ${priority.icon}`} />
                    {priority.label}
                </span>

                <button className={styles.menuBtn} onClick={(e) => e.stopPropagation()}>
                    <i className="bi bi-three-dots" />
                </button>
            </div>

            <div className={styles.titleHeader}>
                <h4 className={styles.title}>{task.title}</h4>
            </div>

            {task.description && <p className={styles.description}>{task.description}</p>}
            <div className={styles.meta}>
                <span>
                    <i className="bi bi-calendar-event" />
                    {new Date(task.startAt).toLocaleDateString()}
                </span>

                <span>
                    <i className="bi bi-folder2-open" />
                    {task.category || 'Task'}
                </span>
            </div>

            <div className={styles.progressWrapper}>
                <div className={styles.progressHeader}>
                    <span>Progress</span>

                    <strong>{task.progress || 0}%</strong>
                </div>

                <div className={styles.progress}>
                    <div
                        className={styles.fill}
                        style={{
                            width: `${task.progress || 0}%`,
                        }}
                    />
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.avatar}>
                    <i className="bi bi-person-fill" />
                </div>

                <button className={styles.openBtn} onClick={handleView}>
                    <i className="bi bi-clipboard-check" />

                    <span>View Task</span>
                </button>
            </div>
        </div>
    );
}

'use client';

import styles from '@/styles/platform/tasks/TaskToolbar.module.css';

export type TaskView = 'board' | 'calendar' | 'analytics';

interface Props {
    search: string;
    status: string;
    priority: string;
    category: string;
    view: TaskView;

    onSearchChange: (value: string) => void;

    onStatusChange: (value: string) => void;

    onPriorityChange: (value: string) => void;

    onCategoryChange: (value: string) => void;

    onViewChange: (view: TaskView) => void;

    onRefresh: () => void;

    onCreateTask: () => void;
}

export default function TaskToolbar({
    search,
    status,
    priority,
    category,
    view,
    onSearchChange,
    onStatusChange,
    onPriorityChange,
    onCategoryChange,
    onViewChange,
    onRefresh,
    onCreateTask,
}: Props) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.filters}>
                <div className={styles.searchWrapper}>
                    <i className="bi bi-search"></i>

                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search task, assignee, keyword..."
                        className={styles.search}
                    />
                </div>
                <div className={styles.selectGroup}>
                    <i className="bi bi-kanban"></i>

                    <select value={status} onChange={(e) => onStatusChange(e.target.value)}>
                        <option value="">All Status</option>

                        <option value="TODO">Todo</option>

                        <option value="IN_PROGRESS">In Progress</option>

                        <option value="DONE">Done</option>

                        <option value="OVERDUE">Overdue</option>
                    </select>
                </div>

                <div className={styles.selectGroup}>
                    <i className="bi bi-flag"></i>

                    <select value={priority} onChange={(e) => onPriorityChange(e.target.value)}>
                        <option value="">All Priority</option>

                        <option value="LOW">Low</option>

                        <option value="MEDIUM">Medium</option>

                        <option value="HIGH">High</option>

                        <option value="URGENT">Urgent</option>
                    </select>
                </div>

                <div className={styles.selectGroup}>
                    <i className="bi bi-grid"></i>

                    <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
                        <option value="">All Category</option>

                        <option value="DEVELOPMENT">Development</option>

                        <option value="DESIGN">Design</option>

                        <option value="LEARNING">Learning</option>

                        <option value="JOB_SEARCH">Job Search</option>

                        <option value="PERSONAL">Personal</option>
                    </select>
                </div>
            </div>

            <div className={styles.actions}>
                <div className={styles.viewSwitcher}>
                    <button
                        onClick={() => onViewChange('board')}
                        className={view === 'board' ? styles.activeView : ''}
                    >
                        <i className="bi bi-kanban"></i>
                        <span>Board</span>
                    </button>

                    <button
                        onClick={() => onViewChange('calendar')}
                        className={view === 'calendar' ? styles.activeView : ''}
                    >
                        <i className="bi bi-calendar3"></i>
                        <span>Calendar</span>
                    </button>

                    <button
                        onClick={() => onViewChange('analytics')}
                        className={view === 'analytics' ? styles.activeView : ''}
                    >
                        <i className="bi bi-graph-up"></i>
                        <span>Analytics</span>
                    </button>
                </div>

                <button onClick={onRefresh} className={styles.refreshBtn}>
                    <i className="bi bi-arrow-clockwise"></i>
                </button>

                <button onClick={onCreateTask} className={styles.createBtn}>
                    <i className="bi bi-plus-lg"></i>
                    <span>New Task</span>
                </button>
            </div>
        </div>
    );
}

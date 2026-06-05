'use client';

import TaskColumn from './TaskColumn';

interface Props {
    tasks: any[];

    onViewTask: (task: any) => void;
}

const BOARD_COLUMNS = [
    {
        key: 'TODO',
        title: 'Todo',
        icon: 'bi-list-task',
        color: '#6366f1',
        description: 'Planned tasks',
    },
    {
        key: 'IN_PROGRESS',
        title: 'In Progress',
        icon: 'bi-lightning-charge-fill',
        color: '#f59e0b',
        description: 'Currently working',
    },
    {
        key: 'DONE',
        title: 'Done',
        icon: 'bi-check-circle-fill',
        color: '#10b981',
        description: 'Completed tasks',
    },
    {
        key: 'OVERDUE',
        title: 'Overdue',
        icon: 'bi-exclamation-octagon-fill',
        color: '#ef4444',
        description: 'Need attention',
    },
] as const;

export default function TaskBoard({ tasks, onViewTask }: Props) {
    const totalTasks = tasks?.length || 0;

    return (
        <div className="taskBoardWrapper">
            <div className="taskBoardGrid">
                {BOARD_COLUMNS.map((column) => {
                    const columnTasks = tasks.filter((task) => task.status === column.key);

                    return (
                        <TaskColumn
                            key={column.key}
                            title={column.title}
                            tasks={columnTasks}
                            icon={column.icon}
                            color={column.color}
                            description={column.description}
                            count={columnTasks.length}
                            onViewTask={onViewTask}
                        />
                    );
                })}
            </div>
        </div>
    );
}

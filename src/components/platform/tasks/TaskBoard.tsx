'use client';

import { useEffect, useMemo, useState } from 'react';

import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import TaskCard from './TaskCard';
import TaskColumn from './TaskColumn';

import { updateTaskStatus } from '@/features/tasks/task.service';

interface Props {
    tasks: any[];
    onViewTask: (task: any) => void;
    onRefresh?: () => Promise<void>;
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

export default function TaskBoard({ tasks, onViewTask, onRefresh }: Props) {
    const [boardTasks, setBoardTasks] = useState(tasks);

    const [activeTask, setActiveTask] = useState<any>(null);

    useEffect(() => {
        setBoardTasks(tasks);
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor),
    );

    const handleDragStart = (event: DragStartEvent) => {
        const task = boardTasks.find((item) => item.id === event.active.id);

        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragCancel = () => {
        setActiveTask(null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveTask(null);

        if (!over) {
            return;
        }

        console.log('active', active.id);

        console.log('over', over.id);

        const taskId = String(active.id);

        let newStatus = String(over.id);

        const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE'];

        if (!validStatuses.includes(newStatus)) {
            const targetTask = boardTasks.find((task) => task.id === newStatus);

            if (targetTask) {
                newStatus = targetTask.status;
            }
        }

        const task = boardTasks.find((item) => item.id === taskId);

        if (!task) {
            return;
        }

        if (task.status === newStatus) {
            return;
        }

        const previousTasks = [...boardTasks];

        /**
         * Optimistic UI
         */
        setBoardTasks((prev) =>
            prev.map((item) =>
                item.id === taskId
                    ? {
                          ...item,
                          status: newStatus,
                      }
                    : item,
            ),
        );

        try {
            await updateTaskStatus(taskId, newStatus);

            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Update task status failed:', error);

            setBoardTasks(previousTasks);
        }
    };

    const groupedTasks = useMemo(() => {
        return BOARD_COLUMNS.reduce(
            (acc, column) => {
                acc[column.key] = boardTasks.filter((task) => task.status === column.key);

                return acc;
            },
            {} as Record<string, any[]>,
        );
    }, [boardTasks]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="taskBoardWrapper">
                <div className="taskBoardGrid">
                    {BOARD_COLUMNS.map((column) => {
                        const columnTasks = groupedTasks[column.key] || [];

                        return (
                            <SortableContext
                                key={column.key}
                                items={columnTasks.map((task) => task.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <TaskColumn
                                    status={column.key}
                                    title={column.title}
                                    tasks={columnTasks}
                                    icon={column.icon}
                                    color={column.color}
                                    description={column.description}
                                    count={columnTasks.length}
                                    onViewTask={onViewTask}
                                />
                            </SortableContext>
                        );
                    })}
                </div>
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div
                        style={{
                            width: 320,
                            pointerEvents: 'none',
                        }}
                    >
                        <TaskCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

'use client';

import { useMemo, useState } from 'react';

import CreateTaskModal from '@/components/platform/tasks/CreateTaskModal';
import TaskAnalytics from '@/components/platform/tasks/TaskAnalytics';
import TaskBoard from '@/components/platform/tasks/TaskBoard';
import TaskCalendar from '@/components/platform/tasks/TaskCalendar';
import TaskToolbar from '@/components/platform/tasks/TaskToolbar';
import TaskViewModal from '@/components/platform/tasks/TaskViewModal';
import { useTasks } from '@/hooks/tasks/useTasks';

export default function AdminTaskClient() {
    const { tasks, loading, refresh } = useTasks();

    const [search, setSearch] = useState('');

    const [status, setStatus] = useState('');

    const [priority, setPriority] = useState('');

    const [category, setCategory] = useState('');

    const [view, setView] = useState<'board' | 'calendar' | 'analytics'>('board');

    const [openCreateModal, setOpenCreateModal] = useState(false);

    const [selectedTask, setSelectedTask] = useState<any>(null);

    const [openView, setOpenView] = useState(false);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const keyword = search.trim().toLowerCase();

            const matchSearch =
                !keyword ||
                task.title?.toLowerCase().includes(keyword) ||
                task.description?.toLowerCase().includes(keyword) ||
                task.category?.toLowerCase().includes(keyword);

            const matchPriority = !priority || task.priority === priority;

            const matchCategory = !category || task.category === category;

            const matchStatus = !status || task.status === status;

            return matchSearch && matchPriority && matchCategory && matchStatus;
        });
    }, [tasks, search, priority, category, status]);

    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <TaskToolbar
                search={search}
                status={status}
                priority={priority}
                category={category}
                view={view}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onPriorityChange={setPriority}
                onCategoryChange={setCategory}
                onViewChange={setView}
                onRefresh={refresh}
                onCreateTask={() => setOpenCreateModal(true)}
            />

            {view === 'board' && (
                <TaskBoard
                    tasks={filteredTasks}
                    onViewTask={(task) => {
                        setSelectedTask(task);
                        setOpenView(true);
                    }}
                />
            )}
            {view === 'calendar' && (
                <TaskCalendar
                    onViewTask={(task) => {
                        setSelectedTask(task);
                        setOpenView(true);
                    }}
                />
            )}
            {view === 'analytics' && <TaskAnalytics />}
            <CreateTaskModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onSuccess={refresh}
            />
            <TaskViewModal
                open={openView}
                task={selectedTask}
                onClose={() => setOpenView(false)}
                onRefresh={refresh}
            />
        </>
    );
}

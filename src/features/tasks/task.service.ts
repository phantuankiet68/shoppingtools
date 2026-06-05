export async function getTask(id: string) {
    const res = await fetch(`/api/platform/tasks/${id}`);

    return res.json();
}

export async function getTasks() {
    const res = await fetch('/api/platform/tasks', {
        cache: 'no-store',
    });

    return res.json();
}

export async function getAnalytics() {
    const res = await fetch('/api/platform/tasks/analytics', {
        cache: 'no-store',
    });

    return res.json();
}

export async function getDashboard() {
    const res = await fetch('/api/platform/tasks/dashboard', {
        cache: 'no-store',
    });

    return res.json();
}

export async function getCalendar() {
    const res = await fetch('/api/platform/tasks/calendar', {
        cache: 'no-store',
    });

    return res.json();
}

export async function getOverdueTasks() {
    const res = await fetch('/api/platform/tasks/overdue', {
        cache: 'no-store',
    });

    return res.json();
}

export async function updateProgress(id: string, progress: number) {
    const res = await fetch(`/api/platform/tasks/progress/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            progress,
        }),
    });

    return res.json();
}

export async function pinTask(id: string) {
    const res = await fetch(`/api/platform/tasks/${id}/pin`, {
        method: 'PATCH',
    });

    return res.json();
}

export async function archiveTask(id: string) {
    const res = await fetch(`/api/platform/tasks/${id}/archive`, {
        method: 'PATCH',
    });

    return res.json();
}

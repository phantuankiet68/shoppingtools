export interface Task {
    id: string;

    title: string;

    description?: string;

    imageUrl?: string;

    category: string;

    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE' | 'CANCELLED';

    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

    progress: number;

    startAt: string;

    endAt: string;

    color?: string;

    isPinned: boolean;
}

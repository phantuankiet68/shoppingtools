import { prisma } from '@/lib/prisma';

import { errorResponse, successResponse } from '@/lib/tasks/api-response';

import { requireAdminAuthUser } from '@/lib/auth/auth';

export async function GET() {
    try {
        const user = await requireAdminAuthUser();

        const tasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                isArchived: false,
            },

            select: {
                id: true,
                title: true,
                description: true,

                startAt: true,
                endAt: true,

                status: true,
                priority: true,
                progress: true,

                category: true,
                color: true,

                createdAt: true,
                updatedAt: true,
            },

            orderBy: {
                startAt: 'asc',
            },
        });

        const events = tasks.map((task) => ({
            id: task.id,

            title: task.title,

            start: task.startAt,

            end: task.endAt,

            backgroundColor: task.color,

            borderColor: task.color,

            extendedProps: {
                task,

                status: task.status,

                priority: task.priority,

                progress: task.progress,
            },
        }));

        return successResponse(events);
    } catch (error) {
        console.error(error);

        return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500);
    }
}

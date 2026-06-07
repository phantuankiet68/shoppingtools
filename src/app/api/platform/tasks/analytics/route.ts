import { prisma } from '@/lib/prisma';

import { errorResponse, successResponse } from '@/lib/tasks/api-response';

import { requireAdminAuthUser } from '@/lib/auth/auth';

export async function GET() {
    try {
        const user = await requireAdminAuthUser();

        const now = new Date();

        // =====================================
        // Date Ranges
        // =====================================

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const startOfWeek = new Date(now);

        startOfWeek.setDate(now.getDate() - now.getDay());

        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);

        endOfWeek.setDate(startOfWeek.getDate() + 6);

        endOfWeek.setHours(23, 59, 59, 999);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // =====================================
        // Today Tasks
        // =====================================

        const todayTasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                isArchived: false,

                startAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        const todayTotal = todayTasks.length;

        const todayCompleted = todayTasks.filter((task) => task.status === 'DONE').length;

        const todayInProgress = todayTasks.filter((task) => task.status === 'IN_PROGRESS').length;

        const todayOverdue = todayTasks.filter((task) => task.status === 'OVERDUE').length;

        const todayCompletionRate =
            todayTotal > 0 ? Number(((todayCompleted / todayTotal) * 100).toFixed(2)) : 0;

        // =====================================
        // Week Tasks
        // =====================================

        const weekTasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                isArchived: false,

                startAt: {
                    gte: startOfWeek,
                    lte: endOfWeek,
                },
            },
        });

        const weekTotal = weekTasks.length;

        const weekCompleted = weekTasks.filter((task) => task.status === 'DONE').length;

        const weekCompletionRate =
            weekTotal > 0 ? Number(((weekCompleted / weekTotal) * 100).toFixed(2)) : 0;

        // =====================================
        // Month Tasks
        // =====================================

        const monthTasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                isArchived: false,

                startAt: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });

        const monthTotal = monthTasks.length;

        const monthCompleted = monthTasks.filter((task) => task.status === 'DONE').length;

        const monthInProgress = monthTasks.filter((task) => task.status === 'IN_PROGRESS').length;

        const monthOverdue = monthTasks.filter((task) => task.status === 'OVERDUE').length;

        const monthCompletionRate =
            monthTotal > 0 ? Number(((monthCompleted / monthTotal) * 100).toFixed(2)) : 0;

        // =====================================
        // Focus Statistics
        // =====================================

        const focusStats = await prisma.task.aggregate({
            where: {
                userId: user.id,
                isArchived: false,
            },

            _sum: {
                estimatedMinutes: true,
                actualMinutes: true,
                totalPauseMinutes: true,
                totalFocusMinutes: true,
            },
        });

        const estimatedMinutes = focusStats._sum.estimatedMinutes ?? 0;

        const actualMinutes = focusStats._sum.actualMinutes ?? 0;

        const totalPauseMinutes = focusStats._sum.totalPauseMinutes ?? 0;

        const totalFocusMinutes = focusStats._sum.totalFocusMinutes ?? 0;

        const efficiency =
            estimatedMinutes > 0
                ? Number(((actualMinutes / estimatedMinutes) * 100).toFixed(2))
                : 0;

        // =====================================
        // Last 6 Months Chart
        // =====================================

        const monthlyTasks = [];

        const currentYear = now.getFullYear();

        for (let month = 0; month < 12; month++) {
            const start = new Date(currentYear, month, 1);

            const end = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);

            const total = await prisma.task.count({
                where: {
                    userId: user.id,

                    isArchived: false,

                    startAt: {
                        gte: start,
                        lte: end,
                    },
                },
            });

            monthlyTasks.push({
                month: start.toLocaleString('en-US', {
                    month: 'short',
                }),

                total,
            });
        }
        // =====================================
        // Productivity Trend
        // =====================================

        const productivity = [
            {
                name: 'Today',
                completion: todayCompletionRate,
            },

            {
                name: 'Week',
                completion: weekCompletionRate,
            },

            {
                name: 'Month',
                completion: monthCompletionRate,
            },
        ];

        // =====================================
        // Status Distribution
        // =====================================

        const statusDistribution = [
            {
                name: 'Completed',
                value: monthCompleted,
            },

            {
                name: 'In Progress',
                value: monthInProgress,
            },

            {
                name: 'Overdue',
                value: monthOverdue,
            },
        ];

        return successResponse({
            today: {
                total: todayTotal,
                completed: todayCompleted,
                inProgress: todayInProgress,
                overdue: todayOverdue,
                completionRate: todayCompletionRate,
            },

            week: {
                total: weekTotal,
                completed: weekCompleted,
                completionRate: weekCompletionRate,
            },

            month: {
                total: monthTotal,
                completed: monthCompleted,
                inProgress: monthInProgress,
                overdue: monthOverdue,
                completionRate: monthCompletionRate,
            },

            focus: {
                estimatedMinutes,
                actualMinutes,
                totalPauseMinutes,
                totalFocusMinutes,
                efficiency,
            },

            monthlyTasks,

            productivity,

            statusDistribution,
        });
    } catch (error) {
        console.error(error);

        return errorResponse(error instanceof Error ? error.message : 'Internal server error', 500);
    }
}

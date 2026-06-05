import { prisma } from "@/lib/prisma";

import {
  successResponse,
  errorResponse,
} from "@/lib/tasks/api-response";

import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET() {
  try {
    const user = await requireAdminAuthUser();

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      todayTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      recentTasks,
      upcomingTasks,
      focusStats,
    ] = await Promise.all([
      prisma.task.count({
        where: {
          userId: user.id,
          isArchived: false,
          startAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),

      prisma.task.count({
        where: {
          userId: user.id,
          isArchived: false,
          status: "DONE",
        },
      }),

      prisma.task.count({
        where: {
          userId: user.id,
          isArchived: false,
          status: "IN_PROGRESS",
        },
      }),

      prisma.task.count({
        where: {
          userId: user.id,
          isArchived: false,
          status: "OVERDUE",
        },
      }),

      prisma.task.findMany({
        where: {
          userId: user.id,
          isArchived: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),

      prisma.task.findMany({
        where: {
          userId: user.id,
          isArchived: false,
          status: {
            notIn: ["DONE", "CANCELLED"],
          },
          endAt: {
            gte: now,
          },
        },
        orderBy: {
          endAt: "asc",
        },
        take: 5,
      }),

      prisma.task.aggregate({
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
      }),
    ]);

    const completionRate =
      todayTasks > 0
        ? Number(
            (
              (completedTasks / todayTasks) *
              100
            ).toFixed(2)
          )
        : 0;

    return successResponse({
      summary: {
        todayTasks,

        completedTasks,

        inProgressTasks,

        overdueTasks,

        completionRate,
      },

      focus: {
        estimatedMinutes:
          focusStats._sum
            .estimatedMinutes ?? 0,

        actualMinutes:
          focusStats._sum
            .actualMinutes ?? 0,

        totalPauseMinutes:
          focusStats._sum
            .totalPauseMinutes ?? 0,

        totalFocusMinutes:
          focusStats._sum
            .totalFocusMinutes ?? 0,
      },

      recentTasks,

      upcomingTasks,
    });
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Internal server error",
      500
    );
  }
}
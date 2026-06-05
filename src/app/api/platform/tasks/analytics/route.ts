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

    // =========================
    // Today
    // =========================

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // =========================
    // Week
    // =========================

    const startOfWeek = new Date(now);
    startOfWeek.setDate(
      now.getDate() - now.getDay()
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(
      startOfWeek.getDate() + 6
    );
    endOfWeek.setHours(
      23,
      59,
      59,
      999
    );

    // =========================
    // Month
    // =========================

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // =========================
    // TODAY
    // =========================

    const todayTasks =
      await prisma.task.findMany({
        where: {
          userId: user.id,
          isArchived: false,

          startAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

    const todayTotal =
      todayTasks.length;

    const todayCompleted =
      todayTasks.filter(
        (t) => t.status === "DONE"
      ).length;

    const todayInProgress =
      todayTasks.filter(
        (t) =>
          t.status ===
          "IN_PROGRESS"
      ).length;

    const todayOverdue =
      todayTasks.filter(
        (t) =>
          t.status === "OVERDUE"
      ).length;

    const todayCompletionRate =
      todayTotal > 0
        ? Number(
            (
              (todayCompleted /
                todayTotal) *
              100
            ).toFixed(2)
          )
        : 0;

    // =========================
    // WEEK
    // =========================

    const weekTasks =
      await prisma.task.findMany({
        where: {
          userId: user.id,
          isArchived: false,

          startAt: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      });

    const weekTotal =
      weekTasks.length;

    const weekCompleted =
      weekTasks.filter(
        (t) => t.status === "DONE"
      ).length;

    const weekCompletionRate =
      weekTotal > 0
        ? Number(
            (
              (weekCompleted /
                weekTotal) *
              100
            ).toFixed(2)
          )
        : 0;

    // =========================
    // MONTH
    // =========================

    const monthTasks =
      await prisma.task.findMany({
        where: {
          userId: user.id,
          isArchived: false,

          startAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

    const monthTotal =
      monthTasks.length;

    const monthCompleted =
      monthTasks.filter(
        (t) => t.status === "DONE"
      ).length;

    const monthCompletionRate =
      monthTotal > 0
        ? Number(
            (
              (monthCompleted /
                monthTotal) *
              100
            ).toFixed(2)
          )
        : 0;

    // =========================
    // Focus Statistics
    // =========================

    const focusStats =
      await prisma.task.aggregate({
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

    return successResponse({
      today: {
        total: todayTotal,
        completed:
          todayCompleted,
        inProgress:
          todayInProgress,
        overdue:
          todayOverdue,
        completionRate:
          todayCompletionRate,
      },

      week: {
        total: weekTotal,
        completed:
          weekCompleted,
        completionRate:
          weekCompletionRate,
      },

      month: {
        total: monthTotal,
        completed:
          monthCompleted,
        completionRate:
          monthCompletionRate,
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
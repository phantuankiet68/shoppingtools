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
    // Auto Update Overdue
    // =========================

    await prisma.task.updateMany({
      where: {
        userId: user.id,

        isArchived: false,

        endAt: {
          lt: now,
        },

        progress: {
          lt: 100,
        },

        status: {
          notIn: [
            "DONE",
            "CANCELLED",
            "OVERDUE",
          ],
        },
      },

      data: {
        status: "OVERDUE",
      },
    });

    // =========================
    // Get Overdue Tasks
    // =========================

    const overdueTasks =
      await prisma.task.findMany({
        where: {
          userId: user.id,

          isArchived: false,

          status: "OVERDUE",
        },

        orderBy: {
          endAt: "asc",
        },
      });

    const totalOverdue =
      overdueTasks.length;

    return successResponse({
      total: totalOverdue,
      tasks: overdueTasks,
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
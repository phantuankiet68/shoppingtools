import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  successResponse,
  errorResponse,
} from "@/lib/tasks/api-response";

import { requireAdminAuthUser } from "@/lib/auth/auth";

type Params = Promise<{
  id: string;
}>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await requireAdminAuthUser();

    const { id } = await params;

    const body = await request.json();

    const progress = Number(body.progress);

    if (
      Number.isNaN(progress) ||
      progress < 0 ||
      progress > 100
    ) {
      return errorResponse(
        "Progress must be between 0 and 100",
        400
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
        isArchived: false,
      },
    });

    if (!task) {
      return errorResponse(
        "Task not found",
        404
      );
    }

    const updateData: any = {
      progress,
    };

    // Done
    if (progress >= 100) {
      updateData.progress = 100;
      updateData.status = "DONE";
      updateData.completedAt = new Date();
    }

    // In Progress
    else if (progress > 0) {
      updateData.status = "IN_PROGRESS";
      updateData.completedAt = null;
    }

    // Todo
    else {
      updateData.status = "TODO";
      updateData.completedAt = null;
    }

    const updatedTask =
      await prisma.task.update({
        where: {
          id,
        },
        data: updateData,
      });

    return successResponse(updatedTask);
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
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

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!task) {
      return errorResponse(
        "Task not found",
        404
      );
    }

    const updatedTask =
      await prisma.task.update({
        where: {
          id,
        },
        data: {
          isArchived: !task.isArchived,
        },
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
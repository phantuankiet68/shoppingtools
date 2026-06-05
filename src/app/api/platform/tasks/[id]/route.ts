import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  successResponse,
  errorResponse,
} from "@/lib/tasks/api-response";

import {
  CreateTaskSchema,
} from "@/features/tasks/task.validation";

import { requireAdminAuthUser } from "@/lib/auth/auth";

type Params = Promise<{
  id: string;
}>;

export async function GET(
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
        isArchived: false,
      },
    });

    if (!task) {
      return errorResponse(
        "Task not found",
        404
      );
    }

    return successResponse(task);
  } catch (error) {
    console.error(error);

    return errorResponse(
      "Internal server error",
      500
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await requireAdminAuthUser();

    const { id } = await params;

    const existingTask =
      await prisma.task.findFirst({
        where: {
          id,
          userId: user.id,
          isArchived: false,
        },
      });

    if (!existingTask) {
      return errorResponse(
        "Task not found",
        404
      );
    }

    const body = await request.json();

    const validated =
      CreateTaskSchema.parse(body);

    const startAt = new Date(
      validated.startAt
    );

    const endAt = new Date(
      validated.endAt
    );

    if (startAt > endAt) {
      return errorResponse(
        "End time must be after start time",
        400
      );
    }

    const task =
      await prisma.task.update({
        where: {
          id,
        },
        data: {
          title: validated.title,

          description:
            validated.description,

          imageUrl:
            validated.imageUrl,

          category:
            validated.category,

          startAt,

          endAt,

          priority:
            validated.priority,

          estimatedMinutes:
            validated.estimatedMinutes,
        },
      });

    return successResponse(task);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await requireAdminAuthUser();

    const { id } = await params;

    const existingTask =
      await prisma.task.findFirst({
        where: {
          id,
          userId: user.id,
          isArchived: false,
        },
      });

    if (!existingTask) {
      return errorResponse(
        "Task not found",
        404
      );
    }

    await prisma.task.update({
      where: {
        id,
      },
      data: {
        isArchived: true,
      },
    });

    return successResponse({
      message:
        "Task archived successfully",
    });
  } catch (error) {
    console.error(error);

    return errorResponse(
      "Internal server error",
      500
    );
  }
}
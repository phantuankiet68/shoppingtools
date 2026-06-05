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

export async function GET(
  request: NextRequest
) {
  try {
    const user = await requireAdminAuthUser();

    const search =
      request.nextUrl.searchParams.get("search") ??
      undefined;

    const status =
      request.nextUrl.searchParams.get("status");

    const category =
      request.nextUrl.searchParams.get("category");

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,

        isArchived: false,

        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),

        ...(status && {
          status: status as any,
        }),

        ...(category && {
          category: category as any,
        }),
      },

      orderBy: [
        {
          isPinned: "desc",
        },
        {
          order: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return successResponse(tasks);
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

export async function POST(
  request: NextRequest
) {
  try {
    const user = await requireAdminAuthUser();

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

    const task = await prisma.task.create({
      data: {
        userId: user.id,

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

    return successResponse(
      task,
      201
    );
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
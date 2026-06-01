import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const template = await prisma.emailTemplate.findUnique({
      where: {
        id,
      },
    });

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          message: "Template not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      item: template,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch template",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const { name, image, html, isActive } = body;

    const template = await prisma.emailTemplate.update({
      where: {
        id,
      },
      data: {
        name,
        image,
        html,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      item: template,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update template",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const template = await prisma.emailTemplate.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          message: "Template not found",
        },
        {
          status: 404,
        },
      );
    }

    if (template._count.campaigns > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete template because it is used by campaigns",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.emailTemplate.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete template",
      },
      {
        status: 500,
      },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      items: templates,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch templates",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, image, html, isActive = true } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Template name is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!html?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Template html is required",
        },
        {
          status: 400,
        },
      );
    }

    const template = await prisma.emailTemplate.create({
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
        message: "Failed to create template",
      },
      {
        status: 500,
      },
    );
  }
}

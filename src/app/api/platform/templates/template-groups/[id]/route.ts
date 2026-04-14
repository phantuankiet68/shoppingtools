import { NextRequest, NextResponse } from 'next/server';
import { Prisma, AccessTier } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const ACCESS_TIERS: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

type UpdateTemplateGroupBody = {
  code?: string;
  name?: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  minTier?: AccessTier;
  minTierLevel?: number;
};

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isAccessTier(value: unknown): value is AccessTier {
  return typeof value === 'string' && ACCESS_TIERS.includes(value as AccessTier);
}

function validateUpdateBody(body: UpdateTemplateGroupBody) {
  const data: Prisma.TemplateGroupUpdateInput = {};
  const errors: string[] = [];

  if (body.code !== undefined) {
    const code = normalizeString(body.code);
    if (!code) errors.push('code must not be empty');
    else data.code = code;
  }

  if (body.name !== undefined) {
    const name = normalizeString(body.name);
    if (!name) errors.push('name must not be empty');
    else data.name = name;
  }

  if (body.description !== undefined) {
    const description =
      typeof body.description === 'string' ? body.description.trim() || null : null;
    data.description = description;
  }

  if (body.sortOrder !== undefined) {
    if (!Number.isFinite(body.sortOrder)) {
      errors.push('sortOrder must be a number');
    } else if (body.sortOrder < 0) {
      errors.push('sortOrder must be greater than or equal to 0');
    } else {
      data.sortOrder = Math.trunc(body.sortOrder);
    }
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') {
      errors.push('isActive must be a boolean');
    } else {
      data.isActive = body.isActive;
    }
  }

  if (body.minTier !== undefined) {
    if (!isAccessTier(body.minTier)) {
      errors.push('minTier is invalid');
    } else {
      data.minTier = body.minTier;
    }
  }

  if (body.minTierLevel !== undefined) {
    if (!Number.isFinite(body.minTierLevel)) {
      errors.push('minTierLevel must be a number');
    } else if (body.minTierLevel < 1) {
      errors.push('minTierLevel must be greater than or equal to 1');
    } else {
      data.minTierLevel = Math.trunc(body.minTierLevel);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data,
  };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const item = await prisma.templateGroup.findUnique({
      where: { id },
      include: {
        templates: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        },
        _count: {
          select: {
            templates: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template group not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('GET /api/template-groups/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch template group',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateTemplateGroupBody;

    const result = validateUpdateBody(body);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.templateGroup.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Template group updated successfully',
    });
  } catch (error) {
    console.error('PATCH /api/template-groups/[id] error:', error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template group not found',
        },
        { status: 404 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Code already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update template group',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.templateGroup.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Template group deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/template-groups/[id] error:', error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template group not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete template group',
      },
      { status: 500 }
    );
  }
}
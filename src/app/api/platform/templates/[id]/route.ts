import { NextRequest, NextResponse } from 'next/server';
import { Prisma, TemplateStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const TEMPLATE_STATUSES: TemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

type UpdateTemplateBody = {
  code?: string;
  name?: string;
  kind?: string;
  groupId?: string;
  status?: TemplateStatus;
  previewImageUrl?: string | null;
  isActive?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
};

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function isTemplateStatus(value: unknown): value is TemplateStatus {
  return typeof value === 'string' && TEMPLATE_STATUSES.includes(value as TemplateStatus);
}

function toSafeInteger(value: unknown, defaultValue: number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }

  return defaultValue;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template id is required.',
        },
        { status: 400 }
      );
    }

    const template = await prisma.templateCatalog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        group: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy template.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('GET template detail error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch template detail.',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template id is required.',
        },
        { status: 400 }
      );
    }

    const body = (await req.json()) as UpdateTemplateBody;

    const codeRaw = normalizeString(body.code);
    const name = normalizeString(body.name);
    const kind = normalizeString(body.kind);
    const groupId = normalizeString(body.groupId);
    const previewImageUrl = normalizeString(body.previewImageUrl) || null;

    const code = toSlug(codeRaw);
    const sortOrder = toSafeInteger(body.sortOrder, 0);
    const status = isTemplateStatus(body.status) ? body.status : 'PUBLISHED';
    const isActive = typeof body.isActive === 'boolean' ? body.isActive : true;
    const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : true;

    const errors: string[] = [];

    if (!code) errors.push('code is required');
    if (!name) errors.push('name is required');
    if (!kind) errors.push('kind is required');
    if (!groupId) errors.push('groupId is required');
    if (sortOrder < 0) errors.push('sortOrder must be greater than or equal to 0');

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors,
        },
        { status: 400 }
      );
    }

    const existingTemplate = await prisma.templateCatalog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy template.',
        },
        { status: 404 }
      );
    }

    const existingGroup = await prisma.templateGroup.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!existingGroup) {
      return NextResponse.json(
        {
          success: false,
          message: 'Group không tồn tại.',
        },
        { status: 400 }
      );
    }

    const updated = await prisma.templateCatalog.update({
      where: { id },
      data: {
        code,
        name,
        kind,
        status,
        previewImageUrl,
        isActive,
        isPublic,
        sortOrder,
        group: {
          connect: { id: groupId },
        },
      },
      include: {
        group: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Cập nhật template thành công.',
    });
  } catch (error: any) {
    console.error('PUT template error:', error);

    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'Code đã tồn tại. Vui lòng dùng code khác.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Cập nhật template thất bại.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Template id is required.',
        },
        { status: 400 }
      );
    }

    const existingTemplate = await prisma.templateCatalog.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy template.',
        },
        { status: 404 }
      );
    }

    await prisma.templateCatalog.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa template thành công.',
    });
  } catch (error) {
    console.error('DELETE template error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Xóa template thất bại.',
      },
      { status: 500 }
    );
  }
}
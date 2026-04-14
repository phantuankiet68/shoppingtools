import { NextRequest, NextResponse } from 'next/server';
import { Prisma, TemplateStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const TEMPLATE_STATUSES: TemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

type CreateTemplateCatalogBody = {
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

function validateCreateBody(body: CreateTemplateCatalogBody) {
  const codeRaw = normalizeString(body.code);
  const code = toSlug(codeRaw);
  const name = normalizeString(body.name);
  const kind = normalizeString(body.kind);
  const groupId = normalizeString(body.groupId);
  const previewImageUrl = normalizeString(body.previewImageUrl) || null;

  const status = isTemplateStatus(body.status) ? body.status : 'PUBLISHED';
  const isActive = typeof body.isActive === 'boolean' ? body.isActive : true;
  const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : true;

  const sortOrder =
    typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
      ? Math.trunc(body.sortOrder)
      : 0;

  const errors: string[] = [];

  if (!code) errors.push('code is required');
  if (!name) errors.push('name is required');
  if (!kind) errors.push('kind is required');
  if (!groupId) errors.push('groupId is required');
  if (sortOrder < 0) errors.push('sortOrder must be greater than or equal to 0');

  return {
    valid: errors.length === 0,
    errors,
    data: {
      code,
      name,
      kind,
      groupId,
      status,
      previewImageUrl,
      isActive,
      isPublic,
      sortOrder,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const keyword = searchParams.get('keyword')?.trim() || '';
    const groupId = searchParams.get('groupId')?.trim() || '';
    const status = searchParams.get('status');
    const isActiveParam = searchParams.get('isActive');
    const isPublicParam = searchParams.get('isPublic');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const page = Number(searchParams.get('page') || 1);
    const pageSize = Number(searchParams.get('pageSize') || 10);

    const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
    const safePageSize =
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100
        ? Math.trunc(pageSize)
        : 10;

    const where: Prisma.TemplateCatalogWhereInput = {
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { code: { contains: keyword, mode: 'insensitive' } },
              { kind: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(groupId ? { groupId } : {}),
      ...(isTemplateStatus(status) ? { status } : {}),
      ...(isActiveParam === 'true' ? { isActive: true } : {}),
      ...(isActiveParam === 'false' ? { isActive: false } : {}),
      ...(isPublicParam === 'true' ? { isPublic: true } : {}),
      ...(isPublicParam === 'false' ? { isPublic: false } : {}),
      ...(includeDeleted ? {} : { deletedAt: null }),
    };

    const [items, total] = await Promise.all([
      prisma.templateCatalog.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
        include: {
          group: true,
        },
      }),
      prisma.templateCatalog.count({ where }),
    ]);

    const normalizedItems = items.map((item) => ({
      ...item,
      group: item.group
        ? {
            ...item.group,
            description: item.group.description ?? undefined,
          }
        : undefined,
      previewImageUrl: item.previewImageUrl ?? undefined,
    }));

    return NextResponse.json({
      success: true,
      data: normalizedItems,
      meta: {
        page: safePage,
        pageSize: safePageSize,
        total,
        totalPages: Math.ceil(total / safePageSize),
      },
    });
  } catch (error) {
    console.error('GET /api/platform/templates error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch templates',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTemplateCatalogBody;
    const result = validateCreateBody(body);

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

    const group = await prisma.templateGroup.findUnique({
      where: { id: result.data.groupId },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          message: 'groupId does not exist',
        },
        { status: 400 }
      );
    }

    const created = await prisma.templateCatalog.create({
      data: {
        code: result.data.code,
        name: result.data.name,
        kind: result.data.kind,
        groupId: result.data.groupId,
        status: result.data.status,
        previewImageUrl: result.data.previewImageUrl,
        isActive: result.data.isActive,
        isPublic: result.data.isPublic,
        sortOrder: result.data.sortOrder,
      },
      include: {
        group: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...created,
          group: created.group
            ? {
                ...created.group,
                description: created.group.description ?? undefined,
              }
            : undefined,
          previewImageUrl: created.previewImageUrl ?? undefined,
        },
        message: 'Template created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/platform/templates error:', error);

    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'Code already exists. Please use another code.',
        },
        { status: 409 }
      );
    }

    if (error?.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid groupId.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create template',
      },
      { status: 500 }
    );
  }
}
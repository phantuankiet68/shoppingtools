import { NextRequest, NextResponse } from 'next/server';
import { Prisma, TemplateStatus, AccessTier } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const TEMPLATE_STATUSES: TemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const ACCESS_TIERS: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

type CreateTemplateCatalogBody = {
  code?: string;
  name?: string;
  kind?: string;
  groupId?: string;
  status?: TemplateStatus;
  previewImageUrl?: string | null;
  initialProps?: Prisma.InputJsonValue | null;
  blocks?: Prisma.InputJsonValue | null;
  isActive?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
  minTier?: AccessTier;
  minTierLevel?: number;
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

function isAccessTier(value: unknown): value is AccessTier {
  return typeof value === 'string' && ACCESS_TIERS.includes(value as AccessTier);
}

function isValidJsonValue(value: unknown): value is Prisma.InputJsonValue | null {
  return value === null || value === undefined || typeof value !== 'undefined';
}

function validateCreateBody(body: CreateTemplateCatalogBody) {
  const codeRaw = normalizeString(body.code);
  const code = toSlug(codeRaw);
  const name = normalizeString(body.name);
  const kind = normalizeString(body.kind);
  const groupId = normalizeString(body.groupId);
  const previewImageUrl = normalizeString(body.previewImageUrl) || null;

  const status = isTemplateStatus(body.status) ? body.status : 'PUBLISHED';

  const initialProps =
    body.initialProps === undefined ? null : (body.initialProps as Prisma.InputJsonValue | null);

  const blocks =
    body.blocks === undefined ? null : (body.blocks as Prisma.InputJsonValue | null);

  const isActive = typeof body.isActive === 'boolean' ? body.isActive : true;
  const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : true;

  const sortOrder =
    typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
      ? Math.trunc(body.sortOrder)
      : 0;

  const minTier = isAccessTier(body.minTier) ? body.minTier : 'BASIC';

  const minTierLevel =
    typeof body.minTierLevel === 'number' && Number.isFinite(body.minTierLevel)
      ? Math.trunc(body.minTierLevel)
      : 1;

  const errors: string[] = [];

  if (!code) errors.push('code is required');
  if (!name) errors.push('name is required');
  if (!kind) errors.push('kind is required');
  if (!groupId) errors.push('groupId is required');
  if (sortOrder < 0) errors.push('sortOrder must be greater than or equal to 0');
  if (minTierLevel < 1) errors.push('minTierLevel must be greater than or equal to 1');
  if (!isValidJsonValue(initialProps)) errors.push('initialProps is invalid');
  if (!isValidJsonValue(blocks)) errors.push('blocks is invalid');

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
      initialProps,
      blocks,
      isActive,
      isPublic,
      sortOrder,
      minTier,
      minTierLevel,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const keyword = searchParams.get('keyword')?.trim() || '';
    const groupId = searchParams.get('groupId')?.trim() || '';
    const status = searchParams.get('status');
    const minTier = searchParams.get('minTier');
    const isActiveParam = searchParams.get('isActive');
    const isPublicParam = searchParams.get('isPublic');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

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
      ...(isAccessTier(minTier) ? { minTier } : {}),
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
        total,
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
        initialProps: result.data.initialProps ?? Prisma.JsonNull,
        blocks: result.data.blocks ?? Prisma.JsonNull,
        isActive: result.data.isActive,
        isPublic: result.data.isPublic,
        sortOrder: result.data.sortOrder,
        minTier: result.data.minTier,
        minTierLevel: result.data.minTierLevel,
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
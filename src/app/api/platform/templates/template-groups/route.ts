import { NextRequest, NextResponse } from 'next/server';
import { Prisma, AccessTier } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const ACCESS_TIERS: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

type CreateTemplateGroupBody = {
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

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function isAccessTier(value: unknown): value is AccessTier {
  return typeof value === 'string' && ACCESS_TIERS.includes(value as AccessTier);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const keyword = searchParams.get('keyword')?.trim() || '';
    const isActiveParam = searchParams.get('isActive');
    const minTier = searchParams.get('minTier');

    const where: Prisma.TemplateGroupWhereInput = {
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { code: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(isActiveParam === 'true' ? { isActive: true } : {}),
      ...(isActiveParam === 'false' ? { isActive: false } : {}),
      ...(isAccessTier(minTier) ? { minTier } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.templateGroup.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: {
              templates: true,
            },
          },
        },
      }),
      prisma.templateGroup.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        total,
      },
    });
  } catch (error) {
    console.error('GET template-groups error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch template groups',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTemplateGroupBody;

    const codeRaw = normalizeString(body.code);
    const name = normalizeString(body.name);

    if (!codeRaw || !name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Code và Name là bắt buộc.',
        },
        { status: 400 }
      );
    }

    const sortOrder = Number(body.sortOrder ?? 0);
    const minTierLevel = Number(body.minTierLevel ?? 1);

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sort Order phải lớn hơn hoặc bằng 0.',
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(minTierLevel) || minTierLevel < 1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Min Tier Level phải lớn hơn hoặc bằng 1.',
        },
        { status: 400 }
      );
    }

    const code = toSlug(codeRaw);

    const created = await prisma.templateGroup.create({
      data: {
        code,
        name,
        description: normalizeString(body.description) || null,
        sortOrder: Math.trunc(sortOrder),
        isActive: body.isActive ?? true,
        minTier: isAccessTier(body.minTier) ? body.minTier : 'BASIC',
        minTierLevel: Math.trunc(minTierLevel),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: 'Tạo nhóm template thành công.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST template-groups error:', error);

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
        message: 'Tạo nhóm template thất bại.',
      },
      { status: 500 }
    );
  }
}
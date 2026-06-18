import { AccessTier, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TIERS: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

type CreateTemplateCategoryBody = {
    name?: string;
    description?: string | null;
    minTier?: AccessTier;
    sortOrder?: number;
    isActive?: boolean;
};

function normalizeString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function isAccessTier(value: unknown): value is AccessTier {
    return typeof value === 'string' && ACCESS_TIERS.includes(value as AccessTier);
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const keyword = searchParams.get('keyword')?.trim();
        const isActive = searchParams.get('isActive');
        const minTier = searchParams.get('minTier');

        const where: Prisma.TemplateCategoryWhereInput = {
            ...(keyword
                ? {
                      OR: [
                          {
                              name: {
                                  contains: keyword,
                                  mode: 'insensitive',
                              },
                          },
                          {
                              description: {
                                  contains: keyword,
                                  mode: 'insensitive',
                              },
                          },
                      ],
                  }
                : {}),

            ...(isActive === 'true' && { isActive: true }),
            ...(isActive === 'false' && { isActive: false }),

            ...(isAccessTier(minTier) && {
                minTier,
            }),
        };

        const [items, total] = await Promise.all([
            prisma.templateCategory.findMany({
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

            prisma.templateCategory.count({
                where,
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: items,
            meta: {
                total,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch template categories',
            },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CreateTemplateCategoryBody;

        const name = normalizeString(body.name);

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category name is required',
                },
                { status: 400 },
            );
        }

        const sortOrder = Number(body.sortOrder ?? 0);

        if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Sort order must be >= 0',
                },
                { status: 400 },
            );
        }

        const created = await prisma.templateCategory.create({
            data: {
                name,
                description: normalizeString(body.description) || null,

                minTier: isAccessTier(body.minTier) ? body.minTier : 'BASIC',

                sortOrder: Math.trunc(sortOrder),

                isActive: body.isActive ?? true,
            },

            include: {
                _count: {
                    select: {
                        templates: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: created,
                message: 'Template category created successfully',
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create template category',
            },
            {
                status: 500,
            },
        );
    }
}

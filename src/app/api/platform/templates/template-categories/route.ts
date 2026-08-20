import { AccessTier, Prisma, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const WEBSITE_TYPES = Object.values(WebsiteType);
const ACCESS_TIERS = Object.values(AccessTier);

type CreateTemplateCategoryBody = {
    name?: string;
    description?: string | null;
    websiteType?: WebsiteType;
    minTier?: AccessTier;
    sortOrder?: number;
    isActive?: boolean;
};

function normalizeString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function isWebsiteType(value: unknown): value is WebsiteType {
    return typeof value === 'string' && WEBSITE_TYPES.includes(value as WebsiteType);
}

function isAccessTier(value: unknown): value is AccessTier {
    return typeof value === 'string' && ACCESS_TIERS.includes(value as AccessTier);
}

function parseBoolean(value: string | null): boolean | undefined {
    if (value === null) {
        return undefined;
    }

    if (value === 'true' || value === '1') {
        return true;
    }

    if (value === 'false' || value === '0') {
        return false;
    }

    return undefined;
}

/**
 * GET /api/platform/templates/template-categories
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const keyword = searchParams.get('keyword')?.trim();
        const websiteTypeValue = searchParams.get('websiteType');
        const minTierValue = searchParams.get('minTier');
        const isActiveValue = searchParams.get('isActive');

        /**
         * Validate websiteType
         */
        if (websiteTypeValue && !isWebsiteType(websiteTypeValue)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid website type',
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * Validate minTier
         */
        if (minTierValue && !isAccessTier(minTierValue)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid access tier',
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * Validate isActive
         */
        const isActive = parseBoolean(isActiveValue);

        const websiteType = isWebsiteType(websiteTypeValue) ? websiteTypeValue : undefined;

        const minTier = isAccessTier(minTierValue) ? minTierValue : undefined;

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

            ...(websiteType
                ? {
                      websiteType,
                  }
                : {}),

            ...(minTier
                ? {
                      minTier,
                  }
                : {}),

            ...(typeof isActive === 'boolean'
                ? {
                      isActive,
                  }
                : {}),
        };

        const [items, total] = await Promise.all([
            prisma.templateCategory.findMany({
                where,

                orderBy: [
                    {
                        sortOrder: 'asc',
                    },
                    {
                        createdAt: 'desc',
                    },
                ],

                include: {
                    _count: {
                        select: {
                            templates: true,
                            pageTemplates: true,
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
        console.error('[GET /api/platform/templates/template-categories]', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch template categories',
            },
            {
                status: 500,
            },
        );
    }
}

/**
 * POST /api/platform/templates/template-categories
 */
export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CreateTemplateCategoryBody;

        /**
         * Name
         */
        const name = normalizeString(body.name);

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category name is required',
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * Website type
         *
         * This field is REQUIRED by Prisma.
         */
        if (!isWebsiteType(body.websiteType)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Valid website type is required',
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * Sort order
         */
        const sortOrder = Number(body.sortOrder ?? 0);

        if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Sort order must be >= 0',
                },
                {
                    status: 400,
                },
            );
        }

        /**
         * Access tier
         */
        const minTier = isAccessTier(body.minTier) ? body.minTier : AccessTier.BASIC;

        /**
         * Create category
         */
        const created = await prisma.templateCategory.create({
            data: {
                name,

                description: normalizeString(body.description) || null,

                websiteType: body.websiteType,

                minTier,

                sortOrder: Math.trunc(sortOrder),

                isActive: body.isActive ?? true,
            },

            include: {
                _count: {
                    select: {
                        templates: true,
                        pageTemplates: true,
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
        console.error('[POST /api/platform/templates/template-categories]', error);

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

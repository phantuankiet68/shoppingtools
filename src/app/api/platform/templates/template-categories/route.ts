import { AccessTier, Prisma, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WEBSITE_TYPES = Object.values(WebsiteType);
const ACCESS_TIERS = Object.values(AccessTier);

type CreateTemplateCategoryBody = {
    name?: string;
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
    if (value === null) return undefined;

    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;

    return undefined;
}

/**
 * GET /api/platform/templates/template-categories
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const keyword = normalizeString(searchParams.get('keyword'));
        const websiteTypeValue = searchParams.get('websiteType');
        const minTierValue = searchParams.get('minTier');
        const isActiveValue = searchParams.get('isActive');

        if (websiteTypeValue && !isWebsiteType(websiteTypeValue)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid website type',
                },
                { status: 400 },
            );
        }

        if (minTierValue && !isAccessTier(minTierValue)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid access tier',
                },
                { status: 400 },
            );
        }

        const websiteType = isWebsiteType(websiteTypeValue) ? websiteTypeValue : undefined;

        const minTier = isAccessTier(minTierValue) ? minTierValue : undefined;

        const isActive = parseBoolean(isActiveValue);

        const where: Prisma.TemplateCategoryWhereInput = {
            ...(keyword && {
                name: {
                    contains: keyword,
                    mode: 'insensitive',
                },
            }),

            ...(websiteType && { websiteType }),

            ...(minTier && { minTier }),

            ...(typeof isActive === 'boolean' && { isActive }),
        };

        const [items, total] = await Promise.all([
            prisma.templateCategory.findMany({
                where,
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                include: {
                    _count: {
                        select: {
                            templates: true,
                            pageTemplates: true,
                        },
                    },
                },
            }),

            prisma.templateCategory.count({ where }),
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
            { status: 500 },
        );
    }
}

/**
 * POST /api/platform/templates/template-categories
 */
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

        if (!isWebsiteType(body.websiteType)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Valid website type is required',
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

        const minTier = isAccessTier(body.minTier) ? body.minTier : AccessTier.BASIC;

        const existing = await prisma.templateCategory.findFirst({
            where: {
                websiteType: body.websiteType,
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Template category already exists',
                },
                { status: 409 },
            );
        }

        const created = await prisma.templateCategory.create({
            data: {
                name,
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
            { status: 201 },
        );
    } catch (error) {
        console.error('[POST /api/platform/templates/template-categories]', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create template category',
            },
            { status: 500 },
        );
    }
}

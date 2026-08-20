import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getTemplateCategories } from '@/features/platform/templateCategories/templateCategories';
import { prisma } from '@/lib/prisma';
import { AccessTier, WebsiteType } from '@/generated/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WEBSITE_TYPES = Object.values(WebsiteType);
const ACCESS_TIERS = Object.values(AccessTier);

function isWebsiteType(value: string): value is WebsiteType {
    return WEBSITE_TYPES.includes(value as WebsiteType);
}

function isAccessTier(value: string): value is AccessTier {
    return ACCESS_TIERS.includes(value as AccessTier);
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

function normalizeString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
}

function parseSortOrder(value: unknown): number {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.floor(number);
}

/**
 * GET /api/platform/templates/template-categories
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized.',
                },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(req.url);

        const websiteTypeValue = searchParams.get('websiteType');
        const minTierValue = searchParams.get('minTier');
        const search = searchParams.get('search') ?? undefined;
        const isActive = parseBoolean(searchParams.get('isActive'));

        if (websiteTypeValue && !isWebsiteType(websiteTypeValue)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid website type.',
                },
                { status: 400 },
            );
        }

        if (minTierValue && !isAccessTier(minTierValue)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid access tier.',
                },
                { status: 400 },
            );
        }

        const websiteType = websiteTypeValue ? (websiteTypeValue as WebsiteType) : undefined;

        const minTier = minTierValue ? (minTierValue as AccessTier) : undefined;

        const categories = await getTemplateCategories({
            websiteType,
            minTier,
            search,
            isActive,
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    categories,
                    count: categories.length,
                },
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch (error) {
        console.error('[GET /api/platform/templates/template-categories]', error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Failed to fetch template categories.',
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
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized.',
                },
                { status: 401 },
            );
        }

        const body = await req.json();

        const name = normalizeString(body.name);

        const description = normalizeString(body.description);

        const websiteTypeValue = normalizeString(body.websiteType);

        const minTierValue = normalizeString(body.minTier);

        const sortOrder = parseSortOrder(body.sortOrder);

        const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

        /**
         * Validate name
         */
        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Category name is required.',
                },
                { status: 400 },
            );
        }

        /**
         * Validate website type
         */
        if (!websiteTypeValue || !isWebsiteType(websiteTypeValue)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid website type.',
                },
                { status: 400 },
            );
        }

        /**
         * Validate access tier
         */
        if (!minTierValue || !isAccessTier(minTierValue)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid access tier.',
                },
                { status: 400 },
            );
        }

        const websiteType = websiteTypeValue as WebsiteType;

        const minTier = minTierValue as AccessTier;

        /**
         * Prevent duplicate category names
         * within the same website type.
         */
        const existing = await prisma.templateCategory.findFirst({
            where: {
                websiteType,
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
                    error: 'Template category already exists.',
                },
                { status: 409 },
            );
        }

        /**
         * Create category
         */
        const created = await prisma.templateCategory.create({
            data: {
                name,
                description,
                websiteType,
                minTier,
                sortOrder,
                isActive,
            },
            select: {
                id: true,
                name: true,
                description: true,
                websiteType: true,
                minTier: true,
                sortOrder: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
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
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('[POST /api/platform/templates/template-categories]', error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Failed to create template category.',
            },
            { status: 500 },
        );
    }
}

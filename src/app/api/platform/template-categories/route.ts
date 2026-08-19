import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getTemplateCategories } from '@/features/platform/templateCategories/templateCategories';
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
        console.error('[GET /api/platform/template-categories]', error);

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

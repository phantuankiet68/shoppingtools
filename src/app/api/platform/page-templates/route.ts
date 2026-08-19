import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import {
    createPageTemplate,
    getPageTemplates,
} from '@/features/platform/pageTemplates/pageTemplates';
import { AccessTier, Prisma, TemplateStatus, WebsiteType } from '@/generated/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WEBSITE_TYPES = Object.values(WebsiteType);
const ACCESS_TIERS = Object.values(AccessTier);
const TEMPLATE_STATUSES = Object.values(TemplateStatus);

function parseWebsiteType(value: string | null): WebsiteType | undefined {
    if (!value) return undefined;

    return WEBSITE_TYPES.includes(value as WebsiteType) ? (value as WebsiteType) : undefined;
}

function parseAccessTier(value: string | null): AccessTier | undefined {
    if (!value) return undefined;

    return ACCESS_TIERS.includes(value as AccessTier) ? (value as AccessTier) : undefined;
}

function parseTemplateStatus(value: string | null): TemplateStatus | undefined {
    if (!value) return undefined;

    return TEMPLATE_STATUSES.includes(value as TemplateStatus)
        ? (value as TemplateStatus)
        : undefined;
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

function parseNumber(value: string | null, fallback: number) {
    if (value === null || value.trim() === '') {
        return fallback;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBlocks(value: unknown): Prisma.InputJsonValue[] {
    if (Array.isArray(value)) {
        return value as Prisma.InputJsonValue[];
    }

    if (typeof value !== 'string' || !value.trim()) {
        throw new Error('Page blocks are required.');
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(value);
    } catch {
        throw new Error('Page blocks contain invalid JSON.');
    }

    if (!Array.isArray(parsed)) {
        throw new Error('Page blocks must be a JSON array.');
    }

    return parsed as Prisma.InputJsonValue[];
}

function parsePayloadBoolean(value: unknown, fallback: boolean) {
    if (value === undefined) {
        return fallback;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        if (value === 'true' || value === '1') {
            return true;
        }

        if (value === 'false' || value === '0') {
            return false;
        }
    }

    return fallback;
}

/**
 * GET /api/platform/page-templates
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

        const page = parseNumber(searchParams.get('page'), 1);

        const limit = parseNumber(searchParams.get('limit'), 10);

        const search = searchParams.get('search')?.trim() || undefined;

        const categoryId = searchParams.get('categoryId')?.trim() || undefined;

        const websiteTypeValue = searchParams.get('websiteType');

        const minTierValue = searchParams.get('minTier');

        const statusValue = searchParams.get('status');

        const websiteType = parseWebsiteType(websiteTypeValue);

        const minTier = parseAccessTier(minTierValue);

        const status = parseTemplateStatus(statusValue);

        if (websiteTypeValue && !websiteType) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid website type.',
                },
                { status: 400 },
            );
        }

        if (minTierValue && !minTier) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid access tier.',
                },
                { status: 400 },
            );
        }

        if (statusValue && !status) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid template status.',
                },
                { status: 400 },
            );
        }

        const isActive = parseBoolean(searchParams.get('isActive'));

        const isPublic = parseBoolean(searchParams.get('isPublic'));

        const result = await getPageTemplates({
            page,
            limit,
            search,
            websiteType,
            categoryId,
            minTier,
            status,
            isActive,
            isPublic,
        });

        return NextResponse.json(
            {
                success: true,
                data: result,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch (error) {
        console.error('[GET /api/platform/page-templates]', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch page templates.',
            },
            { status: 500 },
        );
    }
}

/**
 * POST /api/platform/page-templates
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

        const body: unknown = await req.json();

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body.',
                },
                { status: 400 },
            );
        }

        const payload = body as Record<string, unknown>;

        const title = String(payload.title ?? '').trim();

        const key = String(payload.key ?? '').trim();

        const categoryId = String(payload.categoryId ?? '').trim();

        const websiteTypeValue = String(payload.websiteType ?? '').trim();

        const minTierValue = String(payload.minTier ?? payload.tier ?? AccessTier.BASIC).trim();

        const statusValue = String(payload.status ?? TemplateStatus.DRAFT).trim();

        if (!title) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Template title is required.',
                },
                { status: 400 },
            );
        }

        if (!key) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Template key is required.',
                },
                { status: 400 },
            );
        }

        if (!categoryId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Template category is required.',
                },
                { status: 400 },
            );
        }

        const websiteType = parseWebsiteType(websiteTypeValue);

        if (!websiteType) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid website type.',
                },
                { status: 400 },
            );
        }

        const minTier = parseAccessTier(minTierValue);

        if (!minTier) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid access tier.',
                },
                { status: 400 },
            );
        }

        const status = parseTemplateStatus(statusValue);

        if (!status) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid template status.',
                },
                { status: 400 },
            );
        }

        let blocks: Prisma.InputJsonValue;

        try {
            blocks = parseBlocks(payload.blocks);
        } catch (error) {
            return NextResponse.json(
                {
                    success: false,
                    error: error instanceof Error ? error.message : 'Invalid page blocks.',
                },
                { status: 400 },
            );
        }

        if (!blocks.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Page blocks are required.',
                },
                { status: 400 },
            );
        }

        const sortOrderValue = Number(payload.sortOrder ?? 0);

        const isActive = parsePayloadBoolean(payload.isActive, true);

        const isPublic = parsePayloadBoolean(payload.isPublic, true);

        const result = await createPageTemplate({
            title,
            key,
            categoryId,
            websiteType,
            minTier,
            status,
            blocks,
            path: payload.path === null || payload.path === undefined ? null : String(payload.path),
            previewImageUrl:
                payload.previewImageUrl === null || payload.previewImageUrl === undefined
                    ? null
                    : String(payload.previewImageUrl),
            sortOrder: Number.isFinite(sortOrderValue) ? sortOrderValue : 0,
            isActive,
            isPublic,
        });

        return NextResponse.json(
            {
                success: true,
                data: result,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('[POST /api/platform/page-templates]', error);

        const message = error instanceof Error ? error.message : 'Failed to create page template.';

        if (message.includes('already exists')) {
            return NextResponse.json(
                {
                    success: false,
                    error: message,
                },
                { status: 409 },
            );
        }

        if (
            message.includes('category not found') ||
            message.includes('does not belong') ||
            message.includes('blocks')
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: message,
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status: 500 },
        );
    }
}

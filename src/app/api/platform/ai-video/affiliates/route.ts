import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import {
    createVideoAffiliate,
    listVideoAffiliates,
} from '@/features/platform/ai-video/services/video-affiliate-service';

const VIDEO_AFFILIATE_PLATFORMS = [
    'TIKTOK',
    'SHOPEE',
    'LAZADA',
    'AMAZON',
    'WEBSITE',
    'OTHER',
] as const;

type VideoAffiliatePlatform = (typeof VIDEO_AFFILIATE_PLATFORMS)[number];

function isVideoAffiliatePlatform(value: unknown): value is VideoAffiliatePlatform {
    return (
        typeof value === 'string' &&
        VIDEO_AFFILIATE_PLATFORMS.includes(value as VideoAffiliatePlatform)
    );
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'Unknown error';
}

function normalizeString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim();

    return normalized || undefined;
}

function normalizeJsonArray(value: unknown): unknown[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }

    return value;
}

export async function GET() {
    try {
        const user = await requireAdminAuthUser();

        const affiliates = await listVideoAffiliates(user.id);

        return NextResponse.json(
            {
                data: affiliates,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('[ai-video] GET /affiliates error:', error);

        const message = getErrorMessage(error);

        if (
            message.toLowerCase().includes('unauthorized') ||
            message.toLowerCase().includes('authentication')
        ) {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                },
                {
                    status: 401,
                },
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to load video affiliates',
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAdminAuthUser();

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    error: 'Invalid JSON body',
                },
                {
                    status: 400,
                },
            );
        }

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json(
                {
                    error: 'Request body must be an object',
                },
                {
                    status: 400,
                },
            );
        }

        const input = body as Record<string, unknown>;

        const projectId = normalizeString(input.projectId);

        if (!projectId) {
            return NextResponse.json(
                {
                    error: 'projectId is required',
                },
                {
                    status: 400,
                },
            );
        }

        const project = await prisma.videoProject.findFirst({
            where: {
                id: projectId,
                createdById: user.id,
            },
            select: {
                id: true,
                videoAffiliateId: true,
                status: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                {
                    error: 'Video project not found',
                },
                {
                    status: 404,
                },
            );
        }

        if (project.status === 'ARCHIVED') {
            return NextResponse.json(
                {
                    error: 'Archived projects cannot receive a product',
                },
                {
                    status: 409,
                },
            );
        }

        const sourceUrl = normalizeString(input.sourceUrl);

        if (!sourceUrl) {
            return NextResponse.json(
                {
                    error: 'sourceUrl is required',
                },
                {
                    status: 400,
                },
            );
        }

        try {
            new URL(sourceUrl);
        } catch {
            return NextResponse.json(
                {
                    error: 'sourceUrl must be a valid URL',
                },
                {
                    status: 400,
                },
            );
        }

        const sourcePlatform = input.sourcePlatform === undefined ? 'OTHER' : input.sourcePlatform;

        if (!isVideoAffiliatePlatform(sourcePlatform)) {
            return NextResponse.json(
                {
                    error: 'Invalid sourcePlatform',
                    allowedPlatforms: VIDEO_AFFILIATE_PLATFORMS,
                },
                {
                    status: 400,
                },
            );
        }

        const title = normalizeString(input.title);

        const description = normalizeString(input.description);

        const category = normalizeString(input.category);

        const productImages = normalizeJsonArray(input.productImages);

        const highlights = normalizeJsonArray(input.highlights);

        const result = await prisma.$transaction(async (tx) => {
            const affiliate = await tx.videoAffiliate.create({
                data: {
                    createdById: user.id,
                    sourceUrl,
                    sourcePlatform,
                    title,
                    description,
                    category,
                    productImages: productImages
                        ? JSON.parse(JSON.stringify(productImages))
                        : undefined,
                    highlights: highlights ? JSON.parse(JSON.stringify(highlights)) : undefined,
                    status: 'DRAFT',
                },
            });

            await tx.videoProject.update({
                where: {
                    id: project.id,
                },
                data: {
                    videoAffiliateId: affiliate.id,
                    affiliateUrl: sourceUrl,
                    errorMessage: null,
                },
            });

            return affiliate;
        });

        return NextResponse.json(
            {
                success: true,
                data: result,
                projectId: project.id,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('[ai-video] POST /affiliates error:', error);

        const message = getErrorMessage(error);

        if (
            message.toLowerCase().includes('unauthorized') ||
            message.toLowerCase().includes('authentication')
        ) {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                },
                {
                    status: 401,
                },
            );
        }

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to create video affiliate',
            },
            {
                status: 500,
            },
        );
    }
}

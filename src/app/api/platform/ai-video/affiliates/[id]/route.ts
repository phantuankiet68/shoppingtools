import { NextResponse } from 'next/server';
import { requireAdminAuthUser } from '@/lib/auth/auth';
import { videoAffiliateService } from '@/features/platform/ai-video/services/video-affiliate-service';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

const VIDEO_AFFILIATE_PLATFORMS = [
    'TIKTOK',
    'SHOPEE',
    'LAZADA',
    'AMAZON',
    'WEBSITE',
    'OTHER',
] as const;

type VideoAffiliatePlatform = (typeof VIDEO_AFFILIATE_PLATFORMS)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isVideoAffiliatePlatform(value: unknown): value is VideoAffiliatePlatform {
    return (
        typeof value === 'string' &&
        VIDEO_AFFILIATE_PLATFORMS.includes(value as VideoAffiliatePlatform)
    );
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const user = await requireAdminAuthUser();
        const { id } = await context.params;

        if (!id?.trim()) {
            return NextResponse.json(
                {
                    error: 'Affiliate id is required',
                },
                {
                    status: 400,
                },
            );
        }

        const affiliate = await videoAffiliateService.get(id, user.id);

        if (!affiliate) {
            return NextResponse.json(
                {
                    error: 'Video affiliate not found',
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: affiliate,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('[ai-video] GET /affiliates/[id] error:', error);

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
                error: message,
            },
            {
                status: 500,
            },
        );
    }
}

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const user = await requireAdminAuthUser();
        const { id } = await context.params;

        if (!id?.trim()) {
            return NextResponse.json(
                {
                    error: 'Affiliate id is required',
                },
                {
                    status: 400,
                },
            );
        }

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

        if (!isRecord(body)) {
            return NextResponse.json(
                {
                    error: 'Request body must be an object',
                },
                {
                    status: 400,
                },
            );
        }

        if (body.title !== undefined && body.title !== null && typeof body.title !== 'string') {
            return NextResponse.json(
                {
                    error: 'title must be a string',
                },
                {
                    status: 400,
                },
            );
        }

        if (
            body.description !== undefined &&
            body.description !== null &&
            typeof body.description !== 'string'
        ) {
            return NextResponse.json(
                {
                    error: 'description must be a string',
                },
                {
                    status: 400,
                },
            );
        }

        if (
            body.category !== undefined &&
            body.category !== null &&
            typeof body.category !== 'string'
        ) {
            return NextResponse.json(
                {
                    error: 'category must be a string',
                },
                {
                    status: 400,
                },
            );
        }

        if (
            body.sourceUrl !== undefined &&
            body.sourceUrl !== null &&
            typeof body.sourceUrl !== 'string'
        ) {
            return NextResponse.json(
                {
                    error: 'sourceUrl must be a string',
                },
                {
                    status: 400,
                },
            );
        }

        if (body.sourcePlatform !== undefined && !isVideoAffiliatePlatform(body.sourcePlatform)) {
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

        if (body.productImages !== undefined && !Array.isArray(body.productImages)) {
            return NextResponse.json(
                {
                    error: 'productImages must be an array',
                },
                {
                    status: 400,
                },
            );
        }

        if (body.highlights !== undefined && !Array.isArray(body.highlights)) {
            return NextResponse.json(
                {
                    error: 'highlights must be an array',
                },
                {
                    status: 400,
                },
            );
        }

        if (
            body.analysisJson !== undefined &&
            body.analysisJson !== null &&
            !isRecord(body.analysisJson)
        ) {
            return NextResponse.json(
                {
                    error: 'analysisJson must be an object or null',
                },
                {
                    status: 400,
                },
            );
        }

        const affiliate = await videoAffiliateService.update(id, user.id, {
            ...(typeof body.title === 'string'
                ? {
                      title: body.title.trim(),
                  }
                : {}),
            ...(typeof body.description === 'string'
                ? {
                      description: body.description.trim(),
                  }
                : {}),
            ...(typeof body.category === 'string'
                ? {
                      category: body.category.trim(),
                  }
                : {}),
            ...(typeof body.sourceUrl === 'string'
                ? {
                      sourceUrl: body.sourceUrl.trim(),
                  }
                : {}),
            ...(isVideoAffiliatePlatform(body.sourcePlatform)
                ? {
                      sourcePlatform: body.sourcePlatform,
                  }
                : {}),
            ...(Array.isArray(body.productImages)
                ? {
                      productImages: body.productImages,
                  }
                : {}),
            ...(Array.isArray(body.highlights)
                ? {
                      highlights: body.highlights,
                  }
                : {}),
            ...(body.analysisJson !== undefined
                ? {
                      analysisJson: body.analysisJson,
                  }
                : {}),
        });

        return NextResponse.json(
            {
                success: true,
                data: affiliate,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('[ai-video] PATCH /affiliates/[id] error:', error);

        const message = getErrorMessage(error);

        if (message.toLowerCase().includes('not found')) {
            return NextResponse.json(
                {
                    error: message,
                },
                {
                    status: 404,
                },
            );
        }

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
                error: message,
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const user = await requireAdminAuthUser();
        const { id } = await context.params;

        if (!id?.trim()) {
            return NextResponse.json(
                {
                    error: 'Affiliate id is required',
                },
                {
                    status: 400,
                },
            );
        }

        const affiliate = await videoAffiliateService.delete(id, user.id);

        return NextResponse.json(
            {
                success: true,
                data: affiliate,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('[ai-video] DELETE /affiliates/[id] error:', error);

        const message = getErrorMessage(error);

        if (message.toLowerCase().includes('not found')) {
            return NextResponse.json(
                {
                    error: message,
                },
                {
                    status: 404,
                },
            );
        }

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
                error: message,
            },
            {
                status: 500,
            },
        );
    }
}

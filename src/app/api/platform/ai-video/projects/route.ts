import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';
import {
    createVideoProject,
    listVideoProjects,
} from '@/features/platform/ai-video/services/video-project-service';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return 'Unknown error';
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isPositiveNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isUnauthorizedError(error: unknown): boolean {
    const message = getErrorMessage(error).toLowerCase();

    return (
        message.includes('unauthorized') ||
        message.includes('authentication') ||
        message.includes('not authenticated')
    );
}

export async function GET() {
    try {
        const user = await requireAdminAuthUser();

        const projects = await listVideoProjects(user.id);

        return NextResponse.json(
            {
                data: projects,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('[ai-video] GET /projects error:', error);

        if (isUnauthorizedError(error)) {
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
                error: 'Failed to load video projects',
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

        if (!isNonEmptyString(input.name)) {
            return NextResponse.json(
                {
                    error: 'Project name is required',
                },
                {
                    status: 400,
                },
            );
        }

        if (
            input.videoAffiliateId !== undefined &&
            input.videoAffiliateId !== null &&
            !isNonEmptyString(input.videoAffiliateId)
        ) {
            return NextResponse.json(
                {
                    error: 'Invalid videoAffiliateId',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.characterIds !== undefined) {
            if (!Array.isArray(input.characterIds)) {
                return NextResponse.json(
                    {
                        error: 'characterIds must be an array',
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (
                input.characterIds.some(
                    (characterId) => typeof characterId !== 'string' || !characterId.trim(),
                )
            ) {
                return NextResponse.json(
                    {
                        error: 'characterIds must contain valid strings',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        if (input.durationSeconds !== undefined && !isPositiveInteger(input.durationSeconds)) {
            return NextResponse.json(
                {
                    error: 'durationSeconds must be a positive integer',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.width !== undefined && !isPositiveInteger(input.width)) {
            return NextResponse.json(
                {
                    error: 'width must be a positive integer',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.height !== undefined && !isPositiveInteger(input.height)) {
            return NextResponse.json(
                {
                    error: 'height must be a positive integer',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.aspectRatio !== undefined && !isNonEmptyString(input.aspectRatio)) {
            return NextResponse.json(
                {
                    error: 'Invalid aspectRatio',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.videoStyle !== undefined && !isNonEmptyString(input.videoStyle)) {
            return NextResponse.json(
                {
                    error: 'Invalid videoStyle',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.backgroundMusic !== undefined && !isNonEmptyString(input.backgroundMusic)) {
            return NextResponse.json(
                {
                    error: 'Invalid backgroundMusic',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.voiceProvider !== undefined && !isNonEmptyString(input.voiceProvider)) {
            return NextResponse.json(
                {
                    error: 'Invalid voiceProvider',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.voiceId !== undefined && !isNonEmptyString(input.voiceId)) {
            return NextResponse.json(
                {
                    error: 'Invalid voiceId',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.language !== undefined && !isNonEmptyString(input.language)) {
            return NextResponse.json(
                {
                    error: 'Invalid language',
                },
                {
                    status: 400,
                },
            );
        }

        const characterIds = Array.isArray(input.characterIds)
            ? input.characterIds
                  .filter((value): value is string => typeof value === 'string')
                  .map((value) => value.trim())
            : undefined;

        const project = await createVideoProject(user.id, {
            name: input.name.trim(),

            videoAffiliateId:
                typeof input.videoAffiliateId === 'string'
                    ? input.videoAffiliateId.trim()
                    : undefined,

            durationSeconds:
                typeof input.durationSeconds === 'number' ? input.durationSeconds : undefined,

            aspectRatio:
                typeof input.aspectRatio === 'string' ? input.aspectRatio.trim() : undefined,

            width: typeof input.width === 'number' ? input.width : undefined,

            height: typeof input.height === 'number' ? input.height : undefined,

            videoStyle: typeof input.videoStyle === 'string' ? input.videoStyle.trim() : undefined,

            backgroundMusic:
                typeof input.backgroundMusic === 'string'
                    ? input.backgroundMusic.trim()
                    : undefined,

            voiceProvider:
                typeof input.voiceProvider === 'string' ? input.voiceProvider.trim() : undefined,

            voiceId: typeof input.voiceId === 'string' ? input.voiceId.trim() : undefined,

            language: typeof input.language === 'string' ? input.language.trim() : undefined,

            characterIds,
        });

        return NextResponse.json(
            {
                data: project,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('[ai-video] POST /projects error:', error);

        if (isUnauthorizedError(error)) {
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
                error: error instanceof Error ? error.message : 'Failed to create video project',
            },
            {
                status: 500,
            },
        );
    }
}

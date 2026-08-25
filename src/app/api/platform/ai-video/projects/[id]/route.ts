import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';

import {
    getVideoProject,
    updateVideoProject,
} from '@/features/platform/ai-video/services/video-project-service';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

// ============================================================
// GET — Get project detail
// ============================================================

export async function GET(_request: Request, context: RouteContext) {
    try {
        const user = await requireAdminAuthUser();

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    error: 'Project id is required',
                },
                {
                    status: 400,
                },
            );
        }

        const project = await getVideoProject(id, user.id);

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

        return NextResponse.json({
            data: project,
        });
    } catch (error) {
        console.error('[ai-video] GET /projects/[id] error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to load video project',
            },
            {
                status: 500,
            },
        );
    }
}

// ============================================================
// PATCH — Update project
// ============================================================

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const user = await requireAdminAuthUser();

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    error: 'Project id is required',
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Parse body
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // Validate project
        // --------------------------------------------------------

        const existing = await getVideoProject(id, user.id);

        if (!existing) {
            return NextResponse.json(
                {
                    error: 'Video project not found',
                },
                {
                    status: 404,
                },
            );
        }

        // --------------------------------------------------------
        // Validate name
        // --------------------------------------------------------

        if (input.name !== undefined && (typeof input.name !== 'string' || !input.name.trim())) {
            return NextResponse.json(
                {
                    error: 'Project name cannot be empty',
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Validate duration
        // --------------------------------------------------------

        if (input.durationSeconds !== undefined) {
            if (
                typeof input.durationSeconds !== 'number' ||
                !Number.isFinite(input.durationSeconds) ||
                input.durationSeconds <= 0
            ) {
                return NextResponse.json(
                    {
                        error: 'durationSeconds must be a positive number',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        // --------------------------------------------------------
        // Validate width
        // --------------------------------------------------------

        if (input.width !== undefined) {
            if (
                typeof input.width !== 'number' ||
                !Number.isInteger(input.width) ||
                input.width <= 0
            ) {
                return NextResponse.json(
                    {
                        error: 'width must be a positive integer',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        // --------------------------------------------------------
        // Validate height
        // --------------------------------------------------------

        if (input.height !== undefined) {
            if (
                typeof input.height !== 'number' ||
                !Number.isInteger(input.height) ||
                input.height <= 0
            ) {
                return NextResponse.json(
                    {
                        error: 'height must be a positive integer',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        // --------------------------------------------------------
        // Validate string fields
        // --------------------------------------------------------

        const stringFields = [
            'aspectRatio',
            'videoStyle',
            'backgroundMusic',
            'voiceProvider',
            'voiceId',
            'voiceText',
            'voiceUrl',
            'language',
            'scriptText',
            'affiliateUrl',
            'ctaText',
        ] as const;

        for (const field of stringFields) {
            if (
                input[field] !== undefined &&
                input[field] !== null &&
                typeof input[field] !== 'string'
            ) {
                return NextResponse.json(
                    {
                        error: `Invalid ${field}`,
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        // --------------------------------------------------------
        // Update project
        // --------------------------------------------------------

        const project = await updateVideoProject(id, user.id, {
            ...(typeof input.name === 'string'
                ? {
                      name: input.name.trim(),
                  }
                : {}),

            ...(typeof input.videoAffiliateId === 'string' || input.videoAffiliateId === null
                ? {
                      videoAffiliateId: input.videoAffiliateId,
                  }
                : {}),

            ...(typeof input.durationSeconds === 'number'
                ? {
                      durationSeconds: input.durationSeconds,
                  }
                : {}),

            ...(typeof input.aspectRatio === 'string'
                ? {
                      aspectRatio: input.aspectRatio,
                  }
                : {}),

            ...(typeof input.width === 'number'
                ? {
                      width: input.width,
                  }
                : {}),

            ...(typeof input.height === 'number'
                ? {
                      height: input.height,
                  }
                : {}),

            ...(typeof input.language === 'string'
                ? {
                      language: input.language,
                  }
                : {}),

            ...(typeof input.videoStyle === 'string'
                ? {
                      videoStyle: input.videoStyle,
                  }
                : {}),

            ...(typeof input.backgroundMusic === 'string'
                ? {
                      backgroundMusic: input.backgroundMusic,
                  }
                : {}),

            ...(typeof input.voiceProvider === 'string'
                ? {
                      voiceProvider: input.voiceProvider,
                  }
                : {}),

            ...(typeof input.voiceId === 'string'
                ? {
                      voiceId: input.voiceId,
                  }
                : {}),

            ...(typeof input.voiceText === 'string'
                ? {
                      voiceText: input.voiceText,
                  }
                : {}),

            ...(typeof input.voiceUrl === 'string'
                ? {
                      voiceUrl: input.voiceUrl,
                  }
                : {}),

            ...(typeof input.scriptText === 'string'
                ? {
                      scriptText: input.scriptText,
                  }
                : {}),

            ...(input.scriptJson !== undefined
                ? {
                      scriptJson: input.scriptJson,
                  }
                : {}),

            ...(typeof input.affiliateUrl === 'string'
                ? {
                      affiliateUrl: input.affiliateUrl,
                  }
                : {}),

            ...(typeof input.ctaText === 'string'
                ? {
                      ctaText: input.ctaText,
                  }
                : {}),

            ...(input.settingsJson !== undefined
                ? {
                      settingsJson: input.settingsJson,
                  }
                : {}),
        });

        return NextResponse.json({
            data: project,
        });
    } catch (error) {
        console.error('[ai-video] PATCH /projects/[id] error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to update video project',
            },
            {
                status: 500,
            },
        );
    }
}

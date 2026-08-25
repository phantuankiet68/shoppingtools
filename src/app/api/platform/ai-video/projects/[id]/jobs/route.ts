import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';

import { createVideoJob, listVideoJobs } from '@/features/platform/ai-video/jobs/video-job-service';

import type {
    CreateVideoJobInput,
    VideoJobType,
} from '@/features/platform/ai-video/jobs/video-job-types';

const VIDEO_JOB_TYPES: VideoJobType[] = [
    'ANALYZE_PRODUCT',
    'GENERATE_SCRIPT',
    'GENERATE_VOICE',
    'GENERATE_SCENE',
    'GENERATE_THUMBNAIL',
    'COMPOSE_VIDEO',
    'RENDER_VIDEO',
];

function isVideoJobType(value: unknown): value is VideoJobType {
    return typeof value === 'string' && VIDEO_JOB_TYPES.includes(value as VideoJobType);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ============================================================
// GET — List Video Jobs
// ============================================================

export async function GET(request: Request) {
    try {
        const user = await requireAdminAuthUser();

        const { searchParams } = new URL(request.url);

        const projectId = searchParams.get('projectId') ?? undefined;
        const status = searchParams.get('status') ?? undefined;
        const type = searchParams.get('type') ?? undefined;

        const jobs = await listVideoJobs(user.id, {
            projectId,
            status,
            type,
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error('[ai-video] GET jobs error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to load video jobs',
            },
            {
                status: 500,
            },
        );
    }
}

// ============================================================
// POST — Create Video Job
// ============================================================

export async function POST(request: Request) {
    try {
        const user = await requireAdminAuthUser();

        let body: Record<string, unknown>;

        try {
            const parsed: unknown = await request.json();

            if (!isRecord(parsed)) {
                return NextResponse.json(
                    {
                        error: 'Request body must be an object',
                    },
                    {
                        status: 400,
                    },
                );
            }

            body = parsed;
        } catch {
            return NextResponse.json(
                {
                    error: 'Invalid JSON request body',
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Project
        // --------------------------------------------------------

        if (typeof body.projectId !== 'string' || !body.projectId.trim()) {
            return NextResponse.json(
                {
                    error: 'projectId is required',
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Job type
        // --------------------------------------------------------

        if (!isVideoJobType(body.type)) {
            return NextResponse.json(
                {
                    error: 'Invalid video job type',
                    allowedTypes: VIDEO_JOB_TYPES,
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Optional scene
        // --------------------------------------------------------

        if (
            body.sceneId !== undefined &&
            (typeof body.sceneId !== 'string' || !body.sceneId.trim())
        ) {
            return NextResponse.json(
                {
                    error: 'sceneId must be a valid string',
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Optional provider
        // --------------------------------------------------------

        if (
            body.provider !== undefined &&
            (typeof body.provider !== 'string' || !body.provider.trim())
        ) {
            return NextResponse.json(
                {
                    error: 'provider must be a valid string',
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Optional provider job id
        // --------------------------------------------------------

        if (
            body.providerJobId !== undefined &&
            (typeof body.providerJobId !== 'string' || !body.providerJobId.trim())
        ) {
            return NextResponse.json(
                {
                    error: 'providerJobId must be a valid string',
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Optional input JSON
        // --------------------------------------------------------

        if (body.inputJson !== undefined && !isRecord(body.inputJson)) {
            return NextResponse.json(
                {
                    error: 'inputJson must be an object',
                },
                {
                    status: 400,
                },
            );
        }

        // --------------------------------------------------------
        // Optional max attempts
        // --------------------------------------------------------

        if (body.maxAttempts !== undefined) {
            if (
                typeof body.maxAttempts !== 'number' ||
                !Number.isInteger(body.maxAttempts) ||
                body.maxAttempts < 1 ||
                body.maxAttempts > 20
            ) {
                return NextResponse.json(
                    {
                        error: 'maxAttempts must be an integer between 1 and 20',
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        // --------------------------------------------------------
        // Build input
        // --------------------------------------------------------

        const input: CreateVideoJobInput = {
            projectId: body.projectId,
            type: body.type,
            ...(typeof body.sceneId === 'string'
                ? {
                      sceneId: body.sceneId,
                  }
                : {}),
            ...(typeof body.provider === 'string'
                ? {
                      provider: body.provider,
                  }
                : {}),
            ...(typeof body.providerJobId === 'string'
                ? {
                      providerJobId: body.providerJobId,
                  }
                : {}),
            ...(isRecord(body.inputJson)
                ? {
                      inputJson: body.inputJson,
                  }
                : {}),
            ...(typeof body.maxAttempts === 'number'
                ? {
                      maxAttempts: body.maxAttempts,
                  }
                : {}),
        };

        // --------------------------------------------------------
        // Create
        // --------------------------------------------------------

        const job = await createVideoJob(user.id, input);

        return NextResponse.json(
            {
                success: true,
                job,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('[ai-video] POST jobs error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to create video job',
            },
            {
                status: 500,
            },
        );
    }
}

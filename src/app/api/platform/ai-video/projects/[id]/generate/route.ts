import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';

import { getVideoProject } from '@/features/platform/ai-video/services/video-project-service';

import videoPipeline from '@/features/platform/ai-video/pipeline/video-pipeline';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

function getErrorStatus(message: string): number {
    const normalized = message.toLowerCase();

    if (
        normalized.includes('already running') ||
        normalized.includes('already queued') ||
        normalized.includes('cannot be generated') ||
        normalized.includes('archived')
    ) {
        return 409;
    }

    if (
        normalized.includes('required before generation') ||
        normalized.includes('not configured') ||
        normalized.includes('not found')
    ) {
        return 400;
    }

    return 500;
}

export async function POST(request: Request, context: RouteContext) {
    try {
        const user = await requireAdminAuthUser();
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Project id is required',
                },
                {
                    status: 400,
                },
            );
        }

        let body: Record<string, unknown> = {};

        try {
            const parsed = await request.json();

            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                body = parsed as Record<string, unknown>;
            }
        } catch {
            // Empty body is allowed.
        }

        const force = body.force === true;

        const project = await getVideoProject(id, user.id);

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
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
                    success: false,
                    error: 'Archived projects cannot be generated',
                },
                {
                    status: 409,
                },
            );
        }

        if (!project.videoAffiliate) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Video affiliate product is required before generation',
                },
                {
                    status: 400,
                },
            );
        }

        if (!force && project.status === 'GENERATING') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Video generation is already running',
                    projectId: id,
                    status: project.status,
                    progress: project.progress,
                    currentStep: project.currentStep,
                },
                {
                    status: 409,
                },
            );
        }

        const result = await videoPipeline.generate(id, user.id, {
            force,
        });

        return NextResponse.json(
            {
                success: true,
                projectId: result.projectId,
                status: result.status,
                progress: result.progress,
                currentStep: result.currentStep,
                finalVideoUrl: result.finalVideoUrl ?? null,
                thumbnailUrl: result.thumbnailUrl ?? null,
                message: result.message ?? 'Video generation has been queued',
            },
            {
                status: 202,
            },
        );
    } catch (error) {
        console.error('[ai-video] POST /projects/[id]/generate error:', error);

        const message = error instanceof Error ? error.message : 'Failed to generate video';

        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            {
                status: getErrorStatus(message),
            },
        );
    }
}

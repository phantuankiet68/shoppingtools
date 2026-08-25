import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';

import { getVideoJob } from '@/features/platform/ai-video/jobs/video-job-service';

// ============================================================
// GET — Job Status
// ============================================================

export async function GET(request: Request) {
    try {
        const user = await requireAdminAuthUser();

        const { searchParams } = new URL(request.url);

        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json(
                {
                    error: 'jobId is required',
                },
                {
                    status: 400,
                },
            );
        }

        const job = await getVideoJob(user.id, jobId);

        if (!job) {
            return NextResponse.json(
                {
                    error: 'Video job not found',
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            id: job.id,
            projectId: job.projectId,
            type: job.type,
            status: job.status,

            progress: 'progress' in job ? job.progress : undefined,

            startedAt: job.startedAt ?? null,
            completedAt: job.completedAt ?? null,

            errorMessage: job.errorMessage ?? null,

            errorCode: job.errorCode ?? null,

            outputJson: job.outputJson ?? null,

            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        });
    } catch (error) {
        console.error('[ai-video] GET job status error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to load video job status',
            },
            {
                status: 500,
            },
        );
    }
}

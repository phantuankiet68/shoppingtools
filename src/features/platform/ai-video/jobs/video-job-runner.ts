import { prisma } from '@/lib/prisma';

import type { VideoJob } from '@/generated/prisma';

import { videoJobService } from './video-job-service';

import type { VideoJobHandler, VideoJobResult, VideoJobRunnerOptions } from './video-job-types';

interface JobFailureInfo {
    message: string;
    code?: string;
    permanent: boolean;
}

class VideoJobRunner {
    private readonly defaultOptions: Required<VideoJobRunnerOptions> = {
        maxAttempts: 1,
        retryFailedJobs: false,
    };

    private ensureJob(job: VideoJob | null | undefined): VideoJob {
        if (!job) {
            throw new Error('Video job not found');
        }

        return job;
    }

    async run(
        jobId: string,
        handler: VideoJobHandler,
        options: VideoJobRunnerOptions = {},
    ): Promise<VideoJobResult> {
        const config: Required<VideoJobRunnerOptions> = {
            ...this.defaultOptions,
            ...options,
        };

        let job = this.ensureJob(await videoJobService.getJob(jobId));

        if (job.status === 'COMPLETED') {
            return {
                job,
                success: true,
                output: job.outputJson ?? undefined,
            };
        }

        if (job.status === 'CANCELLED') {
            return {
                job,
                success: false,
                error: 'Video job has been cancelled',
            };
        }

        try {
            if (job.status === 'FAILED') {
                const maxAttempts = Math.max(1, Math.min(job.maxAttempts, config.maxAttempts));

                const canRetry = config.retryFailedJobs && job.attempt < maxAttempts;

                if (!canRetry) {
                    const message = job.errorMessage ?? 'Video job failed';

                    await this.markProjectFailed(job, message);

                    return {
                        job,
                        success: false,
                        error: message,
                    };
                }

                job = this.ensureJob(await videoJobService.retryJob(job.id));
            }

            job = this.ensureJob(await videoJobService.startJob(job.id));

            const output = await handler({
                job,
            });

            job = this.ensureJob(await videoJobService.completeJob(job.id, output));

            return {
                job,
                success: true,
                output,
            };
        } catch (error) {
            const failure = this.classifyFailure(error);

            const errorObject = new Error(failure.message);

            let failedJob = this.ensureJob(
                await videoJobService.failJob(job.id, errorObject, failure.code),
            );

            const maxAttempts = Math.max(1, Math.min(failedJob.maxAttempts, config.maxAttempts));

            const exhausted = failedJob.attempt >= maxAttempts;

            const shouldRetry = !failure.permanent && !exhausted && config.retryFailedJobs;

            if (!shouldRetry) {
                failedJob = this.ensureJob(await videoJobService.getJob(failedJob.id));

                await this.markProjectFailed(failedJob, failure.message);

                console.error('[ai-video] Job permanently failed:', {
                    jobId: failedJob.id,
                    projectId: failedJob.projectId,
                    type: failedJob.type,
                    errorCode: failure.code,
                    permanent: failure.permanent,
                    exhausted,
                    retryFailedJobs: config.retryFailedJobs,
                });

                return {
                    job: failedJob,
                    success: false,
                    error: failure.message,
                };
            }

            failedJob = this.ensureJob(await videoJobService.retryJob(failedJob.id));

            console.warn('[ai-video] Job scheduled for retry:', {
                jobId: failedJob.id,
                projectId: failedJob.projectId,
                type: failedJob.type,
                attempt: failedJob.attempt,
                maxAttempts: failedJob.maxAttempts,
                errorCode: failure.code,
            });

            return {
                job: failedJob,
                success: false,
                error: failure.message,
            };
        }
    }

    async runNext(
        handlerResolver: (job: VideoJob) => VideoJobHandler | null,
        options: VideoJobRunnerOptions = {},
    ): Promise<VideoJobResult | null> {
        const job = await videoJobService.getNextQueuedJob();

        if (!job) {
            return null;
        }

        const handler = handlerResolver(job);

        if (!handler) {
            const error = new Error(`No handler registered for job type: ${job.type}`);

            const failedJob = this.ensureJob(
                await videoJobService.failJob(job.id, error, 'JOB_HANDLER_NOT_FOUND'),
            );

            await this.markProjectFailed(failedJob, error.message);

            return {
                job: failedJob,
                success: false,
                error: failedJob.errorMessage ?? 'Job handler not found',
            };
        }

        return this.run(job.id, handler, options);
    }

    async runProject(
        projectId: string,
        handlerResolver: (job: VideoJob) => VideoJobHandler | null,
        options: VideoJobRunnerOptions = {},
    ): Promise<VideoJobResult[]> {
        const results: VideoJobResult[] = [];

        while (true) {
            const job = await videoJobService.getNextQueuedJob(projectId);

            if (!job) {
                break;
            }

            const handler = handlerResolver(job);

            if (!handler) {
                const error = new Error(`No handler registered for job type: ${job.type}`);

                const failedJob = this.ensureJob(
                    await videoJobService.failJob(job.id, error, 'JOB_HANDLER_NOT_FOUND'),
                );

                await this.markProjectFailed(failedJob, error.message);

                results.push({
                    job: failedJob,
                    success: false,
                    error: failedJob.errorMessage ?? 'Job handler not found',
                });

                break;
            }

            const result = await this.run(job.id, handler, options);

            results.push(result);

            if (!result.success) {
                break;
            }
        }

        return results;
    }

    private classifyFailure(error: unknown): JobFailureInfo {
        const message = error instanceof Error ? error.message : String(error);

        const normalized = message.toLowerCase();

        // ========================================================
        // PROVIDER QUOTA / BILLING
        // ========================================================

        if (
            normalized.includes('insufficient_quota') ||
            normalized.includes('exceeded your current quota') ||
            normalized.includes('quota exceeded') ||
            normalized.includes('billing details') ||
            normalized.includes('billing') ||
            normalized.includes('not enough credits') ||
            normalized.includes('insufficient credits') ||
            normalized.includes('insufficient credit') ||
            normalized.includes('credit balance') ||
            normalized.includes('out of credits') ||
            normalized.includes('credits are exhausted')
        ) {
            return {
                message,
                code: 'PROVIDER_QUOTA_EXCEEDED',
                permanent: true,
            };
        }

        // ========================================================
        // PROVIDER AUTHENTICATION
        // ========================================================

        if (
            normalized.includes('invalid api key') ||
            normalized.includes('invalid_api_key') ||
            normalized.includes('api key is invalid') ||
            normalized.includes('authentication') ||
            normalized.includes('unauthorized') ||
            normalized.includes('401')
        ) {
            return {
                message,
                code: 'PROVIDER_AUTH_ERROR',
                permanent: true,
            };
        }

        // ========================================================
        // CONFIGURATION
        // ========================================================

        if (
            normalized.includes('not configured') ||
            normalized.includes('is required before') ||
            normalized.includes('is required') ||
            normalized.includes('does not contain enough information') ||
            normalized.includes('project not found') ||
            normalized.includes('video project not found')
        ) {
            return {
                message,
                code: 'VIDEO_JOB_CONFIGURATION_ERROR',
                permanent: true,
            };
        }

        // ========================================================
        // PROVIDER VALIDATION / ASSET
        // ========================================================

        if (
            normalized.includes('validation of body failed') ||
            normalized.includes('failed to fetch asset') ||
            normalized.includes('received http response code "404"') ||
            normalized.includes('received http response code "401"') ||
            normalized.includes('received http response code "403"') ||
            normalized.includes('must be an https url') ||
            normalized.includes('invalid input')
        ) {
            return {
                message,
                code: 'PROVIDER_VALIDATION_ERROR',
                permanent: true,
            };
        }

        // ========================================================
        // UNSUPPORTED
        // ========================================================

        if (normalized.includes('unsupported') || normalized.includes('not implemented')) {
            return {
                message,
                code: 'VIDEO_JOB_UNSUPPORTED',
                permanent: true,
            };
        }

        // ========================================================
        // TEMPORARY / UNKNOWN
        // ========================================================

        return {
            message,
            permanent: false,
        };
    }

    private async markProjectFailed(job: VideoJob, message: string): Promise<void> {
        try {
            await prisma.$transaction(async (tx) => {
                await tx.videoProject.update({
                    where: {
                        id: job.projectId,
                    },
                    data: {
                        status: 'FAILED',
                        errorMessage: message,
                    },
                });

                await tx.videoJob.updateMany({
                    where: {
                        projectId: job.projectId,
                        status: {
                            in: ['QUEUED', 'PROCESSING'],
                        },
                        id: {
                            not: job.id,
                        },
                    },
                    data: {
                        status: 'CANCELLED',
                        completedAt: new Date(),
                        errorCode: 'PROJECT_FAILED',
                        errorMessage: 'Cancelled because the video project failed',
                    },
                });
            });
        } catch (error) {
            console.error('[ai-video] Failed to mark project and cancel queued jobs:', {
                projectId: job.projectId,
                jobId: job.id,
                error,
            });
        }
    }
}

export const videoJobRunner = new VideoJobRunner();

export default videoJobRunner;

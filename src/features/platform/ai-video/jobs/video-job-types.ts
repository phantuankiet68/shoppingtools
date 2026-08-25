import type { VideoJob, VideoJobType as PrismaVideoJobType } from '@/generated/prisma';

export type VideoJobType = PrismaVideoJobType;

export interface VideoJobHandlerContext {
    job: VideoJob;
}

export type VideoJobOutput = string | number | boolean | Record<string, unknown> | unknown[] | null;

export type VideoJobHandler = (context: VideoJobHandlerContext) => Promise<VideoJobOutput>;

export interface VideoJobRunnerOptions {
    maxAttempts?: number;
    retryFailedJobs?: boolean;
}

export interface CreateVideoJobInput {
    projectId: string;
    sceneId?: string;
    type: VideoJobType;
    provider?: string;
    providerJobId?: string;
    inputJson?: Record<string, unknown>;
    maxAttempts?: number;
}

export interface UpdateVideoJobInput {
    status?: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    progress?: number;
    provider?: string | null;
    providerJobId?: string | null;
    inputJson?: Record<string, unknown>;
    outputJson?: Record<string, unknown>;
    errorMessage?: string | null;
    errorCode?: string | null;
    startedAt?: Date | null;
    completedAt?: Date | null;
    attempt?: number;
}

export interface VideoJobResult {
    job: VideoJob;
    success: boolean;
    output?: VideoJobOutput;
    error?: string;
}

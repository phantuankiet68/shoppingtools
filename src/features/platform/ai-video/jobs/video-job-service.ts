import { prisma } from '@/lib/prisma';

import type { VideoJobStatus, VideoJobType, Prisma } from '@/generated/prisma';

import type { CreateVideoJobInput, UpdateVideoJobInput } from './video-job-types';

function normalizeJsonInput(
    value: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }

    return value as Prisma.InputJsonValue;
}

function normalizeJsonOutput(value: unknown): Prisma.InputJsonValue {
    if (value === null || value === undefined) {
        return {};
    }

    if (typeof value === 'object') {
        return value as Prisma.InputJsonValue;
    }

    return {
        value: String(value),
    };
}

class VideoJobService {
    async createJob(createdById: string, input: CreateVideoJobInput) {
        const project = await prisma.videoProject.findFirst({
            where: {
                id: input.projectId,
                createdById,
            },
            select: {
                id: true,
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        if (input.sceneId) {
            const scene = await prisma.videoScene.findFirst({
                where: {
                    id: input.sceneId,
                    projectId: input.projectId,
                },
                select: {
                    id: true,
                },
            });

            if (!scene) {
                throw new Error('Video scene not found');
            }
        }

        const inputJson = normalizeJsonInput(input.inputJson);

        return prisma.videoJob.create({
            data: {
                projectId: input.projectId,

                ...(input.sceneId
                    ? {
                          sceneId: input.sceneId,
                      }
                    : {}),

                type: input.type,

                status: 'QUEUED',

                ...(input.provider
                    ? {
                          provider: input.provider,
                      }
                    : {}),

                ...(input.providerJobId
                    ? {
                          providerJobId: input.providerJobId,
                      }
                    : {}),

                ...(inputJson !== undefined
                    ? {
                          inputJson,
                      }
                    : {}),

                maxAttempts: input.maxAttempts ?? 1,
            },
        });
    }

    async getJob(jobId: string) {
        return prisma.videoJob.findUnique({
            where: {
                id: jobId,
            },
            include: {
                scene: true,
                project: true,
            },
        });
    }

    async getJobByOwner(createdById: string, jobId: string) {
        return prisma.videoJob.findFirst({
            where: {
                id: jobId,
                project: {
                    createdById,
                },
            },
            include: {
                scene: true,
                project: true,
            },
        });
    }

    async listJobs(
        createdById: string,
        filters?: {
            projectId?: string;
            status?: string;
            type?: string;
        },
    ) {
        const where: Prisma.VideoJobWhereInput = {
            project: {
                createdById,
            },

            ...(filters?.projectId
                ? {
                      projectId: filters.projectId,
                  }
                : {}),

            ...(filters?.status
                ? {
                      status: filters.status as VideoJobStatus,
                  }
                : {}),

            ...(filters?.type
                ? {
                      type: filters.type as VideoJobType,
                  }
                : {}),
        };

        return prisma.videoJob.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                scene: true,
                project: true,
            },
        });
    }

    async updateJob(jobId: string, input: UpdateVideoJobInput) {
        const inputJson = normalizeJsonInput(input.inputJson);
        const outputJson = normalizeJsonInput(input.outputJson);

        return prisma.videoJob.update({
            where: {
                id: jobId,
            },

            data: {
                ...(input.status !== undefined
                    ? {
                          status: input.status,
                      }
                    : {}),

                ...(input.progress !== undefined
                    ? {
                          progress: Math.max(0, Math.min(100, input.progress)),
                      }
                    : {}),

                ...(input.provider !== undefined
                    ? {
                          provider: input.provider,
                      }
                    : {}),

                ...(input.providerJobId !== undefined
                    ? {
                          providerJobId: input.providerJobId,
                      }
                    : {}),

                ...(inputJson !== undefined
                    ? {
                          inputJson,
                      }
                    : {}),

                ...(outputJson !== undefined
                    ? {
                          outputJson,
                      }
                    : {}),

                ...(input.errorCode !== undefined
                    ? {
                          errorCode: input.errorCode,
                      }
                    : {}),

                ...(input.errorMessage !== undefined
                    ? {
                          errorMessage: input.errorMessage,
                      }
                    : {}),

                ...(input.startedAt !== undefined
                    ? {
                          startedAt: input.startedAt,
                      }
                    : {}),

                ...(input.completedAt !== undefined
                    ? {
                          completedAt: input.completedAt,
                      }
                    : {}),

                ...(input.attempt !== undefined
                    ? {
                          attempt: input.attempt,
                      }
                    : {}),
            },
        });
    }

    async startJob(jobId: string) {
        const job = await this.getJob(jobId);

        if (!job) {
            throw new Error('Video job not found');
        }

        if (job.status === 'COMPLETED') {
            return job;
        }

        if (job.status === 'CANCELLED') {
            throw new Error('Video job has been cancelled');
        }

        return prisma.videoJob.update({
            where: {
                id: jobId,
            },

            data: {
                status: 'PROCESSING',
                startedAt: new Date(),
                errorMessage: null,
                errorCode: null,
                progress: Math.max(job.progress ?? 0, 1),
            },
        });
    }

    async completeJob(jobId: string, output: unknown) {
        const outputJson = normalizeJsonOutput(output);

        return prisma.videoJob.update({
            where: {
                id: jobId,
            },

            data: {
                status: 'COMPLETED',
                progress: 100,
                outputJson,
                errorMessage: null,
                errorCode: null,
                completedAt: new Date(),
            },
        });
    }

    async failJob(jobId: string, error: unknown, errorCode?: string) {
        const message = error instanceof Error ? error.message : String(error);

        return prisma.videoJob.update({
            where: {
                id: jobId,
            },

            data: {
                status: 'FAILED',
                errorMessage: message,

                ...(errorCode !== undefined
                    ? {
                          errorCode,
                      }
                    : {}),

                completedAt: new Date(),
            },
        });
    }

    async retryJob(jobId: string) {
        const job = await this.getJob(jobId);

        if (!job) {
            throw new Error('Video job not found');
        }

        if (job.status !== 'FAILED') {
            throw new Error('Only failed jobs can be retried');
        }

        if (job.attempt >= job.maxAttempts) {
            throw new Error('Video job has reached maximum attempts');
        }

        return prisma.videoJob.update({
            where: {
                id: jobId,
            },

            data: {
                status: 'QUEUED',

                attempt: {
                    increment: 1,
                },

                progress: 0,
                startedAt: null,
                completedAt: null,
                errorMessage: null,
                errorCode: null,
            },
        });
    }

    async cancelJob(jobId: string) {
        const job = await this.getJob(jobId);

        if (!job) {
            throw new Error('Video job not found');
        }

        if (job.status === 'COMPLETED') {
            throw new Error('Completed jobs cannot be cancelled');
        }

        return prisma.videoJob.update({
            where: {
                id: jobId,
            },

            data: {
                status: 'CANCELLED',
                completedAt: new Date(),
            },
        });
    }

    async getNextQueuedJob(projectId?: string) {
        return prisma.$transaction(async (tx) => {
            const job = await tx.videoJob.findFirst({
                where: {
                    status: 'QUEUED',

                    ...(projectId
                        ? {
                              projectId,
                          }
                        : {}),
                },

                orderBy: {
                    createdAt: 'asc',
                },
            });

            if (!job) {
                return null;
            }

            const claimed = await tx.videoJob.updateMany({
                where: {
                    id: job.id,
                    status: 'QUEUED',
                },

                data: {
                    status: 'PROCESSING',
                    startedAt: new Date(),
                    errorMessage: null,
                    errorCode: null,
                    progress: Math.max(job.progress ?? 0, 1),
                },
            });

            if (claimed.count !== 1) {
                return null;
            }

            return tx.videoJob.findUnique({
                where: {
                    id: job.id,
                },

                include: {
                    scene: true,
                    project: true,
                },
            });
        });
    }

    async deleteJob(jobId: string) {
        const job = await this.getJob(jobId);

        if (!job) {
            throw new Error('Video job not found');
        }

        if (job.status === 'PROCESSING') {
            throw new Error('Processing jobs cannot be deleted');
        }

        return prisma.videoJob.delete({
            where: {
                id: jobId,
            },
        });
    }
}

export const videoJobService = new VideoJobService();

export default videoJobService;

export async function createVideoJob(createdById: string, input: CreateVideoJobInput) {
    return videoJobService.createJob(createdById, input);
}

export async function getVideoJob(createdById: string, jobId: string) {
    return videoJobService.getJobByOwner(createdById, jobId);
}

export async function listVideoJobs(
    createdById: string,
    filters?: {
        projectId?: string;
        status?: string;
        type?: string;
    },
) {
    return videoJobService.listJobs(createdById, filters);
}

export async function updateVideoJob(
    createdById: string,
    jobId: string,
    input: UpdateVideoJobInput,
) {
    const job = await videoJobService.getJobByOwner(createdById, jobId);

    if (!job) {
        throw new Error('Video job not found');
    }

    return videoJobService.updateJob(job.id, input);
}

export async function cancelVideoJob(createdById: string, jobId: string) {
    const job = await videoJobService.getJobByOwner(createdById, jobId);

    if (!job) {
        throw new Error('Video job not found');
    }

    return videoJobService.cancelJob(job.id);
}

import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';

import type {
    VideoPipelineOptions,
    VideoPipelineResult,
} from '@/features/platform/ai-video/types/video';

type QueueVideoPipelineOptions = VideoPipelineOptions & {
    force?: boolean;
};

class VideoPipeline {
    async generate(
        projectId: string,
        createdById: string,
        options: QueueVideoPipelineOptions = {},
    ): Promise<VideoPipelineResult> {
        const force = options.force === true;

        try {
            return await prisma.$transaction(
                async (tx) => {
                    const project = await tx.videoProject.findFirst({
                        where: {
                            id: projectId,
                            createdById,
                        },
                        select: {
                            id: true,
                            status: true,
                            progress: true,
                            currentStep: true,
                            finalVideoUrl: true,
                            thumbnailUrl: true,
                            videoAffiliateId: true,
                            videoAffiliate: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    });

                    if (!project) {
                        throw new Error('Video project not found');
                    }

                    if (project.status === 'ARCHIVED') {
                        throw new Error('Archived projects cannot be generated');
                    }

                    if (!project.videoAffiliateId || !project.videoAffiliate) {
                        throw new Error('Video affiliate product is required before generation');
                    }

                    if (project.status === 'GENERATING' && !force) {
                        throw new Error('Video generation is already running');
                    }

                    const existingJobs = await tx.videoJob.findMany({
                        where: {
                            projectId: project.id,
                            status: {
                                in: ['QUEUED', 'PROCESSING'],
                            },
                        },
                        select: {
                            id: true,
                            type: true,
                            status: true,
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    });

                    if (existingJobs.length > 0 && !force) {
                        throw new Error('Video generation jobs are already queued or processing');
                    }

                    if (force) {
                        await tx.videoJob.updateMany({
                            where: {
                                projectId: project.id,
                                status: {
                                    in: ['QUEUED', 'PROCESSING'],
                                },
                            },
                            data: {
                                status: 'CANCELLED',
                                completedAt: new Date(),
                                errorMessage: 'Cancelled by regeneration request',
                                errorCode: 'REGENERATED',
                            },
                        });
                    }

                    if (force) {
                        await tx.videoJob.updateMany({
                            where: {
                                projectId: project.id,
                                status: 'FAILED',
                            },
                            data: {
                                errorCode: 'REGENERATED',
                                errorMessage: 'Superseded by regeneration request',
                            },
                        });
                    }

                    await tx.videoProject.update({
                        where: {
                            id: project.id,
                        },
                        data: {
                            status: 'GENERATING',
                            progress: 5,
                            currentStep: 'ANALYZE_PRODUCT',
                            errorMessage: null,
                            completedAt: null,
                            finalVideoUrl: null,
                            thumbnailUrl: null,
                        },
                    });

                    const firstJob = await tx.videoJob.create({
                        data: {
                            projectId: project.id,
                            type: 'ANALYZE_PRODUCT',
                            status: 'QUEUED',
                            maxAttempts: 1,
                            inputJson: {
                                force,
                                source: 'video-pipeline',
                            },
                        },
                    });

                    return {
                        projectId: project.id,
                        status: 'GENERATING',
                        progress: 5,
                        currentStep: 'ANALYZE_PRODUCT',
                        finalVideoUrl: undefined,
                        thumbnailUrl: undefined,
                        message: `Video generation queued. Job ${firstJob.id} is waiting for the video worker.`,
                    };
                },
                {
                    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                },
            );
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
                throw new Error(
                    'Another video generation request is already being processed. Please wait and try again.',
                );
            }

            throw error;
        }
    }

    async getStatus(projectId: string, createdById: string): Promise<VideoPipelineResult> {
        const project = await prisma.videoProject.findFirst({
            where: {
                id: projectId,
                createdById,
            },
            select: {
                id: true,
                status: true,
                progress: true,
                currentStep: true,
                finalVideoUrl: true,
                thumbnailUrl: true,
                errorMessage: true,
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        return {
            projectId: project.id,
            status: project.status,
            progress: project.progress,
            currentStep: project.currentStep,
            finalVideoUrl: project.finalVideoUrl ?? undefined,
            thumbnailUrl: project.thumbnailUrl ?? undefined,
            message:
                project.status === 'COMPLETED'
                    ? 'Video generation completed'
                    : project.status === 'FAILED'
                      ? (project.errorMessage ?? 'Video generation failed')
                      : project.status === 'GENERATING'
                        ? 'Video generation is in progress'
                        : 'Video project is ready',
        };
    }

    async cancel(projectId: string, createdById: string): Promise<void> {
        await prisma.$transaction(
            async (tx) => {
                const project = await tx.videoProject.findFirst({
                    where: {
                        id: projectId,
                        createdById,
                    },
                    select: {
                        id: true,
                        status: true,
                    },
                });

                if (!project) {
                    throw new Error('Video project not found');
                }

                await tx.videoJob.updateMany({
                    where: {
                        projectId: project.id,
                        status: {
                            in: ['QUEUED', 'PROCESSING'],
                        },
                    },
                    data: {
                        status: 'CANCELLED',
                        completedAt: new Date(),
                        errorCode: 'PROJECT_CANCELLED',
                        errorMessage: 'Video generation cancelled',
                    },
                });

                await tx.videoProject.update({
                    where: {
                        id: project.id,
                    },
                    data: {
                        status: 'DRAFT',
                        progress: 0,
                        currentStep: null,
                        errorMessage: null,
                    },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            },
        );
    }
}

export const videoPipeline = new VideoPipeline();

export default videoPipeline;

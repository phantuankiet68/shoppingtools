import { prisma } from '@/lib/prisma';

import type { VideoJobHandler } from '../video-job-types';

export interface ThumbnailGenerator {
    generate(input: { projectId: string; videoUrl: string }): Promise<{
        thumbnailUrl: string;
    }>;
}

export function createGenerateThumbnailJobHandler(generator: ThumbnailGenerator): VideoJobHandler {
    return async ({ job }) => {
        const project = await prisma.videoProject.findUnique({
            where: {
                id: job.projectId,
            },
            select: {
                id: true,
                finalVideoUrl: true,
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        if (!project.finalVideoUrl) {
            throw new Error('Final video has not been rendered');
        }

        const result = await generator.generate({
            projectId: project.id,
            videoUrl: project.finalVideoUrl,
        });

        await prisma.videoProject.update({
            where: {
                id: project.id,
            },
            data: {
                thumbnailUrl: result.thumbnailUrl,
            },
        });

        return {
            projectId: project.id,
            thumbnailUrl: result.thumbnailUrl,
        };
    };
}

export default createGenerateThumbnailJobHandler;

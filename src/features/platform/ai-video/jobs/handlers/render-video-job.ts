import path from 'node:path';

import { prisma } from '@/lib/prisma';

import type { ThumbnailGenerator } from './generate-thumbnail-job';
import type { VideoJobHandler } from '../video-job-types';

export interface VideoRenderService {
    render(input: {
        projectId: string;
        width: number;
        height: number;
        aspectRatio: string;
        durationSeconds: number;
        voiceUrl?: string;
        backgroundMusic?: string;
        scenes: Array<{
            id: string;
            sceneNumber: number;
            durationSeconds: number;
            videoUrl: string;
        }>;
    }): Promise<{
        videoUrl: string;
        thumbnailUrl?: string;
    }>;
}

interface RenderVideoJobHandlerOptions {
    thumbnailGenerator?: ThumbnailGenerator;
}

function publicUrlToFilePath(value: string): string {
    const normalized = value.trim();

    if (!normalized) {
        throw new Error('Video URL is empty');
    }

    if (/^https?:\/\//i.test(normalized)) {
        return normalized;
    }

    if (!normalized.startsWith('/assets/')) {
        if (!normalized.startsWith('/')) {
            return normalized;
        }

        return path.join(process.cwd(), 'public', normalized.replace(/^\/+/, ''));
    }

    const relativePath = normalized.slice('/assets/'.length).replace(/^\/+/, '');

    if (
        !relativePath ||
        relativePath.includes('\0') ||
        relativePath.split('/').some((segment) => segment === '..' || segment === '.')
    ) {
        throw new Error(`Invalid storage asset URL: ${value}`);
    }

    const storageRoot = path.resolve(process.cwd(), 'storage');

    const filePath = path.resolve(storageRoot, relativePath);

    if (filePath !== storageRoot && !filePath.startsWith(`${storageRoot}${path.sep}`)) {
        throw new Error(`Storage path escapes storage root: ${value}`);
    }

    return filePath;
}

export function createRenderVideoJobHandler(
    options: RenderVideoJobHandlerOptions = {},
): VideoJobHandler {
    return async ({ job }) => {
        const project = await prisma.videoProject.findUnique({
            where: {
                id: job.projectId,
            },
            select: {
                id: true,
                status: true,
                progress: true,
                currentStep: true,
                finalVideoUrl: true,
                thumbnailUrl: true,
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        if (!project.finalVideoUrl) {
            throw new Error('Final video has not been created by COMPOSE_VIDEO');
        }

        await prisma.videoProject.update({
            where: {
                id: project.id,
            },
            data: {
                currentStep: 'RENDER_VIDEO',
                progress: 95,
                status: 'GENERATING',
                errorMessage: null,
            },
        });

        let thumbnailUrl = project.thumbnailUrl ?? undefined;

        if (!thumbnailUrl) {
            if (!options.thumbnailGenerator) {
                throw new Error('Thumbnail generator is required to finalize the rendered video');
            }

            const videoPath = publicUrlToFilePath(project.finalVideoUrl);

            if (/^https?:\/\//i.test(videoPath)) {
                throw new Error(
                    'Remote final video URLs are not supported for local thumbnail generation',
                );
            }

            const thumbnail = await options.thumbnailGenerator.generate({
                projectId: project.id,
                videoUrl: videoPath,
            });

            if (!thumbnail.thumbnailUrl) {
                throw new Error('Thumbnail generator did not return a thumbnail URL');
            }

            thumbnailUrl = thumbnail.thumbnailUrl;

            await prisma.videoProject.update({
                where: {
                    id: project.id,
                },
                data: {
                    thumbnailUrl,
                },
            });
        }

        await prisma.videoProject.update({
            where: {
                id: project.id,
            },
            data: {
                status: 'COMPLETED',
                currentStep: 'COMPLETED',
                progress: 100,
                finalVideoUrl: project.finalVideoUrl,
                thumbnailUrl,
                completedAt: new Date(),
                errorMessage: null,
            },
        });

        return {
            projectId: project.id,
            rendered: true,
            finalized: true,
            finalVideoUrl: project.finalVideoUrl,
            thumbnailUrl,
            status: 'COMPLETED',
            progress: 100,
            nextStep: 'COMPLETED',
        };
    };
}

export default createRenderVideoJobHandler;

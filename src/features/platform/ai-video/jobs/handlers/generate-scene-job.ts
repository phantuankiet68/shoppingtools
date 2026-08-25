import { prisma } from '@/lib/prisma';

import { sceneService } from '../../services/scene-service';
import type { VideoProvider } from '../../providers/video/video-provider';

import { createVideoJob } from '../video-job-service';

import type { VideoJobHandler } from '../video-job-types';

export function createGenerateSceneJobHandler(provider: VideoProvider): VideoJobHandler {
    return async ({ job }) => {
        if (!job.sceneId) {
            throw new Error('sceneId is required for GENERATE_SCENE job');
        }

        const project = await prisma.videoProject.findUnique({
            where: {
                id: job.projectId,
            },
            select: {
                id: true,
                createdById: true,
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        const scene = await sceneService.generateScene(
            project.id,
            job.sceneId,
            project.createdById,
            {
                provider,
                regenerate: false,
            },
        );

        const scenes = await prisma.videoScene.findMany({
            where: {
                projectId: project.id,
            },
            select: {
                id: true,
                sceneNumber: true,
                status: true,
                generatedVideoUrl: true,
            },
            orderBy: {
                sceneNumber: 'asc',
            },
        });

        if (!scenes.length) {
            throw new Error('No video scenes found after scene generation');
        }

        const completedScenes = scenes.filter(
            (item) => item.status === 'COMPLETED' && Boolean(item.generatedVideoUrl),
        );

        const allScenesCompleted = completedScenes.length === scenes.length;

        if (allScenesCompleted) {
            await prisma.videoProject.update({
                where: {
                    id: project.id,
                },
                data: {
                    currentStep: 'COMPOSE_VIDEO',
                    progress: 85,
                    status: 'GENERATING',
                    errorMessage: null,
                },
            });

            /*
             * A previous COMPLETED COMPOSE_VIDEO job
             * belongs to an older render and must not
             * block the current scene generation cycle.
             *
             * Only QUEUED / PROCESSING jobs block a new
             * compose job.
             */
            const existingComposeJob = await prisma.videoJob.findFirst({
                where: {
                    projectId: project.id,
                    type: 'COMPOSE_VIDEO',
                    status: {
                        in: ['QUEUED', 'PROCESSING'],
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            if (!existingComposeJob) {
                await createVideoJob(project.createdById, {
                    projectId: project.id,
                    type: 'COMPOSE_VIDEO',
                    maxAttempts: 1,
                    inputJson: {
                        source: 'generate-scene-job',
                        completedScenes: completedScenes.length,
                        totalScenes: scenes.length,
                    },
                });
            }
        } else {
            const progress = Math.min(
                80,
                50 + Math.round((completedScenes.length / scenes.length) * 30),
            );

            await prisma.videoProject.update({
                where: {
                    id: project.id,
                },
                data: {
                    currentStep: 'GENERATE_SCENES',
                    progress,
                    status: 'GENERATING',
                    errorMessage: null,
                },
            });
        }

        return {
            projectId: project.id,
            sceneId: job.sceneId,
            generated: true,
            videoUrl: scene.generatedVideoUrl,
            thumbnailUrl: scene.thumbnailUrl,
            provider: scene.provider,
            providerJobId: scene.providerJobId,
            completedScenes: completedScenes.length,
            totalScenes: scenes.length,
            allScenesCompleted,
            nextStep: allScenesCompleted ? 'COMPOSE_VIDEO' : 'GENERATE_SCENES',
        };
    };
}

export default createGenerateSceneJobHandler;

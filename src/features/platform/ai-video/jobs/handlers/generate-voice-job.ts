import { prisma } from '@/lib/prisma';

import { voiceService } from '../../services/voice-service';
import type { VoiceProvider } from '../../providers/voice/voice-provider';

import { createVideoJob } from '../video-job-service';
import type { VideoJobHandler } from '../video-job-types';

export function createGenerateVoiceJobHandler(provider: VoiceProvider): VideoJobHandler {
    return async ({ job }) => {
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

        const result = await voiceService.generateVoice(project.id, project.createdById, {
            provider,
            force: true,
        });

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
            throw new Error('No video scenes found after voice generation');
        }

        await prisma.videoProject.update({
            where: {
                id: project.id,
            },
            data: {
                currentStep: 'GENERATE_SCENES',
                progress: 50,
                status: 'GENERATING',
                errorMessage: null,
            },
        });

        const queuedJobs = [];

        for (const scene of scenes) {
            /*
             * A completed scene already has its generated video.
             * Do not generate it again unless a future explicit
             * regenerate-scene workflow requests it.
             */
            if (scene.status === 'COMPLETED' && scene.generatedVideoUrl) {
                continue;
            }

            const existingJob = await prisma.videoJob.findFirst({
                where: {
                    projectId: project.id,
                    sceneId: scene.id,
                    type: 'GENERATE_SCENE',
                    status: {
                        in: ['QUEUED', 'PROCESSING'],
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            if (existingJob) {
                queuedJobs.push(existingJob);
                continue;
            }

            const sceneJob = await createVideoJob(project.createdById, {
                projectId: project.id,
                sceneId: scene.id,
                type: 'GENERATE_SCENE',
                maxAttempts: 1,
                inputJson: {
                    sceneNumber: scene.sceneNumber,
                    source: 'generate-voice-job',
                },
            });

            queuedJobs.push(sceneJob);
        }

        return {
            projectId: project.id,
            generated: true,
            result,
            nextStep: 'GENERATE_SCENES',
            sceneCount: scenes.length,
            queuedSceneJobs: queuedJobs.map((sceneJob) => ({
                id: sceneJob.id,
                sceneId: sceneJob.sceneId,
                sceneNumber: scenes.find((scene) => scene.id === sceneJob.sceneId)?.sceneNumber,
            })),
        };
    };
}

export default createGenerateVoiceJobHandler;

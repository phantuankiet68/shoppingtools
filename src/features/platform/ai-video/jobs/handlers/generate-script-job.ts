import { prisma } from '@/lib/prisma';

import { scriptService } from '../../services/script-service';
import type { ScriptProvider } from '../../providers/script/script-provider';

import { createVideoJob } from '../video-job-service';
import type { VideoJobHandler } from '../video-job-types';

import type { GeneratedScript, ScriptScene } from '@/features/platform/ai-video/types/script';

const MAX_TEST_SCENES = 4;

export function createGenerateScriptJobHandler(provider: ScriptProvider): VideoJobHandler {
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

        const result = await scriptService.generateScript(project.id, project.createdById, {
            provider,
            force: false,
        });

        const script = result.scriptJson as GeneratedScript;

        if (!script || !Array.isArray(script.scenes) || script.scenes.length === 0) {
            throw new Error('Generated script does not contain any scenes');
        }

        const testScenes = script.scenes
            .filter((scene) => Number.isInteger(scene.sceneNumber) && scene.sceneNumber > 0)
            .sort((a, b) => a.sceneNumber - b.sceneNumber)
            .slice(0, MAX_TEST_SCENES);

        if (testScenes.length === 0) {
            throw new Error('Generated script does not contain valid scenes');
        }

        await replaceProjectScenes(project.id, testScenes);

        const existingVoiceJob = await prisma.videoJob.findFirst({
            where: {
                projectId: project.id,
                type: 'GENERATE_VOICE',
                status: {
                    in: ['QUEUED', 'PROCESSING'],
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!existingVoiceJob) {
            await createVideoJob(project.createdById, {
                projectId: project.id,
                type: 'GENERATE_VOICE',
                maxAttempts: 1,
                inputJson: {
                    source: 'generate-script-job',
                    sceneCount: testScenes.length,
                    testMode: true,
                },
            });
        }

        await prisma.videoProject.update({
            where: {
                id: project.id,
            },
            data: {
                currentStep: 'GENERATE_VOICE',
                progress: 35,
                status: 'GENERATING',
                errorMessage: null,
            },
        });

        return {
            projectId: project.id,
            generated: true,
            sceneCount: testScenes.length,
            nextStep: 'GENERATE_VOICE',
            result,
        };
    };
}

async function replaceProjectScenes(projectId: string, scenes: ScriptScene[]): Promise<void> {
    const normalizedScenes = scenes
        .filter((scene) => Number.isInteger(scene.sceneNumber) && scene.sceneNumber > 0)
        .sort((a, b) => a.sceneNumber - b.sceneNumber)
        .slice(0, MAX_TEST_SCENES);

    if (normalizedScenes.length === 0) {
        throw new Error('Generated script does not contain valid scenes');
    }

    const sceneNumbers = new Set<number>();

    for (const scene of normalizedScenes) {
        if (sceneNumbers.has(scene.sceneNumber)) {
            throw new Error(`Duplicate scene number: ${scene.sceneNumber}`);
        }

        sceneNumbers.add(scene.sceneNumber);
    }

    await prisma.$transaction(async (tx) => {
        await tx.videoScene.deleteMany({
            where: {
                projectId,
            },
        });

        await tx.videoScene.createMany({
            data: normalizedScenes.map((scene) => ({
                projectId,
                sceneNumber: scene.sceneNumber,
                title: scene.title?.trim() || `Scene ${scene.sceneNumber}`,
                durationSeconds:
                    Number.isFinite(scene.durationSeconds) && scene.durationSeconds > 0
                        ? scene.durationSeconds
                        : 5,
                scriptText: scene.narration?.trim() || undefined,
                voiceText: scene.narration?.trim() || undefined,
                characterIds: JSON.stringify([]),
                productImageUrls: JSON.stringify([]),
                backgroundUrl: undefined,
                motion: scene.motionPrompt?.trim() || undefined,
                cameraMotion: scene.cameraMotion?.trim() || undefined,
                style: undefined,
                settingsJson: JSON.stringify({
                    purpose: scene.purpose,
                    visualPrompt: scene.visualPrompt,
                    characterAction: scene.characterAction,
                    productAction: scene.productAction,
                    backgroundPrompt: scene.backgroundPrompt,
                    textOverlay: scene.textOverlay,
                    subtitle: scene.subtitle,
                    transition: scene.transition,
                }),
                status: 'PENDING',
            })),
        });
    });
}

export default createGenerateScriptJobHandler;

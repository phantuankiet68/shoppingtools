import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireAdminAuthUser } from '@/lib/auth/auth';

import { createVideoProvider } from '@/features/platform/ai-video/providers/video/video-provider-factory';
import type { VideoGenerationInput } from '@/features/platform/ai-video/types/video';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(request: Request, context: RouteContext) {
    try {
        const user = await requireAdminAuthUser();
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    error: 'Project id is required',
                },
                {
                    status: 400,
                },
            );
        }

        let body: Record<string, unknown> = {};

        try {
            const parsed = await request.json();

            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                body = parsed as Record<string, unknown>;
            }
        } catch {
            body = {};
        }

        const force = body.force === true;

        const project = await prisma.videoProject.findFirst({
            where: {
                id,
                createdById: user.id,
            },
            include: {
                videoAffiliate: true,
                characters: {
                    include: {
                        character: true,
                    },
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
                scenes: {
                    orderBy: {
                        sceneNumber: 'asc',
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                {
                    error: 'Video project not found',
                },
                {
                    status: 404,
                },
            );
        }

        if (project.status === 'ARCHIVED') {
            return NextResponse.json(
                {
                    error: 'Archived projects cannot be rendered',
                },
                {
                    status: 409,
                },
            );
        }

        if (project.status === 'GENERATING' && !force) {
            return NextResponse.json(
                {
                    error: 'Video generation is already running',
                    projectId: project.id,
                    status: project.status,
                    progress: project.progress,
                    currentStep: project.currentStep,
                },
                {
                    status: 409,
                },
            );
        }

        if (!project.scenes.length) {
            return NextResponse.json(
                {
                    error: 'Project has no scenes',
                },
                {
                    status: 400,
                },
            );
        }

        const incompleteScenes = project.scenes.filter((scene) => scene.status !== 'COMPLETED');

        if (incompleteScenes.length > 0) {
            return NextResponse.json(
                {
                    error: 'All scenes must be completed before rendering',
                    projectId: project.id,
                    incompleteScenes: incompleteScenes.map((scene) => ({
                        id: scene.id,
                        sceneNumber: scene.sceneNumber,
                        status: scene.status,
                    })),
                },
                {
                    status: 409,
                },
            );
        }

        const scenesWithoutVideo = project.scenes.filter(
            (scene) => !scene.generatedVideoUrl?.trim(),
        );

        if (scenesWithoutVideo.length > 0) {
            return NextResponse.json(
                {
                    error: 'Some completed scenes do not have generated video URLs',
                    projectId: project.id,
                    scenes: scenesWithoutVideo.map((scene) => ({
                        id: scene.id,
                        sceneNumber: scene.sceneNumber,
                    })),
                },
                {
                    status: 409,
                },
            );
        }

        let provider;

        try {
            provider = createVideoProvider();
        } catch (error) {
            return NextResponse.json(
                {
                    error:
                        error instanceof Error ? error.message : 'Video provider is not configured',
                },
                {
                    status: 501,
                },
            );
        }

        if (typeof provider.generate !== 'function') {
            return NextResponse.json(
                {
                    error: 'Video provider does not support rendering',
                },
                {
                    status: 501,
                },
            );
        }

        await prisma.videoProject.update({
            where: {
                id: project.id,
            },
            data: {
                status: 'GENERATING',
                currentStep: 'RENDER_VIDEO',
                progress: 90,
                errorMessage: null,
            },
        });

        const renderInput: VideoGenerationInput = {
            projectId: project.id,

            prompt: project.scriptText ?? undefined,

            script: project.scriptJson ?? undefined,

            scenes: project.scenes.map((scene) => ({
                id: scene.id,
                sceneNumber: scene.sceneNumber,
                title: scene.title,
                durationSeconds: scene.durationSeconds,
                scriptText: scene.scriptText,
                voiceText: scene.voiceText,
                generatedVideoUrl: scene.generatedVideoUrl,
                thumbnailUrl: scene.thumbnailUrl,
                backgroundUrl: scene.backgroundUrl,
                motion: scene.motion,
                cameraMotion: scene.cameraMotion,
                style: scene.style,
                settingsJson: scene.settingsJson,
            })),

            voiceUrl: project.voiceUrl ?? undefined,

            durationSeconds: project.durationSeconds,

            aspectRatio: project.aspectRatio,

            width: project.width,

            height: project.height,

            style: project.videoStyle ?? undefined,

            metadata: {
                language: project.language,
                videoStyle: project.videoStyle ?? undefined,
                backgroundMusic: project.backgroundMusic ?? undefined,
                affiliateUrl: project.affiliateUrl ?? undefined,
                ctaText: project.ctaText ?? undefined,
                settingsJson: project.settingsJson,
                thumbnailUrl: project.thumbnailUrl ?? undefined,
                videoAffiliateId: project.videoAffiliateId ?? undefined,
                characters: project.characters.map((item) => ({
                    id: item.character.id,
                    name: item.character.name,
                    imageUrl: item.character.imageUrl,
                    thumbnailUrl: item.character.thumbnailUrl,
                    gender: item.character.gender,
                    language: item.character.language,
                    voiceProvider: item.character.voiceProvider,
                    voiceId: item.character.voiceId,
                    defaultMotion: item.character.defaultMotion,
                    defaultStyle: item.character.defaultStyle,
                    metadata: item.character.metadata,
                    role: item.role,
                    sortOrder: item.sortOrder,
                    sceneConfig: item.sceneConfig,
                })),
            },
        };

        const job = await prisma.videoJob.create({
            data: {
                projectId: project.id,
                type: 'RENDER_VIDEO',
                status: 'PROCESSING',
                provider: process.env.AI_VIDEO_PROVIDER ?? 'unknown',
                progress: 90,
                inputJson: renderInput as never,
                startedAt: new Date(),
            },
        });

        try {
            const result = await provider.generate(renderInput);

            const finalVideoUrl =
                typeof result?.videoUrl === 'string' ? result.videoUrl.trim() : '';

            const thumbnailUrl =
                typeof result?.thumbnailUrl === 'string' ? result.thumbnailUrl.trim() : '';

            const providerJobId =
                typeof result?.providerJobId === 'string' ? result.providerJobId : undefined;

            await prisma.videoJob.update({
                where: {
                    id: job.id,
                },
                data: {
                    status: finalVideoUrl ? 'COMPLETED' : 'PROCESSING',
                    progress: finalVideoUrl ? 100 : 90,
                    providerJobId,
                    outputJson: result as never,
                    completedAt: finalVideoUrl ? new Date() : null,
                },
            });

            if (!finalVideoUrl) {
                await prisma.videoProject.update({
                    where: {
                        id: project.id,
                    },
                    data: {
                        status: 'GENERATING',
                        currentStep: 'RENDER_VIDEO',
                        progress: 90,
                    },
                });

                return NextResponse.json(
                    {
                        success: true,
                        projectId: project.id,
                        jobId: job.id,
                        status: 'GENERATING',
                        progress: 90,
                        currentStep: 'RENDER_VIDEO',
                        providerJobId: providerJobId ?? null,
                        finalVideoUrl: null,
                        thumbnailUrl: thumbnailUrl || null,
                        message: 'Video render job started',
                    },
                    {
                        status: 202,
                    },
                );
            }

            const finalProject = await prisma.videoProject.update({
                where: {
                    id: project.id,
                },
                data: {
                    status: 'COMPLETED',
                    currentStep: 'COMPLETED',
                    progress: 100,
                    finalVideoUrl,
                    thumbnailUrl: thumbnailUrl || project.thumbnailUrl,
                    completedAt: new Date(),
                    errorMessage: null,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    projectId: finalProject.id,
                    jobId: job.id,
                    status: finalProject.status,
                    progress: finalProject.progress,
                    currentStep: finalProject.currentStep,
                    finalVideoUrl: finalProject.finalVideoUrl,
                    thumbnailUrl: finalProject.thumbnailUrl,
                    message: 'Video rendering completed',
                },
                {
                    status: 200,
                },
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Video rendering failed';

            await prisma.videoJob.update({
                where: {
                    id: job.id,
                },
                data: {
                    status: 'FAILED',
                    errorMessage,
                    completedAt: new Date(),
                },
            });

            await prisma.videoProject.update({
                where: {
                    id: project.id,
                },
                data: {
                    status: 'FAILED',
                    errorMessage,
                    currentStep: 'RENDER_VIDEO',
                },
            });

            throw error;
        }
    } catch (error) {
        console.error('[ai-video] POST render error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to render video',
            },
            {
                status: 500,
            },
        );
    }
}

import { prisma } from '@/lib/prisma';

import { createVideoJob } from '../video-job-service';
import { ffmpegVideoRenderService } from '../../render/ffmpeg/ffmpeg-video-render-service';

import type { VideoJobHandler } from '../video-job-types';

export const composeVideoJob: VideoJobHandler = async ({ job }) => {
    const project = await prisma.videoProject.findUnique({
        where: {
            id: job.projectId,
        },
        include: {
            scenes: {
                orderBy: {
                    sceneNumber: 'asc',
                },
            },
        },
    });

    if (!project) {
        throw new Error('Video project not found');
    }

    if (!project.scenes.length) {
        throw new Error('Project has no scenes');
    }

    const incompleteScenes = project.scenes.filter((scene) => !scene.generatedVideoUrl);

    if (incompleteScenes.length > 0) {
        throw new Error(`${incompleteScenes.length} scene(s) have not been generated`);
    }

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

    const scenes = project.scenes.map((scene) => {
        if (!scene.generatedVideoUrl) {
            throw new Error(`Scene ${scene.sceneNumber} has no generated video`);
        }

        return {
            id: scene.id,
            sceneNumber: scene.sceneNumber,
            durationSeconds: scene.durationSeconds,
            videoUrl: scene.generatedVideoUrl,
        };
    });

    const result = await ffmpegVideoRenderService.render({
        projectId: project.id,
        width: project.width,
        height: project.height,
        aspectRatio: project.aspectRatio,
        durationSeconds: project.durationSeconds,
        voiceUrl: project.voiceUrl ?? undefined,
        backgroundMusic: project.backgroundMusic ?? undefined,
        scenes,
    });

    if (!result.videoUrl) {
        throw new Error('FFmpeg renderer did not return a final video URL');
    }

    if (!Number.isFinite(result.durationSeconds) || result.durationSeconds <= 0) {
        throw new Error('FFmpeg renderer returned an invalid video duration');
    }

    /*
     * COMPOSE_VIDEO has successfully created the final video.
     * Save the actual duration returned by ffprobe instead of
     * using the project's old configured duration.
     */
    await prisma.videoProject.update({
        where: {
            id: project.id,
        },
        data: {
            currentStep: 'RENDER_VIDEO',
            progress: 90,
            status: 'GENERATING',
            finalVideoUrl: result.videoUrl,
            durationSeconds: result.durationSeconds,
            errorMessage: null,
        },
    });

    /*
     * Only QUEUED / PROCESSING render jobs block creation
     * of a new render job.
     *
     * A previous COMPLETED job belongs to an older compose and
     * must NOT prevent the current compose from creating a new
     * RENDER_VIDEO job.
     */
    const existingRenderJob = await prisma.videoJob.findFirst({
        where: {
            projectId: project.id,
            type: 'RENDER_VIDEO',
            status: {
                in: ['QUEUED', 'PROCESSING'],
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (!existingRenderJob) {
        await createVideoJob(project.createdById, {
            projectId: project.id,
            type: 'RENDER_VIDEO',
            maxAttempts: 1,
            inputJson: {
                source: 'compose-video-job',
                composedVideoUrl: result.videoUrl,
                sceneCount: scenes.length,
                durationSeconds: result.durationSeconds,
            },
        });
    }

    return {
        projectId: project.id,
        composed: true,
        sceneCount: scenes.length,
        composedVideoUrl: result.videoUrl,
        durationSeconds: result.durationSeconds,
        width: project.width,
        height: project.height,
        nextStep: 'RENDER_VIDEO',
        scenes: project.scenes.map((scene) => ({
            id: scene.id,
            sceneNumber: scene.sceneNumber,
            durationSeconds: scene.durationSeconds,
            videoUrl: scene.generatedVideoUrl,
            thumbnailUrl: scene.thumbnailUrl,
        })),
    };
};

export default composeVideoJob;

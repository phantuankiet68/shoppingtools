import path from 'node:path';

import { ffmpegVideoRenderService } from './ffmpeg-video-render-service';

import type { ThumbnailGenerator } from '@/features/platform/ai-video/jobs/handlers/generate-thumbnail-job';

export class VideoThumbnailGenerator implements ThumbnailGenerator {
    async generate(input: { projectId: string; videoUrl: string }): Promise<{
        thumbnailUrl: string;
    }> {
        if (!input.projectId) {
            throw new Error('projectId is required');
        }

        if (!input.videoUrl) {
            throw new Error('videoUrl is required');
        }

        const videoPath = this.resolveStoragePath(input.videoUrl);

        const outputDir = path.join(
            process.cwd(),
            'storage',
            'ai-video',
            'projects',
            input.projectId,
            'final',
        );

        const outputPath = path.join(outputDir, 'thumbnail.jpg');

        await ffmpegVideoRenderService.generateThumbnail({
            videoPath,
            outputPath,
            timeSeconds: 0,
            width: 540,
        });

        return {
            thumbnailUrl: `/assets/ai-video/projects/${input.projectId}/final/thumbnail.jpg`,
        };
    }

    private resolveStoragePath(videoUrl: string): string {
        const normalized = videoUrl.trim();

        if (!normalized) {
            throw new Error('Video URL is empty');
        }

        /*
         * Already an absolute filesystem path.
         */
        if (path.isAbsolute(normalized)) {
            return normalized;
        }

        /*
         * Our storage asset URL:
         *
         * /assets/ai-video/projects/...
         */
        if (normalized.startsWith('/assets/')) {
            const relativePath = normalized.slice('/assets/'.length).replace(/^\/+/, '');

            if (!relativePath || relativePath.includes('\0')) {
                throw new Error(`Invalid storage video URL: ${videoUrl}`);
            }

            if (relativePath.split('/').some((segment) => segment === '.' || segment === '..')) {
                throw new Error(`Invalid storage video URL: ${videoUrl}`);
            }

            const storageRoot = path.resolve(process.cwd(), 'storage');

            const filePath = path.resolve(storageRoot, relativePath);

            if (filePath !== storageRoot && !filePath.startsWith(`${storageRoot}${path.sep}`)) {
                throw new Error(`Storage path escapes storage root: ${videoUrl}`);
            }

            return filePath;
        }

        throw new Error(`Unsupported video URL for thumbnail generation: ${videoUrl}`);
    }
}

export const videoThumbnailGenerator = new VideoThumbnailGenerator();

export default videoThumbnailGenerator;

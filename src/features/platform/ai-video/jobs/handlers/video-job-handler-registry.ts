import type { ScriptProvider } from '@/features/platform/ai-video/providers/script/script-provider';
import type { VoiceProvider } from '@/features/platform/ai-video/providers/voice/voice-provider';
import type { VideoProvider } from '@/features/platform/ai-video/providers/video/video-provider';

import createAnalyzeProductJobHandler from '@/features/platform/ai-video/jobs/handlers/analyze-product-job';
import createComposeVideoJobHandler from '@/features/platform/ai-video/jobs/handlers/compose-video-job';
import { createGenerateSceneJobHandler } from '@/features/platform/ai-video/jobs/handlers/generate-scene-job';
import { createGenerateScriptJobHandler } from '@/features/platform/ai-video/jobs/handlers/generate-script-job';
import { createGenerateThumbnailJobHandler } from '@/features/platform/ai-video/jobs/handlers/generate-thumbnail-job';
import { createGenerateVoiceJobHandler } from '@/features/platform/ai-video/jobs/handlers/generate-voice-job';
import { createRenderVideoJobHandler } from '@/features/platform/ai-video/jobs/handlers/render-video-job';

import type { ThumbnailGenerator } from '@/features/platform/ai-video/jobs/handlers/generate-thumbnail-job';

import type {
    VideoJobHandler,
    VideoJobType,
} from '@/features/platform/ai-video/jobs/video-job-types';

export interface VideoJobHandlerRegistryOptions {
    scriptProvider: ScriptProvider;
    voiceProvider: VoiceProvider;
    videoProvider: VideoProvider;
    thumbnailGenerator: ThumbnailGenerator;
}

export function createVideoJobHandlerRegistry(
    options: VideoJobHandlerRegistryOptions,
): Partial<Record<VideoJobType, VideoJobHandler>> {
    return {
        ANALYZE_PRODUCT: createAnalyzeProductJobHandler,

        GENERATE_SCRIPT: createGenerateScriptJobHandler(options.scriptProvider),

        GENERATE_VOICE: createGenerateVoiceJobHandler(options.voiceProvider),

        GENERATE_SCENE: createGenerateSceneJobHandler(options.videoProvider),

        GENERATE_THUMBNAIL: createGenerateThumbnailJobHandler(options.thumbnailGenerator),

        COMPOSE_VIDEO: createComposeVideoJobHandler,

        RENDER_VIDEO: createRenderVideoJobHandler({
            thumbnailGenerator: options.thumbnailGenerator,
        }),
    };
}

export function getVideoJobHandler(
    registry: Partial<Record<VideoJobType, VideoJobHandler>>,
    type: VideoJobType,
): VideoJobHandler | null {
    return registry[type] ?? null;
}

export default createVideoJobHandlerRegistry;

import { geminiScriptProvider } from '@/features/platform/ai-video/providers/script/gemini-script-provider';
import { vbeeVoiceProvider } from '@/features/platform/ai-video/providers/voice/vbee-voice-provider';
import { createVideoProvider } from '@/features/platform/ai-video/providers/video/video-provider-factory';
import { videoThumbnailGenerator } from '@/features/platform/ai-video/render/ffmpeg/video-thumbnail-generator';
import VideoJobWorker from '@/features/platform/ai-video/jobs/video-job-worker';

const POLL_INTERVAL_MS = 1000;
const ERROR_BACKOFF_MS = 2000;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function main(): Promise<void> {
    console.log('[ai-video-worker] Starting...');

    const videoProvider = createVideoProvider();

    const worker = new VideoJobWorker({
        scriptProvider: geminiScriptProvider,
        voiceProvider: vbeeVoiceProvider,
        videoProvider,
        thumbnailGenerator: videoThumbnailGenerator,
    });

    console.log(`[ai-video-worker] Video provider: ${videoProvider.name}`);
    console.log(`[ai-video-worker] Voice provider: ${vbeeVoiceProvider.name}`);

    while (true) {
        try {
            const result = await worker.runNext({
                maxAttempts: 1,
                retryFailedJobs: false,
            });

            if (!result) {
                await sleep(POLL_INTERVAL_MS);
                continue;
            }

            if (result.success) {
                console.log('[ai-video-worker] Job completed:', {
                    jobId: result.job.id,
                    type: result.job.type,
                    projectId: result.job.projectId,
                });

                continue;
            }

            console.error('[ai-video-worker] Job failed:', {
                jobId: result.job.id,
                type: result.job.type,
                projectId: result.job.projectId,
                error: result.error,
            });

            await sleep(POLL_INTERVAL_MS);
        } catch (error) {
            console.error('[ai-video-worker] Worker loop error:', error);

            await sleep(ERROR_BACKOFF_MS);
        }
    }
}

main().catch((error) => {
    console.error('[ai-video-worker] Fatal error:', error);
    process.exit(1);
});

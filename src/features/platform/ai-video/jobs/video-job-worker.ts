import type { VideoJobResult, VideoJobRunnerOptions } from './video-job-types';
import { videoJobRunner } from './video-job-runner';
import {
    createVideoJobHandlerRegistry,
    getVideoJobHandler,
    type VideoJobHandlerRegistryOptions,
} from './handlers/video-job-handler-registry';

export class VideoJobWorker {
    private readonly registry: ReturnType<typeof createVideoJobHandlerRegistry>;

    constructor(options: VideoJobHandlerRegistryOptions) {
        this.registry = createVideoJobHandlerRegistry(options);
    }

    async runNext(options: VideoJobRunnerOptions = {}): Promise<VideoJobResult | null> {
        return videoJobRunner.runNext(
            (job) => getVideoJobHandler(this.registry, job.type),
            options,
        );
    }

    async runProject(
        projectId: string,
        options: VideoJobRunnerOptions = {},
    ): Promise<VideoJobResult[]> {
        return videoJobRunner.runProject(
            projectId,
            (job) => getVideoJobHandler(this.registry, job.type),
            options,
        );
    }

    async runUntilEmpty(options: VideoJobRunnerOptions = {}): Promise<VideoJobResult[]> {
        const results: VideoJobResult[] = [];

        while (true) {
            const result = await this.runNext(options);

            if (!result) {
                break;
            }

            results.push(result);

            if (!result.success) {
                break;
            }
        }

        return results;
    }
}

export default VideoJobWorker;

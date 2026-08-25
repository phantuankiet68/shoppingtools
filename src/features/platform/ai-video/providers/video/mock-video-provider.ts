import type { GeneratedVideo, VideoGenerationInput } from '../../types/video';

import type { VideoProvider } from './video-provider';

import { mockVideoGenerator } from '../../render/ffmpeg/mock-video-generator';

interface MockVideoTask {
    input: VideoGenerationInput;
    result: GeneratedVideo;
    cancelled: boolean;
}

const mockTasks = new Map<string, MockVideoTask>();

export class MockVideoProvider implements VideoProvider {
    readonly name = 'mock';

    async generate(input: VideoGenerationInput): Promise<GeneratedVideo> {
        const providerJobId = `mock-${crypto.randomUUID()}`;

        const result = await mockVideoGenerator.generate({
            projectId: input.projectId,

            sceneId: this.getSceneId(input),

            sceneNumber: this.getSceneNumber(input),

            durationSeconds: input.durationSeconds ?? 5,

            width: input.width ?? 1080,

            height: input.height ?? 1920,

            title: this.getTitle(input),

            prompt: input.prompt,

            scriptText: this.getScriptText(input),

            generateThumbnail: true,
        });

        const generatedVideo: GeneratedVideo = {
            provider: this.name,

            providerJobId,

            status: 'COMPLETED',

            videoUrl: result.videoUrl,

            thumbnailUrl: result.thumbnailUrl,

            durationSeconds: result.durationSeconds,

            width: result.width,

            height: result.height,

            metadata: {
                mock: true,

                projectId: input.projectId,

                videoPath: result.videoPath,

                thumbnailPath: result.thumbnailPath,

                fileName: result.fileName,

                thumbnailFileName: result.thumbnailFileName,

                generatedAt: new Date().toISOString(),
            },
        };

        mockTasks.set(providerJobId, {
            input,

            result: generatedVideo,

            cancelled: false,
        });

        return generatedVideo;
    }

    async getStatus(providerJobId: string): Promise<GeneratedVideo> {
        const task = mockTasks.get(providerJobId);

        if (!task) {
            throw new Error(`Mock video job not found: ${providerJobId}`);
        }

        if (task.cancelled) {
            return {
                ...task.result,

                status: 'FAILED',

                metadata: {
                    ...task.result.metadata,

                    cancelled: true,
                },
            };
        }

        return task.result;
    }

    async cancel(providerJobId: string): Promise<void> {
        const task = mockTasks.get(providerJobId);

        if (!task) {
            throw new Error(`Mock video job not found: ${providerJobId}`);
        }

        task.cancelled = true;
    }

    private getSceneId(input: VideoGenerationInput): string | undefined {
        const metadata = input.metadata;

        if (metadata && typeof metadata.sceneId === 'string') {
            return metadata.sceneId;
        }

        return undefined;
    }

    private getSceneNumber(input: VideoGenerationInput): number | undefined {
        const metadata = input.metadata;

        if (metadata && typeof metadata.sceneNumber === 'number') {
            return metadata.sceneNumber;
        }

        return undefined;
    }

    private getTitle(input: VideoGenerationInput): string | undefined {
        const metadata = input.metadata;

        if (metadata && typeof metadata.title === 'string') {
            return metadata.title;
        }

        return undefined;
    }

    private getScriptText(input: VideoGenerationInput): string | undefined {
        if (typeof input.script === 'string') {
            return input.script;
        }

        const metadata = input.metadata;

        if (metadata && typeof metadata.scriptText === 'string') {
            return metadata.scriptText;
        }

        return undefined;
    }
}

export function createMockVideoProvider(): MockVideoProvider {
    return new MockVideoProvider();
}

export default MockVideoProvider;

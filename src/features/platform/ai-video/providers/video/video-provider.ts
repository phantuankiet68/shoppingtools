import type {
    GeneratedVideo,
    VideoGenerationInput,
    VideoProviderWaitOptions,
} from '../../types/video';

export interface VideoProvider {
    readonly name: string;
    generate(input: VideoGenerationInput): Promise<GeneratedVideo>;
    getStatus?(providerJobId: string): Promise<GeneratedVideo>;
    waitForCompletion?(
        providerJobId: string,
        options?: VideoProviderWaitOptions,
    ): Promise<GeneratedVideo>;
    cancel?(providerJobId: string): Promise<void>;
}

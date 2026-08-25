import type { VideoProvider } from './video-provider';
import { MockVideoProvider } from './mock-video-provider';
import { MagicHourVideoProvider } from './magic-hour-video-provider';

export type VideoProviderName = 'magichour' | 'mock';

interface VideoProviderFactoryOptions {
    provider?: VideoProviderName;
}

export function createVideoProvider(options: VideoProviderFactoryOptions = {}): VideoProvider {
    const provider = options.provider ?? getDefaultProvider();

    switch (provider) {
        case 'magichour':
            return new MagicHourVideoProvider();

        case 'mock':
            return new MockVideoProvider();

        default:
            throw new Error(`Unsupported video provider: ${provider}`);
    }
}

function getDefaultProvider(): VideoProviderName {
    const provider = process.env.AI_VIDEO_PROVIDER;

    switch (provider) {
        case 'magichour':
        case 'mock':
            return provider;

        default:
            return 'magichour';
    }
}

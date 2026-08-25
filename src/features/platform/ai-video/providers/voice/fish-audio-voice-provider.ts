import type {
    GeneratedVoice,
    VoiceGenerationInput,
} from '@/features/platform/ai-video/types/voice';

import type { VoiceProvider } from './voice-provider';

interface FishAudioOptions {
    apiKey?: string;
    modelId?: string;
    referenceId?: string;
}

export class FishAudioVoiceProvider implements VoiceProvider {
    private readonly apiKey: string;
    private readonly modelId: string;
    private readonly referenceId?: string;

    constructor(options?: FishAudioOptions) {
        const apiKey = options?.apiKey ?? process.env.FISH_API_KEY;

        if (!apiKey) {
            throw new Error('FISH_API_KEY is not configured');
        }

        this.apiKey = apiKey;
        this.modelId = options?.modelId ?? process.env.FISH_MODEL_ID ?? 's2.1-pro-free';

        this.referenceId = options?.referenceId ?? process.env.FISH_REFERENCE_ID ?? undefined;
    }

    async generate(input: VoiceGenerationInput): Promise<GeneratedVoice> {
        const text = input.text?.trim();

        if (!text) {
            throw new Error('Voice text cannot be empty');
        }

        const body: Record<string, unknown> = {
            text,
            format: 'mp3',
        };

        if (this.referenceId) {
            body.reference_id = this.referenceId;
        }

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 60_000);

        let response: Response;

        try {
            response = await fetch('https://api.fish.audio/v1/tts', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    model: this.modelId,
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Fish Audio voice generation timed out after 60 seconds');
            }

            throw error;
        } finally {
            clearTimeout(timeout);
        }
        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(`Fish Audio voice generation failed: ${response.status} ${errorText}`);
        }

        const audioBuffer = await response.arrayBuffer();

        if (audioBuffer.byteLength === 0) {
            throw new Error('Fish Audio returned empty audio');
        }

        const base64 = Buffer.from(audioBuffer).toString('base64');

        const audioUrl = `data:audio/mpeg;base64,${base64}`;

        console.log('[fish] Voice generated:', {
            model: this.modelId,
            referenceId: this.referenceId ?? null,
            bytes: audioBuffer.byteLength,
        });

        return {
            audioUrl,
            durationSeconds: 0,
            provider: 'fish',
            providerRequestId:
                response.headers.get('x-request-id') ??
                response.headers.get('request-id') ??
                undefined,
            format: 'mp3',
            metadata: {
                modelId: this.modelId,
                language: input.language,
                voiceId: this.referenceId,
                emotion: input.emotion,
            },
        };
    }
}

export const fishAudioVoiceProvider = new FishAudioVoiceProvider();

export default fishAudioVoiceProvider;

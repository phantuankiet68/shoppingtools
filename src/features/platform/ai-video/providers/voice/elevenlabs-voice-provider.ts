import type {
    GeneratedVoice,
    VoiceGenerationInput,
} from '@/features/platform/ai-video/types/voice';

import type { VoiceProvider } from './voice-provider';

interface ElevenLabsOptions {
    apiKey?: string;
    modelId?: string;
}

export class ElevenLabsVoiceProvider implements VoiceProvider {
    private readonly apiKey: string;
    private readonly modelId: string;

    constructor(options?: ElevenLabsOptions) {
        const apiKey = options?.apiKey ?? process.env.ELEVENLABS_API_KEY;

        if (!apiKey) {
            throw new Error('ELEVENLABS_API_KEY is not configured');
        }

        this.apiKey = apiKey;

        this.modelId =
            options?.modelId ?? process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2';
    }

    async generate(input: VoiceGenerationInput): Promise<GeneratedVoice> {
        if (!input.voiceId) {
            throw new Error('ElevenLabs voiceId is required');
        }

        if (!input.text.trim()) {
            throw new Error('Voice text cannot be empty');
        }

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(input.voiceId)}`,
            {
                method: 'POST',
                headers: {
                    Accept: this.getAcceptHeader(input.outputFormat),
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey,
                },
                body: JSON.stringify({
                    text: input.text,
                    model_id: this.modelId,
                    language_code: input.language
                        ? this.getLanguageCode(input.language)
                        : undefined,
                    voice_settings: {
                        stability: this.getStability(input.emotion),
                        similarity_boost: 0.75,
                        style: this.getStyle(input.emotion),
                        use_speaker_boost: true,
                    },
                }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(`ElevenLabs voice generation failed: ${response.status} ${errorText}`);
        }

        const audioBuffer = await response.arrayBuffer();

        if (audioBuffer.byteLength === 0) {
            throw new Error('ElevenLabs returned empty audio');
        }

        const format = input.outputFormat ?? 'mp3';
        const audioUrl = this.createDataUrl(audioBuffer, format);

        return {
            audioUrl,
            durationSeconds: 0,
            provider: 'elevenlabs',
            providerRequestId: response.headers.get('request-id') ?? undefined,
            format,
            metadata: {
                modelId: this.modelId,
                language: input.language,
                voiceId: input.voiceId,
                emotion: input.emotion,
            },
        };
    }

    private getAcceptHeader(format?: VoiceGenerationInput['outputFormat']): string {
        switch (format) {
            case 'wav':
                return 'audio/wav';

            case 'aac':
                return 'audio/aac';

            case 'ogg':
                return 'audio/ogg';

            case 'mp3':
            default:
                return 'audio/mpeg';
        }
    }

    private getLanguageCode(language: VoiceGenerationInput['language']): string {
        switch (language) {
            case 'vi-VN':
                return 'vi';

            case 'en-US':
                return 'en';

            case 'ja-JP':
                return 'ja';

            case 'ko-KR':
                return 'ko';

            case 'zh-CN':
                return 'zh';

            default:
                return 'vi';
        }
    }

    private getStability(emotion: VoiceGenerationInput['emotion']): number {
        switch (emotion) {
            case 'excited':
            case 'energetic':
            case 'happy':
                return 0.35;

            case 'persuasive':
            case 'friendly':
                return 0.45;

            case 'serious':
            case 'calm':
                return 0.65;

            case 'sad':
                return 0.7;

            case 'neutral':
            default:
                return 0.5;
        }
    }

    private getStyle(emotion: VoiceGenerationInput['emotion']): number {
        switch (emotion) {
            case 'excited':
            case 'energetic':
                return 0.8;

            case 'happy':
            case 'friendly':
            case 'persuasive':
                return 0.6;

            case 'serious':
            case 'calm':
            case 'sad':
                return 0.25;

            case 'neutral':
            default:
                return 0.4;
        }
    }

    private createDataUrl(
        buffer: ArrayBuffer,
        format: VoiceGenerationInput['outputFormat'],
    ): string {
        const mimeType =
            format === 'wav'
                ? 'audio/wav'
                : format === 'aac'
                  ? 'audio/aac'
                  : format === 'ogg'
                    ? 'audio/ogg'
                    : 'audio/mpeg';

        const base64 = Buffer.from(buffer).toString('base64');

        return `data:${mimeType};base64,${base64}`;
    }
}

export const elevenLabsVoiceProvider = new ElevenLabsVoiceProvider();

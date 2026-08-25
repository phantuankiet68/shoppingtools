import type {
    GeneratedVoice,
    VoiceGenerationInput,
} from '@/features/platform/ai-video/types/voice';

export interface VoiceProvider {
    generate(input: VoiceGenerationInput): Promise<GeneratedVoice>;
}

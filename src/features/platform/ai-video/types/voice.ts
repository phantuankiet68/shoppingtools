// ============================================================
// Kbuilder AI Video — Voice Types
// ============================================================

export type VoiceLanguage = 'vi-VN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'zh-CN';

export type VoiceOutputFormat = 'mp3' | 'wav' | 'aac' | 'ogg';

export type VoiceEmotion =
    | 'neutral'
    | 'happy'
    | 'friendly'
    | 'excited'
    | 'energetic'
    | 'persuasive'
    | 'serious'
    | 'calm'
    | 'sad';

export interface VoiceGenerationInput {
    text: string;
    language: VoiceLanguage;
    voiceId?: string;
    emotion?: VoiceEmotion;
    outputFormat?: VoiceOutputFormat;
    speed?: number;
    pitch?: number;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    speakerBoost?: boolean;
}

export interface GeneratedVoice {
    audioUrl: string;
    durationSeconds: number;
    provider: string;
    providerRequestId?: string;
    voiceId?: string;
    format: VoiceOutputFormat;
    metadata?: Record<string, unknown>;
}

export interface VoiceProviderRequest {
    input: VoiceGenerationInput;
}

export interface VoiceProviderResponse {
    voice: GeneratedVoice;
    provider: string;
    model?: string;
    requestId?: string;
    usage?: {
        characters?: number;
        durationSeconds?: number;
    };
}

export interface VoiceProvider {
    generate(input: VoiceGenerationInput): Promise<GeneratedVoice>;
}

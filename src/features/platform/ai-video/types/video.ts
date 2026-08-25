import type { VideoProjectStep } from '@/generated/prisma';

export type VideoProviderName = 'kling' | 'runway' | 'luma' | 'magichour' | 'veo' | 'sora' | 'mock';

export type VideoGenerationStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface VideoGenerationInput {
    projectId: string;
    prompt?: string;
    script?: unknown;
    scenes?: unknown[];
    voiceUrl?: string;
    durationSeconds?: number;
    aspectRatio?: string;
    width?: number;
    height?: number;
    imageUrl?: string;
    negativePrompt?: string;
    style?: string;
    motion?: string;
    cameraMotion?: string;
    metadata?: Record<string, unknown>;
}

export interface GeneratedVideo {
    provider: VideoProviderName | string;
    providerJobId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    width?: number;
    height?: number;
    status?: VideoGenerationStatus;
    metadata?: Record<string, unknown>;
}

export interface VideoGenerationResult extends GeneratedVideo {
    success: boolean;
    error?: string;
}

export interface VideoProviderOptions {
    provider?: VideoProviderName;
    apiKey?: string;
    baseUrl?: string;
}

export interface VideoProviderWaitOptions {
    intervalMs?: number;
    timeoutMs?: number;
}

export interface VideoPipelineOptions {
    force?: boolean;
    scriptProvider?: import('../providers/script/script-provider').ScriptProvider;
    voiceProvider?: import('../providers/voice/voice-provider').VoiceProvider;
    videoProvider?: import('../providers/video/video-provider').VideoProvider;
}

export interface VideoPipelineResult {
    projectId: string;
    status: 'DRAFT' | 'READY' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'ARCHIVED';
    progress: number;
    currentStep: VideoProjectStep | null;
    finalVideoUrl?: string;
    thumbnailUrl?: string;
    message?: string;
}

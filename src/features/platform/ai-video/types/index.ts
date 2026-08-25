export * from './script';
export * from './voice';
export * from './video';

export interface VideoProject {
    id: string;
    name: string;
    status: 'DRAFT' | 'READY' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'ARCHIVED';
    durationSeconds: number;
    aspectRatio: string;
    width: number;
    height: number;
    language: string;
    videoStyle?: string | null;
    scriptText?: string | null;
    voiceProvider?: string | null;
    voiceId?: string | null;
    voiceText?: string | null;
    voiceUrl?: string | null;
    backgroundMusic?: string | null;
    affiliateUrl?: string | null;
    ctaText?: string | null;
    currentStep?:
        | 'ANALYZE_PRODUCT'
        | 'GENERATE_SCRIPT'
        | 'GENERATE_VOICE'
        | 'GENERATE_SCENES'
        | 'COMPOSE_VIDEO'
        | 'RENDER_VIDEO'
        | 'COMPLETED'
        | null;
    progress: number;
    finalVideoUrl?: string | null;
    thumbnailUrl?: string | null;
    errorMessage?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    completedAt?: Date | string | null;
}

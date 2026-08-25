export type GenerationStatus = 'completed' | 'processing' | 'waiting' | 'failed';

export type ProductSourcePlatform = 'TIKTOK' | 'SHOPEE' | 'LAZADA' | 'AMAZON' | 'WEBSITE' | 'OTHER';

export type CharacterGender = 'FEMALE' | 'MALE' | 'NON_BINARY' | 'UNSPECIFIED';

export type VideoProjectStatus =
    | 'DRAFT'
    | 'READY'
    | 'GENERATING'
    | 'COMPLETED'
    | 'FAILED'
    | 'ARCHIVED';

export type VideoProjectStep =
    | 'ANALYZE_PRODUCT'
    | 'GENERATE_SCRIPT'
    | 'GENERATE_VOICE'
    | 'GENERATE_SCENES'
    | 'COMPOSE_VIDEO'
    | 'RENDER_VIDEO'
    | 'COMPLETED';

export type VideoSceneStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

export type VideoJobType =
    | 'ANALYZE_PRODUCT'
    | 'GENERATE_SCRIPT'
    | 'GENERATE_VOICE'
    | 'GENERATE_SCENE'
    | 'GENERATE_THUMBNAIL'
    | 'COMPOSE_VIDEO'
    | 'RENDER_VIDEO';

export type VideoJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ProductImage {
    id: string;
    url: string;
    name?: string;
    alt?: string;
    isPrimary?: boolean;
    source?: 'product' | 'upload' | 'generated';
}

export interface ProductInfo {
    title: string;
    rating: number;
    reviews: string;
    sold: string;
    description: string;
    category: string;
    price: string;
    imageUrl: string;
    images: ProductImage[];
    highlights: string[];
    sourceUrl: string;
    sourcePlatform: ProductSourcePlatform;
}

export interface ScriptScene {
    id: string;
    sceneNumber?: number;
    time: string;
    durationSeconds?: number;
    title: string;
    text: string;
    voiceText?: string;
    visual?: string;
    voice?: string;
    motion?: string;
    cameraMotion?: string;
    style?: string;
    productImageIds?: string[];
}

export interface Character {
    id: string;
    name: string;
    role: string;
    gender: CharacterGender;
    language: string;
    image: string;
    voiceProvider?: string;
    voiceId?: string;
    defaultMotion?: string;
    defaultStyle?: string;
}

export interface WorkflowStep {
    id: string;
    title: string;
    icon: string;
    status: GenerationStatus;
    meta?: string;
}

export interface VideoSettings {
    duration: number;
    aspectRatio: string;
    resolution: string;
    style: string;
    music: string;
    voice: string;
    language: string;
    voiceProvider?: string;
    voiceId?: string;
    backgroundMusic?: string;
    ctaText?: string;
}

export interface VideoScene {
    id: string;
    projectId: string;
    sceneNumber: number;
    title?: string;
    durationSeconds: number;
    scriptText?: string;
    voiceText?: string;
    characterIds: string[];
    productImageUrls: string[];
    backgroundUrl?: string;
    motion?: string;
    cameraMotion?: string;
    style?: string;
    settings?: Record<string, unknown>;
    provider?: string;
    providerJobId?: string;
    generatedVideoUrl?: string;
    thumbnailUrl?: string;
    status: VideoSceneStatus;
    errorMessage?: string;
}

export interface VideoProjectCharacter {
    id: string;
    projectId: string;
    characterId: string;
    role?: string;
    sortOrder: number;
    sceneConfig?: Record<string, unknown>;
    character?: Character;
}

export interface VideoProject {
    id: string;
    createdById?: string;
    videoAffiliateId: string | null;
    name: string;
    status: VideoProjectStatus;
    durationSeconds: number;
    aspectRatio: string;
    width: number;
    height: number;
    language: string;
    videoStyle?: string | null;
    scriptText?: string | null;
    scriptJson?: ScriptScene[] | null;
    voiceProvider?: string | null;
    voiceId?: string | null;
    voiceText?: string | null;
    voiceUrl?: string | null;
    backgroundMusic?: string | null;
    affiliateUrl?: string | null;
    ctaText?: string | null;
    settingsJson?: Record<string, unknown> | null;
    currentStep?: VideoProjectStep | null;
    progress: number;
    finalVideoUrl?: string | null;
    thumbnailUrl?: string | null;
    errorMessage?: string | null;
    completedAt?: string | null;
    scenes?: VideoScene[];
    characters?: VideoProjectCharacter[];
}

export interface VideoProjectDraft {
    product: ProductInfo;
    script: ScriptScene[];
    settings: VideoSettings;
    characters: Character[];
}

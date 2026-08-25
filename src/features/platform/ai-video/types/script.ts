// ============================================================
// Kbuilder AI Video — Script Types
// ============================================================

export type ScriptLanguage = 'vi-VN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'zh-CN';

export type ScriptTone =
    | 'natural'
    | 'friendly'
    | 'energetic'
    | 'professional'
    | 'emotional'
    | 'funny'
    | 'luxury'
    | 'persuasive';

export type ScriptStyle =
    | 'ugc'
    | 'review'
    | 'problem-solution'
    | 'product-demo'
    | 'storytelling'
    | 'testimonial'
    | 'unboxing'
    | 'comparison'
    | 'sales';

export type ScenePurpose =
    | 'hook'
    | 'problem'
    | 'solution'
    | 'product'
    | 'benefit'
    | 'proof'
    | 'demo'
    | 'testimonial'
    | 'offer'
    | 'cta';

// ============================================================
// SCRIPT GENERATION INPUT
// ============================================================

export interface ScriptGenerationInput {
    productTitle?: string;
    productDescription?: string;
    productCategory?: string;

    productHighlights?: string[];

    price?: string;
    currency?: string;

    rating?: number;
    reviewCount?: number;
    soldCount?: number;

    language: ScriptLanguage;
    durationSeconds: number;

    tone?: ScriptTone;
    style?: ScriptStyle;

    targetAudience?: string;
    sellingPoints?: string[];

    callToAction?: string;

    brandName?: string;

    characterDescription?: string;

    userPrompt?: string;
}

// ============================================================
// SCRIPT SCENE
// ============================================================

export interface ScriptScene {
    sceneNumber: number;

    purpose: ScenePurpose;

    title: string;

    durationSeconds: number;

    narration: string;

    visualPrompt: string;

    motionPrompt?: string;

    cameraMotion?: string;

    characterAction?: string;

    productAction?: string;

    backgroundPrompt?: string;

    textOverlay?: string;

    subtitle?: string;

    transition?: string;
}

// ============================================================
// GENERATED SCRIPT
// ============================================================

export interface GeneratedScript {
    title: string;

    hook: string;

    scenes: ScriptScene[];

    fullText: string;

    cta: string;

    estimatedDurationSeconds: number;

    language: ScriptLanguage;

    tone?: ScriptTone;

    style?: ScriptStyle;

    metadata?: Record<string, unknown>;
}

// ============================================================
// SCRIPT PROVIDER REQUEST
// ============================================================

export interface ScriptProviderRequest {
    input: ScriptGenerationInput;
}

// ============================================================
// SCRIPT PROVIDER RESPONSE
// ============================================================

export interface ScriptProviderResponse {
    script: GeneratedScript;

    provider: string;

    model?: string;

    requestId?: string;

    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
}

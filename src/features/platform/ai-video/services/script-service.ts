// ============================================================
// Kbuilder AI Video — Script Service
// ============================================================

import { prisma } from '@/lib/prisma';

import type { ScriptProvider } from '../providers/script/script-provider';

import type {
    GeneratedScript,
    ScriptGenerationInput,
    ScriptLanguage,
    ScriptStyle,
    ScriptTone,
} from '@/features/platform/ai-video/types/script';

// ============================================================
// TYPES
// ============================================================

export interface GenerateScriptOptions {
    provider: ScriptProvider;
    force?: boolean;

    tone?: ScriptTone;
    style?: ScriptStyle;
    targetAudience?: string;
    sellingPoints?: string[];
    brandName?: string;
    userPrompt?: string;
}

export interface GenerateScriptResult {
    projectId: string;
    scriptText: string;
    scriptJson: GeneratedScript;
}

// ============================================================
// SERVICE
// ============================================================

class ScriptService {
    // ==========================================================
    // GENERATE SCRIPT
    // ==========================================================

    async generateScript(
        projectId: string,
        createdById: string,
        options: GenerateScriptOptions,
    ): Promise<GenerateScriptResult> {
        const project = await prisma.videoProject.findFirst({
            where: {
                id: projectId,
                createdById,
            },

            include: {
                videoAffiliate: true,

                characters: {
                    include: {
                        character: true,
                    },
                },

                scenes: {
                    orderBy: {
                        sceneNumber: 'asc',
                    },
                },
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        // ------------------------------------------------------
        // RETURN EXISTING SCRIPT
        // ------------------------------------------------------

        if (project.scriptText && project.scriptJson && !options.force) {
            return {
                projectId: project.id,
                scriptText: project.scriptText,
                scriptJson: project.scriptJson as unknown as GeneratedScript,
            };
        }

        // ------------------------------------------------------
        // PRODUCT REQUIRED
        // ------------------------------------------------------

        if (!project.videoAffiliate) {
            throw new Error('Video affiliate product is required before generating script');
        }

        const affiliate = project.videoAffiliate;

        const character = project.characters[0]?.character ?? null;

        // ------------------------------------------------------
        // NORMALIZE PRODUCT HIGHLIGHTS
        // ------------------------------------------------------

        const productHighlights = this.normalizeStringArray(affiliate.highlights);

        // ------------------------------------------------------
        // CHARACTER DESCRIPTION
        // ------------------------------------------------------

        const characterDescription = character
            ? this.buildCharacterDescription(character)
            : undefined;

        // ------------------------------------------------------
        // SCRIPT INPUT
        // ------------------------------------------------------

        const input: ScriptGenerationInput = {
            productTitle: affiliate.title ?? undefined,

            productDescription: affiliate.description ?? undefined,

            productCategory: affiliate.category ?? undefined,

            productHighlights,

            price: this.buildPrice(affiliate.priceMin, affiliate.priceMax),

            currency: affiliate.currency ?? undefined,

            rating: affiliate.rating !== null ? Number(affiliate.rating) : undefined,

            reviewCount: affiliate.reviewCount ?? undefined,

            soldCount: affiliate.soldCount ?? undefined,

            language: this.normalizeLanguage(project.language),

            durationSeconds: project.durationSeconds,

            tone: options.tone,

            style: options.style ?? this.normalizeStyle(project.videoStyle),

            targetAudience: options.targetAudience,

            sellingPoints: options.sellingPoints,

            callToAction: project.ctaText ?? undefined,

            brandName: options.brandName,

            characterDescription,

            userPrompt: options.userPrompt,
        };

        // ------------------------------------------------------
        // GENERATE
        // ------------------------------------------------------

        const generated = await options.provider.generate(input);

        if (!generated || !generated.fullText?.trim()) {
            throw new Error('Script provider returned empty script');
        }

        // ------------------------------------------------------
        // SAVE SCRIPT
        // ------------------------------------------------------

        await prisma.videoProject.update({
            where: {
                id: project.id,
            },

            data: {
                scriptText: generated.fullText,

                scriptJson: generated as never,

                currentStep: 'GENERATE_VOICE',

                progress: 35,
            },
        });

        // ------------------------------------------------------
        // RETURN
        // ------------------------------------------------------

        return {
            projectId: project.id,

            scriptText: generated.fullText,

            scriptJson: generated,
        };
    }

    // ==========================================================
    // GET SCRIPT
    // ==========================================================

    async getScript(projectId: string, createdById: string) {
        const project = await prisma.videoProject.findFirst({
            where: {
                id: projectId,
                createdById,
            },

            select: {
                id: true,
                scriptText: true,
                scriptJson: true,
                currentStep: true,
                progress: true,
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        return {
            ...project,

            scriptJson: project.scriptJson
                ? (project.scriptJson as unknown as GeneratedScript)
                : null,
        };
    }

    // ==========================================================
    // UPDATE SCRIPT
    // ==========================================================

    async updateScript(
        projectId: string,
        createdById: string,
        input: {
            scriptText: string;
            scriptJson?: unknown;
        },
    ) {
        const project = await prisma.videoProject.findFirst({
            where: {
                id: projectId,
                createdById,
            },

            select: {
                id: true,
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        const scriptText = input.scriptText.trim();

        if (!scriptText) {
            throw new Error('Script text cannot be empty');
        }

        return prisma.videoProject.update({
            where: {
                id: project.id,
            },

            data: {
                scriptText,

                ...(input.scriptJson !== undefined
                    ? {
                          scriptJson: input.scriptJson as never,
                      }
                    : {}),
            },

            select: {
                id: true,
                scriptText: true,
                scriptJson: true,
                currentStep: true,
                progress: true,
                updatedAt: true,
            },
        });
    }

    // ==========================================================
    // REGENERATE SCRIPT
    // ==========================================================

    async regenerateScript(
        projectId: string,
        createdById: string,
        provider: ScriptProvider,
        options?: Omit<GenerateScriptOptions, 'provider' | 'force'>,
    ): Promise<GenerateScriptResult> {
        return this.generateScript(projectId, createdById, {
            provider,
            force: true,

            ...options,
        });
    }

    // ==========================================================
    // PRIVATE — LANGUAGE
    // ==========================================================

    private normalizeLanguage(language: string): ScriptLanguage {
        const supported: ScriptLanguage[] = ['vi-VN', 'en-US', 'ja-JP', 'ko-KR', 'zh-CN'];

        if (supported.includes(language as ScriptLanguage)) {
            return language as ScriptLanguage;
        }

        return 'vi-VN';
    }

    // ==========================================================
    // PRIVATE — STYLE
    // ==========================================================

    private normalizeStyle(style: string | null): ScriptStyle | undefined {
        if (!style) {
            return undefined;
        }

        const supported: ScriptStyle[] = [
            'ugc',
            'review',
            'problem-solution',
            'product-demo',
            'storytelling',
            'testimonial',
            'unboxing',
            'comparison',
            'sales',
        ];

        if (supported.includes(style as ScriptStyle)) {
            return style as ScriptStyle;
        }

        return undefined;
    }

    // ==========================================================
    // PRIVATE — PRICE
    // ==========================================================

    private buildPrice(priceMin: unknown, priceMax: unknown): string | undefined {
        if (priceMin === null && priceMax === null) {
            return undefined;
        }

        const min = priceMin !== null && priceMin !== undefined ? String(priceMin) : undefined;

        const max = priceMax !== null && priceMax !== undefined ? String(priceMax) : undefined;

        if (min && max) {
            if (min === max) {
                return min;
            }

            return `${min} - ${max}`;
        }

        return min ?? max;
    }

    // ==========================================================
    // PRIVATE — STRING ARRAY
    // ==========================================================

    private normalizeStringArray(value: unknown): string[] | undefined {
        if (!Array.isArray(value)) {
            return undefined;
        }

        const result = value
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean);

        return result.length > 0 ? result : undefined;
    }

    // ==========================================================
    // PRIVATE — CHARACTER
    // ==========================================================

    private buildCharacterDescription(character: {
        name: string;
        gender: string;
        language: string;
        defaultMotion: string | null;
        defaultStyle: string | null;
    }): string {
        const parts = [
            `Name: ${character.name}`,
            `Gender: ${character.gender}`,
            `Language: ${character.language}`,
        ];

        if (character.defaultStyle) {
            parts.push(`Style: ${character.defaultStyle}`);
        }

        if (character.defaultMotion) {
            parts.push(`Motion: ${character.defaultMotion}`);
        }

        return parts.join('. ');
    }
}

// ============================================================
// SINGLETON
// ============================================================

export const scriptService = new ScriptService();

import type {
    GeneratedScript,
    ScriptGenerationInput,
    ScriptScene,
} from '@/features/platform/ai-video/types/script';

import type { ScriptProvider } from './script-provider';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

interface GeminiGenerateContentResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
        finishReason?: string;
    }>;

    error?: {
        code?: number;
        message?: string;
        status?: string;
    };
}

export class GeminiScriptProvider implements ScriptProvider {
    async generate(input: ScriptGenerationInput): Promise<GeneratedScript> {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const systemPrompt = this.buildSystemPrompt();

        const userPrompt = this.buildUserPrompt(input);

        const response = await fetch(
            `${GEMINI_API_BASE_URL}/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text: systemPrompt,
                            },
                        ],
                    },
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: userPrompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.8,
                        responseMimeType: 'application/json',
                    },
                }),
            },
        );

        const data = (await response.json()) as GeminiGenerateContentResponse;

        if (!response.ok) {
            throw new Error(
                data.error?.message ?? `Gemini request failed with status ${response.status}`,
            );
        }

        const content = data.candidates?.[0]?.content?.parts
            ?.map((part) => part.text ?? '')
            .join('')
            .trim();

        if (!content) {
            throw new Error('Gemini returned an empty script response');
        }

        const parsed = this.parseResponse(content);

        return this.normalizeScript(parsed, input);
    }

    private buildSystemPrompt(): string {
        return `
You are an expert TikTok affiliate video script writer.

Your job is to create short-form vertical video scripts
designed for TikTok affiliate marketing.

The script must:

1. Hook the viewer immediately.
2. Clearly introduce the product.
3. Focus on real product benefits.
4. Explain why the viewer should care.
5. Use natural spoken Vietnamese when language is vi-VN.
6. Avoid robotic or overly promotional wording.
7. Create visual instructions for every scene.
8. Include character actions when a character is provided.
9. Include product actions when appropriate.
10. Include camera movement suggestions.
11. Include text overlays suitable for TikTok.
12. End with a clear but natural CTA.

IMPORTANT:

- Do not invent unsupported product facts.
- Do not invent discounts, prices, ratings or guarantees.
- Do not claim medical, financial or performance results
  unless explicitly provided in the input.
- Keep narration suitable for voice generation.
- Return valid JSON only.
`;
    }

    private buildUserPrompt(input: ScriptGenerationInput): string {
        const productInfo = {
            title: input.productTitle,
            description: input.productDescription,
            category: input.productCategory,
            highlights: input.productHighlights,
            price: input.price,
            currency: input.currency,
            rating: input.rating,
            reviewCount: input.reviewCount,
            soldCount: input.soldCount,
        };

        const preferences = {
            language: input.language,
            durationSeconds: input.durationSeconds,
            tone: input.tone,
            style: input.style,
            targetAudience: input.targetAudience,
            sellingPoints: input.sellingPoints,
            callToAction: input.callToAction,
            brandName: input.brandName,
            characterDescription: input.characterDescription,
            userPrompt: input.userPrompt,
        };

        return `
Create a TikTok affiliate video script.

PRODUCT:

${JSON.stringify(productInfo, null, 2)}

VIDEO PREFERENCES:

${JSON.stringify(preferences, null, 2)}

Create scenes that fit the requested duration.

Recommended structure:

Scene 1:
Hook

Scene 2:
Problem / viewer pain point

Scene 3:
Product introduction

Scene 4:
Main benefit

Scene 5:
Demonstration / proof

Scene 6:
Additional benefit

Scene 7:
Offer / reason to act

Scene 8:
CTA

You may use fewer or more scenes when appropriate.

Every scene must contain:

- sceneNumber
- purpose
- title
- durationSeconds
- narration
- visualPrompt
- motionPrompt
- cameraMotion
- characterAction
- productAction
- backgroundPrompt
- textOverlay
- subtitle
- transition

Return JSON using exactly this structure:

{
  "title": "...",
  "hook": "...",
  "scenes": [],
  "fullText": "...",
  "cta": "...",
  "estimatedDurationSeconds": ${input.durationSeconds},
  "language": "${input.language}",
  "tone": "${input.tone ?? 'natural'}",
  "style": "${input.style ?? 'ugc'}",
  "metadata": {}
}
`;
    }

    private parseResponse(content: string): Partial<GeneratedScript> {
        try {
            return JSON.parse(content) as Partial<GeneratedScript>;
        } catch {
            const cleaned = content
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();

            try {
                return JSON.parse(cleaned) as Partial<GeneratedScript>;
            } catch {
                throw new Error('Gemini returned invalid JSON for script generation');
            }
        }
    }

    private normalizeScript(
        data: Partial<GeneratedScript>,
        input: ScriptGenerationInput,
    ): GeneratedScript {
        if (!data.title || !data.hook || !Array.isArray(data.scenes)) {
            throw new Error('Gemini script response is missing required fields');
        }

        const scenes: ScriptScene[] = data.scenes.map((scene, index) => ({
            sceneNumber: Number(scene.sceneNumber) || index + 1,

            purpose: scene.purpose ?? 'product',

            title: scene.title ?? `Scene ${index + 1}`,

            durationSeconds: Number(scene.durationSeconds) || 3,

            narration: scene.narration ?? '',

            visualPrompt: scene.visualPrompt ?? '',

            motionPrompt: scene.motionPrompt,

            cameraMotion: scene.cameraMotion,

            characterAction: scene.characterAction,

            productAction: scene.productAction,

            backgroundPrompt: scene.backgroundPrompt,

            textOverlay: scene.textOverlay,

            subtitle: scene.subtitle,

            transition: scene.transition,
        }));

        const fullText =
            data.fullText ??
            scenes
                .map((scene) => scene.narration)
                .filter(Boolean)
                .join(' ');

        const estimatedDuration =
            data.estimatedDurationSeconds ??
            scenes.reduce((total, scene) => total + scene.durationSeconds, 0);

        return {
            title: data.title,

            hook: data.hook,

            scenes,

            fullText,

            cta: data.cta ?? input.callToAction ?? 'Xem sản phẩm ở giỏ hàng nhé!',

            estimatedDurationSeconds: estimatedDuration,

            language: input.language,

            tone: data.tone ?? input.tone,

            style: data.style ?? input.style,

            metadata: data.metadata ?? {
                provider: 'gemini',
                model: DEFAULT_MODEL,
            },
        };
    }
}

export const geminiScriptProvider = new GeminiScriptProvider();

export default GeminiScriptProvider;

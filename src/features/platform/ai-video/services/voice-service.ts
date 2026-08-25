import fs from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '@/lib/prisma';

import type { VoiceGenerationInput, VoiceLanguage } from '@/features/platform/ai-video/types/voice';

import type { VoiceProvider } from '../providers/voice/voice-provider';

export interface GenerateVoiceOptions {
    provider: VoiceProvider;
    voiceProvider?: string;
    voiceId?: string;
    force?: boolean;
}

export interface GenerateVoiceResult {
    projectId: string;
    voiceText: string;
    voiceUrl: string;
    provider: string;
    voiceId?: string;
    durationSeconds?: number;
}

class VoiceService {
    async generateVoice(
        projectId: string,
        createdById: string,
        options: GenerateVoiceOptions,
    ): Promise<GenerateVoiceResult> {
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
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        if (!project.scriptText?.trim()) {
            throw new Error('Script is required before generating voice');
        }

        if (project.voiceUrl && project.voiceText && !options.force) {
            return {
                projectId: project.id,
                voiceText: project.voiceText,
                voiceUrl: project.voiceUrl,
                provider: project.voiceProvider ?? 'unknown',
                voiceId: project.voiceId ?? undefined,
            };
        }

        const character = project.characters[0]?.character ?? null;

        const voiceText = project.scriptText.trim();

        if (!voiceText) {
            throw new Error('Voice text cannot be empty');
        }

        /*
         * Fish Audio does not require a voice ID
         * for the default voice.
         *
         * For ElevenLabs / other providers,
         * keep the existing resolution behavior.
         */
        const voiceId = options.voiceId ?? project.voiceId ?? character?.voiceId ?? undefined;

        const providerName = options.voiceProvider ?? project.voiceProvider ?? 'fish';

        const language = this.normalizeLanguage(project.language);

        const input: VoiceGenerationInput = {
            text: voiceText,
            language,
            voiceId,
        };

        const result = await options.provider.generate(input);

        if (!result || !result.audioUrl?.trim()) {
            throw new Error('Voice provider returned empty audio URL');
        }

        const generatedVoiceId = result.voiceId ?? voiceId;

        const storedVoiceUrl = await this.persistAudio(project.id, result.audioUrl);

        await prisma.videoProject.update({
            where: {
                id: project.id,
            },
            data: {
                voiceText,
                voiceUrl: storedVoiceUrl,
                voiceProvider: result.provider ?? providerName,
                voiceId: generatedVoiceId,
                currentStep: 'GENERATE_SCENES',
                progress: 55,
            },
        });

        return {
            projectId: project.id,
            voiceText,
            voiceUrl: storedVoiceUrl,
            provider: result.provider ?? providerName,
            voiceId: generatedVoiceId,
            durationSeconds: result.durationSeconds ?? undefined,
        };
    }

    async getVoice(projectId: string, createdById: string) {
        const project = await prisma.videoProject.findFirst({
            where: {
                id: projectId,
                createdById,
            },
            select: {
                id: true,
                voiceProvider: true,
                voiceId: true,
                voiceText: true,
                voiceUrl: true,
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        return project;
    }

    async updateVoice(
        projectId: string,
        createdById: string,
        input: {
            voiceText: string;
            voiceProvider?: string;
            voiceId?: string;
            voiceUrl?: string;
        },
    ) {
        const project = await prisma.videoProject.findFirst({
            where: {
                id: projectId,
                createdById,
            },
        });

        if (!project) {
            throw new Error('Video project not found');
        }

        if (!input.voiceText.trim()) {
            throw new Error('Voice text cannot be empty');
        }

        return prisma.videoProject.update({
            where: {
                id: project.id,
            },
            data: {
                voiceText: input.voiceText.trim(),

                ...(input.voiceProvider !== undefined
                    ? {
                          voiceProvider: input.voiceProvider,
                      }
                    : {}),

                ...(input.voiceId !== undefined
                    ? {
                          voiceId: input.voiceId,
                      }
                    : {}),

                ...(input.voiceUrl !== undefined
                    ? {
                          voiceUrl: input.voiceUrl,
                      }
                    : {}),
            },
        });
    }

    async regenerateVoice(
        projectId: string,
        createdById: string,
        provider: VoiceProvider,
        options?: {
            voiceProvider?: string;
            voiceId?: string;
        },
    ): Promise<GenerateVoiceResult> {
        return this.generateVoice(projectId, createdById, {
            provider,
            voiceProvider: options?.voiceProvider,
            voiceId: options?.voiceId,
            force: true,
        });
    }

    private async persistAudio(projectId: string, audioUrl: string): Promise<string> {
        if (audioUrl.startsWith('/assets/')) {
            return audioUrl;
        }

        if (audioUrl.startsWith('data:audio/')) {
            const match = audioUrl.match(/^data:audio\/[^;]+;base64,(.+)$/);

            if (!match?.[1]) {
                throw new Error('Invalid audio data URL returned by voice provider');
            }

            const buffer = Buffer.from(match[1], 'base64');

            return this.writeAudioFile(projectId, buffer);
        }

        if (/^https?:\/\//i.test(audioUrl)) {
            const response = await fetch(audioUrl, {
                redirect: 'follow',
            });

            if (!response.ok) {
                throw new Error(`Failed to download generated voice: HTTP ${response.status}`);
            }

            const buffer = Buffer.from(await response.arrayBuffer());

            if (!buffer.length) {
                throw new Error('Generated voice file is empty');
            }

            return this.writeAudioFile(projectId, buffer);
        }

        throw new Error(`Unsupported voice URL: ${audioUrl.slice(0, 100)}`);
    }

    private async writeAudioFile(projectId: string, buffer: Buffer): Promise<string> {
        const storageDir = path.join(
            process.cwd(),
            'storage',
            'ai-video',
            'projects',
            projectId,
            'voice',
        );

        await fs.mkdir(storageDir, {
            recursive: true,
        });

        const filePath = path.join(storageDir, 'voice.mp3');

        const tempPath = `${filePath}.tmp`;

        await fs.writeFile(tempPath, buffer);

        await fs.rename(tempPath, filePath);

        return `/assets/ai-video/projects/${projectId}/voice/voice.mp3`;
    }

    private normalizeLanguage(language: string): VoiceLanguage {
        const supportedLanguages: VoiceLanguage[] = ['vi-VN', 'en-US', 'ja-JP', 'ko-KR', 'zh-CN'];

        if (supportedLanguages.includes(language as VoiceLanguage)) {
            return language as VoiceLanguage;
        }

        return 'vi-VN';
    }
}

export const voiceService = new VoiceService();

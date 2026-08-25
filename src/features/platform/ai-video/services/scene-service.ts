import fs from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '@/lib/prisma';
import { VideoProjectStatus, VideoSceneStatus } from '@/generated/prisma';

import type { VideoProvider } from '../providers/video/video-provider';

type VideoProviderInput = Parameters<VideoProvider['generate']>[0];
type VideoProviderOutput = Awaited<ReturnType<VideoProvider['generate']>>;

export interface CreateSceneInput {
    sceneNumber: number;
    title?: string;
    durationSeconds?: number;
    scriptText?: string;
    voiceText?: string;
    characterIds?: string[];
    productImageUrls?: string[];
    backgroundUrl?: string;
    motion?: string;
    cameraMotion?: string;
    style?: string;
    settingsJson?: unknown;
}

export interface UpdateSceneInput {
    title?: string;
    durationSeconds?: number;
    scriptText?: string;
    voiceText?: string;
    characterIds?: string[];
    productImageUrls?: string[];
    backgroundUrl?: string;
    motion?: string;
    cameraMotion?: string;
    style?: string;
    settingsJson?: unknown;
}

export interface GenerateSceneOptions {
    provider: VideoProvider;
    regenerate?: boolean;
}

export interface GenerateScenesOptions {
    provider: VideoProvider;
    regenerate?: boolean;
}

interface ProductImageRecord {
    id?: string;
    url?: string;
    name?: string;
    alt?: string;
    isPrimary?: boolean;
    source?: string;
}

export class SceneService {
    // ============================================================
    // CREATE SCENE
    // ============================================================

    async createScene(projectId: string, createdById: string, input: CreateSceneInput) {
        await this.ensureProjectOwnership(projectId, createdById);

        if (!Number.isInteger(input.sceneNumber) || input.sceneNumber < 1) {
            throw new Error('Scene number must be a positive integer');
        }

        if (input.durationSeconds !== undefined && input.durationSeconds <= 0) {
            throw new Error('Scene duration must be greater than zero');
        }

        const existing = await prisma.videoScene.findUnique({
            where: {
                projectId_sceneNumber: {
                    projectId,
                    sceneNumber: input.sceneNumber,
                },
            },
        });

        if (existing) {
            throw new Error(`Scene ${input.sceneNumber} already exists`);
        }

        return prisma.videoScene.create({
            data: {
                projectId,
                sceneNumber: input.sceneNumber,
                title: input.title?.trim() || undefined,
                durationSeconds: input.durationSeconds ?? 5,
                scriptText: input.scriptText?.trim() || undefined,
                voiceText: input.voiceText?.trim() || undefined,
                characterIds:
                    input.characterIds !== undefined
                        ? JSON.parse(JSON.stringify(input.characterIds))
                        : undefined,
                productImageUrls:
                    input.productImageUrls !== undefined
                        ? JSON.parse(JSON.stringify(input.productImageUrls))
                        : undefined,
                backgroundUrl: input.backgroundUrl?.trim() || undefined,
                motion: input.motion?.trim() || undefined,
                cameraMotion: input.cameraMotion?.trim() || undefined,
                style: input.style?.trim() || undefined,
                settingsJson:
                    input.settingsJson !== undefined
                        ? JSON.parse(JSON.stringify(input.settingsJson))
                        : undefined,
                status: VideoSceneStatus.PENDING,
            },
        });
    }

    // ============================================================
    // CREATE SCENES
    // ============================================================

    async createScenes(projectId: string, createdById: string, inputs: CreateSceneInput[]) {
        await this.ensureProjectOwnership(projectId, createdById);

        if (!inputs.length) {
            throw new Error('At least one scene is required');
        }

        const sceneNumbers = inputs.map((scene) => scene.sceneNumber);

        const uniqueSceneNumbers = new Set(sceneNumbers);

        if (uniqueSceneNumbers.size !== sceneNumbers.length) {
            throw new Error('Duplicate scene numbers are not allowed');
        }

        const scenes = await prisma.$transaction(
            inputs.map((input) =>
                prisma.videoScene.create({
                    data: {
                        projectId,
                        sceneNumber: input.sceneNumber,
                        title: input.title?.trim() || undefined,
                        durationSeconds: input.durationSeconds ?? 5,
                        scriptText: input.scriptText?.trim() || undefined,
                        voiceText: input.voiceText?.trim() || undefined,
                        characterIds:
                            input.characterIds !== undefined
                                ? JSON.parse(JSON.stringify(input.characterIds))
                                : undefined,
                        productImageUrls:
                            input.productImageUrls !== undefined
                                ? JSON.parse(JSON.stringify(input.productImageUrls))
                                : undefined,
                        backgroundUrl: input.backgroundUrl?.trim() || undefined,
                        motion: input.motion?.trim() || undefined,
                        cameraMotion: input.cameraMotion?.trim() || undefined,
                        style: input.style?.trim() || undefined,
                        settingsJson:
                            input.settingsJson !== undefined
                                ? JSON.parse(JSON.stringify(input.settingsJson))
                                : undefined,
                        status: VideoSceneStatus.PENDING,
                    },
                }),
            ),
        );

        return scenes;
    }

    // ============================================================
    // GET SCENE
    // ============================================================

    async getScene(projectId: string, sceneId: string, createdById: string) {
        await this.ensureProjectOwnership(projectId, createdById);

        const scene = await prisma.videoScene.findFirst({
            where: {
                id: sceneId,
                projectId,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        language: true,
                        videoStyle: true,
                        width: true,
                        height: true,
                        aspectRatio: true,
                        voiceProvider: true,
                        voiceId: true,
                        voiceUrl: true,
                        affiliateUrl: true,
                        videoAffiliate: true,
                    },
                },
                jobs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!scene) {
            throw new Error('Video scene not found');
        }

        return scene;
    }

    // ============================================================
    // LIST SCENES
    // ============================================================

    async listScenes(projectId: string, createdById: string) {
        await this.ensureProjectOwnership(projectId, createdById);

        return prisma.videoScene.findMany({
            where: {
                projectId,
            },
            orderBy: {
                sceneNumber: 'asc',
            },
        });
    }

    // ============================================================
    // UPDATE SCENE
    // ============================================================

    async updateScene(
        projectId: string,
        sceneId: string,
        createdById: string,
        input: UpdateSceneInput,
    ) {
        await this.ensureProjectOwnership(projectId, createdById);

        await this.ensureScene(projectId, sceneId);

        if (input.durationSeconds !== undefined && input.durationSeconds <= 0) {
            throw new Error('Scene duration must be greater than zero');
        }

        return prisma.videoScene.update({
            where: {
                id: sceneId,
            },
            data: {
                ...(input.title !== undefined
                    ? {
                          title: input.title.trim(),
                      }
                    : {}),

                ...(input.durationSeconds !== undefined
                    ? {
                          durationSeconds: input.durationSeconds,
                      }
                    : {}),

                ...(input.scriptText !== undefined
                    ? {
                          scriptText: input.scriptText.trim(),
                      }
                    : {}),

                ...(input.voiceText !== undefined
                    ? {
                          voiceText: input.voiceText.trim(),
                      }
                    : {}),

                ...(input.characterIds !== undefined
                    ? {
                          characterIds: JSON.parse(JSON.stringify(input.characterIds)),
                      }
                    : {}),

                ...(input.productImageUrls !== undefined
                    ? {
                          productImageUrls: JSON.parse(JSON.stringify(input.productImageUrls)),
                      }
                    : {}),

                ...(input.backgroundUrl !== undefined
                    ? {
                          backgroundUrl: input.backgroundUrl.trim(),
                      }
                    : {}),

                ...(input.motion !== undefined
                    ? {
                          motion: input.motion.trim(),
                      }
                    : {}),

                ...(input.cameraMotion !== undefined
                    ? {
                          cameraMotion: input.cameraMotion.trim(),
                      }
                    : {}),

                ...(input.style !== undefined
                    ? {
                          style: input.style.trim(),
                      }
                    : {}),

                ...(input.settingsJson !== undefined
                    ? {
                          settingsJson: JSON.parse(JSON.stringify(input.settingsJson)),
                      }
                    : {}),
            },
        });
    }

    // ============================================================
    // DELETE SCENE
    // ============================================================

    async deleteScene(projectId: string, sceneId: string, createdById: string) {
        await this.ensureProjectOwnership(projectId, createdById);

        await this.ensureScene(projectId, sceneId);

        return prisma.videoScene.delete({
            where: {
                id: sceneId,
            },
        });
    }

    // ============================================================
    // GENERATE SINGLE SCENE
    // ============================================================

    async generateScene(
        projectId: string,
        sceneId: string,
        createdById: string,
        options: GenerateSceneOptions,
    ) {
        const project = await this.getProject(projectId, createdById);

        const scene = await prisma.videoScene.findFirst({
            where: {
                id: sceneId,
                projectId,
            },
        });

        if (!scene) {
            throw new Error('Video scene not found');
        }

        if (scene.status === VideoSceneStatus.COMPLETED && !options.regenerate) {
            return scene;
        }

        const scriptText = scene.scriptText?.trim() || '';

        if (!scriptText) {
            throw new Error(`Scene ${scene.sceneNumber} does not have script text`);
        }

        await prisma.videoScene.update({
            where: {
                id: scene.id,
            },
            data: {
                status: VideoSceneStatus.GENERATING,
                errorMessage: null,
                provider: null,
                providerJobId: null,
            },
        });

        try {
            /*
             * Product images are resolved from the
             * scene first, then VideoAffiliate.
             *
             * This intentionally does NOT use
             * analysisJson.productImages because
             * analysisJson is only a snapshot.
             */
            const productImageUrls = this.resolveSceneProductImages(
                scene.productImageUrls,
                project.videoAffiliate?.productImages,
            );

            if (!productImageUrls.length) {
                throw new Error(
                    `Scene ${scene.sceneNumber} does not have any valid product image URL`,
                );
            }

            const existingSceneImages = this.toStringArray(scene.productImageUrls);

            const normalizedSceneImages = JSON.stringify(productImageUrls);

            const existingSceneImagesJson = JSON.stringify(existingSceneImages);

            if (normalizedSceneImages !== existingSceneImagesJson) {
                await prisma.videoScene.update({
                    where: {
                        id: scene.id,
                    },
                    data: {
                        productImageUrls: JSON.parse(normalizedSceneImages),
                    },
                });
            }

            const input = this.buildProviderInput(project, scene, productImageUrls);

            if (!input.imageUrl) {
                throw new Error(
                    `Scene ${scene.sceneNumber} does not have a valid product image URL`,
                );
            }

            const result = await options.provider.generate(input);

            const output = this.normalizeProviderOutput(result);

            if (!output.videoUrl) {
                throw new Error(
                    `Video provider did not return a video URL for scene ${scene.sceneNumber}`,
                );
            }

            /*
             * Provider URLs may be temporary signed URLs.
             * Always persist generated scene videos into
             * our own storage before saving the DB URL.
             */
            const storedVideoUrl = await this.saveProviderVideo(
                project.id,
                scene.sceneNumber,
                output.videoUrl,
            );

            /*
             * Thumbnail URLs from providers may also be
             * temporary. Store them locally when possible.
             */
            const storedThumbnailUrl = output.thumbnailUrl
                ? await this.saveProviderThumbnail(
                      project.id,
                      scene.sceneNumber,
                      output.thumbnailUrl,
                  )
                : undefined;

            const updated = await prisma.videoScene.update({
                where: {
                    id: scene.id,
                },
                data: {
                    status: VideoSceneStatus.COMPLETED,
                    provider: output.provider,
                    providerJobId: output.providerJobId,
                    generatedVideoUrl: storedVideoUrl,
                    thumbnailUrl: storedThumbnailUrl,
                    errorMessage: null,
                },
            });

            await this.updateProjectProgress(projectId);

            return updated;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown scene generation error';

            await prisma.videoScene.update({
                where: {
                    id: scene.id,
                },
                data: {
                    status: VideoSceneStatus.FAILED,
                    errorMessage: message,
                },
            });

            await prisma.videoProject.update({
                where: {
                    id: projectId,
                },
                data: {
                    status: VideoProjectStatus.FAILED,
                    errorMessage: message,
                },
            });

            throw error;
        }
    }

    // ============================================================
    // GENERATE ALL SCENES
    // ============================================================

    async generateScenes(projectId: string, createdById: string, options: GenerateScenesOptions) {
        await this.getProject(projectId, createdById);

        const scenes = await prisma.videoScene.findMany({
            where: {
                projectId,
            },
            orderBy: {
                sceneNumber: 'asc',
            },
        });

        if (!scenes.length) {
            throw new Error('Project has no scenes');
        }

        await prisma.videoProject.update({
            where: {
                id: projectId,
            },
            data: {
                status: VideoProjectStatus.GENERATING,
                currentStep: 'GENERATE_SCENES',
                progress: 65,
                errorMessage: null,
            },
        });

        const results: typeof scenes = [];

        try {
            for (let index = 0; index < scenes.length; index += 1) {
                const scene = scenes[index];

                if (!scene) {
                    continue;
                }

                if (scene.status === VideoSceneStatus.COMPLETED && !options.regenerate) {
                    results.push(scene);
                    continue;
                }

                const result = await this.generateScene(projectId, scene.id, createdById, {
                    provider: options.provider,
                    regenerate: options.regenerate,
                });

                results.push(result);

                const progress = 65 + Math.round(((index + 1) / scenes.length) * 20);

                await prisma.videoProject.update({
                    where: {
                        id: projectId,
                    },
                    data: {
                        progress: Math.min(progress, 85),
                        currentStep: 'GENERATE_SCENES',
                    },
                });
            }

            return {
                projectId,
                total: scenes.length,
                completed: results.filter((scene) => scene.status === VideoSceneStatus.COMPLETED)
                    .length,
                scenes: results,
            };
        } catch (error) {
            await this.markProjectFailed(projectId, error);

            throw error;
        }
    }

    // ============================================================
    // UPDATE PROVIDER JOB
    // ============================================================

    async updateProviderJob(
        projectId: string,
        sceneId: string,
        createdById: string,
        input: {
            provider?: string;
            providerJobId?: string;
            status?: VideoSceneStatus;
            generatedVideoUrl?: string;
            thumbnailUrl?: string;
            errorMessage?: string;
        },
    ) {
        await this.ensureProjectOwnership(projectId, createdById);

        await this.ensureScene(projectId, sceneId);

        return prisma.videoScene.update({
            where: {
                id: sceneId,
            },
            data: {
                ...(input.provider !== undefined
                    ? {
                          provider: input.provider,
                      }
                    : {}),

                ...(input.providerJobId !== undefined
                    ? {
                          providerJobId: input.providerJobId,
                      }
                    : {}),

                ...(input.status !== undefined
                    ? {
                          status: input.status,
                      }
                    : {}),

                ...(input.generatedVideoUrl !== undefined
                    ? {
                          generatedVideoUrl: input.generatedVideoUrl,
                      }
                    : {}),

                ...(input.thumbnailUrl !== undefined
                    ? {
                          thumbnailUrl: input.thumbnailUrl,
                      }
                    : {}),

                ...(input.errorMessage !== undefined
                    ? {
                          errorMessage: input.errorMessage,
                      }
                    : {}),
            },
        });
    }

    // ============================================================
    // REGENERATE
    // ============================================================

    async regenerateScene(
        projectId: string,
        sceneId: string,
        createdById: string,
        provider: VideoProvider,
    ) {
        return this.generateScene(projectId, sceneId, createdById, {
            provider,
            regenerate: true,
        });
    }

    // ============================================================
    // GET SCENE STATUS
    // ============================================================

    async getSceneStatus(projectId: string, sceneId: string, createdById: string) {
        await this.ensureProjectOwnership(projectId, createdById);

        const scene = await prisma.videoScene.findFirst({
            where: {
                id: sceneId,
                projectId,
            },
            select: {
                id: true,
                sceneNumber: true,
                status: true,
                provider: true,
                providerJobId: true,
                generatedVideoUrl: true,
                thumbnailUrl: true,
                errorMessage: true,
                updatedAt: true,
            },
        });

        if (!scene) {
            throw new Error('Video scene not found');
        }

        return scene;
    }

    // ============================================================
    // GENERATION SUMMARY
    // ============================================================

    async getGenerationSummary(projectId: string, createdById: string) {
        await this.ensureProjectOwnership(projectId, createdById);

        const scenes = await prisma.videoScene.findMany({
            where: {
                projectId,
            },
            select: {
                id: true,
                status: true,
                durationSeconds: true,
            },
        });

        const total = scenes.length;

        const completed = scenes.filter(
            (scene) => scene.status === VideoSceneStatus.COMPLETED,
        ).length;

        const generating = scenes.filter(
            (scene) => scene.status === VideoSceneStatus.GENERATING,
        ).length;

        const failed = scenes.filter((scene) => scene.status === VideoSceneStatus.FAILED).length;

        const pending = scenes.filter((scene) => scene.status === VideoSceneStatus.PENDING).length;

        const duration = scenes.reduce(
            (totalDuration, scene) => totalDuration + scene.durationSeconds,
            0,
        );

        return {
            total,
            completed,
            generating,
            failed,
            pending,
            durationSeconds: duration,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }

    // ============================================================
    // BUILD PROVIDER INPUT
    // ============================================================

    private buildProviderInput(
        project: Awaited<ReturnType<SceneService['getProject']>>,
        scene: Awaited<ReturnType<SceneService['getProject']>>['scenes'][number],
        productImageUrls: string[],
    ): VideoProviderInput {
        const settings = this.toRecord(scene.settingsJson);

        const characterIds = this.toStringArray(scene.characterIds);

        const primaryProductImage =
            this.selectPrimaryProductImage(
                scene.productImageUrls,
                project.videoAffiliate?.productImages,
            ) ?? productImageUrls[0];

        return {
            projectId: scene.projectId,
            prompt: scene.scriptText ?? '',
            script: scene.scriptText ?? undefined,
            durationSeconds: scene.durationSeconds,
            width: project.width,
            height: project.height,
            aspectRatio: project.aspectRatio,
            style: scene.style ?? project.videoStyle ?? undefined,
            motion: scene.motion ?? undefined,
            cameraMotion: scene.cameraMotion ?? undefined,
            imageUrl: primaryProductImage,
            voiceUrl: project.voiceUrl ?? undefined,
            metadata: {
                sceneId: scene.id,
                sceneNumber: scene.sceneNumber,
                title: scene.title ?? undefined,
                language: project.language,
                characterIds,
                backgroundUrl: scene.backgroundUrl ?? undefined,
                settings,
                productImageUrls,
                voiceText: scene.voiceText ?? undefined,
                affiliateId: project.videoAffiliateId ?? undefined,
                sourceUrl: project.videoAffiliate?.sourceUrl ?? undefined,
            },
        };
    }

    // ============================================================
    // NORMALIZE PROVIDER OUTPUT
    // ============================================================

    private normalizeProviderOutput(value: VideoProviderOutput | unknown) {
        const output = this.toRecord(value);

        const videoUrl = this.toOptionalString(output.videoUrl ?? output.video_url ?? output.url);

        const thumbnailUrl = this.toOptionalString(
            output.thumbnailUrl ?? output.thumbnail_url ?? output.thumbnail,
        );

        const provider = this.toOptionalString(output.provider);

        const providerJobId = this.toOptionalString(
            output.providerJobId ?? output.provider_job_id ?? output.jobId ?? output.job_id,
        );

        return {
            videoUrl,
            thumbnailUrl,
            provider,
            providerJobId,
        };
    }

    // ============================================================
    // STORAGE
    // ============================================================

    private async saveProviderVideo(
        projectId: string,
        sceneNumber: number,
        videoUrl: string,
    ): Promise<string> {
        const normalized = videoUrl.trim();

        if (!normalized) {
            throw new Error(`Generated video URL is empty for scene ${sceneNumber}`);
        }

        /*
         * Already stored in our own asset system.
         */
        if (normalized.startsWith('/assets/')) {
            return normalized;
        }

        /*
         * Provider output must be downloadable.
         */
        if (!/^https?:\/\//i.test(normalized)) {
            throw new Error(
                `Generated video URL for scene ${sceneNumber} is not a supported HTTP(S) URL`,
            );
        }

        const storageDir = path.join(
            process.cwd(),
            'storage',
            'ai-video',
            'projects',
            projectId,
            'scenes',
        );

        await fs.mkdir(storageDir, {
            recursive: true,
        });

        const fileName = `scene-${String(sceneNumber).padStart(2, '0')}.mp4`;

        const filePath = path.join(storageDir, fileName);

        const tempFilePath = `${filePath}.tmp`;

        console.log('[ai-video] Downloading generated scene:', {
            projectId,
            sceneNumber,
            host: this.getSafeHost(normalized),
            fileName,
        });

        const response = await fetch(normalized, {
            method: 'GET',
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error(
                `Failed to download generated scene ${sceneNumber}: HTTP ${response.status}`,
            );
        }

        const contentLength = response.headers.get('content-length');

        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength === 0) {
            throw new Error(`Downloaded generated scene ${sceneNumber} is empty`);
        }

        if (contentLength) {
            const expectedSize = Number(contentLength);

            if (
                Number.isFinite(expectedSize) &&
                expectedSize > 0 &&
                expectedSize !== arrayBuffer.byteLength
            ) {
                throw new Error(`Downloaded generated scene ${sceneNumber} size mismatch`);
            }
        }

        await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer));

        await fs.rename(tempFilePath, filePath);

        return `/assets/ai-video/projects/${projectId}/scenes/${fileName}`;
    }

    private async saveProviderThumbnail(
        projectId: string,
        sceneNumber: number,
        thumbnailUrl: string,
    ): Promise<string | undefined> {
        const normalized = thumbnailUrl.trim();

        if (!normalized) {
            return undefined;
        }

        if (normalized.startsWith('/assets/')) {
            return normalized;
        }

        if (!/^https?:\/\//i.test(normalized)) {
            return undefined;
        }

        const storageDir = path.join(
            process.cwd(),
            'storage',
            'ai-video',
            'projects',
            projectId,
            'scenes',
        );

        await fs.mkdir(storageDir, {
            recursive: true,
        });

        const fileName = `scene-${String(sceneNumber).padStart(2, '0')}.jpg`;

        const filePath = path.join(storageDir, fileName);

        const tempFilePath = `${filePath}.tmp`;

        try {
            const response = await fetch(normalized, {
                method: 'GET',
                redirect: 'follow',
            });

            if (!response.ok) {
                console.warn('[ai-video] Failed to download scene thumbnail:', {
                    projectId,
                    sceneNumber,
                    status: response.status,
                });

                return undefined;
            }

            const arrayBuffer = await response.arrayBuffer();

            if (arrayBuffer.byteLength === 0) {
                return undefined;
            }

            await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer));

            await fs.rename(tempFilePath, filePath);

            return `/assets/ai-video/projects/${projectId}/scenes/${fileName}`;
        } catch (error) {
            console.warn('[ai-video] Failed to persist scene thumbnail:', {
                projectId,
                sceneNumber,
                error: error instanceof Error ? error.message : error,
            });

            try {
                await fs.unlink(tempFilePath);
            } catch {
                // Ignore cleanup failure.
            }

            return undefined;
        }
    }

    private getSafeHost(value: string): string {
        try {
            return new URL(value).host;
        } catch {
            return 'unknown';
        }
    }

    // ============================================================
    // GET PROJECT
    // ============================================================

    private async getProject(projectId: string, createdById: string) {
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
                    orderBy: {
                        sortOrder: 'asc',
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

        return project;
    }

    // ============================================================
    // OWNERSHIP
    // ============================================================

    private async ensureProjectOwnership(projectId: string, createdById: string) {
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

        return project;
    }

    // ============================================================
    // ENSURE SCENE
    // ============================================================

    private async ensureScene(projectId: string, sceneId: string) {
        const scene = await prisma.videoScene.findFirst({
            where: {
                id: sceneId,
                projectId,
            },
            select: {
                id: true,
            },
        });

        if (!scene) {
            throw new Error('Video scene not found');
        }

        return scene;
    }

    // ============================================================
    // PROJECT PROGRESS
    // ============================================================

    private async updateProjectProgress(projectId: string) {
        const scenes = await prisma.videoScene.findMany({
            where: {
                projectId,
            },
            select: {
                status: true,
            },
        });

        if (!scenes.length) {
            return;
        }

        const completed = scenes.filter(
            (scene) => scene.status === VideoSceneStatus.COMPLETED,
        ).length;

        const failed = scenes.some((scene) => scene.status === VideoSceneStatus.FAILED);

        if (failed) {
            return;
        }

        const allCompleted = completed === scenes.length;

        const progress = 65 + Math.round((completed / scenes.length) * 20);

        await prisma.videoProject.update({
            where: {
                id: projectId,
            },
            data: {
                progress: allCompleted ? 85 : Math.min(progress, 85),
                currentStep: allCompleted ? 'COMPOSE_VIDEO' : 'GENERATE_SCENES',
                status: VideoProjectStatus.GENERATING,
            },
        });
    }

    // ============================================================
    // MARK PROJECT FAILED
    // ============================================================

    private async markProjectFailed(projectId: string, error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown scene generation error';

        await prisma.videoProject.update({
            where: {
                id: projectId,
            },
            data: {
                status: VideoProjectStatus.FAILED,
                errorMessage: message,
            },
        });
    }

    // ============================================================
    // RESOLVE PRODUCT IMAGES
    // ============================================================

    private resolveSceneProductImages(sceneValue: unknown, affiliateValue: unknown): string[] {
        const sceneImages = this.toStringArray(sceneValue);

        if (sceneImages.length > 0) {
            const normalizedSceneImages = sceneImages
                .map((url) => this.toAbsoluteUrl(url))
                .filter((url): url is string => Boolean(url));

            if (normalizedSceneImages.length > 0) {
                return normalizedSceneImages;
            }
        }

        /*
         * IMPORTANT:
         *
         * Always fall back to the current
         * VideoAffiliate.productImages.
         *
         * Do NOT use analysisJson.productImages.
         */
        const affiliateImages = this.extractProductImageUrls(affiliateValue);

        return affiliateImages
            .map((url) => this.toAbsoluteUrl(url))
            .filter((url): url is string => Boolean(url));
    }

    // ============================================================
    // EXTRACT PRODUCT IMAGE URLS
    // ============================================================

    private extractProductImageUrls(value: unknown): string[] {
        if (!Array.isArray(value)) {
            return [];
        }

        const images: Array<{
            url: string;
            isPrimary: boolean;
            index: number;
        }> = [];

        for (let index = 0; index < value.length; index++) {
            const item = value[index];

            if (typeof item === 'string' && item.trim()) {
                images.push({
                    url: item.trim(),
                    isPrimary: index === 0,
                    index,
                });

                continue;
            }

            if (!item || typeof item !== 'object' || Array.isArray(item)) {
                continue;
            }

            const image = item as ProductImageRecord;

            if (typeof image.url !== 'string' || !image.url.trim()) {
                continue;
            }

            images.push({
                url: image.url.trim(),
                isPrimary: image.isPrimary === true,
                index,
            });
        }

        return images
            .sort((a, b) => {
                if (a.isPrimary !== b.isPrimary) {
                    return a.isPrimary ? -1 : 1;
                }

                return a.index - b.index;
            })
            .map((image) => image.url);
    }

    // ============================================================
    // SELECT PRIMARY IMAGE
    // ============================================================

    private selectPrimaryProductImage(
        sceneValue: unknown,
        affiliateValue: unknown,
    ): string | undefined {
        const sceneImages = this.toStringArray(sceneValue);

        if (sceneImages.length > 0) {
            return (
                sceneImages
                    .map((url) => this.toAbsoluteUrl(url))
                    .find((url): url is string => Boolean(url)) ?? undefined
            );
        }

        const affiliateImages = this.extractProductImageUrls(affiliateValue);

        return (
            affiliateImages
                .map((url) => this.toAbsoluteUrl(url))
                .find((url): url is string => Boolean(url)) ?? undefined
        );
    }

    // ============================================================
    // ABSOLUTE / PUBLIC URL
    // ============================================================

    private toAbsoluteUrl(value: string): string | undefined {
        const normalized = value.trim();

        if (!normalized) {
            return undefined;
        }

        /*
         * Data URLs are not suitable for
         * external video providers.
         */
        if (/^data:image\//i.test(normalized)) {
            return undefined;
        }

        const publicBaseUrl = this.getPublicBaseUrl();

        /*
         * Absolute HTTP(S) URL.
         */
        if (/^https?:\/\//i.test(normalized)) {
            let parsed: URL;

            try {
                parsed = new URL(normalized);
            } catch {
                return undefined;
            }

            /*
             * Localhost / loopback URLs are
             * valid for the browser but are NOT
             * reachable by external AI providers.
             *
             * Convert:
             *
             * http://localhost:3000/assets/...
             *
             * to:
             *
             * https://public-host/assets/...
             */
            if (this.isLocalhostHost(parsed.hostname)) {
                if (!publicBaseUrl) {
                    throw new Error(
                        'A public AI video URL is required for local image assets. Configure AI_VIDEO_PUBLIC_BASE_URL.',
                    );
                }

                return this.joinPublicUrl(publicBaseUrl, `${parsed.pathname}${parsed.search}`);
            }

            /*
             * Keep already-public URLs unchanged.
             */
            return normalized;
        }

        /*
         * Relative URL:
         *
         * /assets/ai-video/products/...
         */
        if (normalized.startsWith('/')) {
            if (!publicBaseUrl) {
                throw new Error(
                    'A public AI video URL is required for image assets. Configure AI_VIDEO_PUBLIC_BASE_URL.',
                );
            }

            return this.joinPublicUrl(publicBaseUrl, normalized);
        }

        /*
         * Relative asset path without leading slash.
         */
        if (publicBaseUrl) {
            return this.joinPublicUrl(publicBaseUrl, `/${normalized}`);
        }

        throw new Error(
            'A public AI video URL is required for image assets. Configure AI_VIDEO_PUBLIC_BASE_URL.',
        );
    }

    // ============================================================
    // PUBLIC BASE URL
    // ============================================================

    private getPublicBaseUrl(): string | undefined {
        const value =
            process.env.AI_VIDEO_PUBLIC_BASE_URL ??
            process.env.NEXT_PUBLIC_AI_VIDEO_PUBLIC_BASE_URL ??
            process.env.NEXT_PUBLIC_APP_URL ??
            process.env.APP_URL ??
            process.env.NEXT_PUBLIC_SITE_URL ??
            process.env.SITE_URL;

        if (!value?.trim()) {
            return undefined;
        }

        const normalized = value.trim().replace(/\/+$/, '');

        /*
         * localhost is not a public URL for
         * external AI providers.
         */
        try {
            const parsed = new URL(normalized);

            if (this.isLocalhostHost(parsed.hostname)) {
                return undefined;
            }

            return normalized;
        } catch {
            return undefined;
        }
    }

    // ============================================================
    // LOCALHOST DETECTION
    // ============================================================

    private isLocalhostHost(hostname: string): boolean {
        const normalized = hostname.trim().toLowerCase();

        return (
            normalized === 'localhost' ||
            normalized === '127.0.0.1' ||
            normalized === '0.0.0.0' ||
            normalized === '::1'
        );
    }

    // ============================================================
    // JOIN PUBLIC URL
    // ============================================================

    private joinPublicUrl(baseUrl: string, relativePath: string): string {
        const cleanBase = baseUrl.replace(/\/+$/, '');

        const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

        return `${cleanBase}${cleanPath}`;
    }

    // ============================================================
    // RECORD
    // ============================================================

    private toRecord(value: unknown): Record<string, unknown> {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            return value as Record<string, unknown>;
        }

        return {};
    }

    // ============================================================
    // STRING ARRAY
    // ============================================================

    private toStringArray(value: unknown): string[] {
        if (!Array.isArray(value)) {
            return [];
        }

        return value.filter(
            (item): item is string => typeof item === 'string' && item.trim().length > 0,
        );
    }

    // ============================================================
    // OPTIONAL STRING
    // ============================================================

    private toOptionalString(value: unknown): string | undefined {
        return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    }
}

export const sceneService = new SceneService();

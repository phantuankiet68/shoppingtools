import { prisma } from '@/lib/prisma';

export interface CreateVideoProjectInput {
    name: string;

    videoAffiliateId?: string;

    durationSeconds?: number;
    aspectRatio?: string;
    width?: number;
    height?: number;

    language?: string;
    videoStyle?: string;

    backgroundMusic?: string;

    voiceProvider?: string;
    voiceId?: string;

    characterIds?: string[];

    scriptText?: string;
    scriptJson?: unknown;

    voiceText?: string;

    affiliateUrl?: string;
    ctaText?: string;

    settingsJson?: unknown;
}

export interface UpdateVideoProjectInput {
    name?: string;

    videoAffiliateId?: string | null;

    durationSeconds?: number;
    aspectRatio?: string;
    width?: number;
    height?: number;

    language?: string;
    videoStyle?: string;

    backgroundMusic?: string;

    voiceProvider?: string;
    voiceId?: string;

    scriptText?: string;
    scriptJson?: unknown;

    voiceText?: string;
    voiceUrl?: string;

    affiliateUrl?: string;
    ctaText?: string;

    settingsJson?: unknown;
}

class VideoProjectService {
    // ============================================================
    // CREATE
    // ============================================================

    async create(createdById: string, input: CreateVideoProjectInput) {
        const name = input.name.trim();

        if (!name) {
            throw new Error('Project name is required');
        }

        // --------------------------------------------------------
        // Validate affiliate ownership
        // --------------------------------------------------------

        if (input.videoAffiliateId) {
            const affiliate = await prisma.videoAffiliate.findFirst({
                where: {
                    id: input.videoAffiliateId,
                    createdById,
                    deletedAt: null,
                },
                select: {
                    id: true,
                },
            });

            if (!affiliate) {
                throw new Error('Video affiliate not found');
            }
        }

        // --------------------------------------------------------
        // Validate characters ownership
        // --------------------------------------------------------

        const characterIds = input.characterIds ?? [];

        if (characterIds.length > 0) {
            const characters = await prisma.videoCharacter.findMany({
                where: {
                    id: {
                        in: characterIds,
                    },
                    createdById,
                    deletedAt: null,
                    status: 'ACTIVE',
                },
                select: {
                    id: true,
                },
            });

            if (characters.length !== characterIds.length) {
                throw new Error('One or more video characters were not found');
            }
        }

        // --------------------------------------------------------
        // Create project
        // --------------------------------------------------------

        const project = await prisma.videoProject.create({
            data: {
                createdById,

                name,

                videoAffiliateId: input.videoAffiliateId,

                durationSeconds: input.durationSeconds ?? 30,

                aspectRatio: input.aspectRatio ?? '9:16',

                width: input.width ?? 1080,

                height: input.height ?? 1920,

                language: input.language ?? 'vi-VN',

                videoStyle: input.videoStyle,

                scriptText: input.scriptText,

                scriptJson:
                    input.scriptJson !== undefined ? (input.scriptJson as never) : undefined,

                voiceProvider: input.voiceProvider,

                voiceId: input.voiceId,

                voiceText: input.voiceText,

                backgroundMusic: input.backgroundMusic,

                affiliateUrl: input.affiliateUrl,

                ctaText: input.ctaText,

                settingsJson:
                    input.settingsJson !== undefined ? (input.settingsJson as never) : undefined,

                status: 'DRAFT',

                progress: 0,

                currentStep: null,
            },
        });

        // --------------------------------------------------------
        // Attach characters
        // --------------------------------------------------------

        if (characterIds.length > 0) {
            await prisma.videoProjectCharacter.createMany({
                data: characterIds.map((characterId, index) => ({
                    projectId: project.id,

                    characterId,

                    sortOrder: index,

                    role: index === 0 ? 'PRIMARY' : 'SECONDARY',
                })),
            });
        }

        // --------------------------------------------------------
        // Return complete project
        // --------------------------------------------------------

        return prisma.videoProject.findUnique({
            where: {
                id: project.id,
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

                jobs: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
    }

    // ============================================================
    // LIST
    // ============================================================

    async list(createdById: string) {
        return prisma.videoProject.findMany({
            where: {
                createdById,
                status: {
                    not: 'ARCHIVED',
                },
            },

            include: {
                videoAffiliate: {
                    select: {
                        id: true,
                        title: true,
                        sourceUrl: true,
                        sourcePlatform: true,
                        productImages: true,
                    },
                },

                characters: {
                    include: {
                        character: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                                thumbnailUrl: true,
                                gender: true,
                                voiceProvider: true,
                                voiceId: true,
                            },
                        },
                    },

                    orderBy: {
                        sortOrder: 'asc',
                    },
                },

                _count: {
                    select: {
                        scenes: true,
                        jobs: true,
                    },
                },
            },

            orderBy: {
                updatedAt: 'desc',
            },
        });
    }

    // ============================================================
    // GET
    // ============================================================

    async get(projectId: string, createdById: string) {
        return prisma.videoProject.findFirst({
            where: {
                id: projectId,
                createdById,
            },
            select: {
                id: true,
                name: true,
                status: true,
                progress: true,
                currentStep: true,
                durationSeconds: true,
                aspectRatio: true,
                width: true,
                height: true,
                language: true,
                videoStyle: true,
                scriptText: true,
                scriptJson: true,
                voiceText: true,
                voiceUrl: true,
                voiceProvider: true,
                voiceId: true,
                backgroundMusic: true,
                affiliateUrl: true,
                ctaText: true,
                settingsJson: true,
                finalVideoUrl: true,
                thumbnailUrl: true,
                errorMessage: true,
                completedAt: true,
                videoAffiliateId: true,
                videoAffiliate: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        category: true,
                        rating: true,
                        reviewCount: true,
                        soldCount: true,
                        priceMin: true,
                        priceMax: true,
                        productImages: true,
                        highlights: true,
                        sourceUrl: true,
                        sourcePlatform: true,
                    },
                },
            },
        });
    }
    // ============================================================
    // UPDATE
    // ============================================================

    async update(projectId: string, createdById: string, input: UpdateVideoProjectInput) {
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

        return prisma.videoProject.update({
            where: {
                id: project.id,
            },

            data: {
                ...(input.name !== undefined
                    ? {
                          name: input.name.trim(),
                      }
                    : {}),

                ...(input.videoAffiliateId !== undefined
                    ? {
                          videoAffiliateId: input.videoAffiliateId,
                      }
                    : {}),

                ...(input.durationSeconds !== undefined
                    ? {
                          durationSeconds: input.durationSeconds,
                      }
                    : {}),

                ...(input.aspectRatio !== undefined
                    ? {
                          aspectRatio: input.aspectRatio,
                      }
                    : {}),

                ...(input.width !== undefined
                    ? {
                          width: input.width,
                      }
                    : {}),

                ...(input.height !== undefined
                    ? {
                          height: input.height,
                      }
                    : {}),

                ...(input.language !== undefined
                    ? {
                          language: input.language,
                      }
                    : {}),

                ...(input.videoStyle !== undefined
                    ? {
                          videoStyle: input.videoStyle,
                      }
                    : {}),

                ...(input.backgroundMusic !== undefined
                    ? {
                          backgroundMusic: input.backgroundMusic,
                      }
                    : {}),

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

                ...(input.scriptText !== undefined
                    ? {
                          scriptText: input.scriptText,
                      }
                    : {}),

                ...(input.scriptJson !== undefined
                    ? {
                          scriptJson: input.scriptJson as never,
                      }
                    : {}),

                ...(input.voiceText !== undefined
                    ? {
                          voiceText: input.voiceText,
                      }
                    : {}),

                ...(input.voiceUrl !== undefined
                    ? {
                          voiceUrl: input.voiceUrl,
                      }
                    : {}),

                ...(input.affiliateUrl !== undefined
                    ? {
                          affiliateUrl: input.affiliateUrl,
                      }
                    : {}),

                ...(input.ctaText !== undefined
                    ? {
                          ctaText: input.ctaText,
                      }
                    : {}),

                ...(input.settingsJson !== undefined
                    ? {
                          settingsJson: input.settingsJson as never,
                      }
                    : {}),
            },
        });
    }

    // ============================================================
    // UPDATE PROGRESS
    // ============================================================

    async updateProgress(
        projectId: string,
        createdById: string,
        progress: number,
        currentStep?: string,
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

        const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress)));

        return prisma.videoProject.update({
            where: {
                id: project.id,
            },

            data: {
                progress: normalizedProgress,

                ...(currentStep !== undefined
                    ? {
                          currentStep: currentStep as
                              | 'ANALYZE_PRODUCT'
                              | 'GENERATE_SCRIPT'
                              | 'GENERATE_VOICE'
                              | 'GENERATE_SCENES'
                              | 'COMPOSE_VIDEO'
                              | 'RENDER_VIDEO'
                              | 'COMPLETED',
                      }
                    : {}),
            },
        });
    }

    // ============================================================
    // ARCHIVE
    // ============================================================

    async archive(projectId: string, createdById: string) {
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

        return prisma.videoProject.update({
            where: {
                id: project.id,
            },

            data: {
                status: 'ARCHIVED',
            },
        });
    }
}

export const videoProjectService = new VideoProjectService();

// ============================================================
// PUBLIC SERVICE FUNCTIONS
// ============================================================

export async function createVideoProject(createdById: string, input: CreateVideoProjectInput) {
    return videoProjectService.create(createdById, input);
}

export async function listVideoProjects(createdById: string) {
    return videoProjectService.list(createdById);
}

export async function getVideoProject(projectId: string, createdById: string) {
    return videoProjectService.get(projectId, createdById);
}

export async function updateVideoProject(
    projectId: string,
    createdById: string,
    input: UpdateVideoProjectInput,
) {
    return videoProjectService.update(projectId, createdById, input);
}

export async function updateVideoProjectProgress(
    projectId: string,
    createdById: string,
    progress: number,
    currentStep?: string,
) {
    return videoProjectService.updateProgress(projectId, createdById, progress, currentStep);
}

export async function archiveVideoProject(projectId: string, createdById: string) {
    return videoProjectService.archive(projectId, createdById);
}

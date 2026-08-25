import { prisma } from '@/lib/prisma';

export interface CreateVideoCharacterInput {
    name: string;
    imageUrl: string;
    thumbnailUrl?: string;
    gender?: 'FEMALE' | 'MALE' | 'NON_BINARY' | 'UNSPECIFIED';
    language?: string;
    voiceProvider?: string;
    voiceId?: string;
    defaultMotion?: string;
    defaultStyle?: string;
    metadata?: unknown;
}

export interface UpdateVideoCharacterInput {
    name?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    gender?: 'FEMALE' | 'MALE' | 'NON_BINARY' | 'UNSPECIFIED';
    language?: string;
    voiceProvider?: string;
    voiceId?: string;
    defaultMotion?: string;
    defaultStyle?: string;
    metadata?: unknown;
}

class VideoCharacterService {
    async create(createdById: string, input: CreateVideoCharacterInput) {
        const name = input.name.trim();
        const imageUrl = input.imageUrl.trim();

        if (!name) {
            throw new Error('Character name is required');
        }

        if (!imageUrl) {
            throw new Error('Character imageUrl is required');
        }

        return prisma.videoCharacter.create({
            data: {
                createdById,
                name,
                imageUrl,
                thumbnailUrl: input.thumbnailUrl,
                gender: input.gender ?? 'UNSPECIFIED',
                language: input.language ?? 'vi-VN',
                voiceProvider: input.voiceProvider,
                voiceId: input.voiceId,
                defaultMotion: input.defaultMotion,
                defaultStyle: input.defaultStyle,
                metadata: input.metadata !== undefined ? (input.metadata as never) : undefined,
                status: 'ACTIVE',
            },
        });
    }

    async list(createdById: string) {
        return prisma.videoCharacter.findMany({
            where: {
                createdById,
                deletedAt: null,
                status: 'ACTIVE',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async get(id: string, createdById: string) {
        return prisma.videoCharacter.findFirst({
            where: {
                id,
                createdById,
                deletedAt: null,
            },
            include: {
                projectLinks: {
                    include: {
                        project: true,
                    },
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
            },
        });
    }

    async update(id: string, createdById: string, input: UpdateVideoCharacterInput) {
        const character = await prisma.videoCharacter.findFirst({
            where: {
                id,
                createdById,
                deletedAt: null,
            },
        });

        if (!character) {
            throw new Error('Video character not found');
        }

        return prisma.videoCharacter.update({
            where: {
                id: character.id,
            },
            data: {
                ...(input.name !== undefined
                    ? {
                          name: input.name.trim(),
                      }
                    : {}),

                ...(input.imageUrl !== undefined
                    ? {
                          imageUrl: input.imageUrl.trim(),
                      }
                    : {}),

                ...(input.thumbnailUrl !== undefined
                    ? {
                          thumbnailUrl: input.thumbnailUrl,
                      }
                    : {}),

                ...(input.gender !== undefined
                    ? {
                          gender: input.gender,
                      }
                    : {}),

                ...(input.language !== undefined
                    ? {
                          language: input.language,
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

                ...(input.defaultMotion !== undefined
                    ? {
                          defaultMotion: input.defaultMotion,
                      }
                    : {}),

                ...(input.defaultStyle !== undefined
                    ? {
                          defaultStyle: input.defaultStyle,
                      }
                    : {}),

                ...(input.metadata !== undefined
                    ? {
                          metadata: input.metadata as never,
                      }
                    : {}),
            },
        });
    }

    async archive(id: string, createdById: string) {
        const character = await prisma.videoCharacter.findFirst({
            where: {
                id,
                createdById,
                deletedAt: null,
            },
        });

        if (!character) {
            throw new Error('Video character not found');
        }

        return prisma.videoCharacter.update({
            where: {
                id: character.id,
            },
            data: {
                status: 'ARCHIVED',
                deletedAt: new Date(),
            },
        });
    }

    async restore(id: string, createdById: string) {
        const character = await prisma.videoCharacter.findFirst({
            where: {
                id,
                createdById,
            },
        });

        if (!character) {
            throw new Error('Video character not found');
        }

        return prisma.videoCharacter.update({
            where: {
                id: character.id,
            },
            data: {
                status: 'ACTIVE',
                deletedAt: null,
            },
        });
    }
}

export const videoCharacterService = new VideoCharacterService();

export async function createVideoCharacter(createdById: string, input: CreateVideoCharacterInput) {
    return videoCharacterService.create(createdById, input);
}

export async function listVideoCharacters(createdById: string) {
    return videoCharacterService.list(createdById);
}

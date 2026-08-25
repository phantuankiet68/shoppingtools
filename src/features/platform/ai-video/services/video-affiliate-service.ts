import { prisma } from '@/lib/prisma';

export interface CreateVideoAffiliateInput {
    sourceUrl: string;
    sourcePlatform?: 'TIKTOK' | 'SHOPEE' | 'LAZADA' | 'AMAZON' | 'WEBSITE' | 'OTHER';
}

class VideoAffiliateService {
    async create(createdById: string, input: CreateVideoAffiliateInput) {
        if (!input.sourceUrl.trim()) {
            throw new Error('sourceUrl is required');
        }

        return prisma.videoAffiliate.create({
            data: {
                createdById,
                sourceUrl: input.sourceUrl.trim(),
                sourcePlatform: input.sourcePlatform ?? 'OTHER',
                status: 'DRAFT',
            },
        });
    }

    async list(createdById: string) {
        return prisma.videoAffiliate.findMany({
            where: {
                createdById,
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async get(id: string, createdById: string) {
        return prisma.videoAffiliate.findFirst({
            where: {
                id,
                createdById,
                deletedAt: null,
            },
            include: {
                projects: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
    }

    async update(
        id: string,
        createdById: string,
        data: {
            title?: string;
            description?: string;
            category?: string;
            sourceUrl?: string;
            sourcePlatform?: 'TIKTOK' | 'SHOPEE' | 'LAZADA' | 'AMAZON' | 'WEBSITE' | 'OTHER';
            productImages?: unknown;
            highlights?: unknown;
            analysisJson?: unknown;
        },
    ) {
        const affiliate = await prisma.videoAffiliate.findFirst({
            where: {
                id,
                createdById,
                deletedAt: null,
            },
        });

        if (!affiliate) {
            throw new Error('Video affiliate not found');
        }

        return prisma.videoAffiliate.update({
            where: {
                id: affiliate.id,
            },
            data: {
                ...(data.title !== undefined ? { title: data.title } : {}),

                ...(data.description !== undefined ? { description: data.description } : {}),

                ...(data.category !== undefined ? { category: data.category } : {}),

                ...(data.sourceUrl !== undefined ? { sourceUrl: data.sourceUrl } : {}),

                ...(data.sourcePlatform !== undefined
                    ? {
                          sourcePlatform: data.sourcePlatform,
                      }
                    : {}),

                ...(data.productImages !== undefined
                    ? {
                          productImages: data.productImages as never,
                      }
                    : {}),

                ...(data.highlights !== undefined
                    ? {
                          highlights: data.highlights as never,
                      }
                    : {}),

                ...(data.analysisJson !== undefined
                    ? {
                          analysisJson: data.analysisJson as never,
                      }
                    : {}),
            },
        });
    }

    async delete(id: string, createdById: string) {
        const affiliate = await prisma.videoAffiliate.findFirst({
            where: {
                id,
                createdById,
                deletedAt: null,
            },
        });

        if (!affiliate) {
            throw new Error('Video affiliate not found');
        }

        return prisma.videoAffiliate.update({
            where: {
                id: affiliate.id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }
}

export const videoAffiliateService = new VideoAffiliateService();

export async function createVideoAffiliate(createdById: string, input: CreateVideoAffiliateInput) {
    return videoAffiliateService.create(createdById, input);
}

export async function listVideoAffiliates(createdById: string) {
    return videoAffiliateService.list(createdById);
}

import { NextRequest, NextResponse } from 'next/server';
import { Locale, Prisma, ProjectFeatureCategory, ProjectFeatureStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

type RouteContext = {
    params: Promise<{ id: string }>;
};

type TranslationInput = {
    locale: string;
    title: string;
    description?: unknown;
};

type ImageInput = {
    id?: string;
    image: string;
    sortOrder?: number;
    isPrimary?: boolean;
};

type UpdateProjectFeatureInput = {
    siteId?: string;
    category?: string;
    status?: string;
    developer?: string | null;
    tags?: unknown;
    slug?: string;
    isFeatured?: boolean;
    sortOrder?: number;
    translations?: TranslationInput[];
    images?: ImageInput[];
};

const LOCALES: Locale[] = Object.values(Locale);
const CATEGORIES: ProjectFeatureCategory[] = Object.values(ProjectFeatureCategory);
const STATUSES: ProjectFeatureStatus[] = Object.values(ProjectFeatureStatus);

const featureSelect = {
    id: true,
    siteId: true,
    category: true,
    status: true,
    developer: true,
    tags: true,
    slug: true,
    viewCount: true,
    favoriteCount: true,
    shareCount: true,
    sortOrder: true,
    isFeatured: true,
    createdAt: true,
    updatedAt: true,
    site: {
        select: {
            id: true,
            name: true,
            workspaceId: true,
        },
    },
    translations: {
        orderBy: {
            locale: 'asc',
        },
        select: {
            id: true,
            locale: true,
            title: true,
            description: true,
        },
    },
    images: {
        orderBy: [
            {
                isPrimary: 'desc',
            },
            {
                sortOrder: 'asc',
            },
        ],
        select: {
            id: true,
            featureId: true,
            image: true,
            sortOrder: true,
            isPrimary: true,
        },
    },
} satisfies Prisma.ProjectFeatureSelect;

function jsonError(message: string, status = 400, details?: unknown) {
    return NextResponse.json(
        {
            success: false,
            message,
            ...(details !== undefined ? { details } : {}),
        },
        { status },
    );
}

function isOneOf<T extends string>(value: string, values: readonly T[]): value is T {
    return values.includes(value as T);
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
    if (value === null || value === undefined || value === '') {
        return {};
    }

    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as Prisma.InputJsonValue;
        } catch {
            return value;
        }
    }

    return value as Prisma.InputJsonValue;
}

async function getWorkspace() {
    const session = await getCurrentSession();

    if (!session) {
        return {
            session: null,
            workspaceId: null,
        };
    }

    return {
        session,
        workspaceId: session.currentWorkspace?.id ?? null,
    };
}

async function getProjectFeature(featureId: string, workspaceId: string) {
    return prisma.projectFeature.findFirst({
        where: {
            id: featureId,
            site: {
                workspaceId,
                deletedAt: null,
            },
        },
        select: featureSelect,
    });
}

async function getWorkspaceSite(siteId: string, workspaceId: string) {
    return prisma.site.findFirst({
        where: {
            id: siteId,
            workspaceId,
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            workspaceId: true,
        },
    });
}

function normalizeTranslations(translations: TranslationInput[]) {
    const map = new Map<
        Locale,
        {
            locale: Locale;
            title: string;
            description: Prisma.InputJsonValue;
        }
    >();

    for (const item of translations) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const localeValue = String(item.locale ?? '').trim();

        if (!isOneOf(localeValue, LOCALES)) {
            throw new Error(`Invalid locale: ${localeValue}`);
        }

        const title = String(item.title ?? '').trim();

        if (!title) {
            throw new Error(`Translation title is required for locale: ${localeValue}`);
        }

        map.set(localeValue, {
            locale: localeValue,
            title,
            description: jsonValue(item.description),
        });
    }

    return Array.from(map.values());
}

function normalizeImages(images: ImageInput[]) {
    if (images.length > 5) {
        throw new Error('A project feature can have a maximum of 5 images.');
    }

    const normalized = images
        .filter(
            (item): item is ImageInput =>
                !!item && typeof item === 'object' && typeof item.image === 'string',
        )
        .map((item, index) => ({
            image: item.image.trim(),
            sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index,
            isPrimary: Boolean(item.isPrimary),
        }))
        .filter((item) => item.image.length > 0);

    if (normalized.length === 0) {
        return [];
    }

    const primaryIndex = normalized.findIndex((item) => item.isPrimary);

    return normalized.map((item, index) => ({
        ...item,
        isPrimary: primaryIndex === -1 ? index === 0 : index === primaryIndex,
    }));
}

async function parseBody(request: NextRequest): Promise<UpdateProjectFeatureInput> {
    try {
        const body = await request.json();

        if (!body || typeof body !== 'object') {
            throw new Error('Invalid request body.');
        }

        return body as UpdateProjectFeatureInput;
    } catch {
        throw new Error('Invalid JSON request body.');
    }
}

export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        if (!id) {
            return jsonError('Project feature ID is required.', 400);
        }

        const { session, workspaceId } = await getWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('No active workspace found.', 400);
        }

        const feature = await getProjectFeature(id, workspaceId);

        if (!feature) {
            return jsonError('Project feature not found.', 404);
        }

        return NextResponse.json({
            success: true,
            item: feature,
        });
    } catch (error) {
        console.error('GET /api/admin/project-features/[id] failed:', error);

        return jsonError('Failed to load project feature.', 500);
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        if (!id) {
            return jsonError('Project feature ID is required.', 400);
        }

        const { session, workspaceId } = await getWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('No active workspace found.', 400);
        }

        const existingFeature = await getProjectFeature(id, workspaceId);

        if (!existingFeature) {
            return jsonError('Project feature not found.', 404);
        }

        let body: UpdateProjectFeatureInput;

        try {
            body = await parseBody(request);
        } catch (error) {
            return jsonError(error instanceof Error ? error.message : 'Invalid request body.', 400);
        }

        const data: Prisma.ProjectFeatureUpdateInput = {};

        let nextSiteId = existingFeature.siteId;
        let nextSlug = existingFeature.slug;

        /**
         * Site
         */
        if (body.siteId !== undefined) {
            if (typeof body.siteId !== 'string' || !body.siteId.trim()) {
                return jsonError('siteId must be a valid string.', 400);
            }

            const site = await getWorkspaceSite(body.siteId.trim(), workspaceId);

            if (!site) {
                return jsonError(
                    'Site not found or does not belong to the current workspace.',
                    404,
                );
            }

            nextSiteId = site.id;

            data.site = {
                connect: {
                    id: site.id,
                },
            };
        }

        /**
         * Slug
         */
        if (body.slug !== undefined) {
            if (typeof body.slug !== 'string' || !body.slug.trim()) {
                return jsonError('slug must be a valid string.', 400);
            }

            nextSlug = body.slug.trim();

            data.slug = nextSlug;
        }

        /**
         * Category
         */
        if (body.category !== undefined) {
            if (typeof body.category !== 'string' || !isOneOf(body.category, CATEGORIES)) {
                return jsonError(`Invalid category. Allowed values: ${CATEGORIES.join(', ')}`, 400);
            }

            data.category = body.category;
        }

        /**
         * Status
         */
        if (body.status !== undefined) {
            if (typeof body.status !== 'string' || !isOneOf(body.status, STATUSES)) {
                return jsonError(`Invalid status. Allowed values: ${STATUSES.join(', ')}`, 400);
            }

            data.status = body.status;
        }

        /**
         * Developer
         */
        if (body.developer !== undefined) {
            if (body.developer !== null && typeof body.developer !== 'string') {
                return jsonError('developer must be a string or null.', 400);
            }

            data.developer = body.developer === null ? null : body.developer.trim();
        }

        /**
         * Tags
         */
        if (body.tags !== undefined) {
            if (body.tags === null) {
                data.tags = Prisma.JsonNull;
            } else {
                data.tags = jsonValue(body.tags);
            }
        }

        /**
         * Featured
         */
        if (body.isFeatured !== undefined) {
            if (typeof body.isFeatured !== 'boolean') {
                return jsonError('isFeatured must be a boolean.', 400);
            }

            data.isFeatured = body.isFeatured;
        }

        /**
         * Sort order
         */
        if (body.sortOrder !== undefined) {
            if (typeof body.sortOrder !== 'number' || !Number.isFinite(body.sortOrder)) {
                return jsonError('sortOrder must be a valid number.', 400);
            }

            data.sortOrder = Math.trunc(body.sortOrder);
        }

        /**
         * Validate slug uniqueness whenever either
         * siteId or slug changes.
         */
        if (nextSiteId !== existingFeature.siteId || nextSlug !== existingFeature.slug) {
            const duplicate = await prisma.projectFeature.findFirst({
                where: {
                    siteId: nextSiteId,
                    slug: nextSlug,
                    NOT: {
                        id,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (duplicate) {
                return jsonError(
                    'A project feature with this slug already exists for this site.',
                    409,
                );
            }
        }

        /**
         * Normalize translations only when supplied.
         */
        let translations: ReturnType<typeof normalizeTranslations> | undefined;

        if (body.translations !== undefined) {
            if (!Array.isArray(body.translations)) {
                return jsonError('translations must be an array.', 400);
            }

            try {
                translations = normalizeTranslations(body.translations);
            } catch (error) {
                return jsonError(
                    error instanceof Error ? error.message : 'Invalid translations.',
                    400,
                );
            }
        }

        /**
         * Normalize images only when supplied.
         */
        let images: ReturnType<typeof normalizeImages> | undefined;

        if (body.images !== undefined) {
            if (!Array.isArray(body.images)) {
                return jsonError('images must be an array.', 400);
            }

            try {
                images = normalizeImages(body.images);
            } catch (error) {
                return jsonError(error instanceof Error ? error.message : 'Invalid images.', 400);
            }
        }

        /**
         * Update everything in one transaction.
         */
        const updatedFeature = await prisma.$transaction(async (tx) => {
            if (translations !== undefined) {
                await tx.projectFeatureTranslation.deleteMany({
                    where: {
                        featureId: id,
                    },
                });
            }

            if (images !== undefined) {
                await tx.projectFeatureImage.deleteMany({
                    where: {
                        featureId: id,
                    },
                });
            }

            if (translations !== undefined) {
                if (translations.length > 0) {
                    await tx.projectFeatureTranslation.createMany({
                        data: translations.map((translation) => ({
                            featureId: id,
                            locale: translation.locale,
                            title: translation.title,
                            description: translation.description,
                        })),
                    });
                }
            }

            if (images !== undefined) {
                if (images.length > 0) {
                    await tx.projectFeatureImage.createMany({
                        data: images.map((image) => ({
                            featureId: id,
                            image: image.image,
                            sortOrder: image.sortOrder,
                            isPrimary: image.isPrimary,
                        })),
                    });
                }
            }

            return tx.projectFeature.update({
                where: {
                    id,
                },
                data,
                select: featureSelect,
            });
        });

        return NextResponse.json({
            success: true,
            item: updatedFeature,
            message: 'Project feature updated successfully.',
        });
    } catch (error) {
        console.error('PATCH /api/admin/project-features/[id] failed:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return jsonError(
                    'A project feature with the same slug already exists for this site.',
                    409,
                );
            }

            if (error.code === 'P2025') {
                return jsonError('Project feature not found.', 404);
            }
        }

        return jsonError('Failed to update project feature.', 500);
    }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        if (!id) {
            return jsonError('Project feature ID is required.', 400);
        }

        const { session, workspaceId } = await getWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('No active workspace found.', 400);
        }

        const existingFeature = await getProjectFeature(id, workspaceId);

        if (!existingFeature) {
            return jsonError('Project feature not found.', 404);
        }

        await prisma.projectFeature.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Project feature deleted successfully.',
        });
    } catch (error) {
        console.error('DELETE /api/admin/project-features/[id] failed:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return jsonError('Project feature not found.', 404);
            }
        }

        return jsonError('Failed to delete project feature.', 500);
    }
}

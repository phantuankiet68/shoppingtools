import { ContentStatus, Prisma } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    getWorkspaceId,
    jsonError,
    normalizeBoolean,
    normalizeInteger,
    normalizeString,
    normalizeTranslations,
    verifySite,
} from '../../_shared';

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type TranslationInput = Prisma.WikiCategoryTranslationCreateWithoutCategoryInput;

const STATUSES = Object.values(ContentStatus);

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return jsonError('Unauthorized.', 401);
        }

        const { id } = await context.params;

        if (!id) {
            return jsonError('Wiki category id is required.');
        }

        const category = await prisma.wikiCategory.findFirst({
            where: {
                id,
                site: {
                    workspaceId,
                    deletedAt: null,
                },
            },
            include: {
                translations: true,
                _count: {
                    select: {
                        posts: true,
                    },
                },
            },
        });

        if (!category) {
            return jsonError('Wiki category not found.', 404);
        }

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error('[GET /api/admin/blog/wiki/:id]', error);

        return jsonError('Failed to load wiki category.', 500);
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return jsonError('Unauthorized.', 401);
        }

        const { id } = await context.params;

        if (!id) {
            return jsonError('Wiki category id is required.');
        }

        const existing = await prisma.wikiCategory.findFirst({
            where: {
                id,
                site: {
                    workspaceId,
                    deletedAt: null,
                },
            },
            select: {
                id: true,
                siteId: true,
            },
        });

        if (!existing) {
            return jsonError('Wiki category not found.', 404);
        }

        let body: Record<string, unknown>;

        try {
            body = await request.json();
        } catch {
            return jsonError('Invalid JSON body.');
        }

        const siteIdProvided = Object.prototype.hasOwnProperty.call(body, 'siteId');

        const siteId = siteIdProvided ? normalizeString(body.siteId) : existing.siteId;

        if (!siteId) {
            return jsonError('Site id is required.');
        }

        if (siteId !== existing.siteId) {
            const site = await verifySite(siteId, workspaceId);

            if (!site) {
                return jsonError('Site not found.', 404);
            }
        }

        const translationsProvided = Object.prototype.hasOwnProperty.call(body, 'translations');

        let translations: TranslationInput[] | undefined;

        if (translationsProvided) {
            const normalizedTranslations = normalizeTranslations(body.translations);

            if (!normalizedTranslations?.length) {
                return jsonError('At least one valid translation is required.');
            }

            translations = normalizedTranslations as TranslationInput[];
        }

        let status: ContentStatus | undefined;

        if (body.status !== undefined) {
            const value = String(body.status);

            if (!STATUSES.includes(value as ContentStatus)) {
                return jsonError('Invalid status.');
            }

            status = value as ContentStatus;
        }

        let slug: string | undefined;

        if (body.slug !== undefined) {
            const normalizedSlug = normalizeString(body.slug);

            if (!normalizedSlug) {
                return jsonError('Slug is required.');
            }

            slug = normalizedSlug;
        }

        const updated = await prisma.$transaction(async (tx) => {
            if (translations !== undefined) {
                await tx.wikiCategoryTranslation.deleteMany({
                    where: {
                        categoryId: id,
                    },
                });
            }

            return tx.wikiCategory.update({
                where: {
                    id,
                },
                data: {
                    ...(siteIdProvided
                        ? {
                              site: {
                                  connect: {
                                      id: siteId,
                                  },
                              },
                          }
                        : {}),

                    ...(slug !== undefined
                        ? {
                              slug,
                          }
                        : {}),

                    ...(body.icon !== undefined
                        ? {
                              icon: typeof body.icon === 'string' ? body.icon.trim() || null : null,
                          }
                        : {}),

                    ...(status !== undefined
                        ? {
                              status,
                          }
                        : {}),

                    ...(body.sortOrder !== undefined
                        ? {
                              sortOrder: normalizeInteger(body.sortOrder, 0) ?? 0,
                          }
                        : {}),

                    ...(body.isFeatured !== undefined
                        ? {
                              isFeatured: normalizeBoolean(body.isFeatured),
                          }
                        : {}),

                    ...(body.isVisible !== undefined
                        ? {
                              isVisible: normalizeBoolean(body.isVisible, true),
                          }
                        : {}),

                    ...(translations !== undefined
                        ? {
                              translations: {
                                  create: translations,
                              },
                          }
                        : {}),
                },
                include: {
                    translations: true,
                    _count: {
                        select: {
                            posts: true,
                        },
                    },
                },
            });
        });

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error('[PATCH /api/admin/blog/wiki/:id]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return jsonError('A wiki category with the same slug already exists.', 409);
            }

            if (error.code === 'P2025') {
                return jsonError('Wiki category not found.', 404);
            }
        }

        return jsonError(
            error instanceof Error ? error.message : 'Failed to update wiki category.',
            500,
        );
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return jsonError('Unauthorized.', 401);
        }

        const { id } = await context.params;

        if (!id) {
            return jsonError('Wiki category id is required.');
        }

        const category = await prisma.wikiCategory.findFirst({
            where: {
                id,
                site: {
                    workspaceId,
                    deletedAt: null,
                },
            },
            select: {
                id: true,
                _count: {
                    select: {
                        posts: true,
                    },
                },
            },
        });

        if (!category) {
            return jsonError('Wiki category not found.', 404);
        }

        if (category._count.posts > 0) {
            return jsonError('Cannot delete a wiki category that contains blog posts.', 409);
        }

        await prisma.wikiCategory.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Wiki category deleted successfully.',
        });
    } catch (error) {
        console.error('[DELETE /api/admin/blog/wiki/:id]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return jsonError('Wiki category not found.', 404);
            }
        }

        return jsonError('Failed to delete wiki category.', 500);
    }
}

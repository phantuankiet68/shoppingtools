import { ContentStatus, Prisma } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    getWorkspaceId,
    jsonError,
    normalizeBoolean,
    normalizeDate,
    normalizeInteger,
    normalizeNullableString,
    normalizePostTranslations,
    normalizeString,
    normalizeTagIds,
    POST_INCLUDE,
    verifyBlogCategory,
    verifySite,
    verifyTag,
    verifyWikiCategory,
} from '../_shared';

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

const STATUSES = Object.values(ContentStatus);

const hasOwn = (object: Record<string, unknown>, key: string): boolean => {
    return Object.prototype.hasOwnProperty.call(object, key);
};

const normalizeNullableStringValue = (value: unknown): string | null => {
    return normalizeNullableString(value) ?? null;
};

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return jsonError('Unauthorized.', 401);
        }

        const { id } = await context.params;

        if (!id) {
            return jsonError('Blog post id is required.');
        }

        const { searchParams } = new URL(request.url);

        const locale = searchParams.get('locale');

        const post = await prisma.blogPost.findFirst({
            where: {
                id,
                site: {
                    workspaceId,
                    deletedAt: null,
                },
            },
            include: POST_INCLUDE,
        });

        if (!post) {
            return jsonError('Blog post not found.', 404);
        }

        const data = locale
            ? {
                  ...post,
                  translations: post.translations.filter(
                      (translation) => translation.locale === locale,
                  ),
              }
            : post;

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('[GET /api/admin/blog/:id]', error);

        return jsonError('Failed to load blog post.', 500);
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
            return jsonError('Blog post id is required.');
        }

        let body: Record<string, unknown>;

        try {
            body = await request.json();
        } catch {
            return jsonError('Invalid JSON body.');
        }

        const existing = await prisma.blogPost.findFirst({
            where: {
                id,
                site: {
                    workspaceId,
                    deletedAt: null,
                },
            },
            include: {
                tags: {
                    select: {
                        tagId: true,
                    },
                },
            },
        });

        if (!existing) {
            return jsonError('Blog post not found.', 404);
        }

        /**
         * Site
         */
        const siteId = body.siteId !== undefined ? normalizeString(body.siteId) : existing.siteId;

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        if (siteId !== existing.siteId && !(await verifySite(siteId, workspaceId))) {
            return jsonError('Site not found.', 404);
        }

        /**
         * Categories
         */
        const categoryProvided = hasOwn(body, 'categoryId');

        const wikiCategoryProvided = hasOwn(body, 'wikiCategoryId');

        let categoryId = existing.categoryId;
        let wikiCategoryId = existing.wikiCategoryId;

        if (categoryProvided) {
            categoryId = normalizeString(body.categoryId) ?? null;
        }

        if (wikiCategoryProvided) {
            wikiCategoryId = normalizeString(body.wikiCategoryId) ?? null;
        }

        if (categoryProvided || wikiCategoryProvided) {
            const hasBlogCategory = Boolean(categoryId);

            const hasWikiCategory = Boolean(wikiCategoryId);

            if (hasBlogCategory === hasWikiCategory) {
                return jsonError('Exactly one of categoryId or wikiCategoryId is required.');
            }
        }

        if (
            categoryId &&
            (categoryProvided || siteId !== existing.siteId || categoryId !== existing.categoryId)
        ) {
            const category = await verifyBlogCategory(categoryId, siteId, workspaceId);

            if (!category) {
                return jsonError('Blog category not found.', 404);
            }
        }

        if (
            wikiCategoryId &&
            (wikiCategoryProvided ||
                siteId !== existing.siteId ||
                wikiCategoryId !== existing.wikiCategoryId)
        ) {
            const wikiCategory = await verifyWikiCategory(wikiCategoryId, siteId, workspaceId);

            if (!wikiCategory) {
                return jsonError('Wiki category not found.', 404);
            }
        }

        const translationsProvided = hasOwn(body, 'translations');

        const translations = translationsProvided
            ? normalizePostTranslations(body.translations)
            : null;

        if (translationsProvided && !translations?.length) {
            return jsonError('At least one valid translation is required.');
        }

        /**
         * Tags
         */
        const tagsProvided = hasOwn(body, 'tagIds');

        const nextTagIds = tagsProvided ? normalizeTagIds(body.tagIds) : null;

        if (nextTagIds) {
            for (const tagId of nextTagIds) {
                const tag = await verifyTag(tagId, siteId, workspaceId);

                if (!tag) {
                    return jsonError(`Tag not found: ${tagId}`, 404);
                }
            }
        }

        let status = existing.status;

        if (body.status !== undefined) {
            const nextStatus = String(body.status);

            if (!STATUSES.includes(nextStatus as ContentStatus)) {
                return jsonError('Invalid status.');
            }

            status = nextStatus as ContentStatus;
        }

        /**
         * Update
         */
        const updated = await prisma.$transaction(async (tx) => {
            const oldTagIds = existing.tags.map((tag) => tag.tagId);

            /**
             * Replace translations only
             * when translations was provided.
             */
            if (translations) {
                await tx.blogPostTranslation.deleteMany({
                    where: {
                        postId: id,
                    },
                });
            }

            /**
             * Replace tags only when
             * tagIds was provided.
             */
            if (nextTagIds) {
                await tx.blogPostTag.deleteMany({
                    where: {
                        postId: id,
                    },
                });
            }

            const post = await tx.blogPost.update({
                where: {
                    id,
                },

                data: {
                    ...(body.siteId !== undefined
                        ? {
                              siteId,
                          }
                        : {}),

                    ...(categoryProvided || wikiCategoryProvided
                        ? {
                              categoryId,
                              wikiCategoryId,
                          }
                        : {}),

                    ...(body.authorId !== undefined
                        ? {
                              authorId: normalizeNullableStringValue(body.authorId),
                          }
                        : {}),

                    ...(body.status !== undefined
                        ? {
                              status,
                          }
                        : {}),

                    ...(body.featured !== undefined
                        ? {
                              featured: normalizeBoolean(body.featured),
                          }
                        : {}),

                    ...(body.allowComments !== undefined
                        ? {
                              allowComments: normalizeBoolean(body.allowComments, true),
                          }
                        : {}),

                    ...(body.thumbnail !== undefined
                        ? {
                              thumbnail: normalizeNullableStringValue(body.thumbnail),
                          }
                        : {}),

                    ...(body.coverImage !== undefined
                        ? {
                              coverImage: normalizeNullableStringValue(body.coverImage),
                          }
                        : {}),

                    ...(body.readingTime !== undefined
                        ? {
                              readingTime: normalizeInteger(body.readingTime),
                          }
                        : {}),

                    ...(body.wordCount !== undefined
                        ? {
                              wordCount: normalizeInteger(body.wordCount),
                          }
                        : {}),

                    ...(body.publishedAt !== undefined
                        ? {
                              publishedAt: normalizeDate(body.publishedAt),
                          }
                        : {}),

                    ...(translations
                        ? {
                              translations: {
                                  create: translations,
                              },
                          }
                        : {}),

                    ...(nextTagIds
                        ? {
                              tags: {
                                  create: nextTagIds.map((tagId) => ({
                                      tagId,
                                  })),
                              },
                          }
                        : {}),
                },

                include: POST_INCLUDE,
            });

            /**
             * Keep BlogTag.usageCount
             * synchronized.
             */
            if (nextTagIds) {
                const oldTagSet = new Set(oldTagIds);

                const newTagSet = new Set(nextTagIds);

                const removedTagIds = oldTagIds.filter((tagId) => !newTagSet.has(tagId));

                const addedTagIds = nextTagIds.filter((tagId) => !oldTagSet.has(tagId));

                if (removedTagIds.length) {
                    await tx.blogTag.updateMany({
                        where: {
                            id: {
                                in: removedTagIds,
                            },
                            usageCount: {
                                gt: 0,
                            },
                        },
                        data: {
                            usageCount: {
                                decrement: 1,
                            },
                        },
                    });
                }

                if (addedTagIds.length) {
                    await tx.blogTag.updateMany({
                        where: {
                            id: {
                                in: addedTagIds,
                            },
                        },
                        data: {
                            usageCount: {
                                increment: 1,
                            },
                        },
                    });
                }
            }

            return post;
        });

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error('[PATCH /api/admin/blog/:id]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return jsonError('A translation with the same slug already exists.', 409);
            }

            if (error.code === 'P2025') {
                return jsonError('Blog post not found.', 404);
            }
        }

        return jsonError(
            error instanceof Error ? error.message : 'Failed to update blog post.',
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
            return jsonError('Blog post id is required.');
        }

        const existing = await prisma.blogPost.findFirst({
            where: {
                id,
                site: {
                    workspaceId,
                    deletedAt: null,
                },
            },
            select: {
                id: true,
                tags: {
                    select: {
                        tagId: true,
                    },
                },
            },
        });

        if (!existing) {
            return jsonError('Blog post not found.', 404);
        }

        await prisma.$transaction(async (tx) => {
            const tagIds = existing.tags.map((tag) => tag.tagId);

            await tx.blogPost.delete({
                where: {
                    id,
                },
            });

            if (tagIds.length) {
                await tx.blogTag.updateMany({
                    where: {
                        id: {
                            in: tagIds,
                        },
                        usageCount: {
                            gt: 0,
                        },
                    },
                    data: {
                        usageCount: {
                            decrement: 1,
                        },
                    },
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Blog post deleted successfully.',
        });
    } catch (error) {
        console.error('[DELETE /api/admin/blog/:id]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return jsonError('Blog post not found.', 404);
            }
        }

        return jsonError('Failed to delete blog post.', 500);
    }
}

import { Prisma } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    getWorkspaceId,
    jsonError,
    normalizeInteger,
    normalizeNullableString,
    normalizeString,
    verifySite,
} from '../../_shared';

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return jsonError('Unauthorized.', 401);
        }

        const { id } = await context.params;

        if (!id) {
            return jsonError('Tag id is required.');
        }

        const tag = await prisma.blogTag.findFirst({
            where: {
                id,
                site: {
                    workspaceId,
                    deletedAt: null,
                },
            },
            include: {
                _count: {
                    select: {
                        posts: true,
                    },
                },
            },
        });

        if (!tag) {
            return jsonError('Blog tag not found.', 404);
        }

        return NextResponse.json({
            success: true,
            data: tag,
        });
    } catch (error) {
        console.error('[GET /api/admin/blog/tags/:id]', error);

        return jsonError('Failed to load blog tag.', 500);
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
            return jsonError('Tag id is required.');
        }

        const existing = await prisma.blogTag.findFirst({
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
            return jsonError('Blog tag not found.', 404);
        }

        let body: Record<string, unknown>;

        try {
            body = await request.json();
        } catch {
            return jsonError('Invalid JSON body.');
        }

        let siteId = existing.siteId;

        if (body.siteId !== undefined) {
            siteId = normalizeString(body.siteId) ?? existing.siteId;

            if (siteId !== existing.siteId && !(await verifySite(siteId, workspaceId))) {
                return jsonError('Site not found.', 404);
            }
        }

        const updated = await prisma.$transaction(async (tx) => {
            return tx.blogTag.update({
                where: {
                    id,
                },

                data: {
                    ...(body.siteId !== undefined
                        ? {
                              siteId,
                          }
                        : {}),

                    ...(body.slug !== undefined
                        ? {
                              slug: normalizeString(body.slug) ?? '',
                          }
                        : {}),

                    ...(body.name !== undefined
                        ? {
                              name: normalizeString(body.name) ?? '',
                          }
                        : {}),

                    ...(body.description !== undefined
                        ? {
                              description: normalizeNullableString(body.description),
                          }
                        : {}),

                    ...(body.icon !== undefined
                        ? {
                              icon: normalizeNullableString(body.icon),
                          }
                        : {}),

                    ...(body.color !== undefined
                        ? {
                              color: normalizeNullableString(body.color),
                          }
                        : {}),

                    ...(body.usageCount !== undefined
                        ? {
                              usageCount: Math.max(0, normalizeInteger(body.usageCount, 0) ?? 0),
                          }
                        : {}),
                },

                include: {
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
        console.error('[PATCH /api/admin/blog/tags/:id]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return jsonError('A blog tag with the same slug already exists.', 409);
            }

            if (error.code === 'P2025') {
                return jsonError('Blog tag not found.', 404);
            }
        }

        return jsonError(
            error instanceof Error ? error.message : 'Failed to update blog tag.',
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
            return jsonError('Tag id is required.');
        }

        const tag = await prisma.blogTag.findFirst({
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

        if (!tag) {
            return jsonError('Blog tag not found.', 404);
        }

        if (tag._count.posts > 0) {
            return jsonError('Cannot delete a blog tag that is being used by blog posts.', 409);
        }

        await prisma.blogTag.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Blog tag deleted successfully.',
        });
    } catch (error) {
        console.error('[DELETE /api/admin/blog/tags/:id]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return jsonError('Blog tag not found.', 404);
            }
        }

        return jsonError('Failed to delete blog tag.', 500);
    }
}

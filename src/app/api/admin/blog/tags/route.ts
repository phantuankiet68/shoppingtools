import { Prisma } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    getWorkspaceId,
    jsonError,
    normalizeInteger,
    normalizeNullableString,
    normalizeString,
    parseLimit,
    parsePage,
    verifySite,
} from '../_shared';

export async function GET(request: NextRequest) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return jsonError('Unauthorized.', 401);
        }

        const { searchParams } = new URL(request.url);

        const siteId = normalizeString(searchParams.get('siteId'));
        const search = normalizeString(searchParams.get('search'));

        const page = parsePage(searchParams.get('page'));
        const limit = parseLimit(searchParams.get('limit'));

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        if (!(await verifySite(siteId, workspaceId))) {
            return jsonError('Site not found.', 404);
        }

        const where: Prisma.BlogTagWhereInput = {
            siteId,

            ...(search
                ? {
                      OR: [
                          {
                              name: {
                                  contains: search,
                                  mode: 'insensitive',
                              },
                          },
                          {
                              slug: {
                                  contains: search,
                                  mode: 'insensitive',
                              },
                          },
                          {
                              description: {
                                  contains: search,
                                  mode: 'insensitive',
                              },
                          },
                      ],
                  }
                : {}),
        };

        const skip = (page - 1) * limit;

        const [tags, total] = await prisma.$transaction([
            prisma.blogTag.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    {
                        usageCount: 'desc',
                    },
                    {
                        name: 'asc',
                    },
                ],
                include: {
                    _count: {
                        select: {
                            posts: true,
                        },
                    },
                },
            }),

            prisma.blogTag.count({
                where,
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: tags,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('[GET /api/admin/blog/tags]', error);

        return jsonError('Failed to load blog tags.', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return jsonError('Unauthorized.', 401);
        }

        let body: Record<string, unknown>;

        try {
            body = await request.json();
        } catch {
            return jsonError('Invalid JSON body.');
        }

        const siteId = normalizeString(body.siteId);
        const slug = normalizeString(body.slug);
        const name = normalizeString(body.name);

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        if (!slug) {
            return jsonError('slug is required.');
        }

        if (!name) {
            return jsonError('name is required.');
        }

        if (!(await verifySite(siteId, workspaceId))) {
            return jsonError('Site not found.', 404);
        }

        const tag = await prisma.blogTag.create({
            data: {
                siteId,
                slug,
                name,

                description: normalizeNullableString(body.description),

                icon: normalizeNullableString(body.icon),

                color: normalizeNullableString(body.color),

                usageCount: normalizeInteger(body.usageCount, 0) ?? 0,
            },

            include: {
                _count: {
                    select: {
                        posts: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: tag,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('[POST /api/admin/blog/tags]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return jsonError('A blog tag with the same slug already exists.', 409);
            }
        }

        return jsonError(
            error instanceof Error ? error.message : 'Failed to create blog tag.',
            500,
        );
    }
}

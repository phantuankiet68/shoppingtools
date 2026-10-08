import { ContentStatus, Prisma } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    getWorkspaceId,
    isLocale,
    jsonError,
    normalizeBoolean,
    normalizeInteger,
    normalizeString,
    normalizeTranslations,
    parseLimit,
    parsePage,
    verifySite,
} from '../_shared';

const STATUSES = Object.values(ContentStatus);

export async function GET(request: NextRequest) {
    try {
        const workspaceId = await getWorkspaceId();

        if (!workspaceId) {
            return jsonError('Unauthorized.', 401);
        }

        const { searchParams } = new URL(request.url);

        const siteId = normalizeString(searchParams.get('siteId'));

        const localeParam = searchParams.get('locale');

        const statusParam = searchParams.get('status');

        const search = normalizeString(searchParams.get('search'));

        const visibleParam = searchParams.get('visible');

        const featuredParam = searchParams.get('featured');

        const page = parsePage(searchParams.get('page'));

        const limit = parseLimit(searchParams.get('limit'));

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        if (localeParam && !isLocale(localeParam)) {
            return jsonError('Invalid locale.');
        }

        if (statusParam && !STATUSES.includes(statusParam as ContentStatus)) {
            return jsonError('Invalid status.');
        }

        if (!(await verifySite(siteId, workspaceId))) {
            return jsonError('Site not found.', 404);
        }

        const locale = isLocale(localeParam) ? localeParam : undefined;

        const where: Prisma.BlogCategoryWhereInput = {
            siteId,

            ...(statusParam
                ? {
                      status: statusParam as ContentStatus,
                  }
                : {}),

            ...(visibleParam === 'true' || visibleParam === 'false'
                ? {
                      isVisible: visibleParam === 'true',
                  }
                : {}),

            ...(featuredParam === 'true' || featuredParam === 'false'
                ? {
                      isFeatured: featuredParam === 'true',
                  }
                : {}),

            ...(search
                ? {
                      OR: [
                          {
                              slug: {
                                  contains: search,
                                  mode: 'insensitive',
                              },
                          },
                          {
                              translations: {
                                  some: {
                                      name: {
                                          contains: search,
                                          mode: 'insensitive',
                                      },
                                  },
                              },
                          },
                      ],
                  }
                : {}),
        };

        const skip = (page - 1) * limit;

        const [categories, total] = await prisma.$transaction([
            prisma.blogCategory.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    {
                        sortOrder: 'asc',
                    },
                    {
                        createdAt: 'desc',
                    },
                ],
                include: {
                    translations: locale
                        ? {
                              where: {
                                  locale,
                              },
                          }
                        : true,
                    _count: {
                        select: {
                            posts: true,
                        },
                    },
                },
            }),

            prisma.blogCategory.count({
                where,
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: categories,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('[GET /api/admin/blog/categories]', error);

        return jsonError('Failed to load blog categories.', 500);
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

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        if (!slug) {
            return jsonError('slug is required.');
        }

        if (!(await verifySite(siteId, workspaceId))) {
            return jsonError('Site not found.', 404);
        }

        const translations = normalizeTranslations(body.translations);

        if (!translations?.length) {
            return jsonError('At least one valid translation is required.');
        }

        const status = body.status === undefined ? ContentStatus.DRAFT : String(body.status);

        if (!STATUSES.includes(status as ContentStatus)) {
            return jsonError('Invalid status.');
        }

        const category = await prisma.blogCategory.create({
            data: {
                siteId,
                slug,

                icon: typeof body.icon === 'string' ? body.icon.trim() || null : null,

                status: status as ContentStatus,

                sortOrder: normalizeInteger(body.sortOrder, 0) ?? 0,

                isFeatured: normalizeBoolean(body.isFeatured),

                isVisible: normalizeBoolean(body.isVisible, true),

                translations: {
                    create: translations,
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

        return NextResponse.json(
            {
                success: true,
                data: category,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('[POST /api/admin/blog/categories]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return jsonError('A blog category with the same slug already exists.', 409);
            }
        }

        return jsonError(
            error instanceof Error ? error.message : 'Failed to create blog category.',
            500,
        );
    }
}

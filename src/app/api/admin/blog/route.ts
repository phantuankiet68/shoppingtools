import { ContentStatus, Locale, Prisma } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    getWorkspaceId,
    isLocale,
    jsonError,
    normalizeBoolean,
    normalizeDate,
    normalizeInteger,
    normalizeNullableString,
    normalizePostTranslations,
    normalizeString,
    normalizeTagIds,
    parseLimit,
    parsePage,
    POST_INCLUDE,
    verifyBlogCategory,
    verifySite,
    verifyTag,
    verifyWikiCategory,
} from './_shared';

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
        const categoryId = normalizeString(searchParams.get('categoryId'));
        const wikiCategoryId = normalizeString(searchParams.get('wikiCategoryId'));
        const tagId = normalizeString(searchParams.get('tagId'));
        const search = normalizeString(searchParams.get('search'));
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

        if (categoryId && wikiCategoryId) {
            return jsonError('categoryId and wikiCategoryId cannot be used together.');
        }

        if (!(await verifySite(siteId, workspaceId))) {
            return jsonError('Site not found.', 404);
        }

        const locale = isLocale(localeParam) ? localeParam : Locale.en;

        const where: Prisma.BlogPostWhereInput = {
            siteId,

            ...(statusParam
                ? {
                      status: statusParam as ContentStatus,
                  }
                : {}),

            ...(categoryId
                ? {
                      categoryId,
                  }
                : {}),

            ...(wikiCategoryId
                ? {
                      wikiCategoryId,
                  }
                : {}),

            ...(tagId
                ? {
                      tags: {
                          some: {
                              tagId,
                          },
                      },
                  }
                : {}),

            ...(featuredParam === 'true' || featuredParam === 'false'
                ? {
                      featured: featuredParam === 'true',
                  }
                : {}),

            ...(search
                ? {
                      OR: [
                          {
                              translations: {
                                  some: {
                                      title: {
                                          contains: search,
                                          mode: 'insensitive',
                                      },
                                  },
                              },
                          },
                          {
                              translations: {
                                  some: {
                                      slug: {
                                          contains: search,
                                          mode: 'insensitive',
                                      },
                                  },
                              },
                          },
                          {
                              translations: {
                                  some: {
                                      excerpt: {
                                          contains: search,
                                          mode: 'insensitive',
                                      },
                                  },
                              },
                          },
                          {
                              tags: {
                                  some: {
                                      tag: {
                                          name: {
                                              contains: search,
                                              mode: 'insensitive',
                                          },
                                      },
                                  },
                              },
                          },
                      ],
                  }
                : {}),
        };

        const skip = (page - 1) * limit;

        const [posts, total] = await prisma.$transaction([
            prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
                include: {
                    category: {
                        include: {
                            translations: {
                                where: { locale },
                                select: {
                                    locale: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    wikiCategory: {
                        include: {
                            translations: {
                                where: { locale },
                                select: {
                                    locale: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    translations: {
                        include: {
                            seo: true,
                        },
                        orderBy: {
                            locale: 'asc',
                        },
                    },
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            }),
            prisma.blogPost.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            locale,
        });
    } catch (error) {
        console.error('[GET /api/admin/blog]', error);

        return jsonError('Failed to load blog posts.', 500);
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

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        if (!(await verifySite(siteId, workspaceId))) {
            return jsonError('Site not found.', 404);
        }

        const categoryId = normalizeString(body.categoryId) || null;

        const wikiCategoryId = normalizeString(body.wikiCategoryId) || null;

        if ((categoryId && wikiCategoryId) || (!categoryId && !wikiCategoryId)) {
            return jsonError('Exactly one of categoryId or wikiCategoryId is required.');
        }

        if (categoryId && !(await verifyBlogCategory(categoryId, siteId, workspaceId))) {
            return jsonError('Blog category not found.', 404);
        }

        if (wikiCategoryId && !(await verifyWikiCategory(wikiCategoryId, siteId, workspaceId))) {
            return jsonError('Wiki category not found.', 404);
        }

        const translations = normalizePostTranslations(body.translations);

        if (!translations?.length) {
            return jsonError('At least one valid translation is required.');
        }

        const tagIds = normalizeTagIds(body.tagIds);

        for (const tagId of tagIds) {
            if (!(await verifyTag(tagId, siteId, workspaceId))) {
                return jsonError(`Tag not found: ${tagId}`, 404);
            }
        }

        const status = body.status === undefined ? ContentStatus.DRAFT : String(body.status);

        if (!STATUSES.includes(status as ContentStatus)) {
            return jsonError('Invalid status.');
        }

        const post = await prisma.blogPost.create({
            data: {
                siteId,
                categoryId,
                wikiCategoryId,

                authorId: normalizeNullableString(body.authorId),

                status: status as ContentStatus,

                featured: normalizeBoolean(body.featured),

                allowComments: normalizeBoolean(body.allowComments, true),

                thumbnail: normalizeNullableString(body.thumbnail),

                coverImage: normalizeNullableString(body.coverImage),

                readingTime: normalizeInteger(body.readingTime),

                wordCount: normalizeInteger(body.wordCount),

                publishedAt: normalizeDate(body.publishedAt),

                translations: {
                    create: translations.map((translation) => ({
                        locale: translation.locale,
                        title: translation.title,
                        slug: translation.slug,
                        subtitle: translation.subtitle,
                        excerpt: translation.excerpt,
                        content: translation.content,
                        toc: translation.toc,
                        keywords: translation.keywords,
                        searchTerms: translation.searchTerms,
                        synonyms: translation.synonyms,

                        ...(translation.seo
                            ? {
                                  seo: {
                                      create: translation.seo,
                                  },
                              }
                            : {}),
                    })),
                },

                ...(tagIds.length
                    ? {
                          tags: {
                              create: tagIds.map((tagId) => ({
                                  tagId,
                              })),
                          },
                      }
                    : {}),
            },

            include: POST_INCLUDE,
        });

        if (tagIds.length) {
            await prisma.blogTag.updateMany({
                where: {
                    id: {
                        in: tagIds,
                    },
                },
                data: {
                    usageCount: {
                        increment: 1,
                    },
                },
            });
        }

        return NextResponse.json(
            {
                success: true,
                data: post,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('[POST /api/admin/blog]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return jsonError('A blog post with the same slug already exists.', 409);
            }
        }

        return jsonError(
            error instanceof Error ? error.message : 'Failed to create blog post.',
            500,
        );
    }
}

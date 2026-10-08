import { NextRequest, NextResponse } from 'next/server';
import { ContentStatus, Locale, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';

function error(message: string, status = 400) {
    return NextResponse.json({ success: false, message }, { status });
}

function trimString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const result = value.trim();
    return result || null;
}

function createSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function isLocale(value: unknown): value is Locale {
    return value === Locale.vi || value === Locale.en || value === Locale.ja;
}

function isStatus(value: unknown): value is ContentStatus {
    return (
        value === ContentStatus.DRAFT ||
        value === ContentStatus.REVIEW ||
        value === ContentStatus.PUBLISHED ||
        value === ContentStatus.ARCHIVED
    );
}

function toJson(value: unknown): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
    if (value === undefined || value === null) return Prisma.JsonNull;

    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as Prisma.InputJsonValue;
        } catch {
            return Prisma.JsonNull;
        }
    }

    return value as Prisma.InputJsonValue;
}

function toBoolean(value: unknown, defaultValue = false): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        if (value === 'true') return true;
        if (value === 'false') return false;
    }
    return defaultValue;
}

function toOptionalInt(value: unknown): number | null {
    if (value === undefined || value === null || value === '') return null;

    const numberValue = typeof value === 'number' ? value : Number(value);

    if (!Number.isInteger(numberValue) || numberValue < 0) return null;

    return numberValue;
}

function toDate(value: unknown): Date | null {
    if (!value) return null;

    const date = new Date(String(value));

    return Number.isNaN(date.getTime()) ? null : date;
}

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type SeoInput = {
    title?: unknown;
    description?: unknown;
    focusKeyword?: unknown;
    keywords?: unknown;
    synonyms?: unknown;
    canonicalUrl?: unknown;
    noIndex?: unknown;
    noFollow?: unknown;
    noArchive?: unknown;
    schemaType?: unknown;
    schemaJson?: unknown;
    searchPreviewEnabled?: unknown;
};

type TranslationInput = {
    locale: Locale;
    title: string;
    slug?: string | null;
    subtitle?: string | null;
    excerpt?: string | null;
    content: string;
    toc?: unknown;
    keywords?: unknown;
    searchTerms?: unknown;
    synonyms?: unknown;
    seo?: SeoInput | null;
};

async function getPost(id: string, siteId?: string | null) {
    return prisma.blogPost.findFirst({
        where: {
            id,
            ...(siteId && { siteId }),
        },
        include: {
            category: {
                include: {
                    translations: true,
                },
            },
            wikiCategory: {
                include: {
                    translations: true,
                },
            },
            translations: {
                include: {
                    seo: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const customer = await getCustomerContextFromRequest(request);

        if (!customer) return error('Unauthorized', 401);

        const { id } = await context.params;

        if (!id) return error('Blog post id is required', 400);

        const { searchParams } = new URL(request.url);
        const siteId = trimString(searchParams.get('siteId'));
        const localeParam = trimString(searchParams.get('locale'));

        let locale: Locale | undefined;

        if (localeParam) {
            if (!isLocale(localeParam)) {
                return error(`Invalid locale: ${localeParam}`, 400);
            }

            locale = localeParam;
        }

        const post = await prisma.blogPost.findFirst({
            where: {
                id,
                ...(siteId && { siteId }),
            },
            include: {
                category: {
                    include: {
                        translations: true,
                    },
                },
                wikiCategory: {
                    include: {
                        translations: true,
                    },
                },
                translations: {
                    ...(locale && {
                        where: { locale },
                    }),
                    include: {
                        seo: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!post) return error('Blog post not found', 404);

        return NextResponse.json({
            success: true,
            data: post,
        });
    } catch (err) {
        console.error('GET /api/v1/blog/[id] error:', err);
        return error('Failed to fetch blog post', 500);
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const customer = await getCustomerContextFromRequest(request);

        if (!customer) return error('Unauthorized', 401);

        const { id } = await context.params;

        if (!id) return error('Blog post id is required', 400);

        const existingPost = await prisma.blogPost.findFirst({
            where: { id },
            select: {
                id: true,
                siteId: true,
                categoryId: true,
                wikiCategoryId: true,
            },
        });

        if (!existingPost) return error('Blog post not found', 404);

        let body: Record<string, unknown>;

        try {
            body = await request.json();
        } catch {
            return error('Invalid JSON body', 400);
        }

        const siteId = trimString(body.siteId) ?? existingPost.siteId;
        const categoryId = trimString(body.categoryId);
        const wikiCategoryId = trimString(body.wikiCategoryId);

        if (categoryId && wikiCategoryId) {
            return error('A post cannot have both categoryId and wikiCategoryId', 400);
        }

        if (categoryId) {
            const category = await prisma.blogCategory.findFirst({
                where: {
                    id: categoryId,
                    siteId,
                },
                select: { id: true },
            });

            if (!category) {
                return error('Blog category not found for this site', 404);
            }
        }

        if (wikiCategoryId) {
            const wikiCategory = await prisma.wikiCategory.findFirst({
                where: {
                    id: wikiCategoryId,
                    siteId,
                },
                select: { id: true },
            });

            if (!wikiCategory) {
                return error('Wiki category not found for this site', 404);
            }
        }

        const data: Prisma.BlogPostUpdateInput = {};

        if (body.siteId !== undefined) data.site = { connect: { id: siteId } };
        if (body.categoryId !== undefined) {
            data.category = categoryId ? { connect: { id: categoryId } } : { disconnect: true };
        }
        if (body.wikiCategoryId !== undefined) {
            data.wikiCategory = wikiCategoryId
                ? { connect: { id: wikiCategoryId } }
                : { disconnect: true };
        }
        if (body.authorId !== undefined) data.authorId = trimString(body.authorId);
        if (body.status !== undefined) {
            if (!isStatus(body.status)) return error(`Invalid status: ${String(body.status)}`, 400);
            data.status = body.status;
        }
        if (body.featured !== undefined) data.featured = toBoolean(body.featured);
        if (body.allowComments !== undefined) data.allowComments = toBoolean(body.allowComments);
        if (body.thumbnail !== undefined) data.thumbnail = trimString(body.thumbnail);
        if (body.coverImage !== undefined) data.coverImage = trimString(body.coverImage);
        if (body.readingTime !== undefined) data.readingTime = toOptionalInt(body.readingTime);
        if (body.wordCount !== undefined) data.wordCount = toOptionalInt(body.wordCount);
        if (body.publishedAt !== undefined) data.publishedAt = toDate(body.publishedAt);

        if (Array.isArray(body.translations)) {
            const translations: TranslationInput[] = [];

            for (const item of body.translations as Record<string, unknown>[]) {
                if (!isLocale(item.locale)) {
                    return error(`Invalid locale: ${String(item.locale)}`, 400);
                }

                const title = trimString(item.title);
                const content = typeof item.content === 'string' ? item.content.trim() : '';

                if (!title) {
                    return error(`Title is required for locale ${item.locale}`, 400);
                }

                if (!content) {
                    return error(`Content is required for locale ${item.locale}`, 400);
                }

                const slug = trimString(item.slug) || createSlug(title);

                if (!slug) {
                    return error(`Slug is required for locale ${item.locale}`, 400);
                }

                const seo =
                    item.seo && typeof item.seo === 'object'
                        ? (item.seo as Record<string, unknown>)
                        : null;

                translations.push({
                    locale: item.locale,
                    title,
                    slug,
                    subtitle: trimString(item.subtitle),
                    excerpt: trimString(item.excerpt),
                    content,
                    toc: item.toc,
                    keywords: item.keywords,
                    searchTerms: item.searchTerms,
                    synonyms: item.synonyms,
                    seo: seo
                        ? {
                              title: seo.title,
                              description: seo.description,
                              focusKeyword: seo.focusKeyword,
                              keywords: seo.keywords,
                              synonyms: seo.synonyms,
                              canonicalUrl: seo.canonicalUrl,
                              noIndex: seo.noIndex,
                              noFollow: seo.noFollow,
                              noArchive: seo.noArchive,
                              schemaType: seo.schemaType,
                              schemaJson: seo.schemaJson,
                              searchPreviewEnabled: seo.searchPreviewEnabled,
                          }
                        : null,
                });
            }

            const locales = new Set<Locale>();

            for (const translation of translations) {
                if (locales.has(translation.locale)) {
                    return error(`Duplicate translation locale: ${translation.locale}`, 400);
                }

                locales.add(translation.locale);
            }

            await prisma.$transaction(async (tx) => {
                await tx.blogPost.update({
                    where: { id },
                    data,
                });

                for (const translation of translations) {
                    const currentTranslation = await tx.blogPostTranslation.findUnique({
                        where: {
                            postId_locale: {
                                postId: id,
                                locale: translation.locale,
                            },
                        },
                        select: { id: true },
                    });

                    const translationData: Prisma.BlogPostTranslationUncheckedCreateInput = {
                        postId: id,
                        locale: translation.locale,
                        title: translation.title,
                        slug: translation.slug!,
                        subtitle: translation.subtitle,
                        excerpt: translation.excerpt,
                        content: translation.content,
                        toc: toJson(translation.toc),
                        keywords: toJson(translation.keywords),
                        searchTerms: toJson(translation.searchTerms),
                        synonyms: toJson(translation.synonyms),
                    };

                    if (currentTranslation) {
                        await tx.blogPostTranslation.update({
                            where: { id: currentTranslation.id },
                            data: {
                                title: translation.title,
                                slug: translation.slug!,
                                subtitle: translation.subtitle,
                                excerpt: translation.excerpt,
                                content: translation.content,
                                toc: toJson(translation.toc),
                                keywords: toJson(translation.keywords),
                                searchTerms: toJson(translation.searchTerms),
                                synonyms: toJson(translation.synonyms),
                            },
                        });

                        if (translation.seo) {
                            await tx.blogPostSEO.upsert({
                                where: {
                                    translationId: currentTranslation.id,
                                },
                                create: {
                                    translationId: currentTranslation.id,
                                    title: trimString(translation.seo.title),
                                    description: trimString(translation.seo.description),
                                    focusKeyword: trimString(translation.seo.focusKeyword),
                                    keywords: toJson(translation.seo.keywords),
                                    synonyms: toJson(translation.seo.synonyms),
                                    canonicalUrl: trimString(translation.seo.canonicalUrl),
                                    noIndex: toBoolean(translation.seo.noIndex),
                                    noFollow: toBoolean(translation.seo.noFollow),
                                    noArchive: toBoolean(translation.seo.noArchive),
                                    schemaType:
                                        trimString(translation.seo.schemaType) || 'BlogPosting',
                                    schemaJson: toJson(translation.seo.schemaJson),
                                    searchPreviewEnabled: toBoolean(
                                        translation.seo.searchPreviewEnabled,
                                        true,
                                    ),
                                },
                                update: {
                                    title: trimString(translation.seo.title),
                                    description: trimString(translation.seo.description),
                                    focusKeyword: trimString(translation.seo.focusKeyword),
                                    keywords: toJson(translation.seo.keywords),
                                    synonyms: toJson(translation.seo.synonyms),
                                    canonicalUrl: trimString(translation.seo.canonicalUrl),
                                    noIndex: toBoolean(translation.seo.noIndex),
                                    noFollow: toBoolean(translation.seo.noFollow),
                                    noArchive: toBoolean(translation.seo.noArchive),
                                    schemaType:
                                        trimString(translation.seo.schemaType) || 'BlogPosting',
                                    schemaJson: toJson(translation.seo.schemaJson),
                                    searchPreviewEnabled: toBoolean(
                                        translation.seo.searchPreviewEnabled,
                                        true,
                                    ),
                                },
                            });
                        } else if (translation.seo === null) {
                            await tx.blogPostSEO.deleteMany({
                                where: {
                                    translationId: currentTranslation.id,
                                },
                            });
                        }
                    } else {
                        const createdTranslation = await tx.blogPostTranslation.create({
                            data: translationData,
                            select: { id: true },
                        });

                        if (translation.seo) {
                            await tx.blogPostSEO.create({
                                data: {
                                    translationId: createdTranslation.id,
                                    title: trimString(translation.seo.title),
                                    description: trimString(translation.seo.description),
                                    focusKeyword: trimString(translation.seo.focusKeyword),
                                    keywords: toJson(translation.seo.keywords),
                                    synonyms: toJson(translation.seo.synonyms),
                                    canonicalUrl: trimString(translation.seo.canonicalUrl),
                                    noIndex: toBoolean(translation.seo.noIndex),
                                    noFollow: toBoolean(translation.seo.noFollow),
                                    noArchive: toBoolean(translation.seo.noArchive),
                                    schemaType:
                                        trimString(translation.seo.schemaType) || 'BlogPosting',
                                    schemaJson: toJson(translation.seo.schemaJson),
                                    searchPreviewEnabled: toBoolean(
                                        translation.seo.searchPreviewEnabled,
                                        true,
                                    ),
                                },
                            });
                        }
                    }
                }
            });
        } else {
            await prisma.blogPost.update({
                where: { id },
                data,
            });
        }

        const post = await getPost(id, siteId);

        return NextResponse.json({
            success: true,
            message: 'Blog post updated successfully',
            data: post,
        });
    } catch (err) {
        console.error('PATCH /api/v1/blog/[id] error:', err);

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return error('A blog translation with the same unique value already exists', 409);
            }

            if (err.code === 'P2025') {
                return error('Blog post not found', 404);
            }
        }

        return error('Failed to update blog post', 500);
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const customer = await getCustomerContextFromRequest(request);

        if (!customer) return error('Unauthorized', 401);

        const { id } = await context.params;

        if (!id) return error('Blog post id is required', 400);

        const existingPost = await prisma.blogPost.findFirst({
            where: { id },
            select: { id: true },
        });

        if (!existingPost) return error('Blog post not found', 404);

        await prisma.blogPost.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Blog post deleted successfully',
        });
    } catch (err) {
        console.error('DELETE /api/v1/blog/[id] error:', err);

        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return error('Blog post not found', 404);
        }

        return error('Failed to delete blog post', 500);
    }
}

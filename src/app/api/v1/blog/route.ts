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

    return Number.isInteger(numberValue) && numberValue >= 0 ? numberValue : null;
}

function toDate(value: unknown): Date | null {
    if (!value) return null;

    const date = new Date(String(value));

    return Number.isNaN(date.getTime()) ? null : date;
}

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
    slug: string;
    subtitle: string | null;
    excerpt: string | null;
    content: string;
    toc: unknown;
    keywords: unknown;
    searchTerms: unknown;
    synonyms: unknown;
    seo: SeoInput | null;
};

export async function GET(request: NextRequest) {
    try {
        const customer = await getCustomerContextFromRequest(request);

        if (!customer) return error('Unauthorized', 401);

        const { searchParams } = new URL(request.url);
        const siteId = trimString(searchParams.get('siteId'));
        const categoryId = trimString(searchParams.get('categoryId'));
        const wikiCategoryId = trimString(searchParams.get('wikiCategoryId'));
        const localeParam = trimString(searchParams.get('locale'));
        const statusParam = trimString(searchParams.get('status'));
        const search = trimString(searchParams.get('search'));
        const featuredParam = searchParams.get('featured');
        const page = Math.max(1, Number(searchParams.get('page')) || 1);
        const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));

        if (localeParam && !isLocale(localeParam)) {
            return error(`Invalid locale: ${localeParam}`, 400);
        }

        if (statusParam && !isStatus(statusParam)) {
            return error(`Invalid status: ${statusParam}`, 400);
        }

        const locale = localeParam as Locale | undefined;
        const status = statusParam as ContentStatus | undefined;
        const where: Prisma.BlogPostWhereInput = {
            ...(siteId && { siteId }),
            ...(categoryId && { categoryId }),
            ...(wikiCategoryId && { wikiCategoryId }),
            ...(status && { status }),
            ...(featuredParam !== null &&
                featuredParam !== '' && {
                    featured: featuredParam === 'true',
                }),
            ...(search && {
                translations: {
                    some: {
                        ...(locale && { locale }),
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { excerpt: { contains: search, mode: 'insensitive' } },
                            { content: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
            }),
        };

        const skip = (page - 1) * limit;
        const [posts, total] = await prisma.$transaction([
            prisma.blogPost.findMany({
                where,
                orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
                skip,
                take: limit,
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
                        ...(locale && { where: { locale } }),
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
        });
    } catch (err) {
        console.error('GET /api/v1/blog error:', err);
        return error('Failed to fetch blog posts', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const customer = await getCustomerContextFromRequest(request);

        if (!customer) return error('Unauthorized', 401);

        let body: Record<string, unknown>;

        try {
            body = await request.json();
        } catch {
            return error('Invalid JSON body', 400);
        }

        const siteId = trimString(body.siteId);

        if (!siteId) return error('siteId is required', 400);

        const categoryId = trimString(body.categoryId);
        const wikiCategoryId = trimString(body.wikiCategoryId);

        if (categoryId && wikiCategoryId) {
            return error('A post cannot have both categoryId and wikiCategoryId', 400);
        }

        if (!categoryId && !wikiCategoryId) {
            return error('Either categoryId or wikiCategoryId is required', 400);
        }

        if (categoryId) {
            const category = await prisma.blogCategory.findFirst({
                where: { id: categoryId, siteId },
                select: { id: true },
            });

            if (!category) return error('Blog category not found for this site', 404);
        }

        if (wikiCategoryId) {
            const wikiCategory = await prisma.wikiCategory.findFirst({
                where: { id: wikiCategoryId, siteId },
                select: { id: true },
            });

            if (!wikiCategory) return error('Wiki category not found for this site', 404);
        }

        if (!Array.isArray(body.translations) || body.translations.length === 0) {
            return error('At least one translation is required', 400);
        }

        const translations: TranslationInput[] = [];

        for (const item of body.translations as Record<string, unknown>[]) {
            if (!isLocale(item.locale)) {
                return error(`Invalid locale: ${String(item.locale)}`, 400);
            }

            const title = trimString(item.title);
            const content = typeof item.content === 'string' ? item.content.trim() : '';
            const slug = trimString(item.slug) || (title ? createSlug(title) : null);

            if (!title) {
                return error(`Title is required for locale ${item.locale}`, 400);
            }

            if (!content) {
                return error(`Content is required for locale ${item.locale}`, 400);
            }

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

        const post = await prisma.blogPost.create({
            data: {
                siteId,
                ...(categoryId && { categoryId }),
                ...(wikiCategoryId && { wikiCategoryId }),
                authorId: trimString(body.authorId),
                status: isStatus(body.status) ? body.status : ContentStatus.DRAFT,
                featured: toBoolean(body.featured),
                allowComments: toBoolean(body.allowComments, true),
                thumbnail: trimString(body.thumbnail),
                coverImage: trimString(body.coverImage),
                readingTime: toOptionalInt(body.readingTime),
                wordCount: toOptionalInt(body.wordCount),
                publishedAt: toDate(body.publishedAt),
                translations: {
                    create: translations.map((translation) => ({
                        locale: translation.locale,
                        title: translation.title,
                        slug: translation.slug,
                        subtitle: translation.subtitle,
                        excerpt: translation.excerpt,
                        content: translation.content,
                        toc: toJson(translation.toc),
                        keywords: toJson(translation.keywords),
                        searchTerms: toJson(translation.searchTerms),
                        synonyms: toJson(translation.synonyms),
                        ...(translation.seo && {
                            seo: {
                                create: {
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
                            },
                        }),
                    })),
                },
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

        return NextResponse.json(
            {
                success: true,
                message: 'Blog post created successfully',
                data: post,
            },
            { status: 201 },
        );
    } catch (err) {
        console.error('POST /api/v1/blog error:', err);

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return error('A blog translation with the same unique value already exists', 409);
            }

            if (err.code === 'P2025') {
                return error('Related record not found', 404);
            }
        }

        return error('Failed to create blog post', 500);
    }
}

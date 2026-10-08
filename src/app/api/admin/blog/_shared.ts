import { Locale, Prisma } from '@/generated/prisma';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function jsonError(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            error: message,
        },
        {
            status,
        },
    );
}

/**
 * Locale
 */
export function isLocale(value: unknown): value is Locale {
    return value === Locale.vi || value === Locale.en || value === Locale.ja;
}

/**
 * Pagination
 */
export function parsePage(value: string | null): number {
    const page = Number.parseInt(value ?? '1', 10);

    if (!Number.isFinite(page) || page < 1) {
        return 1;
    }

    return page;
}

export function parseLimit(value: string | null): number {
    const limit = Number.parseInt(value ?? String(DEFAULT_LIMIT), 10);

    if (!Number.isFinite(limit) || limit < 1) {
        return DEFAULT_LIMIT;
    }

    return Math.min(limit, MAX_LIMIT);
}

/**
 * Current workspace
 */
export async function getWorkspaceId(): Promise<string | null> {
    const session = await getCurrentSession();

    return session?.currentWorkspace?.id ?? null;
}

/**
 * Site verification
 */
export async function verifySite(siteId: string, workspaceId: string) {
    return prisma.site.findFirst({
        where: {
            id: siteId,
            workspaceId,
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });
}

/**
 * Blog category verification
 */
export async function verifyBlogCategory(categoryId: string, siteId: string, workspaceId: string) {
    return prisma.blogCategory.findFirst({
        where: {
            id: categoryId,
            siteId,
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
}

/**
 * Wiki category verification
 */
export async function verifyWikiCategory(categoryId: string, siteId: string, workspaceId: string) {
    return prisma.wikiCategory.findFirst({
        where: {
            id: categoryId,
            siteId,
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
}

/**
 * Tag verification
 */
export async function verifyTag(tagId: string, siteId: string, workspaceId: string) {
    return prisma.blogTag.findFirst({
        where: {
            id: tagId,
            siteId,
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
}

/**
 * String normalization
 *
 * Returns:
 * - string when valid
 * - null when empty / invalid
 */
export function normalizeString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const normalized = value.trim();

    return normalized || null;
}

/**
 * Nullable string normalization
 *
 * Important:
 * - undefined => undefined
 * - null => null
 * - empty string => null
 * - valid string => string
 *
 * Keeping undefined is intentional because PATCH APIs
 * need to distinguish "field was not supplied" from
 * "field should be cleared".
 */
export function normalizeNullableString(value: unknown): string | null | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const normalized = value.trim();

    return normalized || null;
}

/**
 * Boolean normalization
 */
export function normalizeBoolean(value: unknown, defaultValue = false): boolean {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (normalized === 'true') {
            return true;
        }

        if (normalized === 'false') {
            return false;
        }
    }

    if (typeof value === 'number') {
        if (value === 1) {
            return true;
        }

        if (value === 0) {
            return false;
        }
    }

    return defaultValue;
}

/**
 * Integer normalization
 */
export function normalizeInteger(value: unknown, defaultValue?: number): number | undefined {
    if (typeof value === 'number' && Number.isInteger(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim();

        if (!normalized) {
            return defaultValue;
        }

        const parsed = Number.parseInt(normalized, 10);

        if (Number.isInteger(parsed)) {
            return parsed;
        }
    }

    return defaultValue;
}

/**
 * Date normalization
 */
export function normalizeDate(value: unknown): Date | null | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === '') {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

/**
 * Prisma JSON normalization
 *
 * Prisma JSON fields do not accept JavaScript
 * undefined directly.
 */
export function toJson(value: unknown): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
    if (value === undefined || value === null) {
        return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
}

/**
 * Translation input
 */
type TranslationInput = {
    locale: Locale;
    name: string;
};

/**
 * Normalize category translations
 */
export function normalizeTranslations(value: unknown): TranslationInput[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    const result: TranslationInput[] = [];
    const locales = new Set<Locale>();

    for (const item of value) {
        if (typeof item !== 'object' || item === null) {
            continue;
        }

        const record = item as Record<string, unknown>;

        const locale = record.locale;

        const name = normalizeString(record.name);

        if (!isLocale(locale)) {
            continue;
        }

        if (!name) {
            continue;
        }

        if (locales.has(locale)) {
            continue;
        }

        locales.add(locale);

        result.push({
            locale,
            name,
        });
    }

    return result.length > 0 ? result : null;
}

/**
 * Blog post SEO input
 */
type PostSEOInput = {
    title: string | null;
    description: string | null;
    focusKeyword: string | null;
    keywords: Prisma.InputJsonValue | Prisma.JsonNullValueInput;
    synonyms: Prisma.InputJsonValue | Prisma.JsonNullValueInput;
    canonicalUrl: string | null;
    noIndex: boolean;
    noFollow: boolean;
    noArchive: boolean;
    schemaType: string | null;
    schemaJson: Prisma.InputJsonValue | Prisma.JsonNullValueInput;
    searchPreviewEnabled: boolean;
};

/**
 * Blog post translation input
 */
type PostTranslationInput = {
    locale: Locale;
    title: string;
    slug: string;
    subtitle: string | null;
    excerpt: string | null;
    content: string;
    toc: Prisma.InputJsonValue | Prisma.JsonNullValueInput;
    keywords: Prisma.InputJsonValue | Prisma.JsonNullValueInput;
    searchTerms: Prisma.InputJsonValue | Prisma.JsonNullValueInput;
    synonyms: Prisma.InputJsonValue | Prisma.JsonNullValueInput;
    seo?: {
        create: PostSEOInput;
    };
};

/**
 * Normalize BlogPost translations
 *
 * Important:
 * Every nullable Prisma string is explicitly
 * converted from undefined to null.
 *
 * This prevents:
 *
 * Type 'string | null | undefined'
 * is not assignable to
 * type 'string | null'
 */
export function normalizePostTranslations(value: unknown): PostTranslationInput[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    const result: PostTranslationInput[] = [];
    const locales = new Set<Locale>();

    for (const item of value) {
        if (typeof item !== 'object' || item === null) {
            continue;
        }

        const record = item as Record<string, unknown>;

        const locale = record.locale;

        if (!isLocale(locale)) {
            continue;
        }

        if (locales.has(locale)) {
            continue;
        }

        const title = normalizeString(record.title);

        const slug = normalizeString(record.slug);

        const content = normalizeString(record.content);

        if (!title || !slug || !content) {
            continue;
        }

        const subtitle = normalizeNullableString(record.subtitle) ?? null;

        const excerpt = normalizeNullableString(record.excerpt) ?? null;

        const translation: PostTranslationInput = {
            locale,
            title,
            slug,
            subtitle,
            excerpt,
            content,

            toc: toJson(record.toc),
            keywords: toJson(record.keywords),
            searchTerms: toJson(record.searchTerms),
            synonyms: toJson(record.synonyms),
        };

        /**
         * SEO
         */
        if (typeof record.seo === 'object' && record.seo !== null && !Array.isArray(record.seo)) {
            const seo = record.seo as Record<string, unknown>;

            const seoTitle = normalizeNullableString(seo.title) ?? null;

            const seoDescription = normalizeNullableString(seo.description) ?? null;

            const focusKeyword = normalizeNullableString(seo.focusKeyword) ?? null;

            const canonicalUrl = normalizeNullableString(seo.canonicalUrl) ?? null;

            const schemaType = normalizeNullableString(seo.schemaType) ?? 'BlogPosting';

            translation.seo = {
                create: {
                    title: seoTitle,
                    description: seoDescription,
                    focusKeyword,

                    keywords: toJson(seo.keywords),

                    synonyms: toJson(seo.synonyms),

                    canonicalUrl,

                    noIndex: normalizeBoolean(seo.noIndex, false),

                    noFollow: normalizeBoolean(seo.noFollow, false),

                    noArchive: normalizeBoolean(seo.noArchive, false),

                    schemaType,

                    schemaJson: toJson(seo.schemaJson),

                    searchPreviewEnabled: normalizeBoolean(seo.searchPreviewEnabled, true),
                },
            };
        }

        locales.add(locale);
        result.push(translation);
    }

    return result.length > 0 ? result : null;
}

/**
 * Normalize BlogPost tag IDs
 */
export function normalizeTagIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const result = new Set<string>();

    for (const item of value) {
        const id = normalizeString(item);

        if (id) {
            result.add(id);
        }
    }

    return Array.from(result);
}

/**
 * Shared BlogPost include
 */
export const POST_INCLUDE = Prisma.validator<Prisma.BlogPostInclude>()({
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
        orderBy: {
            locale: 'asc',
        },
    },

    tags: {
        include: {
            tag: true,
        },
    },
});

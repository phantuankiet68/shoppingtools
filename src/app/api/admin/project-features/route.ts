import { NextRequest, NextResponse } from 'next/server';
import { Locale, Prisma, ProjectFeatureCategory, ProjectFeatureStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const LOCALES = Object.values(Locale);
const CATEGORIES = Object.values(ProjectFeatureCategory);
const STATUSES = Object.values(ProjectFeatureStatus);

type TranslationInput = {
    locale?: string;
    title?: string;
    description?: unknown;
};

type ImageInput = {
    image?: string;
    sortOrder?: number;
    isPrimary?: boolean;
};

type ProjectFeatureInput = {
    siteId?: string;
    category?: string;
    status?: string;
    developer?: string | null;
    tags?: unknown;
    slug?: string;
    sortOrder?: number;
    isFeatured?: boolean;
    translations?: TranslationInput[];
    images?: ImageInput[];
};

const errorResponse = (message: string, status = 400) =>
    NextResponse.json({ success: false, message }, { status });

const isOneOf = <T extends string>(values: readonly T[], value: string): value is T =>
    values.includes(value as T);

const parseLimit = (value: string | null) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, MAX_LIMIT) : DEFAULT_LIMIT;
};

async function getWorkspace() {
    const session = await getCurrentSession();
    return {
        session,
        workspaceId: session?.currentWorkspace?.id ?? null,
    };
}

async function getSite(siteId: string, workspaceId: string) {
    return prisma.site.findFirst({
        where: { id: siteId, workspaceId, deletedAt: null },
        select: { id: true },
    });
}

async function getFeature(id: string, workspaceId: string) {
    return prisma.projectFeature.findFirst({
        where: {
            id,
            site: { workspaceId, deletedAt: null },
        },
        include: {
            translations: { orderBy: { locale: 'asc' } },
            images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        },
    });
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
    return value == null || value === '' ? {} : (value as Prisma.InputJsonValue);
}

function normalizeTranslations(items: TranslationInput[] = []) {
    const map = new Map<
        Locale,
        { locale: Locale; title: string; description: Prisma.InputJsonValue }
    >();

    for (const item of items) {
        const locale = String(item.locale ?? '').trim();
        const title = String(item.title ?? '').trim();

        if (!isOneOf(LOCALES, locale)) throw new Error(`Invalid locale: ${locale}`);
        if (!title) throw new Error(`Title is required for locale: ${locale}`);

        map.set(locale, {
            locale,
            title,
            description: jsonValue(item.description),
        });
    }

    return [...map.values()];
}

function normalizeImages(items: ImageInput[] = []) {
    if (items.length > 5) {
        throw new Error('A project feature can have a maximum of 5 images.');
    }

    const images = items.map((item, index) => {
        const image = String(item.image ?? '').trim();
        const sortOrder = item.sortOrder == null ? index : Number(item.sortOrder);

        if (!image) throw new Error(`Image is required at position ${index + 1}.`);
        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            throw new Error(`Invalid image sortOrder at position ${index + 1}.`);
        }

        return {
            image,
            sortOrder,
            isPrimary: Boolean(item.isPrimary),
        };
    });

    const primary = images.findIndex((item) => item.isPrimary);
    images.forEach((item, index) => {
        item.isPrimary = primary === -1 ? index === 0 : index === primary;
    });

    return images;
}

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
    translations: {
        orderBy: { locale: 'asc' as const },
        select: {
            id: true,
            locale: true,
            title: true,
            description: true,
        },
    },
    images: {
        orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
        take: 5,
        select: {
            id: true,
            featureId: true,
            image: true,
            sortOrder: true,
            isPrimary: true,
        },
    },
} satisfies Prisma.ProjectFeatureSelect;

export async function GET(request: NextRequest) {
    try {
        const { session, workspaceId } = await getWorkspace();
        if (!session) return errorResponse('Unauthorized.', 401);
        if (!workspaceId) return errorResponse('Workspace not found.');

        const { searchParams } = new URL(request.url);
        const siteId = searchParams.get('siteId')?.trim() ?? '';
        const search = searchParams.get('search')?.trim() ?? '';
        const category = searchParams.get('category')?.trim() ?? '';
        const status = searchParams.get('status')?.trim() ?? '';
        const locale = searchParams.get('locale')?.trim() ?? '';
        const page = Math.max(Number(searchParams.get('page')) || 1, 1);
        const limit = parseLimit(searchParams.get('limit'));
        const sortBy = searchParams.get('sortBy') === 'createdAt' ? 'createdAt' : 'sortOrder';
        const sortOrder: Prisma.SortOrder =
            searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

        if (!siteId) return errorResponse('siteId is required.');
        if (category && !isOneOf(CATEGORIES, category)) return errorResponse('Invalid category.');
        if (status && !isOneOf(STATUSES, status)) return errorResponse('Invalid status.');
        if (locale && !isOneOf(LOCALES, locale)) return errorResponse('Invalid locale.');

        const site = await getSite(siteId, workspaceId);
        if (!site) return errorResponse('Site not found or access denied.', 404);

        const where: Prisma.ProjectFeatureWhereInput = {
            siteId: site.id,
            ...(category && { category: category as ProjectFeatureCategory }),
            ...(status && { status: status as ProjectFeatureStatus }),
            ...(search && {
                OR: [
                    { slug: { contains: search, mode: 'insensitive' } },
                    { developer: { contains: search, mode: 'insensitive' } },
                    {
                        translations: {
                            some: {
                                title: { contains: search, mode: 'insensitive' },
                            },
                        },
                    },
                ],
            }),
        };

        const skip = (page - 1) * limit;
        const translationWhere = locale ? { locale: locale as Locale } : undefined;

        const [items, total] = await prisma.$transaction([
            prisma.projectFeature.findMany({
                where,
                orderBy: [{ [sortBy]: sortOrder }, { createdAt: 'desc' }],
                skip,
                take: limit,
                select: {
                    ...featureSelect,
                    translations: {
                        where: translationWhere,
                        orderBy: { locale: 'asc' },
                        select: featureSelect.translations.select,
                    },
                },
            }),
            prisma.projectFeature.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            projectFeatures: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error('[GET /api/admin/project-features]', error);
        return errorResponse('Internal server error.', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { session, workspaceId } = await getWorkspace();
        if (!session) return errorResponse('Unauthorized.', 401);
        if (!workspaceId) return errorResponse('Workspace not found.');

        let body: ProjectFeatureInput;
        try {
            body = await request.json();
        } catch {
            return errorResponse('Invalid JSON body.');
        }

        const siteId = String(body.siteId ?? '').trim();
        const category = String(body.category ?? 'OTHER').trim();
        const status = String(body.status ?? 'DRAFT').trim();
        const slug = String(body.slug ?? '').trim();
        const developer = body.developer == null ? null : String(body.developer).trim() || null;
        const sortOrder = body.sortOrder == null ? 0 : Number(body.sortOrder);
        const isFeatured = body.isFeatured ?? false;

        if (!siteId) return errorResponse('siteId is required.');
        if (!isOneOf(CATEGORIES, category)) return errorResponse('Invalid category.');
        if (!isOneOf(STATUSES, status)) return errorResponse('Invalid status.');
        if (!slug) return errorResponse('slug is required.');
        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            return errorResponse('sortOrder must be a non-negative integer.');
        }
        if (typeof isFeatured !== 'boolean') return errorResponse('isFeatured must be a boolean.');

        const site = await getSite(siteId, workspaceId);
        if (!site) return errorResponse('Site not found or access denied.', 404);

        const translations = normalizeTranslations(body.translations);
        const images = normalizeImages(body.images);

        const existing = await prisma.projectFeature.findUnique({
            where: { siteId_slug: { siteId: site.id, slug } },
            select: { id: true },
        });
        if (existing) return errorResponse('A project feature with this slug already exists.', 409);

        const item = await prisma.projectFeature.create({
            data: {
                siteId: site.id,
                category: category as ProjectFeatureCategory,
                status: status as ProjectFeatureStatus,
                developer,
                tags: body.tags == null ? undefined : (body.tags as Prisma.InputJsonValue),
                slug,
                sortOrder,
                isFeatured,
                translations: {
                    create: translations,
                },
                images: {
                    create: images,
                },
            },
            select: featureSelect,
        });

        return NextResponse.json(
            { success: true, message: 'Project feature created successfully.', item },
            { status: 201 },
        );
    } catch (error) {
        console.error('[POST /api/admin/project-features]', error);
        return errorResponse(
            error instanceof Error ? error.message : 'Internal server error.',
            error instanceof Error ? 400 : 500,
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { Locale, Prisma, PortfolioSize, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const LOCALES = Object.values(Locale);
const WEBSITE_TYPES = Object.values(WebsiteType);
const PORTFOLIO_SIZES = Object.values(PortfolioSize);

type TranslationInput = {
    locale?: string;
    imageAlt?: string;
    title?: string;
    description?: string | null;
};

type CreatePortfolioInput = {
    siteId?: string;
    imageUrl?: string;
    category?: string;
    size?: string;
    href?: string | null;
    sortOrder?: number;
    isActive?: boolean;
    translations?: TranslationInput[];
};

function jsonError(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

function parsePositiveInt(value: string | null, fallback: number, max: number) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }

    return Math.min(Math.floor(parsed), max);
}

function isLocale(value: string): value is Locale {
    return LOCALES.includes(value as Locale);
}

function isWebsiteType(value: string): value is WebsiteType {
    return WEBSITE_TYPES.includes(value as WebsiteType);
}

function isPortfolioSize(value: string): value is PortfolioSize {
    return PORTFOLIO_SIZES.includes(value as PortfolioSize);
}

async function getAdminWorkspace() {
    const session = await getCurrentSession();

    if (!session) {
        return {
            session: null,
            workspaceId: null,
        };
    }

    return {
        session,
        workspaceId: session.currentWorkspace?.id ?? null,
    };
}

async function getWorkspaceSite(siteId: string, workspaceId: string) {
    return prisma.site.findFirst({
        where: {
            id: siteId,
            workspaceId,
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            workspaceId: true,
        },
    });
}

function normalizeTranslations(translations: TranslationInput[] | undefined) {
    if (!translations) {
        return [];
    }

    const map = new Map<Locale, TranslationInput>();

    for (const item of translations) {
        const localeValue = String(item.locale ?? '').trim();

        if (!isLocale(localeValue)) {
            throw new Error(`Invalid locale: ${localeValue}`);
        }

        const title = String(item.title ?? '').trim();

        if (!title) {
            throw new Error(`Title is required for locale: ${localeValue}`);
        }

        const imageAlt = String(item.imageAlt ?? '').trim();

        if (!imageAlt) {
            throw new Error(`Image alt is required for locale: ${localeValue}`);
        }

        map.set(localeValue, {
            locale: localeValue,
            imageAlt,
            title,
            description: item.description == null ? null : String(item.description).trim() || null,
        });
    }

    return Array.from(map.values());
}

export async function GET(request: NextRequest) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        const { searchParams } = new URL(request.url);

        const siteId = searchParams.get('siteId')?.trim() || '';

        const search = searchParams.get('search')?.trim() || '';

        const categoryValue = searchParams.get('category')?.trim() || '';

        const status = searchParams.get('status')?.trim() || '';

        const localeValue = searchParams.get('locale')?.trim() || '';

        const page = parsePositiveInt(searchParams.get('page'), 1, 100000);

        const limit = parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT);

        const sortBy: 'createdAt' | 'sortOrder' =
            searchParams.get('sortBy') === 'createdAt' ? 'createdAt' : 'sortOrder';

        const sortOrder: Prisma.SortOrder =
            searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        const site = await getWorkspaceSite(siteId, workspaceId);

        if (!site) {
            return jsonError('Site not found or access denied.', 404);
        }

        if (categoryValue && !isWebsiteType(categoryValue)) {
            return jsonError('Invalid category.');
        }

        if (localeValue && !isLocale(localeValue)) {
            return jsonError('Invalid locale.');
        }

        if (status && status !== 'active' && status !== 'inactive') {
            return jsonError('Invalid status.');
        }

        const category: WebsiteType | undefined = categoryValue
            ? (categoryValue as WebsiteType)
            : undefined;

        const locale: Locale | undefined = localeValue ? (localeValue as Locale) : undefined;

        const where: Prisma.PortfolioWhereInput = {
            siteId: site.id,

            ...(category
                ? {
                      category,
                  }
                : {}),

            ...(status
                ? {
                      isActive: status === 'active',
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
                                          mode: Prisma.QueryMode.insensitive,
                                      },
                                  },
                              },
                          },
                          {
                              translations: {
                                  some: {
                                      description: {
                                          contains: search,
                                          mode: Prisma.QueryMode.insensitive,
                                      },
                                  },
                              },
                          },
                          {
                              href: {
                                  contains: search,
                                  mode: Prisma.QueryMode.insensitive,
                              },
                          },
                      ],
                  }
                : {}),
        };

        const skip = (page - 1) * limit;

        const orderBy: Prisma.PortfolioOrderByWithRelationInput[] = [
            {
                [sortBy]: sortOrder,
            },
            {
                createdAt: 'desc',
            },
        ];

        const [items, total] = await prisma.$transaction([
            prisma.portfolio.findMany({
                where,
                orderBy,
                skip,
                take: limit,

                select: {
                    id: true,
                    siteId: true,
                    imageUrl: true,
                    category: true,
                    size: true,
                    href: true,
                    sortOrder: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,

                    translations: {
                        where: locale
                            ? {
                                  locale,
                              }
                            : undefined,

                        orderBy: {
                            locale: 'asc',
                        },

                        select: {
                            id: true,
                            locale: true,
                            imageAlt: true,
                            title: true,
                            description: true,
                        },
                    },
                },
            }),

            prisma.portfolio.count({
                where,
            }),
        ]);

        return NextResponse.json({
            success: true,
            items,
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
        console.error('[GET /api/admin/portfolios]', error);

        return jsonError('Internal server error.', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        let body: CreatePortfolioInput;

        try {
            body = (await request.json()) as CreatePortfolioInput;
        } catch {
            return jsonError('Invalid JSON body.');
        }

        const siteId = String(body.siteId ?? '').trim();

        const imageUrl = String(body.imageUrl ?? '').trim();

        const categoryValue = String(body.category ?? '').trim();

        const sizeValue = String(body.size ?? '').trim();

        const href = body.href == null ? null : String(body.href).trim() || null;

        const sortOrder = body.sortOrder == null ? 0 : Number(body.sortOrder);

        const isActive = body.isActive ?? true;

        if (!siteId) {
            return jsonError('siteId is required.');
        }

        if (!imageUrl) {
            return jsonError('imageUrl is required.');
        }

        if (!isWebsiteType(categoryValue)) {
            return jsonError('Invalid category.');
        }

        if (!isPortfolioSize(sizeValue)) {
            return jsonError('Invalid size.');
        }

        if (!Number.isInteger(sortOrder) || sortOrder < 0) {
            return jsonError('sortOrder must be a non-negative integer.');
        }

        if (typeof isActive !== 'boolean') {
            return jsonError('isActive must be a boolean.');
        }

        const category: WebsiteType = categoryValue;

        const size: PortfolioSize = sizeValue;

        const site = await getWorkspaceSite(siteId, workspaceId);

        if (!site) {
            return jsonError('Site not found or access denied.', 404);
        }

        let translations: TranslationInput[];

        try {
            translations = normalizeTranslations(body.translations);
        } catch (error) {
            return jsonError(error instanceof Error ? error.message : 'Invalid translations.');
        }

        const portfolio = await prisma.portfolio.create({
            data: {
                siteId: site.id,
                imageUrl,
                category,
                size,
                href,
                sortOrder,
                isActive,

                ...(translations.length > 0
                    ? {
                          translations: {
                              create: translations.map((translation) => ({
                                  locale: translation.locale as Locale,
                                  imageAlt: translation.imageAlt!,
                                  title: translation.title!,
                                  description: translation.description ?? null,
                              })),
                          },
                      }
                    : {}),
            },

            select: {
                id: true,
                siteId: true,
                imageUrl: true,
                category: true,
                size: true,
                href: true,
                sortOrder: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,

                translations: {
                    orderBy: {
                        locale: 'asc',
                    },

                    select: {
                        id: true,
                        locale: true,
                        imageAlt: true,
                        title: true,
                        description: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Portfolio created successfully.',
                item: portfolio,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('[POST /api/admin/portfolios]', error);

        return jsonError('Internal server error.', 500);
    }
}

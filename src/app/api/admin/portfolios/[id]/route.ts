import { NextRequest, NextResponse } from 'next/server';
import { Locale, PortfolioSize, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type TranslationInput = {
    locale?: string;
    imageAlt?: string;
    title?: string;
    description?: string | null;
};

type UpdatePortfolioInput = {
    siteId?: string;
    imageUrl?: string;
    category?: string;
    size?: string;
    href?: string | null;
    sortOrder?: number;
    isActive?: boolean;
    translations?: TranslationInput[];
};

const LOCALES = Object.values(Locale);
const WEBSITE_TYPES = Object.values(WebsiteType);
const PORTFOLIO_SIZES = Object.values(PortfolioSize);

function jsonError(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
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

async function getPortfolioForWorkspace(id: string, workspaceId: string) {
    return prisma.portfolio.findFirst({
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
            imageUrl: true,
            category: true,
            size: true,
            href: true,
            sortOrder: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            site: {
                select: {
                    id: true,
                    name: true,
                    workspaceId: true,
                },
            },
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
}

function normalizeTranslations(translations: TranslationInput[]) {
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

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        const { id } = await context.params;

        const portfolioId = String(id ?? '').trim();

        if (!portfolioId) {
            return jsonError('Portfolio ID is required.');
        }

        const portfolio = await getPortfolioForWorkspace(portfolioId, workspaceId);

        if (!portfolio) {
            return jsonError('Portfolio not found or access denied.', 404);
        }

        return NextResponse.json({
            success: true,
            item: portfolio,
        });
    } catch (error) {
        console.error('[GET /api/admin/portfolios/[id]]', error);

        return jsonError('Internal server error.', 500);
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        const { id } = await context.params;

        const portfolioId = String(id ?? '').trim();

        if (!portfolioId) {
            return jsonError('Portfolio ID is required.');
        }

        const existing = await getPortfolioForWorkspace(portfolioId, workspaceId);

        if (!existing) {
            return jsonError('Portfolio not found or access denied.', 404);
        }

        let body: UpdatePortfolioInput;

        try {
            body = (await request.json()) as UpdatePortfolioInput;
        } catch {
            return jsonError('Invalid JSON body.');
        }

        const data: {
            siteId?: string;
            imageUrl?: string;
            category?: WebsiteType;
            size?: PortfolioSize;
            href?: string | null;
            sortOrder?: number;
            isActive?: boolean;
        } = {};

        if (body.siteId !== undefined) {
            const siteId = String(body.siteId).trim();

            if (!siteId) {
                return jsonError('siteId cannot be empty.');
            }

            const site = await prisma.site.findFirst({
                where: {
                    id: siteId,
                    workspaceId,
                    deletedAt: null,
                },
                select: {
                    id: true,
                },
            });

            if (!site) {
                return jsonError('Site not found or access denied.', 404);
            }

            data.siteId = site.id;
        }

        if (body.imageUrl !== undefined) {
            const imageUrl = String(body.imageUrl).trim();

            if (!imageUrl) {
                return jsonError('imageUrl cannot be empty.');
            }

            data.imageUrl = imageUrl;
        }

        if (body.category !== undefined) {
            const category = String(body.category).trim();

            if (!isWebsiteType(category)) {
                return jsonError('Invalid category.');
            }

            data.category = category;
        }

        if (body.size !== undefined) {
            const size = String(body.size).trim();

            if (!isPortfolioSize(size)) {
                return jsonError('Invalid size.');
            }

            data.size = size;
        }

        if (body.href !== undefined) {
            data.href = body.href == null ? null : String(body.href).trim() || null;
        }

        if (body.sortOrder !== undefined) {
            const sortOrder = Number(body.sortOrder);

            if (!Number.isInteger(sortOrder) || sortOrder < 0) {
                return jsonError('sortOrder must be a non-negative integer.');
            }

            data.sortOrder = sortOrder;
        }

        if (body.isActive !== undefined) {
            if (typeof body.isActive !== 'boolean') {
                return jsonError('isActive must be a boolean.');
            }

            data.isActive = body.isActive;
        }

        let translations: TranslationInput[] | undefined;

        if (body.translations !== undefined) {
            if (!Array.isArray(body.translations)) {
                return jsonError('translations must be an array.');
            }

            try {
                translations = normalizeTranslations(body.translations);
            } catch (error) {
                return jsonError(error instanceof Error ? error.message : 'Invalid translations.');
            }
        }

        const portfolio = await prisma.$transaction(async (tx) => {
            if (translations !== undefined) {
                await tx.portfolioTranslation.deleteMany({
                    where: {
                        portfolioId: portfolioId,
                    },
                });
            }

            return tx.portfolio.update({
                where: {
                    id: portfolioId,
                },

                data: {
                    ...data,

                    ...(translations !== undefined
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
        });

        return NextResponse.json({
            success: true,
            message: 'Portfolio updated successfully.',
            item: portfolio,
        });
    } catch (error) {
        console.error('[PATCH /api/admin/portfolios/[id]]', error);

        return jsonError('Internal server error.', 500);
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { session, workspaceId } = await getAdminWorkspace();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        if (!workspaceId) {
            return jsonError('Workspace not found.', 400);
        }

        const { id } = await context.params;

        const portfolioId = String(id ?? '').trim();

        if (!portfolioId) {
            return jsonError('Portfolio ID is required.');
        }

        const existing = await getPortfolioForWorkspace(portfolioId, workspaceId);

        if (!existing) {
            return jsonError('Portfolio not found or access denied.', 404);
        }

        await prisma.portfolio.delete({
            where: {
                id: portfolioId,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Portfolio deleted successfully.',
        });
    } catch (error) {
        console.error('[DELETE /api/admin/portfolios/[id]]', error);

        return jsonError('Internal server error.', 500);
    }
}

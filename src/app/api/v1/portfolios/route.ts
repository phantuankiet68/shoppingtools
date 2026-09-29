import { NextRequest, NextResponse } from 'next/server';
import { Locale, WebsiteType } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const LOCALES = [Locale.en, Locale.vi, Locale.ja];

const WEBSITE_TYPES = [
    WebsiteType.landing,
    WebsiteType.blog,
    WebsiteType.ecommerce,
    WebsiteType.booking,
    WebsiteType.lms,
];

const PORTFOLIO_LIMIT = 6;

function error(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
            portfolios: [],
        },
        { status },
    );
}

function getLocale(value: string | null): Locale {
    return LOCALES.includes(value as Locale) ? (value as Locale) : Locale.en;
}

function getCategory(value: string | null): WebsiteType | undefined {
    return WEBSITE_TYPES.includes(value as WebsiteType) ? (value as WebsiteType) : undefined;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const siteId = searchParams.get('siteId')?.trim();
        const locale = getLocale(searchParams.get('locale'));
        const category = getCategory(searchParams.get('category'));

        if (!siteId) {
            return error('Site ID is required.');
        }

        const site = await prisma.site.findFirst({
            where: {
                id: siteId,
                deletedAt: null,
                isPublic: true,
            },
            select: {
                id: true,
            },
        });

        if (!site) {
            return error('Site not found.', 404);
        }

        const where = {
            siteId: site.id,
            isActive: true,
            ...(category ? { category } : {}),
        };

        const portfolios = await prisma.portfolio.findMany({
            where,
            orderBy: [
                {
                    createdAt: 'asc',
                },
                {
                    sortOrder: 'asc',
                },
            ],
            take: PORTFOLIO_LIMIT,
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
                    where: {
                        locale: {
                            in: locale === Locale.en ? [Locale.en] : [locale, Locale.en],
                        },
                    },
                    select: {
                        locale: true,
                        imageAlt: true,
                        title: true,
                        description: true,
                    },
                },
            },
        });

        const result = portfolios.map((portfolio) => {
            const translation =
                portfolio.translations.find((item) => item.locale === locale) ??
                portfolio.translations.find((item) => item.locale === Locale.en) ??
                null;

            return {
                id: portfolio.id,
                siteId: portfolio.siteId,
                imageUrl: portfolio.imageUrl,
                category: portfolio.category,
                size: portfolio.size,
                href: portfolio.href,
                sortOrder: portfolio.sortOrder,
                isActive: portfolio.isActive,
                imageAlt: translation?.imageAlt ?? '',
                title: translation?.title ?? '',
                description: translation?.description ?? null,
                locale: translation?.locale ?? null,
                createdAt: portfolio.createdAt,
                updatedAt: portfolio.updatedAt,
            };
        });

        return NextResponse.json(
            {
                success: true,
                portfolios: result,
                total: result.length,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            },
        );
    } catch (err) {
        console.error('[PORTFOLIO_GET]', err);

        return error('Internal server error.', 500);
    }
}

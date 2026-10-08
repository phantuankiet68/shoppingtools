import { NextRequest, NextResponse } from 'next/server';
import { Locale, ProjectFeatureStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const LOCALES: Locale[] = [Locale.en, Locale.vi, Locale.ja];

const PROJECT_FEATURE_LIMIT = 50;

function error(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
            projectFeatures: [],
        },
        { status },
    );
}

function getLocale(value: string | null): Locale {
    return LOCALES.includes(value as Locale) ? (value as Locale) : Locale.en;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const siteId = searchParams.get('siteId')?.trim();
        const locale = getLocale(searchParams.get('locale'));

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

        const translationLocales: Locale[] =
            locale === Locale.en ? [Locale.en] : [locale, Locale.en];

        const projectFeatures = await prisma.projectFeature.findMany({
            where: {
                siteId: site.id,
                status: ProjectFeatureStatus.PUBLISHED,
            },
            orderBy: [
                {
                    sortOrder: 'asc',
                },
                {
                    createdAt: 'asc',
                },
            ],
            take: PROJECT_FEATURE_LIMIT,
            select: {
                id: true,
                siteId: true,
                slug: true,
                category: true,
                status: true,
                developer: true,
                tags: true,
                viewCount: true,
                favoriteCount: true,
                shareCount: true,
                sortOrder: true,
                isFeatured: true,
                createdAt: true,
                updatedAt: true,

                translations: {
                    where: {
                        locale: {
                            in: translationLocales,
                        },
                    },
                    select: {
                        locale: true,
                        title: true,
                        description: true,
                    },
                },

                images: {
                    orderBy: [
                        {
                            isPrimary: 'desc',
                        },
                        {
                            sortOrder: 'asc',
                        },
                        {
                            createdAt: 'asc',
                        },
                    ],
                    take: 5,
                    select: {
                        id: true,
                        image: true,
                        sortOrder: true,
                        isPrimary: true,
                    },
                },
            },
        });

        const result = projectFeatures.map((feature) => {
            const translation =
                feature.translations.find((item) => item.locale === locale) ??
                feature.translations.find((item) => item.locale === Locale.en) ??
                null;

            return {
                id: feature.id,
                siteId: feature.siteId,

                slug: feature.slug,
                category: feature.category,
                status: feature.status,

                developer: feature.developer,
                tags: feature.tags,

                viewCount: feature.viewCount,
                favoriteCount: feature.favoriteCount,
                shareCount: feature.shareCount,

                sortOrder: feature.sortOrder,
                isFeatured: feature.isFeatured,

                title: translation?.title ?? '',
                description: translation?.description ?? null,

                locale: translation?.locale ?? null,

                images: feature.images,

                createdAt: feature.createdAt,
                updatedAt: feature.updatedAt,
            };
        });

        return NextResponse.json(
            {
                success: true,
                projectFeatures: result,
                total: result.length,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            },
        );
    } catch (err) {
        console.error('[PROJECT_FEATURE_GET]', err);

        return error('Internal server error.', 500);
    }
}

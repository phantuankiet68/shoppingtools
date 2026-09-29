import { NextRequest, NextResponse } from 'next/server';
import { Locale } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const LOCALES = [Locale.en, Locale.vi, Locale.ja];

const TESTIMONIAL_LIMIT = 6;

function error(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
            testimonials: [],
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

        /**
         * Verify public site
         */
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

        /**
         * Get latest active testimonials
         */
        const testimonials = await prisma.testimonial.findMany({
            where: {
                siteId: site.id,
                isActive: true,
            },
            orderBy: [
                {
                    createdAt: 'desc',
                },
                {
                    sortOrder: 'asc',
                },
            ],
            take: TESTIMONIAL_LIMIT,
            select: {
                id: true,
                siteId: true,
                avatar: true,
                website: true,
                accentColor: true,
                rating: true,
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
                        name: true,
                        role: true,
                        websiteLabel: true,
                        quote: true,
                    },
                },
            },
        });

        /**
         * Locale fallback:
         *
         * requested locale
         *       ↓
         * English
         *       ↓
         * empty
         */
        const result = testimonials.map((testimonial) => {
            const translation =
                testimonial.translations.find((item) => item.locale === locale) ??
                testimonial.translations.find((item) => item.locale === Locale.en) ??
                null;

            return {
                id: testimonial.id,
                siteId: testimonial.siteId,
                avatar: testimonial.avatar,
                name: translation?.name ?? '',
                role: translation?.role ?? '',
                website: testimonial.website,
                websiteLabel: translation?.websiteLabel ?? testimonial.website ?? '',
                quote: translation?.quote ?? '',
                rating: testimonial.rating,
                accentColor: testimonial.accentColor,
                sortOrder: testimonial.sortOrder,
                isActive: testimonial.isActive,
                locale: translation?.locale ?? null,
                createdAt: testimonial.createdAt,
                updatedAt: testimonial.updatedAt,
            };
        });

        return NextResponse.json(
            {
                success: true,
                testimonials: result,
                total: result.length,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            },
        );
    } catch (err) {
        console.error('[TESTIMONIAL_GET]', err);

        return error('Internal server error.', 500);
    }
}

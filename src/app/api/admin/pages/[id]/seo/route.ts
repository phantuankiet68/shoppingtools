import { ChangeFreq, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
    params: Promise<{
        id: string;
    }>;
};

type SEOInput = {
    metaTitle?: string | null;
    metaDescription?: string | null;

    canonicalUrl?: string | null;

    robots?: string | null;

    focusKeyword?: string | null;

    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
    ogImageAlt?: string | null;
    ogType?: string | null;

    sitemapPriority?: number | null;
    sitemapChangefreq?: ChangeFreq | null;

    structuredData?: Prisma.InputJsonValue | null;
};

type SEOBody = {
    seo?: SEOInput;
};

function validateSeo(seo: SEOInput) {
    if (seo.metaTitle && seo.metaTitle.length > 70) {
        throw new Error('Meta title must not exceed 70 characters');
    }

    if (seo.metaDescription && seo.metaDescription.length > 160) {
        throw new Error('Meta description must not exceed 160 characters');
    }

    if (
        seo.sitemapPriority !== undefined &&
        seo.sitemapPriority !== null &&
        (seo.sitemapPriority < 0 || seo.sitemapPriority > 1)
    ) {
        throw new Error('Sitemap priority must be between 0 and 1');
    }
}

function buildSeo(title: string, seo: SEOInput) {
    return {
        metaTitle: seo.metaTitle ?? title,

        metaDescription: seo.metaDescription ?? null,

        canonicalUrl: seo.canonicalUrl ?? null,

        robots: seo.robots ?? 'index,follow',

        focusKeyword: seo.focusKeyword ?? null,

        ogTitle: seo.ogTitle ?? seo.metaTitle ?? title,

        ogDescription: seo.ogDescription ?? seo.metaDescription ?? null,

        ogImage: seo.ogImage ?? null,

        ogImageAlt: seo.ogImageAlt ?? null,

        ogType: seo.ogType ?? 'website',

        sitemapPriority: seo.sitemapPriority ?? 0.8,

        sitemapChangefreq: seo.sitemapChangefreq ?? ChangeFreq.weekly,

        structuredData: seo.structuredData ?? Prisma.JsonNull,
    };
}

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id: pageId } = await params;

        const page = await prisma.page.findFirst({
            where: {
                id: pageId,
                deletedAt: null,
            },

            select: {
                id: true,
                title: true,

                seo: true,
            },
        });

        if (!page) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Page not found',
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            ok: true,
            seo: page.seo ?? buildSeo(page.title, {}),
        });
    } catch (error) {
        console.error('[SEO_GET_ERROR]', error);

        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : 'Internal Server Error',
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(req: NextRequest, { params }: Params) {
    try {
        const { id: pageId } = await params;

        const body = (await req.json()) as SEOBody;

        if (!body.seo) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'seo is required',
                },
                {
                    status: 400,
                },
            );
        }

        validateSeo(body.seo);

        const page = await prisma.page.findFirst({
            where: {
                id: pageId,
                deletedAt: null,
            },

            select: {
                id: true,
                title: true,
            },
        });

        if (!page) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Page not found',
                },
                {
                    status: 404,
                },
            );
        }

        const seoData = buildSeo(page.title, body.seo);

        const saved = await prisma.pageSEO.upsert({
            where: {
                pageId,
            },

            create: {
                pageId,
                ...seoData,
            },

            update: seoData,
        });

        return NextResponse.json({
            ok: true,
            seo: saved,
        });
    } catch (error) {
        console.error('[SEO_SAVE_ERROR]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json(
                {
                    ok: false,
                    error: error.message,
                    code: error.code,
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : 'Internal Server Error',
            },
            {
                status: 500,
            },
        );
    }
}

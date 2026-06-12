import { ChangeFreq, PageStatus, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type BlockDTO = {
    kind: string;
    props: Record<string, unknown>;
};

type SEOIn = {
    metaTitle?: string;
    metaDescription?: string;

    canonicalUrl?: string;

    robots?: string;

    focusKeyword?: string;

    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogImageAlt?: string;
    ogType?: string;

    sitemapChangefreq?: ChangeFreq;
    sitemapPriority?: number;

    structuredData?: Prisma.InputJsonValue;
};

type Body = {
    id?: string;
    siteId?: string;
    domain?: string;

    title?: string;
    slug?: string;

    blocks?: BlockDTO[];

    seo?: SEOIn;
};

function normalizeDomain(raw: string) {
    const v = (raw || '').trim().toLowerCase();

    if (!v) return '';

    return v
        .replace(/^https?:\/\//, '')
        .split('/')[0]
        .split(':')[0];
}

function getHeaderDomain(req: NextRequest) {
    const raw = req.headers.get('x-site-domain') || req.headers.get('host') || '';

    return normalizeDomain(raw);
}

async function resolveSiteId(req: NextRequest, body: Body) {
    if (body.siteId) {
        const site = await prisma.site.findUnique({
            where: { id: body.siteId },
            select: { id: true },
        });

        if (site) return site.id;
    }

    const bodyDomain = normalizeDomain(String(body.domain || ''));

    if (bodyDomain) {
        const site = await prisma.site.findUnique({
            where: { domain: bodyDomain },
            select: { id: true },
        });

        if (site) return site.id;
    }

    const headerDomain = getHeaderDomain(req);

    if (headerDomain && !['localhost', '127.0.0.1'].includes(headerDomain)) {
        const site = await prisma.site.findUnique({
            where: { domain: headerDomain },
            select: { id: true },
        });

        if (site) return site.id;
    }

    const firstSite = await prisma.site.findFirst({
        orderBy: {
            createdAt: 'asc',
        },
        select: {
            id: true,
        },
    });

    return firstSite?.id ?? null;
}

function slugify(input: string) {
    const value = (input || '').trim();

    if (!value || value === '/') {
        return '/';
    }

    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function toPath(slug: string) {
    return slug === '/' ? '/' : `/${slug}`;
}

function validateSEO(seo: SEOIn) {
    if (seo.metaTitle && seo.metaTitle.length > 70) {
        throw new Error('Meta title must not exceed 70 characters');
    }

    if (seo.metaDescription && seo.metaDescription.length > 160) {
        throw new Error('Meta description must not exceed 160 characters');
    }

    if (seo.sitemapPriority !== undefined && (seo.sitemapPriority < 0 || seo.sitemapPriority > 1)) {
        throw new Error('Sitemap priority must be between 0 and 1');
    }
}

export async function POST(req: NextRequest) {
    let body: Body;

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            {
                ok: false,
                error: 'Invalid JSON body',
            },
            {
                status: 400,
            },
        );
    }

    try {
        const title = body.title?.trim();

        if (!title) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Title is required',
                },
                {
                    status: 400,
                },
            );
        }

        const siteId = await resolveSiteId(req, body);

        if (!siteId) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Site not found',
                },
                {
                    status: 400,
                },
            );
        }

        const slug = slugify(body.slug || title);

        const path = toPath(slug);

        const seo = body.seo || {};

        validateSEO(seo);

        const seoData = {
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

            sitemapChangefreq: seo.sitemapChangefreq ?? ChangeFreq.weekly,

            sitemapPriority: seo.sitemapPriority ?? 0.8,

            structuredData: seo.structuredData ?? Prisma.JsonNull,
        };

        const blocks = (body.blocks ?? []) as Prisma.InputJsonValue;

        if (body.id) {
            const result = await prisma.$transaction(async (tx) => {
                const page = await tx.page.update({
                    where: {
                        id: body.id,
                    },
                    data: {
                        title,
                        slug,
                        path,
                        blocks,
                        status: PageStatus.DRAFT,
                    },
                });

                await tx.pageSEO.upsert({
                    where: {
                        pageId: page.id,
                    },
                    create: {
                        pageId: page.id,
                        ...seoData,
                    },
                    update: seoData,
                });

                return page;
            });

            return NextResponse.json({
                ok: true,
                id: result.id,
                siteId,
                path,
            });
        }

        const created = await prisma.$transaction(async (tx) => {
            return tx.page.create({
                data: {
                    siteId,
                    title,
                    slug,
                    path,
                    blocks,

                    status: PageStatus.DRAFT,

                    seo: {
                        create: seoData,
                    },
                },
                select: {
                    id: true,
                },
            });
        });

        return NextResponse.json({
            ok: true,
            id: created.id,
            siteId,
            path,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    {
                        ok: false,
                        error: 'Slug or path already exists',
                    },
                    {
                        status: 409,
                    },
                );
            }
        }

        console.error('[PAGE_SAVE_ERROR]', error);

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

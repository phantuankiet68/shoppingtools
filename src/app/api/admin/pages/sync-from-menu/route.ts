// app/api/admin/pages/sync-from-menu/route.ts

import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type InItem = {
    title: string;
    slug: string;
    path?: string;
};

type Body = {
    items: InItem[];
    siteId?: string;
};

type NormalizedItem = {
    title: string;
    slug: string;
    path: string;
};

function normalizeSlug(raw: string) {
    const s = (raw || '').trim();

    if (!s || s === '/') {
        return '';
    }

    return s.replace(/^\/+/, '').replace(/\/+$/, '');
}

function ensureLeadingSlash(path: string) {
    const s = (path || '').trim();

    if (!s) {
        return '/';
    }

    const normalized = s.startsWith('/') ? s : `/${s}`;

    if (normalized.length > 1) {
        return normalized.replace(/\/+$/, '');
    }

    return '/';
}

function pathFromSlug(slug: string) {
    if (!slug || slug === 'home') {
        return '/';
    }

    return `/${slug}`;
}

function normalizeMenuItem(item: InItem): NormalizedItem {
    const title = String(item.title || '').trim();
    const rawSlug = String(item.slug || '').trim();
    const rawPath = String(item.path || '').trim();

    const slug = normalizeSlug(rawSlug);

    /*
     * Home page is always:
     *
     * slug = "home"
     * path = "/"
     *
     * This prevents:
     *
     * slug = "home"
     * path = "/home"
     */
    const isHome = slug.toLowerCase() === 'home' || rawPath === '/';

    if (isHome) {
        return {
            title,
            slug: 'home',
            path: '/',
        };
    }

    return {
        title,
        slug,
        path: ensureLeadingSlash(rawPath || pathFromSlug(slug)),
    };
}

async function resolveSiteId(req: Request, hinted?: string): Promise<string> {
    if (hinted) {
        const site = await prisma.site.findUnique({
            where: {
                id: hinted,
            },
            select: {
                id: true,
            },
        });

        if (site?.id) {
            return site.id;
        }
    }

    const host = req.headers.get('host')?.split(':')[0];

    if (host) {
        const site = await prisma.site.findUnique({
            where: {
                domain: host,
            },
            select: {
                id: true,
            },
        });

        if (site?.id) {
            return site.id;
        }
    }

    const firstSite = await prisma.site.findFirst({
        orderBy: {
            createdAt: 'asc',
        },
        select: {
            id: true,
        },
    });

    if (!firstSite?.id) {
        throw new Error('No Site found. Please seed Site first.');
    }

    return firstSite.id;
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Body;

        if (!Array.isArray(body.items)) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Invalid payload: items must be an array',
                },
                {
                    status: 400,
                },
            );
        }

        const siteId = await resolveSiteId(req, body.siteId);

        /*
         * Normalize all menu items before touching the database.
         */
        const normalizedItems = body.items
            .filter(
                (item) => item && String(item.title || '').trim() && String(item.slug || '').trim(),
            )
            .map(normalizeMenuItem);

        if (normalizedItems.length === 0) {
            return NextResponse.json({
                ok: true,
                siteId,
                count: 0,
                pages: [],
            });
        }

        /*
         * ---------------------------------------------------------
         * Validate duplicate paths
         * ---------------------------------------------------------
         */
        const pathCounter = new Map<string, number>();

        for (const item of normalizedItems) {
            pathCounter.set(item.path, (pathCounter.get(item.path) || 0) + 1);
        }

        const duplicatePaths = [...pathCounter.entries()]
            .filter(([, count]) => count > 1)
            .map(([path]) => path);

        if (duplicatePaths.length > 0) {
            return NextResponse.json(
                {
                    ok: false,
                    error: `Duplicate paths detected: ${duplicatePaths.join(', ')}`,
                    duplicatePaths,
                },
                {
                    status: 400,
                },
            );
        }

        /*
         * ---------------------------------------------------------
         * Validate duplicate slugs
         * ---------------------------------------------------------
         *
         * This prevents two menu items from trying to use
         * the same Page slug.
         */
        const slugCounter = new Map<string, number>();

        for (const item of normalizedItems) {
            slugCounter.set(item.slug, (slugCounter.get(item.slug) || 0) + 1);
        }

        const duplicateSlugs = [...slugCounter.entries()]
            .filter(([, count]) => count > 1)
            .map(([slug]) => slug);

        if (duplicateSlugs.length > 0) {
            return NextResponse.json(
                {
                    ok: false,
                    error: `Duplicate slugs detected: ${duplicateSlugs.join(', ')}`,
                    duplicateSlugs,
                },
                {
                    status: 400,
                },
            );
        }

        /*
         * ---------------------------------------------------------
         * Save pages
         * ---------------------------------------------------------
         */
        const pages = await prisma.$transaction(async (tx) => {
            const results: Array<{
                id: string;
                title: string;
                slug: string;
                path: string;
            }> = [];

            for (const item of normalizedItems) {
                /*
                 * First find by site + PATH.
                 *
                 * This is important because "/" is the actual
                 * URL of Home.
                 */
                const existingPageByPath = await tx.page.findFirst({
                    where: {
                        siteId,
                        path: item.path,
                    },
                    select: {
                        id: true,
                        slug: true,
                        path: true,
                    },
                });

                let page;

                if (existingPageByPath) {
                    page = await tx.page.update({
                        where: {
                            id: existingPageByPath.id,
                        },
                        data: {
                            title: item.title,
                            slug: item.slug,
                            path: item.path,
                        },
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            path: true,
                        },
                    });
                } else {
                    /*
                     * If there is no page with this path,
                     * also check by site + slug.
                     *
                     * This is especially important for an old
                     * Home page that was previously saved as:
                     *
                     * slug = "home"
                     * path = "/home"
                     *
                     * It can now be corrected to:
                     *
                     * slug = "home"
                     * path = "/"
                     */
                    const existingPageBySlug = await tx.page.findFirst({
                        where: {
                            siteId,
                            slug: item.slug,
                        },
                        select: {
                            id: true,
                            slug: true,
                            path: true,
                        },
                    });

                    if (existingPageBySlug) {
                        page = await tx.page.update({
                            where: {
                                id: existingPageBySlug.id,
                            },
                            data: {
                                title: item.title,
                                slug: item.slug,
                                path: item.path,
                            },
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                path: true,
                            },
                        });
                    } else {
                        page = await tx.page.create({
                            data: {
                                site: {
                                    connect: {
                                        id: siteId,
                                    },
                                },
                                title: item.title,
                                slug: item.slug,
                                path: item.path,
                                status: 'DRAFT',
                                blocks: [] as Prisma.JsonArray,
                            },
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                path: true,
                            },
                        });
                    }
                }

                results.push(page);
            }

            /*
             * -------------------------------------------------
             * Remove obsolete DRAFT pages
             * -------------------------------------------------
             *
             * Only delete DRAFT pages that are no longer
             * represented by the current menu.
             *
             * Existing published pages are untouched.
             */
            await tx.page.deleteMany({
                where: {
                    siteId,
                    status: 'DRAFT',
                    path: {
                        notIn: normalizedItems.map((item) => item.path),
                    },
                },
            });

            return results;
        });

        return NextResponse.json({
            ok: true,
            siteId,
            count: pages.length,
            pages,
        });
    } catch (e: any) {
        console.error('SYNC PAGE ERROR:', {
            code: e?.code,
            meta: e?.meta,
            message: e?.message,
            stack: e?.stack,
        });

        if (e?.code === 'P2002') {
            return NextResponse.json(
                {
                    ok: false,
                    code: e.code,
                    meta: e.meta,
                    error: 'Duplicate page path or slug detected.',
                },
                {
                    status: 409,
                },
            );
        }

        return NextResponse.json(
            {
                ok: false,
                error: e?.message || 'Internal Server Error',
            },
            {
                status: 500,
            },
        );
    }
}

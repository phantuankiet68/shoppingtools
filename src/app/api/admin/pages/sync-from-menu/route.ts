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

function normalizeSlug(raw: string) {
    const s = (raw || '').trim();

    if (!s || s === '/') {
        return '/';
    }

    return s.replace(/^\/+/, '').replace(/\/+$/, '');
}

function ensureLeadingSlash(path: string) {
    const s = (path || '').trim();

    if (!s) {
        return '/';
    }

    return s.startsWith('/') ? s : `/${s}`;
}

function pathFromSlug(slug: string) {
    return slug === '/' ? '/' : `/${slug}`;
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

        const normalizedItems = body.items
            .filter((item) => item?.title && item?.slug)
            .map((item) => {
                const slug = normalizeSlug(item.slug);

                return {
                    title: String(item.title).trim(),
                    slug,
                    path: ensureLeadingSlash(item.path || pathFromSlug(slug)),
                };
            });

        if (normalizedItems.length === 0) {
            return NextResponse.json({
                ok: true,
                siteId,
                count: 0,
                pages: [],
            });
        }

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
                },
                {
                    status: 400,
                },
            );
        }

        const pages = await prisma.$transaction(async (tx) => {
            const results: Array<{
                id: string;
                title: string;
                slug: string;
                path: string;
            }> = [];

            for (const item of normalizedItems) {
                const existingPage = await tx.page.findFirst({
                    where: {
                        siteId,
                        path: item.path,
                    },
                    select: {
                        id: true,
                    },
                });

                let page;

                if (existingPage) {
                    page = await tx.page.update({
                        where: {
                            id: existingPage.id,
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

                results.push(page);
            }

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
        });

        if (e?.code === 'P2002') {
            return NextResponse.json(
                {
                    ok: false,
                    code: e.code,
                    meta: e.meta,
                    error: 'Duplicate page path detected.',
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

import { MenuArea } from '@/generated/prisma';
import { getCurrentSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getMenuTemplate } from '@/utils/menus/menuHelpers';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { z } from 'zod';

import en from '@/lib/admin/i18n/messages/en';
import ja from '@/lib/admin/i18n/messages/ja';
import vi from '@/lib/admin/i18n/messages/vi';

import { resolveMenuValue } from '@/utils/menus/menuResolver';

export const dynamic = 'force-dynamic';

function buildSlug(path: string) {
    if (path === '/') return 'home';

    return path.replace(/^\/+/, '').replace(/\/+/g, '-').toLowerCase();
}

const CreateSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(100)
        .transform((s) => s.trim()),

    domain: z
        .string()
        .min(3)
        .max(255)
        .transform((s) => s.trim().toLowerCase())
        .refine(
            (s) => !s.startsWith('http://') && !s.startsWith('https://'),
            'Domain should not include protocol',
        )
        .refine((s) => /^[a-z0-9.-]+$/.test(s), 'Domain only allows a-z, 0-9, dot, dash'),

    type: z.string().optional(),

    category: z.string().max(100).optional().nullable(),

    logoUrl: z.string().optional().nullable(),

    faviconUrl: z.string().optional().nullable(),

    contactEmail: z.string().email().optional().or(z.literal('')),

    contactPhone: z.string().optional().nullable(),

    seoTitle: z.string().optional().nullable(),

    seoDescription: z.string().optional().nullable(),

    status: z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED']).optional(),

    isPublic: z.boolean().optional(),

    publishedAt: z.string().optional().nullable(),

    workspaceId: z.string().optional(),
});

async function nextSiteId(prefix = 'sitea') {
    const rows = await prisma.site.findMany({
        where: { id: { startsWith: prefix } },
        select: { id: true },
        orderBy: { id: 'desc' },
        take: 50,
    });

    let max = 0;
    const re = new RegExp(`^${prefix}(\\d{2})$`, 'i');

    for (const row of rows) {
        const match = row.id.match(re);
        if (!match) continue;
        const value = Number(match[1]);
        if (Number.isFinite(value) && value > max) max = value;
    }

    const next = max + 1;
    const suffix = String(next).padStart(2, '0');
    return `${prefix}${suffix}`.toLowerCase();
}

export async function GET() {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const workspaceId = session.currentWorkspace?.id ?? null;

        if (!workspaceId) {
            return NextResponse.json({ error: 'No workspace selected.' }, { status: 400 });
        }

        const items = await prisma.site.findMany({
            where: {
                deletedAt: null,
                workspaceId,
                ownerUserId: userId,
            },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,

                name: true,
                domain: true,

                type: true,
                category: true,

                logoUrl: true,
                faviconUrl: true,

                contactEmail: true,
                contactPhone: true,

                seoTitle: true,
                seoDescription: true,

                status: true,
                isPublic: true,

                publishedAt: true,

                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            currentWorkspace: session.currentWorkspace,
            items,
        });
    } catch (error) {
        console.error('GET /api/admin/sites error:', error);
        return NextResponse.json({ error: 'Failed to fetch sites.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        const locale = req.cookies.get('admin-locale')?.value;

        const localeKey = locale === 'vi' || locale === 'en' || locale === 'ja' ? locale : 'en';

        console.log('locale', locale);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();

        const logoFile = formData.get('logo') as File | null;
        const faviconFile = formData.get('favicon') as File | null;

        const payload = {
            name: String(formData.get('name') ?? ''),
            domain: String(formData.get('domain') ?? ''),
            type: String(formData.get('type') ?? ''),
            category: String(formData.get('category') ?? ''),

            contactEmail: String(formData.get('contactEmail') ?? ''),
            contactPhone: String(formData.get('contactPhone') ?? ''),

            seoTitle: String(formData.get('seoTitle') ?? ''),
            seoDescription: String(formData.get('seoDescription') ?? ''),

            status: String(formData.get('status') ?? 'DRAFT'),

            isPublic: String(formData.get('isPublic')) === 'true',

            publishedAt: String(formData.get('publishedAt') ?? ''),

            workspaceId: String(formData.get('workspaceId') ?? ''),

            logoUrl: null,
            faviconUrl: null,
        };

        const parsed = CreateSchema.safeParse(payload);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: parsed.error.flatten(),
                },
                { status: 400 },
            );
        }

        const workspaceId = parsed.data.workspaceId || session.currentWorkspace?.id;

        if (!workspaceId) {
            return NextResponse.json(
                {
                    error: 'No workspace selected.',
                },
                { status: 400 },
            );
        }

        const duplicate = await prisma.site.findFirst({
            where: {
                domain: parsed.data.domain,
            },
            select: {
                id: true,
            },
        });

        if (duplicate) {
            return NextResponse.json(
                {
                    error: 'Domain already exists.',
                },
                { status: 409 },
            );
        }

        const id = await nextSiteId('sitea');

        let logoUrl: string | null = null;
        let faviconUrl: string | null = null;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sites', id);

        await fs.mkdir(uploadDir, {
            recursive: true,
        });

        if (logoFile?.size) {
            const ext = path.extname(logoFile.name) || '.png';

            const fileName = `logo-${Date.now()}${ext}`;

            await fs.writeFile(
                path.join(uploadDir, fileName),
                Buffer.from(await logoFile.arrayBuffer()),
            );

            logoUrl = `/uploads/sites/${id}/${fileName}`;
        }

        if (faviconFile?.size) {
            const ext = path.extname(faviconFile.name) || '.png';

            const fileName = `favicon-${Date.now()}${ext}`;

            await fs.writeFile(
                path.join(uploadDir, fileName),
                Buffer.from(await faviconFile.arrayBuffer()),
            );

            faviconUrl = `/uploads/sites/${id}/${fileName}`;
        }

        const menus = getMenuTemplate(parsed.data.type, parsed.data.category);

        const messagesMap = {
            vi,
            en,
            ja,
        } as const;
        const messages = messagesMap[localeKey];

        const resolvedMenus = menus.map((menu) => ({
            ...menu,
            title: resolveMenuValue(messages, menu.title),
            path: resolveMenuValue(messages, menu.path),
        }));

        const result = await prisma.$transaction(async (tx) => {
            const site = await tx.site.create({
                data: {
                    id,

                    name: parsed.data.name,
                    domain: parsed.data.domain,

                    type: parsed.data.type as any,

                    category: parsed.data.category || null,

                    logoUrl,
                    faviconUrl,

                    contactEmail: parsed.data.contactEmail || null,

                    contactPhone: parsed.data.contactPhone || null,

                    seoTitle: parsed.data.seoTitle || null,

                    seoDescription: parsed.data.seoDescription || null,

                    status: (parsed.data.status as any) ?? 'DRAFT',

                    isPublic: parsed.data.isPublic ?? false,

                    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,

                    owner: {
                        connect: {
                            id: session.user.id,
                        },
                    },

                    createdBy: {
                        connect: {
                            id: session.user.id,
                        },
                    },

                    workspace: {
                        connect: {
                            id: workspaceId,
                        },
                    },
                },
            });

            const systemPages = [
                {
                    title: 'Header',
                    slug: 'header',
                    path: '/header',
                    sortOrder: 0,
                },
                {
                    title: 'Footer',
                    slug: 'footer',
                    path: '/footer',
                    sortOrder: 1,
                },
                {
                    title: '404',
                    slug: '404',
                    path: '/404',
                    sortOrder: 2,
                },
            ];

            if (menus.length > 0) {
                await tx.menuItem.createMany({
                    data: resolvedMenus.map((menu, index) => ({
                        siteId: site.id,
                        title: menu.title,
                        path: menu.path,
                        icon: menu.icon,
                        area: MenuArea.SITE,
                        sortOrder: index + 1,
                        visible: true,
                    })),
                });
            }

            const pages = [
                ...systemPages,
                ...resolvedMenus.map((menu, index) => ({
                    title: menu.title,
                    slug: buildSlug(menu.path),
                    path: menu.path,
                    sortOrder: index + 10,
                })),
            ];

            for (const page of pages) {
                await tx.page.create({
                    data: {
                        siteId: site.id,

                        title: page.title,
                        slug: page.slug,
                        path: page.path,

                        status: 'DRAFT',

                        sortOrder: page.sortOrder,

                        seo: {
                            create: {
                                metaTitle: page.title,
                                ogTitle: page.title,
                                metaDescription: `${page.title} page`,
                                ogDescription: `${page.title} page`,
                            },
                        },
                    },
                });
            }

            return site;
        });

        return NextResponse.json(
            {
                success: true,
                id: result.id,
                logoUrl,
                faviconUrl,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('POST /api/admin/sites error:', error);

        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            if (message.includes('unique') || message.includes('constraint')) {
                return NextResponse.json(
                    {
                        error: 'Domain already exists.',
                    },
                    { status: 409 },
                );
            }
        }

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to create site.',
            },
            { status: 500 },
        );
    }
}

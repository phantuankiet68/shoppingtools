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

async function nextSiteId(prefix = crypto.randomUUID().replace(/-/g, '')) {
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

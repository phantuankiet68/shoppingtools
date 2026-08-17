import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

type CreateSiteInput = {
    name: string;
    domain: string;
    type?: string;
    category?: string | null;
    contactEmail?: string;
    contactPhone?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    workspaceId: string;
    ownerUserId: string;
    createdByUserId?: string | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
};

async function nextSiteId(prefix = crypto.randomUUID().replace(/-/g, '')) {
    const rows = await prisma.site.findMany({
        where: {
            id: {
                startsWith: prefix,
            },
        },
        select: {
            id: true,
        },
        orderBy: {
            id: 'desc',
        },
        take: 50,
    });

    let max = 0;
    const re = new RegExp(`^${prefix}(\\d{2})$`, 'i');

    for (const row of rows) {
        const match = row.id.match(re);

        if (!match) continue;

        const value = Number(match[1]);

        if (Number.isFinite(value) && value > max) {
            max = value;
        }
    }

    const next = max + 1;
    const suffix = String(next).padStart(2, '0');

    return `${prefix}${suffix}`.toLowerCase();
}

export async function createSite(input: CreateSiteInput) {
    const id = await nextSiteId();

    const site = await prisma.site.create({
        data: {
            id,
            name: input.name,
            domain: input.domain,
            type: input.type as any,
            category: input.category ?? null,
            logoUrl: input.logoUrl ?? null,
            faviconUrl: input.faviconUrl ?? null,
            contactEmail: input.contactEmail || null,
            contactPhone: input.contactPhone || null,
            seoTitle: input.seoTitle || null,
            seoDescription: input.seoDescription || null,
            status: 'DRAFT',
            isPublic: false,
            publishedAt: null,

            ownerUserId: input.ownerUserId,
            createdByUserId: input.createdByUserId ?? input.ownerUserId,
            workspaceId: input.workspaceId,
        },
    });

    return site;
}

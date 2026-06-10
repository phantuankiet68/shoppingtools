import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import { SiteStatus, WebsiteType } from '@/generated/prisma';

type Params = {
    params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        const formData = await req.formData();

        const logoFile = formData.get('logo') as File | null;
        const faviconFile = formData.get('favicon') as File | null;

        const existingSite = await prisma.site.findUnique({
            where: { id },
            select: {
                id: true,
                logoUrl: true,
                faviconUrl: true,
            },
        });

        if (!existingSite) {
            return NextResponse.json(
                {
                    message: 'Site not found',
                },
                { status: 404 },
            );
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sites', id);

        await fs.mkdir(uploadDir, {
            recursive: true,
        });

        let logoUrl = existingSite.logoUrl;
        let faviconUrl = existingSite.faviconUrl;

        if (logoFile && logoFile.size > 0) {
            const ext = path.extname(logoFile.name) || '.png';

            const fileName = `logo-${Date.now()}${ext}`;

            await fs.writeFile(
                path.join(uploadDir, fileName),
                Buffer.from(await logoFile.arrayBuffer()),
            );

            logoUrl = `/uploads/sites/${id}/${fileName}`;
        }

        if (faviconFile && faviconFile.size > 0) {
            const ext = path.extname(faviconFile.name) || '.png';

            const fileName = `favicon-${Date.now()}${ext}`;

            await fs.writeFile(
                path.join(uploadDir, fileName),
                Buffer.from(await faviconFile.arrayBuffer()),
            );

            faviconUrl = `/uploads/sites/${id}/${fileName}`;
        }

        const websiteType = (formData.get('type') as WebsiteType) ?? WebsiteType.landing;

        const siteStatus = (formData.get('status') as SiteStatus) ?? SiteStatus.DRAFT;

        const updated = await prisma.site.update({
            where: { id },
            data: {
                name: String(formData.get('name') ?? '').trim(),

                domain: String(formData.get('domain') ?? '')
                    .trim()
                    .toLowerCase(),

                type: websiteType,

                category: String(formData.get('category') ?? '') || null,

                logoUrl,

                faviconUrl,

                contactEmail: String(formData.get('contactEmail') ?? '') || null,

                contactPhone: String(formData.get('contactPhone') ?? '') || null,

                seoTitle: String(formData.get('seoTitle') ?? '') || null,

                seoDescription: String(formData.get('seoDescription') ?? '') || null,

                status: siteStatus,

                isPublic: String(formData.get('isPublic')) === 'true',

                publishedAt: formData.get('publishedAt')
                    ? new Date(String(formData.get('publishedAt')))
                    : null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('PATCH SITE ERROR:', error);

        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : 'Update failed',
            },
            { status: 500 },
        );
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        await prisma.$transaction(async (tx) => {
            await tx.menuItem.deleteMany({
                where: {
                    siteId: id,
                },
            });

            await tx.site.delete({
                where: {
                    id,
                },
            });
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error('DELETE SITE ERROR:', error);

        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : 'Delete failed',
            },
            { status: 500 },
        );
    }
}

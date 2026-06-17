import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import { SiteStatus, WebsiteType } from '@/generated/prisma';

type Params = {
    params: Promise<{ id: string }>;
};

async function ensureDir(dir: string) {
    await fs.mkdir(dir, {
        recursive: true,
    });
}

async function removeOldFiles(uploadDir: string, prefix: string) {
    try {
        const files = await fs.readdir(uploadDir);

        const targets = files.filter((file) => file.toLowerCase().startsWith(prefix.toLowerCase()));

        for (const file of targets) {
            try {
                await fs.unlink(path.join(uploadDir, file));
            } catch {}
        }
    } catch {}
}

async function deleteFileByUrl(fileUrl?: string | null) {
    if (!fileUrl) return;

    try {
        const filePath = path.join(process.cwd(), 'public', fileUrl.replace(/^\/+/, ''));

        await fs.unlink(filePath);
    } catch (error) {
        console.error('DELETE FILE ERROR:', error);
    }
}

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

        await ensureDir(uploadDir);

        let logoUrl = existingSite.logoUrl;
        let faviconUrl = existingSite.faviconUrl;

        if (logoFile?.size) {
            await removeOldFiles(uploadDir, 'logo');

            const ext = path.extname(logoFile.name).toLowerCase() || '.png';

            const fileName = `logo${ext}`;

            await fs.writeFile(
                path.join(uploadDir, fileName),
                Buffer.from(await logoFile.arrayBuffer()),
            );

            logoUrl = `/uploads/sites/${id}/${fileName}`;
        }

        if (faviconFile?.size) {
            await removeOldFiles(uploadDir, 'favicon');

            const ext = path.extname(faviconFile.name).toLowerCase() || '.png';

            const fileName = `favicon${ext}`;

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

        const site = await prisma.site.findUnique({
            where: { id },
            select: {
                logoUrl: true,
                faviconUrl: true,
            },
        });

        if (!site) {
            return NextResponse.json(
                {
                    message: 'Site not found',
                },
                { status: 404 },
            );
        }

        await deleteFileByUrl(site.logoUrl);

        await deleteFileByUrl(site.faviconUrl);

        await prisma.$transaction(async (tx) => {
            await tx.pageSEO.deleteMany({
                where: {
                    page: {
                        siteId: id,
                    },
                },
            });

            await tx.page.deleteMany({
                where: {
                    siteId: id,
                },
            });

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

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sites', id);

        await fs.rm(uploadDir, {
            recursive: true,
            force: true,
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

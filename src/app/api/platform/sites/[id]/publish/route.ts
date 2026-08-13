import { NextRequest, NextResponse } from 'next/server';
import { Prisma, SiteStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/platform/platformHelpers';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
    try {
        await requireAdmin();

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Site id is required.',
                },
                { status: 400 },
            );
        }

        const site = await prisma.site.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                domain: true,
                status: true,
                isPublic: true,
                publishedAt: true,
            },
        });

        if (!site) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Site not found.',
                },
                { status: 404 },
            );
        }

        if (site.status === SiteStatus.PUBLISHED) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Site is already published.',
                },
                { status: 409 },
            );
        }

        const publishedSite = await prisma.site.update({
            where: {
                id,
            },
            data: {
                status: SiteStatus.PUBLISHED,
                isPublic: true,
                publishedAt: site.publishedAt ?? new Date(),
            },
            select: {
                id: true,
                name: true,
                domain: true,
                status: true,
                isPublic: true,
                publishedAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Site published successfully.',
            data: publishedSite,
        });
    } catch (error) {
        console.error('POST /api/platform/sites/[id]/publish', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error.',
            },
            { status: 500 },
        );
    }
}

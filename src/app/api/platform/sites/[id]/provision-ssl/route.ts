import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { provisionSsl } from '@/lib/ssl/ssl.service';
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
                {
                    status: 400,
                },
            );
        }

        const site = await prisma.site.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                domain: true,
                contactEmail: true,
                deletedAt: true,
            },
        });

        if (!site || site.deletedAt) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Site not found.',
                },
                {
                    status: 404,
                },
            );
        }

        const result = await provisionSsl({
            siteId: site.id,
            domain: site.domain,
            email: site.contactEmail ?? 'admin@kbuilder.vn',
        });

        return NextResponse.json(result, {
            status: result.success ? 200 : 400,
        });
    } catch (error) {
        console.error('POST /api/platform/sites/[id]/provision-ssl', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                {
                    status: 500,
                },
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error.',
            },
            {
                status: 500,
            },
        );
    }
}

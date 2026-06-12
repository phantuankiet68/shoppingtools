import { PageStatus, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Body = {
    id?: string;
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as Body;

        if (!body.id) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Page id is required',
                },
                {
                    status: 400,
                },
            );
        }

        const page = await prisma.page.findUnique({
            where: {
                id: body.id,
            },
            select: {
                id: true,
                status: true,
                deletedAt: true,
                publishedAt: true,
            },
        });

        if (!page) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Page not found',
                },
                {
                    status: 404,
                },
            );
        }

        if (page.deletedAt) {
            return NextResponse.json(
                {
                    ok: false,
                    error: 'Page has been deleted',
                },
                {
                    status: 400,
                },
            );
        }

        if (page.status === PageStatus.PUBLISHED) {
            return NextResponse.json({
                ok: true,
                message: 'Page is already published',
                id: page.id,
            });
        }

        const updatedPage = await prisma.page.update({
            where: {
                id: page.id,
            },
            data: {
                status: PageStatus.PUBLISHED,

                publishedAt: page.publishedAt ?? new Date(),
            },
            select: {
                id: true,
                status: true,
                publishedAt: true,
            },
        });

        return NextResponse.json({
            ok: true,
            message: 'Page published successfully',
            page: updatedPage,
        });
    } catch (error) {
        console.error('[PAGE_PUBLISH_ERROR]', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json(
                {
                    ok: false,
                    error: error.message,
                    code: error.code,
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json(
            {
                ok: false,
                error: 'Internal Server Error',
            },
            {
                status: 500,
            },
        );
    }
}

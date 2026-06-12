import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        if (!id) {
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

        const page = await prisma.page.findFirst({
            where: {
                id,
                deletedAt: null,
            },

            include: {
                site: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                    },
                },

                seo: true,
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

        return NextResponse.json({
            ok: true,
            page,
        });
    } catch (error) {
        console.error('[PAGE_DETAIL_ERROR]', error);

        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : 'Internal Server Error',
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        if (!id) {
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
                id,
            },

            select: {
                id: true,
                deletedAt: true,
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
                    error: 'Page already deleted',
                },
                {
                    status: 400,
                },
            );
        }

        await prisma.page.update({
            where: {
                id,
            },

            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({
            ok: true,
            message: 'Page deleted successfully',
        });
    } catch (error) {
        console.error('[PAGE_DELETE_ERROR]', error);

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

import { FacebookPostStatus, Prisma } from '@/generated/prisma';
import { requireAdminAuthUser } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { makeImageFileName, savePublicImage } from '@/lib/storage/publicImages';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_BYTES = 10 * 1024 * 1024;

function isStatus(value: unknown): value is FacebookPostStatus {
    return (
        value === 'DRAFT' ||
        value === 'SCHEDULED' ||
        value === 'PUBLISHING' ||
        value === 'PUBLISHED' ||
        value === 'FAILED'
    );
}

/* =========================
   GET
========================= */
export async function GET(req: Request) {
    try {
        await requireAdminAuthUser();

        const url = new URL(req.url);

        const q = url.searchParams.get('q')?.trim() || '';
        const statusParam = url.searchParams.get('status');
        const status = isStatus(statusParam) ? statusParam : undefined;

        const userId = url.searchParams.get('userId') || undefined;
        const date = url.searchParams.get('date') || undefined;

        const ci = (value: string) =>
            ({
                contains: value,
                mode: Prisma.QueryMode.insensitive,
            }) as const;

        const where: Prisma.FacebookPostWhereInput = {
            ...(userId ? { userId } : {}),

            ...(status ? { status } : {}),

            ...(q
                ? {
                      OR: [{ title: ci(q) }, { description: ci(q) }, { hashtags: ci(q) }],
                  }
                : {}),

            ...(date
                ? {
                      publishAt: {
                          gte: new Date(`${date}T00:00:00.000Z`),
                          lte: new Date(`${date}T23:59:59.999Z`),
                      },
                  }
                : {}),
        };

        const items = await prisma.facebookPost.findMany({
            where,
            include: {
                facebookAuthor: {
                    select: {
                        id: true,
                        pageId: true,
                        pageName: true,
                        autoPublish: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json({
            items,
            total: items.length,
            page: 1,
            pageSize: items.length,
            pageCount: 1,
        });
    } catch (error) {
        console.error('GET FACEBOOK POSTS ERROR:', error);

        return NextResponse.json(
            {
                error: 'Internal Server Error',
            },
            {
                status: 500,
            },
        );
    }
}

/* =========================
   POST
========================= */
export async function POST(req: Request) {
    try {
        const admin = await requireAdminAuthUser();

        const form = await req.formData();

        const title = String(form.get('title') ?? '').trim();
        const description = String(form.get('description') ?? '').trim();
        const hashtags = String(form.get('hashtags') ?? '').trim();
        const href = String(form.get('href') ?? '').trim();

        const statusValue = form.get('status');
        const publishAtValue = form.get('publishAt');
        const facebookAuthorId = String(form.get('facebookAuthorId') ?? '').trim();

        const file = form.get('image') as File | null;

        if (!title) {
            return NextResponse.json(
                {
                    error: {
                        title: 'Title is required',
                    },
                },
                {
                    status: 400,
                },
            );
        }

        if (!description) {
            return NextResponse.json(
                {
                    error: {
                        description: 'Description is required',
                    },
                },
                {
                    status: 400,
                },
            );
        }

        let imageUrl: string | null = null;

        if (file && file.size > 0) {
            if (!file.type.startsWith('image/')) {
                return NextResponse.json(
                    {
                        error: 'Only image files allowed',
                    },
                    {
                        status: 400,
                    },
                );
            }

            if (file.size > MAX_BYTES) {
                return NextResponse.json(
                    {
                        error: 'Max image size is 10MB',
                    },
                    {
                        status: 400,
                    },
                );
            }

            const buffer = Buffer.from(await file.arrayBuffer());

            const fileName = makeImageFileName(file.type);

            imageUrl = await savePublicImage(admin.id, fileName, buffer);
        }

        const created = await prisma.facebookPost.create({
            data: {
                user: {
                    connect: {
                        id: admin.id,
                    },
                },

                ...(facebookAuthorId
                    ? {
                          facebookAuthor: {
                              connect: {
                                  id: facebookAuthorId,
                              },
                          },
                      }
                    : {}),

                title,
                description,

                hashtags: hashtags || null,
                href: href || null,
                image: imageUrl,

                status: isStatus(statusValue) ? statusValue : 'DRAFT',

                publishAt: publishAtValue ? new Date(String(publishAtValue)) : null,
            },
            include: {
                user: true,
                facebookAuthor: true,
            },
        });

        return NextResponse.json(created, {
            status: 201,
        });
    } catch (error) {
        console.error('POST FACEBOOK POST ERROR:', error);

        return NextResponse.json(
            {
                error: 'Internal Server Error',
            },
            {
                status: 500,
            },
        );
    }
}

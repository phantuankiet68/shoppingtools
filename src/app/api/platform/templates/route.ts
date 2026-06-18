import { Prisma, TemplateStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const TEMPLATE_STATUSES: TemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

type CreateTemplateBody = {
    code?: string;
    name?: string;
    kind?: string;
    categoryId?: string;

    status?: TemplateStatus;

    previewImageUrl?: string | null;

    isActive?: boolean;
    isPublic?: boolean;

    sortOrder?: number;
};

function normalizeString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function slugify(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function isTemplateStatus(value: unknown): value is TemplateStatus {
    return typeof value === 'string' && TEMPLATE_STATUSES.includes(value as TemplateStatus);
}

function parseBoolean(value: string | null) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
}

function validateCreateBody(body: CreateTemplateBody) {
    const code = slugify(normalizeString(body.code));

    const name = normalizeString(body.name);
    const kind = normalizeString(body.kind);

    const categoryId = normalizeString(body.categoryId);

    const previewImageUrl = normalizeString(body.previewImageUrl) || null;

    const status = isTemplateStatus(body.status) ? body.status : 'PUBLISHED';

    const sortOrder = Number(body.sortOrder ?? 0);

    const errors: string[] = [];

    if (!code) {
        errors.push('Code is required.');
    }

    if (!name) {
        errors.push('Name is required.');
    }

    if (!kind) {
        errors.push('Kind is required.');
    }

    if (!categoryId) {
        errors.push('Category is required.');
    }

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
        errors.push('Sort order must be greater than or equal to 0.');
    }

    return {
        valid: errors.length === 0,
        errors,

        data: {
            code,
            name,
            kind,

            categoryId,

            status,

            previewImageUrl,

            isActive: body.isActive ?? true,

            isPublic: body.isPublic ?? true,

            sortOrder: Math.trunc(sortOrder),
        },
    };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const keyword = searchParams.get('keyword')?.trim() ?? '';

        const categoryId = searchParams.get('categoryId')?.trim() ?? '';

        const status = searchParams.get('status');

        const isActive = parseBoolean(searchParams.get('isActive'));

        const isPublic = parseBoolean(searchParams.get('isPublic'));

        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        const page = Math.max(Number(searchParams.get('page') ?? 1), 1);

        const pageSize = Math.min(Math.max(Number(searchParams.get('pageSize') ?? 10), 1), 100);

        const where: Prisma.TemplateCatalogWhereInput = {
            ...(keyword && {
                OR: [
                    {
                        name: {
                            contains: keyword,
                            mode: 'insensitive',
                        },
                    },

                    {
                        code: {
                            contains: keyword,
                            mode: 'insensitive',
                        },
                    },

                    {
                        kind: {
                            contains: keyword,
                            mode: 'insensitive',
                        },
                    },
                ],
            }),

            ...(categoryId && {
                categoryId,
            }),

            ...(isTemplateStatus(status) && {
                status,
            }),

            ...(typeof isActive === 'boolean' && {
                isActive,
            }),

            ...(typeof isPublic === 'boolean' && {
                isPublic,
            }),

            ...(includeDeleted
                ? {}
                : {
                      deletedAt: null,
                  }),
        };

        const [items, total] = await Promise.all([
            prisma.templateCatalog.findMany({
                where,

                skip: (page - 1) * pageSize,

                take: pageSize,

                orderBy: [
                    {
                        sortOrder: 'asc',
                    },
                    {
                        createdAt: 'desc',
                    },
                ],

                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            minTier: true,
                            isActive: true,
                        },
                    },
                },
            }),

            prisma.templateCatalog.count({
                where,
            }),
        ]);

        return NextResponse.json({
            success: true,

            data: items,

            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error('GET templates error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch templates.',
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CreateTemplateBody;

        const result = validateCreateBody(body);

        if (!result.valid) {
            return NextResponse.json(
                {
                    success: false,
                    errors: result.errors,
                },
                {
                    status: 400,
                },
            );
        }

        const category = await prisma.templateCategory.findUnique({
            where: {
                id: result.data.categoryId,
            },

            select: {
                id: true,
            },
        });

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category not found.',
                },
                {
                    status: 404,
                },
            );
        }

        const created = await prisma.templateCatalog.create({
            data: {
                code: result.data.code,

                name: result.data.name,

                kind: result.data.kind,

                categoryId: result.data.categoryId,

                status: result.data.status,

                previewImageUrl: result.data.previewImageUrl,

                isActive: result.data.isActive,

                isPublic: result.data.isPublic,

                sortOrder: result.data.sortOrder,
            },

            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        minTier: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,

                data: created,

                message: 'Template created successfully.',
            },
            {
                status: 201,
            },
        );
    } catch (error: any) {
        console.error('POST templates error:', error);

        if (error?.code === 'P2002') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Template code already exists.',
                },
                {
                    status: 409,
                },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create template.',
            },
            {
                status: 500,
            },
        );
    }
}

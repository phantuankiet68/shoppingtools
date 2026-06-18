import { Prisma, TemplateStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const TEMPLATE_STATUSES: TemplateStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type UpdateTemplateBody = {
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

function buildUpdateData(body: UpdateTemplateBody) {
    const data: Prisma.TemplateCatalogUpdateInput = {};

    const errors: string[] = [];

    if (body.code !== undefined) {
        const code = slugify(normalizeString(body.code));

        if (!code) {
            errors.push('Code must not be empty.');
        } else {
            data.code = code;
        }
    }

    if (body.name !== undefined) {
        const name = normalizeString(body.name);

        if (!name) {
            errors.push('Name must not be empty.');
        } else {
            data.name = name;
        }
    }

    if (body.kind !== undefined) {
        const kind = normalizeString(body.kind);

        if (!kind) {
            errors.push('Kind must not be empty.');
        } else {
            data.kind = kind;
        }
    }

    if (body.categoryId !== undefined) {
        const categoryId = normalizeString(body.categoryId);

        if (!categoryId) {
            errors.push('Category is required.');
        } else {
            data.category = {
                connect: {
                    id: categoryId,
                },
            };
        }
    }

    if (body.status !== undefined) {
        if (!isTemplateStatus(body.status)) {
            errors.push('Invalid template status.');
        } else {
            data.status = body.status;
        }
    }

    if (body.previewImageUrl !== undefined) {
        data.previewImageUrl = normalizeString(body.previewImageUrl) || null;
    }

    if (body.isActive !== undefined) {
        data.isActive = body.isActive;
    }

    if (body.isPublic !== undefined) {
        data.isPublic = body.isPublic;
    }

    if (body.sortOrder !== undefined) {
        const sortOrder = Number(body.sortOrder);

        if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            errors.push('Sort order must be greater than or equal to 0.');
        } else {
            data.sortOrder = Math.trunc(sortOrder);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        data,
    };
}

export async function GET(_req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const template = await prisma.templateCatalog.findFirst({
            where: {
                id,
                deletedAt: null,
            },

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
        });

        if (!template) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Template not found.',
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            data: template,
        });
    } catch (error) {
        console.error('GET template error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch template.',
            },
            {
                status: 500,
            },
        );
    }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const body = (await req.json()) as UpdateTemplateBody;

        const result = buildUpdateData(body);

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

        const existing = await prisma.templateCatalog.findFirst({
            where: {
                id,
                deletedAt: null,
            },

            select: {
                id: true,
            },
        });

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Template not found.',
                },
                {
                    status: 404,
                },
            );
        }

        if (body.categoryId) {
            const category = await prisma.templateCategory.findUnique({
                where: {
                    id: body.categoryId,
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
        }

        const updated = await prisma.templateCatalog.update({
            where: {
                id,
            },

            data: result.data,

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
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Template updated successfully.',
        });
    } catch (error: any) {
        console.error('PATCH template error:', error);

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
                message: 'Failed to update template.',
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const existing = await prisma.templateCatalog.findFirst({
            where: {
                id,
                deletedAt: null,
            },

            select: {
                id: true,
            },
        });

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Template not found.',
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.templateCatalog.update({
            where: {
                id,
            },

            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Template deleted successfully.',
        });
    } catch (error) {
        console.error('DELETE template error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete template.',
            },
            {
                status: 500,
            },
        );
    }
}

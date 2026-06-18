import { AccessTier, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TIERS: AccessTier[] = ['BASIC', 'NORMAL', 'PRO'];

type UpdateTemplateCategoryBody = {
    name?: string;
    description?: string | null;
    minTier?: AccessTier;
    sortOrder?: number;
    isActive?: boolean;
};

function normalizeString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function isAccessTier(value: unknown): value is AccessTier {
    return typeof value === 'string' && ACCESS_TIERS.includes(value as AccessTier);
}

function validateBody(body: UpdateTemplateCategoryBody) {
    const data: Prisma.TemplateCategoryUpdateInput = {};
    const errors: string[] = [];

    if (body.name !== undefined) {
        const name = normalizeString(body.name);

        if (!name) {
            errors.push('Name must not be empty');
        } else {
            data.name = name;
        }
    }

    if (body.description !== undefined) {
        data.description =
            typeof body.description === 'string' ? body.description.trim() || null : null;
    }

    if (body.sortOrder !== undefined) {
        if (!Number.isFinite(body.sortOrder)) {
            errors.push('Sort order is invalid');
        } else if (body.sortOrder < 0) {
            errors.push('Sort order must be >= 0');
        } else {
            data.sortOrder = Math.trunc(body.sortOrder);
        }
    }

    if (body.isActive !== undefined) {
        data.isActive = Boolean(body.isActive);
    }

    if (body.minTier !== undefined) {
        if (!isAccessTier(body.minTier)) {
            errors.push('Invalid access tier');
        } else {
            data.minTier = body.minTier;
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        data,
    };
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        const category = await prisma.templateCategory.findUnique({
            where: { id },

            include: {
                templates: {
                    where: {
                        deletedAt: null,
                    },

                    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
                },

                _count: {
                    select: {
                        templates: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Category not found',
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch category',
            },
            {
                status: 500,
            },
        );
    }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        const body = (await req.json()) as UpdateTemplateCategoryBody;

        const result = validateBody(body);

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

        const updated = await prisma.templateCategory.update({
            where: { id },
            data: result.data,
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Template category updated successfully',
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update template category',
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;

        const count = await prisma.templateCatalog.count({
            where: {
                categoryId: id,
                deletedAt: null,
            },
        });

        if (count > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cannot delete category that contains templates',
                },
                {
                    status: 409,
                },
            );
        }

        await prisma.templateCategory.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Template category deleted successfully',
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete template category',
            },
            {
                status: 500,
            },
        );
    }
}

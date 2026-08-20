import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';

function error(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        {
            status,
        },
    );
}

function trimString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const result = value.trim();

    return result.length ? result : null;
}

function createSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

type RouteContext = {
    params: Promise<{
        projectId: string;
    }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

        const { projectId } = await params;

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: auth.user.id,
            },
        });

        if (!project) {
            return error('Project not found.', 404);
        }

        return NextResponse.json({
            success: true,
            project,
        });
    } catch (err) {
        console.error('[PROJECT_GET_BY_ID]', err);

        return error('Internal server error.', 500);
    }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

        const { projectId } = await params;

        const body = await request.json();

        const name = trimString(body.name);
        const requestedSlug = trimString(body.slug);
        const description = trimString(body.description);

        if (!name) {
            return error('Project name is required.');
        }

        if (!requestedSlug) {
            return error('Project slug is required.');
        }

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: auth.user.id,
            },
            select: {
                id: true,
            },
        });

        if (!project) {
            return error('Project not found.', 404);
        }

        const slug = createSlug(requestedSlug);

        if (!slug) {
            return error('Project slug is invalid.');
        }

        const exists = await prisma.project.findFirst({
            where: {
                slug,
                NOT: {
                    id: project.id,
                },
            },
            select: {
                id: true,
            },
        });

        if (exists) {
            return error('Project slug already exists.', 409);
        }

        const updated = await prisma.project.update({
            where: {
                id: project.id,
            },
            data: {
                name,
                slug,
                description,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Project updated successfully.',
            project: updated,
        });
    } catch (err) {
        console.error('[PROJECT_PATCH]', err);

        return error('Internal server error.', 500);
    }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

        const { projectId } = await params;

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: auth.user.id,
            },
            select: {
                id: true,
            },
        });

        if (!project) {
            return error('Project not found.', 404);
        }

        await prisma.project.delete({
            where: {
                id: project.id,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Project deleted successfully.',
        });
    } catch (err) {
        console.error('[PROJECT_DELETE]', err);

        return error('Internal server error.', 500);
    }
}

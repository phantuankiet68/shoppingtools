import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        const auth = await getUserFromRequest();

        if (!auth || !hasRole(auth.systemRole, 'SUPER_ADMIN')) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Forbidden.',
                },
                {
                    status: 403,
                },
            );
        }

        const { id: userId } = await params;

        const projects = await prisma.project.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                userId: true,

                name: true,
                slug: true,
                websiteType: true,
                description: true,

                thumbnail: true,
                logo: true,
                domain: true,

                status: true,
                isPublished: true,

                totalViews: true,
                totalTemplates: true,
                storageUsed: true,

                publishedAt: true,
                reviewedBy: true,
                reviewedAt: true,
                rejectReason: true,

                createdAt: true,
                updatedAt: true,
            },
        });

        const serializedProjects = projects.map((project) => ({
            ...project,
            storageUsed: Number(project.storageUsed),
        }));

        return NextResponse.json({
            ok: true,
            data: serializedProjects,
        });
    } catch (err) {
        console.error('[GET_PROJECTS_ERROR]', err);

        return NextResponse.json(
            {
                ok: false,
                message: 'Internal server error.',
            },
            {
                status: 500,
            },
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';
import { ProjectStatus, SiteStatus } from '@/generated/prisma';

interface RouteContext {
    params: Promise<{
        id: string;
        projectId: string;
    }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    try {
        const auth = await getUserFromRequest();

        if (!auth || !hasRole(auth.systemRole, 'SUPER_ADMIN')) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Forbidden',
                },
                {
                    status: 403,
                },
            );
        }

        const { id: userId, projectId } = await params;

        const body = await req.json();

        const {
            status,
            rejectReason,
        }: {
            status: ProjectStatus;
            rejectReason?: string;
        } = body;

        if (
            ![ProjectStatus.PENDING, ProjectStatus.APPROVED, ProjectStatus.REJECTED].includes(
                status,
            )
        ) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Invalid status.',
                },
                {
                    status: 400,
                },
            );
        }

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
            },
            select: {
                id: true,
                userId: true,
                name: true,
                slug: true,
                domain: true,
                websiteType: true,
                status: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Project not found.',
                },
                {
                    status: 404,
                },
            );
        }

        if (status === ProjectStatus.APPROVED && !project.domain) {
            return NextResponse.json(
                {
                    ok: false,
                    message: 'Project domain is required before approval.',
                },
                {
                    status: 400,
                },
            );
        }

        const updatedProject = await prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                status,
                rejectReason:
                    status === ProjectStatus.REJECTED ? rejectReason?.trim() || null : null,

                reviewedBy: auth.userId,
                reviewedAt: new Date(),
            },
            select: {
                id: true,
                status: true,
                rejectReason: true,
                reviewedBy: true,
                reviewedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            ok: true,
            message: 'Project updated successfully.',
            data: updatedProject,
        });
    } catch (error) {
        console.error('UPDATE_PROJECT_ERROR', error);

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

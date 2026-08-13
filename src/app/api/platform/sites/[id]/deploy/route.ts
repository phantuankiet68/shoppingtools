import { NextRequest, NextResponse } from 'next/server';
import { Prisma, DeploymentStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
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

        const site = await prisma.site.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                deploymentStatus: true,
            },
        });

        if (!site) {
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

        if (site.deploymentStatus === DeploymentStatus.BUILDING) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Deployment already running.',
                },
                {
                    status: 409,
                },
            );
        }

        const deployment = await prisma.site.update({
            where: {
                id,
            },
            data: {
                deploymentStatus: DeploymentStatus.BUILDING,
                deploymentError: null,
            },
            select: {
                id: true,
                name: true,
                domain: true,
                deploymentStatus: true,
                deployedAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Deployment started.',
            data: deployment,
        });
    } catch (error) {
        console.error(error);

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

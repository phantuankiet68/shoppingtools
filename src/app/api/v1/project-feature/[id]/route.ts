import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function error(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
            projectFeature: null,
        },
        { status },
    );
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const featureId = id?.trim();

        if (!featureId) {
            return error('Project feature ID is required.');
        }

        const projectFeature = await prisma.projectFeature.findFirst({
            where: {
                id: featureId,
                status: 'PUBLISHED',
                site: {
                    deletedAt: null,
                    isPublic: true,
                },
            },
            select: {
                id: true,
                siteId: true,
                slug: true,
                category: true,
                status: true,
                developer: true,
                tags: true,
                viewCount: true,
                favoriteCount: true,
                shareCount: true,
                sortOrder: true,
                isFeatured: true,
                createdAt: true,
                updatedAt: true,

                translations: {
                    orderBy: {
                        locale: 'asc',
                    },
                    select: {
                        id: true,
                        featureId: true,
                        locale: true,
                        title: true,
                        description: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },

                images: {
                    orderBy: [
                        {
                            isPrimary: 'desc',
                        },
                        {
                            sortOrder: 'asc',
                        },
                        {
                            createdAt: 'asc',
                        },
                    ],
                    take: 5,
                    select: {
                        id: true,
                        featureId: true,
                        image: true,
                        sortOrder: true,
                        isPrimary: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        if (!projectFeature) {
            return error('Project feature not found.', 404);
        }

        return NextResponse.json(
            {
                success: true,
                projectFeature,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            },
        );
    } catch (err) {
        console.error('[PROJECT_FEATURE_GET_BY_ID]', err);

        return error('Internal server error.', 500);
    }
}

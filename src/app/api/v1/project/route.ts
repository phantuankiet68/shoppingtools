import { NextRequest, NextResponse } from 'next/server';
import { WebsiteType } from '@/generated/prisma';
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

export async function GET(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

        const { searchParams } = new URL(request.url);

        const page = Math.max(Number(searchParams.get('page')) || 1, 1);

        const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 3, 1), 3);

        const skip = (page - 1) * limit;

        const [projects, total] = await prisma.$transaction([
            prisma.project.findMany({
                where: {
                    userId: auth.user.id,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
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
            }),

            prisma.project.count({
                where: {
                    userId: auth.user.id,
                },
            }),
        ]);

        const serializedProjects = projects.map((project) => ({
            ...project,
            storageUsed: Number(project.storageUsed),
        }));

        return NextResponse.json({
            success: true,
            projects: serializedProjects,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error('[PROJECT_GET]', err);

        return NextResponse.json(
            {
                success: false,
                message: err instanceof Error ? err.message : 'Internal server error.',
                projects: [],
                pagination: {
                    page: 1,
                    limit: 3,
                    total: 0,
                    totalPages: 0,
                },
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

        const body = await request.json();

        const data = {
            name: trimString(body.name),
            slug: body.slug ? createSlug(body.slug) : null,
            websiteType: trimString(body.websiteType),
            description: trimString(body.description),
            logo: trimString(body.logo),
            thumbnail: trimString(body.thumbnail),
            domain: trimString(body.domain),
        };

        if (!data.name) {
            return error('Project name is required.');
        }

        if (!data.slug) {
            return error('Project slug is required.');
        }

        if (!data.websiteType) {
            return error('Website type is required.');
        }

        const websiteTypes: WebsiteType[] = [
            WebsiteType.landing,
            WebsiteType.blog,
            WebsiteType.ecommerce,
            WebsiteType.booking,
            WebsiteType.lms,
        ];

        if (!websiteTypes.includes(data.websiteType as WebsiteType)) {
            return error('Invalid website type.');
        }

        const exists = await prisma.project.findFirst({
            where: {
                OR: [
                    {
                        slug: data.slug,
                    },
                    ...(data.domain
                        ? [
                              {
                                  domain: data.domain,
                              },
                          ]
                        : []),
                ],
            },
            select: {
                id: true,
            },
        });

        if (exists) {
            return error('Project slug or domain already exists.', 409);
        }

        const project = await prisma.project.create({
            data: {
                userId: auth.user.id,
                name: data.name,
                slug: data.slug,
                websiteType: data.websiteType as WebsiteType,
                description: data.description,
                logo: data.logo,
                thumbnail: data.thumbnail,
                domain: data.domain,
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
        return NextResponse.json({
            success: true,
            message: 'Project created successfully.',
            project,
        });
    } catch (err) {
        console.error('[PROJECT_GET]', err);

        return NextResponse.json(
            {
                success: false,
                message: err instanceof Error ? err.message : 'Internal server error.',
            },
            {
                status: 500,
            },
        );
    }
}

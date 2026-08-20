import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { createPublicPages } from '@/features/sites/createPublicPages';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized.',
                },
                {
                    status: 401,
                },
            );
        }

        const body: unknown = await req.json();

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body.',
                },
                {
                    status: 400,
                },
            );
        }

        const payload = body as Record<string, unknown>;
        const siteId = String(payload.siteId ?? '').trim();

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Site ID is required.',
                },
                {
                    status: 400,
                },
            );
        }

        const result = await createPublicPages({
            siteId,
        });

        return NextResponse.json(
            {
                success: true,
                data: result,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch (error) {
        console.error('[POST /api/admin/sites/pages/public]', error);

        if (error instanceof Error) {
            switch (error.message) {
                case 'SITE_NOT_FOUND':
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Site not found.',
                        },
                        {
                            status: 404,
                        },
                    );

                case 'SITE_CATEGORY_REQUIRED':
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Site category is required.',
                        },
                        {
                            status: 400,
                        },
                    );

                case 'SITE_TEMPLATE_CATEGORY_NOT_FOUND':
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Template category was not found or does not match the site website type.',
                        },
                        {
                            status: 400,
                        },
                    );

                default:
                    break;
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create public pages.',
            },
            {
                status: 500,
            },
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { createSystemPages } from '@/features/sites/createSystemPages';

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

        const result = await createSystemPages({
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
        console.error('[POST /api/admin/sites/pages/system]', error);

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

                default:
                    break;
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create system pages.',
            },
            {
                status: 500,
            },
        );
    }
}

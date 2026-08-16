import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { createPublicPages } from '@/features/sites/createPublicPages';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const siteId = String(body.siteId ?? '').trim();
        const pages = Array.isArray(body.pages) ? body.pages : [];

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Site ID is required.',
                },
                { status: 400 },
            );
        }

        if (!pages.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Public pages are required.',
                },
                { status: 400 },
            );
        }

        const result = await createPublicPages({
            siteId,
            pages,
        });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/pages/public]', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create public pages.',
            },
            { status: 500 },
        );
    }
}

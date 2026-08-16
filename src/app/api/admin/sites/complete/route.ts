import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { completeSite } from '@/features/sites/completeSite';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const siteId = String(body.siteId ?? '').trim();

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Site ID is required.',
                },
                { status: 400 },
            );
        }

        const result = await completeSite({
            siteId,
        });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/complete]', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to complete site creation.',
            },
            { status: 500 },
        );
    }
}

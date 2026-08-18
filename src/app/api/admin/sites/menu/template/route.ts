import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { loadMenuTemplate } from '@/features/sites/loadMenuTemplate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 },
            );
        }

        const body = await req.json();

        const type = String(body.type ?? '').trim();
        const category = body.category ? String(body.category).trim() : null;

        if (!type) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Site type is required.',
                },
                { status: 400 },
            );
        }

        const result = await loadMenuTemplate({
            type,
            category,
        });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/menu/template]', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to load menu template.',
            },
            { status: 500 },
        );
    }
}

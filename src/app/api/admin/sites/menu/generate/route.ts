import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { generateMenuItems } from '@/features/sites/generateMenuItems';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const siteId = String(body.siteId ?? '').trim();
        const menus = Array.isArray(body.menus) ? body.menus : [];

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Site ID is required.',
                },
                { status: 400 },
            );
        }

        if (!menus.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Menu template is empty.',
                },
                { status: 400 },
            );
        }

        const items = generateMenuItems({
            siteId,
            menus,
        });

        return NextResponse.json({
            success: true,
            data: {
                siteId,
                items,
                count: items.length,
            },
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/menu/generate]', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate menu items.',
            },
            { status: 500 },
        );
    }
}

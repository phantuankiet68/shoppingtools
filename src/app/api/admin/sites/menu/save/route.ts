import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { saveMenu } from '@/features/sites/saveMenu';
import { MenuArea } from '@/generated/prisma';

export const dynamic = 'force-dynamic';

type MenuItemRequest = {
    key: string;
    title: string;
    path?: string | null;
    icon?: string | null;
    area: MenuArea;
    sortOrder?: number;
    visible?: boolean;
    parentKey?: string | null;
};

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: unknown = await req.json();

        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body.',
                },
                { status: 400 },
            );
        }

        const payload = body as {
            siteId?: unknown;
            items?: unknown;
        };

        const siteId = String(payload.siteId ?? '').trim();
        const items = Array.isArray(payload.items) ? (payload.items as MenuItemRequest[]) : [];

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Site ID is required.',
                },
                { status: 400 },
            );
        }

        if (!items.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Menu items are required.',
                },
                { status: 400 },
            );
        }

        const invalidItems = items.filter(
            (item) => !item || typeof item.key !== 'string' || !item.key.trim(),
        );

        if (invalidItems.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid menu items: ${invalidItems.length} item(s) are missing key.`,
                },
                { status: 400 },
            );
        }

        const keys = items.map((item) => item.key.trim());

        const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);

        if (duplicateKeys.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Duplicate menu keys: ${[...new Set(duplicateKeys)].join(', ')}`,
                },
                { status: 400 },
            );
        }

        const result = await saveMenu({
            siteId,
            items,
        });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/menu/save]', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save menu.',
            },
            { status: 500 },
        );
    }
}

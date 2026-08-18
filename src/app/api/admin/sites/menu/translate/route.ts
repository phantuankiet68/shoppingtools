import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { translateMenu, SiteLocale } from '@/features/sites/translateMenu';

export const dynamic = 'force-dynamic';

const SUPPORTED_LOCALES: SiteLocale[] = ['vi', 'en', 'ja'];

function isSiteLocale(value: string): value is SiteLocale {
    return SUPPORTED_LOCALES.includes(value as SiteLocale);
}

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

        const menus = Array.isArray(body.menus) ? body.menus : [];

        const localeValue = String(body.locale ?? 'en').trim();

        if (!menus.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Menu items are required.',
                },
                { status: 400 },
            );
        }

        if (!isSiteLocale(localeValue)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unsupported locale.',
                },
                { status: 400 },
            );
        }

        const result = translateMenu({
            menus,
            locale: localeValue,
        });

        return NextResponse.json({
            success: true,
            data: {
                locale: localeValue,
                menus: result,
            },
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/menu/translate]', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to translate menu.',
            },
            { status: 500 },
        );
    }
}

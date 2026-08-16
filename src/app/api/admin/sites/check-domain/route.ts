import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { checkSiteDomain } from '@/features/sites/checkDomain';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const domain = String(body.domain ?? '')
            .trim()
            .toLowerCase();

        if (!domain) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Domain is required.',
                },
                { status: 400 },
            );
        }

        const result = await checkSiteDomain(domain);

        if (!result.available) {
            return NextResponse.json(
                {
                    success: false,
                    available: false,
                    domain: result.domain,
                    error: 'Domain already exists.',
                    site: result.site,
                },
                { status: 409 },
            );
        }

        return NextResponse.json({
            success: true,
            available: true,
            domain: result.domain,
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/check-domain]', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to check domain.',
            },
            { status: 500 },
        );
    }
}

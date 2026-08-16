import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { uploadSiteAssets } from '@/features/sites/uploadSiteAssets';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();

        const siteId = String(formData.get('siteId') ?? '').trim();

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Site ID is required.',
                },
                { status: 400 },
            );
        }

        const logoFile = formData.get('logo') as File | null;
        const faviconFile = formData.get('favicon') as File | null;

        const result = await uploadSiteAssets({
            siteId,
            logoFile,
            faviconFile,
        });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/assets]', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to upload site assets.',
            },
            { status: 500 },
        );
    }
}

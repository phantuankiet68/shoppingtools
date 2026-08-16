import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { validateSiteInput } from '@/features/sites/validateSite';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const result = validateSiteInput(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error.flatten(),
                },
                { status: 400 },
            );
        }

        const workspaceId = result.data.workspaceId ?? session.currentWorkspace?.id;

        if (!workspaceId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No workspace selected.',
                },
                { status: 400 },
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...result.data,
                workspaceId,
            },
        });
    } catch (error) {
        console.error('[POST /api/admin/sites/validate]', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to validate site data.',
            },
            { status: 500 },
        );
    }
}

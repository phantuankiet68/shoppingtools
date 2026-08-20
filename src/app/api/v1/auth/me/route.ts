import { NextRequest, NextResponse } from 'next/server';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';
import { getCurrentUser } from '@/services/auth/me.service';

export async function GET(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                { status: 401 },
            );
        }

        const user = await getCurrentUser(auth.user.id);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('[GET /api/v1/auth/me]', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to get current user',
            },
            { status: 500 },
        );
    }
}

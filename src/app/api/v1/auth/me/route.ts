import { NextRequest, NextResponse } from 'next/server';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';
import { getCurrentUser } from '@/services/auth/me.service';

export async function GET(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        // Guest user: không xem là lỗi hệ thống
        if (!auth.ok) {
            return NextResponse.json(
                {
                    success: true,
                    isAuthenticated: false,
                    user: null,
                },
                { status: 200 },
            );
        }

        const user = await getCurrentUser(auth.user.id);

        if (!user) {
            return NextResponse.json(
                {
                    success: true,
                    isAuthenticated: false,
                    user: null,
                },
                { status: 200 },
            );
        }

        return NextResponse.json({
            success: true,
            isAuthenticated: true,
            user,
        });
    } catch (error) {
        console.error('[AUTH_ME_GET]', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                user: null,
            },
            { status: 500 },
        );
    }
}

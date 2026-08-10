import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';

function error(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        {
            status,
        },
    );
}

export async function PATCH(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

        const user = await prisma.user.findUnique({
            where: {
                id: auth.user.id,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            return error('User not found.', 404);
        }

        return NextResponse.json({
            success: false,
            message: 'Business information is no longer stored in Profile.',
        });
    } catch (err) {
        console.error('[PROFILE_BUSINESS]', err);

        return error('Internal server error.', 500);
    }
}

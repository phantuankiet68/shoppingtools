import { NextRequest, NextResponse } from 'next/server';

import { signUp } from '@/services/auth/auth.service';
import { setAccessTokenCookie, setRefreshTokenCookie } from '@/services/auth/cookie.service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const result = await signUp({
            dto: body,
        });

        await setAccessTokenCookie(result.accessToken);

        await setRefreshTokenCookie(result.refreshToken);

        return NextResponse.json(
            {
                user: result.user,
                expiresIn: result.expiresIn,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : 'Unable to create account.',
            },
            {
                status: 400,
            },
        );
    }
}

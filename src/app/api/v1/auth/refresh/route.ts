import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH } from '@/constants/auth';
import { refreshSession } from '@/services/auth/refresh.service';
import { setAccessTokenCookie, setRefreshTokenCookie } from '@/services/auth/cookie.service';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        const refreshToken = cookieStore.get(AUTH.REFRESH_COOKIE_NAME)?.value;

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Refresh token not found',
                },
                {
                    status: 401,
                },
            );
        }

        const result = await refreshSession({
            refreshToken,
            ipAddress:
                request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '',
            userAgent: request.headers.get('user-agent') ?? '',
        });

        await setAccessTokenCookie(result.accessToken);
        await setRefreshTokenCookie(result.refreshToken);

        return NextResponse.json({
            success: true,
            expiresIn: result.expiresIn,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Refresh token invalid',
            },
            {
                status: 401,
            },
        );
    }
}

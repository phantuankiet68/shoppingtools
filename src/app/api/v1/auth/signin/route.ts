import { NextRequest, NextResponse } from 'next/server';
import { SignInSchema } from '@/features/auth/schemas';
import { signIn } from '@/services/auth/auth.service';
import { setAccessTokenCookie, setRefreshTokenCookie } from '@/services/auth/cookie.service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const dto = SignInSchema.parse(body);

        const result = await signIn({
            dto,
            ipAddress:
                request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '',
            userAgent: request.headers.get('user-agent') ?? '',
        });

        await setAccessTokenCookie(result.accessToken);
        await setRefreshTokenCookie(result.refreshToken);

        return NextResponse.json({
            success: true,
            expiresIn: result.expiresIn,
            user: result.user,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Email or password is incorrect',
            },
            {
                status: 401,
            },
        );
    }
}

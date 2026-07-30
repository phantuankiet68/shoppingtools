import { cookies } from 'next/headers';
import { AUTH } from '@/constants/auth';

const isProduction = process.env.NODE_ENV === 'production';

export async function setAccessTokenCookie(token: string) {
    const cookieStore = await cookies();

    cookieStore.set(AUTH.ACCESS_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: AUTH.ACCESS_TOKEN_TTL,
    });
}

export async function setRefreshTokenCookie(token: string) {
    const cookieStore = await cookies();

    cookieStore.set(AUTH.REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: AUTH.REFRESH_TOKEN_TTL,
    });
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();

    cookieStore.delete(AUTH.ACCESS_COOKIE_NAME);
    cookieStore.delete(AUTH.REFRESH_COOKIE_NAME);
}

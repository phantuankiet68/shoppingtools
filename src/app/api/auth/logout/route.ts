import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function revokeSessionByToken(_: string) {
    return;
}

export function clearSessionCookie(response: NextResponse) {
    response.cookies.delete('admin_session');
}

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

        if (token) {
            await revokeSessionByToken(token);
        }

        const response = NextResponse.json({ message: 'Đăng xuất thành công.' });
        clearSessionCookie(response);

        return response;
    } catch (error) {
        console.error('LOGOUT_ERROR', error);
        const response = NextResponse.json({ message: 'Đăng xuất thành công.' });
        clearSessionCookie(response);
        return response;
    }
}

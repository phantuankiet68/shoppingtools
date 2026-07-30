import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH } from '@/constants/auth';
import { signOut } from '@/services/auth/signout.service';
import { clearAuthCookies } from '@/services/auth/cookie.service';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get(AUTH.ACCESS_COOKIE_NAME)?.value;

        if (accessToken) {
            await signOut(accessToken);
        }

        await clearAuthCookies();

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        await clearAuthCookies();

        return NextResponse.json({
            success: true,
        });
    }
}

import { getAuthContextFromRequest } from '@/lib/auth/guard';
import { NextRequest, NextResponse } from 'next/server';

const LOGIN_PATH = '/login';
const PLATFORM_HOME = '/platform';
const ADMIN_HOME = '/admin';

function redirectToLogin(req: NextRequest, clearCookie = false, preserveNext = false) {
    const url = new URL(LOGIN_PATH, req.url);

    if (preserveNext) {
        url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
    }

    const res = NextResponse.redirect(url);

    if (clearCookie) {
        res.cookies.set('admin_session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        });
    }

    return res;
}

function redirectToHomeByRole(req: NextRequest, role?: string) {
    switch (role) {
        case 'SUPER_ADMIN':
            return NextResponse.redirect(new URL(PLATFORM_HOME, req.url));

        case 'ADMIN':
            return NextResponse.redirect(new URL(ADMIN_HOME, req.url));

        default:
            return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
    }
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isLoginPage = pathname === LOGIN_PATH;

    const isPlatformRoute = pathname === '/platform' || pathname.startsWith('/platform/');

    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

    if (!isLoginPage && !isPlatformRoute && !isAdminRoute) {
        return NextResponse.next();
    }

    const auth = await getAuthContextFromRequest(req);

    if (isLoginPage) {
        if (!auth.ok) {
            return NextResponse.next();
        }

        return redirectToHomeByRole(req, auth.user.systemRole);
    }

    if (!auth.ok) {
        return redirectToLogin(req, auth.clearCookie, true);
    }

    if (isPlatformRoute && auth.user.systemRole !== 'SUPER_ADMIN') {
        return redirectToHomeByRole(req, auth.user.systemRole);
    }

    if (isAdminRoute && auth.user.systemRole !== 'ADMIN') {
        return redirectToHomeByRole(req, auth.user.systemRole);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/admin', '/admin/:path*', '/platform', '/platform/:path*'],
};

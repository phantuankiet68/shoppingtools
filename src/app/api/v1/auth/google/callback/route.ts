import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { AUTH } from '@/constants/auth';
import { signInWithGoogle } from '@/services/auth/auth.service';
import { google } from '@/services/auth/google.service';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();

    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');

    const storedState = cookieStore.get('google_oauth_state')?.value ?? null;

    const codeVerifier = cookieStore.get('google_code_verifier')?.value ?? null;

    if (!code || !state) {
        return NextResponse.json(
            {
                success: false,
                message: 'Missing OAuth parameters.',
            },
            {
                status: 400,
            },
        );
    }

    if (!storedState || !codeVerifier) {
        return NextResponse.json(
            {
                success: false,
                message: 'OAuth session has expired.',
            },
            {
                status: 400,
            },
        );
    }

    if (storedState !== state) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid OAuth state.',
            },
            {
                status: 400,
            },
        );
    }

    try {
        /**
         * Exchange authorization code
         */
        const tokens = await google.validateAuthorizationCode(code, codeVerifier);

        const googleAccessToken = tokens.accessToken();

        /**
         * Fetch Google profile
         */
        const googleResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: {
                Authorization: `Bearer ${googleAccessToken}`,
            },
            cache: 'no-store',
        });

        if (!googleResponse.ok) {
            throw new Error('Unable to fetch Google profile.');
        }

        const googleUser = await googleResponse.json();

        if (!googleUser.email) {
            throw new Error('Google account does not contain an email.');
        }

        if (!googleUser.email_verified) {
            throw new Error('Google email is not verified.');
        }

        /**
         * Login/Create local account
         */
        const result = await signInWithGoogle({
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            ipAddress:
                request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '',
            userAgent: request.headers.get('user-agent') ?? '',
        });

        /**
         * Redirect Home
         */
        const host = request.headers.get('host')!;
        const protocol = request.headers.get('x-forwarded-proto') ?? 'http';

        const response = NextResponse.redirect(`${protocol}://${host}/`);

        /**
         * Access Token
         */
        response.cookies.set(AUTH.ACCESS_COOKIE_NAME, result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: AUTH.ACCESS_TOKEN_TTL,
        });

        /**
         * Refresh Token
         */
        response.cookies.set(AUTH.REFRESH_COOKIE_NAME, result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: AUTH.REFRESH_TOKEN_TTL,
        });

        /**
         * Cleanup OAuth cookies
         */
        response.cookies.delete('google_oauth_state');
        response.cookies.delete('google_code_verifier');

        return response;
    } catch (error) {
        console.error(error);

        const response = NextResponse.json(
            {
                success: false,
                message: 'Google authentication failed.',
            },
            {
                status: 500,
            },
        );

        response.cookies.delete('google_oauth_state');
        response.cookies.delete('google_code_verifier');

        return response;
    }
}

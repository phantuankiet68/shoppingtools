import { NextResponse } from 'next/server';
import { generateCodeVerifier, generateState } from 'arctic';
import { google } from '@/services/auth/google.service';

export async function GET() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile']);

    const response = NextResponse.redirect(url);

    response.cookies.set('google_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10,
    });

    response.cookies.set('google_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10,
    });

    return response;
}

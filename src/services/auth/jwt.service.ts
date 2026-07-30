import { SignJWT, jwtVerify } from 'jose';
import { AUTH } from '@/constants/auth';
import type { JwtPayload } from './auth.types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createAccessToken(payload: JwtPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer(AUTH.ACCESS_TOKEN_ISSUER)
        .setAudience(AUTH.ACCESS_TOKEN_AUDIENCE)
        .setExpirationTime(AUTH.ACCESS_TOKEN_EXPIRES)
        .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, secret, {
        issuer: AUTH.ACCESS_TOKEN_ISSUER,
        audience: AUTH.ACCESS_TOKEN_AUDIENCE,
    });

    return payload as unknown as JwtPayload;
}

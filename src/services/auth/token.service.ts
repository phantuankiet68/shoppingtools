import { JWTPayload, SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
}

const secret = new TextEncoder().encode(JWT_SECRET);

export type AccessTokenPayload = JWTPayload & {
    userId: string;
    email: string;
    systemRole: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
};

export async function createAccessToken(payload: {
    userId: string;
    email: string;
    systemRole: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
}) {
    return await new SignJWT({
        userId: payload.userId,
        email: payload.email,
        systemRole: payload.systemRole,
    })
        .setProtectedHeader({
            alg: 'HS256',
        })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, secret);

    return payload as AccessTokenPayload;
}

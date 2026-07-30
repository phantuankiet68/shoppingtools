import type { JWTPayload } from 'jose';

export type SystemRole = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

export interface JwtPayload extends JWTPayload {
    uid: string;
    sid: string;
    role: SystemRole;
}

export interface SessionData {
    sessionId: string;
    refreshToken: string;
    refreshTokenHash: string;
    expiresAt: Date;
}
export interface SignUpRequest {
    fullName: string;
    email: string;
    password: string;
}

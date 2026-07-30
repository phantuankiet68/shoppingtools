import { AUTH } from '@/constants/auth';
import { generateToken } from '@/utils/crypto';
import { sha256 } from '@/utils/hash';
import { createSession } from './auth.repository';

interface CreateSessionOptions {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
}
export async function createUserSession(options: CreateSessionOptions) {
    const refreshToken = generateToken(64);
    const refreshTokenHash = sha256(refreshToken);

    const expiresAt = new Date(Date.now() + AUTH.REFRESH_TOKEN_TTL * 1000);

    const session = await createSession({
        userId: options.userId,
        refreshTokenHash,
        expiresAt,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        deviceId: options.deviceId,
    });

    return {
        session,
        refreshToken,
    };
}

import { UserStatus } from '@/generated/prisma';
import { AUTH } from '@/constants/auth';
import { generateToken } from '@/utils/crypto';
import { sha256 } from '@/utils/hash';
import { createAccessToken } from './jwt.service';
import { findSessionByRefreshTokenHash, rotateSession } from './auth.repository';

interface RefreshOptions {
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
}

export async function refreshSession(options: RefreshOptions) {
    const refreshTokenHash = sha256(options.refreshToken);

    const session = await findSessionByRefreshTokenHash(refreshTokenHash);

    if (!session) {
        throw new Error('Invalid refresh token');
    }

    if (session.revokedAt) {
        throw new Error('Session has been revoked');
    }

    if (session.expiresAt < new Date()) {
        throw new Error('Refresh token expired');
    }

    if (session.user.status !== UserStatus.ACTIVE) {
        throw new Error('Account unavailable');
    }

    const newRefreshToken = generateToken(64);
    const newRefreshTokenHash = sha256(newRefreshToken);

    const expiresAt = new Date(Date.now() + AUTH.REFRESH_TOKEN_TTL * 1000);

    const newSession = await rotateSession({
        oldSessionId: session.id,
        userId: session.user.id,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        deviceId: options.deviceId,
    });

    const accessToken = await createAccessToken({
        uid: session.user.id,
        sid: newSession.id,
        role: session.user.systemRole,
    });

    return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: AUTH.ACCESS_TOKEN_TTL,
    };
}

import { prisma } from '@/lib/prisma';

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            passwordHash: true,
            siteId: true,
            status: true,
            systemRole: true,
        },
    });
}

export async function createSession(data: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
}) {
    return prisma.userSession.create({
        data: {
            userId: data.userId,
            refreshTokenHash: data.refreshTokenHash,
            expiresAt: data.expiresAt,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            deviceId: data.deviceId,
            lastSeenAt: new Date(),
        },
    });
}

export async function findSessionByRefreshTokenHash(refreshTokenHash: string) {
    return prisma.userSession.findUnique({
        where: {
            refreshTokenHash,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    siteId: true,
                    status: true,
                    systemRole: true,
                },
            },
        },
    });
}

export async function rotateSession(data: {
    oldSessionId: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
}) {
    return prisma.$transaction(async (tx) => {
        await tx.userSession.update({
            where: {
                id: data.oldSessionId,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        return tx.userSession.create({
            data: {
                userId: data.userId,
                refreshTokenHash: data.refreshTokenHash,
                expiresAt: data.expiresAt,
                rotatedFromSessionId: data.oldSessionId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                deviceId: data.deviceId,
                lastSeenAt: new Date(),
            },
        });
    });
}

export async function updateLastLogin(userId: string) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            lastLoginAt: new Date(),
        },
    });
}

export async function createLoginAttempt(data: {
    email?: string;
    userId?: string;
    ipAddress: string;
    userAgent?: string;
    success: boolean;
}) {
    return prisma.loginAttempt.create({
        data,
    });
}
export async function revokeSession(sessionId: string) {
    return prisma.userSession.update({
        where: {
            id: sessionId,
        },
        data: {
            revokedAt: new Date(),
        },
    });
}

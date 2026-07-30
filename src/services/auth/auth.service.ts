import { SystemRole, UserStatus } from '@/generated/prisma';
import { AUTH } from '@/constants/auth';
import type { SignInDto } from '@/features/auth/dto';
import { findUserByEmail } from './auth.repository';
import { verifyPassword } from './password.service';
import { createUserSession } from './session.service';
import { createAccessToken } from './jwt.service';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { hashPassword } from './password.service';

import type { SignUpDto } from '@/features/auth/dto';

interface SignInOptions {
    dto: SignInDto;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
}

interface GoogleSignInOptions {
    email: string;
    name?: string;
    avatar?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
}

export async function signIn(options: SignInOptions) {
    const { dto } = options;

    const user = await findUserByEmail(dto.email);

    if (!user) {
        throw new Error('Email or password is incorrect');
    }

    if (user.status !== UserStatus.ACTIVE) {
        throw new Error('Account is unavailable');
    }

    if (user.systemRole !== SystemRole.CUSTOMER) {
        throw new Error('Permission denied');
    }

    const isValidPassword = await verifyPassword(dto.password, user.passwordHash);

    if (!isValidPassword) {
        throw new Error('Email or password is incorrect');
    }

    const { session, refreshToken } = await createUserSession({
        userId: user.id,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        deviceId: options.deviceId,
    });

    const accessToken = await createAccessToken({
        uid: user.id,
        sid: session.id,
        role: user.systemRole,
    });

    return {
        accessToken,
        refreshToken,
        expiresIn: AUTH.ACCESS_TOKEN_TTL,
        user: {
            id: user.id,
            email: user.email,
            siteId: user.siteId,
            systemRole: user.systemRole,
        },
    };
}
export async function signInWithGoogle(options: GoogleSignInOptions) {
    let user = await prisma.user.findUnique({
        where: {
            email: options.email,
        },
        select: {
            id: true,
            email: true,
            siteId: true,
            status: true,
            systemRole: true,
        },
    });

    if (!user) {
        const passwordHash = await hashPassword(randomUUID());

        user = await prisma.user.create({
            data: {
                email: options.email,
                passwordHash,
                image: options.avatar ?? null,
                systemRole: SystemRole.CUSTOMER,
                status: UserStatus.ACTIVE,
            },
            select: {
                id: true,
                email: true,
                siteId: true,
                status: true,
                systemRole: true,
            },
        });
    }

    if (user.status !== UserStatus.ACTIVE) {
        throw new Error('Account is unavailable');
    }

    const { session, refreshToken } = await createUserSession({
        userId: user.id,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        deviceId: options.deviceId,
    });

    const accessToken = await createAccessToken({
        uid: user.id,
        sid: session.id,
        role: user.systemRole,
    });

    return {
        accessToken,
        refreshToken,
        expiresIn: AUTH.ACCESS_TOKEN_TTL,
        user: {
            id: user.id,
            email: user.email,
            siteId: user.siteId,
            systemRole: user.systemRole,
        },
    };
}
interface SignUpOptions {
    dto: SignUpDto;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
}

export async function signUp(options: SignUpOptions) {
    const { dto } = options;

    const email = dto.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
        },
    });

    if (existingUser) {
        throw new Error('Email already exists.');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            systemRole: SystemRole.CUSTOMER,
            status: UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            siteId: true,
            systemRole: true,
            status: true,
        },
    });

    const { session, refreshToken } = await createUserSession({
        userId: user.id,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        deviceId: options.deviceId,
    });

    const accessToken = await createAccessToken({
        uid: user.id,
        sid: session.id,
        role: user.systemRole,
    });

    return {
        accessToken,
        refreshToken,
        expiresIn: AUTH.ACCESS_TOKEN_TTL,
        user: {
            id: user.id,
            email: user.email,
            siteId: user.siteId,
            systemRole: user.systemRole,
        },
    };
}

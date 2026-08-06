import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';

import { generateOtp } from '@/lib/auth/otp';

import { hashOtp } from '@/lib/auth/otp-hash';

import { hashPassword, verifyPassword } from '@/lib/auth/password';

import { isPasswordValid } from '@/lib/auth/password-policy';

import { sendChangePasswordOtp } from '@/lib/email/send-change-password-otp';

const OTP_EXPIRES_MINUTES = 5;

interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

function badRequest(message: string) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        {
            status: 400,
        },
    );
}

function unauthorized() {
    return NextResponse.json(
        {
            success: false,
            message: 'Unauthorized',
        },
        {
            status: 401,
        },
    );
}

function forbidden(message: string) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        {
            status: 403,
        },
    );
}

function serverError() {
    return NextResponse.json(
        {
            success: false,
            message: 'Internal server error.',
        },
        {
            status: 500,
        },
    );
}

function generateExpiresAt() {
    return new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
}

function validateBody(body: Partial<ChangePasswordRequest>) {
    if (!body.currentPassword?.trim()) {
        return 'Current password is required.';
    }

    if (!body.newPassword?.trim()) {
        return 'New password is required.';
    }

    if (!body.confirmPassword?.trim()) {
        return 'Confirm password is required.';
    }

    if (body.newPassword !== body.confirmPassword) {
        return 'Passwords do not match.';
    }

    if (!isPasswordValid(body.newPassword)) {
        return 'Password does not meet security requirements.';
    }

    if (body.currentPassword === body.newPassword) {
        return 'New password must be different from your current password.';
    }

    return null;
}
export async function POST(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return unauthorized();
        }

        const body = (await request.json()) as Partial<ChangePasswordRequest>;

        const validationError = validateBody(body);

        if (validationError) {
            return badRequest(validationError);
        }

        const user = await prisma.user.findUnique({
            where: {
                id: auth.user.id,
            },
            select: {
                id: true,
                email: true,
                status: true,
                passwordHash: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                {
                    status: 404,
                },
            );
        }

        if (user.status !== 'ACTIVE') {
            return forbidden('Your account has been suspended.');
        }

        const passwordMatched = await verifyPassword(body.currentPassword!, user.passwordHash);

        if (!passwordMatched) {
            return badRequest('Current password is incorrect.');
        }

        const otp = generateOtp();

        const otpHash = await hashOtp(otp);

        const newPasswordHash = await hashPassword(body.newPassword!);

        const expiresAt = generateExpiresAt();

        const verification = await prisma.$transaction(async (tx) => {
            await tx.changePasswordToken.deleteMany({
                where: {
                    userId: user.id,
                },
            });

            return tx.changePasswordToken.create({
                data: {
                    userId: user.id,
                    newPasswordHash,
                    otpHash,
                    expiresAt,
                },
                select: {
                    id: true,
                    expiresAt: true,
                },
            });
        });

        /**
         * TODO:
         * Gửi OTP qua email
         */
        try {
            await sendChangePasswordOtp({
                email: user.email,
                otp,
            });
        } catch (error) {
            console.error('[CHANGE_PASSWORD_EMAIL]', error);

            await prisma.changePasswordToken.deleteMany({
                where: {
                    id: verification.id,
                    userId: user.id,
                },
            });

            return NextResponse.json(
                {
                    success: false,
                    message: 'Unable to send verification email. Please try again.',
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Verification code has been sent to your email.',
            verificationId: verification.id,
            expiresAt: verification.expiresAt,
        });
    } catch (error) {
        console.error('[CHANGE_PASSWORD]', error);

        return serverError();
    }
}

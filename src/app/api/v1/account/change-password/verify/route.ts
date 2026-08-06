import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';
import { verifyOtp } from '@/lib/auth/otp-hash';

interface VerifyChangePasswordRequest {
    verificationId: string;
    otp: string;
}

const MAX_OTP_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
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

        const body = (await request.json()) as Partial<VerifyChangePasswordRequest>;

        if (!body.verificationId?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Verification ID is required.',
                },
                {
                    status: 400,
                },
            );
        }

        if (!body.otp?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Verification code is required.',
                },
                {
                    status: 400,
                },
            );
        }

        const token = await prisma.changePasswordToken.findUnique({
            where: {
                id: body.verificationId,
            },
        });

        if (!token || token.userId !== auth.user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Verification session not found.',
                },
                {
                    status: 404,
                },
            );
        }

        if (token.expiresAt <= new Date()) {
            await prisma.changePasswordToken.delete({
                where: {
                    id: token.id,
                },
            });

            return NextResponse.json(
                {
                    success: false,
                    message: 'Verification code has expired.',
                },
                {
                    status: 400,
                },
            );
        }

        if (token.attempts >= MAX_OTP_ATTEMPTS) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Too many incorrect verification attempts. Please request a new verification code.',
                },
                {
                    status: 429,
                },
            );
        }

        const matched = await verifyOtp(body.otp, token.otpHash);

        if (!matched) {
            const attempts = token.attempts + 1;

            await prisma.changePasswordToken.update({
                where: {
                    id: token.id,
                },
                data: {
                    attempts,
                },
            });

            if (attempts >= MAX_OTP_ATTEMPTS) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Too many incorrect verification attempts. Please request a new verification code.',
                    },
                    {
                        status: 429,
                    },
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid verification code.',
                },
                {
                    status: 400,
                },
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: {
                    id: auth.user.id,
                },
                data: {
                    passwordHash: token.newPasswordHash,
                },
            });

            await tx.userSession.deleteMany({
                where: {
                    userId: auth.user.id,
                },
            });

            await tx.changePasswordToken.delete({
                where: {
                    id: token.id,
                },
            });

            /**
             * Nếu có AuditLog thì thêm ở đây
             *
             * await tx.auditLog.create(...)
             */
        });

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully.',
        });
    } catch (error) {
        console.error('[VERIFY_CHANGE_PASSWORD]', error);

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
}

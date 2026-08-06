import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';

import { generateOtp } from '@/lib/auth/otp';
import { hashOtp } from '@/lib/auth/otp-hash';

import { sendChangePasswordOtp } from '@/lib/email/send-change-password-otp';

const MAX_RESEND_COUNT = 3;

const OTP_EXPIRES_MINUTES = 5;

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

        const token = await prisma.changePasswordToken.findFirst({
            where: {
                userId: auth.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No pending password change request found.',
                },
                {
                    status: 404,
                },
            );
        }

        if (token.resendCount >= MAX_RESEND_COUNT) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Maximum resend attempts reached. Please start the password change process again.',
                },
                {
                    status: 429,
                },
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: auth.user.id,
            },
            select: {
                email: true,
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

        const otp = generateOtp();

        const otpHash = await hashOtp(otp);

        const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

        const updatedToken = await prisma.changePasswordToken.update({
            where: {
                id: token.id,
            },
            data: {
                otpHash,
                expiresAt,
                attempts: 0,
                resendCount: {
                    increment: 1,
                },
            },
            select: {
                id: true,
                expiresAt: true,
                resendCount: true,
            },
        });

        try {
            await sendChangePasswordOtp({
                email: user.email,
                otp,
            });
        } catch (error) {
            console.error('[CHANGE_PASSWORD_RESEND_EMAIL]', error);

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
            message: 'Verification code has been resent successfully.',
            resendCount: updatedToken.resendCount,
            expiresAt: updatedToken.expiresAt,
        });
    } catch (error) {
        console.error('[CHANGE_PASSWORD_RESEND]', error);

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

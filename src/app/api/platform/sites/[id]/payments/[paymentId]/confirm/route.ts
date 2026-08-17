import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';
import { prisma } from '@/lib/prisma';

const ALLOWED_BILLING_MONTHS = new Set([1, 3, 6, 12]);

const addMonths = (date: Date, months: number) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; paymentId: string }> },
) {
    try {
        const auth = await getUserFromRequest();

        if (!auth || !hasRole(auth.systemRole, 'SUPER_ADMIN')) {
            return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
        }

        const { id: siteId, paymentId } = await params;

        if (!siteId || !paymentId) {
            return NextResponse.json(
                { success: false, message: 'Site ID and payment ID are required.' },
                { status: 400 },
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const [payment, subscription] = await Promise.all([
                tx.paymentSite.findFirst({
                    where: { id: paymentId, siteId },
                    select: {
                        id: true,
                        siteId: true,
                        subscriptionId: true,
                        amount: true,
                        currency: true,
                        status: true,
                        billingMonths: true,
                        paymentCode: true,
                        invoiceNumber: true,
                        paidAt: true,
                    },
                }),
                tx.siteSubscription.findUnique({
                    where: { siteId },
                    select: {
                        id: true,
                        status: true,
                        currentPeriodStart: true,
                        currentPeriodEnd: true,
                    },
                }),
            ]);

            if (!payment) {
                return { error: 'Payment not found.', status: 404 };
            }

            if (!subscription) {
                return {
                    error: 'This site does not have a subscription.',
                    status: 409,
                };
            }

            if (payment.status !== 'PENDING') {
                return {
                    error: `Payment is already ${payment.status.toLowerCase()}.`,
                    status: 409,
                };
            }

            if (payment.subscriptionId && payment.subscriptionId !== subscription.id) {
                return {
                    error: 'Payment does not belong to the site subscription.',
                    status: 409,
                };
            }

            if (!ALLOWED_BILLING_MONTHS.has(payment.billingMonths)) {
                return {
                    error: 'Invalid billing period. Allowed values are 1, 3, 6 or 12 months.',
                    status: 400,
                };
            }

            const amount = Number(payment.amount);

            if (!Number.isFinite(amount) || amount <= 0) {
                return {
                    error: 'Invalid payment amount.',
                    status: 400,
                };
            }

            const now = new Date();
            const currentEnd = subscription.currentPeriodEnd;
            const periodStart =
                subscription.status === 'TRIAL' || currentEnd <= now ? now : currentEnd;
            const periodEnd = addMonths(periodStart, payment.billingMonths);

            const updated = await tx.paymentSite.updateMany({
                where: {
                    id: payment.id,
                    siteId,
                    status: 'PENDING',
                },
                data: {
                    status: 'SUCCESS',
                    subscriptionId: subscription.id,
                    paidAt: now,
                },
            });

            if (updated.count !== 1) {
                return {
                    error: 'Payment has already been processed.',
                    status: 409,
                };
            }

            await tx.siteSubscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'ACTIVE',
                    currentPeriodStart: periodStart,
                    currentPeriodEnd: periodEnd,
                    nextBillingAt: periodEnd,
                    canceledAt: null,
                    autoRenew: true,
                },
            });

            await tx.site.update({
                where: { id: siteId },
                data: {
                    status: 'PUBLISHED',
                    isPublic: true,
                    publishedAt: now,
                },
            });

            const confirmedPayment = await tx.paymentSite.findUnique({
                where: { id: payment.id },
                select: {
                    id: true,
                    status: true,
                    amount: true,
                    currency: true,
                    billingMonths: true,
                    paymentCode: true,
                    invoiceNumber: true,
                    paidAt: true,
                },
            });

            return {
                payment: confirmedPayment,
                subscription: {
                    id: subscription.id,
                    status: 'ACTIVE',
                    currentPeriodStart: periodStart,
                    currentPeriodEnd: periodEnd,
                    nextBillingAt: periodEnd,
                },
                site: {
                    id: siteId,
                    status: 'PUBLISHED',
                    isPublic: true,
                },
            };
        });

        if ('error' in result) {
            return NextResponse.json(
                { success: false, message: result.error },
                { status: result.status },
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payment confirmed and site activated successfully.',
            data: result,
        });
    } catch (error) {
        console.error('CONFIRM_SITE_PAYMENT_ERROR', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to confirm payment.',
            },
            { status: 500 },
        );
    }
}

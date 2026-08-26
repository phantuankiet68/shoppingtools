import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type RouteContext = {
    params: Promise<{
        id: string;
        paymentId: string;
    }>;
};

function json(data: unknown, status = 200) {
    return NextResponse.json(data, {
        status,
        headers: {
            'Cache-Control': 'no-store',
        },
    });
}

export async function POST(request: Request, { params }: RouteContext) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return json(
                {
                    success: false,
                    error: 'Unauthorized.',
                },
                401,
            );
        }

        const { id: siteId, paymentId } = await params;

        if (!siteId || !paymentId) {
            return json(
                {
                    success: false,
                    error: 'Site ID and payment ID are required.',
                },
                400,
            );
        }

        const workspaceId = session.currentWorkspace?.id ?? null;

        if (!workspaceId) {
            return json(
                {
                    success: false,
                    error: 'No workspace selected.',
                },
                400,
            );
        }

        const site = await prisma.site.findFirst({
            where: {
                id: siteId,
                workspaceId,
                ownerUserId: session.user.id,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

        if (!site) {
            return json(
                {
                    success: false,
                    error: 'Site not found.',
                },
                404,
            );
        }

        const payment = await prisma.paymentSite.findFirst({
            where: {
                id: paymentId,
                siteId: site.id,
            },
            select: {
                id: true,
                siteId: true,
                amount: true,
                currency: true,
                billingMonths: true,
                paymentCode: true,
                status: true,
                provider: true,
                method: true,
                invoiceNumber: true,
                paidAt: true,
                confirmationRequestedAt: true,
                confirmationRequestedById: true,
                confirmationNote: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!payment) {
            return json(
                {
                    success: false,
                    error: 'Payment not found.',
                },
                404,
            );
        }

        if (payment.status !== 'PENDING') {
            return json(
                {
                    success: false,
                    error: `Payment cannot be confirmed because its status is ${payment.status}.`,
                },
                409,
            );
        }

        if (payment.confirmationRequestedAt) {
            return json({
                success: true,
                alreadyRequested: true,
                message: 'Payment confirmation has already been submitted.',
                payment: {
                    ...payment,
                    amount: payment.amount.toString(),
                },
            });
        }

        const body = await request.json().catch(() => ({}));

        const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 1000) : null;

        const updatedPayment = await prisma.paymentSite.update({
            where: {
                id: payment.id,
            },
            data: {
                confirmationRequestedAt: new Date(),
                confirmationRequestedById: session.user.id,
                confirmationNote: note,
            },
            select: {
                id: true,
                siteId: true,
                subscriptionId: true,
                amount: true,
                currency: true,
                billingMonths: true,
                paymentCode: true,
                status: true,
                provider: true,
                method: true,
                transactionId: true,
                invoiceNumber: true,
                receiptUrl: true,
                description: true,
                paidAt: true,
                confirmationRequestedAt: true,
                confirmationRequestedById: true,
                confirmationNote: true,
                providerEventId: true,
                failureCode: true,
                failureMessage: true,
                refundedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return json({
            success: true,
            message: 'Payment confirmation submitted successfully.',
            payment: {
                ...updatedPayment,
                amount: updatedPayment.amount.toString(),
            },
        });
    } catch (error) {
        console.error('POST /api/admin/sites/[id]/payments/[paymentId]/confirm error:', error);

        return json(
            {
                success: false,
                error: 'Failed to submit payment confirmation.',
            },
            500,
        );
    }
}

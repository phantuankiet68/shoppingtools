import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

const ALLOWED_MONTHS = [1, 3, 6, 12] as const;
type BillingMonths = (typeof ALLOWED_MONTHS)[number];

const PROVIDERS = ['STRIPE', 'PAYPAL', 'MOMO', 'VNPAY', 'MANUAL'] as const;
type PaymentProvider = (typeof PROVIDERS)[number];

const METHODS = ['CARD', 'BANK_TRANSFER', 'WALLET', 'CASH'] as const;
type PaymentMethod = (typeof METHODS)[number];

type CreatePaymentBody = {
    months?: unknown;
    provider?: unknown;
    method?: unknown;
    description?: unknown;
};

const PAYMENT_SELECT = {
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
} as const;

function json(data: unknown, status = 200) {
    return NextResponse.json(data, {
        status,
        headers: {
            'Cache-Control': 'no-store',
        },
    });
}

function parseBillingMonths(value: unknown): BillingMonths | null {
    const months = Number(value);

    return Number.isInteger(months) && ALLOWED_MONTHS.includes(months as BillingMonths)
        ? (months as BillingMonths)
        : null;
}

function parseProvider(value: unknown): PaymentProvider | null {
    return typeof value === 'string' && PROVIDERS.includes(value as PaymentProvider)
        ? (value as PaymentProvider)
        : null;
}

function parseMethod(value: unknown): PaymentMethod | null {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    return typeof value === 'string' && METHODS.includes(value as PaymentMethod)
        ? (value as PaymentMethod)
        : null;
}

function validatePaymentMethod(provider: PaymentProvider, method: PaymentMethod | null) {
    switch (provider) {
        case 'VNPAY':
            if (method && !['BANK_TRANSFER', 'WALLET', 'CARD'].includes(method)) {
                return 'VNPAY does not support this payment method.';
            }
            break;

        case 'MOMO':
            if (method && !['WALLET', 'CARD'].includes(method)) {
                return 'MOMO does not support this payment method.';
            }
            break;

        case 'STRIPE':
            if (method && method !== 'CARD') {
                return 'STRIPE requires CARD payment method.';
            }
            break;

        case 'PAYPAL':
            if (method && method !== 'WALLET') {
                return 'PAYPAL requires WALLET payment method.';
            }
            break;

        case 'MANUAL':
            if (!method) {
                return 'Manual payment requires a payment method.';
            }

            if (!['BANK_TRANSFER', 'CASH'].includes(method)) {
                return 'Manual payment only supports BANK_TRANSFER or CASH.';
            }
            break;
    }

    return null;
}

function generatePaymentCode() {
    return `KB${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

function generateInvoiceNumber() {
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const random = crypto.randomInt(100000, 1000000);

    return `INV-${year}${month}${day}-${random}`;
}

async function createUniquePaymentCode() {
    for (let attempt = 0; attempt < 10; attempt++) {
        const paymentCode = generatePaymentCode();

        const exists = await prisma.paymentSite.findUnique({
            where: {
                paymentCode,
            },
            select: {
                id: true,
            },
        });

        if (!exists) {
            return paymentCode;
        }
    }

    throw new Error('Unable to generate a unique payment code.');
}

async function createUniqueInvoiceNumber() {
    for (let attempt = 0; attempt < 10; attempt++) {
        const invoiceNumber = generateInvoiceNumber();

        const exists = await prisma.paymentSite.findFirst({
            where: {
                invoiceNumber,
            },
            select: {
                id: true,
            },
        });

        if (!exists) {
            return invoiceNumber;
        }
    }

    throw new Error('Unable to generate a unique invoice number.');
}

async function getAuthorizedSite(siteId: string, userId: string, workspaceId: string) {
    return prisma.site.findFirst({
        where: {
            id: siteId,
            workspaceId,
            ownerUserId: userId,
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            domain: true,
            type: true,
            status: true,
            subscription: {
                select: {
                    id: true,
                    planId: true,
                    status: true,
                    billingCycle: true,
                    autoRenew: true,
                    startedAt: true,
                    trialEndsAt: true,
                    currentPeriodStart: true,
                    currentPeriodEnd: true,
                    nextBillingAt: true,
                    canceledAt: true,
                    plan: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            price: true,
                            currency: true,
                            billingCycle: true,
                            status: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * GET /api/admin/sites/[id]/payments
 *
 * Returns payment history for one authorized site.
 */
export async function GET(request: Request, { params }: RouteContext) {
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

        const { id: siteId } = await params;

        if (!siteId || typeof siteId !== 'string') {
            return json(
                {
                    success: false,
                    error: 'Invalid site ID.',
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

        const url = new URL(request.url);

        const pageParam = Number(url.searchParams.get('page') ?? '1');

        const limitParam = Number(url.searchParams.get('limit') ?? '10');

        const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

        const limit =
            Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;

        const site = await getAuthorizedSite(siteId, session.user.id, workspaceId);

        if (!site) {
            return json(
                {
                    success: false,
                    error: 'Site not found.',
                },
                404,
            );
        }

        const skip = (page - 1) * limit;

        const [payments, total] = await prisma.$transaction([
            prisma.paymentSite.findMany({
                where: {
                    siteId: site.id,
                },
                orderBy: [
                    {
                        createdAt: 'desc',
                    },
                    {
                        id: 'desc',
                    },
                ],
                skip,
                take: limit,
                select: {
                    ...PAYMENT_SELECT,
                    subscription: {
                        select: {
                            id: true,
                            planId: true,
                            status: true,
                            billingCycle: true,
                            currentPeriodStart: true,
                            currentPeriodEnd: true,
                            nextBillingAt: true,
                            plan: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    price: true,
                                    currency: true,
                                    billingCycle: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.paymentSite.count({
                where: {
                    siteId: site.id,
                },
            }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return json({
            success: true,
            site: {
                id: site.id,
                name: site.name,
                domain: site.domain,
                type: site.type,
                status: site.status,
            },
            subscription: site.subscription
                ? {
                      ...site.subscription,
                      plan: site.subscription.plan
                          ? {
                                ...site.subscription.plan,
                                price: site.subscription.plan.price.toString(),
                            }
                          : null,
                  }
                : null,
            payments: payments.map((payment) => ({
                ...payment,
                amount: payment.amount.toString(),
                subscription: payment.subscription
                    ? {
                          ...payment.subscription,
                          plan: payment.subscription.plan
                              ? {
                                    ...payment.subscription.plan,
                                    price: payment.subscription.plan.price.toString(),
                                }
                              : null,
                      }
                    : null,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        });
    } catch (error) {
        console.error('GET /api/admin/sites/[id]/payments error:', error);

        return json(
            {
                success: false,
                error: 'Failed to load payment history.',
            },
            500,
        );
    }
}

/**
 * POST /api/admin/sites/[id]/payments
 *
 * Creates or reuses a pending payment for the site's subscription.
 *
 * IMPORTANT:
 * This endpoint ONLY creates/reuses the payment.
 * It does NOT confirm that the user has paid.
 *
 * "I have paid" must call:
 * POST /api/admin/sites/[id]/payments/[paymentId]/confirm
 */
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

        const { id: siteId } = await params;

        if (!siteId || typeof siteId !== 'string') {
            return json(
                {
                    success: false,
                    error: 'Invalid site ID.',
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

        let body: CreatePaymentBody;

        try {
            body = await request.json();
        } catch {
            return json(
                {
                    success: false,
                    error: 'Invalid JSON body.',
                },
                400,
            );
        }

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return json(
                {
                    success: false,
                    error: 'Invalid request body.',
                },
                400,
            );
        }

        const months = parseBillingMonths(body.months);

        if (months === null) {
            return json(
                {
                    success: false,
                    error: 'Invalid billing period. Allowed values are 1, 3, 6 or 12 months.',
                },
                400,
            );
        }

        const provider = parseProvider(body.provider);

        if (!provider) {
            return json(
                {
                    success: false,
                    error: 'Invalid payment provider.',
                },
                400,
            );
        }

        const method = parseMethod(body.method);

        if (body.method !== undefined && body.method !== null && body.method !== '' && !method) {
            return json(
                {
                    success: false,
                    error: 'Invalid payment method.',
                },
                400,
            );
        }

        const methodError = validatePaymentMethod(provider, method);

        if (methodError) {
            return json(
                {
                    success: false,
                    error: methodError,
                },
                400,
            );
        }

        let description: string | null = null;

        if (body.description !== undefined && body.description !== null) {
            if (typeof body.description !== 'string') {
                return json(
                    {
                        success: false,
                        error: 'Invalid payment description.',
                    },
                    400,
                );
            }

            description = body.description.trim();

            if (description.length > 500) {
                return json(
                    {
                        success: false,
                        error: 'Payment description must not exceed 500 characters.',
                    },
                    400,
                );
            }

            if (!description) {
                description = null;
            }
        }

        const site = await getAuthorizedSite(siteId, session.user.id, workspaceId);

        if (!site) {
            return json(
                {
                    success: false,
                    error: 'Site not found.',
                },
                404,
            );
        }

        if (site.status === 'SUSPENDED') {
            return json(
                {
                    success: false,
                    error: 'Suspended sites cannot create a payment.',
                },
                409,
            );
        }

        if (site.status === 'ARCHIVED') {
            return json(
                {
                    success: false,
                    error: 'Archived sites cannot create a payment.',
                },
                409,
            );
        }

        const subscription = site.subscription;

        if (!subscription) {
            return json(
                {
                    success: false,
                    error: 'This site does not have a subscription.',
                },
                409,
            );
        }

        const plan = subscription.plan;

        if (!plan) {
            return json(
                {
                    success: false,
                    error: 'This site does not have a pricing plan.',
                },
                409,
            );
        }

        if (plan.status !== 'ACTIVE') {
            return json(
                {
                    success: false,
                    error: 'The pricing plan is inactive.',
                },
                409,
            );
        }

        if (plan.billingCycle !== 'MONTHLY') {
            return json(
                {
                    success: false,
                    error: 'This payment endpoint currently supports monthly billing plans only.',
                },
                400,
            );
        }

        if (plan.currency !== 'VND') {
            return json(
                {
                    success: false,
                    error: 'This payment endpoint currently supports VND pricing only.',
                },
                409,
            );
        }

        if (plan.price.lessThanOrEqualTo(0)) {
            return json(
                {
                    success: false,
                    error: 'The pricing plan has an invalid price.',
                },
                409,
            );
        }

        if (subscription.status === 'CANCELED') {
            return json(
                {
                    success: false,
                    error: 'This subscription has been canceled.',
                },
                409,
            );
        }

        /*
         * A pending payment is unique per site.
         *
         * Same billing period:
         * -> reuse existing payment.
         *
         * Different billing period:
         * -> cancel previous pending payment,
         *    then create a new one.
         */
        const pendingPayment = await prisma.paymentSite.findFirst({
            where: {
                siteId: site.id,
                status: 'PENDING',
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: PAYMENT_SELECT,
        });

        if (
            pendingPayment &&
            pendingPayment.subscriptionId === subscription.id &&
            pendingPayment.billingMonths === months
        ) {
            const transferContent = `${pendingPayment.paymentCode} ${pendingPayment.billingMonths}M`;

            return json({
                success: true,
                existing: true,
                message: 'A pending payment already exists for this billing period.',
                payment: {
                    ...pendingPayment,
                    amount: pendingPayment.amount.toString(),
                },
                paymentInfo: {
                    paymentId: pendingPayment.id,
                    paymentCode: pendingPayment.paymentCode,
                    invoiceNumber: pendingPayment.invoiceNumber,
                    monthlyPrice: plan.price.toString(),
                    months: pendingPayment.billingMonths,
                    totalAmount: pendingPayment.amount.toString(),
                    currency: pendingPayment.currency,
                    provider: pendingPayment.provider,
                    method: pendingPayment.method,
                    transferContent,
                    status: pendingPayment.status,
                    confirmationRequestedAt: pendingPayment.confirmationRequestedAt,
                    confirmationRequestedById: pendingPayment.confirmationRequestedById,
                    confirmationNote: pendingPayment.confirmationNote,
                    plan: {
                        id: plan.id,
                        name: plan.name,
                        code: plan.code,
                        price: plan.price.toString(),
                        currency: plan.currency,
                        billingCycle: plan.billingCycle,
                    },
                    subscription: {
                        id: subscription.id,
                        status: subscription.status,
                        billingCycle: subscription.billingCycle,
                    },
                },
            });
        }

        if (pendingPayment) {
            await prisma.paymentSite.update({
                where: {
                    id: pendingPayment.id,
                },
                data: {
                    status: 'CANCELED',
                },
            });
        }

        /*
         * NEVER trust amount from the client.
         *
         * Calculate payment amount from the database pricing plan.
         */
        const monthlyPrice = plan.price;
        const totalAmount = monthlyPrice.mul(months);
        const currency = plan.currency;

        if (totalAmount.lessThanOrEqualTo(0)) {
            return json(
                {
                    success: false,
                    error: 'The calculated payment amount is invalid.',
                },
                409,
            );
        }

        const paymentCode = await createUniquePaymentCode();

        const invoiceNumber = await createUniqueInvoiceNumber();

        const transferContent = `${paymentCode} ${months}M`;

        const payment = await prisma.paymentSite.create({
            data: {
                siteId: site.id,
                subscriptionId: subscription.id,
                amount: totalAmount,
                currency,
                billingMonths: months,
                paymentCode,
                status: 'PENDING',
                provider,
                method,
                invoiceNumber,
                paidAt: null,
                confirmationRequestedAt: null,
                confirmationRequestedById: null,
                confirmationNote: null,
                description:
                    description ||
                    `Kbuilder ${plan.name} subscription - ` +
                        `${months} month${months > 1 ? 's' : ''}.`,
            },
            select: {
                ...PAYMENT_SELECT,
                site: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                        type: true,
                        status: true,
                    },
                },
            },
        });

        return json(
            {
                success: true,
                existing: false,
                message: 'Payment created successfully.',
                payment: {
                    ...payment,
                    amount: payment.amount.toString(),
                },
                paymentInfo: {
                    paymentId: payment.id,
                    paymentCode,
                    invoiceNumber,
                    monthlyPrice: monthlyPrice.toString(),
                    months,
                    totalAmount: totalAmount.toString(),
                    currency,
                    provider,
                    method,
                    transferContent,
                    status: 'PENDING',
                    confirmationRequestedAt: null,
                    confirmationRequestedById: null,
                    confirmationNote: null,
                    plan: {
                        id: plan.id,
                        name: plan.name,
                        code: plan.code,
                        price: plan.price.toString(),
                        currency: plan.currency,
                        billingCycle: plan.billingCycle,
                    },
                    subscription: {
                        id: subscription.id,
                        status: subscription.status,
                        billingCycle: subscription.billingCycle,
                    },
                    site: {
                        id: site.id,
                        name: site.name,
                        domain: site.domain,
                        type: site.type,
                    },
                },
            },
            201,
        );
    } catch (error) {
        console.error('POST /api/admin/sites/[id]/payments error:', error);

        return json(
            {
                success: false,
                error: 'Failed to create payment.',
            },
            500,
        );
    }
}

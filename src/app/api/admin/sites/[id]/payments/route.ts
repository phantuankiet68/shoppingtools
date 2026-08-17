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
    months: unknown;
    provider: unknown;
    method?: unknown;
    description?: unknown;
};

function parseBillingMonths(value: unknown): BillingMonths | null {
    const months = Number(value);

    if (!Number.isInteger(months)) {
        return null;
    }

    if (!ALLOWED_MONTHS.includes(months as BillingMonths)) {
        return null;
    }

    return months as BillingMonths;
}

function parseProvider(value: unknown): PaymentProvider | null {
    if (typeof value !== 'string') {
        return null;
    }

    return PROVIDERS.includes(value as PaymentProvider) ? (value as PaymentProvider) : null;
}

function parseMethod(value: unknown): PaymentMethod | null {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    if (typeof value !== 'string') {
        return null;
    }

    return METHODS.includes(value as PaymentMethod) ? (value as PaymentMethod) : null;
}

function validatePaymentMethod(provider: PaymentProvider, method: PaymentMethod | null) {
    if (provider === 'VNPAY') {
        if (method && !['BANK_TRANSFER', 'WALLET', 'CARD'].includes(method)) {
            return 'VNPAY does not support this payment method.';
        }
    }

    if (provider === 'MOMO') {
        if (method && !['WALLET', 'CARD'].includes(method)) {
            return 'MOMO does not support this payment method.';
        }
    }

    if (provider === 'STRIPE') {
        if (method && method !== 'CARD') {
            return 'STRIPE requires CARD payment method.';
        }
    }

    if (provider === 'PAYPAL') {
        if (method && method !== 'WALLET') {
            return 'PAYPAL requires WALLET payment method.';
        }
    }

    if (provider === 'MANUAL') {
        if (!method) {
            return 'Manual payment requires a payment method.';
        }

        if (!['BANK_TRANSFER', 'CASH'].includes(method)) {
            return 'Manual payment only supports BANK_TRANSFER or CASH.';
        }
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

        const existing = await prisma.paymentSite.findUnique({
            where: {
                paymentCode,
            },
            select: {
                id: true,
            },
        });

        if (!existing) {
            return paymentCode;
        }
    }

    throw new Error('Unable to generate a unique payment code.');
}

async function createUniqueInvoiceNumber() {
    for (let attempt = 0; attempt < 10; attempt++) {
        const invoiceNumber = generateInvoiceNumber();

        const existing = await prisma.paymentSite.findFirst({
            where: {
                invoiceNumber,
            },
            select: {
                id: true,
            },
        });

        if (!existing) {
            return invoiceNumber;
        }
    }

    throw new Error('Unable to generate a unique invoice number.');
}

export async function POST(request: Request, { params }: RouteContext) {
    try {
        // ---------------------------------------------------------
        // 1. Authentication
        // ---------------------------------------------------------
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized.',
                },
                { status: 401 },
            );
        }

        // ---------------------------------------------------------
        // 2. Site ID
        // ---------------------------------------------------------
        const { id: siteId } = await params;

        if (!siteId || typeof siteId !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid site ID.',
                },
                { status: 400 },
            );
        }

        // ---------------------------------------------------------
        // 3. Workspace
        // ---------------------------------------------------------
        const workspaceId = session.currentWorkspace?.id ?? null;

        if (!workspaceId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No workspace selected.',
                },
                { status: 400 },
            );
        }

        // ---------------------------------------------------------
        // 4. Parse request body
        // ---------------------------------------------------------
        let body: CreatePaymentBody;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid JSON body.',
                },
                { status: 400 },
            );
        }

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body.',
                },
                { status: 400 },
            );
        }

        // ---------------------------------------------------------
        // 5. Validate billing period
        // ---------------------------------------------------------
        const months = parseBillingMonths(body.months);

        if (months === null) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid billing period. Allowed values are 1, 3, 6 or 12 months.',
                },
                { status: 400 },
            );
        }

        // ---------------------------------------------------------
        // 6. Validate provider
        // ---------------------------------------------------------
        const provider = parseProvider(body.provider);

        if (provider === null) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid payment provider.',
                },
                { status: 400 },
            );
        }

        // ---------------------------------------------------------
        // 7. Validate method
        // ---------------------------------------------------------
        const method = parseMethod(body.method);

        if (
            body.method !== undefined &&
            body.method !== null &&
            body.method !== '' &&
            method === null
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid payment method.',
                },
                { status: 400 },
            );
        }

        const paymentMethodError = validatePaymentMethod(provider, method);

        if (paymentMethodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: paymentMethodError,
                },
                { status: 400 },
            );
        }

        // ---------------------------------------------------------
        // 8. Validate description
        // ---------------------------------------------------------
        let description: string | null = null;

        if (body.description !== undefined && body.description !== null) {
            if (typeof body.description !== 'string') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid payment description.',
                    },
                    { status: 400 },
                );
            }

            description = body.description.trim();

            if (description.length > 500) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Payment description must not exceed 500 characters.',
                    },
                    { status: 400 },
                );
            }

            if (!description) {
                description = null;
            }
        }

        // ---------------------------------------------------------
        // 9. Find site + subscription + pricing plan
        // ---------------------------------------------------------
        const site = await prisma.site.findFirst({
            where: {
                id: siteId,
                workspaceId,
                ownerUserId: session.user.id,
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
                        status: true,
                        planId: true,
                        billingCycle: true,
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

        if (!site) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Site not found.',
                },
                { status: 404 },
            );
        }

        // ---------------------------------------------------------
        // 10. Validate site status
        // ---------------------------------------------------------
        if (site.status === 'PUBLISHED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'This site is already published.',
                },
                { status: 409 },
            );
        }

        if (site.status === 'SUSPENDED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Suspended sites cannot create a payment.',
                },
                { status: 409 },
            );
        }

        if (site.status === 'ARCHIVED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Archived sites cannot create a payment.',
                },
                { status: 409 },
            );
        }

        // ---------------------------------------------------------
        // 11. Site MUST have subscription + pricing plan
        // ---------------------------------------------------------
        const subscription = site.subscription;
        const plan = subscription?.plan ?? null;

        if (!subscription) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'This site does not have a subscription.',
                },
                { status: 409 },
            );
        }

        if (!plan) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'This site does not have a pricing plan.',
                },
                { status: 409 },
            );
        }

        // ---------------------------------------------------------
        // 12. Validate pricing plan
        // ---------------------------------------------------------
        if (plan.status !== 'ACTIVE') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'The pricing plan is inactive.',
                },
                { status: 409 },
            );
        }

        if (plan.billingCycle !== 'MONTHLY') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'This payment endpoint currently supports monthly billing plans only.',
                },
                { status: 400 },
            );
        }

        if (!plan.price || plan.price.lessThanOrEqualTo(0)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'The pricing plan has an invalid price.',
                },
                { status: 409 },
            );
        }

        if (plan.currency !== 'VND') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'This payment endpoint currently supports VND pricing only.',
                },
                { status: 409 },
            );
        }

        // ---------------------------------------------------------
        // 13. Validate subscription status
        // ---------------------------------------------------------
        if (['ACTIVE', 'PAST_DUE', 'SUSPENDED'].includes(subscription.status)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'This site already has an active subscription.',
                },
                { status: 409 },
            );
        }

        if (subscription.status === 'CANCELED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'This subscription has been canceled.',
                },
                { status: 409 },
            );
        }

        if (subscription.status === 'EXPIRED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'This subscription has expired.',
                },
                { status: 409 },
            );
        }

        // ---------------------------------------------------------
        // 14. Check existing pending payment
        // ---------------------------------------------------------
        const pendingPayment = await prisma.paymentSite.findFirst({
            where: {
                siteId: site.id,
                status: 'PENDING',
            },
            orderBy: {
                createdAt: 'desc',
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
                failureCode: true,
                failureMessage: true,
                refundedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // ---------------------------------------------------------
        // 15. Reuse pending payment for same billing period
        // ---------------------------------------------------------
        if (
            pendingPayment &&
            pendingPayment.subscriptionId === subscription.id &&
            pendingPayment.billingMonths === months
        ) {
            const transferContent =
                `${pendingPayment.paymentCode} ` + `${pendingPayment.billingMonths}M`;

            return NextResponse.json(
                {
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
                        plan: {
                            id: plan.id,
                            name: plan.name,
                            code: plan.code,
                            price: plan.price.toString(),
                            currency: plan.currency,
                            billingCycle: plan.billingCycle,
                        },
                    },
                },
                { status: 200 },
            );
        }

        // ---------------------------------------------------------
        // 16. Cancel old pending payment
        // ---------------------------------------------------------
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

        // ---------------------------------------------------------
        // 17. Calculate payment amount
        //
        // Example:
        // 1  month  = 90,000
        // 3  months = 270,000
        // 6  months = 540,000
        // 12 months = 1,080,000
        //
        // NEVER trust amount from frontend.
        // ---------------------------------------------------------
        const monthlyPrice = plan.price;
        const totalAmount = monthlyPrice.mul(months);
        const currency = plan.currency;

        if (totalAmount.lessThanOrEqualTo(0)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'The calculated payment amount is invalid.',
                },
                { status: 409 },
            );
        }

        // ---------------------------------------------------------
        // 18. Generate payment identifiers
        // ---------------------------------------------------------
        const paymentCode = await createUniquePaymentCode();

        const invoiceNumber = await createUniqueInvoiceNumber();

        const transferContent = `${paymentCode} ${months}M`;

        // ---------------------------------------------------------
        // 19. Create PaymentSite
        // ---------------------------------------------------------
        const payment = await prisma.paymentSite.create({
            data: {
                siteId: site.id,

                // IMPORTANT:
                // Payment belongs to this subscription.
                subscriptionId: subscription.id,

                amount: totalAmount,
                currency,

                billingMonths: months,

                paymentCode,

                status: 'PENDING',
                provider,
                method,

                invoiceNumber,

                // paidAt MUST remain null.
                // Payment is only PENDING until admin confirms it.
                paidAt: null,

                description:
                    description ||
                    `Kbuilder ${plan.name} subscription - ` +
                        `${months} month${months > 1 ? 's' : ''}.`,
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
                failureCode: true,
                failureMessage: true,
                refundedAt: true,
                createdAt: true,
                updatedAt: true,
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

        // ---------------------------------------------------------
        // 20. Response
        // ---------------------------------------------------------
        return NextResponse.json(
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
            { status: 201 },
        );
    } catch (error) {
        console.error('POST /api/admin/sites/[id]/payments error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create payment.',
            },
            { status: 500 },
        );
    }
}

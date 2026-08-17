import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentSiteStatus, SubscriptionStatus, BillingCycle } from '@/generated/prisma';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

type BillingStatus =
    | 'PAID'
    | 'EXPIRING_SOON'
    | 'OVERDUE'
    | 'TRIAL'
    | 'SUSPENDED'
    | 'CANCELED'
    | 'EXPIRED'
    | 'NO_SUBSCRIPTION';

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' | 'REFUNDED';

interface BillingItem {
    id: string;

    customer: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        username: string | null;
    };

    site: string;
    domain: string;

    plan: string | null;
    planId: string | null;

    amount: number;
    currency: string;

    billingCycle: BillingCycle | null;

    nextBilling: Date | null;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;

    daysRemaining: number | null;

    lastPaidAt: Date | null;

    subscriptionId: string | null;
    subscriptionStatus: SubscriptionStatus | null;

    paymentStatus: PaymentStatus | null;
    pendingPaymentId: string | null;

    status: BillingStatus;

    notification: string;
    icon: string;
    color: string;
}

const STATUS_COLOR: Record<BillingStatus, string> = {
    PAID: '#8fb0f8',
    EXPIRING_SOON: '#f59e0b',
    OVERDUE: '#ef4444',
    TRIAL: '#06b6d4',
    SUSPENDED: '#94a3b8',
    CANCELED: '#94a3b8',
    EXPIRED: '#94a3b8',
    NO_SUBSCRIPTION: '#94a3b8',
};

const STATUS_ICON: Record<BillingStatus, string> = {
    PAID: 'bi-check-circle-fill',
    EXPIRING_SOON: 'bi-clock-fill',
    OVERDUE: 'bi-exclamation-circle-fill',
    TRIAL: 'bi-stars',
    SUSPENDED: 'bi-pause-circle-fill',
    CANCELED: 'bi-slash-circle-fill',
    EXPIRED: 'bi-calendar-x-fill',
    NO_SUBSCRIPTION: 'bi-globe2',
};

function getCustomerName(firstName: string | null, lastName: string | null, email: string) {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    return fullName || email;
}

function calculateDaysRemaining(date: Date | null) {
    if (!date) return null;

    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getNotification(
    status: BillingStatus,
    daysRemaining: number | null,
    hasPendingPayment = false,
) {
    if (hasPendingPayment) {
        return 'Payment is waiting for administrator confirmation.';
    }

    switch (status) {
        case 'PAID':
            return 'Everything is up to date. The next payment will be charged automatically.';

        case 'EXPIRING_SOON':
            return `Subscription expires in ${daysRemaining} day(s). Please remind the customer to renew.`;

        case 'OVERDUE':
            return 'Payment is overdue. Please contact the customer before suspending the service.';

        case 'TRIAL':
            return 'The trial period will end soon. Invite the customer to upgrade.';

        case 'SUSPENDED':
            return 'The subscription has been suspended.';

        case 'CANCELED':
            return 'The subscription has been canceled.';

        case 'EXPIRED':
            return 'The subscription has expired.';

        case 'NO_SUBSCRIPTION':
            return 'This website has not subscribed to any plan yet.';
    }
}

function getBillingStatus(
    subscriptionStatus: SubscriptionStatus,
    daysRemaining: number | null,
): BillingStatus {
    switch (subscriptionStatus) {
        case SubscriptionStatus.TRIAL:
            return 'TRIAL';

        case SubscriptionStatus.PAST_DUE:
            return 'OVERDUE';

        case SubscriptionStatus.SUSPENDED:
            return 'SUSPENDED';

        case SubscriptionStatus.CANCELED:
            return 'CANCELED';

        case SubscriptionStatus.EXPIRED:
            return 'EXPIRED';

        case SubscriptionStatus.ACTIVE:
        default:
            if (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7) {
                return 'EXPIRING_SOON';
            }

            return 'PAID';
    }
}

export async function GET(_req: Request, { params }: RouteContext) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    count: 0,
                    data: [],
                    message: 'User ID is required.',
                },
                { status: 400 },
            );
        }

        const sites = await prisma.site.findMany({
            where: {
                ownerUserId: id,
                deletedAt: null,
            },

            include: {
                owner: {
                    include: {
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true,
                                username: true,
                            },
                        },
                    },
                },

                subscription: {
                    include: {
                        plan: true,
                    },
                },

                paymentSites: {
                    where: {
                        status: {
                            in: [PaymentSiteStatus.PENDING, PaymentSiteStatus.SUCCESS],
                        },
                    },

                    orderBy: {
                        createdAt: 'desc',
                    },

                    take: 10,

                    select: {
                        id: true,
                        amount: true,
                        currency: true,
                        status: true,
                        paidAt: true,
                        createdAt: true,
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },
        });

        const data: BillingItem[] = sites.map((site) => {
            const customerName = getCustomerName(
                site.owner.profile?.firstName ?? null,
                site.owner.profile?.lastName ?? null,
                site.owner.email,
            );

            const customer = {
                id: site.owner.id,
                name: customerName,
                email: site.owner.email,
                avatar: site.owner.profile?.avatar ?? null,
                username: site.owner.profile?.username ?? null,
            };

            const subscription = site.subscription;

            if (!subscription) {
                return {
                    id: site.id,
                    customer,
                    site: site.name,
                    domain: site.domain,
                    plan: null,
                    planId: null,
                    amount: 0,
                    currency: 'VND',
                    billingCycle: null,
                    nextBilling: null,
                    currentPeriodStart: null,
                    currentPeriodEnd: null,
                    daysRemaining: null,
                    lastPaidAt: null,
                    subscriptionId: null,
                    subscriptionStatus: null,
                    paymentStatus: null,
                    pendingPaymentId: null,
                    status: 'NO_SUBSCRIPTION',
                    notification: getNotification('NO_SUBSCRIPTION', null),
                    icon: STATUS_ICON.NO_SUBSCRIPTION,
                    color: STATUS_COLOR.NO_SUBSCRIPTION,
                };
            }

            const pendingPayment =
                site.paymentSites.find((payment) => payment.status === PaymentSiteStatus.PENDING) ??
                null;

            const lastSuccessfulPayment =
                site.paymentSites.find((payment) => payment.status === PaymentSiteStatus.SUCCESS) ??
                null;

            const daysRemaining = calculateDaysRemaining(subscription.currentPeriodEnd);

            const status = getBillingStatus(subscription.status, daysRemaining);

            /*
             * Billing UI luôn hiển thị giá của plan.
             *
             * Không lấy amount của PaymentSite ở đây vì
             * PaymentSite có thể là 3 / 6 / 12 tháng.
             *
             * Ví dụ:
             * Plan = 90,000 / month
             * Payment = 270,000 / 3 months
             *
             * UI vẫn phải hiển thị:
             * 90,000 VND / monthly
             */
            const amount = Number(subscription.plan.price ?? 0);

            const currency = subscription.plan.currency || 'VND';

            const paymentStatus = pendingPayment?.status ?? lastSuccessfulPayment?.status ?? null;

            const notification = getNotification(status, daysRemaining, Boolean(pendingPayment));

            return {
                id: site.id,

                customer,

                site: site.name,
                domain: site.domain,

                plan: subscription.plan.name,
                planId: subscription.plan.id,

                amount,
                currency,

                billingCycle: subscription.billingCycle ?? subscription.plan.billingCycle,

                nextBilling: subscription.nextBillingAt,

                currentPeriodStart: subscription.currentPeriodStart,

                currentPeriodEnd: subscription.currentPeriodEnd,

                daysRemaining,

                lastPaidAt: lastSuccessfulPayment?.paidAt ?? null,

                subscriptionId: subscription.id,

                subscriptionStatus: subscription.status,

                paymentStatus,

                pendingPaymentId: pendingPayment?.id ?? null,

                status,

                notification,

                icon: STATUS_ICON[status],

                color: STATUS_COLOR[status],
            };
        });

        return NextResponse.json(
            {
                success: true,
                count: data.length,
                data,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('[Platform Users Billing API]', {
            method: 'GET',
            route: '/api/platform/users/:id/billing',
            error,
        });

        return NextResponse.json(
            {
                success: false,
                count: 0,
                data: [],
                message: 'Failed to load billing information.',
            },
            { status: 500 },
        );
    }
}

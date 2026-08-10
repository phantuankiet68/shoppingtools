import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    PaymentSiteStatus,
    SiteStatus,
    SubscriptionStatus,
    WebsiteType,
    BillingCycle,
} from '@/generated/prisma';

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
    amount: number;
    currency: string;
    billingCycle: BillingCycle | null;
    nextBilling: Date | null;
    daysRemaining: number | null;
    lastPaidAt: Date | null;
    subscriptionStatus: SubscriptionStatus | null;
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
    if (!date) {
        return null;
    }

    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getNotification(status: BillingStatus, daysRemaining: number | null) {
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

export async function GET(req: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;
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

                        paymentSites: {
                            where: {
                                status: PaymentSiteStatus.SUCCESS,
                            },

                            orderBy: {
                                paidAt: 'desc',
                            },

                            take: 1,
                        },
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },
        });

        const data: BillingItem[] = [];

        for (const site of sites) {
            const customerName = getCustomerName(
                site.owner.profile?.firstName ?? null,
                site.owner.profile?.lastName ?? null,
                site.owner.email,
            );

            const subscription = site.subscription;

            if (!subscription) {
                data.push({
                    id: site.id,

                    customer: {
                        id: site.owner.id,
                        name: customerName,
                        email: site.owner.email,
                        avatar: site.owner.profile?.avatar ?? null,
                        username: site.owner.profile?.username ?? null,
                    },
                    site: site.name,
                    domain: site.domain,
                    plan: null,
                    amount: 0,
                    currency: 'USD',
                    billingCycle: null,
                    nextBilling: null,
                    daysRemaining: null,
                    lastPaidAt: null,
                    subscriptionStatus: null,
                    status: 'NO_SUBSCRIPTION',
                    notification: getNotification('NO_SUBSCRIPTION', null),
                    icon: STATUS_ICON.NO_SUBSCRIPTION,
                    color: STATUS_COLOR.NO_SUBSCRIPTION,
                });
                continue;
            }

            const latestPayment = subscription.paymentSites[0] ?? null;
            const daysRemaining = calculateDaysRemaining(subscription.currentPeriodEnd);
            let status: BillingStatus;

            switch (subscription.status) {
                case SubscriptionStatus.TRIAL:
                    status = 'TRIAL';
                    break;
                case SubscriptionStatus.PAST_DUE:
                    status = 'OVERDUE';
                    break;
                case SubscriptionStatus.SUSPENDED:
                    status = 'SUSPENDED';
                    break;
                case SubscriptionStatus.CANCELED:
                    status = 'CANCELED';
                    break;
                case SubscriptionStatus.EXPIRED:
                    status = 'EXPIRED';
                    break;
                case SubscriptionStatus.ACTIVE:
                default:
                    if (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7) {
                        status = 'EXPIRING_SOON';
                    } else {
                        status = 'PAID';
                    }
                    break;
            }

            const amount = Number(latestPayment?.amount ?? subscription.plan.price);

            const currency = latestPayment?.currency ?? 'USD';

            data.push({
                id: site.id,
                customer: {
                    id: site.owner.id,
                    name: customerName,
                    email: site.owner.email,
                    avatar: site.owner.profile?.avatar ?? null,
                    username: site.owner.profile?.username ?? null,
                },
                site: site.name,
                domain: site.domain,
                plan: subscription.plan.name,
                amount,
                currency,
                billingCycle: subscription.billingCycle,
                nextBilling: subscription.nextBillingAt,
                daysRemaining,
                lastPaidAt: latestPayment?.paidAt ?? null,
                subscriptionStatus: subscription.status,
                status,
                notification: getNotification(status, daysRemaining),
                icon: STATUS_ICON[status],
                color: STATUS_COLOR[status],
            });
        }

        return NextResponse.json(
            {
                success: true,
                count: data.length,
                data,
            },
            {
                status: 200,
            },
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
            {
                status: 500,
            },
        );
    }
}

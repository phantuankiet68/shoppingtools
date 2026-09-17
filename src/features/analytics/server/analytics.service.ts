import { prisma } from '@/lib/prisma';
import {
    daysUntil,
    getPreviousYearRange,
    percentageChange,
    toIso,
    toNumber,
} from './analytics.helper';
import type {
    AnalyticsNotification,
    AnalyticsOverview,
    AnalyticsPaymentType,
    AnalyticsQuery,
    ExpiringSiteItem,
    ExpiringSiteQuery,
    PaymentAnalytics,
    PaymentAnalyticsItem,
    RevenueAnalytics,
    SubscriptionAnalytics,
} from './analytics.types';

const PAYMENT_SELECT = {
    id: true,
    siteId: true,
    amount: true,
    currency: true,
    status: true,
    provider: true,
    method: true,
    paymentCode: true,
    paidAt: true,
    createdAt: true,
    confirmationRequestedAt: true,
    site: {
        select: {
            name: true,
            domain: true,
            type: true,
        },
    },
} as const;

type PaymentRecord = Awaited<
    ReturnType<
        typeof prisma.paymentSite.findMany<{
            select: typeof PAYMENT_SELECT;
        }>
    >
>[number];

function serializePayment(payment: PaymentRecord): PaymentAnalyticsItem {
    return {
        id: payment.id,
        siteId: payment.siteId,
        siteName: payment.site.name,
        domain: payment.site.domain,
        siteType: payment.site.type,
        amount: toNumber(payment.amount),
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        method: payment.method,
        paymentCode: payment.paymentCode,
        paidAt: toIso(payment.paidAt),
        createdAt: payment.createdAt.toISOString(),
        confirmationRequestedAt: toIso(payment.confirmationRequestedAt),
    };
}

async function getPaymentTotals(start: Date, end: Date) {
    const payments = await prisma.paymentSite.findMany({
        where: {
            OR: [
                {
                    status: 'SUCCESS',
                    paidAt: {
                        gte: start,
                        lt: end,
                    },
                },
                {
                    status: 'PENDING',
                    createdAt: {
                        gte: start,
                        lt: end,
                    },
                },
            ],
        },
        select: {
            amount: true,
            status: true,
        },
    });

    return payments.reduce(
        (result, payment) => {
            const amount = toNumber(payment.amount);

            if (payment.status === 'SUCCESS') {
                result.totalRevenue += amount;
            }

            if (payment.status === 'PENDING') {
                result.pendingRevenue += amount;
                result.pendingTransactions += 1;
            }

            return result;
        },
        {
            totalRevenue: 0,
            pendingRevenue: 0,
            pendingTransactions: 0,
        },
    );
}

async function getMonthlyRevenue(start: Date, end: Date): Promise<RevenueAnalytics['months']> {
    const payments = await prisma.paymentSite.findMany({
        where: {
            OR: [
                {
                    status: 'SUCCESS',
                    paidAt: {
                        gte: start,
                        lt: end,
                    },
                },
                {
                    status: 'PENDING',
                    createdAt: {
                        gte: start,
                        lt: end,
                    },
                },
            ],
        },
        select: {
            amount: true,
            status: true,
            paidAt: true,
            createdAt: true,
        },
    });

    const months = Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        label: `T${index + 1}`,
        revenue: 0,
        pending: 0,
        expense: 0,
    }));

    for (const payment of payments) {
        const date = payment.status === 'SUCCESS' ? payment.paidAt : payment.createdAt;

        if (!date) continue;

        const month = date.getUTCMonth();

        if (month < 0 || month > 11) continue;

        const amount = toNumber(payment.amount);

        if (payment.status === 'SUCCESS') {
            months[month].revenue += amount;
        } else if (payment.status === 'PENDING') {
            months[month].pending += amount;
        }
    }

    return months;
}

export async function getAnalyticsOverview(query: AnalyticsQuery): Promise<AnalyticsOverview> {
    const previous = getPreviousYearRange(query.year);

    const [current, previousTotals] = await Promise.all([
        getPaymentTotals(query.start, query.end),
        getPaymentTotals(previous.start, previous.end),
    ]);

    return {
        period: {
            year: query.year,
            start: query.start.toISOString(),
            end: query.end.toISOString(),
        },
        cards: {
            totalRevenue: current.totalRevenue,
            totalExpense: 0,
            pendingRevenue: current.pendingRevenue,
            pendingTransactions: current.pendingTransactions,
            negativeBalance: 0,
            negativeSites: 0,
            revenueChangePercent: percentageChange(
                current.totalRevenue,
                previousTotals.totalRevenue,
            ),
            expenseChangePercent: 0,
        },
    };
}

export async function getAnalyticsRevenue(query: AnalyticsQuery): Promise<RevenueAnalytics> {
    return {
        year: query.year,
        months: await getMonthlyRevenue(query.start, query.end),
    };
}

export async function getAnalyticsPayments(
    query: AnalyticsQuery,
    type: AnalyticsPaymentType,
): Promise<PaymentAnalytics> {
    const range = {
        gte: query.start,
        lt: query.end,
    };

    const where =
        type === 'paid'
            ? {
                  status: 'SUCCESS' as const,
                  paidAt: range,
              }
            : type === 'awaiting_confirmation'
              ? {
                    status: 'PENDING' as const,
                    confirmationRequestedAt: {
                        not: null,
                        ...range,
                    },
                }
              : {
                    status: 'PENDING' as const,
                    confirmationRequestedAt: null,
                    createdAt: range,
                };

    const orderBy =
        type === 'paid'
            ? { paidAt: 'desc' as const }
            : type === 'awaiting_confirmation'
              ? { confirmationRequestedAt: 'desc' as const }
              : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
        prisma.paymentSite.findMany({
            where,
            select: PAYMENT_SELECT,
            orderBy,
            take: 5,
        }),
        prisma.paymentSite.count({
            where,
        }),
    ]);

    return {
        type,
        year: query.year,
        total,
        items: items.map(serializePayment),
    };
}

export async function getAnalyticsSubscriptions(
    query: AnalyticsQuery,
): Promise<SubscriptionAnalytics> {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 86_400_000);
    const thirtyDays = new Date(now.getTime() + 30 * 86_400_000);

    const siteNotDeleted = {
        site: {
            deletedAt: null,
        },
    };

    const [
        registered,
        expired,
        pendingApproval,
        active,
        trial,
        suspended,
        expiring7Days,
        expiring30Days,
        awaitingConfirmation,
    ] = await Promise.all([
        prisma.siteSubscription.count({
            where: {
                startedAt: {
                    lt: query.end,
                },
                ...siteNotDeleted,
            },
        }),
        prisma.siteSubscription.count({
            where: {
                status: 'EXPIRED',
                ...siteNotDeleted,
            },
        }),
        prisma.site.count({
            where: {
                status: 'DRAFT',
                deletedAt: null,
            },
        }),
        prisma.siteSubscription.count({
            where: {
                status: 'ACTIVE',
                currentPeriodEnd: {
                    gt: now,
                },
                ...siteNotDeleted,
            },
        }),
        prisma.siteSubscription.count({
            where: {
                status: 'TRIAL',
                currentPeriodEnd: {
                    gt: now,
                },
                ...siteNotDeleted,
            },
        }),
        prisma.siteSubscription.count({
            where: {
                status: 'SUSPENDED',
                ...siteNotDeleted,
            },
        }),
        prisma.siteSubscription.count({
            where: {
                status: {
                    in: ['ACTIVE', 'TRIAL'],
                },
                currentPeriodEnd: {
                    gt: now,
                    lte: sevenDays,
                },
                ...siteNotDeleted,
            },
        }),
        prisma.siteSubscription.count({
            where: {
                status: {
                    in: ['ACTIVE', 'TRIAL'],
                },
                currentPeriodEnd: {
                    gt: sevenDays,
                    lte: thirtyDays,
                },
                ...siteNotDeleted,
            },
        }),
        prisma.paymentSite.count({
            where: {
                status: 'PENDING',
                confirmationRequestedAt: {
                    not: null,
                    gte: query.start,
                    lt: query.end,
                },
            },
        }),
    ]);

    return {
        year: query.year,
        registered,
        expired,
        pendingApproval,
        active,
        trial,
        suspended,
        expiring7Days,
        expiring30Days,
        awaitingConfirmation,
        processing: 0,
    };
}

export async function getExpiringSites(query: ExpiringSiteQuery): Promise<ExpiringSiteItem[]> {
    const now = new Date();
    const expiresBefore = new Date(now.getTime() + query.days * 86_400_000);

    const subscriptions = await prisma.siteSubscription.findMany({
        where: {
            status: {
                in: ['ACTIVE', 'TRIAL'],
            },
            currentPeriodEnd: {
                gt: now,
                lte: expiresBefore,
            },
            site: {
                deletedAt: null,
            },
        },
        orderBy: {
            currentPeriodEnd: 'asc',
        },
        take: query.limit,
        select: {
            siteId: true,
            status: true,
            currentPeriodEnd: true,
            site: {
                select: {
                    name: true,
                    domain: true,
                    type: true,
                },
            },
            plan: {
                select: {
                    name: true,
                    code: true,
                },
            },
        },
    });

    return subscriptions.map((subscription) => ({
        siteId: subscription.siteId,
        siteName: subscription.site.name,
        domain: subscription.site.domain,
        siteType: subscription.site.type,
        planName: subscription.plan.name,
        planCode: subscription.plan.code,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        daysLeft: daysUntil(subscription.currentPeriodEnd, now),
    }));
}

export async function getAnalyticsNotifications(limit: number): Promise<AnalyticsNotification[]> {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 86_400_000);

    const [expiring, awaiting, recentPaid] = await Promise.all([
        prisma.siteSubscription.findMany({
            where: {
                status: {
                    in: ['ACTIVE', 'TRIAL'],
                },
                currentPeriodEnd: {
                    gt: now,
                    lte: sevenDays,
                },
                site: {
                    deletedAt: null,
                },
            },
            orderBy: {
                currentPeriodEnd: 'asc',
            },
            take: 10,
            select: {
                siteId: true,
                currentPeriodEnd: true,
                site: {
                    select: {
                        name: true,
                        domain: true,
                    },
                },
            },
        }),
        prisma.paymentSite.findMany({
            where: {
                status: 'PENDING',
                confirmationRequestedAt: {
                    not: null,
                },
            },
            orderBy: {
                confirmationRequestedAt: 'desc',
            },
            take: 10,
            select: {
                id: true,
                confirmationRequestedAt: true,
                site: {
                    select: {
                        name: true,
                        domain: true,
                    },
                },
            },
        }),
        prisma.paymentSite.findMany({
            where: {
                status: 'SUCCESS',
                paidAt: {
                    not: null,
                },
            },
            orderBy: {
                paidAt: 'desc',
            },
            take: 10,
            select: {
                id: true,
                paidAt: true,
                site: {
                    select: {
                        name: true,
                        domain: true,
                    },
                },
            },
        }),
    ]);

    const notifications: AnalyticsNotification[] = [
        ...expiring.map((item) => ({
            id: `expiring-${item.siteId}`,
            type: 'warning' as const,
            message: `Site ${item.site.name || item.site.domain} sắp hết hạn trong ${daysUntil(
                item.currentPeriodEnd,
                now,
            )} ngày`,
            createdAt: item.currentPeriodEnd.toISOString(),
        })),
        ...awaiting.map((item) => ({
            id: `payment-${item.id}`,
            type: 'danger' as const,
            message: `Site ${item.site.name || item.site.domain} đang chờ xác nhận thanh toán`,
            createdAt: item.confirmationRequestedAt?.toISOString() ?? now.toISOString(),
        })),
        ...recentPaid.map((item) => ({
            id: `paid-${item.id}`,
            type: 'success' as const,
            message: `Đã có thanh toán mới từ site ${item.site.name || item.site.domain}`,
            createdAt: item.paidAt?.toISOString() ?? now.toISOString(),
        })),
    ];

    return notifications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
}

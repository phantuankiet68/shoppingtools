import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@/generated/prisma';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;

        const subscriptions = await prisma.siteSubscription.findMany({
            where: {
                site: {
                    ownerUserId: id,
                    deletedAt: null,
                },
            },
            include: {
                plan: true,
            },
        });

        const now = new Date();

        let totalSites = subscriptions.length;
        let active = 0;
        let trial = 0;
        let expiringSoon = 0;
        let overdue = 0;
        let suspended = 0;
        let canceled = 0;
        let expired = 0;

        let monthlyRevenue = 0;
        let yearlyRevenue = 0;

        for (const subscription of subscriptions) {
            const daysRemaining = Math.ceil(
                (subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            );

            switch (subscription.status) {
                case SubscriptionStatus.TRIAL:
                    trial++;
                    break;

                case SubscriptionStatus.PAST_DUE:
                    overdue++;
                    break;

                case SubscriptionStatus.SUSPENDED:
                    suspended++;
                    break;

                case SubscriptionStatus.CANCELED:
                    canceled++;
                    break;

                case SubscriptionStatus.EXPIRED:
                    expired++;
                    break;

                case SubscriptionStatus.ACTIVE:
                    active++;

                    if (daysRemaining <= 7) {
                        expiringSoon++;
                    }

                    break;
            }

            const price = Number(subscription.plan.price);

            if (subscription.billingCycle === 'MONTHLY') {
                monthlyRevenue += price;
            } else {
                yearlyRevenue += price;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                totalSites,
                active,
                trial,
                expiringSoon,
                overdue,
                suspended,
                canceled,
                expired,
                monthlyRevenue,
                yearlyRevenue,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to load billing summary.',
            },
            {
                status: 500,
            },
        );
    }
}

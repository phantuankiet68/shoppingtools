import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BillingCycle, SubscriptionStatus, SiteStatus } from '@/generated/prisma';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;
        const { siteId } = await req.json();

        if (!siteId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Site ID is required.',
                },
                {
                    status: 400,
                },
            );
        }

        const site = await prisma.site.findFirst({
            where: {
                id: siteId,
                ownerUserId: id,
                deletedAt: null,
            },
            include: {
                subscription: true,
            },
        });

        if (!site) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Site not found.',
                },
                {
                    status: 404,
                },
            );
        }

        if (!site.subscription) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Subscription not found.',
                },
                {
                    status: 404,
                },
            );
        }

        const now = new Date();

        const periodStart =
            site.subscription.currentPeriodEnd > now ? site.subscription.currentPeriodEnd : now;

        const periodEnd = new Date(periodStart);

        if (site.subscription.billingCycle === BillingCycle.MONTHLY) {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        const subscription = await prisma.siteSubscription.update({
            where: {
                id: site.subscription.id,
            },
            data: {
                status: SubscriptionStatus.ACTIVE,
                startedAt: site.subscription.startedAt ?? now,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                nextBillingAt: periodEnd,
                canceledAt: null,
            },
        });

        await prisma.site.update({
            where: {
                id: site.id,
            },
            data: {
                status: SiteStatus.PUBLISHED,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Subscription renewed successfully.',
            data: {
                siteId: site.id,
                subscriptionId: subscription.id,
                billingCycle: subscription.billingCycle,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                nextBillingAt: subscription.nextBillingAt,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to renew subscription.',
            },
            {
                status: 500,
            },
        );
    }
}

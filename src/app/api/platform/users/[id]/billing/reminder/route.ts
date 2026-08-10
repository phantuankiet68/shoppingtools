import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        const subscription = site.subscription;

        if (!subscription) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'This site has no active subscription.',
                },
                {
                    status: 400,
                },
            );
        }

        const customerName =
            [site.owner.profile?.firstName, site.owner.profile?.lastName]
                .filter(Boolean)
                .join(' ')
                .trim() || site.owner.email;

        return NextResponse.json({
            success: true,
            message: 'Billing reminder sent successfully.',
            data: {
                siteId: site.id,
                siteName: site.name,
                customer: {
                    id: site.owner.id,
                    name: customerName,
                    email: site.owner.email,
                    username: site.owner.profile?.username,
                    avatar: site.owner.profile?.avatar,
                },
                plan: subscription.plan.name,
                nextBillingAt: subscription.nextBillingAt,
            },
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to send billing reminder.',
            },
            {
                status: 500,
            },
        );
    }
}

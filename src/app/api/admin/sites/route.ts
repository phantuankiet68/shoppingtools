import { getCurrentSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const SITE_STATUSES = ['DRAFT', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED'] as const;
const WEBSITE_TYPES = ['landing', 'blog', 'ecommerce', 'booking', 'lms'] as const;

export async function GET(request: Request) {
    try {
        const session = await getCurrentSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const workspaceId = session.currentWorkspace?.id ?? null;

        if (!workspaceId) {
            return NextResponse.json({ error: 'No workspace selected.' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);

        const search = searchParams.get('search')?.trim() ?? '';
        const statusParam = searchParams.get('status')?.trim() ?? '';
        const typeParam = searchParams.get('type')?.trim() ?? '';

        const requestedPage = Number(searchParams.get('page') ?? DEFAULT_PAGE);
        const requestedLimit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT);

        const page =
            Number.isFinite(requestedPage) && requestedPage > 0
                ? Math.floor(requestedPage)
                : DEFAULT_PAGE;

        const limit =
            Number.isFinite(requestedLimit) && requestedLimit > 0
                ? Math.min(Math.floor(requestedLimit), MAX_LIMIT)
                : DEFAULT_LIMIT;

        const skip = (page - 1) * limit;

        const status = SITE_STATUSES.includes(statusParam as (typeof SITE_STATUSES)[number])
            ? statusParam
            : '';

        const type = WEBSITE_TYPES.includes(typeParam as (typeof WEBSITE_TYPES)[number])
            ? typeParam
            : '';

        const where = {
            deletedAt: null,
            workspaceId,
            ownerUserId: userId,

            ...(status
                ? {
                      status: status as (typeof SITE_STATUSES)[number],
                  }
                : {}),

            ...(type
                ? {
                      type: type as (typeof WEBSITE_TYPES)[number],
                  }
                : {}),

            ...(search
                ? {
                      OR: [
                          {
                              name: {
                                  contains: search,
                                  mode: 'insensitive' as const,
                              },
                          },
                          {
                              domain: {
                                  contains: search,
                                  mode: 'insensitive' as const,
                              },
                          },
                          {
                              category: {
                                  contains: search,
                                  mode: 'insensitive' as const,
                              },
                          },
                          {
                              contactEmail: {
                                  contains: search,
                                  mode: 'insensitive' as const,
                              },
                          },
                      ],
                  }
                : {}),
        };

        const [items, total, draftCount, publishedCount, suspendedCount, archivedCount] =
            await Promise.all([
                prisma.site.findMany({
                    where,
                    orderBy: {
                        updatedAt: 'desc',
                    },
                    skip,
                    take: limit,
                    select: {
                        // Basic
                        id: true,
                        name: true,
                        domain: true,
                        type: true,
                        category: true,

                        // Branding
                        logoUrl: true,
                        faviconUrl: true,

                        // Contact
                        contactEmail: true,
                        contactPhone: true,

                        // SEO
                        seoTitle: true,
                        seoDescription: true,

                        // Site lifecycle
                        status: true,
                        isPublic: true,
                        publishedAt: true,

                        // Domain verification
                        domainVerificationStatus: true,
                        domainVerifiedAt: true,

                        // SSL
                        sslStatus: true,
                        sslProvider: true,
                        sslCertificateId: true,
                        sslIssuedAt: true,
                        sslExpiresAt: true,
                        sslAutoRenew: true,
                        sslLastCheckedAt: true,
                        sslErrorCode: true,
                        sslErrorMessage: true,

                        // Deployment
                        deploymentStatus: true,
                        deployedAt: true,
                        deploymentError: true,

                        // Usage
                        storageUsedBytes: true,
                        bandwidthUsedBytes: true,
                        totalVisits: true,

                        // Theme
                        themeConfig: true,

                        // Subscription
                        subscription: {
                            select: {
                                id: true,
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
                                        billingCycle: true,
                                        status: true,
                                    },
                                },
                            },
                        },

                        // Latest payment
                        paymentSites: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                            select: {
                                id: true,
                                amount: true,
                                currency: true,
                                status: true,
                                provider: true,
                                method: true,
                                transactionId: true,
                                invoiceNumber: true,
                                receiptUrl: true,
                                paidAt: true,
                                failureCode: true,
                                failureMessage: true,
                                refundedAt: true,
                                createdAt: true,
                                updatedAt: true,
                            },
                        },

                        // Timestamps
                        createdAt: true,
                        updatedAt: true,
                    },
                }),

                prisma.site.count({
                    where,
                }),

                prisma.site.count({
                    where: {
                        deletedAt: null,
                        workspaceId,
                        ownerUserId: userId,
                        status: 'DRAFT',
                    },
                }),

                prisma.site.count({
                    where: {
                        deletedAt: null,
                        workspaceId,
                        ownerUserId: userId,
                        status: 'PUBLISHED',
                    },
                }),

                prisma.site.count({
                    where: {
                        deletedAt: null,
                        workspaceId,
                        ownerUserId: userId,
                        status: 'SUSPENDED',
                    },
                }),

                prisma.site.count({
                    where: {
                        deletedAt: null,
                        workspaceId,
                        ownerUserId: userId,
                        status: 'ARCHIVED',
                    },
                }),
            ]);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        const serializedItems = items.map((site) => ({
            ...site,

            storageUsedBytes: site.storageUsedBytes.toString(),
            bandwidthUsedBytes: site.bandwidthUsedBytes.toString(),
            totalVisits: site.totalVisits.toString(),

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

            paymentSites: site.paymentSites.map((payment) => ({
                ...payment,
                amount: payment.amount.toString(),
            })),
        }));

        return NextResponse.json({
            currentWorkspace: session.currentWorkspace,

            items: serializedItems,

            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },

            filters: {
                search,
                status: status || null,
                type: type || null,
            },

            stats: {
                total: draftCount + publishedCount + suspendedCount + archivedCount,
                draft: draftCount,
                published: publishedCount,
                suspended: suspendedCount,
                archived: archivedCount,
            },
        });
    } catch (error) {
        console.error('GET /api/admin/sites error:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch sites.',
            },
            {
                status: 500,
            },
        );
    }
}

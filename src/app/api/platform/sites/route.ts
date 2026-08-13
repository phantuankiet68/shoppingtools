import { NextRequest, NextResponse } from 'next/server';
import {
    PaymentSiteProvider,
    Prisma,
    SiteStatus,
    SubscriptionStatus,
    WebsiteType,
} from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/platform/platformHelpers';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const SORTABLE_FIELDS = [
    'name',
    'domain',
    'createdAt',
    'updatedAt',
    'publishedAt',
    'storageUsedBytes',
    'bandwidthUsedBytes',
    'totalVisits',
] as const;

type SortableField = (typeof SORTABLE_FIELDS)[number];

function isEnum<T extends Record<string, string>>(
    value: string | null,
    enumObject: T,
): value is T[keyof T] {
    return !!value && Object.values(enumObject).includes(value);
}

function parseNumber(value: string | null, fallback: number) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeDomain(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/+$/, '');
}

function isValidDomain(domain: string) {
    return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain);
}

function serialize<T>(value: T): T {
    return JSON.parse(
        JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? Number(item) : item)),
    );
}

function formatSite<
    T extends {
        owner: {
            id: string;
            email: string;
            image: string | null;
        };
        subscription: {
            plan: {
                price: Prisma.Decimal;
            };
        } | null;
    },
>(site: T) {
    return serialize({
        ...site,
        owner: {
            id: site.owner.id,
            name: site.owner.email,
            email: site.owner.email,
        },
        subscription: site.subscription
            ? {
                  ...site.subscription,
                  plan: {
                      ...site.subscription.plan,
                      price: Number(site.subscription.plan.price),
                  },
              }
            : null,
    });
}

const SITE_SELECT = {
    id: true,
    name: true,
    domain: true,
    type: true,
    category: true,

    logoUrl: true,
    faviconUrl: true,

    seoTitle: true,
    seoDescription: true,

    contactEmail: true,
    contactPhone: true,

    status: true,
    isPublic: true,
    publishedAt: true,

    domainVerificationStatus: true,

    sslStatus: true,
    sslProvider: true,
    sslExpiresAt: true,

    deploymentStatus: true,

    storageUsedBytes: true,
    bandwidthUsedBytes: true,
    totalVisits: true,

    createdAt: true,
    updatedAt: true,

    owner: {
        select: {
            id: true,
            email: true,
            image: true,
        },
    },

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
                    maxPages: true,
                    maxProducts: true,
                    maxUsers: true,
                    maxStorageBytes: true,
                    maxBandwidthBytes: true,
                    canCustomDomain: true,
                    canRemoveBranding: true,
                    canUseAnalytics: true,
                    canUseEmail: true,
                },
            },
        },
    },
} satisfies Prisma.SiteSelect;

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);

        const page = parseNumber(searchParams.get('page'), DEFAULT_PAGE);
        const limit = Math.min(parseNumber(searchParams.get('limit'), DEFAULT_LIMIT), MAX_LIMIT);

        const search = searchParams.get('search')?.trim() || '';
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const subscription = searchParams.get('subscription');
        const provider = searchParams.get('provider');

        const requestedSort = searchParams.get('sortBy') as SortableField | null;
        const sortBy =
            requestedSort && SORTABLE_FIELDS.includes(requestedSort) ? requestedSort : 'updatedAt';

        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

        if (type && !isEnum(type, WebsiteType)) {
            return NextResponse.json(
                { success: false, message: 'Invalid website type.' },
                { status: 400 },
            );
        }

        if (status && !isEnum(status, SiteStatus)) {
            return NextResponse.json(
                { success: false, message: 'Invalid site status.' },
                { status: 400 },
            );
        }

        if (subscription && !isEnum(subscription, SubscriptionStatus)) {
            return NextResponse.json(
                { success: false, message: 'Invalid subscription status.' },
                { status: 400 },
            );
        }

        if (provider && !isEnum(provider, PaymentSiteProvider)) {
            return NextResponse.json(
                { success: false, message: 'Invalid payment provider.' },
                { status: 400 },
            );
        }

        const where: Prisma.SiteWhereInput = {
            deletedAt: null,
        };

        if (type) where.type = type as WebsiteType;
        if (status) where.status = status as SiteStatus;

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { domain: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
                { contactEmail: { contains: search, mode: 'insensitive' } },
                { contactPhone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (subscription || provider) {
            const subscriptionWhere: Prisma.SiteSubscriptionWhereInput = {};

            if (subscription) {
                subscriptionWhere.status = subscription as SubscriptionStatus;
            }

            if (provider) {
                subscriptionWhere.paymentSites = {
                    some: {
                        provider: provider as PaymentSiteProvider,
                    },
                };
            }

            where.subscription = {
                is: subscriptionWhere,
            };
        }

        const [sites, total] = await prisma.$transaction([
            prisma.site.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                select: SITE_SELECT,
            }),
            prisma.site.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: sites.map(formatSite),
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error('GET /api/platform/sites error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch sites.',
                ...(process.env.NODE_ENV === 'development'
                    ? {
                          error: error instanceof Error ? error.message : 'Unknown error',
                      }
                    : {}),
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const body = await request.json();

        const {
            name,
            domain,
            type,
            category,
            logoUrl,
            faviconUrl,
            seoTitle,
            seoDescription,
            contactEmail,
            contactPhone,
            ownerUserId,
            createdByUserId,
            workspaceId,
            themeConfig,
            sslAutoRenew,
        } = body;

        if (typeof name !== 'string' || !name.trim()) {
            return NextResponse.json(
                { success: false, message: 'Site name is required.' },
                { status: 400 },
            );
        }

        if (typeof domain !== 'string' || !domain.trim()) {
            return NextResponse.json(
                { success: false, message: 'Domain is required.' },
                { status: 400 },
            );
        }

        if (typeof ownerUserId !== 'string' || !ownerUserId) {
            return NextResponse.json(
                { success: false, message: 'Owner user is required.' },
                { status: 400 },
            );
        }

        const normalizedDomain = normalizeDomain(domain);

        if (!isValidDomain(normalizedDomain)) {
            return NextResponse.json(
                { success: false, message: 'Invalid domain format.' },
                { status: 400 },
            );
        }

        const websiteType = type || WebsiteType.ecommerce;

        if (!isEnum(websiteType, WebsiteType)) {
            return NextResponse.json(
                { success: false, message: 'Invalid website type.' },
                { status: 400 },
            );
        }

        const existingSite = await prisma.site.findUnique({
            where: { domain: normalizedDomain },
            select: {
                id: true,
                deletedAt: true,
            },
        });

        if (existingSite?.deletedAt === null) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'A site with this domain already exists.',
                },
                { status: 409 },
            );
        }

        const [owner, creator, workspace] = await Promise.all([
            prisma.user.findUnique({
                where: { id: ownerUserId },
                select: { id: true },
            }),
            createdByUserId
                ? prisma.user.findUnique({
                      where: { id: createdByUserId },
                      select: { id: true },
                  })
                : null,
            workspaceId
                ? prisma.workspace.findUnique({
                      where: { id: workspaceId },
                      select: { id: true },
                  })
                : null,
        ]);

        if (!owner) {
            return NextResponse.json(
                { success: false, message: 'Owner user not found.' },
                { status: 404 },
            );
        }

        if (createdByUserId && !creator) {
            return NextResponse.json(
                { success: false, message: 'Creator user not found.' },
                { status: 404 },
            );
        }

        if (workspaceId && !workspace) {
            return NextResponse.json(
                { success: false, message: 'Workspace not found.' },
                { status: 404 },
            );
        }

        const site = await prisma.site.create({
            data: {
                name: name.trim(),
                domain: normalizedDomain,
                type: websiteType,

                category: typeof category === 'string' && category.trim() ? category.trim() : null,

                logoUrl: typeof logoUrl === 'string' && logoUrl.trim() ? logoUrl.trim() : null,

                faviconUrl:
                    typeof faviconUrl === 'string' && faviconUrl.trim() ? faviconUrl.trim() : null,

                seoTitle: typeof seoTitle === 'string' && seoTitle.trim() ? seoTitle.trim() : null,

                seoDescription:
                    typeof seoDescription === 'string' && seoDescription.trim()
                        ? seoDescription.trim()
                        : null,

                contactEmail:
                    typeof contactEmail === 'string' && contactEmail.trim()
                        ? contactEmail.trim()
                        : null,

                contactPhone:
                    typeof contactPhone === 'string' && contactPhone.trim()
                        ? contactPhone.trim()
                        : null,

                ownerUserId,
                createdByUserId:
                    typeof createdByUserId === 'string' && createdByUserId ? createdByUserId : null,
                workspaceId: typeof workspaceId === 'string' && workspaceId ? workspaceId : null,

                status: SiteStatus.DRAFT,
                isPublic: false,

                domainVerificationStatus: 'PENDING',

                sslStatus: 'PENDING',
                sslAutoRenew: typeof sslAutoRenew === 'boolean' ? sslAutoRenew : true,

                deploymentStatus: 'IDLE',

                storageUsedBytes: BigInt(0),
                bandwidthUsedBytes: BigInt(0),
                totalVisits: BigInt(0),

                themeConfig: themeConfig !== undefined ? themeConfig : undefined,
            },
            select: SITE_SELECT,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Site created successfully.',
                data: formatSite(site),
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('POST /api/platform/sites error:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'A site with this domain already exists.',
                    },
                    { status: 409 },
                );
            }

            if (error.code === 'P2003') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'One of the related records does not exist.',
                    },
                    { status: 400 },
                );
            }
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create site.',
                ...(process.env.NODE_ENV === 'development'
                    ? {
                          error: error instanceof Error ? error.message : 'Unknown error',
                      }
                    : {}),
            },
            { status: 500 },
        );
    }
}

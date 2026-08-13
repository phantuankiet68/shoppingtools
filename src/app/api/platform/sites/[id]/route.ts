import { NextRequest, NextResponse } from 'next/server';
import {
    DeploymentStatus,
    DomainVerificationStatus,
    Prisma,
    SiteStatus,
    SslStatus,
    WebsiteType,
} from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/utils/platform/platformHelpers';

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface UpdateSiteBody {
    name?: string;
    domain?: string;
    type?: WebsiteType;
    category?: string | null;

    logoUrl?: string | null;
    faviconUrl?: string | null;

    seoTitle?: string | null;
    seoDescription?: string | null;

    contactEmail?: string | null;
    contactPhone?: string | null;

    status?: SiteStatus;
    isPublic?: boolean;

    workspaceId?: string | null;
    themeConfig?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
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

function isEnum<T extends Record<string, string>>(
    value: unknown,
    enumObject: T,
): value is T[keyof T] {
    return typeof value === 'string' && Object.values(enumObject).includes(value);
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

function error(message: string, status: number) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
    try {
        await requireAdmin();

        const { id } = await params;

        if (!id) {
            return error('Site id is required.', 400);
        }

        const site = await prisma.site.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: SITE_SELECT,
        });

        if (!site) {
            return error('Site not found.', 404);
        }

        return NextResponse.json({
            success: true,
            data: formatSite(site),
        });
    } catch (err) {
        console.error('GET /api/platform/sites/[id] error:', err);

        return error('Failed to fetch site.', 500);
    }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
    try {
        await requireAdmin();

        const { id } = await params;

        if (!id) {
            return error('Site id is required.', 400);
        }

        const body: UpdateSiteBody = await request.json();

        const site = await prisma.site.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                domain: true,
                publishedAt: true,
            },
        });

        if (!site) {
            return error('Site not found.', 404);
        }

        if (body.type !== undefined && !isEnum(body.type, WebsiteType)) {
            return error('Invalid website type.', 400);
        }

        if (body.status !== undefined && !isEnum(body.status, SiteStatus)) {
            return error('Invalid site status.', 400);
        }

        const data: Prisma.SiteUpdateInput = {};

        if (body.name !== undefined) {
            const name = body.name.trim();

            if (!name) {
                return error('Site name is required.', 400);
            }

            data.name = name;
        }

        if (body.domain !== undefined) {
            const domain = normalizeDomain(body.domain);

            if (!domain) {
                return error('Domain is required.', 400);
            }

            if (!isValidDomain(domain)) {
                return error('Invalid domain format.', 400);
            }

            if (domain !== site.domain) {
                const exists = await prisma.site.findFirst({
                    where: {
                        id: { not: id },
                        domain,
                        deletedAt: null,
                    },
                    select: { id: true },
                });

                if (exists) {
                    return error('Domain already exists.', 409);
                }

                data.domain = domain;

                data.domainVerificationStatus = DomainVerificationStatus.PENDING;
                data.domainVerificationToken = null;
                data.domainVerifiedAt = null;

                data.sslStatus = SslStatus.PENDING;
                data.sslProvider = null;
                data.sslCertificateId = null;
                data.sslIssuedAt = null;
                data.sslExpiresAt = null;
                data.sslLastCheckedAt = null;
                data.sslErrorCode = null;
                data.sslErrorMessage = null;

                data.deploymentStatus = DeploymentStatus.IDLE;
                data.deployedAt = null;
                data.deploymentError = null;
            }
        }

        if (body.type !== undefined) {
            data.type = body.type;
        }

        if (body.category !== undefined) {
            data.category = body.category?.trim() || null;
        }

        if (body.logoUrl !== undefined) {
            data.logoUrl = body.logoUrl?.trim() || null;
        }

        if (body.faviconUrl !== undefined) {
            data.faviconUrl = body.faviconUrl?.trim() || null;
        }

        if (body.seoTitle !== undefined) {
            data.seoTitle = body.seoTitle?.trim() || null;
        }

        if (body.seoDescription !== undefined) {
            data.seoDescription = body.seoDescription?.trim() || null;
        }

        if (body.contactEmail !== undefined) {
            data.contactEmail = body.contactEmail?.trim() || null;
        }

        if (body.contactPhone !== undefined) {
            data.contactPhone = body.contactPhone?.trim() || null;
        }

        if (body.workspaceId !== undefined) {
            if (body.workspaceId === null) {
                data.workspace = {
                    disconnect: true,
                };
            } else {
                const workspace = await prisma.workspace.findUnique({
                    where: {
                        id: body.workspaceId,
                    },
                    select: {
                        id: true,
                    },
                });

                if (!workspace) {
                    return error('Workspace not found.', 404);
                }

                data.workspace = {
                    connect: {
                        id: workspace.id,
                    },
                };
            }
        }

        if (body.themeConfig !== undefined) {
            data.themeConfig = body.themeConfig;
        }

        if (body.status !== undefined) {
            switch (body.status) {
                case SiteStatus.DRAFT:
                    data.status = SiteStatus.DRAFT;
                    data.isPublic = false;
                    data.publishedAt = null;
                    break;

                case SiteStatus.PUBLISHED:
                    data.status = SiteStatus.PUBLISHED;
                    data.isPublic = true;
                    data.publishedAt = site.publishedAt ?? new Date();
                    break;

                case SiteStatus.SUSPENDED:
                    data.status = SiteStatus.SUSPENDED;
                    data.isPublic = false;
                    break;

                case SiteStatus.ARCHIVED:
                    data.status = SiteStatus.ARCHIVED;
                    data.isPublic = false;
                    break;
            }
        }

        if (body.isPublic !== undefined && body.status === undefined) {
            data.isPublic = body.isPublic;
        }

        if (!Object.keys(data).length) {
            const current = await prisma.site.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
                select: SITE_SELECT,
            });

            return NextResponse.json({
                success: true,
                message: 'No changes detected.',
                data: current ? formatSite(current) : null,
            });
        }

        const updatedSite = await prisma.site.update({
            where: {
                id,
            },
            data,
            select: SITE_SELECT,
        });

        return NextResponse.json({
            success: true,
            message: 'Site updated successfully.',
            data: formatSite(updatedSite),
        });
    } catch (err) {
        console.error('PATCH /api/platform/sites/[id] error:', err);

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return error('Domain already exists.', 409);
            }

            if (err.code === 'P2003') {
                return error('Invalid relation.', 400);
            }
        }

        return error('Failed to update site.', 500);
    }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
    try {
        await requireAdmin();

        const { id } = await params;

        if (!id) {
            return error('Site id is required.', 400);
        }

        const site = await prisma.site.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

        if (!site) {
            return error('Site not found.', 404);
        }

        const deletedSite = await prisma.site.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
                status: SiteStatus.ARCHIVED,
                isPublic: false,
                deploymentStatus: DeploymentStatus.IDLE,
            },
            select: {
                id: true,
                name: true,
                domain: true,
                status: true,
                deletedAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Site deleted successfully.',
            data: serialize(deletedSite),
        });
    } catch (err) {
        console.error('DELETE /api/platform/sites/[id] error:', err);

        return error('Failed to delete site.', 500);
    }
}

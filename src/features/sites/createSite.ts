import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { SiteStatus, WebsiteType } from '@/generated/prisma';

type CreateSiteInput = {
    name: string;
    domain: string;
    type?: WebsiteType;
    category?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    status?: SiteStatus;
    isPublic?: boolean;
    publishedAt?: Date | null;
    workspaceId: string;
    ownerUserId: string;
    createdByUserId?: string | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    pricingPlanId?: string;
};

const DEFAULT_PRICING_PLAN_ID = 'starter-plan';

async function nextSiteId(prefix = crypto.randomUUID().replace(/-/g, '')) {
    const rows = await prisma.site.findMany({
        where: {
            id: {
                startsWith: prefix,
            },
        },
        select: {
            id: true,
        },
        orderBy: {
            id: 'desc',
        },
        take: 50,
    });

    let max = 0;
    const re = new RegExp(`^${prefix}(\\d{2})$`, 'i');

    for (const row of rows) {
        const match = row.id.match(re);

        if (!match) {
            continue;
        }

        const value = Number(match[1]);

        if (Number.isFinite(value) && value > max) {
            max = value;
        }
    }

    const next = max + 1;
    const suffix = String(next).padStart(2, '0');

    return `${prefix}${suffix}`.toLowerCase();
}

export async function createSite(input: CreateSiteInput) {
    const id = await nextSiteId();

    const pricingPlanId = input.pricingPlanId ?? DEFAULT_PRICING_PLAN_ID;

    const plan = await prisma.pricingPlan.findUnique({
        where: {
            id: pricingPlanId,
        },
        select: {
            id: true,
            name: true,
            code: true,
            price: true,
            currency: true,
            billingCycle: true,
            status: true,
        },
    });

    if (!plan) {
        throw new Error(`Pricing plan "${pricingPlanId}" was not found.`);
    }

    if (plan.status !== 'ACTIVE') {
        throw new Error(`Pricing plan "${plan.code}" is inactive.`);
    }

    const now = new Date();

    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    const site = await prisma.$transaction(async (tx) => {
        const createdSite = await tx.site.create({
            data: {
                id,
                name: input.name,
                domain: input.domain,
                type: input.type ?? WebsiteType.ecommerce,
                category: input.category ?? null,
                logoUrl: input.logoUrl ?? null,
                faviconUrl: input.faviconUrl ?? null,
                contactEmail: input.contactEmail ?? null,
                contactPhone: input.contactPhone ?? null,
                seoTitle: input.seoTitle ?? null,
                seoDescription: input.seoDescription ?? null,
                status: input.status ?? SiteStatus.DRAFT,
                isPublic: input.isPublic ?? false,
                publishedAt: input.publishedAt ?? null,
                ownerUserId: input.ownerUserId,
                createdByUserId: input.createdByUserId ?? input.ownerUserId,
                workspaceId: input.workspaceId,
            },
        });

        await tx.siteSubscription.create({
            data: {
                siteId: createdSite.id,
                planId: plan.id,
                status: 'ACTIVE',
                billingCycle: plan.billingCycle,
                autoRenew: true,
                startedAt: now,
                currentPeriodStart: now,
                currentPeriodEnd,
                nextBillingAt: currentPeriodEnd,
            },
        });

        return createdSite;
    });

    return site;
}

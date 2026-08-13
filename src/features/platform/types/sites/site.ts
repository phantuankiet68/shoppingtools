export interface SiteOwner {
    id: string;
    name: string;
    email: string;
}

export interface SitePlan {
    id: string;
    name: string;
    code: string;

    price: number;
    billingCycle: string;

    maxPages: number;
    maxProducts: number;
    maxUsers: number;

    maxStorageBytes: number;
    maxBandwidthBytes: number;

    canCustomDomain: boolean;
    canRemoveBranding: boolean;
    canUseAnalytics: boolean;
    canUseEmail: boolean;
}

export interface SiteSubscription {
    id: string;

    status: string;
    billingCycle: string;

    autoRenew: boolean;

    startedAt: string;

    trialEndsAt: string | null;

    currentPeriodStart: string;
    currentPeriodEnd: string;

    nextBillingAt: string | null;

    canceledAt: string | null;

    plan: SitePlan;
}

export interface SiteItem {
    id: string;

    name: string;
    domain: string;

    type: string;
    category: string | null;

    logoUrl: string | null;
    faviconUrl: string | null;

    seoTitle: string | null;
    seoDescription: string | null;

    contactEmail: string | null;
    contactPhone: string | null;

    status: string;
    isPublic: boolean;

    publishedAt: string | null;

    domainVerificationStatus: string;

    sslStatus: string;
    sslProvider: string | null;
    sslExpiresAt: string | null;

    deploymentStatus: string;

    storageUsedBytes: number;
    bandwidthUsedBytes: number;

    totalVisits: number;

    createdAt: string;
    updatedAt: string;

    owner: SiteOwner;

    subscription: SiteSubscription | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface SiteListResponse {
    success: boolean;
    data: SiteItem[];
    pagination: Pagination;
}

export interface SiteDetailResponse {
    success: boolean;

    data: SiteItem;
}

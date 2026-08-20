export type SiteStatus = 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';

export type WebsiteType = 'landing' | 'blog' | 'ecommerce' | 'booking' | 'lms';

export type PaymentSiteStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' | 'REFUNDED';

export type PaymentSiteProvider = 'STRIPE' | 'PAYPAL' | 'MOMO' | 'VNPAY' | 'MANUAL';

export type PaymentSiteMethod = 'CARD' | 'BANK_TRANSFER' | 'WALLET' | 'CASH';

export type SiteLike = {
    id: string;
    name: string;
    domain: string;
    type: WebsiteType;
    category: string | null;

    logoUrl: string | null;
    faviconUrl: string | null;

    contactEmail: string | null;
    contactPhone: string | null;

    seoTitle: string | null;
    seoDescription: string | null;

    status: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';

    isPublic: boolean;
    publishedAt: string | null;

    domainVerificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';

    domainVerifiedAt: string | null;

    sslStatus:
        | 'PENDING'
        | 'PROVISIONING'
        | 'ACTIVE'
        | 'EXPIRING'
        | 'EXPIRED'
        | 'FAILED'
        | 'REVOKED';

    sslProvider: string | null;
    sslCertificateId: string | null;
    sslIssuedAt: string | null;
    sslExpiresAt: string | null;
    sslAutoRenew: boolean;
    sslLastCheckedAt: string | null;
    sslErrorCode: string | null;
    sslErrorMessage: string | null;

    deploymentStatus: 'IDLE' | 'BUILDING' | 'DEPLOYING' | 'SUCCESS' | 'FAILED';

    deployedAt: string | null;
    deploymentError: string | null;

    storageUsedBytes: string;
    bandwidthUsedBytes: string;
    totalVisits: string;

    themeConfig: unknown;

    createdAt: string;
    updatedAt: string;

    subscription?: {
        id: string;
        planId: string;

        status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELED' | 'EXPIRED';

        billingCycle: 'MONTHLY' | 'YEARLY';

        autoRenew: boolean;

        startedAt: string;
        trialEndsAt: string | null;

        currentPeriodStart: string;
        currentPeriodEnd: string;

        nextBillingAt: string | null;
        canceledAt: string | null;

        plan: {
            id: string;
            name: string;
            code: string;

            price: string;

            billingCycle: 'MONTHLY' | 'YEARLY';

            status: 'ACTIVE' | 'INACTIVE';
        } | null;
    } | null;

    paymentSites?: {
        id: string;

        amount: string;
        currency: string;

        /**
         * 1, 3, 6 or 12 months
         */
        billingMonths: number;

        paymentCode: string;

        status: PaymentSiteStatus;

        provider: PaymentSiteProvider;

        method: PaymentSiteMethod | null;

        transactionId: string | null;
        invoiceNumber: string | null;
        receiptUrl: string | null;

        description: string | null;

        paidAt: string | null;

        providerEventId: string | null;

        failureCode: string | null;
        failureMessage: string | null;

        refundedAt: string | null;

        createdAt: string;
        updatedAt: string;
    }[];
};

export type SiteFormState = {
    name: string;
    domain: string;

    type: WebsiteType;
    category: string;

    logoUrl: string;
    faviconUrl: string;

    logoFile?: File | null;
    faviconFile?: File | null;

    contactEmail: string;
    contactPhone: string;

    seoTitle: string;
    seoDescription: string;

    status: SiteStatus;

    isPublic: boolean;

    publishedAt: string;
};

export type FormErrors = {
    name?: string;
    domain?: string;
    type?: string;
    category?: string;

    logoUrl?: string;
    faviconUrl?: string;

    contactEmail?: string;
    contactPhone?: string;

    seoTitle?: string;
    seoDescription?: string;
};

export type SiteFormMode = 'create' | 'edit';

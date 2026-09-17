export type AnalyticsQuery = {
    year: number;
    start: Date;
    end: Date;
};

export type AnalyticsPaymentType = 'paid' | 'unpaid' | 'awaiting_confirmation';

export type ExpiringSiteQuery = {
    days: number;
    limit: number;
};

export type AnalyticsOverview = {
    period: {
        year: number;
        start: string;
        end: string;
    };
    cards: {
        totalRevenue: number;
        totalExpense: number;
        pendingRevenue: number;
        pendingTransactions: number;
        negativeBalance: number;
        negativeSites: number;
        revenueChangePercent: number | null;
        expenseChangePercent: number | null;
    };
};

export type RevenueAnalytics = {
    year: number;
    months: Array<{
        month: number;
        label: string;
        revenue: number;
        pending: number;
        expense: number;
    }>;
};

export type PaymentAnalyticsItem = {
    id: string;
    siteId: string;
    siteName: string;
    domain: string;
    siteType: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    method: string | null;
    paymentCode: string;
    paidAt: string | null;
    createdAt: string;
    confirmationRequestedAt: string | null;
};

export type PaymentAnalytics = {
    type: AnalyticsPaymentType;
    year: number;
    total: number;
    items: PaymentAnalyticsItem[];
};

export type SubscriptionAnalytics = {
    year: number;
    registered: number;
    expired: number;
    pendingApproval: number;
    active: number;
    trial: number;
    suspended: number;
    expiring7Days: number;
    expiring30Days: number;
    awaitingConfirmation: number;
    processing: number;
};

export type ExpiringSiteItem = {
    siteId: string;
    siteName: string;
    domain: string;
    siteType: string;
    planName: string;
    planCode: string;
    subscriptionStatus: string;
    currentPeriodEnd: string;
    daysLeft: number;
};

export type AnalyticsNotification = {
    id: string;
    type: 'warning' | 'success' | 'danger' | 'info';
    message: string;
    createdAt: string;
};

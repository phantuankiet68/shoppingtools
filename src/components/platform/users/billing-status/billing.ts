export type BillingStatus =
    | 'PAID'
    | 'EXPIRING_SOON'
    | 'OVERDUE'
    | 'TRIAL'
    | 'SUSPENDED'
    | 'CANCELED'
    | 'EXPIRED'
    | 'NO_SUBSCRIPTION';

export interface BillingItem {
    id: string;
    customer: {
        id: string;
        name: string;
        email: string;
        avatar?: string | null;
        username?: string | null;
    };
    site: string;
    domain: string;
    plan: string | null;
    amount: number;
    currency: string;
    billingCycle: 'MONTHLY' | 'YEARLY' | null;
    nextBilling: string | null;
    daysRemaining: number | null;
    lastPaidAt: string | null;
    subscriptionStatus: string | null;
    status: BillingStatus;
    notification: string;
    icon: string;
    color: string;
}

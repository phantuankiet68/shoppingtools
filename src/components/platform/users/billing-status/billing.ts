export type BillingStatus =
    | 'PAID'
    | 'EXPIRING_SOON'
    | 'OVERDUE'
    | 'TRIAL'
    | 'SUSPENDED'
    | 'CANCELED'
    | 'EXPIRED'
    | 'NO_SUBSCRIPTION';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' | 'REFUNDED';

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
    planId: string | null;

    amount: number;
    currency: string;

    billingCycle: 'MONTHLY' | 'YEARLY' | null;

    nextBilling: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;

    daysRemaining: number | null;

    lastPaidAt: string | null;

    subscriptionId: string | null;

    subscriptionStatus:
        | 'TRIAL'
        | 'ACTIVE'
        | 'PAST_DUE'
        | 'SUSPENDED'
        | 'CANCELED'
        | 'EXPIRED'
        | null;

    paymentStatus: PaymentStatus | null;
    pendingPaymentId: string | null;

    status: BillingStatus;

    notification: string;
    icon: string;
    color: string;
}

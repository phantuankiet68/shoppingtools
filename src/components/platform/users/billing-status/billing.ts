export type BillingStatus = 'PAID' | 'EXPIRING_SOON' | 'OVERDUE' | 'TRIAL';

export interface BillingItem {
    id: number;

    customer: string;

    site: string;

    domain: string;

    plan: string;

    amount: number;

    billingCycle: 'Monthly' | 'Yearly';

    nextBilling: string;

    daysRemaining: number;

    status: BillingStatus;

    notification: string;

    action: string;

    icon: string;

    color: string;
}

export const BILLING_LIST: BillingItem[] = [
    {
        id: 1,
        customer: 'Emma',
        site: 'Landing Page',
        domain: 'landing.demo.com',
        plan: 'Business',
        amount: 12,
        billingCycle: 'Monthly',
        nextBilling: '18 Aug 2026',
        daysRemaining: 24,
        status: 'PAID',
        notification: 'Everything is up to date. The next payment will be charged automatically.',
        action: 'View Details',
        icon: 'bi-globe2',
        color: '#2563eb',
    },
    {
        id: 2,
        customer: 'Michael',
        site: 'Company Website',
        domain: 'company.demo.com',
        plan: 'Plus',
        amount: 25,
        billingCycle: 'Monthly',
        nextBilling: '11 Aug 2026',
        daysRemaining: 5,
        status: 'EXPIRING_SOON',
        notification: 'Subscription expires in 5 days. Please remind the customer to renew.',
        action: 'Send Reminder',
        icon: 'bi-building',
        color: '#f59e0b',
    },
    {
        id: 3,
        customer: 'Sophia',
        site: 'Portfolio',
        domain: 'portfolio.demo.com',
        plan: 'Starter',
        amount: 8,
        billingCycle: 'Monthly',
        nextBilling: '03 Aug 2026',
        daysRemaining: -3,
        status: 'OVERDUE',
        notification:
            'Payment is overdue. Consider contacting the customer before suspending the service.',
        action: 'Send Email',
        icon: 'bi-person-workspace',
        color: '#ef4444',
    },
    {
        id: 4,
        customer: 'Lucas',
        site: 'Restaurant Website',
        domain: 'restaurant.demo.com',
        plan: 'Trial',
        amount: 0,
        billingCycle: 'Monthly',
        nextBilling: '09 Aug 2026',
        daysRemaining: 2,
        status: 'TRIAL',
        notification: 'Trial ends in 2 days. Invite the customer to upgrade to a paid plan.',
        action: 'Upgrade',
        icon: 'bi-stars',
        color: '#06b6d4',
    },
];

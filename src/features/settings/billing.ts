import { BillingItem } from '@/features/settings/type';

export const billingHistory: BillingItem[] = [
  {
    id: '1',
    invoice: 'Account Sale',
    date: 'Apr 14, 2004',
    amount: '$3,050',
    status: 'Pending',
    tracking: 'LM580405575CN',
    address: '313 Main Road, Sunderland',
  },
  {
    id: '2',
    invoice: 'Account Sale',
    date: 'Jun 24, 2008',
    amount: '$1,050',
    status: 'Cancelled',
    tracking: 'AZ938540353US',
    address: '96 Grange Road, Peterborough',
  },
  {
    id: '3',
    invoice: 'Netflix Subscription',
    date: 'Feb 28, 2004',
    amount: '$800',
    status: 'Refund',
    tracking: '35331605504US',
    address: '2 New Street, Harrogate',
  },
];
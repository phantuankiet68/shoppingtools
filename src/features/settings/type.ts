export type TabKey =
  | 'my-details'
  | 'profile'
  | 'password'
  | 'team'
  | 'billings'
  | 'plan'
  | 'email'
  | 'notifications';

export type SystemCredentialForm = {
  key: string;
  provider: string;
  apiKeyEncrypted: string;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  isActive: boolean;
  siteId: string;
};

export type BillingItem = {
  id: string;
  invoice: string;
  date: string;
  amount: string;
  status: 'Pending' | 'Cancelled' | 'Refund';
  tracking: string;
  address: string;
};

export type TabItem = {
  key: TabKey;
  label: string;
  icon: string;
};
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/admin/email/email.module.css';
import EmailTemplatePreview from '@/components/admin/email/templates/EmailTemplatePreview';
import type { EmailTemplateData, TemplateId } from '@/features/email/types';

type EmailCampaignStatus =
  | 'draft'
  | 'queued'
  | 'scheduled'
  | 'sent'
  | 'partial'
  | 'failed'
  | 'cancelled';

type EmailProvider = 'SMTP' | 'RESEND' | 'SENDGRID';
type EmailType = 'SYSTEM' | 'TEMPLATE' | 'BULK' | 'TEST';

interface EmailCampaignSummary {
  id: string;
  title: string;
  templateName: string;
  subject: string;
  totalRecipients: number;
  sentAt: string;
  status: EmailCampaignStatus;
  provider?: EmailProvider;
  type?: EmailType;
}

interface EmailTemplateDefinition {
  key: TemplateId;
  name: string;
  subject: string;
  content: string;
  description: string;
}

interface TemplateDefaultFields {
  ctaText: string;
  promoCode: string;
  productName: string;
  productImage: string;
  benefitsText: string;
}

interface EmailRecipientStats {
  validEmails: string[];
  invalidEmails: string[];
  duplicateCount: number;
  batchCount: number;
}

interface SendEmailPayload {
  userId: string;
  siteId: string;
  campaignTitle: string;
  templateKey: TemplateId;
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  provider: EmailProvider;
  type: EmailType;
  testMode: boolean;
  scheduledAt: string | null;
  recipients: Array<{
    email: string;
  }>;
  data: EmailTemplateData;
}

interface EmailListItem {
  id: string;
  templateId: string | null;
  templateKey: string | null;
  type: EmailType;
  status: Uppercase<EmailCampaignStatus>;
  subject: string;
  previewText: string | null;
  fromName: string | null;
  fromEmail: string | null;
  replyToEmail: string | null;
  provider: EmailProvider | null;
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  testMode: boolean;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  template: {
    id: string;
    key: string;
    name: string;
  } | null;
}

interface EmailListResponse {
  items: EmailListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface AdminAuthMeResponse {
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    systemRole: string;
    roleLabel: string;
  };
  currentWorkspace?: {
    id: string;
    name: string;
    slug: string;
    role: string;
  } | null;
  site?: {
    id: string;
    name: string;
    domain: string | null;
    ownerUserId: string;
    status: string;
    workspaceId: string | null;
    type: string | null;
  } | null;
}

const BATCH_SIZE = 100;
const DEFAULT_CTA_URL = 'https://your-landing-page.com';
const DEFAULT_FROM_NAME = 'Support Team';
const DEFAULT_FROM_EMAIL = 'support@yourdomain.com';
const DEFAULT_REPLY_TO_EMAIL = 'support@yourdomain.com';

const EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
  {
    key: 'welcome',
    name: 'Welcome',
    subject: 'Welcome to our platform',
    description: 'Used for onboarding and greeting new users.',
    content:
      'Hello {{name}},\n\nThank you for joining our platform.\nWe are happy to have you with us.\n\nBest regards,',
  },
  {
    key: 'promotion',
    name: 'Promotion',
    subject: 'Order now and enjoy Free Delivery completely on us',
    description: 'Used for promotional offers, discounts, and product campaigns.',
    content:
      'Click below to complete your order and enter your exclusive code below to receive free delivery on your order.',
  },
  {
    key: 'reminder',
    name: 'Reminder',
    subject: 'Important reminder',
    description: 'Used to remind users about incomplete actions or important updates.',
    content:
      'Hello {{name}},\n\nThis is a reminder regarding your recent activity.\nPlease review the latest information.\n\nBest regards,',
  },
];

const PROVIDER_OPTIONS: EmailProvider[] = ['SMTP', 'RESEND', 'SENDGRID'];
const EMAIL_TYPE_OPTIONS: EmailType[] = ['SYSTEM', 'TEMPLATE', 'BULK', 'TEST'];

function parseEmails(value: string): string[] {
  return value
    .split(/\r?\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidDateTime(value: string): boolean {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function getTemplateDefaultFields(templateKey: TemplateId): TemplateDefaultFields {
  if (templateKey === 'promotion') {
    return {
      ctaText: 'Complete My Order',
      promoCode: 'AC41FD2P',
      productName: 'Mounjaro Kwikpen',
      productImage: '/image.png',
      benefitsText:
        'Clinically proven prescription medication\nReduces hunger and cravings\nPaired with clinical support to assess progress',
    };
  }

  if (templateKey === 'reminder') {
    return {
      ctaText: 'Review now',
      promoCode: '',
      productName: 'Action checklist',
      productImage: '',
      benefitsText:
        'Complete your pending step\nReview your recent activity\nContinue where you left off',
    };
  }

  return {
    ctaText: 'Get started',
    promoCode: '',
    productName: 'Getting started guide',
    productImage: '',
    benefitsText: 'Quick setup\nEasy onboarding\nHelpful support',
  };
}

function getStatusDotClass(status: EmailCampaignStatus): string {
  if (status === 'sent') return styles.dotSent;
  if (status === 'queued' || status === 'scheduled') return styles.dotSending;
  return styles.dotFailed;
}

function getStatusLabel(status: EmailCampaignStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'queued':
      return 'Queued';
    case 'scheduled':
      return 'Scheduled';
    case 'sent':
      return 'Sent';
    case 'partial':
      return 'Partial';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

function buildRecipientStats(emailsText: string): EmailRecipientStats {
  const rawEmails = parseEmails(emailsText);
  const deduplicatedEmails = [...new Set(rawEmails.map((item) => item.toLowerCase()))];

  const validEmails: string[] = [];
  const invalidEmails: string[] = [];

  for (const email of deduplicatedEmails) {
    if (isValidEmail(email)) {
      validEmails.push(email);
    } else {
      invalidEmails.push(email);
    }
  }

  return {
    validEmails,
    invalidEmails,
    duplicateCount: rawEmails.length - deduplicatedEmails.length,
    batchCount: Math.ceil(validEmails.length / BATCH_SIZE),
  };
}

function formatLocalDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapApiStatus(status: string | null | undefined): EmailCampaignStatus {
  const normalized = (status || '').toLowerCase();

  if (
    normalized === 'draft' ||
    normalized === 'queued' ||
    normalized === 'scheduled' ||
    normalized === 'sent' ||
    normalized === 'partial' ||
    normalized === 'failed' ||
    normalized === 'cancelled'
  ) {
    return normalized;
  }

  return 'queued';
}

function mapEmailItemToCampaign(item: EmailListItem): EmailCampaignSummary {
  const title = item.previewText?.trim() || item.template?.name || item.templateKey || item.subject;
  const sentAtSource = item.sentAt || item.scheduledAt || item.createdAt;

  return {
    id: item.id,
    title,
    templateName: item.template?.name || item.templateKey || 'Unknown template',
    subject: item.subject,
    totalRecipients: item.totalRecipients,
    sentAt: formatLocalDateTime(new Date(sentAtSource)),
    status: mapApiStatus(item.status),
    provider: item.provider ?? undefined,
    type: item.type,
  };
}

export default function AdminEmailPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaignSummary[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [listError, setListError] = useState('');
  const [contextError, setContextError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<TemplateId>('welcome');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [previewText, setPreviewText] = useState('A quick preview of the email content.');
  const [content, setContent] = useState(EMAIL_TEMPLATES[0].content);
  const [emailsText, setEmailsText] = useState('');
  const [userId, setUserId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteDomain, setSiteDomain] = useState('');
  const [fromName, setFromName] = useState(DEFAULT_FROM_NAME);
  const [fromEmail, setFromEmail] = useState(DEFAULT_FROM_EMAIL);
  const [replyToEmail, setReplyToEmail] = useState(DEFAULT_REPLY_TO_EMAIL);
  const [provider, setProvider] = useState<EmailProvider>('RESEND');
  const [emailType, setEmailType] = useState<EmailType>('BULK');
  const [scheduledAt, setScheduledAt] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [ctaText, setCtaText] = useState(() => getTemplateDefaultFields('welcome').ctaText);
  const [ctaUrl, setCtaUrl] = useState(DEFAULT_CTA_URL);
  const [promoCode, setPromoCode] = useState(() => getTemplateDefaultFields('welcome').promoCode);
  const [productName, setProductName] = useState(() => getTemplateDefaultFields('welcome').productName);
  const [productImage, setProductImage] = useState(() => getTemplateDefaultFields('welcome').productImage);
  const [benefitsText, setBenefitsText] = useState(() => getTemplateDefaultFields('welcome').benefitsText);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const hasAutoFilledContextRef = useRef(false);

  const selectedTemplate = useMemo(
    () => EMAIL_TEMPLATES.find((item) => item.key === selectedTemplateKey) ?? null,
    [selectedTemplateKey]
  );

  const recipientStats = useMemo(() => buildRecipientStats(emailsText), [emailsText]);
  const { validEmails, invalidEmails, duplicateCount, batchCount } = recipientStats;

  const filteredCampaigns = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return campaigns;
    }

    return campaigns.filter((campaign) => {
      return (
        campaign.title.toLowerCase().includes(normalizedKeyword) ||
        campaign.subject.toLowerCase().includes(normalizedKeyword) ||
        campaign.templateName.toLowerCase().includes(normalizedKeyword) ||
        campaign.status.toLowerCase().includes(normalizedKeyword) ||
        campaign.provider?.toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [campaigns, searchKeyword]);

  const previewData = useMemo<EmailTemplateData>(
    () => ({
      campaignTitle,
      subject,
      content,
      ctaText,
      ctaUrl,
      promoCode,
      productName,
      productImage,
      benefits: benefitsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    }),
    [campaignTitle, subject, content, ctaText, ctaUrl, promoCode, productName, productImage, benefitsText]
  );

  const resetTemplateFields = (templateKey: TemplateId) => {
    const template = EMAIL_TEMPLATES.find((item) => item.key === templateKey);
    if (!template) return;

    const defaults = getTemplateDefaultFields(templateKey);

    setSelectedTemplateKey(templateKey);
    setSubject(template.subject);
    setContent(template.content);
    setCtaText(defaults.ctaText);
    setPromoCode(defaults.promoCode);
    setProductName(defaults.productName);
    setProductImage(defaults.productImage);
    setBenefitsText(defaults.benefitsText);
  };

  const resetFormAfterSend = () => {
    resetTemplateFields('welcome');
    setCampaignTitle('');
    setPreviewText('A quick preview of the email content.');
    setEmailsText('');
    setScheduledAt('');
    setTestMode(false);
    setFromName(DEFAULT_FROM_NAME);
    setFromEmail(DEFAULT_FROM_EMAIL);
    setReplyToEmail(DEFAULT_REPLY_TO_EMAIL);
    setProvider('RESEND');
    setEmailType('BULK');
    setCtaUrl(DEFAULT_CTA_URL);
  };

  const buildPayload = (): SendEmailPayload => ({
    userId: userId.trim(),
    siteId: siteId.trim(),
    campaignTitle: campaignTitle.trim(),
    templateKey: selectedTemplateKey,
    subject: subject.trim(),
    previewText: previewText.trim(),
    fromName: fromName.trim(),
    fromEmail: fromEmail.trim(),
    replyToEmail: replyToEmail.trim(),
    provider,
    type: emailType,
    testMode,
    scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    recipients: validEmails.map((email) => ({ email })),
    data: previewData,
  });

  const fetchCampaigns = useCallback(async () => {
    if (!userId.trim()) {
      setCampaigns([]);
      setListError('Waiting for user context before loading email history.');
      return;
    }

    setIsLoadingCampaigns(true);
    setListError('');

    try {
      const params = new URLSearchParams({
        userId: userId.trim(),
        limit: '50',
      });

      if (siteId.trim()) {
        params.set('siteId', siteId.trim());
      }

      if (searchKeyword.trim()) {
        params.set('search', searchKeyword.trim());
      }

      const response = await fetch(`/api/admin/email/list?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const result = (await response.json()) as EmailListResponse & { message?: string };

      if (!response.ok) {
        throw new Error(result.message || 'Failed to load email campaigns.');
      }

      setCampaigns((result.items || []).map(mapEmailItemToCampaign));
    } catch (error) {
      setCampaigns([]);
      setListError(error instanceof Error ? error.message : 'Failed to load email campaigns.');
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [siteId, searchKeyword, userId]);

  useEffect(() => {
    const fetchAdminContext = async () => {
      setIsLoadingContext(true);
      setContextError('');

      try {
        const response = await fetch('/api/admin/auth/me', {
          method: 'GET',
          cache: 'no-store',
        });

        const result = (await response.json()) as AdminAuthMeResponse & { message?: string };

        if (!response.ok) {
          throw new Error(result.message || 'Failed to load admin context.');
        }

        const nextUserId = result.user?.id ?? '';
        const nextSiteId = result.site?.id ?? '';

        if (!hasAutoFilledContextRef.current) {
          setUserId(nextUserId);
          setSiteId(nextSiteId);
          hasAutoFilledContextRef.current = true;
        }

        setWorkspaceName(result.currentWorkspace?.name ?? '');
        setSiteName(result.site?.name ?? '');
        setSiteDomain(result.site?.domain ?? '');

        if (result.user?.email && DEFAULT_FROM_EMAIL === fromEmail) {
          setFromEmail(result.user.email);
        }

        if (result.user?.name && DEFAULT_FROM_NAME === fromName) {
          setFromName(result.user.name);
        }

        if (result.user?.email && DEFAULT_REPLY_TO_EMAIL === replyToEmail) {
          setReplyToEmail(result.user.email);
        }
      } catch (error) {
        setContextError(error instanceof Error ? error.message : 'Failed to load admin context.');
      } finally {
        setIsLoadingContext(false);
      }
    };

    void fetchAdminContext();
  }, [fromEmail, fromName, replyToEmail]);

  useEffect(() => {
    if (!userId.trim()) return;
    void fetchCampaigns();
  }, [fetchCampaigns, userId]);

  const handleSend = async () => {
    if (!userId.trim()) {
      setMessage('Please enter a user ID.');
      return;
    }

    if (!siteId.trim()) {
      setMessage('Please enter a site ID.');
      return;
    }

    if (!campaignTitle.trim()) {
      setMessage('Please enter a campaign name.');
      return;
    }

    if (!selectedTemplate) {
      setMessage('Please select a template.');
      return;
    }

    if (!subject.trim()) {
      setMessage('Please enter an email subject.');
      return;
    }

    if (!previewText.trim()) {
      setMessage('Please enter preview text.');
      return;
    }

    if (!fromName.trim()) {
      setMessage('Please enter a sender name.');
      return;
    }

    if (!isValidEmail(fromEmail.trim())) {
      setMessage('Please enter a valid sender email address.');
      return;
    }

    if (replyToEmail.trim() && !isValidEmail(replyToEmail.trim())) {
      setMessage('Please enter a valid reply-to email address.');
      return;
    }

    if (!ctaUrl.trim() || !isValidUrl(ctaUrl.trim())) {
      setMessage('Please enter a valid CTA URL.');
      return;
    }

    if (scheduledAt && !isValidDateTime(scheduledAt)) {
      setMessage('Please enter a valid scheduled date and time.');
      return;
    }

    if (validEmails.length === 0) {
      setMessage('Please enter at least 1 valid email address.');
      return;
    }

    setIsSending(true);
    setMessage('');

    try {
      const payload = buildPayload();
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let result: { message?: string; emailId?: string; status?: EmailCampaignStatus } | null = null;

      try {
        result = (await response.json()) as {
          message?: string;
          emailId?: string;
          status?: EmailCampaignStatus;
        };
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(result?.message || 'An error occurred while sending the email.');
      }

      resetFormAfterSend();
      setMessage(
        scheduledAt
          ? `Campaign scheduled successfully for ${formatLocalDateTime(new Date(scheduledAt))}.`
          : `Successfully submitted ${validEmails.length} recipients in ${batchCount} batch(es).`
      );
      await fetchCampaigns();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred while sending the email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.searchIcon}>
              <path
                d="M21 21L16.65 16.65M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <input
              className={styles.searchInput}
              placeholder="Search campaigns"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </div>
        </div>

        <div className={styles.list}>
          {isLoadingCampaigns && <div className={styles.messageBox}>Loading campaigns...</div>}
          {!isLoadingCampaigns && listError && <div className={styles.messageBox}>{listError}</div>}
          {!isLoadingCampaigns && !listError && filteredCampaigns.length === 0 && (
            <div className={styles.messageBox}>No campaigns found.</div>
          )}

          {!isLoadingCampaigns &&
            filteredCampaigns.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                onClick={() => setSelectedCampaignId(campaign.id)}
                className={`${styles.listItem} ${
                  selectedCampaignId === campaign.id ? styles.listItemActive : ''
                }`}
              >
                <div className={styles.avatar}>{campaign.title.charAt(0) || 'C'}</div>

                <div className={styles.itemContent}>
                  <div className={styles.itemTop}>
                    <strong className={styles.itemTitle}>{campaign.title}</strong>
                    <span className={`${styles.statusDot} ${getStatusDotClass(campaign.status)}`} />
                  </div>

                  <p className={styles.itemSubtitle}>{campaign.subject}</p>
                  <span className={styles.itemMeta}>
                    {campaign.templateName} • {campaign.totalRecipients} recipients
                  </span>
                  <span className={styles.itemMeta}>
                    {getStatusLabel(campaign.status)} • {campaign.provider ?? '--'}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.contentGrid}>
          <section className={styles.panel}>
            <div className={styles.formSection}>
              <div className={styles.sectionBlock}>
                <div className={styles.blockHeader}>
                  <h4>Account context</h4>
                </div>

                {isLoadingContext && <div className={styles.messageBox}>Loading admin context...</div>}
                {!isLoadingContext && contextError && <div className={styles.messageBox}>{contextError}</div>}

                <div className={styles.formRow}>
                 <div className={styles.formGroup}>
                    <label htmlFor="userId">User ID</label>
                    <input
                        id="userId"
                        className={styles.input}
                        value={userId}
                        readOnly
                        placeholder="Auto-filled from /api/admin/auth/me"
                    />
                    </div>

                    <div className={styles.formGroup}>
                    <label htmlFor="siteId">Site ID</label>
                    <input
                        id="siteId"
                        className={styles.input}
                        value={siteId}
                        readOnly
                        placeholder="Auto-filled from /api/admin/auth/me"
                    />
                    </div>
                </div>
              </div>

              <div className={styles.sectionBlock}>
                <div className={styles.formGroup}>
                  <label htmlFor="campaignTitle">Campaign name</label>
                  <input
                    id="campaignTitle"
                    className={styles.input}
                    value={campaignTitle}
                    onChange={(event) => setCampaignTitle(event.target.value)}
                    placeholder="Example: Welcome Campaign - April"
                  />
                  <span className={styles.fieldHint}>
                    Internal name used to manage the campaign in the admin panel.
                  </span>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="template">Template key</label>
                    <select
                      id="template"
                      className={styles.select}
                      value={selectedTemplateKey}
                      onChange={(event) => resetTemplateFields(event.target.value as TemplateId)}
                    >
                      {EMAIL_TEMPLATES.map((template) => (
                        <option key={template.key} value={template.key}>
                          {template.key} — {template.name}
                        </option>
                      ))}
                    </select>
                    <span className={styles.fieldHint}>
                      This maps directly to EmailTemplate.key in the database.
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="batchSize">Batch size</label>
                    <input
                      id="batchSize"
                      className={styles.inputDisabled}
                      value={`${BATCH_SIZE} emails / batch`}
                      disabled
                    />
                    <span className={styles.fieldHint}>The current batch size is fixed.</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="templateDescription">Template description</label>
                  <input
                    id="templateDescription"
                    className={styles.inputDisabled}
                    value={selectedTemplate?.description ?? ''}
                    disabled
                  />
                  <span className={styles.fieldHint}>
                    Reference description of the selected template.
                  </span>
                </div>
              </div>

              <div className={styles.sectionBlock}>
                <div className={styles.blockHeader}>
                  <h4>Message metadata</h4>
                  <p>Fields that map directly to the Email model.</p>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="provider">Provider</label>
                    <select
                      id="provider"
                      className={styles.select}
                      value={provider}
                      onChange={(event) => setProvider(event.target.value as EmailProvider)}
                    >
                      {PROVIDER_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="emailType">Email type</label>
                    <select
                      id="emailType"
                      className={styles.select}
                      value={emailType}
                      onChange={(event) => setEmailType(event.target.value as EmailType)}
                    >
                      {EMAIL_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="fromName">From name</label>
                    <input
                      id="fromName"
                      className={styles.input}
                      value={fromName}
                      onChange={(event) => setFromName(event.target.value)}
                      placeholder="Support Team"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="fromEmail">From email</label>
                    <input
                      id="fromEmail"
                      className={styles.input}
                      value={fromEmail}
                      onChange={(event) => setFromEmail(event.target.value)}
                      placeholder="support@yourdomain.com"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="replyToEmail">Reply-to email</label>
                    <input
                      id="replyToEmail"
                      className={styles.input}
                      value={replyToEmail}
                      onChange={(event) => setReplyToEmail(event.target.value)}
                      placeholder="support@yourdomain.com"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="scheduledAt">Scheduled time</label>
                    <input
                      id="scheduledAt"
                      className={styles.input}
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(event) => setScheduledAt(event.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={testMode}
                      onChange={(event) => setTestMode(event.target.checked)}
                    />
                    <span>Enable test mode</span>
                  </label>
                  <span className={styles.fieldHint}>
                    When enabled, the backend can mark Email.testMode = true.
                  </span>
                </div>
              </div>

              <div className={styles.sectionBlock}>
                <div className={styles.blockHeader}>
                  <h4>Message content</h4>
                  <p>Fields used to build the final email content.</p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    className={styles.input}
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Enter the email subject"
                  />
                  <span className={styles.fieldHint}>
                    Stored in Email.subject and shown to recipients.
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="previewText">Preview text</label>
                  <textarea
                    id="previewText"
                    className={styles.textarea}
                    value={previewText}
                    onChange={(event) => setPreviewText(event.target.value)}
                    placeholder="Enter preview text"
                  />
                  <span className={styles.fieldHint}>
                    Stored in Email.previewText for inbox preview snippets.
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="content">Main content</label>
                  <textarea
                    id="content"
                    className={styles.textarea}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Enter the email content"
                  />
                  <span className={styles.fieldHint}>
                    Main text used to render htmlContent or textContent on the backend.
                  </span>
                </div>
              </div>

              <div className={styles.sectionBlock}>
                <div className={styles.blockHeader}>
                  <h4>CTA & destination</h4>
                  <p>Button text and conversion destination URL.</p>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="ctaText">CTA text</label>
                    <input
                      id="ctaText"
                      className={styles.input}
                      value={ctaText}
                      onChange={(event) => setCtaText(event.target.value)}
                      placeholder="Complete My Order"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="ctaUrl">CTA URL</label>
                    <input
                      id="ctaUrl"
                      className={styles.input}
                      value={ctaUrl}
                      onChange={(event) => setCtaUrl(event.target.value)}
                      placeholder="https://your-landing-page.com"
                    />
                  </div>
                </div>
              </div>

              {selectedTemplateKey === 'promotion' && (
                <div className={styles.sectionBlock}>
                  <div className={styles.blockHeader}>
                    <h4>Offer & product details</h4>
                    <p>Template-specific fields for promotions.</p>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="promoCode">Promo code</label>
                      <input
                        id="promoCode"
                        className={styles.input}
                        value={promoCode}
                        onChange={(event) => setPromoCode(event.target.value)}
                        placeholder="AC41FD2P"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="productName">Product name</label>
                      <input
                        id="productName"
                        className={styles.input}
                        value={productName}
                        onChange={(event) => setProductName(event.target.value)}
                        placeholder="Mounjaro Kwikpen"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="productImage">Product image URL</label>
                    <input
                      id="productImage"
                      className={styles.input}
                      value={productImage}
                      onChange={(event) => setProductImage(event.target.value)}
                      placeholder="/image.png or https://..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="benefitsText">Benefits</label>
                    <textarea
                      id="benefitsText"
                      className={styles.textarea}
                      value={benefitsText}
                      onChange={(event) => setBenefitsText(event.target.value)}
                      placeholder={`Benefit 1\nBenefit 2\nBenefit 3`}
                    />
                  </div>
                </div>
              )}

              {selectedTemplateKey === 'welcome' && (
                <div className={styles.sectionBlock}>
                  <div className={styles.blockHeader}>
                    <h4>Welcome details</h4>
                    <p>Template-specific fields for onboarding emails.</p>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="welcomeBenefits">Benefits / highlights</label>
                    <textarea
                      id="welcomeBenefits"
                      className={styles.textarea}
                      value={benefitsText}
                      onChange={(event) => setBenefitsText(event.target.value)}
                      placeholder={`Quick setup\nEasy onboarding\nHelpful support`}
                    />
                  </div>
                </div>
              )}

              {selectedTemplateKey === 'reminder' && (
                <div className={styles.sectionBlock}>
                  <div className={styles.blockHeader}>
                    <h4>Reminder details</h4>
                    <p>Template-specific fields for reminder emails.</p>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="reminderBenefits">Reminder points</label>
                    <textarea
                      id="reminderBenefits"
                      className={styles.textarea}
                      value={benefitsText}
                      onChange={(event) => setBenefitsText(event.target.value)}
                      placeholder={`Complete your pending step\nReview your recent activity\nContinue where you left off`}
                    />
                  </div>
                </div>
              )}

              <div className={styles.sectionBlock}>
                <div className={styles.blockHeader}>
                  <h4>Recipients</h4>
                  <p>These map to EmailRecipient records.</p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="emailsText">Recipient list</label>
                  <textarea
                    id="emailsText"
                    className={styles.recipientArea}
                    value={emailsText}
                    onChange={(event) => setEmailsText(event.target.value)}
                    placeholder={`Enter the email list, one email per line\njohn@example.com\nanna@example.com\nsupport@example.com`}
                  />
                  <span className={styles.fieldHint}>
                    You can separate entries with line breaks, commas, or semicolons.
                  </span>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="validEmails">Valid emails</label>
                    <input
                      id="validEmails"
                      className={styles.inputDisabled}
                      value={validEmails.length}
                      disabled
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="duplicateEmails">Duplicate emails</label>
                    <input
                      id="duplicateEmails"
                      className={styles.inputDisabled}
                      value={duplicateCount}
                      disabled
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="batchCount">Estimated batches</label>
                  <input
                    id="batchCount"
                    className={styles.inputDisabled}
                    value={batchCount}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className={styles.bottomBar}>
              <div className={styles.inlineInfo}>
                <span className={styles.inlineDot} />
                User ID and Site ID are auto-filled from /api/admin/auth/me and remain editable.
              </div>

              <button
                className={styles.primaryButton}
                onClick={handleSend}
                disabled={isSending || isLoadingContext}
                type="button"
              >
                {isSending ? 'Submitting...' : scheduledAt ? 'Schedule campaign' : 'Send campaign'}
              </button>
            </div>

          </section>

          <section className={styles.summaryColumn}>
            <div className={styles.previewPanel}>
              <div className={styles.previewTopbar}>
                <div className={styles.previewDots}>
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.previewLabel}>Email Preview</div>
              </div>

              <div className={styles.previewBody}>
                <div className={styles.previewMailHeader}>
                  <div className={styles.previewAvatar}>EM</div>
                  <div>
                    <strong>{campaignTitle || 'Campaign preview'}</strong>
                    <p>{subject || '(No subject)'}</p>
                  </div>
                </div>

                <div className={styles.previewDivider} />

                <EmailTemplatePreview templateId={selectedTemplateKey} data={previewData} />
              </div>
            </div>

            <div className={styles.previewPanel}>
              <div className={styles.blockHeader}>
                <h4>Review information</h4>
                <p>Review the payload before submitting.</p>
              </div>

              <div className={styles.cardMetaGrid}>
                <div>
                  <span>User ID</span>
                  <strong>{userId || '--'}</strong>
                </div>
                <div>
                  <span>Site ID</span>
                  <strong>{siteId || '--'}</strong>
                </div>
                <div>
                  <span>Workspace</span>
                  <strong>{workspaceName || '--'}</strong>
                </div>
                <div>
                  <span>Site domain</span>
                  <strong>{siteDomain || '--'}</strong>
                </div>
                <div>
                  <span>Campaign</span>
                  <strong>{campaignTitle || '--'}</strong>
                </div>
                <div>
                  <span>Template key</span>
                  <strong>{selectedTemplateKey || '--'}</strong>
                </div>
                <div>
                  <span>Provider</span>
                  <strong>{provider}</strong>
                </div>
                <div>
                  <span>Type</span>
                  <strong>{emailType}</strong>
                </div>
                <div>
                  <span>Recipients</span>
                  <strong>{validEmails.length}</strong>
                </div>
                <div>
                  <span>CTA URL</span>
                  <strong>{ctaUrl || '--'}</strong>
                </div>
                <div>
                  <span>From</span>
                  <strong>{fromEmail || '--'}</strong>
                </div>
                <div>
                  <span>Scheduled at</span>
                  <strong>{scheduledAt || '--'}</strong>
                </div>
              </div>
            </div>

            {invalidEmails.length > 0 && (
              <div className={styles.warningPanel}>
                <div className={styles.warningTitle}>Invalid email addresses</div>
                <div className={styles.warningList}>
                  {invalidEmails.slice(0, 12).map((email) => (
                    <span key={email} className={styles.warningItem}>
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

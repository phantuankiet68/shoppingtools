'use client';

import EmailTemplatePreview from '@/components/admin/email/templates/EmailTemplatePreview';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import type { EmailTemplateData, TemplateId } from '@/features/email/types';
import styles from '@/styles/admin/email/email.module.css';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  status: string;
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
  message?: string;
}

interface SystemCredentialResponse {
  ok: boolean;
  message?: string;
  data?: {
    id?: string;
    key?: string;
    provider?: string;
    fromEmail?: string | null;
    fromName?: string | null;
    replyToEmail?: string | null;
    siteId?: string | null;
    isActive?: boolean;
    hasApiKey?: boolean;
    apiKeyMasked?: string;
  } | null;
}

const BATCH_SIZE = 100;

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

function getStatusDotClass(status: EmailCampaignStatus): string {
  if (status === 'sent') return styles.dotSent;
  if (status === 'queued' || status === 'scheduled') return styles.dotSending;
  return styles.dotFailed;
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

  if (normalized === 'partially_sent') return 'partial';

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

function normalizeProvider(value?: string | null): EmailProvider {
  const upper = (value || '').toUpperCase();

  if (upper === 'SMTP') return 'SMTP';
  if (upper === 'SENDGRID') return 'SENDGRID';
  return 'RESEND';
}

export default function AdminEmailPage() {
  const { user, site, currentWorkspace } = useAdminAuth();
  const { t } = useAdminI18n();

  const DEFAULT_CTA_URL = t('adminEmail.defaults.ctaUrl');

  const EMAIL_TEMPLATES = useMemo<EmailTemplateDefinition[]>(
    () => [
      {
        key: 'welcome',
        name: t('adminEmail.templates.welcome.name'),
        subject: t('adminEmail.templates.welcome.subject'),
        description: t('adminEmail.templates.welcome.description'),
        content: t('adminEmail.templates.welcome.content'),
      },
      {
        key: 'promotion',
        name: t('adminEmail.templates.promotion.name'),
        subject: t('adminEmail.templates.promotion.subject'),
        description: t('adminEmail.templates.promotion.description'),
        content: t('adminEmail.templates.promotion.content'),
      },
      {
        key: 'reminder',
        name: t('adminEmail.templates.reminder.name'),
        subject: t('adminEmail.templates.reminder.subject'),
        description: t('adminEmail.templates.reminder.description'),
        content: t('adminEmail.templates.reminder.content'),
      },
    ],
    [t]
  );

  const PROVIDER_OPTIONS: EmailProvider[] = ['SMTP', 'RESEND', 'SENDGRID'];
  const EMAIL_TYPE_OPTIONS: EmailType[] = ['SYSTEM', 'TEMPLATE', 'BULK', 'TEST'];

  const getTemplateDefaultFields = useCallback(
    (templateKey: TemplateId): TemplateDefaultFields => {
      if (templateKey === 'promotion') {
        return {
          ctaText: t('adminEmail.templateDefaults.promotion.ctaText'),
          promoCode: t('adminEmail.templateDefaults.promotion.promoCode'),
          productName: t('adminEmail.templateDefaults.promotion.productName'),
          productImage: t('adminEmail.templateDefaults.promotion.productImage'),
          benefitsText: t('adminEmail.templateDefaults.promotion.benefitsText'),
        };
      }

      if (templateKey === 'reminder') {
        return {
          ctaText: t('adminEmail.templateDefaults.reminder.ctaText'),
          promoCode: t('adminEmail.templateDefaults.reminder.promoCode'),
          productName: t('adminEmail.templateDefaults.reminder.productName'),
          productImage: t('adminEmail.templateDefaults.reminder.productImage'),
          benefitsText: t('adminEmail.templateDefaults.reminder.benefitsText'),
        };
      }

      return {
        ctaText: t('adminEmail.templateDefaults.welcome.ctaText'),
        promoCode: t('adminEmail.templateDefaults.welcome.promoCode'),
        productName: t('adminEmail.templateDefaults.welcome.productName'),
        productImage: t('adminEmail.templateDefaults.welcome.productImage'),
        benefitsText: t('adminEmail.templateDefaults.welcome.benefitsText'),
      };
    },
    [t]
  );

  const getStatusLabel = useCallback(
    (status: EmailCampaignStatus): string => {
      switch (status) {
        case 'draft':
          return t('adminEmail.status.draft');
        case 'queued':
          return t('adminEmail.status.queued');
        case 'scheduled':
          return t('adminEmail.status.scheduled');
        case 'sent':
          return t('adminEmail.status.sent');
        case 'partial':
          return t('adminEmail.status.partial');
        case 'failed':
          return t('adminEmail.status.failed');
        case 'cancelled':
          return t('adminEmail.status.cancelled');
        default:
          return status;
      }
    },
    [t]
  );

  const mapEmailItemToCampaign = useCallback(
    (item: EmailListItem): EmailCampaignSummary => {
      const title = item.previewText?.trim() || item.template?.name || item.templateKey || item.subject;
      const sentAtSource = item.sentAt || item.scheduledAt || item.createdAt;

      return {
        id: item.id,
        title,
        templateName: item.template?.name || item.templateKey || t('adminEmail.defaults.unknownTemplate'),
        subject: item.subject,
        totalRecipients: item.totalRecipients,
        sentAt: formatLocalDateTime(new Date(sentAtSource)),
        status: mapApiStatus(item.status),
        provider: item.provider ?? undefined,
        type: item.type,
      };
    },
    [t]
  );

  const [campaigns, setCampaigns] = useState<EmailCampaignSummary[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingCredential, setIsLoadingCredential] = useState(true);
  const [listError, setListError] = useState('');
  const [credentialError, setCredentialError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<TemplateId>('welcome');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0]?.subject ?? '');
  const [previewText, setPreviewText] = useState(t('adminEmail.defaults.previewText'));
  const [content, setContent] = useState(EMAIL_TEMPLATES[0]?.content ?? '');
  const [emailsText, setEmailsText] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
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

  const userId = user?.id ?? '';
  const siteId = site?.id ?? '';
  const workspaceName = currentWorkspace?.name ?? '';
  const siteName = site?.name ?? '';
  const siteDomain = site?.domain ?? '';

  const selectedTemplate = useMemo(
    () => EMAIL_TEMPLATES.find((item) => item.key === selectedTemplateKey) ?? null,
    [EMAIL_TEMPLATES, selectedTemplateKey]
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

  const resetTemplateFields = useCallback(
    (templateKey: TemplateId) => {
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
    },
    [EMAIL_TEMPLATES, getTemplateDefaultFields]
  );

  const resetFormAfterSend = useCallback(() => {
    resetTemplateFields('welcome');
    setCampaignTitle('');
    setPreviewText(t('adminEmail.defaults.previewText'));
    setEmailsText('');
    setScheduledAt('');
    setTestMode(false);
    setEmailType('BULK');
    setCtaUrl(DEFAULT_CTA_URL);
  }, [DEFAULT_CTA_URL, resetTemplateFields, t]);

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
      setListError(t('adminEmail.messages.waitingUserContext'));
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

      const result = (await response.json()) as EmailListResponse;

      if (!response.ok) {
        throw new Error(result.message || t('adminEmail.messages.failedLoadCampaigns'));
      }

      setCampaigns((result.items || []).map(mapEmailItemToCampaign));
    } catch (error) {
      setCampaigns([]);
      setListError(error instanceof Error ? error.message : t('adminEmail.messages.failedLoadCampaigns'));
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [mapEmailItemToCampaign, searchKeyword, siteId, t, userId]);

  useEffect(() => {
    const fetchSystemCredential = async () => {
      if (!siteId.trim()) {
        setIsLoadingCredential(false);
        setCredentialError(t('adminEmail.messages.missingSiteContext'));
        return;
      }

      setIsLoadingCredential(true);
      setCredentialError('');

      try {
        const params = new URLSearchParams({
          key: 'resend_local',
          siteId: siteId.trim(),
        });

        const response = await fetch(`/api/admin/email/system?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        });

        const result = (await response.json()) as SystemCredentialResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.message || t('adminEmail.messages.failedLoadSystemCredential'));
        }

        if (!result.data) {
          throw new Error(t('adminEmail.messages.noSystemCredentialFound'));
        }

        setFromName(result.data.fromName ?? '');
        setFromEmail(result.data.fromEmail ?? '');
        setReplyToEmail(result.data.replyToEmail ?? '');
        setProvider(normalizeProvider(result.data.provider));
      } catch (error) {
        setCredentialError(
          error instanceof Error ? error.message : t('adminEmail.messages.failedLoadSystemCredential')
        );
        setFromName('');
        setFromEmail('');
        setReplyToEmail('');
        setProvider('RESEND');
      } finally {
        setIsLoadingCredential(false);
      }
    };

    void fetchSystemCredential();
  }, [siteId, t]);

  useEffect(() => {
    if (!userId.trim()) return;
    void fetchCampaigns();
  }, [fetchCampaigns, userId]);

  useEffect(() => {
    const template = EMAIL_TEMPLATES.find((item) => item.key === selectedTemplateKey);
    if (!template) return;

    setSubject(template.subject);
    setContent(template.content);
  }, [EMAIL_TEMPLATES, selectedTemplateKey]);

  const handleSend = async () => {
    if (!userId.trim()) {
      setMessage(t('adminEmail.messages.missingUserContext'));
      return;
    }

    if (!siteId.trim()) {
      setMessage(t('adminEmail.messages.missingSiteContext'));
      return;
    }

    if (!campaignTitle.trim()) {
      setMessage(t('adminEmail.messages.enterCampaignName'));
      return;
    }

    if (!selectedTemplate) {
      setMessage(t('adminEmail.messages.selectTemplate'));
      return;
    }

    if (!subject.trim()) {
      setMessage(t('adminEmail.messages.enterEmailSubject'));
      return;
    }

    if (!previewText.trim()) {
      setMessage(t('adminEmail.messages.enterPreviewText'));
      return;
    }

    if (!fromName.trim()) {
      setMessage(t('adminEmail.messages.missingSenderName'));
      return;
    }

    if (!isValidEmail(fromEmail.trim())) {
      setMessage(t('adminEmail.messages.invalidSenderEmail'));
      return;
    }

    if (replyToEmail.trim() && !isValidEmail(replyToEmail.trim())) {
      setMessage(t('adminEmail.messages.invalidReplyToEmail'));
      return;
    }

    if (!ctaUrl.trim() || !isValidUrl(ctaUrl.trim())) {
      setMessage(t('adminEmail.messages.invalidCtaUrl'));
      return;
    }

    if (scheduledAt && !isValidDateTime(scheduledAt)) {
      setMessage(t('adminEmail.messages.invalidScheduledAt'));
      return;
    }

    if (validEmails.length === 0) {
      setMessage(t('adminEmail.messages.enterAtLeastOneEmail'));
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

      let result: {
        message?: string;
        emailId?: string;
        status?: EmailCampaignStatus;
        successCount?: number;
        failedCount?: number;
      } | null = null;

      try {
        result = (await response.json()) as {
          message?: string;
          emailId?: string;
          status?: EmailCampaignStatus;
          successCount?: number;
          failedCount?: number;
        };
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(result?.message || t('adminEmail.messages.sendingError'));
      }

      resetFormAfterSend();

      if (result?.status) {
        setMessage(
          `${result.message || t('adminEmail.messages.requestCompleted')} ${t('adminEmail.messages.status')}: ${result.status}${
            typeof result.successCount === 'number'
              ? ` | ${t('adminEmail.messages.success')}: ${result.successCount}`
              : ''
          }${
            typeof result.failedCount === 'number'
              ? ` | ${t('adminEmail.messages.failed')}: ${result.failedCount}`
              : ''
          }`
        );
      } else {
        setMessage(result?.message || t('adminEmail.messages.requestCompleted'));
      }

      await fetchCampaigns();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('adminEmail.messages.sendingError'));
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
              placeholder={t('adminEmail.sidebar.searchPlaceholder')}
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </div>
        </div>

        <div className={styles.list}>
          {isLoadingCampaigns && (
            <div className={styles.messageBox}>{t('adminEmail.messages.loadingCampaigns')}</div>
          )}

          {!isLoadingCampaigns && listError && (
            <div className={styles.messageBox}>{listError}</div>
          )}

          {!isLoadingCampaigns && !listError && filteredCampaigns.length === 0 && (
            <div className={styles.messageBox}>{t('adminEmail.messages.noCampaignsFound')}</div>
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
                <div className={styles.avatar}>
                  {campaign.title.charAt(0) || t('adminEmail.defaults.avatarFallback')}
                </div>

                <div className={styles.itemContent}>
                  <div className={styles.itemTop}>
                    <strong className={styles.itemTitle}>{campaign.title}</strong>
                    <span className={`${styles.statusDot} ${getStatusDotClass(campaign.status)}`} />
                  </div>

                  <p className={styles.itemSubtitle}>{campaign.subject}</p>

                  <span className={styles.itemMeta}>
                    {campaign.templateName} • {campaign.totalRecipients}{' '}
                    {t('adminEmail.sidebar.recipientsSuffix')}
                  </span>

                  <span className={styles.itemMeta}>
                    {getStatusLabel(campaign.status)} •{' '}
                    {campaign.provider ?? t('adminEmail.defaults.emptyValue')}
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
            <h4>{t('adminEmail.sections.accountContext')}</h4>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="userId">{t('adminEmail.fields.userId')}</label>
              <input
                id="userId"
                className={styles.input}
                value={userId}
                readOnly
                placeholder={t('adminEmail.placeholders.userId')}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="siteId">{t('adminEmail.fields.siteId')}</label>
              <input
                id="siteId"
                className={styles.input}
                value={siteId}
                readOnly
                placeholder={t('adminEmail.placeholders.siteId')}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="workspaceName">{t('adminEmail.fields.workspace')}</label>
              <input
                id="workspaceName"
                className={styles.input}
                value={workspaceName}
                readOnly
                placeholder={t('adminEmail.placeholders.workspace')}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="siteName">{t('adminEmail.fields.siteName')}</label>
              <input
                id="siteName"
                className={styles.input}
                value={siteName}
                readOnly
                placeholder={t('adminEmail.placeholders.siteName')}
              />
            </div>
          </div>
        </div>

        <div className={styles.sectionBlock}>
          <div className={styles.formGroup}>
            <label htmlFor="campaignTitle">{t('adminEmail.fields.campaignName')}</label>
            <input
              id="campaignTitle"
              className={styles.input}
              value={campaignTitle}
              onChange={(event) => setCampaignTitle(event.target.value)}
              placeholder={t('adminEmail.placeholders.campaignName')}
            />
            <span className={styles.fieldHint}>{t('adminEmail.hints.campaignName')}</span>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="template">{t('adminEmail.fields.templateKey')}</label>
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
              <span className={styles.fieldHint}>{t('adminEmail.hints.templateKey')}</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="batchSize">{t('adminEmail.fields.batchSize')}</label>
              <input
                id="batchSize"
                className={styles.inputDisabled}
                value={t('adminEmail.misc.batchSizeValue').replace('{{count}}', String(BATCH_SIZE))}
                disabled
              />
              <span className={styles.fieldHint}>{t('adminEmail.hints.batchSize')}</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="templateDescription">{t('adminEmail.fields.templateDescription')}</label>
            <input
              id="templateDescription"
              className={styles.inputDisabled}
              value={selectedTemplate?.description ?? ''}
              disabled
            />
            <span className={styles.fieldHint}>{t('adminEmail.hints.templateDescription')}</span>
          </div>
        </div>

        <div className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h4>{t('adminEmail.sections.messageMetadata')}</h4>
            <p>{t('adminEmail.sections.messageMetadataDesc')}</p>
          </div>

          {isLoadingCredential && (
            <div className={styles.messageBox}>{t('adminEmail.messages.loadingEmailCredential')}</div>
          )}

          {!isLoadingCredential && credentialError && (
            <div className={styles.messageBox}>{credentialError}</div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="provider">{t('adminEmail.fields.provider')}</label>
              <select
                id="provider"
                className={styles.select}
                value={provider}
                disabled
              >
                {PROVIDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(`adminEmail.providerOptions.${option}`)}
                  </option>
                ))}
              </select>
              <span className={styles.fieldHint}>{t('adminEmail.hints.provider')}</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="emailType">{t('adminEmail.fields.emailType')}</label>
              <select
                id="emailType"
                className={styles.select}
                value={emailType}
                onChange={(event) => setEmailType(event.target.value as EmailType)}
              >
                {EMAIL_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(`adminEmail.emailTypeOptions.${option}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fromName">{t('adminEmail.fields.fromName')}</label>
              <input
                id="fromName"
                className={styles.input}
                value={fromName}
                readOnly
                placeholder={t('adminEmail.placeholders.fromName')}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fromEmail">{t('adminEmail.fields.fromEmail')}</label>
              <input
                id="fromEmail"
                className={styles.input}
                value={fromEmail}
                readOnly
                placeholder={t('adminEmail.placeholders.fromEmail')}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="replyToEmail">{t('adminEmail.fields.replyToEmail')}</label>
              <input
                id="replyToEmail"
                className={styles.input}
                value={replyToEmail}
                readOnly
                placeholder={t('adminEmail.placeholders.replyToEmail')}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="scheduledAt">{t('adminEmail.fields.scheduledAt')}</label>
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
              <span>{t('adminEmail.fields.enableTestMode')}</span>
            </label>
            <span className={styles.fieldHint}>{t('adminEmail.hints.testMode')}</span>
          </div>
        </div>

        <div className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h4>{t('adminEmail.sections.messageContent')}</h4>
            <p>{t('adminEmail.sections.messageContentDesc')}</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="subject">{t('adminEmail.fields.subject')}</label>
            <input
              id="subject"
              className={styles.input}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={t('adminEmail.placeholders.subject')}
            />
            <span className={styles.fieldHint}>{t('adminEmail.hints.subject')}</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="previewText">{t('adminEmail.fields.previewText')}</label>
            <textarea
              id="previewText"
              className={styles.textarea}
              value={previewText}
              onChange={(event) => setPreviewText(event.target.value)}
              placeholder={t('adminEmail.placeholders.previewText')}
            />
            <span className={styles.fieldHint}>{t('adminEmail.hints.previewText')}</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">{t('adminEmail.fields.content')}</label>
            <textarea
              id="content"
              className={styles.textarea}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t('adminEmail.placeholders.content')}
            />
            <span className={styles.fieldHint}>{t('adminEmail.hints.content')}</span>
          </div>
        </div>

        <div className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h4>{t('adminEmail.sections.ctaAndDestination')}</h4>
            <p>{t('adminEmail.sections.ctaAndDestinationDesc')}</p>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="ctaText">{t('adminEmail.fields.ctaText')}</label>
              <input
                id="ctaText"
                className={styles.input}
                value={ctaText}
                onChange={(event) => setCtaText(event.target.value)}
                placeholder={t('adminEmail.placeholders.ctaText')}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ctaUrl">{t('adminEmail.fields.ctaUrl')}</label>
              <input
                id="ctaUrl"
                className={styles.input}
                value={ctaUrl}
                onChange={(event) => setCtaUrl(event.target.value)}
                placeholder={t('adminEmail.placeholders.ctaUrl')}
              />
            </div>
          </div>
        </div>

        {selectedTemplateKey === 'promotion' && (
          <div className={styles.sectionBlock}>
            <div className={styles.blockHeader}>
              <h4>{t('adminEmail.sections.offerProductDetails')}</h4>
              <p>{t('adminEmail.sections.offerProductDetailsDesc')}</p>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="promoCode">{t('adminEmail.fields.promoCode')}</label>
                <input
                  id="promoCode"
                  className={styles.input}
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  placeholder={t('adminEmail.placeholders.promoCode')}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="productName">{t('adminEmail.fields.productName')}</label>
                <input
                  id="productName"
                  className={styles.input}
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder={t('adminEmail.placeholders.productName')}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="productImage">{t('adminEmail.fields.productImage')}</label>
              <input
                id="productImage"
                className={styles.input}
                value={productImage}
                onChange={(event) => setProductImage(event.target.value)}
                placeholder={t('adminEmail.placeholders.productImage')}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="benefitsText">{t('adminEmail.fields.benefits')}</label>
              <textarea
                id="benefitsText"
                className={styles.textarea}
                value={benefitsText}
                onChange={(event) => setBenefitsText(event.target.value)}
                placeholder={t('adminEmail.placeholders.benefits')}
              />
            </div>
          </div>
        )}

        {selectedTemplateKey === 'welcome' && (
          <div className={styles.sectionBlock}>
            <div className={styles.blockHeader}>
              <h4>{t('adminEmail.sections.welcomeDetails')}</h4>
              <p>{t('adminEmail.sections.welcomeDetailsDesc')}</p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="welcomeBenefits">{t('adminEmail.fields.welcomeBenefits')}</label>
              <textarea
                id="welcomeBenefits"
                className={styles.textarea}
                value={benefitsText}
                onChange={(event) => setBenefitsText(event.target.value)}
                placeholder={t('adminEmail.placeholders.welcomeBenefits')}
              />
            </div>
          </div>
        )}

        {selectedTemplateKey === 'reminder' && (
          <div className={styles.sectionBlock}>
            <div className={styles.blockHeader}>
              <h4>{t('adminEmail.sections.reminderDetails')}</h4>
              <p>{t('adminEmail.sections.reminderDetailsDesc')}</p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="reminderBenefits">{t('adminEmail.fields.reminderBenefits')}</label>
              <textarea
                id="reminderBenefits"
                className={styles.textarea}
                value={benefitsText}
                onChange={(event) => setBenefitsText(event.target.value)}
                placeholder={t('adminEmail.placeholders.reminderBenefits')}
              />
            </div>
          </div>
        )}

        <div className={styles.sectionBlock}>
          <div className={styles.blockHeader}>
            <h4>{t('adminEmail.sections.recipients')}</h4>
            <p>{t('adminEmail.sections.recipientsDesc')}</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="emailsText">{t('adminEmail.fields.recipientList')}</label>
            <textarea
              id="emailsText"
              className={styles.recipientArea}
              value={emailsText}
              onChange={(event) => setEmailsText(event.target.value)}
              placeholder={t('adminEmail.placeholders.recipientList')}
            />
            <span className={styles.fieldHint}>{t('adminEmail.hints.recipientList')}</span>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="validEmails">{t('adminEmail.fields.validEmails')}</label>
              <input
                id="validEmails"
                className={styles.inputDisabled}
                value={validEmails.length}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duplicateEmails">{t('adminEmail.fields.duplicateEmails')}</label>
              <input
                id="duplicateEmails"
                className={styles.inputDisabled}
                value={duplicateCount}
                disabled
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="batchCount">{t('adminEmail.fields.batchCount')}</label>
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
          {t('adminEmail.hints.bottomInfo')}
        </div>

        <button
          className={styles.primaryButton}
          onClick={handleSend}
          disabled={isSending || isLoadingCredential || !userId || !siteId}
          type="button"
        >
          {isSending
            ? t('adminEmail.buttons.submitting')
            : scheduledAt
              ? t('adminEmail.buttons.scheduleCampaign')
              : t('adminEmail.buttons.sendCampaign')}
        </button>
      </div>

      {message && <div className={styles.messageBox}>{message}</div>}
    </section>

    <section className={styles.summaryColumn}>
      <div className={styles.previewPanel}>
        <div className={styles.previewTopbar}>
          <div className={styles.previewDots}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.previewLabel}>{t('adminEmail.sections.emailPreview')}</div>
        </div>

        <div className={styles.previewBody}>
          <div className={styles.previewMailHeader}>
            <div className={styles.previewAvatar}>EM</div>
            <div>
              <strong>{campaignTitle || t('adminEmail.defaults.previewCampaignFallback')}</strong>
              <p>{subject || t('adminEmail.defaults.previewNoSubject')}</p>
            </div>
          </div>

          <div className={styles.previewDivider} />

          <EmailTemplatePreview templateId={selectedTemplateKey} data={previewData} />
        </div>
      </div>

      <div className={styles.previewPanel}>
        <div className={styles.blockHeader}>
          <h4>{t('adminEmail.sections.reviewInformation')}</h4>
          <p>{t('adminEmail.sections.reviewInformationDesc')}</p>
        </div>

        <div className={styles.cardMetaGrid}>
          <div>
            <span>{t('adminEmail.fields.userId')}</span>
            <strong>{userId || t('adminEmail.defaults.emptyValue')}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.siteId')}</span>
            <strong>{siteId || t('adminEmail.defaults.emptyValue')}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.workspace')}</span>
            <strong>{workspaceName || t('adminEmail.defaults.emptyValue')}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.siteDomain')}</span>
            <strong>{siteDomain || t('adminEmail.defaults.emptyValue')}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.campaign')}</span>
            <strong>{campaignTitle || t('adminEmail.defaults.emptyValue')}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.templateKey')}</span>
            <strong>{selectedTemplateKey || t('adminEmail.defaults.emptyValue')}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.provider')}</span>
            <strong>{provider}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.type')}</span>
            <strong>{emailType}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.recipients')}</span>
            <strong>{validEmails.length}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.ctaUrl')}</span>
            <strong>{ctaUrl || t('adminEmail.defaults.emptyValue')}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.from')}</span>
            <strong>{fromEmail || t('adminEmail.defaults.emptyValue')}</strong>
          </div>
          <div>
            <span>{t('adminEmail.fields.scheduledAt')}</span>
            <strong>{scheduledAt || t('adminEmail.defaults.emptyValue')}</strong>
          </div>
        </div>
      </div>

      {invalidEmails.length > 0 && (
        <div className={styles.warningPanel}>
          <div className={styles.warningTitle}>{t('adminEmail.messages.invalidEmailAddresses')}</div>
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
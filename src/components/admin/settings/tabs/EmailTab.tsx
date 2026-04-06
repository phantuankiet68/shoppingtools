'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/admin/settings/tabs/EmailTab.module.css';
import { SystemCredentialForm } from '@/features/settings/type';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';

type ProviderKey = 'resend' | 'sendgrid' | 'mailgun' | 'smtp';

type SystemCredentialApiResponse = {
  ok: boolean;
  message?: string;
  data?: Partial<SystemCredentialForm> & {
    id?: string;
    userId?: string | null;
    siteId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
};

const providerOptions: {
  value: ProviderKey;
  label: string;
  icon: string;
  hint: string;
}[] = [
  {
    value: 'resend',
    label: 'Resend',
    icon: 'bi-send-check',
    hint: 'Fast, lightweight, and ideal for modern transactional emails.',
  },
  {
    value: 'sendgrid',
    label: 'SendGrid',
    icon: 'bi-grid-1x2',
    hint: 'Popular for large systems and high-volume email delivery.',
  },
  {
    value: 'mailgun',
    label: 'Mailgun',
    icon: 'bi-envelope-paper-heart',
    hint: 'Strong for routing, email domains, and automation.',
  },
  {
    value: 'smtp',
    label: 'SMTP',
    icon: 'bi-hdd-network',
    hint: 'Use traditional SMTP credentials from your email provider.',
  },
];

const providerGuides: Record<
  ProviderKey,
  {
    label: string;
    credentialKeyHint: string;
    apiLabel: string;
    apiHint: string;
    fromEmailHint: string;
    replyToHint: string;
    tone: string;
  }
> = {
  resend: {
    label: 'Resend',
    credentialKeyHint:
      'Set a custom name to make it easier to manage in the system, for example: resend_main, resend_production, or resend_marketing.',
    apiLabel: 'Resend API Key',
    apiHint:
      'Log in to the Resend Dashboard → go to API Keys → Create API Key → copy the newly created key and paste it into this field.',
    fromEmailHint:
      'Go to Resend Dashboard → Domains or Senders → verify your domain/sender first. Then use a verified email address, for example: noreply@yourdomain.com.',
    replyToHint:
      'Enter the email address that will receive customer replies, usually support@yourdomain.com or help@yourdomain.com. This email is usually managed by you in Gmail/Workspace.',
    tone:
      'Resend is ideal for modern transactional emails, easy to configure, and quick to deploy.',
  },

  sendgrid: {
    label: 'SendGrid',
    credentialKeyHint:
      'Set an internal name to distinguish environments more easily, for example: sendgrid_main or sendgrid_prod.',
    apiLabel: 'SendGrid API Key',
    apiHint:
      'Log in to SendGrid → Settings → API Keys → Create API Key → copy the API key and paste it into this field.',
    fromEmailHint:
      'Go to SendGrid → Sender Authentication → verify Single Sender or Domain Authentication, then use the verified email address.',
    replyToHint:
      'Enter the support or customer care email address, for example: support@yourdomain.com.',
    tone:
      'SendGrid is suitable for large systems that need high email volume and strong management capabilities.',
  },

  mailgun: {
    label: 'Mailgun',
    credentialKeyHint:
      'Set a name to manage it easily in the admin panel, for example: mailgun_eu, mailgun_main, or mailgun_system.',
    apiLabel: 'Mailgun API Key',
    apiHint:
      'Log in to Mailgun Dashboard → API Security → choose the appropriate API key → copy and paste it into this field.',
    fromEmailHint:
      'Go to Mailgun → Sending → Domains → verify the sending domain. Then use an email address under the verified domain, for example: noreply@mg.yourdomain.com.',
    replyToHint:
      'Enter the actual email address that will receive customer replies, usually support@yourdomain.com or care@yourdomain.com.',
    tone:
      'Mailgun is strong for custom domains, routing, and email workflows that require flexible configuration.',
  },

  smtp: {
    label: 'SMTP',
    credentialKeyHint:
      'Set an internal name to manage it more easily, for example: smtp_google_workspace, smtp_main, or smtp_support.',
    apiLabel: 'SMTP Credential',
    apiHint:
      'Get the SMTP username/password from your email provider. If you use Gmail Workspace, you usually need an App Password or dedicated SMTP credentials provided by your administrator.',
    fromEmailHint:
      'Use a real email address that is allowed to send via SMTP, for example: noreply@yourdomain.com. This email must exist in your mail system.',
    replyToHint:
      'Enter the email address that will receive replies, usually support@yourdomain.com. It can be different from the From email if you want to separate the sending address from the support address.',
    tone:
      'SMTP is suitable when you use your own mail infrastructure or want to connect through your existing email provider.',
  },
};

const defaultForm: SystemCredentialForm = {
  key: 'resend_main',
  provider: 'resend',
  apiKeyEncrypted: '',
  fromEmail: '',
  fromName: '',
  replyToEmail: '',
  isActive: true,
  siteId: '',
};

export default function EmailTab() {
  const { site } = useAdminAuth();

  const [form, setForm] = useState<SystemCredentialForm>(defaultForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const provider = form.provider as ProviderKey;
  const providerGuide = providerGuides[provider];

  useEffect(() => {
    if (site?.id) {
      setForm((prev) => ({
        ...prev,
        siteId: site.id,
      }));
    }
  }, [site?.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadCredential() {
      try {
        setIsLoading(true);
        setLoadError('');
        setSaveMessage('');

        const params = new URLSearchParams({
          key: defaultForm.key,
        });

        if (site?.id) {
          params.set('siteId', site.id);
        }

        const res = await fetch(`/api/admin/email/system?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        });

        const json: SystemCredentialApiResponse = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error(json.message || 'Failed to load email settings.');
        }

        if (!isMounted) return;

        if (json.data) {
          const newData = json.data;
          setForm((prev) => ({
            ...prev,
            key: (newData.key as SystemCredentialForm['key']) ?? prev.key,
            provider:
              (newData.provider as SystemCredentialForm['provider']) ??
              prev.provider,
            apiKeyEncrypted: newData.apiKeyEncrypted ?? '',
            fromEmail: newData.fromEmail ?? '',
            fromName: newData.fromName ?? '',
            replyToEmail: newData.replyToEmail ?? '',
            isActive: newData.isActive ?? true,
            siteId: newData.siteId ?? site?.id ?? prev.siteId,
          }));
        } else if (site?.id) {
          setForm((prev) => ({
            ...prev,
            siteId: site.id,
          }));
        }
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to load email settings.';
        setLoadError(message);

        if (site?.id) {
          setForm((prev) => ({
            ...prev,
            siteId: site.id,
          }));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCredential();

    return () => {
      isMounted = false;
    };
  }, [site?.id]);

  const preview = useMemo(() => {
    const fromName = form.fromName || 'Your Brand';
    const fromEmail = form.fromEmail || 'noreply@yourdomain.com';
    return `${fromName} <${fromEmail}>`;
  }, [form.fromEmail, form.fromName]);

  const completionScore = useMemo(() => {
    const fields = [
      form.key,
      form.provider,
      form.apiKeyEncrypted,
      form.fromEmail,
      form.fromName,
      form.replyToEmail,
    ];

    const filled = fields.filter((item) => String(item).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }, [
    form.key,
    form.provider,
    form.apiKeyEncrypted,
    form.fromEmail,
    form.fromName,
    form.replyToEmail,
  ]);

  const handleChange = (
    key: keyof SystemCredentialForm,
    value: string | boolean,
  ) => {
    setSaveMessage('');
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSaveMessage('');
    setLoadError('');
    setForm({
      ...defaultForm,
      siteId: site?.id ?? '',
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');
      setLoadError('');

      const payload: SystemCredentialForm = {
        ...form,
        siteId: site?.id ?? form.siteId ?? '',
      };

      const res = await fetch('/api/admin/email/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json: SystemCredentialApiResponse = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message || 'Failed to save email settings.');
      }

      if (json.data) {
        const newData = json.data;
        setForm((prev) => ({
          ...prev,
          key: (newData.key as SystemCredentialForm['key']) ?? prev.key,
          provider:
            (newData.provider as SystemCredentialForm['provider']) ??
            prev.provider,
          apiKeyEncrypted: newData.apiKeyEncrypted ?? prev.apiKeyEncrypted,
          fromEmail: newData.fromEmail ?? prev.fromEmail,
          fromName: newData.fromName ?? prev.fromName,
          replyToEmail: newData.replyToEmail ?? prev.replyToEmail,
          isActive: newData.isActive ?? prev.isActive,
          siteId: newData.siteId ?? site?.id ?? prev.siteId,
        }));
      }

      setSaveMessage('Email settings saved successfully.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save email settings.';
      setLoadError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.emailTab}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <span className={styles.heroBadge}>
              <i className="bi bi-stars" />
              Email infrastructure
            </span>

            <h2 className={styles.heroTitle}>Email Settings</h2>
            <p className={styles.heroDesc}>
              Configure the email provider, sender identity, and application
              scope.
            </p>

            <div className={styles.heroMeta}>
              <div className={styles.metaCard}>
                <span className={styles.metaIcon}>
                  <i className="bi bi-shield-check" />
                </span>
                <div>
                  <strong>Secure setup</strong>
                  <p>Manage credentials and sender identity clearly.</p>
                </div>
              </div>

              <div className={styles.metaCard}>
                <span className={styles.metaIcon}>
                  <i className="bi bi-lightning-charge" />
                </span>
                <div>
                  <strong>Fast configuration</strong>
                  <p>
                    Compact design, less empty space, and optimized interaction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.statusPanel}>
              <div className={styles.statusPanelTop}>
                <span
                  className={`${styles.liveStatus} ${
                    form.isActive ? styles.liveStatusOn : styles.liveStatusOff
                  }`}
                >
                  <i
                    className={`bi ${
                      form.isActive
                        ? 'bi-check-circle-fill'
                        : 'bi-pause-circle-fill'
                    }`}
                  />
                  {form.isActive ? 'Active credential' : 'Inactive credential'}
                </span>

                <span className={styles.providerChip}>
                  <i
                    className={`bi ${
                      providerOptions.find((item) => item.value === provider)
                        ?.icon || 'bi-envelope'
                    }`}
                  />
                  {providerGuide.label}
                </span>
              </div>

              <div className={styles.progressBlock}>
                <div className={styles.progressHead}>
                  <span>Completion</span>
                  <strong>{completionScore}%</strong>
                </div>
                <div className={styles.progressBar}>
                  <span style={{ width: `${completionScore}%` }} />
                </div>
              </div>

              <div className={styles.heroActions}>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={handleReset}
                  disabled={isLoading || isSaving}
                >
                  <i className="bi bi-arrow-counterclockwise" />
                  Reset
                </button>

                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleSave}
                  disabled={isLoading || isSaving}
                >
                  <i className="bi bi-check2-circle" />
                  {isSaving ? 'Saving...' : 'Save settings'}
                </button>
              </div>

              {isLoading && (
                <p style={{ marginTop: 12, fontSize: 13 }}>Loading settings...</p>
              )}

              {!isLoading && loadError && (
                <p style={{ marginTop: 12, fontSize: 13, color: '#ff8a8a' }}>
                  {loadError}
                </p>
              )}

              {!isLoading && !loadError && saveMessage && (
                <p style={{ marginTop: 12, fontSize: 13, color: '#7ee787' }}>
                  {saveMessage}
                </p>
              )}

              <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
                <strong>Preview:</strong> {preview}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <form
          className={styles.mainCard}
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <div className={styles.cardHead}>
            <div>
              <p className={styles.cardEyebrow}>Credential form</p>
              <h3 className={styles.cardTitle}>Provider configuration</h3>
            </div>

            <button type="button" className={styles.softAction}>
              <i className="bi bi-patch-check" />
              Verify later
            </button>
          </div>

          <div className={styles.providerGrid}>
            {providerOptions.map((item) => {
              const active = form.provider === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  className={`${styles.providerCard} ${
                    active ? styles.providerCardActive : ''
                  }`}
                  onClick={() => handleChange('provider', item.value)}
                  disabled={isLoading || isSaving}
                >
                  <span className={styles.providerCardIcon}>
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <div className={styles.providerCardBody}>
                    <strong>{item.label}</strong>
                    <p>{item.hint}</p>
                  </div>
                  <span className={styles.providerCheck}>
                    <i
                      className={`bi ${
                        active ? 'bi-check-circle-fill' : 'bi-circle'
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Credential key</span>
              <div className={styles.inputWrap}>
                <i className="bi bi-key" />
                <input
                  value={form.key}
                  onChange={(e) => handleChange('key', e.target.value)}
                  placeholder="resend_main"
                  disabled={isLoading || isSaving}
                />
              </div>
              <small>Example: resend_main, mail_primary, smtp_marketing</small>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Site ID</span>
              <div className={styles.inputWrap}>
                <i className="bi bi-diagram-3" />
                <input
                  value={form.siteId}
                  readOnly
                  disabled
                  placeholder="site_cuid_or_uuid"
                />
              </div>
              <small>Auto-filled from the current site.</small>
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>{providerGuide.apiLabel}</span>
              <div className={styles.inputActionWrap}>
                <div className={styles.inputWrap}>
                  <i className="bi bi-lock" />
                  <input
                    type="password"
                    value={form.apiKeyEncrypted}
                    onChange={(e) =>
                      handleChange('apiKeyEncrypted', e.target.value)
                    }
                    placeholder="re_xxxxxxxxxxxxxxxxx"
                    disabled={isLoading || isSaving}
                  />
                </div>

                <button
                  type="button"
                  className={styles.inlineBtn}
                  disabled={isLoading || isSaving}
                >
                  <i className="bi bi-shield-check" />
                  Verify
                </button>
              </div>
              <small>
                Store the encrypted string in the backend corresponding to
                `apiKeyEncrypted`.
              </small>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>From email</span>
              <div className={styles.inputWrap}>
                <i className="bi bi-envelope" />
                <input
                  type="email"
                  value={form.fromEmail}
                  onChange={(e) => handleChange('fromEmail', e.target.value)}
                  placeholder="noreply@yourdomain.com"
                  disabled={isLoading || isSaving}
                />
              </div>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>From name</span>
              <div className={styles.inputWrap}>
                <i className="bi bi-person-badge" />
                <input
                  value={form.fromName}
                  onChange={(e) => handleChange('fromName', e.target.value)}
                  placeholder="Your Brand"
                  disabled={isLoading || isSaving}
                />
              </div>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Reply-to email</span>
              <div className={styles.inputWrap}>
                <i className="bi bi-reply" />
                <input
                  type="email"
                  value={form.replyToEmail}
                  onChange={(e) =>
                    handleChange('replyToEmail', e.target.value)
                  }
                  placeholder="support@yourdomain.com"
                  disabled={isLoading || isSaving}
                />
              </div>
            </label>

            <div className={styles.field}>
              <span className={styles.label}>Credential status</span>
              <button
                type="button"
                className={`${styles.toggleCard} ${
                  form.isActive ? styles.toggleCardOn : ''
                }`}
                onClick={() => handleChange('isActive', !form.isActive)}
                aria-pressed={form.isActive}
                disabled={isLoading || isSaving}
              >
                <div className={styles.toggleCardText}>
                  <strong>
                    {form.isActive
                      ? 'Credential is active'
                      : 'Credential is paused'}
                  </strong>
                </div>

                <span
                  className={`${styles.switch} ${
                    form.isActive ? styles.switchOn : ''
                  }`}
                >
                  <span />
                </span>
              </button>
            </div>
          </div>
        </form>

        <div className={styles.sideStack}>
          <aside className={styles.guideCard}>
            <div className={styles.sideHead}>
              <div>
                <p className={styles.cardEyebrow}>Field guide</p>
                <h4 className={styles.sideTitle}>How to fill these fields</h4>
              </div>

              <span className={styles.guideBadge}>
                <i className="bi bi-lightbulb" />
                Step by step
              </span>
            </div>

            <div className={styles.guideTone}>
              <i className="bi bi-stars" />
              <p>{providerGuide.tone}</p>
            </div>

            <div className={styles.stepList}>
              <div className={styles.stepItem}>
                <span>01</span>
                <div>
                  <strong>Credential key</strong>
                  <p>{providerGuide.credentialKeyHint}</p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <span>02</span>
                <div>
                  <strong>{providerGuide.apiLabel}</strong>
                  <p>{providerGuide.apiHint}</p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <span>03</span>
                <div>
                  <strong>From email</strong>
                  <p>{providerGuide.fromEmailHint}</p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <span>04</span>
                <div>
                  <strong>Reply-to email</strong>
                  <p>{providerGuide.replyToHint}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import styles from '@/styles/admin/settings/page.module.css';

type TabKey = 'general' | 'email';

type GeneralForm = {
  publicationName: string;
  replyToEmail: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type EmailSetupForm = {
  id?: string;
  userId?: string;
  siteId?: string;
  key: string;
  provider: string;
  apiKeyEncrypted: string;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type EmailSectionKey = 'provider' | 'sender' | 'binding' | 'status';

const initialGeneralForm: GeneralForm = {
  publicationName: 'Plabon Newsletter',
  replyToEmail: 'example@gmail.com',
  streetAddress: '228 Park Ave, 334',
  city: 'New York',
  state: 'Albany',
  postalCode: '10004',
  country: 'United States',
};

const initialEmailForm: EmailSetupForm = {
  id: 'cred_1',
  userId: 'user_1',
  siteId: 'site_1',
  key: 'resend_main',
  provider: 'resend',
  apiKeyEncrypted: 're_xxxxxxxxxxxxxxxxx',
  fromEmail: 'hello@plabon.com',
  fromName: 'Plabon',
  replyToEmail: 'support@plabon.com',
  isActive: true,
  createdAt: '2025-02-01T10:00:00.000Z',
  updatedAt: '2025-02-12T10:00:00.000Z',
};

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('email');
  const [activeEmailSection, setActiveEmailSection] = useState<EmailSectionKey>('provider');
  const [generalForm, setGeneralForm] = useState<GeneralForm>(initialGeneralForm);
  const [emailForm, setEmailForm] = useState<EmailSetupForm>(initialEmailForm);

  const handleGeneralChange = <K extends keyof GeneralForm>(key: K, value: GeneralForm[K]) => {
    setGeneralForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEmailChange = <K extends keyof EmailSetupForm>(
    key: K,
    value: EmailSetupForm[K]
  ) => {
    setEmailForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetAll = () => {
    setGeneralForm(initialGeneralForm);
    setEmailForm(initialEmailForm);
    setActiveEmailSection('provider');
  };

  const handleSaveAll = () => {
    setEmailForm((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
    }));
    alert('Đã lưu thay đổi.');
  };

  const handleSaveEmail = () => {
    if (!emailForm.key.trim()) {
      alert('Vui lòng nhập setup key.');
      return;
    }

    if (!emailForm.provider.trim()) {
      alert('Vui lòng chọn provider.');
      return;
    }

    if (!emailForm.apiKeyEncrypted.trim()) {
      alert('Vui lòng nhập API key.');
      return;
    }

    setEmailForm((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
    }));

    alert('Đã lưu cấu hình email.');
  };

  const handleResetEmail = () => {
    setEmailForm(initialEmailForm);
    setActiveEmailSection('provider');
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>SETTINGS</p>
            <h1 className={styles.pageTitle}>Publication settings</h1>
            <p className={styles.pageDesc}>
              Cấu hình publication, brand và email theo phong cách admin panel gọn hơn.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.secondaryBtn} onClick={handleResetAll}>
              <i className="bi bi-arrow-clockwise" />
              Reset
            </button>

            <button type="button" className={styles.primaryBtn} onClick={handleSaveAll}>
              <i className="bi bi-check2" />
              Save changes
            </button>
          </div>
        </header>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="bi bi-sliders2" />
            General
          </button>

          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'email' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <i className="bi bi-envelope-paper" />
            Email
          </button>
        </div>

        {activeTab === 'general' && (
          <div className={styles.generalPanel}>
            <div className={styles.sidebar}>
              <div className={styles.sidebarGroup}>
                <button className={`${styles.sidebarItem} ${styles.sidebarItemActive}`} type="button">
                  Basic info
                </button>
                <button className={styles.sidebarItem} type="button">
                  Brand assets
                </button>
                <button className={styles.sidebarItem} type="button">
                  Address
                </button>
              </div>
            </div>

            <div className={styles.contentPanel}>
              <div className={styles.stackBlock}>
                <div className={styles.blockHeader}>
                  <div>
                    <h2>Basic information</h2>
                    <p>Thông tin hiển thị chính của publication.</p>
                  </div>
                </div>

                <div className={styles.rowGrid}>
                  <div className={styles.field}>
                    <label>Publication name</label>
                    <input
                      value={generalForm.publicationName}
                      onChange={(e) => handleGeneralChange('publicationName', e.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Reply to email</label>
                    <input
                      value={generalForm.replyToEmail}
                      onChange={(e) => handleGeneralChange('replyToEmail', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.stackBlock}>
                <div className={styles.blockHeader}>
                  <div>
                    <h2>Brand assets</h2>
                    <p>Logo và thumbnail dùng cho publication.</p>
                  </div>
                </div>

                <div className={styles.assetRows}>
                  <div className={styles.assetRow}>
                    <div>
                      <strong>Logo</strong>
                      <span>Recommended 800 × 800px</span>
                    </div>
                    <div className={styles.assetActions}>
                      <button type="button" className={styles.linkBtn}>
                        Upload
                      </button>
                      <button type="button" className={styles.linkBtn}>
                        Replace
                      </button>
                    </div>
                  </div>

                  <div className={styles.assetRow}>
                    <div>
                      <strong>Thumbnail</strong>
                      <span>Recommended 1200 × 630px</span>
                    </div>
                    <div className={styles.assetActions}>
                      <button type="button" className={styles.linkBtn}>
                        Upload
                      </button>
                      <button type="button" className={styles.linkBtn}>
                        Replace
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.stackBlock}>
                <div className={styles.blockHeader}>
                  <div>
                    <h2>Address</h2>
                    <p>Thông tin địa chỉ dùng trong footer email.</p>
                  </div>
                </div>

                <div className={styles.rowGrid}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label>Street address</label>
                    <input
                      value={generalForm.streetAddress}
                      onChange={(e) => handleGeneralChange('streetAddress', e.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>City</label>
                    <input
                      value={generalForm.city}
                      onChange={(e) => handleGeneralChange('city', e.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>State</label>
                    <input
                      value={generalForm.state}
                      onChange={(e) => handleGeneralChange('state', e.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Postal code</label>
                    <input
                      value={generalForm.postalCode}
                      onChange={(e) => handleGeneralChange('postalCode', e.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Country</label>
                    <input
                      value={generalForm.country}
                      onChange={(e) => handleGeneralChange('country', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarTitle}>Email setup</div>

              <div className={styles.sidebarGroup}>
                <button
                  type="button"
                  className={`${styles.sidebarItem} ${
                    activeEmailSection === 'provider' ? styles.sidebarItemActive : ''
                  }`}
                  onClick={() => setActiveEmailSection('provider')}
                >
                  <span>Provider</span>
                  <small>{emailForm.provider}</small>
                </button>

                <button
                  type="button"
                  className={`${styles.sidebarItem} ${
                    activeEmailSection === 'sender' ? styles.sidebarItemActive : ''
                  }`}
                  onClick={() => setActiveEmailSection('sender')}
                >
                  <span>Sender identity</span>
                  <small>{emailForm.fromEmail || 'Not set'}</small>
                </button>

                <button
                  type="button"
                  className={`${styles.sidebarItem} ${
                    activeEmailSection === 'binding' ? styles.sidebarItemActive : ''
                  }`}
                  onClick={() => setActiveEmailSection('binding')}
                >
                  <span>Binding</span>
                  <small>{emailForm.siteId || 'No site binding'}</small>
                </button>

                <button
                  type="button"
                  className={`${styles.sidebarItem} ${
                    activeEmailSection === 'status' ? styles.sidebarItemActive : ''
                  }`}
                  onClick={() => setActiveEmailSection('status')}
                >
                  <span>Status</span>
                  <small>{emailForm.isActive ? 'Active' : 'Inactive'}</small>
                </button>
              </div>

              <div className={styles.sidebarFooter}>
                <div className={styles.metaBox}>
                  <div className={styles.metaRow}>
                    <span>Created</span>
                    <strong>{formatDate(emailForm.createdAt)}</strong>
                  </div>
                  <div className={styles.metaRow}>
                    <span>Updated</span>
                    <strong>{formatDate(emailForm.updatedAt)}</strong>
                  </div>
                </div>

                <div className={styles.sidebarActions}>
                  <button type="button" className={styles.secondaryBtn} onClick={handleResetEmail}>
                    Reset
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={handleSaveEmail}>
                    Save setup
                  </button>
                </div>
              </div>
            </aside>

            <section className={styles.contentPanel}>
              <div className={styles.contentTop}>
                <div>
                  <p className={styles.sectionEyebrow}>EMAIL DELIVERY</p>
                  <h2 className={styles.contentTitle}>Single email setup per account</h2>
                  <p className={styles.contentDesc}>
                    Mỗi tài khoản chỉ sử dụng một cấu hình email duy nhất để gửi email hệ thống và
                    newsletter.
                  </p>
                </div>

                <div className={styles.badges}>
                  <span className={styles.badge}>{emailForm.provider}</span>
                  <span className={`${styles.badge} ${emailForm.isActive ? styles.badgeSuccess : ''}`}>
                    {emailForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className={styles.stackBlock}>
                <button
                  type="button"
                  className={styles.blockToggle}
                  onClick={() => setActiveEmailSection('provider')}
                >
                  <div>
                    <strong>Provider configuration</strong>
                    <span>Thiết lập provider và API key.</span>
                  </div>
                  <i className="bi bi-chevron-down" />
                </button>

                {activeEmailSection === 'provider' && (
                  <div className={styles.blockBody}>
                    <div className={styles.rowGrid}>
                      <div className={styles.field}>
                        <label>Setup key</label>
                        <input
                          value={emailForm.key}
                          onChange={(e) => handleEmailChange('key', e.target.value)}
                          placeholder="resend_main"
                        />
                      </div>

                      <div className={styles.field}>
                        <label>Provider</label>
                        <select
                          value={emailForm.provider}
                          onChange={(e) => handleEmailChange('provider', e.target.value)}
                        >
                          <option value="resend">resend</option>
                          <option value="sendgrid">sendgrid</option>
                          <option value="smtp">smtp</option>
                        </select>
                      </div>

                      <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label>API key</label>
                        <textarea
                          rows={3}
                          value={emailForm.apiKeyEncrypted}
                          onChange={(e) => handleEmailChange('apiKeyEncrypted', e.target.value)}
                          placeholder="Nhập API key"
                        />
                      </div>
                    </div>

                    <div className={styles.inlineTools}>
                      <button type="button" className={styles.linkBtn}>
                        <i className="bi bi-plug" />
                        Test connection
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.stackBlock}>
                <button
                  type="button"
                  className={styles.blockToggle}
                  onClick={() => setActiveEmailSection('sender')}
                >
                  <div>
                    <strong>Sender identity</strong>
                    <span>From email, from name và reply-to.</span>
                  </div>
                  <i className="bi bi-chevron-down" />
                </button>

                {activeEmailSection === 'sender' && (
                  <div className={styles.blockBody}>
                    <div className={styles.rowGrid}>
                      <div className={styles.field}>
                        <label>From email</label>
                        <input
                          value={emailForm.fromEmail}
                          onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
                          placeholder="hello@domain.com"
                        />
                      </div>

                      <div className={styles.field}>
                        <label>From name</label>
                        <input
                          value={emailForm.fromName}
                          onChange={(e) => handleEmailChange('fromName', e.target.value)}
                          placeholder="Plabon"
                        />
                      </div>

                      <div className={`${styles.field} ${styles.fieldFull}`}>
                        <label>Reply to email</label>
                        <input
                          value={emailForm.replyToEmail}
                          onChange={(e) => handleEmailChange('replyToEmail', e.target.value)}
                          placeholder="support@domain.com"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.stackBlock}>
                <button
                  type="button"
                  className={styles.blockToggle}
                  onClick={() => setActiveEmailSection('binding')}
                >
                  <div>
                    <strong>Binding</strong>
                    <span>Liên kết cấu hình với user và site.</span>
                  </div>
                  <i className="bi bi-chevron-down" />
                </button>

                {activeEmailSection === 'binding' && (
                  <div className={styles.blockBody}>
                    <div className={styles.rowGrid}>
                      <div className={styles.field}>
                        <label>User ID</label>
                        <input
                          value={emailForm.userId || ''}
                          onChange={(e) => handleEmailChange('userId', e.target.value)}
                          placeholder="user_1"
                        />
                      </div>

                      <div className={styles.field}>
                        <label>Site ID</label>
                        <input
                          value={emailForm.siteId || ''}
                          onChange={(e) => handleEmailChange('siteId', e.target.value)}
                          placeholder="site_1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.stackBlock}>
                <button
                  type="button"
                  className={styles.blockToggle}
                  onClick={() => setActiveEmailSection('status')}
                >
                  <div>
                    <strong>Status</strong>
                    <span>Bật hoặc tắt cấu hình gửi email.</span>
                  </div>
                  <i className="bi bi-chevron-down" />
                </button>

                {activeEmailSection === 'status' && (
                  <div className={styles.blockBody}>
                    <div className={styles.statusInline}>
                      <button
                        type="button"
                        className={`${styles.toggle} ${emailForm.isActive ? styles.toggleActive : ''}`}
                        onClick={() => handleEmailChange('isActive', !emailForm.isActive)}
                      >
                        <span className={styles.toggleKnob} />
                      </button>

                      <div>
                        <strong>{emailForm.isActive ? 'Email sending enabled' : 'Email sending disabled'}</strong>
                        <p>
                          {emailForm.isActive
                            ? 'Hệ thống có thể dùng cấu hình này để gửi email.'
                            : 'Cấu hình hiện không được dùng để gửi email.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
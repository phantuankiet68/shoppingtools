"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import styles from "@/styles/admin/email/campaign.module.css";

const GrapesEditor = dynamic(() => import("@/components/admin/email/GrapesEditor"), {
  ssr: false,
});

type EmailTemplate = {
  id: string;
  name: string;
  image: string | null;
  html: string;
};

export default function EmailCampaignTab() {
  const { currentSite } = useAdminAuth();

  const { t } = useAdminI18n();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [testEmail, setTestEmail] = useState("");

  const [subject, setSubject] = useState("");

  const [html, setHtml] = useState("");

  const [subscriberCount, setSubscriberCount] = useState(0);

  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [sendingTest, setSendingTest] = useState(false);

  const [sendingCampaign, setSendingCampaign] = useState(false);

  const modal = useModal();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);

        const response = await fetch("/api/admin/email/templates", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success) {
          setTemplates(data.items ?? []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    void loadTemplates();
  }, []);

  useEffect(() => {
    if (!currentSite?.id) {
      return;
    }

    const loadSubscribers = async () => {
      try {
        const response = await fetch(`/api/admin/subscribers?siteId=${currentSite.id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (Array.isArray(data.items)) {
          setSubscriberCount(data.items.length);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadSubscribers();
  }, [currentSite?.id]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template.id);

    setSubject(template.name);

    setHtml(template.html);
  };

  const handleSendTest = async () => {
    if (!currentSite?.id) {
      modal.error(t("email.campaign.missingSiteTitle"), t("email.campaign.missingSiteMessage"));
      return;
    }

    if (!testEmail.trim()) {
      modal.error(t("email.campaign.validationTitle"), t("email.campaign.validationTestEmail"));
      return;
    }

    try {
      setSendingTest(true);

      const response = await fetch("/api/admin/email/test", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          siteId: currentSite.id,
          to: testEmail,
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      modal.success(
        t("email.campaign.emailSentTitle"),
        t("email.campaign.emailSentMessage").replace("{email}", testEmail),
      );
    } catch (error) {
      console.error(error);

      modal.error(
        t("email.campaign.sendFailedTitle"),
        error instanceof Error ? error.message : t("email.campaign.sendFailedMessage"),
      );
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!currentSite?.id) {
      modal.error(t("email.campaign.missingSiteTitle"), t("email.campaign.missingSiteMessage"));
      return;
    }

    if (!subject.trim()) {
      modal.error(t("email.campaign.validationTitle"), t("email.campaign.validationSubject"));
      return;
    }

    if (!html.trim()) {
      modal.error(t("email.campaign.validationTitle"), t("email.campaign.validationContent"));
      return;
    }

    modal.confirmDelete(
      t("email.campaign.launchTitle"),
      t("email.campaign.launchMessage").replace("{subject}", subject).replace("{count}", String(subscriberCount)),
      async () => {
        try {
          setSendingCampaign(true);

          const response = await fetch("/api/admin/email/campaign", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              siteId: currentSite.id,
              templateId: selectedTemplate,
              subject,
              html,
            }),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.message);
          }

          modal.success(
            t("email.campaign.completedTitle"),
            `${t("email.campaign.total")}: ${data.total}
            ${t("email.campaign.success")}: ${data.successCount}
            ${t("email.campaign.failed")}: ${data.failedCount}`,
          );
        } catch (error) {
          console.error(error);

          modal.error(
            t("email.campaign.failedTitle"),
            error instanceof Error ? error.message : t("email.campaign.failedMessage"),
          );
        } finally {
          setSendingCampaign(false);
        }
      },
    );
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <div className={styles.builderCard}>
          <div>
            <div className={styles.hero}>
              <div className={styles.heroContent}>
                <div className={styles.heroIcon}>
                  <i className="bi bi-envelope-paper-heart-fill" />
                </div>

                <div>
                  <span className={styles.heroBadge}>{t("email.campaign.marketing")}</span>

                  <h2>{t("email.campaign.title")}</h2>
                </div>
              </div>

              <div className={styles.heroStats}>
                <div>
                  <strong>{templates.length}</strong>

                  <span>{t("email.campaign.templates")}</span>
                </div>

                <div>
                  <strong>{subscriberCount}</strong>

                  <span>{t("email.campaign.subscribers")}</span>
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label>{t("email.campaign.template")}</label>

              <div className={styles.templateGrid}>
                {loadingTemplates && <div>{t("email.campaign.loadingTemplates")}</div>}

                {!loadingTemplates &&
                  templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className={selectedTemplate === template.id ? styles.templateCardActive : styles.templateCard}
                    >
                      <div className={styles.templateImage}>
                        {template.image ? (
                          <img src={template.image} alt={template.name} />
                        ) : (
                          <div className={styles.templatePlaceholder}>
                            <i className="bi bi-image" />
                          </div>
                        )}
                      </div>

                      <span>{template.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className={styles.field}>
              <label>{t("email.campaign.subject")}</label>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("email.campaign.subjectPlaceholder")}
              />
            </div>

            <div className={styles.field}>
              <label>{t("email.campaign.testEmail")}</label>

              <input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder={t("email.campaign.testEmailPlaceholder")}
              />
            </div>
          </div>

          <div>
            <div className={styles.field}>
              <div className={styles.grapesWrapper}>
                <GrapesEditor key={selectedTemplate} value={html} onChange={setHtml} />
              </div>
            </div>

            <div className={styles.actionBar}>
              <button type="button" className={styles.testButton} onClick={handleSendTest} disabled={sendingTest}>
                <i className="bi bi-send" />

                {sendingTest ? t("email.campaign.sending") : t("email.campaign.sendTest")}
              </button>

              <button
                type="button"
                className={styles.sendButton}
                onClick={handleSendCampaign}
                disabled={sendingCampaign || subscriberCount === 0}
              >
                <i className="bi bi-rocket-takeoff-fill" />

                {sendingCampaign ? t("email.campaign.sending") : t("email.campaign.launch")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

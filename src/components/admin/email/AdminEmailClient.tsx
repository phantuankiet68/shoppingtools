// src/components/admin/email/AdminEmailClient.tsx

"use client";

import { useState } from "react";

import styles from "@/styles/admin/email/email.module.css";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import EmailProviderTab from "@/components/admin/email/EmailProviderTab";
import EmailSubscribersTab from "@/components/admin/email/EmailSubscribersTab";
import EmailCampaignTab from "@/components/admin/email/EmailCampaignTab";

type EmailTab = "provider" | "subscribers" | "campaign";

export default function AdminEmailClient() {
  const [activeTab, setActiveTab] = useState<EmailTab>("provider");

  const { t } = useAdminI18n();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <i className="bi bi-envelope-paper-heart" />
          </div>

          <div className={styles.titleRowUp}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{t("email.dashboard.title")}</h1>

              <span className={styles.liveBadge}>
                <span className={styles.liveDot} />

                {t("email.dashboard.live")}
              </span>
            </div>

            <div className={styles.headerMeta}>
              <div className={styles.metaItem}>
                <i className="bi bi-google" />

                <span>{t("email.dashboard.meta.provider")}</span>
              </div>

              <div className={styles.metaItem}>
                <i className="bi bi-people" />

                <span>{t("email.dashboard.meta.subscribers")}</span>
              </div>

              <div className={styles.metaItem}>
                <i className="bi bi-send-check" />

                <span>{t("email.dashboard.meta.campaigns")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => setActiveTab("provider")}
            className={`${styles.tabBtn} ${activeTab === "provider" ? styles.activeTab : ""}`}
          >
            <div className={styles.tabIcon}>
              <i className="bi bi-google" />
            </div>

            <div className={styles.tabContent}>
              <span className={styles.tabTitle}>{t("email.dashboard.tabs.provider")}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("subscribers")}
            className={`${styles.tabBtn} ${activeTab === "subscribers" ? styles.activeTab : ""}`}
          >
            <div className={styles.tabIcon}>
              <i className="bi bi-people-fill" />
            </div>

            <div className={styles.tabContent}>
              <span className={styles.tabTitle}>{t("email.dashboard.tabs.subscribers")}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("campaign")}
            className={`${styles.tabBtn} ${activeTab === "campaign" ? styles.activeTab : ""}`}
          >
            <div className={styles.tabIcon}>
              <i className="bi bi-envelope-check" />
            </div>

            <div className={styles.tabContent}>
              <span className={styles.tabTitle}>{t("email.dashboard.tabs.campaign")}</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === "provider" && <EmailProviderTab />}

      {activeTab === "subscribers" && <EmailSubscribersTab />}

      {activeTab === "campaign" && <EmailCampaignTab />}
    </div>
  );
}

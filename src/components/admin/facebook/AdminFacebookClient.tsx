"use client";

import { useState } from "react";

import styles from "@/styles/admin/facebook/facebook.module.css";

import FacebookPostsTab from "@/components/admin/facebook/FacebookPostsTab";
import FacebookScheduleTab from "@/components/admin/facebook/FacebookScheduleTab";
import FacebookAuthorTab from "@/components/admin/facebook/FacebookAuthorTab";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

export default function FacebookPage() {
  const [activeTab, setActiveTab] = useState("posts");

  const { t } = useAdminI18n();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <i className="bi bi-facebook" />
          </div>

          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{t("facebook.dashboard.title")}</h1>

              <span className={styles.liveBadge}>
                <span className={styles.liveDot} />

                {t("facebook.dashboard.live")}
              </span>
            </div>

            <div className={styles.headerMeta}>
              <div className={styles.metaItem}>
                <i className="bi bi-calendar-event" />

                <span>{t("facebook.dashboard.meta.scheduled")}</span>
              </div>

              <div className={styles.metaItem}>
                <i className="bi bi-check-circle" />

                <span>{t("facebook.dashboard.meta.published")}</span>
              </div>

              <div className={styles.metaItem}>
                <i className="bi bi-clock-history" />

                <span>{t("facebook.dashboard.meta.autoPosting")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab("posts")}
            className={`${styles.tabBtn} ${activeTab === "posts" ? styles.activeTab : ""}`}
          >
            <div className={styles.tabIcon}>
              <i className="bi bi-calendar-check" />
            </div>

            <div className={styles.tabContent}>
              <span className={styles.tabTitle}>{t("facebook.dashboard.tabs.posts")}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`${styles.tabBtn} ${activeTab === "schedule" ? styles.activeTab : ""}`}
          >
            <div className={styles.tabIcon}>
              <i className="bi bi-plus-circle" />
            </div>

            <div className={styles.tabContent}>
              <span className={styles.tabTitle}>{t("facebook.dashboard.tabs.schedule")}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("author")}
            className={`${styles.tabBtn} ${activeTab === "author" ? styles.activeTab : ""}`}
          >
            <div className={styles.tabIcon}>
              <i className="bi bi-person-badge" />
            </div>

            <div className={styles.tabContent}>
              <span className={styles.tabTitle}>{t("facebook.dashboard.tabs.author")}</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === "posts" && <FacebookPostsTab />}

      {activeTab === "schedule" && <FacebookScheduleTab />}

      {activeTab === "author" && <FacebookAuthorTab />}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

import styles from "@/styles/admin/tiktok/AdminTikTokClient.module.css";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

import ScheduledPostsTab from "@/components/admin/tiktok/ScheduledPostsTab";
import CreateScheduleTab from "@/components/admin/tiktok/CreateScheduleTab";
import AuthorConfigTab from "@/components/admin/tiktok/AuthorConfigTab";

import { CalendarClock, PlusSquare, ShieldCheck, Sparkles } from "lucide-react";

type TabKey = "scheduled" | "create" | "author";

const tabs: {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "scheduled",
    label: "Scheduled Posts",
    icon: <CalendarClock size={18} />,
  },

  {
    key: "create",
    label: "Create Schedule",
    icon: <PlusSquare size={18} />,
  },

  {
    key: "author",
    label: "Author Config",
    icon: <ShieldCheck size={18} />,
  },
];

export default function AdminTikTokClient() {
  const { user } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("scheduled");

  const content = useMemo(() => {
    switch (activeTab) {
      case "scheduled":
        return <ScheduledPostsTab user={user} />;

      case "create":
        return <CreateScheduleTab user={user} />;

      case "author":
        return <AuthorConfigTab />;

      default:
        return null;
    }
  }, [activeTab, user]);

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlowTop} />
      <div className={styles.backgroundGlowBottom} />

      <div className={styles.container}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <Sparkles size={14} />

              <span>TikTok SEO & Automation</span>
            </div>
          </div>
          {/* TABS */}
          <section className={styles.tabsWrapper}>
            <div className={styles.tabs}>
              {tabs.map((tab) => {
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`${styles.tabButton} ${active ? styles.activeTab : ""}`}
                  >
                    <div className={styles.tabIcon}>{tab.icon}</div>
                    <div className={styles.tabText}>
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className={styles.heroCard}>
            <div className={styles.heroCardOverlay} />

            <div className={styles.heroCardContent}>
              <span className={styles.heroCardLabel}>Current Workspace</span>
            </div>
          </div>
        </section>
        {/* CONTENT */}
        <section className={styles.contentSection}>
          <div className={styles.contentCard}>{content}</div>
        </section>
      </div>
    </div>
  );
}

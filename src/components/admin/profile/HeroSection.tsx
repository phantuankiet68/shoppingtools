"use client";

import Image from "next/image";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import type { Profile } from "@/lib/types/profile";

import styles from "@/styles/admin/profile/ProfilePage.module.css";

type Props = {
  profile: Profile;
  saving: boolean;

  onSave: () => Promise<boolean>;
  onOpenAvatar: () => void;
};

export default function HeroSection({ profile, saving, onSave, onOpenAvatar }: Props) {
  const { t } = useAdminI18n();

  return (
    <section className={styles.hero}>
      <div className={styles.heroCard}>
        <div className={styles.coverSection}>
          <Image
            src={profile.banner || "/assets/images/default-cover.jpg"}
            alt={t("profile.hero.cover")}
            fill
            priority
            sizes="180px"
            className={styles.coverImage}
          />

          <div className={styles.coverOverlay} />
        </div>

        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
            <Image
              src={profile.avatar || "/assets/images/default-avatar.png"}
              alt={t("profile.hero.avatar")}
              width={180}
              height={180}
              className={styles.avatar}
            />

            <button
              type="button"
              onClick={onOpenAvatar}
              className={styles.avatarButton}
              aria-label={t("profile.hero.avatar")}
            >
              <i className="bi bi-camera-fill" />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.heroHeader}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIcon}>
              <i className="bi bi-person-circle" />
            </div>

            <div className={styles.heroContent}>
              <div className={styles.titleRow}>
                <h1>{t("profile.hero.title")}</h1>

                <span className={styles.liveBadge}>
                  <span className={styles.liveDot} />

                  {profile.status}
                </span>
              </div>

              <div className={styles.heroMeta}>
                <span>
                  <i className="bi bi-shield-check" />
                  {t("profile.hero.secureAccount")}
                </span>

                <span>
                  <i className="bi bi-clock-history" />
                  {t("profile.hero.profileManagement")}
                </span>

                {profile.isVerified && (
                  <span>
                    <i className="bi bi-patch-check-fill" />
                    {t("profile.hero.verifiedUser")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.heroActions}>
            <button type="button" onClick={onSave} disabled={saving} className={styles.saveBtn}>
              {saving ? (
                <>
                  <span className={styles.spinner} />
                  {t("profile.hero.saving")}
                </>
              ) : (
                <>
                  <i className="bi bi-floppy-fill" />
                  {t("profile.hero.saveChanges")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

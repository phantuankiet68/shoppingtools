"use client";

import Image from "next/image";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import type { Profile } from "@/lib/types/profile";

import styles from "@/styles/admin/profile/ProfilePage.module.css";

type Props = {
  profile: Profile;

  updateField: <K extends keyof Profile>(key: K, value: Profile[K]) => void;

  handleUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner" | "cover") => void;
};

export default function StoreInfoSection({ profile, updateField, handleUpload }: Props) {
  const { t } = useAdminI18n();

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <i className="bi bi-shop-window" />

          <h3>{t("profile.store.title")}</h3>
        </div>

        <span className={styles.cardBadge}>{t("profile.store.badge")}</span>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>
            <i className="bi bi-shop" />
            {t("profile.store.shopName")}
          </label>

          <input
            className={styles.input}
            value={profile.shopName}
            onChange={(e) => updateField("shopName", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-link-45deg" />
            {t("profile.store.shopSlug")}
          </label>

          <input
            className={styles.input}
            value={profile.shopSlug}
            onChange={(e) => updateField("shopSlug", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-stars" />
            {t("profile.store.slogan")}
          </label>

          <input
            className={styles.input}
            value={profile.slogan}
            onChange={(e) => updateField("slogan", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-globe2" />
            {t("profile.store.website")}
          </label>

          <input
            className={styles.input}
            placeholder={t("profile.store.websitePlaceholder")}
            value={profile.website}
            onChange={(e) => updateField("website", e.target.value)}
          />
        </div>

        <div className={styles.uploadField}>
          <label className={styles.uploadLabel}>
            <i className="bi bi-image-fill" />
            {t("profile.store.logo")}
          </label>

          {profile.logo && (
            <div className={styles.previewWrapper}>
              <Image
                src={profile.logo}
                alt={t("profile.store.logo")}
                fill
                sizes="120px"
                className={styles.previewImage}
              />
            </div>
          )}

          <label className={styles.uploadButton}>
            <i className="bi bi-cloud-arrow-up-fill" />

            {t("profile.store.uploadLogo")}

            <input
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={(e) => handleUpload(e, "logo")}
            />
          </label>
        </div>

        <div className={styles.uploadField}>
          <label className={styles.uploadLabel}>
            <i className="bi bi-card-image" />
            {t("profile.store.banner")}
          </label>

          {profile.banner && (
            <div className={styles.bannerWrapper}>
              <Image
                src={profile.banner}
                alt={t("profile.store.banner")}
                fill
                sizes="800px"
                className={styles.bannerImage}
              />
            </div>
          )}

          <label className={styles.uploadButton}>
            <i className="bi bi-cloud-arrow-up-fill" />

            {t("profile.store.uploadBanner")}

            <input
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={(e) => handleUpload(e, "banner")}
            />
          </label>
        </div>

        <div className={styles.fieldFull}>
          <label>
            <i className="bi bi-card-text" />
            {t("profile.store.description")}
          </label>

          <textarea
            rows={4}
            className={styles.textarea}
            value={profile.shopDescription}
            onChange={(e) => updateField("shopDescription", e.target.value)}
          />
        </div>

        <div className={styles.fieldFull}>
          <label>
            <i className="bi bi-chat-left-text-fill" />
            {t("profile.store.bio")}
          </label>

          <textarea
            rows={5}
            className={styles.textarea}
            value={profile.bio}
            onChange={(e) => updateField("bio", e.target.value)}
          />
        </div>

        <div className={styles.fieldFull}>
          <label>
            <i className="bi bi-images" />
            {t("profile.store.cover")}
          </label>

          {profile.cover && (
            <div className={styles.coverWrapper}>
              <Image
                src={profile.cover}
                alt={t("profile.store.cover")}
                fill
                sizes="1200px"
                className={styles.coverPreview}
              />
            </div>
          )}

          <label className={styles.uploadButton}>
            <i className="bi bi-cloud-arrow-up-fill" />

            {t("profile.store.uploadCover")}

            <input
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={(e) => handleUpload(e, "cover")}
            />
          </label>
        </div>
      </div>
    </section>
  );
}

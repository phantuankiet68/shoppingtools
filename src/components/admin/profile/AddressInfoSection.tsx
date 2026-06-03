"use client";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import type { Profile } from "@/lib/types/profile";

import styles from "@/styles/admin/profile/ProfilePage.module.css";

type Props = {
  profile: Profile;

  updateField: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
};

export default function AddressInfoSection({ profile, updateField }: Props) {
  const { t } = useAdminI18n();

  const fullAddress = [profile.address, profile.ward, profile.district, profile.city, profile.country]
    .filter(Boolean)
    .join(", ");

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <i className="bi bi-geo-alt-fill" />

          <h3>{t("profile.address.title")}</h3>
        </div>

        <span className={styles.cardBadge}>{t("profile.address.badge")}</span>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.fieldFull}>
          <label>
            <i className="bi bi-house-door-fill" />
            {t("profile.address.streetAddress")}
          </label>

          <input
            className={styles.input}
            placeholder={t("profile.address.streetAddressPlaceholder")}
            value={profile.address}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-pin-map-fill" />
            {t("profile.address.ward")}
          </label>

          <input className={styles.input} value={profile.ward} onChange={(e) => updateField("ward", e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-map-fill" />
            {t("profile.address.district")}
          </label>

          <input
            className={styles.input}
            value={profile.district}
            onChange={(e) => updateField("district", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-buildings-fill" />
            {t("profile.address.city")}
          </label>

          <input className={styles.input} value={profile.city} onChange={(e) => updateField("city", e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-globe-asia-australia" />
            {t("profile.address.country")}
          </label>

          <input
            className={styles.input}
            value={profile.country}
            onChange={(e) => updateField("country", e.target.value)}
          />
        </div>

        <div className={styles.fieldFull}>
          <div className={styles.addressPreview}>
            <div className={styles.addressPreviewIcon}>
              <i className="bi bi-geo-alt-fill" />
            </div>

            <div>
              <h4>{t("profile.address.preview")}</h4>

              <p>{fullAddress || t("profile.address.noAddress")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

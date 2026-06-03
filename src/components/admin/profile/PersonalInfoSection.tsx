"use client";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import type { Profile } from "@/lib/types/profile";

import styles from "@/styles/admin/profile/ProfilePage.module.css";

type Props = {
  profile: Profile;

  userName?: string;
  userEmail?: string;

  updateField: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
};

export default function PersonalInfoSection({ profile, userName, userEmail, updateField }: Props) {
  const { t } = useAdminI18n();

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <i className="bi bi-person-vcard-fill" />

          <h3>{t("profile.personal.title")}</h3>
        </div>

        <span className={styles.cardBadge}>{t("profile.personal.badge")}</span>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>
            <i className="bi bi-person-fill" />
            {t("profile.personal.firstName")}
          </label>

          <input
            className={styles.input}
            value={profile.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-person-fill" />
            {t("profile.personal.lastName")}
          </label>

          <input
            className={styles.input}
            value={profile.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-at" />
            {t("profile.personal.username")}
          </label>

          <input className={styles.input} value={userName ?? ""} readOnly />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-envelope-fill" />
            {t("profile.personal.email")}
          </label>

          <input className={styles.input} value={userEmail ?? ""} readOnly />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-telephone-fill" />
            {t("profile.personal.phone")}
          </label>

          <input
            className={styles.input}
            value={profile.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-gender-ambiguous" />
            {t("profile.personal.gender")}
          </label>

          <select
            className={styles.select}
            value={profile.gender}
            onChange={(e) => updateField("gender", e.target.value)}
          >
            <option value="">{t("profile.personal.selectGender")}</option>

            <option value="male">{t("profile.personal.male")}</option>

            <option value="female">{t("profile.personal.female")}</option>

            <option value="other">{t("profile.personal.other")}</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-calendar-month-fill" />
            {t("profile.personal.birthMonth")}
          </label>

          <input
            className={styles.input}
            value={profile.dobMonth}
            onChange={(e) => updateField("dobMonth", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-calendar-date-fill" />
            {t("profile.personal.birthDay")}
          </label>

          <input
            className={styles.input}
            value={profile.dobDay}
            onChange={(e) => updateField("dobDay", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>
            <i className="bi bi-calendar-check-fill" />
            {t("profile.personal.birthYear")}
          </label>

          <input
            className={styles.input}
            value={profile.dobYear}
            onChange={(e) => updateField("dobYear", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

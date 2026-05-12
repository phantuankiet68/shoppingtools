"use client";

import Image from "next/image";
import styles from "@/styles/admin/dashboard/UserPlate.module.css";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

export default function SupportManagerCard() {
  const { t } = useAdminI18n();
  return (
    <div className={styles.card}>
      {/* PROFILE */}
      <div className={styles.profile}>
        {/* AVATAR */}
        <div className={styles.avatarWrap}>
          <div className={styles.avatarRing}>
            <Image
              src="/assets/images/avatar.png"
              alt="Manager"
              width={78}
              height={78}
              className={styles.avatar}
              priority
            />
          </div>

          <span className={styles.online}></span>
        </div>

        {/* INFO */}
        <div className={styles.info}>
          <div className={styles.badge}>
            <i className="bi bi-patch-check-fill"></i>
            {t("support.managerName")}
          </div>

          {/* ACTION */}
          <div className={styles.actions}>
            <button className={styles.messageBtn}>
              <i className="bi bi-chat-dots-fill"></i>
              {t("support.message")}
            </button>

            <button className={styles.callBtn}>
              <i className="bi bi-telephone-fill"></i>
            </button>
          </div>
        </div>
        <div className={styles.contactBody}>
          <div className={styles.contactItem}>
            <div className={styles.icon}>
              <i className="bi bi-envelope"></i>
            </div>

            <div>
              <span>{t("support.email")}</span>
              <strong>admin@company.com</strong>
            </div>
          </div>

          <div className={styles.contactItem}>
            <div className={styles.icon}>
              <i className="bi bi-telephone"></i>
            </div>

            <div>
              <span>{t("support.phone")}</span>
              <strong>+84 987 654 321</strong>
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT */}
      <div className={styles.contactList}>
        <div className={styles.chatCard}>
          <div className={styles.chatBody}>
            <div className={styles.messageLeft}>{t("support.chatGreeting")}</div>
            <div className={styles.messageRight}>{t("support.chatRequest")}</div>
            <div className={styles.messageLeft}>{t("support.chatReply")}</div>
          </div>
          <div className={styles.chatInput}>
            <textarea className={styles.textarea} placeholder={t("support.typeMessage")} />

            <button className={styles.sendBtn}>
              <i className="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

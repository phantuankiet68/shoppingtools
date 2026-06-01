"use client";

import { useEffect, useState } from "react";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useModal } from "@/components/admin/shared/common/modal";
import styles from "@/styles/admin/email/provider.module.css";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

type ProviderResponse = {
  success: boolean;
  connected: boolean;
  provider: {
    provider: string;
    email: string;
    senderName: string | null;
    name: string | null;
    picture: string | null;
    status: string;
    expiresAt: string;
  } | null;
};

const maskClientId = (value: string) => {
  if (!value) return "";

  const start = value.slice(0, 12);
  const end = value.slice(-20);

  return `${start}***************${end}`;
};

export default function EmailProviderTab() {
  const { currentSite } = useAdminAuth();

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [disconnecting, setDisconnecting] = useState(false);

  const [googleClientId, setGoogleClientId] = useState("");

  const [googleClientSecret, setGoogleClientSecret] = useState("");

  const [provider, setProvider] = useState<ProviderResponse["provider"]>(null);
  const [showClientId, setShowClientId] = useState(false);

  const { t } = useAdminI18n();

  const modal = useModal();

  useEffect(() => {
    if (!currentSite?.id) {
      modal.error(t("emailProvider.missingSiteTitle"), t("emailProvider.missingSiteMessage"));
      return;
    }

    const initialize = async () => {
      try {
        setLoading(true);

        const [providerResponse, settingsResponse] = await Promise.all([
          fetch(`/api/admin/email/provider?siteId=${currentSite.id}`, {
            cache: "no-store",
          }),

          fetch(`/api/admin/email/provider/settings?siteId=${currentSite.id}`, {
            cache: "no-store",
          }),
        ]);

        const providerData = await providerResponse.json();

        const settingsData = await settingsResponse.json();

        setProvider(providerData.provider ?? null);

        if (settingsData.success) {
          setGoogleClientId(settingsData.data?.googleClientId ?? "");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [currentSite]);
  const handleSaveSettings = async () => {
    if (!currentSite?.id) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/email/provider/settings", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          siteId: currentSite.id,

          googleClientId,

          googleClientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error("SAVE_FAILED");
      }

      modal.success(t("emailProvider.configurationSavedTitle"), t("emailProvider.configurationSavedMessage"));
    } catch (error) {
      console.error(error);

      modal.error(t("emailProvider.saveFailedTitle"), t("emailProvider.saveFailedMessage"));
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = () => {
    if (!currentSite?.id) {
      modal.error(t("emailProvider.missingSiteTitle"), t("emailProvider.missingSiteMessage"));
      return;
    }

    window.location.assign(`/api/admin/email/connect?siteId=${currentSite.id}`);
  };

  const handleDisconnect = async () => {
    if (!currentSite?.id) {
      modal.error(t("emailProvider.missingSiteTitle"), t("emailProvider.missingSiteMessage"));
      return;
    }

    try {
      setProvider(null);

      modal.success(t("emailProvider.disconnectedTitle"), t("emailProvider.disconnectedMessage"));
      const response = await fetch(`/api/admin/email/provider?siteId=${currentSite.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("DISCONNECT_FAILED");
      }

      setProvider(null);
    } catch (error) {
      modal.error(t("emailProvider.disconnectFailedTitle"), t("emailProvider.disconnectFailedMessage"));
    } finally {
      setDisconnecting(false);
    }
  };

  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/api/admin/email/callback` : "";

  if (loading) {
    return <div className={styles.loading}>{t("emailProvider.loading")}</div>;
  }

  return (
    <div className={styles.layout}>
      {/* LEFT */}

      <div className={styles.guideCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerBadge}>
            <i className="bi bi-google"></i>
            <span>
              {" "}
              {t("emailProvider.connectGmailWith")} {t("emailProvider.googleOAuth")}
            </span>
          </div>

          <p>{t("emailProvider.guideDescription")}</p>

          <div className={styles.headerFeatures}>
            <div className={styles.feature}>
              <i className="bi bi-shield-check"></i>
              <span>{t("emailProvider.secureAuthentication")}</span>
            </div>

            <div className={styles.feature}>
              <i className="bi bi-envelope-check"></i>
              <span>{t("emailProvider.gmailApiReady")}</span>
            </div>

            <div className={styles.feature}>
              <i className="bi bi-lightning-charge"></i>
              <span>{t("emailProvider.setupInFiveMinutes")}</span>
            </div>
          </div>
        </div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>

            <div className={styles.stepContent}>
              <strong>{t("emailProvider.step1Title")}</strong>

              <p>{t("emailProvider.step1Description")}</p>

              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {t("emailProvider.step1Link")} →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>

            <div className={styles.stepContent}>
              <strong>{t("emailProvider.step2Title")}</strong>

              <p>{t("emailProvider.step2Description")}</p>

              <ul>
                <li>{t("emailProvider.step2Item1")}</li>
                <li>{t("emailProvider.step2Item2")}</li>
                <li>{t("emailProvider.step2Item3")}</li>
              </ul>

              <a
                href="https://console.cloud.google.com/projectcreate"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {t("emailProvider.step2Link")} →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>

            <div className={styles.stepContent}>
              <strong>{t("emailProvider.step3Title")}</strong>

              <p>{t("emailProvider.step3Description")}</p>

              <ul>
                <li>{t("emailProvider.step3Item1")}</li>
                <li>{t("emailProvider.step3Item2")}</li>
                <li>{t("emailProvider.step3Item3")}</li>
                <li>{t("emailProvider.step3Item4")}</li>
              </ul>

              <a
                href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {t("emailProvider.step3Link")} →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>

            <div className={styles.stepContent}>
              <strong>{t("emailProvider.step4Title")}</strong>

              <p>{t("emailProvider.step4Description")}</p>

              <ul>
                <li>{t("emailProvider.step4Item1")}</li>
                <li>{t("emailProvider.step4Item2")}</li>
                <li>{t("emailProvider.step4Item3")}</li>
                <li>{t("emailProvider.step4Item4")}</li>
                <li>{t("emailProvider.step4Item5")}</li>
              </ul>

              <a
                href="https://console.cloud.google.com/apis/credentials/consent"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {t("emailProvider.step4Link")} →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>

            <div className={styles.stepContent}>
              <strong>{t("emailProvider.step5Title")}</strong>

              <p>{t("emailProvider.step5Description")}</p>

              <ul>
                <li>{t("emailProvider.step5Item1")}</li>
                <li>{t("emailProvider.step5Item2")}</li>
                <li>{t("emailProvider.step5Item3")}</li>
                <li>{t("emailProvider.step5Item4")}</li>
              </ul>

              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {t("emailProvider.step5Link")} →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>

            <div className={styles.stepContent}>
              <strong>{t("emailProvider.step6Title")}</strong>

              <p>{t("emailProvider.step6Description")}</p>

              <code className={styles.codeBlock}>{redirectUri}</code>

              <p>{t("emailProvider.step6Note")}</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>

            <div className={styles.stepContent}>
              <strong>{t("emailProvider.step7Title")}</strong>

              <p>{t("emailProvider.step7Description")}</p>

              <ul>
                <li>{t("emailProvider.step7Item1")}</li>
                <li>{t("emailProvider.step7Item2")}</li>
              </ul>

              <p>{t("emailProvider.step7Note")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}

      <div className={styles.providerCard}>
        <div className={styles.providerHeader}>
          <div className={styles.providerIcon}>
            <i className="bi bi-google"></i>
          </div>

          <div>
            <h2>{t("emailProvider.googleProviderSettings")}</h2>

            <p>{t("emailProvider.googleProviderDescription")}</p>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>{t("emailProvider.googleClientId")}</label>

          <div className={styles.inputWrapper}>
            <i className="bi bi-key"></i>

            <input
              value={showClientId ? googleClientId : maskClientId(googleClientId)}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder={t("emailProvider.enterGoogleClientId")}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>{t("emailProvider.googleClientSecret")}</label>

          <div className={styles.inputWrapper}>
            <i className="bi bi-shield-lock"></i>

            <input
              type="password"
              value={googleClientSecret}
              onChange={(e) => setGoogleClientSecret(e.target.value)}
              placeholder={t("emailProvider.enterGoogleClientSecret")}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={handleSaveSettings} disabled={saving} className={styles.saveButton}>
            <i className="bi bi-floppy"></i>

            {saving ? t("emailProvider.saving") : t("emailProvider.saveConfiguration")}
          </button>

          <button type="button" onClick={handleConnect} className={styles.connectButton}>
            <i className="bi bi-link-45deg"></i>
            {t("emailProvider.connectGmail")}
          </button>
        </div>

        {provider && (
          <div className={styles.connectedCard}>
            <div className={styles.connectedHeader}>
              <div>
                <h3>{t("emailProvider.connectedAccount")}</h3>

                <p>{t("emailProvider.activeConnection")}</p>
              </div>

              <span
                className={`${styles.statusBadge} ${
                  provider.status === "CONNECTED" ? styles.connected : styles.disconnected
                }`}
              >
                {provider.status}
              </span>
            </div>

            <div className={styles.accountInfo}>
              <div className={styles.infoItem}>
                <i className="bi bi-person"></i>

                <div>
                  <span>{t("emailProvider.name")}</span>
                  <strong>{provider.name}</strong>
                </div>
              </div>

              <div className={styles.infoItem}>
                <i className="bi bi-envelope"></i>

                <div>
                  <span>{t("emailProvider.email")}</span>
                  <strong>{provider.email}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={disconnecting}
              onClick={() =>
                modal.confirmDelete(
                  t("emailProvider.disconnectConfirmTitle"),
                  t("emailProvider.disconnectConfirmMessage").replace("{email}", provider.email),
                  () => {
                    void handleDisconnect();
                  },
                )
              }
              className={styles.disconnectButton}
            >
              <i className="bi bi-plug"></i>

              {disconnecting ? t("emailProvider.disconnecting") : t("emailProvider.disconnectGmail")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

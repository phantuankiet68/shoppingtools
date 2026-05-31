"use client";

import { useEffect, useState } from "react";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

import styles from "@/styles/admin/email/provider.module.css";

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

  useEffect(() => {
    if (!currentSite?.id) {
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

      alert("Google OAuth configuration saved successfully.");
    } catch (error) {
      console.error(error);

      alert("Unable to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = () => {
    if (!currentSite?.id) {
      return;
    }

    window.location.assign(`/api/admin/email/connect?siteId=${currentSite.id}`);
  };

  const handleDisconnect = async () => {
    if (!currentSite?.id) {
      return;
    }

    try {
      setDisconnecting(true);

      const response = await fetch(`/api/admin/email/provider?siteId=${currentSite.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("DISCONNECT_FAILED");
      }

      setProvider(null);
    } catch (error) {
      console.error(error);

      alert("Unable to disconnect Gmail.");
    } finally {
      setDisconnecting(false);
    }
  };

  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/api/admin/email/callback` : "";

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.layout}>
      {/* LEFT */}

      <div className={styles.guideCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerBadge}>
            <i className="bi bi-google"></i>
            <span>Google Workspace Integration</span>
          </div>

          <h2>
            Connect Gmail with
            <span className={styles.gradientText}> Google OAuth 2.0</span>
          </h2>

          <p>
            Configure Google Cloud, enable Gmail API, and generate OAuth credentials to securely send emails from your
            application using your Google account.
          </p>

          <div className={styles.headerFeatures}>
            <div className={styles.feature}>
              <i className="bi bi-shield-check"></i>
              <span>Secure Authentication</span>
            </div>

            <div className={styles.feature}>
              <i className="bi bi-envelope-check"></i>
              <span>Gmail API Ready</span>
            </div>

            <div className={styles.feature}>
              <i className="bi bi-lightning-charge"></i>
              <span>Setup in 5 Minutes</span>
            </div>
          </div>
        </div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>

            <div className={styles.stepContent}>
              <strong>Open Google Cloud Console</strong>

              <p>Access Google Cloud Console and sign in with your Google account.</p>

              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Open Google Cloud Console →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>

            <div className={styles.stepContent}>
              <strong>Create a New Project</strong>

              <p>
                Click the project selector in the top navigation bar and choose
                <b> New Project</b>.
              </p>

              <ul>
                <li>Enter a project name</li>
                <li>Select an organization (optional)</li>
                <li>
                  Click <b>Create</b>
                </li>
              </ul>

              <a
                href="https://console.cloud.google.com/projectcreate"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Create Project →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>

            <div className={styles.stepContent}>
              <strong>Enable Gmail API</strong>

              <p>Gmail API must be enabled before your application can send emails through Google OAuth.</p>

              <ul>
                <li>Navigate to APIs & Services</li>
                <li>Click Library</li>
                <li>Search for Gmail API</li>
                <li>Click Enable</li>
              </ul>

              <a
                href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Enable Gmail API →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>

            <div className={styles.stepContent}>
              <strong>Configure OAuth Consent Screen</strong>

              <p>Configure the application information displayed to users during the Google login process.</p>

              <ul>
                <li>Select External or Internal User Type</li>
                <li>Add Application Name</li>
                <li>Add Support Email</li>
                <li>Add Developer Contact Email</li>
                <li>Save and Continue</li>
              </ul>

              <a
                href="https://console.cloud.google.com/apis/credentials/consent"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Configure Consent Screen →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>

            <div className={styles.stepContent}>
              <strong>Create OAuth Client ID</strong>

              <p>Create OAuth credentials that will be used by your application.</p>

              <ul>
                <li>Go to APIs & Services → Credentials</li>
                <li>Click Create Credentials</li>
                <li>Select OAuth Client ID</li>
                <li>Choose Web Application</li>
              </ul>

              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Open Credentials →
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>

            <div className={styles.stepContent}>
              <strong>Add Authorized Redirect URI</strong>

              <p>Add the redirect URL below to the Authorized Redirect URIs section.</p>

              <code className={styles.codeBlock}>{redirectUri}</code>

              <p>This URL is required so Google can redirect users back to your application after authentication.</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>

            <div className={styles.stepContent}>
              <strong>Copy Credentials</strong>

              <p>After creating the OAuth Client, copy the following values:</p>

              <ul>
                <li>Client ID</li>
                <li>Client Secret</li>
              </ul>

              <p>Paste them into the Google Email Provider configuration in the Admin Panel and save your settings.</p>
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
            <h2>Google Provider Settings</h2>

            <p>Configure OAuth credentials and connect your Gmail account.</p>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Google Client ID</label>

          <div className={styles.inputWrapper}>
            <i className="bi bi-key"></i>

            <input
              value={showClientId ? googleClientId : maskClientId(googleClientId)}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="Enter Google Client ID"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Google Client Secret</label>

          <div className={styles.inputWrapper}>
            <i className="bi bi-shield-lock"></i>

            <input
              type="password"
              value={googleClientSecret}
              onChange={(e) => setGoogleClientSecret(e.target.value)}
              placeholder="Enter Google Client Secret"
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={handleSaveSettings} disabled={saving} className={styles.saveButton}>
            <i className="bi bi-floppy"></i>

            {saving ? "Saving..." : "Save Configuration"}
          </button>

          <button type="button" onClick={handleConnect} className={styles.connectButton}>
            <i className="bi bi-link-45deg"></i>
            Connect Gmail
          </button>
        </div>

        {provider && (
          <div className={styles.connectedCard}>
            <div className={styles.connectedHeader}>
              <div>
                <h3>Connected Account</h3>

                <p>Active Gmail provider connection</p>
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
                  <span>Name</span>
                  <strong>{provider.name}</strong>
                </div>
              </div>

              <div className={styles.infoItem}>
                <i className="bi bi-envelope"></i>

                <div>
                  <span>Email</span>
                  <strong>{provider.email}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={disconnecting}
              onClick={handleDisconnect}
              className={styles.disconnectButton}
            >
              <i className="bi bi-plug"></i>

              {disconnecting ? "Disconnecting..." : "Disconnect Gmail"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

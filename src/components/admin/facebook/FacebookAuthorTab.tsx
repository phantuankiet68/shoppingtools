"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/styles/admin/facebook/facebook.module.css";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

type FacebookAuthor = {
  id: string;

  pageId: string;

  pageName: string | null;

  pageAccessToken: string;

  autoPublish: boolean;

  tokenExpiresAt: string | null;

  createdAt?: string;

  updatedAt?: string;
};

type FormState = {
  pageId: string;

  pageName: string;

  pageAccessToken: string;

  autoPublish: boolean;
};

const initialForm: FormState = {
  pageId: "",

  pageName: "",

  pageAccessToken: "",

  autoPublish: true,
};

export default function FacebookAuthorTab() {
  const { user } = useAdminAuth();

  const { t } = useAdminI18n();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [showToken, setShowToken] = useState(false);

  const [author, setAuthor] = useState<FacebookAuthor | null>(null);

  const [form, setForm] = useState<FormState>(initialForm);

  const [message, setMessage] = useState<{
    type: "success" | "error";

    text: string;
  } | null>(null);

  const tokenStatus = useMemo(() => {
    if (!author?.tokenExpiresAt) {
      return {
        label: t("facebook.author.status.unknown"),

        className: styles.statusWarning,
      };
    }

    const expiresAt = new Date(author.tokenExpiresAt);

    const now = new Date();

    if (expiresAt < now) {
      return {
        label: t("facebook.author.status.expired"),

        className: styles.statusDanger,
      };
    }

    return {
      label: t("facebook.author.status.active"),

      className: styles.statusSuccess,
    };
  }, [author, t]);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const loadAuthor = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/admin/facebook/authors?userId=${user.id}`);

        const text = await response.text();

        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
          throw new Error(data?.error || t("facebook.author.messages.loadFailed"));
        }

        if (mounted && data) {
          setAuthor(data);

          setForm({
            pageId: data.pageId || "",

            pageName: data.pageName || "",

            pageAccessToken: data.pageAccessToken || "",

            autoPublish: data.autoPublish ?? true,
          });
        }
      } catch (error) {
        console.error(error);

        if (!mounted) return;

        setMessage({
          type: "error",

          text: t("facebook.author.messages.unableLoad"),
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAuthor();

    return () => {
      mounted = false;
    };
  }, [user?.id, t]);

  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(() => {
      setMessage(null);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [message]);

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (saving) return;

      setSaving(true);

      setMessage(null);

      if (!form.pageId.trim()) {
        setMessage({
          type: "error",

          text: t("facebook.author.messages.pageIdRequired"),
        });

        return;
      }

      if (!form.pageAccessToken.trim()) {
        setMessage({
          type: "error",

          text: t("facebook.author.messages.tokenRequired"),
        });

        return;
      }

      const response = await fetch("/api/admin/facebook/authors", {
        method: author ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: user?.id,

          ...form,
        }),
      });

      const text = await response.text();

      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(data?.error || t("facebook.author.messages.saveFailed"));
      }

      setAuthor(data);

      setMessage({
        type: "success",

        text: author ? t("facebook.author.messages.updateSuccess") : t("facebook.author.messages.createSuccess"),
      });
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",

        text: error instanceof Error ? error.message : t("facebook.author.messages.unexpected"),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.authorLayout}>
      <div className={styles.guideCard}>
        <div className={styles.guideHeader}>
          <div className={styles.guideIcon}>
            <i className="bi bi-facebook" />
          </div>

          <div>
            <h2>{t("facebook.author.guide.title")}</h2>

            <p>{t("facebook.author.guide.description")}</p>
          </div>
        </div>

        <div className={styles.guideSteps}>
          {/* STEP 1 */}
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>1</div>

            <div className={styles.stepContent}>
              <div className={styles.stepTop}>
                <i className="bi bi-person-check" />

                <h4>{t("facebook.author.steps.metaAccount.title")}</h4>
              </div>

              <p>{t("facebook.author.steps.metaAccount.description")}</p>

              <div className={styles.stepList}>
                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.metaAccount.items.login")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.metaAccount.items.verify")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.metaAccount.items.policy")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.metaAccount.items.profile")}</span>
                </div>
              </div>

              <div className={styles.infoMini}>
                <i className="bi bi-info-circle-fill" />

                <span>{t("facebook.author.steps.metaAccount.info")}</span>
              </div>

              <div className={styles.stepActions}>
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.stepLink}
                >
                  <i className="bi bi-box-arrow-up-right" />

                  <span>{t("facebook.author.steps.metaAccount.action")}</span>
                </a>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>2</div>

            <div className={styles.stepContent}>
              <div className={styles.stepTop}>
                <i className="bi bi-app-indicator" />

                <h4>{t("facebook.author.steps.createApp.title")}</h4>
              </div>

              <p>{t("facebook.author.steps.createApp.description")}</p>

              <div className={styles.stepList}>
                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.createApp.items.create")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.createApp.items.type")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.createApp.items.login")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.createApp.items.permission")}</span>
                </div>
              </div>

              <div className={styles.badges}>
                <span>{t("facebook.author.steps.createApp.badges.graph")}</span>

                <span>{t("facebook.author.steps.createApp.badges.pages")}</span>

                <span>{t("facebook.author.steps.createApp.badges.facebookLogin")}</span>

                <span>{t("facebook.author.steps.createApp.badges.business")}</span>
              </div>

              <div className={styles.infoMini}>
                <i className="bi bi-lightbulb-fill" />

                <span>{t("facebook.author.steps.createApp.info")}</span>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>3</div>

            <div className={styles.stepContent}>
              <div className={styles.stepTop}>
                <i className="bi bi-key" />

                <h4>{t("facebook.author.steps.generateToken.title")}</h4>
              </div>

              <p>{t("facebook.author.steps.generateToken.description")}</p>

              <div className={styles.stepList}>
                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.generateToken.items.select")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.generateToken.items.generate")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.generateToken.items.permission")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.generateToken.items.convert")}</span>
                </div>
              </div>

              <div className={styles.badges}>
                <span>{t("facebook.author.steps.generateToken.badges.manage")}</span>

                <span>{t("facebook.author.steps.generateToken.badges.show")}</span>

                <span>{t("facebook.author.steps.generateToken.badges.read")}</span>

                <span>{t("facebook.author.steps.generateToken.badges.long")}</span>
              </div>

              <div className={styles.warningBox}>
                <i className="bi bi-exclamation-triangle-fill" />

                <span>{t("facebook.author.steps.generateToken.warning")}</span>
              </div>

              <div className={styles.stepActions}>
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.stepLink}
                >
                  <i className="bi bi-box-arrow-up-right" />

                  <span>{t("facebook.author.steps.generateToken.action")}</span>
                </a>
              </div>
            </div>
          </div>

          {/* STEP 4 */}
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>4</div>

            <div className={styles.stepContent}>
              <div className={styles.stepTop}>
                <i className="bi bi-facebook" />

                <h4>{t("facebook.author.steps.connectPage.title")}</h4>
              </div>

              <p>{t("facebook.author.steps.connectPage.description")}</p>

              <div className={styles.stepList}>
                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.connectPage.items.pageId")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.connectPage.items.token")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.connectPage.items.auto")}</span>
                </div>

                <div>
                  <i className="bi bi-check-circle-fill" />

                  <span>{t("facebook.author.steps.connectPage.items.save")}</span>
                </div>
              </div>

              <div className={styles.badges}>
                <span>{t("facebook.author.steps.connectPage.badges.pageId")}</span>

                <span>{t("facebook.author.steps.connectPage.badges.token")}</span>

                <span>{t("facebook.author.steps.connectPage.badges.auto")}</span>

                <span>{t("facebook.author.steps.connectPage.badges.scheduler")}</span>
              </div>

              <div className={styles.infoMini}>
                <i className="bi bi-clock-history" />

                <span>{t("facebook.author.steps.connectPage.info")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          {author && (
            <div className={`${styles.tokenStatus} ${tokenStatus.className}`}>
              <span />

              {tokenStatus.label}
            </div>
          )}
        </div>

        {message && (
          <div className={`${styles.alert} ${message.type === "success" ? styles.alertSuccess : styles.alertError}`}>
            <i className={`bi ${message.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`} />

            <span>{message.text}</span>
          </div>
        )}

        <div className={styles.authorProfile}>
          <div className={styles.authorAvatar}>
            <i className="bi bi-facebook" />
          </div>

          <div>
            <h4>{form.pageName || t("facebook.author.form.defaultPage")}</h4>

            <span className={author ? styles.connectedBadge : styles.notConnectedBadge}>
              <i className={`bi ${author ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />

              {author ? t("facebook.author.connected") : t("facebook.author.notConnected")}
            </span>
          </div>
        </div>

        {author && (
          <div className={styles.connectedInfo}>
            <div>
              <span>{t("facebook.author.createdAt")}</span>

              <strong>{author.createdAt ? new Date(author.createdAt).toLocaleString() : "-"}</strong>
            </div>

            <div>
              <span>{t("facebook.author.updatedAt")}</span>

              <strong>{author.updatedAt ? new Date(author.updatedAt).toLocaleString() : "-"}</strong>
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>{t("facebook.author.form.pageName")}</label>

          <input
            type="text"
            placeholder={t("facebook.author.form.pageNamePlaceholder")}
            className={styles.input}
            value={form.pageName}
            onChange={(e) => handleChange("pageName", e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t("facebook.author.form.pageId")}</label>

          <input
            type="text"
            placeholder={t("facebook.author.form.pageIdPlaceholder")}
            className={styles.input}
            value={form.pageId}
            disabled={!!author}
            onChange={(e) => handleChange("pageId", e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t("facebook.author.form.pageToken")}</label>

          <div className={styles.tokenWrapper}>
            <textarea
              placeholder={t("facebook.author.form.pageTokenPlaceholder")}
              className={`${styles.textarea} ${!showToken ? styles.hiddenToken : ""}`}
              value={form.pageAccessToken}
              onChange={(e) => handleChange("pageAccessToken", e.target.value)}
            />

            <button type="button" className={styles.tokenToggle} onClick={() => setShowToken(!showToken)}>
              <i className={`bi ${showToken ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
          </div>
        </div>

        <div className={styles.switchRow}>
          <div>
            <strong>{t("facebook.author.form.autoPublish")}</strong>

            <p>{t("facebook.author.form.autoPublishDesc")}</p>
          </div>

          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={form.autoPublish}
              onChange={(e) => handleChange("autoPublish", e.target.checked)}
            />

            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>
            <i className="bi bi-info-circle" />
          </div>

          <div>
            <h4>{t("facebook.author.notes.title")}</h4>

            <ul>
              <li>{t("facebook.author.notes.note1")}</li>

              <li>{t("facebook.author.notes.note2")}</li>

              <li>{t("facebook.author.notes.note3")}</li>
            </ul>
          </div>
        </div>

        <button className={styles.saveBtn} disabled={saving || loading} onClick={handleSave}>
          <i className="bi bi-save" />

          <span>
            {saving
              ? author
                ? t("facebook.author.actions.updating")
                : t("facebook.author.actions.creating")
              : author
                ? t("facebook.author.actions.update")
                : t("facebook.author.actions.create")}
          </span>
        </button>
      </div>
    </div>
  );
}

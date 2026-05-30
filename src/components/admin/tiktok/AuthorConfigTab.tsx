"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import styles from "@/styles/admin/tiktok/AuthorConfigTab.module.css";

interface TikTokAuthor {
  id: string;

  username?: string | null;

  displayName?: string | null;

  avatar?: string | null;

  tiktokOpenId: string;

  autoPublish: boolean;

  tokenExpiresAt?: string | null;
}

export default function AuthorConfigTab() {
  const [author, setAuthor] = useState<TikTokAuthor | null>(null);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    tiktokOpenId: "",

    username: "",

    displayName: "",

    avatar: "",

    accessToken: "",

    refreshToken: "",

    autoPublish: true,
  });

  const loadAuthor = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/tiktok/authors", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch author");
      }

      const data = await response.json();

      if (data?.item) {
        setAuthor(data.item);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (mounted) {
        await loadAuthor();
      }
    };

    void init();

    return () => {
      mounted = false;
    };
  }, [loadAuthor]);
  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/admin/tiktok/authors", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to save author");
      }

      await loadAuthor();

      alert("TikTok author saved");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const guideSteps = useMemo(
    () => [
      {
        icon: "bi bi-person-plus",
        title: "Create TikTok Developer App",
        desc: "Sign in to TikTok Developers, create an application, and obtain your Client Key and Client Secret. These credentials are required to connect TikTok accounts.",
        link: "https://developers.tiktok.com/",
      },

      {
        icon: "bi bi-card-checklist",
        title: "Configure App Information",
        desc: "Complete App Icon, Category, Description, Terms of Service URL, Privacy Policy URL, and Website URL. These fields are required before requesting TikTok review.",
        link: "https://developers.tiktok.com/",
      },

      {
        icon: "bi bi-box-arrow-in-right",
        title: "Enable Login Kit",
        desc: "Activate Login Kit and configure OAuth authentication. This allows users to securely sign in with their TikTok accounts.",
        link: "https://developers.tiktok.com/doc/login-kit-web",
      },

      {
        icon: "bi bi-shield-lock",
        title: "Configure OAuth Scopes",
        desc: "Enable user.info.basic to retrieve Author information. If available, request video.upload and video.publish for automated video publishing.",
        link: "https://developers.tiktok.com/doc/content-posting-api-overview",
      },

      {
        icon: "bi bi-link-45deg",
        title: "Configure Redirect URI",
        desc: "Add the callback URL used by your Next.js application. Example: https://your-domain.com/api/admin/tiktok/callback",
        link: "#",
      },

      {
        icon: "bi bi-person-check",
        title: "Connect TikTok Author",
        desc: "Click Connect TikTok and authorize your account. The system will securely store Open ID, Username, Display Name, Avatar, Access Token, and Refresh Token.",
        link: "/api/admin/tiktok/connect",
      },

      {
        icon: "bi bi-person-vcard",
        title: "Retrieve Author Information",
        desc: "After authentication, the system automatically fetches TikTok Author profile information and stores it in the database for future publishing operations.",
        link: "#",
      },

      {
        icon: "bi bi-camera-video",
        title: "Upload Product Videos",
        desc: "Create product videos, SEO titles, descriptions, and hashtags. Videos will be stored in the publishing queue before scheduling.",
        link: "#",
      },

      {
        icon: "bi bi-calendar-event",
        title: "Schedule Publishing",
        desc: "Choose the publication date and time. Scheduled jobs will automatically upload and publish videos to TikTok at the configured time.",
        link: "#",
      },

      {
        icon: "bi bi-bar-chart-line",
        title: "Monitor Publishing Status",
        desc: "Track publishing history, upload failures, completed jobs, and video performance metrics from the admin dashboard.",
        link: "#",
      },
    ],
    [],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.guideSteps}>
        {guideSteps.map((step, index) => (
          <div key={step.title} className={styles.stepItem}>
            {/* NUMBER */}
            <div className={styles.stepNumber}>{index + 1}</div>

            {/* CONTENT */}
            <div className={styles.stepContent}>
              <div className={styles.stepTop}>
                <div className={styles.stepIcon}>
                  <i className={step.icon} />
                </div>

                <div>
                  <h4>{step.title}</h4>

                  <p>{step.desc}</p>
                </div>
              </div>

              <a href={step.link} target="_blank" rel="noreferrer" className={styles.stepLink}>
                Open Documentation
                <i className="bi bi-arrow-up-right" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <div className={styles.accountCard}>
            <div className={styles.accountTop}>
              <div className={styles.avatarWrapper}>
                {author?.avatar ? (
                  <Image
                    src={author.avatar}
                    alt={author.username ?? "TikTok"}
                    width={80}
                    height={80}
                    className={styles.avatar}
                    unoptimized
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <i className="bi bi-tiktok" />
                  </div>
                )}
              </div>

              <div className={styles.accountInfo}>
                <h3>{author?.displayName ?? "No TikTok Connected"}</h3>

                <p>@{author?.username ?? "tiktok"}</p>
              </div>
            </div>

            <div className={styles.accountMeta}>
              <div className={styles.metaItem}>
                <span>Open ID</span>

                <strong>{author?.tiktokOpenId ?? "-"}</strong>
              </div>

              <div className={styles.metaItem}>
                <span>Auto Publish</span>

                <strong>{author?.autoPublish ? "Enabled" : "Disabled"}</strong>
              </div>

              <div className={styles.metaItem}>
                <span>Token Status</span>

                <strong>Active</strong>
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>TikTok Open ID</label>

              <input
                type="text"
                value={form.tiktokOpenId}
                onChange={(e) =>
                  setForm({
                    ...form,

                    tiktokOpenId: e.target.value,
                  })
                }
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Username</label>

              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,

                    username: e.target.value,
                  })
                }
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Display Name</label>

              <input
                type="text"
                value={form.displayName}
                onChange={(e) =>
                  setForm({
                    ...form,

                    displayName: e.target.value,
                  })
                }
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Avatar URL</label>

              <input
                type="text"
                value={form.avatar}
                onChange={(e) =>
                  setForm({
                    ...form,

                    avatar: e.target.value,
                  })
                }
                className={styles.input}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Access Token</label>

              <textarea
                value={form.accessToken}
                onChange={(e) =>
                  setForm({
                    ...form,

                    accessToken: e.target.value,
                  })
                }
                className={styles.textarea}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Refresh Token</label>

              <textarea
                value={form.refreshToken}
                onChange={(e) =>
                  setForm({
                    ...form,

                    refreshToken: e.target.value,
                  })
                }
                className={styles.textarea}
              />
            </div>

            <div className={` ${styles.switchGroup}`}>
              <div>
                <label>Auto Publish</label>

                <p>Automatically publish scheduled TikTok posts.</p>
              </div>

              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={form.autoPublish}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      autoPublish: e.target.checked,
                    })
                  }
                />

                <span />
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-floppy" />
                  Save Author
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

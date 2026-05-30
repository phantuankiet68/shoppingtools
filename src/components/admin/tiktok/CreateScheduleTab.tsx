"use client";

import Image from "next/image";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import styles from "@/styles/admin/tiktok/CreateScheduleTab.module.css";

interface Props {
  user: {
    id?: string;

    name?: string;
  } | null;
}

interface FormState {
  title: string;

  description: string;

  hashtags: string;

  seoKeywords: string;

  publishAt: string;

  cta: string;

  href: string;
}

const initialState: FormState = {
  title: "",

  description: "",

  hashtags: "",

  seoKeywords: "",

  publishAt: "",

  cta: "",

  href: "",
};

export default function CreateScheduleTab({ user }: Props) {
  const [form, setForm] = useState<FormState>(initialState);

  const [video, setVideo] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [automationLoading, setAutomationLoading] = useState(false);

  const videoPreview = useMemo(() => {
    if (!preview) {
      return null;
    }

    return preview;
  }, [preview]);

  const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setVideo(file);

    const url = URL.createObjectURL(file);

    setPreview(url);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!video) {
      alert("Please upload a video");

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.title);

      formData.append("description", form.description);

      formData.append("hashtags", form.hashtags);

      formData.append("seoKeywords", form.seoKeywords);

      formData.append("publishAt", form.publishAt);

      formData.append("cta", form.cta);

      formData.append("href", form.href);

      formData.append("video", video);

      formData.append("status", form.publishAt ? "SCHEDULED" : "DRAFT");

      const response = await fetch("/api/admin/tiktok/posts", {
        method: "POST",

        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create schedule");
      }

      alert("TikTok schedule created successfully");

      setForm(initialState);

      setVideo(null);

      setPreview(null);
    } catch (error) {
      console.error("CREATE TIKTOK POST ERROR:", error);

      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAutomationFill = async () => {
    try {
      setAutomationLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const now = new Date();

      now.setHours(now.getHours() + 2);

      const publishAt = now.toISOString().slice(0, 16);

      setForm({
        title: "🔥 Premium Smart LED Lamp For Modern Bedroom Setup",

        description:
          "Upgrade your room aesthetic with this premium smart LED lamp ✨\n\nPerfect for gaming setup, bedroom decoration, work desk, and modern lifestyle.\n\n✔️ RGB Color Modes\n✔️ Smart Touch Control\n✔️ USB Powered\n✔️ TikTok Trending Product\n\nOrder now before sold out 🚀",

        hashtags: "#tiktokshop #viralproducts #ledlamp #roomdecor #gamingsetup #fyp #tiktokviral",

        seoKeywords: "smart led lamp, gaming setup lamp, tiktok viral product, bedroom led light",

        publishAt,

        cta: "Shop Now",

        href: "https://yourshop.com/products/smart-led-lamp",
      });
    } finally {
      setAutomationLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* CONTENT */}
      <div className={styles.contentGrid}>
        {/* LEFT - FORM */}
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <div className={styles.formGrid}>
            {/* TITLE */}
            <div className={styles.formGroup}>
              <label>Title</label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter TikTok title"
                className={styles.input}
              />
            </div>

            {/* CTA */}
            <div className={styles.formGroup}>
              <label>CTA</label>

              <input
                type="text"
                name="cta"
                value={form.cta}
                onChange={handleChange}
                placeholder="Learn More"
                className={styles.input}
              />
            </div>

            {/* DESCRIPTION */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter TikTok description"
                className={styles.textarea}
              />
            </div>

            {/* HASHTAGS */}
            <div className={styles.formGroup}>
              <label>Hashtags</label>

              <input
                type="text"
                name="hashtags"
                value={form.hashtags}
                onChange={handleChange}
                placeholder="#nextjs #seo"
                className={styles.input}
              />
            </div>

            {/* SEO */}
            <div className={styles.formGroup}>
              <label>SEO Keywords</label>

              <input
                type="text"
                name="seoKeywords"
                value={form.seoKeywords}
                onChange={handleChange}
                placeholder="nextjs,tiktok"
                className={styles.input}
              />
            </div>

            {/* DATE */}
            <div className={styles.formGroup}>
              <label>Publish At</label>

              <input
                type="datetime-local"
                name="publishAt"
                value={form.publishAt}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            {/* LINK */}
            <div className={styles.formGroup}>
              <label>Target URL</label>

              <input
                type="text"
                name="href"
                value={form.href}
                onChange={handleChange}
                placeholder="https://"
                className={styles.input}
              />
            </div>

            {/* VIDEO */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Upload Video</label>

              <label className={styles.uploadBox}>
                <input type="file" accept="video/*" onChange={handleVideo} hidden />

                <div className={styles.uploadContent}>
                  <i className="bi bi-cloud-upload" />

                  <div>
                    <strong>Upload TikTok Video</strong>

                    <span>MP4, MOV up to 500MB</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* ACTIONS */}
          <div className={styles.actions}>
            <button type="button" onClick={handleAutomationFill} className={styles.automationBtn}>
              <div className={styles.automationGlow} />

              <div className={styles.automationContent}>
                <div className={styles.automationIcon}>
                  <i className="bi bi-stars" />
                </div>

                <div className={styles.automationText}>
                  <strong>AI Product Automation</strong>
                </div>
              </div>
            </button>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat" />
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-calendar-check" />
                  Create Schedule
                </>
              )}
            </button>
          </div>
        </form>

        {/* RIGHT - PREVIEW */}
        <div className={styles.previewCard}>
          <div className={styles.previewTop}>
            <div>
              <h3>Live TikTok Preview</h3>

              <p>Real-time preview based on form content.</p>
            </div>

            <div className={styles.previewBadge}>PREVIEW</div>
          </div>

          <div className={styles.phoneWrapper}>
            <div className={styles.phone}>
              {/* VIDEO */}
              <div className={styles.previewVideo}>
                {videoPreview ? (
                  <video src={videoPreview} controls className={styles.video} />
                ) : (
                  <div className={styles.emptyPreview}>
                    <i className="bi bi-tiktok" />

                    <span>Video Preview</span>
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className={styles.previewOverlay}>
                <div className={styles.previewMeta}>
                  <div className={styles.avatar}>{user?.name?.charAt(0) ?? "A"}</div>

                  <div>
                    <strong>@{user?.name?.replaceAll(" ", "") ?? "admin"}</strong>

                    <span>Scheduled Post</span>
                  </div>
                </div>

                <div className={styles.previewText}>
                  <h4>{form.title || "TikTok title preview"}</h4>

                  <p>{form.description || "TikTok description preview"}</p>

                  {form.hashtags && <div className={styles.previewTags}>{form.hashtags}</div>}

                  {form.cta && (
                    <button type="button" className={styles.previewCta}>
                      {form.cta}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

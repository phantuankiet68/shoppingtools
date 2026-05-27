"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import styles from "@/styles/admin/facebook/facebook.module.css";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import { useModal } from "@/components/admin/shared/common/modal";
import Image from "next/image";

type FormDataType = {
  title: string;
  description: string;
  status: "draft" | "scheduled" | "published";
  hashtags: string;
  publishDate: string;
  publishTime: string;
  href: string;
  imagePreview: string;
  imageFile: File | null;
};

type ApiError = {
  title?: string;
  description?: string;
};

export default function FacebookScheduleTab() {
  const { t } = useAdminI18n();
  const modal = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError>({});
  const [form, setForm] = useState<FormDataType>({
    title: "",
    description: "",
    status: "draft",
    hashtags: "",
    publishDate: "",
    publishTime: "",
    href: "",
    imagePreview: "",
    imageFile: null,
  });

  const publishAt = useMemo(() => {
    if (!form.publishDate || !form.publishTime) {
      return null;
    }
    const date = new Date(`${form.publishDate}T${form.publishTime}`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }, [form.publishDate, form.publishTime]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      imagePreview: preview,
      imageFile: file,
    }));
  };

  const generatePost = () => {
    const href = form.href || "https://yourwebsite.com";
    setForm((prev) => ({
      ...prev,

      title: "🔥 ƯU ĐÃI HOT HÔM NAY",

      description: `
🚀 DEAL HOT ĐÃ CHÍNH THỨC BẮT ĐẦU!

✨ Sản phẩm chất lượng cao
✨ Thiết kế hiện đại
✨ Trải nghiệm sử dụng tuyệt vời

🎁 Ưu đãi đặc biệt hôm nay.

🌐 Xem chi tiết tại:
${href}

👉 Inbox ngay để được tư vấn nhanh nhất!
      `.trim(),

      hashtags: "#sale #dealhot #shopping #promotion",

      href,

      status: "scheduled",
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      status: "draft",
      hashtags: "",
      publishDate: "",
      publishTime: "",
      href: "",
      imagePreview: "",
      imageFile: null,
    });
  };

  const savePost = async (status: "draft" | "scheduled" | "published") => {
    try {
      setLoading(true);
      setError({});
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("hashtags", form.hashtags);
      formData.append("href", form.href);
      formData.append("status", status === "draft" ? "DRAFT" : status === "scheduled" ? "SCHEDULED" : "PUBLISHED");
      if (publishAt) {
        formData.append("publishAt", publishAt);
      }
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }
      const response = await fetch("/api/admin/facebook/facebook-posts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || {});
        modal.error(t("facebook.messages.error"), t("facebook.messages.saveError"));
        return;
      }

      modal.success(
        t("facebook.messages.success"),
        status === "draft" ? t("facebook.messages.draftSaved") : t("facebook.messages.postScheduled"),
      );

      resetForm();
    } catch (error) {
      console.error(error);

      modal.error(t("facebook.messages.error"), t("facebook.messages.unexpected"));
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await savePost("draft");
  };

  const handleSchedule = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await savePost("scheduled");
  };

  return (
    <div className={styles.mainGrid}>
      {/* FORM */}
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <div>
            <h2>{t("facebook.title")}</h2>

            <p>{t("facebook.description")}</p>
          </div>

          <button type="button" className={styles.facebookBadge} onClick={generatePost}>
            <i className="bi bi-stars" />

            {t("facebook.actions.generate")}
          </button>
        </div>

        {/* TITLE */}
        <div className={styles.formGroup}>
          <label>{t("facebook.fields.title")}</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder={t("facebook.placeholders.title")}
            className={styles.input}
          />

          {error.title && <span className={styles.errorText}>{error.title}</span>}
        </div>

        {/* DESCRIPTION */}
        <div className={styles.formGroup}>
          <label>{t("facebook.fields.description")}</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t("facebook.placeholders.description")}
            className={styles.textarea}
          />

          {error.description && <span className={styles.errorText}>{error.description}</span>}
        </div>

        {/* STATUS + HASHTAGS */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>{t("facebook.fields.status")}</label>

            <select name="status" value={form.status} onChange={handleChange} className={styles.select}>
              <option value="draft">Draft</option>

              <option value="scheduled">Scheduled</option>

              <option value="published">Published</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>{t("facebook.fields.hashtags")}</label>

            <input
              type="text"
              name="hashtags"
              value={form.hashtags}
              onChange={handleChange}
              placeholder={t("facebook.placeholders.hashtags")}
              className={styles.input}
            />
          </div>
        </div>

        {/* DATE + TIME */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>{t("facebook.fields.publishDate")}</label>

            <input
              type="date"
              name="publishDate"
              value={form.publishDate}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("facebook.fields.publishTime")}</label>

            <input
              type="time"
              name="publishTime"
              value={form.publishTime}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>

        {/* URL */}
        <div className={styles.formGroup}>
          <label>{t("facebook.fields.href")}</label>

          <input
            type="url"
            name="href"
            value={form.href}
            onChange={handleChange}
            placeholder={t("facebook.placeholders.href")}
            className={styles.input}
          />
        </div>

        {/* IMAGE */}
        <div className={styles.formGroup}>
          <label>{t("facebook.fields.image")}</label>

          <div className={styles.fileInputWrapper}>
            <i className={`bi bi-image ${styles.fileIcon}`} />

            <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
          </div>
        </div>

        {/* BUTTONS */}
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.secondaryBtn} onClick={handleDraft} disabled={loading}>
            {loading ? (
              <>
                <i className="bi bi-arrow-repeat" />

                {t("facebook.actions.saving")}
              </>
            ) : (
              <>
                <i className="bi bi-floppy2" />

                {t("facebook.actions.saveDraft")}
              </>
            )}
          </button>

          <button type="button" className={styles.scheduleBtn} onClick={handleSchedule} disabled={loading}>
            {loading ? (
              <>
                <i className="bi bi-arrow-repeat" />

                {t("facebook.actions.scheduling")}
              </>
            ) : (
              <>
                <i className="bi bi-calendar-check" />

                {t("facebook.actions.schedule")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* PREVIEW */}
      <div className={styles.previewWrapper}>
        <div className={styles.previewCard}>
          {/* TOP */}
          <div className={styles.previewTop}>
            <div className={styles.avatar}>
              <i className="bi bi-facebook" />
            </div>

            <div>
              <h4>My Facebook Page</h4>

              <span>🌎 Public</span>
            </div>
          </div>
          <div className={styles.previewContent}>
            {form.title && <h2 className={styles.previewTitle}>{form.title}</h2>}

            <p className={styles.previewDescription}>{form.description || t("facebook.preview.empty")}</p>

            {form.hashtags && <div className={styles.previewTags}>{form.hashtags}</div>}
          </div>
          <div
            className={styles.previewImage}
            style={{
              position: "relative",
            }}
          >
            {form.imagePreview ? (
              <Image src={form.imagePreview} alt="Preview" fill unoptimized className={styles.previewImg} />
            ) : (
              <div className={styles.emptyPreview}>
                <i className="bi bi-image" />

                <span>{t("facebook.preview.image")}</span>
              </div>
            )}
          </div>
          {/* LINK */}
          {form.href && <div className={styles.previewLink}>{form.href}</div>}
          {/* FOOTER */}
          <div className={styles.previewFooter}>
            <button type="button">
              <i className="bi bi-hand-thumbs-up" />
              Like
            </button>

            <button type="button">
              <i className="bi bi-chat" />
              Comment
            </button>

            <button type="button">
              <i className="bi bi-share" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

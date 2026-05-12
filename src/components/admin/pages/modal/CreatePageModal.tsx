"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import styles from "@/styles/admin/pages/modal/createPageModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
  pages: Array<{
    id: string;
    siteId?: string | null;
    site_id?: string | null;
  }>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CreatePageModal({ open, onClose, onCreated }: Props) {
  const modal = useModal();

  const { t } = useAdminI18n();

  const { sites = [] } = useAdminAuth();

  const defaultSiteId = useMemo(() => {
    return sites?.[0]?.id || "";
  }, [sites]);

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");

  const [slug, setSlug] = useState("");

  const [siteId, setSiteId] = useState(defaultSiteId);

  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!siteId && defaultSiteId) {
      setSiteId(defaultSiteId);
    }
  }, [defaultSiteId, siteId]);

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);

      if (!slugTouched) {
        const nextSlug = slugify(value);

        setSlug(nextSlug ? `/${nextSlug}` : "/");
      }
    },
    [slugTouched],
  );

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      modal.error(t("pageList.common.error"), t("pageList.createModal.validation.titleRequired"));

      return;
    }

    if (!siteId) {
      modal.error(t("pageList.common.error"), t("pageList.createModal.validation.siteRequired"));

      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/pages/save", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          siteId,
          title,
          slug: slug || slugify(title),
          blocks: [],
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || t("pageList.createModal.messages.createFailed"));
      }

      modal.success(t("pageList.common.success"), t("pageList.createModal.messages.createSuccess"));

      setTitle("");

      setSlug("");

      setSlugTouched(false);

      await onCreated?.();

      onClose();
    } catch (e: unknown) {
      modal.error(t("pageList.common.error"), (e as Error)?.message || t("pageList.createModal.messages.createFailed"));
    } finally {
      setLoading(false);
    }
  }, [title, slug, siteId, modal, t, onClose, onCreated]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{t("pageList.createModal.title")}</h2>

          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label>{t("pageList.createModal.fields.site")}</label>

            <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className={styles.input}>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.id}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>{t("pageList.createModal.fields.title")}</label>

            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t("pageList.createModal.placeholders.title")}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label>{t("pageList.createModal.fields.slug")}</label>

            <input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);

                const nextSlug = slugify(e.target.value);

                setSlug(nextSlug ? `/${nextSlug}` : "/");
              }}
              placeholder={t("pageList.createModal.placeholders.slug")}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            <i className="bi bi-x-circle" />

            <span>{t("pageList.common.cancel")}</span>
          </button>

          <button type="button" onClick={() => void handleSubmit()} className={styles.submitBtn} disabled={loading}>
            <i className={`bi ${loading ? "bi-arrow-repeat spinning" : "bi-plus-circle"}`} />

            <span>
              {loading ? t("pageList.createModal.buttons.creating") : t("pageList.createModal.buttons.create")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

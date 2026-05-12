"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/pages/PageInspector.module.css";
import { API_ROUTES } from "@/constants/api";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import { fillAutoSEO, PageRow, SEO } from "@/lib/pages/types";

type Props = {
  page: PageRow | null;
  onEdit: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  initialSeo?: SEO | null;
};

type SyncForm = {
  siteId: string;
  title: string;
  slug: string;
  path: string;
};

function hasMeaningfulSeo(seo?: Partial<SEO> | null) {
  if (!seo) return false;

  return Boolean(
    seo.metaTitle ||
    seo.metaDescription ||
    seo.keywords ||
    seo.canonicalUrl ||
    seo.ogTitle ||
    seo.ogDescription ||
    seo.ogImage ||
    seo.structuredData,
  );
}

function normalizePath(raw?: string | null) {
  const s = (raw || "").trim();
  if (!s || s === "/") return "/";

  const parts = s
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length ? `/${parts.join("/")}` : "/";
}

function normalizeSlug(raw?: string | null) {
  const s = (raw || "").trim();
  if (!s || s === "/") return "";

  const parts = s
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts[parts.length - 1] || "";
}

function getLastSlugSegment(raw?: string | null) {
  return normalizeSlug(raw);
}

function buildPathFromSlug(slug: string) {
  const cleaned = normalizeSlug(slug);
  return cleaned ? `/${cleaned}` : "/";
}

function replaceLastPathSegment(path: string, slug: string) {
  const normalizedPath = normalizePath(path);
  const parts = normalizedPath.split("/").filter(Boolean);
  const cleanedSlug = normalizeSlug(slug);

  if (!cleanedSlug) {
    if (parts.length <= 1) return "/";
    return `/${parts.slice(0, -1).join("/")}`;
  }

  if (parts.length === 0) {
    return `/${cleanedSlug}`;
  }

  parts[parts.length - 1] = cleanedSlug;
  return `/${parts.join("/")}`;
}

function sanitizeSeo(seo?: Partial<SEO> | null): SEO {
  return {
    metaTitle: seo?.metaTitle ?? "",
    metaDescription: seo?.metaDescription ?? "",
    keywords: seo?.keywords ?? "",
    canonicalUrl: seo?.canonicalUrl ?? "",
    noindex: seo?.noindex ?? false,
    nofollow: seo?.nofollow ?? false,
    ogTitle: seo?.ogTitle ?? "",
    ogDescription: seo?.ogDescription ?? "",
    ogImage: seo?.ogImage ?? "",
    twitterCard: seo?.twitterCard ?? "summary_large_image",
    sitemapChangefreq: seo?.sitemapChangefreq ?? "weekly",
    sitemapPriority: seo?.sitemapPriority ?? 0.7,
    structuredData: seo?.structuredData ?? "",
  };
}

function buildDefaultSEO(page: PageRow | null, initialSeo?: Partial<SEO> | null): SEO {
  const base: SEO = {
    metaTitle: page?.title || "",
    metaDescription: "",
    keywords: "",
    canonicalUrl: "",
    noindex: false,
    nofollow: false,
    ogTitle: page?.title || "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    sitemapChangefreq: "weekly",
    sitemapPriority: 0.7,
    structuredData: "",
  };

  return {
    ...base,
    ...sanitizeSeo(initialSeo),
  };
}

function isAbortError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  ) {
    return true;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ERR_CANCELED"
  ) {
    return true;
  }

  return false;
}

function PageInspector({ page, onEdit, onPreview, onPublish, onUnpublish, onDelete, initialSeo = null }: Props) {
  const modal = useModal();
  const { currentSite } = useAdminAuth();
  const { t } = useAdminI18n();

  const siteId = currentSite?.id ?? "";
  const siteName = currentSite?.name ?? "";
  const hasPage = !!page?.id;

  const [seo, setSeo] = useState<SEO>(() => buildDefaultSEO(page, initialSeo));
  const [savingSEO, setSavingSEO] = useState(false);

  const [syncOpen, setSyncOpen] = useState(false);
  const [syncingPage, setSyncingPage] = useState(false);
  const [syncForm, setSyncForm] = useState<SyncForm>({
    siteId,
    title: "",
    slug: "",
    path: "/",
  });

  const initializedPageIdRef = useRef<string | null>(null);
  const fetchedSeoPageIdRef = useRef<string | null>(null);

  const pathPretty = useMemo(() => normalizePath(page?.path || "/"), [page?.path]);

  const dateTimeFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  const updatedText = useMemo(() => {
    if (!page) return "";
    const ts = page.updatedAt || page.createdAt || 0;
    return ts ? dateTimeFormatter.format(new Date(ts)) : t("pages.pageInspector.noDate");
  }, [page, dateTimeFormatter, t]);

  useEffect(() => {
    if (!page?.id) {
      initializedPageIdRef.current = null;
      fetchedSeoPageIdRef.current = null;
      setSeo(buildDefaultSEO(null, null));
      return;
    }

    if (initializedPageIdRef.current === page.id) return;

    initializedPageIdRef.current = page.id;
    fetchedSeoPageIdRef.current = null;

    setSeo(buildDefaultSEO(page, hasMeaningfulSeo(initialSeo) ? initialSeo : null));
  }, [page?.id, initialSeo, page]);

  useEffect(() => {
    if (!page?.id) return;
    if (hasMeaningfulSeo(initialSeo)) return;
    if (fetchedSeoPageIdRef.current === page.id) return;

    const controller = new AbortController();
    const pageId = page.id;
    let disposed = false;

    (async () => {
      try {
        const r = await fetch(API_ROUTES.ADMIN_BUILDER.PAGE_SEO(pageId), {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!r.ok) {
          if (disposed || controller.signal.aborted) return;

          if (r.status === 404) {
            fetchedSeoPageIdRef.current = pageId;
            return;
          }

          modal.error(t("common.error"), t("pages.pageInspector.loadSeoFailed"));
          return;
        }

        const data = await r.json();

        if (disposed || controller.signal.aborted) return;

        fetchedSeoPageIdRef.current = pageId;

        if (data?.seo) {
          setSeo((prev) => ({
            ...prev,
            ...sanitizeSeo(data.seo),
          }));
        }
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted || disposed) {
          return;
        }

        modal.error(t("common.error"), t("pages.pageInspector.loadSeoFailed"));
      }
    })();

    return () => {
      disposed = true;
      controller.abort();
    };
  }, [page?.id, initialSeo, modal, t]);

  useEffect(() => {
    if (!page?.id) return;

    setSeo((prev) => ({
      ...prev,
      metaTitle: prev.metaTitle || page.title || "",
      ogTitle: prev.ogTitle || page.title || "",
    }));
  }, [page?.id, page?.title]);

  useEffect(() => {
    setSyncForm((prev) => {
      if (prev.siteId === siteId) return prev;
      return {
        ...prev,
        siteId,
      };
    });
  }, [siteId]);

  const metaLen = (seo.metaTitle || "").length;
  const descLen = (seo.metaDescription || "").length;

  const seoOkTitle = metaLen <= 60 ? "good" : metaLen <= 70 ? "warn" : "bad";
  const seoOkDesc = descLen <= 160 ? "good" : descLen <= 180 ? "warn" : "bad";

  const openSyncModal = useCallback(() => {
    setSyncForm({
      siteId,
      title: page?.title || "",
      slug: getLastSlugSegment(page?.slug || page?.path || ""),
      path: normalizePath(page?.path || buildPathFromSlug(page?.slug || "")),
    });

    setSyncOpen(true);
  }, [page, siteId]);

  const closeSyncModal = useCallback(() => {
    if (syncingPage) return;
    setSyncOpen(false);
  }, [syncingPage]);

  const handleSyncFormChange = useCallback((field: keyof SyncForm, value: string) => {
    setSyncForm((prev) => {
      const next = { ...prev };

      if (field === "siteId") {
        next.siteId = value;
        return next;
      }

      if (field === "title") {
        next.title = value;
        return next;
      }

      if (field === "slug") {
        const slug = normalizeSlug(value);
        next.slug = slug;
        next.path = replaceLastPathSegment(prev.path, slug);
        return next;
      }

      if (field === "path") {
        const path = normalizePath(value);
        next.path = path;
        next.slug = getLastSlugSegment(path);
        return next;
      }

      return next;
    });
  }, []);

  const handleAutoSEO = useCallback(() => {
    if (!page?.id) return;

    const { seo: nextSeo } = fillAutoSEO(t, {
      title: page.title || t("pages.pageInspector.newPage"),

      path: page.path || "/",
    });

    setSeo((prev) => ({
      ...prev,
      ...sanitizeSeo(nextSeo),
    }));

    modal.success(t("pageList.common.success"), t("pages.pageInspector.autoSeoCompleted"));
  }, [page, modal, t]);

  const handleSaveSEO = useCallback(async () => {
    if (!page?.id) return;

    try {
      setSavingSEO(true);

      const res = await fetch(API_ROUTES.ADMIN_BUILDER.PAGE_SEO(page.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || t("pages.pageInspector.saveSeoFailed"));
      }

      modal.success(t("pageList.common.success"), t("pages.pageInspector.saveSeoSuccess"));
    } catch (e: unknown) {
      modal.error(t("common.error"), (e as Error)?.message || t("pages.pageInspector.saveSeoError"));
    } finally {
      setSavingSEO(false);
    }
  }, [page?.id, seo, modal, t]);

  const handleSyncFromMenu = useCallback(async () => {
    try {
      const currentSiteId = syncForm.siteId.trim() || siteId;
      const title = syncForm.title.trim();
      const manualSlug = normalizeSlug(syncForm.slug);
      const path = syncForm.path.trim() ? normalizePath(syncForm.path) : buildPathFromSlug(manualSlug);
      const slug = getLastSlugSegment(path) || manualSlug;

      if (!currentSiteId) {
        modal.error(t("pages.pageInspector.missingSite"), t("pages.pageInspector.currentSiteNotFound"));
        return;
      }

      if (!title) {
        modal.error(t("pages.pageInspector.missingTitle"), t("pages.pageInspector.pleaseEnterTitle"));
        return;
      }

      if (!slug) {
        modal.error(t("pages.pageInspector.missingSlug"), t("pages.pageInspector.pleaseEnterSlug"));
        return;
      }

      setSyncingPage(true);

      const res = await fetch(API_ROUTES.ADMIN_BUILDER_PAGE_SYNC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: currentSiteId,
          items: [{ title, slug, path }],
        }),
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || t("pages.pageInspector.syncPageFailed"));
      }

      modal.success(t("pageList.common.success"), t("pages.pageInspector.syncPageSuccess"));
      setSyncOpen(false);
      setSyncForm((prev) => ({
        ...prev,
        siteId: currentSiteId,
        title,
        slug,
        path,
      }));
    } catch (e: unknown) {
      modal.error(t("common.error"), (e as Error)?.message || t("pages.pageInspector.syncPageError"));
    } finally {
      setSyncingPage(false);
    }
  }, [syncForm, siteId, modal, t]);
  const handleDelete = useCallback(() => {
    if (!page?.id) return;

    const pageTitle = page.title || t("pages.pageInspector.thisPage");

    modal.confirmDelete(
      t("pages.pageInspector.deletePageTitle"),
      `${t("pages.pageInspector.deletePageConfirm")} "${pageTitle}"`,
      () => onDelete(),
    );
  }, [page, onDelete, modal, t]);

  const functionKeys = useMemo(
    () => ({
      F2: () => {
        if (!hasPage) return;
        onPreview();
      },
      F3: () => {
        if (!hasPage) return;
        handleDelete();
      },
      F6: () => {
        if (!hasPage) return;
        onEdit();
      },
      F9: () => {
        if (!hasPage) return;
        handleAutoSEO();
      },
      F10: () => {
        if (!hasPage || savingSEO) return;
        void handleSaveSEO();
      },
      F11: () => {
        if (!hasPage) return;
        if (page?.status === "PUBLISHED") onUnpublish();
        else onPublish();
      },
    }),
    [
      hasPage,
      onPreview,
      handleDelete,
      openSyncModal,
      onEdit,
      handleAutoSEO,
      handleSaveSEO,
      savingSEO,
      page?.status,
      onPublish,
      onUnpublish,
    ],
  );

  usePageFunctionKeys(functionKeys);

  const actionButtons = useMemo(
    () => [
      {
        key: "preview",
        label: t("pages.pageInspector.preview"),
        hotkey: "F2",
        icon: "bi-eye",
        onClick: onPreview,
        disabled: !hasPage,
      },
      {
        key: "delete",
        label: t("pages.pageInspector.delete"),
        hotkey: "F3",
        icon: "bi-trash",
        onClick: handleDelete,
        disabled: !hasPage,
      },
      {
        key: "edit",
        label: t("pages.pageInspector.edit"),
        hotkey: "F6",
        icon: "bi-pencil",
        onClick: onEdit,
        disabled: !hasPage,
      },
      {
        key: "autoSeo",
        label: t("pages.pageInspector.autoSeo"),
        hotkey: "F9",
        icon: "bi-magic",
        onClick: handleAutoSEO,
        disabled: !hasPage,
      },
      {
        key: "saveSeo",
        label: savingSEO ? t("pages.pageInspector.saving") : t("pages.pageInspector.saveSeo"),
        hotkey: "F10",
        icon: "bi-save",
        onClick: () => void handleSaveSEO(),
        disabled: !hasPage || savingSEO,
      },
      {
        key: "publishToggle",
        label: page?.status === "PUBLISHED" ? t("pages.pageInspector.unpublish") : t("pages.pageInspector.publish"),
        hotkey: "F11",
        icon: page?.status === "PUBLISHED" ? "bi-eye-slash" : "bi-upload",
        onClick: () => {
          if (!hasPage) return;
          if (page?.status === "PUBLISHED") onUnpublish();
          else onPublish();
        },
        disabled: !hasPage,
      },
    ],
    [
      hasPage,
      onPreview,
      handleDelete,
      openSyncModal,
      onEdit,
      handleAutoSEO,
      handleSaveSEO,
      savingSEO,
      page?.status,
      onPublish,
      onUnpublish,
      siteId,
      t,
    ],
  );

  return (
    <>
      <section className={styles.rightPane}>
        {hasPage ? (
          <>
            <header className={styles.detailHead}>
              <div className={styles.detailInfo}>
                <h2 className={styles.detailTitle}>{page!.title || t("pages.pageInspector.untitled")}</h2>

                <div className={styles.kvItem}>
                  <span className={styles.kvLabel}>{t("pages.pageInspector.path")}</span>
                  <span className={styles.kvValue}>{pathPretty}</span>
                </div>

                <div className={styles.kvItem}>
                  <span className={styles.kvLabel}>{t("pages.pageInspector.status")}</span>
                  <span
                    className={`${styles.badge} ${page!.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}
                  >
                    {page!.status === "PUBLISHED" ? t("pages.pageInspector.published") : t("pages.pageInspector.draft")}
                  </span>
                </div>
              </div>

              <div className={styles.headActions}>
                {actionButtons.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    className={styles.actionBtn}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    title={`${action.label} (${action.hotkey})`}
                  >
                    <i className={`bi ${action.icon} ${styles.actionIcon}`} />
                    <span>{action.label}</span>
                    <span className={styles.actionKey}>{action.hotkey}</span>
                  </button>
                ))}
              </div>
            </header>
          </>
        ) : (
          <div className={styles.rightEmpty}>
            <i className={`bi bi-layout-sidebar-inset ${styles.emptyIcon}`} />
            <p className={styles.emptyText}>{t("pages.pageInspector.emptyState")}</p>
          </div>
        )}

        {hasPage && (
          <div className={styles.card}>
            <div className={styles.field}>
              <div className={styles.fieldTop}>
                <label className={styles.label}>{t("pages.pageInspector.metaTitle")}</label>
                <div className={styles.counter}>
                  <span className={styles.counterNum}>{metaLen}</span>
                  <span className={`${styles.counterHint} ${styles[`counter_${seoOkTitle}`]}`}>
                    {t("pages.pageInspector.metaTitleRange")}
                  </span>
                </div>
              </div>

              <input
                className={styles.input}
                value={seo.metaTitle ?? ""}
                onChange={(e) => setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))}
                placeholder={page!.title || t("pages.pageInspector.titlePlaceholder")}
              />
            </div>

            <div className={styles.threeCol}>
              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.ogTitle")}</label>
                <input
                  className={styles.input}
                  value={seo.ogTitle ?? ""}
                  onChange={(e) => setSeo((prev) => ({ ...prev, ogTitle: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.twitterCard")}</label>
                <select
                  className={styles.select}
                  value={seo.twitterCard}
                  onChange={(e) => setSeo((prev) => ({ ...prev, twitterCard: e.target.value as SEO["twitterCard"] }))}
                >
                  <option value="summary_large_image">
                    {t("pages.pageInspector.twitterCardOptions.summaryLargeImage")}
                  </option>
                  <option value="summary">{t("pages.pageInspector.twitterCardOptions.summary")}</option>
                </select>
              </div>

              <div className={styles.checkRow}>
                <label className={styles.label}>{t("pages.pageInspector.choices")}</label>
                <div className={styles.dFlex}>
                  <label className={styles.check}>
                    <input
                      className={styles.checkInput}
                      type="checkbox"
                      checked={!!seo.noindex}
                      onChange={(e) => setSeo((prev) => ({ ...prev, noindex: e.target.checked }))}
                    />
                    <span className={styles.checkText}>{t("pages.pageInspector.noindex")}</span>
                  </label>

                  <label className={styles.check}>
                    <input
                      className={styles.checkInput}
                      type="checkbox"
                      checked={!!seo.nofollow}
                      onChange={(e) => setSeo((prev) => ({ ...prev, nofollow: e.target.checked }))}
                    />
                    <span className={styles.checkText}>{t("pages.pageInspector.nofollow")}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldTop}>
                <label className={styles.label}>{t("pages.pageInspector.metaDescription")}</label>
                <div className={styles.counter}>
                  <span className={styles.counterNum}>{descLen}</span>
                  <span className={`${styles.counterHint} ${styles[`counter_${seoOkDesc}`]}`}>
                    {t("pages.pageInspector.metaDescriptionRange")}
                  </span>
                </div>
              </div>

              <textarea
                className={styles.textarea}
                rows={3}
                value={seo.metaDescription ?? ""}
                onChange={(e) => setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))}
                placeholder={t("pages.pageInspector.metaDescriptionPlaceholder")}
              />
            </div>

            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.keywordsOptional")}</label>
                <input
                  className={styles.input}
                  value={seo.keywords ?? ""}
                  onChange={(e) => setSeo((prev) => ({ ...prev, keywords: e.target.value }))}
                  placeholder={t("pages.pageInspector.keywordsPlaceholder")}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.canonicalUrl")}</label>
                <input
                  className={styles.input}
                  value={seo.canonicalUrl ?? ""}
                  onChange={(e) => setSeo((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
                  placeholder={t("pages.pageInspector.canonicalUrlPlaceholder")}
                />
              </div>
            </div>

            <div className={styles.hr} />

            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.ogDescription")}</label>
                <input
                  className={styles.input}
                  value={seo.ogDescription ?? ""}
                  onChange={(e) => setSeo((prev) => ({ ...prev, ogDescription: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <div className={styles.fieldTop}>
                  <label className={styles.label}>{t("pages.pageInspector.ogImageUrl")}</label>
                  <span className={styles.helper}>{t("pages.pageInspector.ogImageHelper")}</span>
                </div>
                <input
                  className={styles.input}
                  value={seo.ogImage ?? ""}
                  onChange={(e) => setSeo((prev) => ({ ...prev, ogImage: e.target.value }))}
                  placeholder={t("pages.pageInspector.ogImagePlaceholder")}
                />
              </div>
            </div>

            <div className={styles.hr} />

            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.sitemapChangefreq")}</label>
                <select
                  className={styles.select}
                  value={seo.sitemapChangefreq}
                  onChange={(e) =>
                    setSeo((prev) => ({ ...prev, sitemapChangefreq: e.target.value as SEO["sitemapChangefreq"] }))
                  }
                >
                  <option value="always">{t("pages.pageInspector.changefreq.always")}</option>
                  <option value="hourly">{t("pages.pageInspector.changefreq.hourly")}</option>
                  <option value="daily">{t("pages.pageInspector.changefreq.daily")}</option>
                  <option value="weekly">{t("pages.pageInspector.changefreq.weekly")}</option>
                  <option value="monthly">{t("pages.pageInspector.changefreq.monthly")}</option>
                  <option value="yearly">{t("pages.pageInspector.changefreq.yearly")}</option>
                  <option value="never">{t("pages.pageInspector.changefreq.never")}</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.sitemapPriority")}</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={1}
                  className={styles.input}
                  value={seo.sitemapPriority}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const num = raw === "" ? NaN : Number(raw);
                    const clamped = Number.isFinite(num) ? Math.max(0, Math.min(1, num)) : 0.7;
                    setSeo((prev) => ({ ...prev, sitemapPriority: clamped }));
                  }}
                />
              </div>
            </div>

            <div>
              <label className={styles.label}>{t("pages.pageInspector.structuredData")}</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={seo.structuredData ?? ""}
                onChange={(e) => setSeo((prev) => ({ ...prev, structuredData: e.target.value }))}
                placeholder={t("pages.pageInspector.structuredDataPlaceholder")}
              />
            </div>
          </div>
        )}
      </section>

      {syncOpen && (
        <div className={styles.overlay} onClick={closeSyncModal}>
          <div
            className={styles.syncModal}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={styles.syncHead}>
              <h3 className={styles.syncTitle}>{t("pages.pageInspector.syncModalTitle")}</h3>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={closeSyncModal}
                disabled={syncingPage}
                aria-label={t("pages.pageInspector.close")}
              >
                {t("pages.pageInspector.closeIcon")}
              </button>
            </div>

            <div className={styles.syncBody}>
              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.site")}</label>
                <input
                  className={styles.input}
                  value={siteName || siteId}
                  disabled
                  placeholder={t("pages.pageInspector.currentSite")}
                />
                <div className={styles.helper}>
                  {siteId
                    ? t("pages.pageInspector.usingCurrentSite") + " " + (siteName || siteId)
                    : t("pages.pageInspector.currentSiteNotFound")}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.title")}</label>
                <input
                  className={styles.input}
                  value={syncForm.title}
                  onChange={(e) => handleSyncFormChange("title", e.target.value)}
                  placeholder={t("pages.pageInspector.enterTitle")}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.slug")}</label>
                <input
                  className={styles.input}
                  value={syncForm.slug}
                  onChange={(e) => handleSyncFormChange("slug", e.target.value)}
                  placeholder={t("pages.pageInspector.slugPlaceholder")}
                />
                <div className={styles.helper}>{t("pages.pageInspector.slugHelper")}</div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("pages.pageInspector.path")}</label>
                <input
                  className={styles.input}
                  value={syncForm.path}
                  onChange={(e) => handleSyncFormChange("path", e.target.value)}
                  placeholder={t("pages.pageInspector.pathPlaceholder")}
                />
              </div>

              <div className={styles.syncHint}>
                {t("pages.pageInspector.syncHintPrefix")} <strong>{t("pages.pageInspector.createAndSync")}</strong>,{" "}
                {t("pages.pageInspector.syncHintSuffix")}
                <pre className={styles.codeBlock}>
                  {`POST ${API_ROUTES.ADMIN_BUILDER_PAGE_SYNC}
                    {
                      "siteId": "${syncForm.siteId || siteId || t("pages.pageInspector.yourSiteId")}",
                      "items": [
                        {
                          "title": "${syncForm.title || t("pages.pageInspector.yourTitle")}",
                          "slug": "${syncForm.slug || t("pages.pageInspector.slugExample")}",
                          "path": "${syncForm.path || t("pages.pageInspector.pathExample")}"
                        }
                      ]
                    }`}
                </pre>
              </div>
            </div>

            <div className={styles.syncFoot}>
              <button type="button" className={styles.secondaryBtn} onClick={closeSyncModal} disabled={syncingPage}>
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => void handleSyncFromMenu()}
                disabled={syncingPage || !siteId}
              >
                {syncingPage ? t("pages.pageInspector.syncing") : t("pages.pageInspector.createAndSync")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(PageInspector);

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/builder/pages/PageInspector.module.css";
import type { PageRow, SEO } from "@/lib/page/types";
import { buildAutoSEO } from "@/lib/page/seo-utils";
import { API_ROUTES } from "@/constants/api";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";

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

function ensureLeadingSlash(p?: string | null) {
  if (!p) return "/";
  const s = p.trim();
  return s.startsWith("/") ? s : `/${s}`;
}

function buildDefaultSEO(page: PageRow | null, initialSeo?: SEO | null): SEO {
  return {
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
    ...(initialSeo || {}),
  };
}

function PageInspector({ page, onEdit, onPreview, onPublish, onUnpublish, onDelete, initialSeo = null }: Props) {
  const modal = useModal();
  const hasPage = !!page?.id;

  const [seo, setSeo] = useState<SEO>(() => buildDefaultSEO(page, initialSeo));
  const [savingSEO, setSavingSEO] = useState(false);

  const lastLoadedPageIdRef = useRef<string | null>(null);

  const pathPretty = useMemo(() => ensureLeadingSlash(page?.path || "/"), [page?.path]);

  const dateTimeFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const updatedText = useMemo(() => {
    if (!page) return "";
    const ts = page.updatedAt || page.createdAt || 0;
    return ts ? dateTimeFormatter.format(new Date(ts)) : "(no date)";
  }, [page, dateTimeFormatter]);

  useEffect(() => {
    if (!page?.id) {
      lastLoadedPageIdRef.current = null;
      setSeo(buildDefaultSEO(null, null));
      return;
    }

    setSeo(buildDefaultSEO(page, initialSeo));
    lastLoadedPageIdRef.current = null;
  }, [page, initialSeo]);

  useEffect(() => {
    if (!page?.id) return;

    if (initialSeo) {
      lastLoadedPageIdRef.current = page.id;
      return;
    }

    if (lastLoadedPageIdRef.current === page.id) return;

    const controller = new AbortController();
    const pageId = page.id;

    (async () => {
      try {
        const r = await fetch(API_ROUTES.ADMIN_BUILDER.PAGE_SEO(pageId), {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!r.ok) {
          if (r.status === 404) {
            modal.error("Not found", "Trang không tồn tại");
          } else {
            modal.error("Error", "Load SEO failed");
          }
          return;
        }

        const data = await r.json();
        if (controller.signal.aborted) return;

        if (data?.seo) setSeo((prev) => ({ ...prev, ...data.seo }));

        lastLoadedPageIdRef.current = pageId;
      } catch {
        // silent
      }
    })();

    return () => controller.abort();
  }, [page, initialSeo, modal]);

  useEffect(() => {
    if (!page) return;
    setSeo((prev) => ({
      ...prev,
      metaTitle: prev.metaTitle || page.title || "",
      ogTitle: prev.ogTitle || page.title || "",
    }));
  }, [page]);

  const metaLen = (seo.metaTitle || "").length;
  const descLen = (seo.metaDescription || "").length;

  const seoOkTitle = metaLen <= 60 ? "good" : metaLen <= 70 ? "warn" : "bad";
  const seoOkDesc = descLen <= 160 ? "good" : descLen <= 180 ? "warn" : "bad";

  const handleAutoSEO = useCallback(() => {
    if (!page) return;

    const suggestion = buildAutoSEO({
      title: page.title || seo.metaTitle || "Trang mới",
      path: pathPretty,
    });

    setSeo((prev) => ({
      ...prev,
      ...suggestion,
      ogTitle: suggestion.metaTitle || prev.ogTitle,
    }));

    modal.success("Success", "Đã autocomplete SEO");
  }, [page, pathPretty, seo.metaTitle, modal]);

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
        const msg = j?.error || "Save SEO failed";
        throw new Error(msg);
      }

      modal.success("Success", "Đã lưu SEO");
    } catch (e: unknown) {
      modal.error("Error", (e as Error)?.message || "Save SEO error");
    } finally {
      setSavingSEO(false);
    }
  }, [page?.id, seo, modal]);

  const handleDelete = useCallback(() => {
    if (!page?.id) return;

    modal.confirmDelete("Delete page?", `Delete “${page.title || "this page"}”? This action cannot be undone.`, () =>
      onDelete(),
    );
  }, [page, onDelete, modal]);

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

  return (
    <section className={styles.rightPane}>
      {hasPage ? (
        <header className={styles.detailHead}>
          <div className={styles.detailInfo}>
            <h2 className={styles.detailTitle}>{page!.title || "(untitled)"}</h2>
          </div>

          <div className={styles.actionRow}>
            <div className={styles.kv}>
              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>Status</span>
                <span
                  className={`${styles.badge} ${page!.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}
                >
                  {page!.status}
                </span>
              </div>

              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>Updated</span>
                <span className={styles.kvValue}>{updatedText}</span>
              </div>
            </div>
          </div>
        </header>
      ) : (
        <div className={styles.rightEmpty}>
          <i className={`bi bi-layout-sidebar-inset ${styles.emptyIcon}`} />
          <p className={styles.emptyText}>Chọn một trang ở danh sách bên trái để chỉnh Settings & SEO.</p>
        </div>
      )}

      {hasPage && (
        <div className={styles.card}>
          <div className={styles.field}>
            <div className={styles.fieldTop}>
              <label className={styles.label}>Meta Title</label>
              <div className={styles.counter}>
                <span className={styles.counterNum}>{metaLen}</span>
                <span className={`${styles.counterHint} ${styles[`counter_${seoOkTitle}`]}`}>/ 60–70</span>
              </div>
            </div>

            <input
              className={styles.input}
              value={seo.metaTitle}
              onChange={(e) => setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))}
              placeholder={page!.title || "Tiêu đề…"}
            />
          </div>

          <div className={styles.threeCol}>
            <div className={styles.field}>
              <label className={styles.label}>OG Title</label>
              <input
                className={styles.input}
                value={seo.ogTitle}
                onChange={(e) => setSeo((prev) => ({ ...prev, ogTitle: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Twitter Card</label>
              <select
                className={styles.select}
                value={seo.twitterCard}
                onChange={(e) => setSeo((prev) => ({ ...prev, twitterCard: e.target.value as SEO["twitterCard"] }))}
              >
                <option value="summary_large_image">summary_large_image</option>
                <option value="summary">summary</option>
              </select>
            </div>

            <div className={styles.checkRow}>
              <label className={styles.label}>Chooses</label>
              <div className={styles.dFlex}>
                <label className={styles.check}>
                  <input
                    className={styles.checkInput}
                    type="checkbox"
                    checked={!!seo.noindex}
                    onChange={(e) => setSeo((prev) => ({ ...prev, noindex: e.target.checked }))}
                  />
                  <span className={styles.checkText}>noindex</span>
                </label>

                <label className={styles.check}>
                  <input
                    className={styles.checkInput}
                    type="checkbox"
                    checked={!!seo.nofollow}
                    onChange={(e) => setSeo((prev) => ({ ...prev, nofollow: e.target.checked }))}
                  />
                  <span className={styles.checkText}>nofollow</span>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldTop}>
              <label className={styles.label}>Meta Description</label>
              <div className={styles.counter}>
                <span className={styles.counterNum}>{descLen}</span>
                <span className={`${styles.counterHint} ${styles[`counter_${seoOkDesc}`]}`}>/ 150–160</span>
              </div>
            </div>

            <textarea
              className={styles.textarea}
              rows={3}
              value={seo.metaDescription}
              onChange={(e) => setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))}
              placeholder="Mô tả ngắn gọn, hấp dẫn…"
            />
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Keywords (optional)</label>
              <input
                className={styles.input}
                value={seo.keywords}
                onChange={(e) => setSeo((prev) => ({ ...prev, keywords: e.target.value }))}
                placeholder="zento, builder, landing page…"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Canonical URL</label>
              <input
                className={styles.input}
                value={seo.canonicalUrl}
                onChange={(e) => setSeo((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
                placeholder="https://example.com/your-page"
              />
            </div>
          </div>

          <div className={styles.hr} />

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>OG Title</label>
              <input
                className={styles.input}
                value={seo.ogTitle}
                onChange={(e) => setSeo((prev) => ({ ...prev, ogTitle: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Twitter Card</label>
              <select
                className={styles.select}
                value={seo.twitterCard}
                onChange={(e) => setSeo((prev) => ({ ...prev, twitterCard: e.target.value as SEO["twitterCard"] }))}
              >
                <option value="summary_large_image">summary_large_image</option>
                <option value="summary">summary</option>
              </select>
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>OG Description</label>
              <input
                className={styles.input}
                value={seo.ogDescription}
                onChange={(e) => setSeo((prev) => ({ ...prev, ogDescription: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <div className={styles.fieldTop}>
                <label className={styles.label}>OG Image URL</label>
                <span className={styles.helper}>Khuyến nghị 1200×630px, &lt; 1MB</span>
              </div>
              <input
                className={styles.input}
                value={seo.ogImage}
                onChange={(e) => setSeo((prev) => ({ ...prev, ogImage: e.target.value }))}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className={styles.hr} />

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Sitemap Changefreq</label>
              <select
                className={styles.select}
                value={seo.sitemapChangefreq}
                onChange={(e) =>
                  setSeo((prev) => ({ ...prev, sitemapChangefreq: e.target.value as SEO["sitemapChangefreq"] }))
                }
              >
                <option value="always">always</option>
                <option value="hourly">hourly</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
                <option value="never">never</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Sitemap Priority</label>
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

          <div className={styles.field}>
            <label className={styles.label}>Structured Data (JSON-LD)</label>
            <textarea
              className={styles.textarea}
              rows={3}
              value={seo.structuredData}
              onChange={(e) => setSeo((prev) => ({ ...prev, structuredData: e.target.value }))}
              placeholder='{"@context":"https://schema.org","@type":"WebPage","name":"..."}'
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default React.memo(PageInspector);

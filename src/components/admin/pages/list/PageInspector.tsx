"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/pages/PageInspector.module.css";
import type { PageRow, SEO } from "@/lib/page/types";
import { buildAutoSEO } from "@/lib/page/seo-utils";

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

const LOCALE_PREFIX = /^\/(vi|en|ja)(?=\/|$)/i;

function stripLocalePrefix(p?: string | null) {
  if (!p) return "";
  const s = p.trim();
  return s.replace(LOCALE_PREFIX, "") || "/";
}

export default function PageInspector({ page, onEdit, onPreview, onPublish, onUnpublish, onDuplicate, onDelete, initialSeo = null }: Props) {
  const hasPage = !!page;

  const [seo, setSeo] = useState<SEO>(() => ({
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
  }));
  const [savingSEO, setSavingSEO] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (!page) return;
    setSeo((prev) => ({
      ...prev,
      metaTitle: prev.metaTitle || page.title || "",
      ogTitle: prev.ogTitle || page.title || "",
    }));
  }, [page?.id]);

  const pathPretty = useMemo(() => {
    if (!page) return "";
    return stripLocalePrefix(page.path || "");
  }, [page?.path]);

  useEffect(() => {
    if (!page?.id || initialSeo) return;
    let stop = false;
    const pageId = page.id;

    (async () => {
      try {
        const r = await fetch(`/api/admin/pages/${pageId}/seo`);
        if (r.ok) {
          const data = await r.json();
          if (!stop && data?.seo) setSeo((prev) => ({ ...prev, ...data.seo }));
        } else if (r.status === 404) {
          const rp = await fetch(`/api/admin/pages/${pageId}`);
          if (rp.ok) {
            const d = await rp.json();
            if (!stop && d?.page?.seo) setSeo((prev) => ({ ...prev, ...d.page.seo }));
          }
        }
      } catch {}
    })();

    return () => {
      stop = true;
    };
  }, [page?.id, initialSeo]);

  const metaLen = (seo.metaTitle || "").length;
  const descLen = (seo.metaDescription || "").length;

  const handleAutoSEO = () => {
    if (!page) return;
    const suggestion = buildAutoSEO({
      title: page.title || seo.metaTitle || "Trang mới",
      path: pathPretty,
      locale: page.locale as any,
    });
    setSeo((prev) => ({
      ...prev,
      ...suggestion,
      ogTitle: suggestion.metaTitle || prev.ogTitle,
    }));
  };

  const handleSaveSEO = async () => {
    if (!page?.id) return;
    try {
      setSavingSEO(true);

      const trySeo = await fetch(`/api/admin/pages/${page.id}/seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo }),
      });

      if (trySeo.ok) {
        setFlash("Đã lưu SEO");
        setTimeout(() => setFlash(""), 1400);
        return;
      }
      if (trySeo.status !== 404) throw new Error("Save SEO failed");

      type PageDetail = {
        page?: {
          id: string;
          locale: "vi" | "en" | "ja";
          title: string;
          slug: string;
          path: string;
          blocks: Array<{ kind: string; props: Record<string, any> }>;
        };
      };

      const detailRes = await fetch(`/api/admin/pages/${page.id}`);
      if (!detailRes.ok) throw new Error("Load page detail failed");
      const detailJson: PageDetail = await detailRes.json();
      const blocks = detailJson?.page?.blocks ?? [];

      const res = await fetch(`/api/admin/pages/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: page.id,
          locale: page.locale,
          title: page.title,
          slug: page.slug,
          path: page.path,
          blocks,
          seo,
        }),
      });
      if (!res.ok) throw new Error("Save SEO failed");

      setFlash("Đã lưu SEO");
      setTimeout(() => setFlash(""), 1400);
    } catch (e: any) {
      setFlash(e?.message || "Save SEO error");
      setTimeout(() => setFlash(""), 1800);
    } finally {
      setSavingSEO(false);
    }
  };

  const seoOkTitle = metaLen <= 60 ? "good" : metaLen <= 70 ? "warn" : "bad";
  const seoOkDesc = descLen <= 160 ? "good" : descLen <= 180 ? "warn" : "bad";

  const jsonLdStatus = (() => {
    try {
      if (!seo.structuredData?.trim()) return "empty";
      JSON.parse(seo.structuredData);
      return "valid";
    } catch {
      return "invalid";
    }
  })();

  return (
    <section className={styles.rightPane}>
      {hasPage ? (
        <header className={styles.detailHead}>
          <div className={styles.detailInfo}>
            <h2 className={styles.detailTitle}>{page!.title || "(untitled)"}</h2>

            <div className={styles.kv}>
              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>Status</span>
                <span className={`${styles.badge} ${page!.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}>{page!.status}</span>
              </div>

              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>Updated</span>
                <span className={styles.kvValue}>{new Date(page!.updatedAt || page!.createdAt || Date.now()).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button className={styles.primaryBtn} type="button" onClick={onEdit}>
              <i className={`bi bi-pencil-square ${styles.iconLeft}`} />
              Edit
            </button>

            <button className={styles.ghostBtn} type="button" onClick={onPreview}>
              <i className={`bi bi-box-arrow-up-right ${styles.iconLeft}`} />
              Preview
            </button>

            {page!.status === "PUBLISHED" ? (
              <button className={styles.ghostBtn} type="button" onClick={onUnpublish}>
                <i className={`bi bi-eye-slash ${styles.iconLeft}`} />
                Unpublish
              </button>
            ) : (
              <button className={styles.ghostBtn} type="button" onClick={onPublish}>
                <i className={`bi bi-upload ${styles.iconLeft}`} />
                Publish
              </button>
            )}

            <button className={styles.ghostBtn} type="button" onClick={onDuplicate}>
              <i className={`bi bi-layers ${styles.iconLeft}`} />
              Duplicate
            </button>

            <button className={styles.dangerBtn} type="button" onClick={onDelete}>
              <i className={`bi bi-trash ${styles.iconLeft}`} />
              Delete
            </button>
          </div>
        </header>
      ) : (
        <div className={styles.rightEmpty}>
          <i className={`bi bi-layout-sidebar-inset ${styles.emptyIcon}`} />
          <p className={styles.emptyText}>Chọn một trang ở danh sách bên trái để chỉnh Settings & SEO.</p>
        </div>
      )}

      {flash && (
        <div className={styles.notice} role="status" aria-live="polite">
          <i className={`bi bi-info-circle ${styles.iconLeft}`} />
          <span>{flash}</span>
        </div>
      )}

      {hasPage && (
        <>
          <div className={styles.card}>
            <div className={styles.cardTitle}>SEO</div>

            {/* Meta Title */}
            <div className={styles.field}>
              <div className={styles.fieldTop}>
                <label className={styles.label}>Meta Title</label>
                <div className={styles.counter}>
                  <span className={styles.counterNum}>{metaLen}</span>
                  <span className={`${styles.counterHint} ${styles[`counter_${seoOkTitle}`]}`}>/ 60–70</span>
                </div>
              </div>

              <input className={styles.input} value={seo.metaTitle} onChange={(e) => setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))} placeholder={page!.title || "Tiêu đề…"} />
            </div>

            {/* Meta Description */}
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

            {/* Keywords & Canonical */}
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>Keywords (optional)</label>
                <input className={styles.input} value={seo.keywords} onChange={(e) => setSeo((prev) => ({ ...prev, keywords: e.target.value }))} placeholder="zento, builder, landing page…" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Canonical URL</label>
                <input
                  className={styles.input}
                  value={seo.canonicalUrl}
                  onChange={(e) => setSeo((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
                  placeholder="https://example.com/vi/your-page"
                />
              </div>
            </div>

            {/* Index flags */}
            <div className={styles.checkRow}>
              <label className={styles.check}>
                <input className={styles.checkInput} type="checkbox" checked={!!seo.noindex} onChange={(e) => setSeo((prev) => ({ ...prev, noindex: e.target.checked }))} />
                <span className={styles.checkText}>noindex</span>
              </label>

              <label className={styles.check}>
                <input className={styles.checkInput} type="checkbox" checked={!!seo.nofollow} onChange={(e) => setSeo((prev) => ({ ...prev, nofollow: e.target.checked }))} />
                <span className={styles.checkText}>nofollow</span>
              </label>
            </div>

            <div className={styles.hr} />

            {/* OG */}
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>OG Title</label>
                <input className={styles.input} value={seo.ogTitle} onChange={(e) => setSeo((prev) => ({ ...prev, ogTitle: e.target.value }))} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Twitter Card</label>
                <select className={styles.select} value={seo.twitterCard} onChange={(e) => setSeo((prev) => ({ ...prev, twitterCard: e.target.value as SEO["twitterCard"] }))}>
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="summary">summary</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>OG Description</label>
              <input className={styles.input} value={seo.ogDescription} onChange={(e) => setSeo((prev) => ({ ...prev, ogDescription: e.target.value }))} />
            </div>

            <div className={styles.field}>
              <div className={styles.fieldTop}>
                <label className={styles.label}>OG Image URL</label>
                <span className={styles.helper}>Khuyến nghị 1200×630px, &lt; 1MB</span>
              </div>
              <input className={styles.input} value={seo.ogImage} onChange={(e) => setSeo((prev) => ({ ...prev, ogImage: e.target.value }))} placeholder="https://…" />
            </div>

            <div className={styles.hr} />

            {/* Sitemap */}
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>Sitemap Changefreq</label>
                <select className={styles.select} value={seo.sitemapChangefreq} onChange={(e) => setSeo((prev) => ({ ...prev, sitemapChangefreq: e.target.value as SEO["sitemapChangefreq"] }))}>
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
                    const v = Math.max(0, Math.min(1, Number(e.target.value)));
                    setSeo((prev) => ({ ...prev, sitemapPriority: Number.isFinite(v) ? v : 0.7 }));
                  }}
                />
              </div>
            </div>

            {/* JSON-LD */}
            <div className={styles.field}>
              <label className={styles.label}>Structured Data (JSON-LD)</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={seo.structuredData}
                onChange={(e) => setSeo((prev) => ({ ...prev, structuredData: e.target.value }))}
                placeholder='{"@context":"https://schema.org","@type":"WebPage","name":"..."}'
              />

              <div className={styles.jsonHint}>
                {jsonLdStatus === "empty" && <span className={styles.jsonMuted}>Không bắt buộc</span>}
                {jsonLdStatus === "valid" && <span className={styles.jsonOk}>JSON hợp lệ</span>}
                {jsonLdStatus === "invalid" && <span className={styles.jsonBad}>JSON không hợp lệ</span>}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.footerActions}>
              <button className={styles.ghostBtn} type="button" onClick={handleAutoSEO}>
                <i className={`bi bi-magic ${styles.iconLeft}`} />
                Autocomplete
              </button>

              <button className={styles.primaryBtn} type="button" onClick={handleSaveSEO} disabled={savingSEO}>
                {savingSEO ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>Save SEO</>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/page/page.module.css";
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

export default function PageInspector({ page, onEdit, onPreview, onPublish, onUnpublish, onDuplicate, onDelete, initialSeo = null }: Props) {
  const hasPage = !!page;

  // ===== SEO state (khởi tạo ổn định, không phụ thuộc early-return)
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

  // Khi đổi trang, đồng bộ title cơ bản nếu trống
  useEffect(() => {
    if (!page) return;
    setSeo((prev) => ({
      ...prev,
      metaTitle: prev.metaTitle || page.title || "",
      ogTitle: prev.ogTitle || page.title || "",
    }));
  }, [page?.id]); // dùng optional chaining

  // Path hiển thị
  const pathPretty = useMemo(() => {
    if (!page) return "";
    return page.path || `/${page.locale}${page.slug ? `/${page.slug}` : ""}`;
  }, [page?.path, page?.locale, page?.slug]);

  // Fetch SEO nếu chưa có initialSeo
  useEffect(() => {
    if (!page?.id || initialSeo) return;
    let stop = false;
    const pageId = page.id;

    (async () => {
      try {
        const r = await fetch(`/api/pages/${pageId}/seo`);
        if (r.ok) {
          const data = await r.json();
          if (!stop && data?.seo) setSeo((prev) => ({ ...prev, ...data.seo }));
        } else if (r.status === 404) {
          // fallback (tuỳ backend): thử GET /api/pages/:id và lấy page.seo nếu có
          const rp = await fetch(`/api/pages/${pageId}`);
          if (rp.ok) {
            const d = await rp.json();
            if (!stop && d?.page?.seo) setSeo((prev) => ({ ...prev, ...d.page.seo }));
          }
        }
      } catch {
        /* ignore */
      }
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

      // 1) Thử endpoint SEO chuyên biệt trước
      const trySeo = await fetch(`/api/pages/${page.id}/seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo }),
      });

      if (trySeo.ok) {
        setFlash("Đã lưu SEO");
        setTimeout(() => setFlash(""), 1400);
        return;
      }
      if (trySeo.status !== 404) {
        throw new Error("Save SEO failed");
      }

      // 2) Fallback: cần đủ payload cho /save → fetch chi tiết để lấy blocks
      //    (vì PageRow không có 'blocks')
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

      const detailRes = await fetch(`/api/pages/${page.id}`);
      if (!detailRes.ok) throw new Error("Load page detail failed");
      const detailJson: PageDetail = await detailRes.json();
      const blocks = detailJson?.page?.blocks ?? [];

      // 3) POST /save với đủ field
      const res = await fetch(`/api/pages/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: page.id,
          locale: page.locale,
          title: page.title,
          slug: page.slug,
          path: page.path,
          blocks,
          seo, // server map sang các trường SEO đã thêm
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

  return (
    <section className={styles.rightPane}>
      {/* Header: luôn render để giữ cấu trúc ổn định */}
      {hasPage ? (
        <header className={styles.detailHead}>
          <div>
            <h2 className={styles.title}>{page!.title || "(untitled)"}</h2>
            <div className={styles.kv}>
              <div>Locale:{page!.locale}</div>
              <div>
                Status: <span className={`${styles.badge} ${page!.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}>{page!.status}</span>
              </div>
              <div>Updated: {new Date(page!.updatedAt || page!.createdAt || Date.now()).toLocaleString()}</div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button className={styles.primaryBtn} onClick={onEdit}>
              <i className="bi bi-pencil-square me-1" />
              Edit
            </button>
            <button className={styles.ghostBtn} onClick={onPreview}>
              <i className="bi bi-box-arrow-up-right me-1" />
              Preview
            </button>
            {page!.status === "PUBLISHED" ? (
              <button className={styles.ghostBtn} onClick={onUnpublish}>
                <i className="bi bi-eye-slash me-1" />
                Unpublish
              </button>
            ) : (
              <button className={styles.ghostBtn} onClick={onPublish}>
                <i className="bi bi-upload me-1" />
                Publish
              </button>
            )}
            <button className={styles.ghostBtn} onClick={onDuplicate}>
              <i className="bi bi-layers me-1" />
              Duplicate
            </button>
            <button className={styles.dangerBtn} onClick={onDelete}>
              <i className="bi bi-trash me-1" />
              Delete
            </button>
          </div>
        </header>
      ) : (
        <div className={styles.rightEmpty}>
          <i className="bi bi-layout-sidebar-inset" />
          <p>Chọn một trang ở danh sách bên trái để chỉnh Settings & SEO.</p>
        </div>
      )}

      {flash && (
        <div className="alert alert-warning py-2 px-3 my-2 small">
          <i className="bi bi-info-circle me-1" /> {flash}
        </div>
      )}

      {/* Content chỉ hiện khi có page, nhưng hooks vẫn luôn được gọi ở trên */}
      {hasPage && (
        <>
          <div className={styles.card}>
            <div className={styles.infoGrid}>
              <div>
                Title: <code className={styles.code}>{page!.title || "(untitled)"}</code>
              </div>
              <div>
                Locale:<code className={styles.code}>{page!.locale}</code>
              </div>
              <div className="d-flex align-items-center gap-2">
                Path: <code className={styles.code}>{pathPretty}</code>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>SEO</div>

            {/* Meta Title */}
            <div className="mb-2">
              <div className="d-flex align-items-center justify-content-between">
                <label className="fw-semibold font-13">Meta Title</label>
                <span className="small text-secondary">
                  {metaLen} <span className={metaLen <= 60 ? "text-success" : metaLen <= 70 ? "text-warning" : "text-danger"}>/ 60–70</span>
                </span>
              </div>
              <input className="form-control" value={seo.metaTitle} onChange={(e) => setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))} placeholder={page!.title || "Tiêu đề…"} />
            </div>

            {/* Meta Description */}
            <div className="mb-2">
              <div className="d-flex align-items-center justify-content-between">
                <label className="fw-semibold font-13">Meta Description</label>
                <span className="small text-secondary">
                  {descLen} <span className={descLen <= 160 ? "text-success" : descLen <= 180 ? "text-warning" : "text-danger"}>/ 150–160</span>
                </span>
              </div>
              <textarea
                className="form-control"
                rows={3}
                value={seo.metaDescription}
                onChange={(e) => setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Mô tả ngắn gọn, hấp dẫn…"
              />
            </div>

            {/* Keywords & Canonical */}
            <div className="row g-2">
              <div className="col-md-6">
                <label className="fw-semibold font-13">Keywords (optional)</label>
                <input className="form-control" value={seo.keywords} onChange={(e) => setSeo((prev) => ({ ...prev, keywords: e.target.value }))} placeholder="zento, builder, landing page…" />
              </div>
              <div className="col-md-6">
                <label className="fw-semibold font-13">Canonical URL</label>
                <input
                  className="form-control"
                  value={seo.canonicalUrl}
                  onChange={(e) => setSeo((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
                  placeholder="https://example.com/vi/your-page"
                />
              </div>
            </div>

            {/* Index flags */}
            <div className="d-flex gap-3 mt-2">
              <label className="form-check">
                <input className="form-check-input" type="checkbox" checked={!!seo.noindex} onChange={(e) => setSeo((prev) => ({ ...prev, noindex: e.target.checked }))} />
                <span className="ms-2">noindex</span>
              </label>
              <label className="form-check">
                <input className="form-check-input" type="checkbox" checked={!!seo.nofollow} onChange={(e) => setSeo((prev) => ({ ...prev, nofollow: e.target.checked }))} />
                <span className="ms-2">nofollow</span>
              </label>
            </div>

            {/* OG */}
            <hr />
            <div className="none">
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="fw-semibold font-13">OG Title</label>
                  <input className="form-control" value={seo.ogTitle} onChange={(e) => setSeo((prev) => ({ ...prev, ogTitle: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="fw-semibold font-13">Twitter Card</label>
                  <select className="form-select" value={seo.twitterCard} onChange={(e) => setSeo((prev) => ({ ...prev, twitterCard: e.target.value as SEO["twitterCard"] }))}>
                    <option value="summary_large_image">summary_large_image</option>
                    <option value="summary">summary</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="fw-semibold font-13">OG Description</label>
                  <input className="form-control" value={seo.ogDescription} onChange={(e) => setSeo((prev) => ({ ...prev, ogDescription: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="fw-semibold font-13">OG Image URL</label>
                  <input className="form-control" value={seo.ogImage} onChange={(e) => setSeo((prev) => ({ ...prev, ogImage: e.target.value }))} placeholder="https://…" />
                  <div className="form-text">Khuyến nghị 1200×630px, &lt; 1MB</div>
                </div>
              </div>

              {/* Sitemap */}
              <hr />
            </div>
            <div className="row g-2">
              <div className="col-md-6">
                <label className="fw-semibold">Sitemap Changefreq</label>
                <select className="form-select" value={seo.sitemapChangefreq} onChange={(e) => setSeo((prev) => ({ ...prev, sitemapChangefreq: e.target.value as SEO["sitemapChangefreq"] }))}>
                  <option value="always">always</option>
                  <option value="hourly">hourly</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                  <option value="never">never</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="fw-semibold">Sitemap Priority</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={1}
                  className="form-control"
                  value={seo.sitemapPriority}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(1, Number(e.target.value)));
                    setSeo((prev) => ({ ...prev, sitemapPriority: Number.isFinite(v) ? v : 0.7 }));
                  }}
                />
              </div>
            </div>

            {/* JSON-LD */}
            <div className="mt-2">
              <label className="fw-semibold">Structured Data (JSON-LD)</label>
              <textarea
                className="form-control"
                rows={3}
                value={seo.structuredData}
                onChange={(e) => setSeo((prev) => ({ ...prev, structuredData: e.target.value }))}
                placeholder='{"@context":"https://schema.org","@type":"WebPage","name":"..."}'
              />
              <div className="small mt-1">
                {(() => {
                  try {
                    if (!seo.structuredData?.trim()) return <span className="text-secondary">Không bắt buộc</span>;
                    JSON.parse(seo.structuredData);
                    return <span className="text-success fw-semibold">JSON hợp lệ</span>;
                  } catch {
                    return <span className="text-danger fw-semibold">JSON không hợp lệ</span>;
                  }
                })()}
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 mt-3">
              <button className={styles.ghostBtn} onClick={handleAutoSEO}>
                <i className="bi bi-magic me-1" />
                Autocomplete
              </button>
              <button className={styles.primaryBtn} onClick={handleSaveSEO} disabled={savingSEO}>
                {savingSEO ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving…
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

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/builder/pages/PageInspector.module.css";
import { API_ROUTES } from "@/constants/api";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";
import { fillAutoSEO, PageRow, SEO } from "@/lib/builder/pages/types";
import { useSiteStore } from "@/store/site/site.store";

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

function ensureLeadingSlash(p?: string | null) {
  if (!p) return "/";
  const s = p.trim();
  return s.startsWith("/") ? s : `/${s}`;
}

function normalizeSlug(raw?: string | null) {
  const s = (raw || "").trim();
  if (!s || s === "/") return "/";
  return s.replace(/^\/+/, "").replace(/\/+$/, "");
}

function buildPathFromSlug(slug: string) {
  const cleaned = normalizeSlug(slug);
  return cleaned === "/" ? "/" : `/${cleaned}`;
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

  const [syncOpen, setSyncOpen] = useState(false);
  const [syncingPage, setSyncingPage] = useState(false);
  const [syncForm, setSyncForm] = useState<SyncForm>({
    siteId: "",
    title: "",
    slug: "",
    path: "/",
  });

  const lastLoadedPageIdRef = useRef<string | null>(null);

  const sites = useSiteStore((state) => state.sites);
  const sitesLoading = useSiteStore((state) => state.loading);
  const sitesErr = useSiteStore((state) => state.err);
  const selectedSiteId = useSiteStore((state) => state.siteId);
  const setSelectedSiteId = useSiteStore((state) => state.setSiteId);
  const hydrateFromStorage = useSiteStore((state) => state.hydrateFromStorage);
  const loadSites = useSiteStore((state) => state.loadSites);

  const selectedSite = useMemo(() => {
    return sites.find((site) => site.id === selectedSiteId) ?? null;
  }, [sites, selectedSiteId]);

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
    hydrateFromStorage();
    void loadSites();
  }, [hydrateFromStorage, loadSites]);

  useEffect(() => {
    if (!page?.id) {
      lastLoadedPageIdRef.current = null;
      setSeo(buildDefaultSEO(null, null));
      return;
    }

    setSeo(buildDefaultSEO(page, hasMeaningfulSeo(initialSeo) ? initialSeo : null));
    lastLoadedPageIdRef.current = null;
  }, [page?.id, initialSeo, page]);

  useEffect(() => {
    if (!page?.id) return;

    if (hasMeaningfulSeo(initialSeo)) {
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

        if (data?.seo) {
          setSeo((prev) => ({
            ...prev,
            ...data.seo,
          }));
        }

        lastLoadedPageIdRef.current = pageId;
      } catch (e) {
        console.error("Load SEO error:", e);
      }
    })();

    return () => controller.abort();
  }, [page?.id, initialSeo, modal]);

  useEffect(() => {
    if (!page?.id) return;

    setSeo((prev) => ({
      ...prev,
      metaTitle: prev.metaTitle || page.title || "",
      ogTitle: prev.ogTitle || page.title || "",
    }));
  }, [page?.id, page?.title]);

  const metaLen = (seo.metaTitle || "").length;
  const descLen = (seo.metaDescription || "").length;

  const seoOkTitle = metaLen <= 60 ? "good" : metaLen <= 70 ? "warn" : "bad";
  const seoOkDesc = descLen <= 160 ? "good" : descLen <= 180 ? "warn" : "bad";

  const openSyncModal = useCallback(() => {
    const fallbackSiteId = selectedSiteId || sites[0]?.id || "";

    setSyncForm({
      siteId: fallbackSiteId,
      title: page?.title || "",
      slug: normalizeSlug(page?.slug || page?.path || ""),
      path: ensureLeadingSlash(page?.path || buildPathFromSlug(page?.slug || "")),
    });

    setSyncOpen(true);
  }, [page, selectedSiteId, sites]);

  const closeSyncModal = useCallback(() => {
    if (syncingPage) return;
    setSyncOpen(false);
  }, [syncingPage]);

  const handleSyncFormChange = useCallback((field: keyof SyncForm, value: string) => {
    setSyncForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "siteId") {
        next.siteId = value;
      }

      if (field === "slug") {
        const slug = normalizeSlug(value);
        next.slug = slug;
        next.path = buildPathFromSlug(slug);
      }

      if (field === "path") {
        next.path = ensureLeadingSlash(value);
      }

      return next;
    });
  }, []);

  const handleSiteChange = useCallback(
    (siteId: string) => {
      setSelectedSiteId(siteId);
      handleSyncFormChange("siteId", siteId);
    },
    [setSelectedSiteId, handleSyncFormChange],
  );

  const handleAutoSEO = useCallback(() => {
    if (!page?.id) return;

    const { seo: nextSeo } = fillAutoSEO({
      title: page.title || "Trang mới",
      path: page.path || "/",
    });

    setSeo((prev) => ({
      ...prev,
      ...nextSeo,
    }));

    modal.success("Success", "Đã autocomplete SEO");
  }, [page, modal]);

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

  const handleSyncFromMenu = useCallback(async () => {
    try {
      const siteId = syncForm.siteId.trim();
      const title = syncForm.title.trim();
      const slug = normalizeSlug(syncForm.slug);
      const path = ensureLeadingSlash(syncForm.path);

      if (!siteId) {
        modal.error("Thiếu site", "Vui lòng chọn site.");
        return;
      }

      if (!title) {
        modal.error("Thiếu title", "Vui lòng nhập title.");
        return;
      }

      if (!slug) {
        modal.error("Thiếu slug", "Vui lòng nhập slug.");
        return;
      }

      setSyncingPage(true);

      const res = await fetch(API_ROUTES.ADMIN_BUILDER_PAGE_SYNC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          items: [
            {
              title,
              slug,
              path,
            },
          ],
        }),
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Sync page failed");
      }

      modal.success("Success", "Đã sync page từ menu thành công.");
      setSyncOpen(false);
    } catch (e: unknown) {
      modal.error("Error", (e as Error)?.message || "Sync page error");
    } finally {
      setSyncingPage(false);
    }
  }, [syncForm, modal]);

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
      F5: () => {
        openSyncModal();
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

  return (
    <>
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

      {syncOpen && (
        <div className={styles.overlay} onClick={closeSyncModal}>
          <div
            className={styles.syncModal}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={styles.syncHead}>
              <h3 className={styles.syncTitle}>Sync page from menu (F5)</h3>
              <button type="button" className={styles.iconBtn} onClick={closeSyncModal} disabled={syncingPage}>
                ✕
              </button>
            </div>

            <div className={styles.syncBody}>
              <div className={styles.field}>
                <label className={styles.label}>Site</label>
                <select
                  className={styles.select}
                  value={syncForm.siteId}
                  onChange={(e) => handleSiteChange(e.target.value)}
                  disabled={sitesLoading || syncingPage}
                >
                  <option value="">-- Chọn site --</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name || site.domain || site.id}
                    </option>
                  ))}
                </select>

                {selectedSite && syncForm.siteId ? (
                  <div className={styles.helper}>
                    Selected: {selectedSite.name || "(no name)"} {selectedSite.domain ? `- ${selectedSite.domain}` : ""}
                  </div>
                ) : null}

                {sitesLoading ? <div className={styles.helper}>Đang tải danh sách site...</div> : null}
                {sitesErr ? <div className={styles.helper}>Lỗi tải site: {sitesErr}</div> : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Title</label>
                <input
                  className={styles.input}
                  value={syncForm.title}
                  onChange={(e) => handleSyncFormChange("title", e.target.value)}
                  placeholder="Nhập title"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Slug</label>
                <input
                  className={styles.input}
                  value={syncForm.slug}
                  onChange={(e) => handleSyncFormChange("slug", e.target.value)}
                  placeholder="about-us"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Path</label>
                <input
                  className={styles.input}
                  value={syncForm.path}
                  onChange={(e) => handleSyncFormChange("path", e.target.value)}
                  placeholder="/about-us"
                />
              </div>

              <div className={styles.syncHint}>
                Khi bấm <strong>Create & Sync</strong>, component sẽ gọi:
                <pre className={styles.codeBlock}>
                  {`POST ${API_ROUTES.ADMIN_BUILDER_PAGE_SYNC}
{
  "siteId": "${syncForm.siteId || "your-site-id"}",
  "items": [
    {
      "title": "${syncForm.title || "Your title"}",
      "slug": "${syncForm.slug || "your-slug"}",
      "path": "${syncForm.path || "/your-path"}"
    }
  ]
}`}
                </pre>
              </div>
            </div>

            <div className={styles.syncFoot}>
              <button type="button" className={styles.secondaryBtn} onClick={closeSyncModal} disabled={syncingPage}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => void handleSyncFromMenu()}
                disabled={syncingPage || sitesLoading}
              >
                {syncingPage ? "Syncing..." : "Create & Sync"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(PageInspector);

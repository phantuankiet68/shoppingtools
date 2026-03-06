"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import cls from "@/styles/admin/commerce/brand/brand.module.css";
import { useSiteStore } from "@/store/site/site.store";

type SiteOption = {
  id: string;
  name?: string;
  domain?: string;
};

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  siteId: string;
  description?: string | null;
  logoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  site?: SiteOption | null;
};

type ApiListResponse = {
  items?: BrandRow[];
};

type ApiError = {
  error?: string;
};

const BRAND_API = "/api/admin/commerce/products/brands";

function slugify(input: string) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminBrandCrudPage() {
  const sites = useSiteStore((s) => s.sites);
  const sitesLoading = useSiteStore((s) => s.loading);
  const sitesErr = useSiteStore((s) => s.err);
  const selectedSiteId = useSiteStore((s) => s.siteId);
  const setSelectedSiteId = useSiteStore((s) => s.setSiteId);
  const hydrateFromStorage = useSiteStore((s) => s.hydrateFromStorage);
  const loadSites = useSiteStore((s) => s.loadSites);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [items, setItems] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const derivedSlug = useMemo(() => {
    return slug.trim() ? slugify(slug) : slugify(name);
  }, [slug, name]);

  useEffect(() => {
    hydrateFromStorage();
    loadSites();
  }, [hydrateFromStorage, loadSites]);

  useEffect(() => {
    if (!selectedSiteId && sites.length > 0) {
      setSelectedSiteId(sites[0].id);
    }
  }, [selectedSiteId, sites, setSelectedSiteId]);

  async function loadBrands() {
    setLoading(true);
    setMsg(null);

    try {
      const params = new URLSearchParams();

      if (q.trim()) params.set("q", q.trim());
      if (selectedSiteId?.trim()) params.set("siteId", selectedSiteId.trim());

      const url = params.toString() ? `${BRAND_API}?${params.toString()}` : BRAND_API;

      const r = await fetch(url, {
        cache: "no-store",
        credentials: "include",
      });

      const text = await r.text();

      if (!r.ok) {
        let errMsg = `Load failed (${r.status})`;
        try {
          const json = JSON.parse(text) as ApiError;
          if (json.error) errMsg = `${errMsg}: ${json.error}`;
        } catch {
          if (text) errMsg = `${errMsg}: ${text.slice(0, 200)}`;
        }
        setItems([]);
        setMsg({ type: "err", text: errMsg });
        return;
      }

      const json = JSON.parse(text) as ApiListResponse;
      setItems(json.items ?? []);
    } catch (error: unknown) {
      setMsg({ type: "err", text: getErrorMessage(error, "Load failed") });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSiteId]);

  async function createBrand() {
    const safeName = name.trim();
    const safeSlug = derivedSlug;
    const siteId = selectedSiteId?.trim();

    if (!safeName) {
      setMsg({ type: "err", text: "Name is required" });
      return;
    }

    if (!safeSlug) {
      setMsg({ type: "err", text: "Slug is required" });
      return;
    }

    if (!siteId) {
      setMsg({ type: "err", text: "Site is required" });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      const body = {
        name: safeName,
        slug: safeSlug,
        siteId,
        description: description.trim() || null,
        logoUrl: logoUrl.trim() || null,
      };

      const r = await fetch(BRAND_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        credentials: "include",
      });

      const text = await r.text();

      if (!r.ok) {
        let errMsg = `Create failed (${r.status})`;
        try {
          const json = JSON.parse(text) as ApiError;
          if (json.error) errMsg = `${errMsg}: ${json.error}`;
        } catch {
          if (text) errMsg = `${errMsg}: ${text.slice(0, 220)}`;
        }
        setMsg({ type: "err", text: errMsg });
        return;
      }

      setMsg({ type: "ok", text: "Brand created successfully" });

      setName("");
      setSlug("");
      setDescription("");
      setLogoUrl("");

      await loadBrands();
    } catch (error: unknown) {
      setMsg({ type: "err", text: getErrorMessage(error, "Create failed") });
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return items;

    return items.filter((b) => {
      return (
        b.name.toLowerCase().includes(kw) ||
        b.slug.toLowerCase().includes(kw) ||
        (b.description || "").toLowerCase().includes(kw) ||
        (b.site?.domain || "").toLowerCase().includes(kw) ||
        (b.site?.name || "").toLowerCase().includes(kw) ||
        b.siteId.toLowerCase().includes(kw)
      );
    });
  }, [items, q]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const withLogoCount = filtered.filter((b) => !!b.logoUrl).length;

  return (
    <div className={cls.page}>
      <div className={cls.bgOrbA} />
      <div className={cls.bgOrbB} />

      <div className={cls.shell}>
        <header className={cls.hero}>
          <div className={cls.heroLeft}>
            <div className={cls.eyebrow}>
              <span className={cls.eyebrowDot} />
              Commerce admin
            </div>
          </div>

          <div className={cls.heroRight}>
            <button className={cls.secondaryBtn} type="button" onClick={loadBrands} disabled={loading}>
              <i className={`bi bi-arrow-clockwise ${loading ? cls.spin : ""}`} />
              <span>Sync data</span>
            </button>
          </div>
        </header>

        {msg && (
          <div className={`${cls.alert} ${msg.type === "ok" ? cls.alertOk : cls.alertErr}`}>
            <i className={`bi ${msg.type === "ok" ? "bi-check2-circle" : "bi-exclamation-octagon"}`} />
            <span>{msg.text}</span>
          </div>
        )}

        <div className={cls.layout}>
          <aside className={cls.sidebar}>
            <div className={cls.composeCard}>
              <div className={cls.composeGlow} />

              <div className={cls.composeHead}>
                <div>
                  <div className={cls.composeTitle}>Create new brand</div>
                </div>

                <div className={cls.composeIcon}>
                  <i className="bi bi-plus-lg" />
                </div>
              </div>

              <div className={cls.form}>
                <label className={cls.field}>
                  <span className={cls.label}>Site</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-globe2 ${cls.inputIcon}`} />
                    <select
                      className={cls.select}
                      value={selectedSiteId || ""}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      disabled={sitesLoading}
                    >
                      <option value="">{sitesLoading ? "Loading sites..." : "Select site"}</option>
                      {sites.map((s: SiteOption) => (
                        <option key={s.id} value={s.id}>
                          {s.name ?? s.id} ({s.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={cls.helper}>
                    {sitesErr
                      ? `Site error: ${sitesErr}`
                      : selectedSite
                        ? `${selectedSite.name ?? "Site"}${selectedSite.domain ? ` • ${selectedSite.domain}` : ""}`
                        : "Chọn site để tạo brand"}
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>Brand name</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-bookmark-star ${cls.inputIcon}`} />
                    <input
                      className={cls.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Sakura"
                    />
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>Slug</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-link-45deg ${cls.inputIcon}`} />
                    <input
                      className={cls.input}
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder={derivedSlug || "auto-generated"}
                    />
                  </div>
                  <div className={cls.helper}>
                    Final slug: <code className={cls.code}>{derivedSlug || "-"}</code>
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>Description</span>
                  <div className={cls.textareaShell}>
                    <textarea
                      className={cls.textarea}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả ngắn về brand..."
                      rows={4}
                    />
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>Logo URL</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-image ${cls.inputIcon}`} />
                    <input
                      className={cls.input}
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="/uploads/brand.png hoặc https://..."
                    />
                  </div>
                </label>

                {logoUrl.trim() && (
                  <div className={cls.preview}>
                    <div className={cls.previewMedia}>
                      <Image
                        src={logoUrl.trim()}
                        alt="brand preview"
                        fill
                        sizes="96px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div className={cls.previewBody}>
                      <div className={cls.previewTitle}>Live preview</div>
                      <div className={cls.previewText}>
                        Kiểm tra nhanh độ nét, khoảng trắng và khả năng hiển thị của logo.
                      </div>
                    </div>
                  </div>
                )}

                <button className={cls.primaryBtn} type="button" onClick={createBrand} disabled={saving}>
                  {saving ? (
                    <>
                      <span className={cls.buttonSpinner} />
                      <span>Creating brand...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-stars" />
                      <span>Create brand</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>

          <section className={cls.workspace}>
            <div className={cls.workspaceCard}>
              <div className={cls.workspaceHead}>
                <div>
                  <div className={cls.workspaceTitle}>Brand list</div>
                  <div className={cls.workspaceDesc}>
                    Tổng cộng <strong>{filtered.length}</strong> brand
                    {selectedSite ? ` trong ${selectedSite.name ?? selectedSite.id}` : ""}.
                  </div>
                </div>

                <div className={cls.searchWrap}>
                  <i className={`bi bi-search ${cls.searchIcon}`} />
                  <input
                    className={cls.searchInput}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm theo tên, slug, mô tả, domain..."
                  />
                  <button className={cls.searchBtn} type="button" onClick={loadBrands} disabled={loading}>
                    Search
                  </button>
                </div>
              </div>

              {filtered.length === 0 && !loading ? (
                <div className={cls.emptyState}>
                  <div className={cls.emptyArt}>
                    <div className={cls.emptyCircleA} />
                    <div className={cls.emptyCircleB} />
                    <div className={cls.emptyIcon}>
                      <i className="bi bi-bookmark-heart" />
                    </div>
                  </div>
                  <div className={cls.emptyTitle}>Chưa có brand nào phù hợp</div>
                  <div className={cls.emptyText}>
                    Hãy tạo brand đầu tiên ở khung bên trái hoặc thử thay đổi từ khóa tìm kiếm.
                  </div>
                </div>
              ) : (
                <div className={cls.tableWrap}>
                  <div className={`${cls.row} ${cls.rowHead}`}>
                    <div>Brand</div>
                    <div>Slug</div>
                    <div>Site</div>
                    <div>Created</div>
                  </div>

                  {loading ? (
                    <div className={cls.loadingBox}>
                      <div className={cls.loadingBar} />
                      <div className={cls.loadingBar} />
                      <div className={cls.loadingBar} />
                    </div>
                  ) : (
                    filtered.map((b) => (
                      <div key={b.id} className={cls.row}>
                        <div className={cls.brandCell}>
                          <div className={cls.brandAvatar}>
                            {b.logoUrl ? (
                              <Image src={b.logoUrl} alt={b.name} fill sizes="52px" style={{ objectFit: "contain" }} />
                            ) : (
                              <div className={cls.brandFallback}>
                                <i className="bi bi-image" />
                              </div>
                            )}
                          </div>

                          <div className={cls.brandBody}>
                            <div className={cls.brandTop}>
                              <div className={cls.brandName}>{b.name}</div>
                              <span className={cls.badge}>#{b.id.slice(0, 8)}</span>
                            </div>
                            <div className={cls.brandMeta}>
                              {b.description?.trim() ? b.description : "Chưa có mô tả cho thương hiệu này."}
                            </div>
                          </div>
                        </div>

                        <div className={cls.slugCell}>
                          <code className={cls.code}>/{b.slug}</code>
                        </div>

                        <div className={cls.siteCell}>
                          <div className={cls.siteName}>
                            <i className="bi bi-globe-americas" />
                            <span>{b.site?.name || b.siteId}</span>
                          </div>
                          <div className={cls.siteDomain}>{b.site?.domain || b.siteId}</div>
                        </div>

                        <div className={cls.dateCell}>
                          <div className={cls.dateCreated}>{formatDate(b.createdAt)}</div>
                          <div className={cls.dateSub}>Updated: {formatDate(b.updatedAt)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

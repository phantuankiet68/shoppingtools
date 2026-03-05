"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import cls from "@/styles/admin/product/brand/brand.module.css";

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  siteId: string;
  site?: { id: string; name?: string; domain?: string } | null;
  image?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type SiteRow = {
  id: string;
  name: string;
  domain: string;
  localeDefault?: string;
};

const BRAND_API = "/api/admin/brands";
const SITES_API = "/api/admin/sites";

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

export default function AdminBrandCrudPage() {
  // form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [siteId, setSiteId] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);

  // data
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [items, setItems] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ui
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // auto-derive slug from name if user hasn't typed custom slug
  const derivedSlug = useMemo(() => (slug.trim() ? slugify(slug) : slugify(name)), [slug, name]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // load sites
        const rs = await fetch(SITES_API, { cache: "no-store", credentials: "include" });
        const sj = await rs.json().catch(() => ({}));
        const list: SiteRow[] = sj.items ?? [];
        if (mounted) {
          setSites(list);
          // default site
          if (!siteId && list[0]?.id) setSiteId(list[0].id);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBrands() {
    setLoading(true);
    setMsg(null);

    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const url = params.toString() ? `${BRAND_API}?${params.toString()}` : BRAND_API;

      const r = await fetch(url, { cache: "no-store", credentials: "include" });
      const text = await r.text();

      if (!r.ok) {
        setItems([]);
        setMsg({ type: "err", text: `Load failed (${r.status}): ${text.slice(0, 200)}` });
        return;
      }

      const json = JSON.parse(text);
      const list: BrandRow[] = json.items ?? [];
      setItems(list);
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "Load failed" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createBrand() {
    const safeName = name.trim();
    const safeSlug = derivedSlug;

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
        image: image.trim() || null,
        isActive,
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
        setMsg({ type: "err", text: `Create failed (${r.status}): ${text.slice(0, 220)}` });
        return;
      }

      setMsg({ type: "ok", text: "Brand created" });

      // reset form (keep site)
      setName("");
      setSlug("");
      setImage("");
      setIsActive(true);

      // reload list
      await loadBrands();
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "Create failed" });
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
        (b.site?.domain || "").toLowerCase().includes(kw)
      );
    });
  }, [items, q]);

  return (
    <div className={cls.brandCrudPage}>
      <div className={cls.brandCrudTopbar}>
        <div className={cls.brandCrudTopbarTitle}>
          <i className="bi bi-bookmark-heart" />
          <span>Brands</span>
        </div>

        <button className={cls.brandCrudTopbarBtn} type="button" onClick={loadBrands} disabled={loading}>
          <i className={`bi bi-arrow-clockwise ${loading ? cls.brandCrudSpin : ""}`} />
          Refresh
        </button>
      </div>

      {msg && (
        <div className={`${cls.brandCrudAlert} ${msg.type === "ok" ? cls.brandCrudAlertOk : cls.brandCrudAlertErr}`}>
          <i className={`bi ${msg.type === "ok" ? "bi-check2-circle" : "bi-exclamation-triangle"}`} />
          <span>{msg.text}</span>
        </div>
      )}

      <div className={cls.brandCrudGrid}>
        {/* LEFT: Create Form */}
        <aside className={cls.brandCrudLeft}>
          <div className={cls.brandCrudCard}>
            <div className={cls.brandCrudCardHead}>
              <div className={cls.brandCrudCardTitle}>
                <i className="bi bi-plus-circle" />
                <span>Create new brand</span>
              </div>
              <div className={cls.brandCrudCardHint}>Keep it simple • soft blue theme</div>
            </div>

            <div className={cls.brandCrudForm}>
              <label className={cls.brandCrudField}>
                <span className={cls.brandCrudLabel}>Name</span>
                <input
                  className={cls.brandCrudInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sakura"
                />
              </label>

              <label className={cls.brandCrudField}>
                <span className={cls.brandCrudLabel}>
                  Slug <span className={cls.brandCrudLabelMuted}>(auto from name)</span>
                </span>
                <input
                  className={cls.brandCrudInput}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={derivedSlug || "auto-generated"}
                />
                <div className={cls.brandCrudHelper}>
                  Final: <code className={cls.brandCrudCode}>{derivedSlug || "-"}</code>
                </div>
              </label>

              <label className={cls.brandCrudField}>
                <span className={cls.brandCrudLabel}>Site</span>
                <select className={cls.brandCrudSelect} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.domain}
                    </option>
                  ))}
                </select>
              </label>

              <label className={cls.brandCrudField}>
                <span className={cls.brandCrudLabel}>Image URL</span>
                <input
                  className={cls.brandCrudInput}
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/uploads/...png or https://..."
                />
              </label>

              {image.trim() && (
                <div className={cls.brandCrudPreview}>
                  <div className={cls.brandCrudPreviewImg}>
                    <Image src={image.trim()} alt="brand preview" fill sizes="140px" style={{ objectFit: "contain" }} />
                  </div>
                  <div className={cls.brandCrudPreviewInfo}>
                    <div className={cls.brandCrudPreviewTitle}>Preview</div>
                    <div className={cls.brandCrudPreviewSub}>Check image ratio & background</div>
                  </div>
                </div>
              )}

              <label className={cls.brandCrudToggle}>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span className={cls.brandCrudToggleText}>
                  Active <span className={cls.brandCrudLabelMuted}>(visible on store)</span>
                </span>
              </label>

              <button className={cls.brandCrudPrimaryBtn} type="button" onClick={createBrand} disabled={saving}>
                {saving ? (
                  <>
                    <span className={cls.brandCrudSpinner} />
                    Creating…
                  </>
                ) : (
                  <>
                    Create <i className="bi bi-arrow-right" />
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT: List */}
        <section className={cls.brandCrudRight}>
          <div className={cls.brandCrudCard}>
            <div className={cls.brandCrudListHead}>
              <div className={cls.brandCrudListTitle}>
                <i className="bi bi-list-check" />
                <span>Brand list</span>
                <span className={cls.brandCrudCount}>{filtered.length}</span>
              </div>

              <div className={cls.brandCrudSearch}>
                <i className={`bi bi-search ${cls.brandCrudSearchIcon}`} />
                <input
                  className={cls.brandCrudSearchInput}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, slug, domain…"
                />
                <button className={cls.brandCrudSearchBtn} type="button" onClick={loadBrands} disabled={loading}>
                  Search
                </button>
              </div>
            </div>

            <div className={cls.brandCrudTable}>
              <div className={`${cls.brandCrudRow} ${cls.brandCrudRowHead}`}>
                <div>ID</div>
                <div>Brand</div>
                <div>Slug</div>
                <div>Site</div>
                <div>Status</div>
              </div>

              {loading ? (
                <div className={cls.brandCrudEmpty}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div className={cls.brandCrudEmpty}>No brands found.</div>
              ) : (
                filtered.map((b) => (
                  <div key={b.id} className={cls.brandCrudRow}>
                    <div className={cls.brandCrudMono} title={b.id}>
                      {b.id.slice(0, 10)}…
                    </div>

                    <div className={cls.brandCrudBrandCell}>
                      <div className={cls.brandCrudBrandLogo}>
                        {b.image ? (
                          <Image src={b.image} alt={b.name} fill sizes="40px" style={{ objectFit: "contain" }} />
                        ) : (
                          <div className={cls.brandCrudBrandFallback}>
                            <i className="bi bi-image" />
                          </div>
                        )}
                      </div>
                      <div className={cls.brandCrudBrandInfo}>
                        <div className={cls.brandCrudBrandName}>{b.name}</div>
                        <div className={cls.brandCrudBrandMeta}>
                          <span className={cls.brandCrudMetaChip}>
                            <i className="bi bi-hash" /> {b.siteId}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={cls.brandCrudMono}>/{b.slug}</div>

                    <div className={cls.brandCrudSiteCell}>
                      <i className="bi bi-globe2" />
                      <span>{b.site?.domain || b.siteId}</span>
                    </div>

                    <div>
                      <span
                        className={`${cls.brandCrudStatus} ${b.isActive ? cls.brandCrudStatusOn : cls.brandCrudStatusOff}`}
                      >
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

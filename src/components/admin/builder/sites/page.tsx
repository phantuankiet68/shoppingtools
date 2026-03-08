"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import styles from "@/styles/admin/builder/sites/sites.module.css";
import { useSitesStore } from "@/store/builder/site/index";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";

function fmt(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function normalizeDomain(input: string) {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .trim()
    .toLowerCase();
}

function nowLocalInput() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED";

type SiteFormState = {
  name: string;
  domain: string;
  status: SiteStatus;
  isPublic: boolean;
  publishedAt: string;
  seoTitleDefault: string;
  seoDescDefault: string;
};

type SiteLike = {
  id: string;
  name: string;
  domain: string;
  createdAt?: string;
  updatedAt?: string;
  status?: SiteStatus;
  isPublic?: boolean;
  publishedAt?: string | null;
  seoTitleDefault?: string | null;
  seoDescDefault?: string | null;
};

function buildSiteForm(site: SiteLike | null): SiteFormState {
  if (!site) {
    return {
      name: "",
      domain: "",
      status: "DRAFT",
      isPublic: false,
      publishedAt: nowLocalInput(),
      seoTitleDefault: "",
      seoDescDefault: "",
    };
  }

  return {
    name: site.name ?? "",
    domain: site.domain ?? "",
    status: site.status ?? "DRAFT",
    isPublic: Boolean(site.isPublic),
    publishedAt: site.publishedAt ? new Date(site.publishedAt).toISOString().slice(0, 16) : nowLocalInput(),
    seoTitleDefault: site.seoTitleDefault ?? "",
    seoDescDefault: site.seoDescDefault ?? "",
  };
}

function SiteFormPanel({
  active,
  busy,
  registerSubmit,
  registerAutoFill,
  onSave,
}: {
  active: SiteLike;
  busy: boolean;
  registerSubmit?: (fn: () => void) => void;
  registerAutoFill?: (fn: () => void) => void;
  onSave: (payload: SiteFormState) => Promise<void> | void;
}) {
  const [form, setForm] = useState<SiteFormState>(() => buildSiteForm(active));

  const handleSubmit = useCallback(() => {
    void onSave(form);
  }, [form, onSave]);

  const autoFillSEO = useCallback(() => {
    setForm((s) => ({
      ...s,
      seoTitleDefault: s.seoTitleDefault || `${s.name || active.name} | Official Website`,
      seoDescDefault:
        s.seoDescDefault ||
        `Discover ${s.name || active.name}. Visit ${normalizeDomain(s.domain || active.domain)} for the best experience.`,
    }));
  }, [active]);

  useEffect(() => {
    registerSubmit?.(handleSubmit);
  }, [handleSubmit, registerSubmit]);

  useEffect(() => {
    registerAutoFill?.(autoFillSEO);
  }, [autoFillSEO, registerAutoFill]);

  return (
    <div className={styles.form}>
      <label className={styles.label}>Site Name</label>
      <div className={styles.inputWrap}>
        <i className="bi bi-type" />
        <input
          className={styles.input}
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          disabled={busy}
          placeholder="My Store"
        />
      </div>

      <label className={styles.label}>Domain</label>
      <div className={styles.inputWrap}>
        <i className="bi bi-link-45deg" />
        <input
          className={styles.input}
          value={form.domain}
          onChange={(e) => setForm((s) => ({ ...s, domain: e.target.value }))}
          disabled={busy}
          placeholder="example.com"
        />
      </div>

      <label className={styles.label}>Status</label>
      <div className={styles.inputWrap}>
        <i className="bi bi-ui-checks-grid" />
        <select
          className={styles.input}
          value={form.status}
          onChange={(e) =>
            setForm((s) => ({
              ...s,
              status: e.target.value as SiteStatus,
            }))
          }
          disabled={busy}
        >
          <option value="DRAFT">DRAFT</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      <label className={styles.label}>Published At</label>
      <div className={styles.inputWrap}>
        <i className="bi bi-calendar-event" />
        <input
          className={styles.input}
          type="datetime-local"
          value={form.publishedAt}
          onChange={(e) => setForm((s) => ({ ...s, publishedAt: e.target.value }))}
          disabled={busy}
        />
      </div>

      <label className={styles.label}>SEO Title Default</label>
      <div className={styles.inputWrap}>
        <i className="bi bi-card-heading" />
        <input
          className={styles.input}
          value={form.seoTitleDefault}
          onChange={(e) => setForm((s) => ({ ...s, seoTitleDefault: e.target.value }))}
          disabled={busy}
          placeholder="Default SEO title"
        />
      </div>

      <label className={styles.label}>SEO Desc Default</label>
      <div className={styles.inputWrap}>
        <i className="bi bi-text-paragraph" />
        <textarea
          className={styles.input}
          value={form.seoDescDefault}
          onChange={(e) => setForm((s) => ({ ...s, seoDescDefault: e.target.value }))}
          disabled={busy}
          placeholder="Default SEO description"
          rows={4}
        />
      </div>

      <label className={styles.label}>Visibility</label>
      <div className={styles.smallActions}>
        <label className={styles.muted} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => setForm((s) => ({ ...s, isPublic: e.target.checked }))}
            disabled={busy}
          />
          Public site
        </label>
      </div>

      <div className={styles.kv}>
        <div className={styles.k}>Created</div>
        <div className={styles.v}>{fmt(active.createdAt)}</div>
      </div>

      <div className={styles.kv}>
        <div className={styles.k}>Updated</div>
        <div className={styles.v}>{fmt(active.updatedAt)}</div>
      </div>

      <div className={styles.tipInline}>
        <i className="bi bi-keyboard" />
        <span>F9: Auto Fill SEO · F10: Save</span>
      </div>
    </div>
  );
}

export default function SitesPage() {
  const { items, loading, busy, activeId, setActiveId, load, createSite, deleteActive, updateActive, toast } =
    useSitesStore();

  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ domain: "", name: "" });

  const submitRef = useRef<() => void>(() => {});
  const autoFillRef = useRef<() => void>(() => {});

  useEffect(() => {
    void load();
  }, [load]);

  const active = useMemo<SiteLike | null>(
    () => (items.find((x) => x.id === activeId) as SiteLike | undefined) || null,
    [items, activeId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => `${x.name} ${x.domain}`.toLowerCase().includes(q));
  }, [items, query]);

  const openCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    await load();
  }, [load]);

  const handleCreate = useCallback(async () => {
    const rawDomain = createForm.domain.trim();
    const rawName = createForm.name.trim();

    const domain = normalizeDomain(rawDomain);
    const created = await createSite(domain, rawName);

    if (created) {
      setCreateOpen(false);
      setCreateForm({ domain: "", name: "" });
    }
  }, [createForm, createSite]);

  const modal = useModal();

  const handleDelete = useCallback(() => {
    if (!active) return;

    modal.confirmDelete(
      "Delete site?",
      `Delete "${active.name}" (${active.domain})? This action cannot be undone.`,
      async () => {
        try {
          await deleteActive();
          modal.success("Success", `Deleted "${active.name}" successfully.`);
        } catch (e: unknown) {
          const err = e as Error;
          modal.error("Delete failed", err?.message || "Delete failed");
        }
      },
    );
  }, [active, deleteActive, modal]);

  const handleSave = useCallback(
    async (form: SiteFormState) => {
      if (!active) return;

      await updateActive({
        name: form.name.trim(),
        domain: normalizeDomain(form.domain),
        status: form.status,
        isPublic: form.isPublic,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
        seoTitleDefault: form.seoTitleDefault.trim() || null,
        seoDescDefault: form.seoDescDefault.trim() || null,
      });
    },
    [active, updateActive],
  );

  const pageFunctionKeys = useMemo(
    () => ({
      F3: handleDelete,
      F4: handleRefresh,
      F5: openCreate,
      F9: () => autoFillRef.current?.(),
      F10: () => submitRef.current?.(),
    }),
    [openCreate, handleDelete, handleRefresh],
  );

  usePageFunctionKeys(pageFunctionKeys);

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <section className={styles.sectionInline}>
          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input
              className={styles.search}
              placeholder={loading ? "Loading..." : "Search sites..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </div>
        </section>

        <div className={styles.topActions}>
          <div className={styles.tipInline}>
            <i className="bi bi-keyboard" />
            <span>F4: Add Site · F5: Refresh · F9: Auto Fill SEO · F10: Save</span>
          </div>
        </div>
      </header>

      <div className={styles.page}>
        <section className={styles.content}>
          <div className={styles.gridWrap}>
            {loading ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-arrow-repeat" />
                <span>Loading sites...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-inbox" />
                <span>No sites found.</span>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((s) => {
                  const isActive = s.id === activeId;

                  return (
                    <div
                      key={s.id}
                      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
                      onClick={() => setActiveId(s.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveId(s.id);
                        }
                      }}
                    >
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon}>
                          <i className="bi bi-globe2" />
                        </div>

                        <div>
                          <div className={styles.cardTitle}>{s.name}</div>
                        </div>

                        <span className={styles.badge}>
                          <i className="bi bi-link-45deg" /> {s.domain}
                        </span>
                      </div>

                      <div className={styles.cardBottom}>
                        <span className={styles.muted}>
                          <i className="bi bi-clock" /> Created {fmt((s as SiteLike).createdAt)}
                        </span>
                        <i className="bi bi-chevron-right" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className={styles.detail}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Site Form</div>
                  <div className={styles.panelSub}>Edit selected site</div>
                </div>
              </div>

              <div className={styles.panelBody}>
                {!active ? (
                  <div className={styles.empty}>
                    <i className="bi bi-info-circle" />
                    <div>
                      <div className={styles.emptyTitle}>Select a site</div>
                      <div className={styles.emptyText}>Click a card to edit site form.</div>
                    </div>
                  </div>
                ) : (
                  <SiteFormPanel
                    key={active.id}
                    active={active}
                    busy={busy}
                    onSave={handleSave}
                    registerSubmit={(fn) => {
                      submitRef.current = fn;
                    }}
                    registerAutoFill={(fn) => {
                      autoFillRef.current = fn;
                    }}
                  />
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      {createOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCreate();
          }}
          tabIndex={-1}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.panelTitle}>Create Site</div>
                <div className={styles.panelSub}>Add a new site to your builder</div>
              </div>

              <button className={styles.iconBtn} type="button" title="Close" onClick={closeCreate} disabled={busy}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.form}>
                <label className={styles.label}>Domain (no https://)</label>

                <div className={styles.inputWrap}>
                  <i className="bi bi-link-45deg" />
                  <input
                    className={styles.input}
                    value={createForm.domain}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        domain: e.target.value,
                      }))
                    }
                    placeholder="example.com"
                    disabled={busy}
                  />
                </div>

                <label className={styles.label}>Site Name</label>

                <div className={styles.inputWrap}>
                  <i className="bi bi-type" />
                  <input
                    className={styles.input}
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        name: e.target.value,
                      }))
                    }
                    placeholder="My Store"
                    disabled={busy}
                  />
                </div>

                <div className={styles.smallActions}>
                  <button className={styles.ghostBtn} type="button" onClick={closeCreate} disabled={busy}>
                    Cancel
                  </button>

                  <button
                    className={styles.primaryBtn}
                    type="button"
                    onClick={() => {
                      void handleCreate();
                    }}
                    disabled={busy}
                  >
                    <i className="bi bi-plus-lg" /> Create
                  </button>
                </div>

                <div className={styles.tipInline}>
                  <i className="bi bi-shield-check" />
                  <span>
                    Domain phải unique. Ví dụ: <span className={styles.mono}>shop-test-01.local</span> hoặc{" "}
                    <span className={styles.mono}>demo.yourdomain.com</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

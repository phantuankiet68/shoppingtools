"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/builder/sites/sites.module.css";
import { useSitesStore } from "@/store/builder/site/index";

function fmt(iso: string) {
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

export default function SitesPage() {
  const { items, loading, busy, activeId, setActiveId, load, createSite, deleteActive, toast } = useSitesStore();

  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ domain: "", name: "" });

  useEffect(() => {
    load();
  }, [load]);

  const active = useMemo(() => items.find((x) => x.id === activeId) || null, [items, activeId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => `${x.name} ${x.domain}`.toLowerCase().includes(q));
  }, [items, query]);

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  const handleCreate = async () => {
    const rawDomain = createForm.domain.trim();
    const rawName = createForm.name.trim();

    const domain = normalizeDomain(rawDomain);
    const created = await createSite(domain, rawName);

    if (created) {
      setCreateOpen(false);
      setCreateForm({ domain: "", name: "" });
    }
  };

  const handleDelete = async () => {
    if (!active) return;
    const ok = confirm(`Delete site "${active.name}" (${active.domain}) ?`);
    if (!ok) return;
    await deleteActive();
  };

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
          <button className={styles.ghostBtn} type="button" onClick={openCreate} disabled={busy || loading}>
            <i className="bi bi-plus-lg" /> Add Site
          </button>

          <button className={styles.ghostBtn} type="button" onClick={load} disabled={busy || loading}>
            <i className="bi bi-arrow-repeat" /> Refresh
          </button>

          <button
            className={`${styles.ghostBtn} ${styles.dangerBtn}`}
            type="button"
            onClick={handleDelete}
            disabled={busy || loading || !active}
          >
            <i className="bi bi-trash3" /> Delete
          </button>
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
                        if (e.key === "Enter" || e.key === " ") setActiveId(s.id);
                      }}
                    >
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon}>
                          <i className="bi bi-globe2" />
                        </div>
                        <span className={styles.badge}>
                          <i className="bi bi-link-45deg" /> {s.domain}
                        </span>
                      </div>

                      <div className={styles.cardTitle}>{s.name}</div>
                      <div className={styles.cardDesc}>
                        Updated: <span className={styles.mono}>{fmt(s.updatedAt)}</span>
                      </div>

                      <div className={styles.cardBottom}>
                        <span className={styles.muted}>
                          <i className="bi bi-clock" /> Created {fmt(s.createdAt)}
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
                  <div className={styles.panelTitle}>Details</div>
                  <div className={styles.panelSub}>Selected site info</div>
                </div>
              </div>

              <div className={styles.panelBody}>
                {!active ? (
                  <div className={styles.empty}>
                    <i className="bi bi-info-circle" />
                    <div>
                      <div className={styles.emptyTitle}>Select a site</div>
                      <div className={styles.emptyText}>Click a card to view details.</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.kv}>
                      <div className={styles.k}>Name</div>
                      <div className={styles.v}>{active.name}</div>
                    </div>
                    <div className={styles.kv}>
                      <div className={styles.k}>Domain</div>
                      <div className={`${styles.v} ${styles.mono}`}>{active.domain}</div>
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
                      <i className="bi bi-lightbulb" />
                      <span>Tip: bước tiếp theo bạn có thể làm “Pages” theo Site (siteId → list pages).</span>
                    </div>
                  </>
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
                    onChange={(e) => setCreateForm((s) => ({ ...s, domain: e.target.value }))}
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
                    onChange={(e) => setCreateForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder="My Store"
                    disabled={busy}
                  />
                </div>

                <div className={styles.smallActions}>
                  <button className={styles.ghostBtn} type="button" onClick={closeCreate} disabled={busy}>
                    Cancel
                  </button>
                  <button className={styles.primaryBtn} type="button" onClick={handleCreate} disabled={busy}>
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

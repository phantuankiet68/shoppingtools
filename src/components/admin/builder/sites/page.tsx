"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/builder/sites/sites.module.css";

type Site = {
  id: string;
  domain: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function SitesPage() {
  const [items, setItems] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>("");

  // create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ domain: "", name: "" });

  // toast
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<any>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  async function load() {
    setLoading(true);
    try {
      const data = await jsonFetch<Site[]>("/api/admin/builder/sites", { method: "GET" });
      setItems(data);
      if (activeId && !data.some((x) => x.id === activeId)) setActiveId(data[0]?.id || "");
      if (!activeId) setActiveId(data[0]?.id || "");
    } catch (e: any) {
      showToast(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(() => items.find((x) => x.id === activeId) || null, [items, activeId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => `${x.name} ${x.domain}`.toLowerCase().includes(q));
  }, [items, query]);

  async function createSite() {
    const rawDomain = createForm.domain.trim();
    const rawName = createForm.name.trim();

    if (!rawDomain) return showToast("Domain is required");
    if (!rawName) return showToast("Site name is required");

    const domain = rawDomain
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "") // ✅ bỏ port localhost:3000 -> localhost
      .trim()
      .toLowerCase();

    setBusy(true);
    try {
      const res = await fetch("/api/admin/builder/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, name: rawName }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // ✅ rút message đẹp từ zod flatten hoặc string error
        const msg =
          typeof json?.error === "string"
            ? json.error
            : Object.values(json?.error?.fieldErrors || {})
                .flat()
                .filter(Boolean)[0] ||
              json?.error?.formErrors?.[0] ||
              "Create failed";

        throw new Error(msg);
      }

      const created = json as Site;

      showToast("Created.");
      setCreateOpen(false);
      setCreateForm({ domain: "", name: "" });
      localStorage.setItem("builder_site_id", created.id);

      await load();
      setActiveId(created.id);
    } catch (e: any) {
      showToast(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  }

  // optional: delete
  async function deleteActive() {
    if (!active) return;
    const ok = confirm(`Delete site "${active.name}" (${active.domain}) ?`);
    if (!ok) return;

    setBusy(true);
    try {
      await jsonFetch(`/api/admin/builder/sites/${active.id}`, { method: "DELETE" });
      showToast("Deleted.");
      await load();
    } catch (e: any) {
      showToast(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.shell}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Sites</div>
            <div className={styles.brandSub}>Manage sites · Create · View details</div>
          </div>
        </div>

        <section className={styles.sectionInline}>
          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input className={styles.search} placeholder={loading ? "Loading..." : "Search sites..."} value={query} onChange={(e) => setQuery(e.target.value)} disabled={loading} />
          </div>
        </section>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={() => setCreateOpen(true)} disabled={busy || loading}>
            <i className="bi bi-plus-lg" /> Add Site
          </button>

          <button className={styles.ghostBtn} type="button" onClick={load} disabled={busy || loading}>
            <i className="bi bi-arrow-repeat" /> Refresh
          </button>

          {/* optional delete */}
          <button className={`${styles.ghostBtn} ${styles.dangerBtn}`} type="button" onClick={deleteActive} disabled={busy || loading || !active}>
            <i className="bi bi-trash3" /> Delete
          </button>
        </div>
      </header>

      <div className={styles.page}>
        <section className={styles.content}>
          {/* List */}
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
                      }}>
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

          {/* Detail */}
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

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Create Modal */}
      {createOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCreateOpen(false);
          }}
          tabIndex={-1}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.panelTitle}>Create Site</div>
                <div className={styles.panelSub}>Add a new site to your builder</div>
              </div>

              <button className={styles.iconBtn} type="button" title="Close" onClick={() => setCreateOpen(false)} disabled={busy}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.form}>
                <label className={styles.label}>Domain (no https://)</label>
                <div className={styles.inputWrap}>
                  <i className="bi bi-link-45deg" />
                  <input className={styles.input} value={createForm.domain} onChange={(e) => setCreateForm((s) => ({ ...s, domain: e.target.value }))} placeholder="example.com" />
                </div>

                <label className={styles.label}>Site Name</label>
                <div className={styles.inputWrap}>
                  <i className="bi bi-type" />
                  <input className={styles.input} value={createForm.name} onChange={(e) => setCreateForm((s) => ({ ...s, name: e.target.value }))} placeholder="My Store" />
                </div>

                <div className={styles.smallActions}>
                  <button className={styles.ghostBtn} type="button" onClick={() => setCreateOpen(false)} disabled={busy}>
                    Cancel
                  </button>
                  <button className={styles.primaryBtn} type="button" onClick={createSite} disabled={busy}>
                    <i className="bi bi-plus-lg" /> Create
                  </button>
                </div>

                <div className={styles.tipInline}>
                  <i className="bi bi-shield-check" />
                  <span>
                    Domain phải unique. Ví dụ: <span className={styles.mono}>shop-test-01.local</span> hoặc <span className={styles.mono}>demo.yourdomain.com</span>
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

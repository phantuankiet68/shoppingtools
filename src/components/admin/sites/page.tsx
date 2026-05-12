"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/sites/sites.module.css";
import { useSitesStore } from "@/store/site/index";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED";

type WebsiteType = "landing" | "blog" | "company" | "ecommerce" | "booking" | "news" | "lms" | "directory";

type SiteLike = {
  id: string;
  name: string;
  domain: string;
  type?: WebsiteType;
  status?: SiteStatus;
  isPublic?: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type SiteFormState = {
  name: string;
  domain: string;
  type: WebsiteType;
  status: SiteStatus;
  isPublic: boolean;
  publishedAt: string;
};

type FormErrors = {
  name?: string;
  domain?: string;
  type?: string;
};

type WorkspaceAccessPolicy = {
  maxSites?: number;
};

type SessionWorkspace = {
  accessPolicy?: WorkspaceAccessPolicy;
};

const WEBSITE_TYPES: WebsiteType[] = ["landing", "blog", "company", "ecommerce", "booking", "news", "lms", "directory"];

const DOMAIN_REGEX = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z]{2,})+$/i;

function nowLocalInput() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);

  return local.toISOString().slice(0, 16);
}

function normalizeDomain(input: string) {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
}

function formatDate(iso?: string | null) {
  if (!iso) return "-";

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return "-";
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function safeWebsiteType(type?: string): WebsiteType {
  if (WEBSITE_TYPES.includes(type as WebsiteType)) {
    return type as WebsiteType;
  }

  return "landing";
}

function buildSiteForm(site?: SiteLike | null): SiteFormState {
  return {
    name: site?.name ?? "",
    domain: site?.domain ?? "",
    type: safeWebsiteType(site?.type),
    status: site?.status ?? "DRAFT",
    isPublic: Boolean(site?.isPublic),
    publishedAt: site?.publishedAt ? site.publishedAt.slice(0, 16) : nowLocalInput(),
  };
}

function validateSiteName(value: string, t: any) {
  const name = value.trim();
  if (!name) {
    return t("sites.validation.siteNameRequired");
  }
  if (name.length < 3) {
    return t("sites.validation.min3");
  }
  if (name.length > 100) {
    return t("sites.validation.max100");
  }
  if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
    return t("sites.validation.invalidCharacters");
  }
  return "";
}

function validateDomain(value: string, t: any) {
  const domain = normalizeDomain(value);
  if (!domain) {
    return t("sites.validation.domainRequired");
  }
  if (domain.length > 255) {
    return t("sites.validation.domainTooLong");
  }
  if (!DOMAIN_REGEX.test(domain)) {
    return t("sites.validation.invalidDomain");
  }
  return "";
}

function validateWebsiteType(value: string, t: any) {
  if (!WEBSITE_TYPES.includes(value as WebsiteType)) {
    return t("sites.validation.invalidType");
  }
  return "";
}

const SiteFormPanel = memo(function SiteFormPanel({
  active,
  busy,
  mode,
  onSave,
  onCreate,
}: {
  active?: SiteLike | null;
  busy: boolean;
  mode: "create" | "edit";
  onSave: (payload: SiteFormState) => Promise<void>;
  onCreate: (payload: SiteFormState) => Promise<void>;
}) {
  const { t } = useAdminI18n();
  const [form, setForm] = useState<SiteFormState>(() => buildSiteForm(active));
  const [errors, setErrors] = useState<FormErrors>({});
  useEffect(() => {
    setForm(buildSiteForm(active));
  }, [active, mode]);

  const updateField = useCallback(<K extends keyof SiteFormState>(key: K, value: SiteFormState[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const normalizedName = form.name.trim();
      const normalizedDomain = normalizeDomain(form.domain);
      const validationErrors: FormErrors = {
        name: validateSiteName(normalizedName, t),
        domain: validateDomain(normalizedDomain, t),
        type: validateWebsiteType(form.type, t),
      };
      setErrors(validationErrors);
      const hasError = Object.values(validationErrors).some(Boolean);
      if (hasError) {
        return;
      }
      const payload: SiteFormState = {
        ...form,
        name: normalizedName,
        domain: normalizedDomain,
      };
      if (mode === "create") {
        await onCreate(payload);
        return;
      }
      await onSave(payload);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  }, [form, mode, onCreate, onSave, t]);

  const resetForm = useCallback(() => {
    setForm(buildSiteForm(null));
    setErrors({});
  }, []);

  return (
    <div className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="site-name" className={styles.label}>
          {t("sites.form.siteName")}
        </label>
        <div className={styles.inputWrap}>
          <i className="bi bi-globe2" />

          <input
            id="site-name"
            className={styles.input}
            placeholder={t("sites.form.siteName")}
            value={form.name}
            disabled={busy}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>
        {errors.name && <div className={styles.errorText}>{errors.name}</div>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="site-domain" className={styles.label}>
          {t("sites.form.domain")}
        </label>
        <div className={styles.inputWrap}>
          <i className="bi bi-link-45deg" />
          <input
            id="site-domain"
            className={styles.input}
            placeholder="example.com"
            value={form.domain}
            disabled={busy}
            onChange={(e) => updateField("domain", e.target.value)}
          />
        </div>
        {errors.domain && <div className={styles.errorText}>{errors.domain}</div>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="site-type" className={styles.label}>
          {t("sites.form.websiteType")}
        </label>
        <div className={styles.selectWrap}>
          <i className="bi bi-window" />
          <select
            id="site-type"
            className={styles.select}
            value={form.type}
            disabled={busy}
            onChange={(e) => updateField("type", e.target.value as WebsiteType)}
          >
            <option value="landing">{t("sites.types.landing")}</option>
            <option value="blog">{t("sites.types.blog")}</option>
            <option value="company">{t("sites.types.company")}</option>
            <option value="ecommerce">{t("sites.types.ecommerce")}</option>
            <option value="booking">{t("sites.types.booking")}</option>
            <option value="news">{t("sites.types.news")}</option>
            <option value="lms">{t("sites.types.lms")}</option>
            <option value="directory">{t("sites.types.directory")}</option>
          </select>
        </div>
        {errors.type && <div className={styles.errorText}>{errors.type}</div>}
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="site-status" className={styles.label}>
            {t("sites.form.status")}
          </label>
          <div className={styles.selectWrap}>
            <i className="bi bi-bookmark-star-fill" />

            <select
              id="site-status"
              className={styles.select}
              value={form.status}
              disabled={busy}
              onChange={(e) => updateField("status", e.target.value as SiteStatus)}
            >
              <option value="DRAFT">{t("sites.status.draft")}</option>
              <option value="ACTIVE">{t("sites.status.active")}</option>
              <option value="SUSPENDED">{t("sites.status.suspended")}</option>
            </select>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="published-at" className={styles.label}>
            {t("sites.form.publishedAt")}
          </label>
          <input
            id="published-at"
            type="datetime-local"
            className={styles.inputDate}
            value={form.publishedAt}
            disabled={busy}
            onChange={(e) => updateField("publishedAt", e.target.value)}
          />
        </div>
      </div>
      <div className={styles.switchWrap}>
        <input
          id="is-public"
          type="checkbox"
          checked={form.isPublic}
          disabled={busy}
          onChange={(e) => updateField("isPublic", e.target.checked)}
        />
        <label htmlFor="is-public">{t("sites.form.publicSite")}</label>
      </div>

      {mode === "edit" && active && (
        <div className={styles.metaGrid}>
          <div className={styles.metaBox}>
            <span>{t("sites.form.created")}</span>
            <strong>{formatDate(active.createdAt)}</strong>
          </div>
          <div className={styles.metaBox}>
            <span>{t("sites.form.updated")}</span>
            <strong>{formatDate(active.updatedAt)}</strong>
          </div>
        </div>
      )}

      <div className={styles.formActions}>
        <button type="button" className={styles.secondaryBtn} onClick={resetForm} disabled={busy}>
          <i className="bi bi-arrow-counterclockwise" />
          {t("sites.form.reset")}
        </button>
        <button type="button" className={styles.primaryBtn} onClick={handleSubmit} disabled={busy}>
          <i className={`bi ${mode === "create" ? "bi-plus-circle" : "bi-floppy"}`} />
          {mode === "create" ? t("sites.form.createSite") : t("sites.form.saveChanges")}
        </button>
      </div>
    </div>
  );
});

export default function SitesPage() {
  const { t } = useAdminI18n();
  const items = useSitesStore((s) => s.items);
  const busy = useSitesStore((s) => s.busy);
  const activeId = useSitesStore((s) => s.activeId);
  const setActiveId = useSitesStore((s) => s.setActiveId);
  const load = useSitesStore((s) => s.load);
  const createSite = useSitesStore((s) => s.createSite);
  const deleteActive = useSitesStore((s) => s.deleteActive);
  const updateActive = useSitesStore((s) => s.updateActive);
  const modal = useModal();
  const { currentWorkspace, sites } = useAdminAuth();
  const workspace = currentWorkspace as SessionWorkspace;
  const maxSites = workspace?.accessPolicy?.maxSites ?? 1;
  const currentSiteCount = sites?.length ?? 0;
  const reachedSiteLimit = currentSiteCount >= maxSites;
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"create" | "edit">("edit");
  useEffect(() => {
    void load();
  }, [load]);

  const active = items.find((x) => x.id === activeId) ?? null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter((x) => `${x.name} ${x.domain}`.toLowerCase().includes(q));
  }, [items, query]);

  const handleCreate = useCallback(
    async (form: SiteFormState) => {
      try {
        if (reachedSiteLimit) {
          modal.error(
            t("sites.messages.planLimitTitle"),
            t("sites.messages.planLimitDesc").replace("{count}", String(maxSites)),
          );
          return;
        }
        const created = await createSite(form.domain, form.name);
        if (!created?.id) {
          modal.error(t("sites.messages.createFailed"), t("sites.messages.createFailedDesc"));
          return;
        }
        setMode("edit");
        setActiveId(created.id);
        modal.success(t("sites.messages.success"), t("sites.messages.createSuccess").replace("{name}", form.name));
      } catch (error) {
        console.error("Create failed:", error);
        modal.error(t("sites.messages.createFailed"), t("sites.messages.createFailedDesc"));
      }
    },
    [createSite, maxSites, modal, reachedSiteLimit, setActiveId, t],
  );

  const handleSave = useCallback(
    async (form: SiteFormState) => {
      try {
        if (!active) {
          modal.error(t("sites.messages.missingSite"), t("sites.messages.selectSiteFirst"));
          return;
        }
        await updateActive({
          name: form.name,
          domain: form.domain,
          status: form.status,
          isPublic: form.isPublic,
          publishedAt: form.publishedAt || null,
        });
        modal.success(t("sites.messages.success"), t("sites.messages.updateSuccess").replace("{name}", form.name));
      } catch (error) {
        console.error("Update failed:", error);
        modal.error(t("sites.messages.updateFailed"), t("sites.messages.updateFailedDesc"));
      }
    },
    [active, modal, updateActive, t],
  );

  const handleDelete = useCallback(
    (site: SiteLike) => {
      modal.confirmDelete(
        t("sites.messages.deleteTitle"),
        t("sites.messages.deleteDesc").replace("{name}", site.name),
        async () => {
          try {
            setActiveId(site.id);
            await deleteActive();
            modal.success(t("sites.messages.success"), t("sites.messages.deleteSuccess").replace("{name}", site.name));
          } catch (error) {
            console.error("Delete failed:", error);
            modal.error(t("sites.messages.deleteFailed"), t("sites.messages.deleteFailedDesc"));
          }
        },
      );
    },
    [deleteActive, modal, setActiveId, t],
  );

  const handleRefresh = useCallback(async () => {
    try {
      await load();
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  }, [load]);

  const handleCreateMode = useCallback(() => {
    if (reachedSiteLimit) {
      modal.error(
        t("sites.messages.planLimitTitle"),
        t("sites.messages.planLimitDesc").replace("{count}", String(maxSites)),
      );
      return;
    }

    setMode("create");
  }, [reachedSiteLimit, maxSites, modal, t]);

  const pageFunctionKeys = useMemo(
    () => ({
      F3: () => {
        if (active) {
          handleDelete(active);
        }
      },
      F4: handleRefresh,
      F5: () => {
        if (reachedSiteLimit) {
          modal.error(
            t("sites.messages.planLimitTitle"),
            t("sites.messages.planLimitDesc").replace("{count}", String(maxSites)),
          );
          return;
        }
        handleCreateMode();
      },
    }),

    [active, handleCreateMode, handleDelete, handleRefresh, maxSites, modal, reachedSiteLimit, t],
  );

  usePageFunctionKeys(pageFunctionKeys);

  return (
    <div className={styles.shell}>
      <div className={styles.page}>
        <aside className={styles.detail}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelTitle}>{t("sites.form.title")}</div>

                <div className={styles.panelSub}>
                  {t("sites.form.sub")} ({currentSiteCount}/{maxSites})
                </div>
              </div>

              <button
                className={`${styles.newBtn} ${reachedSiteLimit ? styles.newBtnDisabled : ""}`}
                onClick={handleCreateMode}
              >
                <i className="bi bi-plus-lg" />

                {t("sites.table.newSite")}
              </button>
            </div>

            <div className={styles.panelBody}>
              {mode === "edit" && !active ? (
                <div className={styles.empty}>{t("sites.form.selectSite")}</div>
              ) : (
                <SiteFormPanel mode={mode} active={active} busy={busy} onSave={handleSave} onCreate={handleCreate} />
              )}
            </div>
          </div>
        </aside>

        <div className={styles.left}>
          <header className={styles.topbar}>
            <div className={styles.searchWrap}>
              <i className="bi bi-search" />

              <input
                className={styles.search}
                placeholder={t("sites.table.search")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className={styles.topRight}>
              <button className={styles.refreshBtn} onClick={handleRefresh}>
                <i className="bi bi-arrow-clockwise" />
              </button>
            </div>
          </header>

          <div className={styles.tableWrap}>
            <div className={styles.tableHeader}>
              <div>{t("sites.table.site")}</div>
              <div>{t("sites.table.domain")}</div>
              <div>{t("sites.table.status")}</div>
              <div>{t("sites.table.visibility")}</div>
              <div>{t("sites.table.type")}</div>
              <div>{t("sites.table.updated")}</div>
              <div>{t("sites.table.action")}</div>
            </div>

            <div className={styles.tableBody}>
              {filtered.length === 0 && <div className={styles.empty}>{t("sites.table.noSites")}</div>}
              {filtered.map((item) => {
                const site = item as SiteLike;
                const isActive = site.id === activeId;
                return (
                  <div
                    key={site.id}
                    className={`${styles.tableRow} ${isActive ? styles.tableRowActive : ""}`}
                    onClick={() => {
                      setMode("edit");

                      setActiveId(site.id);
                    }}
                  >
                    <div className={styles.siteCell}>
                      <div className={styles.siteIcon}>
                        <i className="bi bi-globe2" />
                      </div>
                      <div>
                        <div className={styles.siteName}>{site.name}</div>

                        <div className={styles.siteId}>#{site.id.slice(0, 8)}</div>
                      </div>
                    </div>
                    <div className={styles.domainCell}>{site.domain}</div>
                    <div>
                      <span
                        className={`${styles.statusBadge} ${
                          site.status === "ACTIVE"
                            ? styles.activeBadge
                            : site.status === "SUSPENDED"
                              ? styles.suspendedBadge
                              : styles.draftBadge
                        }`}
                      >
                        {site.status === "ACTIVE"
                          ? t("sites.status.active")
                          : site.status === "SUSPENDED"
                            ? t("sites.status.suspended")
                            : t("sites.status.draft")}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`${styles.visibilityBadge} ${
                          site.isPublic ? styles.publicBadge : styles.privateBadge
                        }`}
                      >
                        {site.isPublic ? t("sites.table.public") : t("sites.table.private")}
                      </span>
                    </div>

                    <div className={styles.dateCell}>{site.type ? t(`sites.types.${site.type}`) : "-"}</div>

                    <div className={styles.dateCell}>{formatDate(site.updatedAt || site.createdAt)}</div>

                    <div className={styles.actionCell} onClick={(e) => e.stopPropagation()}>
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setMode("edit");
                          setActiveId(site.id);
                        }}
                      >
                        <i className="bi bi-pencil-square" />
                        {t("sites.table.edit")}
                      </button>

                      <button
                        className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                        onClick={() => handleDelete(site)}
                      >
                        <i className="bi bi-trash3" />
                        {t("sites.table.delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

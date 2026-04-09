"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "@/styles/admin/builder/pages/add.module.css";
import DesignHeader from "@/components/admin/builder/pages/DesignHeader";
import { ControlsPalette, Canvas, Inspector } from "@/components/admin/builder/pages";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";

import type { Block, DropMeta } from "@/lib/builder/pages/types";
import { REGISTRY } from "@/lib/ui-builder/registry";
import { useUiBuilderAddStore } from "@/store/builder/pages/add/uiBuilderAdd.store";
import { useSiteStore } from "@/store/site/site.store";
import { fetchAdminPage, publishAdminPage, saveAdminPage } from "@/services/builder/pages/add/adminPages.service";

import {
  ensureLeadingSlash,
  originFromDomain,
  normalizeSlugAndPath,
} from "@/features/builder/pages/add/pagePath.helper";
import {
  buildDroppedSingleBlock,
  buildDroppedTemplateBlocks,
  normalizeBlocks,
} from "@/features/builder/pages/add/blocks.helper";
import { BUILDER_ADD_MESSAGES } from "@/features/builder/pages/add/messages";

type RouteParams = {
  locale?: "en";
};

type SiteOption = {
  id: string;
  name: string;
  domain?: string;
};

function normalizeText(value?: string | null) {
  return (value || "").trim().toUpperCase();
}

export default function UiBuilderAddPage() {
  const { locale: routeLocale } = useParams<RouteParams>();
  const sp = useSearchParams();

  const initialId = sp.get("id");
  const templateGroup = sp.get("templateGroup");
  const templateId = sp.get("templateId");
  const templateName = sp.get("templateName");

  const [state, dispatch] = useUiBuilderAddStore(initialId);

  const sites = useSiteStore((siteState) => siteState.sites);
  const sitesLoading = useSiteStore((siteState) => siteState.loading);
  const sitesErr = useSiteStore((siteState) => siteState.err);
  const selectedSiteId = useSiteStore((siteState) => siteState.siteId);
  const setSelectedSiteId = useSiteStore((siteState) => siteState.setSiteId);
  const hydrateFromStorage = useSiteStore((siteState) => siteState.hydrateFromStorage);
  const loadSites = useSiteStore((siteState) => siteState.loadSites);

  const [guardMsg, setGuardMsg] = React.useState("");
  const [showEditorModal, setShowEditorModal] = React.useState(false);

  const guardTimeoutRef = useRef<number | null>(null);

  const setGuard = React.useCallback((msg: string, ms = 1800) => {
    setGuardMsg(msg);
    if (guardTimeoutRef.current) window.clearTimeout(guardTimeoutRef.current);
    guardTimeoutRef.current = window.setTimeout(() => setGuardMsg(""), ms);
  }, []);

  useEffect(() => {
    return () => {
      if (guardTimeoutRef.current) window.clearTimeout(guardTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (showEditorModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showEditorModal]);

  const { finalPath: derivedPath } = useMemo(
    () => normalizeSlugAndPath(state.slug, state.title),
    [state.slug, state.title],
  );

  const effectivePath = useMemo(() => {
    const rawSlug = (state.slug || "").trim().toLowerCase();
    const rawTitle = (state.title || "").trim().toLowerCase();

    if (derivedPath === "/" || rawSlug === "" || rawSlug === "home" || rawTitle === "home") {
      return "/";
    }

    return ensureLeadingSlash(derivedPath);
  }, [derivedPath, state.slug, state.title]);

  const active = useMemo(
    () => state.blocks.find((b) => b.id === state.activeId) || null,
    [state.blocks, state.activeId],
  );

  const selectedSite = useMemo(() => {
    return sites.find((site) => String(site.id) === String(selectedSiteId)) ?? null;
  }, [sites, selectedSiteId]);

  const siteOptions = useMemo<SiteOption[]>(() => {
    return sites.map((site) => ({
      id: String(site.id),
      name: site.name ?? site.domain ?? `Site ${site.id}`,
      domain: site.domain,
    }));
  }, [sites]);

  const filteredRegistry = useMemo(() => {
    if (!templateGroup) return REGISTRY;

    const groupKey = normalizeText(templateGroup);

    return REGISTRY.filter((item) => {
      const kind = normalizeText(item.kind);

      if (kind.includes(groupKey)) return true;

      if (templateId && kind.includes(normalizeText(templateId.replace(/^tpl-/, "")))) {
        return true;
      }

      if (templateName && kind.includes(normalizeText(templateName))) {
        return true;
      }

      return false;
    });
  }, [templateGroup, templateId, templateName]);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        hydrateFromStorage();
        await loadSites();

        if (initialId) {
          const p = await fetchAdminPage(initialId, ac.signal);

          if (p) {
            dispatch({ type: "setPageId", pageId: p.id });
            dispatch({ type: "setTitle", title: p.title ?? "Untitled" });
            dispatch({ type: "setSlug", slug: p.slug ?? "" });
            dispatch({
              type: "setBlocks",
              blocks: normalizeBlocks((p.blocks ?? []) as unknown[]),
            });

            dispatch({
              type: "patchSeo",
              patch: {
                metaTitle: p.title ?? "",
                ogTitle: p.title ?? "",
              },
            });

            if (p.siteId) {
              setSelectedSiteId(String(p.siteId));
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Initialization error:", err);
        }
      }
    })();

    return () => ac.abort();
  }, [initialId, routeLocale, dispatch, hydrateFromStorage, loadSites, setSelectedSiteId]);

  useEffect(() => {
    dispatch({
      type: "patchSeo",
      patch: {
        metaTitle: state.seo.metaTitle || state.title,
        ogTitle: state.seo.ogTitle || state.title,
      },
    });
  }, [state.title, state.seo.metaTitle, state.seo.ogTitle, dispatch]);

  const onDragStart = React.useCallback((kind: string) => {
    return (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", kind);
      e.dataTransfer.effectAllowed = "copy";
    };
  }, []);

  const onDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const meta = (e as React.DragEvent & { zbMeta?: DropMeta }).zbMeta || null;
      const txt = e.dataTransfer.getData("text/plain") || "";

      const droppedTpl = (() => {
        if (!txt.startsWith("template:")) return null;

        try {
          const raw = e.dataTransfer.getData("application/json");
          const payload = raw ? JSON.parse(raw) : null;
          const draggedTemplateId: string = (payload?.templateId || txt.replace("template:", "")).trim();
          return buildDroppedTemplateBlocks(`template:${draggedTemplateId}`, meta);
        } catch {
          return null;
        }
      })();

      if (droppedTpl) {
        dispatch({ type: "appendBlocks", blocks: droppedTpl });
        dispatch({ type: "setActiveId", id: droppedTpl[0]?.id ?? null });
        setShowEditorModal(true);
        return;
      }

      const kind = txt;
      if (!REGISTRY.some((r) => r.kind === kind)) return;

      const block: Block = buildDroppedSingleBlock(kind, meta);
      dispatch({ type: "appendBlocks", blocks: [block] });
      dispatch({ type: "setActiveId", id: block.id });
      setShowEditorModal(true);
    },
    [dispatch],
  );

  const handleSelectBlock = React.useCallback(
    (id: string | null) => {
      dispatch({ type: "setActiveId", id });
      if (id) setShowEditorModal(true);
    },
    [dispatch],
  );

  const move = React.useCallback(
    (dir: -1 | 1) => {
      if (!state.activeId) return;

      dispatch({
        type: "setBlocks",
        blocks: (() => {
          const idx = state.blocks.findIndex((b) => b.id === state.activeId);
          if (idx < 0) return state.blocks;

          const next = [...state.blocks];
          const ni = Math.min(Math.max(idx + dir, 0), state.blocks.length - 1);
          const [it] = next.splice(idx, 1);
          next.splice(ni, 0, it);
          return next;
        })(),
      });
    },
    [state.activeId, state.blocks, dispatch],
  );

  const remove = React.useCallback(() => {
    if (!state.activeId) return;

    dispatch({
      type: "setBlocks",
      blocks: state.blocks.filter((b) => b.id !== state.activeId),
    });
    dispatch({ type: "setActiveId", id: null });
    setShowEditorModal(false);
  }, [state.activeId, state.blocks, dispatch]);

  const updateActive = React.useCallback(
    (patch: Record<string, unknown>) => {
      if (!state.activeId) return;

      dispatch({
        type: "setBlocks",
        blocks: state.blocks.map((b) => {
          if (b.id !== state.activeId) return b;

          const nextKind = (patch.kind as string) ?? b.kind;
          const kindChanged = nextKind !== b.kind;

          let nextProps =
            "props" in patch ? ((patch.props as Record<string, unknown>) ?? {}) : { ...(b.props ?? {}), ...patch };

          if (kindChanged && !("props" in patch)) {
            const defaults = REGISTRY.find((r) => r.kind === nextKind)?.defaults ?? {};
            nextProps = { ...defaults, ...nextProps };
          }

          return {
            ...b,
            kind: nextKind,
            props: nextProps,
          };
        }),
      });
    },
    [state.activeId, state.blocks, dispatch],
  );

  const savePage = React.useCallback(async () => {
    if (!selectedSiteId) {
      setGuard("Chưa chọn site", 1800);
      return;
    }

    try {
      dispatch({ type: "setSaving", saving: true });

      const { safeTitle, finalSlug, finalPath } = normalizeSlugAndPath(state.slug, state.title);

      const body = {
        id: state.pageId ?? undefined,
        siteId: selectedSiteId,
        domain: selectedSite?.domain || "",
        title: safeTitle,
        slug: finalSlug,
        path: finalPath,
        blocks: state.blocks.map(({ id, kind, props }) => ({ id, kind, props })),
        seo: {
          ...state.seo,
          metaTitle: state.seo.metaTitle || safeTitle,
          ogTitle: state.seo.ogTitle || safeTitle,
        },
      };

      const rs = await saveAdminPage({
        body,
        siteDomain: selectedSite?.domain || "",
      });

      if (!rs.ok) {
        throw new Error(rs.error || BUILDER_ADD_MESSAGES.SAVE_ERROR_FALLBACK);
      }

      if (rs.id && rs.id !== state.pageId) {
        dispatch({ type: "setPageId", pageId: rs.id });
      }

      setGuard(BUILDER_ADD_MESSAGES.SAVE_DRAFT_OK, 1500);
    } catch (e: unknown) {
      setGuard((e as Error)?.message || BUILDER_ADD_MESSAGES.SAVE_ERROR_FALLBACK, 2200);
    } finally {
      dispatch({ type: "setSaving", saving: false });
    }
  }, [dispatch, selectedSiteId, selectedSite, state, setGuard]);

  const publishPage = React.useCallback(async () => {
    if (!selectedSiteId) {
      setGuard("Chưa chọn site", 1800);
      return;
    }

    if (!state.pageId) {
      setGuard(BUILDER_ADD_MESSAGES.NEED_SAVE_BEFORE_PUBLISH, 1800);
      return;
    }

    try {
      dispatch({ type: "setPublishing", publishing: true });

      const rs = await publishAdminPage({
        id: state.pageId,
        siteDomain: selectedSite?.domain || "",
      });

      if (!rs.ok) {
        throw new Error(rs.error || BUILDER_ADD_MESSAGES.PUBLISH_ERROR_FALLBACK);
      }

      const siteOrigin = originFromDomain(selectedSite?.domain);
      const url = siteOrigin ? `${siteOrigin}${effectivePath}` : effectivePath;

      window.open(url, "_blank");
    } catch (e: unknown) {
      setGuard((e as Error)?.message || BUILDER_ADD_MESSAGES.PUBLISH_ERROR_FALLBACK, 2000);
    } finally {
      dispatch({ type: "setPublishing", publishing: false });
    }
  }, [dispatch, selectedSiteId, selectedSite, state.pageId, effectivePath, setGuard]);

  const openPreview = React.useCallback(() => {
    const siteOrigin = originFromDomain(selectedSite?.domain);
    const url = siteOrigin ? `${siteOrigin}${effectivePath}` : effectivePath;
    window.open(url, "_blank");
  }, [effectivePath, selectedSite]);

  const handleRefresh = React.useCallback(() => {
    window.location.href = "/admin/builder/pages";
  }, []);

  const functionKeyActions = useMemo(
    () => ({
      F2: {
        action: publishPage,
        label: "Publish",
        icon: "bi-arrow-right-short",
      },
      F3: {
        action: openPreview,
        label: "Preview",
        icon: "bi-eye",
      },
      F5: {
        action: savePage,
        label: "Save",
        icon: "bi-save",
      },
      F6: {
        action: handleRefresh,
        label: "Cancel",
        icon: "bi-arrow-repeat",
      },
    }),
    [publishPage, openPreview, savePage, handleRefresh],
  );

  usePageFunctionKeys(functionKeyActions);

  return (
    <div className={styles.wrapper}>
      {guardMsg && (
        <div className={styles.toastWrap} role="status" aria-live="polite">
          <div className={styles.toast}>
            <i className="bi bi-exclamation-triangle" />
            <span className={styles.toastText}>{guardMsg}</span>
            <button type="button" className={styles.toastClose} onClick={() => setGuardMsg("")} aria-label="Close">
              <i className="bi bi-x" />
            </button>
          </div>
        </div>
      )}

      <div>
        {state.mode === "design" ? (
          <div className={styles.builderGrid}>
            <aside className={styles.left}>
              <ControlsPalette
                search={state.search}
                setSearch={(v) => dispatch({ type: "setSearch", search: v })}
                onDragStart={onDragStart}
                registry={filteredRegistry}
                templateGroup={templateGroup}
              />
            </aside>

            <main className={styles.center}>
              <Canvas
                blocks={state.blocks}
                activeId={state.activeId}
                setActiveId={handleSelectBlock}
                onDrop={onDrop}
                move={move}
                device={state.device}
              />
            </main>
          </div>
        ) : (
          <div className={styles.previewCard}>
            <div className={styles.previewBody}>
              <div className={styles.previewList}>
                {state.blocks.map((b) => (
                  <div key={b.id} className={styles.blockCard}>
                    <div className={styles.blockBody}>
                      <code className={styles.blockCode}>{b.kind}</code>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.previewActions}>
                <button
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={() => dispatch({ type: "setMode", mode: "design" })}
                >
                  <i className="bi bi-arrow-left-short" />
                  Back to Design
                </button>

                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={savePage} disabled={state.saving}>
                  {state.saving ? (
                    <>
                      <span className={styles.spinner} />
                      Saving…
                    </>
                  ) : (
                    <>Save</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEditorModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditorModal(false)} role="presentation">
          <div
            className={styles.modalPanel}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Builder editor"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Page Editor</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowEditorModal(false)}
                aria-label="Close modal"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <DesignHeader
                title={state.title}
                setTitle={(v) => dispatch({ type: "setTitle", title: v })}
                path={effectivePath}
                saving={state.saving}
                saved={!state.saving}
                publishing={state.publishing}
                onSave={savePage}
                onPublish={publishPage}
                onPreview={openPreview}
                onRefresh={handleRefresh}
                device={state.device}
                setDevice={(d) => dispatch({ type: "setDevice", device: d })}
                sites={siteOptions}
                selectedSiteId={selectedSiteId || ""}
                onChangeSite={setSelectedSiteId}
                disableSiteSelect={Boolean(state.pageId)}
              />

              <Inspector active={active} move={move} remove={remove} updateActive={updateActive} />
            </div>
          </div>
        </div>
      )}

      {sitesLoading && <div className="small text-secondary mt-2">Đang tải site.</div>}
      {sitesErr && <div className="small text-danger mt-2">{sitesErr}</div>}
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "@/styles/admin/pages/add.module.css";
import DesignHeader from "@/components/admin/pages/DesignHeader";
import { ControlsPalette, Canvas, Inspector } from "@/components/admin/pages";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

import type { Block, DropMeta } from "@/lib/pages/types";
import { REGISTRY } from "@/lib/ui-builder/registry";
import { useUiBuilderAddStore } from "@/store/pages/add/uiBuilderAdd.store";
import { fetchAdminPage, publishAdminPage, saveAdminPage } from "@/services/pages/add/adminPages.service";

import { ensureLeadingSlash, originFromDomain, normalizeSlugAndPath } from "@/features/pages/add/pagePath.helper";
import {
  buildDroppedSingleBlock,
  buildDroppedTemplateBlocks,
  normalizeBlocks,
} from "@/features/pages/add/blocks.helper";

type RouteParams = {
  locale?: "en";
};

function normalizeText(value?: string | null) {
  return (value || "").trim().toUpperCase();
}

export default function UiBuilderAddPage() {
  const { locale: routeLocale } = useParams<RouteParams>();
  const sp = useSearchParams();
  const { t } = useAdminI18n();
  const { currentSite, currentWorkspace } = useAdminAuth();

  const siteId = currentSite?.id ?? "";
  const siteDomain = currentSite?.domain ?? "";
  const siteType = currentSite?.type ?? "";
  const tier = currentWorkspace?.tier ?? "";

  const initialId = sp.get("id");
  const templateGroup = sp.get("templateGroup");
  const templateId = sp.get("templateId");
  const templateName = sp.get("templateName");

  const [state, dispatch] = useUiBuilderAddStore(initialId);

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
        if (initialId) {
          const p = await fetchAdminPage(initialId, ac.signal);

          if (p) {
            dispatch({ type: "setPageId", pageId: p.id });
            dispatch({ type: "setTitle", title: p.title ?? t("builderAdd.untitled") });
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
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error(t("builderAdd.initError"), err);
        }
      }
    })();

    return () => ac.abort();
  }, [initialId, routeLocale, dispatch, t]);

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
    if (!siteId) {
      setGuard(t("builderAdd.errors.noSiteSelected"), 1800);
      return;
    }

    try {
      dispatch({ type: "setSaving", saving: true });

      const { safeTitle, finalSlug, finalPath } = normalizeSlugAndPath(state.slug, state.title);

      const body = {
        id: state.pageId ?? undefined,
        siteId: String(siteId),
        domain: siteDomain,
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
        siteDomain,
      });

      if (!rs.ok) {
        throw new Error(rs.error || t("builderAdd.errors.saveErrorFallback"));
      }

      if (rs.id && rs.id !== state.pageId) {
        dispatch({ type: "setPageId", pageId: rs.id });
      }

      setGuard(t("builderAdd.messages.saveDraftOk"), 1500);
    } catch (e: unknown) {
      setGuard((e as Error)?.message || t("builderAdd.errors.saveErrorFallback"), 2200);
    } finally {
      dispatch({ type: "setSaving", saving: false });
    }
  }, [dispatch, siteId, siteDomain, state, setGuard, t]);

  const publishPage = React.useCallback(async () => {
    if (!siteId) {
      setGuard(t("builderAdd.errors.noSiteSelected"), 1800);
      return;
    }

    if (!state.pageId) {
      setGuard(t("builderAdd.errors.needSaveBeforePublish"), 1800);
      return;
    }

    try {
      dispatch({ type: "setPublishing", publishing: true });

      const rs = await publishAdminPage({
        id: state.pageId,
        siteDomain,
      });

      if (!rs.ok) {
        throw new Error(rs.error || t("builderAdd.errors.publishErrorFallback"));
      }

      const siteOrigin = originFromDomain(siteDomain);
      const url = siteOrigin ? `${siteOrigin}${effectivePath}` : effectivePath;

      window.open(url, "_blank");
    } catch (e: unknown) {
      setGuard((e as Error)?.message || t("builderAdd.errors.publishErrorFallback"), 2000);
    } finally {
      dispatch({ type: "setPublishing", publishing: false });
    }
  }, [dispatch, siteId, siteDomain, state.pageId, effectivePath, setGuard, t]);

  const openPreview = React.useCallback(() => {
    const siteOrigin = originFromDomain(siteDomain);
    const url = siteOrigin ? `${siteOrigin}${effectivePath}` : effectivePath;
    window.open(url, "_blank");
  }, [effectivePath, siteDomain]);

  const handleRefresh = React.useCallback(() => {
    window.location.href = "/admin/pages";
  }, []);

  const functionKeyActions = useMemo(
    () => ({
      F2: {
        action: publishPage,
        label: t("builderAdd.actions.publish"),
        icon: "bi-arrow-right-short",
      },
      F3: {
        action: openPreview,
        label: t("builderAdd.actions.preview"),
        icon: "bi-eye",
      },
      F5: {
        action: savePage,
        label: t("builderAdd.actions.save"),
        icon: "bi-save",
      },
      F6: {
        action: handleRefresh,
        label: t("builderAdd.actions.cancel"),
        icon: "bi-arrow-repeat",
      },
    }),
    [publishPage, openPreview, savePage, handleRefresh, t],
  );

  usePageFunctionKeys(functionKeyActions);

  return (
    <div className={styles.wrapper}>
      {guardMsg && (
        <div className={styles.toastWrap} role="status" aria-live="polite">
          <div className={styles.toast}>
            <i className="bi bi-exclamation-triangle" />
            <span className={styles.toastText}>{guardMsg}</span>
            <button
              type="button"
              className={styles.toastClose}
              onClick={() => setGuardMsg("")}
              aria-label={t("builderAdd.actions.close")}
            >
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
                tier={tier}
                siteType={siteType}
              />
            </aside>

            <main className={styles.center}>
              <div className={styles.listBtn}>
                {Object.entries(functionKeyActions).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    className={styles.actionBtn}
                    onClick={item.action}
                    title={`${item.label} (${key})`}
                  >
                    <i className={`bi ${item.icon} ${styles.actionIcon}`} />
                    <span className={styles.actionLabel}>{item.label}</span>
                    <span className={styles.actionKey}>{key}</span>
                  </button>
                ))}
              </div>

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
                  {t("builderAdd.actions.backToDesign")}
                </button>

                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={savePage} disabled={state.saving}>
                  {state.saving ? (
                    <>
                      <span className={styles.spinner} />
                      {t("builderAdd.status.saving")}
                    </>
                  ) : (
                    <>{t("builderAdd.actions.save")}</>
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
            aria-label={t("builderAdd.aria.builderEditor")}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t("builderAdd.titles.pageEditor")}</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowEditorModal(false)}
                aria-label={t("builderAdd.actions.closeModal")}
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
                sites={[]}
                selectedSiteId={String(siteId)}
                onChangeSite={() => {}}
                disableSiteSelect
              />

              <Inspector active={active} move={move} remove={remove} updateActive={updateActive} />
            </div>
          </div>
        </div>
      )}

      {!siteId && <div className="small text-warning mt-2">{t("builderAdd.errors.noSiteSelected")}</div>}
    </div>
  );
}

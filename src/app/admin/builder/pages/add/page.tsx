"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "@/styles/admin/builder/pages/add.module.css";

import DesignHeader from "@/components/admin/builder/pages/DesignHeader";
import { ControlsPalette, Canvas, Inspector } from "@/components/admin/builder/pages";

import type { Block, DropMeta } from "@/lib/page/types";
import { REGISTRY } from "@/lib/ui-builder/registry";

import { useUiBuilderAddStore } from "@/store/builder/pages/add/uiBuilderAdd.store";
import { fetchSites, type SiteRow } from "@/services/builder/pages/add/adminSites.service";
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

export default function UiBuilderAddPage() {
  const { locale: routeLocale } = useParams<{ locale: "en" }>();
  const sp = useSearchParams();
  const initialId = sp.get("id");

  const [state, dispatch] = useUiBuilderAddStore(initialId);

  const [sites, setSites] = useState<SiteRow[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  const [guardMsg, setGuardMsg] = useState("");
  const guardTimeoutRef = useRef<number | null>(null);
  const setGuard = (msg: string, ms = 1800) => {
    setGuardMsg(msg);
    if (guardTimeoutRef.current) window.clearTimeout(guardTimeoutRef.current);
    guardTimeoutRef.current = window.setTimeout(() => setGuardMsg(""), ms);
  };

  useEffect(() => {
    return () => {
      if (guardTimeoutRef.current) window.clearTimeout(guardTimeoutRef.current);
    };
  }, []);

  const { finalPath: derivedPath } = useMemo(
    () => normalizeSlugAndPath(state.slug, state.title),
    [state.slug, state.title],
  );

  const active = useMemo(
    () => state.blocks.find((b) => b.id === state.activeId) || null,
    [state.blocks, state.activeId],
  );

  // init
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const siteList = await fetchSites(ac.signal);
        setSites(siteList);

        let activeSiteId = "";

        if (initialId) {
          const p = await fetchAdminPage(initialId, ac.signal);
          if (p) {
            dispatch({ type: "setPageId", pageId: p.id });
            dispatch({ type: "setTitle", title: p.title ?? "Untitled" });
            dispatch({ type: "setSlug", slug: p.slug ?? "" });
            dispatch({ type: "setBlocks", blocks: normalizeBlocks((p.blocks ?? []) as unknown[]) });

            dispatch({
              type: "patchSeo",
              patch: { metaTitle: p.title ?? "", ogTitle: p.title ?? "" },
            });

            if (p.siteId && siteList.some((s) => s.id === p.siteId)) activeSiteId = p.siteId;
          }
        }

        if (!activeSiteId) {
          const saved = localStorage.getItem("pages_selected_site");
          const fallback = siteList[0]?.id ?? "";
          activeSiteId = saved && siteList.some((s) => s.id === saved) ? saved : fallback;
        }

        if (activeSiteId) setSelectedSiteId(activeSiteId);
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error("Initialization error:", err);
      }
    })();

    return () => ac.abort();
  }, [initialId, routeLocale, dispatch]);

  useEffect(() => {
    if (selectedSiteId) localStorage.setItem("pages_selected_site", selectedSiteId);
  }, [selectedSiteId]);

  const currentSite = useMemo(() => {
    if (sites.length === 0) return undefined;
    return sites.find((s) => s.id === selectedSiteId) ?? sites[0];
  }, [sites, selectedSiteId]);

  useEffect(() => {
    // auto fill metaTitle / ogTitle if empty
    dispatch({
      type: "patchSeo",
      patch: {
        metaTitle: state.seo.metaTitle || state.title,
        ogTitle: state.seo.ogTitle || state.title,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.title]);

  const onDragStart = (kind: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", kind);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const meta = (e as React.DragEvent & { zbMeta?: DropMeta }).zbMeta || null;

    const txt = e.dataTransfer.getData("text/plain") || "";

    // template drop
    const droppedTpl = (() => {
      if (!txt.startsWith("template:")) return null;
      try {
        const raw = e.dataTransfer.getData("application/json");
        const payload = raw ? JSON.parse(raw) : null;
        const templateId: string = (payload?.templateId || txt.replace("template:", "")).trim();
        return buildDroppedTemplateBlocks(`template:${templateId}`, meta);
      } catch {
        return null;
      }
    })();

    if (droppedTpl) {
      dispatch({ type: "appendBlocks", blocks: droppedTpl });
      dispatch({ type: "setActiveId", id: droppedTpl[0]?.id ?? null });
      return;
    }

    // single block drop
    const kind = txt;
    if (!REGISTRY.some((r) => r.kind === kind)) return;

    const b: Block = buildDroppedSingleBlock(kind, meta);
    dispatch({ type: "appendBlocks", blocks: [b] });
    dispatch({ type: "setActiveId", id: b.id });
  };

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
    dispatch({ type: "setBlocks", blocks: state.blocks.filter((b) => b.id !== state.activeId) });
    dispatch({ type: "setActiveId", id: null });
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
            const def = REGISTRY.find((r) => r.kind === nextKind)?.defaults ?? {};
            nextProps = { ...def, ...nextProps };
          }

          return { ...b, kind: nextKind, props: nextProps };
        }),
      });
    },
    [state.activeId, state.blocks, dispatch],
  );

  async function savePage() {
    try {
      dispatch({ type: "setSaving", saving: true });

      const { safeTitle, finalSlug, finalPath } = normalizeSlugAndPath(state.slug, state.title);

      const body = {
        id: state.pageId ?? undefined,
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

      const rs = await saveAdminPage({ body, siteDomain: currentSite?.domain || "" });
      if (!rs.ok) throw new Error(rs.error);

      setGuard(BUILDER_ADD_MESSAGES.SAVE_DRAFT_OK, 1500);
    } catch (e: unknown) {
      setGuard((e as Error)?.message || BUILDER_ADD_MESSAGES.SAVE_ERROR_FALLBACK, 2000);
    } finally {
      dispatch({ type: "setSaving", saving: false });
    }
  }

  async function publishPage() {
    if (!state.pageId) {
      setGuard(BUILDER_ADD_MESSAGES.NEED_SAVE_BEFORE_PUBLISH, 1800);
      return;
    }

    try {
      dispatch({ type: "setPublishing", publishing: true });

      const rs = await publishAdminPage({ id: state.pageId, siteDomain: currentSite?.domain || "" });
      if (!rs.ok) throw new Error(rs.error);

      const safePath = ensureLeadingSlash(derivedPath);
      const siteOrigin = originFromDomain(currentSite?.domain);
      const url = siteOrigin ? `${siteOrigin}${safePath}` : safePath;
      window.open(url, "_blank");
    } catch (e: unknown) {
      setGuard((e as Error)?.message || BUILDER_ADD_MESSAGES.PUBLISH_ERROR_FALLBACK, 2000);
    } finally {
      dispatch({ type: "setPublishing", publishing: false });
    }
  }

  const openPreview = () => {
    const safePath = ensureLeadingSlash(derivedPath);
    const siteOrigin = originFromDomain(currentSite?.domain);
    const url = siteOrigin ? `${siteOrigin}${safePath}` : safePath;
    window.open(url, "_blank");
  };

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

      <div className={styles.siteBar}>
        <div className={`${styles.siteRow} ${styles.hidden}`}>
          <i className="bi bi-globe2" />
          <select
            className={styles.siteSelect}
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            aria-label="Chọn site"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.domain} ({s.localeDefault})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        {state.mode === "design" ? (
          <div className={styles.builderGrid}>
            <aside className={styles.left}>
              <ControlsPalette
                search={state.search}
                setSearch={(v) => dispatch({ type: "setSearch", search: v })}
                onDragStart={onDragStart}
              />
            </aside>

            <main className={styles.center}>
              <Canvas
                blocks={state.blocks}
                activeId={state.activeId}
                setActiveId={(id) => dispatch({ type: "setActiveId", id })}
                onDrop={onDrop}
                move={move}
                device={state.device}
              />
            </main>

            <aside className={styles.right}>
              <DesignHeader
                title={state.title}
                setTitle={(v) => dispatch({ type: "setTitle", title: v })}
                saving={state.saving}
                saved={!state.saving}
                publishing={state.publishing}
                onSave={savePage}
                onPublish={publishPage}
                onPreview={openPreview}
                onRefresh={() => {}}
                setDevice={(d) => dispatch({ type: "setDevice", device: d })}
              />
              <Inspector active={active} move={move} remove={remove} updateActive={updateActive} />
            </aside>
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
    </div>
  );
}

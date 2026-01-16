"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "@/styles/admin/pages/add.module.css";

import DesignHeader from "@/components/admin/pages/DesignHeader";
import { ControlsPalette, Canvas, Inspector } from "@/components/admin/pages";
import { REGISTRY } from "@/lib/ui-builder/registry";
import type { Block, SEO } from "@/lib/page/types";
import { uid, slugify } from "@/lib/page/utils";

type ViewMode = "design" | "preview";
type SiteRow = {
  id: string;
  domain: string;
  name: string;
  localeDefault: "vi" | "en" | "ja";
};
type Device = "desktop" | "tablet" | "mobile";

function ensureLeadingSlash(p?: string | null) {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}
function originFromDomain(domain?: string) {
  if (!domain) return "";
  const isProd = process.env.NODE_ENV === "production";
  return `${isProd ? "https" : "http"}://${domain}`;
}

export default function UiBuilderAddPage() {
  const { locale: routeLocale } = useParams<{ locale: "vi" | "en" | "ja" }>();
  const sp = useSearchParams();
  const initialId = sp.get("id");

  const [sites, setSites] = useState<SiteRow[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("design");
  const [guardMsg, setGuardMsg] = useState("");

  const [device, setDevice] = useState<Device>("desktop");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pageId, setPageId] = useState<string | null>(initialId);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [search, setSearch] = useState("");

  const [seo, setSeo] = useState<SEO>({
    metaTitle: title,
    metaDescription: "",
    keywords: "",
    canonicalUrl: "",
    noindex: false,
    nofollow: false,
    ogTitle: title,
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    sitemapChangefreq: "weekly",
    sitemapPriority: 0.7,
    structuredData: "",
  });

  const rawSlug = (slug ?? "").trim();
  const isHome = rawSlug === "/";
  const computedSlug = isHome ? "" : slugify(rawSlug || title || "trang-moi");
  const path = `/${isHome || !computedSlug ? "" : `/${computedSlug}`}`;

  const active = useMemo(() => blocks.find((b) => b.id === activeId) || null, [blocks, activeId]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/sites", { cache: "no-store" });
        if (!r.ok) return;
        const data = await r.json();
        const list: SiteRow[] = data.items ?? [];
        setSites(list);

        if (initialId) {
          const d = await fetch(`/api/admin/pages/${initialId}`, { cache: "no-store" }); // ✅ fix
          if (d.ok) {
            const dj = await d.json();
            const pid = dj?.page?.siteId as string | undefined;
            if (pid && list.some((s) => s.id === pid)) {
              setSelectedSiteId(pid);
              return;
            }
          }
        }

        const saved = localStorage.getItem("pages_selected_site");
        const fallback = list[0]?.id ?? "";
        const pick = saved && list.some((s) => s.id === saved) ? saved : fallback;
        setSelectedSiteId(pick);
      } catch {}
    })();
  }, [initialId, routeLocale]);

  useEffect(() => {
    if (selectedSiteId) localStorage.setItem("pages_selected_site", selectedSiteId);
  }, [selectedSiteId]);

  const currentSite = useMemo(() => sites.find((s) => s.id === selectedSiteId) ?? sites[0], [sites, selectedSiteId]);

  useEffect(() => {
    if (!initialId) return;
    (async () => {
      const r = await fetch(`/api/admin/pages/${initialId}`, { cache: "no-store" });
      if (!r.ok) return;
      const { page: p } = await r.json();
      setPageId(p.id);
      setTitle(p.title ?? "Untitled");
      setSlug(p.slug ?? "");
      setSeo((prev) => ({
        ...prev,
        metaTitle: p.title ?? prev.metaTitle,
        ogTitle: p.title ?? prev.ogTitle,
      }));
    })();
  }, [initialId, routeLocale]);

  const onDragStart = (kind: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", kind);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const meta = (e as any).zbMeta as { type: "row-col"; parentRowId: string; colIndex: number } | { type: "section"; parentSectionId: string; slot: string } | null;

    const txt = e.dataTransfer.getData("text/plain") || "";
    const isTemplate = txt.startsWith("template:");
    if (isTemplate) {
      try {
        const raw = e.dataTransfer.getData("application/json");
        const payload = raw ? JSON.parse(raw) : null;
        const templateId: string = (payload?.templateId || txt.replace("template:", "")).trim();

        const made = composeTemplateBlocks(templateId);
        if (made.length === 0) return;

        const mapped = made.map((b) => ({ ...b }));
        if (meta?.type === "row-col") {
          const roots = getRoots(mapped);
          roots.forEach((rb) => {
            (rb.props as any)._parentRowId = meta.parentRowId;
            (rb.props as any)._parentColIndex = meta.colIndex;
            if ((rb.props as any).__parent) delete (rb.props as any).__parent;
          });
        } else if (meta?.type === "section") {
          const roots = getRoots(mapped);
          roots.forEach((rb) => {
            (rb.props as any).__parent = { id: meta.parentSectionId, slot: meta.slot || "children" };
            if ((rb.props as any)._parentRowId) delete (rb.props as any)._parentRowId;
            if ((rb.props as any)._parentColIndex !== undefined) delete (rb.props as any)._parentColIndex;
          });
        }

        const withIds = remapIds(mapped);
        setBlocks((prev) => [...prev, ...withIds]);
        setActiveId(withIds[0]?.id ?? null);
        return;
      } catch {}
    }

    const kind = e.dataTransfer.getData("text/plain");
    const reg = REGISTRY.find((r) => r.kind === kind);
    const def = reg?.defaults || {};
    let props: any = { ...def };

    if (meta?.type === "row-col") {
      props._parentRowId = meta.parentRowId;
      props._parentColIndex = meta.colIndex;
    } else if (meta?.type === "section") {
      props.__parent = { id: meta.parentSectionId, slot: meta.slot || "children" };
    }

    const b: Block = { id: uid(), kind, props };
    setBlocks((prev) => [...prev, b]);
    setActiveId(b.id);
  };

  const move = (dir: -1 | 1) => {
    if (!activeId) return;
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === activeId);
      if (idx < 0) return prev;
      const next = [...prev];
      const ni = Math.min(Math.max(idx + dir, 0), prev.length - 1);
      const [it] = next.splice(idx, 1);
      next.splice(ni, 0, it);
      return next;
    });
  };

  const remove = () => {
    if (!activeId) return;
    setBlocks((prev) => prev.filter((b) => b.id !== activeId));
    setActiveId(null);
  };

  const updateActive = (patch: Record<string, any>) => {
    if (!activeId) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== activeId) return b;

        const nextKind = patch.kind ?? b.kind;
        const kindChanged = nextKind !== b.kind;
        let nextProps = "props" in patch ? patch.props ?? {} : { ...(b.props ?? {}), ...patch };
        if (kindChanged && !("props" in patch)) {
          const def = REGISTRY.find((r) => r.kind === nextKind)?.defaults ?? {};
          nextProps = { ...def, ...nextProps };
        }

        return { ...b, kind: nextKind, props: nextProps };
      })
    );
  };

  async function savePage() {
    try {
      setSaving(true);
      const safeTitle = (title || "").trim() || "Untitled";
      const normalizedSlug = isHome ? "/" : rawSlug || slugify(safeTitle);
      const finalSlug = normalizedSlug === "/" ? "/" : slugify(normalizedSlug);
      const finalPath = `/${finalSlug === "/" ? "" : `/${finalSlug}`}`;

      const body = {
        id: pageId ?? undefined,
        title: safeTitle,
        slug: finalSlug,
        path: finalPath,
        blocks: blocks.map(({ kind, props }) => ({ kind, props })),
        seo: {
          ...seo,
          metaTitle: seo.metaTitle || safeTitle,
          ogTitle: seo.ogTitle || safeTitle,
        },
      };

      const res = await fetch(`/api/admin/pages/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-site-domain": currentSite?.domain || "",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Save failed");

      setPageId(json?.id || pageId);
      setGuardMsg("Đã lưu vào Page (DRAFT).");
      setTimeout(() => setGuardMsg(""), 1500);
    } catch (e: any) {
      setGuardMsg(e?.message || "Save error");
      setTimeout(() => setGuardMsg(""), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function publishPage() {
    if (!pageId) {
      setGuardMsg("Hãy Save để tạo ID trước");
      setTimeout(() => setGuardMsg(""), 1800);
      return;
    }
    try {
      setPublishing(true);
      const res = await fetch(`/api/admin/pages/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-site-domain": currentSite?.domain || "",
        },
        body: JSON.stringify({ id: pageId }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "Publish failed");

      const safePath = ensureLeadingSlash(path);
      const siteOrigin = originFromDomain(currentSite?.domain);
      const url = siteOrigin ? `${siteOrigin}${safePath}` : safePath;
      window.open(url, "_blank");
    } catch (e: any) {
      setGuardMsg(e?.message || "Publish error");
      setTimeout(() => setGuardMsg(""), 2000);
    } finally {
      setPublishing(false);
    }
  }

  useEffect(() => {
    setSeo((prev) => ({
      ...prev,
      metaTitle: prev.metaTitle || title,
      ogTitle: prev.ogTitle || title,
    }));
  }, [title]);

  const openPreview = () => {
    const safePath = ensureLeadingSlash(path);
    const siteOrigin = originFromDomain(currentSite?.domain);
    const url = siteOrigin ? `${siteOrigin}${safePath}` : safePath;
    window.open(url, "_blank");
  };

  return (
    <div className={styles.wrapper}>
      {guardMsg && (
        <div className={styles.guardWrap}>
          <div className={styles.guardAlert}>
            <i className="bi bi-exclamation-triangle" />
            <span>{guardMsg}</span>
          </div>
        </div>
      )}

      {/* ====== Site selector */}
      <div className={styles.siteBar}>
        <div className={`${styles.siteRow} ${styles.hidden}`}>
          <i className="bi bi-globe2" />
          <select className={styles.siteSelect} value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} aria-label="Chọn site">
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.domain} ({s.localeDefault})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        {mode === "design" ? (
          <div className={styles.builderGrid}>
            <aside className={styles.left}>
              <ControlsPalette search={search} setSearch={setSearch} onDragStart={onDragStart} />
            </aside>

            <main className={styles.center}>
              <Canvas blocks={blocks} activeId={activeId} setActiveId={setActiveId} onDrop={onDrop} move={move} device={device} />
            </main>

            <aside className={styles.right}>
              <DesignHeader
                title={title}
                setTitle={setTitle}
                saving={saving}
                saved={!saving}
                publishing={publishing}
                onSave={savePage}
                onPublish={publishPage}
                onPreview={openPreview}
                onRefresh={() => {}}
                setDevice={setDevice}
              />
              <Inspector active={active} move={move} remove={remove} updateActive={updateActive} />
            </aside>
          </div>
        ) : (
          <div className={styles.previewCard}>
            <div className={styles.previewBody}>
              <div className={styles.previewList}>
                {blocks.map((b) => (
                  <div key={b.id} className={styles.blockCard}>
                    <div className={styles.blockBody}>
                      <code className={styles.blockCode}>{b.kind}</code>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.previewActions}>
                <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setMode("design")}>
                  <i className="bi bi-arrow-left-short" />
                  Back to Design
                </button>

                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={savePage} disabled={saving}>
                  {saving ? (
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

function getRoots(list: Block[]) {
  return list.filter((b) => {
    const p: any = b.props || {};
    const inRow = !!p._parentRowId;
    const inSection = !!p.__parent?.id;
    return !inRow && !inSection;
  });
}

function remapIds(list: Block[]) {
  const idMap = new Map<string, string>();
  const mapId = (oldId: string) => {
    if (!idMap.has(oldId)) idMap.set(oldId, uid());
    return idMap.get(oldId)!;
  };

  const clone = list.map((b) => {
    const nb: Block = {
      id: mapId(b.id),
      kind: b.kind,
      props: JSON.parse(JSON.stringify(b.props || {})),
    };
    return nb;
  });

  clone.forEach((b) => {
    const p: any = b.props || {};
    if (p._parentRowId && idMap.has(p._parentRowId)) {
      p._parentRowId = idMap.get(p._parentRowId);
    }
    if (p.__parent?.id && idMap.has(p.__parent.id)) {
      p.__parent.id = idMap.get(p.__parent.id);
    }
  });

  return clone;
}

function composeTemplateBlocks(templateId: string): Block[] {
  const make = (kind: string, props: any = {}): Block => ({ id: uid(), kind, props });

  if (templateId === "tpl-header-only") {
    return [
      make("HeaderPro", {
        title: "Zento",
        itemsJson: JSON.stringify([
          { label: "Home", href: "/" },
          { label: "Pages", href: "admin/pages" },
        ]),
      }),
    ];
  }

  if (templateId === "tpl-hero-2col") {
    const row = make("Row", { cols: 2, gap: 24 });

    const left = make("BannerPro", {
      eyebrow: "LowCode Builder",
      title: "Design faster with",
      highlight: "Blocks",
      subtitle: "Kéo thả để lắp nhanh các khối UI.",
      ctaLabel: "Get Started",
      ctaHref: "/get-started",
      palette: "sunrise",
    });
    (left.props as any)._parentRowId = row.id;
    (left.props as any)._parentColIndex = 0;

    const right = make("Text", {
      text: "Bạn có thể kéo thêm block vào từng cột.",
      fontSize: 16,
      mt: 8,
    });
    (right.props as any)._parentRowId = row.id;
    (right.props as any)._parentColIndex = 1;

    return [row, left, right];
  }

  if (templateId === "tpl-landing-basic") {
    const header = make("HeaderPro", {
      title: "Zento",
      itemsJson: JSON.stringify([
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
      ]),
    });

    const section = make("Section", { title: "Welcome" });

    const hero = make("BannerPro", {
      eyebrow: "Next.js 15 + CSS Modules",
      title: "Build pages with",
      highlight: "Blocks & Templates",
      subtitle: "Auto path & locale đến từ Menu – đúng kiểu low-code.",
      ctaLabel: "Docs",
      ctaHref: "/docs",
      palette: "coral",
    });
    (hero.props as any).__parent = { id: section.id, slot: "children" };

    const row = make("Row", { cols: 3, gap: 16 });
    (row.props as any).__parent = { id: section.id, slot: "children" };

    const t1 = make("Text", { text: "⚡ Kéo thả nhanh" });
    (t1.props as any)._parentRowId = row.id;
    (t1.props as any)._parentColIndex = 0;

    const t2 = make("Text", { text: "🧩 Template sẵn" });
    (t2.props as any)._parentRowId = row.id;
    (t2.props as any)._parentColIndex = 1;

    const t3 = make("Text", { text: "🔗 Sync từ Menu" });
    (t3.props as any)._parentRowId = row.id;
    (t3.props as any)._parentColIndex = 2;

    return [header, section, hero, row, t1, t2, t3];
  }

  return [];
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import DesignHeader from "@/components/admin/pages/DesignHeader";
import { ControlsPalette, Canvas, Inspector } from "@/components/admin/pages";
import { REGISTRY } from "@/lib/ui-builder/registry";
import type { Block, Locale as LocaleType, SEO } from "@/lib/page/types";
import { uid, slugify } from "@/lib/page/utils";

/* =========================
 * Types & helpers
 * =======================*/
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
  // ===== Route params & query
  const { locale: routeLocale } = useParams<{ locale: "vi" | "en" | "ja" }>();
  const sp = useSearchParams();
  const initialId = sp.get("id"); // nếu edit

  // ===== Site selection
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  // ===== Core state
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("design");
  const [guardMsg, setGuardMsg] = useState("");

  // NEW: device (desktop / tablet / mobile)
  const [device, setDevice] = useState<Device>("desktop");

  // Meta
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pageId, setPageId] = useState<string | null>(initialId);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Locale có thể chỉnh trong UI (DesignHeader yêu cầu setter)
  const [localeState, setLocaleState] = useState<"vi" | "en" | "ja">(routeLocale);

  // Palette search
  const [search, setSearch] = useState("");

  // SEO state
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

  // ===== Slug "/" & path (dựa theo localeState)
  const rawSlug = (slug ?? "").trim();
  const isHome = rawSlug === "/";
  const computedSlug = isHome ? "" : slugify(rawSlug || title || "trang-moi");
  const path = `/${localeState}${isHome || !computedSlug ? "" : `/${computedSlug}`}`;

  // ===== Derived
  const active = useMemo(() => blocks.find((b) => b.id === activeId) || null, [blocks, activeId]);
  const serialized = useMemo(
    () =>
      JSON.stringify(
        blocks.map(({ kind, props }) => ({ kind, props })),
        null,
        2
      ),
    [blocks]
  );

  // ===== Load sites (và chọn site phù hợp)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/sites", { cache: "no-store" });
        if (!r.ok) return;
        const data = await r.json();
        const list: SiteRow[] = data.items ?? [];
        setSites(list);

        // Nếu đang edit, cố gắng lấy siteId từ detail page
        if (initialId) {
          const d = await fetch(`api/pages/${initialId}`, {
            cache: "no-store",
          });
          if (d.ok) {
            const dj = await d.json();
            const pid = dj?.page?.siteId as string | undefined; // API nên select thêm siteId
            if (pid && list.some((s) => s.id === pid)) {
              setSelectedSiteId(pid);
              return;
            }
          }
        }

        // Fallback: nhớ lựa chọn cũ hoặc chọn site đầu tiên
        const saved = localStorage.getItem("pages_selected_site");
        const fallback = list[0]?.id ?? "";
        const pick = saved && list.some((s) => s.id === saved) ? saved : fallback;
        setSelectedSiteId(pick);
      } catch {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId, routeLocale]);

  // Lưu lựa chọn site
  useEffect(() => {
    if (selectedSiteId) localStorage.setItem("pages_selected_site", selectedSiteId);
  }, [selectedSiteId]);

  const currentSite = useMemo(() => sites.find((s) => s.id === selectedSiteId) ?? sites[0], [sites, selectedSiteId]);

  // ===== Load page detail by ?id=
  useEffect(() => {
    if (!initialId) return;
    (async () => {
      const r = await fetch(`api/pages/${initialId}`, {
        cache: "no-store",
      });
      if (!r.ok) return;
      const { page: p } = await r.json();
      setPageId(p.id);
      setTitle(p.title ?? "Untitled");
      setSlug(p.slug ?? "");
      setLocaleState((p.locale as LocaleType) || routeLocale);
      const list = (p.blocks || []).map((x: any) => ({
        id: uid(),
        kind: x.kind,
        props: x.props || {},
      }));
      setBlocks(list);
      setSeo((prev) => ({
        ...prev,
        metaTitle: p.title ?? prev.metaTitle,
        ogTitle: p.title ?? prev.ogTitle,
      }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  // ===== Drag & Drop
  const onDragStart = (kind: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", kind);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const meta = (e as any).zbMeta as { type: "row-col"; parentRowId: string; colIndex: number } | { type: "section"; parentSectionId: string; slot: string } | null;

    // Branch 1: template
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
            (rb.props as any).__parent = {
              id: meta.parentSectionId,
              slot: meta.slot || "children",
            };
            if ((rb.props as any)._parentRowId) delete (rb.props as any)._parentRowId;
            if ((rb.props as any)._parentColIndex !== undefined) delete (rb.props as any)._parentColIndex;
          });
        }

        const withIds = remapIds(mapped);
        setBlocks((prev) => [...prev, ...withIds]);
        setActiveId(withIds[0]?.id ?? null);
        return;
      } catch {
        // rơi về single-block
      }
    }

    // Branch 2: single block
    const kind = e.dataTransfer.getData("text/plain");
    const reg = REGISTRY.find((r) => r.kind === kind);
    const def = reg?.defaults || {};
    let props: any = { ...def };

    if (meta?.type === "row-col") {
      props._parentRowId = meta.parentRowId;
      props._parentColIndex = meta.colIndex;
    } else if (meta?.type === "section") {
      props.__parent = {
        id: meta.parentSectionId,
        slot: meta.slot || "children",
      };
    }

    const b: Block = { id: uid(), kind, props };
    setBlocks((prev) => [...prev, b]);
    setActiveId(b.id);
  };

  // ===== CRUD blocks
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

  // === FIX: Cho phép đổi cả kind và props, kèm seed defaults khi đổi kind ===
  const updateActive = (patch: Record<string, any>) => {
    if (!activeId) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== activeId) return b;

        const nextKind = patch.kind ?? b.kind;
        const kindChanged = nextKind !== b.kind;

        // Nếu Inspector truyền props rõ ràng thì dùng luôn; nếu không, merge patch vào props hiện tại
        let nextProps = "props" in patch ? patch.props ?? {} : { ...(b.props ?? {}), ...patch };

        // Khi đổi kind mà Inspector KHÔNG gửi props mới,
        // ta seed defaults của kind mới (nếu có) để tránh thiếu prop cần thiết
        if (kindChanged && !("props" in patch)) {
          const def = REGISTRY.find((r) => r.kind === nextKind)?.defaults ?? {};
          nextProps = { ...def, ...nextProps };
        }

        return { ...b, kind: nextKind, props: nextProps };
      })
    );
  };

  // ===== Persist
  async function savePage() {
    try {
      setSaving(true);
      const safeTitle = (title || "").trim() || "Untitled";
      const normalizedSlug = isHome ? "/" : rawSlug || slugify(safeTitle);
      const finalSlug = normalizedSlug === "/" ? "/" : slugify(normalizedSlug);
      const finalPath = `/${localeState}${finalSlug === "/" ? "" : `/${finalSlug}`}`;

      const body = {
        id: pageId ?? undefined,
        locale: localeState,
        title: safeTitle,
        slug: finalSlug,
        path: finalPath, // server có thể tính lại; gửi để hiển thị tức thời
        blocks: blocks.map(({ kind, props }) => ({ kind, props })),
        seo: {
          ...seo,
          metaTitle: seo.metaTitle || safeTitle,
          ogTitle: seo.ogTitle || safeTitle,
        },
      };

      // Gọi đúng route có prefix locale + header domain để định danh site
      const res = await fetch(`api/pages/save`, {
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
      const res = await fetch(`api/pages/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-site-domain": currentSite?.domain || "",
        },
        body: JSON.stringify({ id: pageId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "Publish failed");

      // Preview theo domain của site đã chọn
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

  // Đồng bộ SEO title khi đổi tiêu đề
  useEffect(() => {
    setSeo((prev) => ({
      ...prev,
      metaTitle: prev.metaTitle || title,
      ogTitle: prev.ogTitle || title,
    }));
  }, [title]);

  // Preview (từ nút preview trong header)
  const openPreview = () => {
    const safePath = ensureLeadingSlash(path);
    const siteOrigin = originFromDomain(currentSite?.domain);
    const url = siteOrigin ? `${siteOrigin}${safePath}` : safePath;
    window.open(url, "_blank");
  };

  return (
    <div className="zb-wrapper p-2">
      {guardMsg && (
        <div className="container-fluid">
          <div className="alert alert-warning py-2 px-3 my-2 small">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {guardMsg}
          </div>
        </div>
      )}

      {/* ====== Site selector */}
      <div className="container-fluid">
        <div className="d-flex align-items-center gap-2 d-none">
          <i className="bi bi-globe2" />
          <select className="form-select form-select-sm" value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} aria-label="Chọn site">
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.domain} ({s.localeDefault})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-0">
        <div className="mb-2">
          <DesignHeader
            title={title}
            setTitle={setTitle}
            locale={localeState}
            setLocale={setLocaleState}
            saving={saving}
            saved={!saving}
            publishing={publishing}
            onSave={savePage}
            onPublish={publishPage}
            onPreview={openPreview}
            onRefresh={() => {}}
            device={device}
            setDevice={setDevice}
          />
        </div>

        {mode === "design" ? (
          <div className="row g-3">
            <div className="col-12 col-md-2">
              <ControlsPalette search={search} setSearch={setSearch} onDragStart={onDragStart} />
            </div>
            <div className="col-12 col-md-8">
              <Canvas blocks={blocks} activeId={activeId} setActiveId={setActiveId} onDrop={onDrop} move={move} device={device} />
            </div>
            <div className="col-12 col-md-2">
              <Inspector active={active} move={move} remove={remove} updateActive={updateActive} />
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              {/* Preview đơn giản */}
              <div className="d-grid gap-2">
                {blocks.map((b) => (
                  <div key={b.id} className="card">
                    <div className="card-body p-2">
                      <code className="small">{b.kind}</code>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setMode("design")}>
                  <i className="bi bi-arrow-left-short me-1" />
                  Back to Design
                </button>
                <button className="btn btn-primary btn-sm" onClick={savePage} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
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

// Remap id cho toàn bộ cây template để tránh trùng/đè
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

  // remap references (_parentRowId, __parent.id)
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
  // Các block gốc cần id để làm cha
  const make = (kind: string, props: any = {}): Block => ({
    id: uid(),
    kind,
    props,
  });

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
    const row = make("Row", { cols: 2, gap: 24 }); // Row 2 cột

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

  // fallback
  return [];
}

// src/store/useTemplateEditorStore.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PAGE_SIZE,
  TemplateItem,
  apiDelete,
  apiList,
  apiRead,
  apiWrite,
  buildTemplateList,
  guessCssModulePath,
  normalizeClientPath,
  normalizeForScope,
} from "@/services/builder/themes/templateFiles.service";

type Toast = { type: "ok" | "err"; msg: string } | null;

export function useTemplateEditorStore() {
  const [kindFilter, setKindFilter] = useState<string>("");
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<TemplateItem[]>([]);
  const [activePath, setActivePath] = useState<string>("");

  const [tsxPath, setTsxPath] = useState<string>("");
  const [tsx, setTsx] = useState<string>("");
  const [cssPath, setCssPath] = useState<string>("");
  const [css, setCss] = useState<string>("");

  const [listLoading, setListLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<Toast>(null);

  const originalRef = useRef<{ tsx: string; css: string; tsxPath: string; cssPath: string }>({
    tsx: "",
    css: "",
    tsxPath: "",
    cssPath: "",
  });

  const loadSeqRef = useRef(0);

  // Collapse theo kind: true = đóng
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleKind = useCallback((k: string) => {
    setCollapsed((s) => ({ ...s, [k]: !s[k] }));
  }, []);

  // Load-more theo kind
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>({});

  // New template inputs
  const [newKind, setNewKind] = useState("ShopTemplate");
  const [newGroup, setNewGroup] = useState("ui");
  const [newName, setNewName] = useState("");

  const isDirty = useMemo(() => tsx !== originalRef.current.tsx || css !== originalRef.current.css, [tsx, css]);

  const kinds = useMemo(() => {
    const set = new Set(items.map((x) => x.kind));
    return Array.from(set).sort();
  }, [items]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byKind = new Map<string, TemplateItem[]>();

    for (const x of items) {
      if (kindFilter && x.kind !== kindFilter) continue;
      if (q && !(x.name.toLowerCase().includes(q) || x.path.toLowerCase().includes(q))) continue;

      const arr = byKind.get(x.kind) || [];
      arr.push(x);
      byKind.set(x.kind, arr);
    }

    return Array.from(byKind.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([kind, arr]) => ({
        kind,
        items: arr.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [items, query, kindFilter]);

  const reloadList = useCallback(async (signal?: AbortSignal) => {
    const files = await apiList(undefined, signal);
    const list = buildTemplateList(files);
    setItems(list);

    setCollapsed((prev) => {
      const next = { ...prev };
      for (const it of list) if (next[it.kind] == null) next[it.kind] = true;
      return next;
    });

    setVisibleCount((prev) => {
      const next = { ...prev };
      for (const it of list) if (next[it.kind] == null) next[it.kind] = PAGE_SIZE;
      return next;
    });

    return list;
  }, []);

  // initial list load
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setListLoading(true);
        const files = await apiList(undefined, ac.signal);
        const list = buildTemplateList(files);

        setItems(list);

        setCollapsed(() => {
          const m: Record<string, boolean> = {};
          for (const it of list) m[it.kind] = true;
          return m;
        });

        setVisibleCount(() => {
          const m: Record<string, number> = {};
          for (const it of list) if (m[it.kind] == null) m[it.kind] = PAGE_SIZE;
          return m;
        });

        setActivePath((prev) => prev || list[0]?.path || "");
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setToast({ type: "err", msg: e?.message || "Load list failed" });
      } finally {
        setListLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // reset visibleCount on search/filter
  useEffect(() => {
    setVisibleCount((prev) => {
      const next: Record<string, number> = { ...prev };
      for (const sec of grouped) next[sec.kind] = PAGE_SIZE;
      return next;
    });
  }, [query, kindFilter, grouped]);

  // load file when activePath changes
  useEffect(() => {
    if (!activePath) return;

    const seq = ++loadSeqRef.current;
    const ac = new AbortController();

    (async () => {
      try {
        setFileLoading(true);
        setToast(null);

        const code = await apiRead(activePath, ac.signal);
        if (ac.signal.aborted || seq !== loadSeqRef.current) return;

        const cssGuessRaw = guessCssModulePath(code);
        const cssGuess = cssGuessRaw ? normalizeForScope(cssGuessRaw, "styles") : "";
        let cssCode = "";

        if (cssGuess) {
          try {
            cssCode = await apiRead(cssGuess, ac.signal);
          } catch (err: any) {
            if (err?.name !== "AbortError") cssCode = "";
          }
        }

        if (ac.signal.aborted || seq !== loadSeqRef.current) return;

        setTsxPath(normalizeForScope(activePath, "templates"));
        setTsx(code);
        setCssPath(cssGuess || "");
        setCss(cssCode);

        originalRef.current = {
          tsx: code,
          css: cssCode,
          tsxPath: normalizeForScope(activePath, "templates"),
          cssPath: cssGuess || "",
        };
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setToast({ type: "err", msg: e?.message || "Load file failed" });
      } finally {
        if (!ac.signal.aborted && seq === loadSeqRef.current) setFileLoading(false);
      }
    })();

    return () => ac.abort();
  }, [activePath]);

  const save = useCallback(async () => {
    if (!tsxPath) return;
    try {
      setSaving(true);
      setToast(null);

      await apiWrite(tsxPath, tsx, "templates");
      if (cssPath) await apiWrite(cssPath, css, "styles");

      originalRef.current = { tsx, css, tsxPath, cssPath };
      setToast({ type: "ok", msg: "Saved successfully" });
    } catch (e: any) {
      setToast({ type: "err", msg: e?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  }, [tsxPath, tsx, cssPath, css]);

  const reset = useCallback(() => {
    setTsx(originalRef.current.tsx);
    setCss(originalRef.current.css);
    setToast(null);
  }, []);

  const createNewTemplate = useCallback(async () => {
    const kind = newKind.trim();
    const group = newGroup.trim() || "ui";
    const name = newName.trim();

    if (!kind || !name) {
      setToast({ type: "err", msg: "Kind and template name are required" });
      return;
    }

    const safe = name.replace(/\s+/g, "").replace(/[^a-zA-Z0-9_-]/g, "");
    if (!safe) {
      setToast({ type: "err", msg: "Invalid template name" });
      return;
    }

    const newTsxPath = `admin/shared/templates/${kind}/${group}/${safe}.tsx`;
    const newCssPath = `admin/shared/templates/${kind}/${group}/${safe}.module.css`;
    const cssImport = `@/${newCssPath}`;

    const tsxStub = `"use client";

import styles from "${cssImport}";

export default function ${safe}() {
  return <div className={styles.root}>${safe}</div>;
}
`;

    const cssStub = `.root {
  padding: 16px;
}
`;

    try {
      setSaving(true);
      setToast(null);

      await apiWrite(newTsxPath, tsxStub, "templates");
      await apiWrite(newCssPath, cssStub, "styles");

      await reloadList();

      setCollapsed((s) => ({ ...s, [kind]: false }));
      setVisibleCount((s) => ({ ...s, [kind]: PAGE_SIZE }));

      setActivePath(newTsxPath);
      setNewName("");

      setToast({ type: "ok", msg: "Created new template" });
    } catch (e: any) {
      setToast({ type: "err", msg: e?.message || "Create failed" });
    } finally {
      setSaving(false);
    }
  }, [newKind, newGroup, newName, reloadList]);

  const deleteTemplate = useCallback(async () => {
    if (!tsxPath) return;

    if (tsxPath.includes("/shopGreen/")) {
      setToast({ type: "err", msg: "Không cho xóa shopGreen vì đang được import tĩnh (sẽ vỡ build)." });
      return;
    }

    const ok = confirm("Delete this template permanently? (may break build if referenced)");
    if (!ok) return;

    try {
      setSaving(true);
      setToast(null);

      await apiDelete(tsxPath, "templates");
      if (cssPath) await apiDelete(cssPath, "styles");

      const list = await reloadList();
      const next = list[0]?.path || "";
      setActivePath(next);

      if (!next) {
        setTsxPath("");
        setTsx("");
        setCssPath("");
        setCss("");
        originalRef.current = { tsx: "", css: "", tsxPath: "", cssPath: "" };
      }

      setToast({ type: "ok", msg: "Template deleted" });
    } catch (e: any) {
      setToast({ type: "err", msg: e?.message || "Delete failed" });
    } finally {
      setSaving(false);
    }
  }, [tsxPath, cssPath, reloadList]);

  const deleteCssOnly = useCallback(async () => {
    if (!cssPath) {
      setToast({ type: "err", msg: "No css module to delete" });
      return;
    }

    const ok = confirm("Delete CSS module permanently?");
    if (!ok) return;

    try {
      setSaving(true);
      setToast(null);

      await apiDelete(cssPath, "styles");

      setCss("");
      setCssPath("");

      originalRef.current = {
        ...originalRef.current,
        css: "",
        cssPath: "",
      };

      setToast({ type: "ok", msg: "CSS module deleted" });
    } catch (e: any) {
      setToast({ type: "err", msg: e?.message || "Delete css failed" });
    } finally {
      setSaving(false);
    }
  }, [cssPath]);

  const disableReset = !isDirty || listLoading || fileLoading || saving;
  const disableSave = !isDirty || !tsxPath || listLoading || fileLoading || saving;
  const disableDelete = !tsxPath || listLoading || fileLoading || saving;
  const disableCreate = saving || listLoading || !newKind.trim() || !newName.trim();

  return {
    // filters
    kindFilter,
    setKindFilter,
    query,
    setQuery,

    // list
    items,
    kinds,
    grouped,
    activePath,
    setActivePath,
    listLoading,

    // collapse + paging
    collapsed,
    toggleKind,
    visibleCount,
    setVisibleCount,

    // editor
    tsxPath,
    tsx,
    setTsx,
    cssPath,
    css,
    setCss,
    fileLoading,

    // create
    newKind,
    setNewKind,
    newGroup,
    setNewGroup,
    newName,
    setNewName,
    disableCreate,
    createNewTemplate,

    // actions
    isDirty,
    saving,
    toast,
    setToast,
    save,
    reset,
    deleteTemplate,
    deleteCssOnly,

    // disables
    disableReset,
    disableSave,
    disableDelete,
  };
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ECOMMERCE_INTERNAL_PAGES, ECOMMERCE_HEADER_FULL, ECOMMERCE_ADMIN_FULL } from "@/constants/ecommerce.menu";
import { fetchMenuItems, saveMenuTree, type DbMenuItem } from "@/services/builder/menus/menuItems.service";

export type MenuSetKey = "home" | "v1";
export type SiteKind = "ecommerce";
export type TemplateKey = "header" | "sidebar" | "mega" | "drawer";

export type InternalPage = {
  id: string;
  path: string;
  label: string;
  labelVi?: string;
  aliases?: string[];
  tags?: string[];
};

export type TemplateAllowed = {
  [template in TemplateKey]?: string[] | { home: string[]; dashboard?: string[] };
};

export type BuilderMenuItem = {
  id: string;
  title: string;
  icon?: string | null;
  visible?: boolean;
  linkType: "external" | "internal" | "scheduled";
  externalUrl?: string;
  newTab?: boolean;
  internalPageId?: string;
  rawPath?: string | null;
  schedules?: Array<{ when: string; url: string }>;
  children?: BuilderMenuItem[];
};

type DbTreeNode = DbMenuItem & { children: DbTreeNode[] };

function buildTree(rows: DbMenuItem[]): DbTreeNode[] {
  const byId = new Map<string, DbTreeNode>();
  const roots: DbTreeNode[] = [];
  const sorted = rows.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title));

  for (const r of sorted) byId.set(r.id, { ...r, children: [] });

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId)!.children.push(node);
    else roots.push(node);
  }

  return roots;
}

function normalizePath(p?: string | null): string | null {
  if (!p) return null;
  let s = p.trim();
  s = s.split("#")[0].split("?")[0];
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function inferLinkFromPath(
  path: string | null | undefined,
  internalPages: InternalPage[],
): {
  linkType: BuilderMenuItem["linkType"];
  externalUrl?: string;
  internalPageId?: string;
  rawPath?: string | null;
} {
  const raw = path ?? null;
  const norm = normalizePath(path);
  if (!norm) return { linkType: "internal", rawPath: raw };

  const isExternal = /^https?:\/\//i.test(norm);
  if (isExternal) return { linkType: "external", externalUrl: raw ?? undefined, rawPath: raw };

  const pageId = internalPages.find((p) => normalizePath(p.path) === norm)?.id;
  if (pageId) return { linkType: "internal", internalPageId: pageId, rawPath: raw };

  return { linkType: "internal", internalPageId: undefined, rawPath: raw };
}

function mapDbTreeToBuilder(nodes: DbTreeNode[], internalPages: InternalPage[]): BuilderMenuItem[] {
  const walk = (n: DbTreeNode): BuilderMenuItem => {
    const inferred = inferLinkFromPath(n.path, internalPages);
    return {
      id: n.id,
      title: n.title,
      icon: n.icon ?? undefined,
      linkType: inferred.linkType,
      externalUrl: inferred.externalUrl,
      internalPageId: inferred.internalPageId,
      rawPath: inferred.rawPath ?? n.path ?? null,
      schedules: [],
      children: (n.children ?? []).map(walk),
    };
  };
  return nodes.map(walk);
}

function resolvePathFromBuilder(item: BuilderMenuItem, internalPages: InternalPage[]): string | null {
  const raw = typeof item.rawPath === "string" ? item.rawPath.trim() : "";
  if (raw) return normalizePath(raw);

  if (item.linkType === "external") return item.externalUrl?.trim() || null;

  if (item.linkType === "internal") {
    const p = item.internalPageId ? internalPages.find((x) => x.id === item.internalPageId) : undefined;
    return p?.path ? normalizePath(p.path) : null;
  }
  return null;
}

function flattenBuilderToDb(
  tree: BuilderMenuItem[],
  setKey: MenuSetKey,
  internalPages: InternalPage[],
): Array<{
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  setKey: MenuSetKey;
}> {
  const out: Array<{
    id: string;
    parentId: string | null;
    title: string;
    path: string | null;
    icon: string | null;
    sortOrder: number;
    visible: boolean;
    setKey: MenuSetKey;
  }> = [];

  const walk = (nodes: BuilderMenuItem[], parentId: string | null) => {
    nodes.forEach((n, idx) => {
      out.push({
        id: n.id,
        parentId,
        title: n.title,
        path: resolvePathFromBuilder(n, internalPages),
        icon: (n.icon ?? null) as any,
        sortOrder: idx + 1,
        visible: true,
        setKey,
      });
      if (n.children?.length) walk(n.children, n.id);
    });
  };

  walk(tree, null);
  return out;
}

const LS_KEY = "menu_builder_v2_dualsets";

export const ECOM_CATEGORY_PRESETS = {
  level1: ["Fashion", "Electronics", "Home Appliances", "Books"],
  level2ByL1: {
    Fashion: ["Shirt", "Jeans", "Shoes", "Accessories"],
    Electronics: ["TV", "Phone", "Laptop", "Headphones"],
    "Home Appliances": ["Air Fryer", "Rice Cooker", "Air Purifier", "Vacuum Cleaner"],
    Books: ["New Books", "Business", "Skills", "Children"],
  },
};

const INTERNAL_PAGE_SETS: Record<SiteKind, InternalPage[]> = {
  ecommerce: ECOMMERCE_INTERNAL_PAGES,
};

const TEMPLATE_ALLOWED_BY_SITE: Record<SiteKind, TemplateAllowed> = {
  ecommerce: {
    header: {
      home: [...ECOMMERCE_HEADER_FULL],
      dashboard: [...ECOMMERCE_ADMIN_FULL],
    },
  },
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

type MenuState = { home: BuilderMenuItem[]; v1: BuilderMenuItem[] };

type Ctx = {
  siteKind: SiteKind;
  setSiteKind: (k: SiteKind) => void;
  templateKey: TemplateKey;
  setTemplateKey: (k: TemplateKey) => void;

  menus: MenuState;
  setMenus: React.Dispatch<React.SetStateAction<MenuState>>;
  currentSet: MenuSetKey;
  setCurrentSet: (k: MenuSetKey) => void;

  activeMenu: BuilderMenuItem[];
  setActiveMenu: (next: BuilderMenuItem[] | ((prev: BuilderMenuItem[]) => BuilderMenuItem[])) => void;

  addBlankItem: () => void;
  buildHref: (it: BuilderMenuItem, now: Date) => string;
  TEMPLATE_ALLOWED: TemplateAllowed;
  INTERNAL_PAGES: InternalPage[];
  loadFromServer: (setKey: MenuSetKey, siteId?: string) => Promise<void>;
  saveToServer: (setKey: MenuSetKey, siteId?: string) => Promise<void>;
};

const MenuCtx = createContext<Ctx | null>(null);

export function MenuStoreProvider({ children }: { children: ReactNode }) {
  const [siteKind, setSiteKind] = useState<SiteKind>("ecommerce");
  const [templateKey, setTemplateKey] = useState<TemplateKey>("header");
  const [menus, setMenus] = useState<MenuState>({ home: [], v1: [] });
  const [currentSet, setCurrentSet] = useState<MenuSetKey>("home");
  const INTERNAL_PAGES = useMemo(() => INTERNAL_PAGE_SETS[siteKind], [siteKind]);
  const TEMPLATE_ALLOWED = useMemo(() => TEMPLATE_ALLOWED_BY_SITE[siteKind], [siteKind]);
  const inflight = useRef<AbortController | null>(null);
  const inflightKey = useRef<string>("");
  const loadedKey = useRef<string>("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setMenus(parsed);
    } catch {}
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(menus));
      } catch {}
    }, 250);

    return () => window.clearTimeout(t);
  }, [menus]);

  useEffect(() => {
    return () => {
      inflight.current?.abort();
      inflight.current = null;
    };
  }, []);

  const activeMenu = menus[currentSet] ?? [];
  const setActiveMenu = (next: any) =>
    setMenus((m) => ({
      ...m,
      [currentSet]: typeof next === "function" ? next(m[currentSet]) : next,
    }));

  function addBlankItem() {
    const item: BuilderMenuItem = {
      id: uid(),
      title: "New Item",
      icon: "",
      linkType: "internal",
      externalUrl: "",
      newTab: false,
      internalPageId: "home",
      rawPath: "/",
      schedules: [],
      children: [],
    };

    setActiveMenu([...(activeMenu || []), item]);
  }

  function buildHref(it: BuilderMenuItem, now: Date): string {
    if (it.linkType === "scheduled") {
      const schedules = it.schedules || [];
      const pick = schedules
        .map((s) => ({ when: new Date(s.when), url: s.url }))
        .filter((s) => !isNaN(s.when.getTime()) && s.when <= now && !!s.url)
        .sort((a, b) => b.when.getTime() - a.when.getTime())[0];

      return pick?.url || "";
    }

    if (it.linkType === "external") {
      const raw = typeof it.rawPath === "string" ? it.rawPath.trim() : "";
      return it.externalUrl?.trim() || raw || "";
    }

    if (it.linkType === "internal") {
      const raw = typeof it.rawPath === "string" ? it.rawPath.trim() : "";
      if (raw) return raw;
      const p = it.internalPageId ? INTERNAL_PAGES.find((x) => x.id === it.internalPageId) : undefined;
      return p?.path ?? "";
    }

    return "";
  }

  const loadFromServer = useCallback(
    async (setKey: MenuSetKey, siteId?: string) => {
      const reqKey = `${setKey}|${siteId ?? ""}`;

      if (inflight.current && inflightKey.current === reqKey) return;
      if (!inflight.current && loadedKey.current === reqKey) return;
      if (inflight.current) inflight.current.abort();

      const ac = new AbortController();
      inflight.current = ac;
      inflightKey.current = reqKey;

      try {
        const rows = await fetchMenuItems({
          setKey,
          siteId,
          page: 1,
          size: 1000,
          signal: ac.signal,
        });

        const treeDb = buildTree(rows);
        const builderTree = mapDbTreeToBuilder(treeDb, INTERNAL_PAGES);

        setMenus((m) => ({ ...m, [setKey]: builderTree }));
        loadedKey.current = reqKey;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        throw err;
      } finally {
        if (inflight.current === ac) {
          inflight.current = null;
          inflightKey.current = "";
        }
      }
    },
    [INTERNAL_PAGES],
  );

  const saveToServer = useCallback(
    async (setKey: MenuSetKey, siteId?: string) => {
      const treeToSave = menus[setKey] ?? [];
      const items = flattenBuilderToDb(treeToSave, setKey, INTERNAL_PAGES);

      await saveMenuTree({ setKey, siteId, items });

      loadedKey.current = `${setKey}|${siteId ?? ""}`;
    },
    [menus, INTERNAL_PAGES],
  );

  return (
    <MenuCtx.Provider
      value={{
        siteKind,
        setSiteKind,
        templateKey,
        setTemplateKey,
        menus,
        setMenus,
        currentSet,
        setCurrentSet,
        activeMenu,
        setActiveMenu,
        addBlankItem,
        buildHref,
        loadFromServer,
        saveToServer,
        TEMPLATE_ALLOWED,
        INTERNAL_PAGES,
      }}
    >
      {children}
    </MenuCtx.Provider>
  );
}

export function useMenuStore() {
  const ctx = useContext(MenuCtx);
  if (!ctx) throw new Error("useMenuStore must be used inside <MenuStoreProvider>");
  return ctx;
}

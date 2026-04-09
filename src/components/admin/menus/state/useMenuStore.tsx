"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BLOG_HEADER_BASIC,
  BOOKING_HEADER_BASIC,
  COMPANY_HEADER_BASIC,
  DIRECTORY_HEADER_BASIC,
  ECOMMERCE_HEADER_FULL,
  INTERNAL_PAGE_SETS,
  LMS_HEADER_BASIC,
  NEWS_HEADER_BASIC,
  LANDING_HEADER_BASIC,
  TEMPLATE_ALLOWED_BY_SITE,
} from "@/constants/ecommerce.menu";
import {
  fetchMenuItems,
  saveMenuTree,
  type DbMenuItem,
} from "@/services/menus/menuItems.service";

export type MenuSetKey = "home" | "v1";

export type SiteKind =
  | "landing"
  | "blog"
  | "company"
  | "ecommerce"
  | "booking"
  | "news"
  | "lms"
  | "directory";

export type TemplateKey = "header" | "sidebar" | "mega" | "drawer";

export type InternalPage = {
  id: string;
  path: string;
  label: string;
  labelVi?: string;
  icon?: string;
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
  internalPageId?: string | null;
  rawPath?: string | null;
  schedules?: Array<{ when: string; url: string }>;
  children?: BuilderMenuItem[];
};

type DbTreeNode = DbMenuItem & { children: DbTreeNode[] };
type MenuState = { home: BuilderMenuItem[]; v1: BuilderMenuItem[] };

const LS_KEY = "menu_builder_v2_dualsets";

export const ECOM_CATEGORY_PRESETS = {
  level1: ["Fashion", "Electronics", "Home Appliances", "Books"],
  level2ByL1: {
    Fashion: ["Shirt", "Jeans", "Shoes", "Accessories"],
    Electronics: ["TV", "Phone", "Laptop", "Headphones"],
    "Home Appliances": ["Air Fryer", "Rice Cooker", "Air Purifier", "Vacuum Cleaner"],
    Books: ["New Books", "Business", "Skills", "Children"],
  },
} as const;

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
  generateMenusBySiteKind: (kind: SiteKind) => void;
  findItem: (id: string, setKey?: MenuSetKey) => BuilderMenuItem | null;
  removeItemById: (id: string, setKey?: MenuSetKey) => [removed: BuilderMenuItem | null, nextRoot: BuilderMenuItem[]];
};

const MenuCtx = createContext<Ctx | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function normalizePath(value?: string | null): string | null {
  if (!value) return null;
  let result = value.trim();
  result = result.split("#")[0].split("?")[0];
  if (result.length > 1 && result.endsWith("/")) result = result.slice(0, -1);
  return result;
}

function normalizeLabel(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function buildTree(rows: DbMenuItem[]): DbTreeNode[] {
  const byId = new Map<string, DbTreeNode>();
  const roots: DbTreeNode[] = [];

  const sorted = rows
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title));

  for (const row of sorted) {
    byId.set(row.id, { ...row, children: [] });
  }

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
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
  const rawPath = path ?? null;
  const normalizedPath = normalizePath(path);

  if (!normalizedPath) {
    return { linkType: "internal", rawPath };
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return {
      linkType: "external",
      externalUrl: rawPath ?? undefined,
      rawPath,
    };
  }

  const internalPageId = internalPages.find((page) => normalizePath(page.path) === normalizedPath)?.id;

  if (internalPageId) {
    return {
      linkType: "internal",
      internalPageId,
      rawPath,
    };
  }

  return {
    linkType: "internal",
    internalPageId: undefined,
    rawPath,
  };
}

function mapDbTreeToBuilder(nodes: DbTreeNode[], internalPages: InternalPage[]): BuilderMenuItem[] {
  const walk = (node: DbTreeNode): BuilderMenuItem => {
    const inferred = inferLinkFromPath(node.path, internalPages);

    return {
      id: node.id,
      title: node.title,
      icon: node.icon ?? undefined,
      visible: node.visible ?? true,
      linkType: inferred.linkType,
      externalUrl: inferred.externalUrl,
      internalPageId: inferred.internalPageId,
      rawPath: inferred.rawPath ?? node.path ?? null,
      schedules: [],
      children: (node.children ?? []).map(walk),
    };
  };

  return nodes.map(walk);
}

function resolvePathFromBuilder(item: BuilderMenuItem, internalPages: InternalPage[]): string | null {
  const rawPath = typeof item.rawPath === "string" ? item.rawPath.trim() : "";

  if (rawPath) return normalizePath(rawPath);

  if (item.linkType === "external") {
    return item.externalUrl?.trim() || null;
  }

  if (item.linkType === "internal") {
    const page = item.internalPageId
      ? internalPages.find((candidate) => candidate.id === item.internalPageId)
      : undefined;
    return page?.path ? normalizePath(page.path) : null;
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
  const output: Array<{
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
    nodes.forEach((node, index) => {
      output.push({
        id: node.id,
        parentId,
        title: node.title,
        path: resolvePathFromBuilder(node, internalPages),
        icon: node.icon ?? null,
        sortOrder: index + 1,
        visible: node.visible ?? true,
        setKey,
      });

      if (node.children?.length) {
        walk(node.children, node.id);
      }
    });
  };

  walk(tree, null);
  return output;
}

function createInternalMenuItem(page: InternalPage): BuilderMenuItem {
  return {
    id: uid(),
    title: page.label,
    icon: page.icon ?? "",
    visible: true,
    linkType: "internal",
    externalUrl: "",
    newTab: false,
    internalPageId: page.id,
    rawPath: page.path,
    schedules: [],
    children: [],
  };
}

function buildMenuFromLabels(labels: readonly string[], pages: InternalPage[]): BuilderMenuItem[] {
  return labels
    .map((label) => {
      const match = pages.find((page) => {
        if (normalizeLabel(page.label) === normalizeLabel(label)) return true;
        if (page.labelVi && normalizeLabel(page.labelVi) === normalizeLabel(label)) return true;
        if (page.aliases?.some((alias) => normalizeLabel(alias) === normalizeLabel(label))) return true;
        return false;
      });

      return match ? createInternalMenuItem(match) : null;
    })
    .filter((item): item is BuilderMenuItem => item !== null);
}

function buildDefaultMenusBySiteKind(kind: SiteKind): MenuState {
  const pages = INTERNAL_PAGE_SETS[kind] ?? [];

  switch (kind) {
    case "landing":
      return {
        home: buildMenuFromLabels(LANDING_HEADER_BASIC, pages),
        v1: [],
      };
    case "blog":
      return {
        home: buildMenuFromLabels(BLOG_HEADER_BASIC, pages),
        v1: [],
      };
    case "company":
      return {
        home: buildMenuFromLabels(COMPANY_HEADER_BASIC, pages),
        v1: [],
      };
    case "ecommerce":
      return {
        home: buildMenuFromLabels(ECOMMERCE_HEADER_FULL, pages),
        v1: [],
      };
    case "booking":
      return {
        home: buildMenuFromLabels(BOOKING_HEADER_BASIC, pages),
        v1: [],
      };
    case "news":
      return {
        home: buildMenuFromLabels(NEWS_HEADER_BASIC, pages),
        v1: [],
      };
    case "lms":
      return {
        home: buildMenuFromLabels(LMS_HEADER_BASIC, pages),
        v1: [],
      };
    case "directory":
      return {
        home: buildMenuFromLabels(DIRECTORY_HEADER_BASIC, pages),
        v1: [],
      };
    default:
      return { home: [], v1: [] };
  }
}

export function MenuStoreProvider({ children }: { children: ReactNode }) {
  const [siteKind, setSiteKind] = useState<SiteKind>("ecommerce");
  const [templateKey, setTemplateKey] = useState<TemplateKey>("header");
  const [menus, setMenus] = useState<MenuState>({ home: [], v1: [] });
  const [currentSet, setCurrentSet] = useState<MenuSetKey>("home");

  const INTERNAL_PAGES = useMemo(() => INTERNAL_PAGE_SETS[siteKind] ?? [], [siteKind]);
  const TEMPLATE_ALLOWED = useMemo(() => TEMPLATE_ALLOWED_BY_SITE[siteKind] ?? {}, [siteKind]);

  const inflightRef = useRef<AbortController | null>(null);
  const inflightKeyRef = useRef("");
  const loadedKeyRef = useRef("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<MenuState> | null;
      if (!parsed || typeof parsed !== "object") return;

      setMenus({
        home: Array.isArray(parsed.home) ? parsed.home : [],
        v1: Array.isArray(parsed.v1) ? parsed.v1 : [],
      });
    } catch {
      // ignore invalid localStorage
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(menus));
      } catch {
        // ignore storage write errors
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [menus]);

  useEffect(() => {
    return () => {
      inflightRef.current?.abort();
      inflightRef.current = null;
    };
  }, []);

  const activeMenu = useMemo(() => menus[currentSet] ?? [], [menus, currentSet]);

  const setActiveMenu = useCallback(
    (next: BuilderMenuItem[] | ((prev: BuilderMenuItem[]) => BuilderMenuItem[])) => {
      setMenus((prev) => ({
        ...prev,
        [currentSet]: typeof next === "function" ? next(prev[currentSet] ?? []) : next,
      }));
    },
    [currentSet],
  );

  const addBlankItem = useCallback(() => {
    const item: BuilderMenuItem = {
      id: uid(),
      title: "New Item",
      icon: "",
      visible: true,
      linkType: "internal",
      externalUrl: "",
      newTab: false,
      internalPageId: INTERNAL_PAGES[0]?.id ?? null,
      rawPath: INTERNAL_PAGES[0]?.path ?? "/",
      schedules: [],
      children: [],
    };

    setActiveMenu((prev) => [...prev, item]);
  }, [INTERNAL_PAGES, setActiveMenu]);

  const buildHref = useCallback(
    (item: BuilderMenuItem, now: Date): string => {
      if (item.linkType === "scheduled") {
        const chosen = (item.schedules ?? [])
          .map((schedule) => ({ when: new Date(schedule.when), url: schedule.url }))
          .filter((schedule) => !Number.isNaN(schedule.when.getTime()) && schedule.when <= now && !!schedule.url)
          .sort((a, b) => b.when.getTime() - a.when.getTime())[0];

        return chosen?.url || "";
      }

      if (item.linkType === "external") {
        const rawPath = typeof item.rawPath === "string" ? item.rawPath.trim() : "";
        return item.externalUrl?.trim() || rawPath || "";
      }

      if (item.linkType === "internal") {
        const rawPath = typeof item.rawPath === "string" ? item.rawPath.trim() : "";
        if (rawPath) return rawPath;

        const page = item.internalPageId
          ? INTERNAL_PAGES.find((candidate) => candidate.id === item.internalPageId)
          : undefined;

        return page?.path ?? "";
      }

      return "";
    },
    [INTERNAL_PAGES],
  );

  const generateMenusBySiteKind = useCallback((kind: SiteKind) => {
    setMenus(buildDefaultMenusBySiteKind(kind));
    setCurrentSet("home");
  }, []);

  const findItem = useCallback(
    (id: string, setKey?: MenuSetKey): BuilderMenuItem | null => {
      const root = menus[setKey ?? currentSet] ?? [];

      const walk = (nodes: BuilderMenuItem[]): BuilderMenuItem | null => {
        for (const node of nodes) {
          if (node.id === id) return node;
          const found = node.children?.length ? walk(node.children) : null;
          if (found) return found;
        }
        return null;
      };

      return walk(root);
    },
    [menus, currentSet],
  );

  const removeItemById = useCallback(
    (id: string, setKey?: MenuSetKey): [BuilderMenuItem | null, BuilderMenuItem[]] => {
      const root = menus[setKey ?? currentSet] ?? [];
      let removed: BuilderMenuItem | null = null;

      const removeWalk = (nodes: BuilderMenuItem[]): BuilderMenuItem[] => {
        const nextNodes: BuilderMenuItem[] = [];

        for (const node of nodes) {
          if (node.id === id) {
            removed = node;
            continue;
          }

          const nextChildren = node.children?.length ? removeWalk(node.children) : (node.children ?? []);
          nextNodes.push({ ...node, children: nextChildren });
        }

        return nextNodes;
      };

      return [removed, removeWalk(root)];
    },
    [menus, currentSet],
  );

  const loadFromServer = useCallback(
    async (setKey: MenuSetKey, siteId?: string) => {
      const requestKey = `${setKey}|${siteId ?? ""}|${siteKind}`;

      if (inflightRef.current && inflightKeyRef.current === requestKey) return;
      if (!inflightRef.current && loadedKeyRef.current === requestKey) return;

      inflightRef.current?.abort();

      const controller = new AbortController();
      inflightRef.current = controller;
      inflightKeyRef.current = requestKey;

      try {
        const rows = await fetchMenuItems({
          setKey,
          siteId,
          page: 1,
          size: 1000,
          signal: controller.signal,
        });

        const treeDb = buildTree(rows);
        const builderTree = mapDbTreeToBuilder(treeDb, INTERNAL_PAGES);

        setMenus((prev) => ({
          ...prev,
          [setKey]: builderTree,
        }));

        loadedKeyRef.current = requestKey;
      } catch (error: unknown) {
        if ((error as Error)?.name === "AbortError") return;
        throw error;
      } finally {
        if (inflightRef.current === controller) {
          inflightRef.current = null;
          inflightKeyRef.current = "";
        }
      }
    },
    [INTERNAL_PAGES, siteKind],
  );

  const saveToServer = useCallback(
    async (setKey: MenuSetKey, siteId?: string) => {
      const treeToSave = menus[setKey] ?? [];
      const items = flattenBuilderToDb(treeToSave, setKey, INTERNAL_PAGES);

      await saveMenuTree({ setKey, siteId, items });

      loadedKeyRef.current = `${setKey}|${siteId ?? ""}|${siteKind}`;
    },
    [menus, INTERNAL_PAGES, siteKind],
  );

  const value = useMemo<Ctx>(
    () => ({
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
      TEMPLATE_ALLOWED,
      INTERNAL_PAGES,
      loadFromServer,
      saveToServer,
      generateMenusBySiteKind,
      findItem,
      removeItemById,
    }),
    [
      siteKind,
      templateKey,
      menus,
      currentSet,
      activeMenu,
      setActiveMenu,
      addBlankItem,
      buildHref,
      TEMPLATE_ALLOWED,
      INTERNAL_PAGES,
      loadFromServer,
      saveToServer,
      generateMenusBySiteKind,
      findItem,
      removeItemById,
    ],
  );

  return <MenuCtx.Provider value={value}>{children}</MenuCtx.Provider>;
}

export function useMenuStore() {
  const context = useContext(MenuCtx);
  if (!context) {
    throw new Error("useMenuStore must be used inside <MenuStoreProvider>");
  }
  return context;
}
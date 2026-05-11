"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  ECOMMERCE_HEADER_FULL,
  INTERNAL_PAGE_SETS,
  TEMPLATE_ALLOWED_BY_SITE,
  LANDING_PAGE_IDS,
} from "@/constants/ecommerce.menu";

import { fetchMenuItems, saveMenuTree, type DbMenuItem } from "@/services/menus/menuItems.service";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

export type MenuSetKey = "home" | "v1";

export type SiteKind = "ecommerce" | "landing" | "blog" | "booking" | "news" | "lms";

export type TemplateKey = "header" | "sidebar" | "mega" | "drawer";

export type MenuLocale = "en" | "vi" | "ja";

export type InternalPage = {
  id: string;

  paths: Record<MenuLocale, string>;

  labelKey: string;

  icon?: string;

  aliases?: string[];

  tags?: string[];
};

export type TemplateAllowed = {
  [template in TemplateKey]?:
    | string[]
    | {
        home: string[];
        dashboard?: string[];
      };
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

  schedules?: Array<{
    when: string;
    url: string;
  }>;

  children?: BuilderMenuItem[];
  isLocal?: boolean;
};

type DbTreeNode = DbMenuItem & {
  children: DbTreeNode[];
};

type MenuState = {
  home: BuilderMenuItem[];
  v1: BuilderMenuItem[];
};

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

  loadFromServer: (setKey: MenuSetKey, siteId?: string, maxMenus?: number) => Promise<void>;

  saveToServer: (setKey: MenuSetKey, siteId?: string, maxMenus?: number) => Promise<void>;

  generateMenusBySiteKind: (kind: SiteKind, maxMenus?: number) => void;

  findItem: (id: string, setKey?: MenuSetKey) => BuilderMenuItem | null;

  removeItemById: (id: string, setKey?: MenuSetKey) => [BuilderMenuItem | null, BuilderMenuItem[]];
};

const MenuCtx = createContext<Ctx | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function normalizePath(value?: string | null): string | null {
  if (!value) return null;

  let result = value.trim();

  result = result.split("#")[0].split("?")[0];

  if (result.length > 1 && result.endsWith("/")) {
    result = result.slice(0, -1);
  }

  return result;
}

function buildTree(rows: DbMenuItem[]): DbTreeNode[] {
  const byId = new Map<string, DbTreeNode>();

  const roots: DbTreeNode[] = [];

  const sorted = rows.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title));

  for (const row of sorted) {
    byId.set(row.id, {
      ...row,
      children: [],
    });
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

function getPagePath(page: InternalPage, locale: MenuLocale): string {
  return page.paths[locale] ?? page.paths.en ?? "/";
}

function inferLinkFromPath(path: string | null | undefined, internalPages: InternalPage[]) {
  const rawPath = path ?? null;

  const normalizedPath = normalizePath(path);

  if (!normalizedPath) {
    return {
      linkType: "internal" as const,

      rawPath,
    };
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return {
      linkType: "external" as const,

      externalUrl: rawPath ?? undefined,

      rawPath,
    };
  }

  const internalPageId = internalPages.find((page) =>
    Object.values(page.paths).some((p) => normalizePath(p) === normalizedPath),
  )?.id;

  if (internalPageId) {
    return {
      linkType: "internal" as const,

      internalPageId,

      rawPath,
    };
  }

  return {
    linkType: "internal" as const,

    internalPageId: undefined,

    rawPath,
  };
}

function mapDbTreeToBuilder(
  nodes: DbTreeNode[],
  internalPages: InternalPage[],
  locale: MenuLocale,
  t: (key: string) => string,
): BuilderMenuItem[] {
  const walk = (node: DbTreeNode): BuilderMenuItem => {
    const inferred = inferLinkFromPath(node.path, internalPages);

    const matchedPage = inferred.internalPageId
      ? internalPages.find((page) => page.id === inferred.internalPageId)
      : undefined;

    const isInternal = inferred.linkType === "internal" && !!matchedPage;

    return {
      id: node.id,

      title: isInternal ? t(matchedPage.labelKey) : node.title,

      icon: node.icon ?? matchedPage?.icon ?? undefined,

      visible: node.visible ?? true,

      linkType: inferred.linkType,

      externalUrl: inferred.externalUrl,

      internalPageId: inferred.internalPageId,

      rawPath: isInternal ? getPagePath(matchedPage, locale) : (inferred.rawPath ?? node.path ?? null),

      schedules: [],

      children: node.children?.map(walk) ?? [],
    };
  };

  return nodes.map(walk);
}

function resolvePathFromBuilder(
  item: BuilderMenuItem,
  internalPages: InternalPage[],
  locale: MenuLocale,
): string | null {
  const rawPath = typeof item.rawPath === "string" ? item.rawPath.trim() : "";

  if (rawPath) {
    return normalizePath(rawPath);
  }

  if (item.linkType === "external") {
    return item.externalUrl?.trim() ?? null;
  }

  if (item.linkType === "internal") {
    const page = item.internalPageId
      ? internalPages.find((candidate) => candidate.id === item.internalPageId)
      : undefined;

    return page ? normalizePath(getPagePath(page, locale)) : null;
  }

  return null;
}

function flattenBuilderToDb(
  tree: BuilderMenuItem[],
  setKey: MenuSetKey,
  internalPages: InternalPage[],
  locale: MenuLocale,
) {
  const output: any[] = [];

  const walk = (nodes: BuilderMenuItem[], parentId: string | null) => {
    nodes.forEach((node, index) => {
      output.push({
        id: node.id,

        parentId,

        title: node.title,

        path: resolvePathFromBuilder(node, internalPages, locale),

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

function createInternalMenuItem(page: InternalPage, locale: MenuLocale, t: (key: string) => string): BuilderMenuItem {
  return {
    id: uid(),

    title: t(page.labelKey),

    icon: page.icon ?? "",

    visible: true,

    linkType: "internal",

    externalUrl: "",

    newTab: false,

    internalPageId: page.id,

    rawPath: getPagePath(page, locale),

    schedules: [],

    children: [],
  };
}

function buildMenuFromPageIds(
  pageIds: readonly string[],
  pages: InternalPage[],
  locale: MenuLocale,
  t: (key: string) => string,
): BuilderMenuItem[] {
  return pageIds
    .map((pageId) => {
      const match = pages.find((page) => page.id === pageId);

      return match ? createInternalMenuItem(match, locale, t) : null;
    })
    .filter(Boolean) as BuilderMenuItem[];
}

function buildDefaultMenusBySiteKind(kind: SiteKind, locale: MenuLocale, t: (key: string) => string): MenuState {
  const pages = INTERNAL_PAGE_SETS[kind] ?? [];

  switch (kind) {
    case "ecommerce":
      return {
        home: buildMenuFromPageIds(ECOMMERCE_HEADER_FULL, pages, locale, t),

        v1: [],
      };

    default:
      return {
        home: buildMenuFromPageIds(LANDING_PAGE_IDS, pages, locale, t),

        v1: [],
      };
  }
}

export function MenuStoreProvider({ children }: { children: ReactNode }) {
  const [siteKind, setSiteKind] = useState<SiteKind>("ecommerce");

  const [templateKey, setTemplateKey] = useState<TemplateKey>("header");

  const [menus, setMenus] = useState<MenuState>({
    home: [],
    v1: [],
  });

  const [currentSet, setCurrentSet] = useState<MenuSetKey>("home");

  const { t, locale } = useAdminI18n();

  const currentLocale = (locale ?? "en") as MenuLocale;

  const INTERNAL_PAGES = useMemo(() => INTERNAL_PAGE_SETS[siteKind] ?? [], [siteKind]);

  const TEMPLATE_ALLOWED = useMemo(() => TEMPLATE_ALLOWED_BY_SITE[siteKind] ?? {}, [siteKind]);

  const inflightRef = useRef<AbortController | null>(null);

  const inflightKeyRef = useRef("");

  const loadedKeyRef = useRef("");

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
    const firstPage = INTERNAL_PAGES[0];

    const item: BuilderMenuItem = {
      id: uid(),

      title: t("pages.newItem"),

      icon: "",

      visible: true,

      linkType: "internal",

      externalUrl: "",

      newTab: false,

      internalPageId: firstPage?.id ?? null,

      rawPath: firstPage ? getPagePath(firstPage, currentLocale) : "/",

      schedules: [],

      children: [],
    };

    setActiveMenu((prev) => [...prev, item]);
  }, [INTERNAL_PAGES, currentLocale, setActiveMenu, t]);

  const buildHref = useCallback((item: BuilderMenuItem, now: Date) => {
    if (item.linkType === "external") {
      return item.externalUrl ?? "";
    }

    if (item.linkType === "internal") {
      return item.rawPath ?? "";
    }

    return "";
  }, []);

  const generateMenusBySiteKind = useCallback(
    (kind: SiteKind, maxMenus = Number.MAX_SAFE_INTEGER) => {
      const generatedMenus = buildDefaultMenusBySiteKind(kind, currentLocale, t);

      setMenus({
        home: generatedMenus.home.slice(0, maxMenus),

        v1: generatedMenus.v1.slice(0, maxMenus),
      });

      setCurrentSet("home");
    },
    [currentLocale, t],
  );

  const findItem = useCallback(
    (id: string, setKey?: MenuSetKey) => {
      const root = menus[setKey ?? currentSet] ?? [];

      const walk = (nodes: BuilderMenuItem[]): BuilderMenuItem | null => {
        for (const node of nodes) {
          if (node.id === id) {
            return node;
          }

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
    (id: string, setKey?: MenuSetKey) => {
      const root = menus[setKey ?? currentSet] ?? [];

      let removed: BuilderMenuItem | null = null;

      const removeWalk = (nodes: BuilderMenuItem[]): BuilderMenuItem[] => {
        const nextNodes: BuilderMenuItem[] = [];

        for (const node of nodes) {
          if (node.id === id) {
            removed = node;
            continue;
          }

          nextNodes.push({
            ...node,

            children: node.children?.length ? removeWalk(node.children) : [],
          });
        }

        return nextNodes;
      };

      return [removed, removeWalk(root)] as [BuilderMenuItem | null, BuilderMenuItem[]];
    },
    [menus, currentSet],
  );

  const loadFromServer = useCallback(
    async (setKey: MenuSetKey, siteId?: string, maxMenus = Number.MAX_SAFE_INTEGER) => {
      const requestKey = `${setKey}|${siteId ?? ""}|${siteKind}|${currentLocale}`;

      if (inflightRef.current && inflightKeyRef.current === requestKey) {
        return;
      }

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

        const builderTree = mapDbTreeToBuilder(treeDb, INTERNAL_PAGES, currentLocale, t).slice(0, maxMenus);

        setMenus((prev) => ({
          ...prev,

          [setKey]: builderTree,
        }));

        loadedKeyRef.current = requestKey;
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }

        throw error;
      } finally {
        if (inflightRef.current === controller) {
          inflightRef.current = null;

          inflightKeyRef.current = "";
        }
      }
    },
    [INTERNAL_PAGES, siteKind, currentLocale, t],
  );

  const saveToServer = useCallback(
    async (setKey: MenuSetKey, siteId?: string, maxMenus = Number.MAX_SAFE_INTEGER) => {
      const treeToSave = (menus[setKey] ?? []).slice(0, maxMenus);

      const items = flattenBuilderToDb(treeToSave, setKey, INTERNAL_PAGES, currentLocale);

      await saveMenuTree({
        setKey,
        siteId,
        items,
      });

      loadedKeyRef.current = `${setKey}|${siteId ?? ""}|${siteKind}|${currentLocale}`;
    },
    [menus, INTERNAL_PAGES, currentLocale, siteKind],
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

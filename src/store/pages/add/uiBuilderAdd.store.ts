// src/lib/ui-builder/store/uiBuilderAdd.store.ts
import React from "react";
import type { Block, SEO } from "@/lib/page/types";

export type ViewMode = "design" | "preview";
export type Device = "desktop" | "tablet" | "mobile";

export type UiBuilderAddState = {
  blocks: Block[];
  activeId: string | null;
  mode: ViewMode;
  device: Device;

  title: string;
  slug: string;
  pageId: string | null;

  saving: boolean;
  publishing: boolean;

  search: string;

  seo: SEO;
};

export type UiBuilderAddAction =
  | { type: "setBlocks"; blocks: Block[] }
  | { type: "appendBlocks"; blocks: Block[] }
  | { type: "setActiveId"; id: string | null }
  | { type: "setMode"; mode: ViewMode }
  | { type: "setDevice"; device: Device }
  | { type: "setTitle"; title: string }
  | { type: "setSlug"; slug: string }
  | { type: "setPageId"; pageId: string | null }
  | { type: "setSaving"; saving: boolean }
  | { type: "setPublishing"; publishing: boolean }
  | { type: "setSearch"; search: string }
  | { type: "setSeo"; seo: SEO }
  | { type: "patchSeo"; patch: Partial<SEO> };

export function makeInitialState(initialId: string | null): UiBuilderAddState {
  return {
    blocks: [],
    activeId: null,
    mode: "design",
    device: "desktop",
    title: "",
    slug: "",
    pageId: initialId,
    saving: false,
    publishing: false,
    search: "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      canonicalUrl: "",
      noindex: false,
      nofollow: false,
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      sitemapChangefreq: "weekly",
      sitemapPriority: 0.7,
      structuredData: "",
    },
  };
}

export function reducer(state: UiBuilderAddState, action: UiBuilderAddAction): UiBuilderAddState {
  switch (action.type) {
    case "setBlocks":
      return { ...state, blocks: action.blocks };
    case "appendBlocks":
      return { ...state, blocks: [...state.blocks, ...action.blocks] };
    case "setActiveId":
      return { ...state, activeId: action.id };
    case "setMode":
      return { ...state, mode: action.mode };
    case "setDevice":
      return { ...state, device: action.device };
    case "setTitle":
      return { ...state, title: action.title };
    case "setSlug":
      return { ...state, slug: action.slug };
    case "setPageId":
      return { ...state, pageId: action.pageId };
    case "setSaving":
      return { ...state, saving: action.saving };
    case "setPublishing":
      return { ...state, publishing: action.publishing };
    case "setSearch":
      return { ...state, search: action.search };
    case "setSeo":
      return { ...state, seo: action.seo };
    case "patchSeo":
      return { ...state, seo: { ...state.seo, ...action.patch } };
    default:
      return state;
  }
}

export function useUiBuilderAddStore(initialId: string | null) {
  return React.useReducer(reducer, initialId, makeInitialState);
}

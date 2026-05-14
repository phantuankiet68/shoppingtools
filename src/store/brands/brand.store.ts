import { create } from "zustand";
import type { BrandMode, BrandRow, LogoFilter, SortBy } from "@/features/commerce/brands/types";
import {
  createBrand as createBrandService,
  deleteBrand as deleteBrandService,
  getBrands,
  publishBrand as publishBrandService,
  slugify,
  updateBrand as updateBrandService,
  uploadBrandLogo,
} from "@/services/commerce/brands/brand.service";

type BrandStore = {
  items: BrandRow[];
  loading: boolean;
  saving: boolean;

  name: string;
  slug: string;
  description: string;
  logoUrl: string;

  logoFile: File | null;
  logoPreview: string;
  isDragging: boolean;

  searchText: string;
  logoFilter: LogoFilter;
  sortBy: SortBy;
  currentPage: number;
  pageSize: number;

  selectedBrandId: string | null;
  mode: BrandMode;

  setName: (value: string) => void;
  setSlug: (value: string) => void;
  setDescription: (value: string) => void;
  setLogoUrl: (value: string) => void;
  setLogoFile: (file: File | null) => void;
  setLogoPreview: (value: string) => void;
  setIsDragging: (value: boolean) => void;
  setSearchText: (value: string) => void;
  setLogoFilter: (value: LogoFilter) => void;
  setSortBy: (value: SortBy) => void;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setSelectedBrandId: (value: string | null) => void;
  setMode: (value: BrandMode) => void;

  resetLogoState: () => void;
  resetForm: () => void;
  resetAll: () => void;

  loadBrands: (siteId?: string, signal?: AbortSignal) => Promise<void>;
  createBrand: (siteId?: string) => Promise<void>;
  updateBrand: (siteId?: string) => Promise<void>;
  deleteBrand: () => Promise<void>;
  publishBrand: () => Promise<void>;

  enterEditMode: (brand: BrandRow) => void;
  pickLogoFile: (file: File | null) => string | null;
  derivedSlug: () => string;
};

export const useBrandStore = create<BrandStore>((set, get) => ({
  items: [],
  loading: false,
  saving: false,

  name: "",
  slug: "",
  description: "",
  logoUrl: "",

  logoFile: null,
  logoPreview: "",
  isDragging: false,

  searchText: "",
  logoFilter: "all",
  sortBy: "newest",
  currentPage: 1,
  pageSize: 8,

  selectedBrandId: null,
  mode: "create",

  setName: (value) => set({ name: value }),
  setSlug: (value) => set({ slug: value }),
  setDescription: (value) => set({ description: value }),
  setLogoUrl: (value) => set({ logoUrl: value }),
  setLogoFile: (file) => set({ logoFile: file }),
  setLogoPreview: (value) => set({ logoPreview: value }),
  setIsDragging: (value) => set({ isDragging: value }),
  setSearchText: (value) => set({ searchText: value, currentPage: 1 }),
  setLogoFilter: (value) => set({ logoFilter: value, currentPage: 1 }),
  setSortBy: (value) => set({ sortBy: value }),
  setCurrentPage: (value) => set({ currentPage: value }),
  setPageSize: (value) => set({ pageSize: value, currentPage: 1 }),
  setSelectedBrandId: (value) => set({ selectedBrandId: value }),
  setMode: (value) => set({ mode: value }),

  resetLogoState: () => set({ logoFile: null, logoPreview: "" }),

  resetForm: () =>
    set({
      name: "",
      slug: "",
      description: "",
      logoUrl: "",
      logoFile: null,
      logoPreview: "",
      mode: "create",
    }),

  resetAll: () =>
    set({
      name: "",
      slug: "",
      description: "",
      logoUrl: "",
      logoFile: null,
      logoPreview: "",
      selectedBrandId: null,
      mode: "create",
    }),

  derivedSlug: () => {
    const { name, slug } = get();
    return slug.trim() ? slugify(slug) : slugify(name);
  },

  pickLogoFile: (file) => {
    if (!file) return null;

    if (!file.type.startsWith("image/")) {
      return "Chỉ chấp nhận file hình ảnh.";
    }

    set({
      logoFile: file,
      logoUrl: "",
    });

    return null;
  },

  loadBrands: async (siteId, signal) => {
    set({ loading: true });

    try {
      const items = await getBrands(siteId, signal);

      set((state) => ({
        items,
        selectedBrandId:
          state.selectedBrandId && items.some((x) => x.id === state.selectedBrandId) ? state.selectedBrandId : null,
      }));
    } finally {
      set({ loading: false });
    }
  },

  createBrand: async (siteId) => {
    const state = get();
    const safeName = state.name.trim();
    const safeSlug = state.derivedSlug();
    const safeSiteId = siteId?.trim();

    if (!safeSiteId) throw new Error("Please select a site first.");
    if (!safeName) throw new Error("Name is required.");
    if (!safeSlug) throw new Error("Slug is required.");

    set({ saving: true });

    try {
      let uploadedLogoUrl: string | null = state.logoUrl.trim() || null;

      if (state.logoFile) {
        uploadedLogoUrl = await uploadBrandLogo(state.logoFile);
      }

      await createBrandService({
        name: safeName,
        slug: safeSlug,
        siteId: safeSiteId,
        description: state.description.trim() || null,
        logoUrl: uploadedLogoUrl,
      });

      get().resetAll();
      await get().loadBrands(safeSiteId);
    } finally {
      set({ saving: false });
    }
  },

  updateBrand: async (siteId) => {
    const state = get();
    const safeName = state.name.trim();
    const safeSlug = state.derivedSlug();
    const safeSiteId = siteId?.trim();

    if (!state.selectedBrandId) throw new Error("Please select a brand first.");
    if (!safeSiteId) throw new Error("Please select a site first.");
    if (!safeName) throw new Error("Name is required.");
    if (!safeSlug) throw new Error("Slug is required.");

    set({ saving: true });

    try {
      let uploadedLogoUrl: string | null = state.logoUrl.trim() || null;

      if (state.logoFile) {
        uploadedLogoUrl = await uploadBrandLogo(state.logoFile);
      }

      await updateBrandService(state.selectedBrandId, {
        name: safeName,
        slug: safeSlug,
        siteId: safeSiteId,
        description: state.description.trim() || null,
        logoUrl: uploadedLogoUrl,
      });

      get().resetAll();
      await get().loadBrands(safeSiteId);
    } finally {
      set({ saving: false });
    }
  },

  deleteBrand: async () => {
    const state = get();
    const brand = state.items.find((b) => b.id === state.selectedBrandId);

    if (!brand) throw new Error("Please select a brand first.");

    set({ saving: true });

    try {
      await deleteBrandService(brand.id);
      get().resetAll();
      await get().loadBrands(brand.siteId);
    } finally {
      set({ saving: false });
    }
  },

  publishBrand: async () => {
    const state = get();
    const brand = state.items.find((b) => b.id === state.selectedBrandId);

    if (!brand) throw new Error("Please select a brand first.");

    set({ saving: true });

    try {
      await publishBrandService(brand.id);
      await get().loadBrands(brand.siteId);
    } finally {
      set({ saving: false });
    }
  },

  enterEditMode: (brand) =>
    set({
      mode: "edit",
      selectedBrandId: brand.id,
      name: brand.name || "",
      slug: brand.slug || "",
      description: brand.description || "",
      logoUrl: brand.logoUrl || "",
      logoFile: null,
      logoPreview: "",
    }),
}));

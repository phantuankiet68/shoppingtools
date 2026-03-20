"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "@/styles/admin/commerce/products/add/ProductForm.module.css";
import Image from "next/image";
import { useModal } from "@/components/admin/shared/common/modal";
import { useSiteStore } from "@/store/site/site.store";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";

type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
type ProductType = "PHYSICAL" | "DIGITAL" | "SERVICE";

type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbUrl?: string;
  file?: File;
};

type VariantOption = { name: string; values: string[] };

type VariantRow = {
  id: string;
  title: string;
  sku: string;
  barcode?: string;
  price: string;
  compareAtPrice?: string;
  cost?: string;
  stockQty: string;
  isActive: boolean;
  isDefault: boolean;
};

type ProductFormState = {
  name: string;
  slug: string;

  categoryId: string;
  brandId: string;

  productType: ProductType;
  tags: string[];
  tagsInput: string;

  status: ProductStatus;
  isVisible: boolean;
  publishedAt: string;

  shortDescription: string;
  description: string;

  price: string;
  marketPrice: string;
  savingPrice: string;
  productQty: string;

  weight: string;
  length: string;
  width: string;
  height: string;

  metaTitle: string;
  metaDescription: string;
};

type ProductSubmitPayload = ProductFormState & {
  siteId: string;
  media: MediaItem[];
  hasVariants: boolean;
  variantOptions: VariantOption[];
  variants: VariantRow[];
};

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  count?: number;
};

type BrandItem = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

type Props = {
  editingId?: string | null;
  categories?: { id: string; name: string; isActive: boolean; count?: number }[];
  busy?: boolean;
  setBusy?: (v: boolean) => void;
  onCancel?: () => void;
  onSaved?: () => void;
  onSubmit?: (payload: ProductSubmitPayload) => void;
  siteId?: string;
};

type ApiResponse<T> = {
  items?: T[];
  data?: T[] | T;
  item?: T;
  categories?: T[];
  brands?: T[];
  error?: string;
  message?: string;
};

type ApiProductDetail = {
  id: string;
  siteId?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  shortDescription?: string | null;

  categoryId?: string | null;
  category?: { id?: string; name?: string } | null;

  brandId?: string | null;
  brand?: { id?: string; name?: string } | null;

  productType?: ProductType;
  tags?: string[];

  status?: ProductStatus;
  isVisible?: boolean;
  isActive?: boolean;
  publishedAt?: string | null;

  price?: number | string | null;
  marketPrice?: number | string | null;
  savingPrice?: number | string | null;
  productQty?: number | string | null;

  weight?: number | string | null;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;

  metaTitle?: string | null;
  metaDescription?: string | null;

  media?: Array<{
    id?: string;
    type?: "image" | "video";
    url?: string;
    thumbUrl?: string;
  }>;

  images?: Array<{
    id?: string;
    url?: string;
    thumbUrl?: string;
    isCover?: boolean;
    sort?: number;
  }>;
};

const INITIAL_FORM: ProductFormState = {
  name: "",
  slug: "",
  categoryId: "",
  brandId: "",
  productType: "PHYSICAL",
  tags: [],
  tagsInput: "",
  status: "DRAFT",
  isVisible: true,
  publishedAt: "",
  shortDescription: "",
  description: "",
  price: "0.00",
  marketPrice: "",
  savingPrice: "",
  productQty: "0",
  weight: "",
  length: "",
  width: "",
  height: "",
  metaTitle: "",
  metaDescription: "",
};

function cuidLike(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(2, 6)}`;
}

function slugify(input: string) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function sanitizeDecimalInput(value: string) {
  let next = value.replace(/[^\d.]/g, "");
  const firstDot = next.indexOf(".");

  if (firstDot !== -1) {
    next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
  }

  return next;
}

function sanitizeIntegerInput(value: string) {
  return value.replace(/\D/g, "");
}

function safePickList<T>(j: unknown): T[] {
  const obj = j as ApiResponse<T>;
  if (Array.isArray(j)) return j as T[];
  if (Array.isArray(obj?.items)) return obj.items;
  if (Array.isArray(obj?.data)) return obj.data;
  if (Array.isArray(obj?.categories)) return obj.categories;
  if (Array.isArray(obj?.brands)) return obj.brands;
  return [];
}

function safePickItem<T>(j: unknown): T | null {
  if (!j || typeof j !== "object") return null;
  const obj = j as ApiResponse<T> & T;
  if (obj.item && typeof obj.item === "object") return obj.item;
  if (obj.data && !Array.isArray(obj.data) && typeof obj.data === "object") return obj.data as T;
  return obj as T;
}

function moneyString(value?: number | string | null) {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toFixed(2);
}

function intString(value?: number | string | null, fallback = "0") {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return String(Math.trunc(n));
}

function normalizeMediaFromProduct(product: ApiProductDetail): MediaItem[] {
  if (Array.isArray(product.media) && product.media.length > 0) {
    return product.media
      .filter((m) => String(m?.url ?? "").trim())
      .map((m, index) => ({
        id: String(m?.id ?? cuidLike(`media_${index}`)),
        type: m?.type === "video" ? "video" : "image",
        url: String(m?.url ?? "").trim(),
        thumbUrl: String(m?.thumbUrl ?? "").trim() || undefined,
      }));
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images
      .filter((img) => String(img?.url ?? "").trim())
      .map((img, index) => ({
        id: String(img?.id ?? cuidLike(`img_${index}`)),
        type: "image" as const,
        url: String(img?.url ?? "").trim(),
        thumbUrl: String(img?.thumbUrl ?? img?.url ?? "").trim() || undefined,
      }));
  }

  return [];
}

function toFormStateFromProduct(product: ApiProductDetail): ProductFormState {
  const resolvedStatus: ProductStatus =
    product.status === "ACTIVE" || product.status === "ARCHIVED" || product.status === "DRAFT"
      ? product.status
      : product.isActive
        ? "ACTIVE"
        : "DRAFT";

  return {
    name: String(product.name ?? ""),
    slug: String(product.slug ?? ""),
    categoryId: String(product.categoryId ?? product.category?.id ?? ""),
    brandId: String(product.brandId ?? product.brand?.id ?? ""),
    productType:
      product.productType === "DIGITAL" || product.productType === "SERVICE" ? product.productType : "PHYSICAL",
    tags: Array.isArray(product.tags) ? product.tags.map((x) => String(x)) : [],
    tagsInput: "",
    status: resolvedStatus,
    isVisible: typeof product.isVisible === "boolean" ? product.isVisible : true,
    publishedAt: String(product.publishedAt ?? ""),
    shortDescription: String(product.shortDescription ?? ""),
    description: String(product.description ?? ""),
    price: moneyString(product.price) || "0.00",
    marketPrice: moneyString(product.marketPrice),
    savingPrice: moneyString(product.savingPrice),
    productQty: intString(product.productQty, "0"),
    weight: product.weight == null ? "" : String(product.weight),
    length: product.length == null ? "" : String(product.length),
    width: product.width == null ? "" : String(product.width),
    height: product.height == null ? "" : String(product.height),
    metaTitle: String(product.metaTitle ?? ""),
    metaDescription: String(product.metaDescription ?? ""),
  };
}

async function uploadMediaFiles(files: File[], signal?: AbortSignal): Promise<string[]> {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);

  const res = await fetch("/api/admin/commerce/products/uploads/images", {
    method: "POST",
    body: fd,
    signal,
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.error ?? j?.message ?? "Upload failed");
  }

  const j = (await res.json()) as { urls?: string[] };
  return Array.isArray(j.urls) ? j.urls : [];
}

export default function ProductForm({
  editingId,
  categories: categoriesProp,
  busy: busyProp,
  setBusy: setBusyProp,
  onCancel,
  onSaved,
  onSubmit,
  siteId: siteIdProp,
}: Props) {
  const modal = useModal();

  const sites = useSiteStore((s) => s.sites);
  const sitesLoading = useSiteStore((s) => s.loading);
  const sitesErr = useSiteStore((s) => s.err);
  const selectedSiteId = useSiteStore((s) => s.siteId);
  const setSelectedSiteId = useSiteStore((s) => s.setSiteId);
  const hydrateFromStorage = useSiteStore((s) => s.hydrateFromStorage);
  const loadSites = useSiteStore((s) => s.loadSites);

  const effectiveSiteId = siteIdProp || selectedSiteId;
  const isEditing = Boolean(editingId);

  const formRef = useRef<HTMLFormElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (siteIdProp) return;
    hydrateFromStorage();
    loadSites();
  }, [siteIdProp, hydrateFromStorage, loadSites]);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState("");

  const [loadingProduct, setLoadingProduct] = useState(false);
  const [productError, setProductError] = useState("");

  const loadCategories = useCallback(async () => {
    if (Array.isArray(categoriesProp) && categoriesProp.length > 0) {
      const normalized = categoriesProp
        .filter((x) => x && x.id && x.name)
        .map((x) => ({
          id: String(x.id),
          name: String(x.name),
          slug: slugify(String(x.name)),
          parentId: null,
          count: x.count ?? 0,
        }));
      setCategories(normalized);
      setCatError("");
      return;
    }

    if (!effectiveSiteId) {
      setCategories([]);
      setCatError("");
      return;
    }

    const controller = new AbortController();

    try {
      setCatLoading(true);
      setCatError("");

      const qs = new URLSearchParams();
      qs.set("siteId", effectiveSiteId);
      qs.set("lite", "1");

      const url = `/api/admin/commerce/products/product-categories?${qs.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        credentials: "include",
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const errorObj = j as Record<string, unknown>;
        throw new Error(String(errorObj?.error ?? errorObj?.message ?? "Load categories failed"));
      }

      const j = await res.json();
      const list = safePickList<CategoryItem>(j);

      const normalized = list
        .filter((x) => x && x.id && x.name)
        .map((x) => ({
          id: String(x.id),
          name: String(x.name),
          slug: String(x.slug ?? ""),
          parentId: x.parentId ?? null,
          count: x.count ?? 0,
        }));

      setCategories(normalized);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      const message = e instanceof Error ? e.message : "Load categories failed";
      setCatError(message);
      setCategories([]);
    } finally {
      setCatLoading(false);
    }

    return () => controller.abort();
  }, [categoriesProp, effectiveSiteId]);

  const loadBrands = useCallback(async () => {
    if (!effectiveSiteId) {
      setBrands([]);
      setBrandError("");
      return;
    }

    const controller = new AbortController();

    try {
      setBrandLoading(true);
      setBrandError("");

      const qs = new URLSearchParams();
      qs.set("siteId", effectiveSiteId);
      qs.set("lite", "1");

      const url = `/api/admin/commerce/products/product-brands?${qs.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        credentials: "include",
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const errorObj = j as Record<string, unknown>;
        throw new Error(String(errorObj?.error ?? errorObj?.message ?? "Load brands failed"));
      }

      const j = await res.json();
      const list = safePickList<BrandItem>(j);

      const normalized = list
        .filter((x) => x && x.id && x.name)
        .map((x) => ({
          id: String(x.id),
          name: String(x.name),
          slug: String(x.slug ?? ""),
          logoUrl: x.logoUrl ?? null,
        }));

      setBrands(normalized);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      const message = e instanceof Error ? e.message : "Load brands failed";
      setBrandError(message);
      setBrands([]);
    } finally {
      setBrandLoading(false);
    }

    return () => controller.abort();
  }, [effectiveSiteId]);

  useEffect(() => {
    let cleanup: void | (() => void);

    void (async () => {
      cleanup = await loadCategories();
    })();

    return () => {
      if (cleanup) cleanup();
    };
  }, [loadCategories]);

  useEffect(() => {
    let cleanup: void | (() => void);

    void (async () => {
      cleanup = await loadBrands();
    })();

    return () => {
      if (cleanup) cleanup();
    };
  }, [loadBrands]);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const activeMedia = (activeMediaId ? media.find((m) => m.id === activeMediaId) : null) ?? media[0] ?? null;

  useEffect(() => {
    return () => {
      for (const m of media) {
        if (m.url?.startsWith("blob:")) URL.revokeObjectURL(m.url);
      }
    };
  }, [media]);

  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);

  const [hasVariants, setHasVariants] = useState(false);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProductDetail(id: string) {
      try {
        setLoadingProduct(true);
        setProductError("");

        const res = await fetch(`/api/admin/commerce/products/${id}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error ?? j?.message ?? "Load product detail failed");
        }

        const raw = await res.json();
        const product = safePickItem<ApiProductDetail>(raw);

        if (!product || !product.id) {
          throw new Error("Invalid product detail response");
        }

        if (product.siteId && !siteIdProp) {
          setSelectedSiteId(String(product.siteId));
        }

        setForm(toFormStateFromProduct(product));

        const nextMedia = normalizeMediaFromProduct(product);
        setMedia(nextMedia);
        setActiveMediaId(nextMedia[0]?.id ?? null);

        setHasVariants(false);
        setVariantOptions([]);
        setVariants([]);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        const message = e instanceof Error ? e.message : "Load product detail failed";
        setProductError(message);
        setForm(INITIAL_FORM);
        setMedia([]);
        setActiveMediaId(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProduct(false);
        }
      }
    }

    if (!editingId) {
      setProductError("");
      setLoadingProduct(false);
      setForm(INITIAL_FORM);
      setMedia([]);
      setActiveMediaId(null);
      setHasVariants(false);
      setVariantOptions([]);
      setVariants([]);
      return () => controller.abort();
    }

    void loadProductDetail(editingId);

    return () => controller.abort();
  }, [editingId, setSelectedSiteId, siteIdProp]);

  const setField = useCallback(<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  }, []);

  const handleDecimalFieldChange = useCallback(
    (key: "price" | "marketPrice" | "savingPrice" | "weight" | "length" | "width" | "height", value: string) => {
      setField(key, sanitizeDecimalInput(value));
    },
    [setField],
  );

  const handleIntegerFieldChange = useCallback(
    (key: "productQty", value: string) => {
      setField(key, sanitizeIntegerInput(value));
    },
    [setField],
  );

  const handleNameChange = useCallback(
    (v: string) => {
      setField("name", v);
      setForm((p) => {
        if (p.slug) return p;
        return { ...p, slug: slugify(v) };
      });
    },
    [setField],
  );

  const addTag = useCallback(() => {
    const t = form.tagsInput.trim();
    if (!t) return;
    if (form.tags.includes(t)) {
      setField("tagsInput", "");
      return;
    }
    setField("tags", [...form.tags, t]);
    setField("tagsInput", "");
  }, [form.tags, form.tagsInput, setField]);

  const removeTag = useCallback(
    (t: string) =>
      setField(
        "tags",
        form.tags.filter((x) => x !== t),
      ),
    [form.tags, setField],
  );

  const publishNow = useCallback(() => {
    const iso = new Date().toISOString();
    setField("publishedAt", iso);
    setField("status", "ACTIVE");
  }, [setField]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId) ?? null,
    [categories, form.categoryId],
  );

  const autoFill = useCallback(() => {
    setForm((p) => {
      const name = p.name?.trim() ? p.name : "New product";
      const slug = p.slug?.trim() ? p.slug : slugify(name);

      const metaTitle = p.metaTitle?.trim() ? p.metaTitle : name;
      const metaDescription = p.metaDescription?.trim()
        ? p.metaDescription
        : `Buy ${name} online. Fast delivery, great quality.`;

      const shortDescription = p.shortDescription?.trim() ? p.shortDescription : `Premium ${name} for everyday use.`;

      const description = p.description?.trim()
        ? p.description
        : `✅ Key features
- High quality materials
- Easy to use
- Great value

📦 In the box
- 1 x ${name}

🛡 Warranty
- Please check warranty policy by category.
`;

      const price = p.price?.trim() ? p.price : "0.00";
      const productQty = p.productQty?.trim() ? p.productQty : "0";

      const tagFromCategory = selectedCategory?.name ? selectedCategory.name : "";
      const tags = p.tags.length > 0 ? p.tags : tagFromCategory ? [tagFromCategory] : [];

      return {
        ...p,
        name,
        slug,
        metaTitle,
        metaDescription,
        shortDescription,
        description,
        price,
        productQty,
        tags,
      };
    });
  }, [selectedCategory?.name]);

  const onFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const next: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        if (!isVideo && !isImage) continue;

        const url = URL.createObjectURL(file);
        next.push({
          id: cuidLike("m"),
          type: isVideo ? "video" : "image",
          url,
          thumbUrl: isImage ? url : undefined,
          file,
        });
      }

      setMedia((prev) => {
        const merged = [...prev, ...next];
        if (!activeMediaId && merged[0]) setActiveMediaId(merged[0].id);
        return merged;
      });
    },
    [activeMediaId],
  );

  const removeMedia = useCallback(
    (id: string) => {
      setMedia((prev) => {
        const target = prev.find((m) => m.id === id);
        if (target?.url?.startsWith("blob:")) URL.revokeObjectURL(target.url);

        const next = prev.filter((m) => m.id !== id);
        if (activeMediaId === id) setActiveMediaId(next[0]?.id ?? null);
        return next;
      });
    },
    [activeMediaId],
  );

  const [createCatName, setCreateCatName] = useState("");
  const createCatInputRef = useRef<HTMLInputElement | null>(null);

  const openCreateCategory = useCallback(() => {
    if (!effectiveSiteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    setCreateCatName("");
    setTimeout(() => createCatInputRef.current?.focus(), 0);

    const name = window.prompt("Category name?", "");
    if (name == null) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    void (async () => {
      try {
        const res = await fetch("/api/admin/commerce/products/product-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId: effectiveSiteId,
            name: trimmed,
            slug: slugify(trimmed),
          }),
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          const errorObj = j as Record<string, unknown>;
          throw new Error(String(errorObj?.error ?? errorObj?.message ?? "Create category failed"));
        }

        const j = await res.json().catch(() => null);
        modal.success("Success", `Created “${trimmed}”.`);
        await loadCategories();

        const createdObj = j as { item?: { id?: string } } | null;
        const createdId = createdObj?.item?.id ? String(createdObj.item.id) : "";
        if (createdId) setField("categoryId", createdId);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Create category failed";
        modal.error("Create failed", message);
      }
    })();
  }, [effectiveSiteId, loadCategories, modal, setField]);

  const validateBasic = useCallback(() => {
    const errors: string[] = [];

    if (!effectiveSiteId) errors.push("Site is required");
    if (!form.name.trim()) errors.push("Name is required");
    if (!form.slug.trim()) errors.push("Slug is required");
    if (!form.categoryId.trim()) errors.push("Category is required");

    return errors;
  }, [effectiveSiteId, form]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateBasic();
      if (errors.length) {
        modal.error("Invalid form", errors.join("\n"));
        return;
      }

      const controller = new AbortController();

      try {
        setBusyProp?.(true);

        const toUpload = media.filter((m) => m.file && m.url.startsWith("blob:"));
        let uploadedUrls: string[] = [];

        if (toUpload.length) {
          const files = toUpload.map((m) => m.file!) as File[];
          uploadedUrls = await uploadMediaFiles(files, controller.signal);

          if (uploadedUrls.length !== files.length) {
            throw new Error("Upload returned unexpected urls length");
          }
        }

        const mergedMedia: MediaItem[] = media.map((m) => {
          const idx = toUpload.findIndex((x) => x.id === m.id);
          if (idx === -1) return m;

          const newUrl = uploadedUrls[idx];
          if (m.url.startsWith("blob:")) URL.revokeObjectURL(m.url);

          return {
            ...m,
            url: newUrl,
            thumbUrl: m.type === "image" ? newUrl : m.thumbUrl,
            file: undefined,
          };
        });

        setMedia(mergedMedia);

        const payload: ProductSubmitPayload = {
          ...form,
          siteId: effectiveSiteId!,
          media: mergedMedia,
          hasVariants,
          variantOptions,
          variants,
        };

        onSubmit?.(payload);

        const apiPayload = {
          siteId: payload.siteId,
          name: payload.name.trim(),
          slug: payload.slug.trim(),
          categoryId: payload.categoryId || null,
          brandId: payload.brandId || null,
          productType: payload.productType,
          tags: payload.tags,
          status: payload.status,
          isVisible: payload.isVisible,
          publishedAt: payload.publishedAt || null,
          shortDescription: payload.shortDescription.trim() || null,
          description: payload.description.trim() || null,
          price: payload.price.trim() || null,
          marketPrice: payload.marketPrice.trim() || null,
          savingPrice: payload.savingPrice.trim() || null,
          productQty: payload.productQty.trim() || null,
          weight: payload.weight.trim() || null,
          length: payload.length.trim() || null,
          width: payload.width.trim() || null,
          height: payload.height.trim() || null,
          metaTitle: payload.metaTitle.trim() || null,
          metaDescription: payload.metaDescription.trim() || null,
          media: payload.media.map((m) => ({
            id: m.id,
            type: m.type,
            url: m.url,
            thumbUrl: m.thumbUrl,
          })),
        };

        const endpoint = isEditing ? `/api/admin/commerce/products/${editingId}` : "/api/admin/commerce/products";
        const method = isEditing ? "PATCH" : "POST";

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error ?? j?.message ?? (isEditing ? "Update product failed" : "Create product failed"));
        }

        await res.json().catch(() => null);
        modal.success("Success", isEditing ? "Update product success!" : "Create product success!");
        onSaved?.();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;

        const message =
          err instanceof Error ? err.message : isEditing ? "Update product failed" : "Create product failed";

        modal.error(isEditing ? "Update failed" : "Create failed", message);
      } finally {
        setBusyProp?.(false);
      }

      return () => controller.abort();
    },
    [
      editingId,
      effectiveSiteId,
      form,
      hasVariants,
      isEditing,
      media,
      modal,
      onSaved,
      onSubmit,
      setBusyProp,
      validateBasic,
      variantOptions,
      variants,
    ],
  );

  const handleCancelAction = useCallback(() => {
    if (busyProp || loadingProduct) return;
    onCancel?.();
  }, [busyProp, loadingProduct, onCancel]);

  const handlePublishNowAction = useCallback(() => {
    if (busyProp || loadingProduct) return;
    publishNow();
  }, [busyProp, loadingProduct, publishNow]);

  const handleAutoFillAction = useCallback(() => {
    if (busyProp || loadingProduct) return;
    autoFill();
  }, [busyProp, loadingProduct, autoFill]);

  const handleEditAction = useCallback(() => {
    if (busyProp || loadingProduct) return;
    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [busyProp, loadingProduct]);

  const handleSaveAction = useCallback(() => {
    if (busyProp || loadingProduct) return;
    formRef.current?.requestSubmit();
  }, [busyProp, loadingProduct]);

  const functionKeyActions = useMemo(
    () => ({
      F2: {
        action: handleCancelAction,
        label: "Cancel",
        icon: "bi-x-circle",
      },
      F3: {
        action: handlePublishNowAction,
        label: "Publish now",
        icon: "bi-upload",
      },
      F6: {
        action: handleEditAction,
        label: "Edit",
        icon: "bi-pencil-square",
      },
      F9: {
        action: handleAutoFillAction,
        label: "Auto fill",
        icon: "bi-magic",
      },
      F10: {
        action: handleSaveAction,
        label: "Save",
        icon: "bi-save",
      },
    }),
    [handleAutoFillAction, handleCancelAction, handleEditAction, handlePublishNowAction, handleSaveAction],
  );

  usePageFunctionKeys(functionKeyActions);

  return (
    <div className={styles.page}>
      <form ref={formRef} className={styles.shell} onSubmit={handleSubmit}>
        <aside className={styles.left}>
          <div className={styles.mediaCard}>
            <div className={styles.mediaPreview}>
              {activeMedia ? (
                activeMedia.type === "video" ? (
                  <div className={styles.videoOverlay}>
                    <video className={styles.previewImg} src={activeMedia.url} controls playsInline />
                  </div>
                ) : (
                  <Image
                    className={styles.previewImg}
                    src={activeMedia.url}
                    alt="preview"
                    width={600}
                    height={600}
                    unoptimized
                  />
                )
              ) : (
                <div className={styles.note}>
                  {loadingProduct ? "Loading product media..." : "No media yet. Upload images/videos."}
                </div>
              )}
            </div>

            <div className={styles.thumbRow}>
              {media.map((m) => (
                <div key={m.id} style={{ position: "relative" }}>
                  <button
                    type="button"
                    className={`${styles.thumb} ${m.id === activeMediaId ? styles.thumbActive : ""}`}
                    onClick={() => setActiveMediaId(m.id)}
                  >
                    {m.type === "video" ? (
                      <video className={styles.thumbMedia} src={m.url} muted playsInline preload="metadata" />
                    ) : (
                      <Image src={m.thumbUrl ?? m.url} alt="thumb" width={100} height={100} unoptimized />
                    )}
                    {m.type === "video" && <span className={styles.thumbBadge}>▶</span>}
                  </button>

                  <button
                    type="button"
                    className={styles.btnSmall}
                    style={{ position: "absolute", top: 4, right: 4 }}
                    onClick={() => removeMedia(m.id)}
                    title="Remove"
                    disabled={loadingProduct || busyProp}
                  >
                    ×
                  </button>
                </div>
              ))}

              <label className={styles.uploadTile} title="Upload">
                <input
                  className={styles.hiddenInput}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => onFilesSelected(e.target.files)}
                  disabled={loadingProduct || busyProp}
                />
                <div className={styles.uploadIcon}>☁</div>
                <div className={styles.uploadText}>Drop your file here</div>
                <div className={styles.uploadHint}>or click to upload</div>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>SEO</h2>
                <p className={styles.sectionSub}>Meta title/description + preview</p>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Meta title</label>
                <input
                  className={styles.input}
                  value={form.metaTitle}
                  onChange={(e) => setField("metaTitle", e.target.value)}
                  disabled={loadingProduct}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>URL preview</label>
                <div className={styles.previewUrl}>
                  /products/<b>{form.slug || "your-slug"}</b>
                </div>
              </div>
            </div>

            <div className={styles.field} style={{ marginTop: 12 }}>
              <label className={styles.label}>Meta description</label>
              <textarea
                className={styles.textareaSmall}
                maxLength={160}
                value={form.metaDescription}
                onChange={(e) => setField("metaDescription", e.target.value)}
                placeholder="Recommended 140–160 chars"
                disabled={loadingProduct}
              />
              <div className={styles.mini}>{form.metaDescription.length}/160</div>
            </div>
          </div>
        </aside>

        <section className={styles.right}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerTitle}>{isEditing ? "Edit product" : "Create product"}</div>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.headerMeta}>
                <span className={styles.pill}>{form.status}</span>
                <span className={`${styles.pill} ${form.isVisible ? styles.pillOn : styles.pillOff}`}>
                  {form.isVisible ? "Visible" : "Hidden"}
                </span>
                {form.publishedAt ? (
                  <span className={styles.mini}>Published</span>
                ) : (
                  <span className={styles.mini}>Not published</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.body}>
            {productError ? (
              <div className={styles.note} style={{ marginBottom: 12 }}>
                {productError}
              </div>
            ) : null}

            <div className={styles.section}>
              <div className={styles.grid2}>
                {!siteIdProp && (
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Site <span className={styles.req}>*</span>
                    </label>
                    <select
                      className={styles.select}
                      value={selectedSiteId || ""}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      disabled={sitesLoading || loadingProduct}
                    >
                      <option value="">{sitesLoading ? "Loading sites..." : "— Select site —"}</option>
                      {sites.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name ?? s.id} ({s.id})
                        </option>
                      ))}
                    </select>
                    {sitesErr ? (
                      <div className={styles.note} style={{ marginTop: 8 }}>
                        {sitesErr}
                      </div>
                    ) : null}
                  </div>
                )}

                <div className={styles.field}>
                  <label className={styles.label}>
                    Name <span className={styles.req}>*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    disabled={loadingProduct}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Slug <span className={styles.req}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.slug}
                    onChange={(e) => setField("slug", e.target.value)}
                    disabled={loadingProduct}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Category <span className={styles.req}>*</span>
                  </label>

                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      className={styles.select}
                      value={form.categoryId}
                      onChange={(e) => setField("categoryId", e.target.value)}
                      disabled={catLoading || !effectiveSiteId || loadingProduct}
                      style={{ flex: 1 }}
                    >
                      <option value="">
                        {!effectiveSiteId
                          ? "Select site first..."
                          : catLoading
                            ? "Loading categories..."
                            : "— Select category —"}
                      </option>

                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className={styles.btnSmall}
                      onClick={openCreateCategory}
                      disabled={!effectiveSiteId || loadingProduct}
                      title="Create category"
                    >
                      + New
                    </button>
                  </div>

                  {catError ? (
                    <div className={styles.note} style={{ marginTop: 8 }}>
                      {catError}
                    </div>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Product type</label>
                  <select
                    className={styles.select}
                    value={form.productType}
                    onChange={(e) => setField("productType", e.target.value as ProductType)}
                    disabled={loadingProduct}
                  >
                    <option value="PHYSICAL">Physical</option>
                    <option value="DIGITAL">Digital</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Brand</label>
                  <select
                    className={styles.select}
                    value={form.brandId}
                    onChange={(e) => setField("brandId", e.target.value)}
                    disabled={brandLoading || !effectiveSiteId || loadingProduct}
                  >
                    <option value="">
                      {!effectiveSiteId ? "Select site first..." : brandLoading ? "Loading brands..." : "— No brand —"}
                    </option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {brandError ? (
                    <div className={styles.note} style={{ marginTop: 8 }}>
                      {brandError}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.field} style={{ marginTop: 12 }}>
                <label className={styles.label}>Tags</label>
                <div className={styles.tagsRow}>
                  <input
                    className={styles.input}
                    placeholder="Type tag and press Add"
                    value={form.tagsInput}
                    onChange={(e) => setField("tagsInput", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    disabled={loadingProduct}
                  />
                  <button type="button" className={styles.btnSmall} onClick={addTag} disabled={loadingProduct}>
                    Add
                  </button>
                </div>

                <div className={styles.tags}>
                  {form.tags.map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                      <button
                        type="button"
                        className={styles.tagX}
                        onClick={() => removeTag(t)}
                        disabled={loadingProduct}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.grid2} style={{ marginTop: 12 }}>
                <div className={styles.field}>
                  <label className={styles.label}>Short description</label>
                  <input
                    className={styles.input}
                    placeholder="1–2 lines shown on listings"
                    value={form.shortDescription}
                    onChange={(e) => setField("shortDescription", e.target.value)}
                    disabled={loadingProduct}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <select
                    className={styles.select}
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value as ProductStatus)}
                    disabled={loadingProduct}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div className={styles.grid2} style={{ marginTop: 12 }}>
                <div className={styles.field}>
                  <label className={styles.label}>Price</label>
                  <input
                    className={styles.input}
                    value={form.price}
                    onChange={(e) => handleDecimalFieldChange("price", e.target.value)}
                    inputMode="decimal"
                    disabled={loadingProduct}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Market price</label>
                  <input
                    className={styles.input}
                    value={form.marketPrice}
                    onChange={(e) => handleDecimalFieldChange("marketPrice", e.target.value)}
                    inputMode="decimal"
                    disabled={loadingProduct}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Saving price</label>
                  <input
                    className={styles.input}
                    value={form.savingPrice}
                    onChange={(e) => handleDecimalFieldChange("savingPrice", e.target.value)}
                    inputMode="decimal"
                    disabled={loadingProduct}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Quantity</label>
                  <input
                    className={styles.input}
                    value={form.productQty}
                    onChange={(e) => handleIntegerFieldChange("productQty", e.target.value)}
                    inputMode="numeric"
                    disabled={loadingProduct}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.grid2} style={{ marginTop: 12 }}>
                <div className={styles.field}>
                  <label className={styles.label}>Weight</label>
                  <input
                    className={styles.input}
                    value={form.weight}
                    onChange={(e) => handleDecimalFieldChange("weight", e.target.value)}
                    inputMode="decimal"
                    disabled={loadingProduct}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Length</label>
                  <input
                    className={styles.input}
                    value={form.length}
                    onChange={(e) => handleDecimalFieldChange("length", e.target.value)}
                    inputMode="decimal"
                    disabled={loadingProduct}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Width</label>
                  <input
                    className={styles.input}
                    value={form.width}
                    onChange={(e) => handleDecimalFieldChange("width", e.target.value)}
                    inputMode="decimal"
                    disabled={loadingProduct}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Height</label>
                  <input
                    className={styles.input}
                    value={form.height}
                    onChange={(e) => handleDecimalFieldChange("height", e.target.value)}
                    inputMode="decimal"
                    disabled={loadingProduct}
                  />
                </div>
              </div>

              <div className={styles.field} style={{ marginTop: 12 }}>
                <label className={styles.label}>Description</label>
                <div className={styles.editor}>
                  <div className={styles.editorToolbar}>
                    {["B", "I", "U", "•", "1.", "🔗", "🖼", "↺", "↻"].map((t) => (
                      <button key={t} type="button" className={styles.toolBtn}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className={styles.textarea}
                    placeholder="Write a detailed product description..."
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    disabled={loadingProduct}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>

      <input
        ref={createCatInputRef}
        value={createCatName}
        onChange={(e) => setCreateCatName(e.target.value)}
        style={{ display: "none" }}
      />
    </div>
  );
}

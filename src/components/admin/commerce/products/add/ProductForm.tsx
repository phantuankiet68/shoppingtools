"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "@/styles/admin/commerce/products/add/ProductForm.module.css";
import Image from "next/image";
import { useModal } from "@/components/admin/shared/common/modal";
import { useSiteStore } from "@/store/site/site.store";

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
  vendor: string;
  tags: string[];
  tagsInput: string;

  status: ProductStatus;
  isVisible: boolean;
  publishedAt: string;

  shortDescription: string;
  description: string;

  cost: string;
  price: string;
  compareAtPrice: string;

  sku: string;
  barcode: string;
  stockQty: string;

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
  data?: T[];
  categories?: T[];
  brands?: T[];
};

type RightTab = "BASIC" | "PRICING" | "INVENTORY" | "SHIPPING";

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

function safePickList<T>(j: unknown): T[] {
  const obj = j as ApiResponse<T>;
  if (Array.isArray(j)) return j as T[];
  if (Array.isArray(obj?.items)) return obj.items;
  if (Array.isArray(obj?.data)) return obj.data;
  if (Array.isArray(obj?.categories)) return obj.categories;
  if (Array.isArray(obj?.brands)) return obj.brands;
  return [];
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

  useEffect(() => {
    if (siteIdProp) return;
    hydrateFromStorage();
    loadSites();
  }, [siteIdProp, hydrateFromStorage, loadSites]);

  const [activeTab, setActiveTab] = useState<RightTab>("BASIC");

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState("");

  const loadCategories = useCallback(async () => {
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
  }, [effectiveSiteId]);

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

    (async () => {
      cleanup = await loadCategories();
    })();

    return () => {
      if (cleanup) cleanup();
    };
  }, [loadCategories]);

  useEffect(() => {
    let cleanup: void | (() => void);

    (async () => {
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

  const [form, setForm] = useState<ProductFormState>({
    name: "",
    slug: "",
    categoryId: "",
    brandId: "",
    productType: "PHYSICAL",
    vendor: "",
    tags: [],
    tagsInput: "",
    status: "DRAFT",
    isVisible: true,
    publishedAt: "",
    shortDescription: "",
    description: "",
    cost: "0.00",
    price: "0.00",
    compareAtPrice: "",
    sku: "",
    barcode: "",
    stockQty: "0",
    weight: "",
    length: "",
    width: "",
    height: "",
    metaTitle: "",
    metaDescription: "",
  });

  const [hasVariants, setHasVariants] = useState(false);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([
    { name: "Color", values: ["White", "Black"] },
    { name: "Size", values: ["S", "M"] },
  ]);

  const [variants, setVariants] = useState<VariantRow[]>([
    {
      id: cuidLike("v"),
      title: "White / S",
      sku: "SKU-WH-S",
      price: "10.00",
      stockQty: "20",
      isActive: true,
      isDefault: true,
    },
    {
      id: cuidLike("v"),
      title: "Black / M",
      sku: "SKU-BK-M",
      price: "12.00",
      stockQty: "15",
      isActive: true,
      isDefault: false,
    },
  ]);

  const setField = useCallback(<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  }, []);

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

  const generateVariants = useCallback(() => {
    const opts = variantOptions.filter((o) => o.name.trim() && o.values.length > 0);
    if (opts.length === 0) return;

    const combos: string[][] = [];
    const backtrack = (idx: number, acc: string[]) => {
      if (idx === opts.length) {
        combos.push(acc.slice());
        return;
      }
      for (const val of opts[idx].values) backtrack(idx + 1, [...acc, val]);
    };
    backtrack(0, []);

    const newRows: VariantRow[] = combos.map((c, i) => {
      const title = c.join(" / ");
      return {
        id: cuidLike("v"),
        title,
        sku: `${(form.slug || "product").toUpperCase()}-${c.map((x) => x.slice(0, 2).toUpperCase()).join("")}`.slice(
          0,
          32,
        ),
        price: form.price || "0.00",
        stockQty: "0",
        isActive: true,
        isDefault: i === 0,
      };
    });

    setVariants(newRows);
  }, [form.price, form.slug, variantOptions]);

  const setDefaultVariant = useCallback((id: string) => {
    setVariants((prev) => prev.map((v) => ({ ...v, isDefault: v.id === id })));
  }, []);

  const updateVariant = useCallback((id: string, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

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

      const cost = p.cost?.trim() ? p.cost : "0.00";
      const price = p.price?.trim() ? p.price : "0.00";

      const weight = p.productType === "PHYSICAL" ? (p.weight?.trim() ? p.weight : "0.5") : p.weight;
      const length = p.productType === "PHYSICAL" ? (p.length?.trim() ? p.length : "10") : p.length;
      const width = p.productType === "PHYSICAL" ? (p.width?.trim() ? p.width : "10") : p.width;
      const height = p.productType === "PHYSICAL" ? (p.height?.trim() ? p.height : "10") : p.height;

      const sku = !hasVariants && !p.sku?.trim() ? `${slug.toUpperCase().replace(/-/g, "")}-001`.slice(0, 32) : p.sku;

      const stockQty = p.stockQty?.trim() ? p.stockQty : "0";

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
        cost,
        price,
        weight,
        length,
        width,
        height,
        sku,
        stockQty,
        tags,
      };
    });

    if (!form.name || !form.slug || !form.categoryId) setActiveTab("BASIC");
  }, [form.categoryId, form.name, form.slug, hasVariants, selectedCategory?.name]);

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
    if (!hasVariants && !form.sku.trim()) errors.push("SKU is required (or enable variants)");
    if (!hasVariants && !form.price.trim()) errors.push("Price is required (or manage via variants)");

    return errors;
  }, [effectiveSiteId, form, hasVariants]);

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
          variants: hasVariants ? variants : [],
        };

        onSubmit?.(payload);

        const apiPayload = {
          ...payload,
          media: payload.media.map((m) => ({
            id: m.id,
            type: m.type,
            url: m.url,
            thumbUrl: m.thumbUrl,
          })),
        };

        const res = await fetch("/api/admin/commerce/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error ?? j?.message ?? "Create product failed");
        }

        await res.json().catch(() => null);
        modal.success("Success", "Create product success!");
        onSaved?.();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Create product failed";
        modal.error("Create failed", message);
      }

      return () => controller.abort();
    },
    [effectiveSiteId, form, hasVariants, media, modal, onSaved, onSubmit, validateBasic, variantOptions, variants],
  );

  return (
    <div className={styles.page}>
      <form className={styles.shell} onSubmit={handleSubmit}>
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
                <div className={styles.note}>No media yet. Upload images/videos.</div>
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
              />
              <div className={styles.mini}>{form.metaDescription.length}/160</div>
            </div>
          </div>
        </aside>

        <section className={styles.right}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerTitle}>Create product</div>
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

            <div className={styles.headerActions}>
              <button type="button" className={styles.btnGhost} onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className={styles.btnGhost} onClick={autoFill} title="Auto fill common fields">
                Auto fill
              </button>
              <button type="button" className={styles.btnGhost} onClick={publishNow}>
                Publish now
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Save
              </button>
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "BASIC" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("BASIC")}
            >
              Basic
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "PRICING" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("PRICING")}
            >
              Pricing
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "INVENTORY" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("INVENTORY")}
            >
              Inventory & Variants
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "SHIPPING" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("SHIPPING")}
            >
              Shipping
            </button>
          </div>

          <div className={styles.body}>
            {activeTab === "BASIC" && (
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
                        disabled={sitesLoading}
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
                      className={styles.input}
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
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
                        disabled={catLoading || !effectiveSiteId}
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
                        disabled={!effectiveSiteId}
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
                      disabled={brandLoading || !effectiveSiteId}
                    >
                      <option value="">
                        {!effectiveSiteId
                          ? "Select site first..."
                          : brandLoading
                            ? "Loading brands..."
                            : "— No brand —"}
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

                  <div className={styles.field}>
                    <label className={styles.label}>Vendor</label>
                    <input
                      className={styles.input}
                      value={form.vendor}
                      onChange={(e) => setField("vendor", e.target.value)}
                    />
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
                    />
                    <button type="button" className={styles.btnSmall} onClick={addTag}>
                      Add
                    </button>
                  </div>

                  <div className={styles.tags}>
                    {form.tags.map((t) => (
                      <span key={t} className={styles.tag}>
                        {t}
                        <button type="button" className={styles.tagX} onClick={() => removeTag(t)}>
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
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Status</label>
                    <select
                      className={styles.select}
                      value={form.status}
                      onChange={(e) => setField("status", e.target.value as ProductStatus)}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
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
                    />
                  </div>
                </div>

                <div className={styles.grid2} style={{ marginTop: 12 }}>
                  <div className={styles.field}>
                    <label className={styles.label}>Visibility</label>
                    <div className={styles.toggleRow}>
                      <button
                        type="button"
                        className={`${styles.toggle} ${form.isVisible ? styles.toggleOn : ""}`}
                        onClick={() => setField("isVisible", !form.isVisible)}
                        aria-pressed={form.isVisible}
                      >
                        <span className={styles.knob} />
                      </button>
                      <span className={styles.toggleText}>{form.isVisible ? "Visible" : "Hidden"}</span>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Published at</label>
                    <input
                      className={styles.input}
                      placeholder="ISO string (auto when Publish)"
                      value={form.publishedAt}
                      onChange={(e) => setField("publishedAt", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "PRICING" && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Pricing</h2>
                    <p className={styles.sectionSub}>Default price (or managed by variants)</p>
                  </div>
                </div>

                <div className={styles.grid3}>
                  <div className={styles.field}>
                    <label className={styles.label}>Cost</label>
                    <div className={styles.money}>
                      <span className={styles.moneyPrefix}>$</span>
                      <input
                        className={styles.inputMoney}
                        value={form.cost}
                        onChange={(e) => setField("cost", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Price</label>
                    <div className={styles.money}>
                      <span className={styles.moneyPrefix}>$</span>
                      <input
                        className={styles.inputMoney}
                        value={form.price}
                        onChange={(e) => setField("price", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Compare-at price</label>
                    <div className={styles.money}>
                      <span className={styles.moneyPrefix}>$</span>
                      <input
                        className={styles.inputMoney}
                        placeholder="Optional"
                        value={form.compareAtPrice}
                        onChange={(e) => setField("compareAtPrice", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "INVENTORY" && (
              <>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Inventory</h2>
                      <p className={styles.sectionSub}>SKU / Barcode / stock</p>
                    </div>
                  </div>

                  {!hasVariants && (
                    <div className={styles.grid3} style={{ marginTop: 12 }}>
                      <div className={styles.field}>
                        <label className={styles.label}>
                          SKU <span className={styles.req}>*</span>
                        </label>
                        <input
                          className={styles.input}
                          value={form.sku}
                          onChange={(e) => setField("sku", e.target.value)}
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>Barcode</label>
                        <input
                          className={styles.input}
                          value={form.barcode}
                          onChange={(e) => setField("barcode", e.target.value)}
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>Stock</label>
                        <input
                          className={styles.input}
                          value={form.stockQty}
                          onChange={(e) => setField("stockQty", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {hasVariants && <div className={styles.note}>Inventory is managed per-variant below.</div>}
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Variants</h2>
                      <p className={styles.sectionSub}>
                        Options → generate variants → manage SKU / price / stock per variant
                      </p>
                    </div>
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.field}>
                      <label className={styles.label}>Has variants?</label>
                      <div className={styles.toggleRow}>
                        <button
                          type="button"
                          className={`${styles.toggle} ${hasVariants ? styles.toggleOn : ""}`}
                          onClick={() => setHasVariants(!hasVariants)}
                          aria-pressed={hasVariants}
                        >
                          <span className={styles.knob} />
                        </button>
                        <span className={styles.toggleText}>{hasVariants ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Default behavior</label>
                      <div className={styles.note}>If variants enabled, pricing and stock are saved per variant.</div>
                    </div>
                  </div>

                  {hasVariants && (
                    <>
                      <div className={styles.card} style={{ marginTop: 12 }}>
                        <div className={styles.cardTitle}>Variant options</div>

                        {variantOptions.map((opt, idx) => (
                          <div key={idx} className={styles.optionRow}>
                            <input
                              className={styles.input}
                              value={opt.name}
                              placeholder="Option name (e.g. Color)"
                              onChange={(e) => {
                                const name = e.target.value;
                                setVariantOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, name } : o)));
                              }}
                            />
                            <input
                              className={styles.input}
                              value={opt.values.join(", ")}
                              placeholder="Values (comma separated)"
                              onChange={(e) => {
                                const values = e.target.value
                                  .split(",")
                                  .map((x) => x.trim())
                                  .filter(Boolean);
                                setVariantOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, values } : o)));
                              }}
                            />
                            <button
                              type="button"
                              className={styles.btnSmall}
                              onClick={() => setVariantOptions((prev) => prev.filter((_, i) => i !== idx))}
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <div className={styles.optionActions}>
                          <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => setVariantOptions((prev) => [...prev, { name: "", values: [] }])}
                          >
                            Add option
                          </button>
                          <button type="button" className={styles.btnPrimary} onClick={generateVariants}>
                            Generate variants
                          </button>
                        </div>
                      </div>

                      <div className={styles.card} style={{ marginTop: 12 }}>
                        <div className={styles.cardTitle}>Variants table</div>

                        <div className={styles.tableWrap}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>Default</th>
                                <th>Title</th>
                                <th>SKU</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Active</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variants.map((v) => (
                                <tr key={v.id}>
                                  <td>
                                    <input
                                      type="radio"
                                      name="defaultVariant"
                                      checked={v.isDefault}
                                      onChange={() => setDefaultVariant(v.id)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className={styles.tableInput}
                                      value={v.title}
                                      onChange={(e) => updateVariant(v.id, { title: e.target.value })}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className={styles.tableInput}
                                      value={v.sku}
                                      onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className={styles.tableInput}
                                      value={v.price}
                                      onChange={(e) => updateVariant(v.id, { price: e.target.value })}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className={styles.tableInput}
                                      value={v.stockQty}
                                      onChange={(e) => updateVariant(v.id, { stockQty: e.target.value })}
                                    />
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className={`${styles.badgeBtn} ${v.isActive ? styles.badgeOn : styles.badgeOff}`}
                                      onClick={() => updateVariant(v.id, { isActive: !v.isActive })}
                                    >
                                      {v.isActive ? "Active" : "Inactive"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {activeTab === "SHIPPING" && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Shipping</h2>
                    <p className={styles.sectionSub}>Weight & dimensions</p>
                  </div>
                </div>

                <div className={styles.note}>For DIGITAL or SERVICE products, you can leave these fields empty.</div>

                <div className={styles.grid4} style={{ marginTop: 12 }}>
                  <div className={styles.field}>
                    <label className={styles.label}>Weight</label>
                    <input
                      className={styles.input}
                      placeholder="kg"
                      value={form.weight}
                      onChange={(e) => setField("weight", e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Length</label>
                    <input
                      className={styles.input}
                      placeholder="cm"
                      value={form.length}
                      onChange={(e) => setField("length", e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Width</label>
                    <input
                      className={styles.input}
                      placeholder="cm"
                      value={form.width}
                      onChange={(e) => setField("width", e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Height</label>
                    <input
                      className={styles.input}
                      placeholder="cm"
                      value={form.height}
                      onChange={(e) => setField("height", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.footerBar}>
              <button type="button" className={styles.btnGhost} onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className={styles.btnGhost} onClick={autoFill}>
                Auto fill
              </button>
              <button type="button" className={styles.btnGhost} onClick={publishNow}>
                Publish now
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Save
              </button>
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

"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "@/styles/admin/products/add/ProductForm.module.css";
import Image from "next/image";
import { useModal } from "@/components/admin/shared/common/modal";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import RichEditor from "@/components/admin/editor/RichEditor";

type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbUrl?: string;
  file?: File;
};

type ProductFormState = {
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brandId: string;
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
  metaTitle: string;
  metaDescription: string;
};

type ProductSubmitPayload = ProductFormState & {
  siteId: string;
  media: MediaItem[];
};

type Props = {
  editingId?: string | null;
  siteId?: string;
  selectedSiteId?: string;
  onChangeSite?: (id: string) => void;
  sites?: {
    id: string;
    name: string;
  }[];

  categories?: {
    id: string;
    name: string;
    isActive?: boolean;
    count?: number;
  }[];
  brands?: {
    id: string;
    name: string;
    isActive?: boolean;
  }[];
  busy?: boolean;
  setBusy?: (v: boolean) => void;
  onCancel?: () => void;
  onSaved?: () => void;
  onSubmit?: (payload: ProductSubmitPayload) => void;
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
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  categoryId?: string | null;
  category?: { id?: string; name?: string } | null;
  brandId?: string | null;
  brand?: { id?: string; name?: string } | null;
  tags?: string[];
  status?: ProductStatus;
  isVisible?: boolean;
  isActive?: boolean;
  publishedAt?: string | null;
  price?: number | string | null;
  marketPrice?: number | string | null;
  savingPrice?: number | string | null;
  productQty?: number | string | null;
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
  sku: "",
  barcode: "",
  categoryId: "",
  brandId: "",
  tags: [],
  tagsInput: "",
  status: "DRAFT",
  isVisible: true,
  publishedAt: "",
  shortDescription: "",
  description: "",
  price: "",
  marketPrice: "",
  savingPrice: "",
  productQty: "1",
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

function formatPriceInput(value: string) {
  if (!value) return "";

  const cleaned = value.replace(/[^\d]/g, "");

  return Number(cleaned).toLocaleString("en-US");
}

function unformatPrice(value: string) {
  return value.replace(/,/g, "");
}

function sanitizeIntegerInput(value: string) {
  return value.replace(/\D/g, "");
}

function safePickItem<T>(j: unknown): T | null {
  if (!j || typeof j !== "object") return null;
  const obj = j as ApiResponse<T> & T;
  if (obj.item && typeof obj.item === "object") return obj.item;
  if (obj.data && !Array.isArray(obj.data) && typeof obj.data === "object") return obj.data as T;
  return "id" in obj ? (obj as T) : null;
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
    sku: String(product.sku ?? ""),
    barcode: String(product.barcode ?? ""),
    categoryId: String(product.categoryId ?? product.category?.id ?? ""),
    brandId: String(product.brandId ?? product.brand?.id ?? ""),
    tags: Array.isArray(product.tags) ? product.tags.map((x) => String(x)) : [],
    tagsInput: "",
    status: resolvedStatus,
    isVisible: typeof product.isVisible === "boolean" ? product.isVisible : true,
    publishedAt: String(product.publishedAt ?? ""),
    shortDescription: String(product.shortDescription ?? ""),
    description: String(product.description ?? ""),
    price: moneyString(product.price) || "",
    marketPrice: moneyString(product.marketPrice),
    savingPrice: moneyString(product.savingPrice),
    productQty: intString(product.productQty, "0"),
    metaTitle: String(product.metaTitle ?? ""),
    metaDescription: String(product.metaDescription ?? ""),
  };
}

function formatDateParts(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return {
    yyyy,
    mm,
    dd,
    yyyymmdd: `${yyyy}${mm}${dd}`,
  };
}

function generateSKU(sequence: number) {
  const { yyyymmdd } = formatDateParts();

  return `SP-${yyyymmdd}-${String(sequence).slice(-6)}`;
}

function generateBarcode() {
  const timestamp = Date.now().toString().slice(-10);
  return `893${timestamp}`;
}

async function uploadMediaFiles(files: File[], signal?: AbortSignal): Promise<string[]> {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);

  const res = await fetch("/api/admin/products/uploads/images", {
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
  brands: brandsProp,
  busy: busyProp,
  setBusy: setBusyProp,
  onCancel,
  onSaved,
  onSubmit,
  siteId,
  sites,
  selectedSiteId,
  onChangeSite,
}: Props) {
  const modal = useModal();

  const effectiveSiteId = selectedSiteId || siteId || "";
  const isEditing = Boolean(editingId);

  const formRef = useRef<HTMLFormElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [loadingProduct, setLoadingProduct] = useState(false);
  const [productError, setProductError] = useState("");

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const activeMedia = (activeMediaId ? media.find((m) => m.id === activeMediaId) : null) ?? media[0] ?? null;

  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);

  const [slugTouched, setSlugTouched] = useState(false);
  const { t } = useAdminI18n();

  const categories = useMemo(
    () =>
      (categoriesProp ?? []).map((c) => ({
        id: String(c.id),
        name: String(c.name),
        slug: slugify(c.name),
        count: c.count ?? 0,
      })),
    [categoriesProp],
  );

  const brands = useMemo(
    () =>
      (brandsProp ?? []).map((b) => ({
        id: String(b.id),
        name: String(b.name),
        slug: slugify(b.name),
      })),
    [brandsProp],
  );

  useEffect(() => {
    return () => {
      for (const m of media) {
        if (m.url?.startsWith("blob:")) URL.revokeObjectURL(m.url);
      }
    };
  }, [media]);

  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();

    const resetFormState = () => {
      setForm(INITIAL_FORM);
      setMedia([]);
      setActiveMediaId(null);
    };

    const loadProductDetail = async () => {
      if (!editingId) {
        setProductError("");
        setLoadingProduct(false);
        resetFormState();
        return;
      }

      try {
        setLoadingProduct(true);
        setProductError("");

        const response = await fetch(`/api/admin/products/${editingId}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          throw new Error(errorData?.error ?? errorData?.message ?? t("products.loadProductDetailFailed"));
        }

        const data = await response.json();

        const product = safePickItem<ApiProductDetail>(data);

        if (!product?.id) {
          throw new Error(t("products.invalidProductDetailResponse"));
        }

        setForm(toFormStateFromProduct(product));

        const mediaItems = normalizeMediaFromProduct(product);

        setMedia(mediaItems);

        setActiveMediaId(mediaItems[0]?.id ?? null);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const message = error instanceof Error ? error.message : t("products.loadProductDetailFailed");

        setProductError(message);

        resetFormState();
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProduct(false);
        }
      }
    };

    void loadProductDetail();

    return () => {
      controller.abort();
    };
  }, [editingId, t]);

  const setField = useCallback(<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((p) => ({
      ...p,
      [key]: value,
    }));

    setIsDirty(true);
  }, []);

  const handleDecimalFieldChange = useCallback(
    (key: "price" | "marketPrice" | "savingPrice", value: string) => {
      const raw = unformatPrice(value);

      const cleaned = sanitizeDecimalInput(raw);

      const formatted = formatPriceInput(cleaned);

      setField(key, formatted);
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
      const name = p.name?.trim() ? p.name : t("products.newProduct");

      const slug = p.slug?.trim() ? p.slug : slugify(name);

      const metaTitle = p.metaTitle?.trim() ? p.metaTitle : name;

      const metaDescription = p.metaDescription?.trim()
        ? p.metaDescription
        : t("products.buyOnlineMeta").replace("{name}", name);

      const shortDescription = p.shortDescription?.trim()
        ? p.shortDescription
        : t("products.premiumDescription").replace("{name}", name);

      const description = p.description?.trim()
        ? p.description
        : `${t("products.keyFeatures")}
        ${t("products.highQualityMaterials")}
        ${t("products.easyToUse")}
        ${t("products.greatValue")}

        ${t("products.inTheBox")}
        - 1 x ${name}

        ${t("products.warranty")}
        ${t("products.warrantyPolicy")}
        `;

      const price = p.price?.trim() ? p.price : "";

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
  }, [selectedCategory?.name, t]);

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

  const validateBasic = useCallback(() => {
    const errors: string[] = [];

    if (!effectiveSiteId) {
      errors.push(t("products.siteRequired"));
    }

    if (!form.name.trim()) {
      errors.push(t("products.nameRequired"));
    }

    if (!form.slug.trim()) {
      errors.push(t("products.slugRequired"));
    }

    if (!form.categoryId.trim()) {
      errors.push(t("products.categoryRequired"));
    }

    return errors;
  }, [effectiveSiteId, form, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateBasic();

      if (errors.length) {
        modal.error(t("products.invalidForm"), errors.join("\n"));

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
            throw new Error(t("products.uploadUnexpectedUrls"));
          }
        }

        const mergedMedia: MediaItem[] = media.map((m) => {
          const idx = toUpload.findIndex((x) => x.id === m.id);

          if (idx === -1) return m;

          const newUrl = uploadedUrls[idx];

          if (m.url.startsWith("blob:")) {
            URL.revokeObjectURL(m.url);
          }

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
        };

        await onSubmit?.(payload);

        const apiPayload = {
          siteId: payload.siteId,
          name: payload.name.trim(),
          slug: payload.slug.trim(),
          sku: payload.sku.trim() || null,
          barcode: payload.barcode.trim() || null,
          categoryId: payload.categoryId || null,
          brandId: payload.brandId || null,
          tags: payload.tags,
          status: payload.status,
          isVisible: payload.isVisible,
          publishedAt: payload.publishedAt || null,
          shortDescription: payload.shortDescription.trim() || null,
          description: payload.description.trim() || null,
          price: unformatPrice(payload.price.trim()) || null,
          marketPrice: unformatPrice(payload.marketPrice.trim()) || null,
          savingPrice: unformatPrice(payload.savingPrice.trim()) || null,
          productQty: payload.productQty.trim() || null,
          metaTitle: payload.metaTitle.trim() || null,
          metaDescription: payload.metaDescription.trim() || null,
          media: payload.media.map((m) => ({
            id: m.id,
            type: m.type,
            url: m.url,
            thumbUrl: m.thumbUrl,
          })),
        };

        const endpoint = isEditing ? `/api/admin/products/${editingId}` : "/api/admin/products";

        const method = isEditing ? "PATCH" : "POST";

        const res = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));

          throw new Error(
            j?.error ??
              j?.message ??
              (isEditing ? t("products.updateProductFailed") : t("products.createProductFailed")),
          );
        }

        await res.json().catch(() => null);

        modal.success(
          t("products.success"),
          isEditing ? t("products.updateProductSuccess") : t("products.createProductSuccess"),
        );

        setIsDirty(false);

        setLastSavedAt(new Date().toLocaleTimeString());

        onSaved?.();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : isEditing
              ? t("products.updateProductFailed")
              : t("products.createProductFailed");

        modal.error(isEditing ? t("products.updateFailed") : t("products.createFailed"), message);
      } finally {
        setBusyProp?.(false);
      }

      return () => controller.abort();
    },
    [editingId, effectiveSiteId, form, isEditing, media, modal, onSaved, onSubmit, setBusyProp, validateBasic, t],
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
        label: t("products.cancel"),
        icon: "bi-x-circle",
      },

      F3: {
        action: handlePublishNowAction,
        label: t("products.publishNow"),
        icon: "bi-upload",
      },

      F6: {
        action: handleEditAction,
        label: t("products.edit"),
        icon: "bi-pencil-square",
      },

      F9: {
        action: handleAutoFillAction,
        label: t("products.autoFill"),
        icon: "bi-magic",
      },

      F10: {
        action: handleSaveAction,
        label: t("products.save"),
        icon: "bi-save",
      },
    }),
    [handleAutoFillAction, handleCancelAction, handleEditAction, handlePublishNowAction, handleSaveAction, t],
  );

  usePageFunctionKeys(functionKeyActions);

  useEffect(() => {
    if (editingId) return;

    setForm((prev) => ({
      ...prev,
      sku: generateSKU(Date.now()),
      barcode: generateBarcode(),
    }));
  }, [editingId]);

  useEffect(() => {
    if (slugTouched) return;

    const source = form.metaTitle.trim() ? form.metaTitle : form.name;

    if (!source.trim()) return;

    setForm((prev) => ({
      ...prev,
      slug: slugify(source),
    }));
  }, [form.metaTitle, form.name, slugTouched]);

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
                  {loadingProduct ? t("products.loadingProductMedia") : t("products.noMediaYet")}
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
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                    }}
                    onClick={() => removeMedia(m.id)}
                    title={t("products.remove")}
                    disabled={loadingProduct || busyProp}
                  >
                    ×
                  </button>
                </div>
              ))}

              <label className={styles.uploadTile} title={t("products.upload")}>
                <input
                  className={styles.hiddenInput}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => onFilesSelected(e.target.files)}
                  disabled={loadingProduct || busyProp}
                />

                <div className={styles.uploadIcon}>☁</div>

                <div className={styles.uploadText}>{t("products.dropYourFileHere")}</div>

                <div className={styles.uploadHint}>{t("products.clickToUpload")}</div>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderLeft}>
                <div className={styles.sectionIcon}>
                  <i className="bi bi-search" />
                </div>

                <div>
                  <h2 className={styles.sectionTitle}>{t("products.seoOptimization")}</h2>

                  <p className={styles.sectionSub}>{t("products.improveSearchEngines")}</p>
                </div>
              </div>

              <div className={styles.sectionBadge}>
                <i className="bi bi-lightning-charge-fill" />
                {t("products.recommended")}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>{t("products.metaTitle")}</label>

                <input
                  className={styles.input}
                  value={form.metaTitle}
                  onChange={(e) => setField("metaTitle", e.target.value)}
                  disabled={loadingProduct}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("products.urlPreview")}</label>

                <div className={styles.previewUrl}>
                  /products/
                  <b>{form.slug || t("products.yourSlug")}</b>
                </div>
              </div>
            </div>

            <div className={styles.field} style={{ marginTop: 12 }}>
              <label className={styles.label}>{t("products.metaDescription")}</label>

              <textarea
                className={styles.textareaSmall}
                maxLength={160}
                value={form.metaDescription}
                onChange={(e) => setField("metaDescription", e.target.value)}
                placeholder={t("products.recommendedChars")}
                disabled={loadingProduct}
              />

              <div className={styles.mini}>
                {form.metaDescription.length}
                /160
              </div>
            </div>
          </div>
        </aside>
        <section className={styles.right}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div>
                <div className={styles.headerTitle}>
                  {isEditing ? t("products.editProduct") : t("products.createProduct")}
                </div>

                <div className={styles.headerSub}>
                  {isDirty ? (
                    <span className={styles.unsaved}>
                      <i className="bi bi-dot" />
                      {t("products.unsavedChanges")}
                    </span>
                  ) : (
                    <span className={styles.saved}>
                      <i className="bi bi-check-circle" />
                      {t("products.saved")}
                    </span>
                  )}

                  {lastSavedAt ? (
                    <span className={styles.lastSaved}>{t("products.lastSaved").replace("{time}", lastSavedAt)}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button type="button" className={styles.actionBtn} onClick={handleCancelAction}>
                <i className="bi bi-arrow-counterclockwise" />
                {t("products.cancel")}
              </button>

              <button type="button" className={styles.actionBtn} onClick={handleAutoFillAction}>
                <i className="bi bi-magic" />
                {t("products.autoFill")}
              </button>

              <button type="button" className={styles.publishBtn} onClick={handlePublishNowAction}>
                <i className="bi bi-send-check" />
                {t("products.publish")}
              </button>

              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveAction}
                disabled={busyProp || loadingProduct}
              >
                <i className="bi bi-save2" />

                {busyProp ? t("products.saving") : t("products.save")}
              </button>
            </div>
          </div>

          <div className={styles.body}>
            {productError ? <div className={styles.note}>{productError}</div> : null}

            <div className={styles.sectionForm}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {t("products.site")}
                    <span className={styles.req}>*</span>
                  </label>

                  <select
                    className={styles.select}
                    value={effectiveSiteId}
                    onChange={(e) => onChangeSite?.(e.target.value)}
                    disabled={loadingProduct}
                  >
                    <option value="">{t("products.selectSite")}</option>

                    {sites?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    {t("products.name")} <span className={styles.req}>*</span>
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
                    {t("products.slug")} <span className={styles.req}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={form.slug}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSlugTouched(Boolean(value.trim()));
                      setField("slug", value);
                    }}
                    disabled={loadingProduct}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    {t("products.category")} <span className={styles.req}>*</span>
                  </label>

                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      className={styles.select}
                      value={form.categoryId}
                      onChange={(e) => setField("categoryId", e.target.value)}
                      disabled={!effectiveSiteId || loadingProduct}
                      style={{ flex: 1 }}
                    >
                      <option value="">
                        {!effectiveSiteId ? t("products.selectSiteFirst") : t("products.selectCategory")}
                      </option>

                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>{t("products.brand")}</label>

                  <select
                    className={styles.select}
                    value={form.brandId}
                    onChange={(e) => setField("brandId", e.target.value)}
                    disabled={!effectiveSiteId || loadingProduct}
                  >
                    <option value="">{!effectiveSiteId ? t("products.selectSiteFirst") : t("products.noBrand")}</option>

                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.tagsRow}>
                  <label className={styles.label}>{t("products.tags")}</label>
                  <div className={styles.tagsInputWrap}>
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

                    <input
                      className={styles.tagsInput}
                      placeholder={t("products.typeTagAndPressAdd")}
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

                    <button type="button" className={styles.btnSmallTag} onClick={addTag} disabled={loadingProduct}>
                      <i className="bi bi-plus"></i> {t("products.add")}
                    </button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}> {t("products.sku")}</label>
                  <input
                    className={styles.input}
                    value={form.sku}
                    onChange={(e) => setField("sku", e.target.value)}
                    disabled={loadingProduct}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}> {t("products.barcode")}</label>
                  <input
                    className={styles.input}
                    value={form.barcode}
                    onChange={(e) => setField("barcode", e.target.value)}
                    disabled={loadingProduct}
                  />
                </div>
              </div>

              <div className={styles.grid2} style={{ marginTop: 6 }}>
                <div className={styles.field}>
                  <label className={styles.label}>{t("products.shortDescription")}</label>
                  <input
                    className={styles.input}
                    placeholder={t("products.shortDescriptionPlaceholder")}
                    value={form.shortDescription}
                    onChange={(e) => setField("shortDescription", e.target.value)}
                    disabled={loadingProduct}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>{t("products.status")}</label>
                  <select
                    className={styles.select}
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value as ProductStatus)}
                    disabled={loadingProduct}
                  >
                    <option value="DRAFT">{t("products.draft")}</option>
                    <option value="ACTIVE">{t("products.active")}</option>
                    <option value="ARCHIVED">{t("products.archived")}</option>
                  </select>
                </div>
              </div>

              <div className={styles.grid2} style={{ marginTop: 12 }}>
                <div className={styles.field}>
                  <label className={styles.label}>{t("products.price")}</label>
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
                  <label className={styles.label}>{t("products.marketPrice")}</label>
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
                  <label className={styles.label}>{t("products.savingPrice")}</label>
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
                  <label className={styles.label}>{t("products.quantity")}</label>
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
              <div className={styles.field} style={{ marginTop: 12 }}>
                <label className={styles.label}>{t("products.description")}</label>
                <RichEditor
                  value={form.description}
                  onChange={(html) => setField("description", html)}
                  placeholder={t("products.writeProductDescription")}
                  disabled={loadingProduct}
                />
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

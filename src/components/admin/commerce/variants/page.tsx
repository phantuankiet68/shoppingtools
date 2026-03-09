"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useSiteStore } from "@/store/site/site.store";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";
import styles from "@/styles/admin/commerce/variants/variants.module.css";

type Id = string;
type IsoDateString = string;
type Nullable<T> = T | null;

type ProductRow = Readonly<{
  id: Id;
  name: string;
  skuPrefix: string;
  image: Nullable<string>;
}>;

type VariantImageRow = Readonly<{
  id: Id;
  url: string;
  isCover: boolean;
  sort: number;
}>;

type VariantRow = Readonly<{
  id: Id;
  productId: Id;
  siteId: Id;
  sku: string;
  title: string;
  isActive: boolean;
  price: number;
  compareAtPrice: Nullable<number>;
  cost: Nullable<number>;
  stockQty: number;
  barcode: Nullable<string>;
  weight: Nullable<number>;
  length: Nullable<number>;
  width: Nullable<number>;
  height: Nullable<number>;
  isDefault: boolean;
  images: VariantImageRow[];
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}>;

type VariantFormState = {
  sku: string;
  title: string;
  isActive: boolean;
  price: number;
  compareAtPrice: Nullable<number>;
  cost: Nullable<number>;
  stockQty: number;
  barcode: Nullable<string>;
  weight: Nullable<number>;
  length: Nullable<number>;
  width: Nullable<number>;
  height: Nullable<number>;
  isDefault: boolean;
};

type DbVariantImage = Readonly<{
  id: string;
  url?: string | null;
  imageUrl?: string | null;
  isCover?: boolean | null;
  sort?: number | null;
  sortOrder?: number | null;
}>;

type DbVariant = Readonly<{
  id: string;
  productId: string;
  siteId?: string | null;
  sku?: string | null;
  title?: string | null;
  isActive?: boolean | null;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  cost?: number | string | null;
  stockQty?: number | null;
  barcode?: string | null;
  weight?: number | string | null;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  isDefault?: boolean | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  images?: DbVariantImage[];
}>;

type ApiListResponse<T> = Readonly<{
  items: T[];
}>;

type ApiItemResponse<T> = Readonly<{
  item: T;
}>;

type VariantCreatePayload = Readonly<{
  productId: string;
  siteId: string;
  sku: string;
  title: Nullable<string>;
  isActive: boolean;
  price: number;
  compareAtPrice: Nullable<number>;
  cost: Nullable<number>;
  stockQty: number;
  barcode: Nullable<string>;
  weight: Nullable<number>;
  length: Nullable<number>;
  width: Nullable<number>;
  height: Nullable<number>;
  isDefault: boolean;
}>;

type VariantPatchPayload = Partial<Omit<VariantCreatePayload, "productId" | "siteId">>;

type VariantImageCreatePayload = Readonly<{
  url: string;
  isCover: boolean;
  sort: number;
}>;

type VariantImagePatchPayload = Readonly<{
  imageId: string;
  isCover: boolean;
}>;

type UploadResponse = Readonly<{
  url?: string | null;
  imageUrl?: string | null;
  item?: {
    url?: string | null;
    imageUrl?: string | null;
    path?: string | null;
  } | null;
  data?: {
    url?: string | null;
    imageUrl?: string | null;
    path?: string | null;
  } | null;
}> | null;

type FunctionKeyActionMap = Partial<Record<`F${number}`, () => void>>;

const SAVE_METHOD: "PATCH" | "PUT" = "PATCH";

function nowIso(): IsoDateString {
  return new Date().toISOString();
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function slugSku(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatMoney(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(2);
}

function uniqueSkuForProduct(prefix: string, existingSkus: ReadonlySet<string>, base = "NEW"): string {
  const baseSku = slugSku(`${prefix}-${base}`);
  if (!existingSkus.has(baseSku)) return baseSku;

  for (let i = 2; i < 10000; i += 1) {
    const candidate = slugSku(`${prefix}-${base}-${i}`);
    if (!existingSkus.has(candidate)) return candidate;
  }

  return slugSku(`${prefix}-${base}-${Date.now()}`);
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function safeIso(value: unknown): IsoDateString {
  const date = value ? new Date(value as string | Date) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeNullableNumber(value: unknown): number | null {
  if (value === "" || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getApiErrorMessage(data: unknown, status: number): string {
  if (!isRecord(data)) return `HTTP ${status}`;

  const error = typeof data.error === "string" ? data.error : undefined;
  const message = typeof data.message === "string" ? data.message : undefined;

  return error || message || `HTTP ${status}`;
}

function normalizeImage(image: DbVariantImage): VariantImageRow {
  const sort = typeof image.sort === "number" ? image.sort : typeof image.sortOrder === "number" ? image.sortOrder : 0;

  return {
    id: String(image.id),
    url: image.url || image.imageUrl || "",
    isCover: Boolean(image.isCover),
    sort,
  };
}

function dbToUiVariant(variant: DbVariant): VariantRow {
  const images = Array.isArray(variant.images) ? variant.images.map(normalizeImage) : [];

  return {
    id: String(variant.id),
    productId: String(variant.productId),
    siteId: String(variant.siteId ?? ""),
    sku: String(variant.sku ?? ""),
    title: variant.title?.trim() || "",
    isActive: Boolean(variant.isActive),
    price: toNumber(variant.price, 0),
    compareAtPrice: variant.compareAtPrice == null ? null : toNumber(variant.compareAtPrice, 0),
    cost: variant.cost == null ? null : toNumber(variant.cost, 0),
    stockQty: Math.max(0, Math.trunc(toNumber(variant.stockQty, 0))),
    barcode: variant.barcode ?? null,
    weight: variant.weight == null ? null : toNumber(variant.weight, 0),
    length: variant.length == null ? null : toNumber(variant.length, 0),
    width: variant.width == null ? null : toNumber(variant.width, 0),
    height: variant.height == null ? null : toNumber(variant.height, 0),
    isDefault: Boolean(variant.isDefault),
    images,
    createdAt: safeIso(variant.createdAt),
    updatedAt: safeIso(variant.updatedAt),
  };
}

function variantToFormState(variant: VariantRow): VariantFormState {
  return {
    sku: variant.sku,
    title: variant.title,
    isActive: variant.isActive,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    cost: variant.cost,
    stockQty: variant.stockQty,
    barcode: variant.barcode,
    weight: variant.weight,
    length: variant.length,
    width: variant.width,
    height: variant.height,
    isDefault: variant.isDefault,
  };
}

function uiToDbCreatePayload(data: VariantFormState & { productId: string; siteId: string }): VariantCreatePayload {
  return {
    productId: data.productId,
    siteId: data.siteId,
    sku: data.sku,
    title: data.title.trim() ? data.title.trim() : null,
    isActive: data.isActive,
    price: toNumber(data.price, 0),
    compareAtPrice: data.compareAtPrice == null ? null : toNumber(data.compareAtPrice, 0),
    cost: data.cost == null ? null : toNumber(data.cost, 0),
    stockQty: Math.max(0, Math.trunc(toNumber(data.stockQty, 0))),
    barcode: data.barcode?.trim() ? data.barcode.trim() : null,
    weight: data.weight == null ? null : toNumber(data.weight, 0),
    length: data.length == null ? null : toNumber(data.length, 0),
    width: data.width == null ? null : toNumber(data.width, 0),
    height: data.height == null ? null : toNumber(data.height, 0),
    isDefault: data.isDefault,
  };
}

function uiToDbPatchPayload(data: VariantFormState): VariantPatchPayload {
  return {
    sku: data.sku,
    title: data.title.trim() ? data.title.trim() : null,
    isActive: data.isActive,
    price: toNumber(data.price, 0),
    compareAtPrice: data.compareAtPrice == null ? null : toNumber(data.compareAtPrice, 0),
    cost: data.cost == null ? null : toNumber(data.cost, 0),
    stockQty: Math.max(0, Math.trunc(toNumber(data.stockQty, 0))),
    barcode: data.barcode?.trim() ? data.barcode.trim() : null,
    weight: data.weight == null ? null : toNumber(data.weight, 0),
    length: data.length == null ? null : toNumber(data.length, 0),
    width: data.width == null ? null : toNumber(data.width, 0),
    height: data.height == null ? null : toNumber(data.height, 0),
    isDefault: data.isDefault,
  };
}

function extractUploadedImageUrl(data: UploadResponse): string {
  const candidates = [
    data?.url,
    data?.imageUrl,
    data?.item?.url,
    data?.item?.imageUrl,
    data?.item?.path,
    data?.data?.url,
    data?.data?.imageUrl,
    data?.data?.path,
  ];

  const matched = candidates.find((value) => typeof value === "string" && value.trim());
  return matched?.trim() || "";
}

async function apiJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 204) {
    return null as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, response.status));
  }

  return data as T;
}

export default function VariantsPage() {
  const modal = useModal();

  const sites = useSiteStore((state) => state.sites);
  const sitesLoading = useSiteStore((state) => state.loading);
  const sitesErr = useSiteStore((state) => state.err);
  const selectedSiteId = useSiteStore((state) => state.siteId);
  const setSelectedSiteId = useSiteStore((state) => state.setSiteId);
  const hydrateFromStorage = useSiteStore((state) => state.hydrateFromStorage);
  const loadSites = useSiteStore((state) => state.loadSites);

  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [activeProductId, setActiveProductId] = useState("");

  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [variantQuery, setVariantQuery] = useState("");
  const [activeVariantId, setActiveVariantId] = useState("");

  const [variantForm, setVariantForm] = useState<VariantFormState | null>(null);

  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId) ?? null,
    [products, activeProductId],
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = productQuery.trim().toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.skuPrefix.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [products, productQuery]);

  const productVariants = useMemo(() => {
    const normalizedQuery = variantQuery.trim().toLowerCase();

    return variants
      .filter((variant) => variant.productId === activeProductId)
      .filter((variant) => {
        if (!normalizedQuery) return true;
        return `${variant.title} ${variant.sku} ${variant.barcode ?? ""}`.toLowerCase().includes(normalizedQuery);
      })
      .slice()
      .sort((left, right) => left.title.localeCompare(right.title));
  }, [variants, activeProductId, variantQuery]);

  const activeVariant = useMemo(
    () => variants.find((variant) => variant.id === activeVariantId) ?? null,
    [variants, activeVariantId],
  );

  useEffect(() => {
    hydrateFromStorage();
    void loadSites();
  }, [hydrateFromStorage, loadSites]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProductsBySite(): Promise<void> {
      if (!selectedSiteId) {
        setProducts([]);
        setActiveProductId("");
        setVariants([]);
        setActiveVariantId("");
        setVariantForm(null);
        setLocalPreviewUrl(null);
        return;
      }

      try {
        setError(null);

        const response = await apiJson<ApiListResponse<ProductRow>>(
          `/api/admin/commerce/products/lite?siteId=${encodeURIComponent(selectedSiteId)}`,
          { signal: controller.signal },
        );

        const items = response.items ?? [];
        setProducts(items);

        setActiveProductId((previous) => {
          if (previous && items.some((item) => item.id === previous)) return previous;
          return items[0]?.id ?? "";
        });

        setVariants([]);
        setActiveVariantId("");
        setVariantForm(null);
        setLocalPreviewUrl(null);
      } catch (err: unknown) {
        if (isAbortError(err)) return;

        setProducts([]);
        setActiveProductId("");
        setVariants([]);
        setActiveVariantId("");
        setVariantForm(null);
        setLocalPreviewUrl(null);
        setError(getErrorMessage(err, "Failed to load products"));
      }
    }

    void loadProductsBySite();

    return () => controller.abort();
  }, [selectedSiteId]);

  const fetchVariantsByProduct = useCallback(async (productId: string, signal?: AbortSignal): Promise<VariantRow[]> => {
    const response = await apiJson<ApiListResponse<DbVariant>>(
      `/api/admin/commerce/variants?productId=${encodeURIComponent(productId)}`,
      { signal },
    );

    return (response.items ?? []).map(dbToUiVariant);
  }, []);

  const reloadActiveProductVariants = useCallback(
    async (preferredVariantId?: string): Promise<void> => {
      if (!activeProductId) return;

      setLoading(true);
      setError(null);

      try {
        const rows = await fetchVariantsByProduct(activeProductId);
        setVariants(rows);

        setActiveVariantId((previous) => {
          if (preferredVariantId && rows.some((row) => row.id === preferredVariantId)) {
            return preferredVariantId;
          }

          if (previous && rows.some((row) => row.id === previous)) {
            return previous;
          }

          return rows[0]?.id ?? "";
        });
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load variants"));
      } finally {
        setLoading(false);
      }
    },
    [activeProductId, fetchVariantsByProduct],
  );

  useEffect(() => {
    if (!activeProductId) {
      setVariants([]);
      setActiveVariantId("");
      setVariantForm(null);
      setLocalPreviewUrl(null);
      return;
    }

    const controller = new AbortController();

    async function loadVariantsByProduct(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const rows = await fetchVariantsByProduct(activeProductId, controller.signal);
        setVariants(rows);
        setActiveVariantId((previous) => {
          if (previous && rows.some((row) => row.id === previous)) return previous;
          return rows[0]?.id ?? "";
        });
      } catch (err: unknown) {
        if (isAbortError(err)) return;

        setVariants([]);
        setActiveVariantId("");
        setVariantForm(null);
        setLocalPreviewUrl(null);
        setError(getErrorMessage(err, "Failed to load variants"));
      } finally {
        setLoading(false);
      }
    }

    void loadVariantsByProduct();

    return () => controller.abort();
  }, [activeProductId, fetchVariantsByProduct]);

  useEffect(() => {
    if (!activeVariant) {
      setVariantForm(null);
      setLocalPreviewUrl(null);
      return;
    }

    setVariantForm(variantToFormState(activeVariant));
    setLocalPreviewUrl(null);
  }, [activeVariant]);

  const selectProduct = useCallback((productId: string) => {
    setActiveProductId(productId);
    setVariantQuery("");
    setActiveVariantId("");
    setVariantForm(null);
    setLocalPreviewUrl(null);
  }, []);

  const patchVariantForm = useCallback((patch: Partial<VariantFormState>) => {
    setVariantForm((previous) => (previous ? { ...previous, ...patch } : previous));
  }, []);

  const saveVariantRemote = useCallback(
    async (id: string, form: VariantFormState): Promise<void> => {
      setSavingId(id);
      setError(null);

      try {
        await apiJson<unknown>(`/api/admin/commerce/variants/${id}`, {
          method: SAVE_METHOD,
          body: JSON.stringify(uiToDbPatchPayload(form)),
        });

        await reloadActiveProductVariants(id);
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to save");
        setError(message);
        modal.error("Save failed", message);
      } finally {
        setSavingId(null);
      }
    },
    [reloadActiveProductVariants, modal],
  );

  const createVariantRemote = useCallback(async (): Promise<void> => {
    if (!selectedSiteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    if (!activeProduct) {
      modal.error("Missing product", "Please select a product first.");
      return;
    }

    setError(null);

    const existingSkus = new Set(variants.map((variant) => variant.sku));
    const sku = uniqueSkuForProduct(activeProduct.skuPrefix, existingSkus, "NEW");

    const newVariantForm: VariantFormState = {
      sku,
      title: "New variant",
      isActive: false,
      price: 0,
      compareAtPrice: null,
      cost: null,
      stockQty: 0,
      barcode: null,
      weight: null,
      length: null,
      width: null,
      height: null,
      isDefault: false,
    };

    try {
      const response = await apiJson<ApiItemResponse<DbVariant>>(`/api/admin/commerce/variants`, {
        method: "POST",
        body: JSON.stringify(
          uiToDbCreatePayload({
            ...newVariantForm,
            productId: activeProduct.id,
            siteId: selectedSiteId,
          }),
        ),
      });

      const createdId = response.item?.id ? String(response.item.id) : undefined;
      await reloadActiveProductVariants(createdId);
      modal.success("Success", "Created variant successfully.");
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to create");
      setError(message);
      modal.error("Create failed", message);
    }
  }, [activeProduct, selectedSiteId, variants, reloadActiveProductVariants, modal]);

  const duplicateVariantRemote = useCallback(
    async (id: string): Promise<void> => {
      const sourceVariant = variants.find((variant) => variant.id === id);
      if (!sourceVariant) return;

      setError(null);

      const product = products.find((item) => item.id === sourceVariant.productId);
      const skuPrefix = product?.skuPrefix || "SKU";

      const existingSkus = new Set(variants.map((variant) => variant.sku));
      const duplicatedSku = uniqueSkuForProduct(skuPrefix, existingSkus, "COPY");

      const duplicatedForm: VariantFormState = {
        sku: duplicatedSku,
        title: `${sourceVariant.title || "Variant"} Copy`,
        isActive: false,
        price: sourceVariant.price,
        compareAtPrice: sourceVariant.compareAtPrice,
        cost: sourceVariant.cost,
        stockQty: sourceVariant.stockQty,
        barcode: sourceVariant.barcode,
        weight: sourceVariant.weight,
        length: sourceVariant.length,
        width: sourceVariant.width,
        height: sourceVariant.height,
        isDefault: false,
      };

      try {
        const response = await apiJson<ApiItemResponse<DbVariant>>(`/api/admin/commerce/variants`, {
          method: "POST",
          body: JSON.stringify(
            uiToDbCreatePayload({
              ...duplicatedForm,
              productId: sourceVariant.productId,
              siteId: sourceVariant.siteId || selectedSiteId || "",
            }),
          ),
        });

        const createdId = response.item?.id ? String(response.item.id) : undefined;
        await reloadActiveProductVariants(createdId);
        modal.success("Success", `Duplicated “${sourceVariant.title || sourceVariant.sku}” successfully.`);
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to duplicate");
        setError(message);
        modal.error("Duplicate failed", message);
      }
    },
    [variants, products, selectedSiteId, reloadActiveProductVariants, modal],
  );

  const deleteVariantRemote = useCallback(
    async (id: string): Promise<void> => {
      const variant = variants.find((item) => item.id === id);
      if (!variant) return;

      modal.confirmDelete(
        "Delete variant?",
        `Delete “${variant.title || variant.sku}”? This action cannot be undone.`,
        async () => {
          setError(null);

          try {
            await apiJson<null>(`/api/admin/commerce/variants/${id}`, { method: "DELETE" });
            await reloadActiveProductVariants();
            modal.success("Success", `Deleted “${variant.title || variant.sku}” successfully.`);
          } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to delete");
            setError(message);
            modal.error("Delete failed", message);
          }
        },
      );
    },
    [variants, reloadActiveProductVariants, modal],
  );

  const reloadImages = useCallback(async (variantId: string): Promise<void> => {
    const response = await apiJson<ApiListResponse<DbVariantImage>>(`/api/admin/commerce/variants/${variantId}/image`);

    setVariants((previous) =>
      previous.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              images: (response.items ?? []).map(normalizeImage),
              updatedAt: nowIso(),
            }
          : variant,
      ),
    );
  }, []);

  const addImageByUrlRemote = useCallback(
    async (url: string, showSuccess = true): Promise<void> => {
      if (!activeVariant) {
        modal.error("Missing variant", "Please select a variant first.");
        return;
      }

      const cleanUrl = url.trim();
      if (!cleanUrl) return;

      setError(null);

      const payload: VariantImageCreatePayload = {
        url: cleanUrl,
        isCover: activeVariant.images.length === 0,
        sort: activeVariant.images.length,
      };

      try {
        await apiJson<ApiItemResponse<unknown>>(`/api/admin/commerce/variants/${activeVariant.id}/image`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        await reloadImages(activeVariant.id);

        if (showSuccess) {
          modal.success("Success", "Added image successfully.");
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to add image");
        setError(message);
        modal.error("Add image failed", message);
      }
    },
    [activeVariant, reloadImages, modal],
  );

  const addImageRemote = useCallback(async (): Promise<void> => {
    if (!activeVariant) {
      modal.error("Missing variant", "Please select a variant first.");
      return;
    }

    const inputUrl = window.prompt("Image URL?");
    if (!inputUrl?.trim()) return;

    await addImageByUrlRemote(inputUrl);
  }, [activeVariant, addImageByUrlRemote, modal]);

  const uploadImageFileRemote = useCallback(
    async (file: File): Promise<void> => {
      if (!activeVariant) {
        modal.error("Missing variant", "Please select a variant first.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        modal.error("Invalid file", "Please drop or select an image file.");
        return;
      }

      setError(null);
      setUploadingImage(true);

      const previewUrl = URL.createObjectURL(file);
      setLocalPreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return previewUrl;
      });

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("variantId", activeVariant.id);
        formData.append("productId", activeVariant.productId);
        formData.append("siteId", activeVariant.siteId);

        const uploadResponse = await apiJson<UploadResponse>(`/api/admin/commerce/variants/upload`, {
          method: "POST",
          body: formData,
        });

        const uploadedUrl = extractUploadedImageUrl(uploadResponse);

        if (!uploadedUrl) {
          throw new Error("Upload thành công nhưng API không trả về url ảnh");
        }

        await addImageByUrlRemote(uploadedUrl, false);
        setLocalPreviewUrl(null);
        modal.success("Success", "Uploaded image successfully.");
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to upload image");
        setError(message);
        modal.error("Upload failed", message);
      } finally {
        setUploadingImage(false);
        setIsDragOver(false);

        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
      }
    },
    [activeVariant, addImageByUrlRemote, modal],
  );

  const handleChooseImageFile = useCallback((): void => {
    if (!activeVariant) {
      modal.error("Missing variant", "Please select a variant first.");
      return;
    }

    if (uploadingImage) return;
    imageInputRef.current?.click();
  }, [activeVariant, uploadingImage, modal]);

  const handleImageInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = event.target.files?.[0];
      if (!file) return;

      await uploadImageFileRemote(file);
    },
    [uploadImageFileRemote],
  );

  const handleDropZoneDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      event.stopPropagation();
      if (!activeVariant || uploadingImage) return;
      setIsDragOver(true);
    },
    [activeVariant, uploadingImage],
  );

  const handleDropZoneDragLeave = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDropZoneDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>): Promise<void> => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      if (!activeVariant) {
        modal.error("Missing variant", "Please select a variant first.");
        return;
      }

      if (uploadingImage) return;

      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      await uploadImageFileRemote(file);
    },
    [activeVariant, uploadingImage, uploadImageFileRemote, modal],
  );

  const setCoverRemote = useCallback(
    async (imageId: string): Promise<void> => {
      if (!activeVariant) {
        modal.error("Missing variant", "Please select a variant first.");
        return;
      }

      setError(null);

      const payload: VariantImagePatchPayload = {
        imageId,
        isCover: true,
      };

      try {
        await apiJson<ApiItemResponse<unknown>>(`/api/admin/commerce/variants/${activeVariant.id}/image`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        await reloadImages(activeVariant.id);
        modal.success("Success", "Updated cover image successfully.");
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to set cover");
        setError(message);
        modal.error("Set cover failed", message);
      }
    },
    [activeVariant, reloadImages, modal],
  );

  const saveActiveVariant = useCallback(async (): Promise<void> => {
    if (!activeVariant || !variantForm) {
      modal.error("Missing variant", "Please select a variant first.");
      return;
    }

    await saveVariantRemote(activeVariant.id, variantForm);
    modal.success("Success", `Saved “${variantForm.title || activeVariant.sku}” successfully.`);
  }, [activeVariant, variantForm, saveVariantRemote, modal]);

  const publishActiveVariant = useCallback(async (): Promise<void> => {
    if (!activeVariant || !variantForm) {
      modal.error("Missing variant", "Please select a variant first.");
      return;
    }

    const publishForm: VariantFormState = {
      ...variantForm,
      isActive: true,
    };

    setVariantForm(publishForm);
    await saveVariantRemote(activeVariant.id, publishForm);
    modal.success("Success", `Published “${publishForm.title || activeVariant.sku}” successfully.`);
  }, [activeVariant, variantForm, saveVariantRemote, modal]);

  const handleDelete = useCallback((): void => {
    if (!activeVariant) {
      modal.error("Missing variant", "Please select a variant first.");
      return;
    }

    void deleteVariantRemote(activeVariant.id);
  }, [activeVariant, deleteVariantRemote, modal]);

  const handleNewVariant = useCallback((): void => {
    void createVariantRemote();
  }, [createVariantRemote]);

  const handleAutocomplete = useCallback((): void => {
    if (!activeProduct || !variantForm) {
      modal.error("Missing data", "Please select a product and variant first.");
      return;
    }

    const existingSkus = new Set(
      variants.filter((variant) => variant.id !== activeVariantId).map((variant) => variant.sku),
    );

    const titleBase = variantForm.title.trim() || activeProduct.name.trim() || "Variant";
    const skuBase = slugSku(titleBase) || "AUTO";
    const nextSku = uniqueSkuForProduct(activeProduct.skuPrefix, existingSkus, skuBase);

    setVariantForm((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        title: previous.title.trim() ? previous.title : titleBase,
        sku: nextSku,
      };
    });
  }, [activeProduct, variantForm, variants, activeVariantId, modal]);

  const handleSave = useCallback((): void => {
    void saveActiveVariant();
  }, [saveActiveVariant]);

  const handlePublishSaveSeo = useCallback((): void => {
    void publishActiveVariant();
  }, [publishActiveVariant]);

  const functionKeyActions = useMemo<FunctionKeyActionMap>(
    () => ({
      F3: handleDelete,
      F5: handleNewVariant,
      F9: handleAutocomplete,
      F10: handleSave,
      F11: handlePublishSaveSeo,
    }),
    [handleDelete, handleNewVariant, handleAutocomplete, handleSave, handlePublishSaveSeo],
  );

  usePageFunctionKeys(functionKeyActions);

  return (
    <div className={styles.shell} style={{ fontSize: 14 }}>
      {error && (
        <div style={{ padding: 12, color: "#b91c1c" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Products</div>
            <div className={styles.WrapSite}>
              <span style={{ fontWeight: 700 }}>Site:</span>

              <select
                value={selectedSiteId || ""}
                onChange={(event) => setSelectedSiteId(event.target.value)}
                disabled={sitesLoading}
                className={styles.selectSite}
              >
                <option value="">{sitesLoading ? "Loading sites..." : "Select site"}</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name ?? site.id} ({site.id})
                  </option>
                ))}
              </select>

              {sitesErr ? <span style={{ marginLeft: 8, opacity: 0.8 }}>({sitesErr})</span> : null}
            </div>
          </div>

          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input
              className={styles.search}
              placeholder="Search product..."
              value={productQuery}
              onChange={(event) => setProductQuery(event.target.value)}
              disabled={!selectedSiteId}
            />
          </div>

          <div className={styles.productList}>
            {!selectedSiteId ? (
              <div className={styles.emptyRow} style={{ margin: 12 }}>
                <i className="bi bi-diagram-3" />
                <div>
                  <div className={styles.emptyTitle}>No site selected</div>
                  <div className={styles.emptyText}>Choose a site first.</div>
                </div>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className={styles.emptyRow} style={{ margin: 12 }}>
                <i className="bi bi-inbox" />
                <div>
                  <div className={styles.emptyTitle}>No products</div>
                  <div className={styles.emptyText}>This site has no products yet.</div>
                </div>
              </div>
            ) : (
              visibleProducts.map((product) => {
                const isActive = product.id === activeProductId;

                return (
                  <button
                    key={product.id}
                    type="button"
                    className={`${styles.productBtn} ${isActive ? styles.productActive : ""}`}
                    onClick={() => selectProduct(product.id)}
                  >
                    <div className={styles.productLeft}>
                      <div className={styles.thumb}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className={styles.thumbImg}
                          src={product.image || "https://picsum.photos/seed/na/200/200"}
                          alt={product.name}
                        />
                      </div>
                      <div className={styles.productText}>
                        <div className={styles.productName}>{product.name}</div>
                        <div className={styles.productMeta}>
                          <span className={styles.mono}>{product.skuPrefix}</span>
                        </div>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right" />
                  </button>
                );
              })
            )}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>
                Variants unique theo <span className={styles.mono}>[siteId, sku]</span>.
              </span>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.content}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Variants list</div>
                  <div className={styles.panelSub}>
                    {loading ? "Loading..." : savingId ? "Saving..." : "Search, quick actions"}
                  </div>
                </div>
                <div className={styles.toolbar}>
                  <div className={styles.searchWrapInline}>
                    <i className="bi bi-search" />
                    <input
                      className={styles.searchInline}
                      placeholder="Search variant..."
                      value={variantQuery}
                      onChange={(event) => setVariantQuery(event.target.value)}
                      disabled={!activeProductId}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Variant</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className={styles.thRight}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {productVariants.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className={styles.emptyRow}>
                            <i className="bi bi-inbox" />
                            <div>
                              <div className={styles.emptyTitle}>No variants</div>
                              <div className={styles.emptyText}>
                                {activeProductId ? "Create a variant." : "Select a product first."}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      productVariants.map((variant) => {
                        const isActive = variant.id === activeVariantId;

                        return (
                          <tr
                            key={variant.id}
                            className={`${styles.tr} ${isActive ? styles.trActive : ""}`}
                            onClick={() => setActiveVariantId(variant.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setActiveVariantId(variant.id);
                              }
                            }}
                          >
                            <td>
                              <div className={styles.cellTitle}>
                                <span className={styles.dot} />
                                <div>
                                  <div className={styles.nameRow}>
                                    <span className={styles.name}>{variant.title || "Untitled variant"}</span>
                                  </div>
                                  <div className={styles.sub}>
                                    <span className={styles.mono}>
                                      {variant.isDefault ? "Default" : "Custom"}
                                      {variant.barcode ? `  ·  ${variant.barcode}` : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className={styles.mono}>{variant.sku}</td>
                            <td className={styles.mono}>{formatMoney(variant.price)}</td>
                            <td className={styles.mono}>{variant.stockQty}</td>

                            <td>
                              <span className={`${styles.status} ${variant.isActive ? styles.ok : styles.off}`}>
                                <i className={`bi ${variant.isActive ? "bi-check2-circle" : "bi-pencil"}`} />
                                {variant.isActive ? "ACTIVE" : "DRAFT"}
                              </span>
                            </td>

                            <td className={styles.tdRight} onClick={(event) => event.stopPropagation()}>
                              <button
                                className={styles.iconBtn}
                                type="button"
                                title="Toggle status"
                                onClick={() => {
                                  const toggledForm: VariantFormState = {
                                    ...variantToFormState(variant),
                                    isActive: !variant.isActive,
                                  };
                                  void saveVariantRemote(variant.id, toggledForm);
                                }}
                              >
                                <i className="bi bi-toggle2-on" />
                              </button>

                              <button
                                className={styles.iconBtn}
                                type="button"
                                title="Duplicate"
                                onClick={() => void duplicateVariantRemote(variant.id)}
                              >
                                <i className="bi bi-files" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className={styles.inspector}>
              <div className={styles.panel}>
                {!activeVariant || !variantForm ? (
                  <div className={styles.panelBody}>
                    <div className={styles.emptyInspector}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.emptyTitle}>Select a variant</div>
                        <div className={styles.emptyText}>Click a row to edit.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    <label className={styles.label}>Title</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-tag" />
                      <input
                        className={styles.input}
                        value={variantForm.title}
                        onChange={(event) => patchVariantForm({ title: event.target.value })}
                      />
                    </div>

                    <label className={styles.label}>SKU</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-hash" />
                      <input
                        className={styles.input}
                        value={variantForm.sku}
                        onChange={(event) => patchVariantForm({ sku: slugSku(event.target.value) })}
                      />
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Price</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-cash-stack" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.01"
                            value={variantForm.price}
                            onChange={(event) =>
                              patchVariantForm({
                                price: toNumber(event.target.value, 0),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Price</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-currency-dollar" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.01"
                            value={variantForm.compareAtPrice ?? ""}
                            onChange={(event) =>
                              patchVariantForm({
                                compareAtPrice: normalizeNullableNumber(event.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Cost</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-wallet2" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.01"
                            value={variantForm.cost ?? ""}
                            onChange={(event) =>
                              patchVariantForm({
                                cost: normalizeNullableNumber(event.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Stock Qty</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-box-seam" />
                          <input
                            className={styles.input}
                            type="number"
                            value={variantForm.stockQty}
                            onChange={(event) =>
                              patchVariantForm({
                                stockQty: clamp(Number(event.target.value || 0), 0, 1_000_000),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Barcode</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-upc-scan" />
                          <input
                            className={styles.input}
                            value={variantForm.barcode ?? ""}
                            onChange={(event) => patchVariantForm({ barcode: event.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Status</label>
                        <div className={styles.selectWrap}>
                          <i className="bi bi-flag" />
                          <select
                            className={styles.select}
                            value={String(variantForm.isActive)}
                            onChange={(event) =>
                              patchVariantForm({
                                isActive: event.target.value === "true",
                              })
                            }
                          >
                            <option value="true">ACTIVE</option>
                            <option value="false">DRAFT</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Weight</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-box" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.001"
                            value={variantForm.weight ?? ""}
                            onChange={(event) =>
                              patchVariantForm({
                                weight: normalizeNullableNumber(event.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Is default</label>
                        <div className={styles.selectWrap}>
                          <i className="bi bi-star" />
                          <select
                            className={styles.select}
                            value={String(variantForm.isDefault)}
                            onChange={(event) =>
                              patchVariantForm({
                                isDefault: event.target.value === "true",
                              })
                            }
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-bounding-box" /> Dimensions
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Length</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-arrows-expand" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.001"
                            value={variantForm.length ?? ""}
                            onChange={(event) =>
                              patchVariantForm({
                                length: normalizeNullableNumber(event.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Width</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-arrows-angle-expand" />
                          <input
                            className={styles.input}
                            type="number"
                            step="0.001"
                            value={variantForm.width ?? ""}
                            onChange={(event) =>
                              patchVariantForm({
                                width: normalizeNullableNumber(event.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={styles.label}>Height</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-arrows-vertical" />
                        <input
                          className={styles.input}
                          type="number"
                          step="0.001"
                          value={variantForm.height ?? ""}
                          onChange={(event) =>
                            patchVariantForm({
                              height: normalizeNullableNumber(event.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.hr} />

                    <div className={styles.sectionTitle}>
                      <i className="bi bi-images" /> Images (DB)
                    </div>

                    <div className={styles.images}>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(event) => {
                          void handleImageInputChange(event);
                        }}
                      />

                      <div
                        onDragOver={handleDropZoneDragOver}
                        onDragLeave={handleDropZoneDragLeave}
                        onDrop={(event) => {
                          void handleDropZoneDrop(event);
                        }}
                        onClick={handleChooseImageFile}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleChooseImageFile();
                          }
                        }}
                        style={{
                          border: `2px dashed ${isDragOver ? "#2563eb" : "#cbd5e1"}`,
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 12,
                          background: isDragOver ? "#eff6ff" : "#f8fafc",
                          cursor: uploadingImage ? "not-allowed" : "pointer",
                          opacity: uploadingImage ? 0.7 : 1,
                          transition: "all 0.2s ease",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <i className="bi bi-cloud-arrow-up" style={{ fontSize: 28 }} />
                          <div style={{ fontWeight: 700 }}>
                            {uploadingImage ? "Uploading image..." : "Drag & drop image here"}
                          </div>
                          <div style={{ opacity: 0.75 }}>or click to choose file</div>
                        </div>
                      </div>

                      {localPreviewUrl ? (
                        <div className={styles.imageRow} style={{ border: "1px dashed #cbd5e1" }}>
                          <div className={styles.imageThumb}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={localPreviewUrl} alt="Preview upload" />
                          </div>
                          <div className={styles.imageMeta}>
                            <div className={styles.mono}>Preview image upload...</div>
                            <div className={styles.imageBadges}>
                              <span className={styles.badge}>Preview</span>
                              {uploadingImage && <span className={styles.badge}>Uploading</span>}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {activeVariant.images.length === 0 && !localPreviewUrl ? (
                        <div className={styles.emptySmall}>
                          No images. Upload image, kéo thả ảnh hoặc thêm image URL.
                        </div>
                      ) : (
                        activeVariant.images
                          .slice()
                          .sort((left, right) => left.sort - right.sort)
                          .map((image) => (
                            <div key={image.id} className={styles.imageRow}>
                              <div className={styles.imageThumb}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={image.url} alt="" />
                              </div>
                              <div className={styles.imageMeta}>
                                <div className={styles.mono}>{image.url}</div>
                                <div className={styles.imageBadges}>
                                  {image.isCover && <span className={styles.badge}>Cover</span>}
                                </div>
                              </div>
                              <div className={styles.imageActions}>
                                <button
                                  className={styles.iconBtn}
                                  type="button"
                                  title="Set cover"
                                  onClick={() => void setCoverRemote(image.id)}
                                >
                                  <i className="bi bi-star" />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

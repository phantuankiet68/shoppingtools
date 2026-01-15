"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/product/products.module.css";
import RichTextEditor from "@/components/admin/form/RichTextEditor";

/** =========================
 *  Types
 *  ========================= */
type ApiImage = {
  id?: string;
  url: string;
  isCover?: boolean;
  sort?: number;
};

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
};

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  sku: string;
  barcode: string | null;

  priceCents: number;
  costCents: number;
  stock: number;

  isActive: boolean;

  categoryId: string | null;
  category?: { id: string; name: string } | null;

  createdAt: string;
  updatedAt: string;
  images?: ApiImage[];
};

type SortKey = "Newest" | "PriceAsc" | "PriceDesc" | "NameAsc";
type ModalMode = "create" | "edit";

type ProductForm = {
  name: string;
  slug: string;
  description: string;

  sku: string;
  barcode: string;

  cost: string; // input money
  price: string; // input money
  stock: string; // input number

  categoryId: string; // "" => null
  isActive: boolean;

  images: { url: string; isCover: boolean }[]; // URL images
};

/** =========================
 *  Helpers
 *  ========================= */
function moneyFromCents(cents: number) {
  const n = (cents ?? 0) / 100;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function centsFromInput(v: string) {
  const raw = String(v ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/,/g, ".");
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  const normalized = parts.length <= 2 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n * 100));
}

function inputFromCents(cents: number) {
  return ((cents ?? 0) / 100).toFixed(2);
}

function toStock(v: string) {
  const n = parseInt(String(v ?? "0"), 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function slugify(input: string) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

function emptyForm(): ProductForm {
  return {
    name: "",
    slug: "",
    description: "",
    sku: "",
    barcode: "",
    cost: "0.00",
    price: "0.00",
    stock: "0",
    categoryId: "",
    isActive: true,
    images: [],
  };
}

function mapToForm(p: ApiProduct): ProductForm {
  const imgs = Array.isArray(p.images) ? p.images : [];
  const mapped = imgs
    .map((x) => ({
      url: String(x?.url ?? "").trim(),
      isCover: !!x?.isCover,
    }))
    .filter((x) => x.url.length > 0);

  const coverIdx = mapped.findIndex((x) => x.isCover);
  if (coverIdx >= 0) mapped.forEach((x, i) => (x.isCover = i === coverIdx));
  else if (mapped.length) mapped[0].isCover = true;

  return {
    name: p.name ?? "",
    slug: p.slug ?? "",
    description: p.description ?? "",
    sku: p.sku ?? "",
    barcode: p.barcode ?? "",
    cost: inputFromCents(p.costCents),
    price: inputFromCents(p.priceCents),
    stock: String(p.stock ?? 0),
    categoryId: p.categoryId ?? "",
    isActive: !!p.isActive,
    images: mapped,
  };
}

/** =========================
 *  Component
 *  ========================= */
export default function AdminProductsClient() {
  /** Product state */
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("Newest");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [openSuggest, setOpenSuggest] = useState(false);
  const suggestWrapRef = useClickOutside<HTMLDivElement>(() => setOpenSuggest(false));

  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const rowMenuWrapRef = useClickOutside<HTMLDivElement>(() => setOpenRowMenu(null));

  /** Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [formErr, setFormErr] = useState<string>("");
  const modalCardRef = useRef<HTMLDivElement | null>(null);

  /** Images (upload files) */
  const [localFiles, setLocalFiles] = useState<{ file: File; preview: string }[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  /** Category state */
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catErr, setCatErr] = useState("");
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catActive, setCatActive] = useState(true);
  const [catSlugEdited, setCatSlugEdited] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  async function loadCategories() {
    setCatLoading(true);
    setCatErr("");
    try {
      const res = await fetch("/api/admin/product-categories?page=1&pageSize=200&active=all&sort=nameAsc", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to load categories");
      setCategories(Array.isArray(json?.items) ? json.items : []);
    } catch (e: any) {
      setCatErr(e?.message || "Failed to load categories");
    } finally {
      setCatLoading(false);
    }
  }

  async function createCategory() {
    const name = catName.trim();
    if (!name) {
      setCatErr("Category name is required");
      return;
    }

    setBusy(true);
    setCatErr("");
    try {
      const res = await fetch("/api/admin/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: catSlug.trim() ? slugify(catSlug.trim()) : null,
          isActive: !!catActive,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Create category failed");

      setCatName("");
      setCatSlug("");
      setCatActive(true);
      setCatSlugEdited(false);
      await loadCategories();
    } catch (e: any) {
      setCatErr(e?.message || "Create category failed");
    } finally {
      setBusy(false);
    }
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      params.set("active", activeFilter);
      params.set("sort", sort === "PriceAsc" ? "priceAsc" : sort === "PriceDesc" ? "priceDesc" : sort === "NameAsc" ? "nameAsc" : "newest");
      params.set("page", "1");
      params.set("pageSize", "50");

      const res = await fetch(`/api/admin/products?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to load products");
      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, activeFilter]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 6);
    return items.filter((p) => (p.name ?? "").toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q) || (p.barcode ?? "").toLowerCase().includes(q)).slice(0, 8);
  }, [items, query]);

  const filtered = useMemo(() => {
    const arr = [...items];
    switch (sort) {
      case "PriceAsc":
        arr.sort((a, b) => (a.priceCents ?? 0) - (b.priceCents ?? 0));
        break;
      case "PriceDesc":
        arr.sort((a, b) => (b.priceCents ?? 0) - (a.priceCents ?? 0));
        break;
      case "NameAsc":
        arr.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
        break;
      default:
        break;
    }
    return arr;
  }, [items, sort]);

  const allChecked = filtered.length > 0 && filtered.every((p) => selected[p.id]);
  const checkedCount = filtered.filter((p) => selected[p.id]).length;

  function nextSkuFromItems(items0: { sku: string }[]) {
    const prefix = "SP_";
    let max = 0;
    for (const p of items0) {
      if (!p.sku?.startsWith(prefix)) continue;
      const n = Number(p.sku.replace(prefix, ""));
      if (Number.isFinite(n)) max = Math.max(max, n);
    }
    return `${prefix}${String(max + 1).padStart(3, "0")}`;
  }

  function openCreate() {
    setModalMode("create");
    setEditingId(null);

    const defaultSku = nextSkuFromItems(items);

    setForm({
      ...emptyForm(),
      sku: defaultSku,
    });

    setLocalFiles([]);
    setCoverIndex(0);

    setFormErr("");
    setModalOpen(true);
    setTimeout(() => modalCardRef.current?.focus(), 0);
  }

  async function openEdit(p: ApiProduct) {
    setModalMode("edit");
    setEditingId(p.id);
    setFormErr("");
    setBusy(true);

    try {
      // ✅ đúng route
      const res = await fetch(`/api/admin/products/${p.id}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to load product");

      setForm(mapToForm(json.item));
      setLocalFiles([]);
      setCoverIndex(0);

      setModalOpen(true);
      setTimeout(() => modalCardRef.current?.focus(), 0);
    } catch (e: any) {
      setFormErr(e?.message || "Failed to load product");
    } finally {
      setBusy(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setFormErr("");
  }

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  function validateForm(f: ProductForm) {
    const name = f.name.trim();
    const slug = f.slug.trim();
    const sku = f.sku.trim();

    if (!name) return "Name is required";
    if (!slug) return "Slug is required";
    if (!sku) return "SKU is required";
    if (sku.length > 64) return "SKU too long";

    const stock = parseInt(f.stock || "0", 10);
    if (!Number.isFinite(stock) || stock < 0) return "Stock must be a non-negative number";

    for (const img of f.images) {
      if (!img.url.trim()) return "Image URL cannot be empty";
    }

    // ✅ nếu upload file thì backend upload endpoint phải có
    if (localFiles.length > 0) {
      // không chặn nữa — submitForm sẽ upload trước
    }

    return "";
  }

  function getThumb(p: ApiProduct) {
    const url = p.images?.[0]?.url;
    return url && String(url).trim().length ? String(url) : "";
  }

  useEffect(() => {
    return () => {
      localFiles.forEach((x) => URL.revokeObjectURL(x.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFiles]);

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files || []);
    const onlyImages = arr.filter((f) => f.type.startsWith("image/"));

    setLocalFiles((prev) => {
      const next = [...prev];
      for (const f of onlyImages) {
        if (next.some((x) => x.file.name === f.name && x.file.size === f.size)) continue;
        next.push({ file: f, preview: URL.createObjectURL(f) });
      }
      return next;
    });
  }

  function addUrlImageRow() {
    setForm((s) => ({ ...s, images: [...s.images, { url: "", isCover: s.images.length === 0 }] }));
  }

  function setCoverUrlIndex(idx: number) {
    setForm((s) => ({ ...s, images: s.images.map((x, i) => ({ ...x, isCover: i === idx })) }));
  }

  function removeUrlImageIndex(idx: number) {
    setForm((s) => {
      const nextImgs = s.images.filter((_, i) => i !== idx);

      let coverIdx = nextImgs.findIndex((x) => x.isCover);
      if (nextImgs.length > 0 && coverIdx < 0) {
        nextImgs[0] = { ...nextImgs[0], isCover: true };
      } else if (nextImgs.length > 0 && coverIdx >= 0) {
        nextImgs.forEach((x, i) => (x.isCover = i === coverIdx));
      }
      return { ...s, images: nextImgs };
    });
  }

  /** ✅ Upload local images -> returns public URLs */
  async function uploadLocalImages(files: File[]) {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);

    const res = await fetch("/api/admin/products/uploads/images", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "Upload failed");

    const urls: string[] = Array.isArray(json?.urls) ? json.urls : [];
    if (urls.length === 0) throw new Error("Upload failed: empty urls");
    return urls;
  }

  /** =========================
   *  ✅ FIXED submitForm
   *  - upload localFiles first (if any)
   *  - merge uploaded urls + url images
   *  - ensure only one cover
   *  - POST/PATCH JSON to products API
   *  ========================= */
  async function submitForm() {
    const msg = validateForm(form);
    if (msg) {
      setFormErr(msg);
      return;
    }

    setBusy(true);
    setFormErr("");
    try {
      // 1) URL images user pasted
      const urlImages = form.images
        .map((x, i) => ({
          url: x.url.trim(),
          isCover: !!x.isCover,
          sort: i,
        }))
        .filter((x) => x.url.length > 0);

      // 2) upload local files (if any) -> urls
      let uploadedUrls: string[] = [];
      if (localFiles.length > 0) {
        uploadedUrls = await uploadLocalImages(localFiles.map((x) => x.file));
      }

      // 3) convert uploaded urls -> images items (cover by coverIndex)
      const uploadedImages = uploadedUrls.map((u, i) => ({
        url: String(u).trim(),
        isCover: i === coverIndex,
        sort: urlImages.length + i,
      }));

      // 4) merge images
      const merged = [...urlImages, ...uploadedImages].filter((x) => x.url.length > 0);

      // 5) ensure exactly one cover
      let coverAt = merged.findIndex((x) => x.isCover);
      if (coverAt < 0 && merged.length > 0) {
        merged[0].isCover = true;
        coverAt = 0;
      } else if (coverAt >= 0) {
        merged.forEach((x, i) => (x.isCover = i === coverAt));
      }

      // 6) payload JSON for API
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug.trim()),
        description: form.description.trim() || null,

        sku: form.sku.trim(),
        barcode: form.barcode.trim() ? form.barcode.trim() : null,

        costCents: centsFromInput(form.cost),
        priceCents: centsFromInput(form.price),
        stock: toStock(form.stock),

        categoryId: form.categoryId ? form.categoryId : null,
        isActive: !!form.isActive,

        images: merged,
      };

      const res =
        modalMode === "create"
          ? await fetch("/api/admin/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/products/${editingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Save failed");

      // clear local preview after save
      setLocalFiles([]);
      setCoverIndex(0);

      closeModal();
      await load();
    } catch (e: any) {
      setFormErr(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function softDeleteOne(id: string) {
    if (!confirm("Deactivate this product?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Delete failed");
      await load();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const rows = filtered.map((p) => ({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      barcode: p.barcode ?? "",
      category: p.category?.name ?? "",
      cost: moneyFromCents(p.costCents),
      price: moneyFromCents(p.priceCents),
      stock: String(p.stock ?? 0),
      status: p.isActive ? "Active" : "Inactive",
      updatedAt: p.updatedAt,
    }));

    const header = Object.keys(rows[0] ?? { name: "", slug: "", sku: "", barcode: "", category: "", cost: "", price: "", stock: "", status: "", updatedAt: "" });

    const csv = header.join(",") + "\n" + rows.map((r) => header.map((k) => `"${String((r as any)[k] ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>
      {/* MAIN LAYOUT 4/8 */}
      <div className={styles.mainGrid}>
        {/* LEFT: ProductCategory */}
        <aside className={styles.leftCol}>
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <div className={styles.sideTitle}>Product Categories</div>
              <button type="button" className={styles.iconBtn} title="Refresh categories" onClick={loadCategories} disabled={catLoading || busy}>
                <i className={`bi bi-arrow-clockwise ${catLoading ? styles.spin : ""}`} />
              </button>
            </div>

            {catErr && (
              <div className={styles.sideError}>
                <i className="bi bi-exclamation-triangle" />
                <span>{catErr}</span>
              </div>
            )}

            <div className={styles.sideForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Category name *</label>
                <input
                  className={styles.input}
                  value={catName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCatName(v);
                    if (!catSlugEdited) setCatSlug(slugify(v));
                  }}
                  placeholder="e.g. Chairs"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Slug (optional)</label>
                <input
                  className={styles.input}
                  value={catSlug}
                  onChange={(e) => {
                    setCatSlugEdited(true);
                    setCatSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. chairs"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.switchRow}>
                  <input type="checkbox" checked={catActive} onChange={(e) => setCatActive(e.target.checked)} />
                  <span className={styles.switchUi} />
                  <span className={styles.switchText}>{catActive ? "Active" : "Inactive"}</span>
                </label>
              </div>

              <button type="button" className={styles.btnPrimary} onClick={createCategory} disabled={busy}>
                <i className="bi bi-plus-lg" />
                <span>Add category</span>
              </button>
            </div>

            <div className={styles.sideList}>
              <div className={styles.sideListHead}>
                <span>All categories</span>
                <span className={styles.muted}>{categories.length}</span>
              </div>

              {catLoading ? (
                <div className={styles.sideEmpty}>Loading...</div>
              ) : categories.length === 0 ? (
                <div className={styles.sideEmpty}>No categories yet</div>
              ) : (
                categories.map((c) => (
                  <div key={c.id} className={styles.catRow}>
                    <div className={styles.catMeta}>
                      <div className={styles.catName}>{c.name}</div>
                      <div className={styles.catSub}>
                        <span className={styles.mono}>{c.slug || "—"}</span>
                      </div>
                    </div>

                    <span className={`${styles.badge} ${c.isActive ? styles.badgeOk : styles.badgeOff}`}>
                      <i className={`bi ${c.isActive ? "bi-check-circle-fill" : "bi-slash-circle"}`} />
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT: Product list */}
        <section className={styles.rightCol}>
          {/* Filter row */}
          <div className={styles.filterRow}>
            <div className={styles.chips}>
              <div className={styles.chipSelect}>
                <i className={`bi bi-arrow-down-up ${styles.chipIcon}`} />
                <select className={styles.chipNative} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  <option value="Newest">Newest</option>
                  <option value="NameAsc">Name A → Z</option>
                  <option value="PriceAsc">Price: Low → High</option>
                  <option value="PriceDesc">Price: High → Low</option>
                </select>
                <i className={`bi bi-chevron-down ${styles.chev}`} />
              </div>

              <div className={styles.chipSelect}>
                <i className={`bi bi-toggle2-on ${styles.chipIcon}`} />
                <select className={styles.chipNative} value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as any)}>
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <i className={`bi bi-chevron-down ${styles.chev}`} />
              </div>

              <button type="button" className={styles.chipBtn} onClick={load} disabled={loading || busy} title="Refresh">
                <i className={`bi bi-arrow-clockwise ${loading ? styles.spin : ""}`} />
              </button>
            </div>

            {/* search */}
            <div className={styles.searchWrap} ref={suggestWrapRef}>
              <i className={`bi bi-search ${styles.searchIcon}`} />
              <input className={styles.search} value={query} placeholder="Search name / sku / barcode..." onChange={(e) => setQuery(e.target.value)} onFocus={() => setOpenSuggest(true)} />
              {query && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  aria-label="Clear"
                  onClick={() => {
                    setQuery("");
                    setOpenSuggest(true);
                  }}>
                  <i className="bi bi-x" />
                </button>
              )}

              {openSuggest && (
                <div className={styles.suggest}>
                  <div className={styles.suggestHead}>Products</div>
                  {suggestions.length === 0 ? (
                    <div className={styles.suggestEmpty}>No results</div>
                  ) : (
                    suggestions.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className={styles.suggestItem}
                        onClick={() => {
                          setQuery(p.name);
                          setOpenSuggest(false);
                        }}>
                        <div className={styles.suggestAvatar}>
                          <i className="bi bi-box-seam" />
                        </div>
                        <div className={styles.suggestMeta}>
                          <div className={styles.suggestName}>{p.name}</div>
                          <div className={styles.suggestSub}>
                            {moneyFromCents(p.priceCents)} • {p.sku}
                            {p.barcode ? ` • ${p.barcode}` : ""}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className={styles.topActions}>
              <button type="button" className={styles.btnSoft} onClick={exportCsv} disabled={loading || busy || filtered.length === 0} title="Export data">
                <i className="bi bi-download" />
                <span>Export</span>
              </button>

              <button className={styles.btnPrimary} type="button" onClick={openCreate} disabled={busy}>
                <i className="bi bi-plus-lg" />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Card table */}
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <label className={styles.checkAll}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => {
                    const next = { ...selected };
                    filtered.forEach((p) => (next[p.id] = e.target.checked));
                    setSelected(next);
                  }}
                />
                <span>{checkedCount > 0 ? `${checkedCount} selected` : "Select"}</span>
              </label>

              <div className={styles.cardHint}>
                {loading ? (
                  "Loading..."
                ) : error ? (
                  <span className={styles.errText}>{error}</span>
                ) : (
                  <>
                    Showing <b>{filtered.length}</b> products
                  </>
                )}
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 46 }} />
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th style={{ width: 140, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((p) => {
                    const thumb = getThumb(p);
                    return (
                      <tr key={p.id}>
                        <td>
                          <input type="checkbox" checked={!!selected[p.id]} onChange={(e) => setSelected((s) => ({ ...s, [p.id]: e.target.checked }))} />
                        </td>

                        <td>
                          <div className={styles.prodCell}>
                            {thumb ? (
                              <img className={styles.prodThumb} src={thumb} alt="" />
                            ) : (
                              <div className={styles.prodAvatar}>
                                <i className="bi bi-box-seam" />
                              </div>
                            )}

                            <div className={styles.prodMeta}>
                              <div className={styles.prodNameRow}>
                                <div className={styles.prodName}>{p.name}</div>
                                {p.barcode ? <span className={styles.miniPill}>#{p.barcode}</span> : null}
                              </div>
                              <div className={styles.prodSub}>
                                <span className={styles.mono}>{p.sku}</span>
                                <span className={styles.sep}>•</span>
                                <span className={styles.muted}>Stock {p.stock ?? 0}</span>
                                {p.category?.name ? (
                                  <>
                                    <span className={styles.sep}>•</span>
                                    <span className={styles.muted}>{p.category.name}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className={styles.mono}>{p.sku}</td>

                        <td>
                          <div className={styles.priceCol}>
                            <div className={styles.priceMain}>{moneyFromCents(p.priceCents)}</div>
                            <div className={styles.priceSub}>Cost {moneyFromCents(p.costCents)}</div>
                          </div>
                        </td>

                        <td>
                          <span className={`${styles.badge} ${p.isActive ? styles.badgeOk : styles.badgeOff}`}>
                            <i className={`bi ${p.isActive ? "bi-check-circle-fill" : "bi-slash-circle"}`} />
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <div className={styles.actions} ref={rowMenuWrapRef}>
                            <button type="button" className={styles.iconBtn} title="Edit" onClick={() => openEdit(p)} disabled={busy}>
                              <i className="bi bi-pencil" />
                            </button>

                            <button type="button" className={styles.iconBtn} title="Deactivate" onClick={() => softDeleteOne(p.id)} disabled={busy}>
                              <i className="bi bi-trash3" />
                            </button>

                            <button type="button" className={styles.iconBtn} aria-label="More" title="More" onClick={() => setOpenRowMenu((cur) => (cur === p.id ? null : p.id))} disabled={busy}>
                              <i className="bi bi-three-dots" />
                            </button>

                            {openRowMenu === p.id && (
                              <div className={styles.rowMenu}>
                                <button
                                  type="button"
                                  className={styles.rowMenuItem}
                                  onClick={() => {
                                    setOpenRowMenu(null);
                                    openEdit(p);
                                  }}>
                                  <i className="bi bi-pencil-square" />
                                  Edit product
                                </button>

                                <button
                                  type="button"
                                  className={styles.rowMenuItem}
                                  onClick={() => {
                                    setOpenRowMenu(null);
                                    navigator.clipboard?.writeText(p.id).catch(() => {});
                                  }}>
                                  <i className="bi bi-clipboard" />
                                  Copy product ID
                                </button>

                                <div className={styles.rowMenuSep} />

                                <button
                                  type="button"
                                  className={`${styles.rowMenuItem} ${styles.rowMenuDanger}`}
                                  onClick={() => {
                                    setOpenRowMenu(null);
                                    softDeleteOne(p.id);
                                  }}>
                                  <i className="bi bi-trash3" />
                                  Deactivate
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className={styles.empty}>
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}>
          <div
            className={styles.modalShell}
            ref={(el) => {
              modalCardRef.current = el;
            }}
            tabIndex={-1}>
            <div className={styles.modalTopBar}>
              <div className={styles.modalTitleBlock}>
                <div className={styles.modalTitle}>{modalMode === "create" ? "Create product" : "Edit product"}</div>
                <div className={styles.modalSub}>Details, category, pricing, stock & images.</div>
              </div>

              <div className={styles.modalTopActions}>
                <button type="button" className={styles.modalIconBtn} title="Close" onClick={closeModal} disabled={busy}>
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            </div>

            {formErr && (
              <div className={styles.formError}>
                <i className="bi bi-exclamation-triangle" />
                <span>{formErr}</span>
              </div>
            )}

            <div className={styles.modalBody}>
              {/* Left */}
              <div className={styles.modalLeft}>
                <div className={styles.section}>
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Name *</label>
                      <input
                        className={styles.input}
                        value={form.name}
                        onChange={(e) => {
                          const v = e.target.value;

                          setForm((s) => ({
                            ...s,
                            name: v,
                            // ✅ chỉ auto slug khi user CHƯA sửa slug thủ công
                            slug: slugEdited ? s.slug : slugify(v),
                          }));
                        }}
                        placeholder="e.g. Wood Chair Dark Brown"
                        autoFocus
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Slug *</label>
                      <input
                        className={styles.input}
                        value={form.slug}
                        onChange={(e) => {
                          // ✅ đánh dấu user đã sửa slug
                          setSlugEdited(true);

                          const v = e.target.value;
                          setForm((s) => ({ ...s, slug: slugify(v) }));
                        }}
                        placeholder="e.g. dau-goi-mang"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Category</label>
                      <select className={styles.input} value={form.categoryId} onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}>
                        <option value="">— No category —</option>
                        {categories
                          .filter((c) => (c.isActive ?? true) === true)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>SKU *</label>
                      <input className={styles.input} value={form.sku} onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} placeholder="e.g. SP_001" />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Barcode</label>
                      <input className={styles.input} value={form.barcode} onChange={(e) => setForm((s) => ({ ...s, barcode: e.target.value }))} placeholder="Optional" />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                      <label className={styles.label}>Description</label>
                      <RichTextEditor value={form.description} onChange={(html) => setForm((s) => ({ ...s, description: html }))} placeholder="Write a rich description…" minHeight={140} />
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHead}>
                    <div className={styles.sectionTitle}>Pricing & stock</div>
                    <div className={styles.sectionHint}>Cost, selling price, stock and status</div>
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Cost</label>
                      <div className={styles.moneyWrap}>
                        <span className={styles.moneyPrefix}>$</span>
                        <input className={styles.inputMoney} value={form.cost} onChange={(e) => setForm((s) => ({ ...s, cost: e.target.value }))} inputMode="decimal" placeholder="0.00" />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Price</label>
                      <div className={styles.moneyWrap}>
                        <span className={styles.moneyPrefix}>$</span>
                        <input className={styles.inputMoney} value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} inputMode="decimal" placeholder="0.00" />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Stock</label>
                      <input className={styles.input} value={form.stock} onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))} inputMode="numeric" placeholder="0" />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Status</label>
                      <label className={styles.switchRow}>
                        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))} />
                        <span className={styles.switchUi} />
                        <span className={styles.switchText}>{form.isActive ? "Active" : "Inactive"}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Images */}
              <div className={styles.modalRight}>
                <div className={styles.section}>
                  <div className={styles.sectionHead}>
                    <div className={styles.sectionTitle}>Images</div>
                    <div className={styles.sectionHint}>Upload preview or paste URLs. Pick a cover.</div>
                  </div>

                  {/* Upload dropzone (preview only, backend chưa upload) */}
                  <div
                    className={styles.dropzone}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                    }}>
                    <input
                      className={styles.dropInput}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files?.length) addFiles(e.target.files);
                        e.currentTarget.value = "";
                      }}
                    />

                    <div className={styles.dropInner}>
                      <div className={styles.dropIcon}>
                        <i className="bi bi-cloud-arrow-up" />
                      </div>
                      <div className={styles.dropTitle}>Drop images here</div>
                      <div className={styles.dropSub}>Preview only (need backend upload endpoint to save files)</div>
                    </div>
                  </div>

                  {/* Uploaded files preview */}
                  {localFiles.length === 0 ? (
                    <div className={styles.imageEmpty}>
                      <div className={styles.imageEmptyIcon}>
                        <i className="bi bi-images" />
                      </div>
                      <div className={styles.imageEmptyText}>
                        <div className={styles.imageEmptyTitle}>No uploaded images</div>
                        <div className={styles.imageEmptySub}>You can paste Image URLs below.</div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadGrid}>
                      {localFiles.map((x, i) => (
                        <div key={`${x.file.name}-${x.file.size}-${i}`} className={styles.uploadTile}>
                          <div className={styles.uploadThumbWrap}>
                            <img className={styles.uploadThumb} src={x.preview} alt="" />
                            <div className={styles.uploadBadges}>
                              {i === coverIndex ? (
                                <span className={styles.coverBadge}>
                                  <i className="bi bi-star-fill" /> Cover
                                </span>
                              ) : (
                                <button type="button" className={styles.coverSetBtn} onClick={() => setCoverIndex(i)}>
                                  <i className="bi bi-star" /> Set cover
                                </button>
                              )}
                            </div>
                          </div>

                          <div className={styles.uploadFoot}>
                            <div className={styles.uploadMeta}>
                              <div className={styles.uploadName}>{x.file.name}</div>
                              <div className={styles.uploadSize}>{Math.round(x.file.size / 1024)} KB</div>
                            </div>

                            <button
                              type="button"
                              className={styles.toolBtnDanger}
                              onClick={() => {
                                setLocalFiles((prev) => {
                                  const next = prev.filter((_, idx) => idx !== i);
                                  if (next.length === 0) setCoverIndex(0);
                                  else if (coverIndex >= next.length) setCoverIndex(next.length - 1);
                                  else if (i === coverIndex) setCoverIndex(0);
                                  return next;
                                });
                              }}
                              title="Remove">
                              <i className="bi bi-trash3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* URL Images editor */}
                  <div className={styles.imageTip} style={{ marginTop: 12 }}>
                    <i className="bi bi-link-45deg" />
                    Tip: Product API currently stores image URLs. Paste URLs below.
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                    <button type="button" className={styles.btnSoft} onClick={addUrlImageRow} disabled={busy}>
                      <i className="bi bi-plus-lg" /> Add image URL
                    </button>

                    {form.images.length === 0 ? (
                      <div className={styles.sideEmpty}>No URL images</div>
                    ) : (
                      form.images.map((img, idx) => (
                        <div key={idx} className={styles.catRow} style={{ alignItems: "center" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input
                              className={styles.input}
                              value={img.url}
                              onChange={(e) => {
                                const v = e.target.value;
                                setForm((s) => {
                                  const next = [...s.images];
                                  next[idx] = { ...next[idx], url: v };
                                  return { ...s, images: next };
                                });
                              }}
                              placeholder="https://..."
                            />
                            <div className={styles.catSub}>
                              <span className={styles.mono}>{img.isCover ? "cover" : "—"}</span>
                            </div>
                          </div>

                          {img.isCover ? (
                            <span className={styles.badge + " " + styles.badgeOk}>
                              <i className="bi bi-star-fill" /> Cover
                            </span>
                          ) : (
                            <button type="button" className={styles.btnSoft} onClick={() => setCoverUrlIndex(idx)} disabled={busy}>
                              <i className="bi bi-star" /> Set cover
                            </button>
                          )}

                          <button type="button" className={styles.iconBtn} title="Remove" onClick={() => removeUrlImageIndex(idx)} disabled={busy}>
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className={styles.imageTip}>
                    <i className="bi bi-lightbulb" />
                    Tip: Cover image will be used as thumbnail in the product list.
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnSoft} onClick={closeModal} disabled={busy}>
                Cancel
              </button>

              <button type="button" className={styles.btnPrimary} onClick={submitForm} disabled={busy}>
                {busy ? (
                  <>
                    <i className={`bi bi-arrow-repeat ${styles.spin}`} />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2" />
                    {modalMode === "create" ? "Create product" : "Save changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

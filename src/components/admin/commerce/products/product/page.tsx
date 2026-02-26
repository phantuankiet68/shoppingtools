"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/product/products.module.css";
import RichTextEditor from "@/components/admin/form/RichTextEditor";

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

  cost: string;
  price: string;
  stock: string;

  categoryId: string;
  isActive: boolean;

  images: { url: string; isCover: boolean }[];
};

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
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function safeJson(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
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

export default function AdminProductsClient() {
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [formErr, setFormErr] = useState<string>("");

  const modalCardRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [localFiles, setLocalFiles] = useState<{ file: File; preview: string }[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  /** Categories */
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [slugEdited, setSlugEdited] = useState(false);

  /** Sidebar filters (source of truth) */
  const [filters, setFilters] = useState({
    q: "",
    categoryIds: [] as string[],
    priceMin: "",
    priceMax: "",
    active: "all" as "all" | "active" | "inactive",
    sort: "Newest" as SortKey,
  });

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/product-categories?page=1&pageSize=200&active=all&sort=nameAsc", { cache: "no-store" });
      const json = await safeJson(res);
      if (!res.ok) throw new Error((json as any)?.error || "Failed to load categories");
      setCategories(Array.isArray((json as any)?.items) ? (json as any).items : []);
    } catch {
      // UI của bạn hiện không render lỗi categories, nên mình im lặng để tránh spam
      setCategories([]);
    }
  }

  async function loadWithFilters(f: typeof filters) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();

      if (f.q.trim()) params.set("q", f.q.trim());

      params.set("active", f.active);
      params.set("sort", f.sort === "PriceAsc" ? "priceAsc" : f.sort === "PriceDesc" ? "priceDesc" : f.sort === "NameAsc" ? "nameAsc" : "newest");

      if (f.categoryIds.length > 0) params.set("categoryIds", f.categoryIds.join(","));

      const min = centsFromInput(f.priceMin);
      const max = centsFromInput(f.priceMax);

      if (f.priceMin.trim()) params.set("priceMinCents", String(min));
      if (f.priceMax.trim()) params.set("priceMaxCents", String(max));

      params.set("page", "1");
      params.set("pageSize", "50");

      const res = await fetch(`/api/admin/products?${params.toString()}`, { cache: "no-store" });
      const json = await safeJson(res);
      if (!res.ok) throw new Error((json as any)?.error || "Failed to load products");

      setItems(Array.isArray((json as any)?.items) ? (json as any).items : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithFilters(filters);
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean selection when items changed (avoid keeping stale ids)
  useEffect(() => {
    setSelected((prev) => {
      const alive = new Set(items.map((x) => x.id));
      const next: Record<string, boolean> = {};
      for (const [id, v] of Object.entries(prev)) {
        if (alive.has(id) && v) next[id] = true;
      }
      return next;
    });
  }, [items]);

  // Close row menu on click outside
  useEffect(() => {
    if (!openRowMenu) return;

    const onDown = (e: MouseEvent) => {
      if (!rowMenuRef.current) {
        setOpenRowMenu(null);
        return;
      }
      if (e.target instanceof Node && rowMenuRef.current.contains(e.target)) return;
      setOpenRowMenu(null);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openRowMenu]);

  const filtered = useMemo(() => {
    // server đã trả theo sort/filter, nhưng bạn vẫn muốn sort tại client -> mình giữ y như logic bạn đang có
    const arr = [...items];
    switch (filters.sort) {
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
  }, [items, filters.sort]);

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

    setSlugEdited(false); // ✅ create: auto slug theo name
    const defaultSku = nextSkuFromItems(items);

    setForm({
      ...emptyForm(),
      sku: defaultSku,
    });

    setLocalFiles([]);
    setCoverIndex(0);

    setFormErr("");
    setModalOpen(true);

    setTimeout(() => {
      nameInputRef.current?.focus();
      modalCardRef.current?.focus();
    }, 0);
  }

  async function openEdit(p: ApiProduct) {
    setModalMode("edit");
    setEditingId(p.id);

    setSlugEdited(true); // ✅ edit: đổi name không tự đổi slug (an toàn)
    setFormErr("");
    setBusy(true);

    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { cache: "no-store" });
      const json = await safeJson(res);
      if (!res.ok) throw new Error((json as any)?.error || "Failed to load product");

      setForm(mapToForm((json as any).item));
      setLocalFiles([]);
      setCoverIndex(0);

      setModalOpen(true);
      setTimeout(() => {
        nameInputRef.current?.focus();
        modalCardRef.current?.focus();
      }, 0);
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
  }, [modalOpen]);

  useEffect(() => {
    return () => {
      localFiles.forEach((x) => URL.revokeObjectURL(x.preview));
    };
  }, [localFiles]);

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
    return "";
  }

  function getThumb(p: ApiProduct) {
    const url = p.images?.[0]?.url;
    return url && String(url).trim().length ? String(url) : "";
  }

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

      const coverIdx = nextImgs.findIndex((x) => x.isCover);
      if (nextImgs.length > 0 && coverIdx < 0) {
        nextImgs[0] = { ...nextImgs[0], isCover: true };
      } else if (nextImgs.length > 0 && coverIdx >= 0) {
        nextImgs.forEach((x, i) => (x.isCover = i === coverIdx));
      }
      return { ...s, images: nextImgs };
    });
  }

  async function uploadLocalImages(files: File[]) {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);

    const res = await fetch("/api/admin/products/uploads/images", { method: "POST", body: fd });
    const json = await safeJson(res);
    if (!res.ok) throw new Error((json as any)?.error || "Upload failed");

    const urls: string[] = Array.isArray((json as any)?.urls) ? (json as any).urls : [];
    if (urls.length === 0) throw new Error("Upload failed: empty urls");
    return urls;
  }

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

      // 2) upload local files -> urls
      let uploadedUrls: string[] = [];
      if (localFiles.length > 0) {
        uploadedUrls = await uploadLocalImages(localFiles.map((x) => x.file));
      }

      // 3) uploaded urls -> images (cover by coverIndex within uploaded group)
      const uploadedImages = uploadedUrls.map((u, i) => ({
        url: String(u).trim(),
        isCover: i === coverIndex,
        sort: urlImages.length + i,
      }));

      // 4) merge
      const merged = [...urlImages, ...uploadedImages].filter((x) => x.url.length > 0);

      // 5) ensure exactly one cover
      let coverAt = merged.findIndex((x) => x.isCover);
      if (coverAt < 0 && merged.length > 0) {
        merged[0].isCover = true;
        coverAt = 0;
      } else if (coverAt >= 0) {
        merged.forEach((x, i) => (x.isCover = i === coverAt));
      }

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

      const json = await safeJson(res);
      if (!res.ok) throw new Error((json as any)?.error || "Save failed");

      setLocalFiles([]);
      setCoverIndex(0);

      closeModal();
      await loadWithFilters(filters);
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
      const json = await safeJson(res);
      if (!res.ok) throw new Error((json as any)?.error || "Delete failed");
      await loadWithFilters(filters);
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    if (filtered.length === 0) return;

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

    const header = Object.keys(rows[0]);
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

  function applyFilters() {
    loadWithFilters(filters);
  }

  return (
    <div className={styles.page}>
      <div className={styles.mainGrid}>
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <div className={styles.sideActions2}>
                <button type="button" className={styles.btnSoft} onClick={exportCsv} disabled={loading || busy || filtered.length === 0}>
                  <i className="bi bi-download" />
                  Export
                </button>

                <button className={styles.btnPrimary} type="button" onClick={openCreate} disabled={busy}>
                  <i className="bi bi-plus-lg" />
                  New
                </button>
              </div>

              <button type="button" className={styles.iconBtn} title="Refresh" onClick={() => loadWithFilters(filters)} disabled={loading || busy}>
                <i className={`bi bi-arrow-clockwise ${loading ? styles.spin : ""}`} />
              </button>
            </div>

            {error && (
              <div className={styles.sideError}>
                <i className="bi bi-exclamation-triangle" />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.sideBody}>
              {/* Keyword */}
              <div className={styles.sideBlock}>
                <div className={styles.sideLabel}>Search</div>
                <div className={styles.searchWrap}>
                  <i className={`bi bi-search ${styles.searchIcon}`} />
                  <input className={styles.search} value={filters.q} placeholder="name / sku / barcode..." onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))} />
                  {filters.q && (
                    <button type="button" className={styles.clearBtn} onClick={() => setFilters((s) => ({ ...s, q: "" }))}>
                      <i className="bi bi-x" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className={styles.sideBlock}>
                <div className={styles.sideLabel}>Category</div>

                <div className={styles.checkList}>
                  {categories.length === 0 ? (
                    <div className={styles.sideEmpty}>No categories</div>
                  ) : (
                    categories.map((c) => {
                      const checked = filters.categoryIds.includes(c.id);

                      return (
                        <label key={c.id} className={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const on = e.target.checked;
                              setFilters((s) => {
                                const next = new Set(s.categoryIds);
                                if (on) next.add(c.id);
                                else next.delete(c.id);
                                return { ...s, categoryIds: Array.from(next) };
                              });
                            }}
                          />

                          <span className={styles.checkText}>
                            {c.name}
                            {typeof (c as any).count === "number" ? <span className={styles.checkCount}>({(c as any).count})</span> : null}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Price range */}
              <div className={styles.sideBlock}>
                <div className={styles.sideLabel}>Price range</div>
                <div className={styles.rangeGrid}>
                  <div className={styles.rangeField}>
                    <span className={styles.rangeHint}>Min</span>
                    <input className={styles.input} value={filters.priceMin} inputMode="decimal" placeholder="0" onChange={(e) => setFilters((s) => ({ ...s, priceMin: e.target.value }))} />
                  </div>

                  <div className={styles.rangeField}>
                    <span className={styles.rangeHint}>Max</span>
                    <input className={styles.input} value={filters.priceMax} inputMode="decimal" placeholder="9999" onChange={(e) => setFilters((s) => ({ ...s, priceMax: e.target.value }))} />
                  </div>
                </div>

                <div className={styles.smallHelp}>* Tip: nhập giá theo USD (ví dụ 12.5)</div>
              </div>

              {/* Status */}
              <div className={styles.sideBlock}>
                <div className={styles.sideLabel}>Status</div>
                <select className={styles.input} value={filters.active} onChange={(e) => setFilters((s) => ({ ...s, active: e.target.value as any }))}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Sort */}
              <div className={styles.sideBlock}>
                <div className={styles.sideLabel}>Sort</div>
                <select className={styles.input} value={filters.sort} onChange={(e) => setFilters((s) => ({ ...s, sort: e.target.value as SortKey }))}>
                  <option value="Newest">Newest</option>
                  <option value="NameAsc">Name A → Z</option>
                  <option value="PriceAsc">Price: Low → High</option>
                  <option value="PriceDesc">Price: High → Low</option>
                </select>
              </div>

              {/* Actions */}
              <div className={styles.sideActions}>
                <button type="button" className={styles.btnPrimary} onClick={applyFilters} disabled={busy}>
                  <i className="bi bi-check2" />
                  Apply
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.rightCol}>
          <div className={styles.listCard}>
            {/* Top bar (giữ select + hint) */}
            <div className={styles.listTop}>
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

              <div className={styles.listHint}>
                {loading ? (
                  "Loading..."
                ) : error ? (
                  <span className={styles.errText}>{error}</span>
                ) : (
                  <>
                    Showing <p className={styles.countProductText}>{filtered.length}</p> products
                  </>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className={styles.prodGrid}>
              {filtered.map((p) => {
                const thumb = getThumb(p);
                const isChecked = !!selected[p.id];

                return (
                  <article key={p.id} className={styles.prodCard}>
                    {/* media */}
                    <div className={styles.prodMedia}>
                      {thumb ? (
                        <img className={styles.prodImg} src={thumb} alt="" />
                      ) : (
                        <div className={styles.prodImgEmpty}>
                          <i className="bi bi-image" />
                        </div>
                      )}

                      {/* corner ribbon (giữ hoặc bỏ tuỳ bạn) */}
                      <div className={styles.cornerRibbon} />

                      {/* TOP actions: checkbox + edit/delete/more (thay vị trí like) */}
                      <div className={styles.prodMediaTop}>
                        <label className={styles.cardCheck}>
                          <input type="checkbox" checked={!!selected[p.id]} onChange={(e) => setSelected((s) => ({ ...s, [p.id]: e.target.checked }))} />
                        </label>

                        <div className={styles.mediaActions}>
                          <button type="button" className={styles.mediaIconBtn} title="Edit" onClick={() => openEdit(p)} disabled={busy}>
                            <i className="bi bi-pencil" />
                          </button>

                          <button type="button" className={styles.mediaIconBtn} title="Deactivate" onClick={() => softDeleteOne(p.id)} disabled={busy}>
                            <i className="bi bi-trash3" />
                          </button>

                          <button type="button" className={styles.mediaIconBtn} aria-label="More" title="More" onClick={() => setOpenRowMenu((cur) => (cur === p.id ? null : p.id))} disabled={busy}>
                            <i className="bi bi-three-dots" />
                          </button>

                          {openRowMenu === p.id && (
                            <div
                              className={styles.rowMenu}
                              ref={(el) => {
                                rowMenuRef.current = el;
                              }}>
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
                      </div>

                      {/* BOTTOM overlay mờ: name + meta (đè lên ảnh) */}
                      <div className={styles.mediaInfoOverlay}>
                        <div className={styles.overlayName} title={p.name}>
                          {p.name}
                        </div>

                        <div className={styles.overlayMeta}>
                          <span className={styles.mono}>{p.sku}</span>
                          <span className={styles.dot}>•</span>
                          <span>Stock {p.stock ?? 0}</span>
                          {p.barcode ? (
                            <>
                              <span className={styles.dot}>•</span>
                              <span>#{p.barcode}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className={styles.prodTag}>{p.category?.name ?? "No category"}</div>
                    </div>

                    <div className={styles.prodBody}>
                      <div className={styles.priceRow}>
                        <div className={styles.priceMain}>{moneyFromCents(p.priceCents)}</div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {!loading && filtered.length === 0 && <div className={styles.emptyGrid}>No products found</div>}
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
              <div className={styles.modalLeft}>
                <div className={styles.section}>
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Name *</label>
                      <input
                        ref={nameInputRef}
                        className={styles.input}
                        value={form.name}
                        onChange={(e) => {
                          const v = e.target.value;

                          setForm((s) => ({
                            ...s,
                            name: v,
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

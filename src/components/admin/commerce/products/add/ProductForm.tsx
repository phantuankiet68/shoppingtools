"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/commerce/products/add/ProductForm.module.css";

type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
type ProductType = "PHYSICAL" | "DIGITAL" | "SERVICE";

type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbUrl?: string;
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

type AttributeType = "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "MULTISELECT" | "DATE";

type AttributeSchema = {
  id: string;
  code: string;
  name: string;
  type: AttributeType;
  unit?: string;
  required?: boolean;
  options?: string[];
};

type AttributeValue = {
  attributeId: string;
  value: string;
};

type Props = {
  onCancel?: () => void;
  onSubmit?: (payload: any) => void;
};

function cuidLike(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(2, 6)}`;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductForm({ onCancel, onSubmit }: Props) {
  const demoMedia: MediaItem[] = useMemo(
    () => [
      {
        id: "m1",
        type: "video",
        url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=60",
        thumbUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=400&q=60",
      },
      {
        id: "m2",
        type: "image",
        url: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=60",
        thumbUrl: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=400&q=60",
      },
      {
        id: "m3",
        type: "image",
        url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=60",
        thumbUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=60",
      },
      {
        id: "m4",
        type: "image",
        url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=60",
        thumbUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=400&q=60",
      },
    ],
    [],
  );

  // demo schema by category (thực tế fetch từ DB)
  const schemaByCategory: Record<string, AttributeSchema[]> = useMemo(
    () => ({
      lighting: [
        { id: "a1", code: "power", name: "Power", type: "NUMBER", unit: "W", required: true },
        { id: "a2", code: "light_color", name: "Light color", type: "SELECT", options: ["Warm", "Neutral", "White"] },
        { id: "a3", code: "material", name: "Material", type: "TEXT" },
        { id: "a4", code: "usb_output", name: "USB output", type: "TEXT" },
      ],
      electronics: [
        { id: "a5", code: "input", name: "Input", type: "TEXT" },
        { id: "a6", code: "output", name: "Output", type: "TEXT" },
        { id: "a7", code: "warranty", name: "Warranty", type: "SELECT", options: ["No", "6 months", "12 months"] },
      ],
      home: [
        { id: "a8", code: "size", name: "Size", type: "TEXT" },
        { id: "a9", code: "care", name: "Care instructions", type: "TEXT" },
      ],
    }),
    [],
  );

  const [activeMediaId, setActiveMediaId] = useState(demoMedia[0]?.id);
  const activeMedia = demoMedia.find((m) => m.id === activeMediaId) ?? demoMedia[0];

  const [form, setForm] = useState({
    // identity
    name: "",
    slug: "",
    category: "",
    productType: "PHYSICAL" as ProductType,
    brand: "",
    vendor: "",
    tags: [] as string[],
    tagsInput: "",

    // lifecycle
    status: "DRAFT" as ProductStatus,
    isVisible: true,
    publishedAt: "",

    // descriptions
    shortDescription: "",
    description: "",

    // pricing default (for non-variant)
    cost: "0.00",
    price: "0.00",
    compareAtPrice: "",

    // inventory default (for non-variant)
    sku: "",
    barcode: "",
    trackInventory: true,
    stockQty: "0",
    lowStockThreshold: "5",
    allowBackorder: false,

    // shipping defaults
    requiresShipping: true,
    weight: "",
    length: "",
    width: "",
    height: "",

    // SEO
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

  const currentSchema = schemaByCategory[form.category] ?? [];
  const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([]);

  const setField = (key: keyof typeof form, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleNameChange = (v: string) => {
    setField("name", v);
    if (!form.slug) setField("slug", slugify(v));
  };

  const addTag = () => {
    const t = form.tagsInput.trim();
    if (!t) return;
    if (form.tags.includes(t)) {
      setField("tagsInput", "");
      return;
    }
    setField("tags", [...form.tags, t]);
    setField("tagsInput", "");
  };

  const removeTag = (t: string) =>
    setField(
      "tags",
      form.tags.filter((x) => x !== t),
    );

  const publishNow = () => {
    const iso = new Date().toISOString();
    setField("publishedAt", iso);
    setField("status", "ACTIVE");
  };

  const generateVariants = () => {
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
  };

  const setDefaultVariant = (id: string) => {
    setVariants((prev) => prev.map((v) => ({ ...v, isDefault: v.id === id })));
  };

  const updateVariant = (id: string, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const upsertAttrValue = (attributeId: string, value: string) => {
    setAttributeValues((prev) => {
      const i = prev.findIndex((x) => x.attributeId === attributeId);
      if (i === -1) return [...prev, { attributeId, value }];
      const clone = prev.slice();
      clone[i] = { attributeId, value };
      return clone;
    });
  };

  const getAttrValue = (attributeId: string) => attributeValues.find((x) => x.attributeId === attributeId)?.value ?? "";

  const validateBasic = () => {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push("Name is required");
    if (!form.slug.trim()) errors.push("Slug is required");
    if (!form.category.trim()) errors.push("Category is required");
    if (!hasVariants && !form.sku.trim()) errors.push("SKU is required (or enable variants)");
    if (!hasVariants && !form.price.trim()) errors.push("Price is required (or manage via variants)");
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateBasic();
    if (errors.length) {
      alert(errors.join("\n"));
      return;
    }

    const payload = {
      ...form,
      media: demoMedia,
      hasVariants,
      variantOptions,
      variants: hasVariants ? variants : [],
      specs: attributeValues,
    };

    onSubmit?.(payload);
    console.log("SUBMIT", payload);
  };

  return (
    <div className={styles.page}>
      <form className={styles.shell} onSubmit={handleSubmit}>
        {/* LEFT: media preview */}
        <aside className={styles.left}>
          <div className={styles.mediaCard}>
            <div className={styles.mediaPreview}>
              {activeMedia?.type === "video" ? (
                <div className={styles.videoOverlay}>
                  <img className={styles.previewImg} src={activeMedia.url} alt="preview" />
                  <div className={styles.playButton} aria-label="Play">
                    ▶
                  </div>
                </div>
              ) : (
                <img className={styles.previewImg} src={activeMedia?.url} alt="preview" />
              )}
            </div>

            <div className={styles.thumbRow}>
              {demoMedia.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  className={`${styles.thumb} ${m.id === activeMediaId ? styles.thumbActive : ""}`}
                  onClick={() => setActiveMediaId(m.id)}
                >
                  <img src={m.thumbUrl ?? m.url} alt="thumb" />
                  {m.type === "video" && <span className={styles.thumbBadge}>▶</span>}
                </button>
              ))}

              <label className={styles.uploadTile} title="Upload">
                <input className={styles.hiddenInput} type="file" accept="image/*,video/*" multiple />
                <div className={styles.uploadIcon}>☁</div>
                <div className={styles.uploadText}>Drop your file here</div>
                <div className={styles.uploadHint}>or click to upload</div>
              </label>
            </div>
          </div>
          {/* SECTION: SEO */}
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

        {/* RIGHT: single page form */}
        <section className={styles.right}>
          {/* Header */}
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
              <button type="button" className={styles.btnGhost} onClick={publishNow}>
                Publish now
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Save
              </button>
            </div>
          </div>

          <div className={styles.body}>
            {/* SECTION: BASIC INFO */}
            <div className={styles.section}>
              <div className={styles.grid2}>
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
                  <select
                    className={styles.select}
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    <option value="">— Select category —</option>
                    <option value="lighting">Lighting</option>
                    <option value="electronics">Electronics</option>
                    <option value="home">Home</option>
                  </select>
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
                  <input
                    className={styles.input}
                    value={form.brand}
                    onChange={(e) => setField("brand", e.target.value)}
                  />
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

              {/* Tags */}
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

              {/* Content */}
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

              {/* Visibility / publish */}
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

            {/* SECTION: PRICING */}
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

            {/* SECTION: INVENTORY */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Inventory</h2>
                  <p className={styles.sectionSub}>SKU/Barcode + stock controls</p>
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>Track inventory</label>
                  <div className={styles.toggleRow}>
                    <button
                      type="button"
                      className={`${styles.toggle} ${form.trackInventory ? styles.toggleOn : ""}`}
                      onClick={() => setField("trackInventory", !form.trackInventory)}
                      aria-pressed={form.trackInventory}
                    >
                      <span className={styles.knob} />
                    </button>
                    <span className={styles.toggleText}>{form.trackInventory ? "On" : "Off"}</span>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Allow backorder</label>
                  <div className={styles.toggleRow}>
                    <button
                      type="button"
                      className={`${styles.toggle} ${form.allowBackorder ? styles.toggleOn : ""}`}
                      onClick={() => setField("allowBackorder", !form.allowBackorder)}
                      aria-pressed={form.allowBackorder}
                    >
                      <span className={styles.knob} />
                    </button>
                    <span className={styles.toggleText}>{form.allowBackorder ? "Yes" : "No"}</span>
                  </div>
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

                  <div className={styles.field}>
                    <label className={styles.label}>Low stock threshold</label>
                    <input
                      className={styles.input}
                      value={form.lowStockThreshold}
                      onChange={(e) => setField("lowStockThreshold", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {hasVariants && <div className={styles.note}>Inventory is managed per-variant below.</div>}
            </div>

            {/* SECTION: VARIANTS */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Variants</h2>
                  <p className={styles.sectionSub}>Options → generate variants → manage SKU/price/stock per variant</p>
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
                  <div className={styles.note}>
                    If variants enabled, pricing/stock should be saved per variant (ProductVariant).
                  </div>
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

            {/* SECTION: SPECIFICATIONS */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Specifications</h2>
                  <p className={styles.sectionSub}>Dynamic attributes generated by category schema</p>
                </div>
              </div>

              {!form.category ? (
                <div className={styles.note}>Select a Category above to show specification fields.</div>
              ) : currentSchema.length === 0 ? (
                <div className={styles.note}>No attribute schema for this category.</div>
              ) : (
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Attributes for “{form.category}”</div>

                  <div className={styles.grid2}>
                    {currentSchema.map((a) => (
                      <div key={a.id} className={styles.field}>
                        <label className={styles.label}>
                          {a.name} {a.required ? <span className={styles.req}>*</span> : null}{" "}
                          {a.unit ? <span className={styles.unit}>({a.unit})</span> : null}
                        </label>

                        {a.type === "SELECT" ? (
                          <select
                            className={styles.select}
                            value={getAttrValue(a.id)}
                            onChange={(e) => upsertAttrValue(a.id, e.target.value)}
                          >
                            <option value="">— Select —</option>
                            {(a.options ?? []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : a.type === "BOOLEAN" ? (
                          <select
                            className={styles.select}
                            value={getAttrValue(a.id)}
                            onChange={(e) => upsertAttrValue(a.id, e.target.value)}
                          >
                            <option value="">— Select —</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        ) : (
                          <input
                            className={styles.input}
                            placeholder={a.type === "NUMBER" ? "0" : ""}
                            value={getAttrValue(a.id)}
                            onChange={(e) => upsertAttrValue(a.id, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION: SHIPPING */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Shipping</h2>
                  <p className={styles.sectionSub}>Weight & dimensions, requires shipping</p>
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>Requires shipping</label>
                  <div className={styles.toggleRow}>
                    <button
                      type="button"
                      className={`${styles.toggle} ${form.requiresShipping ? styles.toggleOn : ""}`}
                      onClick={() => setField("requiresShipping", !form.requiresShipping)}
                      aria-pressed={form.requiresShipping}
                    >
                      <span className={styles.knob} />
                    </button>
                    <span className={styles.toggleText}>{form.requiresShipping ? "Yes" : "No (digital/service)"}</span>
                  </div>
                </div>
              </div>

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

            {/* FOOTER actions (duplicate for long page convenience) */}
            <div className={styles.footerBar}>
              <button type="button" className={styles.btnGhost} onClick={onCancel}>
                Cancel
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
    </div>
  );
}

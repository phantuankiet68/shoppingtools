"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/inventory/stock-movements/stock-movements.module.css";

type MovementType =
  | "OPENING"
  | "SALE"
  | "RESTOCK"
  | "RESERVE"
  | "RELEASE_RESERVATION"
  | "ADJUSTMENT_INCREASE"
  | "ADJUSTMENT_DECREASE"
  | "RETURN"
  | "DAMAGE"
  | "LOSS"
  | "PURCHASE_RECEIPT"
  | "PURCHASE_RECEIPT_CANCEL"
  | "MANUAL"
  | string;

type ProductLite = {
  id: string;
  name: string;
  slug?: string;
};

type VariantLite = {
  id: string;
  sku: string;
  title?: string | null;
  product?: ProductLite | null;
};

type StockLevelLite = {
  id: string;
  variantId: string;
  onHand: number;
  reserved: number;
  available: number;
  incoming: number;
  reorderPoint?: number | null;
  safetyStock?: number | null;
};

type MovementRow = {
  id: string;
  siteId: string;
  variantId: string;
  stockLevelId?: string | null;
  type: MovementType;
  quantityDelta: number;
  beforeOnHand: number;
  afterOnHand: number;
  beforeReserved: number;
  afterReserved: number;
  beforeAvailable: number;
  afterAvailable: number;
  referenceType?: string | null;
  referenceId?: string | null;
  note?: string | null;
  metadata?: any;
  createdBy?: string | null;
  createdAt: string;
  variant?: VariantLite | null;
  stockLevel?: StockLevelLite | null;
};

type ListResponse = {
  data: MovementRow[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

type DetailResponse = {
  data: MovementRow;
};

type CreateMovementResponse = {
  message: string;
  data: {
    stockLevel: StockLevelLite;
    movement: MovementRow;
  };
};

const SITE_ID = "site_123"; // đổi sang site thật của bạn

function formatDate(value?: string | null) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function shortId(id?: string | null) {
  if (!id) return "--";
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

function movementLabel(type: MovementType) {
  switch (String(type).toUpperCase()) {
    case "OPENING":
      return "Opening";
    case "SALE":
      return "Sale";
    case "RESTOCK":
      return "Restock";
    case "RESERVE":
      return "Reserve";
    case "RELEASE_RESERVATION":
      return "Release reservation";
    case "ADJUSTMENT_INCREASE":
      return "Adjustment +";
    case "ADJUSTMENT_DECREASE":
      return "Adjustment -";
    case "RETURN":
      return "Return";
    case "DAMAGE":
      return "Damage";
    case "LOSS":
      return "Loss";
    case "PURCHASE_RECEIPT":
      return "PO receipt";
    case "PURCHASE_RECEIPT_CANCEL":
      return "PO receipt cancel";
    case "MANUAL":
      return "Manual";
    default:
      return type;
  }
}

function badgeClass(type: MovementType) {
  const t = String(type).toUpperCase();

  if (t === "OPENING" || t === "RESTOCK" || t === "RETURN" || t === "PURCHASE_RECEIPT" || t === "ADJUSTMENT_INCREASE") {
    return styles.badgeOk;
  }

  if (
    t === "SALE" ||
    t === "DAMAGE" ||
    t === "LOSS" ||
    t === "ADJUSTMENT_DECREASE" ||
    t === "PURCHASE_RECEIPT_CANCEL"
  ) {
    return styles.badgeBad;
  }

  return styles.badgeOff;
}

function qtyDisplay(row: MovementRow) {
  const t = String(row.type).toUpperCase();
  const q = Number(row.quantityDelta || 0);

  if (t === "OPENING" || t === "RESTOCK" || t === "RETURN" || t === "PURCHASE_RECEIPT" || t === "ADJUSTMENT_INCREASE") {
    return `+${q}`;
  }

  if (
    t === "SALE" ||
    t === "DAMAGE" ||
    t === "LOSS" ||
    t === "ADJUSTMENT_DECREASE" ||
    t === "PURCHASE_RECEIPT_CANCEL"
  ) {
    return `-${q}`;
  }

  return `${q}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((json as any)?.message || `HTTP ${res.status}`);
  }

  return json as T;
}

export default function StockMovementsPage() {
  const [rows, setRows] = useState<MovementRow[]>([]);
  const [activeId, setActiveId] = useState("");
  const [active, setActive] = useState<MovementRow | null>(null);

  const [query, setQuery] = useState("");
  const [variantFilter, setVariantFilter] = useState("");
  const [referenceTypeFilter, setReferenceTypeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<MovementType | "ALL">("ALL");

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    variantId: "",
    type: "ADJUSTMENT_INCREASE" as MovementType,
    quantity: 1,
    note: "",
    referenceType: "",
    referenceId: "",
    createdBy: "admin_001",
  });

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (typeFilter !== "ALL" && String(row.type).toUpperCase() !== String(typeFilter).toUpperCase()) {
        return false;
      }

      if (
        referenceTypeFilter.trim() &&
        String(row.referenceType || "")
          .toLowerCase()
          .includes(referenceTypeFilter.trim().toLowerCase()) === false
      ) {
        return false;
      }

      if (
        variantFilter.trim() &&
        String(row.variantId || "")
          .toLowerCase()
          .includes(variantFilter.trim().toLowerCase()) === false &&
        String(row.variant?.sku || "")
          .toLowerCase()
          .includes(variantFilter.trim().toLowerCase()) === false
      ) {
        return false;
      }

      if (!q) return true;

      const text = [
        row.variant?.product?.name || "",
        row.variant?.title || "",
        row.variant?.sku || "",
        row.variantId || "",
        row.referenceType || "",
        row.referenceId || "",
        row.note || "",
        row.createdBy || "",
        row.type || "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [rows, query, typeFilter, variantFilter, referenceTypeFilter]);

  const summary = useMemo(() => {
    const total = visibleRows.length;
    const increases = visibleRows.filter((r) =>
      ["OPENING", "RESTOCK", "RETURN", "PURCHASE_RECEIPT", "ADJUSTMENT_INCREASE"].includes(
        String(r.type).toUpperCase(),
      ),
    ).length;
    const decreases = visibleRows.filter((r) =>
      ["SALE", "DAMAGE", "LOSS", "ADJUSTMENT_DECREASE", "PURCHASE_RECEIPT_CANCEL"].includes(
        String(r.type).toUpperCase(),
      ),
    ).length;
    const reservedOps = visibleRows.filter((r) =>
      ["RESERVE", "RELEASE_RESERVATION"].includes(String(r.type).toUpperCase()),
    ).length;

    return { total, increases, decreases, reservedOps };
  }, [visibleRows]);

  async function loadList() {
    try {
      setLoadingList(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("siteId", SITE_ID);
      params.set("page", "1");
      params.set("limit", "100");

      if (variantFilter.trim()) params.set("variantId", variantFilter.trim());
      if (referenceTypeFilter.trim()) params.set("referenceType", referenceTypeFilter.trim());

      const res = await apiJson<ListResponse>(`/api/admin/inventory/stock-movements?${params.toString()}`);

      const list = res.data ?? [];
      setRows(list);

      setActiveId((prev) => {
        if (prev && list.some((x) => x.id === prev)) return prev;
        return list[0]?.id || "";
      });
    } catch (e: any) {
      setError(e?.message || "Failed to load stock movements");
      setRows([]);
      setActiveId("");
    } finally {
      setLoadingList(false);
    }
  }

  async function loadDetail(id: string) {
    try {
      setLoadingDetail(true);
      setError(null);

      const params = new URLSearchParams({ siteId: SITE_ID });
      const res = await apiJson<DetailResponse>(`/api/admin/inventory/stock-movement/${id}?${params.toString()}`);

      setActive(res.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load movement detail");
      setActive(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadList();
  }, [variantFilter, referenceTypeFilter]);

  useEffect(() => {
    if (activeId) {
      loadDetail(activeId);
    } else {
      setActive(null);
    }
  }, [activeId]);

  async function createMovement() {
    try {
      if (!form.variantId.trim()) {
        alert("variantId là bắt buộc");
        return;
      }

      const quantity = clamp(Math.trunc(Number(form.quantity || 0)), 1, 1_000_000_000);

      if (quantity <= 0) {
        alert("quantity phải lớn hơn 0");
        return;
      }

      setBusy("create");
      setError(null);

      await apiJson<CreateMovementResponse>(`/api/admin/inventory/stock-movements`, {
        method: "POST",
        body: JSON.stringify({
          siteId: SITE_ID,
          variantId: form.variantId.trim(),
          type: form.type,
          quantity,
          note: form.note.trim() || undefined,
          referenceType: form.referenceType.trim() || undefined,
          referenceId: form.referenceId.trim() || undefined,
          createdBy: form.createdBy.trim() || undefined,
        }),
      });

      setForm((prev) => ({
        ...prev,
        quantity: 1,
        note: "",
        referenceType: "",
        referenceId: "",
      }));

      await loadList();
    } catch (e: any) {
      setError(e?.message || "Create movement failed");
    } finally {
      setBusy(null);
    }
  }

  async function deleteMovement() {
    if (!active) return;

    const confirmed = window.confirm(
      "Delete movement này? Chỉ an toàn khi đây là movement mới nhất hoặc movement manual.",
    );
    if (!confirmed) return;

    try {
      setBusy("delete");
      setError(null);

      const params = new URLSearchParams({ siteId: SITE_ID });

      await apiJson(`/api/admin/inventory/stock-movement/${active.id}?${params.toString()}`, {
        method: "DELETE",
      });

      setActive(null);
      setActiveId("");
      await loadList();
    } catch (e: any) {
      setError(e?.message || "Delete movement failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Stock Movements</div>
            <div className={styles.brandSub}>Inventory ledger · audit trail · manual adjustment operations</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={loadList} disabled={loadingList || busy !== null}>
            <i className="bi bi-arrow-repeat" /> Refresh
          </button>

          <button className={styles.primaryBtn} type="button" onClick={createMovement} disabled={busy !== null}>
            <i className="bi bi-plus-lg" /> {busy === "create" ? "Saving..." : "Create movement"}
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorBar}>
          <i className="bi bi-exclamation-triangle" />
          <div>
            <div className={styles.errorTitle}>Something went wrong</div>
            <div className={styles.errorText}>{error}</div>
          </div>
        </div>
      )}

      <section className={styles.summaryStrip}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total</div>
          <div className={styles.summaryValue}>{summary.total}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Increase ops</div>
          <div className={styles.summaryValue}>{summary.increases}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Decrease ops</div>
          <div className={styles.summaryValue}>{summary.decreases}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Reserve ops</div>
          <div className={styles.summaryValue}>{summary.reservedOps}</div>
        </div>
      </section>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Filters</div>
            <div className={styles.sidebarHint}>Type, variant, reference, search</div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-funnel" /> Type
            </div>

            <div className={styles.typeGrid}>
              {[
                "ALL",
                "RESTOCK",
                "SALE",
                "RESERVE",
                "RELEASE_RESERVATION",
                "ADJUSTMENT_INCREASE",
                "ADJUSTMENT_DECREASE",
                "RETURN",
                "DAMAGE",
                "LOSS",
                "PURCHASE_RECEIPT",
                "MANUAL",
              ].map((type) => {
                const activeType = typeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    className={`${styles.pill} ${activeType ? styles.pillOn : ""}`}
                    onClick={() => setTypeFilter(type as MovementType | "ALL")}
                  >
                    <i className="bi bi-lightning" />
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-upc-scan" /> Variant
            </div>
            <div className={styles.searchWrapInline}>
              <i className="bi bi-search" />
              <input
                className={styles.searchInline}
                placeholder="variantId hoặc SKU..."
                value={variantFilter}
                onChange={(e) => setVariantFilter(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-link-45deg" /> Reference type
            </div>
            <div className={styles.searchWrapInline}>
              <i className="bi bi-search" />
              <input
                className={styles.searchInline}
                placeholder="ORDER / PURCHASE_ORDER / MANUAL..."
                value={referenceTypeFilter}
                onChange={(e) => setReferenceTypeFilter(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupTitle}>
              <i className="bi bi-search" /> Search
            </div>
            <div className={styles.searchWrapInline}>
              <i className="bi bi-search" />
              <input
                className={styles.searchInline}
                placeholder="Search SKU, note, reference..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-shield-check" />
              <span>Mọi thay đổi tồn kho nên đi qua stock movement để giữ audit trail rõ ràng.</span>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.content}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Movement ledger</div>
                  <div className={styles.panelSub}>
                    {loadingList ? "Loading..." : "Danh sách stock movements mới nhất"}
                  </div>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Created</th>
                      <th>Variant</th>
                      <th>Type</th>
                      <th className={styles.thNum}>Qty</th>
                      <th>Before → After</th>
                      <th>Reference</th>
                      <th>By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className={styles.emptyRow}>
                            <i className="bi bi-inbox" />
                            <div>
                              <div className={styles.emptyTitle}>No movements</div>
                              <div className={styles.emptyText}>Thử thay đổi filter hoặc tạo movement mới.</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visibleRows.map((row) => {
                        const isActive = row.id === activeId;
                        const productName = row.variant?.product?.name || "Unknown product";
                        const variantTitle = row.variant?.title || "Default";
                        const sku = row.variant?.sku || shortId(row.variantId);

                        return (
                          <tr
                            key={row.id}
                            className={`${styles.tr} ${isActive ? styles.trActive : ""}`}
                            onClick={() => setActiveId(row.id)}
                            role="button"
                          >
                            <td className={styles.mono}>{formatDate(row.createdAt)}</td>
                            <td>
                              <div className={styles.skuCell}>
                                <span className={styles.sku}>{sku}</span>
                                <span className={styles.sub}>
                                  {productName} · {variantTitle}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${badgeClass(row.type)}`}>
                                <i className="bi bi-lightning-charge" /> {movementLabel(row.type)}
                              </span>
                            </td>
                            <td className={`${styles.tdNum} ${styles.mono}`}>{qtyDisplay(row)}</td>
                            <td className={styles.mono}>
                              {row.beforeAvailable} → {row.afterAvailable}
                            </td>
                            <td className={styles.mono}>
                              {row.referenceType || "--"} / {row.referenceId || "--"}
                            </td>
                            <td className={styles.mono}>{row.createdBy || "--"}</td>
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
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Inspector</div>
                    <div className={styles.panelSub}>Create movement & review details</div>
                  </div>
                </div>

                <div className={styles.panelBody}>
                  <div className={styles.sectionTitle}>
                    <i className="bi bi-plus-circle" /> Create movement
                  </div>

                  <label className={styles.label}>Variant ID</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-tags" />
                    <input
                      className={styles.input}
                      value={form.variantId}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          variantId: e.target.value,
                        }))
                      }
                      placeholder="variant_xxx"
                    />
                  </div>

                  <label className={styles.label}>Movement type</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-lightning-charge" />
                    <select
                      className={styles.input}
                      value={form.type}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                    >
                      <option value="ADJUSTMENT_INCREASE">ADJUSTMENT_INCREASE</option>
                      <option value="ADJUSTMENT_DECREASE">ADJUSTMENT_DECREASE</option>
                      <option value="RESTOCK">RESTOCK</option>
                      <option value="RESERVE">RESERVE</option>
                      <option value="RELEASE_RESERVATION">RELEASE_RESERVATION</option>
                      <option value="RETURN">RETURN</option>
                      <option value="DAMAGE">DAMAGE</option>
                      <option value="LOSS">LOSS</option>
                      <option value="SALE">SALE</option>
                      <option value="MANUAL">MANUAL</option>
                    </select>
                  </div>

                  <label className={styles.label}>Quantity</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-123" />
                    <input
                      className={styles.input}
                      type="number"
                      min={1}
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          quantity: clamp(Number(e.target.value || 1), 1, 1_000_000_000),
                        }))
                      }
                      placeholder="e.g. 5"
                    />
                  </div>

                  <label className={styles.label}>Reference type</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-link-45deg" />
                    <input
                      className={styles.input}
                      value={form.referenceType}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          referenceType: e.target.value,
                        }))
                      }
                      placeholder="ORDER / MANUAL / AUDIT"
                    />
                  </div>

                  <label className={styles.label}>Reference ID</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-hash" />
                    <input
                      className={styles.input}
                      value={form.referenceId}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          referenceId: e.target.value,
                        }))
                      }
                      placeholder="order_123 / audit_001"
                    />
                  </div>

                  <label className={styles.label}>Created by</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-person" />
                    <input
                      className={styles.input}
                      value={form.createdBy}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          createdBy: e.target.value,
                        }))
                      }
                      placeholder="admin_001"
                    />
                  </div>

                  <label className={styles.label}>Note</label>
                  <div className={styles.inputWrap}>
                    <i className="bi bi-chat-left-text" />
                    <input
                      className={styles.input}
                      value={form.note}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      placeholder="Reason for movement"
                    />
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.primaryBtn}
                      type="button"
                      onClick={createMovement}
                      disabled={busy !== null}
                    >
                      <i className="bi bi-check2" /> {busy === "create" ? "Saving..." : "Create"}
                    </button>

                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          quantity: 1,
                          note: "",
                          referenceType: "",
                          referenceId: "",
                        }))
                      }
                      disabled={busy !== null}
                    >
                      <i className="bi bi-arrow-counterclockwise" /> Reset
                    </button>
                  </div>

                  <div className={styles.hr} />

                  <div className={styles.sectionTitle}>
                    <i className="bi bi-eye" /> Selected movement
                  </div>

                  {loadingDetail ? (
                    <div className={styles.emptySmall}>Loading detail...</div>
                  ) : !active ? (
                    <div className={styles.emptySmall}>Select a row to inspect details.</div>
                  ) : (
                    <div className={styles.detailCard}>
                      <div className={styles.detailTop}>
                        <div>
                          <div className={styles.detailSku}>{active.variant?.sku || shortId(active.variantId)}</div>
                          <div className={styles.detailSub}>
                            {(active.variant?.product?.name || "Unknown product") +
                              " · " +
                              (active.variant?.title || "Default")}
                          </div>
                        </div>

                        <span className={`${styles.badge} ${badgeClass(active.type)}`}>
                          <i className="bi bi-lightning-charge" /> {movementLabel(active.type)}
                        </span>
                      </div>

                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Created</div>
                          <div className={styles.mono}>{formatDate(active.createdAt)}</div>
                        </div>

                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Qty</div>
                          <div className={styles.mono}>{qtyDisplay(active)}</div>
                        </div>

                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Reference type</div>
                          <div className={styles.mono}>{active.referenceType || "--"}</div>
                        </div>

                        <div className={styles.detailItem}>
                          <div className={styles.detailLabel}>Reference ID</div>
                          <div className={styles.mono}>{active.referenceId || "--"}</div>
                        </div>
                      </div>

                      <div className={styles.detailLine}>
                        <div className={styles.detailLabel}>On hand</div>
                        <div className={styles.mono}>
                          {active.beforeOnHand} → {active.afterOnHand}
                        </div>
                      </div>

                      <div className={styles.detailLine}>
                        <div className={styles.detailLabel}>Reserved</div>
                        <div className={styles.mono}>
                          {active.beforeReserved} → {active.afterReserved}
                        </div>
                      </div>

                      <div className={styles.detailLine}>
                        <div className={styles.detailLabel}>Available</div>
                        <div className={styles.mono}>
                          {active.beforeAvailable} → {active.afterAvailable}
                        </div>
                      </div>

                      <div className={styles.detailLine}>
                        <div className={styles.detailLabel}>Created by</div>
                        <div className={styles.mono}>{active.createdBy || "--"}</div>
                      </div>

                      <div className={styles.detailLine}>
                        <div className={styles.detailLabel}>Note</div>
                        <div className={styles.mono}>{active.note || "--"}</div>
                      </div>

                      <div className={styles.actions}>
                        <button
                          className={styles.ghostBtn}
                          type="button"
                          onClick={deleteMovement}
                          disabled={busy !== null}
                        >
                          <i className="bi bi-trash" /> {busy === "delete" ? "Deleting..." : "Delete"}
                        </button>
                      </div>

                      <div className={styles.detailFooter}>
                        <span className={styles.chip}>
                          <i className="bi bi-shield-lock" /> audit
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={styles.tipInline}>
                    <i className="bi bi-shield-check" />
                    <span>
                      Production note: chỉ nên delete movement manual hoặc movement mới nhất để tránh phá audit chain.
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

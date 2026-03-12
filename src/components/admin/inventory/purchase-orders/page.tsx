"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import styles from "@/styles/admin/inventory/purchase-orders/purchase-orders.module.css";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useSiteStore } from "@/store/site/site.store";
import { useVariantStore } from "@/store/inventory/purchase-orders/purchase-orders.store";

type PurchaseOrderStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";

type PurchaseOrderLineStatus = "PENDING" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";

type PurchaseOrderLine = {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  variantTitle?: string | null;
  orderedQty: number;
  receivedQty: number;
  remainingQty: number;
  unitCost: number | string;
  lineTotal: number | string;
  status: PurchaseOrderLineStatus;
  note?: string | null;
};

type PurchaseOrderReceiptLine = {
  id: string;
  purchaseOrderLineId: string;
  variantId: string;
  receivedQty: number;
  unitCost?: number | string | null;
  note?: string | null;
};

type PurchaseOrderReceipt = {
  id: string;
  receiptNumber: string;
  receivedAt: string;
  note?: string | null;
  createdBy?: string | null;
  lines: PurchaseOrderReceiptLine[];
};

type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierCode?: string | null;
  supplierEmail?: string | null;
  supplierPhone?: string | null;
  status: PurchaseOrderStatus;
  orderedAt?: string | null;
  expectedAt?: string | null;
  receivedAt?: string | null;
  currency: string;
  subtotalAmount: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  shippingAmount: number | string;
  totalAmount: number | string;
  note?: string | null;
  createdBy?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string | null;
  lines: PurchaseOrderLine[];
  receipts?: PurchaseOrderReceipt[];
};

type PurchaseOrderListResponse = {
  data: PurchaseOrder[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

type PurchaseOrderDetailResponse = {
  data: PurchaseOrder;
};

type CreateLineInput = {
  variantId: string;
  orderedQty: number;
  unitCost: number;
  note?: string;
};

const STATUS_OPTIONS: PurchaseOrderStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
];

function formatMoney(value: number | string, currency = "VND") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusLabel(status: PurchaseOrderStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "APPROVED":
      return "Approved";
    case "PARTIALLY_RECEIVED":
      return "Partially Received";
    case "RECEIVED":
      return "Fully Received";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function lineStatusLabel(status: PurchaseOrderLineStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PARTIALLY_RECEIVED":
      return "Partially Received";
    case "RECEIVED":
      return "Received";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

async function safeJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.message || "Request failed");
  }
  return data as T;
}

export default function PurchaseOrdersPage() {
  const sites = useSiteStore((state) => state.sites);
  const sitesLoading = useSiteStore((state) => state.loading);
  const sitesErr = useSiteStore((state) => state.err);
  const selectedSiteId = useSiteStore((state) => state.siteId);
  const setSelectedSiteId = useSiteStore((state) => state.setSiteId);
  const hydrateFromStorage = useSiteStore((state) => state.hydrateFromStorage);
  const loadSites = useSiteStore((state) => state.loadSites);

  const selectedSite = useMemo(() => {
    return sites.find((site) => site.id === selectedSiteId) ?? null;
  }, [sites, selectedSiteId]);

  const [items, setItems] = useState<PurchaseOrder[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "ALL">("ALL");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReceiveForm, setShowReceiveForm] = useState(false);

  const variants = useVariantStore((state) => state.variants);
  const variantsLoading = useVariantStore((state) => state.loading);
  const variantsErr = useVariantStore((state) => state.err);
  const loadVariants = useVariantStore((state) => state.loadVariants);

  const [form, setForm] = useState({
    poNumber: "",
    supplierName: "",
    supplierCode: "",
    supplierEmail: "",
    supplierPhone: "",
    orderedAt: "",
    expectedAt: "",
    currency: "VND",
    discountAmount: 0,
    taxAmount: 0,
    shippingAmount: 0,
    note: "",
    createdBy: "admin_001",
  });

  const [lineDraft, setLineDraft] = useState<CreateLineInput>({
    variantId: "",
    orderedQty: 1,
    unitCost: 0,
    note: "",
  });

  const [createLines, setCreateLines] = useState<CreateLineInput[]>([]);

  const [receiveCreatedBy, setReceiveCreatedBy] = useState("admin_001");
  const [receiveNote, setReceiveNote] = useState("");
  const [receiveAt, setReceiveAt] = useState("");
  const [receiveInputs, setReceiveInputs] = useState<Record<string, number>>({});

  useEffect(() => {
    hydrateFromStorage();
    loadSites();
    loadVariants();
  }, [hydrateFromStorage, loadSites, loadVariants]);

  const fetchPurchaseOrders = useCallback(async () => {
    if (!selectedSiteId) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("siteId", selectedSiteId);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (supplierFilter.trim()) params.set("supplierName", supplierFilter.trim());

      const res = await fetch(`/api/admin/inventory/purchase-orders?${params.toString()}`, {
        cache: "no-store",
      });

      const json = await safeJson<PurchaseOrderListResponse>(res);
      setItems(json.data || []);
    } catch (error: any) {
      alert(error.message || "Unable to load purchase orders");
    } finally {
      setLoading(false);
    }
  }, [selectedSiteId, statusFilter, supplierFilter]);

  const fetchPurchaseOrderDetail = useCallback(
    async (id: string) => {
      if (!selectedSiteId) return;

      try {
        setDetailLoading(true);
        const params = new URLSearchParams({ siteId: selectedSiteId });
        const res = await fetch(`/api/admin/inventory/purchase-orders/${id}?${params.toString()}`, {
          cache: "no-store",
        });

        const json = await safeJson<PurchaseOrderDetailResponse>(res);
        setSelected(json.data);

        const nextReceiveInputs: Record<string, number> = {};
        for (const line of json.data.lines) {
          nextReceiveInputs[line.id] = 0;
        }
        setReceiveInputs(nextReceiveInputs);
      } catch (error: any) {
        alert(error.message || "Unable to load purchase order details");
      } finally {
        setDetailLoading(false);
      }
    },
    [selectedSiteId],
  );

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  useEffect(() => {
    if (selectedId && selectedSiteId) {
      fetchPurchaseOrderDetail(selectedId);
    } else {
      setSelected(null);
      setShowReceiveForm(false);
    }
  }, [selectedId, selectedSiteId, fetchPurchaseOrderDetail]);

  useEffect(() => {
    if (selectedSiteId) {
      loadVariants(selectedSiteId);
    }
    setSelectedId(null);
    setSelected(null);
    setShowReceiveForm(false);
  }, [selectedSiteId, loadVariants]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      return (
        item.poNumber.toLowerCase().includes(q) ||
        item.supplierName.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const stats = useMemo(() => {
    const total = items.length;
    const approved = items.filter((x) => x.status === "APPROVED").length;
    const partial = items.filter((x) => x.status === "PARTIALLY_RECEIVED").length;
    const received = items.filter((x) => x.status === "RECEIVED").length;
    const totalValue = items.reduce((sum, x) => sum + Number(x.totalAmount || 0), 0);

    return { total, approved, partial, received, totalValue };
  }, [items]);

  const createSubtotal = useMemo(() => {
    return createLines.reduce((sum, line) => sum + line.orderedQty * line.unitCost, 0);
  }, [createLines]);

  const createGrandTotal = useMemo(() => {
    return (
      createSubtotal - Number(form.discountAmount || 0) + Number(form.taxAmount || 0) + Number(form.shippingAmount || 0)
    );
  }, [createSubtotal, form.discountAmount, form.taxAmount, form.shippingAmount]);

  const selectedRemainingTotal = useMemo(() => {
    if (!selected) return 0;
    return selected.lines.reduce((sum, line) => sum + line.remainingQty, 0);
  }, [selected]);

  const addCreateLine = useCallback(() => {
    const variantId = lineDraft.variantId.trim();

    if (!variantId) {
      alert("variantId is required");
      return;
    }
    if (lineDraft.orderedQty <= 0) {
      alert("orderedQty must be greater than 0");
      return;
    }
    if (lineDraft.unitCost < 0) {
      alert("Invalid unitCost");
      return;
    }

    setCreateLines((prev) => [
      ...prev,
      {
        ...lineDraft,
        variantId,
        orderedQty: Number(lineDraft.orderedQty),
        unitCost: Number(lineDraft.unitCost),
      },
    ]);

    setLineDraft({
      variantId: "",
      orderedQty: 1,
      unitCost: 0,
      note: "",
    });
  }, [lineDraft]);

  const removeCreateLine = useCallback((index: number) => {
    setCreateLines((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleApprove = async () => {
    if (!selected || !selectedSiteId) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/inventory/purchase-orders/${selected.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId: selectedSiteId,
          approvedBy: "admin_001",
          note: "Approved from admin UI",
          syncIncoming: true,
        }),
      });

      await safeJson(res);
      await fetchPurchaseOrders();
      await fetchPurchaseOrderDetail(selected.id);
    } catch (error: any) {
      alert(error.message || "Approve failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!selected || !selectedSiteId) return;
    const confirmed = window.confirm(`Cancel purchase order ${selected.poNumber}?`);
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const params = new URLSearchParams({ siteId: selectedSiteId });
      const res = await fetch(`/api/admin/inventory/purchase-orders/${selected.id}?${params.toString()}`, {
        method: "DELETE",
      });

      await safeJson(res);
      setSelectedId(null);
      await fetchPurchaseOrders();
    } catch (error: any) {
      alert(error.message || "Failed to cancel purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceive = async () => {
    if (!selected || !selectedSiteId) return;

    const lines = selected.lines
      .filter((line) => Number(receiveInputs[line.id] || 0) > 0)
      .map((line) => ({
        purchaseOrderLineId: line.id,
        receivedQty: Number(receiveInputs[line.id] || 0),
      }));

    if (lines.length === 0) {
      alert("No line has a received quantity entered yet");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/inventory/purchase-orders/${selected.id}/receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId: selectedSiteId,
          receivedAt: receiveAt ? new Date(receiveAt).toISOString() : undefined,
          note: receiveNote || undefined,
          createdBy: receiveCreatedBy || undefined,
          lines,
        }),
      });

      await safeJson(res);
      setShowReceiveForm(false);
      setReceiveNote("");
      setReceiveAt("");
      await fetchPurchaseOrders();
      await fetchPurchaseOrderDetail(selected.id);
    } catch (error: any) {
      alert(error.message || "Receive failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCreateForm = useCallback(() => {
    setShowCreateForm((prev) => !prev);
  }, []);

  const handleAddVariant = useCallback(() => {
    if (!showCreateForm) {
      setShowCreateForm(true);
      return;
    }

    addCreateLine();
  }, [showCreateForm, addCreateLine]);

  const handleCreatePurchaseOrder = useCallback(async () => {
    try {
      if (!selectedSiteId) {
        alert("Please select a site");
        return;
      }
      if (!form.poNumber.trim()) {
        alert("PO Number is required");
        return;
      }
      if (!form.supplierName.trim()) {
        alert("Supplier name is required");
        return;
      }
      if (createLines.length === 0) {
        alert("At least 1 line item is required");
        return;
      }

      setSubmitting(true);

      const res = await fetch("/api/admin/inventory/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId: selectedSiteId,
          poNumber: form.poNumber,
          supplierName: form.supplierName,
          supplierCode: form.supplierCode || undefined,
          supplierEmail: form.supplierEmail || undefined,
          supplierPhone: form.supplierPhone || undefined,
          orderedAt: form.orderedAt ? new Date(form.orderedAt).toISOString() : undefined,
          expectedAt: form.expectedAt ? new Date(form.expectedAt).toISOString() : undefined,
          currency: form.currency,
          discountAmount: Number(form.discountAmount || 0),
          taxAmount: Number(form.taxAmount || 0),
          shippingAmount: Number(form.shippingAmount || 0),
          note: form.note || undefined,
          createdBy: form.createdBy || undefined,
          lines: createLines.map((line) => ({
            variantId: line.variantId,
            orderedQty: Number(line.orderedQty),
            unitCost: Number(line.unitCost),
            note: line.note || undefined,
          })),
        }),
      });

      const json = await safeJson<{ data: PurchaseOrder }>(res);

      setShowCreateForm(false);
      setForm({
        poNumber: "",
        supplierName: "",
        supplierCode: "",
        supplierEmail: "",
        supplierPhone: "",
        orderedAt: "",
        expectedAt: "",
        currency: "VND",
        discountAmount: 0,
        taxAmount: 0,
        shippingAmount: 0,
        note: "",
        createdBy: "admin_001",
      });
      setCreateLines([]);
      await fetchPurchaseOrders();
      setSelectedId(json.data.id);
    } catch (error: any) {
      alert(error.message || "Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  }, [selectedSiteId, form, createLines, fetchPurchaseOrders]);

  const createPurchaseOrderRef = useRef(handleCreatePurchaseOrder);

  useEffect(() => {
    createPurchaseOrderRef.current = handleCreatePurchaseOrder;
  }, [handleCreatePurchaseOrder]);

  const handleF6CreatePO = useCallback(() => {
    void createPurchaseOrderRef.current();
  }, []);

  const functionKeyActions = useMemo(
    () => ({
      F2: {
        action: toggleCreateForm,
        label: "Toggle create",
        icon: "bi-plus-circle",
      },
      F5: {
        action: handleAddVariant,
        label: "Add line by variantId",
        icon: "bi-plus-circle",
      },
      F6: {
        action: handleF6CreatePO,
        label: "Create purchase order",
        icon: "bi-save",
      },
    }),
    [toggleCreateForm, handleAddVariant, handleF6CreatePO],
  );

  usePageFunctionKeys(functionKeyActions);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.page}>
      {showCreateForm && (
        <section className={styles.createPanel}>
          <div className={styles.createLayout}>
            <div className={styles.createMain}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionCardHeader}>
                  <h3>General Information</h3>
                  <p>Identification details of the purchase order and supplier.</p>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Site</label>
                    <select
                      value={selectedSiteId || ""}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      disabled={sitesLoading}
                    >
                      <option value="">Select site</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name || site.domain || site.id}
                        </option>
                      ))}
                    </select>
                    {sitesErr ? <small>{sitesErr}</small> : null}
                  </div>

                  <div className={styles.field}>
                    <label>PO Number</label>
                    <input
                      value={form.poNumber}
                      onChange={(e) => setForm((prev) => ({ ...prev, poNumber: e.target.value }))}
                      placeholder="Example: PO-20260311-001"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Supplier name</label>
                    <input
                      value={form.supplierName}
                      onChange={(e) => setForm((prev) => ({ ...prev, supplierName: e.target.value }))}
                      placeholder="Supplier name"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Supplier code</label>
                    <input
                      value={form.supplierCode}
                      onChange={(e) => setForm((prev) => ({ ...prev, supplierCode: e.target.value }))}
                      placeholder="Supplier code"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Email</label>
                    <input
                      value={form.supplierEmail}
                      onChange={(e) => setForm((prev) => ({ ...prev, supplierEmail: e.target.value }))}
                      placeholder="supplier@email.com"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Phone</label>
                    <input
                      value={form.supplierPhone}
                      onChange={(e) => setForm((prev) => ({ ...prev, supplierPhone: e.target.value }))}
                      placeholder="Supplier phone number"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Currency</label>
                    <input
                      value={form.currency}
                      onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                      placeholder="VND"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Ordered at</label>
                    <input
                      type="datetime-local"
                      value={form.orderedAt}
                      onChange={(e) => setForm((prev) => ({ ...prev, orderedAt: e.target.value }))}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Expected at</label>
                    <input
                      type="datetime-local"
                      value={form.expectedAt}
                      onChange={(e) => setForm((prev) => ({ ...prev, expectedAt: e.target.value }))}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Created by</label>
                    <input
                      value={form.createdBy}
                      onChange={(e) => setForm((prev) => ({ ...prev, createdBy: e.target.value }))}
                      placeholder="admin_001"
                    />
                  </div>

                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>Note</label>
                    <textarea
                      rows={9}
                      value={form.note}
                      onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                      placeholder="Additional notes for the inbound order"
                    />
                  </div>
                </div>

                <div className={`${styles.sectionCardHeader} ${styles.sectionMT10}`}>
                  <h3>Costs & Extra Charges</h3>
                </div>

                <div className={`${styles.compactGrid} ${styles.sectionMT10}`}>
                  <div className={`${styles.field}`}>
                    <label>Discount</label>
                    <input
                      type="number"
                      value={form.discountAmount}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          discountAmount: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Tax</label>
                    <input
                      type="number"
                      value={form.taxAmount}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          taxAmount: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Shipping</label>
                    <input
                      type="number"
                      value={form.shippingAmount}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          shippingAmount: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.createAside}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionCardHeader}>
                  <div className={styles.sectionCardItem}>
                    <h3>Line items</h3>
                    <p>Add inbound products by variantId.</p>
                    <div className={styles.lineCountBadge}>
                      {createLines.length} item{createLines.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div className={styles.lineComposer}>
                  <div className={styles.lineDraftGrid}>
                    <div className={styles.field}>
                      <label>Variant</label>
                      <select
                        value={lineDraft.variantId}
                        onChange={(e) =>
                          setLineDraft((prev) => ({
                            ...prev,
                            variantId: e.target.value,
                          }))
                        }
                        disabled={variantsLoading}
                      >
                        <option value="">{variantsLoading ? "Loading variants..." : "Select variant"}</option>

                        {variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.sku}
                            {variant.title ? ` - ${variant.title}` : ""}
                          </option>
                        ))}
                      </select>

                      {variantsErr ? <small>{variantsErr}</small> : null}
                    </div>

                    <div className={styles.field}>
                      <label>Ordered Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={lineDraft.orderedQty}
                        onChange={(e) =>
                          setLineDraft((prev) => ({
                            ...prev,
                            orderedQty: Number(e.target.value || 1),
                          }))
                        }
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Unit Cost</label>
                      <input
                        type="number"
                        min={0}
                        value={lineDraft.unitCost}
                        onChange={(e) =>
                          setLineDraft((prev) => ({
                            ...prev,
                            unitCost: Number(e.target.value || 0),
                          }))
                        }
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Note</label>
                      <input
                        value={lineDraft.note || ""}
                        onChange={(e) => setLineDraft((prev) => ({ ...prev, note: e.target.value }))}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.lineList}>
                  {createLines.length === 0 ? (
                    <div className={styles.emptyLineState}>
                      <div className={styles.emptyLineIcon}>📦</div>
                      <strong>No line items yet</strong>
                      <p>Enter variantId, quantity, and unit cost, then click “Add line item”.</p>
                    </div>
                  ) : (
                    createLines.map((line, index) => (
                      <div key={`${line.variantId}-${index}`} className={styles.lineCard}>
                        <div className={styles.lineCardLeft}>
                          <div className={styles.lineCardTop}>
                            <div className={styles.lineCardTopID}>
                              <div className={styles.lineLabel}>Variant ID</div>
                              <strong className={styles.lineVariant}>{line.variantId}</strong>
                            </div>

                            <div className={styles.lineUnitPrice}>
                              {formatMoney(line.unitCost)} <span>/ unit</span>
                            </div>
                          </div>

                          <div className={styles.lineMetaRow}>
                            <div className={styles.lineMetaItem}>
                              <span>Quantity</span>
                              <strong>{line.orderedQty}</strong>
                            </div>

                            <div className={styles.lineMetaItem}>
                              <span>Unit cost</span>
                              <strong>{formatMoney(line.unitCost)}</strong>
                            </div>

                            <div className={styles.lineMetaItem}>
                              <span>Line total</span>
                              <strong>{formatMoney(line.orderedQty * line.unitCost)}</strong>
                            </div>
                          </div>

                          {line.note ? <div className={styles.lineNoteBox}>{line.note}</div> : null}
                        </div>

                        <div className={styles.lineCardRight}>
                          <button
                            type="button"
                            className={styles.ghostDangerButton}
                            onClick={() => removeCreateLine(index)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryCardHeader}>
                  <div>
                    <h3>Order Summary</h3>
                    <p>Quick summary before creating the purchase order.</p>
                  </div>

                  <div className={styles.summaryBadge}>
                    {createLines.length} item{createLines.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className={styles.summaryBody}>
                  <div className={styles.summaryList}>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Site</span>
                      <strong className={styles.summaryValue}>
                        {selectedSite?.name || selectedSite?.domain || selectedSiteId || "--"}
                      </strong>
                    </div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Number of line items</span>
                      <strong className={styles.summaryValue}>{createLines.length}</strong>
                    </div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Subtotal</span>
                      <strong className={styles.summaryValue}>{formatMoney(createSubtotal)}</strong>
                    </div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Discount</span>
                      <strong className={`${styles.summaryValue} ${styles.summaryMinus}`}>
                        - {formatMoney(form.discountAmount)}
                      </strong>
                    </div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Tax</span>
                      <strong className={`${styles.summaryValue} ${styles.summaryPlus}`}>
                        + {formatMoney(form.taxAmount)}
                      </strong>
                    </div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Shipping</span>
                      <strong className={`${styles.summaryValue} ${styles.summaryPlus}`}>
                        + {formatMoney(form.shippingAmount)}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.summaryTotal}>
                    <div>
                      <span className={styles.summaryTotalLabel}>Grand Total</span>
                      <p className={styles.summaryTotalHint}>Including extra charges and adjustments</p>
                    </div>

                    <strong className={styles.summaryTotalValue}>{formatMoney(createGrandTotal)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={styles.contentGrid}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>📦</span>
              <span className={styles.statLabel}>Total POs</span>
              <span className={`${styles.statBadge} ${styles.neutral}`}>All</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{stats.total}</strong>
              <span className={styles.statTrend}>+5%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: "100%" }} />
            </div>

            <span className={styles.statHint}>Total number of purchase orders in the system</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>✔</span>
              <span className={styles.statLabel}>Approved</span>
              <span className={`${styles.statBadge} ${styles.info}`}>Ready</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{stats.approved}</strong>
              <span className={styles.statTrend}>+2%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: stats.total ? `${(stats.approved / stats.total) * 100}%` : "0%" }} />
            </div>

            <span className={styles.statHint}>POs approved and waiting for goods receipt</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>⏳</span>
              <span className={styles.statLabel}>Partially Received</span>
              <span className={`${styles.statBadge} ${styles.warning}`}>Partial</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{stats.partial}</strong>
              <span className={styles.statTrend}>-1%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: stats.total ? `${(stats.partial / stats.total) * 100}%` : "0%" }} />
            </div>

            <span className={styles.statHint}>Some goods have already been received into inventory</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>🏁</span>
              <span className={styles.statLabel}>Fully Received</span>
              <span className={`${styles.statBadge} ${styles.success}`}>Done</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{stats.received}</strong>
              <span className={styles.statTrend}>+3%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: stats.total ? `${(stats.received / stats.total) * 100}%` : "0%" }} />
            </div>

            <span className={styles.statHint}>POs fully completed and received into inventory</span>
          </div>

          <div className={`${styles.statCard} ${styles.statWide}`}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>💰</span>
              <span className={styles.statLabel}>Total Value</span>
              <span className={`${styles.statBadge} ${styles.money}`}>Value</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{formatMoney(stats.totalValue)}</strong>
              <span className={styles.statTrend}>+8%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: "100%" }} />
            </div>

            <span className={styles.statHint}>Total value of all purchase orders</span>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderMain}>
              <h2 className={styles.panelTitle}>Purchase Orders List</h2>
              <p className={styles.panelSubtext}>
                Current site: <strong>{selectedSite?.name || selectedSite?.domain || selectedSiteId || "--"}</strong>
              </p>
            </div>

            <div className={styles.panelHeaderMeta}>
              <div className={styles.panelMetaBadge}>{filteredItems.length} results</div>
            </div>
          </div>

          <div className={styles.filterBar}>
            <div className={styles.filterSearch}>
              <label className={styles.filterLabel}>Search</label>
              <div className={styles.searchBox}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by PO number, supplier, status..."
                />
              </div>
            </div>

            <div className={styles.filterControls}>
              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Site</label>
                <select
                  value={selectedSiteId || ""}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  disabled={sitesLoading}
                >
                  <option value="">Select site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name || site.domain || site.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | "ALL")}
                >
                  <option value="ALL">All statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Supplier</label>
                <input
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  placeholder="Filter supplier..."
                />
              </div>
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableCardHeader}>
              <div>
                <h3>Inbound Orders List</h3>
                <p>Track status, supplier, and total purchase order value.</p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>PO</th>
                    <th>Supplier</th>
                    <th>Ordered</th>
                    <th>Expected</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {!selectedSiteId ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyStateIcon}>🏪</div>
                          <strong>Please select a site</strong>
                          <p>Select a site to view the corresponding purchase orders.</p>
                        </div>
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyStateIcon}>⏳</div>
                          <strong>Loading data</strong>
                          <p>The system is retrieving the purchase orders list.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyStateIcon}>📦</div>
                          <strong>No purchase orders found</strong>
                          <p>Try changing the filters or create a new purchase order.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className={selectedId === item.id ? styles.activeRow : ""}>
                        <td>
                          <div className={styles.primaryCell}>
                            <strong className={styles.poCode}>{item.poNumber}</strong>
                            <span>{item.lines?.length || 0} line(s)</span>
                          </div>
                        </td>

                        <td>
                          <div className={styles.primaryCell}>
                            <strong>{item.supplierName}</strong>
                            <span>{item.supplierEmail || "--"}</span>
                          </div>
                        </td>

                        <td>{formatDate(item.orderedAt)}</td>
                        <td>{formatDate(item.expectedAt)}</td>

                        <td>
                          <span className={`${styles.badge} ${styles[`badge${item.status}`]}`}>
                            {statusLabel(item.status)}
                          </span>
                        </td>

                        <td className={styles.totalCell}>{formatMoney(item.totalAmount, item.currency)}</td>

                        <td className={styles.rowActionCell}>
                          <button type="button" className={styles.rowButton} onClick={() => setSelectedId(item.id)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className={styles.sidePanel}>
          {selectedId && (
            <div className={styles.modalOverlay} onClick={() => setSelectedId(null)}>
              <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
                {!selectedSiteId ? (
                  <div className={styles.emptyDetail}>
                    <h3>No site selected</h3>
                    <p>Please select a site to view purchase order details.</p>
                  </div>
                ) : detailLoading ? (
                  <div className={styles.emptyDetail}>
                    <h3>Loading details...</h3>
                  </div>
                ) : !selected ? (
                  <div className={styles.emptyDetail}>
                    <h3>Data not found</h3>
                  </div>
                ) : (
                  <>
                    <div className={styles.modalHeader}>
                      <div>
                        <span className={styles.panelEyebrow}>Purchase Order Detail</span>
                        <h2 className={styles.sideTitle}>{selected.poNumber}</h2>
                        <span className={`${styles.badge} ${styles[`badge${selected.status}`]}`}>
                          {statusLabel(selected.status)}
                        </span>
                      </div>

                      <button className={styles.iconButton} onClick={() => setSelectedId(null)}>
                        ×
                      </button>
                    </div>

                    <div className={styles.modalBody}>
                      <div className={styles.sideInfoGrid}>
                        <div className={styles.infoCard}>
                          <span>Supplier</span>
                          <strong>{selected.supplierName}</strong>
                          <p>{selected.supplierEmail || "--"}</p>
                        </div>

                        <div className={styles.infoCard}>
                          <span>Total</span>
                          <strong>{formatMoney(selected.totalAmount, selected.currency)}</strong>
                          <p>{selected.currency}</p>
                        </div>

                        <div className={styles.infoCard}>
                          <span>Ordered at</span>
                          <strong>{formatDate(selected.orderedAt)}</strong>
                          <p>Expected: {formatDate(selected.expectedAt)}</p>
                        </div>

                        <div className={styles.infoCard}>
                          <span>Remaining qty</span>
                          <strong>{selectedRemainingTotal}</strong>
                          <p>Pending receipt</p>
                        </div>
                      </div>

                      <div className={styles.actionBar}>
                        {(selected.status === "DRAFT" || selected.status === "SUBMITTED") && (
                          <button className={styles.primaryButton} onClick={handleApprove} disabled={submitting}>
                            {submitting ? "Approving..." : "Approve PO"}
                          </button>
                        )}

                        {(selected.status === "APPROVED" || selected.status === "PARTIALLY_RECEIVED") && (
                          <button
                            className={styles.secondaryButton}
                            onClick={() => setShowReceiveForm((prev) => !prev)}
                          >
                            {showReceiveForm ? "Hide receive form" : "Receive goods"}
                          </button>
                        )}

                        {selected.status !== "RECEIVED" && selected.status !== "CANCELLED" && (
                          <button className={styles.ghostDangerButton} onClick={handleCancel} disabled={submitting}>
                            Cancel PO
                          </button>
                        )}
                      </div>

                      {showReceiveForm &&
                        (selected.status === "APPROVED" || selected.status === "PARTIALLY_RECEIVED") && (
                          <div className={styles.receiveBox}>
                            <div className={styles.sectionCardHeader}>
                              <h3>Receive Goods</h3>
                              <p>Record the actual quantities received for each line item.</p>
                            </div>

                            <div className={styles.formGrid}>
                              <div className={styles.field}>
                                <label>Received at</label>
                                <input
                                  type="datetime-local"
                                  value={receiveAt}
                                  onChange={(e) => setReceiveAt(e.target.value)}
                                />
                              </div>

                              <div className={styles.field}>
                                <label>Created by</label>
                                <input value={receiveCreatedBy} onChange={(e) => setReceiveCreatedBy(e.target.value)} />
                              </div>

                              <div className={`${styles.field} ${styles.fullWidth}`}>
                                <label>Note</label>
                                <textarea
                                  rows={3}
                                  value={receiveNote}
                                  onChange={(e) => setReceiveNote(e.target.value)}
                                  placeholder="Notes for this receipt"
                                />
                              </div>
                            </div>

                            <div className={styles.receiveLines}>
                              {selected.lines.map((line) => (
                                <div key={line.id} className={styles.receiveLine}>
                                  <div className={styles.receiveLineInfo}>
                                    <strong>{line.productName}</strong>
                                    <p>
                                      {line.sku}
                                      {line.variantTitle ? ` · ${line.variantTitle}` : ""}
                                    </p>
                                    <span>
                                      Ordered: {line.orderedQty} · Received: {line.receivedQty} · Remaining:{" "}
                                      {line.remainingQty}
                                    </span>
                                  </div>

                                  <div className={styles.receiveQtyBox}>
                                    <label>Receive qty</label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={line.remainingQty}
                                      value={receiveInputs[line.id] ?? 0}
                                      onChange={(e) =>
                                        setReceiveInputs((prev) => ({
                                          ...prev,
                                          [line.id]: Math.max(
                                            0,
                                            Math.min(line.remainingQty, Number(e.target.value || 0)),
                                          ),
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className={styles.summaryInline}>
                              <div>
                                <span>Receipt lines</span>
                                <strong>
                                  {Object.values(receiveInputs).filter((value) => Number(value) > 0).length}
                                </strong>
                              </div>

                              <button className={styles.primaryButton} onClick={handleReceive} disabled={submitting}>
                                {submitting ? "Receiving..." : "Confirm receipt"}
                              </button>
                            </div>
                          </div>
                        )}

                      <div className={styles.detailSection}>
                        <div className={styles.sectionTitle}>Line items</div>

                        <div className={styles.detailTableWrap}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Qty</th>
                                <th>Unit cost</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selected.lines.map((line) => (
                                <tr key={line.id}>
                                  <td>
                                    <div className={styles.primaryCell}>
                                      <strong>{line.productName}</strong>
                                      <span>{line.variantTitle || "--"}</span>
                                    </div>
                                  </td>
                                  <td>{line.sku}</td>
                                  <td>{line.orderedQty}</td>
                                  <td>{formatMoney(line.unitCost, selected.currency)}</td>
                                  <td>
                                    <span className={styles.smallBadge}>{lineStatusLabel(line.status)}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className={styles.detailSection}>
                        <div className={styles.sectionTitle}>Receipts</div>

                        <div className={styles.receiptList}>
                          {!selected.receipts || selected.receipts.length === 0 ? (
                            <div className={styles.emptyBox}>No receipts yet.</div>
                          ) : (
                            selected.receipts.map((receipt) => (
                              <div key={receipt.id} className={styles.receiptCard}>
                                <div className={styles.receiptHeader}>
                                  <div>
                                    <strong>{receipt.receiptNumber}</strong>
                                    <p>{formatDate(receipt.receivedAt)}</p>
                                  </div>
                                  <span>{receipt.createdBy || "--"}</span>
                                </div>

                                {receipt.note ? <p className={styles.receiptNote}>{receipt.note}</p> : null}

                                <div className={styles.receiptMiniList}>
                                  {receipt.lines.map((line) => (
                                    <div key={line.id} className={styles.receiptMiniItem}>
                                      <span>{line.purchaseOrderLineId}</span>
                                      <strong>+{line.receivedQty}</strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

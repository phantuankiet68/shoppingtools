"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import styles from "@/styles/admin/inventory/purchase-orders/purchase-orders.module.css";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";

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

const SITE_ID = "site_123";

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
      return "Nháp";
    case "SUBMITTED":
      return "Đã gửi";
    case "APPROVED":
      return "Đã duyệt";
    case "PARTIALLY_RECEIVED":
      return "Nhận một phần";
    case "RECEIVED":
      return "Đã nhận đủ";
    case "CANCELLED":
      return "Đã huỷ";
    default:
      return status;
  }
}

function lineStatusLabel(status: PurchaseOrderLineStatus) {
  switch (status) {
    case "PENDING":
      return "Chờ nhận";
    case "PARTIALLY_RECEIVED":
      return "Nhận một phần";
    case "RECEIVED":
      return "Đã nhận";
    case "CANCELLED":
      return "Huỷ";
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

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("siteId", SITE_ID);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (supplierFilter.trim()) params.set("supplierName", supplierFilter.trim());

      const res = await fetch(`/api/admin/inventory/purchase-orders?${params.toString()}`, {
        cache: "no-store",
      });

      const json = await safeJson<PurchaseOrderListResponse>(res);
      setItems(json.data || []);
    } catch (error: any) {
      alert(error.message || "Không tải được purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrderDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const params = new URLSearchParams({ siteId: SITE_ID });
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
      alert(error.message || "Không tải được chi tiết purchase order");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, [statusFilter, supplierFilter]);

  useEffect(() => {
    if (selectedId) {
      fetchPurchaseOrderDetail(selectedId);
    } else {
      setSelected(null);
      setShowReceiveForm(false);
    }
  }, [selectedId]);

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

  const addCreateLine = () => {
    if (!lineDraft.variantId.trim()) {
      alert("variantId là bắt buộc");
      return;
    }
    if (lineDraft.orderedQty <= 0) {
      alert("orderedQty phải lớn hơn 0");
      return;
    }
    if (lineDraft.unitCost < 0) {
      alert("unitCost không hợp lệ");
      return;
    }

    setCreateLines((prev) => [...prev, { ...lineDraft }]);
    setLineDraft({
      variantId: "",
      orderedQty: 1,
      unitCost: 0,
      note: "",
    });
  };

  const removeCreateLine = (index: number) => {
    setCreateLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePurchaseOrder = async () => {
    try {
      if (!form.poNumber.trim()) {
        alert("PO Number là bắt buộc");
        return;
      }
      if (!form.supplierName.trim()) {
        alert("Supplier name là bắt buộc");
        return;
      }
      if (createLines.length === 0) {
        alert("Cần ít nhất 1 line item");
        return;
      }

      setSubmitting(true);

      const res = await fetch("/api/admin/inventory/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId: SITE_ID,
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
      alert(error.message || "Tạo purchase order thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!selected) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/inventory/purchase-orders/${selected.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId: SITE_ID,
          approvedBy: "admin_001",
          note: "Approved from admin UI",
          syncIncoming: true,
        }),
      });

      await safeJson(res);
      await fetchPurchaseOrders();
      await fetchPurchaseOrderDetail(selected.id);
    } catch (error: any) {
      alert(error.message || "Approve thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!selected) return;
    const confirmed = window.confirm(`Huỷ purchase order ${selected.poNumber}?`);
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const params = new URLSearchParams({ siteId: SITE_ID });
      const res = await fetch(`/api/admin/inventory/purchase-orders/${selected.id}?${params.toString()}`, {
        method: "DELETE",
      });

      await safeJson(res);
      setSelectedId(null);
      await fetchPurchaseOrders();
    } catch (error: any) {
      alert(error.message || "Huỷ purchase order thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceive = async () => {
    if (!selected) return;

    const lines = selected.lines
      .filter((line) => Number(receiveInputs[line.id] || 0) > 0)
      .map((line) => ({
        purchaseOrderLineId: line.id,
        receivedQty: Number(receiveInputs[line.id] || 0),
      }));

    if (lines.length === 0) {
      alert("Chưa có line nào được nhập số lượng nhận");
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
          siteId: SITE_ID,
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
      alert(error.message || "Receive thất bại");
    } finally {
      setSubmitting(false);
    }
  };
  const toggleCreateForm = useCallback(() => {
    setShowCreateForm((prev) => !prev);
  }, []);
  const functionKeyActions = useMemo(
    () => ({
      F2: {
        action: toggleCreateForm,
        label: "Toggle create",
        icon: "bi-plus-circle",
      },
      F5: {
        action: toggleCreateForm,
        label: "Create Line",
        icon: "bi-plus-circle",
      },
    }),
    [toggleCreateForm],
  );
  usePageFunctionKeys(functionKeyActions);
  return (
    <div className={styles.page}>
      {showCreateForm && (
        <section className={styles.createPanel}>
          <div className={styles.createLayout}>
            <div className={styles.createMain}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionCardHeader}>
                  <h3>Thông tin chung</h3>
                  <p>Thông tin định danh của purchase order và supplier.</p>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>PO Number</label>
                    <input
                      value={form.poNumber}
                      onChange={(e) => setForm((prev) => ({ ...prev, poNumber: e.target.value }))}
                      placeholder="VD: PO-20260311-001"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Supplier name</label>
                    <input
                      value={form.supplierName}
                      onChange={(e) => setForm((prev) => ({ ...prev, supplierName: e.target.value }))}
                      placeholder="Tên nhà cung cấp"
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Supplier code</label>
                    <input
                      value={form.supplierCode}
                      onChange={(e) => setForm((prev) => ({ ...prev, supplierCode: e.target.value }))}
                      placeholder="Mã NCC"
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
                      placeholder="SĐT nhà cung cấp"
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
                      rows={4}
                      value={form.note}
                      onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                      placeholder="Ghi chú thêm cho đơn nhập"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.createAside}>
              <div className={styles.sectionCard}>
                <div className={styles.sectionCardHeader}>
                  <h3>Chi phí & phụ phí</h3>
                  <p>Điều chỉnh discount, thuế và chi phí vận chuyển.</p>
                </div>

                <div className={styles.compactGrid}>
                  <div className={styles.field}>
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

              <div className={styles.sectionCard}>
                <div className={styles.sectionCardHeader}>
                  <h3>Line items</h3>
                  <p>Thêm sản phẩm nhập hàng theo variantId.</p>
                </div>

                <div className={styles.lineDraftGrid}>
                  <div className={styles.field}>
                    <label>Variant ID</label>
                    <input
                      value={lineDraft.variantId}
                      onChange={(e) => setLineDraft((prev) => ({ ...prev, variantId: e.target.value }))}
                      placeholder="variant_xxx"
                    />
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

                <div className={styles.lineList}>
                  {createLines.length === 0 ? (
                    <div className={styles.emptyBox}>Chưa có line item nào.</div>
                  ) : (
                    createLines.map((line, index) => (
                      <div key={`${line.variantId}-${index}`} className={styles.lineCard}>
                        <div className={styles.lineCardMain}>
                          <div className={styles.lineCardTop}>
                            <strong>{line.variantId}</strong>
                            <span className={styles.linePrice}>{formatMoney(line.unitCost)} / đơn vị</span>
                          </div>
                          <p>
                            Số lượng: <b>{line.orderedQty}</b> · Thành tiền:{" "}
                            <b>{formatMoney(line.orderedQty * line.unitCost)}</b>
                          </p>
                          {line.note ? <span className={styles.lineNote}>{line.note}</span> : null}
                        </div>

                        <button className={styles.ghostDangerButton} onClick={() => removeCreateLine(index)}>
                          Xoá
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryCardHeader}>
                  <h3>Tổng quan đơn hàng</h3>
                  <p>Tóm tắt nhanh trước khi tạo purchase order.</p>
                </div>

                <div className={styles.summaryList}>
                  <div className={styles.summaryRow}>
                    <span>Số line items</span>
                    <strong>{createLines.length}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <strong>{formatMoney(createSubtotal)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Discount</span>
                    <strong>- {formatMoney(form.discountAmount)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Tax</span>
                    <strong>+ {formatMoney(form.taxAmount)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <strong>+ {formatMoney(form.shippingAmount)}</strong>
                  </div>
                </div>

                <div className={styles.summaryTotal}>
                  <span>Tổng cộng</span>
                  <strong>{formatMoney(createGrandTotal)}</strong>
                </div>

                <button className={styles.primaryButton} onClick={handleCreatePurchaseOrder} disabled={submitting}>
                  {submitting ? "Đang tạo..." : "Tạo purchase order"}
                </button>
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
              <span className={styles.statLabel}>Tổng PO</span>
              <span className={`${styles.statBadge} ${styles.neutral}`}>All</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{stats.total}</strong>
              <span className={styles.statTrend}>+5%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: "100%" }} />
            </div>

            <span className={styles.statHint}>Tổng số đơn nhập hàng trong hệ thống</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>✔</span>
              <span className={styles.statLabel}>Đã duyệt</span>
              <span className={`${styles.statBadge} ${styles.info}`}>Ready</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{stats.approved}</strong>
              <span className={styles.statTrend}>+2%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: `${(stats.approved / stats.total) * 100}%` }} />
            </div>

            <span className={styles.statHint}>PO đã được duyệt và chờ nhận hàng</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>⏳</span>
              <span className={styles.statLabel}>Nhận một phần</span>
              <span className={`${styles.statBadge} ${styles.warning}`}>Partial</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{stats.partial}</strong>
              <span className={styles.statTrend}>-1%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: `${(stats.partial / stats.total) * 100}%` }} />
            </div>

            <span className={styles.statHint}>Một phần hàng đã được nhập kho</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>🏁</span>
              <span className={styles.statLabel}>Đã nhận đủ</span>
              <span className={`${styles.statBadge} ${styles.success}`}>Done</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{stats.received}</strong>
              <span className={styles.statTrend}>+3%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: `${(stats.received / stats.total) * 100}%` }} />
            </div>

            <span className={styles.statHint}>PO đã hoàn tất nhập kho</span>
          </div>

          <div className={`${styles.statCard} ${styles.statWide}`}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>💰</span>
              <span className={styles.statLabel}>Tổng giá trị</span>
              <span className={`${styles.statBadge} ${styles.money}`}>Value</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{formatMoney(stats.totalValue)}</strong>
              <span className={styles.statTrend}>+8%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: "100%" }} />
            </div>

            <span className={styles.statHint}>Tổng giá trị của toàn bộ purchase orders</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>🏁</span>
              <span className={styles.statLabel}>Đã nhận</span>
              <span className={`${styles.statBadge} ${styles.success}`}>Done</span>
            </div>

            <div className={styles.statMain}>
              <strong className={styles.statValue}>{stats.received}</strong>
              <span className={styles.statTrend}>+3%</span>
            </div>

            <div className={styles.statProgress}>
              <div style={{ width: `${(stats.received / stats.total) * 100}%` }} />
            </div>

            <span className={styles.statHint}>PO đã hoàn tất nhập kho</span>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeaderRow}>
            <div>
              <span className={styles.panelEyebrow}>Purchase Order List</span>
              <h2 className={styles.panelTitle}>Danh sách purchase orders</h2>
            </div>
          </div>

          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo PO number, supplier, status..."
              />
            </div>

            <div className={styles.filterGroup}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | "ALL")}
              >
                <option value="ALL">Tất cả trạng thái</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>

              <input
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                placeholder="Lọc supplier..."
              />
            </div>
          </div>

          <div className={styles.tableCard}>
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
                  {loading ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.emptyState}>Đang tải dữ liệu...</div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.emptyState}>Chưa có purchase order nào.</div>
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
                          <button className={styles.rowButton} onClick={() => setSelectedId(item.id)}>
                            Xem
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
          {!selectedId ? (
            <div className={styles.emptyDetail}>
              <h3>Chưa chọn purchase order</h3>
              <p>Chọn một dòng bên trái để xem chi tiết, approve hoặc receive hàng.</p>
            </div>
          ) : detailLoading ? (
            <div className={styles.emptyDetail}>
              <h3>Đang tải chi tiết...</h3>
            </div>
          ) : !selected ? (
            <div className={styles.emptyDetail}>
              <h3>Không tìm thấy dữ liệu</h3>
            </div>
          ) : (
            <>
              <div className={styles.sideHeader}>
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
                  <p>Pending receive</p>
                </div>
              </div>

              <div className={styles.actionBar}>
                {(selected.status === "DRAFT" || selected.status === "SUBMITTED") && (
                  <button className={styles.primaryButton} onClick={handleApprove} disabled={submitting}>
                    {submitting ? "Đang duyệt..." : "Approve PO"}
                  </button>
                )}

                {(selected.status === "APPROVED" || selected.status === "PARTIALLY_RECEIVED") && (
                  <button className={styles.secondaryButton} onClick={() => setShowReceiveForm((prev) => !prev)}>
                    {showReceiveForm ? "Ẩn form receive" : "Receive hàng"}
                  </button>
                )}

                {selected.status !== "RECEIVED" && selected.status !== "CANCELLED" && (
                  <button className={styles.ghostDangerButton} onClick={handleCancel} disabled={submitting}>
                    Huỷ PO
                  </button>
                )}
              </div>

              {showReceiveForm && (selected.status === "APPROVED" || selected.status === "PARTIALLY_RECEIVED") && (
                <div className={styles.receiveBox}>
                  <div className={styles.sectionCardHeader}>
                    <h3>Receive hàng</h3>
                    <p>Ghi nhận hàng thực tế đã nhập về cho từng line item.</p>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label>Received at</label>
                      <input type="datetime-local" value={receiveAt} onChange={(e) => setReceiveAt(e.target.value)} />
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
                        placeholder="Ghi chú lần nhận hàng"
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
                            Ordered: {line.orderedQty} · Received: {line.receivedQty} · Remaining: {line.remainingQty}
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
                                [line.id]: Math.max(0, Math.min(line.remainingQty, Number(e.target.value || 0))),
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
                      <strong>{Object.values(receiveInputs).filter((value) => Number(value) > 0).length}</strong>
                    </div>

                    <button className={styles.primaryButton} onClick={handleReceive} disabled={submitting}>
                      {submitting ? "Đang nhận hàng..." : "Xác nhận receive"}
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
                        <th>Received</th>
                        <th>Remaining</th>
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
                          <td>{line.receivedQty}</td>
                          <td>{line.remainingQty}</td>
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
                    <div className={styles.emptyBox}>Chưa có receipt nào.</div>
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
            </>
          )}
        </aside>
      </section>
    </div>
  );
}

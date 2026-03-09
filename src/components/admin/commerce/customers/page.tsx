"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/commerce/customers/customers.module.css";
import { useShallow } from "zustand/react/shallow";
import { useCustomerStore } from "@/store/commerce/customers/customer.store";
import { useSiteStore } from "@/store/site/site.store";
import { apiDeleteCustomer, apiPatchCustomer } from "@/services/commerce/customers/customer.service";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";
import type { CustomerStore, CustomerStatus, Customer } from "@/store/commerce/customers/customer.store";

type LeftFormMode = "CREATE" | "EDIT";
type CustomerSort = "LAST_ORDER" | "TOTAL_SPENT" | "CREATED_AT";
type CustomerFilterStatus = "ANY" | CustomerStatus;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(iso?: string): string {
  if (!iso) return "—";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Unknown error";
}

const statusMeta: Record<CustomerStatus, { label: string; icon: string }> = {
  ACTIVE: { label: "Active", icon: "bi-check-circle" },
  INACTIVE: { label: "Inactive", icon: "bi-dash-circle" },
  VIP: { label: "VIP", icon: "bi-stars" },
};

export default function CustomersPage() {
  const modal = useModal();

  const selectedSiteId = useSiteStore((state) => state.siteId);
  const sites = useSiteStore((state) => state.sites);
  const sitesLoading = useSiteStore((state) => state.loading);
  const sitesError = useSiteStore((state) => state.err);
  const setSelectedSiteId = useSiteStore((state) => state.setSiteId);
  const hydrateFromStorage = useSiteStore((state) => state.hydrateFromStorage);
  const loadSites = useSiteStore((state) => state.loadSites);

  const customerStore = useCustomerStore(
    useShallow((state: CustomerStore) => ({
      siteId: state.siteId,
      siteErr: state.siteErr,
      setSiteId: state.setSiteId,

      customers: state.customers,
      nextCursor: state.nextCursor,
      statsServer: state.statsServer,
      allTagsServer: state.allTagsServer,

      query: state.query,
      segment: state.segment,
      statusFilter: state.statusFilter,
      tagFilter: state.tagFilter,
      sort: state.sort,

      selected: state.selected,
      loading: state.loading,
      err: state.err,

      setQuery: state.setQuery,
      setSegment: state.setSegment,
      setStatusFilter: state.setStatusFilter,
      setTagFilter: state.setTagFilter,
      setSort: state.setSort,

      toggleSelect: state.toggleSelect,
      bulkSelect: state.bulkSelect,
      clearSelection: state.clearSelection,

      fetchCustomers: state.fetchCustomers,
      loadMore: state.loadMore,
      openDetailAndMerge: state.openDetailAndMerge,

      bulkSetStatus: state.bulkSetStatus,
      bulkDeactivate: state.bulkDeactivate,
      createCustomer: state.createCustomer,
    })),
  );

  const {
    siteId,
    siteErr,
    setSiteId,

    customers,
    nextCursor,
    statsServer,
    allTagsServer,

    query,
    segment,
    statusFilter,
    tagFilter,
    sort,

    selected,
    loading,
    err,

    setQuery,
    setSegment,
    setStatusFilter,
    setTagFilter,
    setSort,

    toggleSelect,
    bulkSelect,
    clearSelection,

    fetchCustomers,
    loadMore,
    openDetailAndMerge,

    bulkSetStatus,
    bulkDeactivate,
    createCustomer,
  } = customerStore;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [detailEditMode, setDetailEditMode] = useState(false);
  const [savingDetailEdit, setSavingDetailEdit] = useState(false);
  const [detailName, setDetailName] = useState("");
  const [detailEmail, setDetailEmail] = useState("");
  const [detailPhone, setDetailPhone] = useState("");
  const [detailStatus, setDetailStatus] = useState<CustomerStatus>("ACTIVE");
  const [detailNote, setDetailNote] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const tagInputRef = useRef<HTMLInputElement | null>(null);

  const [leftFormMode, setLeftFormMode] = useState<LeftFormMode>("CREATE");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStatus, setFormStatus] = useState<CustomerStatus>("ACTIVE");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState("");
  const [formNote, setFormNote] = useState("");
  const [submittingForm, setSubmittingForm] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
    void loadSites();
  }, [hydrateFromStorage, loadSites]);

  useEffect(() => {
    if (!selectedSiteId || selectedSiteId === siteId) return;
    setSiteId(selectedSiteId);
  }, [selectedSiteId, siteId, setSiteId]);

  useEffect(() => {
    if (!siteId) return;

    const timeoutId = window.setTimeout(() => {
      void fetchCustomers();
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [siteId, query, segment, statusFilter, tagFilter, sort, fetchCustomers]);

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const allTags = useMemo(() => {
    const mergedTags = new Set<string>(allTagsServer);

    for (const customer of customers) {
      for (const tag of customer.tags) {
        mergedTags.add(tag);
      }
    }

    return Array.from(mergedTags).sort((a, b) => a.localeCompare(b));
  }, [allTagsServer, customers]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = customers.filter((customer) => {
      const matchesQuery =
        !normalizedQuery ||
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.email.toLowerCase().includes(normalizedQuery) ||
        (customer.phone ?? "").toLowerCase().includes(normalizedQuery) ||
        customer.id.toLowerCase().includes(normalizedQuery) ||
        customer.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      const matchesSegment = segment === "ALL" ? true : customer.status === segment;
      const matchesStatus = statusFilter === "ANY" ? true : customer.status === statusFilter;
      const matchesTag = !tagFilter ? true : customer.tags.includes(tagFilter);

      return matchesQuery && matchesSegment && matchesStatus && matchesTag;
    });

    result.sort((customerA, customerB) => {
      if (sort === "TOTAL_SPENT") {
        return customerB.totalSpent - customerA.totalSpent;
      }

      if (sort === "CREATED_AT") {
        return +new Date(customerB.createdAt) - +new Date(customerA.createdAt);
      }

      return +new Date(customerB.lastOrderAt ?? 0) - +new Date(customerA.lastOrderAt ?? 0);
    });

    return result;
  }, [customers, query, segment, statusFilter, tagFilter, sort]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(filteredCustomers.length / pageSize)),
    [filteredCustomers.length],
  );

  useEffect(() => {
    setPage((currentPage) => Math.min(Math.max(1, currentPage), pageCount));
  }, [pageCount]);

  useEffect(() => {
    setPage(1);
  }, [query, segment, statusFilter, tagFilter, sort]);

  const pagedCustomers = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, page]);

  const activeCustomer = useMemo(() => {
    if (!activeCustomerId) return null;
    return customers.find((customer) => customer.id === activeCustomerId) ?? null;
  }, [customers, activeCustomerId]);

  useEffect(() => {
    if (!activeCustomer) {
      setDetailEditMode(false);
      setDetailName("");
      setDetailEmail("");
      setDetailPhone("");
      setDetailStatus("ACTIVE");
      setDetailNote("");
      return;
    }

    setDetailName(activeCustomer.name ?? "");
    setDetailEmail(activeCustomer.email ?? "");
    setDetailPhone(activeCustomer.phone ?? "");
    setDetailStatus(activeCustomer.status);
    setDetailNote(activeCustomer.note ?? "");
  }, [activeCustomer]);

  const stats = useMemo(() => {
    const total = statsServer?.total ?? customers.length;
    const active =
      statsServer?.active ??
      customers.filter((customer) => customer.status === "ACTIVE" || customer.status === "VIP").length;
    const vip = customers.filter((customer) => customer.status === "VIP").length;
    const revenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);

    return { total, active, vip, revenue };
  }, [customers, statsServer]);

  const isFormValid = useMemo(() => {
    return formName.trim().length >= 2 && formEmail.includes("@") && !loading && !submittingForm && Boolean(siteId);
  }, [formName, formEmail, loading, submittingForm, siteId]);

  const resetLeftForm = useCallback(() => {
    setLeftFormMode("CREATE");
    setEditingCustomerId(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormStatus("ACTIVE");
    setFormTags([]);
    setFormTagInput("");
    setFormNote("");
  }, []);

  const populateLeftFormForEdit = useCallback((customer: Customer) => {
    setLeftFormMode("EDIT");
    setEditingCustomerId(customer.id);
    setFormName(customer.name ?? "");
    setFormEmail(customer.email ?? "");
    setFormPhone(customer.phone ?? "");
    setFormStatus(customer.status);
    setFormTags(customer.tags ?? []);
    setFormTagInput("");
    setFormNote(customer.note ?? "");
  }, []);

  const toggleSelectAllOnPage = useCallback(
    (checked: boolean) => {
      bulkSelect(
        pagedCustomers.map((customer) => customer.id),
        checked,
      );
    },
    [bulkSelect, pagedCustomers],
  );

  const toggleFormTag = useCallback((tag: string) => {
    setFormTags((previousTags) =>
      previousTags.includes(tag) ? previousTags.filter((currentTag) => currentTag !== tag) : [...previousTags, tag],
    );
  }, []);

  const addCustomFormTag = useCallback(() => {
    const nextTag = formTagInput.trim();
    if (!nextTag) return;

    setFormTags((previousTags) => {
      const alreadyExists = previousTags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase());
      if (alreadyExists) return previousTags;
      return [...previousTags, nextTag];
    });

    setFormTagInput("");
    tagInputRef.current?.focus();
  }, [formTagInput]);

  const removeFormTag = useCallback((tag: string) => {
    setFormTags((previousTags) => previousTags.filter((currentTag) => currentTag !== tag));
  }, []);

  const openDrawer = useCallback(
    async (customer: Customer) => {
      setActiveCustomerId(customer.id);
      setDrawerOpen(true);
      setDrawerLoading(true);
      setDetailEditMode(false);

      try {
        await openDetailAndMerge(customer.id);
      } finally {
        setDrawerLoading(false);
      }
    },
    [openDetailAndMerge],
  );

  const handleCreate = useCallback(async () => {
    if (!siteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    if (!isFormValid) {
      nameInputRef.current?.focus();
      return;
    }

    try {
      setSubmittingForm(true);

      await createCustomer({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        status: formStatus,
        tags: formTags,
        note: formNote.trim(),
      });

      resetLeftForm();
      nameInputRef.current?.focus();
      modal.success("Success", `Created “${formName.trim()}” successfully.`);
    } catch (error: unknown) {
      console.error("Create customer failed", error);
      modal.error("Create failed", getErrorMessage(error));
    } finally {
      setSubmittingForm(false);
    }
  }, [
    siteId,
    isFormValid,
    createCustomer,
    formName,
    formEmail,
    formPhone,
    formStatus,
    formTags,
    formNote,
    resetLeftForm,
    modal,
  ]);

  const handleUpdateFromLeftForm = useCallback(async () => {
    if (!siteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    if (!editingCustomerId || !isFormValid) {
      nameInputRef.current?.focus();
      return;
    }

    try {
      setSubmittingForm(true);

      const normalizedTags =
        formStatus === "VIP"
          ? Array.from(new Set([...formTags, "vip"]))
          : formTags.filter((tag) => tag.toLowerCase() !== "vip");

      await apiPatchCustomer(siteId, editingCustomerId, {
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        notes: formNote.trim() || undefined,
        isActive: formStatus !== "INACTIVE",
        tags: normalizedTags,
      });

      await fetchCustomers();
      resetLeftForm();
      nameInputRef.current?.focus();
      modal.success("Success", `Updated “${formName.trim()}” successfully.`);
    } catch (error: unknown) {
      console.error("Update customer from left form failed", error);
      modal.error("Update failed", getErrorMessage(error));
    } finally {
      setSubmittingForm(false);
    }
  }, [
    siteId,
    editingCustomerId,
    isFormValid,
    formName,
    formEmail,
    formPhone,
    formNote,
    formStatus,
    formTags,
    fetchCustomers,
    resetLeftForm,
    modal,
  ]);

  const handleSubmitLeftForm = useCallback(async () => {
    if (leftFormMode === "EDIT") {
      await handleUpdateFromLeftForm();
      return;
    }

    await handleCreate();
  }, [leftFormMode, handleUpdateFromLeftForm, handleCreate]);

  const handleFocusCreateForm = useCallback(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleEnterDetailEditMode = useCallback(() => {
    if (!drawerOpen || !activeCustomer) return;
    setDetailEditMode(true);
  }, [drawerOpen, activeCustomer]);

  const handleSaveDetail = useCallback(async () => {
    if (!siteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    if (!activeCustomer || !detailEditMode || savingDetailEdit) return;

    try {
      setSavingDetailEdit(true);

      const nextTags =
        detailStatus === "VIP"
          ? Array.from(new Set([...(activeCustomer.tags ?? []), "vip"]))
          : (activeCustomer.tags ?? []).filter((tag) => tag.toLowerCase() !== "vip");

      await apiPatchCustomer(siteId, activeCustomer.id, {
        name: detailName.trim(),
        email: detailEmail.trim() || undefined,
        phone: detailPhone.trim() || undefined,
        notes: detailNote.trim() || undefined,
        isActive: detailStatus !== "INACTIVE",
        tags: nextTags,
      });

      await openDetailAndMerge(activeCustomer.id);
      await fetchCustomers();
      setDetailEditMode(false);
      modal.success("Success", `Updated “${detailName.trim()}” successfully.`);
    } catch (error: unknown) {
      console.error("Save detail customer failed", error);
      modal.error("Save failed", getErrorMessage(error));
    } finally {
      setSavingDetailEdit(false);
    }
  }, [
    siteId,
    activeCustomer,
    detailEditMode,
    savingDetailEdit,
    detailName,
    detailEmail,
    detailPhone,
    detailNote,
    detailStatus,
    openDetailAndMerge,
    fetchCustomers,
    modal,
  ]);

  const executeDelete = useCallback(async () => {
    if (!siteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    if (loading) return;

    try {
      if (selectedCount > 0) {
        await bulkDeactivate();

        setDrawerOpen(false);
        setActiveCustomerId(null);
        setDetailEditMode(false);

        modal.success("Success", `Deactivated ${selectedCount} selected customer(s) successfully.`);
        return;
      }

      if (!activeCustomer) return;

      await apiDeleteCustomer(siteId, activeCustomer.id);

      useCustomerStore.setState((state) => ({
        customers: state.customers.map((customer) =>
          customer.id === activeCustomer.id
            ? {
                ...customer,
                status: "INACTIVE",
              }
            : customer,
        ),
      }));

      setDrawerOpen(false);
      setActiveCustomerId(null);
      setDetailEditMode(false);

      modal.success("Success", `Deleted “${activeCustomer.name}” successfully.`);
    } catch (error: unknown) {
      console.error("Delete customer failed", error);
      modal.error("Delete failed", getErrorMessage(error));
    }
  }, [siteId, loading, selectedCount, bulkDeactivate, activeCustomer, modal]);

  const handleDelete = useCallback(() => {
    if (!siteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    if (selectedCount > 0) {
      modal.confirmDelete("Deactivate selected customers?", `Deactivate ${selectedCount} selected customer(s)?`, () => {
        void executeDelete();
      });
      return;
    }

    if (activeCustomer) {
      modal.confirmDelete("Delete customer?", `Delete “${activeCustomer.name}”? This action cannot be undone.`, () => {
        void executeDelete();
      });
    }
  }, [siteId, selectedCount, activeCustomer, executeDelete, modal]);

  const handleDeleteSingle = useCallback(
    (customer: Customer) => {
      if (!siteId) {
        modal.error("Missing site", "Please select a site first.");
        return;
      }

      modal.confirmDelete("Delete customer?", `Delete “${customer.name}”? This action cannot be undone.`, async () => {
        try {
          await apiDeleteCustomer(siteId, customer.id);

          useCustomerStore.setState((state) => ({
            customers: state.customers.map((item) =>
              item.id === customer.id
                ? {
                    ...item,
                    status: "INACTIVE",
                  }
                : item,
            ),
          }));

          if (activeCustomerId === customer.id) {
            setDrawerOpen(false);
            setActiveCustomerId(null);
            setDetailEditMode(false);
          }

          modal.success("Success", `Deleted “${customer.name}” successfully.`);
        } catch (error: unknown) {
          console.error("Delete single customer failed", error);
          modal.error("Delete failed", getErrorMessage(error));
        }
      });
    },
    [siteId, activeCustomerId, modal],
  );

  const functionKeyActions = useMemo(
    () => ({
      F3: handleDelete,
      F5: handleFocusCreateForm,
      F6: handleEnterDetailEditMode,
      F10: detailEditMode ? handleSaveDetail : handleSubmitLeftForm,
    }),
    [
      handleDelete,
      handleFocusCreateForm,
      handleEnterDetailEditMode,
      detailEditMode,
      handleSaveDetail,
      handleSubmitLeftForm,
    ],
  );

  usePageFunctionKeys(functionKeyActions);

  const leftFormTitle = leftFormMode === "EDIT" ? "Edit customer" : "Create customer";
  const leftFormShortcutHint =
    leftFormMode === "EDIT" ? "F5: focus form · F10: update customer" : "F5: focus form · F10: create customer";

  return (
    <div className={styles.page}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "330px minmax(0, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <aside
          style={{
            border: "1px solid #d7e3f4",
            borderRadius: 6,
            background: "#fff",
            padding: 16,
            position: "sticky",
            top: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: "#294f7d" }}>
              <i
                className={leftFormMode === "EDIT" ? "bi bi-pencil-square" : "bi bi-person-plus"}
                style={{ marginRight: 8 }}
              />
              {leftFormTitle}
            </div>
            <span className={styles.badge}>F5</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <label className={styles.label}>
              <span className={styles.labelText}>Full name</span>
              <input
                ref={nameInputRef}
                className={styles.input}
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                placeholder="e.g. Nguyễn Văn A"
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Email</span>
              <input
                className={styles.input}
                value={formEmail}
                onChange={(event) => setFormEmail(event.target.value)}
                placeholder="e.g. customer@email.com"
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Phone</span>
              <input
                className={styles.input}
                value={formPhone}
                onChange={(event) => setFormPhone(event.target.value)}
                placeholder="Optional"
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Status</span>
              <div className={styles.selectWrap}>
                <i className={`bi bi-activity ${styles.selectIcon}`} />
                <select
                  className={styles.select}
                  value={formStatus}
                  onChange={(event) => setFormStatus(event.target.value as CustomerStatus)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </label>
          </div>

          <div className={styles.section} style={{ marginTop: 18 }}>
            <div className={styles.sectionTitle}>
              <i className="bi bi-tags" /> Tags
            </div>

            <div className={styles.sectionBody}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  ref={tagInputRef}
                  className={styles.input}
                  value={formTagInput}
                  onChange={(event) => setFormTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomFormTag();
                    }
                  }}
                  placeholder="Add custom tag"
                  style={{ flex: 1 }}
                />
                <button className={styles.secondaryBtn} type="button" onClick={addCustomFormTag}>
                  <i className="bi bi-plus-lg" />
                  Add
                </button>
              </div>

              {allTags.length > 0 ? (
                <div className={styles.tagPickRow} style={{ marginBottom: 12 }}>
                  {allTags.map((tag) => {
                    const active = formTags.includes(tag);

                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`${styles.tagPick} ${active ? styles.tagPickActive : ""}`}
                        onClick={() => toggleFormTag(tag)}
                      >
                        <i className={`bi ${active ? "bi-check2" : "bi-plus"}`} />
                        {tag}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className={styles.tagRow}>
                {formTags.length === 0 ? <span className={styles.muted}>No tags selected</span> : null}
                {formTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={styles.tag}
                    onClick={() => removeFormTag(tag)}
                    title={`Remove ${tag}`}
                    style={{ cursor: "pointer" }}
                  >
                    {tag} <span style={{ marginLeft: 6 }}>×</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className={styles.label} style={{ display: "flex", marginTop: 16 }}>
            <span className={styles.labelText}>Notes</span>
            <textarea
              className={styles.textarea}
              value={formNote}
              onChange={(event) => setFormNote(event.target.value)}
              placeholder="Internal notes (optional)..."
              rows={5}
            />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={resetLeftForm}
              disabled={submittingForm || loading}
              style={{ flex: 1 }}
            >
              {leftFormMode === "EDIT" ? "Cancel edit" : "Clear"}
            </button>

            <button
              className={styles.primaryBtn}
              type="button"
              onClick={() => void handleSubmitLeftForm()}
              disabled={!isFormValid}
              style={{ flex: 1 }}
            >
              {submittingForm
                ? leftFormMode === "EDIT"
                  ? "Updating..."
                  : "Creating..."
                : leftFormMode === "EDIT"
                  ? "Update"
                  : "Create"}
            </button>
          </div>

          <div className={styles.muted} style={{ marginTop: 10, fontSize: 12 }}>
            {leftFormShortcutHint}
          </div>

          {siteErr ? (
            <div style={{ marginTop: 12, color: "#b42318", fontSize: 13 }}>
              <b>Site:</b> {siteErr}
            </div>
          ) : null}

          {err ? (
            <div style={{ marginTop: 8, color: "#b42318", fontSize: 13 }}>
              <b>Error:</b> {err}
            </div>
          ) : null}

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className={styles.badge}>Total: {stats.total}</div>
            <div className={styles.badge}>Active: {stats.active}</div>
            <div className={styles.badge}>VIP: {stats.vip}</div>
            <div className={styles.badge}>Revenue: {formatMoney(stats.revenue)}</div>
          </div>
        </aside>

        <div>
          <div className={styles.segmentBar}>
            <div className={styles.segmentBtn}>
              <button
                type="button"
                className={`${styles.segment} ${segment === "ALL" ? styles.segmentActive : ""}`}
                onClick={() => setSegment("ALL")}
              >
                <i className="bi bi-grid" />
                All
              </button>

              <button
                type="button"
                className={`${styles.segment} ${segment === "ACTIVE" ? styles.segmentActive : ""}`}
                onClick={() => setSegment("ACTIVE")}
              >
                <i className="bi bi-check-circle" />
                Active
              </button>

              <button
                type="button"
                className={`${styles.segment} ${segment === "VIP" ? styles.segmentActive : ""}`}
                onClick={() => setSegment("VIP")}
              >
                <i className="bi bi-stars" />
                VIP
              </button>

              <button
                type="button"
                className={`${styles.segment} ${segment === "INACTIVE" ? styles.segmentActive : ""}`}
                onClick={() => setSegment("INACTIVE")}
              >
                <i className="bi bi-dash-circle" />
                Inactive
              </button>
            </div>

            <div
              className={styles.badge}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}
            >
              <i className="bi bi-globe2" />

              <select
                value={selectedSiteId || ""}
                onChange={(event) => setSelectedSiteId(event.target.value)}
                disabled={sitesLoading}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "inherit",
                  fontWeight: 400,
                  cursor: sitesLoading ? "not-allowed" : "pointer",
                  maxWidth: 240,
                }}
              >
                <option value="">{sitesLoading ? "Loading sites..." : "Select site"}</option>

                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name ?? site.id} ({site.id})
                  </option>
                ))}
              </select>

              {sitesError ? <span style={{ marginLeft: 8, opacity: 0.8 }}>({sitesError})</span> : null}
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <i className={`bi bi-search ${styles.searchIcon}`} />
              <input
                className={styles.searchInput}
                placeholder="Search by name, email, phone, ID, tag…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query ? (
                <button className={styles.clearBtn} type="button" onClick={() => setQuery("")} aria-label="Clear">
                  <i className="bi bi-x-lg" />
                </button>
              ) : null}
            </div>

            <div className={styles.filters}>
              <div className={styles.selectWrap}>
                <i className={`bi bi-funnel ${styles.selectIcon}`} />
                <select
                  className={styles.select}
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as CustomerFilterStatus)}
                >
                  <option value="ANY">Status: Any</option>
                  <option value="ACTIVE">Status: Active</option>
                  <option value="VIP">Status: VIP</option>
                  <option value="INACTIVE">Status: Inactive</option>
                </select>
              </div>

              <div className={styles.selectWrap}>
                <i className={`bi bi-tags ${styles.selectIcon}`} />
                <select
                  className={styles.select}
                  value={tagFilter}
                  onChange={(event) => setTagFilter(event.target.value)}
                >
                  <option value="">Tag: Any</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.selectWrap}>
                <i className={`bi bi-sort-down ${styles.selectIcon}`} />
                <select
                  className={styles.select}
                  value={sort}
                  onChange={(event) => setSort(event.target.value as CustomerSort)}
                >
                  <option value="LAST_ORDER">Sort: Last order</option>
                  <option value="TOTAL_SPENT">Sort: Total spent</option>
                  <option value="CREATED_AT">Sort: Created</option>
                </select>
              </div>

              <button
                className={styles.secondaryBtn}
                disabled={loading || !nextCursor || !siteId}
                onClick={() => void loadMore()}
                type="button"
              >
                <i className="bi bi-arrow-down-circle" /> Load more
              </button>
            </div>
          </div>

          {selectedCount > 0 ? (
            <div className={styles.bulkBar}>
              <div className={styles.bulkLeft}>
                <span className={styles.bulkPill}>
                  <i className="bi bi-check2-square" />
                  {selectedCount} selected
                </span>

                <button className={styles.bulkBtn} type="button" onClick={clearSelection} disabled={loading}>
                  Clear
                </button>
              </div>

              <div className={styles.bulkRight}>
                <div className={styles.bulkGroup}>
                  <button
                    className={styles.bulkBtn}
                    type="button"
                    onClick={() => void bulkSetStatus("ACTIVE")}
                    disabled={loading || !siteId}
                  >
                    <i className="bi bi-check-circle" /> Set Active
                  </button>

                  <button
                    className={styles.bulkBtn}
                    type="button"
                    onClick={() => void bulkSetStatus("VIP")}
                    disabled={loading || !siteId}
                  >
                    <i className="bi bi-stars" /> Set VIP
                  </button>

                  <button
                    className={styles.bulkBtn}
                    type="button"
                    onClick={() => void bulkSetStatus("INACTIVE")}
                    disabled={loading || !siteId}
                  >
                    <i className="bi bi-dash-circle" /> Set Inactive
                  </button>
                </div>

                <button
                  className={`${styles.bulkBtn} ${styles.danger}`}
                  type="button"
                  onClick={handleDelete}
                  disabled={loading || !siteId}
                >
                  <i className="bi bi-trash3" /> Deactivate
                </button>
              </div>
            </div>
          ) : null}

          <div className={styles.tableCard}>
            <div className={styles.tableHead}>
              <div className={styles.tableHeadLeft}>
                <span className={styles.tableTitle}>Customers</span>
                <span className={styles.tableMeta}>
                  {!siteId
                    ? "Waiting for site..."
                    : loading
                      ? "Loading..."
                      : `${filteredCustomers.length} result${filteredCustomers.length === 1 ? "" : "s"}`}
                </span>
              </div>

              <div className={styles.tableHeadRight}>
                <button
                  className={styles.iconBtn}
                  type="button"
                  onClick={() => modal.success("Coming soon", "Columns builder will be added later.")}
                >
                  <i className="bi bi-layout-three-columns" />
                </button>

                <button
                  className={styles.iconBtn}
                  type="button"
                  onClick={() => modal.success("Coming soon", "Saved views will be added later.")}
                >
                  <i className="bi bi-bookmarks" />
                </button>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thCheck}>
                      <input
                        type="checkbox"
                        checked={
                          pagedCustomers.length > 0 &&
                          pagedCustomers.every((customer) => Boolean(selected[customer.id]))
                        }
                        onChange={(event) => toggleSelectAllOnPage(event.target.checked)}
                        aria-label="Select all on page"
                      />
                    </th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Tags</th>
                    <th className={styles.thNum}>Orders</th>
                    <th className={styles.thNum}>Total spent</th>
                    <th>Last order</th>
                    <th>Created</th>
                    <th className={styles.thActions}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={styles.emptyCell}>
                        <div className={styles.empty}>
                          <i className="bi bi-person-x" />
                          <div className={styles.emptyTitle}>No customers found</div>
                          <div className={styles.emptyHint}>
                            {!siteId
                              ? "Please select a site to load customers."
                              : "Try adjusting your search or filters."}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedCustomers.map((customer) => {
                      const meta = statusMeta[customer.status];

                      return (
                        <tr key={customer.id} className={styles.tr} onDoubleClick={() => void openDrawer(customer)}>
                          <td className={styles.tdCheck} onClick={(event) => event.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={Boolean(selected[customer.id])}
                              onChange={(event) => {
                                const checked = event.target.checked;
                                toggleSelect(customer.id, checked);

                                if (checked) {
                                  populateLeftFormForEdit(customer);
                                  nameInputRef.current?.focus();
                                } else if (editingCustomerId === customer.id) {
                                  resetLeftForm();
                                }
                              }}
                              aria-label={`Select customer ${customer.name}`}
                            />
                          </td>

                          <td className={styles.tdCustomer} onClick={() => void openDrawer(customer)}>
                            <div className={styles.customerCell}>
                              <div className={styles.avatar} aria-hidden="true">
                                {customer.name
                                  .trim()
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((part) => part[0]?.toUpperCase())
                                  .join("")}
                              </div>

                              <div className={styles.customerInfo}>
                                <div className={styles.customerName}>
                                  {customer.name} <span className={styles.muted}>•</span>{" "}
                                  <span className={styles.mono}>{customer.id}</span>
                                </div>

                                <div className={styles.customerSub}>
                                  <span className={styles.muted}>{customer.email || "—"}</span>
                                  {customer.phone ? (
                                    <>
                                      <span className={styles.dot}>•</span>
                                      <span className={styles.muted}>{customer.phone}</span>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className={`${styles.badge} ${styles[`badge_${customer.status}`]}`}>
                              <i className={`bi ${meta.icon}`} />
                              {meta.label}
                            </span>
                          </td>

                          <td>
                            <div className={styles.tagRow}>
                              {customer.tags.length === 0 ? <span className={styles.muted}>—</span> : null}
                              {customer.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className={styles.tag}>
                                  {tag}
                                </span>
                              ))}
                              {customer.tags.length > 2 ? (
                                <span className={styles.moreTag}>+{customer.tags.length - 2}</span>
                              ) : null}
                            </div>
                          </td>

                          <td className={styles.tdNum}>{customer.orders}</td>
                          <td className={styles.tdNum}>{formatMoney(customer.totalSpent)}</td>
                          <td>{formatDate(customer.lastOrderAt)}</td>
                          <td>{formatDate(customer.createdAt)}</td>

                          <td className={styles.tdActions}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  populateLeftFormForEdit(customer);
                                  nameInputRef.current?.focus();
                                }}
                                title="Edit in left form"
                              >
                                <i className="bi bi-pencil-square" />
                              </button>

                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void openDrawer(customer);
                                }}
                                title="Open details"
                              >
                                <i className="bi bi-eye" />
                              </button>

                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.danger}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteSingle(customer);
                                }}
                                title="Delete customer"
                              >
                                <i className="bi bi-trash3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <div className={styles.paginationLeft}>
                <span className={styles.muted}>
                  Page <b>{page}</b> / {pageCount}
                </span>
              </div>

              <div className={styles.paginationRight}>
                <button
                  className={styles.pageBtn}
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                >
                  <i className="bi bi-chevron-left" />
                  Prev
                </button>

                <button
                  className={styles.pageBtn}
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                >
                  Next
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

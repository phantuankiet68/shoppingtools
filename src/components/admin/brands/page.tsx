"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import cls from "@/styles/admin/brand/brand.module.css";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useBrandStore } from "@/store/brands/brand.store";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import type { BrandRow, LogoFilter, SortBy } from "@/features/brands/types";
import { useShallow } from "zustand/react/shallow";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminBrandCrudPage() {
  const { t } = useAdminI18n();
  const modal = useModal();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { currentSite, sites } = useAdminAuth();
  const {
    items,
    loading,
    saving,
    name,
    slug,
    description,
    logoUrl,
    logoFile,
    logoPreview,
    isDragging,
    searchText,
    logoFilter,
    sortBy,
    currentPage,
    pageSize,
    selectedBrandId,
    mode,
    setName,
    setSlug,
    setDescription,
    setLogoUrl,
    setLogoPreview,
    setIsDragging,
    setSearchText,
    setLogoFilter,
    setSortBy,
    setCurrentPage,
    setPageSize,
    setSelectedBrandId,
    resetLogoState,
    resetAll,
    loadBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    publishBrand,
    enterEditMode,
    pickLogoFile,
    derivedSlug,
  } = useBrandStore(
    useShallow((state) => ({
      items: state.items,
      loading: state.loading,
      saving: state.saving,
      name: state.name,
      slug: state.slug,
      description: state.description,
      logoUrl: state.logoUrl,
      logoFile: state.logoFile,
      logoPreview: state.logoPreview,
      isDragging: state.isDragging,
      searchText: state.searchText,
      logoFilter: state.logoFilter,
      sortBy: state.sortBy,
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      selectedBrandId: state.selectedBrandId,
      mode: state.mode,
      setName: state.setName,
      setSlug: state.setSlug,
      setDescription: state.setDescription,
      setLogoUrl: state.setLogoUrl,
      setLogoPreview: state.setLogoPreview,
      setIsDragging: state.setIsDragging,
      setSearchText: state.setSearchText,
      setLogoFilter: state.setLogoFilter,
      setSortBy: state.setSortBy,
      setCurrentPage: state.setCurrentPage,
      setPageSize: state.setPageSize,
      setSelectedBrandId: state.setSelectedBrandId,
      resetLogoState: state.resetLogoState,
      resetAll: state.resetAll,
      loadBrands: state.loadBrands,
      createBrand: state.createBrand,
      updateBrand: state.updateBrand,
      deleteBrand: state.deleteBrand,
      publishBrand: state.publishBrand,
      enterEditMode: state.enterEditMode,
      pickLogoFile: state.pickLogoFile,
      derivedSlug: state.derivedSlug,
    })),
  );

  const finalSlug = useMemo(() => {
    return derivedSlug();
  }, [derivedSlug, name, slug]);

  const previewSrc = logoPreview || logoUrl?.trim() || "";

  const [selectedSiteId, setSelectedSiteId] = React.useState(currentSite?.id || "");

  const selectedSite = useMemo(() => {
    return sites?.find((site) => site.id === selectedSiteId);
  }, [sites, selectedSiteId]);

  const filteredItems = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return [...items]
      .filter((brand) => {
        if (keyword) {
          const matched =
            brand.name.toLowerCase().includes(keyword) ||
            brand.slug.toLowerCase().includes(keyword) ||
            (brand.description || "").toLowerCase().includes(keyword) ||
            (brand.site?.domain || "").toLowerCase().includes(keyword) ||
            (brand.site?.name || "").toLowerCase().includes(keyword) ||
            brand.siteId.toLowerCase().includes(keyword);
          if (!matched) {
            return false;
          }
        }

        if (logoFilter === "with-logo" && !brand.logoUrl) {
          return false;
        }
        if (logoFilter === "no-logo" && brand.logoUrl) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name, "vi");
          case "name-desc":
            return b.name.localeCompare(a.name, "vi");
          case "oldest":
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          default:
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      });
  }, [items, searchText, logoFilter, sortBy]);

  const totalItems = filteredItems.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const pagination = useMemo(() => {
    const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;

    const end = Math.min(currentPage * pageSize, totalItems);

    return { start, end };
  }, [currentPage, pageSize, totalItems]);

  useEffect(() => {
    if (currentSite?.id && currentSite.id !== selectedSiteId) {
      setSelectedSiteId(currentSite.id);
    }
  }, [currentSite?.id]);

  useEffect(() => {
    if (!selectedSiteId) {
      return;
    }

    const controller = new AbortController();
    loadBrands(selectedSiteId, controller.signal).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      modal.error(t("brands.modal.loadFailed"), error instanceof Error ? error.message : t("brands.modal.loadFailed"));
    });

    return () => {
      controller.abort();
    };
  }, [selectedSiteId, loadBrands, modal, t]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);

    setLogoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logoFile, setLogoPreview]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  /* HANDLERS */
  const handleLoadBrands = useCallback(() => {
    if (!selectedSiteId || loading) {
      return;
    }

    loadBrands(selectedSiteId).catch((error: unknown) => {
      modal.error(t("brands.modal.loadFailed"), error instanceof Error ? error.message : t("brands.modal.loadFailed"));
    });
  }, [loadBrands, selectedSiteId, modal, t]);

  const handlePrimarySubmit = useCallback(async () => {
    try {
      if (mode === "edit") {
        await updateBrand(selectedSiteId);
        modal.success(t("brands.modal.success"), t("brands.modal.updatedSuccess").replace("{name}", name.trim()));
        return;
      }
      await createBrand(selectedSiteId);
      modal.success(t("brands.modal.success"), t("brands.modal.createdSuccess").replace("{name}", name.trim()));
    } catch (error: unknown) {
      modal.error(
        mode === "edit" ? t("brands.modal.updateFailed") : t("brands.modal.createFailed"),
        error instanceof Error
          ? error.message
          : mode === "edit"
            ? t("brands.modal.updateFailed")
            : t("brands.modal.createFailed"),
      );
    }
  }, [mode, updateBrand, selectedSiteId, modal, createBrand, name, t]);

  const handleDelete = useCallback(
    async (brand: BrandRow) => {
      modal.confirmDelete(
        t("brands.modal.deleteBrand"),
        t("brands.modal.deleteBrandConfirm").replace("{name}", brand.name),
        async () => {
          try {
            setSelectedBrandId(brand.id);
            await deleteBrand();
            modal.success(t("brands.modal.success"), t("brands.modal.deletedSuccess").replace("{name}", brand.name));
          } catch (error: unknown) {
            modal.error(
              t("brands.modal.deleteFailed"),
              error instanceof Error ? error.message : t("brands.modal.deleteFailed"),
            );
          }
        },
      );
    },
    [modal, deleteBrand, setSelectedBrandId, t],
  );

  const handlePublish = useCallback(async () => {
    try {
      await publishBrand();
      modal.success(t("brands.modal.success"), t("brands.modal.publishedSuccess").replace("{name}", name.trim()));
    } catch (error: unknown) {
      modal.error(
        t("brands.modal.publishFailed"),
        error instanceof Error ? error.message : t("brands.modal.publishFailed"),
      );
    }
  }, [publishBrand, modal, name, t]);

  const handlePickLogoFile = useCallback(
    (file: File | null) => {
      const error = pickLogoFile(file);
      if (error) {
        modal.error(t("brands.modal.invalidFile"), error);
      }
    },
    [pickLogoFile, modal, t],
  );

  const handleClearLogo = useCallback(() => {
    if (saving) {
      return;
    }
    setLogoUrl("");
    resetLogoState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [saving, setLogoUrl, resetLogoState]);

  const onF10 = useCallback(() => {
    void handlePrimarySubmit();
  }, [handlePrimarySubmit]);

  const onF11 = useCallback(() => {
    void handlePublish();
  }, [handlePublish]);

  const functionKeyActions = useMemo(
    () => ({
      F10: onF10,
      F11: onF11,
    }),
    [onF10, onF11],
  );

  usePageFunctionKeys(functionKeyActions);

  return (
    <div className={cls.page}>
      <div className={cls.bgOrbA} />
      <div className={cls.bgOrbB} />
      <div className={cls.shell}>
        <div className={cls.layout}>
          <aside className={cls.sidebar}>
            <div className={cls.composeCard}>
              <div className={cls.composeGlow} />
              <div className={cls.composeHead}>
                <div className={cls.heroLeft}>
                  <div className={cls.eyebrow}>
                    <span className={cls.eyebrowDot} />
                    {t("brands.form.commerceBrand")}
                  </div>
                </div>
                <button className={cls.normalBtn} type="button" onClick={handleLoadBrands} disabled={loading}>
                  <i className={`bi bi-arrow-clockwise ${loading ? cls.spin : ""}`} />
                  <span>{t("brands.actions.syncData")}</span>
                </button>
              </div>

              <div className={cls.form}>
                <label className={cls.field}>
                  <span className={cls.label}>{t("brands.form.site")}</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-globe2 ${cls.inputIcon}`} />
                    <select
                      className={cls.select}
                      value={selectedSiteId || ""}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      disabled={saving}
                    >
                      <option value="">{t("brands.form.selectSite")}</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name ?? site.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={cls.helper}>
                    {selectedSite
                      ? `${selectedSite.name ?? t("brands.form.site")}${
                          selectedSite.domain ? ` • ${selectedSite.domain}` : ""
                        }`
                      : t("brands.form.selectSite")}
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>{t("brands.form.brandName")}</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-bookmark-star ${cls.inputIcon}`} />
                    <input
                      className={cls.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("brands.form.brandNamePlaceholder")}
                      disabled={saving}
                    />
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>{t("brands.form.slug")}</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-link-45deg ${cls.inputIcon}`} />
                    <input
                      className={cls.input}
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder={finalSlug || t("brands.form.autoGenerated")}
                      disabled={saving}
                    />
                  </div>

                  <div className={cls.helper}>
                    {t("brands.form.finalSlug")}: <code className={cls.code}>{finalSlug || "-"}</code>
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>{t("brands.form.description")}</span>

                  <div className={cls.textareaShell}>
                    <textarea
                      className={cls.textarea}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("brands.form.descriptionPlaceholder")}
                      rows={4}
                      disabled={saving}
                    />
                  </div>
                </label>

                <div className={cls.field}>
                  <span className={cls.label}>{t("brands.form.logo")}</span>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();

                      if (!saving) setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();

                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();

                      setIsDragging(false);

                      if (saving) return;

                      const file = e.dataTransfer.files?.[0] || null;

                      handlePickLogoFile(file);
                    }}
                    onClick={() => {
                      if (!saving) {
                        fileInputRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !saving) {
                        e.preventDefault();

                        fileInputRef.current?.click();
                      }
                    }}
                    className={[
                      cls.uploadDropzone,
                      isDragging ? cls.uploadDropzoneDragging : "",
                      saving ? cls.uploadDropzoneDisabled : "",
                    ].join(" ")}
                    aria-disabled={saving}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={saving}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;

                        handlePickLogoFile(file);
                      }}
                    />

                    {previewSrc ? (
                      <>
                        <div className={cls.uploadPreviewBox}>
                          <Image
                            src={previewSrc}
                            alt="logo preview"
                            fill
                            sizes="140px"
                            className={cls.uploadPreviewImage}
                          />
                        </div>
                        <div className={cls.uploadPreviewName}>{logoFile ? logoFile.name : logoUrl}</div>
                        <div className={cls.uploadActions}>
                          <button
                            type="button"
                            className={cls.normalBtnImage}
                            onClick={(e) => {
                              e.stopPropagation();

                              if (!saving) {
                                fileInputRef.current?.click();
                              }
                            }}
                            disabled={saving}
                          >
                            <i className="bi bi-upload" />
                            <span>{t("brands.actions.chooseAnotherImage")}</span>
                          </button>

                          <button
                            type="button"
                            className={cls.normalBtnImage}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearLogo();
                            }}
                            disabled={saving}
                          >
                            <i className="bi bi-trash" />
                            <span>{t("brands.actions.removeImage")}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <i className={`bi bi-file-earmark-plus ${cls.uploadIcon}`} />
                        <div className={cls.uploadTitle}>{t("brands.form.dropFileHere")}</div>
                        <div className={cls.uploadOr}>{t("brands.form.or")}</div>
                        <div className={cls.uploadBrowse}>{t("brands.actions.browse")}</div>
                        <div className={cls.uploadHint}>{t("brands.form.uploadHint")}</div>
                      </>
                    )}
                  </div>
                </div>

                <div className={cls.formActions}>
                  <button className={cls.primaryBtn} type="button" onClick={handlePrimarySubmit} disabled={saving}>
                    {saving ? (
                      <>
                        <span className={cls.buttonSpinner} />
                        <span>
                          {mode === "edit" ? t("brands.actions.updatingBrand") : t("brands.actions.creatingBrand")}
                        </span>
                      </>
                    ) : (
                      <>
                        <i className={`bi ${mode === "edit" ? "bi-check2-circle" : "bi-stars"}`} />
                        <span>
                          {mode === "edit" ? t("brands.actions.updateBrand") : t("brands.actions.createBrand")}
                        </span>
                      </>
                    )}
                  </button>

                  <button className={cls.normalBtnImage} type="button" onClick={resetAll} disabled={saving}>
                    <i className="bi bi-x-circle" />
                    <span>{t("brands.actions.cancel")}</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <section className={cls.workspace}>
            <div className={cls.workspaceCard}>
              <div className={cls.workspaceHead}>
                <div className={cls.workspaceTop}>
                  <div className={cls.toolbarCard}>
                    <div className={cls.searchWrap}>
                      <i className={`bi bi-search ${cls.searchIcon}`} />
                      <input
                        className={cls.searchInput}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder={t("brands.filters.searchPlaceholder")}
                      />
                      {searchText.trim() && (
                        <button
                          type="button"
                          className={cls.clearSearchBtn}
                          onClick={() => setSearchText("")}
                          aria-label={t("brands.filters.clearSearch")}
                        >
                          <i className="bi bi-x-lg" />
                        </button>
                      )}
                    </div>

                    <div className={cls.toolbarFilters}>
                      <select
                        className={cls.toolbarSelect}
                        value={logoFilter}
                        onChange={(e) => setLogoFilter(e.target.value as LogoFilter)}
                      >
                        <option value="all">{t("brands.filters.allLogos")}</option>
                        <option value="with-logo">{t("brands.filters.withLogo")}</option>
                        <option value="no-logo">{t("brands.filters.noLogo")}</option>
                      </select>

                      <select
                        className={cls.toolbarSelect}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                      >
                        <option value="newest">{t("brands.filters.newest")}</option>
                        <option value="oldest">{t("brands.filters.oldest")}</option>
                        <option value="name-asc">{t("brands.filters.nameAsc")}</option>
                        <option value="name-desc">{t("brands.filters.nameDesc")}</option>
                      </select>

                      <select
                        className={cls.toolbarSelect}
                        value={String(pageSize)}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value="5">5 / page</option>
                        <option value="8">8 / page</option>
                        <option value="10">10 / page</option>
                        <option value="20">20 / page</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {filteredItems.length === 0 && !loading ? (
                <div className={cls.emptyState}>
                  <div className={cls.emptyArt}>
                    <div className={cls.emptyCircleA} />
                    <div className={cls.emptyCircleB} />
                    <div className={cls.emptyIcon}>
                      <i className="bi bi-bookmark-heart" />
                    </div>
                  </div>

                  <div className={cls.emptyTitle}>{t("brands.empty.title")}</div>

                  <div className={cls.emptyText}>{t("brands.empty.description")}</div>
                </div>
              ) : (
                <div className={cls.tableWrap}>
                  <div className={`${cls.row} ${cls.rowHead}`}>
                    <div>{t("brands.table.brand")}</div>
                    <div>{t("brands.form.slug")}</div>
                    <div>{t("brands.table.site")}</div>
                    <div>{t("brands.table.created")}</div>
                    <div>{t("brands.table.actions")}</div>
                  </div>

                  {loading ? (
                    <div className={cls.loadingBox}>
                      <div className={cls.loadingBar} />
                      <div className={cls.loadingBar} />
                      <div className={cls.loadingBar} />
                    </div>
                  ) : (
                    paginatedItems.map((brand: BrandRow) => {
                      const isSelected = selectedBrandId === brand.id;

                      return (
                        <div
                          key={brand.id}
                          className={`${cls.row} ${isSelected ? cls.rowSelected : ""}`}
                          role="button"
                          tabIndex={0}
                          aria-selected={isSelected}
                          onClick={() => {
                            if (selectedBrandId !== brand.id) {
                              setSelectedBrandId(brand.id);
                            }
                            enterEditMode(brand);
                            setSelectedSiteId(brand.siteId || "");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (selectedBrandId !== brand.id) {
                                setSelectedBrandId(brand.id);
                              }
                              enterEditMode(brand);
                              setSelectedSiteId(brand.siteId || "");
                            }
                          }}
                        >
                          <div className={cls.brandCell}>
                            <div className={cls.brandAvatar}>
                              {brand.logoUrl ? (
                                <Image
                                  src={brand.logoUrl}
                                  alt={brand.name}
                                  fill
                                  sizes="52px"
                                  className={cls.brandAvatarImage}
                                />
                              ) : (
                                <div className={cls.brandFallback}>
                                  <i className="bi bi-image" />
                                </div>
                              )}
                            </div>

                            <div className={cls.brandBody}>
                              <div className={cls.brandTop}>
                                <div className={cls.brandName}>{brand.name}</div>
                                <span className={cls.badge}>#{brand.id.slice(0, 8)}</span>
                                {isSelected && <span className={cls.badge}>{t("brands.table.editing")}</span>}
                              </div>

                              <div className={cls.brandMeta}>
                                {brand.description?.trim() ? brand.description : t("brands.table.noDescription")}
                              </div>
                            </div>
                          </div>

                          <div className={cls.slugCell}>
                            <code className={cls.code}>/{brand.slug}</code>
                          </div>

                          <div className={cls.siteCell}>
                            <div className={cls.siteName}>
                              <i className="bi bi-globe-americas" />

                              <span>{brand.site?.name || brand.siteId}</span>
                            </div>

                            <div className={cls.siteDomain}>{brand.site?.domain || brand.siteId}</div>
                          </div>

                          <div className={cls.dateCell}>
                            <div className={cls.dateCreated}>{formatDate(brand.createdAt)}</div>

                            <div className={cls.dateSub}>
                              {t("brands.table.updated")}: {formatDate(brand.updatedAt)}
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <button
                              type="button"
                              className={cls.secondaryBtn}
                              onClick={(e) => {
                                e.stopPropagation();

                                handleDelete(brand);
                              }}
                            >
                              <i className="bi bi-trash" />

                              <span>{t("brands.actions.delete")}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {!loading && totalItems > 0 && (
                <div className={cls.paginationBar}>
                  <div className={cls.paginationInfo}>
                    {t("brands.pagination.showing")} <strong>{pagination.start}</strong>-
                    <strong>{pagination.end}</strong>
                  </div>

                  <div className={cls.paginationControls}>
                    <button
                      type="button"
                      className={cls.pageBtn}
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-double-left" />
                    </button>

                    <button
                      type="button"
                      className={cls.pageBtn}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left" />
                    </button>

                    <div className={cls.pageIndicator}>
                      {t("brands.pagination.page")} <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
                    </div>

                    <button
                      type="button"
                      className={cls.pageBtn}
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <i className="bi bi-chevron-right" />
                    </button>

                    <button
                      type="button"
                      className={cls.pageBtn}
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="bi bi-chevron-double-right" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

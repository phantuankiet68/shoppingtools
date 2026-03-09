"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import cls from "@/styles/admin/commerce/brand/brand.module.css";
import { useSiteStore } from "@/store/site/site.store";
import { useBrandStore } from "@/store/commerce/brands/brand.store";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";
import { BRANDS_MESSAGES } from "@/features/commerce/brands/messages";
import type { BrandRow, LogoFilter, SiteOption, SortBy } from "@/features/commerce/brands/types";

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminBrandCrudPage() {
  const modal = useModal();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sites = useSiteStore((state) => state.sites);
  const sitesLoading = useSiteStore((state) => state.loading);
  const sitesErr = useSiteStore((state) => state.err);
  const selectedSiteId = useSiteStore((state) => state.siteId);
  const setSelectedSiteId = useSiteStore((state) => state.setSiteId);
  const hydrateFromStorage = useSiteStore((state) => state.hydrateFromStorage);
  const loadSites = useSiteStore((state) => state.loadSites);

  const items = useBrandStore((state) => state.items);
  const loading = useBrandStore((state) => state.loading);
  const saving = useBrandStore((state) => state.saving);

  const name = useBrandStore((state) => state.name);
  const slug = useBrandStore((state) => state.slug);
  const description = useBrandStore((state) => state.description);
  const logoUrl = useBrandStore((state) => state.logoUrl);

  const logoFile = useBrandStore((state) => state.logoFile);
  const logoPreview = useBrandStore((state) => state.logoPreview);
  const isDragging = useBrandStore((state) => state.isDragging);

  const searchText = useBrandStore((state) => state.searchText);
  const logoFilter = useBrandStore((state) => state.logoFilter);
  const sortBy = useBrandStore((state) => state.sortBy);
  const currentPage = useBrandStore((state) => state.currentPage);
  const pageSize = useBrandStore((state) => state.pageSize);

  const selectedBrandId = useBrandStore((state) => state.selectedBrandId);
  const mode = useBrandStore((state) => state.mode);

  const setName = useBrandStore((state) => state.setName);
  const setSlug = useBrandStore((state) => state.setSlug);
  const setDescription = useBrandStore((state) => state.setDescription);
  const setLogoUrl = useBrandStore((state) => state.setLogoUrl);
  const setLogoPreview = useBrandStore((state) => state.setLogoPreview);
  const setIsDragging = useBrandStore((state) => state.setIsDragging);
  const setSearchText = useBrandStore((state) => state.setSearchText);
  const setLogoFilter = useBrandStore((state) => state.setLogoFilter);
  const setSortBy = useBrandStore((state) => state.setSortBy);
  const setCurrentPage = useBrandStore((state) => state.setCurrentPage);
  const setPageSize = useBrandStore((state) => state.setPageSize);
  const setSelectedBrandId = useBrandStore((state) => state.setSelectedBrandId);

  const resetLogoState = useBrandStore((state) => state.resetLogoState);
  const resetAll = useBrandStore((state) => state.resetAll);

  const loadBrands = useBrandStore((state) => state.loadBrands);
  const createBrand = useBrandStore((state) => state.createBrand);
  const updateBrand = useBrandStore((state) => state.updateBrand);
  const deleteBrand = useBrandStore((state) => state.deleteBrand);
  const publishBrand = useBrandStore((state) => state.publishBrand);
  const enterEditMode = useBrandStore((state) => state.enterEditMode);
  const pickLogoFile = useBrandStore((state) => state.pickLogoFile);
  const derivedSlug = useBrandStore((state) => state.derivedSlug);

  const finalSlug = derivedSlug();

  const selectedSite = useMemo(() => {
    return sites.find((site) => site.id === selectedSiteId);
  }, [sites, selectedSiteId]);

  const selectedBrand = useMemo(() => {
    return items.find((brand) => brand.id === selectedBrandId) ?? null;
  }, [items, selectedBrandId]);

  const withLogoCount = useMemo(() => {
    return items.filter((brand) => Boolean(brand.logoUrl)).length;
  }, [items]);

  const filteredItems = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    let nextItems = [...items];

    if (keyword) {
      nextItems = nextItems.filter((brand) => {
        return (
          brand.name.toLowerCase().includes(keyword) ||
          brand.slug.toLowerCase().includes(keyword) ||
          (brand.description || "").toLowerCase().includes(keyword) ||
          (brand.site?.domain || "").toLowerCase().includes(keyword) ||
          (brand.site?.name || "").toLowerCase().includes(keyword) ||
          brand.siteId.toLowerCase().includes(keyword)
        );
      });
    }

    if (logoFilter === "with-logo") {
      nextItems = nextItems.filter((brand) => Boolean(brand.logoUrl));
    }

    if (logoFilter === "no-logo") {
      nextItems = nextItems.filter((brand) => !brand.logoUrl);
    }

    nextItems.sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name, "vi");
      }

      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name, "vi");
      }

      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }

      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return nextItems;
  }, [items, searchText, logoFilter, sortBy]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalItems);

  const previewSrc = useMemo(() => {
    return logoPreview || logoUrl.trim() || "";
  }, [logoPreview, logoUrl]);

  useEffect(() => {
    hydrateFromStorage();
    loadSites();
  }, [hydrateFromStorage, loadSites]);

  useEffect(() => {
    if (!selectedSiteId && sites.length > 0) {
      setSelectedSiteId(sites[0].id);
    }
  }, [selectedSiteId, sites, setSelectedSiteId]);

  useEffect(() => {
    const controller = new AbortController();

    loadBrands(selectedSiteId, controller.signal).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      modal.error(
        BRANDS_MESSAGES.common.loadFailedTitle,
        error instanceof Error ? error.message : BRANDS_MESSAGES.common.loadFailedTitle,
      );
    });

    return () => {
      controller.abort();
    };
  }, [selectedSiteId, loadBrands, modal]);

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

  const handleLoadBrands = useCallback(() => {
    loadBrands(selectedSiteId).catch((error: unknown) => {
      modal.error(
        BRANDS_MESSAGES.common.loadFailedTitle,
        error instanceof Error ? error.message : BRANDS_MESSAGES.common.loadFailedTitle,
      );
    });
  }, [loadBrands, selectedSiteId, modal]);

  const handlePrimarySubmit = useCallback(async () => {
    try {
      if (mode === "edit") {
        await updateBrand(selectedSiteId);
        modal.success(BRANDS_MESSAGES.common.successTitle, BRANDS_MESSAGES.success.updated(name.trim()));
        return;
      }

      await createBrand(selectedSiteId);
      modal.success(BRANDS_MESSAGES.common.successTitle, BRANDS_MESSAGES.success.created(name.trim()));
    } catch (error: unknown) {
      modal.error(
        mode === "edit" ? BRANDS_MESSAGES.common.updateFailedTitle : BRANDS_MESSAGES.common.createFailedTitle,
        error instanceof Error
          ? error.message
          : mode === "edit"
            ? BRANDS_MESSAGES.common.updateFailedTitle
            : BRANDS_MESSAGES.common.createFailedTitle,
      );
    }
  }, [mode, updateBrand, selectedSiteId, modal, createBrand, name]);

  const handleDelete = useCallback(() => {
    if (!selectedBrand) {
      modal.error(BRANDS_MESSAGES.common.missingBrandTitle, BRANDS_MESSAGES.validation.selectBrandFirst);
      return;
    }

    modal.confirmDelete(
      BRANDS_MESSAGES.modal.deleteTitle,
      BRANDS_MESSAGES.modal.deleteDescription(selectedBrand.name),
      async () => {
        try {
          await deleteBrand();
          modal.success(BRANDS_MESSAGES.common.successTitle, BRANDS_MESSAGES.success.deleted(selectedBrand.name));
        } catch (error: unknown) {
          modal.error(
            BRANDS_MESSAGES.common.deleteFailedTitle,
            error instanceof Error ? error.message : BRANDS_MESSAGES.common.deleteFailedTitle,
          );
        }
      },
    );
  }, [selectedBrand, modal, deleteBrand]);

  const handlePublish = useCallback(async () => {
    if (!selectedBrand) {
      modal.error(BRANDS_MESSAGES.common.missingBrandTitle, BRANDS_MESSAGES.validation.selectBrandFirst);
      return;
    }

    try {
      await publishBrand();
      modal.success(BRANDS_MESSAGES.common.successTitle, BRANDS_MESSAGES.success.published(selectedBrand.name));
    } catch (error: unknown) {
      modal.error(
        BRANDS_MESSAGES.common.publishFailedTitle,
        error instanceof Error ? error.message : BRANDS_MESSAGES.common.publishFailedTitle,
      );
    }
  }, [selectedBrand, publishBrand, modal]);

  const handleEnterEditMode = useCallback(() => {
    if (!selectedBrand) {
      modal.error(BRANDS_MESSAGES.common.missingBrandTitle, BRANDS_MESSAGES.validation.selectBrandFirst);
      return;
    }

    enterEditMode(selectedBrand);
    setSelectedSiteId(selectedBrand.siteId || "");

    modal.success(BRANDS_MESSAGES.common.editModeTitle, BRANDS_MESSAGES.modal.editModeDescription(selectedBrand.name));
  }, [selectedBrand, enterEditMode, setSelectedSiteId, modal]);

  const handlePickLogoFile = useCallback(
    (file: File | null) => {
      const error = pickLogoFile(file);

      if (error) {
        modal.error(BRANDS_MESSAGES.common.invalidFileTitle, error);
      }
    },
    [pickLogoFile, modal],
  );

  const handleRowDoubleClick = useCallback(
    (brand: BrandRow) => {
      setSelectedBrandId(brand.id);
      enterEditMode(brand);
      setSelectedSiteId(brand.siteId || "");
    },
    [setSelectedBrandId, enterEditMode, setSelectedSiteId],
  );

  const handleClearLogo = useCallback(() => {
    if (saving) return;

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
      F3: handleDelete,
      F6: handleEnterEditMode,
      F10: onF10,
      F11: onF11,
    }),
    [handleDelete, handleEnterEditMode, onF10, onF11],
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
                    Commerce brand
                  </div>
                </div>

                <button className={cls.secondaryBtn} type="button" onClick={handleLoadBrands} disabled={loading}>
                  <i className={`bi bi-arrow-clockwise ${loading ? cls.spin : ""}`} />
                  <span>Sync data</span>
                </button>
              </div>

              <div className={cls.form}>
                <label className={cls.field}>
                  <span className={cls.label}>Site</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-globe2 ${cls.inputIcon}`} />
                    <select
                      className={cls.select}
                      value={selectedSiteId || ""}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      disabled={sitesLoading || saving}
                    >
                      <option value="">{sitesLoading ? "Loading sites..." : "Select site"}</option>
                      {sites.map((site: SiteOption) => (
                        <option key={site.id} value={site.id}>
                          {site.name ?? site.id} ({site.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={cls.helper}>
                    {sitesErr
                      ? `Site error: ${sitesErr}`
                      : selectedSite
                        ? `${selectedSite.name ?? "Site"}${selectedSite.domain ? ` • ${selectedSite.domain}` : ""}`
                        : BRANDS_MESSAGES.helper.sitePlaceholder}
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>Brand name</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-bookmark-star ${cls.inputIcon}`} />
                    <input
                      className={cls.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Sakura"
                      disabled={saving}
                    />
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>Slug</span>
                  <div className={cls.inputShell}>
                    <i className={`bi bi-link-45deg ${cls.inputIcon}`} />
                    <input
                      className={cls.input}
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder={finalSlug || "auto-generated"}
                      disabled={saving}
                    />
                  </div>

                  <div className={cls.helper}>
                    Final slug: <code className={cls.code}>{finalSlug || "-"}</code>
                  </div>
                </label>

                <label className={cls.field}>
                  <span className={cls.label}>Description</span>
                  <div className={cls.textareaShell}>
                    <textarea
                      className={cls.textarea}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả ngắn về brand..."
                      rows={4}
                      disabled={saving}
                    />
                  </div>
                </label>

                <div className={cls.field}>
                  <span className={cls.label}>Logo</span>

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

                        <div className={cls.uploadPreviewTitle}>
                          {logoFile ? "Ảnh logo đã được chọn" : "Logo hiện tại"}
                        </div>

                        <div className={cls.uploadPreviewName}>{logoFile ? logoFile.name : logoUrl}</div>

                        <div className={cls.uploadActions}>
                          <button
                            type="button"
                            className={cls.secondaryBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!saving) {
                                fileInputRef.current?.click();
                              }
                            }}
                            disabled={saving}
                          >
                            <i className="bi bi-upload" />
                            <span>Chọn ảnh khác</span>
                          </button>

                          <button
                            type="button"
                            className={cls.secondaryBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearLogo();
                            }}
                            disabled={saving}
                          >
                            <i className="bi bi-trash" />
                            <span>Xóa ảnh</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <i className={`bi bi-file-earmark-plus ${cls.uploadIcon}`} />
                        <div className={cls.uploadTitle}>Drop file here</div>
                        <div className={cls.uploadOr}>or</div>
                        <div className={cls.uploadBrowse}>Browse</div>
                        <div className={cls.uploadHint}>Supports JPG, PNG, WEBP, GIF, SVG</div>
                      </>
                    )}
                  </div>

                  <div className={cls.helper}>
                    Upload the logo and <code className={cls.code}>logoUrl</code> will be saved automatically.
                  </div>
                </div>

                <button className={cls.primaryBtn} type="button" onClick={handlePrimarySubmit} disabled={saving}>
                  {saving ? (
                    <>
                      <span className={cls.buttonSpinner} />
                      <span>{mode === "edit" ? "Updating brand..." : "Creating brand..."}</span>
                    </>
                  ) : (
                    <>
                      <i className={`bi ${mode === "edit" ? "bi-check2-circle" : "bi-stars"}`} />
                      <span>{mode === "edit" ? "Update brand" : "Create brand"}</span>
                    </>
                  )}
                </button>

                {mode === "edit" && (
                  <button className={cls.secondaryBtn} type="button" onClick={resetAll} disabled={saving}>
                    <i className="bi bi-x-circle" />
                    <span>Cancel edit</span>
                  </button>
                )}
              </div>
            </div>
          </aside>

          <section className={cls.workspace}>
            <div className={cls.workspaceCard}>
              <div className={cls.workspaceHead}>
                <div className={cls.workspaceTop}>
                  <div className={cls.workspaceIntro}>
                    <div className={cls.statsRow}>
                      <div className={cls.statCard}>
                        <div className={cls.statLabel}>Total brands</div>
                        <div className={cls.statValue}>{items.length}</div>
                      </div>

                      <div className={cls.statCard}>
                        <div className={cls.statLabel}>Filtered</div>
                        <div className={cls.statValue}>{filteredItems.length}</div>
                      </div>

                      <div className={cls.statCard}>
                        <div className={cls.statLabel}>With logo</div>
                        <div className={cls.statValue}>{withLogoCount}</div>
                      </div>
                    </div>
                  </div>

                  <div className={cls.toolbarCard}>
                    <div className={cls.searchWrap}>
                      <i className={`bi bi-search ${cls.searchIcon}`} />
                      <input
                        className={cls.searchInput}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search by name, slug, description, domain..."
                      />

                      {searchText.trim() && (
                        <button
                          type="button"
                          className={cls.clearSearchBtn}
                          onClick={() => setSearchText("")}
                          aria-label="Clear search"
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
                        <option value="all">All logos</option>
                        <option value="with-logo">With logo</option>
                        <option value="no-logo">No logo</option>
                      </select>

                      <select
                        className={cls.toolbarSelect}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                      </select>

                      <select
                        className={cls.toolbarSelect}
                        value={String(pageSize)}
                        onChange={(e) => setPageSize(Number(e.target.value))}
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

                  <div className={cls.emptyTitle}>No matching brands found</div>
                  <div className={cls.emptyText}>
                    Please create the first brand in the left pane or try changing the search keywords.
                  </div>
                </div>
              ) : (
                <div className={cls.tableWrap}>
                  <div className={`${cls.row} ${cls.rowHead}`}>
                    <div>Brand</div>
                    <div>Slug</div>
                    <div>Site</div>
                    <div>Created</div>
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
                          onClick={() => setSelectedBrandId(brand.id)}
                          onDoubleClick={() => handleRowDoubleClick(brand)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedBrandId(brand.id);
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
                                {isSelected && <span className={cls.badge}>Selected</span>}
                              </div>

                              <div className={cls.brandMeta}>
                                {brand.description?.trim() ? brand.description : BRANDS_MESSAGES.helper.noDescription}
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
                            <div className={cls.dateSub}>Updated: {formatDate(brand.updatedAt)}</div>
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
                    Showing <strong>{pageStart}</strong>-<strong>{pageEnd}</strong> of <strong>{totalItems}</strong>{" "}
                    brands
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
                      Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
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

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import Image from "next/image";
import styles from "@/styles/admin/images/images.module.css";
import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

type UiTag = "NEW" | "HDR" | "AI" | "FAVORITE" | "COVER" | "BANNER" | "AVATAR" | "PRODUCT";

type ApiImageItem = {
  id: string;
  originalName: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  tag: UiTag | null;
  createdAt: string;
  fileName: string;
  userId: string;
  url: string;
  folderId?: string | null;
};

type ImgItem = {
  id: string;
  name: string;
  size: string;
  dim: string;
  updated: string;
  createdAt: string;
  tag?: UiTag;
  url: string;
  folderId?: string | null;
};

type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return date;
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminImagesClient() {
  const { t } = useAdminI18n();
  const modal = useModal();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "recent" | "tagged">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [items, setItems] = useState<ImgItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [uploadTag, setUploadTag] = useState<UiTag | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const normalizeError = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
  };

  const clearPreview = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }, [previewUrl]);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/images/image-folders", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error();
      }
      const json = (await res.json()) as {
        items: FolderItem[];
      };
      startTransition(() => {
        setFolders(json.items ?? []);
      });
    } catch {
      startTransition(() => {
        setFolders([]);
      });
    }
  }, []);

  const fetchImages = useCallback(async () => {
    startTransition(() => {
      setLoading(true);
      setErr(null);
    });
    try {
      const qs = new URLSearchParams();
      if (q.trim()) {
        qs.set("q", q.trim());
      }
      qs.set("filter", filter);
      qs.set("folderId", activeFolderId || "root");
      const res = await fetch(`/api/admin/images?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(t("images.messages.loadFailed"));
      }
      const json = (await res.json()) as {
        items: ApiImageItem[];
      };
      const mapped: ImgItem[] = (json.items ?? []).map((x) => ({
        id: x.id,
        name: x.originalName,
        size: formatBytes(x.sizeBytes),
        dim: x.width && x.height ? `${x.width}×${x.height}` : "—",
        updated: formatDate(x.createdAt),
        createdAt: x.createdAt,
        tag: x.tag ?? undefined,
        url: x.url,
        folderId: x.folderId ?? null,
      }));
      startTransition(() => {
        setItems(mapped);
      });
    } catch (error: unknown) {
      startTransition(() => {
        setErr(normalizeError(error, t("images.messages.loadFailed")));
      });
    } finally {
      startTransition(() => {
        setLoading(false);
      });
    }
  }, [q, filter, activeFolderId, t]);

  useEffect(() => {
    void fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    void fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const shown = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return items
      .filter((item) => (keyword ? item.name.toLowerCase().includes(keyword) : true))
      .filter((item) => {
        if (filter === "tagged") {
          return !!item.tag;
        }
        if (filter === "recent") {
          const created = new Date(item.createdAt);
          const diff = Date.now() - created.getTime();
          return diff <= 1000 * 60 * 60 * 24 * 7;
        }
        return true;
      });
  }, [items, q, filter]);

  function isImageFile(file: File) {
    return file.type.startsWith("image/");
  }

  function setFileWithPreview(file: File | null) {
    clearPreview();
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && !isImageFile(file)) {
      modal.error(t("common.error"), t("images.messages.onlyImages"));
      return;
    }
    setErr(null);
    setFileWithPreview(file);
  }

  function onDropFiles(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    if (!isImageFile(file)) {
      modal.error(t("common.error"), t("images.messages.onlyImages"));
      return;
    }
    setErr(null);
    setFileWithPreview(file);
  }

  async function onUpload() {
    if (!selectedFile) {
      modal.error(t("common.error"), t("images.messages.noFile"));
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      if (uploadTag) {
        fd.append("tag", uploadTag);
      }
      if (activeFolderId) {
        fd.append("folderId", activeFolderId);
      }
      const res = await fetch("/api/admin/images", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        throw new Error(t("images.messages.uploadFailed"));
      }
      modal.success(t("common.success"), t("images.messages.uploadSuccess"));
      clearPreview();
      setUploadTag("");
      await fetchImages();
    } catch (error: unknown) {
      modal.error(t("common.error"), normalizeError(error, t("images.messages.uploadFailed")));
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(id: string) {
    setBusy(true);
    try {
      const current = items.find((x) => x.id === id);
      const res = await fetch(`/api/admin/images/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(t("images.messages.deleteFailed"));
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
      modal.success(t("common.success"), t("images.messages.deleteSuccess").replace("{name}", current?.name ?? ""));
    } catch (error: unknown) {
      modal.error(t("common.error"), normalizeError(error, t("images.messages.deleteFailed")));
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      modal.success(t("common.success"), t("images.messages.linkCopied"));
    } catch {
      modal.error(t("common.error"), t("images.messages.copyFailed"));
    }
  }

  async function createFolder() {
    const name = folderName.trim();
    if (!name) {
      modal.error(t("common.error"), t("images.messages.folderRequired"));

      return;
    }
    setCreatingFolder(true);
    try {
      const res = await fetch("/api/admin/images/image-folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          parentId: null,
        }),
      });
      if (!res.ok) {
        throw new Error(t("images.messages.createFolderFailed"));
      }
      const json = await res.json();
      modal.success(t("common.success"), t("images.messages.folderCreated"));
      setFolderName("");
      await fetchFolders();
      if (json?.item?.id) {
        setActiveFolderId(json.item.id);
      }
    } catch (error: unknown) {
      modal.error(t("common.error"), normalizeError(error, t("images.messages.createFolderFailed")));
    } finally {
      setCreatingFolder(false);
    }
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarCard}>
          <div className={styles.createFolder}>
            <input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder={t("images.placeholders.folderName")}
              className={styles.folderInput}
            />

            <button className={styles.folderBtn} onClick={createFolder} disabled={creatingFolder}>
              <i className="bi bi-folder-plus" />
            </button>
          </div>

          <div className={styles.folderList}>
            <button
              className={`${styles.folderItem} ${activeFolderId === null ? styles.folderItemActive : ""}`}
              onClick={() => setActiveFolderId(null)}
            >
              <i className="bi bi-house-door" />

              {t("images.root")}
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                className={`${styles.folderItem} ${activeFolderId === folder.id ? styles.folderItemActive : ""}`}
                onClick={() => setActiveFolderId(folder.id)}
              >
                <i className="bi bi-folder2" />

                {folder.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sidebarCard}>
          <div className={styles.sidebarTitle}>
            <i className="bi bi-cloud-arrow-up" />

            <span>{t("images.uploadImage")}</span>
          </div>

          <div
            className={`${styles.uploadBox} ${dragOver ? styles.uploadBoxActive : ""}`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={onDropFiles}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" className={styles.hiddenFile} onChange={onPickFile} />

            {previewUrl ? (
              <div className={styles.previewBox}>
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={500}
                  height={500}
                  className={styles.previewImage}
                  unoptimized
                />
                <div className={styles.previewInfo}>
                  <strong>{selectedFile?.name}</strong>
                  <span>{selectedFile ? formatBytes(selectedFile.size) : ""}</span>
                </div>
              </div>
            ) : (
              <>
                <i className={`bi bi-image ${styles.uploadIcon}`} />
                <p>{t("images.dragDrop")}</p>
                <span>{t("images.clickBrowse")}</span>
              </>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>{t("images.tag")}</label>
            <select
              className={styles.select}
              value={uploadTag}
              onChange={(e) => setUploadTag((e.target.value as UiTag | "") || "")}
            >
              <option value="">{t("images.none")}</option>
              <option value="NEW">NEW</option>
              <option value="HDR">HDR</option>
              <option value="AI">AI</option>
              <option value="FAVORITE">FAVORITE</option>
              <option value="COVER">COVER</option>
              <option value="BANNER">BANNER</option>
              <option value="AVATAR">AVATAR</option>
              <option value="PRODUCT">PRODUCT</option>
            </select>
          </div>

          <button className={styles.uploadBtn} onClick={onUpload} disabled={!selectedFile || busy}>
            <i className="bi bi-cloud-upload" />
            {busy ? t("images.uploading") : t("images.uploadImage")}
          </button>
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.searchBox}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("images.placeholders.search")}
              className={styles.searchInput}
            />
            {q && (
              <button className={styles.clearSearchBtn} onClick={() => setQ("")}>
                <i className="bi bi-x-lg" />
              </button>
            )}
          </div>

          <div className={styles.topbarActions}>
            <div className={styles.filterGroup}>
              <button
                className={`${styles.filterBtn} ${filter === "all" ? styles.filterBtnActive : ""}`}
                onClick={() => setFilter("all")}
              >
                <i className="bi bi-grid" />
                <span>{t("images.filters.all")}</span>
              </button>

              <button
                className={`${styles.filterBtn} ${filter === "recent" ? styles.filterBtnActive : ""}`}
                onClick={() => setFilter("recent")}
              >
                <i className="bi bi-clock" />
                <span>{t("images.filters.recent")}</span>
              </button>

              <button
                className={`${styles.filterBtn} ${filter === "tagged" ? styles.filterBtnActive : ""}`}
                onClick={() => setFilter("tagged")}
              >
                <i className="bi bi-bookmark-star-fill" />
                <span>{t("images.filters.tagged")}</span>
              </button>
            </div>

            <div className={styles.viewSwitch}>
              <button
                className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
                onClick={() => setView("grid")}
              >
                <i className="bi bi-grid-3x3-gap-fill" />
              </button>

              <button
                className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
                onClick={() => setView("list")}
              >
                <i className="bi bi-list-ul" />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.contentHeader}>
          <div className={styles.itemBtn}>
            <p>
              {shown.length} {t("images.available")}
            </p>
          </div>
          <button className={styles.refreshBtn} onClick={fetchImages}>
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>
        {err && <div className={styles.errorBox}>{err}</div>}
        {loading ? (
          <div className={styles.loadingBox}>
            <div className={styles.loadingSpinner} />
            <p>{t("images.loading")}</p>
          </div>
        ) : view === "grid" ? (
          <div className={styles.grid}>
            {shown.map((item, index) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardImageWrap}>
                  <Image
                    src={item.url}
                    alt={item.name}
                    width={500}
                    height={500}
                    className={styles.cardImage}
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                  />

                  <div className={styles.imageOverlay}>
                    <button className={styles.overlayBtn} onClick={() => copyLink(item.url)}>
                      <i className="bi bi-link-45deg" />
                    </button>

                    <a href={item.url} download className={styles.overlayBtn}>
                      <i className="bi bi-download" />
                    </a>

                    <button
                      className={`${styles.overlayBtn} ${styles.deleteBtn}`}
                      onClick={() =>
                        modal.confirmDelete(
                          t("images.deleteTitle"),
                          t("images.deleteDescription").replace("{name}", item.name),
                          () => removeImage(item.id),
                        )
                      }
                    >
                      <i className="bi bi-trash3" />
                    </button>
                  </div>

                  {item.tag && <div className={styles.cardTag}>{item.tag}</div>}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3 className={styles.cardTitle}>{item.name}</h3>

                      <p className={styles.cardDate}>{item.updated}</p>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.cardInfo}>
                      <span>{item.dim}</span>

                      <div className={styles.dot} />

                      <span>{item.size}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!loading && shown.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <i className="bi bi-images" />
                </div>

                <h3>{t("images.empty.title")}</h3>

                <p>{t("images.empty.description")}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.list}>
            {shown.map((item, index) => (
              <div key={item.id} className={styles.listRow}>
                <div className={styles.listLeft}>
                  <Image
                    src={item.url}
                    alt={item.name}
                    width={70}
                    height={70}
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    className={styles.listImage}
                  />

                  <div>
                    <strong>{item.name}</strong>

                    <span>{item.updated}</span>
                  </div>
                </div>

                <div className={styles.listRight}>
                  <span>{item.size}</span>

                  <span>{item.dim}</span>

                  <button onClick={() => copyLink(item.url)}>
                    <i className="bi bi-link-45deg" />
                  </button>

                  <button
                    onClick={() =>
                      modal.confirmDelete(
                        t("images.deleteTitle"),
                        t("images.deleteDescription").replace("{name}", item.name),
                        () => removeImage(item.id),
                      )
                    }
                  >
                    <i className="bi bi-trash3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

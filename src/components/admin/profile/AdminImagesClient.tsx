"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/profile/images.module.css";

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
  url: string; // mapped in API GET
  folderId?: string | null;
};

type ImgItem = {
  id: string;
  name: string;
  size: string;
  dim: string;
  updated: string;
  tag?: UiTag;
  color?: "blue" | "purple" | "green" | "amber";
  url: string;
  folderId?: string | null;
};

type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const fixed = i === 0 ? 0 : v >= 10 ? 1 : 2;
  return `${v.toFixed(fixed)} ${units[i]}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function pickColor(tag?: UiTag) {
  if (!tag) return "green" as const;
  if (tag === "NEW") return "blue" as const;
  if (tag === "HDR") return "purple" as const;
  if (tag === "AI") return "amber" as const;
  if (tag === "FAVORITE") return "amber" as const;
  if (tag === "AVATAR") return "blue" as const;
  if (tag === "BANNER" || tag === "COVER") return "purple" as const;
  return "green" as const;
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

export default function AdminImagesClient() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "recent" | "tagged">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  // data
  const [items, setItems] = useState<ImgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // folders
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // null = root

  // folder create
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploadTag, setUploadTag] = useState<UiTag | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function fetchFolders() {
    setFoldersLoading(true);
    try {
      const res = await fetch("/api/admin/images/image-folders", { cache: "no-store" });
      if (!res.ok) {
        // không block page nếu folders fail
        setFolders([]);
        return;
      }
      const j = (await res.json()) as { items: FolderItem[] };
      setFolders(j.items ?? []);
    } catch {
      setFolders([]);
    } finally {
      setFoldersLoading(false);
    }
  }

  async function fetchImages() {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (q.trim()) qs.set("q", q.trim());
      qs.set("filter", filter);

      // ✅ folder filter
      // null = root => folderId=root
      qs.set("folderId", activeFolderId ? activeFolderId : "root");

      const res = await fetch(`/api/admin/images?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed (${res.status})`);
      }

      const j = (await res.json()) as { items: ApiImageItem[] };

      const mapped: ImgItem[] = (j.items ?? []).map((x) => {
        const dim = x.width && x.height ? `${x.width}×${x.height}` : "—";
        return {
          id: x.id,
          name: x.originalName,
          size: formatBytes(x.sizeBytes),
          dim,
          updated: formatDate(x.createdAt),
          tag: x.tag ?? undefined,
          color: pickColor(x.tag ?? undefined),
          url: x.url,
          folderId: x.folderId ?? null,
        };
      });

      setItems(mapped);
    } catch (e: any) {
      setErr(e?.message || "Failed to load images");
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    fetchFolders();
  }, []);

  // reload images when filter/folder changes
  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, activeFolderId]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items
      .filter((x) => (t ? x.name.toLowerCase().includes(t) : true))
      .filter((x) => {
        if (filter === "tagged") return !!x.tag;
        return true;
      });
  }, [items, q, filter]);

  async function onUpload() {
    if (!selectedFile) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      if (uploadTag) fd.append("tag", uploadTag);

      // ✅ upload vào folder đang chọn (nếu có)
      if (activeFolderId) fd.append("folderId", activeFolderId);

      const res = await fetch("/api/admin/images", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `Upload failed (${res.status})`);

      setUploadOpen(false);
      setSelectedFile(null);
      setUploadTag("");
      if (fileRef.current) fileRef.current.value = "";

      await fetchImages();
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("Delete this image?");
    if (!ok) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `Delete failed (${res.status})`);

      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  // ✅ create folder + refresh list + auto select
  async function createFolder() {
    const name = folderName.trim();
    if (!name) return;

    setCreatingFolder(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/images/image-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId: null }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `Create folder failed (${res.status})`);

      // assuming API returns { item: { id, name, ... } }
      const created: FolderItem | undefined = j?.item;

      setFolderName("");
      await fetchFolders();

      // auto select new folder
      if (created?.id) setActiveFolderId(created.id);
    } catch (e: any) {
      setErr(e?.message || "Create folder failed");
    } finally {
      setCreatingFolder(false);
    }
  }

  const headerCountLabel = loading ? "Loading..." : `${items.length} ${plural(items.length, "item", "items")}`;

  const folderLabel = activeFolderId ? folders.find((f) => f.id === activeFolderId)?.name ?? "Folder" : "Root";

  useEffect(() => {
    // cleanup preview blob url
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function setFileWithPreview(file: File | null) {
    setSelectedFile(file);

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (!file) {
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function isImageFile(file: File) {
    return file.type.startsWith("image/");
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && !isImageFile(f)) {
      setErr("Only image files are allowed.");
      setFileWithPreview(null);
      return;
    }
    setErr(null);
    setFileWithPreview(f);
  }

  function onDropFiles(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const f = e.dataTransfer.files?.[0] ?? null;
    if (!f) return;

    if (!isImageFile(f)) {
      setErr("Only image files are allowed.");
      return;
    }

    setErr(null);
    setFileWithPreview(f);
  }
  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.title}>Images</div>
          <div className={styles.muted2}>{headerCountLabel}</div>
        </div>

        <div className={styles.headRight}>
          <div className={styles.quickCreate}>
            <label className={styles.quickLabel} htmlFor="folderNameInput">
              Name
            </label>
            <input
              id="folderNameInput"
              className={styles.quickInput}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="New folder name..."
              disabled={busy || creatingFolder}
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder();
              }}
            />
          </div>

          <button className={styles.actionBtn} type="button" disabled={busy || creatingFolder || !folderName.trim()} onClick={createFolder} title="Create folder">
            <i className="bi bi-folder-plus" /> <span>{creatingFolder ? "Creating..." : "New folder"}</span>
          </button>

          <button className={`${styles.actionBtn} ${styles.primary}`} type="button" disabled={busy} onClick={() => setUploadOpen(true)}>
            <i className="bi bi-cloud-arrow-up" /> <span>Upload</span>
          </button>
        </div>
      </div>

      {/* error banner */}
      {err && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(220,38,38,.25)",
            background: "rgba(220,38,38,.06)",
          }}>
          <strong style={{ marginRight: 8 }}>Error:</strong>
          {err}
        </div>
      )}

      {/* toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input className={styles.searchInput} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search images..." />
          {q && (
            <button className={styles.clearBtn} type="button" onClick={() => setQ("")} title="Clear">
              <i className="bi bi-x" />
            </button>
          )}
        </div>

        <div className={styles.pills}>
          <button className={`${styles.pill} ${filter === "all" ? styles.pillActive : ""}`} onClick={() => setFilter("all")} type="button">
            All
          </button>
          <button className={`${styles.pill} ${filter === "recent" ? styles.pillActive : ""}`} onClick={() => setFilter("recent")} type="button">
            Recent
          </button>
          <button className={`${styles.pill} ${filter === "tagged" ? styles.pillActive : ""}`} onClick={() => setFilter("tagged")} type="button">
            Tagged
          </button>
        </div>

        <div className={styles.viewGroup}>
          <button className={`${styles.iconBtn} ${view === "grid" ? styles.iconBtnActive : ""}`} onClick={() => setView("grid")} type="button" title="Grid">
            <i className="bi bi-grid-3x3-gap" />
          </button>
          <button className={`${styles.iconBtn} ${view === "list" ? styles.iconBtnActive : ""}`} onClick={() => setView("list")} type="button" title="List">
            <i className="bi bi-list" />
          </button>
          <button className={styles.iconBtn} type="button" title="Refresh" onClick={fetchImages} disabled={busy || creatingFolder}>
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>
      </div>

      {/* ✅ Folder bar */}
      <div className={styles.folderBar}>
        <button
          type="button"
          className={`${styles.folderChip} ${activeFolderId === null ? styles.folderChipActive : ""}`}
          onClick={() => setActiveFolderId(null)}
          disabled={foldersLoading || busy}
          title="Root">
          <i className="bi bi-house-door" />
          <span>Root</span>
        </button>

        {folders.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`${styles.folderChip} ${activeFolderId === f.id ? styles.folderChipActive : ""}`}
            onClick={() => setActiveFolderId(f.id)}
            disabled={foldersLoading || busy}
            title={f.name}>
            <i className="bi bi-folder2" />
            <span>{f.name}</span>
          </button>
        ))}

        {foldersLoading ? (
          <div className={styles.folderEmpty}>Loading folders...</div>
        ) : folders.length === 0 ? (
          <div className={styles.folderEmpty}>No folders yet.</div>
        ) : (
          <div className={styles.folderHint}>
            <span className={styles.folderHintText}>Viewing:</span> <span className={styles.folderHintStrong}>{folderLabel}</span>
          </div>
        )}
      </div>

      {/* content */}
      {view === "grid" ? (
        <div className={styles.grid} aria-busy={loading || busy}>
          {shown.map((it) => (
            <div key={it.id} className={styles.card}>
              <div className={`${styles.thumb} ${it.color ? styles[`c_${it.color}`] : ""}`}>
                <img
                  src={it.url}
                  alt={it.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    borderRadius: 12,
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <i className="bi bi-image" />
                {it.tag && <span className={styles.tag}>{it.tag}</span>}
              </div>

              <div className={styles.meta}>
                <div className={styles.name} title={it.name}>
                  {it.name}
                </div>
                <div className={styles.row}>
                  <span>{it.dim}</span>
                  <span className={styles.dot} />
                  <span>{it.size}</span>
                </div>
                <div className={styles.row2}>
                  <span className={styles.muted}>Updated</span>
                  <span className={styles.muted2}>{it.updated}</span>
                </div>
              </div>

              <div className={styles.cardActions} aria-hidden="true">
                <button className={styles.smallIcon} type="button" title="Copy link" onClick={() => copyLink(it.url)} disabled={busy}>
                  <i className="bi bi-link-45deg" />
                </button>
                <a className={styles.smallIcon} href={it.url} download title="Download">
                  <i className="bi bi-download" />
                </a>
                <button className={styles.smallIcon} type="button" title="Delete" onClick={() => onDelete(it.id)} disabled={busy}>
                  <i className="bi bi-trash3" />
                </button>
              </div>
            </div>
          ))}

          {!loading && shown.length === 0 && <div style={{ padding: 24, color: "rgba(0,0,0,.6)" }}>No images found.</div>}
        </div>
      ) : (
        <div className={styles.listCard} aria-busy={loading || busy}>
          <div className={styles.listHead}>
            <div>Name</div>
            <div>Size</div>
            <div>Dimensions</div>
            <div>Updated</div>
            <div />
          </div>

          {shown.map((it) => (
            <div key={it.id} className={styles.listRow}>
              <div className={styles.listName}>
                <span className={`${styles.listIcon} ${it.color ? styles[`c_${it.color}`] : ""}`}>
                  <i className="bi bi-image" />
                </span>
                <span className={styles.listNameText} title={it.name}>
                  {it.name}
                </span>
                {it.tag && <span className={styles.tagMini}>{it.tag}</span>}
              </div>

              <div className={styles.listCell}>{it.size}</div>
              <div className={styles.listCell}>{it.dim}</div>
              <div className={styles.listCell}>{it.updated}</div>

              <div className={styles.listOps}>
                <button className={styles.opBtn} type="button" title="Copy link" onClick={() => copyLink(it.url)} disabled={busy}>
                  <i className="bi bi-link-45deg" />
                </button>
                <a className={styles.opBtn} href={it.url} download title="Download">
                  <i className="bi bi-download" />
                </a>
                <button className={`${styles.opBtn} ${styles.opDanger}`} type="button" title="Delete" onClick={() => onDelete(it.id)} disabled={busy}>
                  <i className="bi bi-trash3" />
                </button>
              </div>
            </div>
          ))}

          {!loading && shown.length === 0 && <div style={{ padding: 24, color: "rgba(0,0,0,.6)" }}>No images found.</div>}
        </div>
      )}

      {uploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setUploadOpen(false);
          }}>
          <div className={styles.modalCard}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>
                <i className="bi bi-cloud-arrow-up" />
                <span>Upload images</span>
              </div>

              <button className={styles.modalClose} type="button" onClick={() => setUploadOpen(false)} aria-label="Close" disabled={busy}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Dropzone */}
              <div
                className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""} ${selectedFile ? styles.dropZoneHasFile : ""}`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                }}
                onDrop={onDropFiles}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
                }}
                aria-label="Drop image here or click to browse">
                <input ref={fileRef} className={styles.hiddenFile} type="file" accept="image/*" disabled={busy} onChange={onPickFile} />

                {previewUrl ? (
                  <div className={styles.previewWrap}>
                    <img className={styles.previewImg} src={previewUrl} alt="Preview" />
                    <div className={styles.previewMeta}>
                      <div className={styles.previewName} title={selectedFile?.name}>
                        {selectedFile?.name}
                      </div>
                      <div className={styles.previewSub}>
                        <span>{selectedFile ? formatBytes(selectedFile.size) : ""}</span>
                        <span className={styles.dot} />
                        <span>{selectedFile?.type || "image/*"}</span>
                      </div>

                      <div className={styles.previewActions}>
                        <button
                          type="button"
                          className={styles.previewBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            fileRef.current?.click();
                          }}
                          disabled={busy}>
                          <i className="bi bi-arrow-repeat" /> <span>Change</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.previewBtn} ${styles.previewDanger}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileWithPreview(null);
                          }}
                          disabled={busy}>
                          <i className="bi bi-trash3" /> <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.dropHint}>
                    <div className={styles.dropIcon}>
                      <i className="bi bi-images" />
                    </div>
                    <div className={styles.dropText}>
                      <div className={styles.dropTitle}>Drag & drop your image here</div>
                      <div className={styles.dropSub}>or click to browse (PNG, JPG, WEBP, GIF)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tag + info row */}
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <div className={styles.formLabel}>Tag (optional)</div>
                  <select className={styles.select} value={uploadTag} disabled={busy} onChange={(e) => setUploadTag((e.target.value as any) || "")}>
                    <option value="">— None —</option>
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

                <div className={styles.formHelp}>
                  <div className={styles.helpLine}>
                    <i className="bi bi-folder2-open" />
                    <span>
                      Upload to: <b>{activeFolderId ? folderLabel : "Root"}</b>
                    </span>
                  </div>
                  <div className={styles.helpLine}>
                    <i className="bi bi-info-circle" />
                    <span>Max 10MB • Stored in /public/upload/images</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFoot}>
              <button className={styles.actionBtn} type="button" onClick={() => setUploadOpen(false)} disabled={busy}>
                Cancel
              </button>
              <button className={`${styles.actionBtn} ${styles.primary}`} type="button" onClick={onUpload} disabled={busy || !selectedFile}>
                <i className="bi bi-cloud-arrow-up" /> <span>{busy ? "Uploading..." : "Upload"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

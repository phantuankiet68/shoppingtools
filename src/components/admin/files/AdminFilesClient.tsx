"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";

import styles from "@/styles/admin/files/files.module.css";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import { useModal } from "@/components/admin/shared/common/modal";

type FileRow =
  | {
      id: string;
      kind: "up";
      name: "..";
    }
  | {
      id: string;
      kind: "folder";
      name: string;
      updatedBy?: string;
      updated?: string;
    }
  | {
      id: string;
      kind: "file";
      name: string;
      size: string;
      updatedBy: string;
      updated: string;
      mimeType?: string;
      url?: string;
      key?: string;
    };

type ApiFolder = {
  id: string;
  name: string;
  parentId: string | null;
  updatedAt: string;
};

type ApiFile = {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  updatedAt: string;
  folderId: string | null;
  url?: string;
  key?: string;
};
function formatCheckedLabel(n: number) {
  return n <= 0 ? "checked item(s)" : `checked item(s) ${n}`;
}

function fmtSize(n: number) {
  if (!Number.isFinite(n)) return "";

  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;

  if (n >= gb) {
    return `${(n / gb).toFixed(1)} GB`;
  }

  if (n >= mb) {
    return `${(n / mb).toFixed(1)} MB`;
  }

  if (n >= kb) {
    return `${(n / kb).toFixed(1)} KB`;
  }

  return `${n} B`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);

  return d.toLocaleString();
}

function extOf(name?: string) {
  if (!name) return "";

  const i = name.lastIndexOf(".");

  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export default function AdminFilesClient() {
  const modal = useModal();

  const { t } = useAdminI18n();

  const { user } = useAdminAuth();

  const userName = user?.name ?? "";
  const userEmail = user?.email ?? "";

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const [folderId, setFolderId] = useState<string | null>(null);

  const [folders, setFolders] = useState<ApiFolder[]>([]);

  const [files, setFiles] = useState<ApiFile[]>([]);

  const [loadingList, setLoadingList] = useState(false);

  const [folderName, setFolderName] = useState("");

  const [creatingFolder, setCreatingFolder] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadList = useCallback(
    async (nextFolderId: string | null) => {
      try {
        setLoadingList(true);

        const qs = nextFolderId ? `?parentId=${encodeURIComponent(nextFolderId)}` : "";

        const r = await fetch(`/api/admin/files/list${qs}`, {
          credentials: "include",
          cache: "no-store",
        });

        const data = await r.json().catch(() => ({}));

        if (!r.ok) {
          modal.error(t("files.messages.loadFailedTitle"), data?.error ?? t("files.messages.loadFailed"));

          return;
        }

        setFolderId(data.parentId ?? null);

        setFolders(Array.isArray(data.folders) ? data.folders : []);

        setFiles(Array.isArray(data.files) ? data.files : []);

        setChecked({});
      } catch {
        modal.error(t("files.messages.loadFailedTitle"), t("files.messages.loadFailed"));
      } finally {
        setLoadingList(false);
      }
    },
    [modal, t],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadList(null);
    });
  }, [loadList]);

  async function createFolderQuick() {
    const name = folderName.trim();

    if (!name) return;

    try {
      setCreatingFolder(true);

      const r = await fetch("/api/admin/files/folders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          parentId: folderId,
        }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        modal.error(t("files.messages.createFolderFailedTitle"), data?.error ?? t("files.messages.createFolderFailed"));

        return;
      }

      setFolderName("");

      await loadList(folderId);

      modal.success(t("files.messages.successTitle"), t("files.messages.createFolderSuccess"));
    } finally {
      setCreatingFolder(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function uploadPickedFile(file: File) {
    const fd = new FormData();

    if (folderId) {
      fd.append("folderId", folderId);
    }

    fd.append("file", file);

    const r = await fetch("/api/admin/files/upload", {
      method: "POST",
      credentials: "include",
      body: fd,
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      modal.error(t("files.messages.uploadFailedTitle"), data?.error ?? t("files.messages.uploadFailed"));

      return;
    }

    await loadList(folderId);

    modal.success(t("files.messages.successTitle"), t("files.messages.uploadSuccess"));
  }

  const rows: FileRow[] = useMemo(() => {
    const out: FileRow[] = [];

    if (folderId) {
      out.push({
        id: "up",
        kind: "up",
        name: "..",
      });
    }

    for (const f of folders) {
      out.push({
        id: f.id,
        kind: "folder",
        name: f.name,
        updatedBy: userEmail,
        updated: fmtDate(f.updatedAt),
      });
    }

    for (const fi of files) {
      out.push({
        id: fi.id,
        kind: "file",
        name: fi.fileName || fi.title,
        size: fmtSize(fi.size),
        updatedBy: userEmail,
        updated: fmtDate(fi.updatedAt),
        mimeType: fi.mimeType,
        url: fi.url,
        key: fi.key,
      });
    }

    return out;
  }, [folderId, folders, files, userEmail]);

  const checkedIds = useMemo(() => Object.keys(checked).filter((k) => checked[k]), [checked]);

  const hasChecked = checkedIds.length > 0;

  const checkableIds = useMemo(() => {
    return rows
      .filter((r): r is Exclude<FileRow, { kind: "up" }> => {
        return r.kind !== "up";
      })
      .map((r) => r.id);
  }, [rows]);

  const allChecked = checkableIds.length > 0 && checkableIds.every((id) => checked[id]);

  function toggleAll() {
    const next: Record<string, boolean> = {};

    if (!allChecked) {
      for (const id of checkableIds) {
        next[id] = true;
      }
    }

    setChecked(next);
  }

  function toggleOne(id: string) {
    setChecked((prev) => {
      const next = { ...prev };

      next[id] = !prev[id];

      if (!next[id]) {
        delete next[id];
      }

      return next;
    });
  }

  function getSelectedKindMap() {
    const map = new Map<string, FileRow>();

    for (const r of rows) {
      map.set(r.id, r);
    }

    const selected = checkedIds.map((id) => map.get(id)).filter(Boolean) as FileRow[];

    const foldersSel = selected.filter((x) => x.kind === "folder") as Extract<FileRow, { kind: "folder" }>[];

    const filesSel = selected.filter((x) => x.kind === "file") as Extract<FileRow, { kind: "file" }>[];

    return {
      selected,
      foldersSel,
      filesSel,
    };
  }

  async function bulkDownload() {
    const { filesSel } = getSelectedKindMap();

    if (filesSel.length !== 1) {
      modal.error(t("files.messages.invalidSelectionTitle"), t("files.messages.selectOneFile"));

      return;
    }

    const fileId = filesSel[0].id;

    window.open(`/api/admin/files/download/${encodeURIComponent(fileId)}`, "_blank", "noopener,noreferrer");
  }

  async function copyFilePath(file: Extract<FileRow, { kind: "file" }>) {
    try {
      let path = "";

      if (file.url) {
        try {
          const u = new URL(file.url, window.location.origin);

          path = u.pathname;
        } catch {
          path = file.url;
        }
      }

      // fallback từ key
      if (!path && file.key) {
        path = `/upload/files/${file.key}`;
      }

      // fallback cuối
      if (!path) {
        path = `/api/admin/files/download/${file.id}`;
      }

      await navigator.clipboard.writeText(path);

      modal.success(t("files.messages.copySuccessTitle"), t("files.messages.copySuccess"));
    } catch {
      modal.error(t("files.messages.copyFailedTitle"), t("files.messages.copyFailed"));
    }
  }

  async function bulkDelete() {
    const { foldersSel, filesSel } = getSelectedKindMap();

    if (foldersSel.length + filesSel.length === 0) {
      return;
    }

    const msg =
      foldersSel.length > 0 && filesSel.length > 0
        ? `${t("files.messages.deleteMixedConfirm")} (${foldersSel.length} folder(s), ${filesSel.length} file(s))`
        : foldersSel.length > 0
          ? `${t("files.messages.deleteFoldersConfirm")} (${foldersSel.length})`
          : `${t("files.messages.deleteFilesConfirm")} (${filesSel.length})`;

    modal.confirmDelete(t("files.messages.deleteTitle"), msg, async () => {
      for (const f of filesSel) {
        await fetch(`/api/admin/files/file/${encodeURIComponent(f.id)}`, {
          method: "DELETE",
          credentials: "include",
        }).catch(() => {});
      }

      for (const folder of foldersSel) {
        await fetch(`/api/admin/files/folders/${encodeURIComponent(folder.id)}/delete`, {
          method: "DELETE",
          credentials: "include",
        }).catch(() => {});
      }

      await loadList(folderId);

      modal.success(t("files.messages.deleteSuccessTitle"), t("files.messages.deleteSuccess"));
    });
  }

  async function bulkRename() {
    const { foldersSel, filesSel } = getSelectedKindMap();

    if (foldersSel.length + filesSel.length !== 1) {
      modal.error(t("files.messages.invalidSelectionTitle"), t("files.messages.selectOneItem"));

      return;
    }

    const item = foldersSel[0] ?? filesSel[0];

    if (!item) return;

    const nextName = window.prompt(t("files.messages.renamePrompt"), item.name);

    if (!nextName?.trim()) return;

    if (item.kind === "folder") {
      const r = await fetch(`/api/admin/files/folders/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nextName.trim(),
        }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        modal.error(t("files.messages.renameFailedTitle"), data?.error ?? t("files.messages.renameFolderFailed"));

        return;
      }

      await loadList(folderId);

      modal.success(t("files.messages.successTitle"), t("files.messages.renameSuccess"));
    }
  }

  async function bulkMove() {
    const { foldersSel, filesSel } = getSelectedKindMap();

    if (foldersSel.length + filesSel.length !== 1) {
      modal.error(t("files.messages.invalidSelectionTitle"), t("files.messages.selectOneItem"));

      return;
    }

    const destination = window.prompt(t("files.messages.movePrompt"));

    const parentId = destination?.trim() ? destination.trim() : null;

    const item = foldersSel[0] ?? filesSel[0];

    if (!item) return;

    if (item.kind === "folder") {
      const r = await fetch(`/api/admin/files/folders/${encodeURIComponent(item.id)}/move`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId,
        }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        modal.error(t("files.messages.moveFailedTitle"), data?.error ?? t("files.messages.moveFolderFailed"));

        return;
      }

      await loadList(folderId);

      modal.success(t("files.messages.successTitle"), t("files.messages.moveSuccess"));
    }
  }

  function handleOpenRow(r: FileRow) {
    if (r.kind === "up") {
      void loadList(null);

      return;
    }

    if (r.kind === "folder") {
      void loadList(r.id);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.breadcrumb}>
            <div className={styles.pathPill}>
              <button className={styles.bcLink} type="button" onClick={() => void loadList(null)}>
                {userName || "—"}
              </button>

              <span className={styles.bcSep}>/</span>

              <button className={styles.bcLink} type="button" onClick={() => void loadList(folderId)}>
                files
              </button>

              {folderId ? (
                <>
                  <span className={styles.bcSep}>/</span>

                  <span className={styles.bcSep} title={folderId}>
                    {folderId.slice(0, 8)}…
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className={styles.subHint}>{loadingList ? " • Loading..." : ""}</div>
        </div>

        <div className={styles.headActions}>
          <div className={styles.quickCreate}>
            <label className={styles.quickLabel} htmlFor="folderNameInput">
              {t("files.labels.name")}
            </label>

            <input
              id="folderNameInput"
              className={styles.quickInput}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder={t("files.placeholders.newFolder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void createFolderQuick();
                }
              }}
            />
          </div>

          <button
            className={styles.actionBtn}
            type="button"
            onClick={() => void createFolderQuick()}
            disabled={creatingFolder || !folderName.trim()}
          >
            <i className="bi bi-folder-plus" />

            <span>{creatingFolder ? t("files.actions.creating") : t("files.actions.addFolder")}</span>
          </button>

          <button className={`${styles.actionBtn} ${styles.actionPrimary}`} type="button" onClick={openFilePicker}>
            <i className="bi bi-file-earmark-plus" />

            <span>{t("files.actions.addFile")}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];

              if (f) {
                void uploadPickedFile(f);
              }

              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.bulkBar} ${styles.bulkBarSticky}`}>
          <label className={styles.selectAll}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />

            <span>{t("files.actions.selectAll")}</span>
          </label>

          <div className={styles.bulkRight}>
            <span className={styles.checkedPill}>
              <i className="bi bi-check2-square" />

              {formatCheckedLabel(checkedIds.length)}
            </span>

            <div className={styles.bulkActions}>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked} onClick={() => void bulkRename()}>
                <i className="bi bi-pencil-square" />
                {t("files.actions.rename")}
              </button>

              <button className={styles.bulkBtn} type="button" disabled={!hasChecked} onClick={() => void bulkMove()}>
                <i className="bi bi-folder-symlink" />
                {t("files.actions.move")}
              </button>

              <button
                className={styles.bulkBtnDanger}
                type="button"
                disabled={!hasChecked}
                onClick={() => void bulkDelete()}
              >
                <i className="bi bi-trash3" />
                {t("files.actions.delete")}
              </button>

              <button
                className={styles.bulkBtn}
                type="button"
                disabled={!hasChecked}
                onClick={() => void bulkDownload()}
              >
                <i className="bi bi-download" />
                {t("files.actions.download")}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thCheck}>✅</th>

                <th className={styles.thName}>
                  <span className={styles.thFlex}>
                    {t("files.columns.fileName")}
                    <i className="bi bi-arrow-down-up" />
                  </span>
                </th>

                <th className={styles.thSize}>
                  <span className={styles.thFlex}>
                    {t("files.columns.size")}
                    <i className="bi bi-arrow-down-up" />
                  </span>
                </th>

                <th className={styles.thUser}>
                  <span className={styles.thFlex}>
                    {t("files.columns.updatedBy")}
                    <i className="bi bi-arrow-down-up" />
                  </span>
                </th>

                <th className={styles.thDate}>
                  <span className={styles.thFlex}>
                    {t("files.columns.updated")}
                    <i className="bi bi-arrow-down-up" />
                  </span>
                </th>

                <th>{t("files.columns.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr className={styles.row}>
                  <td className={styles.tdCheck}>
                    <span className={styles.checkSpacer} />
                  </td>

                  <td className={styles.tdName}>
                    <div className={styles.nameCell}>
                      <span className={`${styles.icon} ${styles.iconFolder}`}>
                        <i className="bi bi-inbox" />
                      </span>

                      <span
                        className={styles.nameBtn}
                        style={{
                          cursor: "default",
                        }}
                      >
                        {t("files.empty")}
                      </span>
                    </div>
                  </td>

                  <td className={styles.tdSize} />

                  <td className={styles.tdUser} />

                  <td className={styles.tdDate} />

                  <td />
                </tr>
              ) : (
                rows.map((r) => {
                  const canCheck = r.kind !== "up";

                  const isChecked = !!checked[r.id];

                  const fileExt = r.kind === "file" ? extOf(r.name) : "";

                  const isXlsx =
                    fileExt === "xlsx" || (r.kind === "file" && (r.mimeType || "").includes("spreadsheet"));

                  return (
                    <tr key={r.id} className={`${styles.row} ${isChecked ? styles.rowChecked : ""}`}>
                      <td className={styles.tdCheck}>
                        {canCheck ? (
                          <input type="checkbox" checked={isChecked} onChange={() => toggleOne(r.id)} />
                        ) : (
                          <span className={styles.checkSpacer} />
                        )}
                      </td>

                      <td className={styles.tdName}>
                        <div className={styles.nameCell}>
                          <span className={`${styles.icon} ${r.kind === "file" ? styles.iconFile : styles.iconFolder}`}>
                            {r.kind === "up" && <i className="bi bi-arrow-90deg-up" />}

                            {r.kind === "folder" && <i className="bi bi-folder-fill" />}

                            {r.kind === "file" && <i className="bi bi-file-earmark" />}
                          </span>

                          <button
                            className={styles.nameBtn}
                            type="button"
                            title={r.name}
                            onClick={() => handleOpenRow(r)}
                          >
                            {r.name}
                          </button>

                          {r.kind === "file" && isXlsx && (
                            <span className={styles.fileTag}>
                              <i className="bi bi-filetype-xlsx" />
                              XLSX
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={styles.tdSize}>{r.kind === "file" ? r.size : ""}</td>

                      <td className={styles.tdUser}>
                        {r.kind === "file" || r.kind === "folder" ? (r.updatedBy ?? "") : ""}
                      </td>

                      <td className={styles.tdDate}>
                        {r.kind === "file" || r.kind === "folder" ? (r.updated ?? "") : ""}
                      </td>

                      <td>
                        {r.kind === "file" && (
                          <button type="button" className={styles.bulkBtn} onClick={() => void copyFilePath(r)}>
                            <i className="bi bi-copy" />
                            {t("files.actions.copyLink")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import styles from "@/styles/admin/profile/files.module.css";

type FileRow =
  | { id: string; kind: "up"; name: ".." }
  | { id: string; kind: "folder"; name: string; updatedBy?: string; updated?: string }
  | { id: string; kind: "file"; name: string; size: string; updatedBy: string; updated: string; mimeType?: string };

type AdminUser = { name: string; role: string; image: string; email: string };

type ApiFolder = { id: string; name: string; parentId: string | null; updatedAt: string };
type ApiFile = { id: string; name: string; mimeType: string; sizeBytes: number; updatedAt: string; folderId: string | null };

function formatCheckedLabel(n: number) {
  return n <= 0 ? "checked item(s)" : `checked item(s) ${n}`;
}

function fmtSize(n: number) {
  if (!Number.isFinite(n)) return "";
  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;
  if (n >= gb) return `${(n / gb).toFixed(1)} GB`;
  if (n >= mb) return `${(n / mb).toFixed(1)} MB`;
  if (n >= kb) return `${(n / kb).toFixed(1)} KB`;
  return `${n} B`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export default function AdminFilesClient() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<AdminUser | null>(null);

  const [folderId, setFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [files, setFiles] = useState<ApiFile[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  async function loadList(nextFolderId: string | null) {
    setLoadingList(true);
    try {
      const qs = nextFolderId ? `?parentId=${encodeURIComponent(nextFolderId)}` : "";
      const r = await fetch(`/api/admin/files/list${qs}`, { credentials: "include" });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        setFolderId(data.parentId ?? null);
        setFolders(Array.isArray(data.folders) ? data.folders : []);
        setFiles(Array.isArray(data.files) ? data.files : []);
        setChecked({});
      }
    } finally {
      setLoadingList(false);
    }
  }

  async function createFolderQuick() {
    const name = folderName.trim();
    if (!name) return;

    setCreatingFolder(true);
    try {
      const r = await fetch("/api/admin/files/folders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId: folderId }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        window.alert(data?.error ?? "Create folder failed");
        return;
      }

      setFolderName(""); // ✅ clear input
      await loadList(folderId); // ✅ refresh list
    } finally {
      setCreatingFolder(false);
    }
  }

  useEffect(() => {
    let alive = true;

    fetch("/api/admin/me", { credentials: "include" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive) return;
        setUser(data?.user ?? null);
      })
      .catch(() => {});

    loadList(null);

    return () => {
      alive = false;
    };
  }, []);

  const rows: FileRow[] = useMemo(() => {
    const out: FileRow[] = [];
    if (folderId) out.push({ id: "up", kind: "up", name: ".." });

    for (const f of folders) {
      out.push({
        id: f.id,
        kind: "folder",
        name: f.name,
        updatedBy: user?.email ?? "",
        updated: fmtDate(f.updatedAt),
      });
    }

    for (const fi of files) {
      out.push({
        id: fi.id,
        kind: "file",
        name: fi.name,
        size: fmtSize(fi.sizeBytes),
        updatedBy: user?.email ?? "",
        updated: fmtDate(fi.updatedAt),
        mimeType: fi.mimeType,
      });
    }

    return out;
  }, [folderId, folders, files, user?.email]);

  const checkedIds = useMemo(() => Object.keys(checked).filter((k) => checked[k]), [checked]);
  const hasChecked = checkedIds.length > 0;

  const checkableIds = useMemo(() => rows.filter((r) => r.kind !== "up").map((r) => r.id), [rows]);
  const allChecked = checkableIds.length > 0 && checkableIds.every((id) => checked[id]);

  function toggleAll() {
    const next: Record<string, boolean> = {};
    if (!allChecked) for (const id of checkableIds) next[id] = true;
    setChecked(next);
  }

  function toggleOne(id: string) {
    setChecked((prev) => {
      const next = { ...prev };
      next[id] = !prev[id];
      if (!next[id]) delete next[id];
      return next;
    });
  }

  async function createFolder() {
    const name = window.prompt("Folder name?");
    if (!name?.trim()) return;

    const r = await fetch("/api/admin/files/folders", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), parentId: folderId }),
    });

    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      window.alert(data?.error ?? "Create folder failed");
      return;
    }

    loadList(folderId);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function uploadPickedFile(file: File) {
    const fd = new FormData();
    if (folderId) fd.append("folderId", folderId);
    fd.append("file", file);

    const r = await fetch("/api/admin/files/upload", {
      method: "POST",
      credentials: "include",
      body: fd,
    });

    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      window.alert(data?.error ?? "Upload failed");
      return;
    }

    loadList(folderId);
  }

  function getSelectedKindMap() {
    const map = new Map<string, FileRow>();
    for (const r of rows) map.set(r.id, r);
    const selected = checkedIds.map((id) => map.get(id)).filter(Boolean) as FileRow[];
    const foldersSel = selected.filter((x) => x.kind === "folder") as Extract<FileRow, { kind: "folder" }>[];
    const filesSel = selected.filter((x) => x.kind === "file") as Extract<FileRow, { kind: "file" }>[];
    return { selected, foldersSel, filesSel };
  }

  async function bulkDownload() {
    const { filesSel } = getSelectedKindMap();
    if (filesSel.length !== 1) {
      window.alert("Please select exactly 1 file to download.");
      return;
    }
    const fileId = filesSel[0].id;
    window.open(`/api/admin/files/download/${encodeURIComponent(fileId)}`, "_blank", "noopener,noreferrer");
  }

  async function bulkDelete() {
    const { foldersSel, filesSel } = getSelectedKindMap();
    if (foldersSel.length + filesSel.length === 0) return;

    const msg =
      foldersSel.length > 0 && filesSel.length > 0
        ? `Delete ${foldersSel.length} folder(s) and ${filesSel.length} file(s)?\nFolders will delete all contents inside (cascade).`
        : foldersSel.length > 0
        ? `Delete ${foldersSel.length} folder(s)?\nThis will delete all files & subfolders inside (cascade).`
        : `Delete ${filesSel.length} file(s)?`;

    if (!window.confirm(msg)) return;

    // 1) delete files
    for (const f of filesSel) {
      await fetch(`/api/admin/files/file/${encodeURIComponent(f.id)}`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});
    }

    // 2) delete folders (cascade)
    for (const folder of foldersSel) {
      await fetch(`/api/admin/files/folders/${encodeURIComponent(folder.id)}/delete`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});
    }

    loadList(folderId);
  }

  async function bulkRename() {
    const { foldersSel, filesSel } = getSelectedKindMap();

    if (foldersSel.length + filesSel.length !== 1) {
      window.alert("Please select exactly 1 item to rename.");
      return;
    }

    const item = (foldersSel[0] ?? filesSel[0]) as any;
    const nextName = window.prompt("New name:", item?.name ?? "");
    if (!nextName?.trim()) return;

    if (item.kind === "folder") {
      const r = await fetch(`/api/admin/files/folders/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName.trim() }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        window.alert(data?.error ?? "Rename folder failed");
        return;
      }
      loadList(folderId);
      return;
    }

    // File rename chưa viết API (nếu bạn muốn mình sẽ thêm)
    window.alert("File rename API is not implemented yet. Tell me if you want it.");
  }

  async function bulkMove() {
    const { foldersSel, filesSel } = getSelectedKindMap();
    if (foldersSel.length + filesSel.length !== 1) {
      window.alert("Please select exactly 1 item to move.");
      return;
    }

    const destination = window.prompt("Move to folderId? (empty = root)\nTip: copy folder id from DB or implement a picker UI later.");
    const parentId = destination?.trim() ? destination.trim() : null;

    const item = (foldersSel[0] ?? filesSel[0]) as any;

    if (item.kind === "folder") {
      const r = await fetch(`/api/admin/files/folders/${encodeURIComponent(item.id)}/move`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        window.alert(data?.error ?? "Move folder failed");
        return;
      }
      loadList(folderId);
      return;
    }

    // File move chưa viết API (nếu bạn muốn mình sẽ thêm)
    window.alert("File move API is not implemented yet. Tell me if you want it.");
  }

  function handleOpenRow(r: FileRow) {
    if (r.kind === "up") {
      // đơn giản: về root (nếu muốn back đúng parentId mình sẽ thêm API breadcrumb)
      loadList(null);
      return;
    }
    if (r.kind === "folder") {
      loadList(r.id);
      return;
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.breadcrumb}>
            <div className={styles.pathPill}>
              <button className={styles.bcLink} type="button" onClick={() => loadList(null)}>
                {user?.name ?? "—"}
              </button>
              <span className={styles.bcSep}>/</span>
              <button className={styles.bcLink} type="button" onClick={() => loadList(folderId)}>
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

          <div className={styles.subHint}>
            <i className="bi bi-info-circle" /> Manage folders & files in this workspace {loadingList ? " • Loading..." : ""}
          </div>
        </div>

        <div className={styles.headActions}>
          {/* Quick folder name input */}
          <div className={styles.quickCreate}>
            <label className={styles.quickLabel} htmlFor="folderNameInput">
              Name
            </label>
            <input
              id="folderNameInput"
              className={styles.quickInput}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="New folder..."
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolderQuick();
              }}
            />
          </div>

          <button
            className={styles.actionBtn}
            type="button"
            onClick={createFolderQuick}
            disabled={creatingFolder || !folderName.trim()}
            title={!folderName.trim() ? "Enter folder name first" : "Create folder"}>
            <i className="bi bi-folder-plus" />
            <span>{creatingFolder ? "Creating..." : "Add Folder"}</span>
          </button>

          <button className={`${styles.actionBtn} ${styles.actionPrimary}`} type="button" onClick={openFilePicker}>
            <i className="bi bi-file-earmark-plus" />
            <span>Add File</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadPickedFile(f);
              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.card}>
        {/* Top bulk bar */}
        <div className={`${styles.bulkBar} ${styles.bulkBarSticky}`}>
          <label className={styles.selectAll}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            <span>Select all</span>
          </label>

          <div className={styles.bulkRight}>
            <span className={styles.checkedPill}>
              <i className="bi bi-check2-square" />
              {formatCheckedLabel(checkedIds.length)}
            </span>

            <div className={styles.bulkActions}>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked} onClick={bulkRename}>
                <i className="bi bi-pencil-square" /> Rename
              </button>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked} onClick={bulkMove}>
                <i className="bi bi-folder-symlink" /> Move
              </button>
              <button className={styles.bulkBtnDanger} type="button" disabled={!hasChecked} onClick={bulkDelete}>
                <i className="bi bi-trash3" /> Delete
              </button>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked} onClick={bulkDownload}>
                <i className="bi bi-download" /> Download
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thCheck} />
                <th className={styles.thName}>
                  <span className={styles.thFlex}>
                    File Name <i className="bi bi-arrow-down-up" />
                  </span>
                </th>
                <th className={styles.thSize}>
                  <span className={styles.thFlex}>
                    Size <i className="bi bi-arrow-down-up" />
                  </span>
                </th>
                <th className={styles.thUser}>
                  <span className={styles.thFlex}>
                    Updated By <i className="bi bi-arrow-down-up" />
                  </span>
                </th>
                <th className={styles.thDate}>
                  <span className={styles.thFlex}>
                    Updated <i className="bi bi-arrow-down-up" />
                  </span>
                </th>
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
                      <span className={styles.nameBtn} style={{ cursor: "default" }}>
                        Empty
                      </span>
                    </div>
                  </td>
                  <td className={styles.tdSize} />
                  <td className={styles.tdUser} />
                  <td className={styles.tdDate} />
                </tr>
              ) : (
                rows.map((r) => {
                  const canCheck = r.kind !== "up";
                  const isChecked = !!checked[r.id];

                  const fileExt = r.kind === "file" ? extOf(r.name) : "";
                  const isXlsx = fileExt === "xlsx" || (r.kind === "file" && (r.mimeType || "").includes("spreadsheet"));

                  return (
                    <tr key={r.id} className={`${styles.row} ${isChecked ? styles.rowChecked : ""}`}>
                      <td className={styles.tdCheck}>{canCheck ? <input type="checkbox" checked={isChecked} onChange={() => toggleOne(r.id)} /> : <span className={styles.checkSpacer} />}</td>

                      <td className={styles.tdName}>
                        <div className={styles.nameCell}>
                          <span className={`${styles.icon} ${r.kind === "file" ? styles.iconFile : styles.iconFolder}`}>
                            {r.kind === "up" && <i className="bi bi-arrow-90deg-up" />}
                            {r.kind === "folder" && <i className="bi bi-folder-fill" />}
                            {r.kind === "file" && <i className="bi bi-file-earmark" />}
                          </span>

                          <button className={styles.nameBtn} type="button" title={r.name} onClick={() => handleOpenRow(r)}>
                            {r.name}
                          </button>

                          {r.kind === "file" && isXlsx && (
                            <span className={styles.fileTag}>
                              <i className="bi bi-filetype-xlsx" /> XLSX
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={styles.tdSize}>{r.kind === "file" ? r.size : ""}</td>
                      <td className={styles.tdUser}>{r.kind === "file" || r.kind === "folder" ? r.updatedBy ?? "" : ""}</td>
                      <td className={styles.tdDate}>{r.kind === "file" || r.kind === "folder" ? r.updated ?? "" : ""}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom bulk bar */}
        <div className={styles.bulkBarBottom}>
          <label className={styles.selectAll}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            <span>Select all</span>
          </label>

          <div className={styles.bulkRight}>
            <span className={styles.checkedPill}>
              <i className="bi bi-check2-square" />
              {formatCheckedLabel(checkedIds.length)}
            </span>

            <div className={styles.bulkActions}>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked} onClick={bulkRename}>
                <i className="bi bi-pencil-square" /> Rename
              </button>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked} onClick={bulkMove}>
                <i className="bi bi-folder-symlink" /> Move
              </button>
              <button className={styles.bulkBtnDanger} type="button" disabled={!hasChecked} onClick={bulkDelete}>
                <i className="bi bi-trash3" /> Delete
              </button>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked} onClick={bulkDownload}>
                <i className="bi bi-download" /> Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

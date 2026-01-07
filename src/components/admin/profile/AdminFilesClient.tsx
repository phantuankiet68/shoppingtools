"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/profile/files.module.css";

type FileRow =
  | { id: string; kind: "up"; name: ".." }
  | { id: string; kind: "folder"; name: string; updatedBy?: string; updated?: string }
  | { id: string; kind: "file"; name: string; size: string; updatedBy: string; updated: string };

function formatCheckedLabel(n: number) {
  return n <= 0 ? "checked item(s)" : `checked item(s) ${n}`;
}

export default function AdminFilesClient() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const rows: FileRow[] = useMemo(
    () => [
      { id: "up", kind: "up", name: ".." },
      { id: "f1", kind: "file", name: "Investigation_ガス区分.xlsx", size: "1.4 MB", updatedBy: "Phan Tuan Kiet_キエット", updated: "Jan 7, 2026, 08:45" },
    ],
    []
  );

  const checkedIds = useMemo(() => Object.keys(checked).filter((k) => checked[k]), [checked]);
  const hasChecked = checkedIds.length > 0;

  const checkableIds = useMemo(() => rows.filter((r) => r.kind !== "up").map((r) => r.id), [rows]);
  const allChecked = checkableIds.length > 0 && checkableIds.every((id) => checked[id]);

  function toggleAll() {
    const next: Record<string, boolean> = {};
    if (!allChecked) {
      for (const id of checkableIds) next[id] = true;
    }
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

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.breadcrumb}>
            <div className={styles.pathPill}>
              <button className={styles.bcLink} type="button">
                KVNファイル転送用
              </button>
              <span className={styles.bcSep}>/</span>
              <button className={styles.bcLink} type="button">
                HA
              </button>
              <span className={styles.bcSep}>/</span>
              <span className={styles.bcStrong}>ES_KVN-2085</span>

              <button className={styles.copyBtn} type="button" title="Copy path">
                <i className="bi bi-clipboard" />
              </button>
            </div>
          </div>

          <div className={styles.subHint}>
            <i className="bi bi-info-circle" /> Manage folders & files in this workspace
          </div>
        </div>

        <div className={styles.headActions}>
          <button className={styles.actionBtn} type="button">
            <i className="bi bi-folder-plus" />
            <span>Add Folder</span>
          </button>
          <button className={`${styles.actionBtn} ${styles.actionPrimary}`} type="button">
            <i className="bi bi-file-earmark-plus" />
            <span>Add File</span>
          </button>
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
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked}>
                <i className="bi bi-pencil-square" /> Rename
              </button>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked}>
                <i className="bi bi-folder-symlink" /> Move
              </button>
              <button className={styles.bulkBtnDanger} type="button" disabled={!hasChecked}>
                <i className="bi bi-trash3" /> Delete
              </button>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked}>
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
              {rows.map((r) => {
                const canCheck = r.kind !== "up";
                const isChecked = !!checked[r.id];

                return (
                  <tr key={r.id} className={`${styles.row} ${isChecked ? styles.rowChecked : ""}`}>
                    <td className={styles.tdCheck}>{canCheck ? <input type="checkbox" checked={isChecked} onChange={() => toggleOne(r.id)} /> : <span className={styles.checkSpacer} />}</td>

                    <td className={styles.tdName}>
                      <div className={styles.nameCell}>
                        <span className={`${styles.icon} ${r.kind === "file" ? styles.iconFile : styles.iconFolder}`}>
                          {r.kind === "up" && <i className="bi bi-arrow-90deg-up" />}
                          {r.kind === "folder" && <i className="bi bi-folder-fill" />}
                          {r.kind === "file" && <i className="bi bi-file-earmark-spreadsheet" />}
                        </span>

                        <button className={styles.nameBtn} type="button" title={r.name}>
                          {r.name}
                        </button>

                        {r.kind === "file" && (
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
              })}
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
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked}>
                <i className="bi bi-pencil-square" /> Rename
              </button>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked}>
                <i className="bi bi-folder-symlink" /> Move
              </button>
              <button className={styles.bulkBtnDanger} type="button" disabled={!hasChecked}>
                <i className="bi bi-trash3" /> Delete
              </button>
              <button className={styles.bulkBtn} type="button" disabled={!hasChecked}>
                <i className="bi bi-download" /> Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

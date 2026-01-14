"use client";

import { useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/builder/assets/assets.module.css";

type AssetKind = "image" | "video" | "doc" | "other";

type AssetRow = {
  id: string;
  folderId: string;
  name: string;
  kind: AssetKind;
  size: number; // bytes
  url: string; // public url
  createdAt: string; // iso
  updatedAt: string; // iso
  width?: number;
  height?: number;
};

type FolderRow = {
  id: string;
  name: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function formatBytes(n: number) {
  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;
  if (n >= gb) return `${(n / gb).toFixed(2)} GB`;
  if (n >= mb) return `${(n / mb).toFixed(2)} MB`;
  if (n >= kb) return `${(n / kb).toFixed(1)} KB`;
  return `${n} B`;
}

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function guessKind(name: string): AssetKind {
  const ext = extOf(name);
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) return "video";
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"].includes(ext)) return "doc";
  return "other";
}

function iconFor(kind: AssetKind) {
  switch (kind) {
    case "image":
      return "bi-image";
    case "video":
      return "bi-play-btn";
    case "doc":
      return "bi-file-earmark-text";
    default:
      return "bi-file-earmark";
  }
}

function nowIso() {
  return new Date().toISOString();
}

export default function AssetsPage() {
  // demo folders
  const [folders, setFolders] = useState<FolderRow[]>(() => [
    { id: "root", name: "All assets" },
    { id: "images", name: "Images" },
    { id: "docs", name: "Documents" },
  ]);
  const [activeFolderId, setActiveFolderId] = useState<string>("root");

  // demo assets
  const [assets, setAssets] = useState<AssetRow[]>(() => [
    {
      id: uid(),
      folderId: "images",
      name: "hero-1.jpg",
      kind: "image",
      size: 512_000,
      url: "https://picsum.photos/seed/hero1/1200/700",
      width: 1200,
      height: 700,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      folderId: "images",
      name: "product.png",
      kind: "image",
      size: 238_000,
      url: "https://picsum.photos/seed/prod/900/900",
      width: 900,
      height: 900,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: uid(),
      folderId: "docs",
      name: "price-list.pdf",
      kind: "doc",
      size: 1_840_000,
      url: "/files/price-list.pdf",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]);

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | AssetKind>("all");

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [selected]
  );

  const [activeAssetId, setActiveAssetId] = useState<string>(() => assets[0]?.id || "");
  const activeAsset = useMemo(() => assets.find((a) => a.id === activeAssetId) || null, [assets, activeAssetId]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const visibleAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets
      .filter((a) => (activeFolderId === "root" ? true : a.folderId === activeFolderId))
      .filter((a) => (kindFilter === "all" ? true : a.kind === kindFilter))
      .filter((a) => (q ? a.name.toLowerCase().includes(q) : true))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [assets, activeFolderId, kindFilter, query]);

  function pickFolder(id: string) {
    setActiveFolderId(id);
    setSelected({});
  }

  function toggleSelected(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function clearSelected() {
    setSelected({});
  }

  function selectOnly(id: string) {
    setSelected({ [id]: true });
  }

  function openInspector(id: string) {
    setActiveAssetId(id);
  }

  function addFolder() {
    const name = prompt("Folder name?");
    if (!name?.trim()) return;
    const row: FolderRow = { id: uid(), name: name.trim() };
    setFolders((prev) => [...prev, row]);
    setActiveFolderId(row.id);
  }

  function renameFolder(id: string) {
    if (id === "root") return;
    const f = folders.find((x) => x.id === id);
    if (!f) return;
    const next = prompt("Rename folder:", f.name);
    if (!next?.trim()) return;
    setFolders((prev) => prev.map((x) => (x.id === id ? { ...x, name: next.trim() } : x)));
  }

  function deleteFolder(id: string) {
    if (id === "root") return;
    const f = folders.find((x) => x.id === id);
    if (!f) return;
    const ok = confirm(`Delete folder "${f.name}"? Assets will be moved to "All assets".`);
    if (!ok) return;

    setFolders((prev) => prev.filter((x) => x.id !== id));
    setAssets((prev) => prev.map((a) => (a.folderId === id ? { ...a, folderId: "root" } : a)));
    setActiveFolderId("root");
  }

  function uploadClick() {
    fileRef.current?.click();
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    // MVP: tạo URL preview local (objectURL). Khi nối API thì bạn upload lên server và lấy URL thật.
    const rows: AssetRow[] = [];
    for (const f of Array.from(files)) {
      const kind = guessKind(f.name);
      const url = URL.createObjectURL(f);

      rows.push({
        id: uid(),
        folderId: activeFolderId === "root" ? "images" : activeFolderId, // demo: root thì đẩy về images
        name: f.name,
        kind,
        size: f.size,
        url,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }

    setAssets((prev) => [...rows, ...prev]);
    setTimeout(() => {
      setActiveAssetId(rows[0]?.id || activeAssetId);
      setSelected((prev) => ({ ...prev, ...(rows[0]?.id ? { [rows[0].id]: true } : {}) }));
    }, 0);
  }

  function deleteSelected() {
    if (selectedIds.length === 0) return;
    const ok = confirm(`Delete ${selectedIds.length} asset(s)?`);
    if (!ok) return;

    setAssets((prev) => prev.filter((a) => !selected[a.id]));
    clearSelected();
  }

  function renameAsset(id: string) {
    const a = assets.find((x) => x.id === id);
    if (!a) return;
    const next = prompt("Rename asset:", a.name);
    if (!next?.trim()) return;
    setAssets((prev) => prev.map((x) => (x.id === id ? { ...x, name: next.trim(), updatedAt: nowIso() } : x)));
  }

  function moveSelected() {
    if (selectedIds.length === 0) return;
    const targetName = prompt("Move to folder name (exact):");
    if (!targetName?.trim()) return;

    const target = folders.find((f) => f.name.toLowerCase() === targetName.trim().toLowerCase());
    if (!target) return alert("Folder not found.");

    setAssets((prev) => prev.map((a) => (selected[a.id] ? { ...a, folderId: target.id, updatedAt: nowIso() } : a)));
    clearSelected();
    setActiveFolderId(target.id);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  return (
    <div className={styles.shell}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Assets</div>
            <div className={styles.brandSub}>Upload · Organize · Copy URLs · Inspector</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={addFolder}>
            <i className="bi bi-folder-plus" /> New folder
          </button>
          <button className={styles.primaryBtn} type="button" onClick={uploadClick}>
            <i className="bi bi-cloud-arrow-up" /> Upload
          </button>

          <input ref={fileRef} className={styles.hiddenFile} type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar folders */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Folders</div>
            <div className={styles.sidebarHint}>Organize assets by folder</div>
          </div>

          <div className={styles.folderList}>
            {folders.map((f) => {
              const active = f.id === activeFolderId;
              return (
                <div key={f.id} className={`${styles.folderRow} ${active ? styles.folderActive : ""}`}>
                  <button className={styles.folderBtn} type="button" onClick={() => pickFolder(f.id)}>
                    <i className={`bi ${active ? "bi-folder2-open" : "bi-folder2"}`} />
                    <span className={styles.folderName}>{f.name}</span>
                  </button>

                  {f.id !== "root" && (
                    <div className={styles.folderActions}>
                      <button className={styles.iconBtn} type="button" title="Rename" onClick={() => renameFolder(f.id)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} type="button" title="Delete" onClick={() => deleteFolder(f.id)}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>
                Khi nối DB: bạn tạo model <span className={styles.mono}>Asset</span> + <span className={styles.mono}>AssetFolder</span>, hoặc lưu folder trong path.
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <i className="bi bi-search" />
              <input className={styles.search} placeholder="Search assets..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>

            <div className={styles.filters}>
              <div className={styles.selectWrap}>
                <i className="bi bi-funnel" />
                <select className={styles.select} value={kindFilter} onChange={(e) => setKindFilter(e.target.value as any)}>
                  <option value="all">All types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="doc">Documents</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {selectedIds.length > 0 && (
                <div className={styles.bulk}>
                  <span className={styles.bulkInfo}>
                    <i className="bi bi-check2-square" /> {selectedIds.length} selected
                  </span>
                  <button className={styles.ghostBtn} type="button" onClick={moveSelected}>
                    <i className="bi bi-folder-symlink" /> Move
                  </button>
                  <button className={`${styles.ghostBtn} ${styles.dangerBtn}`} type="button" onClick={deleteSelected}>
                    <i className="bi bi-trash" /> Delete
                  </button>
                  <button className={styles.ghostBtn} type="button" onClick={clearSelected}>
                    <i className="bi bi-x-lg" /> Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <div className={styles.grid}>
              {visibleAssets.length === 0 ? (
                <div className={styles.empty}>
                  <i className="bi bi-cloud-upload" />
                  <div className={styles.emptyTitle}>No assets</div>
                  <div className={styles.emptyText}>Upload files to start. You can organize by folder & search.</div>
                  <button className={styles.primaryBtn} type="button" onClick={uploadClick}>
                    <i className="bi bi-cloud-arrow-up" /> Upload
                  </button>
                </div>
              ) : (
                visibleAssets.map((a) => {
                  const checked = !!selected[a.id];
                  const isActive = a.id === activeAssetId;

                  return (
                    <div
                      key={a.id}
                      className={`${styles.card} ${checked ? styles.cardChecked : ""} ${isActive ? styles.cardActive : ""}`}
                      onClick={() => openInspector(a.id)}
                      role="button"
                      tabIndex={0}>
                      <div className={styles.thumb}>
                        {a.kind === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.url} alt={a.name} className={styles.thumbImg} />
                        ) : (
                          <div className={styles.thumbIcon}>
                            <i className={`bi ${iconFor(a.kind)}`} />
                          </div>
                        )}

                        <button
                          className={styles.check}
                          type="button"
                          title={checked ? "Unselect" : "Select"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelected(a.id);
                          }}>
                          <i className={`bi ${checked ? "bi-check2-square" : "bi-square"}`} />
                        </button>
                      </div>

                      <div className={styles.cardBody}>
                        <div className={styles.cardTitle} title={a.name}>
                          {a.name}
                        </div>
                        <div className={styles.cardMeta}>
                          <span className={styles.badge}>
                            <i className={`bi ${iconFor(a.kind)}`} /> {a.kind}
                          </span>
                          <span className={styles.dot}>•</span>
                          <span className={styles.mono}>{formatBytes(a.size)}</span>
                        </div>

                        <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                          <button className={styles.iconBtn} type="button" title="Select only" onClick={() => selectOnly(a.id)}>
                            <i className="bi bi-cursor" />
                          </button>
                          <button className={styles.iconBtn} type="button" title="Rename" onClick={() => renameAsset(a.id)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button className={styles.iconBtn} type="button" title="Copy URL" onClick={() => copy(a.url)}>
                            <i className="bi bi-link-45deg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Inspector */}
            <aside className={styles.inspector}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Inspector</div>
                    <div className={styles.panelSub}>Preview · URL · Meta</div>
                  </div>
                </div>

                {!activeAsset ? (
                  <div className={styles.panelBody}>
                    <div className={styles.inspectorEmpty}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.inspectorEmptyTitle}>Select an asset</div>
                        <div className={styles.inspectorEmptyText}>Click a card to see details.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    <div className={styles.previewBox}>
                      {activeAsset.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={activeAsset.url} alt={activeAsset.name} className={styles.previewImg} />
                      ) : (
                        <div className={styles.previewIcon}>
                          <i className={`bi ${iconFor(activeAsset.kind)}`} />
                        </div>
                      )}
                    </div>

                    <div className={styles.kv}>
                      <div className={styles.k}>
                        <i className="bi bi-file-earmark" /> Name
                      </div>
                      <div className={styles.v}>{activeAsset.name}</div>
                    </div>

                    <div className={styles.kv}>
                      <div className={styles.k}>
                        <i className="bi bi-tag" /> Type
                      </div>
                      <div className={styles.v}>{activeAsset.kind}</div>
                    </div>

                    <div className={styles.kv}>
                      <div className={styles.k}>
                        <i className="bi bi-hdd" /> Size
                      </div>
                      <div className={styles.v}>{formatBytes(activeAsset.size)}</div>
                    </div>

                    <div className={styles.kv}>
                      <div className={styles.k}>
                        <i className="bi bi-link-45deg" /> URL
                      </div>
                      <div className={styles.vMono}>{activeAsset.url}</div>
                    </div>

                    <div className={styles.inspectorActions}>
                      <button className={styles.primaryBtn} type="button" onClick={() => copy(activeAsset.url)}>
                        <i className="bi bi-clipboard" /> Copy URL
                      </button>
                      <button className={styles.ghostBtn} type="button" onClick={() => renameAsset(activeAsset.id)}>
                        <i className="bi bi-pencil" /> Rename
                      </button>
                      <button
                        className={`${styles.ghostBtn} ${styles.dangerBtn}`}
                        type="button"
                        onClick={() => {
                          setSelected({ [activeAsset.id]: true });
                          deleteSelected();
                        }}>
                        <i className="bi bi-trash" /> Delete
                      </button>
                    </div>

                    <div className={styles.tipInline}>
                      <i className="bi bi-shield-check" />
                      <span>Khi upload thật: hãy validate loại file, giới hạn dung lượng, và generate key theo siteId + folder.</span>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

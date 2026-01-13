"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/users/users.module.css";

type UserRole = "USER" | "ADMIN";
type ProfileRole = "admin" | "staff" | "viewer";
type AccountStatus = "active" | "suspended";

type Profile = {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  backupEmail: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;

  role: ProfileRole;
  status: AccountStatus;

  company: string | null;
  department: string | null;
  jobTitle: string | null;
  manager: string | null;

  gender: "male" | "female" | "other" | null;
  timezone: string | null;

  dobMonth: string | null;
  dobDay: number | null;
  dobYear: number | null;

  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  github: string | null;
  website: string | null;

  slogan: string | null;
  bio: string | null;

  twoFA: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
};

type UserListItem = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;

  profile: Partial<Profile> | null;
};

type UserDetail = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  image: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile: Profile | null;
};

type ListRes = { items: UserListItem[]; total: number };

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function fmtDate(s?: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}

function fmtName(p?: Partial<Profile> | null, email?: string) {
  const full = [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (p?.username) return p.username;
  return email || "Unknown";
}

function emptyProfile(): Profile {
  return {
    firstName: null,
    lastName: null,
    username: null,
    backupEmail: null,
    phone: null,
    address: null,
    city: null,
    country: null,

    role: "viewer",
    status: "active",

    company: null,
    department: null,
    jobTitle: null,
    manager: null,

    gender: "other",
    timezone: "Asia/Ho_Chi_Minh",

    dobMonth: null,
    dobDay: null,
    dobYear: null,

    twitter: null,
    linkedin: null,
    facebook: null,
    github: null,
    website: null,

    slogan: null,
    bio: null,

    twoFA: false,
    lastLoginAt: null,
    lastLoginIp: null,
  };
}

export default function UsersClient() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [items, setItems] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);

  // filters
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"" | UserRole>("");
  const [active, setActive] = useState<"" | "true" | "false">("");

  // select
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const checkedIds = useMemo(() => Object.keys(checked).filter((k) => checked[k]), [checked]);

  // expand + editor
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<UserDetail | null>(null);

  // editor state
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("USER");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editProfile, setEditProfile] = useState<Profile>(emptyProfile());

  const searchTimer = useRef<any>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createErr, setCreateErr] = useState("");

  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    role: "USER" as "USER" | "ADMIN",
    isActive: true,

    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    city: "",
    country: "",
    profileRole: "viewer" as "admin" | "staff" | "viewer",
    profileStatus: "active" as "active" | "suspended",
  });

  async function loadList() {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (role) params.set("role", role);
      if (active) params.set("isActive", active);

      const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as ListRes & { error?: string };
      if (!res.ok) throw new Error(json?.error || "Failed to load users");

      setItems(json.items || []);
      setTotal(json.total || 0);
      setChecked({});
    } catch (e: any) {
      setErr(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadList(), 300);
    return () => clearTimeout(searchTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role, active]);

  function toggleAll(v: boolean) {
    const next: Record<string, boolean> = {};
    for (const it of items) next[it.id] = v;
    setChecked(next);
  }

  const allChecked = items.length > 0 && items.every((x) => checked[x.id]);
  const someChecked = items.some((x) => checked[x.id]);

  async function openRow(u: UserListItem) {
    setErr("");
    if (expandedId === u.id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(u.id);
    setDetailLoading(true);
    setDetail(null);

    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to load user detail");

      const d: UserDetail = json.item;

      setDetail(d);
      setEditImage(d.image ?? null);
      setEditRole(d.role);
      setEditIsActive(d.isActive);
      setEditProfile(d.profile ? { ...emptyProfile(), ...d.profile } : emptyProfile());
    } catch (e: any) {
      setErr(e?.message || "Failed to load user detail");
    } finally {
      setDetailLoading(false);
    }
  }

  function setP<K extends keyof Profile>(k: K, v: Profile[K]) {
    setEditProfile((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    if (!expandedId) return;
    setBusy(true);
    setErr("");
    try {
      const payload = {
        role: editRole,
        isActive: !!editIsActive,
        image: editImage ? editImage.trim() : null,
        profile: {
          firstName: editProfile.firstName?.trim() || null,
          lastName: editProfile.lastName?.trim() || null,
          username: editProfile.username?.trim() || null,
          backupEmail: editProfile.backupEmail?.trim() || null,
          phone: editProfile.phone?.trim() || null,
          address: editProfile.address?.trim() || null,
          city: editProfile.city?.trim() || null,
          country: editProfile.country?.trim() || null,

          role: editProfile.role,
          status: editProfile.status,

          company: editProfile.company?.trim() || null,
          department: editProfile.department?.trim() || null,
          jobTitle: editProfile.jobTitle?.trim() || null,
          manager: editProfile.manager?.trim() || null,

          gender: editProfile.gender ?? "other",
          timezone: editProfile.timezone?.trim() || "Asia/Ho_Chi_Minh",

          dobMonth: editProfile.dobMonth?.trim() || null,
          dobDay: editProfile.dobDay ?? null,
          dobYear: editProfile.dobYear ?? null,

          twitter: editProfile.twitter?.trim() || null,
          linkedin: editProfile.linkedin?.trim() || null,
          facebook: editProfile.facebook?.trim() || null,
          github: editProfile.github?.trim() || null,
          website: editProfile.website?.trim() || null,

          slogan: editProfile.slogan?.trim() || null,
          bio: editProfile.bio?.trim() || null,
        },
      };

      const res = await fetch(`/api/admin/users/${expandedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Update failed");

      // reflect on list quickly
      setItems((prev) =>
        prev.map((x) =>
          x.id === expandedId
            ? {
                ...x,
                role: editRole,
                isActive: editIsActive,
                image: editImage,
                profile: {
                  ...(x.profile || {}),
                  firstName: editProfile.firstName,
                  lastName: editProfile.lastName,
                  username: editProfile.username,
                  phone: editProfile.phone,
                  city: editProfile.city,
                  country: editProfile.country,
                },
                updatedAt: new Date().toISOString(),
              }
            : x
        )
      );

      setExpandedId(null);
      setDetail(null);
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function onPickImage(file: File | null) {
    if (!file) return;
    // preview only (base64). Bạn có thể thay bằng upload thật sau.
    const reader = new FileReader();
    reader.onload = () => setEditImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function createUser() {
    setCreateBusy(true);
    setCreateErr("");
    try {
      if (!createForm.email.trim() || !createForm.email.includes("@")) {
        throw new Error("Email is invalid");
      }
      if (createForm.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const payload = {
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
        isActive: !!createForm.isActive,
        profile: {
          firstName: createForm.firstName.trim() || null,
          lastName: createForm.lastName.trim() || null,
          username: createForm.username.trim() || null,
          phone: createForm.phone.trim() || null,
          city: createForm.city.trim() || null,
          country: createForm.country.trim() || null,
          role: createForm.profileRole,
          status: createForm.profileStatus,
          timezone: "Asia/Ho_Chi_Minh",
        },
      };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Create failed");

      setCreateOpen(false);
      setCreateForm({
        email: "",
        password: "",
        role: "USER",
        isActive: true,
        firstName: "",
        lastName: "",
        username: "",
        phone: "",
        city: "",
        country: "",
        profileRole: "viewer",
        profileStatus: "active",
      });

      await loadList(); // ✅ refresh list
    } catch (e: any) {
      setCreateErr(e?.message || "Create failed");
    } finally {
      setCreateBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.kicker}>
            <i className="bi bi-shield-lock" />
            Admin Console
          </div>

          <div className={styles.titleRow}>
            <div className={styles.headerBadges}>
              <span className={styles.countPill}>
                <i className="bi bi-people" />
                {total} users
              </span>

              <span className={styles.tipPill}>
                <i className="bi bi-lightning-charge" />
                Click a row to edit
              </span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchWrap}>
            <i className={cx("bi bi-search", styles.searchIcon)} />
            <input className={styles.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
          </div>
          <div className={styles.filters}>
            <div className={styles.selectWrap}>
              <i className={cx("bi bi-person-badge", styles.selectIcon)} />
              <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="">All roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
            </div>

            <div className={styles.selectWrap}>
              <i className={cx("bi bi-toggle2-on", styles.selectIcon)} />
              <select className={styles.select} value={active} onChange={(e) => setActive(e.target.value as any)}>
                <option value="">All status</option>
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div className={styles.bulkInfo} data-show={someChecked ? "1" : "0"}>
              <span className={styles.bulkText}>
                <strong>{checkedIds.length}</strong> selected
              </span>
              <button type="button" className={styles.bulkBtn} onClick={() => setChecked({})}>
                Clear
              </button>
            </div>
          </div>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={() => {
              setCreateErr("");
              setCreateOpen(true);
            }}
            disabled={busy}
            title="Add new user">
            <i className="bi bi-person-plus" />
            Add User
          </button>

          <button className={styles.secondaryAction} type="button" title="Refresh" onClick={loadList} disabled={loading || busy}>
            <i className="bi bi-arrow-clockwise" />
            Refresh
          </button>
        </div>
      </div>
      {err ? (
        <div className={styles.alert}>
          <i className="bi bi-exclamation-triangle" />
          <span>{err}</span>
        </div>
      ) : null}

      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thCheck}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = !allChecked && someChecked;
                    }}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th>User</th>
                <th>User Role</th>
                <th>Active</th>
                <th>Email</th>
                <th>City</th>
                <th>Country</th>
                <th>Created</th>
                <th className={styles.thActions}></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className={styles.loadingCell}>
                    <span className={styles.spinner} /> Loading users...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    No users found.
                  </td>
                </tr>
              ) : (
                items.map((u) => {
                  const isOpen = expandedId === u.id;
                  const name = fmtName(u.profile, u.email);

                  return (
                    <Fragment key={u.id}>
                      <tr className={cx(styles.row, isOpen && styles.rowActive)} onClick={() => openRow(u)} role="button" aria-label="Open user" style={{ cursor: "pointer" }}>
                        <td className={styles.tdCheck} onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={!!checked[u.id]} onChange={(e) => setChecked((p) => ({ ...p, [u.id]: e.target.checked }))} />
                        </td>

                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.avatar}>
                              {u.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.image} alt="" />
                              ) : (
                                <span>{(name?.[0] || "U").toUpperCase()}</span>
                              )}
                            </div>
                            <div className={styles.userMeta}>
                              <div className={styles.userName}>{name}</div>
                              <div className={styles.userSub}>@{u.profile?.username || "—"}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={cx(styles.badge, u.role === "ADMIN" ? styles.badgeAdmin : styles.badgeUser)}>
                            <i className={cx("bi", u.role === "ADMIN" ? "bi-shield-check" : "bi-person")} />
                            {u.role}
                          </span>
                        </td>

                        <td>
                          <span className={cx(styles.dot, u.isActive ? styles.dotOn : styles.dotOff)}>
                            <i className={cx("bi", u.isActive ? "bi-check2-circle" : "bi-slash-circle")} />
                            {u.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>

                        <td className={styles.mono}>{u.email}</td>
                        <td>{u.profile?.city || "—"}</td>
                        <td>{u.profile?.country || "—"}</td>
                        <td className={styles.mono}>{fmtDate(u.createdAt)}</td>

                        <td className={styles.tdActions} onClick={(e) => e.stopPropagation()}>
                          <button type="button" className={styles.rowBtn} onClick={() => openRow(u)} title="Edit">
                            <i className={cx("bi", isOpen ? "bi-chevron-up" : "bi-chevron-down")} />
                          </button>
                        </td>
                      </tr>

                      {isOpen ? (
                        <tr key={`${u.id}-expand`} className={styles.expandRow}>
                          <td colSpan={9}>
                            <div className={styles.editor}>
                              <div className={styles.editorHead}>
                                <div className={styles.editorTitle}>
                                  <i className="bi bi-person-gear" />
                                  Full profile
                                </div>

                                <div className={styles.editorActions}>
                                  <button type="button" className={styles.secondaryBtn} onClick={() => openRow(u)} disabled={busy}>
                                    Close
                                  </button>
                                  <button type="button" className={styles.primaryBtn} onClick={save} disabled={busy}>
                                    {busy ? "Saving..." : "Save changes"}
                                  </button>
                                </div>
                              </div>

                              {detailLoading ? (
                                <div className={styles.loadingCell}>
                                  <span className={styles.spinner} /> Loading detail...
                                </div>
                              ) : (
                                <>
                                  {/* Header strip like the screenshot */}
                                  <div className={styles.profileTop}>
                                    <div className={styles.profileTopLeft}>
                                      <div className={styles.uploadChip}>
                                        <i className="bi bi-upload" />
                                        <label className={styles.uploadLabel}>
                                          Upload image
                                          <input type="file" accept="image/*" className={styles.uploadInput} onChange={(e) => onPickImage(e.target.files?.[0] || null)} />
                                        </label>
                                      </div>

                                      <div className={styles.fileName}>{editImage ? "profile_picture" : "No image"}</div>
                                    </div>

                                    <div className={styles.profileTopRight}>
                                      <div className={styles.miniMeta}>
                                        <div className={styles.miniMetaLabel}>Email</div>
                                        <div className={styles.miniMetaValue}>{detail?.email}</div>
                                      </div>
                                      <div className={styles.miniMeta}>
                                        <div className={styles.miniMetaLabel}>Verified</div>
                                        <div className={styles.miniMetaValue}>{detail?.emailVerifiedAt ? fmtDate(detail.emailVerifiedAt) : "—"}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className={styles.grid}>
                                    {/* Names */}
                                    <div className={styles.field}>
                                      <label className={styles.label}>First name</label>
                                      <input className={styles.input} value={editProfile.firstName ?? ""} onChange={(e) => setP("firstName", e.target.value)} />
                                    </div>

                                    <div className={styles.field}>
                                      <label className={styles.label}>Last name</label>
                                      <input className={styles.input} value={editProfile.lastName ?? ""} onChange={(e) => setP("lastName", e.target.value)} />
                                    </div>

                                    <div className={styles.field}>
                                      <label className={styles.label}>Username</label>
                                      <input className={styles.input} value={editProfile.username ?? ""} onChange={(e) => setP("username", e.target.value)} />
                                    </div>

                                    {/* User Role (USER/ADMIN) */}
                                    <div className={styles.field}>
                                      <label className={styles.label}>User role</label>
                                      <div className={styles.segment}>
                                        <button type="button" className={cx(styles.segBtn, editRole === "ADMIN" && styles.segActive)} onClick={() => setEditRole("ADMIN")} disabled={busy}>
                                          ADMIN
                                        </button>
                                        <button type="button" className={cx(styles.segBtn, editRole === "USER" && styles.segActive)} onClick={() => setEditRole("USER")} disabled={busy}>
                                          USER
                                        </button>
                                      </div>
                                    </div>

                                    {/* Active */}
                                    <div className={styles.field}>
                                      <label className={styles.label}>Active</label>
                                      <div className={styles.segment}>
                                        <button type="button" className={cx(styles.segBtn, editIsActive && styles.segActive)} onClick={() => setEditIsActive(true)} disabled={busy}>
                                          Active
                                        </button>
                                        <button type="button" className={cx(styles.segBtn, !editIsActive && styles.segActive)} onClick={() => setEditIsActive(false)} disabled={busy}>
                                          Disabled
                                        </button>
                                      </div>
                                    </div>

                                    {/* Profile role/status */}
                                    <div className={styles.field}>
                                      <label className={styles.label}>Profile role</label>
                                      <select className={styles.input} value={editProfile.role} onChange={(e) => setP("role", e.target.value as any)}>
                                        <option value="admin">admin</option>
                                        <option value="staff">staff</option>
                                        <option value="viewer">viewer</option>
                                      </select>
                                    </div>

                                    <div className={styles.field}>
                                      <label className={styles.label}>Account status</label>
                                      <select className={styles.input} value={editProfile.status} onChange={(e) => setP("status", e.target.value as any)}>
                                        <option value="active">active</option>
                                        <option value="suspended">suspended</option>
                                      </select>
                                    </div>

                                    {/* Contact */}
                                    <div className={styles.fieldWide}>
                                      <label className={styles.label}>Backup email</label>
                                      <input className={styles.input} value={editProfile.backupEmail ?? ""} onChange={(e) => setP("backupEmail", e.target.value)} />
                                    </div>

                                    <div className={styles.field}>
                                      <label className={styles.label}>Phone</label>
                                      <input className={styles.input} value={editProfile.phone ?? ""} onChange={(e) => setP("phone", e.target.value)} />
                                    </div>

                                    <div className={styles.fieldWide}>
                                      <label className={styles.label}>Address</label>
                                      <input className={styles.input} value={editProfile.address ?? ""} onChange={(e) => setP("address", e.target.value)} />
                                    </div>

                                    <div className={styles.field}>
                                      <label className={styles.label}>City</label>
                                      <input className={styles.input} value={editProfile.city ?? ""} onChange={(e) => setP("city", e.target.value)} />
                                    </div>

                                    <div className={styles.field}>
                                      <label className={styles.label}>Country</label>
                                      <input className={styles.input} value={editProfile.country ?? ""} onChange={(e) => setP("country", e.target.value)} />
                                    </div>

                                    {/* DOB */}
                                    <div className={styles.field}>
                                      <label className={styles.label}>DOB Month</label>
                                      <input className={styles.input} value={editProfile.dobMonth ?? ""} onChange={(e) => setP("dobMonth", e.target.value)} placeholder="Feb" />
                                    </div>

                                    <div className={styles.field}>
                                      <label className={styles.label}>DOB Day</label>
                                      <input
                                        className={styles.input}
                                        inputMode="numeric"
                                        value={editProfile.dobDay ?? ""}
                                        onChange={(e) => setP("dobDay", e.target.value ? Number(e.target.value) : null)}
                                        placeholder="8"
                                      />
                                    </div>

                                    <div className={styles.field}>
                                      <label className={styles.label}>DOB Year</label>
                                      <input
                                        className={styles.input}
                                        inputMode="numeric"
                                        value={editProfile.dobYear ?? ""}
                                        onChange={(e) => setP("dobYear", e.target.value ? Number(e.target.value) : null)}
                                        placeholder="2018"
                                      />
                                    </div>

                                    {/* About */}
                                    <div className={styles.fieldWide}>
                                      <label className={styles.label}>Slogan</label>
                                      <input className={styles.input} value={editProfile.slogan ?? ""} onChange={(e) => setP("slogan", e.target.value)} />
                                    </div>

                                    <div className={styles.fieldWide}>
                                      <label className={styles.label}>Bio</label>
                                      <input className={styles.input} value={editProfile.bio ?? ""} onChange={(e) => setP("bio", e.target.value)} />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.footerNote}>
        <i className="bi bi-info-circle" /> Click a user row to expand the full editor like your screenshot.
      </div>
      {createOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Add user">
          <div className={styles.modalCard}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>
                <i className="bi bi-person-plus" />
                Add User
              </div>

              <button type="button" className={styles.modalClose} onClick={() => setCreateOpen(false)} disabled={createBusy} aria-label="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {createErr ? (
              <div className={styles.modalAlert}>
                <i className="bi bi-exclamation-triangle" />
                <span>{createErr}</span>
              </div>
            ) : null}

            <div className={styles.modalGrid}>
              <div className={styles.fieldWide}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} placeholder="user@email.com" />
              </div>

              <div className={styles.fieldWide}>
                <label className={styles.label}>Password</label>
                <input
                  className={styles.input}
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>User role</label>
                <select className={styles.input} value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as any }))}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Active</label>
                <select className={styles.input} value={createForm.isActive ? "true" : "false"} onChange={(e) => setCreateForm((p) => ({ ...p, isActive: e.target.value === "true" }))}>
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>First name</label>
                <input className={styles.input} value={createForm.firstName} onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Last name</label>
                <input className={styles.input} value={createForm.lastName} onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Username</label>
                <input className={styles.input} value={createForm.username} onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))} placeholder="unique" />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input className={styles.input} value={createForm.phone} onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>City</label>
                <input className={styles.input} value={createForm.city} onChange={(e) => setCreateForm((p) => ({ ...p, city: e.target.value }))} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Country</label>
                <input className={styles.input} value={createForm.country} onChange={(e) => setCreateForm((p) => ({ ...p, country: e.target.value }))} />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Profile role</label>
                <select className={styles.input} value={createForm.profileRole} onChange={(e) => setCreateForm((p) => ({ ...p, profileRole: e.target.value as any }))}>
                  <option value="viewer">viewer</option>
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Account status</label>
                <select className={styles.input} value={createForm.profileStatus} onChange={(e) => setCreateForm((p) => ({ ...p, profileStatus: e.target.value as any }))}>
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setCreateOpen(false)} disabled={createBusy}>
                Cancel
              </button>
              <button type="button" className={styles.primaryBtn} onClick={createUser} disabled={createBusy}>
                {createBusy ? "Creating..." : "Create user"}
              </button>
            </div>
          </div>

          <button className={styles.modalBackdropBtn} type="button" onClick={() => setCreateOpen(false)} aria-label="Close backdrop" disabled={createBusy} />
        </div>
      ) : null}
    </div>
  );
}

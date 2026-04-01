"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/platform/permission.module.css";

type StaffRole = "Teacher" | "Moderator" | "Manager";

type PermissionLevel = "No Access" | "View Only" | "Assigned Only" | "Manage" | "Full Access";

type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
  avatar: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  qualification: string;
  bio: string;
  teachingProfile: boolean;
  verified?: boolean;
  image?: string | null;
  systemRole: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
  status: "ACTIVE" | "SUSPENDED";
};

type PermissionItem = {
  id: string;
  type: string;
  permission: PermissionLevel;
  summary: string;
};

const permissionItems: PermissionItem[] = [
  {
    id: "1",
    type: "Courses",
    permission: "Full Access",
    summary: "Create courses, manage schedules, update learning paths, and publish when ready.",
  },
  {
    id: "2",
    type: "Content",
    permission: "Assigned Only",
    summary: "Can access and modify only contents assigned to their department or owned modules.",
  },
  {
    id: "3",
    type: "Revenue",
    permission: "View Only",
    summary: "View revenue dashboards, transactions, and performance summaries without editing rights.",
  },
  {
    id: "4",
    type: "People",
    permission: "Full Access",
    summary: "Invite staff, update team roles, and manage access structure across the workspace.",
  },
  {
    id: "5",
    type: "Reports",
    permission: "Manage",
    summary: "Access, export, and configure teaching and performance reports for operations review.",
  },
];

function getPermissionBadgeClass(permission: PermissionLevel) {
  switch (permission) {
    case "Full Access":
      return styles.badgeSuccess;
    case "Manage":
      return styles.badgePrimary;
    case "Assigned Only":
      return styles.badgeWarning;
    case "View Only":
      return styles.badgeNeutral;
    default:
      return styles.badgeDanger;
  }
}

export default function PermissionPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/platform/pemission/staff", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch admin staff");
        }

        const data: StaffMember[] = await response.json();
        setStaffList(data);

        if (data.length > 0) {
          setSelectedStaffId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load admin staff members.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(search.toLowerCase()) ||
        staff.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || staff.role.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [staffList, search, roleFilter]);

  const selectedStaff = filteredStaff.find((staff) => staff.id === selectedStaffId) || filteredStaff[0] || null;

  useEffect(() => {
    if (!selectedStaff && filteredStaff.length > 0) {
      setSelectedStaffId(filteredStaff[0].id);
    }
  }, [filteredStaff, selectedStaff]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input
            type="text"
            placeholder='Search "Staff"'
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.toolbarActions}>
          <div className={styles.filterBox}>
            <i className="bi bi-funnel" />
            <select className={styles.filterSelect} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Filter by Role</option>
              <option value="teacher">Teacher</option>
              <option value="moderator">Moderator</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <button className={styles.inviteButton}>
            <i className="bi bi-plus-lg" />
            Invite New Staff
          </button>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Team Members</h3>
            <span className={styles.cardMeta}>{filteredStaff.length} members</span>
          </div>

          <div className={styles.staffTable}>
            <div className={styles.staffTableHead}>
              <span>Teacher Name</span>
              <span>Role</span>
            </div>

            <div className={styles.staffList}>
              {loading ? (
                <div className={styles.emptyState}>Loading admin staff...</div>
              ) : error ? (
                <div className={styles.emptyState}>{error}</div>
              ) : filteredStaff.length === 0 ? (
                <div className={styles.emptyState}>No admin staff found.</div>
              ) : (
                filteredStaff.map((staff) => {
                  const isActive = staff.id === selectedStaff?.id;

                  return (
                    <button
                      key={staff.id}
                      type="button"
                      className={`${styles.staffRow} ${isActive ? styles.staffRowActive : ""}`}
                      onClick={() => setSelectedStaffId(staff.id)}
                    >
                      <div className={styles.staffIdentity}>
                        <div className={styles.avatar}>
                          {staff.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={staff.image} alt={staff.name} className={styles.avatarImage} />
                          ) : (
                            staff.avatar
                          )}
                        </div>
                        <span className={styles.staffName}>{staff.name}</span>
                      </div>

                      <span className={styles.staffRole}>{staff.role}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        <section className={styles.detailCard}>
          {!selectedStaff ? (
            <div className={styles.emptyState}>Select a staff member to view details.</div>
          ) : (
            <>
              <div className={styles.profileTop}>
                <div className={styles.profileMain}>
                  <div className={`${styles.avatar} ${styles.avatarLarge}`}>
                    {selectedStaff.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedStaff.image} alt={selectedStaff.name} className={styles.avatarImage} />
                    ) : (
                      selectedStaff.avatar
                    )}
                  </div>

                  <div className={styles.profileInfo}>
                    <div className={styles.profileNameRow}>
                      <h2 className={styles.profileName}>{selectedStaff.name}</h2>
                      {selectedStaff.verified ? (
                        <i className={`bi bi-patch-check-fill ${styles.verifiedIcon}`} />
                      ) : null}
                    </div>

                    <div className={styles.profileMeta}>
                      <span>{selectedStaff.email}</span>
                      <span className={styles.dot} />
                      <span>{selectedStaff.phone}</span>
                    </div>

                    <div className={styles.profileRoleTag}>
                      <i className="bi bi-briefcase" />
                      <span>{selectedStaff.role}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.profileActions}>
                  <button className={styles.editButton}>
                    <i className="bi bi-pencil-square" />
                    Edit Profile
                  </button>

                  <button className={styles.iconButton} aria-label="More actions">
                    <i className="bi bi-three-dots-vertical" />
                  </button>
                </div>
              </div>

              <div className={styles.toggleCard}>
                <div>
                  <div className={styles.toggleTitle}>Teaching Profile</div>
                  <div className={styles.toggleDescription}>
                    This information will be visible to students on the public profile.
                  </div>
                </div>

                <label className={styles.switch}>
                  <input type="checkbox" checked={selectedStaff.teachingProfile} readOnly />
                  <span className={styles.slider} />
                </label>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Subject you teach</span>
                  <span className={styles.infoValue}>{selectedStaff.subject}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Short Bio</span>
                  <p className={styles.infoText}>{selectedStaff.bio}</p>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Experience</span>
                  <span className={styles.infoValue}>{selectedStaff.experience}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Qualification</span>
                  <span className={styles.infoValue}>{selectedStaff.qualification}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>System Role</span>
                  <span className={styles.infoValue}>{selectedStaff.systemRole}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status</span>
                  <span className={styles.infoValue}>{selectedStaff.status}</span>
                </div>
              </div>

              <div className={styles.permissionSection}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>Profile Permissions</h3>
                    <p className={styles.sectionDescription}>
                      Control operational capabilities, access levels, and content ownership.
                    </p>
                  </div>

                  <button className={styles.secondaryButton}>
                    <i className="bi bi-shield-lock" />
                    Update Permissions
                  </button>
                </div>

                <div className={styles.permissionTable}>
                  <div className={styles.permissionTableHead}>
                    <span>Type</span>
                    <span>Permission</span>
                    <span>Summary</span>
                  </div>

                  <div className={styles.permissionRows}>
                    {permissionItems.map((item) => (
                      <div key={item.id} className={styles.permissionRow}>
                        <div className={styles.permissionType}>{item.type}</div>

                        <div className={styles.permissionControl}>
                          <div className={`${styles.permissionBadge} ${getPermissionBadgeClass(item.permission)}`}>
                            {item.permission}
                          </div>

                          <button className={styles.addButton} aria-label={`Edit ${item.type}`}>
                            <i className="bi bi-plus-lg" />
                          </button>
                        </div>

                        <div className={styles.permissionSummary}>{item.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

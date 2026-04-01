import styles from "@/styles/platform/permission.module.css";
import { StaffMember } from "./types";

type Props = {
  staff: StaffMember[];
  loading: boolean;
  error: string;
  selectedStaffId: string;
  onSelect: (id: string) => void;
};

export function TenantList({ staff, loading, error, selectedStaffId, onSelect }: Props) {
  return (
    <aside className={styles.sidebarCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Tenants</h3>
        <span className={styles.cardMeta}>{staff.length} items</span>
      </div>

      <div className={styles.staffTable}>
        <div className={styles.staffTableHead}>
          <span>Tenant</span>
          <span>Plan</span>
        </div>

        <div className={styles.staffList}>
          {loading ? (
            <div className={styles.emptyState}>Loading tenants...</div>
          ) : error ? (
            <div className={styles.emptyState}>{error}</div>
          ) : staff.length === 0 ? (
            <div className={styles.emptyState}>No tenants found.</div>
          ) : (
            staff.map((item) => {
              const active = item.id === selectedStaffId;
              const plan =
                item.systemRole === "SUPER_ADMIN" ? "Enterprise" : item.systemRole === "ADMIN" ? "Pro" : "Basic";

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.staffRow} ${active ? styles.staffRowActive : ""}`}
                  onClick={() => onSelect(item.id)}
                >
                  <div className={styles.staffIdentity}>
                    <div className={styles.avatar}>
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className={styles.avatarImage} />
                      ) : (
                        item.avatar
                      )}
                    </div>
                    <span className={styles.staffName}>{item.name}</span>
                  </div>
                  <span className={styles.staffRole}>{plan}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

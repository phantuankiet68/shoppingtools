import styles from "@/styles/platform/permission.module.css";
import { TenantAccessProfile } from "./types";

type Props = { items: TenantAccessProfile["menuAccess"] };

export function MenuAccessSection({ items }: Props) {
  return (
    <div className={styles.permissionSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Menu Visibility</h3>
          <p className={styles.sectionDescription}>Hide modules that are not included in the tenant plan.</p>
        </div>
      </div>

      <div className={styles.infoGrid}>
        {items.map((item) => (
          <div key={item.key} className={styles.infoItem}>
            <span className={styles.infoLabel}>{item.label}</span>
            <span className={styles.infoValue}>{item.enabled ? "Visible" : "Hidden"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

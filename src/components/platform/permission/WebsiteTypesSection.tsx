import styles from "@/styles/platform/permission.module.css";
import { TenantAccessProfile } from "./types";

type Props = { items: TenantAccessProfile["websiteTypes"] };

export function WebsiteTypesSection({ items }: Props) {
  return (
    <div className={styles.permissionSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Website Types</h3>
          <p className={styles.sectionDescription}>Control which website builders this tenant can create.</p>
        </div>
      </div>

      <div className={styles.infoGrid}>
        {items.map((item) => (
          <div key={item.type} className={styles.infoItem}>
            <span className={styles.infoLabel}>{item.type}</span>
            <span className={styles.infoValue}>{item.enabled ? "Enabled" : "Disabled"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

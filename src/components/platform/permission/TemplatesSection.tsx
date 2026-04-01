import styles from "@/styles/platform/permission.module.css";
import { TemplateItem } from "./types";

type Props = { items: TemplateItem[] };

export function TemplatesSection({ items }: Props) {
  return (
    <div className={styles.permissionSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Templates Access</h3>
          <p className={styles.sectionDescription}>Enable premium templates by plan and website type.</p>
        </div>
      </div>

      <div className={styles.permissionTable}>
        <div className={styles.permissionTableHead}>
          <span>Template</span>
          <span>Tier</span>
          <span>Category</span>
        </div>

        <div className={styles.permissionRows}>
          {items.map((item) => (
            <div key={item.id} className={styles.permissionRow}>
              <div className={styles.permissionType}>{item.name}</div>
              <div className={styles.permissionControl}>
                <div
                  className={`${styles.permissionBadge} ${item.enabled ? styles.badgeSuccess : styles.badgeNeutral}`}
                >
                  {item.tier}
                </div>
              </div>
              <div className={styles.permissionSummary}>{item.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

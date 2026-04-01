import styles from "@/styles/platform/permission.module.css";
import { TenantAccessProfile } from "./types";

type Props = { profile: TenantAccessProfile };

export function DomainAccessSection({ profile }: Props) {
  return (
    <div className={styles.permissionSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Domain Access</h3>
          <p className={styles.sectionDescription}>Subdomain and custom domain allocation per tenant plan.</p>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Platform Subdomain</span>
          <span className={styles.infoValue}>{profile.platformSubdomain}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Custom Domain</span>
          <span className={styles.infoValue}>{profile.customDomainEnabled ? "Enabled" : "Disabled"}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Max Custom Domains</span>
          <span className={styles.infoValue}>{profile.maxCustomDomains}</span>
        </div>
      </div>

      <div className={styles.permissionTable}>
        <div className={styles.permissionTableHead}>
          <span>Domain</span>
          <span>Status</span>
          <span>Summary</span>
        </div>
        <div className={styles.permissionRows}>
          {profile.customDomains.map((domain) => (
            <div key={domain.domain} className={styles.permissionRow}>
              <div className={styles.permissionType}>{domain.domain}</div>
              <div className={styles.permissionControl}>
                <div
                  className={`${styles.permissionBadge} ${domain.status === "Verified" ? styles.badgeSuccess : domain.status === "Pending" ? styles.badgeWarning : styles.badgeDanger}`}
                >
                  {domain.status}
                </div>
              </div>
              <div className={styles.permissionSummary}>
                Mapped domain for tenant website publishing and SSL lifecycle.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

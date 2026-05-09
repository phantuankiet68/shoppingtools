"use client";

import { useMemo } from "react";
import styles from "@/styles/platform/permission.module.css";
import { TenantAccessProfile } from "./types";

type SiteItem = {
  id: string;
  type: string;
};

type Props = {
  items: TenantAccessProfile["websiteTypes"];
  sites?: SiteItem[]; // 👈 thêm sites
};

function toLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function WebsiteTypesSection({ items, sites = [] }: Props) {
  // map để check nhanh
  const siteTypeMap = useMemo(() => {
    const map = new Set<string>();
    sites.forEach((s) => map.add(s.type));
    return map;
  }, [sites]);

  return (
    <div className={styles.permissionSection}>
      <div className={styles.sectionHeader}>
        <div  className={styles.sectionHeaderTop}>
          <h3 className={styles.sectionTitle}>Website Types</h3>
          <p className={styles.sectionDescription}>Control which website builders this tenant can create.</p>
        </div>
      </div>

      <div className={styles.websiteTypeGrid}>
        {items.map((item) => {
          const hasSite = siteTypeMap.has(item.type);

          return (
            <div key={item.type} className={styles.websiteTypeCard}>
              <div className={styles.websiteTypeHeader}>
                <span className={styles.websiteTypeName}>{toLabel(item.type)}</span>

                <span
                  className={`${styles.websiteTypeStatus} ${
                    item.enabled ? styles.websiteTypeEnabled : styles.websiteTypeDisabled
                  }`}
                >
                  {item.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              {/* 👇 indicator ở cuối card */}
              <div className={styles.websiteTypeFooter}>
                {hasSite ? (
                  <div className={styles.websiteTypeActiveDot}>
                    <span className={styles.dot} />
                    In use
                  </div>
                ) : (
                  <div className={styles.websiteTypeInactiveDot}>Not used</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

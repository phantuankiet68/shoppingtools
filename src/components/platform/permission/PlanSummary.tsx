import styles from "@/styles/platform/permission.module.css";
import { StaffMember, TenantAccessProfile } from "./types";

type Props = {
  staff: StaffMember;
  profile: TenantAccessProfile;
};

export function PlanSummary({ staff, profile }: Props) {
  return (
    <div className={styles.profileTop}>
      <div className={styles.profileMain}>
        <div className={`${styles.avatar} ${styles.avatarLarge}`}>
          {staff.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={staff.image} alt={staff.name} className={styles.avatarImage} />
          ) : (
            staff.avatar
          )}
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.profileNameRow}>
            <div>
              <h2 className={styles.profileName}>{staff.name}</h2>
              {staff.verified ? <i className={`bi bi-patch-check-fill ${styles.verifiedIcon}`} /> : null}
              <div className={styles.profileMeta}>
                <span>{staff.email}</span>
                <span className={styles.dot} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.profileActions}>
        <div className={styles.profileRoleTag}>
          <i className="bi bi-stars" />
          <span>{profile.planName} Plan</span>
        </div>
      </div>
    </div>
  );
}

import styles from '@/styles/platform/users/user-profile/profile-actions.module.css';

export default function ProfileActions() {
    return (
        <div className={styles.actions}>
            <button className={styles.primary}>
                <i className="bi bi-person-check-fill"></i>
                Promote to Admin
            </button>

            <button>
                <i className="bi bi-arrow-repeat"></i>
                Change Role
            </button>

            <button>
                <i className="bi bi-pause-circle"></i>
                Suspend User
            </button>

            <button className={styles.danger}>
                <i className="bi bi-trash3"></i>
                Delete User
            </button>
        </div>
    );
}

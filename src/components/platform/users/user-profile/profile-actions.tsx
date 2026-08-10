import styles from '@/styles/platform/users/user-profile/profile-actions.module.css';

interface ProfileActionsProps {
    onPromote?: () => void;
    onChangeRole?: () => void;
    onSuspend?: () => void;
    onDelete?: () => void;
}

export default function ProfileActions({
    onPromote,
    onChangeRole,
    onSuspend,
    onDelete,
}: ProfileActionsProps) {
    return (
        <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onPromote}>
                <i className="bi bi-person-check-fill" />
                Promote to Admin
            </button>

            <button type="button" onClick={onChangeRole}>
                <i className="bi bi-arrow-repeat" />
                Change Role
            </button>

            <button type="button" onClick={onSuspend}>
                <i className="bi bi-pause-circle" />
                Suspend User
            </button>

            <button type="button" className={styles.danger} onClick={onDelete}>
                <i className="bi bi-trash3" />
                Delete User
            </button>
        </div>
    );
}

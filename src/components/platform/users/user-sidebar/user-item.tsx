import Image from 'next/image';
import styles from '@/styles/platform/users/user-sidebar/user-item.module.css';

export interface UserItemData {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
    status: 'ACTIVE' | 'SUSPENDED';
    verified: boolean;
}

interface Props {
    user: UserItemData;
    active?: boolean;
    onClick?: () => void;
}
interface Props {
    user: UserItemData;

    active?: boolean;

    onClick?: () => void;
}

export default function UserItem({ user, active = false, onClick }: Props) {
    const roleClass = {
        SUPER_ADMIN: styles.superAdmin,
        ADMIN: styles.admin,
        CUSTOMER: styles.customer,
    }[user.role];

    return (
        <button
            type="button"
            className={`${styles.item} ${active ? styles.active : ''}`}
            onClick={onClick}
        >
            <Image
                src={user.avatar || '/assets/images/avatar-default.png'}
                alt={user.name}
                width={46}
                height={46}
                className={styles.avatar}
            />

            <div className={styles.content}>
                <strong>{user.name}</strong>

                <span>{user.email}</span>
            </div>

            <div className={styles.right}>
                <i
                    className={`${styles.dot} ${
                        user.status === 'ACTIVE' ? styles.online : styles.offline
                    }`}
                />

                <label className={roleClass}>{user.role.replace('_', ' ')}</label>

                {user.verified && (
                    <i className={`bi bi-patch-check-fill ${styles.verified}`} title="Verified" />
                )}
            </div>
        </button>
    );
}

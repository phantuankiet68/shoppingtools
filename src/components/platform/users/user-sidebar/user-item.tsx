import Image from 'next/image';
import styles from '@/styles/platform/users/user-sidebar/user-item.module.css';
import { UserItem as User } from './users';

interface Props {
    user: User;
    active?: boolean;
}

export default function UserItem({ user, active }: Props) {
    return (
        <button className={`${styles.item} ${active ? styles.active : ''}`}>
            <Image
                src={user.avatar}
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
                <i className={`${styles.dot} ${user.online ? styles.online : styles.offline}`} />

                <label className={user.role === 'Admin' ? styles.admin : styles.customer}>
                    {user.role}
                </label>
            </div>
        </button>
    );
}

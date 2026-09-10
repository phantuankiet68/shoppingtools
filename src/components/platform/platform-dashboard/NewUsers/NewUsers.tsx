import styles from './new-users.module.css';

type UserRole = 'ADMIN' | 'CUSTOMER';

type UserStatus = 'ACTIVE' | 'SUSPENDED';

type UserItem = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    joinedAt: string;
    status: UserStatus;
    avatar?: string;
};

const users: UserItem[] = [
    {
        id: 'USR-001',
        name: 'Nguyễn Thị Mai',
        email: 'mainguyen@example.com',
        role: 'ADMIN',
        joinedAt: '09/09/2025 10:24',
        status: 'ACTIVE',
    },
    {
        id: 'USR-002',
        name: 'Lê Hoàng',
        email: 'hoangle@example.com',
        role: 'CUSTOMER',
        joinedAt: '09/09/2025 09:15',
        status: 'ACTIVE',
    },
    {
        id: 'USR-003',
        name: 'Trần Phúc',
        email: 'phuctran@example.com',
        role: 'CUSTOMER',
        joinedAt: '08/09/2025 16:42',
        status: 'ACTIVE',
    },
    {
        id: 'USR-004',
        name: 'Võ Anh',
        email: 'anhvo@example.com',
        role: 'CUSTOMER',
        joinedAt: '08/09/2025 14:30',
        status: 'ACTIVE',
    },
    {
        id: 'USR-005',
        name: 'Trịnh Thảo',
        email: 'thaotrinh@example.com',
        role: 'CUSTOMER',
        joinedAt: '07/09/2025 11:20',
        status: 'ACTIVE',
    },
];

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
}

export default function NewUsers() {
    return (
        <section className={styles.card}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={styles.icon}>
                        <i className="bi bi-person-plus" aria-hidden="true" />
                    </div>

                    <div>
                        <h3>Người dùng mới</h3>
                        <p>Những tài khoản mới đăng ký trên Kbuilder Platform.</p>
                    </div>
                </div>

                <button type="button" className={styles.viewAll}>
                    Xem tất cả
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>
            </header>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.indexColumn}>#</th>
                            <th>Người dùng</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Ngày tham gia</th>
                            <th>Trạng thái</th>
                            <th className={styles.actionColumn} />
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id}>
                                <td className={styles.index}>{index + 1}</td>

                                <td>
                                    <div className={styles.user}>
                                        <div className={styles.avatar}>
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" />
                                            ) : (
                                                getInitials(user.name)
                                            )}
                                        </div>

                                        <div className={styles.userInfo}>
                                            <strong>{user.name}</strong>
                                            <span>{user.id}</span>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <span className={styles.email}>{user.email}</span>
                                </td>

                                <td>
                                    <span
                                        className={`${styles.role} ${
                                            user.role === 'ADMIN' ? styles.admin : styles.customer
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </td>

                                <td>
                                    <span className={styles.joinedAt}>{user.joinedAt}</span>
                                </td>

                                <td>
                                    <span
                                        className={`${styles.status} ${
                                            user.status === 'ACTIVE'
                                                ? styles.active
                                                : styles.suspended
                                        }`}
                                    >
                                        <i
                                            className={`bi ${
                                                user.status === 'ACTIVE'
                                                    ? 'bi-check-circle-fill'
                                                    : 'bi-pause-circle-fill'
                                            }`}
                                            aria-hidden="true"
                                        />
                                        {user.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                                    </span>
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        className={styles.moreButton}
                                        aria-label={`Thao tác với ${user.name}`}
                                    >
                                        <i className="bi bi-three-dots" aria-hidden="true" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className={styles.footer}>
                <span>
                    Hiển thị <strong>{users.length}</strong> người dùng mới nhất
                </span>

                <button type="button" className={styles.footerLink}>
                    Quản lý người dùng
                    <i className="bi bi-arrow-up-right" aria-hidden="true" />
                </button>
            </footer>
        </section>
    );
}

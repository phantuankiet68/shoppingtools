'use client';

import styles from './RecentUsers.module.css';

const users = [
    {
        name: 'Satoshi Tanaka',
        email: 'satoshi@example.com',
        role: 'Owner',
        status: 'Active',
        time: '2 min ago',
        avatar: 'ST',
        avatarClass: 'blue',
    },
    {
        name: 'Emily Johnson',
        email: 'emily@example.com',
        role: 'Editor',
        status: 'Active',
        time: '1 hour ago',
        avatar: 'EJ',
        avatarClass: 'purple',
    },
    {
        name: 'Michael Chen',
        email: 'michael@example.com',
        role: 'Member',
        status: 'Pending',
        time: '3 hours ago',
        avatar: 'MC',
        avatarClass: 'orange',
    },
    {
        name: 'Aiko Suzuki',
        email: 'aiko@example.com',
        role: 'Member',
        status: 'Inactive',
        time: '1 day ago',
        avatar: 'AS',
        avatarClass: 'green',
    },
];

export default function RecentUsers() {
    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <h3>Recent users</h3>

                <button type="button" className={styles.viewButton}>
                    <span>View all</span>
                    <i className="bi bi-arrow-up-right" />
                </button>
            </div>

            <div className={styles.userList}>
                {users.map((user) => (
                    <div key={user.email} className={styles.userRow}>
                        {/* AVATAR */}
                        <div className={`${styles.avatar} ${styles[user.avatarClass]}`}>
                            {user.avatar}
                        </div>

                        {/* USER */}
                        <div className={styles.userInfo}>
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>

                        {/* ROLE */}
                        <div className={styles.role}>{user.role}</div>

                        {/* STATUS */}
                        <div className={`${styles.status} ${styles[user.status.toLowerCase()]}`}>
                            <span className={styles.statusDot} />
                            <span>{user.status}</span>
                        </div>

                        {/* TIME */}
                        <span className={styles.time}>{user.time}</span>

                        {/* MENU */}
                        <button
                            type="button"
                            className={styles.menuButton}
                            aria-label={`Actions for ${user.name}`}
                        >
                            <i className="bi bi-three-dots-vertical" />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

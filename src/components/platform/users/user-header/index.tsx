import styles from '@/styles/platform/users/user-header/user-header.module.css';

export default function UserHeader() {
    return (
        <header className={styles.header}>
            <div className={styles.right}>
                <div className={styles.search}>
                    <i className="bi bi-search" />
                    <input placeholder="Search..." />
                </div>
                <div className={styles.profileRight}>
                    <button className={styles.iconButton}>
                        <i className="bi bi-bell" />
                    </button>

                    <button className={styles.iconButton}>
                        <i className="bi bi-question-circle" />
                    </button>

                    <button className={styles.profile}>
                        <img src="https://i.pravatar.cc/80?img=12" alt="" />

                        <div>
                            <strong>Super Admin</strong>
                            <span>Administrator</span>
                        </div>

                        <i className="bi bi-chevron-down" />
                    </button>
                </div>
            </div>
        </header>
    );
}

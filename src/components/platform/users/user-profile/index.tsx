import Image from 'next/image';
import styles from '@/styles/platform/users/user-profile/user-profile.module.css';
import ProfileActions from '@/components/platform/users/user-profile/profile-actions';
import ProfileStats from '@/components/platform/users/user-profile/profile-stats';

export default function UserProfile() {
    return (
        <section className={styles.card}>
            <div className={styles.content}>
                <div className={styles.left}>
                    <div className={styles.avatar}>
                        <Image
                            src="/assets/avatars/avatar-1.jpg"
                            alt="Avatar"
                            fill
                            className={styles.image}
                        />

                        <span className={styles.online}></span>
                    </div>

                    <div className={styles.info}>
                        <div className={styles.heading}>
                            <h2>John Anderson</h2>

                            <div className={styles.badges}>
                                <span className={styles.customer}>Customer</span>

                                <span className={styles.active}>Active</span>
                            </div>
                        </div>

                        <div className={styles.meta}>
                            <div>
                                <i className="bi bi-envelope"></i>
                                john@acme.com
                            </div>

                            <div>
                                <i className="bi bi-telephone"></i>
                                +84 979 123 456
                            </div>

                            <div>
                                <i className="bi bi-geo-alt"></i>
                                Vietnam
                            </div>

                            <div>
                                <i className="bi bi-calendar3"></i>
                                Joined Jan 2025
                            </div>

                            <div>
                                <i className="bi bi-clock-history"></i>
                                Last Login 12 mins ago
                            </div>
                        </div>
                    </div>
                </div>

                <ProfileStats />

                <div className={styles.actions}>
                    <ProfileActions />
                </div>
            </div>
        </section>
    );
}

'use client';

import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import styles from '@/styles/admin/dashboard/UserPlate.module.css';
import Image from 'next/image';

export default function SupportManagerCard() {
    const { t } = useAdminI18n();
    return (
        <div className={styles.card}>
            {/* PROFILE */}
            <div className={styles.profile}>
                {/* AVATAR */}
                <div className={styles.avatarWrap}>
                    <div className={styles.avatarRing}>
                        <Image
                            src="/assets/images/avatar.png"
                            alt="Manager"
                            width={78}
                            height={78}
                            className={styles.avatar}
                            priority
                        />
                    </div>

                    <span className={styles.online}></span>
                </div>

                {/* INFO */}
                <div className={styles.info}>
                    <div className={styles.badge}>
                        <i className="bi bi-patch-check-fill"></i>
                        Shopping Tool
                    </div>

                    {/* ACTION */}
                    <div className={styles.contactBody}>
                        <div className={styles.contactItem}>
                            <div className={styles.icon}>
                                <i className="bi bi-envelope"></i>
                            </div>

                            <div>
                                <strong>tuankietity@gmail.com</strong>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.icon}>
                                <i className="bi bi-telephone"></i>
                            </div>

                            <div>
                                <strong>+84 987 654 321</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTACT */}
            <div className={styles.contactList}>
                <div className={styles.chatCard}>
                    <div className={styles.chatBody}>
                        <div className={styles.messageLeft}>{t('support.chatGreeting')}</div>
                        <div className={styles.messageRight}>{t('support.chatRequest')}</div>
                        <div className={styles.messageLeft}>{t('support.chatReply')}</div>
                    </div>
                    <div className={styles.chatInput}>
                        <textarea
                            className={styles.textarea}
                            placeholder={t('support.typeMessage')}
                        />

                        <button className={styles.sendBtn}>
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import styles from '@/styles/platform/users/billing-status/billing-status.module.css';
import { BILLING_LIST } from '@/components/platform/users/billing-status/billing';

const STATUS_MAP = {
    PAID: {
        label: 'Paid',
        className: styles.paid,
        icon: 'bi-check-circle-fill',
    },
    EXPIRING_SOON: {
        label: 'Expiring Soon',
        className: styles.expiring,
        icon: 'bi-exclamation-circle-fill',
    },
    OVERDUE: {
        label: 'Overdue',
        className: styles.overdue,
        icon: 'bi-x-circle-fill',
    },
    TRIAL: {
        label: 'Trial',
        className: styles.trial,
        icon: 'bi-clock-fill',
    },
} as const;

export default function BillingStatus() {
    return (
        <section className={styles.section}>
            <header className={styles.header}>
                <div>
                    <h2>Billing Status</h2>
                </div>

                <button className={styles.button}>
                    <i className="bi bi-receipt"></i>
                    View Billing
                </button>
            </header>

            <div className={styles.list}>
                {BILLING_LIST.map((item) => {
                    const status = STATUS_MAP[item.status];

                    return (
                        <article key={item.id} className={styles.card}>
                            <div className={styles.top}>
                                <div className={styles.site}>
                                    <div
                                        className={styles.logo}
                                        style={
                                            {
                                                '--accent': item.color,
                                            } as React.CSSProperties
                                        }
                                    >
                                        <i className={`bi ${item.icon}`} />
                                    </div>

                                    <div>
                                        <h3>{item.site}</h3>

                                        <span>{item.domain}</span>
                                    </div>
                                </div>
                                <div className={styles.grid}>
                                    <div>
                                        <label>Customer</label>

                                        <strong>{item.customer}</strong>
                                    </div>

                                    <div>
                                        <label>Plan</label>

                                        <strong>{item.plan}</strong>
                                    </div>

                                    <div>
                                        <label>Price</label>

                                        <strong>
                                            ${item.amount}/{item.billingCycle.toLowerCase()}
                                        </strong>
                                    </div>

                                    <div>
                                        <label>Next Billing</label>

                                        <strong>{item.nextBilling}</strong>
                                    </div>
                                </div>

                                <span className={`${styles.badge} ${status.className}`}>
                                    <i className={`bi ${status.icon}`} />

                                    {status.label}
                                </span>
                            </div>

                            <div className={styles.notification}>
                                <div className={styles.notifyIcon}>
                                    <i className="bi bi-bell-fill"></i>
                                </div>

                                <div className={styles.notifyContent}>
                                    <h4>Notification</h4>

                                    <p>{item.notification}</p>
                                </div>

                                <div className={styles.actions}>
                                    {(item.status === 'EXPIRING_SOON' ||
                                        item.status === 'OVERDUE') && (
                                        <>
                                            <button className={styles.secondaryAction}>
                                                <i className="bi bi-bell"></i>
                                                Reminder
                                            </button>

                                            <button className={styles.primaryAction}>
                                                <i className="bi bi-arrow-repeat"></i>
                                                Renew
                                            </button>
                                        </>
                                    )}

                                    {item.status === 'PAID' && (
                                        <button className={styles.primaryAction}>
                                            <i className="bi bi-eye"></i>
                                            View Details
                                        </button>
                                    )}

                                    {item.status === 'TRIAL' && (
                                        <button className={styles.primaryAction}>
                                            <i className="bi bi-stars"></i>
                                            Upgrade
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

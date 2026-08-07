import styles from '@/styles/platform/users/user-profile/profile-stats.module.css';

const stats = [
    {
        title: 'Workspaces',
        value: '12',
        icon: 'bi-grid-1x2-fill',
        gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        color: '#2563eb',
    },
    {
        title: 'Sites',
        value: '36',
        icon: 'bi-window-stack',
        gradient: 'linear-gradient(135deg, #cffafe 0%, #bae6fd 100%)',
        color: '#0891b2',
    },
    {
        title: 'Storage',
        value: '28 GB',
        icon: 'bi-hdd-stack-fill',
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        color: '#d97706',
    },
    {
        title: 'Plan',
        value: 'Plus',
        icon: 'bi-stars',
        gradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        color: '#16a34a',
    },
];

export default function ProfileStats() {
    return (
        <div className={styles.stats}>
            {stats.map((item) => (
                <div key={item.title} className={styles.card}>
                    <div className={styles.icon} style={{ background: item.gradient }}>
                        <i className={`bi ${item.icon}`} />
                    </div>
                    <div>
                        <span>{item.title}</span>
                        <strong>{item.value}</strong>
                    </div>
                </div>
            ))}
        </div>
    );
}

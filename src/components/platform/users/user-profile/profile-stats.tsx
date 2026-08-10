import styles from '@/styles/platform/users/user-profile/profile-stats.module.css';

interface ProfileStatsProps {
    stats?: {
        workspaces: number;
        sites: number;
        storage: string;
        plan: string;
    };
}

const cards = [
    {
        key: 'workspaces',
        title: 'Workspaces',
        icon: 'bi-grid-1x2-fill',
        gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    },
    {
        key: 'sites',
        title: 'Sites',
        icon: 'bi-window-stack',
        gradient: 'linear-gradient(135deg, #cffafe 0%, #bae6fd 100%)',
    },
    {
        key: 'storage',
        title: 'Storage',
        icon: 'bi-hdd-stack-fill',
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    },
    {
        key: 'plan',
        title: 'Plan',
        icon: 'bi-stars',
        gradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
    },
] as const;

export default function ProfileStats({ stats }: ProfileStatsProps) {
    const values = {
        workspaces: (stats?.workspaces ?? 0).toLocaleString(),
        sites: (stats?.sites ?? 0).toLocaleString(),
        storage: stats?.storage ?? '-',
        plan: stats?.plan ?? '-',
    };

    return (
        <div className={styles.stats}>
            {cards.map((item) => (
                <div key={item.key} className={styles.card}>
                    <div
                        className={styles.icon}
                        style={{
                            background: item.gradient,
                        }}
                    >
                        <i className={`bi ${item.icon}`} />
                    </div>

                    <div>
                        <span>{item.title}</span>

                        <strong>{values[item.key]}</strong>
                    </div>
                </div>
            ))}
        </div>
    );
}

'use client';

import styles from '@/styles/platform/users/user-sidebar/search.module.css';

interface SearchProps {
    value: string;
    onChange: (value: string) => void;

    role: 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
    onRoleChange: (role: 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER') => void;

    placeholder?: string;
    onFilterClick?: () => void;
}

export default function Search({
    value,
    onChange,
    role,
    onRoleChange,
    placeholder = 'Search users...',
    onFilterClick,
}: SearchProps) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.search}>
                <i className="bi bi-search" />

                <input
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>

            <div className={styles.filters}>
                <div className={styles.select}>
                    <i className="bi bi-person-badge"></i>

                    <select
                        value={role}
                        onChange={(e) =>
                            onRoleChange(
                                e.target.value as 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER',
                            )
                        }
                    >
                        <option value="ALL">All Roles</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="CUSTOMER">Customer</option>
                    </select>
                </div>

                <button type="button" className={styles.filterButton} onClick={onFilterClick}>
                    <i className="bi bi-sliders2" />
                </button>
            </div>
        </div>
    );
}

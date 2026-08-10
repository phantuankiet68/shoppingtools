'use client';

import styles from '@/styles/platform/users/user-sidebar/search.module.css';

export type UserRole = 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
export type UserStatus = 'ALL' | 'ACTIVE' | 'SUSPENDED';

interface SearchProps {
    value: string;
    onChange: (value: string) => void;

    role: UserRole;
    onRoleChange: (role: UserRole) => void;

    status: UserStatus;
    onStatusChange: (status: UserStatus) => void;

    placeholder?: string;
}

export default function Search({
    value,
    onChange,
    role,
    onRoleChange,
    status,
    onStatusChange,
    placeholder = 'Search users...',
}: SearchProps) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.search}>
                <i className="bi bi-search" />

                <input
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>

            <div className={styles.filters}>
                <div className={styles.select}>
                    <i className="bi bi-person-badge" />

                    <select value={role} onChange={(e) => onRoleChange(e.target.value as UserRole)}>
                        <option value="ALL">All Roles</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="CUSTOMER">Customer</option>
                    </select>
                </div>

                <div className={styles.select}>
                    <i className="bi bi-shield-check" />

                    <select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value as UserStatus)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useMemo, useState } from 'react';
import styles from '@/styles/platform/users/user-sidebar/user-sidebar.module.css';
import Search from './search';
import Pagination from './pagination';
import UserItem from './user-item';
import { USERS } from './users';

const PAGE_SIZE = 10;

export default function UserSidebar() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filteredUsers = useMemo(() => {
        return USERS.filter(
            (user) =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()),
        );
    }, [search]);

    const [role, setRole] = useState<'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER'>('ALL');

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

    const users = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;

        return filteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredUsers, page]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handlePageChange = (value: number) => {
        if (value < 1 || value > totalPages) return;

        setPage(value);
    };

    return (
        <aside className={styles.sidebar}>
            <Search value={search} onChange={setSearch} role={role} onRoleChange={setRole} />

            <div className={styles.total}>
                <span>Total Users</span>

                <label>{filteredUsers.length.toLocaleString()}</label>
            </div>

            <div className={styles.list}>
                {users.map((user, index) => (
                    <UserItem key={user.id} user={user} active={index === 0} />
                ))}
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
            />
        </aside>
    );
}

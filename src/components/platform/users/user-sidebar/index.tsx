'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from '@/styles/platform/users/user-sidebar/user-sidebar.module.css';
import Pagination from './pagination';
import Search from './search';
import UserItem from './user-item';

const PAGE_SIZE = 6;

export interface UserItemData {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
    status: 'ACTIVE' | 'SUSPENDED';
    verified: boolean;
}

interface Props {
    selectedUserId: string | null;

    onSelect(userId: string): void;
}

export default function UserSidebar({ selectedUserId, onSelect }: Props) {
    const [users, setUsers] = useState<UserItemData[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
    const [search, setSearch] = useState('');
    const [role, setRole] = useState<'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER'>('ALL');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.set('page', page.toString());
            params.set('limit', PAGE_SIZE.toString());

            if (search.trim()) {
                params.set('search', search);
            }

            if (role !== 'ALL') {
                params.set('role', role);
            }

            if (status !== 'ALL') {
                params.set('status', status);
            }

            const res = await fetch(`/api/platform/users?${params.toString()}`, {
                cache: 'no-store',
            });

            const json = await res.json();

            if (!json.ok) {
                throw new Error(json.message);
            }

            const items: UserItemData[] = json.data;

            setUsers(items);
            setTotal(json.pagination.total);

            // Auto select user đầu tiên
            if (!selectedUserId && items.length > 0) {
                onSelect(items[0].id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, role, status, search, selectedUserId, onSelect]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleRoleChange = (value: 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER') => {
        setRole(value);
        setPage(1);
    };

    return (
        <aside className={styles.sidebar}>
            <Search
                value={search}
                onChange={handleSearch}
                role={role}
                onRoleChange={handleRoleChange}
                status={status}
                onStatusChange={(value) => {
                    setStatus(value);
                    setPage(1);
                }}
            />

            <div className={styles.total}>
                <span>Total Users</span>

                <label>{total.toLocaleString()}</label>
            </div>

            <div className={styles.list}>
                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : users.length === 0 ? (
                    <div className={styles.empty}>No users found.</div>
                ) : (
                    users.map((user, index) => (
                        <UserItem
                            key={user.id}
                            user={user}
                            active={selectedUserId === user.id}
                            onClick={() => onSelect(user.id)}
                        />
                    ))
                )}
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onChange={setPage}
            />
        </aside>
    );
}

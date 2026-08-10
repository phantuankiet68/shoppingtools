'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/platform/users/user-profile/user-profile.module.css';
import ProfileActions from '@/components/platform/users/user-profile/profile-actions';
import ProfileStats from '@/components/platform/users/user-profile/profile-stats';

interface UserProfileProps {
    userId: string | null;
}

interface UserDetail {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
    status: 'ACTIVE' | 'SUSPENDED';
    verified: boolean;
    createdAt: string;
    lastLoginAt: string | null;

    profile: {
        firstName: string | null;
        lastName: string | null;
        username: string | null;
        avatar: string | null;
        phone: string | null;
        city: string | null;
        country: string | null;
        shopName: string | null;
    } | null;

    stats: {
        workspaces: number;
        sites: number;
        storage: string;
        plan: string;
    };
}

export default function UserProfile({ userId }: UserProfileProps) {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(false);

    const loadProfile = useCallback(async () => {
        if (!userId) {
            setUser(null);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/platform/users/${userId}/profile`, {
                cache: 'no-store',
            });

            const json = await res.json();

            if (!json.success) {
                throw new Error(json.message);
            }

            setUser(json.data);
        } catch (error) {
            console.error('LOAD_PROFILE_ERROR', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    if (!userId) {
        return (
            <section className={styles.card}>
                <div className={styles.empty}>Select a user to view the profile.</div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className={styles.card}>
                <div className={styles.loading}>Loading profile...</div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className={styles.card}>
                <div className={styles.empty}>User not found.</div>
            </section>
        );
    }

    const handlePromote = async () => {
        if (!user) return;

        try {
            const response = await fetch(`/api/platform/users/${user.id}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: 'ADMIN',
                }),
            });

            const json = await response.json();

            if (!response.ok || !json.ok) {
                throw new Error(json.message);
            }

            await loadProfile();

            alert('User promoted successfully.');
        } catch (error) {
            console.error(error);

            alert(error instanceof Error ? error.message : 'Failed to promote user.');
        }
    };

    const handleChangeRole = async () => {
        if (!user) return;

        const nextRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';

        try {
            const response = await fetch(`/api/platform/users/${user.id}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: nextRole,
                }),
            });

            const json = await response.json();

            if (!response.ok || !json.ok) {
                throw new Error(json.message);
            }

            await loadProfile();

            alert(`User role changed to ${nextRole}.`);
        } catch (error) {
            console.error('CHANGE_ROLE_ERROR', error);

            alert(error instanceof Error ? error.message : 'Failed to change user role.');
        }
    };

    const handleSuspend = async () => {
        if (!user) return;

        const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

        try {
            const response = await fetch(`/api/platform/users/${user.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: nextStatus,
                }),
            });

            const json = await response.json();

            if (!response.ok || !json.ok) {
                throw new Error(json.message);
            }

            await loadProfile();

            alert(
                nextStatus === 'SUSPENDED'
                    ? 'User suspended successfully.'
                    : 'User activated successfully.',
            );
        } catch (error) {
            console.error('SUSPEND_USER_ERROR', error);

            alert(error instanceof Error ? error.message : 'Failed to update user status.');
        }
    };

    const handleDelete = async () => {
        if (!user) return;

        const confirmed = window.confirm(`Are you sure you want to delete "${user.name}"?`);

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/platform/users/${user.id}`, {
                method: 'DELETE',
            });

            const json = await response.json();

            if (!response.ok || !json.ok) {
                throw new Error(json.message);
            }

            alert('User deleted successfully.');

            // Xóa dữ liệu đang hiển thị
            setUser(null);
        } catch (error) {
            console.error('DELETE_USER_ERROR', error);

            alert(error instanceof Error ? error.message : 'Failed to delete user.');
        }
    };

    const fullName =
        user.name || `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim();
    return (
        <section className={styles.card}>
            <div className={styles.content}>
                <div className={styles.left}>
                    <div className={styles.avatar}>
                        <Image
                            src={
                                user.profile?.avatar ?? user.image ?? '/assets/avatars/avatar-1.jpg'
                            }
                            alt={fullName}
                            fill
                            className={styles.image}
                        />

                        <span
                            className={user.status === 'ACTIVE' ? styles.online : styles.offline}
                        />
                    </div>

                    <div className={styles.info}>
                        <div className={styles.heading}>
                            <h2>{fullName}</h2>

                            <div className={styles.badges}>
                                <span className={styles.customer}>
                                    {user.role.replace('_', ' ')}
                                </span>

                                <span
                                    className={
                                        user.status === 'ACTIVE' ? styles.active : styles.suspended
                                    }
                                >
                                    {user.status}
                                </span>
                            </div>
                        </div>

                        <div className={styles.meta}>
                            <div>
                                <i className="bi bi-envelope" />
                                {user.email}
                            </div>

                            <div>
                                <i className="bi bi-telephone" />
                                {user.profile?.phone ?? '--'}
                            </div>

                            <div>
                                <i className="bi bi-geo-alt" />
                                {[user.profile?.city, user.profile?.country]
                                    .filter(Boolean)
                                    .join(', ') || '--'}
                            </div>

                            <div>
                                <i className="bi bi-calendar3" />
                                {new Date(user.createdAt).toLocaleDateString()}
                            </div>

                            <div>
                                <i className="bi bi-clock-history" />
                                {user.lastLoginAt
                                    ? new Date(user.lastLoginAt).toLocaleString()
                                    : 'Never logged in'}
                            </div>
                        </div>
                    </div>
                </div>

                <ProfileStats stats={user.stats} />

                <div className={styles.actions}>
                    <ProfileActions
                        onPromote={handlePromote}
                        onChangeRole={handleChangeRole}
                        onSuspend={handleSuspend}
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        </section>
    );
}

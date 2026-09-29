'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    systemRole: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeUser(user: any): AuthUser | null {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        name: user.name ?? '',
        email: user.email ?? '',
        avatar: user.avatar ?? user.image ?? null,
        systemRole: user.systemRole ?? '',
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const response = await fetch('/api/v1/auth/me', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) {
                setUser(null);
                return;
            }

            const json = await response.json();

            setUser(normalizeUser(json?.user));
        } catch (error) {
            console.error('[AuthProvider] Failed to load current user:', error);

            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/v1/auth/signout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('[AuthProvider] Logout failed:', error);
        } finally {
            setUser(null);

            window.dispatchEvent(new Event('auth-change'));

            window.location.href = '/';
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    useEffect(() => {
        const handleAuthChange = () => {
            void refresh();
        };

        window.addEventListener('auth-change', handleAuthChange);

        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
        };
    }, [refresh]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                refresh,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}

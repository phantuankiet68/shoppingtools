'use client';

import { createContext, useContext, useEffect, useState } from 'react';

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
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    const [loading, setLoading] = useState(true);

    async function logout() {
        await fetch('/api/v1/auth/signout', {
            method: 'POST',
        });

        setUser(null);

        window.location.href = '/';
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

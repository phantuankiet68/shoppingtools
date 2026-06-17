'use client';

import type { AdminLocale } from '@/lib/admin/i18n/config';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

type Messages = Record<string, any>;

type AdminI18nValue = {
    locale: AdminLocale;
    messages: Messages;

    t: (key: string) => string;

    tf: (key: string, vars?: Record<string, string>) => string;
};

const AdminI18nContext = createContext<AdminI18nValue | null>(null);

function translate(messages: Messages, key: string): string {
    const value = key.split('.').reduce<any>((acc, part) => acc?.[part], messages);

    return typeof value === 'string' ? value : key;
}

function translateFormat(messages: Messages, key: string, vars?: Record<string, string>): string {
    let text = translate(messages, key);

    if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
            text = text.replaceAll(`{${k}}`, v);
        });
    }

    return text;
}

export function AdminI18nProvider({
    value,
    children,
}: {
    value: {
        locale: AdminLocale;
        messages: Messages;
    };
    children: ReactNode;
}) {
    const contextValue = useMemo<AdminI18nValue>(() => {
        return {
            locale: value.locale,

            messages: value.messages,

            t: (key: string) => translate(value.messages, key),

            tf: (key: string, vars?: Record<string, string>) =>
                translateFormat(value.messages, key, vars),
        };
    }, [value]);

    return <AdminI18nContext.Provider value={contextValue}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n() {
    const context = useContext(AdminI18nContext);

    if (!context) {
        throw new Error('useAdminI18n must be used within AdminI18nProvider');
    }

    return context;
}

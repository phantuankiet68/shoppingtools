import type { ReactNode } from 'react';

import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

import {
    AdminAuthProvider,
    type AdminAuthData,
} from '@/components/admin/providers/AdminAuthProvider';

import {
    AdminI18nProvider,
    type AdminI18nData,
} from '@/components/admin/providers/AdminI18nProvider';

import { ModalProvider } from '@/components/admin/shared/common/modal';
import { FunctionKeysProvider } from '@/components/admin/shared/layout/function-keys/FunctionKeysProvider';

type Props = {
    auth: AdminAuthData | null;
    i18n: AdminI18nData;
    children: ReactNode;
};

export function AdminProviders({ auth, i18n, children }: Props) {
    return (
        <AdminAuthProvider value={auth}>
            <AdminI18nProvider value={i18n}>
                <FunctionKeysProvider>
                    <AdminLayoutClient>
                        <ModalProvider>{children}</ModalProvider>
                    </AdminLayoutClient>
                </FunctionKeysProvider>
            </AdminI18nProvider>
        </AdminAuthProvider>
    );
}

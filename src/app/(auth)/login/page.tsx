// app/(auth)/login/page.tsx

import { Suspense } from 'react';
import AdminLoginPage from './AdminLoginPage';

export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <Suspense fallback={null}>
            <AdminLoginPage />
        </Suspense>
    );
}

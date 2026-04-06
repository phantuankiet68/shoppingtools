import 'server-only';
import { headers } from 'next/headers';
import type { AdminAuthData } from '@/components/admin/providers/AdminAuthProvider';

export async function getAdminAuth(): Promise<AdminAuthData> {
  const h = await headers();
  const host = h.get('host');

  if (!host) {
    throw new Error('Missing host header');
  }

  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const cookie = h.get('cookie') ?? '';

  const res = await fetch(`${protocol}://${host}/api/admin/auth/me`, {
    method: 'GET',
    headers: {
      cookie,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch admin auth');
  }

  return res.json();
}
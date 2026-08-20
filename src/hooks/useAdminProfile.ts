'use client';

import { useCallback, useEffect, useState } from 'react';

import { EMPTY_PROFILE } from '@/constants/profile/profile';
import type { Profile } from '@/lib/types/profile';

import { mapProfile, mapProfilePayload } from '@/utils/profile.mapper';

import { useModal } from '@/components/admin/shared/common/modal';

type UseAdminProfileProps = {
    workspaceId?: string;
    userEmail?: string;
};

export function useAdminProfile({ workspaceId, userEmail }: UseAdminProfileProps) {
    const modal = useModal();

    const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const updateField = useCallback(<K extends keyof Profile>(key: K, value: Profile[K]) => {
        setProfile((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const handleUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'cover') => {
            try {
                const file = e.target.files?.[0];

                if (!file) {
                    return;
                }

                const fd = new FormData();

                fd.append('file', file);
                fd.append('type', type);

                const res = await fetch('/api/admin/profile/upload', {
                    method: 'POST',
                    body: fd,
                });

                const data = await res.json();

                if (!res.ok) {
                    modal.error('Upload Failed', data?.error ?? 'Unable to upload image.');

                    return;
                }

                updateField(type, data.image);

                modal.success('Upload Success', `${type} image uploaded successfully.`);
            } catch (error) {
                console.error(error);

                modal.error('Upload Error', 'Something went wrong while uploading image.');
            }
        },
        [updateField, modal],
    );

    return {
        profile,
        setProfile,

        loading,
        saving,

        updateField,
        handleUpload,
    };
}

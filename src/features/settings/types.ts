// features/settings/types.ts

import type { LucideIcon } from 'lucide-react';

export type SettingTabKey =
    | 'profile'
    | 'password'
    | 'domain'
    | 'security'
    | 'layout'
    | 'language'
    | 'notification'
    | 'system';

export interface SettingMenuItem {
    key: SettingTabKey;
    title: string;
    description?: string;
    icon: LucideIcon;
    disabled?: boolean;
}

export interface SettingTabProps {
    className?: string;
}

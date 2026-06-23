import type { MenuArea } from '@/components/platform/menus/modalAddMenus';
import type { MenuRecord, SummaryState, SystemRole } from '@/features/platform/types/menus/menu';
import { useCallback, useState } from 'react';

type UseMenuActionsProps = {
    menus: MenuRecord[];
    setMenus: React.Dispatch<React.SetStateAction<MenuRecord[]>>;
    setSummary: React.Dispatch<React.SetStateAction<SummaryState>>;
    fetchMenus: () => Promise<void>;
    setLoadingMenus: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useMenuActions({
    menus,
    setMenus,
    setSummary,
    fetchMenus,
    setLoadingMenus,
}: UseMenuActionsProps) {
    const [savingMenuId, setSavingMenuId] = useState<string | null>(null);

    const handleToggleAdminPermission = useCallback(
        async (menu: MenuRecord) => {
            try {
                setSavingMenuId(menu.id);

                const response = await fetch(`/api/platform/menus/${menu.id}/role-permission`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        systemRole: 'ADMIN',
                        enabled: !menu.permission.enabled,
                    }),
                });

                const contentType = response.headers.get('content-type') || '';

                const data:
                    | {
                          id: string;
                          menuId: string;
                          systemRole: SystemRole;
                          enabled: boolean;
                          createdAt?: string;
                          updatedAt?: string;
                      }
                    | { message?: string }
                    | null = contentType.includes('application/json')
                    ? await response.json()
                    : null;

                if (!response.ok) {
                    throw new Error(
                        (data as { message?: string } | null)?.message ||
                            'Failed to update menu permission',
                    );
                }

                const updatedPermission = data as {
                    id: string;
                    menuId: string;
                    systemRole: SystemRole;
                    enabled: boolean;
                    createdAt?: string;
                    updatedAt?: string;
                };

                setMenus((prev) =>
                    prev.map((item) =>
                        item.id === menu.id
                            ? {
                                  ...item,
                                  permission: {
                                      id: updatedPermission.id,
                                      systemRole: updatedPermission.systemRole,
                                      enabled: updatedPermission.enabled,
                                      createdAt: updatedPermission.createdAt,
                                      updatedAt: updatedPermission.updatedAt,
                                  },
                              }
                            : item,
                    ),
                );

                setSummary((prev) => {
                    const wasEnabled = menu.permission.enabled;
                    const isEnabled = updatedPermission.enabled;

                    if (wasEnabled === isEnabled) {
                        return prev;
                    }

                    return {
                        ...prev,
                        enabled: isEnabled ? prev.enabled + 1 : prev.enabled - 1,
                        disabled: isEnabled ? prev.disabled - 1 : prev.disabled + 1,
                    };
                });
            } catch (err) {
                console.error(err);

                window.alert(
                    err instanceof Error ? err.message : 'Failed to update menu permission',
                );
            } finally {
                setSavingMenuId(null);
            }
        },
        [setMenus, setSummary],
    );

    const handleBulkToggleByArea = useCallback(
        async (targetArea: MenuArea, enabled: boolean) => {
            try {
                setLoadingMenus(true);

                const targetMenus = menus.filter((menu) => menu.area === targetArea);

                await Promise.all(
                    targetMenus.map(async (menu) => {
                        const response = await fetch(
                            `/api/platform/menus/${menu.id}/role-permission`,
                            {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    systemRole: 'ADMIN',
                                    enabled,
                                }),
                            },
                        );

                        if (!response.ok) {
                            const contentType = response.headers.get('content-type') || '';

                            const data = contentType.includes('application/json')
                                ? await response.json()
                                : null;

                            throw new Error(data?.message || `Failed to update ${menu.title}`);
                        }
                    }),
                );

                await fetchMenus();
            } catch (err) {
                console.error(err);

                window.alert(err instanceof Error ? err.message : 'Bulk update failed');
            } finally {
                setLoadingMenus(false);
            }
        },
        [menus, fetchMenus, setLoadingMenus],
    );

    return {
        savingMenuId,
        handleToggleAdminPermission,
        handleBulkToggleByArea,
    };
}

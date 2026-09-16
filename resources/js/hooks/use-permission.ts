import { usePage } from '@inertiajs/react';

export function usePermission() {
    const page = usePage();
    const userPermissions = (page.props as any).userPermissions ?? [];

    const can = (permission: string | string[]): boolean => {
        if (!permission) return true;
        if (Array.isArray(permission)) {
            return permission.some((p) => userPermissions.includes(p));
        }
        return userPermissions.includes(permission);
    };

    const canAll = (permissions: string[]): boolean => {
        if (!permissions || permissions.length === 0) return true;
        return permissions.every((p) => userPermissions.includes(p));
    };

    return {
        permissions: userPermissions,
        can,
        canAll,
    };
}

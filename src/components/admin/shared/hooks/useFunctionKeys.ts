'use client';

import { FunctionKeyCode } from '@/components/admin/shared/layout/function-keys/functionKeys';
import { useEffect } from 'react';

type ActionMap = Partial<Record<FunctionKeyCode, () => void>>;

export default function useFunctionKeys(actions: ActionMap) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const key = e.key as FunctionKeyCode;

            if (!actions[key]) return;
            const target = e.target as HTMLElement;

            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            e.preventDefault();

            actions[key]?.();
        };

        window.addEventListener('keydown', handler);

        return () => {
            window.removeEventListener('keydown', handler);
        };
    }, [actions]);
}

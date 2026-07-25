'use client';

import React from 'react';
import cls from '@/styles/admin/pages/array-field.module.css';
import type { InspectorField } from '@/lib/ui-builder/types';

type ArrayInspectorField = Extract<
    InspectorField,
    {
        kind: 'array';
    }
>;

type Props = {
    field: ArrayInspectorField;
    value: unknown;
    onChange: (value: unknown[]) => void;
};

export default function ArrayField({ field, value, onChange }: Props) {
    const items = React.useMemo(() => (Array.isArray(value) ? value : []), [value]);

    const [collapsed, setCollapsed] = React.useState<Record<number, boolean>>({});

    const addItem = () => {
        onChange([...items, {}]);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const toggleCollapse = (index: number) => {
        setCollapsed((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    return (
        <div className={cls.wrapper}>
            <div className={cls.header}>
                <span>{field.label}</span>

                <button type="button" className={cls.addButton} onClick={addItem}>
                    <i className="bi bi-plus-lg" />
                    Add {field.itemLabel ?? 'Item'}
                </button>
            </div>

            {items.length === 0 && <div className={cls.empty}>No items</div>}

            {items.map((item, index) => (
                <div key={index} className={cls.card}>
                    <div className={cls.cardHeader}>
                        <button
                            type="button"
                            className={cls.collapse}
                            onClick={() => toggleCollapse(index)}
                        >
                            <i
                                className={`bi ${
                                    collapsed[index] ? 'bi-chevron-right' : 'bi-chevron-down'
                                }`}
                            />
                        </button>

                        <span>
                            {field.itemLabel ?? 'Item'} #{index + 1}
                        </span>

                        <button
                            type="button"
                            className={cls.remove}
                            onClick={() => removeItem(index)}
                        >
                            <i className="bi bi-trash" />
                        </button>
                    </div>

                    {!collapsed[index] && (
                        <div className={cls.body}>{/* Render fields ở Part 2 */}</div>
                    )}
                </div>
            ))}
        </div>
    );
}

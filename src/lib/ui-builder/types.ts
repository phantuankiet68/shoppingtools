import React from 'react';

export type FieldKind =
    | 'text'
    | 'textarea'
    | 'number'
    | 'check'
    | 'toggle'
    | 'select'
    | 'image'
    | 'localized-text'
    | 'array';
export type SelectOption = {
    label: string;
    value: string;
};

export type InspectorField =
    | {
          key: string;
          label: string;
          kind: 'text';
          placeholder?: string;
      }
    | {
          key: string;
          label: string;
          kind: 'textarea';
          placeholder?: string;
          rows?: number;
      }
    | {
          key: string;
          label: string;
          kind: 'check';
      }
    | {
          key: string;
          label: string;
          kind: 'select';
          options: SelectOption[];
      }
    | {
          key: string;
          label: string;
          kind: 'number';
          min?: number;
          max?: number;
          step?: number;
      }
    | {
          key: string;
          label: string;
          kind: 'image';
          folder?: string;
          accept?: string;
      }
    | {
          key: string;
          label: string;
          kind: 'toggle';
          leftLabel?: string;
          rightLabel?: string;
      }
    | {
          key: string;
          label: string;
          kind: 'localized-text';
      }
    | {
          key: string;
          label: string;
          kind: 'array';
          itemLabel?: string;
          fields: InspectorField[];
      };

export type Slots = {
    slot: (name?: string) => React.ReactNode;
    slotAt: (idx: number, name?: string) => React.ReactNode;
};

export type RegItem = {
    kind: string;
    label: string;
    defaults: Record<string, unknown>;
    inspector: InspectorField[];
    render: (props: Record<string, unknown>, slots: Slots) => React.ReactNode;
};

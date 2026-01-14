"use client";
import React from "react";
import cls from "@/styles/admin/pages/inspector.module.css";
import Section from "./parts/Section";
import TextInput from "./parts/TextInput";
import LabeledRow from "./parts/LabeledRow";

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
};

type JsonListEditorProps<T extends Record<string, any>> = {
  label: string;
  json?: string;
  onChangeJson: (nextJson: string) => void;
  fields: FieldDef[];
  makeDefaultItem: () => T;
};

export function JsonListEditor<T extends Record<string, any>>({ label, json, onChangeJson, fields, makeDefaultItem }: JsonListEditorProps<T>) {
  const items: T[] = React.useMemo(() => {
    try {
      const v = json ? JSON.parse(json) : [];
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }, [json]);

  const write = (next: T[]) => {
    onChangeJson(JSON.stringify(next, null, 2));
  };

  return (
    <Section title={label}>
      {items.map((item, idx) => (
        <div key={idx} className={cls.cardRow}>
          {fields.map((f) => (
            <LabeledRow key={f.key} label={f.label}>
              <TextInput
                value={String(item[f.key] ?? "")}
                placeholder={f.placeholder}
                onChange={(v) => {
                  const next = items.slice();
                  next[idx] = { ...next[idx], [f.key]: v };
                  write(next);
                }}
              />
            </LabeledRow>
          ))}

          <button type="button" className={cls.btnDanger} onClick={() => write(items.filter((_, i) => i !== idx))}>
            <i className="bi bi-trash" /> Xóa
          </button>
        </div>
      ))}

      <button type="button" className={cls.btnGhost} onClick={() => write([...items, makeDefaultItem()])}>
        <i className="bi bi-plus-circle" /> Thêm
      </button>
    </Section>
  );
}

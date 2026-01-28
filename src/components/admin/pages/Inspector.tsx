// Inspector.tsx (phiên bản generic + custom editor)

"use client";
import React from "react";
import type { Block } from "@/lib/page/types";
import { REGISTRY } from "@/lib/ui-builder/registry";
import cls from "@/styles/admin/pages/inspector.module.css";

import { CUSTOM_EDITORS } from "@/components/admin/templates/ShopTemplate/editors";

type Props = {
  active: Block | null;
  move: (dir: -1 | 1) => void;
  remove: () => void;
  updateActive: (patch: Record<string, any>) => void;
};

export default function Inspector({ active, move, remove, updateActive }: Props) {
  if (!active) {
    return (
      <div className={cls.panel}>
        <div className={cls.empty}>Select a block to edit.</div>
      </div>
    );
  }

  const reg = REGISTRY.find((r) => r.kind === active.kind);
  const props = active.props ?? {};
  const CustomEditor = CUSTOM_EDITORS[active.kind];

  if (!reg && !CustomEditor) {
    return (
      <div className={cls.panel}>
        <div className={cls.empty}>
          There is no inspector for <b>{active.kind}</b>
        </div>
      </div>
    );
  }

  return (
    <div className={cls.panel}>
      <div className={cls.header}>
        <div className={cls.headerLeft}>
          <div className={cls.blockIcon} />
          <div className={cls.blockTitle}>{reg?.label ?? active.kind}</div>
        </div>
        <div className={cls.headerTools}>
          <button className={cls.kebab} title="More">
            <i className="bi bi-three-dots" />
          </button>
        </div>
      </div>

      {CustomEditor && <CustomEditor props={props} updateActive={updateActive} />}

      {reg?.inspector && reg.inspector.length > 0 && (
        <div className={cls.section}>
          <div className={cls.sectionHeadSimple}>
            <span className={cls.sectionTitle}>Properties</span>
          </div>
          <div className={cls.sectionBody}>
            {reg.inspector.map((field: any) => {
              const value = props[field.key] ?? "";

              if (field.kind === "text") {
                return (
                  <Row key={field.key} label={field.label}>
                    <input className={cls.input} value={value} onChange={(e) => updateActive({ [field.key]: e.target.value })} />
                  </Row>
                );
              }

              if (field.kind === "number") {
                return (
                  <Row key={field.key} label={field.label}>
                    <input
                      type="number"
                      className={cls.input}
                      value={value}
                      onChange={(e) =>
                        updateActive({
                          [field.key]: Number(e.target.value),
                        })
                      }
                    />
                  </Row>
                );
              }

              if (field.kind === "textarea") {
                return (
                  <Row key={field.key} label={field.label} stack>
                    <textarea className={cls.textarea} rows={6} value={value} onChange={(e) => updateActive({ [field.key]: e.target.value })} />
                  </Row>
                );
              }

              if (field.kind === "select") {
                return (
                  <Row key={field.key} label={field.label}>
                    <select className={cls.select} value={value} onChange={(e) => updateActive({ [field.key]: e.target.value })}>
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </Row>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      <div className={cls.footerBtns}>
        <button className={cls.btnGhost} onClick={() => move(-1)} title="Move up">
          <i className="bi bi-arrow-up" />
        </button>
        <button className={cls.btnGhost} onClick={() => move(1)} title="Move down">
          <i className="bi bi-arrow-down" />
        </button>
        <button className={cls.btnDanger} onClick={remove} title="Delete">
          <i className="bi bi-trash" />
        </button>
      </div>
    </div>
  );
}

function Row({ label, children, stack }: { label: string; children: React.ReactNode; stack?: boolean }) {
  return stack ? (
    <div className={cls.rowStack}>
      <div className={cls.rowLabel}>{label}</div>
      <div className={cls.rowField}>{children}</div>
    </div>
  ) : (
    <div className={cls.row}>
      <div className={cls.rowLabel}>{label}</div>
      <div className={cls.rowField}>{children}</div>
    </div>
  );
}

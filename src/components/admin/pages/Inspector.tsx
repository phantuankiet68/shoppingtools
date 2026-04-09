"use client";

import React from "react";
import type { Block } from "@/lib/pages/types";
import { REGISTRY } from "@/lib/ui-builder/registry";
import type { InspectorField } from "@/lib/ui-builder/types";
import cls from "@/styles/admin/pages/inspector.module.css";

import { CUSTOM_EDITORS } from "@/components/admin/shared/templates/ShopTemplate/editors";

type Props = {
  active: Block | null;
  move: (dir: -1 | 1) => void;
  remove: () => void;
  updateActive: (patch: Record<string, unknown>) => void;
};

export default React.memo(function Inspector({ active, move, remove, updateActive }: Props) {
  const { reg, CustomEditor } = React.useMemo(() => {
    const kind = active?.kind;
    if (!kind) return { reg: undefined, CustomEditor: undefined };
    return {
      reg: REGISTRY.find((r) => r.kind === kind),
      CustomEditor: CUSTOM_EDITORS[kind],
    };
  }, [active?.kind]);

  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null);
  const [uploadError, setUploadError] = React.useState<string>("");

  const handlePickImage = React.useCallback((key: string) => {
    setUploadError("");
    fileInputRefs.current[key]?.click();
  }, []);

  const uploadImage = React.useCallback(async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json().catch(() => null);
    console.log("upload status:", res.status);
    console.log("upload response:", data);

    if (!res.ok) {
      throw new Error(data?.error || "Upload failed");
    }

    const url = data?.url || data?.urls?.[0];
    if (!url || typeof url !== "string") {
      throw new Error("Upload response missing image url");
    }

    return url;
  }, []);

  const handleImageChange = React.useCallback(
    async (key: string, file?: File | null) => {
      if (!file) return;

      try {
        setUploadError("");
        setUploadingKey(key);

        const url = await uploadImage(file);
        updateActive({ [key]: url });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        setUploadError(message);
      } finally {
        setUploadingKey(null);

        const input = fileInputRefs.current[key];
        if (input) input.value = "";
      }
    },
    [updateActive, uploadImage],
  );

  const isImageField = React.useCallback((field: InspectorField) => {
    return field.kind === "text" && field.key === "logoSrc";
  }, []);

  if (!active) {
    return (
      <div className={cls.panel}>
        <div className={cls.empty}>Chọn một block để chỉnh sửa</div>
      </div>
    );
  }

  const props = active.props ?? {};

  if (!reg && !CustomEditor) {
    return (
      <div className={cls.panel}>
        <div className={cls.empty}>
          Không có inspector cho <b>{active.kind}</b>
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
          <button type="button" className={cls.kebab} title="More">
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
            {reg.inspector.map((field: InspectorField) => {
              const value = props[field.key];

              if (isImageField(field)) {
                const imageSrc = typeof value === "string" ? value : "";
                const isUploading = uploadingKey === field.key;

                return (
                  <Row key={field.key} label={field.label} stack>
                    <div className={cls.fieldUpload}>
                      <button
                        type="button"
                        onClick={() => handlePickImage(field.key)}
                        disabled={isUploading}
                        style={{
                          width: "100%",
                          border: "2px dashed #7aa7ff",
                          background: "#eef2f7",
                          borderRadius: 12,
                          padding: 16,
                          cursor: isUploading ? "not-allowed" : "pointer",
                          textAlign: "center",
                          opacity: isUploading ? 0.7 : 1,
                        }}
                      >
                        {imageSrc ? (
                          <div>
                            <img
                              src={imageSrc}
                              alt={field.label}
                              style={{
                                maxWidth: "100%",
                                maxHeight: 140,
                                objectFit: "contain",
                                display: "block",
                                margin: "0 auto 10px",
                              }}
                            />
                            <div style={{ fontSize: 13, color: "#5b6472" }}>
                              {isUploading ? "Đang upload..." : "Bấm để đổi ảnh"}
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: "#5b6472" }}>
                            <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 8 }}>
                              <i className="bi bi-upload" />
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                              {isUploading ? "Đang upload..." : "Upload your files here"}
                            </div>
                            {!isUploading && (
                              <div style={{ color: "#3b82f6", textDecoration: "underline" }}>Browse</div>
                            )}
                          </div>
                        )}
                      </button>

                      <input
                        ref={(el) => {
                          fileInputRefs.current[field.key] = el;
                        }}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(field.key, e.target.files?.[0])}
                      />

                      <div style={{ marginTop: 10 }}>
                        <input
                          className={cls.input}
                          value={imageSrc}
                          placeholder="Hoặc nhập URL ảnh"
                          onChange={(e) => updateActive({ [field.key]: e.target.value })}
                        />
                      </div>

                      {uploadError && <div style={{ marginTop: 8, fontSize: 13, color: "#dc2626" }}>{uploadError}</div>}
                    </div>
                  </Row>
                );
              }

              if (field.kind === "text") {
                return (
                  <Row key={field.key} label={field.label}>
                    <input
                      className={cls.input}
                      value={(value as string) ?? ""}
                      onChange={(e) => updateActive({ [field.key]: e.target.value })}
                    />
                  </Row>
                );
              }

              if (field.kind === "number") {
                return (
                  <Row key={field.key} label={field.label}>
                    <input
                      type="number"
                      className={cls.input}
                      value={(value as string | number) ?? ""}
                      onChange={(e) =>
                        updateActive({
                          [field.key]: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </Row>
                );
              }

              if (field.kind === "textarea") {
                return (
                  <Row key={field.key} label={field.label} stack>
                    <textarea
                      className={cls.textarea}
                      rows={field.rows ?? 8}
                      value={(value as string) ?? ""}
                      onChange={(e) => updateActive({ [field.key]: e.target.value })}
                    />
                  </Row>
                );
              }

              if (field.kind === "select") {
                return (
                  <Row key={field.key} label={field.label}>
                    <select
                      className={cls.select}
                      value={(value as string) ?? ""}
                      onChange={(e) => updateActive({ [field.key]: e.target.value })}
                    >
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </Row>
                );
              }

              if (field.kind === "check") {
                return (
                  <Row key={field.key} label={field.label}>
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => updateActive({ [field.key]: e.target.checked })}
                    />
                  </Row>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      <div className={cls.footerBtns}>
        <button type="button" className={cls.btnGhost} onClick={() => move(-1)} title="Move up">
          <i className="bi bi-arrow-up" />
        </button>
        <button type="button" className={cls.btnGhost} onClick={() => move(1)} title="Move down">
          <i className="bi bi-arrow-down" />
        </button>
        <button type="button" className={cls.btnDanger} onClick={remove} title="Delete">
          <i className="bi bi-trash" />
        </button>
      </div>
    </div>
  );
});

const Row = React.memo(function Row({
  label,
  children,
  stack,
}: {
  label: string;
  children: React.ReactNode;
  stack?: boolean;
}) {
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
});

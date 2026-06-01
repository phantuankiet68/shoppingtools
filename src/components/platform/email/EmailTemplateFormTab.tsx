"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { EmailTemplate } from "@/app/platform/email/page";

import styles from "@/styles/platform/email/emailTemplateForm.module.css";

type Props = {
  onSubmit: (payload: { name: string; image?: string; html: string }) => Promise<void>;

  editingTemplate?: EmailTemplate | null;
};

const DEFAULT_HTML = ``;

export default function EmailTemplateFormTab({ onSubmit, editingTemplate }: Props) {
  const [name, setName] = useState(() => editingTemplate?.name ?? "");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState(() => editingTemplate?.image ?? "");

  const [html, setHtml] = useState(() => editingTemplate?.html ?? DEFAULT_HTML);

  const [saving, setSaving] = useState(false);

  const previewHtml = useMemo(() => {
    return html
      .replaceAll("{{name}}", "John Doe")
      .replaceAll("{{email}}", "[john@example.com](mailto:john@example.com)")
      .replaceAll("{{site_name}}", "My Website")
      .replaceAll("{{website_url}}", "https://example.com")
      .replaceAll("{{unsubscribe_url}}", "https://example.com/unsubscribe");
  }, [html]);

  async function handleSave() {
    if (saving) {
      return;
    }

    if (!name.trim()) {
      alert("Template name is required");
      return;
    }

    if (!html.trim()) {
      alert("HTML content is required");
      return;
    }

    try {
      setSaving(true);

      let imageUrl = editingTemplate?.image ?? undefined;

      if (imageFile) {
        const formData = new FormData();

        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/platform/email/templates/upload", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message ?? "Upload failed");
        }

        imageUrl = uploadResult.url;
      }

      await onSubmit({
        name: name.trim(),
        image: imageUrl,
        html,
      });

      alert(editingTemplate ? "Template updated successfully" : "Template created successfully");

      if (!editingTemplate) {
        setName("");
        setImageFile(null);
        setImagePreview("");
        setHtml(DEFAULT_HTML);
      }
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : editingTemplate
            ? "Failed to update template"
            : "Failed to create template",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.builderCard}>
      <div className={styles.builderGrid}>
        <div className={styles.formPanel}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              {" "}
              <i className="bi bi-envelope-paper-heart-fill" />{" "}
            </div>

            <div className={styles.sectionContent}>
              <h3>{editingTemplate ? "Edit Template" : "Template Information"}</h3>

              <p>
                {editingTemplate
                  ? "Update your email template information."
                  : "Configure your email template details and content."}
              </p>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <i className="bi bi-envelope-paper-heart" />
              Template Name
            </label>

            <input type="text" value={name} placeholder="Modern Newsletter" onChange={(e) => setName(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>
              <i className="bi bi-image" />
              Template Preview Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) {
                  return;
                }

                setImageFile(file);

                setImagePreview(URL.createObjectURL(file));
              }}
            />

            {imagePreview && (
              <div
                style={{
                  marginTop: 12,
                  position: "relative",
                  width: "100%",
                  maxWidth: 320,
                  height: 180,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                }}
              >
                <Image
                  src={imagePreview}
                  alt="Template Preview"
                  fill
                  sizes="320px"
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>

          <div className={styles.variableBox}>
            <div className={styles.variableHeader}>
              <i className="bi bi-braces" />
              Available Variables
            </div>

            <div className={styles.variableList}>
              <code>{"{{name}}"}</code>
              <code>{"{{email}}"}</code>
              <code>{"{{site_name}}"}</code>
              <code>{"{{website_url}}"}</code>
              <code>{"{{unsubscribe_url}}"}</code>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <i className="bi bi-code-slash" />
              HTML Content
            </label>

            <textarea rows={20} value={html} className={styles.htmlEditor} onChange={(e) => setHtml(e.target.value)} />
          </div>

          <button type="button" onClick={handleSave} disabled={saving} className={styles.saveButton}>
            <i className={editingTemplate ? "bi bi-pencil-square" : "bi bi-floppy-fill"} />

            {saving
              ? editingTemplate
                ? "Updating Template..."
                : "Saving Template..."
              : editingTemplate
                ? "Update Template"
                : "Save Template"}
          </button>
        </div>

        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <div className={styles.previewTitle}>
              <i className="bi bi-envelope-open-heart" />
              Email Preview
            </div>

            <div className={styles.previewBadge}>Live Preview</div>
          </div>

          <div className={styles.previewContainer}>
            <iframe title="Email Preview" srcDoc={previewHtml} className={styles.previewFrame} sandbox="" />
          </div>
        </div>
      </div>
    </div>
  );
}

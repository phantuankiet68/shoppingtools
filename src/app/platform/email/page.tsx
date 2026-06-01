"use client";

import { useCallback, useEffect, useState } from "react";
import { useModal } from "@/components/admin/shared/common/modal";
import styles from "@/styles/platform/email/template.module.css";

import EmailTemplateListTab from "@/components/platform/email/EmailTemplateListTab";
import EmailTemplateFormTab from "@/components/platform/email/EmailTemplateFormTab";

type TabType = "list" | "create";

export type EmailTemplate = {
  id: string;
  name: string;
  image: string | null;
  html: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function EmailTemplatePage() {
  const [activeTab, setActiveTab] = useState<TabType>("list");

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  const [loading, setLoading] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const modal = useModal();

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/platform/email/templates", {
        cache: "no-store",
      });

      const data = await response.json();

      setTemplates(data.items ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await loadTemplates();

      setEditingTemplate(null);

      setActiveTab("list");
    };

    void initialize();
  }, [loadTemplates]);

  const saveTemplate = async (payload: { name: string; image?: string; html: string }) => {
    try {
      if (editingTemplate) {
        const response = await fetch(`/api/platform/email/templates/${editingTemplate.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to update template");
        }

        await loadTemplates();

        modal.success("Success", `Updated "${payload.name}" successfully.`);

        setEditingTemplate(null);
        setActiveTab("list");

        return;
      }

      const response = await fetch("/api/platform/email/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create template");
      }

      await loadTemplates();

      modal.success("Success", `Created "${payload.name}" successfully.`);

      setEditingTemplate(null);
      setActiveTab("list");
    } catch (error) {
      console.error(error);

      modal.error("Error", error instanceof Error ? error.message : "Failed to save template");
    }
  };

  const deleteTemplate = async (id: string) => {
    const current = templates.find((item) => item.id === id);

    if (!current) {
      return;
    }

    modal.confirmDelete("Delete template?", `Delete "${current.name}"? This action cannot be undone.`, async () => {
      try {
        const response = await fetch(`/api/platform/email/templates/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete template");
        }

        if (editingTemplate?.id === id) {
          setEditingTemplate(null);
          setActiveTab("list");
        }

        await loadTemplates();

        modal.success("Success", `Deleted "${current.name}" successfully.`);
      } catch (error) {
        console.error(error);

        modal.error("Error", error instanceof Error ? error.message : "Failed to delete template");
      }
    });
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setActiveTab("create");
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setActiveTab("create");
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroIcon}>
            <i className="bi bi-envelope-paper-heart-fill" />
          </div>

          <div className={styles.heroContent}>
            <span className={styles.badge}>
              <i className="bi bi-stars" />
              Email Templates Management
            </span>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <i className="bi bi-file-earmark-richtext" />
                <span>{templates.length} Templates</span>
              </div>

              <div className={styles.heroStat}>
                <i className="bi bi-lightning-charge-fill" />
                <span>Ready to Use</span>
              </div>

              <div className={styles.heroStat}>
                <i className="bi bi-envelope-check-fill" />
                <span>Email Marketing</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.segmented}>
            <button
              type="button"
              className={`${styles.segment} ${activeTab === "list" ? styles.segmentActive : ""}`}
              onClick={() => setActiveTab("list")}
            >
              <i className="bi bi-grid-3x3-gap" />
              Templates
            </button>

            <button
              type="button"
              className={`${styles.segment} ${activeTab === "create" ? styles.segmentActive : ""}`}
              onClick={handleCreateTemplate}
            >
              <i className="bi bi-plus-circle" />
              Create Template
            </button>
          </div>
        </div>
      </div>

      <div className={styles.contentCard}>
        {loading && activeTab === "list" ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Loading templates...</span>
          </div>
        ) : activeTab === "list" ? (
          <EmailTemplateListTab
            templates={templates}
            loading={loading}
            onRefresh={loadTemplates}
            onDelete={deleteTemplate}
            onEdit={handleEditTemplate}
          />
        ) : (
          <EmailTemplateFormTab
            key={editingTemplate?.id ?? "new"}
            onSubmit={saveTemplate}
            editingTemplate={editingTemplate}
          />
        )}
      </div>
    </div>
  );
}

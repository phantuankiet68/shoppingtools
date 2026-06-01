"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import styles from "@/styles/platform/email/emailTemplate.module.css";

export type EmailTemplate = {
  id: string;
  name: string;
  image: string | null;
  html: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  templates: EmailTemplate[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (template: EmailTemplate) => void;
};

const ITEMS_PER_PAGE = 7;

export default function EmailTemplateListTab({ templates, loading, onRefresh, onDelete, onEdit }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTemplates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return templates;
    }

    return templates.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [search, templates]);

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTemplates = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredTemplates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTemplates, safeCurrentPage]);

  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  const startItem = filteredTemplates.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredTemplates.length);

  const formatDate = (value?: string) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
  };
  return (
    <div className={styles.tableCard}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <i className="bi bi-search" />

          <input
            type="text"
            placeholder="Search email templates..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button type="button" className={styles.refreshButton} onClick={() => void onRefresh()}>
          <i className="bi bi-arrow-clockwise" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <div className={styles.thContent}>
                  <i className="bi bi-image" />
                  Preview
                </div>
              </th>

              <th>
                <div className={styles.thContent}>
                  <i className="bi bi-envelope-paper-heart" />
                  Template
                </div>
              </th>

              <th>
                <div className={styles.thContent}>
                  <i className="bi bi-check-circle" />
                  Status
                </div>
              </th>

              <th>
                <div className={styles.thContent}>
                  <i className="bi bi-calendar-plus" />
                  Created
                </div>
              </th>

              <th>
                <div className={styles.thContent}>
                  <i className="bi bi-clock-history" />
                  Updated
                </div>
              </th>

              <th className={styles.actionColumn}>
                <div className={styles.thContent}>
                  <i className="bi bi-gear" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  <div className={styles.loadingWrapper}>
                    <div className={styles.loader} />
                    <span>Loading templates...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTemplates.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  <div className={styles.emptyWrapper}>
                    <div className={styles.emptyIcon}>
                      <i className="bi bi-envelope-paper" />
                    </div>

                    <h3>No Templates Found</h3>

                    <p>Create your first email template and start building beautiful campaigns.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTemplates.map((template) => (
                <tr key={template.id}>
                  <td>
                    {template.image ? (
                      <div className={styles.previewCard}>
                        <Image
                          src={template.image}
                          alt={template.name}
                          width={80}
                          height={45}
                          className={styles.templateImage}
                        />
                      </div>
                    ) : (
                      <div className={styles.noPreview}>
                        <i className="bi bi-image" />
                        <span>No Preview</span>
                      </div>
                    )}
                  </td>

                  <td>
                    <div className={styles.templateInfo}>
                      <div className={styles.templateAvatar}>
                        <i className="bi bi-envelope-paper-heart" />
                      </div>

                      <div>
                        <strong>{template.name}</strong>

                        <small>Email Template</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={template.isActive ? styles.activeBadge : styles.inactiveBadge}>
                      <i className={template.isActive ? "bi bi-check-circle-fill" : "bi bi-pause-circle-fill"} />

                      {template.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className={styles.dateCell}>{formatDate(template.createdAt)}</div>
                  </td>

                  <td>
                    <div className={styles.dateCell}>{formatDate(template.updatedAt)}</div>
                  </td>

                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.viewButton} title="Preview">
                        <i className="bi bi-eye" />
                      </button>

                      <button type="button" className={styles.editButton} title="Edit" onClick={() => onEdit(template)}>
                        <i className="bi bi-pencil-square" />
                      </button>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        title="Delete"
                        onClick={() => void onDelete(template.id)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredTemplates.length > 0 && (
        <div className={styles.paginationWrapper}>
          <div className={styles.paginationInfo}>
            Showing {startItem} - {endItem} of {filteredTemplates.length} templates
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <i className="bi bi-chevron-left" />
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`${styles.pageButton} ${safeCurrentPage === page ? styles.activePage : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className={styles.pageButton}
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

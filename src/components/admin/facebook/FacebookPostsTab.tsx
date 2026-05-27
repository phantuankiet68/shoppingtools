"use client";

import Image from "next/image";

import { useEffect, useState, useTransition } from "react";

import styles from "@/styles/admin/facebook/facebook.module.css";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

import { useModal } from "@/components/admin/shared/common/modal";

type FacebookPost = {
  id: string;

  title: string;

  description: string;

  hashtags: string | null;

  href: string | null;

  image: string | null;

  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";

  publishAt: string | null;

  createdAt: string;
};

type ApiResponse = {
  items: FacebookPost[];

  total: number;

  page: number;

  pageSize: number;

  pageCount: number;
};

export default function FacebookPostsTab() {
  const { t } = useAdminI18n();

  const { user } = useAdminAuth();

  const modal = useModal();

  const [isPending, startTransition] = useTransition();

  const [posts, setPosts] = useState<FacebookPost[]>([]);

  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [date, setDate] = useState("");

  const refreshPosts = () => {
    startTransition(() => {
      void (async () => {
        try {
          const params = new URLSearchParams();

          if (search.trim()) {
            params.set("q", search);
          }

          if (status) {
            params.set("status", status.toUpperCase());
          }

          if (date) {
            params.set("date", date);
          }

          if (user?.id) {
            params.set("userId", user.id);
          }

          const response = await fetch(`/api/admin/facebook/facebook-posts?${params.toString()}`);

          const data: ApiResponse = await response.json();

          console.log("FACEBOOK POSTS:", data);

          if (!response.ok) {
            modal.error(t("facebook.messages.error"), t("facebook.messages.loadError"));

            return;
          }

          setPosts(data.items || []);

          setTotal(data.total || 0);
        } catch (error) {
          console.error(error);

          modal.error(t("facebook.messages.error"), t("facebook.messages.unexpected"));
        }
      })();
    });
  };

  useEffect(() => {
    if (user?.id) {
      refreshPosts();
    }
  }, [user?.id, search, status, date]);

  const removePost = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/facebook/facebook-posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        modal.error(t("facebook.messages.error"), t("facebook.messages.deleteError"));

        return;
      }

      modal.success(t("facebook.messages.success"), t("facebook.messages.deleteSuccess"));

      setPosts((prev) => prev.filter((post) => post.id !== id));

      setTotal((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error(error);

      modal.error(t("facebook.messages.error"), t("facebook.messages.unexpected"));
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(new Date(value));
  };

  const formatTime = (value: string | null) => {
    if (!value) return "-";

    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  return (
    <div className={styles.postsPage}>
      {/* FILTER */}
      <div className={styles.filterCard}>
        <div className={styles.postsStats}>
          <div className={styles.statsCard}>
            <i className="bi bi-facebook" />

            <div>
              <p>
                {total} <span>{t("facebook.stats.totalPosts")}</span>
              </p>
            </div>
          </div>
        </div>

        <div className={styles.filterGrid}>
          {/* SEARCH */}
          <div className={styles.searchBox}>
            <i className={`bi bi-search ${styles.searchIcon}`} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("facebook.posts.search")}
              className={styles.searchInput}
            />
          </div>

          {/* STATUS */}
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.select}>
            <option value="">{t("facebook.filters.allStatus")}</option>

            <option value="draft">{t("facebook.filters.draft")}</option>

            <option value="scheduled">{t("facebook.filters.scheduled")}</option>

            <option value="published">{t("facebook.filters.published")}</option>
          </select>

          {/* DATE */}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.dateInput} />

          {/* REFRESH */}
          <button type="button" className={styles.refreshBtn} onClick={refreshPosts}>
            {isPending ? <i className="bi bi-arrow-repeat" /> : <i className="bi bi-arrow-clockwise" />}
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className={styles.postsHeader}>
        <div>
          <i className="bi bi-file-earmark-text" />

          <span>{t("facebook.header.post")}</span>
        </div>

        <div>
          <i className="bi bi-link-45deg" />

          <span>{t("facebook.header.url")}</span>
        </div>

        <div>
          <i className="bi bi-check-circle" />

          <span>{t("facebook.header.status")}</span>
        </div>

        <div>
          <i className="bi bi-calendar-event" />

          <span>{t("facebook.header.publishDate")}</span>
        </div>

        <div>
          <i className="bi bi-clock" />

          <span>{t("facebook.header.time")}</span>
        </div>

        <div>
          <i className="bi bi-hash" />

          <span>{t("facebook.header.hashtags")}</span>
        </div>

        <div>
          <i className="bi bi-gear" />

          <span>{t("facebook.header.actions")}</span>
        </div>
      </div>

      {/* POSTS */}
      <div className={styles.postsList}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className={styles.postRow}>
              {/* LEFT */}
              <div className={styles.postMain}>
                <div className={styles.tableImage}>
                  {post.image ? (
                    <Image src={post.image} alt={post.title} fill unoptimized className={styles.postImage} />
                  ) : (
                    <div className={styles.emptyImage}>
                      <i className="bi bi-image" />
                    </div>
                  )}
                </div>

                <div className={styles.postContent}>
                  <h4>{post.title}</h4>

                  <p>{post.description.length > 50 ? `${post.description.slice(0, 50)}...` : post.description}</p>
                </div>
              </div>

              {/* URL */}
              <div className={styles.postColumn}>
                {post.href ? (
                  <a href={post.href} target="_blank" rel="noopener noreferrer" className={styles.postLink}>
                    {post.href}
                  </a>
                ) : (
                  "-"
                )}
              </div>

              {/* STATUS */}
              <div className={styles.postColumn}>
                <span
                  className={`${styles.badge} ${
                    post.status === "PUBLISHED"
                      ? styles.published
                      : post.status === "SCHEDULED"
                        ? styles.scheduled
                        : styles.draft
                  }`}
                >
                  {t(`facebook.filters.${post.status.toLowerCase()}`)}
                </span>
              </div>

              {/* DATE */}
              <div className={styles.postColumn}>{formatDate(post.publishAt)}</div>

              {/* TIME */}
              <div className={styles.postColumn}>{formatTime(post.publishAt)}</div>

              {/* TAGS */}
              <div className={styles.tagsColumn}>
                <div className={styles.tags}>{post.hashtags || "-"}</div>
              </div>

              {/* ACTION */}
              <div className={styles.tableActions}>
                <button type="button" className={styles.editBtn}>
                  <i className="bi bi-pencil-square" />
                </button>

                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() =>
                    modal.confirmDelete(t("facebook.posts.deleteTitle"), t("facebook.posts.deleteDescription"), () =>
                      removePost(post.id),
                    )
                  }
                >
                  <i className="bi bi-trash3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <i className="bi bi-inbox" />

            <h3>{t("facebook.posts.empty")}</h3>

            <p>{t("facebook.posts.noPosts")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

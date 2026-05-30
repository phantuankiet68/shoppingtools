"use client";

import Image from "next/image";

import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "@/styles/admin/tiktok/ScheduledPostsTab.module.css";

import { TikTokPostStatus } from "@/generated/prisma";

interface Props {
  user: {
    id?: string;

    name?: string;
  } | null;
}

interface TikTokPost {
  id: string;

  title: string;

  description: string;

  hashtags?: string | null;

  thumbnail?: string | null;

  publishAt?: string | null;

  status: TikTokPostStatus;

  createdAt: string;
}

interface ApiResponse {
  items: TikTokPost[];
}

const statusColors: Record<TikTokPostStatus, string> = {
  DRAFT: styles.draft,

  SCHEDULED: styles.scheduled,

  PUBLISHING: styles.publishing,

  PUBLISHED: styles.published,

  FAILED: styles.failed,
};

export default function ScheduledPostsTab({ user }: Props) {
  const [items, setItems] = useState<TikTokPost[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [date, setDate] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      if (date) {
        params.set("date", date);
      }

      const response = await fetch(`/api/admin/tiktok/posts?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch TikTok posts");
      }

      const data: ApiResponse = await response.json();

      setItems(data.items ?? []);
    } catch (error) {
      console.error("FETCH TIKTOK POSTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, [search, status, date]);

  useEffect(() => {
    const load = async () => {
      await fetchPosts();
    };

    void load();
  }, [fetchPosts]);

  const stats = useMemo(() => {
    return {
      total: items.length,

      scheduled: items.filter((x) => x.status === "SCHEDULED").length,

      published: items.filter((x) => x.status === "PUBLISHED").length,

      failed: items.filter((x) => x.status === "FAILED").length,
    };
  }, [items]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this TikTok post?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tiktok/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("DELETE TIKTOK POST ERROR:", error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span>Total Posts</span>

          <h3>{stats.total}</h3>

          <p>Total TikTok scheduled posts</p>
        </div>

        <div className={styles.statCard}>
          <span>Scheduled</span>

          <h3>{stats.scheduled}</h3>

          <p>Waiting for auto publish</p>
        </div>

        <div className={styles.statCard}>
          <span>Published</span>

          <h3>{stats.published}</h3>

          <p>Successfully published</p>
        </div>

        <div className={styles.statCard}>
          <span>Failed</span>

          <h3>{stats.failed}</h3>

          <p>Failed publishing attempts</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        {/* SEARCH */}
        <div className={styles.searchGroup}>
          <span className={styles.searchIcon}>🔍</span>

          <input
            type="text"
            value={search}
            placeholder="Search title, description, hashtags..."
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* FILTERS */}
        <div className={styles.filterGroup}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.select}>
            <option value="">All Status</option>

            <option value="DRAFT">Draft</option>

            <option value="SCHEDULED">Scheduled</option>

            <option value="PUBLISHING">Publishing</option>

            <option value="PUBLISHED">Published</option>

            <option value="FAILED">Failed</option>
          </select>

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.dateInput} />

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("");
              setDate("");
            }}
            className={styles.filterBtn}
          >
            <i className="bi bi-arrow-clockwise" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className={styles.loading}>Loading TikTok posts...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No TikTok posts found.</div>
      ) : (
        <div className={styles.listWrapper}>
          {/* HEADER */}
          <div className={styles.listHeader}>
            <div>Post</div>
            <div>Hash Tags</div>
            <div>Status</div>
            <div>Publish Time</div>
            <div>Actions</div>
          </div>

          {/* ROWS */}
          {items.map((post) => (
            <div key={post.id} className={styles.listRow}>
              {/* LEFT */}
              <div className={styles.postInfo}>
                {/* THUMB */}
                <div className={styles.thumbnailWrapper}>
                  {post.thumbnail ? (
                    <Image src={post.thumbnail} alt={post.title} fill sizes="120px" className={styles.thumbnail} />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>
                      <i className="bi bi-tiktok" />
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className={styles.postContent}>
                  <h3 className={styles.postTitle}>{post.title}</h3>

                  <p className={styles.description}>{post.description}</p>
                </div>
              </div>
              {post.hashtags && <div className={styles.hashtags}>{post.hashtags}</div>}
              {/* STATUS */}
              <div className={styles.statusBox}>
                <span className={`${styles.badge} ${statusColors[post.status]}`}>{post.status}</span>
              </div>

              {/* DATE */}
              <div className={styles.publishBox}>
                <strong>{post.publishAt ? new Date(post.publishAt).toLocaleString() : "-"}</strong>
              </div>

              {/* ACTIONS */}
              <div className={styles.actions}>
                <button type="button" className={styles.editBtn}>
                  <i className="bi bi-pencil-square" />
                  Edit
                </button>

                <button type="button" onClick={() => handleDelete(post.id)} className={styles.deleteBtn}>
                  <i className="bi bi-trash3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

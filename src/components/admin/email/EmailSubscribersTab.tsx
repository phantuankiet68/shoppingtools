"use client";

import { useEffect, useMemo, useState } from "react";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

import styles from "@/styles/admin/email/subscribers.module.css";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  subscribedAt: string;
};

type SubscriberResponse = {
  success: boolean;
  items: Subscriber[];
};

export default function EmailSubscribersTab() {
  const { currentSite } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  const siteId = currentSite?.id;

  useEffect(() => {
    if (!siteId) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`/api/admin/subscribers?siteId=${siteId}`, {
          cache: "no-store",
        });

        const data: SubscriberResponse = await response.json();

        if (!cancelled) {
          setSubscribers(data.items ?? []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [siteId]);

  const filteredSubscribers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return subscribers;
    }

    return subscribers.filter(
      (subscriber) =>
        subscriber.email.toLowerCase().includes(keyword) || subscriber.name?.toLowerCase().includes(keyword),
    );
  }, [search, subscribers]);

  const activeSubscribers = useMemo(
    () => subscribers.filter((item) => item.status.toLowerCase() === "active").length,
    [subscribers],
  );

  const inactiveSubscribers = useMemo(
    () => subscribers.filter((item) => item.status.toLowerCase() !== "active").length,
    [subscribers],
  );

  const refreshSubscribers = async () => {
    if (!siteId) {
      return;
    }

    try {
      setRefreshing(true);

      const response = await fetch(`/api/admin/subscribers?siteId=${siteId}`, {
        cache: "no-store",
      });

      const data: SubscriberResponse = await response.json();

      setSubscribers(data.items ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.statsGrid}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <div className={styles.headerBadge}>
                <div className={styles.headerIcon}>
                  <i className="bi bi-envelope-paper-heart-fill" />
                </div>
                EMAIL MARKETING
              </div>

              <h2>Email Subscribers</h2>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={() => void refreshSubscribers()}
              disabled={refreshing}
              className={styles.refreshButton}
            >
              <i className={`bi bi-arrow-repeat ${refreshing ? styles.spinning : ""}`} />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
        <div className={styles.statsGrid}>
          <div className={`${styles.metricCard} ${styles.totalCard}`}>
            <div className={styles.metricGlow}></div>

            <div className={styles.metricTop}>
              <div className={styles.metricIcon}>
                <i className="bi bi-people-fill" />
                <h3>{subscribers.length}</h3>
              </div>

              <span className={styles.metricTrend}>
                <i className="bi bi-arrow-up-right" />
                +12%
              </span>
            </div>

            <div className={styles.metricBody}>
              <p>Total Subscribers</p>

              <small>Newsletter audience growth</small>
            </div>

            <div className={styles.metricProgress}>
              <span style={{ width: "78%" }} />
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.activeCard}`}>
            <div className={styles.metricGlow}></div>

            <div className={styles.metricTop}>
              <div className={styles.metricIcon}>
                <i className="bi bi-check-circle-fill" />
                <h3>{activeSubscribers}</h3>
              </div>

              <span className={styles.metricTrend}>
                <i className="bi bi-arrow-up-right" />
                +8%
              </span>
            </div>

            <div className={styles.metricBody}>
              <p>Active Users</p>

              <small>Currently receiving emails</small>
            </div>

            <div className={styles.metricProgress}>
              <span style={{ width: "90%" }} />
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.inactiveCard}`}>
            <div className={styles.metricGlow}></div>

            <div className={styles.metricTop}>
              <div className={styles.metricIcon}>
                <i className="bi bi-person-x-fill" />
                <h3>{inactiveSubscribers}</h3>
              </div>

              <span className={`${styles.metricTrend} ${styles.down}`}>
                <i className="bi bi-arrow-down-right" />
                -3%
              </span>
            </div>

            <div className={styles.metricBody}>
              <p>Inactive Users</p>

              <small>Unsubscribed contacts</small>
            </div>

            <div className={styles.metricProgress}>
              <span style={{ width: "20%" }} />
            </div>
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.resultCard}`}>
          <div className={styles.metricGlow}></div>

          <div className={styles.metricTop}>
            <div className={styles.metricIcon}>
              <i className="bi bi-search" />
              <h3>{filteredSubscribers.length}</h3>
            </div>

            <span className={styles.metricTrend}>
              <i className="bi bi-funnel-fill" />
              Filtered
            </span>
          </div>

          <div className={styles.metricBody}>
            <p>Search Results</p>

            <small>Matching subscribers found</small>
          </div>

          <div className={styles.metricProgress}>
            <span style={{ width: "65%" }} />
          </div>
        </div>
      </div>

      {/* TABLE CARD */}

      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <i className="bi bi-search" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers by name or email..."
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Status</th>
                <th>Subscribed Date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className={styles.loading}>
                    <div className={styles.loadingState}>
                      <i className="bi bi-arrow-repeat" />
                      Loading subscribers...
                    </div>
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className={styles.empty}>
                    <div className={styles.emptyState}>
                      <i className="bi bi-inbox" />

                      <h3>No Subscribers Found</h3>

                      <p>There are currently no subscribers matching your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {(subscriber.name ?? subscriber.email).charAt(0).toUpperCase()}
                        </div>

                        <div className={styles.userInfo}>
                          <strong>{subscriber.name ?? "Unknown User"}</strong>

                          <span>{subscriber.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`${styles.statusBadge} ${styles[subscriber.status.toLowerCase()] || ""}`}>
                        <span className={styles.dot} />

                        {subscriber.status}
                      </span>
                    </td>

                    <td>{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

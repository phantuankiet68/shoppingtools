"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/integrations/webhook/webhook.module.css";
import { WebhookCreateModal } from "@/components/admin/integrations/webhook/WebhookCreateModal";
import { WebhookDetailDrawer } from "@/components/admin/integrations/webhook/WebhookDetailDrawer";

type WebhookType = "inbound" | "outbound";
type WebhookStatus = "active" | "paused" | "error";

export type WebhookItem = {
  id: string;
  name: string;
  type: WebhookType;
  event: string;
  status: WebhookStatus;
  updatedAt: string;
  lastTriggeredAt?: string;
  endpointOrUrl: string;
  success24h: number;
  fail24h: number;
};

const MOCK: WebhookItem[] = [
  {
    id: "wh_001",
    name: "Payment Succeeded",
    type: "inbound",
    event: "payment.succeeded",
    status: "active",
    updatedAt: "2026-01-21 10:18",
    lastTriggeredAt: "2026-01-23 08:12",
    endpointOrUrl: "/api/webhooks/payment",
    success24h: 124,
    fail24h: 2,
  },
  {
    id: "wh_002",
    name: "Order Created → CRM",
    type: "outbound",
    event: "order.created",
    status: "paused",
    updatedAt: "2026-01-20 16:40",
    lastTriggeredAt: "2026-01-22 11:01",
    endpointOrUrl: "https://example.com/hook",
    success24h: 18,
    fail24h: 0,
  },
  {
    id: "wh_003",
    name: "Shipping Status",
    type: "inbound",
    event: "shipping.status_updated",
    status: "error",
    updatedAt: "2026-01-23 07:50",
    lastTriggeredAt: "2026-01-23 07:49",
    endpointOrUrl: "/api/webhooks/shipping",
    success24h: 3,
    fail24h: 11,
  },
];

type Tab = "all" | "inbound" | "outbound" | "logs";

export default function WebhooksPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | WebhookStatus>("all");
  const [sort, setSort] = useState<"updated" | "errors" | "traffic">("updated");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<WebhookItem | null>(null);

  const stats = useMemo(() => {
    const total = MOCK.length;
    const active = MOCK.filter((x) => x.status === "active").length;
    const paused = MOCK.filter((x) => x.status === "paused").length;
    const errors = MOCK.filter((x) => x.status === "error").length;
    const ok24 = MOCK.reduce((a, b) => a + b.success24h, 0);
    const fail24 = MOCK.reduce((a, b) => a + b.fail24h, 0);
    return { total, active, paused, errors, ok24, fail24 };
  }, []);

  const filtered = useMemo(() => {
    let rows = [...MOCK];

    if (tab === "inbound") rows = rows.filter((r) => r.type === "inbound");
    if (tab === "outbound") rows = rows.filter((r) => r.type === "outbound");
    // tab logs: vẫn hiển thị logs panel riêng (phía dưới)

    if (status !== "all") rows = rows.filter((r) => r.status === status);

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.event.toLowerCase().includes(q) || r.endpointOrUrl.toLowerCase().includes(q));
    }

    if (sort === "updated") {
      rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    } else if (sort === "errors") {
      rows.sort((a, b) => b.fail24h - a.fail24h);
    } else if (sort === "traffic") {
      rows.sort((a, b) => b.success24h + b.fail24h - (a.success24h + a.fail24h));
    }

    return rows;
  }, [tab, status, query, sort]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.titleRow}>
            <div className={styles.logoMark}>
              <i className="bi bi-plug" />
            </div>
            <div>
              <h1 className={styles.title}>Webhooks</h1>
              <p className={styles.subtitle}>Kết nối shop với thanh toán, vận chuyển, CRM… theo thời gian thực.</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className={styles.stats}>
            <StatCard icon="bi-diagram-3" label="Tổng webhook" value={stats.total} hint={`${stats.active} active · ${stats.paused} paused`} />
            <StatCard icon="bi-check2-circle" label="Requests 24h" value={stats.ok24 + stats.fail24} hint={`${stats.ok24} OK · ${stats.fail24} lỗi`} tone="good" />
            <StatCard icon="bi-exclamation-triangle" label="Cảnh báo" value={stats.errors} hint="Webhook đang error" tone={stats.errors > 0 ? "bad" : "neutral"} />
          </div>
        </div>

        <div className={styles.heroRight}>
          <button className={styles.btnGhost} type="button">
            <i className="bi bi-journal-text" />
            Docs
          </button>
          <button className={styles.btnPrimary} onClick={() => setIsCreateOpen(true)} type="button">
            <i className="bi bi-plus-lg" />
            Tạo webhook
          </button>
        </div>

        {/* Segmented tabs */}
        <div className={styles.segmented}>
          <SegTab active={tab === "all"} onClick={() => setTab("all")} icon="bi-grid" label="Tất cả" />
          <SegTab active={tab === "inbound"} onClick={() => setTab("inbound")} icon="bi-box-arrow-in-down-right" label="Inbound" />
          <SegTab active={tab === "outbound"} onClick={() => setTab("outbound")} icon="bi-send" label="Outbound" />
          <SegTab active={tab === "logs"} onClick={() => setTab("logs")} icon="bi-activity" label="Logs" />
        </div>
      </div>

      {/* Main */}
      <section className={styles.shell}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input className={styles.search} placeholder="Tìm theo tên, event, URL/endpoint…" value={query} onChange={(e) => setQuery(e.target.value)} />
            {query ? (
              <button className={styles.clearBtn} onClick={() => setQuery("")} type="button" title="Clear">
                <i className="bi bi-x-circle" />
              </button>
            ) : null}
          </div>

          <div className={styles.toolbarRight}>
            <div className={styles.selectWrap}>
              <i className={`bi bi-funnel ${styles.selectIcon}`} />
              <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className={styles.selectWrap}>
              <i className={`bi bi-sort-down ${styles.selectIcon}`} />
              <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value as any)}>
                <option value="updated">Mới cập nhật</option>
                <option value="traffic">Nhiều traffic</option>
                <option value="errors">Nhiều lỗi</option>
              </select>
            </div>

            <button className={styles.btnGhost} type="button" title="Refresh">
              <i className="bi bi-arrow-repeat" />
              Refresh
            </button>
          </div>
        </div>

        {tab === "logs" ? (
          <LogsPanel onOpen={(id) => setSelected(MOCK.find((x) => x.id === id) ?? null)} />
        ) : (
          <>
            {/* Table */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Webhook</th>
                    <th>Event</th>
                    <th>Endpoint / URL</th>
                    <th>24h</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th className={styles.thRight}>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.empty}>
                        Không có webhook phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id} className={styles.row}>
                        <td>
                          <div className={styles.whCell}>
                            <div className={styles.whIcon}>
                              <i className={row.type === "inbound" ? "bi bi-box-arrow-in-down-right" : "bi bi-send"} />
                            </div>
                            <div>
                              <div className={styles.whTop}>
                                <span className={styles.whName}>{row.name}</span>
                                <span className={styles.pillSoft}>{row.type === "inbound" ? "Inbound" : "Outbound"}</span>
                                {row.status === "error" ? <span className={styles.pillHot}>Needs attention</span> : null}
                              </div>
                              <div className={styles.whSub}>
                                <span className={styles.muted}>
                                  <i className="bi bi-clock" /> Last: {row.lastTriggeredAt ?? "—"}
                                </span>
                                <span className={styles.dot}>•</span>
                                <span className={styles.mono}>{row.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={styles.eventPill}>
                            <i className="bi bi-lightning-charge" /> {row.event}
                          </span>
                        </td>

                        <td>
                          <div className={styles.urlWrap}>
                            <span className={styles.mono}>{row.endpointOrUrl}</span>
                            <button className={styles.copyBtn} type="button" title="Copy">
                              <i className="bi bi-clipboard" />
                            </button>
                          </div>
                        </td>

                        <td>
                          <div className={styles.metrics}>
                            <span className={styles.metricOk}>
                              <i className="bi bi-check2-circle" /> {row.success24h}
                            </span>
                            <span className={styles.metricFail}>
                              <i className="bi bi-x-circle" /> {row.fail24h}
                            </span>
                          </div>
                        </td>

                        <td>{StatusBadge(row.status)}</td>

                        <td className={styles.muted}>{row.updatedAt}</td>

                        <td className={styles.actions}>
                          <button className={styles.iconBtn} onClick={() => setSelected(row)} type="button" title="Chi tiết & Mapping">
                            <i className="bi bi-sliders" />
                          </button>
                          <button className={styles.iconBtn} type="button" title="Test webhook">
                            <i className="bi bi-play-circle" />
                          </button>
                          <button className={styles.iconBtn} type="button" title="Bật / Tắt">
                            <i className="bi bi-toggle-on" />
                          </button>
                          <button className={styles.iconBtn} type="button" title="Menu">
                            <i className="bi bi-three-dots" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer hint */}
            <div className={styles.footerHint}>
              <i className="bi bi-info-circle" />
              Gợi ý: inbound nên bật <span className={styles.mono}>signature</span> để verify nguồn gửi.
            </div>
          </>
        )}
      </section>

      <WebhookCreateModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <WebhookDetailDrawer webhook={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function StatCard({ icon, label, value, hint, tone = "neutral" }: { icon: string; label: string; value: number; hint: string; tone?: "neutral" | "good" | "bad" }) {
  return (
    <div className={`${styles.statCard} ${tone === "good" ? styles.statGood : ""} ${tone === "bad" ? styles.statBad : ""}`}>
      <div className={styles.statIcon}>
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statHint}>{hint}</div>
      </div>
    </div>
  );
}

function SegTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button className={`${styles.segTab} ${active ? styles.segActive : ""}`} onClick={onClick} type="button">
      <i className={`bi ${icon}`} />
      {label}
    </button>
  );
}

function StatusBadge(s: "active" | "paused" | "error") {
  if (s === "active") {
    return (
      <span className={`${styles.badge} ${styles.badgeOk}`}>
        <i className="bi bi-check2-circle" /> Active
      </span>
    );
  }
  if (s === "paused") {
    return (
      <span className={`${styles.badge} ${styles.badgeWarn}`}>
        <i className="bi bi-pause-circle" /> Paused
      </span>
    );
  }
  return (
    <span className={`${styles.badge} ${styles.badgeErr}`}>
      <i className="bi bi-exclamation-triangle" /> Error
    </span>
  );
}

function LogsPanel({ onOpen }: { onOpen: (webhookId: string) => void }) {
  const logs = [
    { id: "lg1", webhookId: "wh_001", time: "2026-01-23 08:12", status: 200, ms: 143, note: "OK" },
    { id: "lg2", webhookId: "wh_003", time: "2026-01-23 07:49", status: 401, ms: 18, note: "Invalid signature" },
    { id: "lg3", webhookId: "wh_003", time: "2026-01-23 07:48", status: 500, ms: 902, note: "Provider timeout" },
  ];

  return (
    <div className={styles.logs}>
      <div className={styles.logsHead}>
        <div className={styles.logsTitle}>
          <i className="bi bi-activity" /> Recent logs
        </div>
        <div className={styles.logsActions}>
          <button className={styles.btnGhost} type="button">
            <i className="bi bi-download" /> Export
          </button>
        </div>
      </div>

      <div className={styles.logsGrid}>
        {logs.map((l) => (
          <button key={l.id} className={styles.logCard} onClick={() => onOpen(l.webhookId)} type="button">
            <div className={styles.logTop}>
              <span className={styles.mono}>{l.webhookId}</span>
              <span className={styles.logStatus}>
                <i className="bi bi-hash" /> {l.status}
              </span>
            </div>
            <div className={styles.logMid}>{l.note}</div>
            <div className={styles.logBottom}>
              <span className={styles.muted}>
                <i className="bi bi-clock" /> {l.time}
              </span>
              <span className={styles.muted}>{l.ms}ms</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

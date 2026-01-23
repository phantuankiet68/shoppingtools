"use client";

import styles from "@/styles/admin/integrations/webhook/webhook.module.css";
import type { WebhookItem } from "@/components/admin/integrations/webhook/page";

export function WebhookDetailDrawer({ webhook, onClose }: { webhook: WebhookItem | null; onClose: () => void }) {
  if (!webhook) return null;

  return (
    <div className={styles.drawerBackdrop} role="dialog" aria-modal="true">
      <aside className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <i className="bi bi-sliders" /> {webhook.name}
          </div>
          <button className={styles.iconBtn} onClick={onClose} type="button" title="Đóng">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.kv}>
            <div className={styles.k}>ID</div>
            <div className={styles.v}>
              <span className={styles.mono}>{webhook.id}</span>
            </div>

            <div className={styles.k}>Type</div>
            <div className={styles.v}>{webhook.type}</div>

            <div className={styles.k}>Event</div>
            <div className={styles.v}>
              <span className={styles.codePill}>
                <i className="bi bi-lightning-charge" /> {webhook.event}
              </span>
            </div>

            <div className={styles.k}>{webhook.type === "inbound" ? "Endpoint" : "URL"}</div>
            <div className={styles.v}>
              <span className={styles.mono}>{webhook.endpointOrUrl}</span>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <i className="bi bi-shield-lock" /> Security
            </div>
            <div className={styles.formRow}>
              <label className={styles.label}>Secret</label>
              <div className={styles.inlineInput}>
                <input className={styles.input} value="••••••••••••••••" readOnly />
                <button className={styles.ghostBtn} type="button">
                  <i className="bi bi-clipboard" /> Copy
                </button>
              </div>
            </div>
            <div className={styles.hint}>
              Gợi ý: validate signature header (VD: <span className={styles.mono}>x-webhook-signature</span>).
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <i className="bi bi-diagram-3" /> Mapping
            </div>

            <div className={styles.codeBox}>
              <div className={styles.codeHeader}>
                <span className={styles.muted}>Demo mapping</span>
                <button className={styles.ghostBtn} type="button">
                  <i className="bi bi-pencil" /> Edit
                </button>
              </div>
              <pre className={styles.pre}>
                {`{
  "orderId": "{{payload.data.order_id}}",
  "total": "{{payload.data.total_amount}}"
}`}
              </pre>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <i className="bi bi-activity" /> Recent logs
            </div>

            <div className={styles.logItem}>
              <div className={styles.logLeft}>
                <span className={styles.badgeSmallOk}>
                  <i className="bi bi-check2-circle" /> 200
                </span>
                <span className={styles.muted}>2026-01-23 08:12</span>
              </div>
              <button className={styles.ghostBtn} type="button">
                <i className="bi bi-arrow-repeat" /> Replay
              </button>
            </div>

            <div className={styles.logItem}>
              <div className={styles.logLeft}>
                <span className={styles.badgeSmallErr}>
                  <i className="bi bi-x-circle" /> 401
                </span>
                <span className={styles.muted}>2026-01-23 07:49</span>
              </div>
              <button className={styles.ghostBtn} type="button">
                <i className="bi bi-arrow-repeat" /> Replay
              </button>
            </div>
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <button className={styles.ghostBtn} type="button">
            <i className="bi bi-trash" /> Delete
          </button>
          <div className={styles.drawerFooterRight}>
            <button className={styles.ghostBtn} type="button">
              <i className="bi bi-pause-circle" /> Pause
            </button>
            <button className={styles.primaryBtn} type="button">
              <i className="bi bi-save" /> Save
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

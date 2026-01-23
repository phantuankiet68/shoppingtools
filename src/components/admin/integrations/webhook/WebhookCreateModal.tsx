"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/integrations/webhook/webhook.module.css";

type Step = 1 | 2 | 3;

export function WebhookCreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [type, setType] = useState<"inbound" | "outbound">("inbound");

  const title = useMemo(() => {
    if (step === 1) return "Chọn loại webhook";
    if (step === 2) return "Cấu hình";
    return "Mapping & Test";
  }, [step]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <i className="bi bi-plus-circle" /> {title}
          </div>
          <button className={styles.iconBtn} onClick={onClose} type="button" title="Đóng">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.modalBody}>
          {step === 1 && (
            <div className={styles.grid2}>
              <button className={`${styles.cardBtn} ${type === "inbound" ? styles.cardBtnActive : ""}`} type="button" onClick={() => setType("inbound")}>
                <div className={styles.cardBtnTop}>
                  <i className="bi bi-box-arrow-in-down-right" />
                  <span>Inbound</span>
                </div>
                <p className={styles.muted}>Nhận event từ bên ngoài (payment/shipping/sàn...) vào hệ thống.</p>
              </button>

              <button className={`${styles.cardBtn} ${type === "outbound" ? styles.cardBtnActive : ""}`} type="button" onClick={() => setType("outbound")}>
                <div className={styles.cardBtnTop}>
                  <i className="bi bi-send" />
                  <span>Outbound</span>
                </div>
                <p className={styles.muted}>Khi có event trong hệ thống, gửi sang URL của dịch vụ khác.</p>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className={styles.form}>
              <div className={styles.formRow}>
                <label className={styles.label}>Tên webhook</label>
                <input className={styles.input} placeholder="VD: Order Created → CRM" />
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Event</label>
                <select className={styles.select}>
                  <option>order.created</option>
                  <option>order.status_changed</option>
                  <option>payment.succeeded</option>
                  <option>shipping.status_updated</option>
                </select>
              </div>

              <div className={styles.grid2}>
                <div className={styles.formRow}>
                  <label className={styles.label}>Secret</label>
                  <div className={styles.inlineInput}>
                    <input className={styles.input} placeholder="Tạo secret..." />
                    <button className={styles.ghostBtn} type="button">
                      <i className="bi bi-magic" /> Generate
                    </button>
                  </div>
                  <div className={styles.hint}>
                    <i className="bi bi-shield-lock" /> Dùng để verify signature.
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>{type === "inbound" ? "Endpoint nhận" : "URL đích"}</label>
                  <input className={styles.input} placeholder={type === "inbound" ? "/api/webhooks/order" : "https://..."} />
                  <div className={styles.hint}>
                    <i className="bi bi-info-circle" /> Có thể cấu hình headers ở bước sau.
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Retry policy</label>
                <div className={styles.grid3}>
                  <select className={styles.select}>
                    <option>3 lần</option>
                    <option>5 lần</option>
                    <option>Không retry</option>
                  </select>
                  <select className={styles.select}>
                    <option>Exponential</option>
                    <option>Linear</option>
                  </select>
                  <select className={styles.select}>
                    <option>Timeout 5s</option>
                    <option>Timeout 10s</option>
                    <option>Timeout 20s</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.form}>
              <div className={styles.formRow}>
                <label className={styles.label}>Mapping (demo)</label>
                <div className={styles.codeBox}>
                  <div className={styles.codeHeader}>
                    <span className={styles.muted}>Input payload → Variables</span>
                    <button className={styles.ghostBtn} type="button">
                      <i className="bi bi-play-circle" /> Test
                    </button>
                  </div>
                  <pre className={styles.pre}>
                    {`{
  "orderId": "{{payload.data.order_id}}",
  "total": "{{payload.data.total_amount}}",
  "customerPhone": "{{payload.data.customer.phone}}"
}`}
                  </pre>
                </div>
                <div className={styles.hint}>
                  <i className="bi bi-lightning-charge" /> Ở bản thật bạn có thể làm UI kéo-thả field.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.ghostBtn} onClick={onClose} type="button">
            Hủy
          </button>

          <div className={styles.modalFooterRight}>
            <button className={styles.ghostBtn} disabled={step === 1} onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))} type="button">
              <i className="bi bi-arrow-left" /> Back
            </button>

            {step < 3 ? (
              <button className={styles.primaryBtn} onClick={() => setStep((s) => (s < 3 ? ((s + 1) as Step) : s))} type="button">
                Next <i className="bi bi-arrow-right" />
              </button>
            ) : (
              <button className={styles.primaryBtn} type="button">
                <i className="bi bi-check2" /> Tạo webhook
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

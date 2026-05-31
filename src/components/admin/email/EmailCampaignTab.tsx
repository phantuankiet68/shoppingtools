"use client";

import { useEffect, useMemo, useState } from "react";

import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

import styles from "@/styles/admin/email/campaign.module.css";

type Template = {
  id: string;
  name: string;
  subject: string;
  html: string;
};

const MOCK_TEMPLATES: Template[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to our website",
    html: `
      <h1>Welcome 🎉</h1>
      <p>Thank you for joining us.</p>
    `,
  },

  {
    id: "sale",
    name: "Summer Sale",
    subject: "🔥 Summer Sale 50%",
    html: `
      <h1>Summer Sale</h1>
      <p>Enjoy 50% off today.</p>
    `,
  },
];

export default function EmailCampaignTab() {
  const { currentSite } = useAdminAuth();

  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [testEmail, setTestEmail] = useState("");

  const [subject, setSubject] = useState("");

  const [html, setHtml] = useState("");

  const [subscriberCount, setSubscriberCount] = useState(0);

  const [sendingTest, setSendingTest] = useState(false);

  const [sendingCampaign, setSendingCampaign] = useState(false);

  useEffect(() => {
    if (!currentSite?.id) {
      return;
    }

    const loadSubscribers = async () => {
      try {
        const response = await fetch(`/api/admin/subscribers?siteId=${currentSite.id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (Array.isArray(data.items)) {
          setSubscriberCount(data.items.length);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadSubscribers();
  }, [currentSite?.id]);

  const currentTemplate = useMemo(
    () => MOCK_TEMPLATES.find((item) => item.id === selectedTemplate),
    [selectedTemplate],
  );

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);

    const template = MOCK_TEMPLATES.find((item) => item.id === value);

    if (!template) {
      return;
    }

    setSubject(template.subject);
    setHtml(template.html);
  };

  const handleSendTest = async () => {
    if (!currentSite?.id) {
      return;
    }

    if (!testEmail) {
      alert("Please enter test email");
      return;
    }

    try {
      setSendingTest(true);

      const response = await fetch("/api/admin/email/test", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          siteId: currentSite.id,
          to: testEmail,
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      alert("Test email sent successfully");
    } catch (error) {
      console.error(error);

      alert("Unable to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!currentSite?.id) {
      return;
    }

    if (!subject.trim()) {
      alert("Please enter subject");
      return;
    }

    if (!html.trim()) {
      alert("Please enter content");
      return;
    }

    const confirmed = window.confirm(`Send campaign to ${subscriberCount} subscribers?`);

    if (!confirmed) {
      return;
    }

    try {
      setSendingCampaign(true);

      const response = await fetch("/api/admin/email/campaign", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          siteId: currentSite.id,
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      alert(
        `Campaign completed

        Total: ${data.total}
        Success: ${data.successCount}
        Failed: ${data.failedCount}`,
      );
    } catch (error) {
      console.error(error);

      alert("Unable to send campaign");
    } finally {
      setSendingCampaign(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {/* LEFT */}

        <div className={styles.builderCard}>
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.heroIcon}>
                <i className="bi bi-envelope-paper-heart-fill" />
              </div>

              <div>
                <span className={styles.heroBadge}>EMAIL MARKETING</span>
                <h2>Email Campaign Studio</h2>
              </div>
            </div>

            <div className={styles.heroStats}>
              <div>
                <strong>{MOCK_TEMPLATES.length}</strong>
                <span>Templates</span>
              </div>

              <div>
                <strong>{subscriberCount}</strong>

                <span>Subscribers</span>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label>Email Template</label>

            <select value={selectedTemplate} onChange={(e) => handleTemplateChange(e.target.value)}>
              <option value="">Select template</option>

              {MOCK_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Subject</label>

            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
          </div>

          <div className={styles.field}>
            <label>Test Email</label>

            <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="example@gmail.com" />
          </div>

          <div className={styles.field}>
            <label>HTML Content</label>

            <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={18} />
          </div>

          <div className={styles.actionBar}>
            <button type="button" className={styles.testButton} onClick={handleSendTest} disabled={sendingTest}>
              <i className="bi bi-send" />
              Send Test
            </button>

            <button
              type="button"
              className={styles.sendButton}
              onClick={handleSendCampaign}
              disabled={sendingCampaign || subscriberCount === 0}
            >
              <i className="bi bi-rocket-takeoff-fill" />

              {sendingCampaign ? "Sending..." : "Launch Campaign"}
            </button>
          </div>
        </div>

        {/* RIGHT */}

        <div className={styles.previewCard}>
          <div className={styles.gmailHeader}>
            <div className={styles.gmailDots}>
              <span />
              <span />
              <span />
            </div>

            <span>Gmail Preview</span>
          </div>

          <div className={styles.previewMeta}>
            <div>
              <strong>Subject</strong>

              <p>{subject || "No Subject"}</p>
            </div>

            <div>
              <strong>Template</strong>

              <p>{currentTemplate?.name || "Custom Email"}</p>
            </div>
          </div>

          <div
            className={styles.previewContent}
            dangerouslySetInnerHTML={{
              __html: html || "<p>No content</p>",
            }}
          />
        </div>
      </div>
    </div>
  );
}

import Head from "next/head";
import { FormEvent, useCallback, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/integrations/email/email.module.css";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";

type ApiResponse = {
  ok: boolean;
  message?: string;
  data?: {
    emailId?: string;
    totalRecipients?: number;
  };
};

export default function AdminSendEmailPage() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const modal = useModal();

  const [fromName, setFromName] = useState("Your Store");
  const [fromEmail, setFromEmail] = useState("no-reply@yourdomain.com");
  const [replyToEmail, setReplyToEmail] = useState("support@yourdomain.com");

  const [subject, setSubject] = useState("New product just arrived 🎉");
  const [previewText, setPreviewText] = useState("Discover our latest product with an exclusive offer just for you.");

  const [brandName, setBrandName] = useState("Your Store");
  const [productName, setProductName] = useState("Nike Air Max 2025");
  const [productPrice, setProductPrice] = useState("2,990,000₫");
  const [productDescription, setProductDescription] = useState(
    "Modern design, lightweight, comfortable, and perfect for both casual outings and everyday activity.",
  );
  const [productImage, setProductImage] = useState(
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  );
  const [buttonText, setButtonText] = useState("Shop now");
  const [buttonUrl, setButtonUrl] = useState("https://yourdomain.com/products/new");
  const [couponCode, setCouponCode] = useState("NEW10");

  const [recipientsText, setRecipientsText] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const recipients = useMemo(() => {
    return Array.from(
      new Set(
        recipientsText
          .split(/\r?\n|,|;/)
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
      ),
    );
  }, [recipientsText]);

  const tooManyRecipients = recipients.length > 100;

  const htmlPreview = useMemo(() => {
    return buildEmailTemplate({
      brandName,
      productName,
      productPrice,
      productDescription,
      productImage,
      buttonText,
      buttonUrl,
      couponCode,
    });
  }, [brandName, productName, productPrice, productDescription, productImage, buttonText, buttonUrl, couponCode]);

  const handleSendEmail = useCallback(() => {
    if (submitting) return;

    if (!subject.trim()) {
      modal.error("Missing subject", "Please enter an email subject.");
      return;
    }

    if (!productName.trim()) {
      modal.error("Missing product name", "Please enter a product name.");
      return;
    }

    if (!buttonUrl.trim()) {
      modal.error("Missing product link", "Please enter the product link.");
      return;
    }

    if (recipients.length === 0) {
      modal.error("Missing recipients", "Please enter at least 1 customer email.");
      return;
    }

    if (tooManyRecipients) {
      modal.error("Recipient limit exceeded", "You can only send to a maximum of 100 customers at a time.");
      return;
    }

    formRef.current?.requestSubmit();
  }, [submitting, subject, productName, buttonUrl, recipients.length, tooManyRecipients, modal]);

  const functionKeyActions = useMemo(
    () => ({
      F2: {
        action: handleSendEmail,
        label: "Send email",
        icon: "bi bi-envelope-arrow-down",
      },
    }),
    [handleSendEmail],
  );

  usePageFunctionKeys(functionKeyActions);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!subject.trim()) {
      modal.error("Missing subject", "Please enter an email subject.");
      return;
    }

    if (!productName.trim()) {
      modal.error("Missing product name", "Please enter a product name.");
      return;
    }

    if (!buttonUrl.trim()) {
      modal.error("Missing product link", "Please enter the product link.");
      return;
    }

    if (recipients.length === 0) {
      modal.error("Missing recipients", "Please enter at least 1 customer email.");
      return;
    }

    if (tooManyRecipients) {
      modal.error("Recipient limit exceeded", "You can only send to a maximum of 100 customers at a time.");
      return;
    }

    try {
      setSubmitting(true);

      const textContent = [
        `${brandName}`,
        ``,
        `${productName}`,
        `${productPrice}`,
        `${productDescription}`,
        ``,
        `Promo code: ${couponCode}`,
        `${buttonText}: ${buttonUrl}`,
      ].join("\n");

      const res = await fetch("/api/admin/integrations/email/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          previewText,
          fromName,
          fromEmail,
          replyToEmail,
          productName,
          content: textContent,
          htmlContent: htmlPreview,
          recipients,
          testMode,
        }),
      });

      const json: ApiResponse = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Failed to send email");
      }

      modal.success(
        "Success",
        `Email created successfully for ${json.data?.totalRecipients || recipients.length} customers.`,
      );
    } catch (error: unknown) {
      let msg: string;
      if (error instanceof Error) {
        msg = error.message;
      } else {
        msg = String(error);
      }

      modal.error("Send email failed", msg || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Send Product Email</title>
      </Head>

      <div className={styles.page}>
        <form ref={formRef} className={styles.layout} onSubmit={handleSubmit}>
          <section className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <div className={styles.sectionHeaderTop}>
                  <span className={styles.sectionAccent} />
                  <h2 className={styles.sectionTitle}>Email sending information</h2>
                </div>
                <span className={styles.sectionTag}>Step 1</span>
              </div>
            </div>

            <div className={styles.grid4}>
              <div className={styles.field}>
                <label>From name</label>
                <input className={styles.input} value={fromName} onChange={(e) => setFromName(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label>From email</label>
                <input className={styles.input} value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Reply-to email</label>
                <input
                  className={styles.input}
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>Brand name</label>
                <input className={styles.input} value={brandName} onChange={(e) => setBrandName(e.target.value)} />
              </div>
            </div>

            <div className={styles.field}>
              <label>Email subject</label>
              <input className={styles.input} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div className={styles.field}>
              <label>Preview text</label>
              <input className={styles.input} value={previewText} onChange={(e) => setPreviewText(e.target.value)} />
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Product name</label>
                <input className={styles.input} value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label>Price</label>
                <input
                  className={styles.input}
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Product description</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Product image URL</label>
                <input
                  className={styles.input}
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Product / landing page URL</label>
                <input className={styles.input} value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} />
              </div>
            </div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Button text</label>
                <input className={styles.input} value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label>Coupon code</label>
                <input className={styles.input} value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.dflexField}>
                Customer list{" "}
                <div className={styles.hintRow}>
                  <span>{recipients.length} / 100 customers</span>
                  {tooManyRecipients ? <span className={styles.errorText}>Exceeded the 100 email limit</span> : null}
                </div>
              </label>
              <textarea
                className={styles.textarea}
                rows={4}
                value={recipientsText}
                onChange={(e) => setRecipientsText(e.target.value)}
                placeholder={`customer1@gmail.com
                customer2@gmail.com
                customer3@gmail.com`}
              />
            </div>
          </section>

          <aside className={styles.previewCard}>
            <div className={styles.previewFrame}>
              <div className={styles.previewContent} dangerouslySetInnerHTML={{ __html: htmlPreview }} />
            </div>
          </aside>
        </form>
      </div>
    </>
  );
}

function buildEmailTemplate({
  brandName,
  productName,
  productPrice,
  productDescription,
  productImage,
  buttonText,
  buttonUrl,
  couponCode,
}: {
  brandName: string;
  productName: string;
  productPrice: string;
  productDescription: string;
  productImage: string;
  buttonText: string;
  buttonUrl: string;
  couponCode: string;
}) {
  const year = new Date().getFullYear();

  return `
  <div style="margin:0;padding:0;background:#f4f4f4;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f4;">
      <tr>
        <td align="center" style="padding:10px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #dae7fb;">

            <tr>
              <td style="background:linear-gradient(135deg, #88d6ff, #26bbff);color:#ffffff;padding:10px 18px;text-align:center;font-size:13px;font-weight:400;">
                Special offer today · A promo code just for you
              </td>
            </tr>

            <tr>
              <td style="padding:10px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg, #88d6ff, #26bbff);border-radius:6px;overflow:hidden;">
                  <tr>
                    <td style="padding:15px">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td valign="top" style="padding-right:12px;">
                            <div style="font-size:13px;line-height:1.4;font-weight:800;color:#ffffff;text-transform:uppercase;">
                              Official mega sale
                            </div>
                            <div style="font-size:25px;line-height:1.1;font-weight:600;color:#ffffff;margin-top:5px;">
                              SPECIAL GIFT
                            </div>
                            <div style="font-size:13px;line-height:1.6;color:#fffaf0;margin-top:5px;">
                              Enjoy a special opportunity to shop our featured product at a better price today.
                            </div>
                            <div style="margin-top:10px;">
                              <a href="${escapeAttr(buttonUrl)}" style="display:inline-block;padding:6px 25px;border:1px solid #ffffff;border-radius:999px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;">
                                Shop now
                              </a>
                            </div>
                          </td>
                         <td valign="middle" align="right" style="width:250px;padding-left:12px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right">
                              <tr>
                                <td
                                  style="
                                    background:rgb(167 167 167 / 13%);
                                    border:1px solid rgba(255,255,255,0.18);
                                    padding:18px 20px;
                                    text-align:right;
                                    min-width:160px;
                                  "
                                >
                                  <div
                                    style="
                                      display:inline-block;
                                      font-size:11px;
                                      line-height:1;
                                      font-weight:700;
                                      letter-spacing:.12em;
                                      text-transform:uppercase;
                                      color:#fff7ed;
                                      background:rgba(255,255,255,0.14);
                                      border-radius:999px;
                                      padding:6px 10px;
                                      margin-bottom:10px;
                                    "
                                  >
                                    Limited Offer
                                  </div>

                                  <div
                                    style="
                                      font-size:18px;
                                      line-height:0.95;
                                      font-weight:900;
                                      color:#ffffff;
                                      letter-spacing:-0.03em;
                                    "
                                  >
                                    FLASH<br/>SALE
                                  </div>

                                  <div
                                    style="
                                      margin-top:10px;
                                      font-size:13px;
                                      line-height:1.5;
                                      color:#fff4e6;
                                    "
                                  >
                                    Great price for a limited time
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
            <td style="padding:0px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>

            <td width="35%" valign="top" >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  background:#ffffff;
                  border-radius:8px;
                  overflow:hidden;
                  position: relative;
                "
              >
                <tr>
                  <td style="padding:0;">
                    <img
                      src="${escapeAttr(productImage)}"
                      alt="${escapeAttr(productName)}"
                      width="100%"
                      style="
                        display:block;
                        width:100%;
                        height:auto;
                        border:0;
                      "
                    />
                  </td>
                </tr>

                <tr>
                  <td style="padding: 5px 10px; border: 1px solid #e5e7eb; border-radius:8px;">
                    <div
                      style="
                        display:inline-block;
                        padding:6px 10px;
                        background:#fff7ed;
                        color:#ea580c;
                        font-size:11px;
                        line-height:1;
                        font-weight:600;
                        text-transform:uppercase;
                        letter-spacing:.08em;
                        margin-bottom:12px;
                        position: absolute;
                        top: 10px;
                        right: 10px;
                      "
                    >
                      Featured product
                    </div>

                    <div
                      style="
                        font-size:16px;
                        line-height:1.35;
                        font-weight:800;
                        color:#fff;
                        margin:0;
                        position: absolute;
                        top: 35%;
                      "
                    >
                      ${escapeHtml(productName)}
                    </div>

                    <div
                      style="
                        font-size:18px;
                        line-height:1.15;
                        font-weight:900;
                        color:#fff;
                        position: absolute;
                        top: 45%;
                      "
                    >
                      ${escapeHtml(productPrice)}
                    </div>

                    <div
                      style="
                        font-size:13px;
                        line-height:1.8;
                        color:#475569;
                      "
                    >
                      ${formatDescription(productDescription)}
                    </div>

                    <table
                      role="presentation"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      style="margin-top:10px;"
                    >
                    </table>
                  </td>
                </tr>
              </table>
            </td>

            <td width="60%" valign="top" style="padding-left:8px;">

            ${buildVoucherCard({
              bg: "#1adef3",
              title: "Free shipping",
              condition: "Minimum order 0₫",
              badge: "Exclusive for you",
              expiry: "Expires: 25/02/2026",
              actionText: "Use now",
            })}

            <div style="height:10px"></div>

            ${buildVoucherCard({
              bg: "#ff6161",
              title: "Discount 10,000₫",
              condition: "Minimum order 0₫",
              badge: "",
              expiry: "Expires: 25/02/2026",
              actionText: "Use now",
            })}

            </td>

            </tr>
            </table>
            </td>
            </tr>

            <tr>
                <td style="padding:12px 16px 0 16px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding:0 0 5px 0;font-size:15px;font-weight:700;color:#6d8bff;">
                        Why customers love this product
                      </td>
                    </tr>
                    <tr>
                      <td>
                        ${buildFeatureList([
                          "Eye-catching design that is easy to match with different styles.",
                          "Optimized materials for a soft and comfortable all-day experience.",
                          "Limited launch quantity with a great offer for a short time only.",
                        ])}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:10px 28px 0 28px;" align="center">
                  <a
                    href="${escapeAttr(buttonUrl)}"
                    style="display:inline-block;background:linear-gradient(135deg, #88d6ff, #26bbff);color:#ffffff;text-decoration:none;font-size:13px;font-weight:400;line-height:1;padding:10px 34px;border-radius:14px;"
                  >
                    ${escapeHtml(buttonText)}
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:10px 28px 0 28px;" align="center">
                  <div style="font-size:13px;line-height:1.8;color:#94a3b8;">
                    Order early to secure the best offer and avoid missing out on stock.
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:8px 28px 0 28px">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e5e7eb;">
                    <tr>
                      <td style="padding:13px 0 0 0;font-size:12px;line-height:1.8;color:#9ca3af;text-align:center;">
                        © ${year} ${escapeHtml(brandName)}. All rights reserved.<br/>
                        You are receiving this email because you subscribed to product updates and promotions from our store.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="height:24px;"></td>
              </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

function buildFeatureList(items: string[]) {
  return items
    .map(
      (item) => `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:5px;">
          <tr>
            <td valign="top" width="28" style="padding-top:2px;">
              <div style="width:20px;height:20px;line-height:20px;text-align:center;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;">
                ✓
              </div>
            </td>
            <td valign="top" style="font-size:13px;line-height:1.8;color:#475569;">
              ${escapeHtml(item)}
            </td>
          </tr>
        </table>
      `,
    )
    .join("");
}

function buildVoucherCard({
  bg,
  title,
  condition,
  badge,
  expiry,
  actionText,
}: {
  bg: string;
  title: string;
  condition: string;
  badge?: string;
  expiry: string;
  actionText: string;
}) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dae7fb;background:#ffffff; border-radius: 6px;">
      <tr>
        <td valign="middle" width="120" style="background:${bg};padding:18px 12px;text-align:center;color:#ffffff;">
          <div style="font-size:16px;font-weight:800;line-height:1.2;">
            ${bg === "#1adef3" ? "FREE<br/>SHIP" : "SHOP"}
          </div>
        </td>
        <td valign="middle" style="padding:10px 10px 0px 10px">
          <div style="font-size:13px;font-weight:600;color:#ff7811;">${escapeHtml(title)}</div>
          <div style="font-size:13px;color:#111827;margin-top:3px;">${escapeHtml(condition)}</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:3px;">${escapeHtml(expiry)}</div>
         <div valign="middle" width="120" align="center" style="padding:10px;">
            <a href="#" style="display:inline-block;background:linear-gradient(135deg, #88d6ff, #26bbff);color:#ffffff;text-decoration:none;padding:6px 18px;font-size:13px;font-weight:500;border-radius: 6px">
              ${escapeHtml(actionText)}
            </a>
          </div>
          </td>
      </tr>
    </table>
  `;
}

function formatDescription(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br/>");
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value: string) {
  return escapeHtml(value);
}

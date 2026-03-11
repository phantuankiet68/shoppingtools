import Head from "next/head";
import { KeyboardEvent, FormEvent, useCallback, useMemo, useRef, useState } from "react";
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

type TemplateInput = {
  brandName: string;
  productName: string;
  productPrice: string;
  productDescription: string;
  productImage: string;
  buttonText: string;
  buttonUrl: string;
  couponCode: string;
  previewText: string;
};

type VoucherCardInput = {
  bg: string;
  title: string;
  condition: string;
  badge?: string;
  expiry: string;
  actionText: string;
};

type ValidationResult =
  | { ok: true }
  | {
      ok: false;
      title: string;
      message: string;
    };

const MAX_RECIPIENTS = 100;
const TEST_MODE = true;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export default function AdminSendEmailPage() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const modal = useModal();

  const [fromName, setFromName] = useState("Your Store");
  const [fromEmail, setFromEmail] = useState("no-reply@yourdomain.com");
  const [replyToEmail, setReplyToEmail] = useState("support@yourdomain.com");

  const [subject, setSubject] = useState("New product just arrived 🎉");
  const [previewText, setPreviewText] = useState("Special offer today · A promo code just for you");

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
  const [submitting, setSubmitting] = useState(false);
  const [recipientInput, setRecipientInput] = useState("");

  const recipients = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        recipientsText
          .split(/\r?\n|,|;/)
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
      ),
    );
  }, [recipientsText]);

  const addRecipientsFromInput = () => {
    const nextItems = recipientInput
      .split(/\r?\n|,|;/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (nextItems.length === 0) return;

    const merged = Array.from(new Set([...recipients, ...nextItems]));
    setRecipientsText(merged.join("\n"));
    setRecipientInput("");
  };

  const removeRecipient = (emailToRemove: string) => {
    const nextItems = recipients.filter((email) => email !== emailToRemove);
    setRecipientsText(nextItems.join("\n"));
  };

  const handleRecipientInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      addRecipientsFromInput();
    }
  };

  const invalidRecipients = useMemo<string[]>(() => {
    return recipients.filter((email) => !EMAIL_REGEX.test(email));
  }, [recipients]);

  const tooManyRecipients = recipients.length > MAX_RECIPIENTS;

  const normalizedSubject = subject.trim();
  const normalizedProductName = productName.trim();
  const normalizedButtonUrl = buttonUrl.trim();

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
      previewText,
    });
  }, [
    brandName,
    productName,
    productPrice,
    productDescription,
    productImage,
    buttonText,
    buttonUrl,
    couponCode,
    previewText,
  ]);

  const validateForm = useCallback((): ValidationResult => {
    if (!normalizedSubject) {
      return {
        ok: false,
        title: "Missing subject",
        message: "Please enter an email subject.",
      };
    }

    if (!normalizedProductName) {
      return {
        ok: false,
        title: "Missing product name",
        message: "Please enter a product name.",
      };
    }

    if (!normalizedButtonUrl) {
      return {
        ok: false,
        title: "Missing product link",
        message: "Please enter the product link.",
      };
    }

    if (recipients.length === 0) {
      return {
        ok: false,
        title: "Missing recipients",
        message: "Please enter at least 1 customer email.",
      };
    }

    if (tooManyRecipients) {
      return {
        ok: false,
        title: "Recipient limit exceeded",
        message: `You can only send to a maximum of ${MAX_RECIPIENTS} customers at a time.`,
      };
    }

    if (invalidRecipients.length > 0) {
      return {
        ok: false,
        title: "Invalid email format",
        message: `These email addresses are invalid: ${invalidRecipients.slice(0, 5).join(", ")}${invalidRecipients.length > 5 ? "..." : ""}`,
      };
    }

    return { ok: true };
  }, [
    normalizedSubject,
    normalizedProductName,
    normalizedButtonUrl,
    recipients.length,
    tooManyRecipients,
    invalidRecipients,
  ]);

  const handleSendEmail = useCallback(() => {
    if (submitting) return;

    const validation = validateForm();
    if (!validation.ok) {
      modal.error(validation.title, validation.message);
      return;
    }

    formRef.current?.requestSubmit();
  }, [submitting, validateForm, modal]);

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.ok) {
      modal.error(validation.title, validation.message);
      return;
    }

    try {
      setSubmitting(true);

      const textContent = [
        `${brandName}`,
        "",
        `${productName}`,
        `${productPrice}`,
        `${productDescription}`,
        "",
        `Promo code: ${couponCode}`,
        `${buttonText}: ${buttonUrl}`,
      ].join("\n");

      const response = await fetch("/api/admin/integrations/email/send-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: normalizedSubject,
          previewText: previewText.trim(),
          fromName: fromName.trim(),
          fromEmail: fromEmail.trim(),
          replyToEmail: replyToEmail.trim(),
          productName: normalizedProductName,
          content: textContent,
          htmlContent: htmlPreview,
          recipients,
          testMode: TEST_MODE,
        }),
      });

      const responseText = await response.text();
      const json: ApiResponse = responseText ? (JSON.parse(responseText) as ApiResponse) : { ok: false };

      if (!response.ok || !json.ok) {
        throw new Error(json.message || "Failed to send email");
      }

      modal.success(
        "Success",
        `Email created successfully for ${json.data?.totalRecipients || recipients.length} customers.`,
      );
    } catch (error: unknown) {
      modal.error("Send email failed", getErrorMessage(error));
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
                <label htmlFor="fromName">From name</label>
                <input
                  id="fromName"
                  className={styles.input}
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  autoComplete="organization"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="fromEmail">From email</label>
                <input
                  id="fromEmail"
                  type="email"
                  className={styles.input}
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="replyToEmail">Reply-to email</label>
                <input
                  id="replyToEmail"
                  type="email"
                  className={styles.input}
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="brandName">Brand name</label>
                <input
                  id="brandName"
                  className={styles.input}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="subject">Email subject</label>
              <input
                id="subject"
                className={styles.input}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="previewText">Preview text / top banner</label>
              <input
                id="previewText"
                className={styles.input}
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Special offer today · A promo code just for you"
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="productName">Product name</label>
                <input
                  id="productName"
                  className={styles.input}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="productPrice">Price</label>
                <input
                  id="productPrice"
                  className={styles.input}
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="productDescription">Product description</label>
              <textarea
                id="productDescription"
                className={styles.textarea}
                rows={3}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="productImage">Product image URL</label>
                <input
                  id="productImage"
                  type="url"
                  className={styles.input}
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="buttonUrl">Product / landing page URL</label>
                <input
                  id="buttonUrl"
                  type="url"
                  className={styles.input}
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="buttonText">Button text</label>
                <input
                  id="buttonText"
                  className={styles.input}
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="couponCode">Coupon code</label>
                <input
                  id="couponCode"
                  className={styles.input}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldDflex}>
                <label className={styles.customerLabel} htmlFor="recipientInput">
                  Customer list
                </label>
                <span className={styles.customersLabel}>
                  {recipients.length} / {MAX_RECIPIENTS} customers
                </span>
              </div>

              <div className={styles.recipientComposer}>
                <input
                  id="recipientInput"
                  type="email"
                  className={styles.recipientInput}
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={handleRecipientInputKeyDown}
                  placeholder=""
                />

                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addRecipientsFromInput}
                  disabled={!recipientInput.trim()}
                >
                  <span className={styles.addButtonIcon}>+</span>
                  Add
                </button>
              </div>

              <div className={styles.recipientMeta}>
                {tooManyRecipients ? <span className={styles.errorText}>Exceeded the 100 email limit</span> : null}

                {invalidRecipients.length > 0 ? (
                  <span className={styles.errorText}>
                    {invalidRecipients.length} invalid email{invalidRecipients.length > 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>

              {recipients.length > 0 ? (
                <div className={styles.recipientChips}>
                  {recipients.map((email) => (
                    <button
                      key={email}
                      type="button"
                      className={styles.recipientChip}
                      onClick={() => removeRecipient(email)}
                      title={`Remove ${email}`}
                    >
                      <span className={styles.recipientChipText}>{email}</span>
                      <span className={styles.recipientChipClose}>×</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <textarea
                id="recipientsText"
                className={styles.hiddenRecipientsTextarea}
                rows={4}
                value={recipientsText}
                onChange={(e) => setRecipientsText(e.target.value)}
                aria-hidden="true"
                tabIndex={-1}
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
  previewText,
}: TemplateInput): string {
  const year = new Date().getFullYear();
  const topBannerText = previewText.trim() || "Special offer today · A promo code just for you";
  const promoBadge = couponCode.trim() ? `Promo code: ${couponCode.trim()}` : "Limited Offer";

  return `
  <div style="margin:0;padding:0;background:#dae6ff;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#dae6ff;">
      <tr>
        <td align="center" style="padding:10px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #dae7fb;">

            <tr>
              <td style="background:linear-gradient(135deg, #88d6ff, #26bbff);color:#ffffff;padding:10px 18px;text-align:center;font-size:13px;font-weight:500;">
                ${escapeHtml(topBannerText)}
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
                                ${escapeHtml(buttonText)}
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
                                    ${escapeHtml(promoBadge)}
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
              <td style="padding:0 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="55%" valign="top">
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
                          position:relative;
                        "
                      >
                        <tr>
                          <td style="padding:0;">
                            <img
                              src="${escapeAttr(productImage)}"
                              alt="${escapeAttr(productName)}"
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
                          <td style="padding:7px 10px;border:1px solid #e5e7eb;">
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
                                position:absolute;
                                top:10px;
                                right:10px;
                              "
                            >
                              Featured product
                            </div>

                            <div
                              style="
                                font-size:16px;
                                line-height:1.35;
                                font-weight:800;
                                color:#ffffff;
                                margin:0;
                                position:absolute;
                                top:53%;
                              "
                            >
                              ${escapeHtml(productName)}
                            </div>

                            <div
                              style="
                                font-size:18px;
                                line-height:1.15;
                                font-weight:900;
                                color:#ffffff;
                                position:absolute;
                                top:60%;
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
                          </td>
                        </tr>
                      </table>
                    </td>

                    <td width="45%" valign="top" style="padding-left:8px;">
                      ${buildVoucherCard({
                        bg: "#1adef3",
                        title: "Free shipping",
                        condition: "Minimum order 0₫",
                        badge: couponCode.trim() ? `Code: ${couponCode.trim()}` : "Exclusive for you",
                        expiry: "Expires: 25/02/2026",
                        actionText: buttonText,
                      })}

                      <div style="height:10px"></div>

                      ${buildVoucherCard({
                        bg: "#ff6161",
                        title: "Discount 10,000₫",
                        condition: "Minimum order 0₫",
                        badge: couponCode.trim() ? `Code: ${couponCode.trim()}` : "",
                        expiry: "Expires: 25/02/2026",
                        actionText: buttonText,
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
                  style="display:inline-block;background:linear-gradient(135deg, #88d6ff, #26bbff);color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;line-height:1;padding:10px 34px;border-radius:14px;"
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
              <td style="padding:8px 28px 0 28px;">
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

function buildFeatureList(items: readonly string[]): string {
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

function buildVoucherCard({ bg, title, condition, badge, expiry, actionText }: VoucherCardInput): string {
  const leftLabel = bg === "#1adef3" ? "FREE<br/>SHIP" : "SHOP";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dae7fb;background:#ffffff;border-radius:6px;">
      <tr>
        <td valign="middle" width="120" style="background:${escapeAttr(bg)};padding:18px 12px;text-align:center;color:#ffffff;">
          <div style="font-size:16px;font-weight:800;line-height:1.2;">
            ${leftLabel}
          </div>
        </td>

        <td valign="middle" style="padding:10px 10px 10px 10px;">
          ${
            badge
              ? `
            <div style="font-size:11px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">
              ${escapeHtml(badge)}
            </div>
          `
              : ""
          }
          <div style="font-size:13px;font-weight:600;color:#ff7811;">${escapeHtml(title)}</div>
          <div style="font-size:13px;color:#111827;margin-top:3px;">${escapeHtml(condition)}</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:3px;">${escapeHtml(expiry)}</div>

          <div style="padding-top:10px;text-align:center;">
            <a href="#" style="display:inline-block;background:linear-gradient(135deg, #88d6ff, #26bbff);color:#ffffff;text-decoration:none;padding:6px 18px;font-size:13px;font-weight:500;border-radius:6px;">
              ${escapeHtml(actionText)}
            </a>
          </div>
        </td>
      </tr>
    </table>
  `;
}

function formatDescription(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br/>");
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return "Something went wrong.";
}

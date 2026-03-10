import Head from "next/head";
import { FormEvent, useMemo, useState } from "react";
import styles from "@/styles/admin/integrations/email/email.module.css";

type ApiResponse = {
  ok: boolean;
  message?: string;
  data?: {
    emailId?: string;
    totalRecipients?: number;
  };
};

export default function AdminSendEmailPage() {
  const [fromName, setFromName] = useState("Your Store");
  const [fromEmail, setFromEmail] = useState("no-reply@yourdomain.com");
  const [replyToEmail, setReplyToEmail] = useState("support@yourdomain.com");

  const [subject, setSubject] = useState("Sản phẩm mới đã có mặt 🎉");
  const [previewText, setPreviewText] = useState("Khám phá sản phẩm mới với ưu đãi dành riêng cho bạn.");

  const [brandName, setBrandName] = useState("Your Store");
  const [productName, setProductName] = useState("Nike Air Max 2025");
  const [productPrice, setProductPrice] = useState("2.990.000đ");
  const [productDescription, setProductDescription] = useState(
    "Thiết kế hiện đại, nhẹ, êm và phù hợp cho cả đi chơi lẫn vận động hằng ngày.",
  );
  const [productImage, setProductImage] = useState(
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  );
  const [buttonText, setButtonText] = useState("Mua ngay");
  const [buttonUrl, setButtonUrl] = useState("https://yourdomain.com/products/new");
  const [couponCode, setCouponCode] = useState("NEW10");

  const [recipientsText, setRecipientsText] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!subject.trim()) {
      setMessage("Vui lòng nhập tiêu đề email.");
      return;
    }

    if (!productName.trim()) {
      setMessage("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!buttonUrl.trim()) {
      setMessage("Vui lòng nhập link sản phẩm.");
      return;
    }

    if (recipients.length === 0) {
      setMessage("Vui lòng nhập ít nhất 1 email khách hàng.");
      return;
    }

    if (tooManyRecipients) {
      setMessage("Chỉ được gửi tối đa 100 khách hàng mỗi lần.");
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
        `Mã ưu đãi: ${couponCode}`,
        `${buttonText}: ${buttonUrl}`,
      ].join("\n");

      const res = await fetch("/api/admin/emails/send-bulk", {
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
        throw new Error(json.message || "Gửi email thất bại");
      }

      setMessage(`Đã tạo email cho ${json.data?.totalRecipients || recipients.length} khách hàng.`);
    } catch (error: any) {
      setMessage(error?.message || "Có lỗi xảy ra.");
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
        <form className={styles.layout} onSubmit={handleSubmit}>
          <section className={styles.formCard}>
            <div className={styles.sectionTitle}>Thông tin gửi email</div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>From name</label>
                <input className={styles.input} value={fromName} onChange={(e) => setFromName(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label>From email</label>
                <input className={styles.input} value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Reply-to email</label>
                <input
                  className={styles.input}
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>Tên thương hiệu</label>
                <input className={styles.input} value={brandName} onChange={(e) => setBrandName(e.target.value)} />
              </div>
            </div>

            <div className={styles.field}>
              <label>Tiêu đề email</label>
              <input className={styles.input} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div className={styles.field}>
              <label>Preview text</label>
              <input className={styles.input} value={previewText} onChange={(e) => setPreviewText(e.target.value)} />
            </div>

            <div className={styles.sectionTitle}>Thông tin sản phẩm</div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Tên sản phẩm</label>
                <input className={styles.input} value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label>Giá</label>
                <input
                  className={styles.input}
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Mô tả sản phẩm</label>
              <textarea
                className={styles.textarea}
                rows={4}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Link hình ảnh sản phẩm</label>
              <input className={styles.input} value={productImage} onChange={(e) => setProductImage(e.target.value)} />
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Text nút bấm</label>
                <input className={styles.input} value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label>Mã giảm giá</label>
                <input className={styles.input} value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              </div>
            </div>

            <div className={styles.field}>
              <label>Link sản phẩm / landing page</label>
              <input className={styles.input} value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} />
            </div>

            <div className={styles.field}>
              <label>Danh sách khách hàng</label>
              <textarea
                className={styles.textarea}
                rows={7}
                value={recipientsText}
                onChange={(e) => setRecipientsText(e.target.value)}
                placeholder={`customer1@gmail.com
customer2@gmail.com
customer3@gmail.com`}
              />
              <div className={styles.hintRow}>
                <span>{recipients.length} / 100 khách hàng</span>
                {tooManyRecipients ? <span className={styles.errorText}>Vượt quá giới hạn 100 email</span> : null}
              </div>
            </div>

            <div className={styles.actions}>
              <label className={styles.checkbox}>
                <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />
                <span>Test mode</span>
              </label>

              <button type="submit" className={styles.button} disabled={submitting || tooManyRecipients}>
                {submitting ? "Đang gửi..." : "Gửi email"}
              </button>
            </div>

            {message ? <div className={styles.message}>{message}</div> : null}
          </section>

          <aside className={styles.previewCard}>
            <div className={styles.previewTop}>
              <div>
                <div className={styles.previewLabel}>Template preview</div>
                <div className={styles.previewSubject}>{subject || "Tiêu đề email"}</div>
                <div className={styles.previewText}>{previewText || "Preview text"}</div>
              </div>
            </div>

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

  const relatedProducts = [
    {
      name: "Nón bảo hiểm nửa đầu",
      price: "₫ 50,000",
      sold: "18 đã bán",
      image: "https://images.unsplash.com/photo-1558980394-0c199d55f1c7?auto=format&fit=crop&w=700&q=80",
      url: buttonUrl,
    },
    {
      name: "Nhẫn titan thời trang",
      price: "₫ 50,000",
      sold: "0 đã bán",
      image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=80",
      url: buttonUrl,
    },
  ];

  return `
  <div style="margin:0;padding:0;background:#f4f4f4;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f4;">
      <tr>
        <td align="center" style="padding:20px 10px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;">

            <tr>
              <td style="background:#f76d6d;color:#ffffff;padding:10px 18px;text-align:center;font-size:13px;font-weight:00;">
                Ưu đãi đặc biệt hôm nay · Mã giảm giá dành riêng cho bạn
              </td>
            </tr>

            <tr>
              <td style="padding:16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg, #fbaa74, #e2631da1);border-radius:6px;overflow:hidden;">
                  <tr>
                    <td style="padding:15px">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td valign="top" style="padding-right:12px;">
                            <div style="font-size:13px;line-height:1.4;font-weight:800;color:#ffffff;text-transform:uppercase;">
                              Siêu sale chính hãng
                            </div>
                            <div style="font-size:25px;line-height:1.1;font-weight:800;color:#ffffff;margin-top:8px;">
                              QUÀ ĐẶC BIỆT
                            </div>
                            <div style="font-size:13px;line-height:1.6;color:#fffaf0;margin-top:8px;">
                              Tặng riêng bạn cơ hội mua sắm sản phẩm nổi bật với ưu đãi tốt hơn hôm nay.
                            </div>
                            <div style="margin-top:10px;">
                              <a href="${escapeAttr(buttonUrl)}" style="display:inline-block;padding:6px 25px;border:1px solid #ffffff;border-radius:999px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;">
                                Săn ngay
                              </a>
                            </div>
                          </td>
                         <td valign="middle" align="right" style="width:250px;padding-left:12px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right">
                              <tr>
                                <td
                                  style="
                                    background:rgba(255,255,255,0.12);
                                    border:1px solid rgba(255,255,255,0.18);
                                    border-radius:18px;
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
                                      font-size:32px;
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
                                    Giá tốt trong thời gian ngắn
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

            <!-- LEFT: PRODUCT -->
            <td width="50%" valign="top" style="padding-right:8px;">
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
                  <td style="padding:10px; border: 1px solid #e5e7eb;   border-radius:8px;">
                    <div
                      style="
                        display:inline-block;
                        padding:6px 10px;
                        background:#fff7ed;
                        color:#ea580c;
                        font-size:11px;
                        line-height:1;
                        font-weight:800;
                        text-transform:uppercase;
                        letter-spacing:.08em;
                        margin-bottom:12px;
                        position: absolute;
                        top: 10px;
                        right: 10px;
                      "
                    >
                      Sản phẩm nổi bật
                    </div>

                    <div
                      style="
                        font-size:16px;
                        line-height:1.35;
                        font-weight:800;
                        color:#fff;
                        margin:0;
                        position: absolute;
                        top: 33%;
                      "
                    >
                      ${escapeHtml(productName)}
                    </div>

                    <div
                      style="
                        font-size:28px;
                        line-height:1.15;
                        font-weight:900;
                        color:#fff;
                        position: absolute;
                        top: 38%;
                      "
                    >
                      ${escapeHtml(productPrice)}
                    </div>

                    <div
                      style="
                        font-size:14px;
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
                      style="margin-top:18px;"
                    >
                      <tr>
                        <td
                          style="
                            background:linear-gradient(180deg,#ff6b3d 0%,#f6542c 100%);
                            border-radius:12px;
                          "
                        >
                          <a
                            href="${escapeAttr(buttonUrl)}"
                            style="
                              display:inline-block;
                              padding:12px 22px;
                              font-size:15px;
                              line-height:1;
                              font-weight:800;
                              color:#ffffff;
                              text-decoration:none;
                            "
                          >
                            ${escapeHtml(buttonText)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>


            <!-- RIGHT: CAMPAIGN -->
            <td width="50%" valign="top" style="padding-left:8px;">

            ${buildVoucherCard({
              bg: "#33d3d6",
              title: "Miễn phí vận chuyển",
              condition: "Đơn tối thiểu 0đ",
              badge: "Dành riêng cho bạn",
              expiry: "Hạn sử dụng: 25/02/2026",
              actionText: "Dùng ngay",
            })}

            <div style="height:10px"></div>

            ${buildVoucherCard({
              bg: "#f6542c",
              title: "Giảm 10.000đ",
              condition: "Đơn tối thiểu 0đ",
              badge: "",
              expiry: "Hạn sử dụng: 25/02/2026",
              actionText: "Dùng ngay",
            })}

            </td>

            </tr>
            </table>
            </td>
            </tr>

            <tr>
                <td style="padding:22px 28px 0 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding:0 0 12px 0;font-size:18px;font-weight:700;color:#0f172a;">
                        Vì sao khách hàng thích sản phẩm này
                      </td>
                    </tr>
                    <tr>
                      <td>
                        ${buildFeatureList([
                          "Thiết kế nổi bật, dễ phối đồ và phù hợp nhiều phong cách.",
                          "Chất liệu tối ưu cho trải nghiệm êm ái, thoải mái cả ngày.",
                          "Số lượng mở bán giới hạn, ưu đãi tốt trong thời gian ngắn.",
                        ])}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:28px 28px 0 28px;" align="center">
                  <a
                    href="${escapeAttr(buttonUrl)}"
                    style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%, #1d4ed8 100%);color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;line-height:1;padding:18px 34px;border-radius:14px;box-shadow:0 10px 24px rgba(37,99,235,0.28);"
                  >
                    ${escapeHtml(buttonText)}
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:18px 28px 0 28px;" align="center">
                  <div style="font-size:13px;line-height:1.8;color:#94a3b8;">
                    Đặt sớm để giữ ưu đãi tốt nhất và tránh tình trạng hết hàng.
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:26px 28px 0 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e5e7eb;">
                    <tr>
                      <td style="padding:18px 0 0 0;font-size:12px;line-height:1.8;color:#9ca3af;text-align:center;">
                        © ${year} ${escapeHtml(brandName)}. All rights reserved.<br/>
                        Bạn nhận email này vì đã đăng ký nhận thông tin sản phẩm và ưu đãi từ cửa hàng.
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
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:12px;">
          <tr>
            <td valign="top" width="28" style="padding-top:2px;">
              <div style="width:20px;height:20px;line-height:20px;text-align:center;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;">
                ✓
              </div>
            </td>
            <td valign="top" style="font-size:15px;line-height:1.8;color:#475569;">
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
            ${bg === "#33d3d6" ? "FREE<br/>SHIP" : "SHOP"}
          </div>
        </td>
        <td valign="middle" style="padding:12px 10px 0px; 12px">
          <div style="font-size:14px;font-weight:600;color:#ff7811;">${escapeHtml(title)}</div>
          <div style="font-size:13px;color:#111827;margin-top:4px;">${escapeHtml(condition)}</div>
          ${
            badge
              ? `<div style="display:inline-block;margin-top:6px;padding:4px 8px;border:1px solid #fb923c;color:#ea580c;font-size:12px; border-radius: 6px;font-weight: 500;">${escapeHtml(
                  badge,
                )}</div>`
              : ""
          }
          <div style="font-size:12px;color:#94a3b8;margin-top:10px;">${escapeHtml(expiry)}</div>
          <div valign="middle" width="120" align="center" style="padding:12px;">
            <a href="#" style="display:inline-block;background:#f6542c;color:#ffffff;text-decoration:none;padding:8px 18px;font-size:13px;font-weight:500;border-radius: 6px">
              ${escapeHtml(actionText)}
            </a>
          </div>
        </td>
      </tr>
    </table>
  `;
}

function buildProductCard(product: { name: string; price: string; sold: string; image: string; url: string }) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border:1px solid #ececec;">
      <tr>
        <td style="padding:0;">
          <img
            src="${escapeAttr(product.image)}"
            alt="${escapeAttr(product.name)}"
            width="100%"
            style="display:block;width:100%;height:auto;border:0;"
          />
        </td>
      </tr>
      <tr>
        <td style="padding:10px;">
          <div style="font-size:14px;line-height:1.45;color:#111827;min-height:42px;">
            ${escapeHtml(product.name)}
          </div>
          <div style="font-size:12px;line-height:1.4;color:#f6542c;font-weight:700;margin-top:10px;">
            ${escapeHtml(product.price)}
          </div>
          <div style="font-size:12px;color:#9ca3af;margin-top:2px;">
            ${escapeHtml(product.sold)}
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

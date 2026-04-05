import type { EmailTemplateData, TemplateId } from './types';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeText(value?: string, fallback = '') {
  return escapeHtml((value || fallback).trim());
}

function safeUrl(value?: string, fallback = '#') {
  const url = (value || '').trim();

  if (!url) return fallback;

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('mailto:')
  ) {
    return escapeHtml(url);
  }

  if (url.startsWith('/')) {
    return escapeHtml(url);
  }

  return fallback;
}

function renderParagraphs(text?: string, fallback = '') {
  const content = (text || fallback).trim();
  if (!content) return '';

  return content
    .split(/\n{2,}/)
    .map((paragraph) => {
      const html = escapeHtml(paragraph).replace(/\n/g, '<br />');
      return `<p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#475569;">${html}</p>`;
    })
    .join('');
}

function renderBenefits(benefits?: string[], fallback: string[] = []) {
  const items = (benefits && benefits.length ? benefits : fallback)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (!items.length) return '';

  return `
    <ul style="margin:0;padding-left:20px;color:#334155;">
      ${items
        .map(
          (item) => `
            <li style="margin:0 0 10px;font-size:14px;line-height:1.7;">
              ${escapeHtml(item)}
            </li>
          `
        )
        .join('')}
    </ul>
  `;
}

function renderFooter() {
  return `
    <tr>
      <td style="padding:24px 32px 32px;border-top:1px solid #e5e7eb;background:#ffffff;">
        <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#0f172a;font-weight:700;">
          Your Brand
        </p>
        <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#64748b;">
          Support:
          <a href="mailto:support@yourbrand.com" style="color:#2563eb;text-decoration:none;">
            support@yourbrand.com
          </a>
        </p>
        <p style="margin:0 0 12px;font-size:12px;line-height:1.7;color:#94a3b8;">
          You are receiving this email because you interacted with our brand or service.
        </p>
        <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
          <a href="#" style="color:#64748b;text-decoration:underline;">Manage preferences</a>
          &nbsp;•&nbsp;
          <a href="#" style="color:#64748b;text-decoration:underline;">Unsubscribe</a>
        </p>
      </td>
    </tr>
  `;
}

function renderShell(preheader: string, body: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f4f6;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
          ${preheader}
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;width:100%;margin:0;padding:0;">
          <tr>
            <td align="center" style="padding:24px 12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;">
                ${body}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildWelcomeEmail(data: EmailTemplateData) {
  const subject = safeText(data.subject, 'Welcome to our platform');
  const ctaText = safeText(data.ctaText, 'Get started');
  const ctaUrl = safeUrl(data.ctaUrl, '#');

  const descriptionHtml = renderParagraphs(
    data.content,
    'Thank you for joining our platform. We are happy to have you with us and excited to help you get started.'
  );

  const benefitsHtml = renderBenefits(data.benefits, [
    'Quick setup for new users',
    'Easy onboarding experience',
    'Clear next steps to start faster',
  ]);

  return renderShell(
    'Welcome aboard. Start with the most important next step today.',
    `
      <tr>
        <td align="center" style="padding:14px 20px;background:linear-gradient(90deg,#0f172a 0%,#2563eb 100%);font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#ffffff;font-weight:700;">
          Welcome to our platform
        </td>
      </tr>

      <tr>
        <td style="padding:36px 32px 20px;background:#ffffff;">
          <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.14em;color:#2563eb;font-weight:800;">
            GETTING STARTED
          </p>

          <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:36px;line-height:1.15;color:#0f172a;font-weight:800;">
            ${subject}
          </h1>

          ${descriptionHtml}

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;">
            <tr>
              <td align="center" bgcolor="#111827" style="border-radius:999px;">
                <a href="${ctaUrl}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#ffffff;text-decoration:none;font-weight:700;">
                  ${ctaText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:0 32px 24px;background:#ffffff;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:20px;">
            <tr>
              <td style="padding:20px 20px 10px;">
                <h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:1.3;color:#0f172a;font-weight:700;">
                  What you can do next
                </h2>
                ${benefitsHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${renderFooter()}
    `
  );
}

function buildPromotionEmail(data: EmailTemplateData) {
  const subject = safeText(
    data.subject,
    'Order now and enjoy Free Delivery completely on us'
  );
  const ctaText = safeText(data.ctaText, 'Complete My Order');
  const ctaUrl = safeUrl(data.ctaUrl, '#');
  const promoCode = safeText(data.promoCode, 'AC41FD2P');
  const productName = safeText(data.productName, 'Featured Product');
  const productImage = safeUrl(data.productImage, '');

  const descriptionHtml = renderParagraphs(
    data.content,
    'Complete your order today and use your exclusive code below to unlock free delivery on your purchase before this offer expires.'
  );

  const benefitsHtml = renderBenefits(data.benefits, [
    'Strong incentive designed to reduce checkout hesitation',
    'Clear offer message to improve conversion intent',
    'Simple CTA path back to the purchase journey',
  ]);

  return renderShell(
    'Complete your order today and unlock your exclusive delivery offer.',
    `
      <tr>
        <td align="center" style="padding:14px 20px;background:linear-gradient(90deg,#0f172a 0%,#ea580c 100%);font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#ffffff;font-weight:700;">
          Don&apos;t miss your exclusive free delivery offer
        </td>
      </tr>

      <tr>
        <td style="padding:36px 32px 16px;background:#fff7ed;">
          <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.14em;color:#ea580c;font-weight:800;">
            YOU&apos;RE CLOSE TO CHECKOUT
          </p>

          <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:36px;line-height:1.15;color:#0f172a;font-weight:800;">
            ${subject}
          </h1>

          ${descriptionHtml}

          <p style="margin:0 0 18px;">
            <span style="display:inline-block;padding:10px 16px;border-radius:999px;border:1px dashed #fb923c;background:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#9a3412;font-weight:800;">
              CODE: ${promoCode}
            </span>
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;">
            <tr>
              <td align="center" bgcolor="#111827" style="border-radius:999px;">
                <a href="${ctaUrl}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#ffffff;text-decoration:none;font-weight:700;">
                  ${ctaText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${
        productImage
          ? `
      <tr>
        <td align="center" style="padding:0 32px 24px;background:#fff7ed;">
          <img src="${productImage}" alt="${productName}" width="420" style="display:block;max-width:100%;height:auto;border:0;" />
        </td>
      </tr>
      `
          : ''
      }

      <tr>
        <td style="padding:0 32px 24px;background:#fff7ed;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;">
            <tr>
              <td style="padding:20px 20px 10px;">
                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.12em;color:#ea580c;font-weight:800;">
                  FEATURED OFFER
                </p>
                <h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">
                  ${productName}
                </h2>
                ${benefitsHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${renderFooter()}
    `
  );
}

function buildReminderEmail(data: EmailTemplateData) {
  const subject = safeText(
    data.subject,
    'Important reminder: your next step is waiting'
  );
  const ctaText = safeText(data.ctaText, 'Review now');
  const ctaUrl = safeUrl(data.ctaUrl, '#');
  const productName = safeText(data.productName, 'Action checklist');

  const descriptionHtml = renderParagraphs(
    data.content,
    'We noticed there is still an important step left to complete. Review your latest activity and continue from where you left off.'
  );

  const benefitsHtml = renderBenefits(data.benefits, [
    'See what still needs attention',
    'Return to the right step with less friction',
    'Keep progress moving with a clear reminder',
  ]);

  return renderShell(
    'A friendly reminder to complete the next important step.',
    `
      <tr>
        <td align="center" style="padding:14px 20px;background:linear-gradient(90deg,#0f172a 0%,#7c3aed 100%);font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#ffffff;font-weight:700;">
          Friendly reminder — don&apos;t lose momentum
        </td>
      </tr>

      <tr>
        <td style="padding:36px 32px 20px;background:#faf7ff;">
          <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.14em;color:#7c3aed;font-weight:800;">
            IMPORTANT NEXT STEP
          </p>

          <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:34px;line-height:1.15;color:#0f172a;font-weight:800;">
            ${subject}
          </h1>

          ${descriptionHtml}

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;">
            <tr>
              <td align="center" bgcolor="#111827" style="border-radius:999px;">
                <a href="${ctaUrl}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#ffffff;text-decoration:none;font-weight:700;">
                  ${ctaText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:0 32px 24px;background:#faf7ff;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;">
            <tr>
              <td style="padding:20px 20px 10px;">
                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.12em;color:#7c3aed;font-weight:800;">
                  WHAT TO REVIEW
                </p>
                <h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">
                  ${productName}
                </h2>
                ${benefitsHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${renderFooter()}
    `
  );
}

export function buildEmailHtml(templateId: TemplateId, data: EmailTemplateData) {
  if (templateId === 'promotion') {
    return buildPromotionEmail(data);
  }

  if (templateId === 'reminder') {
    return buildReminderEmail(data);
  }

  return buildWelcomeEmail(data);
}
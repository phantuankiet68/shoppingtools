import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, EmailProvider, EmailRecipientStatus, EmailStatus, EmailType, EmailLogStatus } from "@prisma/client";

type RecipientInput = {
  email: string;
  name?: string;
  variables?: Record<string, any>;
};

type BulkSendBody = {
  templateId: string;
  subjectOverride?: string;
  testMode?: boolean;
  recipients: RecipientInput[];
  siteId?: string;
};

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function renderTemplate(content: string, vars: Record<string, any>) {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = vars?.[key];
    return value == null ? "" : String(value);
  });
}

function dedupeRecipients(list: RecipientInput[]) {
  const map = new Map<string, RecipientInput>();

  for (const item of list) {
    const email = String(item?.email || "")
      .trim()
      .toLowerCase();
    if (!email) continue;
    if (!map.has(email)) {
      map.set(email, {
        email,
        name: item?.name ? String(item.name).trim() : undefined,
        variables: item?.variables && typeof item.variables === "object" ? item.variables : {},
      });
    }
  }

  return Array.from(map.values());
}

/**
 * TODO:
 * Thay hàm này bằng provider thật:
 * - Resend
 * - SendGrid
 * - SMTP/Nodemailer
 */
async function sendWithProvider(params: {
  provider: EmailProvider;
  toEmail: string;
  toName?: string;
  subject: string;
  html?: string | null;
  text?: string | null;
  fromName?: string | null;
  fromEmail?: string | null;
  replyToEmail?: string | null;
}) {
  // mock provider result
  return {
    ok: true,
    providerMessageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BulkSendBody;

    // TODO: thay bằng auth thật
    const admin = { id: "YOUR_ADMIN_USER_ID" };

    const templateId = String(body?.templateId || "").trim();
    const subjectOverride = String(body?.subjectOverride || "").trim();
    const testMode = Boolean(body?.testMode);
    const siteId = typeof body?.siteId === "string" && body.siteId.trim() ? body.siteId.trim() : null;

    if (!templateId) return badRequest("templateId is required");
    if (!Array.isArray(body?.recipients) || body.recipients.length === 0) {
      return badRequest("recipients is required");
    }

    const recipients = dedupeRecipients(body.recipients);

    if (recipients.length === 0) {
      return badRequest("No valid recipients");
    }

    if (recipients.length > 100) {
      return badRequest("Maximum 100 recipients per request");
    }

    const invalids = recipients.filter((r) => !isValidEmail(r.email));
    if (invalids.length > 0) {
      return badRequest(
        `Invalid recipient emails: ${invalids
          .slice(0, 5)
          .map((x) => x.email)
          .join(", ")}`,
      );
    }

    const template = await prisma.emailTemplate.findFirst({
      where: {
        id: templateId,
        userId: admin.id,
        isActive: true,
      },
      select: {
        id: true,
        key: true,
        name: true,
        subject: true,
        htmlContent: true,
        textContent: true,
        isActive: true,
      },
    });

    if (!template) {
      return NextResponse.json({ ok: false, message: "Template not found or disabled" }, { status: 404 });
    }

    /**
     * TODO:
     * Chỗ này nên load settings thật từ DB sau
     */
    const currentProvider: EmailProvider = EmailProvider.RESEND;
    const fromName = "Your App";
    const fromEmail = "no-reply@yourdomain.com";
    const replyToEmail = "support@yourdomain.com";

    const previewText = template.textContent ? template.textContent.slice(0, 160) : null;

    const emailBatch = await prisma.email.create({
      data: {
        userId: admin.id,
        templateId: template.id,
        templateKey: template.key,
        type: EmailType.BULK,
        status: EmailStatus.QUEUED,
        subject: subjectOverride || template.subject,
        previewText,
        fromName,
        fromEmail,
        replyToEmail,
        provider: currentProvider,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        totalRecipients: recipients.length,
        successCount: 0,
        failedCount: 0,
        testMode,
        recipients: {
          create: recipients.map((r) => ({
            email: r.email,
            name: r.name ?? null,
            subject: subjectOverride || template.subject,
            variables: r.variables ?? {},
            status: EmailRecipientStatus.PENDING,
          })),
        },
      },
      include: {
        recipients: {
          select: {
            id: true,
            email: true,
            name: true,
            variables: true,
          },
        },
      },
    });

    let successCount = 0;
    let failedCount = 0;

    const results: Array<{
      recipientId: string;
      email: string;
      status: "SENT" | "FAILED" | "TEST";
      providerMessageId?: string;
      error?: string;
    }> = [];

    for (const recipient of emailBatch.recipients) {
      const vars =
        recipient.variables && typeof recipient.variables === "object"
          ? (recipient.variables as Record<string, any>)
          : {};

      const finalSubject = renderTemplate(subjectOverride || template.subject, vars);

      const finalHtml = template.htmlContent ? renderTemplate(template.htmlContent, vars) : null;

      const finalText = template.textContent ? renderTemplate(template.textContent, vars) : null;

      if (testMode) {
        await prisma.emailRecipient.update({
          where: { id: recipient.id },
          data: {
            status: EmailRecipientStatus.SENT,
            subject: finalSubject,
            sentAt: new Date(),
          },
        });

        if (siteId) {
          await prisma.emailLog.create({
            data: {
              siteId,
              emailId: emailBatch.id,
              recipientId: recipient.id,
              templateId: template.id,
              toEmail: recipient.email,
              toName: recipient.name || null,
              subjectSnapshot: finalSubject,
              provider: currentProvider,
              status: EmailLogStatus.SENT,
              sentAt: new Date(),
              meta: {
                testMode: true,
              },
            },
          });
        }

        successCount += 1;
        results.push({
          recipientId: recipient.id,
          email: recipient.email,
          status: "TEST",
        });
        continue;
      }

      try {
        const sent = await sendWithProvider({
          provider: currentProvider,
          toEmail: recipient.email,
          toName: recipient.name || undefined,
          subject: finalSubject,
          html: finalHtml,
          text: finalText,
          fromName,
          fromEmail,
          replyToEmail,
        });

        if (!sent.ok) {
          throw new Error("Provider send failed");
        }

        await prisma.emailRecipient.update({
          where: { id: recipient.id },
          data: {
            status: EmailRecipientStatus.SENT,
            subject: finalSubject,
            providerMessageId: sent.providerMessageId,
            sentAt: new Date(),
          },
        });

        if (siteId) {
          await prisma.emailLog.create({
            data: {
              siteId,
              emailId: emailBatch.id,
              recipientId: recipient.id,
              templateId: template.id,
              toEmail: recipient.email,
              toName: recipient.name || null,
              subjectSnapshot: finalSubject,
              provider: currentProvider,
              providerMessageId: sent.providerMessageId,
              status: EmailLogStatus.SENT,
              sentAt: new Date(),
              meta: {
                provider: currentProvider,
              },
            },
          });
        }

        successCount += 1;
        results.push({
          recipientId: recipient.id,
          email: recipient.email,
          status: "SENT",
          providerMessageId: sent.providerMessageId,
        });
      } catch (error: any) {
        const errorMessage = error?.message || "Send failed";

        await prisma.emailRecipient.update({
          where: { id: recipient.id },
          data: {
            status: EmailRecipientStatus.FAILED,
            subject: finalSubject,
            error: errorMessage,
          },
        });

        if (siteId) {
          await prisma.emailLog.create({
            data: {
              siteId,
              emailId: emailBatch.id,
              recipientId: recipient.id,
              templateId: template.id,
              toEmail: recipient.email,
              toName: recipient.name || null,
              subjectSnapshot: finalSubject,
              provider: currentProvider,
              status: EmailLogStatus.FAILED,
              errorMessage,
              failedAt: new Date(),
              meta: {
                provider: currentProvider,
              },
            },
          });
        }

        failedCount += 1;
        results.push({
          recipientId: recipient.id,
          email: recipient.email,
          status: "FAILED",
          error: errorMessage,
        });
      }
    }

    const finalStatus =
      failedCount === 0 ? EmailStatus.SENT : successCount === 0 ? EmailStatus.FAILED : EmailStatus.PARTIAL;

    const updatedBatch = await prisma.email.update({
      where: { id: emailBatch.id },
      data: {
        status: finalStatus,
        successCount,
        failedCount,
        sentAt: successCount > 0 ? new Date() : null,
        lastError: failedCount > 0 ? `${failedCount} recipient(s) failed` : null,
      },
      select: {
        id: true,
        status: true,
        totalRecipients: true,
        successCount: true,
        failedCount: true,
        sentAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        batch: updatedBatch,
        items: results,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || "Bulk send failed" }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import {
  Prisma,
  EmailProvider,
  EmailType,
  EmailStatus,
  EmailRecipientStatus,
  EmailLogStatus,
} from '@/generated/prisma';
import { decryptSystemCredential } from '@/lib/crypto/system-credential';

interface EmailTemplateData {
  campaignTitle?: string;
  subject?: string;
  content?: string;
  ctaText?: string;
  ctaUrl?: string;
  promoCode?: string;
  productName?: string;
  productImage?: string;
  benefits?: string[];
}

interface SendEmailRecipientInput {
  email: string;
  name?: string;
  variables?: Prisma.JsonValue;
}

interface SendAdminEmailBody {
  userId: string;
  siteId: string;
  templateKey: string;
  campaignTitle: string;
  subject: string;
  previewText?: string;
  fromName?: string;
  fromEmail?: string;
  replyToEmail?: string;
  provider?: EmailProvider;
  type?: EmailType;
  testMode?: boolean;
  scheduledAt?: string | null;
  recipients: SendEmailRecipientInput[];
  data?: EmailTemplateData;
}

const MAX_RECIPIENTS_PER_REQUEST = 100;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function buildTextContent(input: SendAdminEmailBody): string {
  const benefits = input.data?.benefits?.length
    ? `\nBenefits:\n- ${input.data.benefits.join('\n- ')}`
    : '';

  return [
    input.previewText?.trim() || '',
    input.data?.content?.trim() || '',
    input.data?.ctaText && input.data?.ctaUrl
      ? `\n${input.data.ctaText}: ${input.data.ctaUrl}`
      : '',
    input.data?.promoCode ? `\nPromo code: ${input.data.promoCode}` : '',
    input.data?.productName ? `\nProduct: ${input.data.productName}` : '',
    benefits,
  ]
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function buildHtmlContent(input: SendAdminEmailBody): string {
  const benefits = input.data?.benefits?.length
    ? `<ul>${input.data.benefits.map((item) => `<li>${String(item)}</li>`).join('')}</ul>`
    : '';

  return `
    <div>
      <h1>${input.subject}</h1>
      ${input.previewText ? `<p>${input.previewText}</p>` : ''}
      ${input.data?.content ? `<p>${input.data.content.replace(/\n/g, '<br />')}</p>` : ''}
      ${
        input.data?.ctaText && input.data?.ctaUrl
          ? `<p><a href="${input.data.ctaUrl}">${input.data.ctaText}</a></p>`
          : ''
      }
      ${input.data?.promoCode ? `<p><strong>Promo code:</strong> ${input.data.promoCode}</p>` : ''}
      ${input.data?.productName ? `<p><strong>Product:</strong> ${input.data.productName}</p>` : ''}
      ${benefits}
    </div>
  `.trim();
}

function getEmailStatus(input: SendAdminEmailBody): EmailStatus {
  if (input.scheduledAt) return EmailStatus.SCHEDULED;
  if (input.testMode) return EmailStatus.QUEUED;
  return EmailStatus.QUEUED;
}

function dedupeRecipients(recipients: SendEmailRecipientInput[]): SendEmailRecipientInput[] {
  const map = new Map<string, SendEmailRecipientInput>();

  for (const recipient of recipients) {
    const email = normalizeEmail(recipient.email);
    if (!email || !isValidEmail(email)) continue;

    if (!map.has(email)) {
      map.set(email, {
        email,
        name: recipient.name?.trim() || undefined,
        variables: recipient.variables,
      });
    }
  }

  return [...map.values()];
}

async function findTemplateOrThrow(templateKey: string) {
  const template = await prisma.emailTemplate.findFirst({
    where: {
      key: templateKey,
      isActive: true,
    },
    select: {
      id: true,
      key: true,
      name: true,
      subject: true,
      htmlContent: true,
      textContent: true,
    },
  });

  if (!template) {
    throw new Error(`Active email template not found for templateKey="${templateKey}".`);
  }

  return template;
}

async function verifyUserOwnership(userId: string, siteId: string) {
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      ownerUserId: userId,
    },
    select: {
      id: true,
      ownerUserId: true,
      name: true,
    },
  });

  if (!site) {
    throw new Error('Site not found or does not belong to this user.');
  }

  return site;
}

async function findSystemCredentialOrThrow(siteId: string) {
  const credential = await prisma.systemCredential.findFirst({
    where: {
      siteId,
      isActive: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      key: true,
      provider: true,
      apiKeyEncrypted: true,
      fromEmail: true,
      fromName: true,
      replyToEmail: true,
      isActive: true,
    },
  });

  if (!credential) {
    throw new Error('No active system email credential found for this site.');
  }

  return credential;
}

function resolveEmailProvider(provider: string): EmailProvider {
  const upper = provider.toUpperCase();

  if (upper === 'RESEND') return EmailProvider.RESEND;
  if (upper === 'SENDGRID') return EmailProvider.SENDGRID;
  if (upper === 'MAILGUN') return EmailProvider.MAILGUN;
  if (upper === 'SMTP') return EmailProvider.SMTP;

  throw new Error(`Unsupported email provider: ${provider}`);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendAdminEmailBody;

    if (!body.userId?.trim()) {
      return Response.json({ message: 'userId is required.' }, { status: 400 });
    }

    if (!body.siteId?.trim()) {
      return Response.json({ message: 'siteId is required.' }, { status: 400 });
    }

    if (!body.templateKey?.trim()) {
      return Response.json({ message: 'templateKey is required.' }, { status: 400 });
    }

    if (!body.campaignTitle?.trim()) {
      return Response.json({ message: 'campaignTitle is required.' }, { status: 400 });
    }

    if (!body.subject?.trim()) {
      return Response.json({ message: 'subject is required.' }, { status: 400 });
    }

    if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
      return Response.json({ message: 'At least one recipient is required.' }, { status: 400 });
    }

    const recipients = dedupeRecipients(body.recipients);

    if (recipients.length === 0) {
      return Response.json({ message: 'No valid recipients were provided.' }, { status: 400 });
    }

    if (recipients.length > MAX_RECIPIENTS_PER_REQUEST) {
      return Response.json(
        { message: `Maximum ${MAX_RECIPIENTS_PER_REQUEST} recipients per request.` },
        { status: 400 }
      );
    }

    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

    if (body.scheduledAt && Number.isNaN(scheduledAt?.getTime())) {
      return Response.json({ message: 'scheduledAt is invalid.' }, { status: 400 });
    }

    await verifyUserOwnership(body.userId, body.siteId);
    const template = await findTemplateOrThrow(body.templateKey);
    const credential = await findSystemCredentialOrThrow(body.siteId);

    const provider = resolveEmailProvider(credential.provider);
    const fromEmail = credential.fromEmail?.trim() || body.fromEmail?.trim() || '';
    const fromName = credential.fromName?.trim() || body.fromName?.trim() || null;
    const replyToEmail =
      credential.replyToEmail?.trim() || body.replyToEmail?.trim() || null;

    if (!fromEmail || !isValidEmail(fromEmail)) {
      return Response.json(
        { message: 'Configured fromEmail is missing or invalid.' },
        { status: 400 }
      );
    }

    if (replyToEmail && !isValidEmail(replyToEmail)) {
      return Response.json(
        { message: 'Configured replyToEmail is invalid.' },
        { status: 400 }
      );
    }

    const htmlContent = template.htmlContent || buildHtmlContent(body);
    const textContent = template.textContent || buildTextContent(body);
    const initialStatus = getEmailStatus(body);
    const type = body.type ?? EmailType.BULK;

    const created = await prisma.$transaction(async (tx) => {
      const email = await tx.email.create({
        data: {
          userId: body.userId,
          templateId: template.id,
          templateKey: template.key,
          type,
          status: initialStatus,
          subject: body.subject.trim(),
          previewText: body.previewText?.trim() || null,
          fromName,
          fromEmail,
          replyToEmail,
          provider,
          htmlContent,
          textContent,
          scheduledAt,
          sentAt: null,
          totalRecipients: recipients.length,
          successCount: 0,
          failedCount: 0,
          testMode: Boolean(body.testMode),
          lastError: null,
        },
        select: {
          id: true,
          status: true,
          scheduledAt: true,
          totalRecipients: true,
          fromEmail: true,
          fromName: true,
          replyToEmail: true,
          provider: true,
        },
      });

      const createdRecipients = await Promise.all(
        recipients.map((recipient) =>
          tx.emailRecipient.create({
            data: {
              emailId: email.id,
              email: recipient.email,
              name: recipient.name || null,
              status: EmailRecipientStatus.PENDING,
              subject: body.subject.trim(),
              variables: recipient.variables ?? Prisma.JsonNull,
            },
            select: {
              id: true,
              email: true,
              name: true,
            },
          })
        )
      );

      await tx.emailLog.createMany({
        data: createdRecipients.map((recipient) => ({
          siteId: body.siteId,
          emailId: email.id,
          recipientId: recipient.id,
          templateId: template.id,
          toEmail: recipient.email,
          toName: recipient.name ?? null,
          subjectSnapshot: body.subject.trim(),
          provider,
          status: EmailLogStatus.QUEUED,
          meta: {
            campaignTitle: body.campaignTitle,
            templateKey: body.templateKey,
            testMode: Boolean(body.testMode),
            credentialKey: credential.key,
          },
        })),
      });

      return {
        email,
        recipients: createdRecipients,
      };
    });

    if (scheduledAt) {
      return Response.json(
        {
          message: 'Email campaign scheduled successfully.',
          emailId: created.email.id,
          status: created.email.status,
          totalRecipients: created.email.totalRecipients,
        },
        { status: 201 }
      );
    }

    if (provider !== EmailProvider.RESEND) {
      return Response.json(
        {
          message: `Email campaign queued, but provider ${provider} is not implemented yet.`,
          emailId: created.email.id,
          status: created.email.status,
          totalRecipients: created.email.totalRecipients,
        },
        { status: 201 }
      );
    }

    const resendApiKey = decryptSystemCredential(credential.apiKeyEncrypted);
    const resend = new Resend(resendApiKey);

    let successCount = 0;
    let failedCount = 0;
    let lastError: string | null = null;
    if (body.testMode) {
      return Response.json({
        message: 'Test mode - email not sent',
      });
    }

    for (const recipient of created.recipients) {
      try {
        await resend.emails.send({
          from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
          to: recipient.email,
          subject: body.subject.trim(),
          html: htmlContent,
          text: textContent,
          replyTo: replyToEmail || undefined,
        });

        successCount += 1;

        await prisma.$transaction([
          prisma.emailRecipient.update({
            where: { id: recipient.id },
            data: {
              status: EmailRecipientStatus.SENT,
            },
          }),
          prisma.emailLog.updateMany({
            where: {
              emailId: created.email.id,
              recipientId: recipient.id,
            },
            data: {
              status: EmailLogStatus.SENT,
              sentAt: new Date(),
              errorMessage: null,
            },
          }),
        ]);
      } catch (error) {
        failedCount += 1;
        lastError = error instanceof Error ? error.message : 'Failed to send email.';

        await prisma.$transaction([
          prisma.emailRecipient.update({
            where: { id: recipient.id },
            data: {
              status: EmailRecipientStatus.FAILED,
              errorMessage: lastError,
            },
          }),
          prisma.emailLog.updateMany({
            where: {
              emailId: created.email.id,
              recipientId: recipient.id,
            },
            data: {
              status: EmailLogStatus.FAILED,
              errorMessage: lastError,
            },
          }),
        ]);
      }
    }

    const finalStatus =
      successCount > 0 && failedCount === 0
        ? EmailStatus.SENT
        : successCount > 0
        ? EmailStatus.PARTIAL
        : EmailStatus.FAILED;

    await prisma.email.update({
      where: { id: created.email.id },
      data: {
        status: finalStatus,
        sentAt: successCount > 0 ? new Date() : null,
        successCount,
        failedCount,
        lastError,
      },
    });

   const httpStatus =
    finalStatus === EmailStatus.SENT
      ? 201
      : finalStatus === EmailStatus.PARTIAL
      ? 207
      : 500;

  return Response.json(
    {
      message:
        finalStatus === EmailStatus.SENT
          ? 'Email campaign sent successfully.'
          : finalStatus === EmailStatus.PARTIAL
          ? 'Email campaign sent partially.'
          : 'Email campaign failed.',
      emailId: created.email.id,
      status: finalStatus,
      totalRecipients: created.email.totalRecipients,
      successCount,
      failedCount,
    },
    { status: httpStatus }
  );
  } catch (error) {
    console.error('[POST /api/admin/email/send]', error);

    return Response.json(
      {
        message: error instanceof Error ? error.message : 'Internal server error.',
      },
      { status: 500 }
    );
  }
}
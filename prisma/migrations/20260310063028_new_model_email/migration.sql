-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('SMTP', 'RESEND', 'SENDGRID');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('DRAFT', 'QUEUED', 'SCHEDULED', 'SENT', 'PARTIAL', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('SYSTEM', 'TEMPLATE', 'BULK', 'TEST');

-- CreateEnum
CREATE TYPE "EmailRecipientStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'OPENED', 'CLICKED');

-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED');

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT,
    "textContent" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "type" "EmailType" NOT NULL DEFAULT 'SYSTEM',
    "status" "EmailStatus" NOT NULL DEFAULT 'DRAFT',
    "templateKey" TEXT,
    "subject" TEXT NOT NULL,
    "previewText" TEXT,
    "fromName" TEXT,
    "fromEmail" TEXT,
    "replyToEmail" TEXT,
    "provider" "EmailProvider",
    "htmlContent" TEXT,
    "textContent" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "testMode" BOOLEAN NOT NULL DEFAULT false,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailRecipient" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "EmailRecipientStatus" NOT NULL DEFAULT 'PENDING',
    "subject" TEXT,
    "error" TEXT,
    "variables" JSONB,
    "providerMessageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "email_id" TEXT,
    "recipient_id" TEXT,
    "template_id" TEXT,
    "to_email" TEXT NOT NULL,
    "to_name" TEXT,
    "subject_snapshot" TEXT NOT NULL,
    "provider" "EmailProvider",
    "provider_message_id" TEXT,
    "status" "EmailLogStatus" NOT NULL DEFAULT 'QUEUED',
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "bounced_at" TIMESTAMP(3),
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailTemplate_userId_isActive_idx" ON "EmailTemplate"("userId", "isActive");

-- CreateIndex
CREATE INDEX "EmailTemplate_createdAt_idx" ON "EmailTemplate"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_userId_key_key" ON "EmailTemplate"("userId", "key");

-- CreateIndex
CREATE INDEX "Email_userId_createdAt_idx" ON "Email"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Email_userId_status_idx" ON "Email"("userId", "status");

-- CreateIndex
CREATE INDEX "Email_templateId_idx" ON "Email"("templateId");

-- CreateIndex
CREATE INDEX "Email_templateKey_idx" ON "Email"("templateKey");

-- CreateIndex
CREATE INDEX "Email_scheduledAt_idx" ON "Email"("scheduledAt");

-- CreateIndex
CREATE INDEX "EmailRecipient_emailId_idx" ON "EmailRecipient"("emailId");

-- CreateIndex
CREATE INDEX "EmailRecipient_email_idx" ON "EmailRecipient"("email");

-- CreateIndex
CREATE INDEX "EmailRecipient_status_idx" ON "EmailRecipient"("status");

-- CreateIndex
CREATE INDEX "EmailRecipient_providerMessageId_idx" ON "EmailRecipient"("providerMessageId");

-- CreateIndex
CREATE INDEX "idx_email_logs_email" ON "email_logs"("email_id");

-- CreateIndex
CREATE INDEX "idx_email_logs_recipient" ON "email_logs"("recipient_id");

-- CreateIndex
CREATE INDEX "idx_email_logs_site_created_at" ON "email_logs"("site_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_email_logs_site_status" ON "email_logs"("site_id", "status");

-- CreateIndex
CREATE INDEX "idx_email_logs_template" ON "email_logs"("template_id");

-- CreateIndex
CREATE INDEX "idx_email_logs_provider_message_id" ON "email_logs"("provider_message_id");

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRecipient" ADD CONSTRAINT "EmailRecipient_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "EmailRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

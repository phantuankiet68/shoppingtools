-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'R2');

-- CreateEnum
CREATE TYPE "StorageStatus" AS ENUM ('DISCONNECTED', 'CONNECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "StorageVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "StorageLogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "storage_integrations" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "provider" "StorageProvider" NOT NULL DEFAULT 'R2',
    "status" "StorageStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "public_base_url" TEXT,
    "root_prefix" TEXT NOT NULL DEFAULT 'uploads/',
    "private_by_default" BOOLEAN NOT NULL DEFAULT true,
    "signed_url_enabled" BOOLEAN NOT NULL DEFAULT true,
    "signed_url_ttl_seconds" INTEGER NOT NULL DEFAULT 900,
    "max_upload_mb" INTEGER NOT NULL DEFAULT 50,
    "allowed_mime" TEXT NOT NULL DEFAULT 'image/*,application/pdf',
    "enable_image_optimization" BOOLEAN NOT NULL DEFAULT true,
    "local_dir" TEXT,
    "region" TEXT DEFAULT 'auto',
    "bucket" TEXT,
    "endpoint_url" TEXT,
    "access_key_id" TEXT,
    "secret_access_key_enc" TEXT,
    "cache_control" TEXT,
    "purge_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_checked_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storage_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_buckets" (
    "id" TEXT NOT NULL,
    "storage_integration_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "provider" "StorageProvider" NOT NULL,
    "objects" INTEGER NOT NULL DEFAULT 0,
    "size_gb" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storage_buckets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_logs" (
    "id" TEXT NOT NULL,
    "storage_integration_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "level" "StorageLogLevel" NOT NULL DEFAULT 'INFO',
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "object_key" TEXT,
    "visibility" "StorageVisibility",
    "meta_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "storage_integrations_site_id_key" ON "storage_integrations"("site_id");

-- CreateIndex
CREATE INDEX "idx_storage_integrations_provider" ON "storage_integrations"("provider");

-- CreateIndex
CREATE INDEX "idx_storage_integrations_status" ON "storage_integrations"("status");

-- CreateIndex
CREATE INDEX "idx_storage_buckets_integration" ON "storage_buckets"("storage_integration_id");

-- CreateIndex
CREATE INDEX "idx_storage_buckets_provider" ON "storage_buckets"("provider");

-- CreateIndex
CREATE INDEX "idx_storage_logs_integration_created" ON "storage_logs"("storage_integration_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_storage_logs_site_created" ON "storage_logs"("site_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_storage_logs_level" ON "storage_logs"("level");

-- AddForeignKey
ALTER TABLE "storage_integrations" ADD CONSTRAINT "storage_integrations_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_buckets" ADD CONSTRAINT "storage_buckets_storage_integration_id_fkey" FOREIGN KEY ("storage_integration_id") REFERENCES "storage_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_logs" ADD CONSTRAINT "storage_logs_storage_integration_id_fkey" FOREIGN KEY ("storage_integration_id") REFERENCES "storage_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_logs" ADD CONSTRAINT "storage_logs_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

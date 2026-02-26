-- CreateEnum
CREATE TYPE "AutomationTriggerEvent" AS ENUM ('PRODUCT_PUBLISHED', 'PRODUCT_UPDATED');

-- CreateEnum
CREATE TYPE "AutomationActionType" AS ENUM ('SEND_EMAIL', 'POST_FACEBOOK', 'POST_TIKTOK', 'CREATE_TIKTOK_AD');

-- CreateEnum
CREATE TYPE "ChannelConnectionChannel" AS ENUM ('EMAIL_PROVIDER', 'META', 'TIKTOK');

-- CreateEnum
CREATE TYPE "ChannelConnectionStatus" AS ENUM ('CONNECTED', 'EXPIRED', 'REVOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "AutomationEventType" AS ENUM ('PRODUCT_PUBLISHED', 'PRODUCT_UPDATED');

-- CreateEnum
CREATE TYPE "AutomationEntityType" AS ENUM ('PRODUCT');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('NEW', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "JobRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActionRunStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('EMAIL', 'FACEBOOK', 'TIKTOK');

-- CreateEnum
CREATE TYPE "AudienceMemberStatus" AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('SHIPPING', 'BILLING', 'BOTH');

-- CreateEnum
CREATE TYPE "MenuSetKey" AS ENUM ('home', 'v1');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PLACED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('UNFULFILLED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentDirection" AS ENUM ('CAPTURE', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentTxStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'CARD', 'BANK_TRANSFER', 'WALLET');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED');

-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('STANDARD', 'EXPRESS');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'SUB_USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "triggerEvent" "AutomationTriggerEvent" NOT NULL,
    "filterJson" JSONB,
    "cooldownSeconds" INTEGER,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_actions" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "type" "AutomationActionType" NOT NULL,
    "configJson" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_connections" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "channel" "ChannelConnectionChannel" NOT NULL,
    "provider" TEXT NOT NULL,
    "accountId" TEXT,
    "accessTokenEnc" TEXT NOT NULL,
    "refreshTokenEnc" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT,
    "status" "ChannelConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_event_outbox" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "eventType" "AutomationEventType" NOT NULL,
    "entityType" "AutomationEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'NEW',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_job_runs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "eventOutboxId" TEXT NOT NULL,
    "status" "JobRunStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_job_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_action_runs" (
    "id" TEXT NOT NULL,
    "jobRunId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "channel" "ChannelConnectionChannel" NOT NULL,
    "status" "ActionRunStatus" NOT NULL DEFAULT 'PENDING',
    "requestPayloadJson" JSONB,
    "responsePayloadJson" JSONB,
    "externalReferenceId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_action_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variablesSchema" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audiences" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audience_members" (
    "id" TEXT NOT NULL,
    "audienceId" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT NOT NULL,
    "status" "AudienceMemberStatus" NOT NULL DEFAULT 'SUBSCRIBED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audience_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "avatar_url" TEXT,
    "notes" TEXT,
    "tags" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_order_at" TIMESTAMP(3),
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type" "AddressType" NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "receiver_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "ward" TEXT,
    "district" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'VN',
    "postal_code" TEXT,
    "company_name" TEXT,
    "tax_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "parentId" VARCHAR(191),
    "title" VARCHAR(191) NOT NULL,
    "path" VARCHAR(255),
    "icon" VARCHAR(100),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "setKey" "MenuSetKey" NOT NULL DEFAULT 'home',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "order_number" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "fulfillment_status" "FulfillmentStatus" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "subtotal_cents" INTEGER NOT NULL DEFAULT 0,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,
    "shipping_cents" INTEGER NOT NULL DEFAULT 0,
    "tax_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL DEFAULT 0,
    "customer_name_snapshot" TEXT,
    "customer_email_snapshot" TEXT,
    "customer_phone_snapshot" TEXT,
    "ship_to_name" TEXT,
    "ship_to_phone" TEXT,
    "ship_addr1" TEXT,
    "ship_addr2" TEXT,
    "ship_city" TEXT,
    "ship_region" TEXT,
    "ship_postal" TEXT,
    "ship_country" TEXT,
    "source" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "placed_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "product_id" TEXT,
    "variant_id" TEXT,
    "product_name_snapshot" TEXT NOT NULL,
    "variant_name_snapshot" TEXT,
    "sku_snapshot" TEXT,
    "image_snapshot" TEXT,
    "qty" INTEGER NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "subtotal_cents" INTEGER NOT NULL,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,
    "tax_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "direction" "PaymentDirection" NOT NULL,
    "status" "PaymentTxStatus" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "provider" TEXT,
    "provider_transaction_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "idempotency_key" TEXT,
    "reference" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillments" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL,
    "carrier" TEXT,
    "tracking_number" TEXT,
    "tracking_url" TEXT,
    "estimated_delivery_at" TIMESTAMP(3),
    "picked_up_at" TIMESTAMP(3),
    "shipped_at" TIMESTAMP(3),
    "out_for_delivery_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "shipping_method" "ShippingMethod" NOT NULL,
    "shipping_fee_cents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fulfillments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillment_items" (
    "id" TEXT NOT NULL,
    "fulfillment_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "fulfillment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "blocks" JSONB,
    "seo_title" TEXT,
    "seo_desc" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "compare_at_price" DECIMAL(12,2),
    "stock_qty" INTEGER NOT NULL DEFAULT 0,
    "barcode" TEXT,
    "weight" DECIMAL(12,3),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_option_values" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "option_name" TEXT NOT NULL,
    "option_value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category_map" (
    "product_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "product_category_map_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "status" "SiteStatus" NOT NULL DEFAULT 'DRAFT',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "theme_config" JSONB,
    "seo_title_default" TEXT,
    "seo_desc_default" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_id" TEXT,
    "last_seen_at" TIMESTAMP(3),
    "rotated_from_session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "user_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "target_user_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "meta_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_two_factor" (
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "secret_enc" TEXT,
    "enabled_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_two_factor_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_backup_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_uid" TEXT NOT NULL,
    "device_name" TEXT,
    "platform" TEXT,
    "trusted" BOOLEAN NOT NULL DEFAULT false,
    "first_seen_at" TIMESTAMP(3) NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL,
    "last_ip" TEXT,
    "last_user_agent" TEXT,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_rules_siteId_triggerEvent_idx" ON "automation_rules"("siteId", "triggerEvent");

-- CreateIndex
CREATE INDEX "automation_rules_siteId_enabled_idx" ON "automation_rules"("siteId", "enabled");

-- CreateIndex
CREATE INDEX "automation_actions_ruleId_sortOrder_idx" ON "automation_actions"("ruleId", "sortOrder");

-- CreateIndex
CREATE INDEX "automation_actions_ruleId_enabled_idx" ON "automation_actions"("ruleId", "enabled");

-- CreateIndex
CREATE INDEX "channel_connections_siteId_channel_idx" ON "channel_connections"("siteId", "channel");

-- CreateIndex
CREATE INDEX "channel_connections_siteId_status_idx" ON "channel_connections"("siteId", "status");

-- CreateIndex
CREATE INDEX "automation_event_outbox_siteId_status_nextRetryAt_idx" ON "automation_event_outbox"("siteId", "status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "automation_event_outbox_eventType_entityType_entityId_idx" ON "automation_event_outbox"("eventType", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "automation_job_runs_siteId_status_createdAt_idx" ON "automation_job_runs"("siteId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "automation_job_runs_ruleId_createdAt_idx" ON "automation_job_runs"("ruleId", "createdAt");

-- CreateIndex
CREATE INDEX "automation_job_runs_eventOutboxId_idx" ON "automation_job_runs"("eventOutboxId");

-- CreateIndex
CREATE INDEX "automation_action_runs_jobRunId_status_idx" ON "automation_action_runs"("jobRunId", "status");

-- CreateIndex
CREATE INDEX "automation_action_runs_actionId_idx" ON "automation_action_runs"("actionId");

-- CreateIndex
CREATE INDEX "message_templates_siteId_channel_idx" ON "message_templates"("siteId", "channel");

-- CreateIndex
CREATE INDEX "audiences_siteId_name_idx" ON "audiences"("siteId", "name");

-- CreateIndex
CREATE INDEX "audience_members_audienceId_status_idx" ON "audience_members"("audienceId", "status");

-- CreateIndex
CREATE INDEX "audience_members_email_idx" ON "audience_members"("email");

-- CreateIndex
CREATE INDEX "idx_customers_site_phone" ON "customers"("site_id", "phone");

-- CreateIndex
CREATE INDEX "idx_customers_site_created_at" ON "customers"("site_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_customers_site_last_order_at" ON "customers"("site_id", "last_order_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_customers_site_email" ON "customers"("site_id", "email");

-- CreateIndex
CREATE INDEX "idx_addresses_site_customer" ON "addresses"("site_id", "customer_id");

-- CreateIndex
CREATE INDEX "MenuItem_parentId_idx" ON "MenuItem"("parentId");

-- CreateIndex
CREATE INDEX "MenuItem_siteId_setKey_sortOrder_idx" ON "MenuItem"("siteId", "setKey", "sortOrder");

-- CreateIndex
CREATE INDEX "MenuItem_title_idx" ON "MenuItem"("title");

-- CreateIndex
CREATE INDEX "idx_orders_site_created_at" ON "orders"("site_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_orders_site_placed_at" ON "orders"("site_id", "placed_at");

-- CreateIndex
CREATE INDEX "idx_orders_site_status" ON "orders"("site_id", "status");

-- CreateIndex
CREATE INDEX "idx_orders_customer" ON "orders"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_orders_site_order_number" ON "orders"("site_id", "order_number");

-- CreateIndex
CREATE INDEX "idx_order_items_order" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_items_site_created_at" ON "order_items"("site_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_order_items_product" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "idx_order_items_variant" ON "order_items"("variant_id");

-- CreateIndex
CREATE INDEX "idx_payments_site_occurred_at" ON "payments"("site_id", "occurred_at");

-- CreateIndex
CREATE INDEX "idx_payments_order" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_payments_site_idempotency_key" ON "payments"("site_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "idx_fulfillments_order" ON "fulfillments"("order_id");

-- CreateIndex
CREATE INDEX "idx_fulfillments_site_status" ON "fulfillments"("site_id", "status");

-- CreateIndex
CREATE INDEX "idx_fulfillments_tracking_number" ON "fulfillments"("tracking_number");

-- CreateIndex
CREATE INDEX "idx_fulfillment_items_fulfillment" ON "fulfillment_items"("fulfillment_id");

-- CreateIndex
CREATE INDEX "idx_fulfillment_items_order_item" ON "fulfillment_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_fulfillment_items_unique_pair" ON "fulfillment_items"("fulfillment_id", "order_item_id");

-- CreateIndex
CREATE INDEX "pages_site_id_idx" ON "pages"("site_id");

-- CreateIndex
CREATE INDEX "pages_site_id_status_idx" ON "pages"("site_id", "status");

-- CreateIndex
CREATE INDEX "pages_site_id_published_at_idx" ON "pages"("site_id", "published_at");

-- CreateIndex
CREATE INDEX "pages_site_id_sort_order_idx" ON "pages"("site_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "pages_site_id_slug_key" ON "pages"("site_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_site_id_path_key" ON "pages"("site_id", "path");

-- CreateIndex
CREATE INDEX "products_site_id_idx" ON "products"("site_id");

-- CreateIndex
CREATE INDEX "products_site_id_status_idx" ON "products"("site_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "products_site_id_slug_key" ON "products"("site_id", "slug");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_variants_site_id_idx" ON "product_variants"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_site_id_sku_key" ON "product_variants"("site_id", "sku");

-- CreateIndex
CREATE INDEX "product_option_values_product_id_idx" ON "product_option_values"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_option_values_product_id_option_name_option_value_key" ON "product_option_values"("product_id", "option_name", "option_value");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

-- CreateIndex
CREATE INDEX "product_images_variant_id_idx" ON "product_images"("variant_id");

-- CreateIndex
CREATE INDEX "product_images_product_id_sort_order_idx" ON "product_images"("product_id", "sort_order");

-- CreateIndex
CREATE INDEX "product_categories_site_id_idx" ON "product_categories"("site_id");

-- CreateIndex
CREATE INDEX "product_categories_parent_id_idx" ON "product_categories"("parent_id");

-- CreateIndex
CREATE INDEX "product_categories_site_id_sort_order_idx" ON "product_categories"("site_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_site_id_slug_key" ON "product_categories"("site_id", "slug");

-- CreateIndex
CREATE INDEX "product_category_map_category_id_idx" ON "product_category_map"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "sites_domain_key" ON "sites"("domain");

-- CreateIndex
CREATE INDEX "sites_owner_user_id_idx" ON "sites"("owner_user_id");

-- CreateIndex
CREATE INDEX "sites_status_idx" ON "sites"("status");

-- CreateIndex
CREATE INDEX "sites_is_public_idx" ON "sites"("is_public");

-- CreateIndex
CREATE INDEX "sites_published_at_idx" ON "sites"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refresh_token_hash_key" ON "user_sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "user_sessions_revoked_at_idx" ON "user_sessions"("revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "email_verification_tokens_expires_at_idx" ON "email_verification_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "email_verification_tokens_token_hash_idx" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "login_attempts_ip_address_created_at_idx" ON "login_attempts"("ip_address", "created_at");

-- CreateIndex
CREATE INDEX "login_attempts_email_created_at_idx" ON "login_attempts"("email", "created_at");

-- CreateIndex
CREATE INDEX "login_attempts_user_id_created_at_idx" ON "login_attempts"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "user_backup_codes_user_id_idx" ON "user_backup_codes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_backup_codes_user_id_code_hash_key" ON "user_backup_codes"("user_id", "code_hash");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_device_uid_key" ON "user_devices"("device_uid");

-- CreateIndex
CREATE INDEX "user_devices_user_id_idx" ON "user_devices"("user_id");

-- CreateIndex
CREATE INDEX "user_devices_user_id_trusted_idx" ON "user_devices"("user_id", "trusted");

-- CreateIndex
CREATE INDEX "user_devices_last_seen_at_idx" ON "user_devices"("last_seen_at");

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_actions" ADD CONSTRAINT "automation_actions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_connections" ADD CONSTRAINT "channel_connections_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_event_outbox" ADD CONSTRAINT "automation_event_outbox_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_job_runs" ADD CONSTRAINT "automation_job_runs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_job_runs" ADD CONSTRAINT "automation_job_runs_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_job_runs" ADD CONSTRAINT "automation_job_runs_eventOutboxId_fkey" FOREIGN KEY ("eventOutboxId") REFERENCES "automation_event_outbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_action_runs" ADD CONSTRAINT "automation_action_runs_jobRunId_fkey" FOREIGN KEY ("jobRunId") REFERENCES "automation_job_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_action_runs" ADD CONSTRAINT "automation_action_runs_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "automation_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audiences" ADD CONSTRAINT "audiences_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audience_members" ADD CONSTRAINT "audience_members_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "audiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audience_members" ADD CONSTRAINT "audience_members_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillments" ADD CONSTRAINT "fulfillments_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillments" ADD CONSTRAINT "fulfillments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillment_items" ADD CONSTRAINT "fulfillment_items_fulfillment_id_fkey" FOREIGN KEY ("fulfillment_id") REFERENCES "fulfillments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillment_items" ADD CONSTRAINT "fulfillment_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category_map" ADD CONSTRAINT "product_category_map_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category_map" ADD CONSTRAINT "product_category_map_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_rotated_from_session_id_fkey" FOREIGN KEY ("rotated_from_session_id") REFERENCES "user_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_two_factor" ADD CONSTRAINT "user_two_factor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_backup_codes" ADD CONSTRAINT "user_backup_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

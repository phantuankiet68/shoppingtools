-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('OPENING', 'SALE', 'RESTOCK', 'RESERVE', 'RELEASE_RESERVATION', 'ADJUSTMENT_INCREASE', 'ADJUSTMENT_DECREASE', 'RETURN', 'DAMAGE', 'LOSS', 'PURCHASE_RECEIPT', 'PURCHASE_RECEIPT_CANCEL', 'MANUAL');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseOrderLineStatus" AS ENUM ('PENDING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "stock_levels" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "on_hand" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER NOT NULL DEFAULT 0,
    "incoming" INTEGER NOT NULL DEFAULT 0,
    "reorder_point" INTEGER,
    "safety_stock" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "stock_level_id" TEXT,
    "type" "StockMovementType" NOT NULL,
    "quantity_delta" INTEGER NOT NULL,
    "before_on_hand" INTEGER NOT NULL DEFAULT 0,
    "after_on_hand" INTEGER NOT NULL DEFAULT 0,
    "before_reserved" INTEGER NOT NULL DEFAULT 0,
    "after_reserved" INTEGER NOT NULL DEFAULT 0,
    "before_available" INTEGER NOT NULL DEFAULT 0,
    "after_available" INTEGER NOT NULL DEFAULT 0,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "note" TEXT,
    "metadata" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_code" TEXT,
    "supplier_email" TEXT,
    "supplier_phone" TEXT,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "ordered_at" TIMESTAMP(3),
    "expected_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "subtotal_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shipping_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "created_by" TEXT,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_lines" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "variant_title" TEXT,
    "ordered_qty" INTEGER NOT NULL,
    "received_qty" INTEGER NOT NULL DEFAULT 0,
    "remaining_qty" INTEGER NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(12,2) NOT NULL,
    "line_total" DECIMAL(12,2) NOT NULL,
    "status" "PurchaseOrderLineStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_receipts" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_receipt_lines" (
    "id" TEXT NOT NULL,
    "purchase_order_receipt_id" TEXT NOT NULL,
    "purchase_order_line_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "received_qty" INTEGER NOT NULL,
    "unit_cost" DECIMAL(12,2),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_receipt_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_levels_site_id_idx" ON "stock_levels"("site_id");

-- CreateIndex
CREATE INDEX "stock_levels_site_id_available_idx" ON "stock_levels"("site_id", "available");

-- CreateIndex
CREATE INDEX "stock_levels_site_id_on_hand_idx" ON "stock_levels"("site_id", "on_hand");

-- CreateIndex
CREATE INDEX "stock_levels_site_id_reorder_point_idx" ON "stock_levels"("site_id", "reorder_point");

-- CreateIndex
CREATE UNIQUE INDEX "stock_levels_variant_id_key" ON "stock_levels"("variant_id");

-- CreateIndex
CREATE INDEX "stock_movements_site_id_idx" ON "stock_movements"("site_id");

-- CreateIndex
CREATE INDEX "stock_movements_variant_id_idx" ON "stock_movements"("variant_id");

-- CreateIndex
CREATE INDEX "stock_movements_stock_level_id_idx" ON "stock_movements"("stock_level_id");

-- CreateIndex
CREATE INDEX "stock_movements_site_id_variant_id_created_at_idx" ON "stock_movements"("site_id", "variant_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_movements_reference_type_reference_id_idx" ON "stock_movements"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "purchase_orders_site_id_idx" ON "purchase_orders"("site_id");

-- CreateIndex
CREATE INDEX "purchase_orders_site_id_status_idx" ON "purchase_orders"("site_id", "status");

-- CreateIndex
CREATE INDEX "purchase_orders_site_id_ordered_at_idx" ON "purchase_orders"("site_id", "ordered_at");

-- CreateIndex
CREATE INDEX "purchase_orders_site_id_expected_at_idx" ON "purchase_orders"("site_id", "expected_at");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_site_id_po_number_key" ON "purchase_orders"("site_id", "po_number");

-- CreateIndex
CREATE INDEX "purchase_order_lines_purchase_order_id_idx" ON "purchase_order_lines"("purchase_order_id");

-- CreateIndex
CREATE INDEX "purchase_order_lines_site_id_idx" ON "purchase_order_lines"("site_id");

-- CreateIndex
CREATE INDEX "purchase_order_lines_variant_id_idx" ON "purchase_order_lines"("variant_id");

-- CreateIndex
CREATE INDEX "purchase_order_lines_site_id_sku_idx" ON "purchase_order_lines"("site_id", "sku");

-- CreateIndex
CREATE INDEX "purchase_order_receipts_purchase_order_id_idx" ON "purchase_order_receipts"("purchase_order_id");

-- CreateIndex
CREATE INDEX "purchase_order_receipts_site_id_idx" ON "purchase_order_receipts"("site_id");

-- CreateIndex
CREATE INDEX "purchase_order_receipts_site_id_received_at_idx" ON "purchase_order_receipts"("site_id", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_order_receipts_site_id_receipt_number_key" ON "purchase_order_receipts"("site_id", "receipt_number");

-- CreateIndex
CREATE INDEX "purchase_order_receipt_lines_purchase_order_receipt_id_idx" ON "purchase_order_receipt_lines"("purchase_order_receipt_id");

-- CreateIndex
CREATE INDEX "purchase_order_receipt_lines_purchase_order_line_id_idx" ON "purchase_order_receipt_lines"("purchase_order_line_id");

-- CreateIndex
CREATE INDEX "purchase_order_receipt_lines_site_id_idx" ON "purchase_order_receipt_lines"("site_id");

-- CreateIndex
CREATE INDEX "purchase_order_receipt_lines_variant_id_idx" ON "purchase_order_receipt_lines"("variant_id");

-- AddForeignKey
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stock_level_id_fkey" FOREIGN KEY ("stock_level_id") REFERENCES "stock_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_receipts" ADD CONSTRAINT "purchase_order_receipts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_receipts" ADD CONSTRAINT "purchase_order_receipts_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_receipt_lines" ADD CONSTRAINT "purchase_order_receipt_lines_purchase_order_receipt_id_fkey" FOREIGN KEY ("purchase_order_receipt_id") REFERENCES "purchase_order_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_receipt_lines" ADD CONSTRAINT "purchase_order_receipt_lines_purchase_order_line_id_fkey" FOREIGN KEY ("purchase_order_line_id") REFERENCES "purchase_order_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_receipt_lines" ADD CONSTRAINT "purchase_order_receipt_lines_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_receipt_lines" ADD CONSTRAINT "purchase_order_receipt_lines_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL', 'SERVICE');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'DATE');

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "cost" DECIMAL(12,2),
ADD COLUMN     "height" DECIMAL(12,3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "length" DECIMAL(12,3),
ADD COLUMN     "title" TEXT,
ADD COLUMN     "width" DECIMAL(12,3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "height" DECIMAL(12,3),
ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "length" DECIMAL(12,3),
ADD COLUMN     "meta_description" TEXT,
ADD COLUMN     "meta_title" TEXT,
ADD COLUMN     "product_type" "ProductType" NOT NULL DEFAULT 'PHYSICAL',
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "short_description" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "vendor" TEXT,
ADD COLUMN     "weight" DECIMAL(12,3),
ADD COLUMN     "width" DECIMAL(12,3);

-- CreateTable
CREATE TABLE "product_variant_option_values" (
    "variant_id" TEXT NOT NULL,
    "option_value_id" TEXT NOT NULL,

    CONSTRAINT "product_variant_option_values_pkey" PRIMARY KEY ("variant_id","option_value_id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "unit" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attribute_options" (
    "id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_attribute_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attribute_values" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "attribute_id" TEXT NOT NULL,
    "valueText" TEXT,
    "valueNumber" DECIMAL(18,6),
    "valueBool" BOOLEAN,
    "valueDate" TIMESTAMP(3),
    "option_id" TEXT,

    CONSTRAINT "product_attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_variant_option_values_option_value_id_idx" ON "product_variant_option_values"("option_value_id");

-- CreateIndex
CREATE INDEX "product_attributes_site_id_category_id_idx" ON "product_attributes"("site_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_attributes_site_id_category_id_code_key" ON "product_attributes"("site_id", "category_id", "code");

-- CreateIndex
CREATE INDEX "product_attribute_options_attribute_id_idx" ON "product_attribute_options"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_attribute_options_attribute_id_value_key" ON "product_attribute_options"("attribute_id", "value");

-- CreateIndex
CREATE INDEX "product_attribute_values_product_id_idx" ON "product_attribute_values"("product_id");

-- CreateIndex
CREATE INDEX "product_attribute_values_variant_id_idx" ON "product_attribute_values"("variant_id");

-- CreateIndex
CREATE INDEX "product_attribute_values_attribute_id_idx" ON "product_attribute_values"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_attribute_values_product_id_variant_id_attribute_id_key" ON "product_attribute_values"("product_id", "variant_id", "attribute_id", "option_id");

-- CreateIndex
CREATE INDEX "products_site_id_is_visible_idx" ON "products"("site_id", "is_visible");

-- CreateIndex
CREATE INDEX "products_site_id_published_at_idx" ON "products"("site_id", "published_at");

-- AddForeignKey
ALTER TABLE "product_variant_option_values" ADD CONSTRAINT "product_variant_option_values_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_option_values" ADD CONSTRAINT "product_variant_option_values_option_value_id_fkey" FOREIGN KEY ("option_value_id") REFERENCES "product_option_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_options" ADD CONSTRAINT "product_attribute_options_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "product_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "product_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "product_attribute_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

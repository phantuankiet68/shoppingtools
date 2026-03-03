-- CreateTable
CREATE TABLE "page_seo" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT,
    "canonical_url" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "nofollow" BOOLEAN NOT NULL DEFAULT false,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "twitter_card" TEXT,
    "sitemap_changefreq" TEXT,
    "sitemap_priority" DOUBLE PRECISION,
    "structured_data" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_seo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_seo_page_id_key" ON "page_seo"("page_id");

-- CreateIndex
CREATE INDEX "page_seo_noindex_idx" ON "page_seo"("noindex");

-- AddForeignKey
ALTER TABLE "page_seo" ADD CONSTRAINT "page_seo_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

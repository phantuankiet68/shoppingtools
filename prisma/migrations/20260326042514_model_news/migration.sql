-- CreateEnum
CREATE TYPE "NewsAccent" AS ENUM ('pink', 'cyan', 'orange', 'purple', 'blue');

-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "href" VARCHAR(500),
    "excerpt" TEXT,
    "content" TEXT,
    "imageSrc" VARCHAR(1000),
    "imageAlt" VARCHAR(255),
    "category" VARCHAR(100),
    "badge" VARCHAR(100),
    "accent" "NewsAccent" NOT NULL DEFAULT 'pink',
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "views" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(2,1),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "status" "NewsStatus" NOT NULL DEFAULT 'PUBLISHED',
    "author" VARCHAR(120),
    "publishedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "seoTitle" VARCHAR(255),
    "seoDescription" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_slug_idx" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_category_idx" ON "News"("category");

-- CreateIndex
CREATE INDEX "News_status_idx" ON "News"("status");

-- CreateIndex
CREATE INDEX "News_isFeatured_idx" ON "News"("isFeatured");

-- CreateIndex
CREATE INDEX "News_isTrending_idx" ON "News"("isTrending");

-- CreateIndex
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");

-- CreateIndex
CREATE INDEX "News_createdAt_idx" ON "News"("createdAt");

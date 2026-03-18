-- AlterTable
ALTER TABLE "RequestDocuments" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('draft', 'uploading', 'processing', 'ready', 'failed');

-- DropIndex
DROP INDEX "lessons_section_id_idx";

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "raw_upload_key" TEXT,
ADD COLUMN     "status" "LessonStatus" NOT NULL DEFAULT 'draft',
ALTER COLUMN "video_url" DROP NOT NULL,
ALTER COLUMN "duration_seconds" DROP NOT NULL;

/*
  Warnings:

  - A unique constraint covering the columns `[publicToken]` on the table `streaming` will be added. If there are existing duplicate values, this will fail.
  - The required column `publicToken` was added to the `streaming` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterEnum
ALTER TYPE "StatusAssinatura" ADD VALUE 'pendente';

-- AlterTable
ALTER TABLE "streaming" ADD COLUMN "publicToken" TEXT;

-- Update existing rows with a random UUID
UPDATE "streaming" SET "publicToken" = gen_random_uuid()::text WHERE "publicToken" IS NULL;

-- Make the column required
ALTER TABLE "streaming" ALTER COLUMN "publicToken" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "streaming_publicToken_key" ON "streaming"("publicToken");

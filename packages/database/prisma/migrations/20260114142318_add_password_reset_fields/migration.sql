/*
  Warnings:

  - You are about to drop the column `dataVencimento` on the `streaming` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "streaming" DROP COLUMN "dataVencimento";

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

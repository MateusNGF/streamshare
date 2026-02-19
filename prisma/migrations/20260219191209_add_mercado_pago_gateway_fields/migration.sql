/*
  Warnings:

  - You are about to drop the column `stripeCancelAtPeriodEnd` on the `conta` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `conta` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `conta` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionStatus` on the `conta` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gatewayCustomerId]` on the table `conta` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gatewaySubscriptionId]` on the table `conta` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('CREDIT_CARD', 'PIX');

-- AlterEnum
ALTER TYPE "StatusCobranca" ADD VALUE 'estornado';

-- DropIndex
DROP INDEX "conta_stripeCustomerId_key";

-- DropIndex
DROP INDEX "conta_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "assinatura" ADD COLUMN     "autoRenovacao" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "cobranca" ADD COLUMN     "gatewayId" TEXT,
ADD COLUMN     "metodoPagamento" "MetodoPagamento",
ADD COLUMN     "pixCopiaECola" TEXT,
ADD COLUMN     "pixQrCode" TEXT;

-- AlterTable
ALTER TABLE "conta" DROP COLUMN "stripeCancelAtPeriodEnd",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "stripeSubscriptionStatus",
ADD COLUMN     "gatewayCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gatewayCustomerId" TEXT,
ADD COLUMN     "gatewaySubscriptionId" TEXT,
ADD COLUMN     "gatewaySubscriptionStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "conta_gatewayCustomerId_key" ON "conta"("gatewayCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "conta_gatewaySubscriptionId_key" ON "conta"("gatewaySubscriptionId");

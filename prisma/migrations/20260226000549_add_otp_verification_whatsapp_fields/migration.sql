/*
  Warnings:

  - You are about to drop the column `whatsapp` on the `usuario` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusCobranca" ADD VALUE 'estornado';
ALTER TYPE "StatusCobranca" ADD VALUE 'aguardando_aprovacao';

-- AlterTable
ALTER TABLE "cobranca" ADD COLUMN     "dataEnvioComprovante" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "participante" ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappVerificado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "whatsapp",
ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappNumero" TEXT,
ADD COLUMN     "whatsappVerificado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "verificacao_codigo" (
    "id" SERIAL NOT NULL,
    "destino" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'EMAIL',
    "codigo" TEXT NOT NULL,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "expiracao" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verificacao_codigo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verificacao_codigo_destino_codigo_idx" ON "verificacao_codigo"("destino", "codigo");

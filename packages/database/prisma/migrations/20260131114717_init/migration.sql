/*
  Warnings:

  - The values [premium] on the enum `PlanoConta` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `conta` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `conta` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apelido` to the `streaming` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoNotificacaoWhatsApp" AS ENUM ('nova_assinatura', 'cobranca_gerada', 'cobranca_vencendo', 'cobranca_atrasada', 'assinatura_suspensa', 'pagamento_confirmado');

-- AlterEnum
BEGIN;
CREATE TYPE "PlanoConta_new" AS ENUM ('basico', 'pro');
ALTER TABLE "conta" ALTER COLUMN "plano" TYPE "PlanoConta_new" USING ("plano"::text::"PlanoConta_new");
ALTER TYPE "PlanoConta" RENAME TO "PlanoConta_old";
ALTER TYPE "PlanoConta_new" RENAME TO "PlanoConta";
DROP TYPE "PlanoConta_old";
COMMIT;

-- AlterTable
ALTER TABLE "conta" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "stripeSubscriptionStatus" TEXT;

-- AlterTable
ALTER TABLE "streaming" ADD COLUMN     "apelido" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "whatsapp_config" (
    "id" SERIAL NOT NULL,
    "contaId" INTEGER NOT NULL,
    "notificarNovaAssinatura" BOOLEAN NOT NULL DEFAULT true,
    "notificarCobrancaGerada" BOOLEAN NOT NULL DEFAULT true,
    "notificarCobrancaVencendo" BOOLEAN NOT NULL DEFAULT true,
    "notificarCobrancaAtrasada" BOOLEAN NOT NULL DEFAULT true,
    "notificarAssinaturaSuspensa" BOOLEAN NOT NULL DEFAULT true,
    "notificarPagamentoConfirmado" BOOLEAN NOT NULL DEFAULT true,
    "diasAvisoVencimento" INTEGER NOT NULL DEFAULT 3,
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_log" (
    "id" SERIAL NOT NULL,
    "configId" INTEGER NOT NULL,
    "participanteId" INTEGER,
    "tipo" "TipoNotificacaoWhatsApp" NOT NULL,
    "numeroDestino" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "erro" TEXT,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_admin" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametro" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'string',
    "descricao" TEXT,
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_config_contaId_key" ON "whatsapp_config"("contaId");

-- CreateIndex
CREATE INDEX "whatsapp_log_configId_createdAt_idx" ON "whatsapp_log"("configId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_admin_usuarioId_key" ON "usuario_admin"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "parametro_chave_key" ON "parametro"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "conta_stripeCustomerId_key" ON "conta"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "conta_stripeSubscriptionId_key" ON "conta"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "whatsapp_config" ADD CONSTRAINT "whatsapp_config_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_log" ADD CONSTRAINT "whatsapp_log_configId_fkey" FOREIGN KEY ("configId") REFERENCES "whatsapp_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_log" ADD CONSTRAINT "whatsapp_log_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "participante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_admin" ADD CONSTRAINT "usuario_admin_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

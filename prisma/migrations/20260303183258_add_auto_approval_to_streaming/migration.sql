-- AlterTable
ALTER TABLE "convite" ALTER COLUMN "token" DROP NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lote_pagamento" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "motivoRejeicao" TEXT;

-- AlterTable
ALTER TABLE "streaming" ADD COLUMN     "autoAprovarSolicitacoes" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "whatsapp_log" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "statusEntrega" TEXT DEFAULT 'sent';

-- CreateIndex
CREATE INDEX "whatsapp_log_providerId_idx" ON "whatsapp_log"("providerId");

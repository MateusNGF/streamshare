-- DropIndex
DROP INDEX "notificacao_contaId_lida_idx";

-- AlterTable
ALTER TABLE "conta" ADD COLUMN     "stripeCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "notificacao_usuarioId_createdAt_idx" ON "notificacao"("usuarioId", "createdAt");

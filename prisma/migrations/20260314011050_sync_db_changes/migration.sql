-- AlterTable
ALTER TABLE "streaming" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "cobranca_status_dataVencimento_idx" ON "cobranca"("status", "dataVencimento");

-- CreateIndex
CREATE INDEX "cobranca_assinaturaId_idx" ON "cobranca"("assinaturaId");

-- CreateIndex
CREATE INDEX "cobranca_lotePagamentoId_idx" ON "cobranca"("lotePagamentoId");

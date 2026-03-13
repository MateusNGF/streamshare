-- AlterTable
ALTER TABLE "streaming" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "assinatura_history" (
    "id" SERIAL NOT NULL,
    "assinaturaId" INTEGER NOT NULL,
    "statusAnterior" "StatusAssinatura",
    "statusNovo" "StatusAssinatura" NOT NULL,
    "valorAnterior" DECIMAL(65,30),
    "valorNovo" DECIMAL(65,30) NOT NULL,
    "frequenciaAnterior" "FrequenciaPagamento",
    "frequenciaNovo" "FrequenciaPagamento" NOT NULL,
    "motivo" TEXT,
    "origem" TEXT NOT NULL DEFAULT 'USER',
    "alteradoPor" INTEGER,
    "validoDe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validoAte" TIMESTAMP(3),

    CONSTRAINT "assinatura_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaming_history" (
    "id" SERIAL NOT NULL,
    "streamingId" INTEGER NOT NULL,
    "valorAnterior" DECIMAL(65,30),
    "valorNovo" DECIMAL(65,30) NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'USER',
    "validoDe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validoAte" TIMESTAMP(3),

    CONSTRAINT "streaming_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lote_history" (
    "id" SERIAL NOT NULL,
    "lotePagamentoId" INTEGER NOT NULL,
    "statusAnterior" "StatusLote",
    "statusNovo" "StatusLote" NOT NULL,
    "motivo" TEXT,
    "origem" TEXT NOT NULL DEFAULT 'USER',
    "alteradoBy" INTEGER,
    "validoDe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validoAte" TIMESTAMP(3),

    CONSTRAINT "lote_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assinatura_history_assinaturaId_validoDe_validoAte_idx" ON "assinatura_history"("assinaturaId", "validoDe", "validoAte");

-- CreateIndex
CREATE INDEX "streaming_history_streamingId_validoDe_validoAte_idx" ON "streaming_history"("streamingId", "validoDe", "validoAte");

-- CreateIndex
CREATE INDEX "lote_history_lotePagamentoId_validoDe_validoAte_idx" ON "lote_history"("lotePagamentoId", "validoDe", "validoAte");

-- AddForeignKey
ALTER TABLE "assinatura_history" ADD CONSTRAINT "assinatura_history_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "assinatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaming_history" ADD CONSTRAINT "streaming_history_streamingId_fkey" FOREIGN KEY ("streamingId") REFERENCES "streaming"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_history" ADD CONSTRAINT "lote_history_lotePagamentoId_fkey" FOREIGN KEY ("lotePagamentoId") REFERENCES "lote_pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

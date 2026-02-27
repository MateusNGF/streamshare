-- CreateEnum
CREATE TYPE "StatusLote" AS ENUM ('pendente', 'aguardando_aprovacao', 'pago', 'cancelado');

-- AlterTable
ALTER TABLE "cobranca" ADD COLUMN     "lotePagamentoId" INTEGER;

-- CreateTable
CREATE TABLE "lote_pagamento" (
    "id" SERIAL NOT NULL,
    "participanteId" INTEGER NOT NULL,
    "valorTotal" DECIMAL(65,30) NOT NULL,
    "status" "StatusLote" NOT NULL DEFAULT 'pendente',
    "comprovanteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lote_pagamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cobranca" ADD CONSTRAINT "cobranca_lotePagamentoId_fkey" FOREIGN KEY ("lotePagamentoId") REFERENCES "lote_pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_pagamento" ADD CONSTRAINT "lote_pagamento_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "participante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

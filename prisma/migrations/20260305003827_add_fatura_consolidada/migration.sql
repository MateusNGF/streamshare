/*
  Warnings:

  - A unique constraint covering the columns `[participanteId,referenciaMes,contaId]` on the table `lote_pagamento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "conta" ALTER COLUMN "diasVencimento" SET DEFAULT ARRAY[5]::INTEGER[];

-- AlterTable
ALTER TABLE "lote_pagamento" ADD COLUMN     "contaId" INTEGER,
ADD COLUMN     "referenciaMes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "lote_pagamento_participanteId_referenciaMes_contaId_key" ON "lote_pagamento"("participanteId", "referenciaMes", "contaId");

-- AddForeignKey
ALTER TABLE "lote_pagamento" ADD CONSTRAINT "lote_pagamento_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "conta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `diasAtraso` on the `assinatura` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assinaturaId,periodoInicio]` on the table `cobranca` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "assinatura" DROP COLUMN "diasAtraso",
ADD COLUMN     "canceladoPorId" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "motivoCancelamento" TEXT;

-- AlterTable
ALTER TABLE "cobranca" ADD COLUMN     "dataVencimento" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "gatewayProvider" TEXT,
ADD COLUMN     "gatewayTransactionId" TEXT,
ADD COLUMN     "metadataJson" JSONB,
ADD COLUMN     "tentativas" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "participante" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "streaming" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "cobranca_assinaturaId_periodoInicio_key" ON "cobranca"("assinaturaId", "periodoInicio");

-- AddForeignKey
ALTER TABLE "assinatura" ADD CONSTRAINT "assinatura_canceladoPorId_fkey" FOREIGN KEY ("canceladoPorId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

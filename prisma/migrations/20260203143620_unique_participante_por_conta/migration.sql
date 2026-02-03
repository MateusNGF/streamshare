/*
  Warnings:

  - A unique constraint covering the columns `[contaId,cpf]` on the table `participante` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contaId,whatsappNumero]` on the table `participante` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "participante_cpf_key";

-- DropIndex
DROP INDEX "participante_whatsappNumero_key";

-- AlterTable
ALTER TABLE "participante" ALTER COLUMN "cpf" SET DEFAULT '';

-- AlterTable
ALTER TABLE "streaming" ALTER COLUMN "apelido" SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "participante_contaId_cpf_key" ON "participante"("contaId", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "participante_contaId_whatsappNumero_key" ON "participante"("contaId", "whatsappNumero");

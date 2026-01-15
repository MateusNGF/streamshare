/*
  Warnings:

  - You are about to drop the column `dataVencimento` on the `assinatura` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusCobranca" AS ENUM ('pendente', 'pago', 'atrasado', 'cancelado');

-- AlterTable
ALTER TABLE "assinatura" DROP COLUMN "dataVencimento";

-- CreateTable
CREATE TABLE "cobranca" (
    "id" SERIAL NOT NULL,
    "assinaturaId" INTEGER NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFim" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" "StatusCobranca" NOT NULL DEFAULT 'pendente',
    "comprovanteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cobranca_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cobranca" ADD CONSTRAINT "cobranca_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "assinatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

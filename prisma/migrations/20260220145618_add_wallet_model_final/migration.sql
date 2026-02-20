-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDITO_COTA', 'DEBITO_TAXA', 'SAQUE', 'ESTORNO', 'CHARGEBACK');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDENTE', 'CONCLUIDO', 'FALHA', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoChavePix" AS ENUM ('CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA');

-- CreateTable
CREATE TABLE "wallet" (
    "id" SERIAL NOT NULL,
    "contaId" INTEGER NOT NULL,
    "saldoDisponivel" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "saldoPendente" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "chavePixSaque" TEXT,
    "tipoChavePix" "TipoChavePix",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transaction" (
    "id" SERIAL NOT NULL,
    "walletId" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "tipo" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'CONCLUIDO',
    "descricao" TEXT NOT NULL,
    "referenciaGateway" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saque" (
    "id" SERIAL NOT NULL,
    "walletId" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDENTE',
    "chavePixDestino" TEXT NOT NULL,
    "tipoChaveDestino" "TipoChavePix" NOT NULL,
    "motivoRejeicao" TEXT,
    "transferenciaMpId" TEXT,
    "comprovanteUrl" TEXT,
    "aprovadoPorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_contaId_key" ON "wallet"("contaId");

-- CreateIndex
CREATE INDEX "wallet_transaction_walletId_createdAt_idx" ON "wallet_transaction"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "saque_status_createdAt_idx" ON "saque"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saque" ADD CONSTRAINT "saque_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

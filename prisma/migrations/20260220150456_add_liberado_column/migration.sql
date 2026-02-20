-- AlterTable
ALTER TABLE "wallet_transaction" ADD COLUMN     "isLiberado" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "wallet_transaction_isLiberado_createdAt_idx" ON "wallet_transaction"("isLiberado", "createdAt");

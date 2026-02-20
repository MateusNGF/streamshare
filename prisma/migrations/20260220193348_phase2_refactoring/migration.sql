-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'CLEARING';

-- AddForeignKey
ALTER TABLE "saque" ADD CONSTRAINT "saque_aprovadoPorId_fkey" FOREIGN KEY ("aprovadoPorId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

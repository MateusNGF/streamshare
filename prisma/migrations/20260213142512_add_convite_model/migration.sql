-- CreateEnum
CREATE TYPE "StatusParticipante" AS ENUM ('ativo', 'pendente', 'recusado', 'bloqueado', 'saiu');

-- CreateEnum
CREATE TYPE "StatusConvite" AS ENUM ('pendente', 'aceito', 'recusado', 'expirado');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoNotificacao" ADD VALUE 'solicitacao_participacao_criada';
ALTER TYPE "TipoNotificacao" ADD VALUE 'solicitacao_participacao_aceita';
ALTER TYPE "TipoNotificacao" ADD VALUE 'solicitacao_participacao_recusada';
ALTER TYPE "TipoNotificacao" ADD VALUE 'convite_recebido';
ALTER TYPE "TipoNotificacao" ADD VALUE 'convite_aceito';

-- AlterTable
ALTER TABLE "participante" ADD COLUMN     "status" "StatusParticipante" NOT NULL DEFAULT 'ativo';

-- CreateTable
CREATE TABLE "convite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contaId" INTEGER NOT NULL,
    "streamingId" INTEGER,
    "status" "StatusConvite" NOT NULL DEFAULT 'pendente',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "convidadoPorId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "convite_token_key" ON "convite"("token");

-- CreateIndex
CREATE INDEX "convite_email_idx" ON "convite"("email");

-- AddForeignKey
ALTER TABLE "convite" ADD CONSTRAINT "convite_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convite" ADD CONSTRAINT "convite_streamingId_fkey" FOREIGN KEY ("streamingId") REFERENCES "streaming"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convite" ADD CONSTRAINT "convite_convidadoPorId_fkey" FOREIGN KEY ("convidadoPorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convite" ADD CONSTRAINT "convite_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('participante_criado', 'participante_editado', 'participante_excluido', 'streaming_criado', 'streaming_editado', 'streaming_excluido', 'assinatura_criada', 'assinatura_editada', 'assinatura_suspensa', 'assinatura_cancelada', 'assinatura_renovada', 'cobranca_gerada', 'cobranca_confirmada', 'cobranca_cancelada', 'grupo_criado', 'grupo_editado', 'grupo_excluido', 'configuracao_alterada', 'plano_alterado');

-- CreateTable
CREATE TABLE "notificacao" (
    "id" SERIAL NOT NULL,
    "contaId" INTEGER NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "entidadeId" INTEGER,
    "usuarioId" INTEGER,
    "metadata" JSONB,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificacao_contaId_createdAt_idx" ON "notificacao"("contaId", "createdAt");

-- CreateIndex
CREATE INDEX "notificacao_contaId_lida_idx" ON "notificacao"("contaId", "lida");

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

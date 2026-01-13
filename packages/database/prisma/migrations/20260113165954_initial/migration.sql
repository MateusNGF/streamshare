-- CreateEnum
CREATE TYPE "PlanoConta" AS ENUM ('basico', 'pro', 'premium');

-- CreateEnum
CREATE TYPE "ProviderAuth" AS ENUM ('local', 'google');

-- CreateEnum
CREATE TYPE "NivelAcesso" AS ENUM ('owner', 'admin');

-- CreateEnum
CREATE TYPE "FrequenciaPagamento" AS ENUM ('mensal', 'trimestral', 'semestral', 'anual');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ativa', 'suspensa', 'cancelada');

-- CreateTable
CREATE TABLE "conta" (
    "id" SERIAL NOT NULL,
    "nome" TEXT,
    "email" TEXT,
    "plano" "PlanoConta" NOT NULL,
    "limiteGrupos" INTEGER NOT NULL DEFAULT 5,
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senhaHash" TEXT,
    "provider" "ProviderAuth" NOT NULL DEFAULT 'local',
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conta_usuario" (
    "id" SERIAL NOT NULL,
    "contaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nivelAcesso" "NivelAcesso" NOT NULL DEFAULT 'admin',
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "conta_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo" (
    "id" SERIAL NOT NULL,
    "contaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "linkConvite" TEXT NOT NULL,
    "permitirEscolhaStreamings" BOOLEAN NOT NULL DEFAULT true,
    "isPublico" BOOLEAN NOT NULL DEFAULT false,
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaming_catalogo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "iconeUrl" TEXT,
    "corPrimaria" TEXT NOT NULL DEFAULT '#000000',
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaming_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaming" (
    "id" SERIAL NOT NULL,
    "contaId" INTEGER NOT NULL,
    "streamingCatalogoId" INTEGER NOT NULL,
    "valorIntegral" DECIMAL(65,30) NOT NULL,
    "limiteParticipantes" INTEGER NOT NULL,
    "dataVencimento" TIMESTAMP(3),
    "credenciaisLogin" TEXT,
    "credenciaisSenha" TEXT,
    "frequenciasHabilitadas" TEXT NOT NULL DEFAULT 'mensal,trimestral,semestral,anual',
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo_streaming" (
    "id" SERIAL NOT NULL,
    "streamingId" INTEGER NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "isAtivo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "grupo_streaming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participante" (
    "id" SERIAL NOT NULL,
    "contaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "whatsappNumero" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinatura" (
    "id" SERIAL NOT NULL,
    "participanteId" INTEGER NOT NULL,
    "streamingId" INTEGER NOT NULL,
    "frequencia" "FrequenciaPagamento" NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ativa',
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "diasAtraso" INTEGER NOT NULL DEFAULT 0,
    "dataSuspensao" TIMESTAMP(3),
    "motivoSuspensao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conta_email_key" ON "conta"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "conta_usuario_contaId_usuarioId_key" ON "conta_usuario"("contaId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "grupo_linkConvite_key" ON "grupo"("linkConvite");

-- CreateIndex
CREATE UNIQUE INDEX "grupo_streaming_streamingId_grupoId_key" ON "grupo_streaming"("streamingId", "grupoId");

-- CreateIndex
CREATE UNIQUE INDEX "participante_whatsappNumero_key" ON "participante"("whatsappNumero");

-- CreateIndex
CREATE UNIQUE INDEX "participante_cpf_key" ON "participante"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "participante_userId_key" ON "participante"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "assinatura_participanteId_streamingId_key" ON "assinatura"("participanteId", "streamingId");

-- AddForeignKey
ALTER TABLE "conta_usuario" ADD CONSTRAINT "conta_usuario_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conta_usuario" ADD CONSTRAINT "conta_usuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo" ADD CONSTRAINT "grupo_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaming" ADD CONSTRAINT "streaming_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaming" ADD CONSTRAINT "streaming_streamingCatalogoId_fkey" FOREIGN KEY ("streamingCatalogoId") REFERENCES "streaming_catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_streaming" ADD CONSTRAINT "grupo_streaming_streamingId_fkey" FOREIGN KEY ("streamingId") REFERENCES "streaming"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_streaming" ADD CONSTRAINT "grupo_streaming_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participante" ADD CONSTRAINT "participante_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "conta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participante" ADD CONSTRAINT "participante_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinatura" ADD CONSTRAINT "assinatura_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "participante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinatura" ADD CONSTRAINT "assinatura_streamingId_fkey" FOREIGN KEY ("streamingId") REFERENCES "streaming"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

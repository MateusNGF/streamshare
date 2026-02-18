/*
  Warnings:

  - You are about to drop the column `credenciaisLogin` on the `streaming` table. All the data in the column will be lost.
  - You are about to drop the column `credenciaisSenha` on the `streaming` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "streaming" DROP COLUMN "credenciaisLogin",
DROP COLUMN "credenciaisSenha";

-- CreateTable
CREATE TABLE "streaming_credenciais" (
    "id" SERIAL NOT NULL,
    "streamingId" INTEGER NOT NULL,
    "login" TEXT,
    "senhaEncrypted" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaming_credenciais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "streaming_credenciais_streamingId_key" ON "streaming_credenciais"("streamingId");

-- AddForeignKey
ALTER TABLE "streaming_credenciais" ADD CONSTRAINT "streaming_credenciais_streamingId_fkey" FOREIGN KEY ("streamingId") REFERENCES "streaming"("id") ON DELETE CASCADE ON UPDATE CASCADE;

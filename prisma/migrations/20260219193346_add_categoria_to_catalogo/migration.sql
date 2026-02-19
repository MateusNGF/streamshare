-- AlterTable
ALTER TABLE "streaming_catalogo" ADD COLUMN     "categoria" TEXT NOT NULL DEFAULT 'Streaming',
ADD COLUMN     "isConteudoAdulto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "siteOficial" TEXT;

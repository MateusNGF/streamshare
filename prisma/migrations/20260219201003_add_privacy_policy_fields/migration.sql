-- AlterTable
ALTER TABLE "streaming_catalogo" ALTER COLUMN "categoria" SET DEFAULT 'video';

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "privacyAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "privacyVersion" TEXT;

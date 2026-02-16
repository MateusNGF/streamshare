-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "lastIp" TEXT,
ADD COLUMN     "lastUserAgent" TEXT,
ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 1;

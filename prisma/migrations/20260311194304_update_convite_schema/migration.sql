-- AlterTable
ALTER TABLE "convite" ADD COLUMN     "singleUse" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "email" DROP NOT NULL;

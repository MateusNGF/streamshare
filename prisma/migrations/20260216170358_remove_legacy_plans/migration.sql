/*
  Warnings:

  - The values [basico] on the enum `PlanoConta` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlanoConta_new" AS ENUM ('free', 'pro', 'business');
ALTER TABLE "conta" ALTER COLUMN "plano" TYPE "PlanoConta_new" USING ("plano"::text::"PlanoConta_new");
ALTER TYPE "PlanoConta" RENAME TO "PlanoConta_old";
ALTER TYPE "PlanoConta_new" RENAME TO "PlanoConta";
DROP TYPE "PlanoConta_old";
COMMIT;
